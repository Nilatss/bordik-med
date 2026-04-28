/**
 * Golden tests for MDRD eGFR (4-variable, race-free runner version).
 *
 * Reference: Levey AS et al. A more accurate method to estimate
 *   glomerular filtration rate from serum creatinine: a new prediction
 *   equation. Ann Intern Med. 1999;130(6):461–70.
 *
 * Formula (the runner uses race-free 175-coefficient form):
 *   eGFR = 175 × SCr_mg/dL^(-1.154) × age^(-0.203) × (0.742 if female)
 *
 * KDIGO bands the runner uses:
 *   ≥ 90 G1, 60–89 G2, 30–59 G3, 15–29 G4, <15 G5.
 */
import { describe, it, expect } from 'vitest';
import mdrd from '@/lib/runners/mdrd';

interface EResult {
  value: string;
  interpretation: string;
}

function call(age: number, creatinineUmol: number, female: boolean): EResult {
  return (mdrd.compute as (input: { age: number; creatinine: number; female: boolean }) => unknown)({
    age, creatinine: creatinineUmol, female,
  }) as EResult;
}

describe('mdrd · compute', () => {
  it('young healthy male → G1 (≥ 90)', () => {
    // age 30, SCr 88 µmol/L (≈ 1 mg/dL)
    // eGFR = 175 * 1^-1.154 * 30^-0.203 ≈ 175 * 1 * 0.502 ≈ 87.8 → G2 actually
    const r = call(30, 80, false); // even lower SCr for clear G1
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(90);
    expect(r.interpretation).toMatch(/G1/);
  });

  it('elderly with mild CKD → G3', () => {
    // age 75, SCr 150 µmol/L (≈ 1.7 mg/dL), male
    const r = call(75, 150, false);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(30);
    expect(parseFloat(r.value)).toBeLessThan(60);
    expect(r.interpretation).toMatch(/G3/);
  });

  it('female multiplier 0.742 lowers eGFR vs male', () => {
    const m = call(50, 100, false);
    const f = call(50, 100, true);
    expect(parseFloat(f.value)).toBeLessThan(parseFloat(m.value));
    const ratio = parseFloat(f.value) / parseFloat(m.value);
    expect(ratio).toBeCloseTo(0.742, 1);
  });

  it('severe CKD → G4', () => {
    // age 65, SCr 350 µmol/L
    const r = call(65, 350, false);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(15);
    expect(parseFloat(r.value)).toBeLessThan(30);
    expect(r.interpretation).toMatch(/G4/);
  });

  it('end-stage → G5', () => {
    // age 70, SCr 700 µmol/L, female
    const r = call(70, 700, true);
    expect(parseFloat(r.value)).toBeLessThan(15);
    expect(r.interpretation).toMatch(/G5/);
  });
});
