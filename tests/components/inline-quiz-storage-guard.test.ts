/**
 * Regression test for the unguarded localStorage write in
 * components/course/InlineQuiz.tsx.
 *
 * Bug: `saveState`/`clearState` called `localStorage.setItem`/`removeItem`
 * with no try/catch, while `loadState` right next to them was already
 * guarded (the same class of bug fixed for TestPanel.tsx's
 * getLockout/setLockout in commit de9d904). `saveState` runs inside the
 * `pick()` click handler right after `setAnswers(next)` — if `setItem`
 * throws (private-mode Safari, sandboxed iframe, storage quota), the throw
 * aborts the handler before `setRemainingMs`/`setExpanded` run, so the
 * user's answer is recorded in React state but the reveal/cooldown UI
 * never updates and the error propagates uncaught from the click handler.
 *
 * The module guards on `typeof window` and uses localStorage — same setup
 * as tests/components/sync-queue.test.ts.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

vi.stubGlobal('window', {});

const throwing = {
  setItem: vi.fn(() => { throw new Error('storage blocked'); }),
  removeItem: vi.fn(() => { throw new Error('storage blocked'); }),
  getItem: vi.fn(() => { throw new Error('storage blocked'); }),
};
vi.stubGlobal('localStorage', throwing);

import { saveState, clearState, loadState, storageKey } from '@/components/course/InlineQuiz';

const COURSE_ID = '100.1';

describe('InlineQuiz storage guard', () => {
  beforeEach(() => {
    throwing.setItem.mockClear();
    throwing.removeItem.mockClear();
    throwing.getItem.mockClear();
  });
  afterAll(() => vi.unstubAllGlobals());

  it('saveState does not throw when localStorage.setItem throws', () => {
    expect(() => saveState(COURSE_ID, { lastAt: Date.now(), answers: { 1: 'A' } })).not.toThrow();
    expect(throwing.setItem).toHaveBeenCalledWith(storageKey(COURSE_ID), expect.any(String));
  });

  it('clearState does not throw when localStorage.removeItem throws', () => {
    expect(() => clearState(COURSE_ID)).not.toThrow();
    expect(throwing.removeItem).toHaveBeenCalledWith(storageKey(COURSE_ID));
  });

  it('loadState falls back to empty state when storage is blocked', () => {
    expect(loadState(COURSE_ID)).toEqual({ lastAt: 0, answers: {} });
  });
});
