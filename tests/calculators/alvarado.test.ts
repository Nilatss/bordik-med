/**
 * Golden tests for Alvarado Score (acute appendicitis).
 *
 * Reference: Alvarado A. A practical score for the early diagnosis of
 * acute appendicitis. Ann Emerg Med 1986;15(5):557-564.
 * doi:10.1016/s0196-0644(86)80993-3
 *
 * Mnemonic MANTRELS (8 items, max 10):
 *   M — Migration of pain (RLQ)
 *   A — Anorexia
 *   N — Nausea/vomiting
 *   T — Tenderness in RLQ            (2 pts)
 *   R — Rebound pain
 *   E — Elevated temperature
 *   L — Leucocytosis                 (2 pts)
 *   S — Shift to left of WBC
 *
 * Bands:
 *   0-4   → low (rule out, observe)
 *   5-6   → possible (CT or admit-observe)
 *   7-8   → probable (surgical consult)
 *   9-10  → high (immediate appendectomy)
 */
import { describe, it, expect } from 'vitest';
import alvarado from '@/lib/runners/alvarado';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (alvarado as { bands: ScoreBand[] }).bands;

describe('alvarado · bands', () => {
  it('declares 4 probability bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..10 maps to exactly one band', () => {
    for (let s = 0; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('boundary 4 vs 5 (low → possible)', () => {
    expect(findBand(bands, 4)).not.toBe(findBand(bands, 5));
    expect(findBand(bands, 5).label.toLowerCase()).toMatch(/возможн|5-6/);
  });

  it('boundary 6 vs 7 (possible → probable)', () => {
    expect(findBand(bands, 6)).not.toBe(findBand(bands, 7));
    expect(findBand(bands, 7).label.toLowerCase()).toMatch(/вероятн|7-8/);
  });

  it('boundary 8 vs 9 (probable → high)', () => {
    expect(findBand(bands, 8)).not.toBe(findBand(bands, 9));
    expect(findBand(bands, 9).label.toLowerCase()).toMatch(/высокая|9-10/);
  });

  it('top band covers up to 10 (max possible)', () => {
    expect(findBand(bands, 10).max).toBe(10);
  });
});
