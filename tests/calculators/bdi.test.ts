/**
 * Golden tests for BDI-II (Beck Depression Inventory).
 *
 * Reference: Beck AT, Steer RA, Brown GK. Manual for the Beck Depression
 * Inventory–II. San Antonio, TX: Psychological Corporation; 1996.
 *
 * 21 items × 0-3 = max 63.
 *
 * Bands (BDI-II):
 *   0-13   → minimal
 *   14-19  → mild
 *   20-28  → moderate
 *   29-63  → severe
 */
import { describe, it, expect } from 'vitest';
import bdi from '@/lib/runners/bdi';

interface BdiResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
}

function compute(total: number): BdiResult {
  const r = (bdi.compute as (i: { total: number }) => unknown)({ total });
  return r as BdiResult;
}

describe('bdi · severity bands', () => {
  it('total 0 → minimal', () => {
    const r = compute(0);
    expect(r.interpretation.toLowerCase()).toMatch(/минимальная|0-13/);
    expect(r.color).toMatch(/^#22/i);
  });

  it('boundary 13 vs 14 (minimal → mild)', () => {
    const a = compute(13);
    const b = compute(14);
    expect(a.interpretation).not.toBe(b.interpretation);
    expect(b.interpretation.toLowerCase()).toMatch(/лёгкая|14-19/);
  });

  it('boundary 19 vs 20 (mild → moderate)', () => {
    const a = compute(19);
    const b = compute(20);
    expect(a.interpretation).not.toBe(b.interpretation);
    expect(b.interpretation.toLowerCase()).toMatch(/умеренная|20-28/);
  });

  it('boundary 28 vs 29 (moderate → severe)', () => {
    const a = compute(28);
    const b = compute(29);
    expect(a.interpretation).not.toBe(b.interpretation);
    expect(b.interpretation.toLowerCase()).toMatch(/тяжёлая|29-63/);
  });

  it('total 63 → max severe', () => {
    const r = compute(63);
    expect(r.interpretation.toLowerCase()).toMatch(/тяжёлая/);
  });
});
