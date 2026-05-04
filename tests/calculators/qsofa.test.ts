/**
 * Golden tests for qSOFA (quick Sepsis-related Organ Failure Assessment).
 *
 * Reference: Singer M. JAMA 2016;315:801-810 (Sepsis-3).
 *
 * Score 0-3. Each criterion (RR ≥ 22, SBP ≤ 100, altered mental status)
 * = 1 point. Two-tier bands:
 *   0-1 → low risk
 *   ≥ 2 → high risk; full SOFA + sepsis bundle-1h
 */
import { describe, it, expect } from 'vitest';
import qsofa from '@/lib/runners/qsofa';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (qsofa as { bands: ScoreBand[] }).bands;

describe('qsofa · bands', () => {
  it('every score 0..3 maps to exactly one band', () => {
    for (let s = 0; s <= 3; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('qSOFA 0-1 → low risk band', () => {
    expect(findBand(bands, 0).label).toMatch(/0-?1/);
    expect(findBand(bands, 1).label).toMatch(/0-?1/);
    expect(findBand(bands, 0).description.toLowerCase()).toMatch(/низк|low/);
  });

  it('qSOFA 2 → high band, mentions sepsis / SOFA / lactate', () => {
    const b = findBand(bands, 2);
    expect(b.label.toLowerCase()).toMatch(/≥|>=|2/);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/сепсис|sepsis|sofa|лактат|lactate/);
  });

  it('qSOFA 3 (max) → high band, same as 2', () => {
    expect(findBand(bands, 3).label).toBe(findBand(bands, 2).label);
  });
});
