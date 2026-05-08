/**
 * Golden tests for Modified Aldrete Score (PACU discharge readiness).
 *
 * Reference: Aldrete JA. The post-anesthesia recovery score revisited.
 * J Clin Anesth 1995;7(1):89-91. doi:10.1016/0952-8180(94)00001-K
 *
 * 5 domains × 0-2 (max 10):
 *   activity / respiration / circulation / consciousness / SpO₂
 *
 * Bands:
 *   0-5  → not ready (intensive PACU monitoring)
 *   6-8  → transitional (continue PACU)
 *   9-10 → discharge-ready
 */
import { describe, it, expect } from 'vitest';
import aldrete from '@/lib/runners/aldrete';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (aldrete as { bands: ScoreBand[] }).bands;

describe('aldrete · bands', () => {
  it('declares 3 readiness bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..10 maps to exactly one band', () => {
    for (let s = 0; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0..5 → not ready (intensive monitoring)', () => {
    expect(findBand(bands, 0).label).toBe('0-5');
    expect(findBand(bands, 5)).toBe(findBand(bands, 0));
  });

  it('score 9-10 → discharge-ready', () => {
    const b = findBand(bands, 9);
    expect(findBand(bands, 10)).toBe(b);
    expect(b.label).toBe('9-10');
    expect(b.color).toMatch(/^#22|^#10/i); // green
  });

  it('boundaries 5/6 and 8/9', () => {
    expect(findBand(bands, 5)).not.toBe(findBand(bands, 6));
    expect(findBand(bands, 8)).not.toBe(findBand(bands, 9));
  });
});
