/**
 * Golden tests for MoCA (Montreal Cognitive Assessment).
 *
 * Reference: Nasreddine ZS, Phillips NA, Bédirian V, et al. The Montreal
 * Cognitive Assessment, MoCA: a brief screening tool for mild cognitive
 * impairment. J Am Geriatr Soc 2005;53(4):695-699.
 * doi:10.1111/j.1532-5415.2005.53221.x
 *
 * Bands (max 30; +1 if ≤12 yrs schooling):
 *   <10    → severe dementia
 *   10-17  → moderate dementia
 *   18-25  → MCI suspect
 *   ≥26    → normal
 *
 * Cut-off ≥26 = ~90% sensitivity for MCI vs ~64% for MMSE at the same
 * level (Nasreddine 2005).
 */
import { describe, it, expect } from 'vitest';
import moca from '@/lib/runners/moca';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (moca as { bands: ScoreBand[] }).bands;

describe('moca · bands', () => {
  it('declares 4 severity bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..30 maps to exactly one band', () => {
    for (let s = 0; s <= 30; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score ≥26 → normal', () => {
    expect(findBand(bands, 26).label.toLowerCase()).toMatch(/норма|≥ 26|≥26/);
    expect(findBand(bands, 30)).toBe(findBand(bands, 26));
  });

  it('boundary 25 vs 26 (MCI vs normal)', () => {
    expect(findBand(bands, 25)).not.toBe(findBand(bands, 26));
    expect(findBand(bands, 25).label.toLowerCase()).toMatch(/mci|18-25/);
  });

  it('score <10 → severe dementia', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/тяжёл/);
    expect(findBand(bands, 9)).toBe(findBand(bands, 0));
  });

  it('boundary 9 vs 10 (severe vs moderate)', () => {
    expect(findBand(bands, 9)).not.toBe(findBand(bands, 10));
  });
});
