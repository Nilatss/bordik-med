/**
 * Regression test for the InlineQuiz localStorage crash.
 *
 * Context: `saveState`/`clearState` in components/course/InlineQuiz.tsx
 * called `localStorage.setItem`/`removeItem` with no try/catch, unlike
 * every sibling storage helper in the codebase (TestPanel.tsx, NotesPage.tsx,
 * QuizRunner.tsx, sync-queue.ts). `saveState` runs synchronously inside the
 * `pick()` click handler, so a QuotaExceededError/SecurityError (Safari
 * private browsing, full storage quota) threw uncaught, crashing the whole
 * self-check flow instead of just failing to persist the answer.
 */
import { describe, it, expect, afterAll, vi } from 'vitest';

vi.stubGlobal('window', {});
const throwingStorage = {
  getItem: () => { throw new DOMException('quota exceeded', 'QuotaExceededError'); },
  setItem: () => { throw new DOMException('quota exceeded', 'QuotaExceededError'); },
  removeItem: () => { throw new DOMException('quota exceeded', 'QuotaExceededError'); },
};
vi.stubGlobal('localStorage', throwingStorage);

import { saveState, storageKey } from '@/components/course/InlineQuiz';

describe('InlineQuiz storage helpers under a throwing localStorage', () => {
  afterAll(() => vi.unstubAllGlobals());

  it('storageKey is stable and namespaced per course', () => {
    expect(storageKey('neonatology-101')).toBe('bordik:selfcheck:neonatology-101');
  });

  it('saveState does not throw when localStorage.setItem throws (private mode / quota)', () => {
    expect(() =>
      saveState('neonatology-101', { lastAt: Date.now(), answers: { 1: 'A' } })
    ).not.toThrow();
  });
});
