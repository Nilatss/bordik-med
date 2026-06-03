/**
 * Regression test for: Object.entries(body.courseTestProgress ?? {}) yielding
 * `unknown` values when the fallback `{}` widened the Record<string, number>
 * type in TypeScript 6 with noUncheckedIndexedAccess.
 *
 * Fix: `?? ({} as Record<string, number>)` preserves the value type so that
 * assignment to `highest_test_level: number` typechecks without a cast.
 *
 * This test mirrors the SyncPayloadSchema from app/api/sync/route.ts
 * and asserts the runtime behaviour: after valibot validation, entries
 * are correctly typed as numbers.
 */
import { describe, it, expect } from 'vitest';
import * as v from 'valibot';

const COURSE_ID = v.pipe(v.string(), v.minLength(1), v.maxLength(64));

const SyncPayloadSchema = v.object({
  courseTestProgress: v.optional(
    v.record(
      COURSE_ID,
      v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(100)),
    ),
  ),
});

type SyncPayload = v.InferOutput<typeof SyncPayloadSchema>;

function processCourseProgress(body: SyncPayload): Map<string, number> {
  const out = new Map<string, number>();
  for (const [id, lvl] of Object.entries(
    body.courseTestProgress ?? ({} as Record<string, number>),
  )) {
    out.set(id, lvl);
  }
  return out;
}

describe('sync courseTestProgress processing', () => {
  it('parses numeric progress values via valibot schema', () => {
    const raw = { courseTestProgress: { 'course-abc': 75, 'course-xyz': 0 } };
    const result = v.safeParse(SyncPayloadSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const map = processCourseProgress(result.output);
    expect(map.get('course-abc')).toBe(75);
    expect(map.get('course-xyz')).toBe(0);
  });

  it('handles absent courseTestProgress (undefined) without throwing', () => {
    const result = v.safeParse(SyncPayloadSchema, {});
    expect(result.success).toBe(true);
    if (!result.success) return;
    const map = processCourseProgress(result.output);
    expect(map.size).toBe(0);
  });

  it('rejects a progress value above 100', () => {
    const result = v.safeParse(SyncPayloadSchema, {
      courseTestProgress: { 'course-abc': 101 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer progress value', () => {
    const result = v.safeParse(SyncPayloadSchema, {
      courseTestProgress: { 'course-abc': 75.5 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a negative progress value', () => {
    const result = v.safeParse(SyncPayloadSchema, {
      courseTestProgress: { 'course-abc': -1 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-numeric progress value', () => {
    const result = v.safeParse(SyncPayloadSchema, {
      courseTestProgress: { 'course-abc': 'high' },
    });
    expect(result.success).toBe(false);
  });
});
