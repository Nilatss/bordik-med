/**
 * Golden tests for PHQ-9 (Patient Health Questionnaire-9, depression).
 *
 * Reference: Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of
 * a brief depression severity measure. J Gen Intern Med 2001;16(9):
 * 606-13. doi:10.1046/j.1525-1497.2001.016009606.x
 *
 * Bands (severity, max 27):
 *   0-4    → none/minimal
 *   5-9    → mild
 *   10-14  → moderate           ← treatment threshold
 *   15-19  → moderately severe
 *   20-27  → severe
 *
 * Cut-off ≥10 = ~88% sensitivity / 88% specificity for major depressive
 * disorder.
 */
import { describe, it, expect } from 'vitest';
import phq9 from '@/lib/runners/phq9';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (phq9 as { bands: ScoreBand[] }).bands;

describe('phq9 · bands', () => {
  it('declares 5 severity bands', () => {
    expect(bands.length).toBe(5);
  });

  it('every score 0..27 maps to exactly one band', () => {
    for (let s = 0; s <= 27; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 9 vs 10 boundary (treatment threshold)', () => {
    const b9 = findBand(bands, 9);
    const b10 = findBand(bands, 10);
    expect(b9).not.toBe(b10);
    expect(b10.label).toMatch(/умеренная|10-14/i);
  });

  it('top band 20-27 is "severe"', () => {
    const b = findBand(bands, 20);
    expect(findBand(bands, 27)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/тяжёл/);
  });

  it('bottom band 0-4 — minimal/no depression', () => {
    const b = findBand(bands, 0);
    expect(findBand(bands, 4)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/минимал|нет/);
  });

  it('bands cover up to maxScore=27', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(0);
    expect(sorted[sorted.length - 1]!.max).toBe(27);
  });
});
