/**
 * Golden tests for NEWS2 (National Early Warning Score 2, RCP UK).
 *
 * Reference: Royal College of Physicians, NEWS2 (2017).
 *
 * Total range 0-20 (each vital scores 0-3, plus extras for confusion
 * and SpO₂ scale 2). Four risk bands:
 *   0   → minimal — 12-h routine monitoring
 *   1-4 → low — every 4-6 h
 *   5-6 → medium — urgent clinician review, hourly
 *   ≥ 7 → high — emergency response, possible ICU transfer
 */
import { describe, it, expect } from 'vitest';
import news2 from '@/lib/runners/news2';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (news2 as { bands: ScoreBand[] }).bands;

describe('news2 · bands', () => {
  it('every score 0..20 maps to exactly one band', () => {
    for (let s = 0; s <= 20; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('NEWS2 0 → minimal-risk band (single-value range)', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.description.toLowerCase()).toMatch(/минимал|рутин|routine/);
  });

  it('NEWS2 4 (boundary) → still low band, not medium', () => {
    const b = findBand(bands, 4);
    expect(b.label).toMatch(/1-?4/);
    expect(b.description.toLowerCase()).not.toMatch(/высок|high|средн|medium/);
  });

  it('NEWS2 5 → medium band, mentions urgent clinician review', () => {
    const b = findBand(bands, 5);
    expect(b.label).toMatch(/5-?6/);
    expect(b.description.toLowerCase()).toMatch(/средн|медиум|medium|срочн/);
  });

  it('NEWS2 7 → high band, mentions ICU/emergency', () => {
    const b = findBand(bands, 7);
    expect(b.label).toMatch(/≥\s*7|>=\s*7|7/);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/высок|icu|экстренн|emergency/);
  });

  it('NEWS2 20 (max) → high band, same as 7', () => {
    expect(findBand(bands, 20).label).toBe(findBand(bands, 7).label);
  });
});
