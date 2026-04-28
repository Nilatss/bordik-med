/**
 * Golden tests for APRI / FIB-4 hepatic fibrosis non-invasive scores.
 *
 * References:
 *   Wai CT et al. APRI: A simple noninvasive index. Hepatology. 2003;38(2):518–26.
 *   Sterling RK et al. FIB-4. Hepatology. 2006;43(6):1317–25.
 *
 * Formulas:
 *   APRI = (AST / ULN) × 100 / platelets (×10⁹/L)
 *   FIB-4 = age × AST / (platelets × √ALT)
 *
 * APRI thresholds: <0.5 F0-F1; >1.0 F3-F4; >2.0 cirrhosis.
 * FIB-4 thresholds: <1.45 F0-F1 (NPV 90%); ≥1.45 grey; >3.25 F3-F4 (PPV 65%).
 */
import { describe, it, expect } from 'vitest';
import apri from '@/lib/runners/apri-hep';

interface AResult { value: string; unit: string; interpretation: string }

function call(args: { ast: number; ast_uln: number; alt: number; plt: number; age: number; albumin: number }): AResult {
  return (apri.compute as unknown as (v: typeof args) => unknown)(args) as AResult;
}

describe('apri-hep · compute', () => {
  it('low fibrosis — AST 30, ALT 30, plt 250, age 40 → F0-F1', () => {
    // APRI = (30/35)*100/250 = 0.343
    // FIB-4 = 40*30/(250*sqrt(30)) = 1200/(250*5.48) = 0.876
    const r = call({ ast: 30, ast_uln: 35, alt: 30, plt: 250, age: 40, albumin: 4.0 });
    expect(r.value).toMatch(/0\.34/);
    expect(r.interpretation).toMatch(/F0|F1/);
  });

  it('intermediate APRI > 1 — high transaminases', () => {
    // AST 200, ULN 35, plt 100: APRI = (200/35)*100/100 = 5.71 → F4
    const r = call({ ast: 200, ast_uln: 35, alt: 200, plt: 100, age: 50, albumin: 3.5 });
    expect(parseFloat(r.value.replace('APRI', '').trim())).toBeGreaterThan(2);
    expect(r.interpretation).toMatch(/цирроз|F4/);
  });

  it('FIB-4 > 3.25 in elderly with abnormal liver chemistry → F3-F4', () => {
    // age 70, AST 80, ALT 60, plt 120: FIB-4 = 70*80/(120*sqrt(60)) = 5600/(120*7.75) = 6.02
    const r = call({ ast: 80, ast_uln: 35, alt: 60, plt: 120, age: 70, albumin: 3.5 });
    const fib4 = parseFloat(r.unit.replace('FIB-4', '').trim());
    expect(fib4).toBeGreaterThan(3.25);
    expect(r.interpretation).toMatch(/F3|F4/);
  });

  it('FIB-4 grey zone (1.45–3.25)', () => {
    // age 55, AST 50, ALT 50, plt 200: FIB-4 = 55*50/(200*7.07) = 1.945
    const r = call({ ast: 50, ast_uln: 35, alt: 50, plt: 200, age: 55, albumin: 4.0 });
    const fib4 = parseFloat(r.unit.replace('FIB-4', '').trim());
    expect(fib4).toBeGreaterThanOrEqual(1.45);
    expect(fib4).toBeLessThanOrEqual(3.25);
    expect(r.interpretation).toMatch(/Серая/);
  });

  it('zero platelets → both scores zero (defensive)', () => {
    const r = call({ ast: 100, ast_uln: 35, alt: 100, plt: 0, age: 50, albumin: 4.0 });
    expect(r.value).toMatch(/0\.00/);
  });
});
