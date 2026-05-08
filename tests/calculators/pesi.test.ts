/**
 * Golden tests for PESI / sPESI (Pulmonary Embolism Severity Index).
 *
 * Reference: Aujesky D, Obrosky DS, Stone RA, et al. Derivation and
 * validation of a prognostic model for pulmonary embolism. Am J Respir
 * Crit Care Med 2005;172(8):1041-1046. doi:10.1164/rccm.200506-862OC
 * Simplified: Jiménez D et al. Arch Intern Med 2010;170:1383-1389.
 *
 * Bands (full PESI 30-day mortality):
 *   ≤65    → Class I  (very low, ~1.6%)    — outpatient candidate
 *   66-85  → Class II (low, ~3.5%)         — outpatient candidate
 *   86-105 → Class III (intermediate, ~7.1%)
 *   106-125→ Class IV (high, ~10.4%)
 *   ≥126   → Class V  (very high, ~24.5%)
 *
 * sPESI (simplified): 0 = low (~1%); ≥1 = high (~10%).
 */
import { describe, it, expect } from 'vitest';
import pesi from '@/lib/runners/pesi';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (pesi as { bands: ScoreBand[] }).bands;

describe('pesi · bands', () => {
  it('declares 5 mortality classes I-V', () => {
    expect(bands.length).toBe(5);
  });

  it('score ≤65 → Class I / sPESI 0', () => {
    const b = findBand(bands, 0);
    expect(findBand(bands, 65)).toBe(b);
    expect(b.label).toMatch(/Класс I|очень низкий/i);
  });

  it('boundary 65 vs 66 (Class I → Class II)', () => {
    expect(findBand(bands, 65)).not.toBe(findBand(bands, 66));
    expect(findBand(bands, 66).label).toMatch(/Класс II|низкий/i);
  });

  it('boundary 85 vs 86 (Class II → Class III)', () => {
    expect(findBand(bands, 85)).not.toBe(findBand(bands, 86));
    expect(findBand(bands, 86).label).toMatch(/Класс III|промежуточный/i);
  });

  it('boundary 105 vs 106 (Class III → Class IV)', () => {
    expect(findBand(bands, 105)).not.toBe(findBand(bands, 106));
    expect(findBand(bands, 106).label).toMatch(/Класс IV/i);
  });

  it('boundary 125 vs 126 (Class IV → Class V)', () => {
    expect(findBand(bands, 125)).not.toBe(findBand(bands, 126));
    expect(findBand(bands, 126).label).toMatch(/Класс V|очень высокий/i);
  });

  it('top band covers up to 300', () => {
    expect(findBand(bands, 300).max).toBe(300);
  });
});
