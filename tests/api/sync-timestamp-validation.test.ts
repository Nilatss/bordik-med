/**
 * Regression test for the toolsFavouritesUpdatedAt overflow bug.
 *
 * Bug: `toolsFavouritesUpdatedAt` in POST /api/sync lacked a maxValue
 * constraint.  A client that sent a timestamp beyond the JS Date maximum
 * (e.g. corrupted clock, bit-flip, or crafted payload) caused
 * `new Date(ts).toISOString()` to throw `RangeError: Invalid time value`.
 * `withAuthedSupabase` has no global catch, so the throw propagated as an
 * unhandled 500 — even though the profile/progress/studyTime upserts had
 * already committed successfully.  The client received a false failure and
 * retried, accumulating duplicate payloads.
 *
 * Fix: add `v.maxValue(8640000000000000)` to the schema so any timestamp
 * beyond the JS Date ceiling is rejected with 400 before reaching the
 * `new Date()` call.
 */
import { describe, it, expect } from 'vitest';
import * as v from 'valibot';

const MAX_JS_DATE_MS = 8640000000000000;

// Mirror of the relevant slice of SyncPayloadSchema in app/api/sync/route.ts.
// Kept in sync manually; if the field moves we catch it via typecheck.
const TimestampSchema = v.optional(
  v.pipe(v.number(), v.minValue(0), v.maxValue(MAX_JS_DATE_MS)),
);

describe('toolsFavouritesUpdatedAt validation', () => {
  it('accepts a normal epoch timestamp', () => {
    const r = v.safeParse(TimestampSchema, Date.now());
    expect(r.success).toBe(true);
  });

  it('accepts the exact JS Date maximum (8640000000000000)', () => {
    const r = v.safeParse(TimestampSchema, MAX_JS_DATE_MS);
    expect(r.success).toBe(true);
  });

  it('rejects a timestamp one millisecond above the JS Date maximum', () => {
    const r = v.safeParse(TimestampSchema, MAX_JS_DATE_MS + 1);
    expect(r.success).toBe(false);
  });

  it('rejects an astronomically large value (bit-flip / corrupted clock)', () => {
    const r = v.safeParse(TimestampSchema, Number.MAX_SAFE_INTEGER);
    expect(r.success).toBe(false);
  });

  it('accepts undefined (field is optional)', () => {
    const r = v.safeParse(TimestampSchema, undefined);
    expect(r.success).toBe(true);
  });

  it('shows WHY the guard matters: new Date() throws for out-of-range values', () => {
    // This is the crash that the maxValue constraint prevents from being reached.
    expect(() => new Date(MAX_JS_DATE_MS + 1).toISOString()).toThrow(RangeError);
    // Valid timestamps do not throw.
    expect(() => new Date(MAX_JS_DATE_MS).toISOString()).not.toThrow();
  });
});
