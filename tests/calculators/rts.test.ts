/**
 * Golden tests for Revised Trauma Score (RTS / T-RTS).
 *
 * Reference: Champion HR, Sacco WJ, Copes WS, Gann DS, Gennarelli TA,
 * Flanagan ME. A revision of the Trauma Score. J Trauma 1989;29(5):
 * 623-629. doi:10.1097/00005373-198905000-00017
 *
 * Two modes:
 *   T-RTS  → triage variant (0-12). <11 = trauma center transport.
 *   RTS    → weighted, 0.9368·GCSc + 0.7326·SBPc + 0.2908·RRc (0-7.84).
 *            Used in TRISS calculation.
 *
 * GCS coded: 13-15→4, 9-12→3, 6-8→2, 4-5→1, 3→0.
 */
import { describe, it, expect } from 'vitest';
import rts from '@/lib/runners/rts';

interface RtsResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: { mode: string; gcs: string | number; sbpc: string | number; rrc: string | number }): RtsResult {
  const r = (rts.compute as (i: typeof input) => unknown)(input);
  return r as RtsResult;
}

describe('rts · T-RTS triage', () => {
  it('all-perfect inputs → T-RTS 12 (norm)', () => {
    const r = compute({ mode: 'trts', gcs: 15, sbpc: 4, rrc: 4 });
    expect(r.value).toBe('12');
    expect(r.interpretation).toMatch(/Норма/);
  });

  it('T-RTS = 11 (borderline)', () => {
    const r = compute({ mode: 'trts', gcs: 12, sbpc: 4, rrc: 4 }); // 3+4+4
    expect(r.value).toBe('11');
    expect(r.interpretation).toMatch(/Погранич/);
  });

  it('T-RTS < 11 → trauma center transport', () => {
    const r = compute({ mode: 'trts', gcs: 8, sbpc: 3, rrc: 4 }); // 2+3+4=9
    expect(parseInt(r.value, 10)).toBeLessThan(11);
    expect(r.interpretation).toMatch(/трав|trauma center/i);
    expect(r.actions.some((a) => /trauma|trauma team|transport/i.test(a))).toBe(true);
  });

  it('GCS 3, SBP 0, RR 0 → T-RTS 0 (lowest)', () => {
    const r = compute({ mode: 'trts', gcs: 3, sbpc: 0, rrc: 0 });
    expect(r.value).toBe('0');
    expect(r.interpretation).toMatch(/Тяжёл|trauma/i);
  });
});

describe('rts · weighted RTS (TRISS)', () => {
  it('all-perfect inputs → RTS 7.84', () => {
    const r = compute({ mode: 'rts', gcs: 15, sbpc: 4, rrc: 4 });
    // 0.9368*4 + 0.7326*4 + 0.2908*4 = 3.7472 + 2.9304 + 1.1632 ≈ 7.8408
    expect(parseFloat(r.value)).toBeCloseTo(7.84, 1);
    expect(r.interpretation).toMatch(/Высокая/);
  });

  it('moderate trauma → medium Ps band', () => {
    // GCS 9-12 → 3, SBP 76-89 → 3, RR 10-29 → 4
    // 0.9368*3 + 0.7326*3 + 0.2908*4 ≈ 2.81+2.20+1.16 = 6.17
    const r = compute({ mode: 'rts', gcs: 12, sbpc: 3, rrc: 4 });
    expect(parseFloat(r.value)).toBeGreaterThan(5);
    expect(parseFloat(r.value)).toBeLessThan(7);
  });

  it('GCS 3, SBP 0, RR 0 → RTS 0', () => {
    const r = compute({ mode: 'rts', gcs: 3, sbpc: 0, rrc: 0 });
    expect(parseFloat(r.value)).toBe(0);
    expect(r.interpretation).toMatch(/низк/i);
  });
});
