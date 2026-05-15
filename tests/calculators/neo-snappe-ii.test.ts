/**
 * Hand-tests for SNAPPE-II (Neonatal Acute Physiology Perinatal Extension v2).
 *
 * Reference: Richardson DK, Corcoran JD, Escobar GJ, Lee SK.
 *   SNAP-II and SNAPPE-II: Simplified newborn illness severity and
 *   mortality risk scores. J Pediatr 2001;138(1):92-100.
 *
 * Score range: 0-162.
 *
 * Bands (per runner):
 *   0-20   → low      (~1-3 % mortality)
 *   21-40  → moderate (~5-15 %)
 *   41-60  → high     (~15-35 %)
 *   61-162 → critical (~40-80 %)
 *
 * Max points by parameter (sum = 162):
 *   MAP 19 · Temp 15 · pO2/FiO2 28 · pH 16 · Seizures 19
 *   UO 18 · BW 17 · Apgar5 18 · SGA 12
 */
import { describe, it, expect } from 'vitest';
import snappe from '@/lib/runners/neo-snappe-ii';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (snappe as { bands: ScoreBand[] }).bands;
const maxScore = (snappe as { maxScore: number }).maxScore;

describe('neo-snappe-ii · bands', () => {
  it('declares 4 risk bands', () => {
    expect(bands.length).toBe(4);
  });

  it('maxScore is 162 (sum of all parameter max points)', () => {
    expect(maxScore).toBe(162);
    // Verify by summing input option max points
    const inputs = (snappe as { inputs: { options: { points: number }[] }[] }).inputs;
    const sumMax = inputs.reduce((s, inp) => {
      const max = Math.max(...inp.options.map((o) => o.points));
      return s + max;
    }, 0);
    expect(sumMax).toBe(162);
  });

  it('every score 0..162 maps to exactly one band', () => {
    for (let s = 0; s <= 162; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('low band (0-20) — ~1-3 % mortality wording', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/0-20|низк/i);
    expect(findBand(bands, 20)).toBe(b);
    expect(`${b.description ?? ''}`).toMatch(/1-3|низк/i);
  });

  it('moderate band (21-40) — ~5-15 %', () => {
    const b = findBand(bands, 21);
    expect(findBand(bands, 40)).toBe(b);
    expect(`${b.description ?? ''}`).toMatch(/5-15|умерен/i);
  });

  it('high band (41-60) — ~15-35 %', () => {
    const b = findBand(bands, 41);
    expect(findBand(bands, 60)).toBe(b);
    expect(`${b.description ?? ''}`).toMatch(/15-35|высок/i);
  });

  it('critical band (61-162) — ~40-80 %', () => {
    const b = findBand(bands, 61);
    expect(findBand(bands, 162)).toBe(b);
    expect(`${b.description ?? ''}`).toMatch(/40-80|критич/i);
  });

  it('bands cover full 0..162 range without gaps', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(0);
    expect(sorted[sorted.length - 1]!.max).toBe(maxScore);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min, `gap before band ${i}`).toBe(sorted[i - 1]!.max + 1);
    }
  });

  it('all bands have actions array', () => {
    for (const b of bands) {
      expect(Array.isArray(b.actions)).toBe(true);
      expect((b.actions ?? []).length).toBeGreaterThan(0);
    }
  });
});

describe('neo-snappe-ii · structure', () => {
  it('has 9 inputs (SNAP-II 6 + perinatal 3)', () => {
    const inputs = (snappe as { inputs: unknown[] }).inputs;
    expect(inputs.length).toBe(9);
  });

  it('inputs include required parameters (MAP, temp, pO₂/FiO₂, pH, seizures, UO, BW, Apgar5, SGA)', () => {
    const inputs = (snappe as { inputs: { id: string }[] }).inputs;
    const ids = inputs.map((i) => i.id);
    expect(ids).toContain('map');
    expect(ids).toContain('temp');
    expect(ids).toContain('pf_ratio');
    expect(ids).toContain('ph');
    expect(ids).toContain('seizures');
    expect(ids).toContain('urine');
    expect(ids).toContain('bw');
    expect(ids).toContain('apgar5');
    expect(ids).toContain('sga');
  });

  it('cites Richardson DK J Pediatr 2001', () => {
    const ref = (snappe as { reference?: string }).reference ?? '';
    expect(ref).toMatch(/Richardson/i);
    expect(ref).toMatch(/2001/);
    expect(ref).toMatch(/J Pediatr|138/);
  });
});
