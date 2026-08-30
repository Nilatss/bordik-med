/**
 * Tests for `selectSyncFields` in lib/useSupabaseSync.ts.
 *
 * Bug being fixed: the push effect subscribes to the store with a selector,
 * and only re-queues a push to /api/sync when the selector's *output*
 * changes (compared with zustand's `shallow` equality). The selector used
 * to watch only 6 fields, but the actual POST payload sends more —
 * completedModules, toolsSettings.* (query/categories/subcategories/
 * countries/onlyAvailable), and profile.status/country/specialty/language/
 * goal. A user who only edited e.g. their specialty on the Profile page,
 * or only passed a module final exam, produced a selector output that was
 * `shallow`-equal to before — no push was ever scheduled, so the change
 * silently never reached Supabase and never appeared on another device.
 *
 * These tests assert that changing each field the payload actually sends
 * also changes what `selectSyncFields` returns (as compared by zustand's
 * `shallow`), i.e. that it would trigger a push.
 */
import { describe, it, expect } from 'vitest';
import { shallow } from 'zustand/shallow';
import { selectSyncFields } from '@/lib/useSupabaseSync';
import { useAppStore, type AppState } from '@/lib/store';

/** Simulates the real subscribe callback: would a change from `before` to
 *  `after` cause `useAppStore.subscribe(selectSyncFields, ..., { equalityFn: shallow })`
 *  to fire? */
function wouldTriggerPush(before: AppState, after: AppState): boolean {
  return !shallow(selectSyncFields(before), selectSyncFields(after));
}

describe('selectSyncFields (push-sync selector)', () => {
  const base = useAppStore.getState();

  it('triggers a push when completedModules changes', () => {
    const after = { ...base, completedModules: [...base.completedModules, 3] };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when userStatus (profile.status) changes', () => {
    const after = { ...base, userStatus: 'university' };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when userCountry (profile.country) changes', () => {
    const after = { ...base, userCountry: 'KZ' };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when userSpecialty (profile.specialty) changes', () => {
    const after = { ...base, userSpecialty: 'Хирургия' };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when userLanguage (profile.language) changes', () => {
    const after = { ...base, userLanguage: 'kk' };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when userGoal (profile.goal) changes', () => {
    const after = { ...base, userGoal: 'Резидентура' };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when toolsSettings.query changes', () => {
    const after = { ...base, toolsQuery: 'wells' };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when toolsSettings.categories changes', () => {
    const after = { ...base, toolsCategories: ['cardiology'] };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when toolsSettings.subcategories changes', () => {
    const after = { ...base, toolsSubcategories: ['arrhythmia'] };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when toolsSettings.countries changes', () => {
    const after = { ...base, toolsCountries: ['RU'] };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  it('triggers a push when toolsSettings.onlyAvailable changes', () => {
    const after = { ...base, toolsOnlyAvailable: !base.toolsOnlyAvailable };
    expect(wouldTriggerPush(base, after)).toBe(true);
  });

  // Regression guard for the originally-watched fields — must stay watched.
  it('still triggers a push when completedCourses/startedCourses/courseTestProgress/studyTime/toolsFavourites/userName change', () => {
    expect(wouldTriggerPush(base, { ...base, completedCourses: [...base.completedCourses, '100.1'] })).toBe(true);
    expect(wouldTriggerPush(base, { ...base, startedCourses: [...base.startedCourses, '100.1'] })).toBe(true);
    expect(wouldTriggerPush(base, { ...base, courseTestProgress: { ...base.courseTestProgress, '100.1': 2 } })).toBe(true);
    expect(wouldTriggerPush(base, { ...base, studyTime: { ...base.studyTime, '100.1': 120 } })).toBe(true);
    expect(wouldTriggerPush(base, { ...base, toolsFavourites: [...base.toolsFavourites, 'bmi'] })).toBe(true);
    expect(wouldTriggerPush(base, { ...base, userName: 'Dr. Smith' })).toBe(true);
  });

  it('does NOT trigger a push for unrelated/ephemeral state (e.g. userEmail)', () => {
    // userEmail isn't part of the /api/sync payload — must stay unwatched
    // so we don't debounce-push on every unrelated store tick.
    const after = { ...base, userEmail: 'someone@example.com' };
    expect(wouldTriggerPush(base, after)).toBe(false);
  });
});
