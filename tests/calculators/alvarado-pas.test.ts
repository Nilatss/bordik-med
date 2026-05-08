/**
 * Golden tests for Pediatric Appendicitis Score (PAS, Samuel 2002).
 *
 * Reference: Samuel M. Pediatric appendicitis score. J Pediatr Surg
 * 2002;37(6):877-881. doi:10.1053/jpsu.2002.32893
 *
 * Validation: Bhatt M, et al. Prospective validation of the pediatric
 * appendicitis score in a Canadian pediatric emergency department. Acad
 * Emerg Med 2009;16(7):591-596.
 *
 * Bands declared (max 12, slightly different from classic PAS-10):
 *   0-4   → low probability (discharge with follow-up)
 *   5-8   → equivocal (observation, repeat exam, imaging)
 *   9-12  → high (surgical consult / appendectomy)
 *
 * vs adult Alvarado: replaces "rebound" with cough/hop test, peds WBC
 * cut-offs. Sensitivity 92%, specificity 50% at PAS ≥7 (Bhatt 2009).
 */
import { describe, it, expect } from 'vitest';
import pas from '@/lib/runners/alvarado-pas';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (pas as { bands: ScoreBand[] }).bands;

describe('alvarado-pas · bands', () => {
  it('declares 3 probability bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..12 maps to exactly one band', () => {
    for (let s = 0; s <= 12; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0..4 → low probability (discharge)', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/низкая|0-4/);
    expect(findBand(bands, 4)).toBe(findBand(bands, 0));
  });

  it('score 5..8 → equivocal', () => {
    const b = findBand(bands, 5);
    expect(findBand(bands, 8)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/промежуточная|5-8/);
  });

  it('score 9..12 → high probability (surgical)', () => {
    const b = findBand(bands, 9);
    expect(findBand(bands, 12)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/высокая|9-12/);
  });

  it('boundaries 4/5 and 8/9 separate distinct bands', () => {
    expect(findBand(bands, 4)).not.toBe(findBand(bands, 5));
    expect(findBand(bands, 8)).not.toBe(findBand(bands, 9));
  });

  it('top band uses warning colour (red zone)', () => {
    expect(findBand(bands, 10).color.toLowerCase()).toMatch(/^#(e|d|c|b|a|9|8|7)/i);
  });
});
