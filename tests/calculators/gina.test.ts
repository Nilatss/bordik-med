/**
 * Golden tests for GINA asthma control assessment.
 *
 * Reference: Global Initiative for Asthma (GINA). Global Strategy for
 * Asthma Management and Prevention 2024. www.ginasthma.org
 *
 * 4 control questions (1 pt each, last 4 weeks):
 *   1. Daytime symptoms >2×/week
 *   2. Night waking from asthma
 *   3. SABA reliever >2×/week
 *   4. Activity limitation
 *
 * Bands:
 *   0    → well controlled
 *   1-2  → partly controlled
 *   3-4  → uncontrolled → step up + consider biologics if step 4-5
 *
 * GINA 2023+: SABA-only monotherapy NOT recommended; AIR/MART (low-dose
 * ICS-formoterol) replaces SABA-only.
 */
import { describe, it, expect } from 'vitest';
import gina from '@/lib/runners/gina';

interface GinaResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): GinaResult {
  const r = (gina.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as GinaResult;
}

describe('gina · control assessment', () => {
  it('all 4 absent → well controlled', () => {
    const r = compute({ symptoms: false, night: false, saba: false, limit: false, currentStep: 2 });
    expect(r.value).toMatch(/Хорошо/);
    expect(r.color).toMatch(/^#10|^#22/i); // green
  });

  it('1 symptom present → partly controlled', () => {
    const r = compute({ symptoms: true, night: false, saba: false, limit: false, currentStep: 2 });
    expect(r.value).toMatch(/Частично/);
    expect(r.color).toMatch(/^#F59/i); // amber
  });

  it('all 4 present → uncontrolled, step-up + OCS', () => {
    const r = compute({ symptoms: true, night: true, saba: true, limit: true, currentStep: 3 });
    expect(r.value).toMatch(/Не контрол/);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/преднизолон|ocs|ингал.*кортико|step-up/);
  });

  it('uncontrolled at step 4-5 mentions biologics', () => {
    const r = compute({ symptoms: true, night: true, saba: true, limit: true, currentStep: 4 });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/омализумаб|меполизумаб|дупилумаб|тезепелумаб|биолог/);
  });

  it('well-controlled mentions step-down after 3 months', () => {
    const r = compute({ symptoms: false, night: false, saba: false, limit: false, currentStep: 3 });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/step-down|3 мес|приверженност/);
  });

  it('partly controlled emphasises technique + adherence + triggers', () => {
    const r = compute({ symptoms: true, saba: true, night: false, limit: false, currentStep: 2 });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/техник|приверженност|триггер/);
  });

  it('details report score X/4 and current step', () => {
    const r = compute({ symptoms: true, night: true, saba: false, limit: false, currentStep: 3 });
    expect(r.details).toMatch(/2\/4/);
    expect(r.details).toMatch(/3/);
  });
});
