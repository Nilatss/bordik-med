/**
 * Golden tests for revised Geneva score (PE clinical probability).
 *
 * Reference: Le Gal G, Righini M, Roy PM, et al. Prediction of pulmonary
 * embolism in the emergency department: the revised Geneva score. Ann
 * Intern Med 2006;144(3):165-171.
 * doi:10.7326/0003-4819-144-3-200602070-00004
 *
 * Bands (PE prevalence in derivation):
 *   0-3   → low (~8%)       D-dimer rule-out feasible
 *   4-10  → intermediate (~28%)
 *   ≥11   → high (~74%)     CTPA / V/Q regardless of D-dimer
 *
 * Used alongside Wells PE; either is acceptable per ESC 2019 PE guideline.
 */
import { describe, it, expect } from 'vitest';
import geneva from '@/lib/runners/geneva';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (geneva as { bands: ScoreBand[] }).bands;

describe('geneva · bands', () => {
  it('declares 3 probability bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..25 maps to exactly one band', () => {
    for (let s = 0; s <= 25; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0..3 → low probability', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/низкая/);
    expect(findBand(bands, 3)).toBe(findBand(bands, 0));
  });

  it('boundary 3 vs 4 (low → intermediate)', () => {
    expect(findBand(bands, 3)).not.toBe(findBand(bands, 4));
    expect(findBand(bands, 4).label.toLowerCase()).toMatch(/умеренная|intermed/);
  });

  it('boundary 10 vs 11 (intermediate → high)', () => {
    expect(findBand(bands, 10)).not.toBe(findBand(bands, 11));
    expect(findBand(bands, 11).label.toLowerCase()).toMatch(/высокая|high/);
  });

  it('top band covers up to 25', () => {
    expect(findBand(bands, 25).max).toBe(25);
  });
});
