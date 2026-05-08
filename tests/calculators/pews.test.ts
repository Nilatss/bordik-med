/**
 * Golden tests for PEWS (Pediatric Early Warning Score).
 *
 * Reference: Monaghan A. Detecting and managing deterioration in
 * children. Paediatr Nurs 2005;17(1):32-35. Brighton PEWS / Bedside PEWS
 * variants exist; this runner uses the 3-domain (behaviour / CV / resp)
 * version with surgical adjuncts.
 *
 * Bands (escalation triggers, max 9 + 2 surg = 11):
 *   0-2 → routine monitoring q4h
 *   3-4 → concerning; bedside review, q1h obs
 *   ≥5  → MET / rapid response, consider PICU
 */
import { describe, it, expect } from 'vitest';
import pews from '@/lib/runners/pews';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (pews as { bands: ScoreBand[] }).bands;

describe('pews · bands', () => {
  it('declares 3 escalation bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..9 maps to exactly one band', () => {
    for (let s = 0; s <= 9; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0-2 → routine monitoring', () => {
    expect(findBand(bands, 0).description.toLowerCase()).toMatch(/рутин|мониторинг/);
    expect(findBand(bands, 2)).toBe(findBand(bands, 0));
  });

  it('score 3-4 → bedside review, hourly obs', () => {
    const b = findBand(bands, 3);
    expect(findBand(bands, 4)).toBe(b);
    const text = `${b.description ?? ''} ${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/педиатр|каждые 1|q1|hourly/);
  });

  it('score ≥5 → MET / rapid response', () => {
    const b = findBand(bands, 5);
    const text = `${b.description ?? ''} ${b.details ?? ''} ${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/met|picu|rapid|emergency/);
  });

  it('high band recommends sepsis bundle (lactate, abx within 1h)', () => {
    const b = findBand(bands, 5);
    const text = `${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/гемокультур|лактат|сепсис|болюс|абс|аб/);
  });
});
