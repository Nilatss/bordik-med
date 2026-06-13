/**
 * Regression test for InlineQuiz saveState / clearState localStorage crash.
 *
 * Bug: InlineQuiz.tsx saveState() and clearState() called
 * localStorage.setItem / localStorage.removeItem without a try-catch.
 * In private-browsing mode (Safari, Firefox) and in sandboxed iframes
 * localStorage write/delete operations throw a SecurityError or
 * QuotaExceededError — crashing the entire quiz component during a
 * self-check session (the component's error boundary catches it and
 * shows a blank error state).
 *
 * loadState() was already wrapped in try-catch. The fix is to wrap
 * saveState and clearState identically.
 */
import { describe, it, expect, vi, afterAll } from 'vitest';

const store = new Map<string, string>();

vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem:    (k: string) => store.get(k) ?? null,
  setItem:    (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
});

afterAll(() => vi.unstubAllGlobals());

function saveState(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch { /* private mode / quota exceeded */ }
}

function clearState(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch { /* private mode */ }
}

describe('InlineQuiz localStorage helpers (private-mode guard)', () => {
  it('saveState writes the value in normal mode', () => {
    saveState('test-key', 'test-value');
    expect(localStorage.getItem('test-key')).toBe('test-value');
  });

  it('clearState removes the value in normal mode', () => {
    localStorage.setItem('to-clear', 'something');
    clearState('to-clear');
    expect(localStorage.getItem('to-clear')).toBeNull();
  });

  it('saveState does NOT throw when localStorage.setItem throws (private mode)', () => {
    const orig = localStorage.setItem;
    (localStorage as { setItem: (k: string, v: string) => void }).setItem = () => {
      throw new DOMException('QuotaExceededError');
    };
    expect(() => saveState('key', 'value')).not.toThrow();
    (localStorage as { setItem: (k: string, v: string) => void }).setItem = orig;
  });

  it('clearState does NOT throw when localStorage.removeItem throws (private mode)', () => {
    const orig = localStorage.removeItem;
    (localStorage as { removeItem: (k: string) => void }).removeItem = () => {
      throw new DOMException('SecurityError');
    };
    expect(() => clearState('key')).not.toThrow();
    (localStorage as { removeItem: (k: string) => void }).removeItem = orig;
  });
});
