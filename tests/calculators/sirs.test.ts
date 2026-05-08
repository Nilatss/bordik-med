/**
 * Golden tests for SIRS criteria.
 *
 * Reference: Bone RC, Balk RA, Cerra FB, et al. Definitions for sepsis
 * and organ failure and guidelines for the use of innovative therapies
 * in sepsis. The ACCP/SCCM Consensus Conference Committee. Chest
 * 1992;101(6):1644-55. doi:10.1378/chest.101.6.1644
 *
 * Bands:
 *   0-1   → no SIRS
 *   2     → SIRS present (per consensus, 2/4 criteria meets)
 *   3-4   → severe SIRS, high deterioration risk; consider Sepsis-3
 *
 * Note: SIRS was demoted by Sepsis-3 (Singer JAMA 2016) in favour of
 * SOFA + qSOFA, but remains widely used for early triage.
 */
import { describe, it, expect } from 'vitest';
import sirs from '@/lib/runners/sirs';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (sirs as { bands: ScoreBand[] }).bands;

describe('sirs · bands', () => {
  it('declares 3 bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..4 maps to exactly one band', () => {
    for (let s = 0; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 2 is SIRS-positive boundary (2/4 criteria)', () => {
    const b = findBand(bands, 2);
    expect(b.label).toBe('2');
    expect(b.description.toLowerCase()).toMatch(/sirs|причин/);
  });

  it('score 0..1 → no SIRS', () => {
    const b0 = findBand(bands, 0);
    expect(findBand(bands, 1)).toBe(b0);
    expect(b0.description.toLowerCase()).toMatch(/не выявлен/);
  });

  it('score ≥3 → severe SIRS, sepsis consideration', () => {
    const b = findBand(bands, 3);
    expect(findBand(bands, 4)).toBe(b);
    expect(b.description.toLowerCase()).toMatch(/сепсис|шок|sepsis/);
  });
});
