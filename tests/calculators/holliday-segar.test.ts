/**
 * Golden tests for Holliday-Segar paediatric maintenance fluids.
 *
 * Reference: Holliday MA, Segar WE. The maintenance need for water in
 *   parenteral fluid therapy. Pediatrics. 1957;19(5):823–32.
 *
 * "4-2-1" rule per kg/hour:
 *   first 10 kg →  4 mL/kg/h
 *   next  10 kg →  2 mL/kg/h
 *   thereafter  →  1 mL/kg/h
 *
 * Daily volume = hourly × 24.
 */
import { describe, it, expect } from 'vitest';
import hs from '@/lib/runners/holliday-segar';

interface HsResult {
  value: string;     // "X мл/ч"
  unit: string;      // "(Y мл/сут)"
}

function call(weight: number): HsResult {
  return (hs.compute as (input: { weight: number }) => unknown)({ weight }) as HsResult;
}

function hourly(r: HsResult): number {
  const m = r.value.match(/(\d+(?:\.\d+)?)/);
  return m && m[1] ? parseFloat(m[1]) : NaN;
}

describe('holliday-segar · compute', () => {
  it('5 kg → 20 mL/h (within first 10 kg band)', () => {
    expect(hourly(call(5))).toBe(20);
  });

  it('10 kg → 40 mL/h (boundary of first band)', () => {
    expect(hourly(call(10))).toBe(40);
  });

  it('15 kg → 50 mL/h (40 + 5*2)', () => {
    expect(hourly(call(15))).toBe(50);
  });

  it('20 kg → 60 mL/h (boundary of 2nd band)', () => {
    expect(hourly(call(20))).toBe(60);
  });

  it('30 kg → 70 mL/h (60 + 10*1)', () => {
    expect(hourly(call(30))).toBe(70);
  });

  it('70 kg adult-size → 110 mL/h', () => {
    expect(hourly(call(70))).toBe(110);
  });

  it('daily total = hourly × 24', () => {
    const r = call(15);
    expect(hourly(r)).toBe(50);
    const m = r.unit.match(/(\d+)/);
    expect(m && m[1] && parseInt(m[1])).toBe(50 * 24);
  });
});
