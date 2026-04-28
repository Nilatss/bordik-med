/**
 * Golden tests for Parkland burn-resuscitation formula.
 *
 * Reference: Baxter CR, Shires T. Physiological response to crystalloid
 *   resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874–94.
 *
 * Formula:  total_24h_mL = 4 mL × kg × %TBSA
 *           first 8 h    = total / 2 (from time of burn, not admission)
 *           next 16 h    = total / 2
 */
import { describe, it, expect } from 'vitest';
import parkland from '@/lib/runners/parkland';

interface PResult {
  value: string;     // "X мл / 24 ч"
  unit: string;      // "(X мл в первые 8 ч, Y мл в следующие 16 ч)"
  interpretation: string;
}

function call(weight: number, tbsa: number): PResult {
  return (parkland.compute as (input: { weight: number; tbsa: number }) => unknown)({
    weight, tbsa,
  }) as PResult;
}

function totalMl(r: PResult): number {
  const m = r.value.match(/(\d+)/);
  return m && m[1] ? parseInt(m[1], 10) : NaN;
}

function first8hMl(r: PResult): number {
  const m = r.unit.match(/(\d+)\s*мл в первые 8 ч/);
  return m && m[1] ? parseInt(m[1], 10) : NaN;
}

describe('parkland · compute', () => {
  it('70 kg, 30 % TBSA → 8400 mL / 24h, 4200 mL first 8h', () => {
    // 4 × 70 × 30 = 8400
    const r = call(70, 30);
    expect(totalMl(r)).toBe(8400);
    expect(first8hMl(r)).toBe(4200);
  });

  it('80 kg, 50 % TBSA → 16000 mL / 24h', () => {
    const r = call(80, 50);
    expect(totalMl(r)).toBe(16000);
    expect(first8hMl(r)).toBe(8000);
  });

  it('15 kg paediatric, 20 % TBSA → 1200 mL', () => {
    // Ringer's only — Holliday-Segal added separately for children
    const r = call(15, 20);
    expect(totalMl(r)).toBe(1200);
  });

  it('halves split exactly equally', () => {
    const r = call(60, 40);
    const total = totalMl(r);
    const first = first8hMl(r);
    expect(total).toBe(9600);
    expect(first).toBe(total / 2);
  });

  it('zero TBSA → zero fluid (edge case, sanity)', () => {
    const r = call(70, 0);
    expect(totalMl(r)).toBe(0);
  });

  it('always returns Ringer guidance in interpretation', () => {
    const r = call(70, 30);
    expect(r.interpretation).toMatch(/Рингер/i);
    expect(r.interpretation).toMatch(/диурез/i);
  });
});
