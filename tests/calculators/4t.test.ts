/**
 * Golden tests for 4T score (Heparin-Induced Thrombocytopenia, HIT).
 *
 * Reference: Lo GK, Juhl D, Warkentin TE, et al. Evaluation of
 * pretest clinical score (4 T's) for the diagnosis of heparin-induced
 * thrombocytopenia in two clinical settings. J Thromb Haemost 2006;
 * 4(4):759-765. doi:10.1111/j.1538-7836.2006.01787.x
 *
 * 4 components × 0-2:
 *   T — Thrombocytopenia magnitude
 *   T — Timing of platelet fall (5-10 days, prior heparin)
 *   T — Thrombosis or other sequelae
 *   T — oTher causes of thrombocytopenia (excluded)
 *
 * Bands (max 8):
 *   0-3 → low probability     (NPV ~99%; HIT testing not required)
 *   4-5 → intermediate        (HIT test, alternative anticoagulant if high suspicion)
 *   6-8 → high                (stop heparin, start argatroban/bivalirudin/fondaparinux)
 */
import { describe, it, expect } from 'vitest';
import t4 from '@/lib/runners/4t';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (t4 as { bands: ScoreBand[] }).bands;

describe('4t · bands', () => {
  it('declares 3 probability bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..8 maps to exactly one band', () => {
    for (let s = 0; s <= 8; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0..3 → low (HIT essentially excluded)', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/низкая|0-3/);
    expect(findBand(bands, 3)).toBe(findBand(bands, 0));
  });

  it('score 4-5 → intermediate', () => {
    expect(findBand(bands, 4).label.toLowerCase()).toMatch(/промежуточн|4-5/);
    expect(findBand(bands, 5)).toBe(findBand(bands, 4));
  });

  it('score ≥6 → high (stop heparin)', () => {
    const b = findBand(bands, 6);
    expect(findBand(bands, 8)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/высокая|6-8/);
  });

  it('boundaries 3/4 and 5/6 separate distinct bands', () => {
    expect(findBand(bands, 3)).not.toBe(findBand(bands, 4));
    expect(findBand(bands, 5)).not.toBe(findBand(bands, 6));
  });
});
