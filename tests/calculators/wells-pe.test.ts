/**
 * Golden tests for Wells score for pulmonary embolism (PE).
 *
 * Reference: Wells PS et al. Thromb Haemost 2000;83:416-420.
 *
 * Modified Wells (the version we ship) uses 0-12.5 with non-integer
 * steps because some criteria score 1.5 / 3 points. Three-tier bands:
 *   < 2     → low (~3% PE) — D-dimer, possibly PERC
 *   2-6     → moderate (~21%) — D-dimer, CT angio if positive
 *   > 6     → high (~67%) — CT angio immediately
 */
import { describe, it, expect } from 'vitest';
import wellsPe from '@/lib/runners/wells-pe';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (wellsPe as { bands: ScoreBand[] }).bands;

describe('wells-pe · bands', () => {
  it('declares non-empty band list', () => {
    expect(bands.length).toBeGreaterThan(0);
  });

  it('low-risk score (1) → low band, mentions D-dimer', () => {
    const b = findBand(bands, 1);
    expect(b.label.toLowerCase()).toMatch(/низк|low/);
    expect(b.description.toLowerCase()).toMatch(/d-?димер/);
  });

  it('moderate score (4) → moderate band, includes both D-dimer and CT', () => {
    const b = findBand(bands, 4);
    expect(b.label.toLowerCase()).toMatch(/умеренн|moderate/);
    const text = b.description.toLowerCase();
    expect(text).toMatch(/d-?димер/);
    expect(text).toMatch(/кт|ct/);
  });

  it('high-risk score (7) → high band, mandates CT angio immediately', () => {
    const b = findBand(bands, 7);
    expect(b.label.toLowerCase()).toMatch(/высок|high/);
    const text = `${b.description} ${b.details ?? ''}`.toLowerCase();
    expect(text).toMatch(/кт|ct/);
  });

  it('non-integer scores (1.5, 4.5) still resolve to bands', () => {
    // Some criteria award 1.5 / 3 points — the runner must handle the
    // half-step values that arise during real input combinations.
    expect(findBand(bands, 1.5)).toBeDefined();
    expect(findBand(bands, 4.5)).toBeDefined();
  });
});
