/**
 * Golden tests for FIB-4 / APRI composite (liver fibrosis non-invasive).
 *
 * Reference: Sterling RK, Lissen E, Clumeck N, et al. Development of a
 * simple noninvasive index to predict significant fibrosis in patients
 * with HIV/HCV coinfection. Hepatology 2006;43(6):1317-1325.
 * doi:10.1002/hep.21178
 *
 * Formula: FIB-4 = (Age × AST) / (Platelets × √ALT)
 *
 * AASLD 2023 cut-offs:
 *   <1.30      → low risk advanced fibrosis (NPV >90%)
 *   1.30-2.67  → indeterminate → FibroScan / hepatology
 *   ≥2.67      → high risk → biopsy / specialist
 *   >3.25      → strong PPV F3-F4 (~65%)
 */
import { describe, it, expect } from 'vitest';
import fib4 from '@/lib/runners/fib4';

interface Fib4Result {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): Fib4Result {
  const r = (fib4.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as Fib4Result;
}

describe('fib4 · liver fibrosis triage', () => {
  it('young, normal labs → low (FIB-4 <1.3)', () => {
    // Age 35, AST 25, ALT 30, plt 220 → (35*25)/(220*√30) = 875/1205 ≈ 0.73
    const r = compute({ tool: 'fib4', age: 35, ast: 25, alt: 30, plt: 220, astUln: 40 });
    expect(parseFloat(r.value)).toBeLessThan(1.3);
    expect(r.interpretation.toLowerCase()).toMatch(/низкий|rule-out|f3-f4/);
  });

  it('elderly, elevated AST, low platelets → high (FIB-4 ≥2.67)', () => {
    // Age 70, AST 120, ALT 60, plt 100 → (70*120)/(100*√60) = 8400/774.6 ≈ 10.84
    const r = compute({ tool: 'fib4', age: 70, ast: 120, ast_uln: 40, alt: 60, plt: 100, astUln: 40 });
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(2.67);
    expect(r.interpretation.toLowerCase()).toMatch(/высокая|f3-f4|гепатолог/);
  });

  it('intermediate value → indeterminate zone', () => {
    // Tune for FIB-4 between 1.3 and 2.67
    // Age 55, AST 50, ALT 55, plt 180 → (55*50)/(180*√55) ≈ 2750/1335 ≈ 2.06
    const r = compute({ tool: 'fib4', age: 55, ast: 50, alt: 55, plt: 180, astUln: 40 });
    const v = parseFloat(r.value);
    expect(v).toBeGreaterThanOrEqual(1.3);
    expect(v).toBeLessThan(2.67);
    expect(r.interpretation.toLowerCase()).toMatch(/неопредел|fibroscan|биопс/);
  });

  it('formula numeric verification — preset Низкий', () => {
    // (35*25)/(220*√30) — verify within 0.05
    const r = compute({ tool: 'fib4', age: 35, ast: 25, alt: 30, plt: 220, astUln: 40 });
    expect(parseFloat(r.value)).toBeCloseTo(0.73, 1);
  });

  it('age increase → higher FIB-4 (linear in numerator)', () => {
    const baseline = { tool: 'fib4', ast: 60, alt: 40, plt: 150, astUln: 40 };
    const young = compute({ ...baseline, age: 30 });
    const old = compute({ ...baseline, age: 70 });
    expect(parseFloat(old.value)).toBeGreaterThan(parseFloat(young.value));
  });

  it('low platelets → higher FIB-4 (denominator)', () => {
    const baseline = { tool: 'fib4', age: 55, ast: 60, alt: 40, astUln: 40 };
    const high = compute({ ...baseline, plt: 250 });
    const low = compute({ ...baseline, plt: 80 });
    expect(parseFloat(low.value)).toBeGreaterThan(parseFloat(high.value));
  });

  it('APRI mode runs and returns numeric value', () => {
    // APRI = (AST/ULN × 100) / Plt
    const r = compute({ tool: 'apri', age: 50, ast: 80, alt: 50, plt: 150, astUln: 40 });
    expect(parseFloat(r.value)).toBeGreaterThan(0);
    expect(parseFloat(r.value)).toBeLessThan(20);
  });
});
