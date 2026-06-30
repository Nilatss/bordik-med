/**
 * Tests for the upsert row builders in app/api/sync/route.ts.
 *
 * Bug: POST /api/sync wrote ALL columns of `profiles` / `tool_settings`
 * on every push, defaulting any field absent from the request body to
 * null/''/[]/false. The route's own docstring promises "everything
 * optional, partial syncs OK" — but a caller sending only
 * `{ toolsFavourites: [...] }` (no toolsSettings) silently reset the
 * user's search query/categories/subcategories/countries/onlyAvailable
 * to empty defaults, and a caller sending only `{ profile: { goal } }`
 * silently wiped displayName/status/country/specialty back to null.
 *
 * Fix: the builders below only include keys actually present in the
 * request, so Postgrest's upsert leaves the other columns untouched on
 * conflict (UPDATE) while still getting correct schema defaults on
 * first INSERT.
 */
import { describe, it, expect } from 'vitest';
import { buildProfileUpsertRow, buildToolSettingsUpsertRow } from '@/lib/sync-row-builders';

describe('buildToolSettingsUpsertRow', () => {
  it('only writes favourites when toolsSettings is absent (partial sync)', () => {
    const row = buildToolSettingsUpsertRow('user-1', undefined, ['aspirin', 'losartan']);
    expect(row.favourites).toEqual(['aspirin', 'losartan']);
    expect(row).not.toHaveProperty('query');
    expect(row).not.toHaveProperty('categories');
    expect(row).not.toHaveProperty('subcategories');
    expect(row).not.toHaveProperty('countries');
    expect(row).not.toHaveProperty('only_available');
  });

  it('only writes settings fields when toolsFavourites is absent', () => {
    const row = buildToolSettingsUpsertRow(
      'user-1',
      { query: 'дозировка', categories: ['cardio'], onlyAvailable: true },
      undefined,
    );
    expect(row.query).toBe('дозировка');
    expect(row.categories).toEqual(['cardio']);
    expect(row.only_available).toBe(true);
    expect(row).not.toHaveProperty('favourites');
    expect(row).not.toHaveProperty('subcategories');
    expect(row).not.toHaveProperty('countries');
  });

  it('writes both when both are present', () => {
    const row = buildToolSettingsUpsertRow(
      'user-1',
      { query: 'q', categories: ['c'], subcategories: ['s'], countries: ['RU'], onlyAvailable: false },
      ['fav-1'],
    );
    expect(row).toMatchObject({
      user_id: 'user-1',
      query: 'q',
      categories: ['c'],
      subcategories: ['s'],
      countries: ['RU'],
      only_available: false,
      favourites: ['fav-1'],
    });
  });

  it('always includes user_id and updated_at', () => {
    const row = buildToolSettingsUpsertRow('user-1', undefined, undefined);
    expect(row.user_id).toBe('user-1');
    expect(typeof row.updated_at).toBe('string');
  });
});

describe('buildProfileUpsertRow', () => {
  it('only writes the provided field on a partial profile update', () => {
    const row = buildProfileUpsertRow('user-1', { goal: 'Ординатура' });
    expect(row.goal).toBe('Ординатура');
    expect(row).not.toHaveProperty('display_name');
    expect(row).not.toHaveProperty('status');
    expect(row).not.toHaveProperty('country');
    expect(row).not.toHaveProperty('specialty');
    expect(row).not.toHaveProperty('language');
  });

  it('writes all provided fields together', () => {
    const row = buildProfileUpsertRow('user-1', {
      displayName: 'Dr. Smith',
      status: 'working',
      country: 'RU',
      specialty: 'Кардиология',
      language: 'ru',
      goal: 'CME',
    });
    expect(row).toMatchObject({
      id: 'user-1',
      display_name: 'Dr. Smith',
      status: 'working',
      country: 'RU',
      specialty: 'Кардиология',
      language: 'ru',
      goal: 'CME',
    });
  });

  it('always includes id and updated_at even with an empty profile object', () => {
    const row = buildProfileUpsertRow('user-1', {});
    expect(row.id).toBe('user-1');
    expect(typeof row.updated_at).toBe('string');
    expect(row).not.toHaveProperty('display_name');
  });
});
