/**
 * collectTaskFailures — failure detector for POST /api/sync's push tasks.
 *
 * Bug: the route ran its Supabase upserts through `Promise.allSettled` and
 * only checked `status === 'rejected'`. supabase-js query builders never
 * reject on a database error (RLS violation, constraint violation,
 * transient PostgREST error) — they *resolve* with `{ data: null, error }`.
 * So a genuine write failure was reported as a fulfilled promise, the
 * route fell through to `apiOk(...)`, and the client believed the sync
 * succeeded when the data was never written — silently, with no retry.
 *
 * Fix: treat a fulfilled result carrying a truthy `.error` field the same
 * as a rejection. Lives in its own pure module (no edge-runtime / Supabase
 * imports) so it stays trivially unit-testable in node-env vitest, and is
 * imported by BOTH `app/api/sync/route.ts` and its test.
 */
function describeError(error: unknown): string {
  // PostgrestError is a plain object ({message, details, hint, code}), so a
  // bare String(error) collapses it to the useless "[object Object]" —
  // pull .message out first, same as how supabase-js itself formats it.
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message);
  }
  return String(error);
}

export function collectTaskFailures(results: PromiseSettledResult<unknown>[]): string[] {
  const failures: string[] = [];
  for (const r of results) {
    if (r.status === 'rejected') {
      failures.push(describeError(r.reason));
      continue;
    }
    const value = r.value;
    if (value && typeof value === 'object' && 'error' in value) {
      const error = (value as { error?: unknown }).error;
      if (error) failures.push(describeError(error));
    }
  }
  return failures;
}
