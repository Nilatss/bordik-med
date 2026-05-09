/**
 * Golden tests for Lille Score (alcoholic hepatitis steroid response).
 *
 * Reference: Louvet A, Naveau S, Abdelnour M, et al. The Lille model:
 * a new tool for therapeutic strategy in patients with severe alcoholic
 * hepatitis treated with steroids. Hepatology 2007;45(6):1348-1354.
 * doi:10.1002/hep.21607
 *
 * Computed at day 7 of corticosteroid therapy.
 *
 * Bands:
 *   <0.45  → response to GCS, continue 28-day course
 *   ≥0.45  → no response, stop steroids (futility), consider transplant
 */
import { describe, it, expect } from 'vitest';
import lille from '@/lib/runners/lille';

interface LilleResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): LilleResult {
  const r = (lille.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as LilleResult;
}

describe('lille · steroid response', () => {
  it('typical responder profile → score <0.45', () => {
    // Day 0 bili high, day 7 bili decreased — responder
    const r = compute({
      age: 50, alb: 30, bil0: 200, bil7: 100, pt: 18, pt_ctrl: 12, ck: 80,
    });
    expect(parseFloat(r.value)).toBeLessThan(0.45);
    expect(r.interpretation.toLowerCase()).toMatch(/ответ|continue|response/);
  });

  it('non-responder profile → score ≥0.45', () => {
    // Day 0 and day 7 bili both very high (no improvement)
    const r = compute({
      age: 65, alb: 22, bil0: 350, bil7: 380, pt: 30, pt_ctrl: 12, ck: 200,
    });
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(0.45);
    expect(r.interpretation.toLowerCase()).toMatch(/нет ответа|futil|stop/);
  });

  it('non-responder band recommends stopping steroids', () => {
    const r = compute({
      age: 65, alb: 22, bil0: 350, bil7: 380, pt: 30, pt_ctrl: 12, ck: 200,
    });
    if (parseFloat(r.value) >= 0.45) {
      const text = r.actions.join(' ').toLowerCase();
      expect(text).toMatch(/отмен|стоп|трансплант|futility/);
    }
  });

  it('responder band recommends continuing 28-day course', () => {
    const r = compute({
      age: 50, alb: 30, bil0: 200, bil7: 100, pt: 18, pt_ctrl: 12, ck: 80,
    });
    if (parseFloat(r.value) < 0.45) {
      const text = `${r.details} ${r.actions.join(' ')}`.toLowerCase();
      expect(text).toMatch(/28|продолж|continue/);
    }
  });

  it('rising bilirubin from day 0 to day 7 → higher Lille', () => {
    const baseline = { age: 55, alb: 28, pt: 20, pt_ctrl: 12, ck: 100 };
    const drop = compute({ ...baseline, bil0: 200, bil7: 100 });
    const rise = compute({ ...baseline, bil0: 200, bil7: 350 });
    expect(parseFloat(rise.value)).toBeGreaterThan(parseFloat(drop.value));
  });

  it('worse renal function (high Cr) → higher Lille', () => {
    const baseline = { age: 55, alb: 28, bil0: 200, bil7: 250, pt: 20, pt_ctrl: 12 };
    const a = compute({ ...baseline, ck: 80 });
    const b = compute({ ...baseline, ck: 250 });
    expect(parseFloat(b.value)).toBeGreaterThan(parseFloat(a.value));
  });
});
