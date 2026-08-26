/**
 * Supabase-js query builders resolve (never reject) even when the query
 * itself failed — RLS denial, constraint violation, bad column, etc. all
 * come back as a *fulfilled* `{ data: null, error: {...} }`. Promise.allSettled
 * alone only catches network-level rejections, so a query-level failure was
 * silently treated as success and the client believed a sync push went
 * through while the write was actually dropped (app/api/sync/route.ts).
 * This also inspects the fulfilled value's `.error` field.
 */
export function isFailedSyncTask(r: PromiseSettledResult<unknown>): boolean {
  if (r.status === 'rejected') return true;
  const value = r.value as { error?: unknown } | null | undefined;
  return Boolean(value && typeof value === 'object' && 'error' in value && value.error);
}
