/**
 * Hand-tests for neo-puopolo-eos — Puopolo EOS risk stratification ≤ 34 нед.
 *
 * Regression: select inputs were defined without `points` on each option,
 * so the framework's sumScore() returned 0 regardless of selections. The
 * UI showed "0/6 Low risk" for clearly high-risk inputs (chorio=confirmed,
 * IAP=inadequate, fever=true, symptoms=Yes). Fixed by attaching the
 * intended points value to each select option.
 *
 * Reference: AAP COFN 2018 (Pediatrics 142:e20182894), Puopolo KM
 * Pediatrics 2017;139:e20162426.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/neo-puopolo-eos';
import { findBand, type ScoreTool } from '@/lib/tools-runners';

const r = runner as ScoreTool;

describe('neo-puopolo-eos · inputs schema', () => {
  it('has kind score', () => {
    expect(r.kind).toBe('score');
  });

  it('maxScore is 6', () => {
    expect(r.maxScore).toBe(6);
  });

  it('every select option carries an explicit points value', () => {
    for (const inp of r.inputs) {
      if (inp.type !== 'select' || !inp.options) continue;
      for (const opt of inp.options) {
        expect(
          typeof opt.points,
          `input "${inp.id}" option value=${opt.value} is missing points`,
        ).toBe('number');
      }
    }
  });

  it('chorio: confirmed (value 2) awards 2 points', () => {
    const chorio = r.inputs.find((i) => i.id === 'chorio');
    expect(chorio).toBeDefined();
    const confirmed = chorio!.options?.find((o) => String(o.value) === '2');
    expect(confirmed?.points).toBe(2);
  });

  it('chorio: suspected (value 1) awards 1 point', () => {
    const chorio = r.inputs.find((i) => i.id === 'chorio');
    const suspected = chorio!.options?.find((o) => String(o.value) === '1');
    expect(suspected?.points).toBe(1);
  });

  it('iap inadequate (value 1) awards 1 point', () => {
    const iap = r.inputs.find((i) => i.id === 'iap');
    const inadequate = iap!.options?.find((o) => String(o.value) === '1');
    expect(inadequate?.points).toBe(1);
  });
});

describe('neo-puopolo-eos · bands clinical correctness', () => {
  it('has 3 bands (Low / Intermediate / High)', () => {
    expect(r.bands).toHaveLength(3);
  });

  it('score 5 (worst-case scenario from screenshot bug) → High risk', () => {
    // GA ≤ 34 (1) + chorio confirmed (2) + IAP inadequate (1) +
    // maternal fever (1) + symptoms yes (1) = 6.
    // Even without GA we should still be 5 = High risk.
    const high = findBand(r.bands, 5);
    expect(high.label).toMatch(/high/i);
  });

  it('score 0 → Low risk', () => {
    const low = findBand(r.bands, 0);
    expect(low.label).toMatch(/low/i);
  });

  it('score 3 → Intermediate', () => {
    const mid = findBand(r.bands, 3);
    expect(mid.label).toMatch(/intermediate/i);
  });

  it('all 7 scores 0..6 map to exactly one band', () => {
    for (let s = 0; s <= 6; s++) {
      const matches = r.bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });
});
