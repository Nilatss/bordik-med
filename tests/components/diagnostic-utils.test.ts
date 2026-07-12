/**
 * Test for lib/diagnostic/utils.ts's canRetryNext, backing a DiagnosticTest
 * bug: "Попробовать снова" after a finalize failure used to always replay
 * `action: 'next'`, which the server rejects once
 * history.length >= TOTAL_QUESTIONS (app/api/diagnostic/route.ts),
 * stranding a user who just finished all 30 questions in a retry loop
 * they could never escape.
 */
import { describe, it, expect } from 'vitest';
import { canRetryNext } from '@/lib/diagnostic/utils';

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
