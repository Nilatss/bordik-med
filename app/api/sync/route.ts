import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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
export async function GET() {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });

  // Fan out reads in parallel — single round-trip to Supabase.
  const [profileQ, progressQ, toolsQ, studyQ] = await Promise.all([
    sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    sb.from('course_progress').select('*').eq('user_id', user.id),
    sb.from('tool_settings').select('*').eq('user_id', user.id).maybeSingle(),
    sb.from('study_time').select('*').eq('user_id', user.id),
  ]);

  return NextResponse.json({
    profile: profileQ.data ?? null,
    courseProgress: progressQ.data ?? [],
    toolSettings: toolsQ.data ?? null,
    studyTime: studyQ.data ?? [],
  });
}

interface SyncPayload {
  completedCourses?: string[];
  startedCourses?: string[];
  courseTestProgress?: Record<string, number>;
  completedModules?: number[];
  studyTime?: Record<string, number>;
  toolsFavourites?: string[];
  toolsSettings?: {
    query?: string;
    categories?: string[];
    subcategories?: string[];
    countries?: string[];
    onlyAvailable?: boolean;
  };
  profile?: {
    displayName?: string;
    status?: string;
    country?: string;
    specialty?: string;
    language?: string;
    goal?: string;
  };
}

export async function POST(req: Request) {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });

  let body: SyncPayload = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

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
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: tasks.length });
}
