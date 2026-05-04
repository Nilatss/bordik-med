/**
 * Golden tests for Wells score for DVT.
 *
 * Reference: Wells PS et al. Lancet 1997;350:1795-1798 (and 2003 update).
 *
 * Note: Wells DVT runs from -2 to 9 (the "alternative diagnosis ≥ likely
 * as DVT" criterion subtracts 2 points, so the floor is below zero).
 *
 * Two-tier modern strategy:
 *   ≤ 0 (or ≤ 1 in some refs) → "DVT unlikely" — D-dimer rules out
 *   ≥ 1 (or ≥ 2)              → "DVT likely"   — proceed to compression US
 */
import { describe, it, expect } from 'vitest';
import wellsDvt from '@/lib/runners/wells-dvt';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (wellsDvt as { bands: ScoreBand[] }).bands;

describe('wells-dvt · bands', () => {
  it('declares non-empty band list', () => {
    expect(bands.length).toBeGreaterThan(0);
  });

  it('handles negative scores (alternative-diagnosis criterion = -2)', () => {
    // The "alternative diagnosis as likely or more so" criterion is -2.
    // A patient with that flag and no positive criteria scores -2.
    const b = findBand(bands, -2);
    expect(b).toBeDefined();
    expect(b.label.toLowerCase()).toMatch(/низк|unlikely/);
  });

  it('low-risk score (0) → low band, mentions D-dimer', () => {
    const b = findBand(bands, 0);
    expect(b.label.toLowerCase()).toMatch(/низк|unlikely/);
    expect(b.description.toLowerCase()).toMatch(/d-?димер/);
  });

  it('high-risk score (5) → likely band, mentions ultrasound', () => {
    const b = findBand(bands, 5);
    expect(b.label.toLowerCase()).toMatch(/высок|likely|вероят/);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/уздс|узи|ultrasound|компрессион/);
  });
});
