/**
 * Golden tests for Padua Prediction Score (medical inpatient VTE).
 *
 * Reference: Barbar S, Noventa F, Rossetto V, et al. A risk assessment
 * model for the identification of hospitalized medical patients at risk
 * for venous thromboembolism: the Padua Prediction Score. J Thromb
 * Haemost 2010;8(11):2450-7. doi:10.1111/j.1538-7836.2010.04044.x
 *
 * Bands (90-day VTE incidence in derivation cohort):
 *   <4   → low risk (~0.3% if no prophylaxis)
 *   ≥4   → high risk (~11% without prophylaxis → LMWH/fondaparinux)
 *
 * ACCP 2012 / ASH 2018 use Padua ≥4 as the threshold for pharmacologic
 * prophylaxis in medical inpatients. Caprini is the analogue for surgical
 * patients.
 */
import { describe, it, expect } from 'vitest';
import padua from '@/lib/runners/padua';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (padua as { bands: ScoreBand[] }).bands;

describe('padua · bands', () => {
  it('declares 2 bands at the prophylaxis threshold (4)', () => {
    expect(bands.length).toBe(2);
  });

  it('score 0..3 → low-risk, no pharmacologic prophylaxis', () => {
    for (const s of [0, 1, 2, 3]) {
      const b = findBand(bands, s);
      expect(b.label).toMatch(/< 4|низк/i);
      const text = `${(b.actions ?? []).join(' ')}`.toLowerCase();
      expect(text).not.toMatch(/эноксапарин|lmwh|фондапаринукс/);
    }
  });

  it('score 4 is the high-risk threshold (≥4)', () => {
    const b = findBand(bands, 4);
    expect(b.label).toMatch(/≥ 4|≥4|высок/i);
  });

  it('high-risk band names LMWH or fondaparinux', () => {
    const b = findBand(bands, 4);
    const text = `${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/эноксапарин|далтепарин|надропарин|фондапаринукс|lmwh/);
  });

  it('high-risk band cites IMPROVE bleeding consideration', () => {
    const b = findBand(bands, 4);
    const text = `${(b.actions ?? []).join(' ')} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/improve|кровотеч|bleeding/);
  });

  it('every score 0..20 maps to exactly one band', () => {
    for (let s = 0; s <= 20; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });
});
