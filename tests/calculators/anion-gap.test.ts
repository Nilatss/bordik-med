/**
 * Golden tests for Anion Gap.
 *
 * Reference: Emmett & Narins, "Clinical Use of the Anion Gap"
 *   Medicine (Baltimore) 1977; 56(1):38–54.
 *
 * Formula: AG = Na⁺ − (Cl⁻ + HCO₃⁻)
 *
 * Bands the runner uses:
 *   < 3        Low AG (hypoalbuminemia / paraproteinemia)
 *   3 – 11     Normal (8–12 mmol/L window after modern ISE analyzers)
 *   > 11       High AG → MUDPILES differential
 */
import { describe, it, expect } from 'vitest';
import ag from '@/lib/runners/anion-gap';

interface AgResult {
  value: string;
  interpretation: string;
  differential?: { term: string; desc: string }[];
}

function call(na: number, cl: number, hco3: number): AgResult {
  return (ag.compute as (input: { na: number; cl: number; hco3: number }) => unknown)({
    na, cl, hco3,
  }) as AgResult;
}

describe('anion-gap · compute', () => {
  it('normal — Na 140, Cl 105, HCO3 25 → AG 10', () => {
    const r = call(140, 105, 25);
    expect(parseFloat(r.value)).toBe(10);
    expect(r.interpretation).toMatch(/Нормальный/);
  });

  it('high AG — Na 140, Cl 100, HCO3 15 → AG 25', () => {
    const r = call(140, 100, 15);
    expect(parseFloat(r.value)).toBe(25);
    expect(r.interpretation).toMatch(/Высокий/);
    // MUDPILES differential should be present for high AG
    expect(r.differential).toBeDefined();
    expect(r.differential!.length).toBeGreaterThan(5);
  });

  it('low AG — Na 132, Cl 100, HCO3 30 → AG 2', () => {
    const r = call(132, 100, 30);
    expect(parseFloat(r.value)).toBe(2);
    expect(r.interpretation).toMatch(/Низкий/);
  });

  it('upper-normal boundary — AG 11', () => {
    // Na 141, Cl 105, HCO3 25 → 11
    const r = call(141, 105, 25);
    expect(parseFloat(r.value)).toBe(11);
    expect(r.interpretation).toMatch(/Нормальный/);
  });

  it('just above normal — AG 12 → high band', () => {
    // Na 142, Cl 105, HCO3 25 → 12
    const r = call(142, 105, 25);
    expect(parseFloat(r.value)).toBe(12);
    expect(r.interpretation).toMatch(/Высокий/);
  });

  it('clinical DKA case — Na 138, Cl 95, HCO3 8 → AG 35', () => {
    const r = call(138, 95, 8);
    expect(parseFloat(r.value)).toBe(35);
    expect(r.interpretation).toMatch(/Высокий/);
  });
});
