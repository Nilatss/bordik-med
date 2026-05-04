/**
 * Golden tests for the Apgar score (newborn assessment).
 *
 * Reference: Apgar V., Curr Res Anesth Analg 1953;32:260-267.
 *
 * Score range: 0-10. Bands cover [0-3 critical, 4-6 moderate, 7-10 normal].
 * Clinical use: assess at 1 and 5 min after birth. A 5-min score < 7
 * triggers further evaluation; 0-3 = need for resuscitation per NRP.
 */
import { describe, it, expect } from 'vitest';
import apgar from '@/lib/runners/apgar';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (apgar as { bands: ScoreBand[] }).bands;

describe('apgar · bands', () => {
  it('declares non-empty band list', () => {
    expect(bands.length).toBeGreaterThan(0);
  });

  it('every score 0..10 maps to exactly one band', () => {
    for (let s = 0; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('Apgar 0 → critical band, mentions resuscitation', () => {
    const b = findBand(bands, 0);
    expect(b.label).toMatch(/критическ|critical/i);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/реанимац|resuscit/);
  });

  it('Apgar 5 → moderate (4-6 range)', () => {
    const b = findBand(bands, 5);
    expect(b.min).toBeLessThanOrEqual(5);
    expect(b.max).toBeGreaterThanOrEqual(5);
    // Must NOT be the critical or normal band
    expect(b.label).not.toMatch(/критическ/i);
    expect(b.label).not.toMatch(/норма|normal/i);
  });

  it('Apgar 10 → normal band', () => {
    const b = findBand(bands, 10);
    expect(b.label).toMatch(/норма|normal|7-10/i);
  });
});
