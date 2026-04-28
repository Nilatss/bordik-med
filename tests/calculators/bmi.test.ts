/**
 * Golden tests for the BMI calculator.
 *
 * Reference: WHO Expert Committee on Physical Status (1995) +
 * WHO Consultation on Obesity (2000). Cutoffs match the standard
 * adult European thresholds: <18.5, 18.5–24.9, 25–29.9, 30–34.9,
 * 35–39.9, ≥40.
 *
 * Each test pairs an explicit (weight, height) input with the BMI value
 * we expect to produce and the band label the runner is supposed to
 * surface. Boundary cases are at the exact cut-offs (18.5, 25, 30, 35,
 * 40) — those are the most error-prone in the if-else chain.
 */
import { describe, it, expect } from 'vitest';
import bmiRunner from '@/lib/runners/bmi';

interface BmiResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
  caveats: string[];
}

function compute(weight: number, heightCm: number): BmiResult {
  // The runner's compute is loosely typed (// @ts-nocheck). We cast
  // through `unknown` because it's auto-generated; the test acts as
  // the type guard.
  const r = (bmiRunner.compute as (input: { weight: number; height: number }) => unknown)({
    weight,
    height: heightCm,
  });
  return r as BmiResult;
}

describe('bmi · compute', () => {
  it('classifies severe underweight', () => {
    const r = compute(40, 170); // 40 / 1.70² ≈ 13.84
    expect(r.value).toBe('13.8');
    expect(r.unit).toBe('кг/м²');
    expect(r.interpretation).toBe('Недостаточная масса тела');
  });

  it('classifies normal weight at lower bound (18.5 boundary)', () => {
    // exactly 18.5 should be "normal", not "underweight"
    const r = compute(53.465, 170); // ≈ 18.50
    expect(r.value).toBe('18.5');
    expect(r.interpretation).toBe('Нормальная масса тела');
  });

  it('classifies normal weight (mid-range)', () => {
    const r = compute(70, 175); // 70 / 1.75² = 22.86
    expect(r.value).toBe('22.9');
    expect(r.interpretation).toBe('Нормальная масса тела');
  });

  it('classifies overweight (25 boundary)', () => {
    const r = compute(81.625, 180.5); // 81.625 / 1.805² ≈ 25.0
    // ~25.0 — must be overweight (>=25)
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(25);
    expect(parseFloat(r.value)).toBeLessThan(26);
    expect(r.interpretation).toBe('Избыточная масса тела');
  });

  it('classifies obesity I at lower bound (30 boundary)', () => {
    const r = compute(97.875, 180.5); // ≈ 30.0
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(30);
    expect(parseFloat(r.value)).toBeLessThan(31);
    expect(r.interpretation).toBe('Ожирение I степени');
  });

  it('classifies obesity II', () => {
    const r = compute(115, 180); // 115 / 1.80² ≈ 35.49
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(35);
    expect(parseFloat(r.value)).toBeLessThan(40);
    expect(r.interpretation).toBe('Ожирение II степени');
  });

  it('classifies obesity III (morbid, ≥40)', () => {
    const r = compute(130, 175); // 130 / 1.75² ≈ 42.45
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(40);
    expect(r.interpretation).toMatch(/Ожирение III/);
  });

  it('returns the four required fields', () => {
    const r = compute(70, 175);
    expect(typeof r.value).toBe('string');
    expect(typeof r.interpretation).toBe('string');
    expect(typeof r.details).toBe('string');
    expect(Array.isArray(r.actions)).toBe(true);
  });

  it('always returns a colour (severity hint)', () => {
    for (const [w, h] of [[40, 170], [70, 175], [85, 175], [95, 170], [115, 170], [140, 170]]) {
      const r = compute(w as number, h as number);
      expect(r.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('caveats include the muscle-vs-fat note (clinical reminder)', () => {
    const r = compute(70, 175);
    expect(r.caveats.some((c: string) => /спортсмены|мышц/i.test(c))).toBe(true);
  });
});
