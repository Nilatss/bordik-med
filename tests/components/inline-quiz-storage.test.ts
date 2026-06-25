/**
 * Regression tests for lib/course/inline-quiz-storage.ts
 *
 * Bug fixed: saveInlineQuizState / clearInlineQuizState called localStorage
 * without try/catch. In Firefox strict-privacy mode and in any browser
 * where storage is disabled by policy, accessing localStorage throws a
 * SecurityError. On a full-storage device, setItem throws QuotaExceededError.
 * Both errors propagated unhandled out of the React event handler and crashed
 * the quiz component.
 *
 * Fix: wrap every localStorage write / delete in try/catch so they degrade
 * gracefully (answer is shown in UI but not persisted).
 */

import { describe, it, expect } from 'vitest';
import {
  loadInlineQuizState,
  saveInlineQuizState,
  clearInlineQuizState,
  storageKey,
  INLINE_QUIZ_COOLDOWN_MS,
} from '@/lib/course/inline-quiz-storage';

// Minimal in-memory localStorage shim for Node test env
function makeStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => Object.keys(store).forEach(k => delete store[k]),
  };
}

// Throwing localStorage shim — simulates SecurityError / QuotaExceededError
function makeThrowingStorage(throwOn: 'setItem' | 'removeItem') {
  const base = makeStorage();
  return {
    ...base,
    [throwOn]: () => { throw new DOMException('Storage disabled', 'SecurityError'); },
  };
}

describe('inline-quiz-storage', () => {
  describe('saveInlineQuizState', () => {
    it('persists answers when storage works', () => {
      const ls = makeStorage();
      Object.defineProperty(globalThis, 'window', { value: { localStorage: ls }, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

      const state = { lastAt: 1_000_000, answers: { 1: 'A', 2: 'B' } };
      expect(() => saveInlineQuizState('course-1', state)).not.toThrow();
      expect(ls.getItem(storageKey('course-1'))).toBe(JSON.stringify(state));

      // cleanup
      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    });

    it('does NOT throw when localStorage.setItem throws QuotaExceededError', () => {
      const ls = makeThrowingStorage('setItem');
      Object.defineProperty(globalThis, 'window', { value: { localStorage: ls }, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

      expect(() => saveInlineQuizState('course-1', { lastAt: Date.now(), answers: { 1: 'A' } }))
        .not.toThrow();

      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    });
  });

  describe('clearInlineQuizState', () => {
    it('removes the key when storage works', () => {
      const ls = makeStorage();
      ls.setItem(storageKey('course-1'), '{"lastAt":1,"answers":{}}');
      Object.defineProperty(globalThis, 'window', { value: { localStorage: ls }, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

      expect(() => clearInlineQuizState('course-1')).not.toThrow();
      expect(ls.getItem(storageKey('course-1'))).toBeNull();

      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    });

    it('does NOT throw when localStorage.removeItem throws SecurityError', () => {
      const ls = makeThrowingStorage('removeItem');
      Object.defineProperty(globalThis, 'window', { value: { localStorage: ls }, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

      expect(() => clearInlineQuizState('course-1')).not.toThrow();

      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    });
  });

  describe('loadInlineQuizState', () => {
    it('returns empty state on JSON parse error', () => {
      const ls = makeStorage();
      ls.setItem(storageKey('course-1'), 'not-json');
      Object.defineProperty(globalThis, 'window', { value: { localStorage: ls }, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

      const result = loadInlineQuizState('course-1');
      expect(result).toEqual({ lastAt: 0, answers: {} });

      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    });

    it('returns empty state when cooldown has expired', () => {
      const ls = makeStorage();
      const expired = { lastAt: Date.now() - INLINE_QUIZ_COOLDOWN_MS - 1, answers: { 1: 'A' } };
      ls.setItem(storageKey('course-1'), JSON.stringify(expired));
      Object.defineProperty(globalThis, 'window', { value: { localStorage: ls }, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

      const result = loadInlineQuizState('course-1');
      expect(result).toEqual({ lastAt: 0, answers: {} });

      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    });

    it('returns saved answers within cooldown window', () => {
      const ls = makeStorage();
      const recent = { lastAt: Date.now() - 1000, answers: { 1: 'B' } };
      ls.setItem(storageKey('course-1'), JSON.stringify(recent));
      Object.defineProperty(globalThis, 'window', { value: { localStorage: ls }, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

      const result = loadInlineQuizState('course-1');
      expect(result.answers).toEqual({ 1: 'B' });

      Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    });
  });
});
