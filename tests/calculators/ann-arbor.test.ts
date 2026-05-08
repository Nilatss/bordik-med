/**
 * Golden tests for Ann Arbor / Cotswolds / Lugano staging (lymphoma).
 *
 * Reference: Lister TA et al. Report of a committee convened to discuss
 * the evaluation and staging of patients with Hodgkin disease:
 * Cotswolds meeting. J Clin Oncol 1989;7:1630-1636.
 * Cheson BD et al. Lugano classification. J Clin Oncol 2014;32:
 * 3059-3068. doi:10.1200/JCO.2013.54.8800
 *
 * Stages:
 *   I    one nodal region
 *   II   ≥2 regions same side of diaphragm
 *   III  both sides of diaphragm
 *   IV   diffuse extranodal involvement
 *
 * Modifiers: A/B (B-symptoms), E (extranodal), S (spleen), X (bulky).
 */
import { describe, it, expect } from 'vitest';
import aa from '@/lib/runners/ann-arbor';

interface AaResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): AaResult {
  const r = (aa.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as AaResult;
}

describe('ann-arbor · staging', () => {
  it('Stage IIA, no modifiers → "IIA"', () => {
    const r = compute({ stage: 'II', symptoms: false, extranodal: false, spleen: false, bulky: false });
    expect(r.value).toBe('IIA');
    expect(r.interpretation).toMatch(/Ann Arbor IIA/);
  });

  it('Stage IIIB + spleen → "IIIBS"', () => {
    const r = compute({ stage: 'III', symptoms: true, extranodal: false, spleen: true, bulky: false });
    expect(r.value).toBe('IIIBS');
  });

  it('Stage IVB + extranodal + bulky → "IVBEX"', () => {
    const r = compute({ stage: 'IV', symptoms: true, extranodal: true, spleen: false, bulky: true });
    expect(r.value).toBe('IVBEX');
  });

  it('B symptoms convert A → B in suffix', () => {
    const a = compute({ stage: 'II', symptoms: false, extranodal: false, spleen: false, bulky: false });
    const b = compute({ stage: 'II', symptoms: true, extranodal: false, spleen: false, bulky: false });
    expect(a.value).toBe('IIA');
    expect(b.value).toBe('IIB');
  });

  it('Early favourable I-II without B and without bulky → ABVD × 2-4 + ISRT 20 Gy', () => {
    const r = compute({ stage: 'I', symptoms: false, extranodal: false, spleen: false, bulky: false });
    expect(r.details.toLowerCase()).toMatch(/abvd|ранняя благоприятная|isrt|20 gy/);
  });

  it('Advanced (III-IV) recommends ABVD × 6 / BEACOPPesc / PET-adapted', () => {
    const r = compute({ stage: 'III', symptoms: true, extranodal: false, spleen: false, bulky: false });
    expect(r.details.toLowerCase()).toMatch(/продвинутая|abvd|beacopp|pet-адапт/);
  });

  it('Bulky disease note appears when X modifier set', () => {
    const r = compute({ stage: 'II', symptoms: false, extranodal: false, spleen: false, bulky: true });
    expect(r.details.toLowerCase()).toMatch(/bulky|консолидац|лт/);
  });

  it('Color escalates with stage', () => {
    const stages = ['I', 'II', 'III', 'IV'].map((s) =>
      compute({ stage: s, symptoms: false, extranodal: false, spleen: false, bulky: false }).color,
    );
    expect(new Set(stages).size).toBe(4);
  });
});
