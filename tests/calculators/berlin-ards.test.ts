/**
 * Golden tests for Berlin Definition of ARDS.
 *
 * Reference: ARDS Definition Task Force (Ranieri VM). Acute respiratory
 * distress syndrome: the Berlin Definition. JAMA 2012;307(23):2526-2533.
 * doi:10.1001/jama.2012.5669. Global Definition update: Matthay MA et al.
 * Am J Respir Crit Care Med 2024;209:37-47.
 *
 * Three mandatory prerequisites:
 *   1. Timing: onset within 1 week of insult
 *   2. Bilateral infiltrates on imaging
 *   3. Non-cardiogenic origin
 * If any missing → "Not ARDS".
 *
 * Severity by PaO₂/FiO₂ on PEEP/CPAP ≥5:
 *   201-300  → Mild      (~27% mortality)
 *   101-200  → Moderate  (~32%)
 *   ≤100     → Severe    (~45%)
 *   >300     → not ARDS oxygenation
 */
import { describe, it, expect } from 'vitest';
import berlin from '@/lib/runners/berlin-ards';

interface BerlinResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: { timing?: boolean; bilateral?: boolean; noncardiac?: boolean; pf: number; peep: number }): BerlinResult {
  const r = (berlin.compute as (i: typeof input) => unknown)(input);
  return r as BerlinResult;
}

describe('berlin-ards · diagnosis', () => {
  it('missing timing → Not ARDS', () => {
    const r = compute({ timing: false, bilateral: true, noncardiac: true, pf: 150, peep: 10 });
    expect(r.value).toBe('Не ARDS');
  });

  it('missing bilateral infiltrates → Not ARDS', () => {
    const r = compute({ timing: true, bilateral: false, noncardiac: true, pf: 150, peep: 10 });
    expect(r.value).toBe('Не ARDS');
  });

  it('cardiogenic origin → Not ARDS', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: false, pf: 150, peep: 10 });
    expect(r.value).toBe('Не ARDS');
  });

  it('PEEP <5 invalidates oxygenation grade', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 150, peep: 4 });
    expect(r.value).toMatch(/PEEP/i);
  });

  it('P/F >300 → does not meet oxygenation criterion', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 320, peep: 5 });
    expect(r.value).toMatch(/300/);
  });

  it('P/F 201-300 → Mild ARDS', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 250, peep: 5 });
    expect(r.interpretation).toMatch(/Лёгкий/);
  });

  it('P/F 101-200 → Moderate ARDS', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 150, peep: 10 });
    expect(r.interpretation).toMatch(/Умеренный/);
  });

  it('P/F ≤100 → Severe ARDS', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 80, peep: 12 });
    expect(r.interpretation).toMatch(/Тяжёлый/);
  });

  it('Mild ARDS recommends low-Vt ventilation', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 250, peep: 5 });
    expect(r.actions.some((a) => /6 мл\/кг|низкообъём/i.test(a))).toBe(true);
  });

  it('Severe ARDS recommends prone positioning', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 80, peep: 12 });
    expect(r.actions.some((a) => /прон|prone|proseva|ecmo/i.test(a))).toBe(true);
  });

  it('boundary P/F=200 → Moderate (not Mild)', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 200, peep: 8 });
    // pf > 200 is mild → exactly 200 should be moderate
    expect(r.interpretation).toMatch(/Умеренный/);
  });

  it('boundary P/F=100 → Severe (not Moderate)', () => {
    const r = compute({ timing: true, bilateral: true, noncardiac: true, pf: 100, peep: 12 });
    // pf > 100 is moderate → exactly 100 should be severe
    expect(r.interpretation).toMatch(/Тяжёлый/);
  });
});
