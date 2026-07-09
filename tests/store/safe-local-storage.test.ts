/**
 * Regression test for the unguarded persist-storage write in lib/store.ts.
 *
 * Zustand's `persist` middleware calls `storage.setItem()` synchronously
 * inside `api.setState`/`set()` with no try/catch of its own — see
 * node_modules/zustand/esm/middleware.mjs, the default
 * `storage: createJSONStorage(() => window.localStorage)` has no error
 * handling either. A `QuotaExceededError` (storage full), Safari
 * private-mode, or a sandboxed iframe throws synchronously out of
 * whatever `set()` call the app made — e.g. TestPanel.handleComplete's
 * `submitTest()` — stranding the caller mid-flow (the fullscreen
 * proctored-test overlay never closes because the code after `set()`
 * never runs). This is the same failure mode already fixed for
 * TestPanel's own ad-hoc localStorage calls in audit2 #139
 * ("storage crash"); `safeLocalStorage` closes the same gap in the
 * store's own persist layer.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { safeLocalStorage } from '@/lib/store';

describe('safeLocalStorage', () => {
  const realWindow = globalThis.window;

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.window = realWindow;
  });

  it('swallows a throwing setItem (QuotaExceededError) instead of propagating', () => {
    const throwingLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      }),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('window', { localStorage: throwingLocalStorage });

    const storage = safeLocalStorage();
    expect(() => storage.setItem('bordik-progress', '{"state":{}}')).not.toThrow();
    expect(throwingLocalStorage.setItem).toHaveBeenCalledWith('bordik-progress', '{"state":{}}');
  });

  it('returns null from getItem when the underlying storage throws (private mode)', () => {
    const throwingLocalStorage = {
      getItem: vi.fn(() => {
        throw new DOMException('Access denied.', 'SecurityError');
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('window', { localStorage: throwingLocalStorage });

    const storage = safeLocalStorage();
    expect(() => storage.getItem('bordik-progress')).not.toThrow();
    expect(storage.getItem('bordik-progress')).toBeNull();
  });

  it('swallows a throwing removeItem', () => {
    const throwingLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(() => {
        throw new DOMException('Access denied.', 'SecurityError');
      }),
    };
    vi.stubGlobal('window', { localStorage: throwingLocalStorage });

    const storage = safeLocalStorage();
    expect(() => storage.removeItem('bordik-progress')).not.toThrow();
  });

  it('passes through to real localStorage semantics on the happy path', () => {
    const store = new Map<string, string>();
    const workingLocalStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    };
    vi.stubGlobal('window', { localStorage: workingLocalStorage });

    const storage = safeLocalStorage();
    storage.setItem('k', 'v');
    expect(storage.getItem('k')).toBe('v');
    storage.removeItem('k');
    expect(storage.getItem('k')).toBeNull();
  });
});
