/**
 * Golden tests for HAS-BLED (bleeding risk on anticoagulation).
 *
 * Reference: Pisters R et al. Chest 2010;138:1093-1100.
 *
 * Score 0-9. Bands:
 *   0-2 → low — anticoagulation is reasonable
 *   3-4 → moderate — control modifiable factors, don't withhold AC
 *   ≥ 5 → high — cautious AC, intensive monitoring
 *
 * Critical clinical rule: HAS-BLED ≥ 3 is NOT a reason to withhold
 * anticoagulation in a patient who needs it (e.g. AF stroke
 * prevention). The runner's text must reflect that nuance.
 */
import { describe, it, expect } from 'vitest';
import hb from '@/lib/runners/has-bled';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (hb as { bands: ScoreBand[] }).bands;

describe('has-bled · bands', () => {
  it('every score 0..9 maps to exactly one band', () => {
    for (let s = 0; s <= 9; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('HAS-BLED 0-2 → low band, anticoagulation is safe', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/0-?2/);
    expect(b.description.toLowerCase()).toMatch(/низк|low|безопас/);
  });

  it('HAS-BLED 3 → moderate band — does NOT recommend withholding AC', () => {
    const b = findBand(bands, 3);
    expect(b.label).toMatch(/3-?4/);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    // The detail block must spell out that ≥ 3 is a flag for modifiable
    // factor correction, not a contraindication to anticoagulation.
    expect(text).toMatch(/модифицируем|корректировк|поводом|reason/);
  });

  it('HAS-BLED 4 → still moderate band (not high)', () => {
    expect(findBand(bands, 4).label).toBe(findBand(bands, 3).label);
  });

  it('HAS-BLED ≥ 5 → high band', () => {
    const b = findBand(bands, 5);
    expect(b.min).toBeGreaterThanOrEqual(5);
    expect(b.label).not.toBe(findBand(bands, 0).label);
  });
});
