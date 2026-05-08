/**
 * Golden tests for NIHSS (NIH Stroke Scale).
 *
 * Reference: Brott T, Adams HP Jr, Olinger CP, et al. Measurements of
 * acute cerebral infarction: a clinical examination scale. Stroke 1989;
 * 20(7):864-870. doi:10.1161/01.STR.20.7.864
 *
 * Bands (max 42):
 *   0-4    → minimal      (typically not a candidate for thrombolysis if
 *                          isolated, see AHA/ASA exclusions)
 *   5-15   → moderate     (eligible for IV tPA / thrombectomy work-up)
 *   16-20  → mod-severe
 *   21-42  → severe       (poor outcome, but still treatable acutely)
 *
 * AHA/ASA 2019: NIHSS ≥6 + LVO criteria → mechanical thrombectomy
 * window 0-24h (per DAWN/DEFUSE-3).
 */
import { describe, it, expect } from 'vitest';
import nihss from '@/lib/runners/nihss';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (nihss as { bands: ScoreBand[] }).bands;

describe('nihss · bands', () => {
  it('declares 4 severity bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..42 maps to exactly one band', () => {
    for (let s = 0; s <= 42; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('boundary 4 vs 5 (minimal → moderate)', () => {
    expect(findBand(bands, 4)).not.toBe(findBand(bands, 5));
    expect(findBand(bands, 4).label.toLowerCase()).toMatch(/минимал|0-4/);
  });

  it('boundary 15 vs 16 (moderate → mod-severe)', () => {
    expect(findBand(bands, 15)).not.toBe(findBand(bands, 16));
  });

  it('boundary 20 vs 21 (mod-severe → severe)', () => {
    expect(findBand(bands, 20)).not.toBe(findBand(bands, 21));
    expect(findBand(bands, 21).label.toLowerCase()).toMatch(/тяжёл|21-42/);
  });

  it('top band covers up to maxScore=42', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[sorted.length - 1]!.max).toBe(42);
  });

  it('bands have no gaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min).toBe(sorted[i - 1]!.max + 1);
    }
  });
});
