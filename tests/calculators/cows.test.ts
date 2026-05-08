/**
 * Golden tests for COWS (Clinical Opiate Withdrawal Scale).
 *
 * Reference: Wesson DR, Ling W. The Clinical Opiate Withdrawal Scale
 * (COWS). J Psychoactive Drugs 2003;35(2):253-259.
 * doi:10.1080/02791072.2003.10400007
 *
 * Bands (max 48):
 *   <5    → minimal       observation
 *   5-12  → mild          symptomatic care; wait for COWS ≥12 before BUP
 *   13-24 → moderate      BUP induction at ≥12 (avoid precipitated WD)
 *   25-36 → mod-severe    BUP induction; clonidine; close monitor
 *   ≥37   → severe        inpatient detox; methadone or BUP, symptomatic
 *
 * Critical: BUP induction below COWS ≥12 → precipitated withdrawal.
 * Pregnancy: methadone or BUP mono — NOT clonidine first-line.
 */
import { describe, it, expect } from 'vitest';
import cows from '@/lib/runners/cows';

interface CowsResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: { total: number; pregnant?: boolean }): CowsResult {
  const r = (cows.compute as (i: typeof input) => unknown)(input);
  return r as CowsResult;
}

describe('cows · severity bands', () => {
  it('total 3 → minimal, observation only', () => {
    const r = compute({ total: 3 });
    expect(r.interpretation.toLowerCase()).toMatch(/минимальн/);
    expect(r.color).toMatch(/^#22|^#10/i); // green
  });

  it('total 8 → mild, advises waiting for ≥12 before BUP', () => {
    const r = compute({ total: 8 });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/преципитирован|≥12|≥ 12/);
  });

  it('total 18 → moderate, BUP induction OK at ≥12', () => {
    const r = compute({ total: 18 });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/бупренорфин|метадон/);
  });

  it('total 30 → mod-severe', () => {
    const r = compute({ total: 30 });
    expect(r.interpretation.toLowerCase()).toMatch(/умеренно-тяжёл|25-36/);
  });

  it('total 40 → severe, inpatient detox', () => {
    const r = compute({ total: 40 });
    expect(r.interpretation.toLowerCase()).toMatch(/тяжёл|≥37/);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/стационар|детокс/);
  });

  it('pregnancy override prepends specific note', () => {
    const r = compute({ total: 18, pregnant: true });
    const first = r.actions[0]!.toLowerCase();
    expect(first).toMatch(/беременн/);
    expect(first).toMatch(/метадон|бупренорфин/);
  });

  it('pregnancy warning — no clonidine first-line, no naloxone unless life-threatening', () => {
    const r = compute({ total: 18, pregnant: true });
    const text = r.actions[0]!.toLowerCase();
    expect(text).toMatch(/клонидин|налоксон/);
  });

  it('total clamped to [0..48]', () => {
    expect(compute({ total: -3 }).value).toBe('0');
    expect(compute({ total: 100 }).value).toBe('48');
  });
});
