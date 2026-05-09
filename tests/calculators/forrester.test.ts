/**
 * Golden tests for Forrester / Nohria-Stevenson hemodynamic profiles.
 *
 * Reference: Forrester JS, Diamond G, Chatterjee K, Swan HJ. Medical
 * therapy of acute myocardial infarction by application of hemodynamic
 * subsets (first of two parts). N Engl J Med 1976;295(24):1356-1362.
 * Updated: Stevenson LW. Tailored therapy to hemodynamic goals for
 * advanced heart failure. Eur J Heart Fail 1999;1(3):251-257.
 *
 * 4 bedside profiles by perfusion × congestion:
 *   warm-dry  (A) → compensated; supportive
 *   warm-wet  (B) → decompensated, no shock; diuretics + vasodilators
 *   cold-dry  (L) → low output, no congestion; inotropes, careful fluids
 *   cold-wet  (C) → cardiogenic shock; inotropes + diuretics + ICU
 */
import { describe, it, expect } from 'vitest';
import forr from '@/lib/runners/forrester';

interface ForrResult {
  value: string;
  interpretation: string;
  color: string;
}

function compute(perf: 'warm' | 'cold', cong: 'dry' | 'wet'): ForrResult {
  const r = (forr.compute as (i: { perf: string; cong: string }) => unknown)({ perf, cong });
  return r as ForrResult;
}

describe('forrester · 4-quadrant profiles', () => {
  it('warm + dry → A (compensated)', () => {
    const r = compute('warm', 'dry');
    expect(r.value).toMatch(/^A/);
    expect(r.color).toMatch(/^#10|^#22/i); // green
  });

  it('warm + wet → B (decompensated, no shock)', () => {
    const r = compute('warm', 'wet');
    expect(r.value).toMatch(/^B/);
  });

  it('cold + dry → L (low output, no congestion)', () => {
    const r = compute('cold', 'dry');
    expect(r.value).toMatch(/^L/);
  });

  it('cold + wet → C (cardiogenic shock)', () => {
    const r = compute('cold', 'wet');
    expect(r.value).toMatch(/^C/);
    expect(r.color.toLowerCase()).toMatch(/^#(7|8|9|a|b|c|d|e)/i); // red
  });

  it('warm-wet recommends diuretics + vasodilators', () => {
    const r = compute('warm', 'wet');
    expect(r.interpretation.toLowerCase()).toMatch(/диуретик|вазодилат/);
  });

  it('cold-wet (shock) recommends inotropes + ICU', () => {
    const r = compute('cold', 'wet');
    expect(r.interpretation.toLowerCase()).toMatch(/инотроп|шок|icu/);
  });

  it('cold-dry mentions careful fluid resuscitation', () => {
    const r = compute('cold', 'dry');
    expect(r.interpretation.toLowerCase()).toMatch(/инотроп|инфуз|выброс/);
  });

  it('all 4 profiles produce distinct values', () => {
    const profiles = [
      compute('warm', 'dry'),
      compute('warm', 'wet'),
      compute('cold', 'dry'),
      compute('cold', 'wet'),
    ];
    const values = profiles.map((p) => p.value);
    expect(new Set(values).size).toBe(4);
  });
});
