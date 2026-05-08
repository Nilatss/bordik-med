/**
 * Golden tests for RIFLE / AKIN / KDIGO 2012 AKI definition.
 *
 * Reference: KDIGO Clinical Practice Guideline for Acute Kidney Injury.
 * Kidney Int Suppl 2012;2:1-138. Combines RIFLE (Bellomo, Crit Care 2004)
 * and AKIN (Mehta, Crit Care 2007).
 *
 * KDIGO Stages (max from Cr criterion or urine output, RRT auto = 3):
 *   0 → no AKI
 *   1 → Cr ≥1.5× baseline OR ↑≥26.5 μmol/L; UO <0.5 ml/kg/h × 6-12h  (RIFLE Risk)
 *   2 → Cr ≥2.0× baseline; UO <0.5 ml/kg/h × ≥12h                    (RIFLE Injury)
 *   3 → Cr ≥3.0× OR ≥354 μmol/L OR RRT; UO <0.3 ml/kg/h × ≥24h OR    (RIFLE Failure)
 *       anuria ≥12h
 */
import { describe, it, expect } from 'vitest';
import rifle from '@/lib/runners/rifle';

interface RifleResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(baseCr: number, curCr: number, uo: string, rrt = false): RifleResult {
  const r = (rifle.compute as (input: { baseCr: number; curCr: number; uo: string; rrt: boolean }) => unknown)({
    baseCr,
    curCr,
    uo,
    rrt,
  });
  return r as RifleResult;
}

describe('rifle · KDIGO staging', () => {
  it('no change → No AKI', () => {
    const r = compute(80, 90, 'normal');
    expect(r.value).toMatch(/Нет AKI|No AKI/i);
  });

  it('1.5× Cr ratio → KDIGO 1 (Risk)', () => {
    const r = compute(80, 120, 'normal'); // ratio 1.5
    expect(r.value).toMatch(/KDIGO 1|Risk/i);
  });

  it('↑26.5 μmol/L absolute → KDIGO 1 (Risk)', () => {
    // 80 + 26.5 = 106.5; bump to 110
    const r = compute(80, 110, 'normal');
    expect(r.value).toMatch(/KDIGO 1|Risk/i);
  });

  it('2× ratio → KDIGO 2 (Injury)', () => {
    const r = compute(80, 170, 'normal'); // ratio 2.125
    expect(r.value).toMatch(/KDIGO 2|Injury/i);
  });

  it('3× ratio → KDIGO 3 (Failure)', () => {
    const r = compute(80, 250, 'normal'); // ratio 3.125
    expect(r.value).toMatch(/KDIGO 3|Failure/i);
  });

  it('Cr ≥354 μmol/L → KDIGO 3 even without ratio', () => {
    const r = compute(150, 360, 'normal'); // ratio 2.4 (would be stage 2) but cur ≥354 → 3
    expect(r.value).toMatch(/KDIGO 3|Failure/i);
  });

  it('RRT auto-bumps to stage 3', () => {
    const r = compute(80, 100, 'normal', true); // ratio 1.25 → would be stage 0
    expect(r.value).toMatch(/KDIGO 3|Failure/i);
  });

  it('UO criterion drives stage when worse than Cr', () => {
    const r = compute(80, 90, 's3'); // Cr stage 0, UO stage 3
    expect(r.value).toMatch(/KDIGO 3|Failure/i);
  });

  it('returns stage-specific actions', () => {
    const stage1 = compute(80, 120, 'normal');
    expect(stage1.actions.some((a) => /нефротокс|nsaid|аминогл/i.test(a))).toBe(true);
    const stage3 = compute(80, 250, 's3');
    expect(stage3.actions.some((a) => /зпт|aeiou|rrt/i.test(a))).toBe(true);
  });

  it('color escalates with stage', () => {
    const r0 = compute(80, 90, 'normal');
    const r3 = compute(80, 250, 's3');
    expect(r0.color).toMatch(/^#22/i); // green
    expect(r3.color.toLowerCase()).toMatch(/^#(7|8|9|a|b)/i); // dark red
  });
});
