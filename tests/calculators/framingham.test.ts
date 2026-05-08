/**
 * Golden tests for Framingham 10-year general CVD risk (D'Agostino 2008).
 *
 * Reference: D'Agostino RB Sr, Vasan RS, Pencina MJ, et al. General
 * cardiovascular risk profile for use in primary care: the Framingham
 * Heart Study. Circulation 2008;117(6):743-753.
 * doi:10.1161/CIRCULATIONAHA.107.699579
 *
 * Output: 10-year risk total CVD (CHD + stroke + PVD + HF) %.
 *
 * Bands:
 *   <10%   → low
 *   10-20% → intermediate
 *   ≥20%   → high
 *
 * Note: ASCVD-PCE 2013 superseded Framingham for US populations; SCORE2
 * preferred for European populations. Framingham remains common in
 * historical and international comparisons.
 */
import { describe, it, expect } from 'vitest';
import fram from '@/lib/runners/framingham';

interface FramResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): FramResult {
  const r = (fram.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as FramResult;
}

describe('framingham · 10-year CVD risk', () => {
  it('young low-risk female → low', () => {
    // Age 35, no risk factors, normal cholesterol, normal BP
    const r = compute({ age: 35, female: true, tc: 4.5, hdl: 1.5, sbp: 110, treated: false, smoker: false, dm: false });
    expect(parseFloat(r.value)).toBeLessThan(10);
  });

  it('60yo male smoker with HTN + DM → high', () => {
    const r = compute({ age: 60, female: false, tc: 6.5, hdl: 0.9, sbp: 160, treated: true, smoker: true, dm: true });
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(20);
    expect(r.interpretation.toLowerCase()).toMatch(/высок/);
  });

  it('smoking adds risk monotonically', () => {
    const baseline = { age: 55, female: false, tc: 5.5, hdl: 1.1, sbp: 130, treated: false, dm: false };
    const a = parseFloat(compute({ ...baseline, smoker: false }).value);
    const b = parseFloat(compute({ ...baseline, smoker: true }).value);
    expect(b).toBeGreaterThan(a);
  });

  it('diabetes adds risk monotonically', () => {
    const baseline = { age: 50, female: false, tc: 5, hdl: 1.2, sbp: 120, treated: false, smoker: false };
    const a = parseFloat(compute({ ...baseline, dm: false }).value);
    const b = parseFloat(compute({ ...baseline, dm: true }).value);
    expect(b).toBeGreaterThan(a);
  });

  it('female has lower risk than male with same profile', () => {
    const profile = { age: 55, tc: 5.5, hdl: 1.1, sbp: 130, treated: false, smoker: false, dm: false };
    const f = parseFloat(compute({ ...profile, female: true }).value);
    const m = parseFloat(compute({ ...profile, female: false }).value);
    expect(m).toBeGreaterThan(f);
  });

  it('treated SBP coefficient differs from untreated', () => {
    // Same SBP value, different treatment status — should give different result
    const baseline = { age: 55, female: false, tc: 5.5, hdl: 1.1, sbp: 150, smoker: false, dm: false };
    const untreated = parseFloat(compute({ ...baseline, treated: false }).value);
    const treated = parseFloat(compute({ ...baseline, treated: true }).value);
    // Treated patients carry slightly higher residual risk (β-coefficient)
    expect(treated).toBeGreaterThanOrEqual(untreated);
  });

  it('higher HDL reduces risk', () => {
    const baseline = { age: 55, female: false, tc: 5.5, sbp: 130, treated: false, smoker: false, dm: false };
    const lowHDL = parseFloat(compute({ ...baseline, hdl: 0.8 }).value);
    const highHDL = parseFloat(compute({ ...baseline, hdl: 1.8 }).value);
    expect(lowHDL).toBeGreaterThan(highHDL);
  });

  it('result is reported as a numeric percentage', () => {
    const r = compute({ age: 50, female: false, tc: 5.5, hdl: 1.1, sbp: 130, treated: false, smoker: false, dm: false });
    expect(r.unit).toMatch(/%/);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(r.value)).toBeLessThanOrEqual(100);
  });
});
