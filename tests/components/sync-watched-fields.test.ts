/**
 * Regression test for `syncWatchedFields` in lib/useSupabaseSync.ts.
 *
 * Bug: the push effect's `subscribe` selector only watched
 * {completedCourses, startedCourses, courseTestProgress, studyTime,
 * toolsFavourites, userName}, but the actual POST payload built inside
 * `queuePush` also sends `completedModules` and the `toolsSettings` /
 * `profile` sub-objects (query/categories/subcategories/countries/
 * onlyAvailable, status/country/specialty/language/goal). A store
 * mutation to any of THOSE fields never re-fired the subscribe listener,
 * so e.g. setting "Специальность" or "Страна" in the profile screen, or
 * passing a module final test, was never pushed to /api/sync until some
 * OTHER watched field also happened to change — the change silently
 * never reached the user's other devices.
 */
import { describe, it, expect } from 'vitest';
import { syncWatchedFields } from '@/lib/useSupabaseSync';
import type { AppState } from '@/lib/store';

// Only the fields syncWatchedFields reads are needed; cast covers the rest.
const BASE_STATE = {
  completedCourses: ['100.1'],
  startedCourses: ['100.1'],
  courseTestProgress: { '100.1': 2 },
  completedModules: [1],
  studyTime: { '100.1': 120 },
  toolsFavourites: ['cha2ds2'],
  userName: 'Студент',
  userStatus: 'university',
  userCountry: 'KZ',
  userSpecialty: 'Хирургия',
  userLanguage: 'ru',
  userGoal: 'Резидентура',
  toolsQuery: '',
  toolsCategories: [],
  toolsSubcategories: [],
  toolsCountries: [],
  toolsOnlyAvailable: false,
} as unknown as AppState;

describe('syncWatchedFields', () => {
  it('watches every field the /api/sync push payload sends', () => {
    const watched = syncWatchedFields(BASE_STATE);
    // Fields that were missing before the fix — a change to any of these
    // must be observable in the selector output, or the sync push never
    // fires for it.
    expect(watched).toMatchObject({
      cm: [1],
      ust: 'university',
      uc: 'KZ',
      usp: 'Хирургия',
      ul: 'ru',
      ug: 'Резидентура',
      tq: '',
      tcat: [],
      tsub: [],
      tco: [],
      toa: false,
    });
  });

  it('reflects a change to completedModules (module-final-test pass)', () => {
    const before = syncWatchedFields(BASE_STATE);
    const after = syncWatchedFields({ ...BASE_STATE, completedModules: [1, 2] });
    expect(after.cm).not.toEqual(before.cm);
  });

  it('reflects a change to a profile field (e.g. specialty set in Profile)', () => {
    const before = syncWatchedFields(BASE_STATE);
    const after = syncWatchedFields({ ...BASE_STATE, userSpecialty: 'Терапия' });
    expect(after.usp).not.toEqual(before.usp);
  });
});
