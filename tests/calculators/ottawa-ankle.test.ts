/**
 * Golden tests for Ottawa Ankle Rules.
 *
 * Reference: Stiell IG, Greenberg GH, McKnight RD, et al. A study to
 * develop clinical decision rules for the use of radiography in acute
 * ankle injuries. Ann Emerg Med 1992;21(4):384-390.
 * doi:10.1016/s0196-0644(05)82656-3
 *
 * Sensitivity ~98% for fractures; reduces ankle X-ray rate ~30-40%.
 *
 * Bands:
 *   0    → no criteria → no X-ray
 *   ≥1   → at least one criterion → X-ray indicated
 */
import { describe, it, expect } from 'vitest';
import ottawaAnkle from '@/lib/runners/ottawa-ankle';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (ottawaAnkle as { bands: ScoreBand[] }).bands;

describe('ottawa-ankle · bands', () => {
  it('declares 2 bands (no-criteria / ≥1)', () => {
    expect(bands.length).toBe(2);
  });

  it('score 0 → no X-ray', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/нет критериев/);
  });

  it('score ≥1 → X-ray indicated', () => {
    const b = findBand(bands, 1);
    expect(findBand(bands, 4)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/≥1|≥ 1|≥1 критерий/);
  });

  it('every score 0..4 maps to exactly one band', () => {
    for (let s = 0; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });
});
