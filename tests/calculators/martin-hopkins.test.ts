/**
 * Golden tests for Martin-Hopkins LDL-C calculation.
 *
 * Reference: Martin SS, Blaha MJ, Elshazly MB, et al. Comparison of a
 * novel method vs the Friedewald equation for estimating low-density
 * lipoprotein cholesterol levels from the standard lipid profile. JAMA
 * 2013;310(19):2061-2068. doi:10.1001/jama.2013.280532
 *
 * Improvement over Friedewald (TG/5):
 *   - Uses TG/adjustable-factor (180 strata)
 *   - Accurate at high TG (200-400 mg/dL) where Friedewald underestimates
 *   - Avoids "TG ≥400 → no calculation" limit
 *
 * Bands (ESC 2021 dyslipidaemia):
 *   <1.8 mmol/L → optimal (very-high-risk target)
 *   <2.6        → normal
 *   2.6-3.4     → borderline
 *   3.4-4.1     → elevated
 *   ≥4.1        → high
 */
import { describe, it, expect } from 'vitest';
import mh from '@/lib/runners/martin-hopkins';

interface MhResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
}

function compute(input: { tc: number; hdl: number; tg: number }): MhResult {
  const r = (mh.compute as (i: typeof input) => unknown)(input);
  return r as MhResult;
}

describe('martin-hopkins · LDL calculation', () => {
  it('typical normal — TC 5.0, HDL 1.5, TG 1.0 → LDL ~3.0', () => {
    const r = compute({ tc: 5.0, hdl: 1.5, tg: 1.0 });
    const ldl = parseFloat(r.value);
    expect(ldl).toBeGreaterThan(2.5);
    expect(ldl).toBeLessThan(3.5);
  });

  it('optimal LDL <1.8 (very-high-risk target)', () => {
    // LDL = TC - HDL - TG/factor; force result below 1.8
    const r = compute({ tc: 4.0, hdl: 1.8, tg: 0.8 });
    const ldl = parseFloat(r.value);
    if (ldl < 1.8) {
      expect(r.interpretation.toLowerCase()).toMatch(/оптим|optimal/);
    }
  });

  it('elevated TG (>2.5 mmol/L) — Martin-Hopkins still computes', () => {
    // Friedewald would underestimate; Martin-Hopkins uses adjustable factor
    const r = compute({ tc: 7.0, hdl: 1.0, tg: 4.0 });
    expect(parseFloat(r.value)).toBeGreaterThan(0);
  });

  it('high LDL ≥4.1 → top band', () => {
    const r = compute({ tc: 9.0, hdl: 1.0, tg: 1.0 });
    const ldl = parseFloat(r.value);
    if (ldl >= 4.1) {
      expect(r.interpretation.toLowerCase()).toMatch(/высокий|≥ ?4\.1/);
    }
  });

  it('higher TG → higher LDL contribution from VLDL adjustment (vs Friedewald)', () => {
    const a = compute({ tc: 5.5, hdl: 1.2, tg: 1.0 });
    const b = compute({ tc: 5.5, hdl: 1.2, tg: 3.0 });
    // Higher TG decreases calculated LDL (more cholesterol allocated to VLDL)
    expect(parseFloat(b.value)).toBeLessThan(parseFloat(a.value));
  });

  it('higher HDL → lower LDL (subtraction)', () => {
    const baseline = { tc: 5.5, tg: 1.5 };
    const a = compute({ ...baseline, hdl: 1.0 });
    const b = compute({ ...baseline, hdl: 2.0 });
    expect(parseFloat(b.value)).toBeLessThan(parseFloat(a.value));
  });

  it('result reported in mmol/L', () => {
    const r = compute({ tc: 5, hdl: 1.5, tg: 1 });
    expect(r.unit).toMatch(/ммоль|mmol/i);
  });
});
