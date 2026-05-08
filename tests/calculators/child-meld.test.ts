/**
 * Golden tests for Child-Pugh classification (cirrhosis prognosis).
 *
 * Reference: Pugh RN, Murray-Lyon IM, Dawson JL, Pietroni MC, Williams R.
 * Transection of the oesophagus for bleeding oesophageal varices. Br J
 * Surg 1973;60(8):646-649. doi:10.1002/bjs.1800600817
 *
 * 5 components × 1-3 (max 15):
 *   ascites / encephalopathy / bilirubin / albumin / INR
 *
 * Bands (1-yr / 2-yr survival):
 *   A (5-6)   → 100% / 85%
 *   B (7-9)   →  80% / 60%
 *   C (10-15) →  45% / 35%
 */
import { describe, it, expect } from 'vitest';
import cm from '@/lib/runners/child-meld';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (cm as { bands: ScoreBand[] }).bands;

describe('child-meld · bands', () => {
  it('declares 3 prognosis classes', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 5..15 maps to exactly one band', () => {
    for (let s = 5; s <= 15; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('starts at min=5 (1×5 = lowest possible)', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(5);
  });

  it('Class A 5-6 — best prognosis', () => {
    expect(findBand(bands, 5).label).toMatch(/A/);
    expect(findBand(bands, 6)).toBe(findBand(bands, 5));
  });

  it('Class B 7-9 — intermediate', () => {
    const b = findBand(bands, 7);
    expect(b.label).toMatch(/B/);
    expect(findBand(bands, 9)).toBe(b);
  });

  it('Class C 10-15 — worst', () => {
    const b = findBand(bands, 10);
    expect(findBand(bands, 15)).toBe(b);
    expect(b.label).toMatch(/C/);
  });

  it('boundaries 6/7 and 9/10 separate classes', () => {
    expect(findBand(bands, 6)).not.toBe(findBand(bands, 7));
    expect(findBand(bands, 9)).not.toBe(findBand(bands, 10));
  });
});
