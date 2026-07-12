/**
 * Tests for lib/diagnostic/utils.ts helpers backing two DiagnosticTest bugs:
 *
 * 1. canRetryNext — "Попробовать снова" after a finalize failure used to
 *    always replay `action: 'next'`, which the server rejects once
 *    history.length >= TOTAL_QUESTIONS (app/api/diagnostic/route.ts),
 *    stranding a user who just finished all 30 questions in a retry loop
 *    they could never escape.
 *
 * 2. resolveDiagnosticScore — returning to a saved diagnostic result
 *    (history starts empty, seeded only from the cache) rendered
 *    "0/0 верных ответов" instead of the real cached score.
 */
import { describe, it, expect } from 'vitest';
import { canRetryNext, resolveDiagnosticScore } from '@/lib/diagnostic/utils';

describe('canRetryNext', () => {
  it('allows retrying `next` mid-test', () => {
    expect(canRetryNext(6, 30)).toBe(true);
  });

  it('forbids retrying `next` once history has reached the total (must finalize instead)', () => {
    expect(canRetryNext(30, 30)).toBe(false);
  });

  it('forbids retrying `next` if history somehow exceeds the total', () => {
    expect(canRetryNext(31, 30)).toBe(false);
  });
});

describe('resolveDiagnosticScore', () => {
  it('uses the live history while a test is in progress', () => {
    expect(resolveDiagnosticScore(10, 7, null)).toEqual({ correct: 7, total: 10 });
  });

  it('prefers live history over a stale cached result once answers exist', () => {
    expect(resolveDiagnosticScore(5, 3, { correct: 24, total: 30 })).toEqual({
      correct: 3,
      total: 5,
    });
  });

  it('falls back to the cached score when returning to a saved result (history empty)', () => {
    expect(resolveDiagnosticScore(0, 0, { correct: 24, total: 30 })).toEqual({
      correct: 24,
      total: 30,
    });
  });

  it('returns 0/0 when there is neither history nor a cached result', () => {
    expect(resolveDiagnosticScore(0, 0, null)).toEqual({ correct: 0, total: 0 });
  });
});
