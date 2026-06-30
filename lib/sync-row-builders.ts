/**
 * Pure row builders for POST /api/sync upserts.
 *
 * Extracted out of app/api/sync/route.ts (not just for testability — a
 * Next.js `route.ts` file may ONLY export HTTP method handlers plus a
 * small set of reserved config exports; any other named export fails
 * Next's route-shape typecheck at build time. Same reason PR #142
 * extracted isEmptyCspReport / migratePersistedState out of their
 * route/store files).
 */

export interface SyncProfileInput {
  displayName?: string | undefined;
  status?: string | undefined;
  country?: string | undefined;
  specialty?: string | undefined;
  language?: string | undefined;
  goal?: string | undefined;
}

export interface SyncToolsSettingsInput {
  query?: string | undefined;
  categories?: string[] | undefined;
  subcategories?: string[] | undefined;
  countries?: string[] | undefined;
  onlyAvailable?: boolean | undefined;
}

/**
 * Builds the `profiles` upsert row, including ONLY the fields actually
 * present in the request body.
 *
 * Bug fixed: the previous version always wrote all 6 profile fields,
 * defaulting any field absent from `profile` to `null` (or `'ru'` for
 * language). The route's own docstring promises "everything optional,
 * partial syncs OK" — but a caller sending only `{ profile: { goal } }`
 * silently wiped displayName/status/country/specialty back to null.
 * Omitting unset keys means Postgrest's upsert leaves those columns
 * untouched on conflict (UPDATE), while INSERT still gets correct
 * defaults from the schema (language defaults to 'ru').
 */
export function buildProfileUpsertRow(
  userId: string,
  profile: SyncProfileInput | undefined,
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };
  if (profile?.displayName !== undefined) row.display_name = profile.displayName;
  if (profile?.status !== undefined) row.status = profile.status;
  if (profile?.country !== undefined) row.country = profile.country;
  if (profile?.specialty !== undefined) row.specialty = profile.specialty;
  if (profile?.language !== undefined) row.language = profile.language;
  if (profile?.goal !== undefined) row.goal = profile.goal;
  return row;
}

/**
 * Builds the `tool_settings` upsert row, including ONLY the fields
 * actually present in the request body.
 *
 * Bug fixed: the previous version always wrote all 5 toolsSettings
 * columns, defaulting any field absent from `toolsSettings` to ''/[]/
 * false. Since `toolsFavourites` and `toolsSettings` are independently
 * optional in SyncPayloadSchema, a caller sending only
 * `{ toolsFavourites: [...] }` (a single favourite toggle, no search
 * filters touched) silently reset query/categories/subcategories/
 * countries/onlyAvailable to their empty defaults.
 */
export function buildToolSettingsUpsertRow(
  userId: string,
  toolsSettings: SyncToolsSettingsInput | undefined,
  toolsFavourites: string[] | undefined,
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (toolsSettings?.query !== undefined) row.query = toolsSettings.query;
  if (toolsSettings?.categories !== undefined) row.categories = toolsSettings.categories;
  if (toolsSettings?.subcategories !== undefined) row.subcategories = toolsSettings.subcategories;
  if (toolsSettings?.countries !== undefined) row.countries = toolsSettings.countries;
  if (toolsSettings?.onlyAvailable !== undefined) row.only_available = toolsSettings.onlyAvailable;
  if (toolsFavourites !== undefined) row.favourites = toolsFavourites;
  return row;
}
