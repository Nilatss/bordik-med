/**
 * Golden tests for GAD-7 (Generalised Anxiety Disorder, 7-item).
 *
 * Reference: Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure
 * for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med
 * 2006;166(10):1092-1097. doi:10.1001/archinte.166.10.1092
 *
 * Bands (severity, max 21):
 *   0-4   → minimal
 *   5-9   → mild
 *   10-14 → moderate     ← treatment threshold
 *   15-21 → severe
 *
 * Cut-off ≥10 = ~89% sensitivity / 82% specificity for GAD.
 */
import { describe, it, expect } from 'vitest';
import gad7 from '@/lib/runners/gad7';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (gad7 as { bands: ScoreBand[] }).bands;

describe('gad7 · bands', () => {
  it('declares 4 severity bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..21 maps to exactly one band', () => {
    for (let s = 0; s <= 21; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 9 vs 10 boundary (treatment threshold)', () => {
    expect(findBand(bands, 9)).not.toBe(findBand(bands, 10));
    expect(findBand(bands, 10).label).toMatch(/умеренная|10-14/i);
  });

  it('bottom band 0-4 — minimal anxiety', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/минимальная|0-4/);
  });

  it('top band 15-21 — severe', () => {
    expect(findBand(bands, 21).label.toLowerCase()).toMatch(/тяжёл/);
  });

  it('bands cover up to maxScore=21', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[sorted.length - 1]!.max).toBe(21);
  });
});
