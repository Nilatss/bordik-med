/**
 * Golden tests for Ottawa Knee Rules.
 *
 * Reference: Stiell IG, Greenberg GH, Wells GA, et al. Derivation of a
 * decision rule for the use of radiography in acute knee injuries. Ann
 * Emerg Med 1995;26(4):405-413. doi:10.1016/s0196-0644(95)70106-0
 *
 * Sensitivity 98-100% for clinically significant fractures.
 *
 * Bands:
 *   0    → no criteria → no X-ray (sensitivity 98-100% per Stiell 1995)
 *   ≥1   → X-ray indicated (AP + lateral, ± patella view)
 */
import { describe, it, expect } from 'vitest';
import ottawaKnee from '@/lib/runners/ottawa-knee';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (ottawaKnee as { bands: ScoreBand[] }).bands;

describe('ottawa-knee · bands', () => {
  it('declares 2 bands', () => {
    expect(bands.length).toBe(2);
  });

  it('score 0 → no X-ray (98-100% sensitivity)', () => {
    const b = findBand(bands, 0);
    expect(b.label.toLowerCase()).toMatch(/нет критериев/);
    expect(b.description.toLowerCase()).toMatch(/98|100|чувствит/);
  });

  it('score ≥1 → X-ray indicated', () => {
    const b = findBand(bands, 1);
    expect(findBand(bands, 5)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/≥ 1|≥1/);
    expect(b.description.toLowerCase()).toMatch(/рентген|x-ray/);
  });
});
