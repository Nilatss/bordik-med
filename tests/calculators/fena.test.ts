/**
 * Golden tests for calculator runner 'fena'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify the compute
 * function returns a well-formed CalculatorResult for mid-range inputs.
 * More rigorous than the auto smoke-test which only checks runner shape.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/fena';
import type { CalculatorTool, CalculatorResult } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('fena · compute', () => {
  it('has kind calculator', () => {
    expect(calc.kind).toBe('calculator');
  });

  it('has non-empty inputs array', () => {
    expect(Array.isArray(calc.inputs)).toBe(true);
    expect(calc.inputs.length).toBeGreaterThan(0);
  });

  it('compute returns a result for mid-range inputs', () => {
    const result = calc.compute({ u_na: 251, p_cr: 1005, p_na: 140, u_cr: 15050 }) as CalculatorResult | null;
    expect(result).not.toBeNull();
    if (result) {
      // value can be number | string depending on runner
      expect(['number', 'string']).toContain(typeof result.value);
      // interpretation should be human-readable string
      expect(typeof result.interpretation === 'string' || result.interpretation === undefined).toBe(true);
    }
  });

  it('compute does not throw on edge values (min)', () => {
    const minInputs = { u_na: 1, p_cr: 10, p_na: 100, u_cr: 100 };
    expect(() => calc.compute(minInputs)).not.toThrow();
  });

  it('compute does not throw on edge values (max)', () => {
    const maxInputs = { u_na: 500, p_cr: 2000, p_na: 180, u_cr: 30000 };
    expect(() => calc.compute(maxInputs)).not.toThrow();
  });
});
