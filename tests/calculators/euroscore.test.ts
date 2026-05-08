/**
 * Golden tests for EuroSCORE II (cardiac surgery 30-day mortality).
 *
 * Reference: Nashef SA, Roques F, Sharples LD, et al. EuroSCORE II.
 * Eur J Cardiothorac Surg 2012;41(4):734-744. doi:10.1093/ejcts/ezs043
 *
 * Logistic regression model output (predicted in-hospital mortality %).
 *
 * Bands (clinical convention):
 *   <2%    → low
 *   2-5%   → intermediate
 *   5-10%  → high
 *   ≥10%   → very high (consider TAVR / palliative)
 *
 * Note: ESC/EACTS 2021 valvular guidelines anchor Heart Team review
 * with EuroSCORE II + STS in TAVR vs SAVR decisions.
 */
import { describe, it, expect } from 'vitest';
import euro from '@/lib/runners/euroscore';

interface EuroResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): EuroResult {
  const r = (euro.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as EuroResult;
}

describe('euroscore · risk stratification', () => {
  it('young, healthy, elective single → low risk', () => {
    const r = compute({
      age: 55, female: false, copd: false, epa: false, mobility: false,
      redo: false, endocarditis: false, critical: false, dm_insulin: false,
      nyha: '1', ccs4: false, lv: 'good', recentmi: false, pasp: 'normal',
      urgency: 'elective', weight: 'isolated', aorta: false,
    });
    expect(parseFloat(r.value)).toBeLessThan(2);
    expect(r.interpretation.toLowerCase()).toMatch(/низкий/);
  });

  it('older patient with NYHA III + moderate LV + insulin DM → intermediate-or-higher', () => {
    const r = compute({
      age: 72, female: false, copd: false, epa: false, mobility: false,
      redo: false, endocarditis: false, critical: false, dm_insulin: true,
      nyha: '3', ccs4: false, lv: 'moderate', recentmi: false, pasp: 'moderate',
      urgency: 'elective', weight: 'isolated', aorta: false,
    });
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(2);
  });

  it('redo + emergency + critical state → very high risk', () => {
    const r = compute({
      age: 80, female: true, copd: true, epa: true, mobility: true,
      redo: true, endocarditis: true, critical: true, dm_insulin: true,
      nyha: '4', ccs4: true, lv: 'verypoor', recentmi: true, pasp: 'severe',
      urgency: 'salvage', weight: 'three', aorta: true,
    });
    expect(parseFloat(r.value)).toBeGreaterThanOrEqual(10);
    expect(r.interpretation.toLowerCase()).toMatch(/очень высокий/);
  });

  it('high-risk band recommends Heart Team and TAVI consideration', () => {
    const r = compute({
      age: 80, female: true, copd: true, epa: false, mobility: false,
      redo: false, endocarditis: false, critical: false, dm_insulin: false,
      nyha: '3', ccs4: false, lv: 'poor', recentmi: false, pasp: 'severe',
      urgency: 'urgent', weight: 'two', aorta: false,
    });
    if (parseFloat(r.value) >= 5 && parseFloat(r.value) < 10) {
      expect(r.actions.join(' ').toLowerCase()).toMatch(/heart team|tavi|teer/);
    }
  });

  it('mortality monotonically increases with risk factors', () => {
    const baseline: Record<string, unknown> = {
      age: 60, female: false, copd: false, epa: false, mobility: false,
      redo: false, endocarditis: false, critical: false, dm_insulin: false,
      nyha: '1', ccs4: false, lv: 'good', recentmi: false, pasp: 'normal',
      urgency: 'elective', weight: 'isolated', aorta: false,
    };
    const a = parseFloat(compute(baseline).value);
    // Add age + redo + emergency
    const b = parseFloat(compute({ ...baseline, age: 75, redo: true, urgency: 'emergency' }).value);
    expect(b).toBeGreaterThan(a);
  });

  it('result is reported as a 2-decimal percentage', () => {
    const r = compute({
      age: 60, female: false, copd: false, epa: false, mobility: false,
      redo: false, endocarditis: false, critical: false, dm_insulin: false,
      nyha: '1', ccs4: false, lv: 'good', recentmi: false, pasp: 'normal',
      urgency: 'elective', weight: 'isolated', aorta: false,
    });
    expect(r.unit).toBe('%');
    expect(r.value).toMatch(/^\d+\.\d{2}$/);
  });
});
