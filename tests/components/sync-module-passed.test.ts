/**
 * Round-trip test for the module-final-exam cross-device sync bug.
 *
 * Bug: passing a module final test (`completedModules` in the Zustand
 * store) was pushed to /api/sync but the server silently dropped it — a
 * comment in app/api/sync/route.ts said "we don't have a course-to-module
 * map here" even though lib/curriculum-stats.ts exports exactly that map
 * (MODULE_COURSE_IDS), and it's already imported by lib/store.ts for the
 * same purpose. The GET handler fetched `module_passed` from the DB but
 * the client's pull-merge in lib/useSupabaseSync.ts never read it back
 * into `completedModules`. Net effect: a user who passed a module final
 * on device A saw it vanish on device B / after a reinstall, forcing an
 * expensive retake of a 100-question proctored exam.
 *
 * Fix: `courseIdsForCompletedModules` (server, push side) expands a
 * completed module id into every course_progress row that must get
 * module_passed=true. `deriveCompletedModules` (client, pull side)
 * reconstructs the module id once every one of its course rows reports
 * module_passed=true. Together they close the round trip.
 *
 * Both live in lib/module-progress-sync.ts — a tiny pure module with no
 * edge-runtime/Supabase/Zustand imports — and are the REAL functions used
 * by app/api/sync/route.ts (push) and lib/useSupabaseSync.ts (pull), not
 * a re-implementation.
 */
import { describe, it, expect } from 'vitest';
import { courseIdsForCompletedModules, deriveCompletedModules } from '@/lib/module-progress-sync';

const MODULE_COURSE_IDS: Record<number, readonly string[]> = {
  100: ['100.1', '100.2', '100.3'],
  101: ['101.1', '101.2'],
};

describe('courseIdsForCompletedModules (push side)', () => {
  it('expands a completed module into all of its course ids', () => {
    const ids = courseIdsForCompletedModules([100], MODULE_COURSE_IDS);
    expect(ids.sort()).toEqual(['100.1', '100.2', '100.3']);
  });

  it('unions course ids across multiple completed modules', () => {
    const ids = courseIdsForCompletedModules([100, 101], MODULE_COURSE_IDS);
    expect(ids.sort()).toEqual(['100.1', '100.2', '100.3', '101.1', '101.2']);
  });

  it('returns an empty list for no completed modules', () => {
    expect(courseIdsForCompletedModules(undefined, MODULE_COURSE_IDS)).toEqual([]);
    expect(courseIdsForCompletedModules([], MODULE_COURSE_IDS)).toEqual([]);
  });

  it('ignores unknown module ids instead of throwing', () => {
    expect(courseIdsForCompletedModules([999], MODULE_COURSE_IDS)).toEqual([]);
  });
});

describe('deriveCompletedModules (pull side)', () => {
  it('restores a module id once every one of its courses reports module_passed', () => {
    const courseProgress = [
      { course_id: '100.1', module_passed: true },
      { course_id: '100.2', module_passed: true },
      { course_id: '100.3', module_passed: true },
    ];
    const result = deriveCompletedModules([], courseProgress, MODULE_COURSE_IDS);
    expect(result).toEqual([100]);
  });

  it('does NOT restore a module when only some of its courses passed', () => {
    const courseProgress = [
      { course_id: '100.1', module_passed: true },
      { course_id: '100.2', module_passed: true },
      // 100.3 missing/false — module isn't fully passed server-side.
    ];
    const result = deriveCompletedModules([], courseProgress, MODULE_COURSE_IDS);
    expect(result).toEqual([]);
  });

  it('reproduces the original bug scenario end-to-end: push on device A, pull on device B', () => {
    // Device A pushes completedModules=[100] via the server helper.
    const pushedCourseIds = courseIdsForCompletedModules([100], MODULE_COURSE_IDS);
    // Server upserts module_passed=true on exactly those course rows.
    const serverRows = pushedCourseIds.map((course_id) => ({ course_id, module_passed: true }));
    // Device B, which never had module 100 locally, pulls.
    const restored = deriveCompletedModules([], serverRows, MODULE_COURSE_IDS);
    expect(restored).toEqual([100]);
  });

  it('is grow-only: never drops a module already completed locally', () => {
    // Local state already has module 101 completed (e.g. from a stale/failed
    // pull elsewhere); server data doesn't (yet) confirm it.
    const result = deriveCompletedModules([101], [], MODULE_COURSE_IDS);
    expect(result).toEqual([101]);
  });

  it('ignores a module with no course mapping', () => {
    const result = deriveCompletedModules([], [{ course_id: 'x', module_passed: true }], { 999: [] });
    expect(result).toEqual([]);
  });
});
