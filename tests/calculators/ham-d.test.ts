/**
 * Golden tests for HAM-D (Hamilton Depression Rating Scale, 17-item).
 *
 * Reference: Hamilton M. A rating scale for depression. J Neurol
 * Neurosurg Psychiatry 1960;23(1):56-62. doi:10.1136/jnnp.23.1.56
 *
 * 17 items × 0-4 = max 52 (commonly reported up to 23+ as "very severe").
 *
 * Bands:
 *   0-7    → remission
 *   8-13   → mild depression
 *   14-18  → moderate
 *   19-22  → severe
 *   ≥23    → very severe
 */
import { describe, it, expect } from 'vitest';
import hamd from '@/lib/runners/ham-d';

interface HamDResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
}

function compute(total: number): HamDResult {
  const r = (hamd.compute as (i: { total: number }) => unknown)({ total });
  return r as HamDResult;
}

describe('ham-d · severity bands', () => {
  it('total 0 → remission', () => {
    const r = compute(0);
    expect(r.interpretation.toLowerCase()).toMatch(/ремисси|0-7/);
    expect(r.color).toMatch(/^#22/i);
  });

  it('boundary 7 vs 8 (remission → mild)', () => {
    const a = compute(7);
    const b = compute(8);
    expect(a.interpretation).not.toBe(b.interpretation);
    expect(b.interpretation.toLowerCase()).toMatch(/лёгкая|8-13/);
  });

  it('boundary 13 vs 14 (mild → moderate)', () => {
    const a = compute(13);
    const b = compute(14);
    expect(a.interpretation).not.toBe(b.interpretation);
    expect(b.interpretation.toLowerCase()).toMatch(/умеренная|14-18/);
  });

  it('boundary 18 vs 19 (moderate → severe)', () => {
    const a = compute(18);
    const b = compute(19);
    expect(a.interpretation).not.toBe(b.interpretation);
    expect(b.interpretation.toLowerCase()).toMatch(/тяжёлая|19-22/);
  });

  it('boundary 22 vs 23 (severe → very severe)', () => {
    const a = compute(22);
    const b = compute(23);
    expect(a.interpretation).not.toBe(b.interpretation);
    expect(b.interpretation.toLowerCase()).toMatch(/оч\.?тяж|≥ ?23/);
  });

  it('total 52 → very severe (max)', () => {
    const r = compute(52);
    expect(r.interpretation.toLowerCase()).toMatch(/оч\.?тяж|≥ ?23/);
  });
});
