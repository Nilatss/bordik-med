/**
 * Tests for Bug 3: GET /api/sync silently returned HTTP 200 with null/[]
 * data when a Supabase query failed (DB outage, RLS error, missing table).
 *
 * Root cause: the handler ran `progressQ.data ?? []` etc. without first
 * checking `progressQ.error`. The client received a well-formed 200 body
 * with empty arrays, interpreted it as "user has no server-side progress",
 * and overwrote the local store — silently deleting progress.
 *
 * Fix: the handler now checks for any query error and returns 500 before
 * touching `.data`. This lets the client detect the failure and abort the
 * merge (see useSupabaseSync.ts — it checks !res.ok).
 *
 * We test the error-detection logic directly rather than the full route
 * (which requires auth + Supabase mocking out of scope for unit tests).
 */
import { describe, it, expect } from 'vitest';

// ── minimal types that mirror Supabase query results ─────────────────────────

type QueryResult<T> = { data: T | null; error: { message: string } | null };

const ok  = <T>(data: T): QueryResult<T>   => ({ data, error: null });
const err = <T>(msg: string): QueryResult<T> => ({ data: null, error: { message: msg } });

// ── pre-fix: silent empty-data pattern ───────────────────────────────────────

describe('pre-fix: silent data loss pattern', () => {
  it('a failed progressQ silently returns [] — client thinks user has no progress', () => {
    const progressQ = err<unknown[]>('connection timeout');
    const clientData = progressQ.data ?? []; // old handler did exactly this
    expect(clientData).toEqual([]); // looks like valid "no records" to the client
    expect(progressQ.error).not.toBeNull(); // but the error was ignored
  });

  it('a failed profileQ silently returns null — client thinks no profile exists', () => {
    const profileQ = err<Record<string, unknown>>('permission denied for table profiles');
    const clientData = profileQ.data ?? null;
    expect(clientData).toBeNull(); // indistinguishable from "first login" state
  });
});

// ── post-fix: error surfacing logic ──────────────────────────────────────────

describe('post-fix: error surfacing (mirrors sync/route.ts GET handler)', () => {
  // This is the exact expression used in the fix:
  //   const queryError = profileQ.error ?? progressQ.error ?? toolsQ.error ?? studyQ.error;
  //   if (queryError) { return apiError('internal-error', 500); }

  it('detects no error when all queries succeed', () => {
    const [profileQ, progressQ, toolsQ, studyQ] = [ok({}), ok([]), ok({}), ok([])];
    const queryError = profileQ.error ?? progressQ.error ?? toolsQ.error ?? studyQ.error;
    expect(queryError).toBeNull();
  });

  it('surfaces a profile query error', () => {
    const [profileQ, progressQ, toolsQ, studyQ] = [
      err('permission denied for table profiles'), ok([]), ok({}), ok([]),
    ];
    const queryError = profileQ.error ?? progressQ.error ?? toolsQ.error ?? studyQ.error;
    expect(queryError).not.toBeNull();
    expect(queryError!.message).toMatch(/permission denied/);
  });

  it('surfaces a course_progress query error', () => {
    const [profileQ, progressQ, toolsQ, studyQ] = [
      ok({}), err('relation "course_progress" does not exist'), ok({}), ok([]),
    ];
    const queryError = profileQ.error ?? progressQ.error ?? toolsQ.error ?? studyQ.error;
    expect(queryError).not.toBeNull();
  });

  it('surfaces a tool_settings query error', () => {
    const [profileQ, progressQ, toolsQ, studyQ] = [ok({}), ok([]), err('DB timeout'), ok([])];
    const queryError = profileQ.error ?? progressQ.error ?? toolsQ.error ?? studyQ.error;
    expect(queryError).not.toBeNull();
  });

  it('surfaces a study_time query error', () => {
    const [profileQ, progressQ, toolsQ, studyQ] = [ok({}), ok([]), ok({}), err('row level security violation')];
    const queryError = profileQ.error ?? progressQ.error ?? toolsQ.error ?? studyQ.error;
    expect(queryError).not.toBeNull();
  });

  it('returns the FIRST error when multiple queries fail (short-circuit)', () => {
    const [profileQ, progressQ, toolsQ, studyQ] = [
      err('profile error'), ok([]), err('tools error'), ok([]),
    ];
    const queryError = profileQ.error ?? progressQ.error ?? toolsQ.error ?? studyQ.error;
    expect(queryError!.message).toBe('profile error');
  });
});
