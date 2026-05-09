/**
 * Golden tests for NISS (New Injury Severity Score, Osler 1997).
 *
 * Reference: Osler T, Baker SP, Long W. A modification of the injury
 * severity score that both improves accuracy and simplifies scoring.
 * J Trauma 1997;43(6):922-925. doi:10.1097/00005373-199712000-00009
 *
 * Difference from ISS (Baker 1974): NISS = sum of squares of THREE
 * highest AIS scores REGARDLESS of body region (vs ISS which takes top
 * 3 across DIFFERENT regions). Better for multiple severe injuries in
 * the same body region.
 *
 * Bands (parallel to ISS):
 *   <9    → minor
 *   9-14  → moderate
 *   15-24 → severe (major trauma threshold ≥16)
 *   ≥25   → profound
 */
import { describe, it, expect } from 'vitest';
import niss from '@/lib/runners/niss';

interface NissResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
}

function compute(input: Record<string, unknown>): NissResult {
  const r = (niss.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as NissResult;
}

describe('niss · scoring algorithm', () => {
  it('all zero → NISS 0', () => {
    const r = compute({ i1: '0', i2: '0', i3: '0', i4: '0', i5: '0' });
    expect(r.value).toBe('0');
  });

  it('three AIS 4 in same region → NISS 48 (vs ISS would also be 48)', () => {
    // top-3: 4,4,4 → 16+16+16 = 48
    const r = compute({ i1: '4', i2: '4', i3: '4', i4: '0', i5: '0' });
    expect(r.value).toBe('48');
  });

  it('NISS captures multiple severe injuries (key advantage over ISS)', () => {
    // 3 severe injuries (AIS 5,5,5) — same or different regions both → 75
    const r = compute({ i1: '5', i2: '5', i3: '5', i4: '0', i5: '0' });
    expect(r.value).toBe('75');
  });

  it('takes top-3 only — 4th injury does not raise score', () => {
    const a = compute({ i1: '4', i2: '4', i3: '4', i4: '0', i5: '0' });
    const b = compute({ i1: '4', i2: '4', i3: '4', i4: '2', i5: '2' });
    expect(a.value).toBe(b.value);
  });

  it('AIS 6 anywhere → NISS 75 auto', () => {
    const r = compute({ i1: '6', i2: '0', i3: '0', i4: '0', i5: '0' });
    expect(r.value).toBe('75');
  });

  it('major trauma threshold ≥15 in details for severe', () => {
    // 4²+0+0 = 16 → severe band, but only one injury
    const r = compute({ i1: '4', i2: '0', i3: '0', i4: '0', i5: '0' });
    expect(r.value).toBe('16');
    expect(r.details.toLowerCase()).toMatch(/major trauma|≥ ?16/);
  });

  it('moderate band 9-14', () => {
    // 3²+0+0 = 9 → moderate
    const r = compute({ i1: '3', i2: '0', i3: '0', i4: '0', i5: '0' });
    expect(parseInt(r.value, 10)).toBeGreaterThanOrEqual(9);
    expect(parseInt(r.value, 10)).toBeLessThan(15);
    expect(r.interpretation.toLowerCase()).toMatch(/умеренная|moderate/);
  });
});
