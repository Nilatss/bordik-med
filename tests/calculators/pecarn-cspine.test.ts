/**
 * Golden tests for PECARN pediatric C-spine rule.
 *
 * Reference: Leonard JC, Kuppermann N, Olsen C, et al. Factors
 * associated with cervical spine injury in children after blunt trauma.
 * Ann Emerg Med 2011;58(2):145-155.
 * doi:10.1016/j.annemergmed.2010.08.038
 *
 * 8 risk factors for pediatric c-spine injury. Bands:
 *   0    → very low risk
 *   1    → low-intermediate (cautious imaging)
 *   ≥2   → high risk → CT/MRI cervical spine
 */
import { describe, it, expect } from 'vitest';
import pecarn from '@/lib/runners/pecarn-cspine';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (pecarn as { bands: ScoreBand[] }).bands;

describe('pecarn-cspine · bands', () => {
  it('declares 3 risk bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..8 maps to exactly one band', () => {
    for (let s = 0; s <= 8; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0 → very low risk', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/очень низк/);
  });

  it('score 1 → intermediate (own band)', () => {
    const b = findBand(bands, 1);
    expect(b.min).toBe(1);
    expect(b.max).toBe(1);
    expect(b.label.toLowerCase()).toMatch(/низк|промежуточ|1 фактор/);
  });

  it('score ≥2 → high risk', () => {
    const b = findBand(bands, 2);
    expect(findBand(bands, 8)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/высок|≥ ?2/);
  });

  it('boundaries 0/1 and 1/2 separate distinct bands', () => {
    expect(findBand(bands, 0)).not.toBe(findBand(bands, 1));
    expect(findBand(bands, 1)).not.toBe(findBand(bands, 2));
  });
});
