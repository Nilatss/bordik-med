/**
 * Golden tests for TIMI Risk Score (UA/NSTEMI).
 *
 * Reference: Antman EM, Cohen M, Bernink PJ, et al. The TIMI risk score
 * for unstable angina/non-ST elevation MI: a method for prognostication
 * and therapeutic decision making. JAMA 2000;284(7):835-842.
 * doi:10.1001/jama.284.7.835
 *
 * 7 items, 1 point each. 14-day MACE (death + MI + urgent revasc):
 *   0-2 → 5-8%   (low)
 *   3-4 → 13-20% (moderate, invasive strategy considered)
 *   5-7 → 26-41% (high, urgent invasive)
 *
 * GRACE 2.0 generally preferred for ESC 2023 (continuous variables →
 * finer granularity) but TIMI remains popular bedside.
 */
import { describe, it, expect } from 'vitest';
import timi from '@/lib/runners/timi';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (timi as { bands: ScoreBand[] }).bands;

describe('timi · bands', () => {
  it('declares 3 risk bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..7 maps to exactly one band', () => {
    for (let s = 0; s <= 7; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('boundary 2 vs 3 (low → moderate, invasive consideration)', () => {
    expect(findBand(bands, 2)).not.toBe(findBand(bands, 3));
    expect(findBand(bands, 3).label.toLowerCase()).toMatch(/умеренн|3-4/);
  });

  it('boundary 4 vs 5 (moderate → high)', () => {
    expect(findBand(bands, 4)).not.toBe(findBand(bands, 5));
    expect(findBand(bands, 5).label.toLowerCase()).toMatch(/высок|5-7/);
  });

  it('moderate band mentions invasive strategy', () => {
    const b = findBand(bands, 3);
    expect(b.description.toLowerCase()).toMatch(/инвазивн|invasive/);
  });

  it('high band covers up to 7', () => {
    const b = findBand(bands, 7);
    expect(b.label).toMatch(/5-7|≥5/i);
  });
});
