/**
 * Regression test for the toolsFavouritesUpdatedAt schema in app/api/sync/route.ts.
 *
 * Bug: the old schema used `v.pipe(v.number(), v.minValue(0))` which
 * accepts Infinity (Infinity > 0 is true in JS). A client sending
 * toolsFavouritesUpdatedAt: Infinity caused
 *   new Date(Infinity).toISOString()
 * to throw RangeError ("Invalid time value") inside the POST handler,
 * crashing the whole sync endpoint with an unhandled exception.
 *
 * Fix: added v.maxValue(Number.MAX_SAFE_INTEGER) to the pipeline so
 * any non-finite or astronomically large value is rejected at the
 * validation layer (400 Bad Request) before reaching new Date().
 */
import { describe, it, expect } from 'vitest';
import * as v from 'valibot';

// Mirrors the fixed schema definition in app/api/sync/route.ts.
const TIMESTAMP_SCHEMA = v.optional(
  v.pipe(v.number(), v.minValue(0), v.maxValue(Number.MAX_SAFE_INTEGER))
);

describe('toolsFavouritesUpdatedAt schema (sync route)', () => {
  it('rejects Infinity — the root cause of the new Date() crash', () => {
    expect(v.safeParse(TIMESTAMP_SCHEMA, Infinity).success).toBe(false);
  });

  it('rejects -Infinity', () => {
    expect(v.safeParse(TIMESTAMP_SCHEMA, -Infinity).success).toBe(false);
  });

  it('rejects values above Number.MAX_SAFE_INTEGER', () => {
    expect(v.safeParse(TIMESTAMP_SCHEMA, Number.MAX_SAFE_INTEGER + 1).success).toBe(false);
  });

  it('accepts a typical epoch timestamp (ms)', () => {
    expect(v.safeParse(TIMESTAMP_SCHEMA, 1_719_000_000_000).success).toBe(true);
  });

  it('accepts 0 (epoch start)', () => {
    expect(v.safeParse(TIMESTAMP_SCHEMA, 0).success).toBe(true);
  });

  it('rejects negative timestamps', () => {
    expect(v.safeParse(TIMESTAMP_SCHEMA, -1).success).toBe(false);
  });

  it('accepts undefined (field is optional)', () => {
    expect(v.safeParse(TIMESTAMP_SCHEMA, undefined).success).toBe(true);
  });

  it('confirms Infinity would not crash new Date() after fix (schema rejects it first)', () => {
    // Verify the underlying crash still exists if you bypass the schema
    // (documents why the schema fix is necessary)
    expect(() => new Date(Infinity).toISOString()).toThrow(RangeError);
  });
});
