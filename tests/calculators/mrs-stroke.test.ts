/**
 * Golden tests for modified Rankin Scale (mRS, stroke functional outcome).
 *
 * Reference: van Swieten JC, Koudstaal PJ, Visser MC, Schouten HJ, van
 * Gijn J. Interobserver agreement for the assessment of handicap in
 * stroke patients. Stroke 1988;19(5):604-607.
 * doi:10.1161/01.STR.19.5.604
 *
 * 7-point ordinal:
 *   0  no symptoms
 *   1  no significant disability
 *   2  slight disability                ← ≤2 = "favourable" cut-off
 *   3  moderate disability
 *   4  moderately severe
 *   5  severe
 *   6  death
 *
 * Standard "good outcome" in modern RCTs (thrombolysis, thrombectomy) =
 * mRS ≤2 at 90 days. Standard assessment day 90 (early scoring inflates).
 */
import { describe, it, expect } from 'vitest';
import mrs from '@/lib/runners/mrs-stroke';

interface MrsResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(score: number): MrsResult {
  const r = (mrs.compute as (i: { score: number }) => unknown)({ score });
  return r as MrsResult;
}

describe('mrs-stroke · functional outcome', () => {
  it('mRS 0 → favourable', () => {
    const r = compute(0);
    expect(r.interpretation).toMatch(/Благоприятный/);
    expect(r.color).toMatch(/^#10|^#22/i); // green
  });

  it('mRS 2 → favourable (≤2 cut-off)', () => {
    const r = compute(2);
    expect(r.interpretation).toMatch(/Благоприятный/);
  });

  it('mRS 3 → unfavourable (boundary)', () => {
    const r = compute(3);
    expect(r.interpretation).toMatch(/Неблагоприятный/);
  });

  it('mRS 6 (death) → unfavourable', () => {
    const r = compute(6);
    expect(r.interpretation).toMatch(/Неблагоприятный/);
    expect(r.color).toMatch(/^#EF|^#DC/i); // red
  });

  it('favourable band recommends secondary prevention + TOAST etiology', () => {
    const r = compute(1);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/антитромбот|статин|toast|вторичная профилактика/);
  });

  it('unfavourable band emphasises rehabilitation', () => {
    const r = compute(4);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/реабилитац|лфк|логопед|ot|ранн.*мобилизац/);
  });

  it('unfavourable band screens for post-stroke depression (PHQ-9) + cognition (MoCA)', () => {
    const r = compute(4);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/phq-9|moca|депресси|когнит/);
  });

  it('value reported as mRS unit', () => {
    const r = compute(2);
    expect(r.unit).toBe('mRS');
  });
});
