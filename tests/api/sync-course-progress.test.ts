/**
 * Regression tests for sync route — courseTestProgress type-safety bug.
 *
 * Bug: Object.entries(body.courseTestProgress ?? {}) typed `lvl` as
 * `unknown` because the `?? {}` fallback creates a union with `{}`,
 * losing the `Record<string, number>` value type precision. The
 * highest_test_level field (typed `number`) received an `unknown` value
 * without any type check.
 *
 * Fix: cast `lvl as number` — safe because valibot schema already
 * validated the value as integer 0-100 before this loop runs.
 *
 * These tests verify the runtime behaviour: values from a
 * courseTestProgress record are correctly preserved as numbers through
 * the Object.entries processing pattern used by the route.
 */
import { describe, it, expect } from 'vitest';

/**
 * Mirrors the processing logic in app/api/sync/route.ts POST handler.
 * Extracted here so we can test it without mocking Supabase.
 */
function buildCourseRows(
  courseTestProgress: Record<string, number> | undefined,
): Map<string, { course_id: string; highest_test_level?: number }> {
  const rows = new Map<string, { course_id: string; highest_test_level?: number }>();
  const ensure = (id: string) => {
    let row = rows.get(id);
    if (!row) {
      row = { course_id: id };
      rows.set(id, row);
    }
    return row;
  };
  for (const [id, lvl] of Object.entries(courseTestProgress ?? {})) {
    ensure(id).highest_test_level = lvl as number;
  }
  return rows;
}

describe('sync route — courseTestProgress processing', () => {
  it('stores numeric level from a populated record', () => {
    const rows = buildCourseRows({ 'course-abc': 3, 'course-xyz': 7 });
    expect(rows.get('course-abc')?.highest_test_level).toBe(3);
    expect(rows.get('course-xyz')?.highest_test_level).toBe(7);
  });

  it('returns empty map when courseTestProgress is undefined (fallback {})', () => {
    const rows = buildCourseRows(undefined);
    expect(rows.size).toBe(0);
  });

  it('returns empty map for empty record', () => {
    const rows = buildCourseRows({});
    expect(rows.size).toBe(0);
  });

  it('level 0 is preserved (valid minimum per schema)', () => {
    const rows = buildCourseRows({ 'course-a': 0 });
    expect(rows.get('course-a')?.highest_test_level).toBe(0);
  });

  it('level 100 is preserved (valid maximum per schema)', () => {
    const rows = buildCourseRows({ 'course-a': 100 });
    expect(rows.get('course-a')?.highest_test_level).toBe(100);
  });

  it('value is a number, not a string or undefined', () => {
    const rows = buildCourseRows({ 'course-a': 42 });
    const lvl = rows.get('course-a')?.highest_test_level;
    expect(typeof lvl).toBe('number');
    expect(lvl).not.toBeNaN();
  });
});
