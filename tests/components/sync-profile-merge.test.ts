/**
 * Tests for `mergeProfileFromServer` in lib/useSupabaseSync.ts.
 *
 * Bug being fixed: the original code used `!state.userName` to guard
 * the server→local copy. The Zustand store initialises `userName` to
 * `'Студент'` (truthy) and `userLanguage` to `'Русский'` (truthy), so
 * on a fresh device the condition was always false — the server value
 * was silently dropped.  A user who set their name on device A would
 * never see it sync to a freshly installed device B.
 */
import { describe, it, expect } from 'vitest';
import { mergeProfileFromServer } from '@/lib/useSupabaseSync';

const DEFAULT_STATE = {
  userName: 'Студент',
  userEmail: '',
  userCountry: '',
  userSpecialty: '',
  userLanguage: 'Русский',
  userGoal: '',
  userStatus: '',
};

describe('mergeProfileFromServer', () => {
  it('copies display_name from server when local is the default placeholder', () => {
    const updates = mergeProfileFromServer(DEFAULT_STATE, { display_name: 'Dr. Smith' });
    expect(updates.userName).toBe('Dr. Smith');
  });

  it('copies language from server when local is the default Русский', () => {
    const updates = mergeProfileFromServer(DEFAULT_STATE, { language: 'kk' });
    expect(updates.userLanguage).toBe('kk');
  });

  it('does NOT overwrite display_name set by the user on this device', () => {
    const updates = mergeProfileFromServer(
      { ...DEFAULT_STATE, userName: 'Aisulu Bekova' },
      { display_name: 'Server Name' },
    );
    expect(updates.userName).toBeUndefined();
  });

  it('does NOT overwrite language set by the user on this device', () => {
    const updates = mergeProfileFromServer(
      { ...DEFAULT_STATE, userLanguage: 'en' },
      { language: 'uk' },
    );
    expect(updates.userLanguage).toBeUndefined();
  });

  it('copies empty-default fields (country, specialty, etc.) from server', () => {
    const updates = mergeProfileFromServer(DEFAULT_STATE, {
      country: 'KZ',
      specialty: 'Хирургия',
      goal: 'Резидентура',
      status: 'university',
      email: 'user@example.com',
    });
    expect(updates.userCountry).toBe('KZ');
    expect(updates.userSpecialty).toBe('Хирургия');
    expect(updates.userGoal).toBe('Резидентура');
    expect(updates.userStatus).toBe('university');
    expect(updates.userEmail).toBe('user@example.com');
  });

  it('does NOT overwrite already-set fields (country, specialty, etc.)', () => {
    const updates = mergeProfileFromServer(
      { ...DEFAULT_STATE, userCountry: 'RU', userSpecialty: 'Терапия' },
      { country: 'KZ', specialty: 'Хирургия' },
    );
    expect(updates.userCountry).toBeUndefined();
    expect(updates.userSpecialty).toBeUndefined();
  });

  it('returns empty object for null profile', () => {
    expect(mergeProfileFromServer(DEFAULT_STATE, null)).toEqual({});
  });

  it('returns empty object for undefined profile', () => {
    expect(mergeProfileFromServer(DEFAULT_STATE, undefined)).toEqual({});
  });

  it('skips null/empty server values', () => {
    const updates = mergeProfileFromServer(DEFAULT_STATE, {
      display_name: null,
      language: '',
      country: null,
    });
    expect(updates.userName).toBeUndefined();
    expect(updates.userLanguage).toBeUndefined();
    expect(updates.userCountry).toBeUndefined();
  });

  it('applies display_name when local userName is empty string', () => {
    const updates = mergeProfileFromServer(
      { ...DEFAULT_STATE, userName: '' },
      { display_name: 'New Name' },
    );
    expect(updates.userName).toBe('New Name');
  });
});
