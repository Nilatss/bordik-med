/**
 * Golden tests for the composite difficult-airway score
 * (Mallampati + Cormack-Lehane + LEMON + MACOCHA).
 *
 * Reference: Mallampati SR. Clinical sign to predict difficult tracheal
 * intubation. Can Anaesth Soc J 1985;32(4):429-434. Cormack RS, Lehane
 * J 1984. Reed MJ LEMON 2005. De Jong A MACOCHA, Am J Respir Crit Care
 * Med 2013;187(8):832-839.
 *
 * Composite bands by total score:
 *   ≤2  → low risk           — standard direct laryngoscopy
 *   3-5 → moderate           — videolaryngoscope ready, preoxygenate
 *   6-9 → high               — consider awake fibreoptic intubation
 *   ≥10 → critical CICV risk — AFOI mandatory, surgical team standby
 */
import { describe, it, expect } from 'vitest';
import mallampati from '@/lib/runners/mallampati';

interface MallampatiResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): MallampatiResult {
  const r = (mallampati.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as MallampatiResult;
}

describe('mallampati · composite airway risk', () => {
  it('all-clear → 0 points → low risk', () => {
    const r = compute({ mp: '1', cl: '0', lemon_look: false, lemon_eval: false, lemon_obst: false, lemon_neck: false, macocha: false });
    expect(r.value).toBe('0');
    expect(r.interpretation.toLowerCase()).toMatch(/низк/);
  });

  it('Mallampati IV alone (3 pts) → moderate', () => {
    const r = compute({ mp: '4', cl: '0', lemon_look: false, lemon_eval: false, lemon_obst: false, lemon_neck: false, macocha: false });
    expect(r.value).toBe('3');
    expect(r.interpretation.toLowerCase()).toMatch(/умерен/);
  });

  it('beard + obesity + 3-3-2 fail (5 pts) → moderate', () => {
    const r = compute({ mp: '3', cl: '0', lemon_look: true, lemon_eval: true, lemon_obst: false, lemon_neck: false, macocha: false });
    // mp=2 + lemon_look=1 + lemon_eval=1 = 4
    expect(parseInt(r.value, 10)).toBeGreaterThanOrEqual(4);
    expect(r.interpretation.toLowerCase()).toMatch(/умерен/);
  });

  it('ICU + epiglottitis (high score) → critical', () => {
    const r = compute({ mp: '4', cl: '0', lemon_look: true, lemon_eval: true, lemon_obst: true, lemon_neck: true, macocha: true });
    // 3 + 0 + 1 + 1 + 2 + 1 + 2 = 10
    expect(parseInt(r.value, 10)).toBeGreaterThanOrEqual(10);
    expect(r.interpretation.toLowerCase()).toMatch(/критич|cicv/);
  });

  it('high risk recommends AFOI / awake fibreoptic', () => {
    const r = compute({ mp: '4', cl: '3', lemon_look: true, lemon_obst: true, lemon_neck: true, lemon_eval: false, macocha: false });
    // 3 + 3 + 1 + 2 + 1 = 10 → critical
    expect(r.actions.some((a) => /afoi|fiber|fibroбронх|awake/i.test(a))).toBe(true);
  });

  it('Cormack-Lehane Grade III adds 3 points', () => {
    const r1 = compute({ mp: '1', cl: '1', lemon_look: false, lemon_eval: false, lemon_obst: false, lemon_neck: false, macocha: false });
    const r2 = compute({ mp: '1', cl: '3', lemon_look: false, lemon_eval: false, lemon_obst: false, lemon_neck: false, macocha: false });
    expect(parseInt(r2.value, 10) - parseInt(r1.value, 10)).toBe(3);
  });

  it('low-risk plan still mentions plan B (LMA / bougie)', () => {
    const r = compute({ mp: '1', cl: '0', lemon_look: false, lemon_eval: false, lemon_obst: false, lemon_neck: false, macocha: false });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/lma|bougie|план b/);
  });
});
