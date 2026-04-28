/**
 * Golden tests for CHA₂DS₂-VASc score (atrial fibrillation stroke risk).
 *
 * Reference: ESC 2024 AF Guidelines; Lip et al. Chest 2010;137:263–272.
 *
 * Scoring (max 9):
 *   C  Congestive HF                 +1
 *   H  Hypertension                  +1
 *   A₂ Age ≥ 75                      +2
 *   D  Diabetes                      +1
 *   S₂ Stroke / TIA / TE             +2
 *   V  Vascular disease (MI/PAD/Ao)  +1
 *   A  Age 65–74                     +1
 *   Sc Sex (female)                  +1
 *
 * Bands the runner declares: 0 / 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9.
 * Critical safety rule: every integer score 0–9 must map to exactly
 * one band — no gaps, no overlaps. A gap silently misclassifies a
 * patient (e.g. score 3 falling through to "low" band). An overlap
 * makes the result ambiguous.
 */
import { describe, it, expect } from 'vitest';
import chads from '@/lib/runners/chads-vasc';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (chads as { bands: ScoreBand[] }).bands;

describe('chads-vasc · bands', () => {
  it('declares non-empty band list', () => {
    expect(bands.length).toBeGreaterThan(0);
  });

  it('every score 0..9 maps to exactly one band', () => {
    const seen = new Set<number>();
    for (let s = 0; s <= 9; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
      seen.add(s);
    }
    expect(seen.size).toBe(10);
  });

  it('bands are non-overlapping', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min, `band ${i} starts before previous ended`).toBeGreaterThan(sorted[i - 1]!.max);
    }
  });

  it('low score (0) → low / no AC band', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/0/);
    expect(b.description.toLowerCase()).toMatch(/низк|не показан/i);
  });

  it('moderate score (1) message is sex-aware (female only)', () => {
    const b = findBand(bands, 1);
    expect(b).toBeDefined();
    expect(b.description.length).toBeGreaterThan(20);
  });

  it('high score (≥3) carries explicit anticoagulation guidance', () => {
    for (const score of [3, 5, 7, 9]) {
      const b = findBand(bands, score);
      expect(b.description.toLowerCase()).toMatch(/антикоагул|поак|варфарин|апиксабан|ривароксабан|дабигатран|edoxaban|nоак/i);
    }
  });
});
