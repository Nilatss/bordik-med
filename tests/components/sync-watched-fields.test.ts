/**
 * Tests for `selectSyncFields` in lib/useSupabaseSync.ts.
 *
 * Bug: the selector passed to `useAppStore.subscribe(..., { equalityFn:
 * shallowEqual })` only watched 6 fields (completedCourses, startedCourses,
 * courseTestProgress, studyTime, toolsFavourites, userName), while the
 * debounced push sends 17 fields to /api/sync. Changing profile.status/
 * country/specialty/language/goal, any tools filter, or completedModules —
 * without touching one of the 6 watched fields in the same tick — produced
 * an IDENTICAL (shallow-equal) selector output before and after the change,
 * so zustand's `shallowEqual` equality check swallowed the update and the
 * push never fired. The change looked saved locally but silently never
 * reached Supabase (no cross-device sync).
 *
 * This test simulates that exact equality check: it asserts every store
 * field the push payload reads (see useSupabaseSync.ts `payload`) is
 * reflected in `selectSyncFields`'s output, by shallow-comparing a base
 * snapshot against snapshots that each change exactly one field.
 */
import { describe, it, expect } from 'vitest';
import { shallow as shallowEqual } from 'zustand/shallow';
import { selectSyncFields } from '@/lib/useSupabaseSync';

const BASE = {
  completedCourses: ['a'],
  startedCourses: ['b'],
  courseTestProgress: { a: 1 },
  completedModules: [1, 2],
  studyTime: { a: 100 },
  toolsFavourites: ['tool-1'],
  toolsFavouritesUpdatedAt: 1000,
  toolsQuery: '',
  toolsCategories: [] as string[],
  toolsSubcategories: [] as string[],
  toolsCountries: [] as string[],
  toolsOnlyAvailable: false,
  userName: 'Студент',
  userStatus: '',
  userCountry: '',
  userSpecialty: '',
  userLanguage: 'Русский',
  userGoal: '',
};

describe('selectSyncFields — watches every field the sync push sends', () => {
  const cases: Array<[string, Partial<typeof BASE>]> = [
    ['completedModules', { completedModules: [1, 2, 3] }],
    ['toolsFavouritesUpdatedAt', { toolsFavouritesUpdatedAt: 2000 }],
    ['toolsQuery', { toolsQuery: 'aspirin' }],
    ['toolsCategories', { toolsCategories: ['cardio'] }],
    ['toolsSubcategories', { toolsSubcategories: ['dvt'] }],
    ['toolsCountries', { toolsCountries: ['RU'] }],
    ['toolsOnlyAvailable', { toolsOnlyAvailable: true }],
    ['userStatus', { userStatus: 'university' }],
    ['userCountry', { userCountry: 'KZ' }],
    ['userSpecialty', { userSpecialty: 'Хирургия' }],
    ['userLanguage', { userLanguage: 'kk' }],
    ['userGoal', { userGoal: 'Резидентура' }],
  ];

  for (const [field, patch] of cases) {
    it(`fires when only "${field}" changes (was previously silently dropped)`, () => {
      const before = selectSyncFields(BASE);
      const after = selectSyncFields({ ...BASE, ...patch });
      expect(shallowEqual(before, after)).toBe(false);
    });
  }

  it('does not fire when nothing changes (no spurious pushes)', () => {
    const before = selectSyncFields(BASE);
    const after = selectSyncFields({ ...BASE });
    expect(shallowEqual(before, after)).toBe(true);
  });

  it('still fires for the originally-watched fields', () => {
    const before = selectSyncFields(BASE);
    const after = selectSyncFields({ ...BASE, userName: 'Dr. Aisulu' });
    expect(shallowEqual(before, after)).toBe(false);
  });
});
