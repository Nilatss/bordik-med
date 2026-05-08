/**
 * Golden tests for ABCD² Score (TIA → 2-day stroke risk).
 *
 * Reference: Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al. Validation
 * and refinement of scores to predict very early stroke risk after
 * transient ischaemic attack. Lancet 2007;369(9558):283-292.
 * doi:10.1016/S0140-6736(07)60150-0
 *
 * Bands declared by runner:
 *   0-3 → low (1.0% 2-day stroke risk)       — outpatient workup
 *   4-5 → moderate (4.1%)                    — admit, urgent imaging
 *   6-7 → high (8.1%)                        — emergent admission
 *
 * Items + points (max 7):
 *   A — Age ≥60                                        1
 *   B — BP ≥140/90                                     1
 *   C — Clinical: unilateral weakness=2 / speech-only=1 / other=0
 *   D — Duration: ≥60min=2 / 10-59min=1 / <10min=0
 *   D — Diabetes                                       1
 */
import { describe, it, expect } from 'vitest';
import abcd2 from '@/lib/runners/abcd2';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (abcd2 as { bands: ScoreBand[] }).bands;

describe('abcd2 · bands', () => {
  it('declares 3 risk bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..7 maps to exactly one band', () => {
    for (let s = 0; s <= 7; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('low band 0-3 — outpatient or low-risk wording', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/0-3|низк/i);
    const b3 = findBand(bands, 3);
    expect(b3).toBe(b);
  });

  it('moderate band 4-5 — urgent / admit wording', () => {
    const b = findBand(bands, 4);
    expect(b.label).toMatch(/4-5|умерен/i);
    expect(findBand(bands, 5)).toBe(b);
  });

  it('high band 6-7 — emergent / explicit DAPT or imaging guidance', () => {
    const b = findBand(bands, 6);
    expect(b.label).toMatch(/6-7|высок/i);
    expect(findBand(bands, 7)).toBe(b);
    // High-risk band should mention secondary prevention
    const text = `${b.description ?? ''} ${b.details ?? ''} ${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/аск|клопидогр|статин|узд|мрт|кт|cea|cas/);
  });

  it('bands cover full 0..maxScore range without gaps', () => {
    const maxScore = (abcd2 as { maxScore: number }).maxScore;
    expect(maxScore).toBe(7);
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(0);
    expect(sorted[sorted.length - 1]!.max).toBe(maxScore);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min, `gap before band ${i}`).toBe(sorted[i - 1]!.max + 1);
    }
  });
});
