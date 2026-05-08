/**
 * Golden tests for Hunt & Hess Grading Scale (subarachnoid haemorrhage).
 *
 * Reference: Hunt WE, Hess RM. Surgical risk as related to time of
 * intervention in the repair of intracranial aneurysms. J Neurosurg
 * 1968;28(1):14-20. doi:10.3171/jns.1968.28.1.14
 *
 * Bands (in-hospital mortality estimates):
 *   I-II  → 3-7%   (good prognosis)
 *   III   → ~20%
 *   IV    → ~40%
 *   V     → ~80%   (severe)
 *
 * Critical: grade is 1..5 (not 0); covering the lower bound matters.
 */
import { describe, it, expect } from 'vitest';
import hh from '@/lib/runners/hunt-hess';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (hh as { bands: ScoreBand[] }).bands;

describe('hunt-hess · bands', () => {
  it('declares 4 bands (I-II grouped, III/IV/V individual)', () => {
    expect(bands.length).toBe(4);
  });

  it('every grade 1..5 maps to exactly one band', () => {
    for (let s = 1; s <= 5; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `grade ${s}`).toBe(1);
    }
  });

  it('grades I and II share a band (good prognosis)', () => {
    const b1 = findBand(bands, 1);
    const b2 = findBand(bands, 2);
    expect(b1).toBe(b2);
    expect(b1.label).toMatch(/I-II|I/);
  });

  it('grade III is its own band (~20% mortality)', () => {
    const b = findBand(bands, 3);
    expect(b.min).toBe(3);
    expect(b.max).toBe(3);
    expect(b.description).toMatch(/20/);
  });

  it('grade V is the worst band (≥80% mortality)', () => {
    const b = findBand(bands, 5);
    expect(b.label).toMatch(/V/);
    // Severe colour — dark red
    expect(b.color.toLowerCase()).toMatch(/^#(7|8|9|a|b|c|d)/i);
  });

  it('mortality monotonically increases with grade', () => {
    // Extract leading number from description
    const pct = (b: ScoreBand): number => {
      const m = b.description.match(/(\d+)/);
      return m ? Number(m[1]) : 0;
    };
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(pct(sorted[i]!), `band ${i} mortality`).toBeGreaterThanOrEqual(pct(sorted[i - 1]!));
    }
  });
});
