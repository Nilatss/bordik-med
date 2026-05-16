/**
 * Golden tests for runner 'edacs'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify actual bands
 * data (coverage of every score, no gaps/overlaps, first/last band content).
 * More rigorous than the auto smoke-test which only checks runner shape.
 *
 * Score range: -10..34, 2 bands.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/edacs';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (runner as { bands: ScoreBand[] }).bands;

describe('edacs · bands', () => {
  it('declares 2 band(s)', () => {
    expect(bands).toHaveLength(2);
  });

  it('every score -10..34 maps to exactly one band', () => {
    for (let s = -10; s <= 34; s++) {
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

  it('lowest band (score -10) → label matches "16"', () => {
    const b = findBand(bands, -10);
    expect(b.label).toMatch(/16/i);
  });

  it('highest band (score 34) → label matches "16"', () => {
    const b = findBand(bands, 34);
    expect(b.label).toMatch(/16/i);
  });
  it('bands cover full -10..34 range with no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]?.min).toBeLessThanOrEqual(-10);
    expect(sorted[sorted.length - 1]?.max).toBeGreaterThanOrEqual(34);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev && cur) {
        expect(cur.min, `band[${i}].min after band[${i - 1}].max`).toBeGreaterThan(prev.max);
      }
    }
  });
});
