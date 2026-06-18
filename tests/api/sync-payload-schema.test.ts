/**
 * Tests for lib/schemas/sync-payload.ts.
 *
 * Key regression: `toolsFavouritesUpdatedAt: Infinity` used to pass valibot
 * (v.number() + v.minValue(0) both accept Infinity) but then caused
 * `new Date(Infinity).toISOString()` to throw RangeError in the route handler.
 * The fix: v.finite() is added after v.number() so Infinity / -Infinity are
 * rejected at the schema boundary before the route ever touches them.
 */
import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { SyncPayloadSchema } from '@/lib/schemas/sync-payload';

const parse = (input: unknown) => v.safeParse(SyncPayloadSchema, input);

describe('SyncPayloadSchema — toolsFavouritesUpdatedAt', () => {
  it('rejects Infinity (would throw RangeError in new Date().toISOString())', () => {
    const r = parse({ toolsFavouritesUpdatedAt: Infinity });
    expect(r.success).toBe(false);
  });

  it('rejects -Infinity', () => {
    const r = parse({ toolsFavouritesUpdatedAt: -Infinity });
    expect(r.success).toBe(false);
  });

  it('rejects NaN', () => {
    const r = parse({ toolsFavouritesUpdatedAt: NaN });
    expect(r.success).toBe(false);
  });

  it('accepts a valid Unix-ms timestamp', () => {
    const r = parse({ toolsFavouritesUpdatedAt: Date.now() });
    expect(r.success).toBe(true);
  });

  it('accepts 0 (epoch)', () => {
    const r = parse({ toolsFavouritesUpdatedAt: 0 });
    expect(r.success).toBe(true);
  });

  it('accepts an empty payload (all fields optional)', () => {
    const r = parse({});
    expect(r.success).toBe(true);
  });
});

describe('SyncPayloadSchema — general validation', () => {
  it('rejects courseTestProgress levels outside 0-100', () => {
    const r = parse({ courseTestProgress: { course1: 101 } });
    expect(r.success).toBe(false);
  });

  it('rejects non-integer courseTestProgress levels', () => {
    const r = parse({ courseTestProgress: { course1: 1.5 } });
    expect(r.success).toBe(false);
  });

  it('accepts a full valid payload', () => {
    const r = parse({
      completedCourses: ['course-1'],
      startedCourses: ['course-2'],
      courseTestProgress: { 'course-1': 3 },
      studyTime: { 'course-1': 3600 },
      toolsFavourites: ['tool-abc'],
      toolsFavouritesUpdatedAt: 1700000000000,
      toolsSettings: {
        query: 'search term',
        categories: ['cardiology'],
        subcategories: [],
        countries: ['RU'],
        onlyAvailable: true,
      },
      profile: {
        displayName: 'Dr. Smith',
        status: 'active',
        country: 'RU',
        specialty: 'cardiology',
        language: 'ru',
        goal: 'Learn more',
      },
    });
    expect(r.success).toBe(true);
  });
});
