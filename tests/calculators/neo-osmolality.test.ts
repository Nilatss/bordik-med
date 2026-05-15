/**
 * Hand-tests for neo-osmolality (serum osmolality + gap calculator).
 *
 * Formula (SI units):
 *   Osmolality = 2 × Na + glucose + urea  (все в ммоль/л)
 *
 * Norm: 275-295 mOsm/kg.
 *
 * Osmolal gap = measured − calculated. > 10 → unmeasured osmoles.
 *
 * Reference: Smellie WS. Plasma osmolality. BMJ 2007;334:701.
 */
import { describe, it, expect } from 'vitest';
import osmol from '@/lib/runners/neo-osmolality';

interface OsmResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
}

function compute(values: Record<string, unknown>): OsmResult {
  return (osmol.compute as (v: Record<string, unknown>) => unknown)(values) as OsmResult;
}

describe('neo-osmolality · formula', () => {
  it('normal neonatal values → ~285 mOsm/kg', () => {
    // Na 140, glucose 4, urea 3 → 2*140 + 4 + 3 = 287
    const r = compute({ na: 140, glucose: 4, urea: 3 });
    expect(r.value).toMatch(/287/);
    expect(r.interpretation).toMatch(/норме|275-295/i);
  });

  it('hyperosmolar (hypernatremia + hyperglycemia) → > 295', () => {
    // Na 160, glucose 15, urea 8 → 320 + 15 + 8 = 343
    const r = compute({ na: 160, glucose: 15, urea: 8 });
    expect(r.value).toMatch(/343/);
    expect(r.interpretation).toMatch(/гиперосмол/i);
    expect(r.color).toBe('#EF4444');
  });

  it('hypoosmolar (SIADH-like) → < 275', () => {
    // Na 125, glucose 3, urea 2 → 250 + 3 + 2 = 255
    const r = compute({ na: 125, glucose: 3, urea: 2 });
    expect(r.value).toMatch(/255/);
    expect(r.interpretation).toMatch(/гипоосмол/i);
    expect(r.color).toBe('#3B82F6');
  });

  it('osmolal gap > 10 with measured value — flags toxic osmoles', () => {
    // calc 287, measured 305 → gap 18
    const r = compute({ na: 140, glucose: 4, urea: 3, measured: 305 });
    expect(r.interpretation).toMatch(/gap 18|propylene|unmeasured/i);
    expect(r.color).toBe('#EF4444');
  });

  it('osmolal gap ≤ 10 with measured value — within normal', () => {
    // calc 287, measured 293 → gap 6
    const r = compute({ na: 140, glucose: 4, urea: 3, measured: 293 });
    expect(r.interpretation).toMatch(/gap 6/i);
    // color should not be elevated by gap alone
  });

  it('missing required inputs → asks for them', () => {
    const r = compute({ na: 140 });
    expect(r.value).toBe('—');
    expect(r.interpretation).toMatch(/glucose|urea/i);
  });

  it('extreme hypernatremia → critical', () => {
    // Na 180, glucose 5, urea 5 → 370
    const r = compute({ na: 180, glucose: 5, urea: 5 });
    expect(r.color).toBe('#EF4444');
    expect(r.interpretation).toMatch(/гиперосмол/i);
  });
});

describe('neo-osmolality · structure', () => {
  it('kind is calculator', () => {
    expect((osmol as { kind: string }).kind).toBe('calculator');
  });

  it('cites Smellie BMJ 2007 + Avery', () => {
    const ref = (osmol as { reference?: string }).reference ?? '';
    expect(ref).toMatch(/Smellie|BMJ|Avery/i);
  });

  it('has 4 inputs (Na, glucose, urea, measured)', () => {
    const inputs = (osmol as { inputs: unknown[] }).inputs;
    expect(inputs.length).toBe(4);
  });
});
