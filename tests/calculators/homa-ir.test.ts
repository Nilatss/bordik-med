/**
 * Golden tests for HOMA-IR (Homeostatic Model Assessment of Insulin Resistance).
 *
 * Reference: Matthews DR, Hosker JP, Rudenski AS, Naylor BA, Treacher
 * DF, Turner RC. Homeostasis model assessment: insulin resistance and
 * beta-cell function from fasting plasma glucose and insulin
 * concentrations in man. Diabetologia 1985;28(7):412-419.
 * doi:10.1007/BF00280883
 *
 * Formula: HOMA-IR = glucose (mmol/L) × insulin (μU/mL) / 22.5
 *
 * Bands:
 *   <2.0    → normal (no IR)
 *   2.0-2.7 → borderline
 *   2.7-5.0 → IR present (pre-DM, T2DM, NAFLD, PCOS)
 *   ≥5.0    → severe IR
 */
import { describe, it, expect } from 'vitest';
import homa from '@/lib/runners/homa-ir';

interface HomaResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(glu: number, ins: number): HomaResult {
  const r = (homa.compute as (i: { glu: number; ins: number }) => unknown)({ glu, ins });
  return r as HomaResult;
}

describe('homa-ir · insulin resistance bands', () => {
  it('formula numeric — glucose 5 × insulin 4.5 / 22.5 = 1.0 (normal)', () => {
    const r = compute(5, 4.5);
    expect(parseFloat(r.value)).toBeCloseTo(1.0, 1);
    expect(r.interpretation).toMatch(/Норма/);
  });

  it('borderline — HOMA ~2.5 (glucose 5.5 × insulin 10 / 22.5 ≈ 2.44)', () => {
    const r = compute(5.5, 10);
    expect(parseFloat(r.value)).toBeCloseTo(2.44, 1);
    expect(r.interpretation).toMatch(/Погранич/);
  });

  it('IR present — HOMA 3.0-5.0 (glucose 6 × insulin 15 / 22.5 = 4.0)', () => {
    const r = compute(6, 15);
    expect(parseFloat(r.value)).toBeCloseTo(4.0, 1);
    expect(r.interpretation.toLowerCase()).toMatch(/инсулинорез/);
  });

  it('severe IR — HOMA ≥5 (glucose 8 × insulin 30 / 22.5 = 10.67)', () => {
    const r = compute(8, 30);
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(5);
    expect(r.interpretation.toLowerCase()).toMatch(/выраженная|severe/);
  });

  it('IR band recommends HbA1c + OGTT', () => {
    const r = compute(6, 15);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/hba1c|огтт|ogtt/);
  });

  it('IR band mentions PCOS/NAFLD differential', () => {
    const r = compute(6, 15);
    const text = `${r.details} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/нажбп|пкоя|наф|спк/i);
  });

  it('higher insulin → higher HOMA monotonically', () => {
    const a = compute(5.5, 5);
    const b = compute(5.5, 20);
    expect(parseFloat(b.value)).toBeGreaterThan(parseFloat(a.value));
  });

  it('higher glucose → higher HOMA monotonically', () => {
    const a = compute(4.5, 10);
    const b = compute(8, 10);
    expect(parseFloat(b.value)).toBeGreaterThan(parseFloat(a.value));
  });
});
