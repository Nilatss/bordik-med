/**
 * Tests for `selectSyncFields` in lib/useSupabaseSync.ts.
 *
 * Bug being fixed: the push effect subscribes to the store with a selector,
 * and only re-queues a push to /api/sync when the selector's *output*
 * changes (compared with zustand's `shallow` equality). The selector used
 * to watch only 6 fields, but the actual POST payload also sends
 * profile.status/country/specialty/language/goal. A user who only edited
 * e.g. their specialty on the Profile page produced a selector output that
 * was `shallow`-equal to before — no push was ever scheduled, so the change
 * silently never reached Supabase and never appeared on another device.
 *
 * These tests assert that changing each field with a working end-to-end
 * round trip (POST persists it AND the pull-side merge reads it back) also
 * changes what `selectSyncFields` returns, i.e. that it would trigger a
 * push. completedModules and toolsSettings.* (query/categories/
 * subcategories/countries/onlyAvailable) are deliberately excluded — see
 * the "does NOT trigger" tests below and the comment at the subscribe call
 * site in lib/useSupabaseSync.ts: the POST payload sends them, but neither
 * the /api/sync POST handler nor the pull-side merge round-trips them yet,
 * so watching them would only cause no-op network writes (and, for
 * toolsQuery specifically, one on every search keystroke).
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

  // Deliberately-excluded fields: the POST payload sends these, but they
  // don't complete a round trip yet (see file header), so watching them
  // would only produce no-op network writes while implying a fix that
  // isn't actually there. Caught by review on the original version of this
  // PR (github.com/Nilatss/bordik-med/pull/203) before it merged.
  it('does NOT trigger a push for completedModules (POST payload sends it, but /api/sync does not persist it and pull does not restore it)', () => {
    const after = { ...base, completedModules: [...base.completedModules, 3] };
    expect(wouldTriggerPush(base, after)).toBe(false);
  });

  it('does NOT trigger a push for toolsSettings.* (query/categories/subcategories/countries/onlyAvailable — per-device by design, pull never merges them)', () => {
    expect(wouldTriggerPush(base, { ...base, toolsQuery: 'wells' })).toBe(false);
    expect(wouldTriggerPush(base, { ...base, toolsCategories: ['cardiology'] })).toBe(false);
    expect(wouldTriggerPush(base, { ...base, toolsSubcategories: ['arrhythmia'] })).toBe(false);
    expect(wouldTriggerPush(base, { ...base, toolsCountries: ['RU'] })).toBe(false);
    expect(wouldTriggerPush(base, { ...base, toolsOnlyAvailable: !base.toolsOnlyAvailable })).toBe(false);
  });
});
