/**
 * Golden tests for IPSS (International Prostate Symptom Score).
 *
 * Reference: Barry MJ, Fowler FJ Jr, O'Leary MP, et al. The American
 * Urological Association symptom index for benign prostatic hyperplasia.
 * J Urol 1992;148(5):1549-57. AUA / EAU guidelines anchor management.
 *
 * Bands (max 35 = 7 items × 5):
 *   0-7   → mild       (watchful waiting / lifestyle)
 *   8-19  → moderate   (medical therapy: α-blockers, 5-ARI)
 *   20-35 → severe     (medical, escalate to surgical / TURP discussion)
 */
import { describe, it, expect } from 'vitest';
import ipss from '@/lib/runners/ipss';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (ipss as { bands: ScoreBand[] }).bands;

describe('ipss · bands', () => {
  it('declares 3 severity bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..35 maps to exactly one band', () => {
    for (let s = 0; s <= 35; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('boundary 7 vs 8 (mild → moderate)', () => {
    expect(findBand(bands, 7)).not.toBe(findBand(bands, 8));
    expect(findBand(bands, 7).label.toLowerCase()).toMatch(/лёгкая|mild|0-7/);
  });

  it('boundary 19 vs 20 (moderate → severe)', () => {
    expect(findBand(bands, 19)).not.toBe(findBand(bands, 20));
    expect(findBand(bands, 20).label.toLowerCase()).toMatch(/тяжёл|severe|20-35/);
  });

  it('full 0..35 range covered', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(0);
    expect(sorted[sorted.length - 1]!.max).toBe(35);
  });
});
