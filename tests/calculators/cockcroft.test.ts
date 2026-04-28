/**
 * Golden tests for Cockcroft-Gault Creatinine Clearance.
 *
 * Reference: Cockcroft DW, Gault MH. Prediction of creatinine clearance
 *   from serum creatinine. Nephron. 1976;16(1):31–41. PMID 1244564.
 *
 * Formula:
 *   CrCl (mL/min) = ((140 − age) × weight_kg × (0.85 if female)) / (72 × SCr_mg/dL)
 *
 * Our runner takes creatinine in µmol/L and converts: SCr_mg/dL = µmol/L / 88.4
 *
 * KDIGO bands the runner uses:
 *   ≥ 90 normal; 60–89 stage 2; 45–59 3a; 30–44 3b; 15–29 stage 4; <15 stage 5.
 */
import { describe, it, expect } from 'vitest';
import cg from '@/lib/runners/cockcroft';

interface CrclResult {
  value: string;
  interpretation: string;
}

function call(age: number, weight: number, creatinineUmol: number, female: boolean): CrclResult {
  return (cg.compute as (input: { age: number; weight: number; creatinine: number; female: boolean }) => unknown)({
    age, weight, creatinine: creatinineUmol, female,
  }) as CrclResult;
}

describe('cockcroft · compute', () => {
  it('young healthy male — normal function', () => {
    // age 30, 80kg, SCr 88 µmol/L (≈ 1 mg/dL)
    // CrCl = (140-30)*80*1 / (72*1) = 8800/72 ≈ 122
    const r = call(30, 80, 88.4, false);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(120);
    expect(r.interpretation).toMatch(/Нормальн/);
  });

  it('elderly female — stage 3a boundary', () => {
    // age 70, 60kg, SCr 130 µmol/L
    // SCr_mgdl = 130/88.4 = 1.47
    // CrCl = (140-70)*60*0.85 / (72*1.47) = 3570 / 105.84 ≈ 33.7
    // 30 ≤ 33.7 < 45 → 3b
    const r = call(70, 60, 130, true);
    expect(parseFloat(r.value)).toBeGreaterThan(30);
    expect(parseFloat(r.value)).toBeLessThan(45);
    expect(r.interpretation).toMatch(/3б|3a/);
  });

  it('female sex factor 0.85 lowers CrCl vs male', () => {
    const m = call(50, 70, 90, false);
    const f = call(50, 70, 90, true);
    expect(parseFloat(f.value)).toBeLessThan(parseFloat(m.value));
    // Should be ≈ 85% — within rounding
    const ratio = parseFloat(f.value) / parseFloat(m.value);
    expect(ratio).toBeGreaterThan(0.84);
    expect(ratio).toBeLessThan(0.86);
  });

  it('high creatinine → low CrCl → stage 4', () => {
    // age 60, 70kg, SCr 350 µmol/L (≈ 4 mg/dL)
    // CrCl = 80*70 / (72*3.96) ≈ 19.6
    const r = call(60, 70, 350, false);
    expect(parseFloat(r.value)).toBeGreaterThan(15);
    expect(parseFloat(r.value)).toBeLessThan(30);
    expect(r.interpretation).toMatch(/Тяж/);
  });

  it('extreme — stage 5 (CrCl < 15)', () => {
    // age 75, 60kg, SCr 700 µmol/L
    // SCr_mgdl ≈ 7.92; CrCl = 65*60 / (72*7.92) ≈ 6.84
    const r = call(75, 60, 700, false);
    expect(parseFloat(r.value)).toBeLessThan(15);
  });
});
