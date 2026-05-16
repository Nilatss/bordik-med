/**
 * Golden tests for runner 'ballard'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify actual bands
 * data (coverage of every score, no gaps/overlaps, first/last band content).
 * More rigorous than the auto smoke-test which only checks runner shape.
 *
 * Score range: -10..50, 5 bands.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/ballard';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (runner as { bands: ScoreBand[] }).bands;

describe('ballard · bands', () => {
  it('declares 5 band(s)', () => {
    expect(bands).toHaveLength(5);
  });

  it('every score -10..50 maps to exactly one band', () => {
    for (let s = -10; s <= 50; s++) {
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

  it('lowest band (score -10) → label matches "5"', () => {
    const b = findBand(bands, -10);
    expect(b.label).toMatch(/5/i);
  });

  it('highest band (score 60) → label matches "44"', () => {
    const b = findBand(bands, 60);
    expect(b.label).toMatch(/44/i);
  });
  it('bands cover full -10..50 range with no overlaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]?.min).toBeLessThanOrEqual(-10);
    expect(sorted[sorted.length - 1]?.max).toBeGreaterThanOrEqual(50);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev && cur) {
        expect(cur.min, `band[${i}].min after band[${i - 1}].max`).toBeGreaterThan(prev.max);
      }
    }
  });
});
