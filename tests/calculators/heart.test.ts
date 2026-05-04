/**
 * Golden tests for HEART score (chest pain MACE risk).
 *
 * Reference: Six AJ et al. Crit Pathw Cardiol 2008;7:111-115.
 *
 * Score 0-10. Bands:
 *   0-3  → low (~1.7% MACE) — discharge possible
 *   4-6  → moderate (~16.6%) — admit, observe, repeat troponin
 *   7-10 → high (~50%) — invasive strategy, cardiology
 *
 * Misclassifying a low-risk patient as moderate / vice versa is the
 * highest-impact data error: a "discharge home" decision applied to a
 * 4-point patient leads to missed MACE.
 */
import { describe, it, expect } from 'vitest';
import heart from '@/lib/runners/heart';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (heart as { bands: ScoreBand[] }).bands;

describe('heart · bands', () => {
  it('every score 0..10 maps to exactly one band', () => {
    for (let s = 0; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('HEART 3 (low boundary) → low band, mentions discharge', () => {
    const b = findBand(bands, 3);
    expect(b.label).toMatch(/0-?3|низк|low/i);
    expect(b.description.toLowerCase()).toMatch(/выпис|discharge|домой/);
  });

  it('HEART 4 (just above low) → moderate band, NOT low', () => {
    const b = findBand(bands, 4);
    expect(b.label).toMatch(/4-?6|умеренн|moderate/i);
    expect(b.description.toLowerCase()).not.toMatch(/выпис.*домой|discharge home/);
  });

  it('HEART 6 (moderate boundary) → still moderate, mentions troponin', () => {
    const b = findBand(bands, 6);
    expect(b.label).toMatch(/4-?6/);
    expect(b.description.toLowerCase()).toMatch(/тропонин|troponin|госпитализ/);
  });

  it('HEART 7 → high band, mentions invasive strategy', () => {
    const b = findBand(bands, 7);
    expect(b.label.toLowerCase()).toMatch(/7|высок|high/);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/инвазивн|invasive|каг|кардиолог/);
  });

  it('HEART 10 (max) → high band', () => {
    expect(findBand(bands, 10).label).toBe(findBand(bands, 7).label);
  });
});
