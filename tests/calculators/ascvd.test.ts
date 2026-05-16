/**
 * Golden tests for calculator runner 'ascvd'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify the compute
 * function returns a well-formed CalculatorResult for mid-range inputs.
 * More rigorous than the auto smoke-test which only checks runner shape.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/ascvd';
import type { CalculatorTool, CalculatorResult } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('ascvd · compute', () => {
  it('has kind calculator', () => {
    expect(calc.kind).toBe('calculator');
  });

  it('has non-empty inputs array', () => {
    expect(Array.isArray(calc.inputs)).toBe(true);
    expect(calc.inputs.length).toBeGreaterThan(0);
  });

  it('compute returns a result for mid-range inputs', () => {
    const result = calc.compute({ age: 60, tc: 9, hdl: 2.2, sbp: 160 }) as CalculatorResult | null;
    expect(result).not.toBeNull();
    if (result) {
      // value can be number | string depending on runner
      expect(['number', 'string']).toContain(typeof result.value);
      // interpretation should be human-readable string
      expect(typeof result.interpretation === 'string' || result.interpretation === undefined).toBe(true);
    }
  });

  it('compute does not throw on edge values (min)', () => {
    const minInputs = { age: 40, tc: 2, hdl: 0.3, sbp: 80 };
    expect(() => calc.compute(minInputs)).not.toThrow();
  });

  it('compute does not throw on edge values (max)', () => {
    const maxInputs = { age: 79, tc: 15, hdl: 4, sbp: 240 };
    expect(() => calc.compute(maxInputs)).not.toThrow();
  });
});
