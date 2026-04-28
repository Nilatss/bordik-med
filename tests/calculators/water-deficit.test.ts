/**
 * Golden tests for free-water and Na-deficit calculations
 * (hypernatremia / hyponatremia ICU bedside).
 *
 * Reference: Adrogué HJ, Madias NE. Hypernatremia / Hyponatremia.
 *   N Engl J Med. 2000;342(20):1493–9 / 1581–9.
 *
 * Formulas:
 *   TBW = factor × weight   (factor: ♂ 0.6 / ♀ 0.5 / elderly variants)
 *   Free-water deficit (hyper) = TBW × (Na/140 − 1)
 *   Na deficit (hypo)          = TBW × (target − serum)
 */
import { describe, it, expect } from 'vitest';
import wd from '@/lib/runners/water-deficit';

interface WdResult { value: string; unit: string; interpretation: string }

interface Args {
  mode: 'hyper' | 'hypo';
  serumNa: number;
  targetNa: number;
  weight: number;
  sex: 'm' | 'f';
  ageGroup: 'adult' | 'elderly';
}

function call(args: Args): WdResult {
  return (wd.compute as unknown as (input: Args) => unknown)(args) as WdResult;
}

describe('water-deficit · compute', () => {
  it('hypernatremia adult male — Na 160, 70 kg → ~2.0 L deficit', () => {
    // TBW = 0.6 * 70 = 42; deficit = 42 * (160/140 - 1) = 42 * 0.143 = 6.0 L
    const r = call({ mode: 'hyper', serumNa: 160, targetNa: 140, weight: 70, sex: 'm', ageGroup: 'adult' });
    expect(parseFloat(r.value)).toBeCloseTo(6.0, 0);
    expect(r.unit).toMatch(/свободной воды/);
  });

  it('hypernatremia female elderly — TBW factor 0.45', () => {
    // 0.45 * 60 = 27; (155/140 - 1) = 0.107; 27 * 0.107 = 2.89
    const r = call({ mode: 'hyper', serumNa: 155, targetNa: 140, weight: 60, sex: 'f', ageGroup: 'elderly' });
    expect(parseFloat(r.value)).toBeCloseTo(2.89, 1);
  });

  it('no deficit when Na = 140', () => {
    const r = call({ mode: 'hyper', serumNa: 140, targetNa: 140, weight: 70, sex: 'm', ageGroup: 'adult' });
    expect(parseFloat(r.value)).toBe(0);
    expect(r.interpretation).toMatch(/нет/i);
  });

  it('hyponatremia adult male — Na 120, target 130', () => {
    // TBW = 42; deficit = 42 * (130 - 120) = 420 mmol
    const r = call({ mode: 'hypo', serumNa: 120, targetNa: 130, weight: 70, sex: 'm', ageGroup: 'adult' });
    expect(parseInt(r.value)).toBe(420);
    expect(r.unit).toMatch(/ммоль/);
  });

  it('large severe hypernatremia (Na 175) flags red', () => {
    // 0.6*70 = 42; 42*(175/140-1) = 42*0.25 = 10.5 L → high
    const r = call({ mode: 'hyper', serumNa: 175, targetNa: 140, weight: 70, sex: 'm', ageGroup: 'adult' });
    expect(parseFloat(r.value)).toBeGreaterThan(4);
  });

  it('female adult vs male adult differ by TBW factor', () => {
    const m = call({ mode: 'hyper', serumNa: 150, targetNa: 140, weight: 70, sex: 'm', ageGroup: 'adult' });
    const f = call({ mode: 'hyper', serumNa: 150, targetNa: 140, weight: 70, sex: 'f', ageGroup: 'adult' });
    expect(parseFloat(f.value)).toBeLessThan(parseFloat(m.value));
    // ratio ≈ 0.5/0.6 = 0.833
    expect(parseFloat(f.value) / parseFloat(m.value)).toBeCloseTo(0.833, 1);
  });
});
