/**
 * Boundary regression test for the LQTS (Schwartz) probability bands.
 *
 * Schwartz score uses 0.5-point increments, so lqts is excluded from the
 * integer score-bands-integrity suite. The bands previously OVERLAPPED at
 * 1.5 (low ∩ intermediate) and 3.5 (intermediate ∩ high); with findBand's
 * first-match-wins, score 1.5 read as "low" and 3.5 as "intermediate" —
 * each one probability tier too low. Cutoffs (Schwartz 1993/2011):
 *   ≤1   low · 1.5–3 intermediate · ≥3.5 high
 */
import { describe, it, expect } from 'vitest';
import { findBand, type ScoreBand } from '@/lib/tools-runners';
import lqts from '@/lib/runners/lqts';

const bands = (lqts as unknown as { bands: ScoreBand[] }).bands;
const label = (s: number) => findBand(bands, s).label;

describe('lqts (Schwartz) band boundaries', () => {
  it('≤1 → low probability', () => {
    expect(label(0)).toContain('низкая');
    expect(label(0.5)).toContain('низкая');
    expect(label(1)).toContain('низкая');
  });

  it('1.5–3 → intermediate (boundaries 1.5 and 3 included)', () => {
    expect(label(1.5)).toContain('промежуточная');
    expect(label(2.5)).toContain('промежуточная');
    expect(label(3)).toContain('промежуточная');
  });

  it('≥3.5 → high (boundary 3.5 included)', () => {
    expect(label(3.5)).toContain('высокая');
    expect(label(5)).toContain('высокая');
    expect(label(9)).toContain('высокая');
  });

  it('bands do not overlap at the half-step boundaries', () => {
    for (const s of [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 9]) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });
});
