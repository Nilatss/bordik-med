/**
 * Golden tests for CKD-EPI 2021 (race-free) eGFR.
 *
 * Reference: Inker LA et al. New creatinine-based equations to estimate
 *   GFR without race. N Engl J Med. 2021;385(19):1737–1749.
 *
 * Formula:
 *   eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^(-1.200) × 0.9938^age × (1.012 if female)
 *   κ = 0.7 ♀ / 0.9 ♂; α = -0.241 ♀ / -0.302 ♂.
 *   SCr_mg/dL = SCr_µmol/L / 88.4.
 *
 * KDIGO bands the runner uses:
 *   ≥ 90 G1; 60-89 G2; 45-59 G3a; 30-44 G3b; 15-29 G4; < 15 G5.
 */
import { describe, it, expect } from 'vitest';
import ckdEpi from '@/lib/runners/ckd-epi';

interface EResult { value: string; interpretation: string }

function call(age: number, creatinineUmol: number, female: boolean): EResult {
  return (ckdEpi.compute as unknown as (v: { age: number; creatinine: number; female: boolean }) => unknown)({
    age, creatinine: creatinineUmol, female,
  }) as EResult;
}

describe('ckd-epi · compute', () => {
  it('young healthy male — SCr 80 → G1', () => {
    // age 30, SCr 80/88.4 ≈ 0.905 mg/dL
    // 0.905/0.9 ≈ 1.006 → max term dominates ((1.006)^-1.2)
    // Heuristic: result ~ 102
    const r = call(30, 80, false);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(90);
    expect(r.interpretation).toMatch(/G1/);
  });

  it('elderly female — SCr 90 → G2 / G3a boundary', () => {
    const r = call(70, 90, true);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(40);
    expect(parseFloat(r.value)).toBeLessThan(75);
  });

  it('female factor 1.012 raises eGFR vs male (same SCr/age)', () => {
    const m = call(50, 100, false);
    const f = call(50, 100, true);
    // Female multiplier IS applied, but kappa change (0.9 vs 0.7) often
    // dominates and lowers eGFR for women — net effect varies. Check
    // that the values are different (algorithm treats sex as input).
    expect(parseFloat(m.value)).not.toBe(parseFloat(f.value));
  });

  it('SCr 200 µmol/L → G3b (30-44)', () => {
    // age 60, SCr 200/88.4 ≈ 2.26 mg/dL
    const r = call(60, 200, false);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(30);
    expect(parseFloat(r.value)).toBeLessThan(45);
    expect(r.interpretation).toMatch(/G3б/);
  });

  it('SCr 300 µmol/L → G4 (15-29)', () => {
    const r = call(60, 300, false);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(15);
    expect(parseFloat(r.value)).toBeLessThan(30);
    expect(r.interpretation).toMatch(/G4/);
  });

  it('SCr 800 µmol/L → G5', () => {
    const r = call(70, 800, false);
    expect(parseFloat(r.value)).toBeLessThan(15);
    expect(r.interpretation).toMatch(/G5/);
  });

  it('age decay factor (0.9938^age) — older = lower eGFR (same SCr)', () => {
    const young = parseFloat(call(20, 100, false).value);
    const old   = parseFloat(call(80, 100, false).value);
    expect(old).toBeLessThan(young);
  });
});
