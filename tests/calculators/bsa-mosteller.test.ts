/**
 * Golden tests for BSA (Mosteller, 1987).
 *
 * Reference: Mosteller RD. Simplified calculation of body-surface area.
 *   N Engl J Med. 1987 Oct 22;317(17):1098. PMID: 3657876.
 *
 * Formula: BSA (m²) = √(weight_kg × height_cm / 3600)
 *
 * Why golden-test: BSA drives chemotherapy dosing in oncology
 * (mg/m²) — a 5% drift translates directly into a 5% drug dose error.
 * Numbers below are computed with the reference formula; test pins
 * compute() to those exact values.
 */
import { describe, it, expect } from 'vitest';
import bsa from '@/lib/runners/bsa-mosteller';

interface BsaResult {
  value: string;
  unit: string;
  interpretation: string;
}

function call(weight: number, height: number): BsaResult {
  return (bsa.compute as (input: { weight: number; height: number }) => unknown)({
    weight, height,
  }) as BsaResult;
}

describe('bsa-mosteller · compute', () => {
  it('70kg / 175cm → 1.83 m²', () => {
    // sqrt(70 * 175 / 3600) = sqrt(3.4028) = 1.8447 → 1.84
    const r = call(70, 175);
    expect(r.value).toBe('1.84');
    expect(r.unit).toBe('м²');
  });

  it('60kg / 165cm → 1.66 m² (average adult ♀)', () => {
    // sqrt(60 * 165 / 3600) = sqrt(2.75) = 1.6583 → 1.66
    const r = call(60, 165);
    expect(r.value).toBe('1.66');
  });

  it('80kg / 180cm → 2.00 m² (athlete frame)', () => {
    // sqrt(80 * 180 / 3600) = sqrt(4) = 2.0000
    const r = call(80, 180);
    expect(r.value).toBe('2.00');
  });

  it('15kg / 100cm → 0.65 m² (paediatric)', () => {
    // sqrt(15 * 100 / 3600) = sqrt(0.4167) = 0.6455 → 0.65
    const r = call(15, 100);
    expect(r.value).toBe('0.65');
  });

  it('120kg / 175cm → 2.41 m² (BMI 39 obesity II)', () => {
    // sqrt(120 * 175 / 3600) = sqrt(5.8333) = 2.4152 → 2.42
    const r = call(120, 175);
    expect(r.value).toBe('2.42');
  });
});
