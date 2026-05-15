/**
 * Hand-tests for neo-map (neonatal mean arterial pressure target).
 *
 * MAP formula: DBP + (SBP − DBP) / 3
 *
 * Target MAP (BAPM rule of thumb):
 *   - Term (≥ 37 wk) первые 24 ч: ≥ 40 mmHg
 *   - Late preterm (34-36 wk): ≥ GA + 5
 *   - Preterm (< 34 wk): ≥ GA (mmHg)
 *
 * Reference: BAPM Hypotension Framework 2017; Dempsey EM Curr Opin Pediatr 2009.
 */
import { describe, it, expect } from 'vitest';
import map from '@/lib/runners/neo-map';

interface MapResult {
  value: string;
  interpretation: string;
  color: string;
}

function compute(values: Record<string, unknown>): MapResult {
  return (map.compute as (v: Record<string, unknown>) => unknown)(values) as MapResult;
}

describe('neo-map · MAP formula', () => {
  it('SBP 60 / DBP 30 → MAP 40 (formula: 30 + 30/3 = 40)', () => {
    const r = compute({ sbp: 60, dbp: 30, ga: 37, dol: 1 });
    expect(r.value).toMatch(/40 mmHg/);
  });

  it('invasive MAP overrides SBP/DBP if provided', () => {
    const r = compute({ sbp: 60, dbp: 30, map_invasive: 45, ga: 37, dol: 1 });
    expect(r.value).toMatch(/45 mmHg/);
    expect(r.interpretation).toMatch(/инвазивн/i);
  });
});

describe('neo-map · target by GA + DOL', () => {
  it('term (37 wk), DOL 1, MAP 42 → at target (≥ 40)', () => {
    const r = compute({ sbp: 60, dbp: 33, ga: 37, dol: 1 });
    // MAP = 33 + 27/3 = 42
    expect(r.value).toMatch(/42/);
    expect(r.interpretation).toMatch(/Целев|target/i);
    expect(r.color).toBe('#22C55E');
  });

  it('preterm 28 wk, DOL 1, MAP 18 → hypotensive (target ≥ 28, delta -10)', () => {
    // delta -10 < -5 → red hypotension
    const r = compute({ map_invasive: 18, ga: 28, dol: 1 });
    expect(r.value).toMatch(/18/);
    expect(r.interpretation).toMatch(/[Hh]ypoten|target/i);
    expect(r.color).toBe('#EF4444');
  });

  it('preterm 28 wk, DOL 1, MAP 25 → borderline (target ≥ 28, delta -3)', () => {
    // delta -3 → between -5 and 0 → amber borderline
    const r = compute({ map_invasive: 25, ga: 28, dol: 1 });
    expect(r.color).toBe('#F59E0B');
    expect(r.interpretation).toMatch(/[Bb]order/i);
  });

  it('preterm 28 wk, DOL 1, MAP 30 → at target (≥ 28)', () => {
    const r = compute({ map_invasive: 30, ga: 28, dol: 1 });
    expect(r.interpretation).toMatch(/Целев|target/i);
    expect(r.color).toBe('#22C55E');
  });

  it('late preterm 34 wk, DOL 1, MAP 38 → at target (≥ 34 + 5 = 39, delta -1 → borderline)', () => {
    const r = compute({ map_invasive: 38, ga: 34, dol: 1 });
    // target = 34 + 5 = 39; delta = 38 - 39 = -1 → borderline (not <-5)
    expect(r.color).toBe('#F59E0B');
    expect(r.interpretation).toMatch(/[Bb]order|39/i);
  });

  it('preterm 28 wk, DOL 7, MAP 33 → target risen with age (≥ 34)', () => {
    // target = 28 + min(6, 7) = 34; MAP 33 → delta -1 → borderline
    const r = compute({ map_invasive: 33, ga: 28, dol: 7 });
    expect(r.interpretation).toMatch(/34|[Bb]order/i);
  });

  it('missing GA or DOL — asks for them', () => {
    const r = compute({ sbp: 60, dbp: 30 });
    expect(r.value).toBe('—');
    expect(r.interpretation).toMatch(/GA|день/i);
  });

  it('missing both invasive MAP and SBP/DBP — asks for input', () => {
    const r = compute({ ga: 28, dol: 1 });
    expect(r.value).toBe('—');
    expect(r.interpretation).toMatch(/MAP|SBP/i);
  });
});

describe('neo-map · structure', () => {
  it('kind is calculator', () => {
    expect((map as { kind: string }).kind).toBe('calculator');
  });

  it('cites BAPM + Dempsey', () => {
    const ref = (map as { reference?: string }).reference ?? '';
    expect(ref).toMatch(/BAPM|Dempsey/i);
  });

  it('has 5 inputs (SBP, DBP, MAP invasive, GA, DOL)', () => {
    const inputs = (map as { inputs: unknown[] }).inputs;
    expect(inputs.length).toBe(5);
  });
});
