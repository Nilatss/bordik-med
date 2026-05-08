/**
 * Golden tests for Khorana Score (cancer-associated VTE risk in
 * outpatients receiving systemic chemotherapy).
 *
 * Reference: Khorana AA, Kuderer NM, Culakova E, Lyman GH, Francis CW.
 * Development and validation of a predictive model for chemotherapy-
 * associated thrombosis. Blood 2008;111(10):4902-4907.
 * doi:10.1182/blood-2007-10-116327
 *
 * Bands (CASSINI 2019 / AVERT 2019 trials anchor prophylaxis):
 *   0     → low (~0.3% 6-month VTE)         no prophylaxis
 *   1-2   → intermediate (~2%)              consider apixaban / rivaroxaban
 *   ≥3    → high (~7%)                       prophylactic DOAC strongly considered
 *
 * ASCO 2020 / ITAC 2022 guidelines: outpatient prophylaxis at Khorana ≥2
 * (lowered from ≥3) when bleed risk acceptable.
 */
import { describe, it, expect } from 'vitest';
import khorana from '@/lib/runners/khorana';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (khorana as { bands: ScoreBand[] }).bands;

describe('khorana · bands', () => {
  it('declares 3 risk bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..7 maps to exactly one band', () => {
    for (let s = 0; s <= 7; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0 → low risk', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/низк|0/);
  });

  it('scores 1-2 → intermediate', () => {
    expect(findBand(bands, 1)).toBe(findBand(bands, 2));
    expect(findBand(bands, 1).label.toLowerCase()).toMatch(/промежуточн|1-2/);
  });

  it('score ≥3 → high', () => {
    const b = findBand(bands, 3);
    expect(findBand(bands, 7)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/высокий|≥ 3|≥3/);
  });
});
