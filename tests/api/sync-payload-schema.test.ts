/**
 * Tests for the sync POST payload schema (app/api/sync/route.ts).
 *
 * Bug: `toolsFavouritesUpdatedAt` was validated as
 *   v.pipe(v.number(), v.minValue(0))
 * which accepts JavaScript's `Infinity` (a number >= 0).
 * The handler then called `new Date(Infinity).toISOString()` which throws
 * `RangeError: Invalid time value` — an unhandled exception in the Edge
 * runtime that caused a 500 on POST /api/sync.
 *
 * Fix: added `v.finite()` to the pipeline so Infinity / -Infinity / NaN
 * are rejected with a validation error before the date conversion runs.
 */
import { describe, it, expect } from 'vitest';
import * as v from 'valibot';

// Reproduce the schema as it was BEFORE the fix (no v.finite).
const SchemaOld = v.object({
  toolsFavouritesUpdatedAt: v.optional(v.pipe(v.number(), v.minValue(0))),
});

// The fixed schema (mirrors what is now in sync/route.ts).
const SchemaFixed = v.object({
  toolsFavouritesUpdatedAt: v.optional(v.pipe(v.number(), v.finite(), v.minValue(0))),
});

describe('sync POST payload — toolsFavouritesUpdatedAt schema', () => {
  describe('pre-fix behaviour (old schema)', () => {
    it('old schema accepts Infinity, which leads to RangeError on new Date(Infinity).toISOString()', () => {
      const result = v.safeParse(SchemaOld, { toolsFavouritesUpdatedAt: Infinity });
      expect(result.success).toBe(true);

      // Demonstrate the downstream crash that the bug caused.
      // result.success is true (asserted above) so .output is available;
      // valibot's SafeParseResult discriminated union narrows via .success.
      const output = (result as Extract<typeof result, { success: true }>).output;
      expect(() => new Date(output.toolsFavouritesUpdatedAt!).toISOString())
        .toThrow(RangeError);
    });
  });

  describe('post-fix behaviour (fixed schema)', () => {
    it('rejects Infinity', () => {
      const result = v.safeParse(SchemaFixed, { toolsFavouritesUpdatedAt: Infinity });
      expect(result.success).toBe(false);
    });

    it('rejects -Infinity', () => {
      const result = v.safeParse(SchemaFixed, { toolsFavouritesUpdatedAt: -Infinity });
      expect(result.success).toBe(false);
    });

    it('rejects NaN', () => {
      const result = v.safeParse(SchemaFixed, { toolsFavouritesUpdatedAt: NaN });
      expect(result.success).toBe(false);
    });

    it('accepts a normal epoch ms timestamp (Date.now() output)', () => {
      const ts = 1_700_000_000_000; // 2023-11-14 — representative production value
      const result = v.safeParse(SchemaFixed, { toolsFavouritesUpdatedAt: ts });
      expect(result.success).toBe(true);
      if (result.success) {
        // Verify the downstream conversion no longer crashes.
        expect(() => new Date(result.output.toolsFavouritesUpdatedAt!).toISOString())
          .not.toThrow();
      }
    });

    it('accepts 0 (epoch start — valid timestamp)', () => {
      const result = v.safeParse(SchemaFixed, { toolsFavouritesUpdatedAt: 0 });
      expect(result.success).toBe(true);
    });

    it('accepts omitted field (optional)', () => {
      const result = v.safeParse(SchemaFixed, {});
      expect(result.success).toBe(true);
    });
  });
});
