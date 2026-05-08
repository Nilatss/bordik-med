/**
 * Golden tests for Caprini Score (surgical VTE risk).
 *
 * Reference: Caprini JA. Risk assessment as a guide for the prevention of
 * the many faces of venous thromboembolism. Am J Surg 2010;199(1
 * Suppl):S3-10. ACCP 2012 / ASH 2018 guidelines anchor prophylaxis
 * thresholds.
 *
 * Bands → prophylaxis (ACCP 2012):
 *   0     → very low risk → early ambulation
 *   1-2   → low risk → mechanical (IPC / SCD)
 *   3-4   → moderate → mechanical + pharmacologic (LMWH/UFH)
 *   ≥5    → high → LMWH (extended in cancer surgery / arthroplasty)
 */
import { describe, it, expect } from 'vitest';
import caprini from '@/lib/runners/caprini';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (caprini as { bands: ScoreBand[] }).bands;

describe('caprini · bands', () => {
  it('declares 4 prophylaxis bands', () => {
    expect(bands.length).toBe(4);
  });

  it('score 0 → very-low / early ambulation only', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/0|очень низк/i);
    const text = `${b.description ?? ''} ${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/мобилизац|ambulation/);
    // No pharmacologic prophylaxis at this level
    expect(text).not.toMatch(/эноксапарин|lmwh|гепарин|ривароксабан|апиксабан/i);
  });

  it('score 1-2 → mechanical only', () => {
    const b = findBand(bands, 1);
    expect(findBand(bands, 2)).toBe(b);
    const text = `${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/компрессион|пневмокомпрессия|трикотаж|ipc/);
  });

  it('score 3-4 → moderate, LMWH offered', () => {
    const b = findBand(bands, 3);
    expect(findBand(bands, 4)).toBe(b);
    const text = `${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/эноксапарин|lmwh|нмг|ufh|гепарин/);
  });

  it('score ≥5 → high-risk; extended prophylaxis mention', () => {
    const b = findBand(bands, 5);
    expect(findBand(bands, 10)).toBe(b);
    expect(findBand(bands, 25)).toBe(b);
    const text = `${b.description ?? ''} ${b.details ?? ''} ${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/эноксапарин|lmwh|апиксабан|ривароксабан/);
    // Extended duration in cancer surgery / arthroplasty per ACCP 2012
    expect(text).toMatch(/28|35|продлён|extended|онкохирург|артропласт/);
  });

  it('bands are non-overlapping', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min).toBeGreaterThan(sorted[i - 1]!.max);
    }
  });

  it('every score 0..40 maps to a band', () => {
    for (let s = 0; s <= 40; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });
});
