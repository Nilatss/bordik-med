/**
 * Golden tests for Hinchey classification (perforated diverticulitis).
 *
 * Reference: Hinchey EJ, Schaal PG, Richards GK. Treatment of perforated
 * diverticular disease of the colon. Adv Surg 1978;12:85-109.
 * Updated by Wasvary 1999 (modified Hinchey).
 *
 * Stages:
 *   I    pericolonic phlegmon / abscess <4cm  → antibiotics ± drain
 *   II   pelvic / retroperitoneal abscess     → percutaneous drainage
 *   III  purulent peritonitis                 → emergency surgery
 *   IV   feculent peritonitis                 → Hartmann (mortality 20-40%)
 *
 * RCTs: LADIES + SCANDIV (Hinchey III) — laparoscopic lavage feasible in
 * stable patients; class IV always Hartmann.
 */
import { describe, it, expect } from 'vitest';
import hinch from '@/lib/runners/hinchey';

interface HinchResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(klass: 'I' | 'II' | 'III' | 'IV'): HinchResult {
  const r = (hinch.compute as (i: { class: string }) => unknown)({ class: klass });
  return r as HinchResult;
}

describe('hinchey · staging + management', () => {
  it('Stage I → antibiotics conservative', () => {
    const r = compute('I');
    expect(r.value).toMatch(/Hinchey I\b/);
    expect(r.color).toMatch(/^#10|^#22/i); // green
    const text = `${r.interpretation} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/антибиотик/);
  });

  it('Stage II → percutaneous drainage', () => {
    const r = compute('II');
    expect(r.value).toMatch(/Hinchey II\b/);
    const text = `${r.interpretation} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/чрескожн.*дренаж|drain/);
  });

  it('Stage III → emergency surgery', () => {
    const r = compute('III');
    expect(r.value).toMatch(/Hinchey III\b/);
    const text = `${r.interpretation} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/экстренн|hartmann|лаваж|резекц/);
  });

  it('Stage IV → Hartmann mandatory (mortality 20-40%)', () => {
    const r = compute('IV');
    expect(r.value).toMatch(/Hinchey IV/);
    const text = `${r.interpretation} ${r.details} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/hartmann/);
  });

  it('Stage III mentions LADIES/SCANDIV laparoscopic lavage option', () => {
    const r = compute('III');
    expect(r.details.toLowerCase()).toMatch(/ladies|scandiv|лапароскоп/);
  });

  it('Stage II mentions colonoscopy follow-up at 6 weeks (rule out malignancy)', () => {
    const r = compute('II');
    expect(r.actions.some((a) => /колоноскопи|6 нед/i.test(a))).toBe(true);
  });

  it('all 4 stages have distinct values', () => {
    const stages = (['I', 'II', 'III', 'IV'] as const).map(compute);
    const values = stages.map((s) => s.value);
    expect(new Set(values).size).toBe(4);
  });
});
