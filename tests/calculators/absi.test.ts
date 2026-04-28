/**
 * Golden tests for ABSI / Baux / Revised Baux burn-mortality scores.
 *
 * References:
 *   Tobiasen J et al. ABSI. Burns Incl Therm Inj. 1982;9(1):17–22.
 *   Osler T et al. Revised Baux: simple but powerful. Burn outcomes.
 *     J Trauma. 2010;68(3):690–7.
 *
 * Formulas:
 *   Baux = age + %TBSA
 *   Revised Baux = age + %TBSA + (17 if inhalation injury)
 */
import { describe, it, expect } from 'vitest';
import absi from '@/lib/runners/absi';

interface AResult { value: string; interpretation: string; details: string }

interface Args {
  age: number;
  tbsa: number;
  sex: 'm' | 'f';
  inhalation: boolean;
  fullThick: boolean;
}

function call(args: Args): AResult {
  return (absi.compute as unknown as (v: Args) => unknown)(args) as AResult;
}

describe('absi · compute', () => {
  it('young low-burden burn → low Baux', () => {
    // age 25, TBSA 15 → Baux 40
    const r = call({ age: 25, tbsa: 15, sex: 'm', inhalation: false, fullThick: false });
    expect(r.details).toMatch(/40/);
  });

  it('Baux ≥ 100 → very high mortality', () => {
    // 60 y, 50% TBSA → Baux 110
    const r = call({ age: 60, tbsa: 50, sex: 'm', inhalation: false, fullThick: false });
    expect(r.details).toMatch(/110/);
  });

  it('inhalation adds +17 to revised Baux', () => {
    const a = call({ age: 50, tbsa: 30, sex: 'm', inhalation: false, fullThick: false });
    const b = call({ age: 50, tbsa: 30, sex: 'm', inhalation: true,  fullThick: false });
    // Revised Baux 80 vs 97 — both should mention the difference
    expect(a.details).not.toBe(b.details);
    expect(b.details).toMatch(/97/);
  });

  it('female adds +1 to ABSI categorical score', () => {
    const m = call({ age: 50, tbsa: 30, sex: 'm', inhalation: false, fullThick: false });
    const f = call({ age: 50, tbsa: 30, sex: 'f', inhalation: false, fullThick: false });
    // ABSI is reported in interpretation (`ABSI <n>`); revised Baux
    // is `value`. Sex flag adds +1 to ABSI.
    const absiM = parseInt((m.interpretation.match(/ABSI\s+(\d+)/) ?? ['',''])[1] ?? '0', 10);
    const absiF = parseInt((f.interpretation.match(/ABSI\s+(\d+)/) ?? ['',''])[1] ?? '0', 10);
    expect(absiF).toBeGreaterThan(absiM);
  });

  it('elderly + extensive burn → critical band', () => {
    // 80y + 70% + inhalation 17 = revised Baux 167
    const r = call({ age: 80, tbsa: 70, sex: 'm', inhalation: true, fullThick: true });
    expect(r.details).toMatch(/167/);
  });
});
