/**
 * Golden tests for Shock Index (SI = HR / SBP).
 *
 * Reference: Allgöwer M, Burri C. Schockindex. Dtsch Med Wochenschr
 * 1967;92(43):1947-1950. doi:10.1055/s-0028-1106070
 *
 * Bands (Liu 2012 / Mutschler 2013 anchor):
 *   <0.5   → low (β-blocked, hypertensive emergency)
 *   0.5-0.7 → normal
 *   0.7-0.9 → borderline (pre-shock, MTP risk in trauma)
 *   0.9-1.3 → likely shock (early hypovolemic/septic; ≥30% blood loss)
 *   ≥1.3   → severe (Class IV, decompensated)
 */
import { describe, it, expect } from 'vitest';
import si from '@/lib/runners/shock-index';

interface SiResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(hr: number, sbp: number): SiResult {
  const r = (si.compute as (i: { hr: number; sbp: number }) => unknown)({ hr, sbp });
  return r as SiResult;
}

describe('shock-index · bands', () => {
  it('SI ~0.6 (HR 70 / SBP 120) → normal', () => {
    const r = compute(70, 120); // 0.583
    expect(r.interpretation).toMatch(/Норма/);
    expect(r.color).toMatch(/^#22/i);
  });

  it('SI ~0.4 (HR 50 / SBP 130) → low (β-blocker / hypertensive)', () => {
    const r = compute(50, 130); // 0.385
    expect(r.interpretation).toMatch(/Низкий/);
  });

  it('SI ~0.8 (HR 100 / SBP 130) → borderline', () => {
    const r = compute(100, 130); // 0.769
    expect(r.interpretation).toMatch(/Пограничный/);
    expect(r.color.toLowerCase()).toMatch(/^#f59|^#face/i); // amber
  });

  it('SI ~1.0 (HR 110 / SBP 110) → likely shock', () => {
    const r = compute(110, 110); // 1.0
    expect(r.interpretation).toMatch(/шок/);
  });

  it('SI ~1.5 (HR 130 / SBP 80) → severe shock', () => {
    const r = compute(130, 80); // 1.625
    expect(r.interpretation).toMatch(/Тяжёлый шок|высок.*смерт/);
    expect(r.color.toLowerCase()).toMatch(/^#(7|8|9|a|b)/i); // dark red
  });

  it('shock band recommends MTP / massive transfusion mention', () => {
    const r = compute(110, 110); // 1.0 — likely shock
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/massive|mtp|трансфуз|кристаллоид/);
  });

  it('SI computed correctly — value is numeric ratio', () => {
    const r = compute(120, 80);
    expect(parseFloat(r.value)).toBeCloseTo(1.5, 1);
  });
});
