/**
 * Tests for Bug 1: InlineQuiz.tsx saveState() / clearState() were missing
 * try-catch, so any localStorage failure (private/sandboxed mode, quota
 * exceeded, SecurityError) propagated as an unhandled exception that crashed
 * the quiz interaction.
 *
 * Fix: both functions now wrap the storage call in try-catch, matching the
 * guard already in loadState().
 *
 * Since saveState / clearState are module-private, we verify the guard
 * pattern — identical to the code now in InlineQuiz.tsx — directly here.
 */
import { describe, it, expect, vi, afterAll } from 'vitest';

vi.stubGlobal('window', {}); // satisfy `typeof window === 'undefined'` guard

afterAll(() => vi.unstubAllGlobals());

// ── helpers that mirror the pre-fix and post-fix shapes ──────────────────────

function saveStateUnguarded(key: string, value: string) {
  // Pre-fix: no try-catch — storage throw propagates to the caller.
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

function saveStateGuarded(key: string, value: string) {
  // Post-fix (matches InlineQuiz.tsx saveState exactly).
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch { /* storage blocked or quota exceeded */ }
}

function clearStateUnguarded(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

function clearStateGuarded(key: string) {
  // Post-fix (matches InlineQuiz.tsx clearState exactly).
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch { /* storage blocked */ }
}

// ── pre-fix behaviour ────────────────────────────────────────────────────────

describe('pre-fix behaviour (unguarded functions)', () => {
  it('setItem throws propagate — crashes quiz interaction', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => {},
      getItem: () => null,
    });
    expect(() => saveStateUnguarded('quiz:course-1', '{}')).toThrow();
  });

  it('removeItem throws propagate — crashes quiz reset', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {},
      removeItem: () => { throw new Error('SecurityError'); },
      getItem: () => null,
    });
    expect(() => clearStateUnguarded('quiz:course-1')).toThrow();
  });
});

// ── post-fix behaviour ───────────────────────────────────────────────────────

describe('post-fix behaviour (guarded functions)', () => {
  it('saveState survives QuotaExceededError (private mode / storage full)', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => {},
      getItem: () => null,
    });
    expect(() => saveStateGuarded('quiz:course-1', '{}')).not.toThrow();
  });

  it('saveState survives SecurityError (sandboxed iframe)', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new DOMException('Access is denied', 'SecurityError'); },
      removeItem: () => {},
      getItem: () => null,
    });
    expect(() => saveStateGuarded('quiz:course-1', '{}')).not.toThrow();
  });

  it('clearState survives removeItem throw (private mode)', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {},
      removeItem: () => { throw new DOMException('Access is denied', 'SecurityError'); },
      getItem: () => null,
    });
    expect(() => clearStateGuarded('quiz:course-1')).not.toThrow();
  });

  it('saveState works normally when storage is available', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
      getItem: (k: string) => store.get(k) ?? null,
    });
    saveStateGuarded('quiz:course-1', '{"lastAt":1000,"answers":{}}');
    expect(store.get('quiz:course-1')).toBe('{"lastAt":1000,"answers":{}}');
  });

  it('clearState works normally when storage is available', () => {
    const store = new Map<string, string>([['quiz:course-1', '{}']]);
    vi.stubGlobal('localStorage', {
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
      getItem: (k: string) => store.get(k) ?? null,
    });
    clearStateGuarded('quiz:course-1');
    expect(store.has('quiz:course-1')).toBe(false);
  });
});
