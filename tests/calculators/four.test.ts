/**
 * Golden tests for FOUR Score (Full Outline of UnResponsiveness).
 *
 * Reference: Wijdicks EFM, Bamlet WR, Maramattom BV, Manno EM, McClelland
 * RL. Validation of a new coma scale: the FOUR score. Ann Neurol
 * 2005;58(4):585-93. doi:10.1002/ana.20611
 *
 * Designed as alternative to GCS for ICU/ventilated patients (no verbal
 * subscale, adds eye opening, motor, brainstem reflexes, respiration).
 *
 * Bands (in-hospital mortality, derivation cohort):
 *   0-3   → very severe (~80%)
 *   4-7   → severe (~50%)
 *   8-11  → moderate (~25%)
 *   12-14 → mild (~10%)
 *   15-16 → conscious (~5%)
 *
 * Score = E (0-4) + M (0-4) + B (0-4) + R (0-4); max 16.
 */
import { describe, it, expect } from 'vitest';
import four from '@/lib/runners/four';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (four as { bands: ScoreBand[] }).bands;

describe('four · bands', () => {
  it('declares 5 severity bands', () => {
    expect(bands.length).toBe(5);
  });

  it('every score 0..16 maps to exactly one band', () => {
    for (let s = 0; s <= 16; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('lowest band 0-3 → very severe', () => {
    const b = findBand(bands, 0);
    expect(findBand(bands, 3)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/очень тяжёлое|0-3/);
  });

  it('top band 15-16 → conscious', () => {
    const b = findBand(bands, 16);
    expect(findBand(bands, 15)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/в сознании|15-16/);
  });

  it('boundaries between adjacent bands distinct', () => {
    const transitions = [[3, 4], [7, 8], [11, 12], [14, 15]];
    for (const [a, b] of transitions) {
      expect(findBand(bands, a as number), `boundary ${a}/${b}`).not.toBe(findBand(bands, b as number));
    }
  });

  it('bands have no gaps; cover up to maxScore=16', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(0);
    expect(sorted[sorted.length - 1]!.max).toBe(16);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min).toBe(sorted[i - 1]!.max + 1);
    }
  });
});
