/**
 * Golden tests for Maddrey Discriminant Function (alcoholic hepatitis).
 *
 * Reference: Maddrey WC, Boitnott JK, Bedine MS, Weber FL Jr, Mezey E,
 * White RI Jr. Corticosteroid therapy of alcoholic hepatitis.
 * Gastroenterology 1978;75(2):193-199. AASLD 2020 ALD Guidance.
 *
 * Formula: DF = 4.6 × (PT − PT_control) + bilirubin (mg/dL)
 * Note: input bilirubin is μmol/L → divided by 17.1 for mg/dL conversion.
 *
 * Bands:
 *   <20      → mild
 *   20-31    → moderate
 *   ≥32      → severe → corticosteroid candidacy (prednisolone 40 mg × 28d)
 */
import { describe, it, expect } from 'vitest';
import maddrey from '@/lib/runners/maddrey-lab';

interface MaddreyResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): MaddreyResult {
  const r = (maddrey.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as MaddreyResult;
}

describe('maddrey-lab · DF + AST/ALT pattern', () => {
  it('normal PT, slight bili → mild (DF <20)', () => {
    // PT 13, ctrl 12, bili 30 μmol/L = 1.75 mg/dL
    // DF = 4.6*(13-12) + 1.75 = 4.6 + 1.75 = 6.35
    const r = compute({ pt: 13, pt_ctrl: 12, bili: 30, ast: 80, alt: 40 });
    expect(parseFloat(r.value)).toBeLessThan(20);
    expect(r.interpretation).toMatch(/Лёгкий АГ/);
  });

  it('moderate PT prolongation + bili → moderate (DF 20-31)', () => {
    // PT 16, ctrl 12, bili 200 μmol/L = 11.7 mg/dL
    // DF = 4.6*4 + 11.7 = 30.3
    const r = compute({ pt: 16, pt_ctrl: 12, bili: 200, ast: 100, alt: 50 });
    const v = parseFloat(r.value);
    expect(v).toBeGreaterThanOrEqual(20);
    expect(v).toBeLessThan(32);
    expect(r.interpretation).toMatch(/Умеренный/);
  });

  it('severe (DF ≥32) → corticosteroid candidacy', () => {
    // PT 25, ctrl 12, bili 400 μmol/L = 23.4 mg/dL
    // DF = 4.6*13 + 23.4 = 83.2
    const r = compute({ pt: 25, pt_ctrl: 12, bili: 400, ast: 200, alt: 80 });
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(32);
    expect(r.interpretation).toMatch(/Тяжёлый/);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/преднизолон|гкс|стероид/);
  });

  it('formula numeric verification — DF ≈ 30.1 for preset', () => {
    // DF = 4.6 × (16-12) + 200/17.1 = 18.4 + 11.696 ≈ 30.10
    const r = compute({ pt: 16, pt_ctrl: 12, bili: 200, ast: 100, alt: 50 });
    expect(parseFloat(r.value)).toBeCloseTo(30.1, 1);
  });

  it('AST/ALT >2 + ALT <400 → alcoholic pattern flagged in actions', () => {
    const r = compute({ pt: 18, pt_ctrl: 12, bili: 250, ast: 200, alt: 80 });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/алкогольн/);
  });

  it('Lille Score mention in severe band actions', () => {
    const r = compute({ pt: 25, pt_ctrl: 12, bili: 400, ast: 200, alt: 80 });
    expect(r.actions.some((a) => /lille/i.test(a))).toBe(true);
  });

  it('bilirubin scaling — μmol/L conversion to mg/dL', () => {
    // bili=171 μmol/L → 10 mg/dL exactly. DF = 4.6*0 + 10 = 10 (with PT=ctrl)
    const r = compute({ pt: 12, pt_ctrl: 12, bili: 171, ast: 50, alt: 30 });
    expect(parseFloat(r.value)).toBeCloseTo(10, 0);
  });

  it('result reports unit DF + AST/ALT ratio in interpretation', () => {
    const r = compute({ pt: 14, pt_ctrl: 12, bili: 50, ast: 120, alt: 40 });
    expect(r.unit).toBe('DF');
    expect(r.interpretation).toMatch(/АСТ\/АЛТ\s*=\s*3\.00/);
  });
});
