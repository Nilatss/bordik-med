/**
 * Tests for the cross-device favourites LWW merge (lib/favourites-lww.ts).
 *
 * The bug this fixes: the old union merge could never propagate a DELETE —
 * removing a favourite on device A was re-added from the server on device B.
 * LWW by favourites_updated_at lets the newer side win (so deletes stick),
 * while falling back to the safe union when the server has no timestamp
 * (column not applied yet).
 */
import { describe, it, expect } from 'vitest';
import { mergeFavouritesLWW } from '@/lib/favourites-lww';

const iso = (ms: number) => new Date(ms).toISOString();

describe('mergeFavouritesLWW', () => {
  it('adopts the server set when the server is newer (a delete propagates)', () => {
    const r = mergeFavouritesLWW(['a', 'b'], 100, ['a'], iso(200));
    expect(r.favourites).toEqual(['a']);
    expect(r.updatedAt).toBe(200);
  });

  it('keeps local when local is newer (local will be pushed)', () => {
    const r = mergeFavouritesLWW(['a', 'b'], 300, ['a'], iso(200));
    expect(r.favourites).toEqual(['a', 'b']);
    expect(r.updatedAt).toBe(300);
  });

  it('keeps local on a timestamp tie', () => {
    const r = mergeFavouritesLWW(['a', 'b'], 200, ['a'], iso(200));
    expect(r.favourites).toEqual(['a', 'b']);
    expect(r.updatedAt).toBe(200);
  });

  it('falls back to union when the server has no timestamp (legacy / pre-migration)', () => {
    const r = mergeFavouritesLWW(['a'], 100, ['b'], null);
    expect([...r.favourites].sort()).toEqual(['a', 'b']);
    expect(r.updatedAt).toBe(100);
  });

  it('falls back to union on an unparseable server timestamp', () => {
    const r = mergeFavouritesLWW(['a'], 100, ['b'], 'not-a-date');
    expect([...r.favourites].sort()).toEqual(['a', 'b']);
  });

  it('keeps local when the server returns no favourites', () => {
    const r = mergeFavouritesLWW(['a', 'b'], 100, null, iso(999));
    expect(r.favourites).toEqual(['a', 'b']);
    expect(r.updatedAt).toBe(100);
  });
});
