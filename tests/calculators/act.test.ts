/**
 * Golden tests for runner 'act'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify actual bands
 * data (coverage of every score, no gaps/overlaps, first/last band content).
 * More rigorous than the auto smoke-test which only checks runner shape.
 *
 * Score range: 5..25, 3 bands.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/act';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (runner as { bands: ScoreBand[] }).bands;

describe('act · bands', () => {
  it('declares 3 band(s)', () => {
    expect(bands).toHaveLength(3);
  });

  it('every score 5..25 maps to exactly one band', () => {
    for (let s = 5; s <= 25; s++) {
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

  it('lowest band (score 5) → label matches "5"', () => {
    const b = findBand(bands, 5);
    expect(b.label).toMatch(/5/i);
  });

  it('highest band (score 25) → label matches "20"', () => {
    const b = findBand(bands, 25);
    expect(b.label).toMatch(/20/i);
  });
  it('bands cover full 5..25 range with no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]?.min).toBeLessThanOrEqual(5);
    expect(sorted[sorted.length - 1]?.max).toBeGreaterThanOrEqual(25);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev && cur) {
        expect(cur.min, `band[${i}].min after band[${i - 1}].max`).toBeGreaterThan(prev.max);
      }
    }
  });
});
