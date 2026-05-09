/**
 * Golden tests for HAM-A (Hamilton Anxiety Rating Scale).
 *
 * Reference: Hamilton M. The assessment of anxiety states by rating.
 * Br J Med Psychol 1959;32(1):50-55.
 * doi:10.1111/j.2044-8341.1959.tb00467.x
 *
 * 14 items × 0-4 = max 56.
 *
 * Bands:
 *   <8     → no anxiety / normal
 *   8-17   → mild
 *   18-24  → moderate
 *   ≥25    → severe
 */
import { describe, it, expect } from 'vitest';
import hama from '@/lib/runners/ham-a';

interface HamAResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
}

function compute(total: number): HamAResult {
  const r = (hama.compute as (i: { total: number }) => unknown)({ total });
  return r as HamAResult;
}

describe('ham-a · severity bands', () => {
  it('total 0 → normal', () => {
    const r = compute(0);
    expect(r.color).toMatch(/^#22/i); // green
    expect(r.interpretation.toLowerCase()).toMatch(/норм|< ?8/);
  });

  it('total 7 → still normal (boundary)', () => {
    const r = compute(7);
    expect(r.interpretation.toLowerCase()).toMatch(/норм|< ?8/);
  });

  it('total 8 → mild boundary', () => {
    const r = compute(8);
    expect(r.interpretation.toLowerCase()).toMatch(/лёгкая|8-17/);
  });

  it('total 17 → still mild', () => {
    const r = compute(17);
    expect(r.interpretation.toLowerCase()).toMatch(/лёгкая|8-17/);
  });

  it('total 18 → moderate boundary', () => {
    const r = compute(18);
    expect(r.interpretation.toLowerCase()).toMatch(/средняя|18-24/);
  });

  it('total 25 → severe', () => {
    const r = compute(25);
    expect(r.interpretation.toLowerCase()).toMatch(/тяжёлая|≥ ?25/);
    expect(r.color.toLowerCase()).toMatch(/^#(7|8|9|a|b|c|d|e)/i);
  });

  it('total 56 → max severe', () => {
    const r = compute(56);
    expect(r.interpretation.toLowerCase()).toMatch(/тяжёлая/);
  });
});
