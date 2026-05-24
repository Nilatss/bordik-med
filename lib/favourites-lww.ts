/**
 * Last-write-wins merge for the cross-device favourites set.
 *
 * Background: the sync PULL previously merged favourites with a union
 * (`Set([...local, ...server])`), so a favourite REMOVED on one device was
 * re-added from the server on another — deletions never propagated. A
 * correct LWW needs a favourites-specific timestamp (tool_settings.updated_at
 * is bumped on every push, so it can't tell "favourites changed" from
 * "anything else changed"); see supabase/p1-favourites-lww.sql.
 *
 * Rules:
 *   - server newer than local → adopt server (a delete elsewhere wins).
 *   - local newer/equal       → keep local (it will be pushed).
 *   - no server timestamp     → legacy fallback: union (never lose an add),
 *     so behaviour stays safe before the DB column is applied.
 *
 * Pure (no React / browser deps) so it is unit-testable in node-env.
 */
export function mergeFavouritesLWW(
  local: string[],
  localUpdatedAt: number,
  serverFavourites: string[] | null | undefined,
  serverUpdatedAtIso: string | null | undefined,
): { favourites: string[]; updatedAt: number } {
  if (!serverFavourites) return { favourites: local, updatedAt: localUpdatedAt };
  const serverTs = serverUpdatedAtIso ? Date.parse(serverUpdatedAtIso) : NaN;
  if (!Number.isFinite(serverTs)) {
    // Column not applied yet / legacy row → union (preserve old behaviour).
    return {
      favourites: Array.from(new Set([...local, ...serverFavourites])),
      updatedAt: localUpdatedAt,
    };
  }
  return serverTs > localUpdatedAt
    ? { favourites: serverFavourites, updatedAt: serverTs }
    : { favourites: local, updatedAt: localUpdatedAt };
}
