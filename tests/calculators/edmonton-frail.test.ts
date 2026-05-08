/**
 * Golden tests for Edmonton Frail Scale (EFS).
 *
 * Reference: Rolfson DB, Majumdar SR, Tsuyuki RT, Tahir A, Rockwood K.
 * Validity and reliability of the Edmonton Frail Scale. Age Ageing
 * 2006;35(5):526-529. doi:10.1093/ageing/afl041
 *
 * Bands (max 17):
 *   0-5    → not frail
 *   6-7    → vulnerable
 *   8-9    → mild frailty
 *   10-11  → moderate frailty
 *   ≥12    → severe frailty
 */
import { describe, it, expect } from 'vitest';
import efs from '@/lib/runners/edmonton-frail';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (efs as { bands: ScoreBand[] }).bands;

describe('edmonton-frail · bands', () => {
  it('declares 5 frailty bands', () => {
    expect(bands.length).toBe(5);
  });

  it('every score 0..17 maps to exactly one band', () => {
    for (let s = 0; s <= 17; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0-5 → not frail', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/не фрагилен|0-5/);
    expect(findBand(bands, 5)).toBe(findBand(bands, 0));
  });

  it('score ≥12 → severe frailty', () => {
    const b = findBand(bands, 12);
    expect(findBand(bands, 17)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/тяжёлая|≥ 12|≥12/);
  });

  it('boundaries 5/6, 7/8, 9/10, 11/12 separate distinct bands', () => {
    for (const [a, b] of [[5, 6], [7, 8], [9, 10], [11, 12]]) {
      expect(findBand(bands, a as number), `boundary ${a}/${b}`).not.toBe(findBand(bands, b as number));
    }
  });

  it('bands have no gaps; cover up to 17', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(0);
    expect(sorted[sorted.length - 1]!.max).toBe(17);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min).toBe(sorted[i - 1]!.max + 1);
    }
  });
});
