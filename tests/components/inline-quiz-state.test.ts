/**
 * Tests for the localStorage helpers exported from InlineQuiz.tsx.
 *
 * Bug #1 (saveQuizState): localStorage.setItem previously had no try-catch.
 * A QuotaExceededError (storage full) thrown inside saveState propagated
 * uncaught from the pick() event handler, crashing the self-check quiz.
 *
 * Bug #3 (clearQuizState): localStorage.removeItem also had no try-catch.
 * In Safari private-browsing the storage API throws on every call; a throw
 * from clearState prevented the setAnswers/setExpanded/setRemainingMs state
 * updates from running, leaving the UI in an inconsistent post-reset state.
 *
 * Both functions are exported from InlineQuiz.tsx purely for unit testing
 * (following the migratePersistedState pattern in lib/store.ts).
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// Stub window + localStorage BEFORE the module is imported so the
// typeof-window guard inside the helpers sees a browser-like environment.
const store = new Map<string, string>();

function makeLocalStorage() {
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
  };
}

vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', makeLocalStorage());

import { saveQuizState, clearQuizState } from '@/components/course/InlineQuiz';

afterAll(() => vi.unstubAllGlobals());

describe('saveQuizState', () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', makeLocalStorage());
  });

  it('writes the state to localStorage', () => {
    const state = { lastAt: 1000, answers: { 1: 'A' } };
    saveQuizState('course-x', state);
    const raw = store.get('bordik:selfcheck:course-x');
    expect(raw).toBeDefined();
    expect(JSON.parse(raw!)).toEqual(state);
  });

  it('does NOT throw when localStorage.setItem throws QuotaExceededError (Bug #1)', () => {
    // Simulate a full-storage environment where setItem always throws.
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => { throw new DOMException('QuotaExceededError', 'QuotaExceededError'); },
      removeItem: () => {},
    });
    // The bug: without try-catch this propagates to the pick() event handler.
    expect(() =>
      saveQuizState('course-x', { lastAt: Date.now(), answers: { 1: 'B' } }),
    ).not.toThrow();
  });
});

describe('clearQuizState', () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', makeLocalStorage());
  });

  it('removes the state from localStorage', () => {
    store.set('bordik:selfcheck:course-y', '{"lastAt":1,"answers":{}}');
    clearQuizState('course-y');
    expect(store.has('bordik:selfcheck:course-y')).toBe(false);
  });

  it('does NOT throw when localStorage.removeItem throws (Bug #3)', () => {
    // Simulate Safari private-browsing where all storage APIs throw.
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => { throw new DOMException('NotAllowedError', 'SecurityError'); },
    });
    // The bug: without try-catch this propagates from resetNow(), preventing
    // the subsequent setAnswers/setExpanded/setRemainingMs calls from running.
    expect(() => clearQuizState('course-y')).not.toThrow();
  });
});
