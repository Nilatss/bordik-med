/**
 * Golden tests for Apfel Score (postoperative nausea and vomiting, PONV).
 *
 * Reference: Apfel CC, Läärä E, Koivuranta M, Greim CA, Roewer N. A
 * simplified risk score for predicting postoperative nausea and
 * vomiting: conclusions from cross-validations between two centers.
 * Anesthesiology 1999;91(3):693-700.
 * doi:10.1097/00000542-199909000-00022
 *
 * 4 risk factors (1 pt each):
 *   1. Female sex
 *   2. Non-smoker
 *   3. History of PONV / motion sickness
 *   4. Postoperative opioid use
 *
 * PONV incidence (24h):
 *   0 → ~10%
 *   1 → ~21%
 *   2 → ~39%
 *   3 → ~61%
 *   4 → ~79%
 *
 * Prophylaxis (4th Consensus 2020): ≥2 risk factors → multimodal
 * antiemetic strategy (5HT3 + dexamethasone ± droperidol/aprepitant).
 */
import { describe, it, expect } from 'vitest';
import apfel from '@/lib/runners/apfel';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (apfel as { bands: ScoreBand[] }).bands;

describe('apfel · bands', () => {
  it('declares 5 bands (one per integer score 0-4)', () => {
    expect(bands.length).toBe(5);
  });

  it('every score 0..4 maps to its own band', () => {
    for (let s = 0; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
      expect(matches[0]!.min).toBe(s);
      expect(matches[0]!.max).toBe(s);
    }
  });

  it('label corresponds to numeric score', () => {
    for (let s = 0; s <= 4; s++) {
      expect(findBand(bands, s).label).toBe(String(s));
    }
  });

  it('PONV incidence rises monotonically (Apfel 1999 derivation)', () => {
    const pct = (b: ScoreBand): number => {
      const m = `${b.description ?? ''} ${b.details ?? ''}`.match(/(\d+)\s*%/);
      return m ? Number(m[1]) : 0;
    };
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      const prev = pct(sorted[i - 1]!);
      const cur = pct(sorted[i]!);
      if (prev > 0 && cur > 0) {
        expect(cur, `band ${i} risk %`).toBeGreaterThan(prev);
      }
    }
  });
});
