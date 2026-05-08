/**
 * Golden tests for Sgarbossa criteria (STEMI in LBBB).
 *
 * Reference: Sgarbossa EB, Pinski SL, Barbagelata A, et al. Electro-
 * cardiographic diagnosis of evolving acute myocardial infarction in
 * the presence of left bundle-branch block. N Engl J Med 1996;334(8):
 * 481-487. doi:10.1056/NEJM199602223340801
 * Modified Smith-Sgarbossa: Smith SW et al. Ann Emerg Med 2012;60:766-776.
 *
 * Items (max ~10 with weighted concordance):
 *   Concordant ST elevation ≥1 mm        +5
 *   Concordant ST depression V1-V3 ≥1 mm +3
 *   Discordant ST elevation ≥5 mm        +2 (Smith: ≥25% of S-wave)
 *
 * Bands:
 *   0-2 → negative (LBBB alone, no STEMI by criteria)
 *   3-4 → borderline (clinical correlation needed)
 *   ≥5  → Sgarbossa-positive (treat as STEMI equivalent)
 */
import { describe, it, expect } from 'vitest';
import sg from '@/lib/runners/sgarbossa';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (sg as { bands: ScoreBand[] }).bands;

describe('sgarbossa · bands', () => {
  it('declares 3 bands', () => {
    expect(bands.length).toBe(3);
  });

  it('score 0-2 → negative', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/негативно|0-2/);
    expect(findBand(bands, 2)).toBe(findBand(bands, 0));
  });

  it('score 3 → borderline / 3-4', () => {
    const b = findBand(bands, 3);
    expect(b.label.toLowerCase()).toMatch(/погранич|3/);
  });

  it('score ≥5 → Sgarbossa-positive (STEMI equivalent)', () => {
    const b = findBand(bands, 5);
    expect(findBand(bands, 10)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/sgarbossa|≥ 5|≥5/i);
  });

  it('boundaries 2/3 and 4/5', () => {
    expect(findBand(bands, 2)).not.toBe(findBand(bands, 3));
    expect(findBand(bands, 4)).not.toBe(findBand(bands, 5));
  });

  it('every score 0..10 covered', () => {
    for (let s = 0; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });
});
