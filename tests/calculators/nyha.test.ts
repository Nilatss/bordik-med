/**
 * Golden tests for NYHA Functional Classification (chronic HF).
 *
 * Reference: The Criteria Committee of the New York Heart Association.
 * Nomenclature and Criteria for Diagnosis of Diseases of the Heart and
 * Great Vessels. 9th ed. Boston: Little Brown; 1994:253-256.
 *
 * Classes (subjective, by symptom severity at exertion):
 *   I    no limitation
 *   II   slight limitation (ordinary activity causes symptoms)
 *   III  marked limitation (less-than-ordinary activity)
 *   IV   symptoms at rest
 *
 * ESC 2021 HF guidelines anchor stage-specific therapy escalation
 * (ARNI/ACE/ARB → β-blocker → MRA → SGLT2 → ivabradine if HR>70 → CRT/LVAD).
 */
import { describe, it, expect } from 'vitest';
import nyha from '@/lib/runners/nyha';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (nyha as { bands: ScoreBand[] }).bands;

describe('nyha · bands', () => {
  it('declares 4 functional class bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every class 1..4 maps to its own band', () => {
    for (let s = 1; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `class ${s}`).toBe(1);
      expect(matches[0]!.min).toBe(s);
      expect(matches[0]!.max).toBe(s);
    }
  });

  it('class I — compensated', () => {
    const b = findBand(bands, 1);
    expect(b.label).toBe('I');
    expect(b.description.toLowerCase()).toMatch(/компенс/);
    expect(b.color).toMatch(/^#22/i);
  });

  it('class IV — symptoms at rest, severe', () => {
    const b = findBand(bands, 4);
    expect(b.label).toBe('IV');
    expect(b.description.toLowerCase()).toMatch(/тяжёл|покой/);
  });

  it('colour escalates with class', () => {
    const colors = bands.map((b) => b.color);
    expect(new Set(colors).size).toBe(4); // distinct
  });
});
