/**
 * Golden tests for PERC rule (Pulmonary Embolism Rule-out Criteria).
 *
 * Reference: Kline JA, Mitchell AM, Kabrhel C, Richman PB, Courtney DM.
 * Clinical criteria to prevent unnecessary diagnostic testing in
 * emergency department patients with suspected pulmonary embolism.
 * J Thromb Haemost 2004;2(8):1247-1255.
 * doi:10.1111/j.1538-7836.2004.00790.x
 *
 * Application: only in low-clinical-probability patients (Wells <2 or
 * Geneva ≤3). All 8 must be NEGATIVE to rule out PE without D-dimer.
 *
 * Bands:
 *   0    → PERC-negative; no D-dimer needed (NPV ~99% in low-risk)
 *   ≥1   → PERC-positive; proceed to D-dimer / CTPA
 */
import { describe, it, expect } from 'vitest';
import perc from '@/lib/runners/perc';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (perc as { bands: ScoreBand[] }).bands;

describe('perc · bands', () => {
  it('declares 2 bands at zero/non-zero threshold', () => {
    expect(bands.length).toBe(2);
  });

  it('score 0 → PERC-negative, no further testing needed', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/perc.*−|−|отрицат/);
    expect(b.color).toMatch(/^#22|^#10/i); // green
  });

  it('score ≥1 → PERC-positive', () => {
    const b = findBand(bands, 1);
    expect(b.label.toLowerCase()).toMatch(/perc.*\+|≥/);
    expect(findBand(bands, 8)).toBe(b);
  });

  it('every score 0..8 maps to exactly one band', () => {
    for (let s = 0; s <= 8; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });
});
