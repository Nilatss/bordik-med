/**
 * Golden tests for Adrogué-Madias Δ Na formula.
 *
 * Reference: Adrogué HJ, Madias NE. Hyponatremia / Hypernatremia.
 *   N Engl J Med. 2000;342(20):1493-9 / 1581-9.
 *
 * Formula: ΔNa per 1 L infusate = (Na_infusate − Na_serum) / (TBW + 1)
 *   TBW = factor × weight (factor: ♂ 0.6 / ♀ 0.5 / elderly variants)
 */
import { describe, it, expect } from 'vitest';
import am from '@/lib/runners/adrogue-madias';

interface AmResult { value: string; interpretation: string; details: string }

interface Args {
  serumNa: number;
  weight: number;
  sex: 'm' | 'f';
  ageGroup: 'adult' | 'elderly';
  infusate: number;
}

function call(args: Args): AmResult {
  return (am.compute as unknown as (v: Args) => unknown)(args) as AmResult;
}

describe('adrogue-madias · compute', () => {
  it('hyponatremia (Na 120) + 3% NaCl (513 mmol/L) — male 70kg adult', () => {
    // TBW = 0.6 * 70 = 42
    // ΔNa = (513 - 120) / (42+1) = 393/43 = 9.14 mmol/L per 1 L
    const r = call({ serumNa: 120, weight: 70, sex: 'm', ageGroup: 'adult', infusate: 513 });
    expect(parseFloat(r.value)).toBeCloseTo(9.14, 1);
    // Should not be in "minimal change" band
    expect(r.interpretation).not.toMatch(/Минимальное/);
  });

  it('hypernatremia (Na 160) + D5W (Na 0) — female 60kg elderly', () => {
    // TBW = 0.45 * 60 = 27
    // ΔNa = (0 - 160) / (27+1) = -160/28 = -5.71 mmol/L
    const r = call({ serumNa: 160, weight: 60, sex: 'f', ageGroup: 'elderly', infusate: 0 });
    expect(parseFloat(r.value)).toBeCloseTo(-5.71, 1);
  });

  it('isotonic NaCl (Na 154) at Na 150 — minimal change', () => {
    // TBW = 0.6 * 70 = 42
    // ΔNa = (154 - 150) / 43 = 0.093 — minimal
    const r = call({ serumNa: 150, weight: 70, sex: 'm', ageGroup: 'adult', infusate: 154 });
    expect(Math.abs(parseFloat(r.value))).toBeLessThan(0.5);
    expect(r.interpretation).toMatch(/Минимальное/);
  });

  it('female TBW factor 0.5 vs male 0.6 — same Na inputs', () => {
    const m = call({ serumNa: 120, weight: 70, sex: 'm', ageGroup: 'adult', infusate: 513 });
    const f = call({ serumNa: 120, weight: 70, sex: 'f', ageGroup: 'adult', infusate: 513 });
    // Female has smaller TBW → larger ΔNa per litre
    expect(parseFloat(f.value)).toBeGreaterThan(parseFloat(m.value));
  });

  it('elderly factor reduces TBW (♂ 0.5 vs 0.6)', () => {
    const adult   = call({ serumNa: 120, weight: 70, sex: 'm', ageGroup: 'adult',   infusate: 513 });
    const elderly = call({ serumNa: 120, weight: 70, sex: 'm', ageGroup: 'elderly', infusate: 513 });
    expect(parseFloat(elderly.value)).toBeGreaterThan(parseFloat(adult.value));
  });
});
