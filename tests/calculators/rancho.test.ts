/**
 * Golden tests for Rancho Los Amigos Levels of Cognitive Functioning.
 *
 * Reference: Hagen C, Malkmus D, Durham P. Rancho Los Amigos Levels of
 * Cognitive Functioning Scale. Communication Disorders Service, Rancho
 * Los Amigos Hospital, 1972. Revised LCFS-R 10-level (1998).
 *
 * 10 levels (I-X) of post-TBI cognitive recovery:
 *   I    no response
 *   II   generalized response
 *   III  localized response
 *   IV   confused-agitated
 *   V    confused-inappropriate
 *   VI   confused-appropriate
 *   VII  automatic-appropriate
 *   VIII purposeful-appropriate
 *   IX   purposeful, modified independent (LCFS-R)
 *   X    purposeful, modified independent + multitasking (LCFS-R)
 */
import { describe, it, expect } from 'vitest';
import rancho from '@/lib/runners/rancho';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (rancho as { bands: ScoreBand[] }).bands;

describe('rancho · LCFS bands', () => {
  it('declares 10 individual levels', () => {
    expect(bands.length).toBe(10);
  });

  it('every level 1..10 maps to its own band', () => {
    for (let s = 1; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `level ${s}`).toBe(1);
      expect(matches[0]!.min).toBe(s);
      expect(matches[0]!.max).toBe(s);
    }
  });

  it('Level I = lowest (no response)', () => {
    expect(findBand(bands, 1).label).toBe('I');
  });

  it('Level X = highest LCFS-R extension', () => {
    expect(findBand(bands, 10).label).toBe('X');
  });

  it('all 10 labels are Roman numerals I-X', () => {
    const expected = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    for (let i = 0; i < 10; i++) {
      expect(findBand(bands, i + 1).label).toBe(expected[i]);
    }
  });

  it('colour escalates across distinct bands', () => {
    const colors = bands.map((b) => b.color);
    expect(new Set(colors).size).toBeGreaterThanOrEqual(3);
  });
});
