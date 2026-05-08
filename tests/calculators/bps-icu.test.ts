/**
 * Golden tests for BPS (Behavioral Pain Scale) for ventilated ICU patients.
 *
 * Reference: Payen JF, Bru O, Bosson JL, et al. Assessing pain in
 * critically ill sedated patients by using a behavioral pain scale. Crit
 * Care Med 2001;29(12):2258-2263. doi:10.1097/00003246-200112000-00004
 *
 * 3 domains × 1-4 = score 3..12:
 *   - Facial expression
 *   - Upper limb movement
 *   - Compliance with ventilator
 *
 * Bands (PADIS 2018 ICU pain guidelines):
 *   3     → no pain
 *   4-5   → acceptable analgesia
 *   6-7   → moderate; correct analgesia
 *   8-12  → severe; immediate escalation
 */
import { describe, it, expect } from 'vitest';
import bps from '@/lib/runners/bps-icu';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (bps as { bands: ScoreBand[] }).bands;

describe('bps-icu · bands', () => {
  it('declares 4 pain bands', () => {
    expect(bands.length).toBe(4);
  });

  it('starts at min=3 (no domain can be zero in BPS)', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(3);
  });

  it('every score 3..12 maps to exactly one band', () => {
    for (let s = 3; s <= 12; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 3 → no pain', () => {
    const b = findBand(bands, 3);
    expect(b.description.toLowerCase()).toMatch(/нет боли/);
  });

  it('score 4-5 → acceptable analgesia', () => {
    expect(findBand(bands, 4)).toBe(findBand(bands, 5));
    expect(findBand(bands, 4).description.toLowerCase()).toMatch(/приемлем/);
  });

  it('score 6-7 → moderate, requires correction', () => {
    expect(findBand(bands, 6)).toBe(findBand(bands, 7));
    expect(findBand(bands, 6).description.toLowerCase()).toMatch(/умеренная|коррекц/);
  });

  it('score ≥8 → severe pain, immediate escalation', () => {
    const b = findBand(bands, 8);
    expect(findBand(bands, 12)).toBe(b);
    expect(b.description.toLowerCase()).toMatch(/выраженная|эскалац/);
  });
});
