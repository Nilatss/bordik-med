/**
 * Regression tests for `selectSyncFields` (lib/useSupabaseSync.ts).
 *
 * Bug: the inline `subscribe()` selector used by the debounced push to
 * `/api/sync` only tracked 6 fields (completedCourses, startedCourses,
 * courseTestProgress, studyTime, toolsFavourites, userName). The actual
 * push payload also sends `completedModules` and the rest of `profile`
 * (status/country/specialty/language/goal) — so finishing a module, or
 * editing country/specialty/language/goal on /profile, silently never
 * queued a push. It only reached the server if piggy-backed on a later
 * change to one of the 6 originally-tracked fields.
 *
 * These tests lock in that every synced field is represented in the
 * selector's output, using zustand's own shallow-equality check — the
 * same one `subscribe(selector, listener, { equalityFn: shallowEqual })`
 * uses to decide whether to fire.
 */
import { describe, it, expect } from 'vitest';
import { shallow as shallowEqual } from 'zustand/shallow';
import { selectSyncFields } from '@/lib/useSupabaseSync';
import type { AppState } from '@/lib/store';

const BASE_STATE = {
  completedCourses: ['course-1'],
  startedCourses: ['course-2'],
  courseTestProgress: { 'course-1': 2 },
  completedModules: [1, 2],
  studyTime: { 'course-1': 120 },
  toolsFavourites: ['nihss'],
  userName: 'Студент',
  userStatus: 'university',
  userCountry: 'RU',
  userSpecialty: 'Терапия',
  userLanguage: 'Русский',
  userGoal: 'Резидентура',
  // Fields the selector must NOT react to — ephemeral UI state that used
  // to cause spurious pushes before the selector existed (Audit B-11).
  sidebarOpen: true,
  studyTimerTickCount: 42,
} as unknown as AppState;

function changed(patch: Partial<AppState>): boolean {
  const a = selectSyncFields(BASE_STATE);
  const b = selectSyncFields({ ...BASE_STATE, ...patch } as AppState);
  return !shallowEqual(a, b);
}

describe('selectSyncFields', () => {
  it('reacts to completedModules changing (module just passed)', () => {
    expect(changed({ completedModules: [1, 2, 3] } as Partial<AppState>)).toBe(true);
  });

  it('reacts to userCountry changing (profile edit)', () => {
    expect(changed({ userCountry: 'KZ' } as Partial<AppState>)).toBe(true);
  });

  it('reacts to userSpecialty changing (profile edit)', () => {
    expect(changed({ userSpecialty: 'Хирургия' } as Partial<AppState>)).toBe(true);
  });

  it('reacts to userLanguage changing (profile edit)', () => {
    expect(changed({ userLanguage: 'kk' } as Partial<AppState>)).toBe(true);
  });

  it('reacts to userGoal changing (profile edit)', () => {
    expect(changed({ userGoal: 'USMLE' } as Partial<AppState>)).toBe(true);
  });

  it('reacts to userStatus changing (profile edit)', () => {
    expect(changed({ userStatus: 'working' } as Partial<AppState>)).toBe(true);
  });

  it('still reacts to the originally-tracked fields', () => {
    expect(changed({ completedCourses: ['course-1', 'course-3'] } as Partial<AppState>)).toBe(true);
    expect(changed({ startedCourses: ['course-2', 'course-3'] } as Partial<AppState>)).toBe(true);
    expect(changed({ courseTestProgress: { 'course-1': 3 } } as Partial<AppState>)).toBe(true);
    expect(changed({ studyTime: { 'course-1': 240 } } as Partial<AppState>)).toBe(true);
    expect(changed({ toolsFavourites: ['nihss', 'sofa'] } as Partial<AppState>)).toBe(true);
    expect(changed({ userName: 'Aisulu' } as Partial<AppState>)).toBe(true);
  });

  it('does NOT react to unrelated ephemeral UI state', () => {
    expect(changed({ sidebarOpen: false } as Partial<AppState>)).toBe(false);
    expect(changed({ studyTimerTickCount: 43 } as Partial<AppState>)).toBe(false);
  });

  it('is referentially stable (same values -> shallow-equal output)', () => {
    expect(changed({})).toBe(false);
  });
});
