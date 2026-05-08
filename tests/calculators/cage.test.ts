/**
 * Golden tests for CAGE questionnaire (alcohol screening, 4-item).
 *
 * Reference: Ewing JA. Detecting alcoholism: the CAGE questionnaire.
 * JAMA 1984;252(14):1905-7. doi:10.1001/jama.1984.03350140051025
 *
 * Items (one point each, max 4):
 *   C — Cut down: ever felt need to cut down?
 *   A — Annoyed by criticism of drinking?
 *   G — Guilty about drinking?
 *   E — Eye-opener: ever drank as eye-opener (morning)?
 *
 * Threshold: ≥2 → highly likely AUD; sensitivity ~93%, specificity ~76%.
 *   0-1 → low concern (although ≥1 is not "negative" — clinical context)
 *   ≥2  → positive, requires follow-up
 */
import { describe, it, expect } from 'vitest';
import cage from '@/lib/runners/cage';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (cage as { bands: ScoreBand[] }).bands;

describe('cage · bands', () => {
  it('declares 2 bands at the diagnostic threshold (≥2)', () => {
    expect(bands.length).toBe(2);
  });

  it('every score 0..4 maps to exactly one band', () => {
    for (let s = 0; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0-1 → low band', () => {
    expect(findBand(bands, 0)).toBe(findBand(bands, 1));
  });

  it('score ≥2 is the positive screen threshold', () => {
    const positive = findBand(bands, 2);
    expect(findBand(bands, 3)).toBe(positive);
    expect(findBand(bands, 4)).toBe(positive);
    expect(positive.label).toMatch(/≥2|≥ 2/);
  });

  it('positive band uses warning colour (not green)', () => {
    const positive = findBand(bands, 2);
    expect(positive.color.toLowerCase()).not.toMatch(/^#2/i); // not green
  });
});
