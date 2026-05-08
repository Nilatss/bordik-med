/**
 * Golden tests for NAFLD Fibrosis Score (NFS, Angulo 2007).
 *
 * Reference: Angulo P, Hui JM, Marchesini G, et al. The NAFLD fibrosis
 * score: a noninvasive system that identifies liver fibrosis in
 * patients with NAFLD. Hepatology 2007;45(4):846-854.
 * doi:10.1002/hep.21496
 *
 * Formula: NFS = −1.675 + 0.037·age + 0.094·BMI + 1.13·(IFG/DM) +
 *               0.99·(AST/ALT) − 0.013·platelets − 0.66·albumin(g/dL)
 *
 * Cut-offs:
 *   < −1.455 → F0-F2 excluded (NPV 93%)
 *   > 0.676  → F3-F4 likely (PPV 90%)
 *   between  → indeterminate (~30%, secondary testing required)
 *
 * AASLD 2023 / EASL-EASD-EASO 2024 endorse NFS for non-invasive triage.
 */
import { describe, it, expect } from 'vitest';
import nfs from '@/lib/runners/nafld-fs';

interface NfsResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): NfsResult {
  const r = (nfs.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as NfsResult;
}

describe('nafld-fs · fibrosis triage', () => {
  it('young, normal BMI, normal labs → F0-F2 (low)', () => {
    const r = compute({ age: 35, bmi: 24, ifg_dm: '0', ast: 25, alt: 30, plt: 260, albumin: 4.3 });
    expect(parseFloat(r.value)).toBeLessThan(-1.455);
    expect(r.interpretation).toMatch(/F0–F2|искл/);
  });

  it('elderly, obese, DM, low platelets, low albumin → F3-F4 likely', () => {
    const r = compute({ age: 70, bmi: 36, ifg_dm: '1', ast: 90, alt: 60, plt: 100, albumin: 3.2 });
    expect(parseFloat(r.value)).toBeGreaterThan(0.676);
    expect(r.interpretation).toMatch(/F3–F4|вероят/);
  });

  it('borderline → indeterminate zone', () => {
    const r = compute({ age: 55, bmi: 30, ifg_dm: '1', ast: 50, alt: 50, plt: 200, albumin: 4.0 });
    expect(r.interpretation).toMatch(/Неопр/);
  });

  it('formula numeric verification — preset Низкий риск', () => {
    // age=40, bmi=26, ifg_dm=0, ast=30, alt=35, plt=260, albumin=4.3
    // NFS = -1.675 + 1.48 + 2.444 + 0 + 0.849 - 3.38 - 2.838 = -3.12
    const r = compute({ age: 40, bmi: 26, ifg_dm: '0', ast: 30, alt: 35, plt: 260, albumin: 4.3 });
    expect(parseFloat(r.value)).toBeCloseTo(-3.12, 1);
  });

  it('AST/ALT ratio matters — higher ratio = more fibrosis', () => {
    const baseline = { age: 50, bmi: 28, ifg_dm: '1', plt: 200, albumin: 4 };
    const lowRatio = compute({ ...baseline, ast: 30, alt: 60 });   // ratio 0.5
    const highRatio = compute({ ...baseline, ast: 60, alt: 30 });  // ratio 2.0
    expect(parseFloat(highRatio.value)).toBeGreaterThan(parseFloat(lowRatio.value));
  });

  it('low platelets push toward F3-F4', () => {
    const baseline = { age: 55, bmi: 32, ifg_dm: '1', ast: 60, alt: 50, albumin: 3.8 };
    const high = compute({ ...baseline, plt: 280 });
    const low = compute({ ...baseline, plt: 90 });
    expect(parseFloat(low.value)).toBeGreaterThan(parseFloat(high.value));
  });

  it('indeterminate zone recommends FibroScan / ELF', () => {
    const r = compute({ age: 55, bmi: 30, ifg_dm: '1', ast: 50, alt: 50, plt: 200, albumin: 4.0 });
    if (r.interpretation.includes('Неопр')) {
      expect(r.actions.some((a) => /fibroscan|эластограф|elf/i.test(a))).toBe(true);
    }
  });

  it('low-risk recommends 2-3y follow-up', () => {
    const r = compute({ age: 35, bmi: 24, ifg_dm: '0', ast: 25, alt: 30, plt: 260, albumin: 4.3 });
    expect(r.actions.some((a) => /2|3|год|year/i.test(a))).toBe(true);
  });
});
