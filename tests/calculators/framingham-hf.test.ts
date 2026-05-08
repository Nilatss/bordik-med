/**
 * Golden tests for Framingham heart failure criteria.
 *
 * Reference: McKee PA, Castelli WP, McNamara PM, Kannel WB. The natural
 * history of congestive heart failure: the Framingham study. N Engl J
 * Med 1971;285(26):1441-1446. doi:10.1056/NEJM197112232852601
 *
 * Diagnostic threshold: ≥2 major OR 1 major + 2 minor criteria.
 * Implementation grants major=2 pts, minor=1 pt; threshold ≥3.
 *
 * Bands:
 *   0-2  → criteria not met
 *   ≥3   → criteria met (HF likely)
 */
import { describe, it, expect } from 'vitest';
import fhf from '@/lib/runners/framingham-hf';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (fhf as { bands: ScoreBand[] }).bands;

describe('framingham-hf · diagnostic bands', () => {
  it('declares 2 bands at threshold of 3', () => {
    expect(bands.length).toBe(2);
  });

  it('score 0-2 → criteria not met', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/недостаточно/);
    expect(findBand(bands, 2)).toBe(findBand(bands, 0));
  });

  it('score ≥3 → criteria met', () => {
    expect(findBand(bands, 3).label.toLowerCase()).toMatch(/критерии.*выполн/);
    expect(findBand(bands, 23)).toBe(findBand(bands, 3));
  });

  it('boundary 2 vs 3 (Framingham diagnostic threshold)', () => {
    expect(findBand(bands, 2)).not.toBe(findBand(bands, 3));
  });
});
