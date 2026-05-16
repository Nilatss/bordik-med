/**
 * Golden tests for runner 'mews'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify actual bands
 * data (coverage of every score, no gaps/overlaps, first/last band content).
 * More rigorous than the auto smoke-test which only checks runner shape.
 *
 * Score range: 0..14, 3 bands.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/mews';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (runner as { bands: ScoreBand[] }).bands;

describe('mews · bands', () => {
  it('declares 3 band(s)', () => {
    expect(bands).toHaveLength(3);
  });

  it('every score 0..14 maps to exactly one band', () => {
    for (let s = 0; s <= 14; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('bands have non-empty labels + descriptions', () => {
    for (const b of bands) {
      expect(b.label, `band ${b.min}-${b.max} label`).toBeTruthy();
      expect(b.description, `band ${b.min}-${b.max} description`).toBeTruthy();
    }
  });

  it('lowest band (score 0) → label matches "0"', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/0/i);
  });

  it('highest band (score 14) → label matches "5"', () => {
    const b = findBand(bands, 14);
    expect(b.label).toMatch(/5/i);
  });
  it('bands cover full 0..14 range with no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]?.min).toBeLessThanOrEqual(0);
    expect(sorted[sorted.length - 1]?.max).toBeGreaterThanOrEqual(14);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev && cur) {
        expect(cur.min, `band[${i}].min after band[${i - 1}].max`).toBeGreaterThan(prev.max);
      }
    }
  });
});
