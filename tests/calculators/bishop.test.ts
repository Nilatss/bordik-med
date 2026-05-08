/**
 * Golden tests for Bishop Score (cervical ripeness for induction).
 *
 * Reference: Bishop EH. Pelvic scoring for elective induction. Obstet
 * Gynecol 1964;24:266-268. Modified by Burnett (1966) for clinical use.
 * ACOG Practice Bulletin 107 anchors threshold of ≥9 = favourable cervix.
 *
 * Bands (max ~13, ACOG):
 *   0-5  → unfavourable (consider ripening: PGE2/PGE1, mechanical)
 *   6-8  → transitional
 *   ≥9   → favourable (proceed with amniotomy / oxytocin)
 */
import { describe, it, expect } from 'vitest';
import bishop from '@/lib/runners/bishop';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (bishop as { bands: ScoreBand[] }).bands;

describe('bishop · bands', () => {
  it('declares 3 ripeness bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..13 maps to exactly one band', () => {
    for (let s = 0; s <= 13; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0-5 → unfavourable', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/незрел|0-5/);
    expect(findBand(bands, 5)).toBe(findBand(bands, 0));
  });

  it('score 6-8 → transitional', () => {
    const b = findBand(bands, 6);
    expect(findBand(bands, 8)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/переходн|6-8/);
  });

  it('score ≥9 → favourable', () => {
    const b = findBand(bands, 9);
    expect(findBand(bands, 13)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/зрел|≥9|≥ 9/);
  });

  it('boundaries 5/6 and 8/9 separate distinct bands', () => {
    expect(findBand(bands, 5)).not.toBe(findBand(bands, 6));
    expect(findBand(bands, 8)).not.toBe(findBand(bands, 9));
  });
});
