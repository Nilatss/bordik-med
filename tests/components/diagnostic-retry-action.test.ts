/**
 * Regression test for the diagnostic-test retry deadlock.
 *
 * Bug: DiagnosticTest.tsx's error-phase "Попробовать снова" button always
 * re-issued the `next` API call, regardless of which call actually failed.
 * If `finalize` (summarising all 30 answered questions) fails twice in a
 * row, `phase` becomes 'error' with `history.length === 30`. Retrying via
 * `next` hits the server's own guard —
 * `if (history.length >= TOTAL_QUESTIONS) return apiError('test-complete', 400)`
 * (app/api/diagnostic/route.ts) — which maps to a generic retryable error
 * message (lib/diagnostic/utils.ts friendlyError, no 'test-complete' case),
 * so the retry button looks actionable but can never succeed: the user's
 * completed 30-answer attempt is stranded.
 *
 * Fix: `resolveRetryAction` decides which call to retry based on whether
 * the history is already full; DiagnosticTest.tsx's retry handler now
 * routes to `finalize` instead of `next` once all questions are answered.
 */
import { describe, it, expect } from 'vitest';
import { resolveRetryAction } from '@/lib/diagnostic/utils';

describe('resolveRetryAction', () => {
  it('retries `next` while the history is still incomplete', () => {
    expect(resolveRetryAction(0, 30)).toBe('next');
    expect(resolveRetryAction(15, 30)).toBe('next');
    expect(resolveRetryAction(29, 30)).toBe('next');
  });

  it('retries `finalize` once every question has been answered (the deadlock case)', () => {
    expect(resolveRetryAction(30, 30)).toBe('finalize');
  });

  it('retries `finalize` if history somehow exceeds total (defensive)', () => {
    expect(resolveRetryAction(31, 30)).toBe('finalize');
  });
});
