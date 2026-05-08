/**
 * Golden tests for ISS (Injury Severity Score, Baker 1974).
 *
 * Reference: Baker SP, O'Neill B, Haddon W, Long WB. The Injury Severity
 * Score: a method for describing patients with multiple injuries and
 * evaluating emergency care. J Trauma 1974;14(3):187-196.
 *
 * Algorithm:
 *   - 6 body regions × AIS 0-6
 *   - Take top-3 worst, sum of squares = ISS (0-75)
 *   - Any AIS 6 → ISS automatically 75
 *
 * Bands:
 *   <9    → minor (<1% mortality)
 *   9-14  → moderate
 *   15-24 → severe (major trauma threshold ISS ≥16)
 *   ≥25   → profound (25-75% mortality)
 */
import { describe, it, expect } from 'vitest';
import iss from '@/lib/runners/iss';

interface IssResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): IssResult {
  const r = (iss.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as IssResult;
}

describe('iss · scoring algorithm', () => {
  it('all zero → ISS 0 (minor)', () => {
    const r = compute({ head: '0', face: '0', chest: '0', abd: '0', ext: '0', ext2: '0' });
    expect(r.value).toBe('0');
    expect(r.interpretation).toMatch(/Лёгкая|Minor/);
  });

  it('AIS 6 anywhere → ISS auto 75', () => {
    const r = compute({ head: '6', face: '0', chest: '0', abd: '0', ext: '0', ext2: '0' });
    expect(r.value).toBe('75');
    expect(r.interpretation).toMatch(/Критическая|Profound/);
  });

  it('top-3 sum of squares — single AIS 3 → ISS 9', () => {
    // Only one region scored: 3² = 9 (rest are 0² + 0² = 0)
    const r = compute({ head: '3', face: '0', chest: '0', abd: '0', ext: '0', ext2: '0' });
    expect(r.value).toBe('9');
  });

  it('three AIS 4 → ISS 48 (4² × 3)', () => {
    const r = compute({ head: '4', face: '0', chest: '4', abd: '0', ext: '4', ext2: '0' });
    expect(r.value).toBe('48');
  });

  it('AIS 5+5+5 → ISS 75 (max non-fatal, 25×3)', () => {
    const r = compute({ head: '5', face: '0', chest: '5', abd: '0', ext: '5', ext2: '0' });
    expect(r.value).toBe('75');
    expect(r.interpretation).toMatch(/Критическая/);
  });

  it('takes only top 3 — adding 4th moderate injury does not raise score', () => {
    const a = compute({ head: '4', face: '0', chest: '4', abd: '0', ext: '4', ext2: '0' });
    const b = compute({ head: '4', face: '2', chest: '4', abd: '2', ext: '4', ext2: '0' });
    expect(a.value).toBe(b.value); // both top-3 are 4,4,4
  });

  it('major trauma threshold mention (ISS ≥16) for severe band', () => {
    const r = compute({ head: '4', face: '0', chest: '3', abd: '0', ext: '3', ext2: '0' });
    // 16+9+9 = 34 → Profound. Adjust to land in 15-24 zone:
    const r2 = compute({ head: '4', face: '0', chest: '0', abd: '0', ext: '0', ext2: '0' });
    // 16 → severe band
    expect(r2.value).toBe('16');
    expect(r2.details.toLowerCase()).toMatch(/major trauma|≥ ?16/);
  });

  it('moderate band (ISS 9-14) recommends FAST + monitoring', () => {
    const r = compute({ head: '3', face: '1', chest: '0', abd: '0', ext: '0', ext2: '0' });
    // 9+1+0 = 10
    expect(parseInt(r.value, 10)).toBeGreaterThanOrEqual(9);
    expect(parseInt(r.value, 10)).toBeLessThan(15);
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/госпитализац|мониторинг|fast/);
  });

  it('severe (ISS ≥15) recommends trauma team activation + MTP', () => {
    const r = compute({ head: '4', face: '0', chest: '4', abd: '0', ext: '0', ext2: '0' });
    // 16+16+0 = 32 → severe
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/trauma team|damage control|mtp|tx?a/);
  });
});
