/**
 * Golden tests for QRISK3 (10-year CVD risk, UK).
 *
 * Reference: Hippisley-Cox J, Coupland C, Brindle P. Development and
 * validation of QRISK3 risk prediction algorithms to estimate future
 * risk of cardiovascular disease: prospective cohort study. BMJ 2017;
 * 357:j2099. doi:10.1136/bmj.j2099
 *
 * Bands (NICE CG181 anchor):
 *   <10%   → low; statin not recommended
 *   10-20% → moderate; offer atorvastatin 20 mg (NICE 10% threshold)
 *   ≥20%   → high; statin + aggressive secondary risk control
 *
 * Note: Bordik runner is a simplified QRISK3 — full algorithm has 20+
 * coefficients (migraine, SLE, atypical antipsychotics, severe mental
 * illness, etc.). Tests verify monotonicity rather than exact %.
 */
import { describe, it, expect } from 'vitest';
import qrisk from '@/lib/runners/qrisk3';

interface QriskResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): QriskResult {
  const r = (qrisk.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as QriskResult;
}

describe('qrisk3 · risk stratification', () => {
  it('healthy 35yo white female → low risk', () => {
    const r = compute({
      age: 35, female: true, smoker: false, dm1: false, dm2: false,
      ckd: false, af: false, treated: false, sbp: 110, ratio: 3, bmi: 22,
      fh: false, ethnicity: 'white',
    });
    expect(parseFloat(r.value)).toBeLessThan(10);
    expect(r.interpretation.toLowerCase()).toMatch(/низкий/);
  });

  it('70yo male DM2 + CKD + AF + smoker → high risk', () => {
    const r = compute({
      age: 70, female: false, smoker: true, dm1: false, dm2: true,
      ckd: true, af: true, treated: true, sbp: 160, ratio: 6, bmi: 32,
      fh: true, ethnicity: 'white',
    });
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(20);
    expect(r.interpretation.toLowerCase()).toMatch(/высок/);
  });

  it('NICE CG181 statin threshold mentioned at moderate band', () => {
    const r = compute({
      age: 60, female: false, smoker: true, dm1: false, dm2: false,
      ckd: false, af: false, treated: false, sbp: 145, ratio: 5, bmi: 28,
      fh: false, ethnicity: 'white',
    });
    if (parseFloat(r.value) >= 10 && parseFloat(r.value) < 20) {
      expect(r.details.toLowerCase()).toMatch(/nice|10|порог|статин/);
    }
  });

  it('atrial fibrillation increases risk', () => {
    const baseline = {
      age: 60, female: false, smoker: false, dm1: false, dm2: false,
      ckd: false, treated: false, sbp: 130, ratio: 4, bmi: 26,
      fh: false, ethnicity: 'white',
    };
    const a = parseFloat(compute({ ...baseline, af: false }).value);
    const b = parseFloat(compute({ ...baseline, af: true }).value);
    expect(b).toBeGreaterThan(a);
  });

  it('Type 1 DM has stronger effect than Type 2 (β=1.35 vs 0.85)', () => {
    const baseline = {
      age: 50, female: false, smoker: false, ckd: false, af: false,
      treated: false, sbp: 130, ratio: 4, bmi: 26, fh: false, ethnicity: 'white',
    };
    const dm1 = parseFloat(compute({ ...baseline, dm1: true, dm2: false }).value);
    const dm2 = parseFloat(compute({ ...baseline, dm1: false, dm2: true }).value);
    expect(dm1).toBeGreaterThan(dm2);
  });

  it('South Asian ethnicity adjusts risk upwards (Indian/Pakistani/Bangladeshi)', () => {
    const baseline = {
      age: 55, female: false, smoker: false, dm1: false, dm2: false,
      ckd: false, af: false, treated: false, sbp: 130, ratio: 4, bmi: 26, fh: false,
    };
    const white = parseFloat(compute({ ...baseline, ethnicity: 'white' }).value);
    const banglad = parseFloat(compute({ ...baseline, ethnicity: 'bangladeshi' }).value);
    expect(banglad).toBeGreaterThan(white);
  });

  it('result reported as 1-decimal percentage', () => {
    const r = compute({
      age: 50, female: false, smoker: false, dm1: false, dm2: false,
      ckd: false, af: false, treated: false, sbp: 130, ratio: 4, bmi: 26,
      fh: false, ethnicity: 'white',
    });
    expect(r.unit).toBe('%');
    expect(r.value).toMatch(/^\d+\.\d$/);
  });
});
