/**
 * Golden tests for ACR TI-RADS (Thyroid Imaging Reporting and Data System).
 *
 * Reference: Tessler FN, Middleton WD, Grant EG, et al. ACR Thyroid
 * Imaging, Reporting and Data System (TI-RADS): White Paper of the ACR
 * TI-RADS Committee. J Am Coll Radiol 2017;14(5):587-595.
 * doi:10.1016/j.jacr.2017.01.046
 *
 * Levels (FNA threshold mm):
 *   TR1 — benign (~<1%)             never FNA
 *   TR2 — not suspicious (<3%)      never FNA
 *   TR3 — mildly suspicious (~5%)   FNA ≥25 mm; follow ≥15 mm
 *   TR4 — moderately (~5-20%)       FNA ≥15 mm; follow ≥10 mm
 *   TR5 — highly (>20%)             FNA ≥10 mm; follow ≥5 mm
 */
import { describe, it, expect } from 'vitest';
import tirads from '@/lib/runners/tirads';

interface TiradsResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): TiradsResult {
  const r = (tirads.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as TiradsResult;
}

describe('tirads · level assignment', () => {
  it('cystic node → TR1 (benign)', () => {
    const r = compute({ composition: '0', echogenicity: '0', shape: '0', margin: '0', foci: '0', size: 30 });
    expect(r.value).toMatch(/TR1/);
    expect(r.interpretation.toLowerCase()).toMatch(/benign|доброкач/);
  });

  it('spongiform node → TR1 regardless of other features', () => {
    const r = compute({ composition: '0_spong', echogenicity: '3', shape: '3', margin: '3', foci: '3', size: 30 });
    expect(r.value).toMatch(/TR1/);
  });

  it('all-features-positive solid hypoechoic → TR5 (highly suspicious)', () => {
    // composition solid (2) + very hypo (3) + taller (3) + extrathyroid (3) + punctate (3) = 14
    const r = compute({ composition: '2', echogenicity: '3', shape: '3', margin: '3', foci: '3', size: 12 });
    expect(r.value).toMatch(/TR5/);
    expect(r.unit).toMatch(/14/);
  });

  it('TR3 + size <15 mm → no follow-up', () => {
    // total=3 — solid (2) + hypo (1) + comet (0) + smooth (0) + width>height (0) = 3
    const r = compute({ composition: '2', echogenicity: '1', shape: '0', margin: '0', foci: '0', size: 10 });
    expect(r.value).toMatch(/TR3/);
    expect(r.details.toLowerCase()).toMatch(/не требуется|< 15/);
  });

  it('TR4 + size ≥15 mm → FNA indicated', () => {
    // total 4-6: solid (2) + hypoechoic (2) = 4 → TR4
    const r = compute({ composition: '2', echogenicity: '2', shape: '0', margin: '0', foci: '0', size: 18 });
    expect(r.value).toMatch(/TR4/);
    expect(r.details.toLowerCase()).toMatch(/fna показана|≥ 15/);
  });

  it('TR5 + size 10 mm → FNA at threshold', () => {
    const r = compute({ composition: '2', echogenicity: '3', shape: '3', margin: '3', foci: '3', size: 10 });
    expect(r.value).toMatch(/TR5/);
    expect(r.details.toLowerCase()).toMatch(/fna показана/);
  });

  it('TR5 + size 7 mm → follow-up only', () => {
    const r = compute({ composition: '2', echogenicity: '3', shape: '3', margin: '3', foci: '3', size: 7 });
    expect(r.value).toMatch(/TR5/);
    expect(r.details.toLowerCase()).toMatch(/контрол|узи-контрол/);
  });

  it('TR ≥4 advises endocrinologist consult', () => {
    const r = compute({ composition: '2', echogenicity: '2', shape: '0', margin: '0', foci: '0', size: 20 });
    expect(r.actions.some((a) => /эндокринолог|endocri/i.test(a))).toBe(true);
  });

  it('Bethesda mention in actions for FNA-eligible nodes', () => {
    const r = compute({ composition: '2', echogenicity: '2', shape: '0', margin: '0', foci: '0', size: 20 });
    expect(r.actions.some((a) => /bethesda/i.test(a))).toBe(true);
  });
});
