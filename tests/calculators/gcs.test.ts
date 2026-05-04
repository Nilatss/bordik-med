/**
 * Golden tests for the Glasgow Coma Scale.
 *
 * Reference: Teasdale & Jennett, Lancet 1974;2:81-84.
 *
 * Score range: 3 (deep coma — eye 1, verbal 1, motor 1) to 15 (alert).
 * Critical clinical thresholds:
 *   ≤ 8  → severe; airway protection / intubation
 *   9-12 → moderate
 *   13-15 → mild / normal
 *
 * The runner ships with bands declaring [3-8, 9-12, 13-15]. These
 * tests guard against silent edits to the band ranges or descriptions
 * — a typo that turns 13-15 into "moderate" misclassifies every alert
 * patient at triage.
 */
import { describe, it, expect } from 'vitest';
import gcs from '@/lib/runners/gcs';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (gcs as { bands: ScoreBand[] }).bands;

describe('gcs · bands', () => {
  it('declares non-empty band list', () => {
    expect(bands.length).toBeGreaterThan(0);
  });

  it('every score 3..15 maps to exactly one band', () => {
    // GCS minimum is 3, not 0 — the floor of each component is 1.
    for (let s = 3; s <= 15; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s} matched ${matches.length} bands`).toBe(1);
    }
  });

  it('GCS 3 (deep coma) → severe band, mentions intubation/airway', () => {
    const b = findBand(bands, 3);
    expect(b.label).toMatch(/тяжёл|severe/i);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/интубац|дыхател|airway/);
  });

  it('GCS 8 → severe band (the classic "GCS ≤ 8 — intubate" cutoff)', () => {
    const b = findBand(bands, 8);
    expect(b.label).toMatch(/тяжёл|severe/i);
  });

  it('GCS 9 → moderate band (just above the intubate threshold)', () => {
    const b = findBand(bands, 9);
    expect(b.label).toMatch(/умеренн|moderate/i);
  });

  it('GCS 15 (alert) → mild/normal band', () => {
    const b = findBand(bands, 15);
    expect(b.label).toMatch(/лёгк|норм|mild|normal/i);
  });
});
