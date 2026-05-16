/**
 * Golden tests for runner 'clavien'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify actual bands
 * data (coverage of every score, no gaps/overlaps, first/last band content).
 * More rigorous than the auto smoke-test which only checks runner shape.
 *
 * Score range: 1..7, 4 bands.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/clavien';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (runner as { bands: ScoreBand[] }).bands;

describe('clavien · bands', () => {
  it('declares 4 band(s)', () => {
    expect(bands).toHaveLength(4);
  });

  it('every score 1..7 maps to exactly one band', () => {
    for (let s = 1; s <= 7; s++) {
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

  it('lowest band (score 1) → label matches "Grade"', () => {
    const b = findBand(bands, 1);
    expect(b.label).toMatch(/Grade/i);
  });

  it('highest band (score 7) → label matches "Grade"', () => {
    const b = findBand(bands, 7);
    expect(b.label).toMatch(/Grade/i);
  });
  it('bands cover full 1..7 range with no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]?.min).toBeLessThanOrEqual(1);
    expect(sorted[sorted.length - 1]?.max).toBeGreaterThanOrEqual(7);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev && cur) {
        expect(cur.min, `band[${i}].min after band[${i - 1}].max`).toBeGreaterThan(prev.max);
      }
    }
  });
});
