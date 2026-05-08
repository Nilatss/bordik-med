/**
 * Golden tests for Westley Croup Score.
 *
 * Reference: Westley CR, Cotton EK, Brooks JG. Nebulized racemic
 * epinephrine by IPPB for the treatment of croup: a double-blind study.
 * Am J Dis Child 1978;132(5):484-487.
 * doi:10.1001/archpedi.1978.02120300044008
 *
 * 5 components: stridor, retractions, air entry, cyanosis, consciousness.
 * Bands (NICE 2019 / AAP 2019 anchored):
 *   ≤2    → mild          (single-dose dexamethasone, observation)
 *   3-5   → moderate      (dex + nebulised epinephrine; observe ≥3-4h)
 *   6-11  → severe        (admit, repeat epi, possible PICU)
 *   ≥12   → critical      (intubation prep, ICU)
 *
 * Note: ≥12 is rare and includes hypoxia + altered consciousness.
 */
import { describe, it, expect } from 'vitest';
import westley from '@/lib/runners/westley';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (westley as { bands: ScoreBand[] }).bands;

describe('westley · bands', () => {
  it('declares 4 severity bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..17 maps to exactly one band', () => {
    for (let s = 0; s <= 17; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('boundary 2 vs 3 (mild → moderate)', () => {
    expect(findBand(bands, 2)).not.toBe(findBand(bands, 3));
    expect(findBand(bands, 2).label.toLowerCase()).toMatch(/лёгкий|≤2/);
  });

  it('boundary 5 vs 6 (moderate → severe)', () => {
    expect(findBand(bands, 5)).not.toBe(findBand(bands, 6));
    expect(findBand(bands, 6).label.toLowerCase()).toMatch(/тяжёлый|6-11/);
  });

  it('boundary 11 vs 12 (severe → critical)', () => {
    expect(findBand(bands, 11)).not.toBe(findBand(bands, 12));
    expect(findBand(bands, 12).label.toLowerCase()).toMatch(/критическ|≥12|≥ 12/);
  });

  it('top band covers up to maxScore=17', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[sorted.length - 1]!.max).toBe(17);
  });

  it('critical band uses dark red colour', () => {
    const b = findBand(bands, 15);
    expect(b.color.toLowerCase()).toMatch(/^#(7|8|9|a|b)/i);
  });
});
