/**
 * Golden tests for IMPROVE bleeding risk score (medical inpatients).
 *
 * Reference: Decousus H, Tapson VF, Bergmann JF, et al. Factors at
 * admission associated with bleeding risk in medical patients: findings
 * from the IMPROVE investigators. Chest 2011;139(1):69-79.
 * doi:10.1378/chest.09-3081
 *
 * Bands:
 *   <7    → low risk             pharmacologic VTE prophylaxis acceptable
 *   ≥7    → high bleeding risk   mechanical-only prophylaxis preferred
 *
 * Used alongside Padua: high-Padua + low-IMPROVE → LMWH; high both → mechanical.
 */
import { describe, it, expect } from 'vitest';
import improve from '@/lib/runners/improve-bleed';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (improve as { bands: ScoreBand[] }).bands;

describe('improve-bleed · bands', () => {
  it('declares 2 bands at threshold 7', () => {
    expect(bands.length).toBe(2);
  });

  it('every score 0..20 maps to exactly one band', () => {
    for (let s = 0; s <= 20; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('boundary 6 vs 7 (low → high)', () => {
    expect(findBand(bands, 6)).not.toBe(findBand(bands, 7));
    expect(findBand(bands, 6).label.toLowerCase()).toMatch(/< 7|низк/);
    expect(findBand(bands, 7).label.toLowerCase()).toMatch(/≥ 7|высок/);
  });

  it('high band uses warning colour', () => {
    expect(findBand(bands, 7).color.toLowerCase()).toMatch(/^#(e|d|c|b|a|9|8|7)/i);
  });
});
