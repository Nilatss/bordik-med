/**
 * Golden tests for Wong-Baker FACES Pain Rating Scale.
 *
 * Reference: Wong DL, Baker CM. Pain in children: comparison of
 * assessment scales. J Pediatr Nurs 1988;3(1):17-28.
 *
 * 6 face icons mapping to 0-2-4-6-8-10:
 *   0  no hurt
 *   2  hurts little bit
 *   4  hurts little more
 *   6  hurts even more
 *   8  hurts whole lot
 *   10 hurts worst
 *
 * Bands (clinical pain management):
 *   0    → no pain
 *   1-3  → mild discomfort
 *   4-6  → moderate
 *   7-10 → severe → escalate analgesia
 */
import { describe, it, expect } from 'vitest';
import wb from '@/lib/runners/wong-baker';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (wb as { bands: ScoreBand[] }).bands;

describe('wong-baker · bands', () => {
  it('declares 4 pain bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..10 maps to exactly one band', () => {
    for (let s = 0; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0 → no pain', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/нет боли/);
  });

  it('score 1-3 → mild', () => {
    const b = findBand(bands, 1);
    expect(findBand(bands, 3)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/лёгкая/);
  });

  it('score 4-6 → moderate', () => {
    const b = findBand(bands, 4);
    expect(findBand(bands, 6)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/умеренная|4-6/);
  });

  it('score 7-10 → severe', () => {
    const b = findBand(bands, 7);
    expect(findBand(bands, 10)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/сильная|8-10/);
  });

  it('boundaries 0/1, 3/4, 6/7 all separate distinct bands', () => {
    expect(findBand(bands, 0)).not.toBe(findBand(bands, 1));
    expect(findBand(bands, 3)).not.toBe(findBand(bands, 4));
    expect(findBand(bands, 6)).not.toBe(findBand(bands, 7));
  });
});
