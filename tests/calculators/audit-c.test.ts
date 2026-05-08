/**
 * Golden tests for AUDIT-C (alcohol use screening, 3-item).
 *
 * Reference: Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. The
 * AUDIT alcohol consumption questions (AUDIT-C): an effective brief
 * screening test for problem drinking. Arch Intern Med 1998;158(16):
 * 1789-95. doi:10.1001/archinte.158.16.1789
 *
 * Bands (sex-specific cutoffs):
 *   0-2          → low risk (most patients)
 *   ≥3 (women)   → positive screen for unhealthy drinking
 *   ≥4 (men)     → positive screen for unhealthy drinking
 *   ≥5           → likely AUD, brief intervention
 */
import { describe, it, expect } from 'vitest';
import auditC from '@/lib/runners/audit-c';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (auditC as { bands: ScoreBand[] }).bands;

describe('audit-c · bands', () => {
  it('declares 3 bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..12 maps to exactly one band', () => {
    for (let s = 0; s <= 12; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0..2 → low risk', () => {
    for (const s of [0, 1, 2]) {
      const b = findBand(bands, s);
      expect(b.label.toLowerCase()).toMatch(/0-2|низк/);
    }
  });

  it('score 3-4 carries sex-specific guidance', () => {
    const b = findBand(bands, 3);
    // Same band for 3 and 4 per declared range
    expect(findBand(bands, 4)).toBe(b);
    expect(b.label).toMatch(/3 Ж|4 М|3-4/i);
  });

  it('score ≥5 → likely AUD / brief intervention', () => {
    const b = findBand(bands, 5);
    expect(findBand(bands, 12)).toBe(b);
    expect(b.label).toMatch(/≥5|5/);
  });

  it('bands are non-overlapping', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min).toBeGreaterThan(sorted[i - 1]!.max);
    }
  });
});
