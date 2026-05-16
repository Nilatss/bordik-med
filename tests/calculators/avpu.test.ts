/**
 * Golden tests for AVPU (Alert/Voice/Pain/Unresponsive) consciousness scale.
 *
 * Reference: Mackway-Jones K, Marsden J, Windle J. Emergency Triage:
 *   Manchester Triage Group. 3rd ed. Wiley-Blackwell, 2014.
 *
 * Score range: 1-4. 4 categories with 1:1 score-to-level mapping.
 * Clinical use: rapid first-pass consciousness assessment in pre-hospital
 * and ER triage. P or U → urgent airway/GCS assessment.
 */
import { describe, it, expect } from 'vitest';
import avpu from '@/lib/runners/avpu';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (avpu as { bands: ScoreBand[] }).bands;

describe('avpu · bands', () => {
  it('declares 4 bands (A/V/P/U)', () => {
    expect(bands).toHaveLength(4);
  });

  it('every level 1..4 maps to exactly one band', () => {
    for (let s = 1; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('level 4 → Alert (highest)', () => {
    const b = findBand(bands, 4);
    expect(b.label).toMatch(/alert/i);
  });

  it('level 1 → Unresponsive (lowest, ABCDE/intubation actions)', () => {
    const b = findBand(bands, 1);
    expect(b.label).toMatch(/unresponsive/i);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/abcde|интубац|gcs\s*3/);
  });

  it('level 2 (Pain) → mentions intubation threshold GCS ≤ 8', () => {
    const b = findBand(bands, 2);
    expect(b.label).toMatch(/pain/i);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/gcs|интубац/);
  });
});
