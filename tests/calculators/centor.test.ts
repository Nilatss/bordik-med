/**
 * Golden tests for Centor / McIsaac criteria (group A strep pharyngitis).
 *
 * Reference: Centor RM, Witherspoon JM, Dalton HP, Brody CE, Link K. The
 * diagnosis of strep throat in adults in the emergency room. Med Decis
 * Making 1981;1(3):239-46. McIsaac modification adds an age criterion.
 * IDSA 2012 / ESCMID 2012 guidelines anchor management thresholds.
 *
 * Bands (likelihood of GAS pharyngitis, IDSA management):
 *   ≤0   → ~1%      no testing, no antibiotics
 *   1    → 5-10%    no testing, no antibiotics
 *   2    → 11-17%   RADT / culture
 *   3    → 28-35%   test or empirical antibiotics
 *   ≥4   → 51-53%   empirical antibiotics
 *
 * Note: McIsaac adjustment can return -1 (age >45 subtracts a point), so
 * the lowest band starts at -1.
 */
import { describe, it, expect } from 'vitest';
import centor from '@/lib/runners/centor';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (centor as { bands: ScoreBand[] }).bands;

describe('centor · bands', () => {
  it('declares 5 bands (-1..0, 1, 2, 3, ≥4)', () => {
    expect(bands.length).toBe(5);
  });

  it('every score -1..5 maps to exactly one band', () => {
    for (let s = -1; s <= 5; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('lowest band starts at -1 (McIsaac age adjustment can subtract)', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(-1);
  });

  it('score ≤0 → no testing / no antibiotics', () => {
    for (const s of [-1, 0]) {
      const b = findBand(bands, s);
      expect(b.description.toLowerCase()).toMatch(/не нужн|нет показ|no antib/);
    }
  });

  it('intermediate scores (2-3) suggest RADT/test', () => {
    for (const s of [2, 3]) {
      const b = findBand(bands, s);
      expect(b.description.toLowerCase()).toMatch(/тест|radt|streptoc/);
    }
  });

  it('score ≥4 → empirical antibiotics', () => {
    for (const s of [4, 5]) {
      const b = findBand(bands, s);
      expect(b.description.toLowerCase()).toMatch(/эмпирич|антибиот|аб/);
    }
  });

  it('GAS likelihood monotonically increases with score', () => {
    const pct = (b: ScoreBand): number => {
      const m = b.description.match(/(\d+)/);
      return m ? Number(m[1]) : 0;
    };
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(pct(sorted[i]!)).toBeGreaterThanOrEqual(pct(sorted[i - 1]!));
    }
  });
});
