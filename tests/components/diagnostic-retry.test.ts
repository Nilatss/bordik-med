/**
 * Regression test for `shouldRetryFinalize` (lib/diagnostic/utils.ts).
 *
 * Bug: DiagnosticTest's error-panel retry button was hard-wired to
 * `fetchNext(history)` regardless of which call actually failed. When
 * `finalize` failed after the user answered all 30 questions, retry sent
 * the full (already-complete) history to `/api/diagnostic` action:'next',
 * which the route rejects with `test-complete` — permanently stranding the
 * user with a finished test they could never submit. This locks in the
 * fix: retry must re-run `finalize` once `history.length >= total`.
 */
import { describe, it, expect } from 'vitest';
import { shouldRetryFinalize } from '@/lib/diagnostic/utils';

describe('shouldRetryFinalize', () => {
  it('retries fetchNext while the test is still in progress', () => {
    expect(shouldRetryFinalize(0, 30)).toBe(false);
    expect(shouldRetryFinalize(15, 30)).toBe(false);
    expect(shouldRetryFinalize(29, 30)).toBe(false);
  });

  it('retries finalize once all questions have been answered (the regression case)', () => {
    expect(shouldRetryFinalize(30, 30)).toBe(true);
  });

  it('retries finalize if history is somehow longer than total', () => {
    expect(shouldRetryFinalize(31, 30)).toBe(true);
  });
});
