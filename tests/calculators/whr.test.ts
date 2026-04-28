/**
 * Golden tests for Waist-to-Hip Ratio (WHO 2008 cut-offs).
 *
 * Reference: WHO. Waist Circumference and Waist-Hip Ratio:
 *   Report of a WHO Expert Consultation. Geneva, 2008.
 *
 * Cut-offs:
 *   Male:   ≥ 0.90 → high risk
 *   Female: 0.80–0.84 → moderate, ≥ 0.85 → high
 */
import { describe, it, expect } from 'vitest';
import whr from '@/lib/runners/whr';

interface WhrResult {
  value: string;
  interpretation: string;
}

function call(waist: number, hip: number, female: boolean): WhrResult {
  return (whr.compute as (input: { waist: number; hip: number; female: boolean }) => unknown)({
    waist, hip, female,
  }) as WhrResult;
}

describe('whr · compute', () => {
  it('male, low risk (0.85)', () => {
    const r = call(85, 100, false);
    expect(r.value).toBe('0.85');
    expect(r.interpretation).toBe('Низкий риск');
  });

  it('male, high risk at 0.90 boundary', () => {
    const r = call(90, 100, false);
    expect(r.value).toBe('0.90');
    expect(r.interpretation).toMatch(/Высокий/);
  });

  it('female, low risk (0.75)', () => {
    const r = call(75, 100, true);
    expect(r.value).toBe('0.75');
    expect(r.interpretation).toBe('Низкий риск');
  });

  it('female, moderate risk at 0.80 boundary', () => {
    const r = call(80, 100, true);
    expect(r.value).toBe('0.80');
    expect(r.interpretation).toMatch(/Умеренный/);
  });

  it('female, high risk at 0.85 boundary', () => {
    const r = call(85, 100, true);
    expect(r.value).toBe('0.85');
    expect(r.interpretation).toMatch(/Высокий/);
  });

  it('male sex has no moderate band — jumps low → high', () => {
    const r = call(89, 100, false); // 0.89 — below 0.90 cutoff
    expect(r.interpretation).toBe('Низкий риск');
    const r2 = call(91, 100, false); // 0.91 — above 0.90 cutoff
    expect(r2.interpretation).toMatch(/Высокий/);
  });
});
