/**
 * Golden tests for Breslow thickness + T-stage (melanoma, AJCC 8).
 *
 * Reference: Breslow A. Thickness, cross-sectional areas and depth of
 * invasion in the prognosis of cutaneous melanoma. Ann Surg 1970;172(5):
 * 902-908. AJCC Cancer Staging Manual 8th ed. (2017).
 *
 * AJCC 8 thresholds (2018 update):
 *   <0.8 без ulc → T1a
 *   <0.8 с ulc OR 0.8-1.0 → T1b
 *   1.0-2.0 → T2a/b
 *   2.0-4.0 → T3a/b
 *   >4.0 → T4a/b
 *
 * 5-year survival (stage I-II):
 *   T1a 99% / T1b 93% / T2 94 (no ulc) / 82 (ulc) / T3 88 / 68 / T4 75 / 54
 */
import { describe, it, expect } from 'vitest';
import bres from '@/lib/runners/breslow';

interface BresResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): BresResult {
  const r = (bres.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as BresResult;
}

describe('breslow · T-stage assignment', () => {
  it('thickness 0.5, no ulc → T1a', () => {
    const r = compute({ thickness: 0.5, ulceration: false, mitosis: false, clark: '' });
    expect(r.value).toBe('T1a');
    expect(r.unit).toMatch(/99/);
  });

  it('thickness 0.5 + ulc → T1b (AJCC 8 update)', () => {
    const r = compute({ thickness: 0.5, ulceration: true, mitosis: false, clark: '' });
    expect(r.value).toBe('T1b');
  });

  it('thickness 0.9 → T1b (0.8-1.0 range)', () => {
    const r = compute({ thickness: 0.9, ulceration: false, mitosis: false, clark: '' });
    expect(r.value).toBe('T1b');
  });

  it('thickness 1.5 + ulc → T2b (94 → 82 with ulc)', () => {
    const r = compute({ thickness: 1.5, ulceration: true, mitosis: false, clark: '' });
    expect(r.value).toBe('T2b');
    expect(r.unit).toMatch(/82/);
  });

  it('thickness 5.0 + ulc → T4b (worst, 5y 54%)', () => {
    const r = compute({ thickness: 5.0, ulceration: true, mitosis: true, clark: '' });
    expect(r.value).toBe('T4b');
    expect(r.unit).toMatch(/54/);
    expect(r.color).toMatch(/^#EF|^#DC/i); // red
  });

  it('T1a recommends 1cm WLE margin, no SLNB rutine', () => {
    const r = compute({ thickness: 0.5, ulceration: false, mitosis: false, clark: '' });
    expect(r.details.toLowerCase()).toMatch(/1 ?см/);
    expect(r.details.toLowerCase()).toMatch(/не рутина|< 5%/);
  });

  it('T2+ recommends SLNB', () => {
    const r = compute({ thickness: 1.5, ulceration: false, mitosis: false, clark: '' });
    expect(r.details.toLowerCase()).toMatch(/рекомендована|t2/);
  });

  it('T3+ recommends LDH + CT/PET-CT staging', () => {
    const r = compute({ thickness: 3.0, ulceration: false, mitosis: false, clark: '' });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/ldh|pet|ct/);
  });

  it('T4 or ulcerated mentions adjuvant anti-PD-1 therapy', () => {
    const r = compute({ thickness: 5.0, ulceration: true, mitosis: false, clark: '' });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/пембролизумаб|ниволумаб|анти-pd-1|brafat/i);
  });

  it('thickness 0 → Tis (in situ)', () => {
    const r = compute({ thickness: 0, ulceration: false, mitosis: false, clark: '' });
    expect(r.value).toBe('Tis');
  });
});
