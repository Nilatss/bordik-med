/**
 * Unit tests for InlineQuiz's localStorage persistence (components/course/InlineQuiz.tsx).
 *
 * Bug: saveState() called localStorage.setItem with no try/catch. In
 * Safari private browsing (setItem throws synchronously) or with a full
 * storage quota, the throw propagated out of pick() — the option-click
 * handler — after setAnswers(next) had already run, so the cooldown timer
 * and the "briefly expand to show feedback" auto-collapse logic below it
 * never executed. The self-check quiz was left in an inconsistent state
 * for the rest of the session.
 *
 * Fix: wrap the localStorage write in try/catch, same as the existing
 * loadState() guard in the same file.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const store = new Map<string, string>();
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: () => {
    throw new DOMException('QuotaExceededError');
  },
  removeItem: () => {
    throw new DOMException('QuotaExceededError');
  },
});

import { saveState, clearState } from '@/components/course/InlineQuiz';

describe('saveState / clearState with a throwing localStorage', () => {
  beforeEach(() => store.clear());
  afterAll(() => vi.unstubAllGlobals());

  it('saveState does not throw when localStorage.setItem throws', () => {
    expect(() => saveState('course-1', { lastAt: Date.now(), answers: { 1: 'A' } })).not.toThrow();
  });

  it('clearState does not throw when localStorage.removeItem throws', () => {
    expect(() => clearState('course-1')).not.toThrow();
  });
});
