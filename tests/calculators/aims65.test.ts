/**
 * Golden tests for AIMS65 (UGI bleeding mortality, pre-endoscopy).
 *
 * Reference: Saltzman JR, Tabak YP, Hyett BH, Sun X, Travis AC, Johannes
 * RS. A simple risk score accurately predicts in-hospital mortality,
 * length of stay, and cost in acute upper GI bleeding. Gastrointest
 * Endosc 2011;74(6):1215-1224. doi:10.1016/j.gie.2011.06.024
 *
 * Mnemonic AIMS65 (1 pt each, max 5):
 *   A — Albumin <30 g/L
 *   I — INR >1.5
 *   M — Mental status (altered)
 *   S — SBP ≤90
 *   65 — age ≥65
 *
 * Bands (in-hospital mortality):
 *   0-1   → low (~0.3-1%)        outpatient possible if other low-risk
 *   2     → moderate (~3-5%)     inpatient observation
 *   3-5   → high (~17-31%)       ICU consideration
 */
import { describe, it, expect } from 'vitest';
import aims65 from '@/lib/runners/aims65';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (aims65 as { bands: ScoreBand[] }).bands;

describe('aims65 · bands', () => {
  it('declares 3 risk bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..5 maps to exactly one band', () => {
    for (let s = 0; s <= 5; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0..1 → low', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/низкий|0-1/);
    expect(findBand(bands, 1)).toBe(findBand(bands, 0));
  });

  it('score 2 → moderate (own band)', () => {
    const b = findBand(bands, 2);
    expect(b.min).toBe(2);
    expect(b.max).toBe(2);
    expect(b.label.toLowerCase()).toMatch(/умерен/);
  });

  it('score ≥3 → high', () => {
    const b = findBand(bands, 3);
    expect(findBand(bands, 5)).toBe(b);
    expect(b.label.toLowerCase()).toMatch(/высок|3-5/);
  });
});
