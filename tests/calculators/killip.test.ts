/**
 * Golden tests for Killip Classification (heart failure in MI).
 *
 * Reference: Killip T 3rd, Kimball JT. Treatment of myocardial
 * infarction in a coronary care unit. Am J Cardiol 1967;20(4):457-464.
 * doi:10.1016/0002-9149(67)90023-9. Component variable in GRACE 2.0.
 *
 * Classes (30-day mortality, original derivation):
 *   I   — no signs of HF                        ~6%
 *   II  — crackles, S3, elevated JVP            ~17%
 *   III — acute pulmonary oedema                ~38%
 *   IV  — cardiogenic shock                     ~81%
 *
 * Note: modern reperfusion era reduces all-class mortality.
 */
import { describe, it, expect } from 'vitest';
import killip from '@/lib/runners/killip';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (killip as { bands: ScoreBand[] }).bands;

describe('killip · bands', () => {
  it('declares 4 bands (one per class)', () => {
    expect(bands.length).toBe(4);
  });

  it('every class 1..4 maps to its own band', () => {
    for (let s = 1; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `class ${s}`).toBe(1);
      const b = matches[0]!;
      expect(b.min).toBe(s);
      expect(b.max).toBe(s);
    }
  });

  it('class IV (cardiogenic shock) is the worst', () => {
    const b = findBand(bands, 4);
    expect(b.label).toMatch(/IV/);
    // Severe colour
    expect(b.color.toLowerCase()).toMatch(/^#(7|8|9|a|b)/i);
  });

  it('mortality monotonically increases with class', () => {
    const pct = (b: ScoreBand): number => {
      const m = `${b.description ?? ''} ${b.details ?? ''}`.match(/(\d+)\s*%/);
      return m ? Number(m[1]) : 0;
    };
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      const prev = pct(sorted[i - 1]!);
      const cur = pct(sorted[i]!);
      if (prev > 0 && cur > 0) {
        expect(cur).toBeGreaterThanOrEqual(prev);
      }
    }
  });
});
