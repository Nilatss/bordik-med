import * as v from 'valibot';
import { withAuthedSupabase, parseJsonBody, apiError, apiOk } from '@/lib/api-helpers';

// P1-PERF-NEW-4 — sync route на Edge runtime.
// /api/sync делает 4 параллельных Supabase-чтения (GET) и до 4
// upsert'ов (POST). Все операции — pure HTTP к Supabase REST,
// без node:fs / node:crypto / process.cwd. Edge runtime даёт ~50-150ms
// меньше cold-start vs Node, и регион выбирается ближайший к юзеру.
//
// Каверты:
// - withAuthedSupabase + getSupabaseServerClient импортируют
//   `@supabase/ssr` который сам Edge-compat
// - cookies() из next/headers работает в Edge
// - valibot schemas — pure JS, без Node API
// - Промежуточная отладка: если появятся node-only ошибки, откати
//   на 'nodejs' (worst case теряем латентность, не корректность)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET  /api/sync — pull all server-side state for the signed-in user.
 * POST /api/sync — push client state back to the server.
 *
 * Body of the POST payload (everything optional, partial syncs OK):
 *   {
 *     completedCourses?: string[],
 *     startedCourses?:  string[],
 *     courseTestProgress?: Record<courseId, highestPassedLevel>,
 *     completedModules?: number[],
 *     studyTime?: Record<courseId, seconds>,
 *     toolsFavourites?: string[],
 *     toolsSettings?: { categories, subcategories, countries, query, onlyAvailable },
 *     profile?: { displayName, status, country, specialty, language, goal }
 *   }
 *
 * The frontend is the source of truth at moment of write; conflicts
 * are resolved last-write-wins (same model as the local Zustand store).
 */
export async function GET(req: Request) {
  // P1-CR-7 — auth/origin/CSRF guard через withAuthedSupabase helper
  return withAuthedSupabase(req, async (sb, user) => {
    // Audit P-4: explicit column lists. Pre-fix `.select('*')` shipped
    // every column on every fetch — as the schema grows (e.g. profiles
    // gaining `bio`, `avatar_url`, `consent_metadata`, `audit_meta`)
    // the response size and parsing cost grew linearly without the
    // client needing those columns. Listing the columns explicitly
    // pins the contract: the client uses exactly these fields (see
    // SyncPayloadSchema above), nothing else, and the response stays
    // O(known-columns) regardless of future schema migrations.
    // Column lists pinned against supabase/schema.sql (lines 9-69).
    // Any new column added there is intentionally opt-in: the client
    // doesn't see it until we extend SyncPayloadSchema + this select.
    const [profileQ, progressQ, toolsQ, studyQ] = await Promise.all([
      sb
        .from('profiles')
        .select(
          'id, display_name, email, status, country, specialty, language, goal, updated_at',
        )
        .eq('id', user.id)
        .maybeSingle(),
      sb
        .from('course_progress')
        .select(
          'user_id, course_id, started_at, completed_at, highest_test_level, module_passed, updated_at',
        )
        .eq('user_id', user.id),
      sb
        .from('tool_settings')
        .select(
          'user_id, query, categories, subcategories, countries, only_available, favourites, updated_at',
        )
        .eq('user_id', user.id)
        .maybeSingle(),
      sb
        .from('study_time')
        .select('user_id, course_id, seconds, updated_at')
        .eq('user_id', user.id),
    ]);

    // favourites_updated_at fetched separately + tolerantly: if the column
    // (supabase/p1-favourites-lww.sql) isn't applied yet, supabase-js returns
    // an error we ignore, and the client falls back to the legacy union merge.
    let favUpdatedAt: string | null = null;
    {
      const r = await sb
        .from('tool_settings')
        .select('favourites_updated_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!r.error && r.data) {
        favUpdatedAt = (r.data as { favourites_updated_at?: string | null }).favourites_updated_at ?? null;
      }
    }

    return apiOk({
      profile: profileQ.data ?? null,
      courseProgress: progressQ.data ?? [],
      toolSettings: toolsQ.data ? { ...toolsQ.data, favourites_updated_at: favUpdatedAt } : null,
      studyTime: studyQ.data ?? [],
    });
  });
}

/**
 * Bounds — щедрые, но конечные. Защищают от payload-bomb и
 * случайно прокинутого огромного state.
 *   COURSE_ID  — UUID-подобный токен, ≤64 симв.
 *   FREE_TEXT  — ник/статус/специальность, ≤200 симв.
 *   ARR        — потолок на список (1000 курсов больше, чем у любого
 *                реального пользователя).
 *   RECORD     — entries не лимитируем напрямую (valibot не умеет),
 *                но ключи и значения каждой пары валидируются.
 */
const COURSE_ID = v.pipe(v.string(), v.minLength(1), v.maxLength(64));
const FREE_TEXT = v.pipe(v.string(), v.maxLength(200));
const ARR_MAX   = 1000;

