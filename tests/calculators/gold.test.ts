/**
 * Golden tests for GOLD ABE classification (COPD 2023).
 *
 * Reference: Global Initiative for Chronic Obstructive Lung Disease.
 * Global Strategy for the Diagnosis, Management, and Prevention of
 * Chronic Obstructive Pulmonary Disease: 2023 Report. www.goldcopd.org
 *
 * 2023 update collapsed prior C/D into single E (exacerbation-driven):
 *   A — low symptoms (CAT<10, mMRC 0-1) + ≤1 exac          → bronchodilator PRN
 *   B — high symptoms (CAT≥10, mMRC≥2) + ≤1 exac           → LABA + LAMA
 *   E — ≥2 moderate exac OR ≥1 hospitalised               → LABA+LAMA (+ICS if eos≥300)
 *
 * ICS escalation guided by blood eosinophils ≥300/μL (GOLD 2023).
 */
import { describe, it, expect } from 'vitest';
import gold from '@/lib/runners/gold';

interface GoldResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: { exac: string; sym: string }): GoldResult {
  const r = (gold.compute as (i: typeof input) => unknown)(input);
  return r as GoldResult;
}

describe('gold · ABE classification', () => {
  it('low exac + low symptoms → group A', () => {
    const r = compute({ exac: '0_1', sym: 'low' });
    expect(r.value).toBe('A');
    expect(r.interpretation.toLowerCase()).toMatch(/мало симптомов|prn|по требован/);
  });

  it('low exac + high symptoms → group B', () => {
    const r = compute({ exac: '0_1', sym: 'high' });
    expect(r.value).toBe('B');
    expect(r.interpretation.toLowerCase()).toMatch(/выраженные|laba|lama/);
  });

  it('≥2 exac (any symptoms) → group E', () => {
    const r1 = compute({ exac: 'ge2', sym: 'low' });
    const r2 = compute({ exac: 'ge2', sym: 'high' });
    expect(r1.value).toBe('E');
    expect(r2.value).toBe('E');
  });

  it('group E mentions eosinophil ICS threshold (300)', () => {
    const r = compute({ exac: 'ge2', sym: 'high' });
    const text = `${r.interpretation} ${r.details} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/300|эозиноф/);
  });

  it('group A recommends smoking cessation (only intervention altering disease course)', () => {
    const r = compute({ exac: '0_1', sym: 'low' });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/курени|smoking/);
  });

  it('group B uses dual LABA + LAMA bronchodilation', () => {
    const r = compute({ exac: '0_1', sym: 'high' });
    expect(r.interpretation.toLowerCase()).toMatch(/laba|lama/);
  });

  it('group E uses warning/severe colour', () => {
    const rA = compute({ exac: '0_1', sym: 'low' });
    const rE = compute({ exac: 'ge2', sym: 'high' });
    expect(rA.color).toMatch(/^#10|^#22/i); // green
    expect(rE.color).toMatch(/^#EF|^#DC/i); // red
  });
});
