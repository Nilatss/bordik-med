/**
 * Golden tests for 4AT (rapid delirium assessment).
 *
 * Reference: Bellelli G, Morandi A, Davis DH, et al. Validation of the
 * 4AT, a new instrument for rapid delirium screening: a study in 234
 * hospitalised older people. Age Ageing 2014;43(4):496-502.
 * doi:10.1093/ageing/afu021
 *
 * Components (max 12):
 *   1. Alertness (4 if abnormal)
 *   2. AMT4 — orientation (1-2)
 *   3. Attention — months backward (1-2)
 *   4. Acute change / fluctuation (4 if present)
 *
 * Bands:
 *   0    → delirium / cognitive impairment unlikely
 *   1-3  → possible cognitive impairment (no delirium)
 *   ≥4   → likely delirium ± cognitive impairment
 */
import { describe, it, expect } from 'vitest';
import t4at from '@/lib/runners/4at';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (t4at as { bands: ScoreBand[] }).bands;

describe('4at · bands', () => {
  it('declares 3 bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..12 maps to exactly one band', () => {
    for (let s = 0; s <= 12; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0 alone → unlikely delirium', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/маловероятн/);
  });

  it('score 1-3 → possible cognitive impairment (not delirium)', () => {
    const b = findBand(bands, 1);
    expect(findBand(bands, 3)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/возможно когнит|1-3/);
  });

  it('score ≥4 → likely delirium', () => {
    const b = findBand(bands, 4);
    expect(findBand(bands, 12)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/делирий|≥4|≥ 4/);
  });

  it('boundary 3 vs 4 = clinical decision point', () => {
    expect(findBand(bands, 3)).not.toBe(findBand(bands, 4));
  });
});