const SyncPayloadSchema = v.object({
  completedCourses: v.optional(v.pipe(v.array(COURSE_ID), v.maxLength(ARR_MAX))),
  startedCourses:   v.optional(v.pipe(v.array(COURSE_ID), v.maxLength(ARR_MAX))),
  courseTestProgress: v.optional(v.record(COURSE_ID, v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(100)))),
  completedModules: v.optional(v.pipe(v.array(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(10000))), v.maxLength(ARR_MAX))),
  studyTime:        v.optional(v.record(COURSE_ID, v.pipe(v.number(), v.minValue(0), v.maxValue(60 * 60 * 24 * 365)))),
  toolsFavourites:  v.optional(v.pipe(v.array(v.pipe(v.string(), v.maxLength(120))), v.maxLength(ARR_MAX))),
  toolsFavouritesUpdatedAt: v.optional(v.pipe(v.number(), v.minValue(0))),
  toolsSettings:    v.optional(v.object({
    query:         v.optional(v.pipe(v.string(), v.maxLength(200))),
    categories:    v.optional(v.pipe(v.array(v.pipe(v.string(), v.maxLength(80))), v.maxLength(200))),
    subcategories: v.optional(v.pipe(v.array(v.pipe(v.string(), v.maxLength(80))), v.maxLength(500))),
    countries:     v.optional(v.pipe(v.array(v.pipe(v.string(), v.maxLength(40))), v.maxLength(50))),
    onlyAvailable: v.optional(v.boolean()),
  })),
  profile: v.optional(v.object({
    displayName: v.optional(FREE_TEXT),
    status:      v.optional(FREE_TEXT),
    country:     v.optional(v.pipe(v.string(), v.maxLength(40))),
    specialty:   v.optional(FREE_TEXT),
    language:    v.optional(v.pipe(v.string(), v.maxLength(8))),
    goal:        v.optional(v.pipe(v.string(), v.maxLength(500))),
  })),
});

type SyncPayload = v.InferOutput<typeof SyncPayloadSchema>;

export async function POST(req: Request) {
  // P1-CR-7 — origin/auth/CSRF через withAuthedSupabase
  return withAuthedSupabase(req, async (sb, user) => {
    const parsed = await parseJsonBody(req);
    if (!parsed.ok) return parsed.response;
    const validated = v.safeParse(SyncPayloadSchema, parsed.data);
    if (!validated.success) {
      return apiError('bad-input', 400, {
        issues: validated.issues.slice(0, 3).map((i) => i.message),
      });
    }
    const body: SyncPayload = validated.output;

  // Supabase query builders are thenable but their TS signature differs
   // from native Promise — wrap with `Promise.resolve().then(() => task)`
   // so Promise.allSettled() typechecks cleanly.
  const tasks: PromiseLike<unknown>[] = [];

  // 1. profile upsert
  if (body.profile) {
    tasks.push(
      sb.from('profiles').upsert({
        id: user.id,
        display_name: body.profile.displayName ?? null,
        status:       body.profile.status ?? null,
        country:      body.profile.country ?? null,
        specialty:    body.profile.specialty ?? null,
        language:     body.profile.language ?? 'ru',
        goal:         body.profile.goal ?? null,
        updated_at:   new Date().toISOString(),
      }),
    );
  }

  // 2. course_progress: derive a list of upserts from completedCourses
  //    + startedCourses + courseTestProgress + completedModules.
  const courseRows = new Map<string, {
    user_id: string;
    course_id: string;
    started_at?: string;
    completed_at?: string | null;
    highest_test_level?: number;
    module_passed?: boolean;
  }>();
  const ensureRow = (id: string) => {
    let row = courseRows.get(id);
    if (!row) {
      row = { user_id: user.id, course_id: id };
      courseRows.set(id, row);
    }
    return row;
  };
  for (const id of body.startedCourses ?? []) {
    ensureRow(id).started_at = new Date().toISOString();
  }
  for (const id of body.completedCourses ?? []) {
    ensureRow(id).completed_at = new Date().toISOString();
  }
  for (const [id, lvl] of Object.entries(body.courseTestProgress ?? {})) {
    ensureRow(id).highest_test_level = lvl;
  }
  // Note: completedModules is just a boolean per courseId in our data model;
  // we set it on every course_progress row for that module.
  // (Frontend sends module ids — but we don't have a course-to-module map
  //  here without importing curriculum. Skip for now; module_passed updates
  //  on next test submission instead.)

  if (courseRows.size > 0) {
    tasks.push(sb.from('course_progress').upsert(Array.from(courseRows.values())));
  }

  // 3. study_time upserts
  const studyRows = Object.entries(body.studyTime ?? {}).map(([courseId, seconds]) => ({
    user_id: user.id,
    course_id: courseId,
    seconds,
    updated_at: new Date().toISOString(),
  }));
  if (studyRows.length > 0) {
    tasks.push(sb.from('study_time').upsert(studyRows));
  }

  // 4. tool_settings
  if (body.toolsSettings || body.toolsFavourites) {
    tasks.push(
      sb.from('tool_settings').upsert({
        user_id: user.id,
        query:           body.toolsSettings?.query ?? '',
        categories:      body.toolsSettings?.categories ?? [],
        subcategories:   body.toolsSettings?.subcategories ?? [],
        countries:       body.toolsSettings?.countries ?? [],
        only_available:  body.toolsSettings?.onlyAvailable ?? false,
        favourites:      body.toolsFavourites ?? [],
        updated_at:      new Date().toISOString(),
      }),
    );
  }

    const results = await Promise.allSettled(tasks);
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => String(r.reason));
    if (errors.length > 0) {
      return apiError('internal-error', 500, { errors });
    }

    // Favourites LWW timestamp — written separately + tolerantly so a
    // not-yet-applied favourites_updated_at column degrades to legacy sync
    // (any error here is ignored rather than failing the whole push). Runs
    // after the upsert above so the row already exists.
    if (body.toolsFavouritesUpdatedAt != null && (body.toolsSettings || body.toolsFavourites)) {
      await sb
        .from('tool_settings')
        .update({ favourites_updated_at: new Date(body.toolsFavouritesUpdatedAt).toISOString() })
        .eq('user_id', user.id);
    }

    return apiOk({ count: tasks.length });
  });
}
