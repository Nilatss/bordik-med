/**
 * Golden tests for ICH score (intracerebral haemorrhage 30-day mortality).
 *
 * Reference: Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT,
 * Johnston SC. The ICH score: a simple, reliable grading scale for
 * intracerebral hemorrhage. Stroke 2001;32(4):891-897.
 * doi:10.1161/01.STR.32.4.891
 *
 * Components (max 6):
 *   GCS         13-15=0, 5-12=1, 3-4=2
 *   Age ≥80     +1
 *   IVH         +1 (intraventricular extension)
 *   Infratentorial origin +1
 *   Volume ≥30 mL +1 (ABC/2 formula)
 *
 * Mortality (Hemphill 2001 derivation, n=152):
 *   0 → 0%, 1 → 13%, 2 → 26%, 3 → 72%, 4 → 97%, 5-6 → 100%
 */
import { describe, it, expect } from 'vitest';
import ich from '@/lib/runners/ich';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (ich as { bands: ScoreBand[] }).bands;

describe('ich · bands', () => {
  it('declares 6 mortality bands (0-4 each their own + 5-6 grouped)', () => {
    expect(bands.length).toBe(6);
  });

  it('every score 0..6 maps to exactly one band', () => {
    for (let s = 0; s <= 6; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0 → 0% mortality', () => {
    const b = findBand(bands, 0);
    expect(b.description).toMatch(/0%/);
  });

  it('score 1 → 13% mortality (Hemphill 2001)', () => {
    expect(findBand(bands, 1).description).toMatch(/13/);
  });

  it('score 2 → 26%', () => {
    expect(findBand(bands, 2).description).toMatch(/26/);
  });

  it('score 3 → 72%', () => {
    expect(findBand(bands, 3).description).toMatch(/72/);
  });

  it('score 4 → 97%', () => {
    expect(findBand(bands, 4).description).toMatch(/97/);
  });

  it('score 5 and 6 → 100%, share band', () => {
    expect(findBand(bands, 5)).toBe(findBand(bands, 6));
    expect(findBand(bands, 5).description).toMatch(/100/);
  });

  it('mortality monotonically increases', () => {
    // Match "X%" specifically (description contains "30-дн" prefix that
    // would otherwise capture the wrong number).
    const pct = (b: ScoreBand): number => {
      const m = b.description.match(/(\d+)\s*%/);
      return m ? Number(m[1]) : 0;
    };
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(pct(sorted[i]!), `band ${i}`).toBeGreaterThanOrEqual(pct(sorted[i - 1]!));
    }
  });
});
