/**
 * Golden tests for calculator runner 'bpi'.
 *
 * Auto-bootstrapped by scripts/gen-hand-tests.mjs to verify the compute
 * function returns a well-formed CalculatorResult for mid-range inputs.
 * More rigorous than the auto smoke-test which only checks runner shape.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/bpi';
import type { CalculatorTool, CalculatorResult } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('bpi · compute', () => {
  it('has kind calculator', () => {
    expect(calc.kind).toBe('calculator');
  });

  it('has non-empty inputs array', () => {
    expect(Array.isArray(calc.inputs)).toBe(true);
    expect(calc.inputs.length).toBeGreaterThan(0);
  });

  it('compute returns a result for mid-range inputs', () => {
    const result = calc.compute({ worst: 5, least: 5, average: 5, now: 5, iActivity: 5, iMood: 5, iWalk: 5, iWork: 5, iRel: 5, iSleep: 5, iEnjoy: 5 }) as CalculatorResult | null;
    expect(result).not.toBeNull();
    if (result) {
      // value can be number | string depending on runner
      expect(['number', 'string']).toContain(typeof result.value);
      // interpretation should be human-readable string
      expect(typeof result.interpretation === 'string' || result.interpretation === undefined).toBe(true);
    }
  });

  it('compute does not throw on edge values (min)', () => {
    const minInputs = { worst: 0, least: 0, average: 0, now: 0, iActivity: 0, iMood: 0, iWalk: 0, iWork: 0, iRel: 0, iSleep: 0, iEnjoy: 0 };
    expect(() => calc.compute(minInputs)).not.toThrow();
  });

  it('compute does not throw on edge values (max)', () => {
    const maxInputs = { worst: 10, least: 10, average: 10, now: 10, iActivity: 10, iMood: 10, iWalk: 10, iWork: 10, iRel: 10, iSleep: 10, iEnjoy: 10 };
    expect(() => calc.compute(maxInputs)).not.toThrow();
  });
});
