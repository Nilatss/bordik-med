/**
 * Unit tests for collectTaskFailures — the failure detector for POST
 * /api/sync's push tasks.
 *
 * Bug: the route treated `Promise.allSettled` "rejected" as the only
 * failure signal, but Supabase query builders resolve with
 * `{ data: null, error }` on a DB error instead of rejecting. A real
 * write failure (RLS violation, constraint violation, transient
 * PostgREST error) was therefore reported to the client as a 200 OK,
 * and the client's offline-retry queue never engaged because it only
 * fires on a non-ok response — the write was lost silently.
 *
 * This test imports the REAL predicate the route uses — no local
 * re-implementation — so it actually guards the shipped behaviour.
 */
import { describe, it, expect } from 'vitest';
import { collectTaskFailures } from '@/lib/sync-task-results';

function fulfilled(value: unknown): PromiseFulfilledResult<unknown> {
  return { status: 'fulfilled', value };
}
function rejected(reason: unknown): PromiseRejectedResult {
  return { status: 'rejected', reason };
}

describe('collectTaskFailures', () => {
  it('returns no failures when every task fulfills with no error', () => {
    const results = [
      fulfilled({ data: [{ id: 1 }], error: null }),
      fulfilled({ data: null, error: null }),
    ];
    expect(collectTaskFailures(results)).toEqual([]);
  });

  it('catches a fulfilled Supabase response carrying an error (the actual bug)', () => {
    const results = [
      fulfilled({ data: [{ id: 1 }], error: null }),
      fulfilled({ data: null, error: { message: 'permission denied for table course_progress' } }),
    ];
    const failures = collectTaskFailures(results);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('permission denied');
  });

  it('still catches a genuinely rejected promise', () => {
    const results = [rejected(new Error('network down'))];
    const failures = collectTaskFailures(results);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('network down');
  });

  it('reports every failing task when several fail at once', () => {
    const results = [
      fulfilled({ data: null, error: { message: 'constraint violation' } }),
      rejected(new Error('timeout')),
      fulfilled({ data: [{ id: 2 }], error: null }),
    ];
    expect(collectTaskFailures(results)).toHaveLength(2);
  });

  it('ignores fulfilled values with no error field at all', () => {
    const results = [fulfilled(undefined), fulfilled('ok'), fulfilled(42)];
    expect(collectTaskFailures(results)).toEqual([]);
  });
});
