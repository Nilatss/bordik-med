/**
 * Regression test for `resetSyncedProgress` (lib/store.ts).
 *
 * Bug: `useSupabaseSync`'s `onAuthStateChange` handler only flipped
 * `pulled.current = false` on a Supabase `SIGNED_OUT` event — it never
 * cleared the Zustand store. `SIGNED_OUT` fires not just on explicit
 * "Выйти" (which already goes through `fullLogout()`'s
 * `localStorage.clear()`), but also on session expiry / token-refresh
 * failure / another tab signing out, with no page reload.
 *
 * On a shared device (e.g. a clinic workstation), if a second user then
 * signs in, `pull()` runs an additive union/`Math.max` merge against the
 * FIRST user's still-resident store state, then the push effect POSTs
 * that merged payload back to `/api/sync` — permanently writing the
 * first user's course completions / study time / profile into the
 * second user's account.
 *
 * `resetSyncedProgress()` is called from the `SIGNED_OUT` branch so the
 * store is back to factory defaults before any subsequent `pull()` can
 * merge against it.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/lib/store';

const staleUserSnapshot = () => ({
  completedCourses: ['cardio-101'],
  startedCourses: ['cardio-101', 'neuro-201'],
  courseTestProgress: { 'cardio-101': 3 },
  completedModules: [7, 12],
  studyTime: { 'cardio-101': 3600 },
  testAttempts: { 'cardio-101-1': [{ courseId: 'cardio-101', testLevel: 1 as const, answers: [0, 1], score: 8, total: 10, passed: true, timestamp: 1, violations: 0 }] },
  moduleTestAttempts: { 7: [{ moduleId: 7, answers: [1, 2], score: 2, total: 2, passed: true, timestamp: 1, timeUsedMs: 1000, violations: 0 }] },
  toolsFavourites: ['bmi-calc', 'wells-dvt'],
  toolsFavouritesUpdatedAt: 123456,
  userName: 'Dr. Ivanova',
  userEmail: 'ivanova@example.com',
  userStatus: 'working',
  userCountry: 'RU',
  userSpecialty: 'Кардиология',
  userLanguage: 'en',
  userGoal: 'CME',
});

describe('resetSyncedProgress', () => {
  beforeEach(() => {
    useAppStore.setState(staleUserSnapshot());
  });

  it('clears every field the pull/push sync loop reads or writes', () => {
    useAppStore.getState().resetSyncedProgress();
    const s = useAppStore.getState();

    expect(s.completedCourses).toEqual([]);
    expect(s.startedCourses).toEqual([]);
    expect(s.courseTestProgress).toEqual({});
    expect(s.completedModules).toEqual([]);
    expect(s.studyTime).toEqual({});
    expect(s.testAttempts).toEqual({});
    expect(s.moduleTestAttempts).toEqual({});
    expect(s.toolsFavourites).toEqual([]);
    expect(s.toolsFavouritesUpdatedAt).toBe(0);
  });

  it('resets profile fields to factory defaults, not just empty strings', () => {
    useAppStore.getState().resetSyncedProgress();
    const s = useAppStore.getState();

    // userName/userLanguage default to non-empty placeholders elsewhere in
    // the store (`'Студент'` / `'Русский'`) — mergeProfileFromServer treats
    // those specific values as "unset". Resetting to '' here would make the
    // NEXT user's profile pull silently no-op (see mergeProfileFromServer:
    // it only overwrites when local is '' OR the factory default).
    expect(s.userName).toBe('Студент');
    expect(s.userLanguage).toBe('Русский');
    expect(s.userEmail).toBe('');
    expect(s.userStatus).toBe('');
    expect(s.userCountry).toBe('');
    expect(s.userSpecialty).toBe('');
    expect(s.userGoal).toBe('');
  });

  it('a subsequent pull-style merge starts from a clean slate instead of the stale user', () => {
    useAppStore.getState().resetSyncedProgress();
    const state = useAppStore.getState();

    // Mirrors the additive-merge shape in useSupabaseSync's pull(): if this
    // ever again seeded from a non-reset store, a second user's course
    // completion would union with the first user's and get pushed back.
    const completed = new Set<string>(state.completedCourses);
    completed.add('second-user-course');
    expect(Array.from(completed)).toEqual(['second-user-course']);
  });
});
