/**
 * Golden tests for calculator runner 'abpm'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify the compute
 * function returns a well-formed CalculatorResult for mid-range inputs.
 * More rigorous than the auto smoke-test which only checks runner shape.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/abpm';
import type { CalculatorTool, CalculatorResult } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('abpm · compute', () => {
  it('has kind calculator', () => {
    expect(calc.kind).toBe('calculator');
  });

  it('has non-empty inputs array', () => {
    expect(Array.isArray(calc.inputs)).toBe(true);
    expect(calc.inputs.length).toBeGreaterThan(0);
  });

  it('compute returns a result for mid-range inputs', () => {
    const result = calc.compute({ sbp24: 150, dbp24: 90, sbp_day: 150, dbp_day: 90, sbp_night: 135, dbp_night: 85 }) as CalculatorResult | null;
    expect(result).not.toBeNull();
    if (result) {
      // value can be number | string depending on runner
      expect(['number', 'string']).toContain(typeof result.value);
      // interpretation should be human-readable string
      expect(typeof result.interpretation === 'string' || result.interpretation === undefined).toBe(true);
    }
  });

  it('compute does not throw on edge values (min)', () => {
    const minInputs = { sbp24: 80, dbp24: 40, sbp_day: 80, dbp_day: 40, sbp_night: 70, dbp_night: 40 };
    expect(() => calc.compute(minInputs)).not.toThrow();
  });

  it('compute does not throw on edge values (max)', () => {
    const maxInputs = { sbp24: 220, dbp24: 140, sbp_day: 220, dbp_day: 140, sbp_night: 200, dbp_night: 130 };
    expect(() => calc.compute(maxInputs)).not.toThrow();
  });
});
