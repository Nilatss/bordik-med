/**
 * Golden tests for HbA1c → eAG (estimated average glucose).
 *
 * Reference: Nathan DM et al. Translating the A1C assay into estimated
 *   average glucose values. Diabetes Care. 2008;31(8):1473–8.
 *
 * Formula:  eAG_mg/dL  = 28.7 × HbA1c − 46.7
 *           eAG_mmol/L = eAG_mg/dL / 18
 *
 * ADA bands the runner uses:
 *   < 5.7   Норма
 *   5.7–6.4 Преддиабет
 *   6.5–6.9 Диабет: целевой
 *   7.0–8.9 Диабет: субоптимальный
 *   ≥ 9.0   Диабет: плохой контроль
 */
import { describe, it, expect } from 'vitest';
import a1c from '@/lib/runners/hba1c';

interface A1cResult {
  value: string;     // eAG in mmol/L
  interpretation: string;
}

function call(hba1c: number): A1cResult {
  return (a1c.compute as (input: { hba1c: number }) => unknown)({ hba1c }) as A1cResult;
}

describe('hba1c · compute', () => {
  it('5.0 → eAG ≈ 5.4 mmol/L (normal)', () => {
    // eAG mgdl = 28.7*5.0 - 46.7 = 96.8 → mmol = 5.378 → 5.4
    const r = call(5.0);
    expect(parseFloat(r.value)).toBeCloseTo(5.4, 1);
    expect(r.interpretation).toMatch(/Норма/);
  });

  it('6.0 → prediabetes band', () => {
    const r = call(6.0);
    expect(r.interpretation).toMatch(/Преддиабет/);
  });

  it('6.5 → diabetes target control', () => {
    const r = call(6.5);
    expect(r.interpretation).toMatch(/целевой|Целев/i);
  });

  it('8.0 → suboptimal control', () => {
    const r = call(8.0);
    expect(r.interpretation).toMatch(/субоптимальный/);
  });

  it('10.0 → poor control', () => {
    const r = call(10.0);
    expect(r.interpretation).toMatch(/плохой/);
  });

  it('eAG conversion is consistent with reference (HbA1c=7%)', () => {
    // 28.7*7 - 46.7 = 154.2 mg/dL = 8.567 → 8.6
    const r = call(7.0);
    expect(parseFloat(r.value)).toBeCloseTo(8.6, 1);
  });
});
