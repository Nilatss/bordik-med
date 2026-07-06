/**
 * Pure helpers for the module-final-exam ↔ course_progress sync bridge.
 *
 * `completedModules` (Zustand store) and `course_progress.module_passed`
 * (Supabase) are two different shapes for the same fact: a module final
 * exam is "passed" once every course it contains has module_passed=true.
 * MODULE_COURSE_IDS (lib/curriculum-stats.ts) is the mapping between them.
 *
 * Lives in its own tiny pure module (no edge-runtime / Supabase / Zustand
 * imports) so both the push side (app/api/sync/route.ts) and the pull side
 * (lib/useSupabaseSync.ts) — plus their tests — share one implementation
 * instead of re-deriving the mapping logic twice.
 */

/**
 * Push side: expand completed module ids into every course_progress row
 * that must get module_passed=true.
 */
export function courseIdsForCompletedModules(
  completedModules: readonly number[] | undefined,
  moduleCourseIds: Record<number, readonly string[]>,
): string[] {
  const ids = new Set<string>();
  for (const moduleId of completedModules ?? []) {
    for (const courseId of moduleCourseIds[moduleId] ?? []) {
      ids.add(courseId);
    }
  }
  return Array.from(ids);
}

/**
 * Pull side: reconstruct completed module ids from server course_progress
 * rows. A module counts as passed once ALL of its course ids report
 * module_passed=true. Unioned with the caller's local list so a pull never
 * *removes* a module already marked completed on this device (grow-only
 * merge, same rule as completedCourses/startedCourses).
 */
export function deriveCompletedModules(
  localCompletedModules: readonly number[],
  courseProgress: readonly { course_id: string; module_passed?: boolean | null }[],
  moduleCourseIds: Record<number, readonly string[]>,
): number[] {
  const passedCourseIds = new Set<string>();
  for (const row of courseProgress) {
    if (row.module_passed) passedCourseIds.add(row.course_id);
  }
  const result = new Set<number>(localCompletedModules);
  for (const [moduleIdStr, courseIds] of Object.entries(moduleCourseIds)) {
    if (courseIds.length > 0 && courseIds.every((cid) => passedCourseIds.has(cid))) {
      result.add(Number(moduleIdStr));
    }
  }
  return Array.from(result);
}
