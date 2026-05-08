/**
 * Golden tests for SOFA score (Sequential Organ Failure Assessment).
 *
 * Reference: Vincent JL, Moreno R, Takala J, et al. Intensive Care Med
 * 1996;22(7):707-710. doi:10.1007/BF01709751
 * Sepsis-3 (Singer 2016) — sepsis = ΔSOFA ≥2 + suspected infection.
 *
 * Bands (ICU mortality, derivation cohort):
 *   0-6   → ~10%
 *   7-9   → ~22%
 *   10-12 → ~50%
 *   13-14 → ~80%
 *   ≥15   → ~90%+
 *
 * 6 organ systems × (0-4) → max 24.
 */
import { describe, it, expect } from 'vitest';
import sofa from '@/lib/runners/sofa';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (sofa as { bands: ScoreBand[] }).bands;

describe('sofa · bands', () => {
  it('declares 5 mortality bands', () => {
    expect(bands.length).toBe(5);
  });

  it('every score 0..24 maps to exactly one band', () => {
    for (let s = 0; s <= 24; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('maxScore is 24 (6 systems × 4 points)', () => {
    expect((sofa as { maxScore: number }).maxScore).toBe(24);
  });

  it('lowest band 0-6 is the safest', () => {
    const b = findBand(bands, 0);
    expect(b.label).toBe('0-6');
    expect(findBand(bands, 6)).toBe(b);
  });

  it('top band ≥15 covers up to maxScore', () => {
    const b = findBand(bands, 15);
    expect(findBand(bands, 24)).toBe(b);
    expect(b.label).toMatch(/≥15|≥ 15/);
  });

  it('bands have no gaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min, `gap before band ${i}`).toBe(sorted[i - 1]!.max + 1);
    }
  });

  it('mortality monotonically increases with band', () => {
    const pct = (b: ScoreBand): number => {
      const m = `${b.description ?? ''} ${b.details ?? ''}`.match(/(\d+)\s*%/);
      return m ? Number(m[1]) : 0;
    };
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      const prev = pct(sorted[i - 1]!);
      const cur = pct(sorted[i]!);
      // Some bands may not state explicit %, so only enforce ordering when both have it
      if (prev > 0 && cur > 0) {
        expect(cur, `band ${i} mortality`).toBeGreaterThanOrEqual(prev);
      }
    }
  });
});
