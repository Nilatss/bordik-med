/**
 * Golden tests for Charlson Comorbidity Index.
 *
 * Reference: Charlson ME, Pompei P, Ales KL, MacKenzie CR. A new method
 * of classifying prognostic comorbidity in longitudinal studies:
 * development and validation. J Chronic Dis 1987;40(5):373-83.
 * doi:10.1016/0021-9681(87)90171-8
 *
 * Bands (10-year survival estimates from derivation cohort):
 *   0       → ~98%    (no significant comorbidity)
 *   1-2     → ~90%    (mild)
 *   3-4     → ~77%    (moderate)
 *   ≥5      → ~21%    (severe)
 */
import { describe, it, expect } from 'vitest';
import charlson from '@/lib/runners/charlson';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (charlson as { bands: ScoreBand[] }).bands;

describe('charlson · bands', () => {
  it('declares 4 bands (0 / 1-2 / 3-4 / ≥5)', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..37 maps to exactly one band', () => {
    for (let s = 0; s <= 37; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0 is its own band (no comorbidity)', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
  });

  it('scores 1-2 share the mild band', () => {
    expect(findBand(bands, 1)).toBe(findBand(bands, 2));
  });

  it('scores 3-4 share the moderate band', () => {
    expect(findBand(bands, 3)).toBe(findBand(bands, 4));
  });

  it('score 5 starts the severe band (≥5)', () => {
    const b = findBand(bands, 5);
    expect(findBand(bands, 10)).toBe(b);
    expect(findBand(bands, 25)).toBe(b);
    expect(b.label).toMatch(/≥ 5|≥5/);
  });

  it('bands cover up to maxScore=37', () => {
    const maxScore = (charlson as { maxScore: number }).maxScore;
    expect(maxScore).toBe(37);
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[sorted.length - 1]!.max).toBe(maxScore);
  });
});
