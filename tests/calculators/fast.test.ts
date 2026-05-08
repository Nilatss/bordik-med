/**
 * Golden tests for FAST stroke screening (Face/Arms/Speech/Time).
 *
 * Reference: Harbison J, Hossain O, Jenkinson D, Davis J, Louw SJ, Ford
 * GA. Diagnostic accuracy of stroke referrals from primary care,
 * emergency room physicians, and ambulance staff using the face arm
 * speech test. Stroke 2003;34(1):71-76. doi:10.1161/01.STR.0000044170.46643.5E
 *
 * Bands:
 *   0    → no signs       → consider mimics, observe / educate
 *   ≥1   → ≥1 sign        → stroke pathway, time-critical
 */
import { describe, it, expect } from 'vitest';
import fast from '@/lib/runners/fast';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (fast as { bands: ScoreBand[] }).bands;

describe('fast · bands', () => {
  it('declares 2 bands at threshold of 1', () => {
    expect(bands.length).toBe(2);
  });

  it('score 0 → no signs', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/нет признак/);
  });

  it('score ≥1 → ≥1 sign present', () => {
    const b = findBand(bands, 1);
    expect(findBand(bands, 6)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/≥1|≥ 1|признак/);
  });

  it('boundary 0 vs 1 = stroke pathway trigger', () => {
    expect(findBand(bands, 0)).not.toBe(findBand(bands, 1));
  });
});
