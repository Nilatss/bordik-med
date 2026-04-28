/**
 * Golden tests for the A-a (alveolar-arterial) oxygen gradient.
 *
 * Reference: West JB. Respiratory Physiology — The Essentials, 11e, 2021.
 *
 * Formula:
 *   PAO2 (mmHg) = FiO₂ × (760 − 47) − PaCO₂ / 0.8
 *   A-a gradient = PAO2 − PaO2
 *   Expected upper limit ≈ age / 4 + 4 (room-air, sea-level)
 *
 * Bands the runner uses:
 *   gradient ≤ expected  → normal (hypoventilation / low FiO₂)
 *   gradient >  expected → V/Q mismatch / shunt / diffusion problem
 */
import { describe, it, expect } from 'vitest';
import aag from '@/lib/runners/aa-gradient';

interface AaResult {
  value: string;
  interpretation: string;
}

function call(fio2Pct: number, paco2: number, pao2: number, age: number): AaResult {
  return (aag.compute as (input: { fio2: number; paco2: number; pao2: number; age: number }) => unknown)({
    fio2: fio2Pct, paco2, pao2, age,
  }) as AaResult;
}

describe('aa-gradient · compute', () => {
  it('young healthy on room air — normal gradient', () => {
    // FiO2 21%, PaCO2 40, PaO2 95, age 25
    // PAO2 = 0.21*713 − 50 = 149.73 − 50 = 99.73
    // gradient = 99.73 − 95 = 4.73
    // expected = 25/4 + 4 = 10.25 → 4.73 ≤ 10.25 → normal
    const r = call(21, 40, 95, 25);
    expect(parseFloat(r.value)).toBeGreaterThan(0);
    expect(parseFloat(r.value)).toBeLessThan(10);
    expect(r.interpretation).toMatch(/норме/i);
  });

  it('elderly normal A-a (age threshold 22)', () => {
    // age 80 → expected = 24
    // FiO2 21, PaCO2 40, PaO2 80 → PAO2 99.73 − PaO2 80 = ~20 ≤ 24 → normal
    const r = call(21, 40, 80, 80);
    expect(r.interpretation).toMatch(/норме/i);
  });

  it('PE-style sudden hypoxemia — wide gradient', () => {
    // FiO2 21, PaCO2 32 (hyperventilating), PaO2 55, age 50
    // PAO2 = 0.21*713 − 40 = 109.73; gradient = 109.73−55 = 54.7
    // expected age 50: 50/4+4 = 16.5 → 54.7 > 16.5 → ABNORMAL
    const r = call(21, 32, 55, 50);
    expect(parseFloat(r.value)).toBeGreaterThan(40);
    expect(r.interpretation).toMatch(/Повышен/);
  });

  it('opioid OD — hypoventilation pattern, normal gradient', () => {
    // FiO2 21, PaCO2 70 (hypoventilating), PaO2 60, age 30
    // PAO2 = 0.21*713 − 87.5 = 62.23
    // gradient = 62.23 − 60 = 2.23 ≤ 11.5 → NORMAL gradient (just hypovent)
    const r = call(21, 70, 60, 30);
    expect(parseFloat(r.value)).toBeLessThan(11);
    expect(r.interpretation).toMatch(/норме/i);
  });

  it('100% FiO2 with persistent gradient — shunt physiology', () => {
    // FiO2 100, PaCO2 40, PaO2 200, age 60
    // PAO2 = 1.0*713 − 50 = 663; gradient = 663−200 = 463
    // expected 60/4+4 = 19 → way above → abnormal
    const r = call(100, 40, 200, 60);
    expect(parseFloat(r.value)).toBeGreaterThan(400);
    expect(r.interpretation).toMatch(/Повышен/);
  });
});
