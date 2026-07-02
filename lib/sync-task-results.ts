/**
 * Bug: `/api/sync` POST pushed profile/course-progress/study-time/tool-settings
 * upserts via `Promise.allSettled(tasks)` and only checked for `status ===
 * 'rejected'`. Supabase's postgrest-js query builders never reject on a
 * DB-level failure (RLS violation, constraint violation, timeout) — they
 * resolve with `{ data: null, error }`. So a failed write always looked
 * like a fulfilled, successful settle, and the route returned `200 ok` while
 * silently dropping the user's data.
 *
 * This inspects every settled result — rejected AND fulfilled-with-error —
 * so a real failure is never reported as success.
 */
function describeError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function collectSyncFailures(
  results: ReadonlyArray<PromiseSettledResult<unknown>>,
): { count: number; reasons: string[] } {
  const reasons: string[] = [];
  for (const r of results) {
    if (r.status === 'rejected') {
      reasons.push(describeError(r.reason));
      continue;
    }
    const value = r.value as { error?: unknown } | null | undefined;
    if (value?.error) {
      reasons.push(describeError(value.error));
    }
  }
  return { count: reasons.length, reasons };
}
