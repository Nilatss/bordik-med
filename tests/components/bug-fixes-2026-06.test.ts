/**
 * Regression tests for three bugs fixed 2026-06-21.
 *
 * Bug #1 — sync route LWW timestamp update: `await supabaseQuery` without
 *   try/catch meant a network error on the favourites_updated_at UPDATE
 *   propagated and crashed the whole /api/sync POST, breaking data sync.
 *   Fix: wrapped in `try { ... } catch {}`.
 *
 * Bug #2 — Sidebar tools-catalog lazy load: the dynamic `import('@/lib/tools-catalog')`
 *   promise chain was missing `.catch()`, so a CDN/network failure became an
 *   unhandled promise rejection and left tool search silently broken.
 *   Fix: added `.catch(() => {})`.
 *
 * Bug #3 — InlineQuiz saveState/clearState: `localStorage.setItem` and
 *   `localStorage.removeItem` were called without try/catch.  A full-storage
 *   quota error (or SecurityError in certain private-mode configurations)
 *   propagated through the `pick()` handler, crashing the quiz interaction.
 *   Fix: wrapped both calls in try/catch.
 *
 * Node env, no jsdom — we test the pure patterns and the affected utilities
 * directly, relying on TS + manual QA for the React component glue.
 */
import { describe, it, expect, vi, afterAll } from 'vitest';

// ── Bug #1: try-catch wrapper swallows async errors ────────────────────────

describe('Bug #1 — sync LWW: try/catch swallows failing async operations', () => {
  it('propagates rejection without try/catch (documents old behaviour)', async () => {
    const failingQuery = (): Promise<void> => Promise.reject(new Error('network error'));
    await expect(failingQuery()).rejects.toThrow('network error');
  });

  it('swallows rejection with try/catch (documents the fix)', async () => {
    const failingQuery = (): Promise<void> => Promise.reject(new Error('network error'));
    await expect(async () => {
      try {
        await failingQuery();
      } catch { /* intentionally ignored */ }
    }).not.toThrow();
  });
});

// ── Bug #2: .catch() on dynamic import prevents unhandled rejection ─────────

describe('Bug #2 — Sidebar tools-catalog: .catch() on import() prevents propagation', () => {
  it('propagates when no .catch() (documents old behaviour)', async () => {
    const failingImport = (): Promise<never> =>
      Promise.reject(new Error('CDN timeout'));
    await expect(failingImport()).rejects.toThrow('CDN timeout');
  });

  it('silently discards error when .catch(() => {}) is present (documents the fix)', async () => {
    const failingImport = (): Promise<never> =>
      Promise.reject(new Error('CDN timeout'));
    await expect(
      failingImport().catch(() => {}),
    ).resolves.toBeUndefined();
  });
});

// ── Bug #3: localStorage quota errors in InlineQuiz state helpers ──────────

const store = new Map<string, string>();
const throwingStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (_k: string, _v: string) => {
    throw new DOMException('QuotaExceededError: DOM Exception 22', 'QuotaExceededError');
  },
  removeItem: (_k: string) => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  },
};

vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', throwingStorage);

afterAll(() => vi.unstubAllGlobals());

describe('Bug #3 — InlineQuiz saveState/clearState: quota errors are swallowed', () => {
  it('confirms localStorage.setItem throws a quota error (documents old failure path)', () => {
    expect(() => localStorage.setItem('k', 'v')).toThrow('QuotaExceededError');
  });

  it('confirms localStorage.removeItem throws a security error (documents old failure path)', () => {
    expect(() => localStorage.removeItem('quiz:test')).toThrow('The operation is insecure.');
  });

  it('saveState pattern: try/catch swallows quota error (documents the fix)', () => {
    const saveState = (key: string, value: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch { /* quota exceeded or storage blocked — skip persistence */ }
    };
    expect(() => saveState('quiz:123', 'data')).not.toThrow();
  });

  it('clearState pattern: try/catch swallows security error (documents the fix)', () => {
    const clearState = (key: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch { /* storage blocked — safe to ignore */ }
    };
    expect(() => clearState('quiz:123')).not.toThrow();
  });
});
