/**
 * Bug: `app/api/sync/route.ts` POST returned `200 ok` even when a Supabase
 * upsert failed, because Supabase query builders resolve with `{ error }`
 * instead of rejecting — `Promise.allSettled` reported them as fulfilled,
 * and the route only checked for `status === 'rejected'`. Profile/course
 * progress/study-time writes could silently fail while the client marked
 * local state as synced.
 *
 * This tests the REAL predicate (`collectSyncFailures`) the route uses.
 */
import { describe, it, expect } from 'vitest';
import { collectSyncFailures } from '@/lib/sync-task-results';

const ok = (data: unknown = {}): PromiseFulfilledResult<unknown> => ({
  status: 'fulfilled',
  value: { data, error: null },
});
const failed = (error: unknown): PromiseFulfilledResult<unknown> => ({
  status: 'fulfilled',
  value: { data: null, error },
});
const rejected = (reason: unknown): PromiseRejectedResult => ({ status: 'rejected', reason });

describe('collectSyncFailures', () => {
  it('reports no failures when every task fulfills without an error', () => {
    const result = collectSyncFailures([ok(), ok({ id: 1 })]);
    expect(result.count).toBe(0);
    expect(result.reasons).toEqual([]);
  });

  it('catches a Supabase upsert that resolves with { error } instead of rejecting', () => {
    const result = collectSyncFailures([
      ok(),
      failed({ message: 'permission denied for table profiles', code: '42501' }),
    ]);
    expect(result.count).toBe(1);
    expect(result.reasons[0]).toContain('permission denied');
  });

  it('still catches a genuinely rejected promise (network error)', () => {
    const result = collectSyncFailures([rejected(new Error('fetch failed'))]);
    expect(result.count).toBe(1);
    expect(result.reasons[0]).toContain('fetch failed');
  });

  it('counts every failure across a mix of rejected and fulfilled-with-error tasks', () => {
    const result = collectSyncFailures([
      ok(),
      failed({ message: 'unique constraint violation' }),
      rejected(new Error('timeout')),
    ]);
    expect(result.count).toBe(2);
  });

  it('ignores fulfilled values with a null/undefined error field', () => {
    const result = collectSyncFailures([{ status: 'fulfilled', value: { data: [], error: undefined } }]);
    expect(result.count).toBe(0);
  });
});
