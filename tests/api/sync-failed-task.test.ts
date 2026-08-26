/**
 * Unit tests for the sync-push failure detector (app/api/sync/route.ts).
 *
 * Bug: POST /api/sync ran its upserts through Promise.allSettled and only
 * treated a promise *rejection* as failure. Supabase-js query builders
 * never reject on a query-level error (RLS denial, constraint violation,
 * bad column) — they resolve with `{ data: null, error: {...} }`. So a
 * failed upsert looked "fulfilled" to allSettled, the route returned
 * apiOk(200), and the client believed the push succeeded while the write
 * was silently dropped.
 *
 * Fix: isFailedSyncTask also inspects the fulfilled value's `.error`
 * field. This test imports the real predicate the route uses.
 */
import { describe, it, expect } from 'vitest';
import { isFailedSyncTask } from '@/lib/sync-task-result';

async function settle(p: Promise<unknown>): Promise<PromiseSettledResult<unknown>> {
  return (await Promise.allSettled([p]))[0];
}

describe('isFailedSyncTask', () => {
  it('flags a rejected promise (network-level failure)', async () => {
    const r = await settle(Promise.reject(new Error('network down')));
    expect(isFailedSyncTask(r)).toBe(true);
  });

  it('flags a fulfilled Supabase result carrying an in-band .error', async () => {
    // This is the exact shape supabase-js resolves with on RLS/constraint
    // failures — allSettled sees this as 'fulfilled', not 'rejected'.
    const r = await settle(Promise.resolve({ data: null, error: { message: 'RLS violation' } }));
    expect(isFailedSyncTask(r)).toBe(true);
  });

  it('does not flag a fulfilled Supabase result with error: null', async () => {
    const r = await settle(Promise.resolve({ data: [{ id: 1 }], error: null }));
    expect(isFailedSyncTask(r)).toBe(false);
  });

  it('does not flag a fulfilled result with no error field at all', async () => {
    const r = await settle(Promise.resolve({ ok: true }));
    expect(isFailedSyncTask(r)).toBe(false);
  });

  it('does not flag a fulfilled primitive value', async () => {
    const r = await settle(Promise.resolve(undefined));
    expect(isFailedSyncTask(r)).toBe(false);
  });
});
