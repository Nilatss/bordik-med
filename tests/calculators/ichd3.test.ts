/**
 * Golden tests for runner 'ichd3'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify actual bands
 * data (coverage of every score, no gaps/overlaps, first/last band content).
 * More rigorous than the auto smoke-test which only checks runner shape.
 *
 * Score range: 1..6, 6 bands.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/ichd3';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (runner as { bands: ScoreBand[] }).bands;

describe('ichd3 · bands', () => {
  it('declares 6 band(s)', () => {
    expect(bands).toHaveLength(6);
  });

  it('every score 1..6 maps to exactly one band', () => {
    for (let s = 1; s <= 6; s++) {
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

  it('lowest band (score 1) → label matches "1\.1"', () => {
    const b = findBand(bands, 1);
    expect(b.label).toMatch(/1\.1/i);
  });

  it('highest band (score 6) → label matches "5\."', () => {
    const b = findBand(bands, 6);
    expect(b.label).toMatch(/5\./i);
  });
  it('bands cover full 1..6 range with no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]?.min).toBeLessThanOrEqual(1);
    expect(sorted[sorted.length - 1]?.max).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev && cur) {
        expect(cur.min, `band[${i}].min after band[${i - 1}].max`).toBeGreaterThan(prev.max);
      }
    }
  });
});
