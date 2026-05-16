/**
 * Golden tests for calculator runner 'calvert'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify the compute
 * function returns a well-formed CalculatorResult for mid-range inputs.
 * More rigorous than the auto smoke-test which only checks runner shape.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/calvert';
import type { CalculatorTool, CalculatorResult } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('calvert · compute', () => {
  it('has kind calculator', () => {
    expect(calc.kind).toBe('calculator');
  });

  it('has non-empty inputs array', () => {
    expect(Array.isArray(calc.inputs)).toBe(true);
    expect(calc.inputs.length).toBeGreaterThan(0);
  });

  it('compute returns a result for mid-range inputs', () => {
    const result = calc.compute({ auc: 4, gfr: 105 }) as CalculatorResult | null;
    expect(result).not.toBeNull();
    if (result) {
      // value can be number | string depending on runner
      expect(['number', 'string']).toContain(typeof result.value);
      // interpretation should be human-readable string
      expect(typeof result.interpretation === 'string' || result.interpretation === undefined).toBe(true);
    }
  });

  it('compute does not throw on edge values (min)', () => {
    const minInputs = { auc: 1, gfr: 10 };
    expect(() => calc.compute(minInputs)).not.toThrow();
  });

  it('compute does not throw on edge values (max)', () => {
    const maxInputs = { auc: 7, gfr: 200 };
    expect(() => calc.compute(maxInputs)).not.toThrow();
  });
});
