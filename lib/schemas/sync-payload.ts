/**
 * Valibot schema for the POST /api/sync payload.
 *
 * Extracted from app/api/sync/route.ts so it can be imported by unit
 * tests without pulling in Next.js / Supabase server-side dependencies.
 */
import * as v from 'valibot';

const COURSE_ID = v.pipe(v.string(), v.minLength(1), v.maxLength(64));
const FREE_TEXT = v.pipe(v.string(), v.maxLength(200));
const ARR_MAX   = 1000;

export const SyncPayloadSchema = v.object({
  completedCourses: v.optional(v.pipe(v.array(COURSE_ID), v.maxLength(ARR_MAX))),
  startedCourses:   v.optional(v.pipe(v.array(COURSE_ID), v.maxLength(ARR_MAX))),
  courseTestProgress: v.optional(v.record(COURSE_ID, v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(100)))),
  completedModules: v.optional(v.pipe(v.array(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(10000))), v.maxLength(ARR_MAX))),
  studyTime:        v.optional(v.record(COURSE_ID, v.pipe(v.number(), v.minValue(0), v.maxValue(60 * 60 * 24 * 365)))),
  toolsFavourites:  v.optional(v.pipe(v.array(v.pipe(v.string(), v.maxLength(120))), v.maxLength(ARR_MAX))),
  // Bug fix: v.finite() rejects Infinity / -Infinity which would cause
  // new Date(Infinity).toISOString() to throw RangeError in the route handler.
  // v.number() alone accepts Infinity because it IS a valid JS number type;
  // v.minValue(0) doesn't help since Infinity >= 0.
  toolsFavouritesUpdatedAt: v.optional(v.pipe(v.number(), v.finite(), v.minValue(0))),
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

export type SyncPayload = v.InferOutput<typeof SyncPayloadSchema>;
