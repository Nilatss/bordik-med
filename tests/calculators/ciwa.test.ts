/**
 * Golden tests for CIWA-Ar (Clinical Institute Withdrawal Assessment, Alcohol).
 *
 * Reference: Sullivan JT, Sykora K, Schneiderman J, Naranjo CA, Sellers
 * EM. Assessment of alcohol withdrawal: the revised clinical institute
 * withdrawal assessment for alcohol scale (CIWA-Ar). Br J Addict
 * 1989;84(11):1353-1357. doi:10.1111/j.1360-0443.1989.tb00737.x
 *
 * Bands (max 67):
 *   0-9    → mild (symptomatic care, observation)
 *   10-19  → moderate (BZD on symptom trigger; thiamine)
 *   ≥20    → severe (admit, IV BZD, ICU at DT risk; Wernicke prophylaxis)
 *
 * Critical: history of seizures or DT auto-escalates to fixed-schedule BZD
 * regardless of score (high-risk override).
 */
import { describe, it, expect } from 'vitest';
import ciwa from '@/lib/runners/ciwa';

interface CiwaResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: { total: number; seizureHistory?: boolean; dtHistory?: boolean }): CiwaResult {
  const r = (ciwa.compute as (i: typeof input) => unknown)(input);
  return r as CiwaResult;
}

describe('ciwa · severity bands', () => {
  it('total 5 → mild', () => {
    const r = compute({ total: 5 });
    expect(r.color).toMatch(/^#22|^#10/i); // green
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/наблюден|тиамин/);
    expect(text).not.toMatch(/диазепам.*в\/в|icu/);
  });

  it('total 15 → moderate, BZD symptom-triggered', () => {
    const r = compute({ total: 15 });
    expect(r.color).toMatch(/^#F59|^#FACC/i); // amber
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/лоразепам|диазепам|chlordiazepoxide/);
  });

  it('total 25 → severe, IV BZD + thiamine before glucose', () => {
    const r = compute({ total: 25 });
    expect(r.color).toMatch(/^#991B|^#7F|^#DC/i); // dark red
    const text = `${r.details} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/тиамин/);
    expect(text).toMatch(/в\/в|icu/);
  });

  it('seizure history overrides band — escalates to severe colour', () => {
    const r = compute({ total: 5, seizureHistory: true });
    expect(r.color).toMatch(/^#991B|^#7F|^#DC/i);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/анамнез|фиксированн|icu/);
  });

  it('DT history overrides band similarly', () => {
    const r = compute({ total: 8, dtHistory: true });
    expect(r.color).toMatch(/^#991B|^#7F|^#DC/i);
  });

  it('total clamped to [0..67]', () => {
    const rNeg = compute({ total: -5 });
    expect(rNeg.value).toBe('0');
    const rHi = compute({ total: 100 });
    expect(rHi.value).toBe('67');
  });

  it('severe band mentions Wernicke prophylaxis (thiamine before glucose)', () => {
    const r = compute({ total: 25 });
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/тиамин.*глюкоз|вернике/);
  });
});
