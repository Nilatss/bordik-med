/**
 * Golden tests for CURB-65 (community-acquired pneumonia mortality).
 *
 * Reference: Lim WS et al. Thorax 2003;58:377-382.
 *
 * Score 0-5. Each component (Confusion, Urea > 7, RR ≥ 30, BP < 90/60,
 * age ≥ 65) adds 1 point. Three-tier bands:
 *   0-1 → low mortality (<3%) — outpatient
 *   2   → moderate (~9%) — consider admission
 *   3-5 → high (15-40%) — admission, ICU at 4-5
 */
import { describe, it, expect } from 'vitest';
import curb from '@/lib/runners/curb65';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (curb as { bands: ScoreBand[] }).bands;

describe('curb65 · bands', () => {
  it('every score 0..5 maps to exactly one band', () => {
    for (let s = 0; s <= 5; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('CURB-65 0 → low band, mentions outpatient management', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/0-?1/);
    expect(b.description.toLowerCase()).toMatch(/амбулатор|outpatient|<\s*3/);
  });

  it('CURB-65 2 → moderate band, mentions hospitalization decision', () => {
    const b = findBand(bands, 2);
    expect(b.label).toMatch(/2/);
    expect(b.description.toLowerCase()).toMatch(/госпитализ|admission|средн|moderate/);
  });

  it('CURB-65 3-5 → high band, mentions ICU at upper end', () => {
    const b3 = findBand(bands, 3);
    const b5 = findBand(bands, 5);
    expect(b3.label).toBe(b5.label); // 3, 4, 5 all in same band
    const text = `${b3.description} ${b3.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/icu|госпитализ/);
  });
});
