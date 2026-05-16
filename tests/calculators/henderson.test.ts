/**
 * Golden tests for calculator runner 'henderson'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify the compute
 * function returns a well-formed CalculatorResult for mid-range inputs.
 * More rigorous than the auto smoke-test which only checks runner shape.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/henderson';
import type { CalculatorTool, CalculatorResult } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('henderson · compute', () => {
  it('has kind calculator', () => {
    expect(calc.kind).toBe('calculator');
  });

  it('has non-empty inputs array', () => {
    expect(Array.isArray(calc.inputs)).toBe(true);
    expect(calc.inputs.length).toBeGreaterThan(0);
  });

  it('compute returns a result for mid-range inputs', () => {
    const result = calc.compute({ ph: 7.2, pco2: 65, hco3: 27, na: 140, cl: 100, albumin: 33 }) as CalculatorResult | null;
    expect(result).not.toBeNull();
    if (result) {
      // value can be number | string depending on runner
      expect(['number', 'string']).toContain(typeof result.value);
      // interpretation should be human-readable string
      expect(typeof result.interpretation === 'string' || result.interpretation === undefined).toBe(true);
    }
  });

  it('compute does not throw on edge values (min)', () => {
    const minInputs = { ph: 6.5, pco2: 10, hco3: 3, na: 100, cl: 60, albumin: 10 };
    expect(() => calc.compute(minInputs)).not.toThrow();
  });

  it('compute does not throw on edge values (max)', () => {
    const maxInputs = { ph: 7.8, pco2: 120, hco3: 50, na: 180, cl: 140, albumin: 55 };
    expect(() => calc.compute(maxInputs)).not.toThrow();
  });
});
