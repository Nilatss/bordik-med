/**
 * Regression test for the diagnostic test's error-retry routing.
 *
 * Bug: the "Попробовать снова" button on the error screen always called
 * fetchNext(history), even when the failure came from finalize() after
 * the last (30th) question. The server rejects action:'next' once the
 * history is already complete, so the user was stuck on the error screen
 * forever — unable to retry and unable to recover the finished test.
 */
import { describe, it, expect } from 'vitest';
import { retryAction } from '@/lib/diagnostic/utils';

describe('retryAction', () => {
  it('replays "next" when a mid-test question fetch failed', () => {
    expect(retryAction('next', 12, 30)).toBe('next');
  });

  it('replays "finalize" when finalize() failed after the last question', () => {
    expect(retryAction('finalize', 30, 30)).toBe('finalize');
  });

  it('never retries with "next" once the history is already complete — even if the caller mislabels the failure', () => {
    // Defense-in-depth: history.length >= total must force 'finalize'
    // regardless of lastFailedAction, since the server always rejects
    // 'next' at that point.
    expect(retryAction('next', 30, 30)).toBe('finalize');
  });

  it('handles a history longer than total defensively (still forces finalize)', () => {
    expect(retryAction('next', 31, 30)).toBe('finalize');
  });
});
