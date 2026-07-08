/**
 * Regression test for `pickRetryAction` (lib/diagnostic/utils.ts).
 *
 * Bug: the "Попробовать снова" button in DiagnosticTest.tsx always
 * re-issued `action:'next'`, even when the call that had just failed was
 * `finalize()` (after all 30 questions were answered). Retrying with
 * `action:'next'` hits the server's `history.length >= TOTAL_QUESTIONS`
 * guard, which replies `test-complete` — an error the UI had no way to
 * clear, trapping the user in an unbreakable retry loop after finishing
 * the test (data loss: the only escapes discarded the completed attempt).
 */
import { describe, it, expect } from 'vitest';
import { pickRetryAction } from '@/lib/diagnostic/utils';

describe('pickRetryAction', () => {
  it('retries finalize when all questions are answered and total is known', () => {
    expect(pickRetryAction(30, 30)).toBe('finalize');
  });

  it('retries next while mid-test (fewer answers than total)', () => {
    expect(pickRetryAction(15, 30)).toBe('next');
  });

  it('retries next for the very first question (no history yet)', () => {
    expect(pickRetryAction(0, null)).toBe('next');
  });

  it('falls back to the default total (30) when current is not yet set', () => {
    expect(pickRetryAction(30, undefined)).toBe('finalize');
    expect(pickRetryAction(29, undefined)).toBe('next');
  });

  it('does not misfire on the degenerate 0/0 edge case', () => {
    expect(pickRetryAction(0, 0)).toBe('next');
  });
});
