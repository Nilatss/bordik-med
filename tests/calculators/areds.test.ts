/**
 * Golden tests for AREDS Simplified Severity Scale (5-yr advanced AMD risk).
 *
 * Reference: Ferris FL, Davis MD, Clemons TE, et al. A simplified
 * severity scale for age-related macular degeneration: AREDS Report No.
 * 18. Arch Ophthalmol 2005;123(11):1570-1574.
 * doi:10.1001/archopht.123.11.1570
 *
 * AREDS2 Research Group. JAMA 2013;309:2005-2015.
 *
 * Scoring (per eye): +1 large drusen ≥125μm, +1 pigment changes.
 * Bilateral intermediate-only drusen → 1. Advanced AMD in fellow eye → 4.
 *
 * 5-year risk:
 *   0 → 0.5%
 *   1 → 3%
 *   2 → 12%
 *   3 → 25%
 *   4 → 50%
 */
import { describe, it, expect } from 'vitest';
import areds from '@/lib/runners/areds';

interface AredsResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): AredsResult {
  const r = (areds.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as AredsResult;
}

describe('areds · simplified severity scale', () => {
  it('no risk factors → 0 (0.5%)', () => {
    const r = compute({});
    expect(r.value).toBe('0');
    expect(r.unit).toMatch(/0\.5%/);
  });

  it('all 4 factors bilateral → 4 (50%)', () => {
    const r = compute({ largeDrusenOD: true, pigmentOD: true, largeDrusenOS: true, pigmentOS: true });
    expect(r.value).toBe('4');
    expect(r.interpretation.toLowerCase()).toMatch(/очень высокий/);
  });

  it('advanced AMD in fellow eye → automatic 4 regardless of other findings', () => {
    const r = compute({ advancedFellow: true });
    expect(r.value).toBe('4');
  });

  it('bilateral intermediate-only drusen (no large) → 1', () => {
    const r = compute({ bilateralIntermediate: true });
    expect(r.value).toBe('1');
  });

  it('large drusen OD + pigment OS → 2', () => {
    const r = compute({ largeDrusenOD: true, pigmentOS: true });
    expect(r.value).toBe('2');
  });

  it('AREDS ≥2 recommends AREDS2 vitamin formula', () => {
    const r = compute({ largeDrusenOD: true, pigmentOD: true });
    expect(r.actions.some((a) => /лютеин|zn|vit c|vit e|areds2/i.test(a))).toBe(true);
  });

  it('AREDS ≥3 recommends Amsler grid daily monitoring', () => {
    const r = compute({ largeDrusenOD: true, pigmentOD: true, pigmentOS: true });
    expect(r.actions.some((a) => /amsler|метаморфопс|мониторинг/i.test(a))).toBe(true);
  });

  it('β-carotene smoker warning in caveats (AREDS2 exclusion)', () => {
    const r = compute({ largeDrusenOD: true });
    // caveats array is on the result extras — check via unit if visible
    // alternatively detail/actions might mention smoking
    const text = `${r.details} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/курени|smoker|β-карот/);
  });
});
