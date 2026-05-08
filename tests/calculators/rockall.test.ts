/**
 * Golden tests for Rockall Score (upper GI bleeding mortality).
 *
 * Reference: Rockall TA, Logan RF, Devlin HB, Northfield TC. Risk
 * assessment after acute upper gastrointestinal haemorrhage. Gut
 * 1996;38(3):316-321. doi:10.1136/gut.38.3.316
 *
 * Bands (post-endoscopy, full Rockall, max 11):
 *   0-2 → low risk (~0-3% mortality)         outpatient possible
 *   3-4 → moderate (~5-11%)                  inpatient
 *   5-7 → high (~25-40%)                     ICU consideration
 *
 * Note: Glasgow-Blatchford is preferred for triage (no endoscopy needed).
 */
import { describe, it, expect } from 'vitest';
import rockall from '@/lib/runners/rockall';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (rockall as { bands: ScoreBand[] }).bands;

describe('rockall · bands', () => {
  it('declares 3 risk bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..7 maps to exactly one band', () => {
    for (let s = 0; s <= 7; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('boundary 2 vs 3 (low → moderate)', () => {
    expect(findBand(bands, 2)).not.toBe(findBand(bands, 3));
    expect(findBand(bands, 2).label.toLowerCase()).toMatch(/низкий|0-2/);
  });

  it('boundary 4 vs 5 (moderate → high)', () => {
    expect(findBand(bands, 4)).not.toBe(findBand(bands, 5));
    expect(findBand(bands, 5).label.toLowerCase()).toMatch(/высокий|5-7/);
  });

  it('high-risk band uses warning colour', () => {
    expect(findBand(bands, 5).color.toLowerCase()).toMatch(/^#(e|d|c|b|a|9|8|7)/i);
  });
});
