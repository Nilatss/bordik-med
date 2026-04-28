/**
 * Golden tests for Maddrey's Discriminant Function (alcoholic hepatitis).
 *
 * Reference: Maddrey WC et al. Corticosteroid therapy of alcoholic
 *   hepatitis. Gastroenterology. 1978;75(2):193–9.
 *
 * Formula:
 *   DF = 4.6 × (PT - PT_control) + bilirubin_mg/dL
 *   bilirubin: input in µmol/L, divided by 17.1 → mg/dL.
 *
 * Threshold:
 *   DF < 32 → mild, no steroids
 *   DF ≥ 32 → severe, consider steroids
 */
import { describe, it, expect } from 'vitest';
import maddrey from '@/lib/runners/maddrey';

interface MResult { value: string; interpretation: string }

function call(pt: number, ptc: number, biliUmol: number): MResult {
  return (maddrey.compute as (input: { pt: number; ptc: number; bil: number }) => unknown)({
    pt, ptc, bil: biliUmol,
  }) as MResult;
}

describe('maddrey · compute', () => {
  it('mild (DF < 32) — PT 14, ctrl 12, bili 30', () => {
    // DF = 4.6*(14-12) + 30/17.1 = 9.2 + 1.75 = 10.95
    const r = call(14, 12, 30);
    expect(parseFloat(r.value)).toBeCloseTo(11.0, 0);
    expect(r.interpretation).toMatch(/лёгкий|< 32/);
  });

  it('severe (DF >= 32) — PT 22, ctrl 12, bili 200', () => {
    // DF = 4.6*10 + 200/17.1 = 46 + 11.7 = 57.7
    const r = call(22, 12, 200);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(32);
    expect(r.interpretation).toMatch(/тяж/i);
  });

  it('boundary: exactly 32', () => {
    // DF = 32: PT 17.5 - 12 = 5.5; 4.6*5.5 = 25.3
    // bili = 32 - 25.3 = 6.7 mg/dL = 6.7*17.1 = 114.6 µmol/L
    const r = call(17.5, 12, 114.6);
    expect(parseFloat(r.value)).toBeCloseTo(32, 0);
  });

  it('low PT extension', () => {
    // PT = ctrl: bili-only contribution
    const r = call(12, 12, 100);
    expect(parseFloat(r.value)).toBeCloseTo(5.85, 1);  // 100/17.1
    expect(r.interpretation).toMatch(/лёгкий/);
  });

  it('extreme severity', () => {
    const r = call(30, 12, 400);
    expect(parseFloat(r.value)).toBeGreaterThan(80);
    expect(r.interpretation).toMatch(/тяж/i);
  });
});
