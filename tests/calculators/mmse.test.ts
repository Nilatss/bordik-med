/**
 * Golden tests for MMSE (Mini-Mental State Examination).
 *
 * Reference: Folstein MF, Folstein SE, McHugh PR. "Mini-mental state". A
 * practical method for grading the cognitive state of patients for the
 * clinician. J Psychiatr Res 1975;12(3):189-198.
 *
 * Bands (max 30, education-adjusted in original):
 *   ≤17    → severe dementia
 *   18-23  → moderate
 *   24-26  → mild / MCI suspect
 *   27-30  → normal
 */
import { describe, it, expect } from 'vitest';
import mmse from '@/lib/runners/mmse';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (mmse as { bands: ScoreBand[] }).bands;

describe('mmse · bands', () => {
  it('declares 4 severity bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..30 maps to exactly one band', () => {
    for (let s = 0; s <= 30; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('low score (≤17) → severe dementia', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/тяжёл|severe/);
    expect(findBand(bands, 17)).toBe(findBand(bands, 0));
  });

  it('27-30 → normal', () => {
    expect(findBand(bands, 30).label.toLowerCase()).toMatch(/норма/);
    expect(findBand(bands, 27)).toBe(findBand(bands, 30));
  });

  it('boundary 23 vs 24 (moderate vs mild)', () => {
    expect(findBand(bands, 23)).not.toBe(findBand(bands, 24));
  });

  it('boundary 26 vs 27 (mild vs normal)', () => {
    expect(findBand(bands, 26)).not.toBe(findBand(bands, 27));
  });

  it('higher scores have better colour (green) than lower', () => {
    // Normal is typically green/safe; severe is red/dark
    const normal = findBand(bands, 30);
    const severe = findBand(bands, 0);
    expect(normal.color).not.toBe(severe.color);
  });
});
