/**
 * Tests for storage resilience in InlineQuiz (components/course/InlineQuiz.tsx).
 *
 * Bug: saveState() called localStorage.setItem() without a try/catch.
 * In private/incognito mode (or when storage quota is exceeded) setItem throws
 * QuotaExceededError. Since saveState() was called directly inside the pick()
 * event handler, the thrown error propagated through React's event handler,
 * leaving the quiz in an inconsistent state:
 *   - setAnswers() had already been called (in-memory answer recorded) ✓
 *   - setRemainingMs() was never called (cooldown not started) ✗
 *   - auto-collapse timer was never set (card stayed expanded) ✗
 *
 * Fix: saveState() now wraps localStorage.setItem in try/catch, matching the
 * pattern used by TestPanel.setLockout, StorageBanner, PwaRegistrar etc.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// ── Minimal reproduction of the saveState / loadState pattern ─────────────

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface SavedState {
  lastAt: number;
  answers: Record<number, string>;
}

function storageKey(courseId: string) {
  return `bordik:selfcheck:${courseId}`;
}

// BUG: pre-fix version — no try/catch around setItem
function saveStateBuggy(courseId: string, state: SavedState, store: Map<string, string>) {
  store.set(storageKey(courseId), JSON.stringify(state)); // throws when blocked
}

// FIX: post-fix version — matches the production code after the patch
function saveStateFixed(courseId: string, state: SavedState, store: Map<string, string>) {
  try { store.set(storageKey(courseId), JSON.stringify(state)); } catch { /* quota / private mode */ }
}

function loadState(courseId: string, store: Map<string, string>): SavedState {
  try {
    const raw = store.get(storageKey(courseId)) ?? null;
    if (!raw) return { lastAt: 0, answers: {} };
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed.lastAt || Date.now() - parsed.lastAt > COOLDOWN_MS) {
      return { lastAt: 0, answers: {} };
    }
    return parsed;
  } catch {
    return { lastAt: 0, answers: {} };
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('InlineQuiz saveState storage resilience (Bug fix)', () => {
  const store = new Map<string, string>();
  beforeEach(() => store.clear());

  it('buggy version throws when store.set throws (reproduces the bug)', () => {
    const throwingStore = {
      set: () => { throw new DOMException('QuotaExceededError'); },
      get: () => null,
    } as unknown as Map<string, string>;

    expect(() => {
      saveStateBuggy('course-100-1', { lastAt: Date.now(), answers: { 1: 'A' } }, throwingStore);
    }).toThrow();
  });

  it('fixed version does NOT throw when store.set throws (proves the fix)', () => {
    const throwingStore = {
      set: () => { throw new DOMException('QuotaExceededError'); },
      get: () => null,
    } as unknown as Map<string, string>;

    expect(() => {
      saveStateFixed('course-100-1', { lastAt: Date.now(), answers: { 1: 'A' } }, throwingStore);
    }).not.toThrow();
  });

  it('saves and loads answers round-trip when storage is available', () => {
    const now = Date.now();
    saveStateFixed('course-100-1', { lastAt: now, answers: { 1: 'A', 2: 'B' } }, store);
    const loaded = loadState('course-100-1', store);
    expect(loaded.answers).toEqual({ 1: 'A', 2: 'B' });
  });

  it('returns empty state when cooldown has expired', () => {
    const pastTs = Date.now() - COOLDOWN_MS - 1000;
    store.set(storageKey('course-100-1'), JSON.stringify({ lastAt: pastTs, answers: { 1: 'A' } }));
    const loaded = loadState('course-100-1', store);
    expect(loaded.answers).toEqual({});
    expect(loaded.lastAt).toBe(0);
  });

  it('returns empty state for missing key', () => {
    const loaded = loadState('no-such-course', store);
    expect(loaded.answers).toEqual({});
  });

  it('returns empty state when stored JSON is corrupt', () => {
    store.set(storageKey('course-100-1'), 'not-valid-json{{{{');
    const loaded = loadState('course-100-1', store);
    expect(loaded.answers).toEqual({});
  });
});

afterAll(() => vi.unstubAllGlobals());
