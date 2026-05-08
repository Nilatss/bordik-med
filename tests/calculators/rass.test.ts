/**
 * Golden tests for RASS (Richmond Agitation-Sedation Scale).
 *
 * Reference: Sessler CN, Gosnell MS, Grap MJ, et al. The Richmond
 * Agitation-Sedation Scale: validity and reliability in adult intensive
 * care unit patients. Am J Respir Crit Care Med 2002;166(10):1338-1344.
 * doi:10.1164/rccm.2107138
 *
 * 10-point scale −5..+4:
 *   −5 unarousable / −4 deep / −3 moderate sedation
 *   −2 light / −1 drowsy / 0 alert+calm
 *   +1 restless / +2 agitated / +3 very agitated / +4 combative
 *
 * Bands (PADIS 2018 ICU sedation goals):
 *   −5..−4 → over-sedation (deep, often unwarranted)
 *   −3     → moderate sedation (often excessive for ICU)
 *   −2..0  → target zone for most ventilated ICU patients
 *   +1..+2 → mild agitation — investigate (pain/delirium/hypoxia)
 *   +3..+4 → severe — safety threat, immediate intervention
 */
import { describe, it, expect } from 'vitest';
import rass from '@/lib/runners/rass';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (rass as { bands: ScoreBand[] }).bands;

describe('rass · bands', () => {
  it('declares 5 zone bands', () => {
    expect(bands.length).toBe(5);
  });

  it('every score −5..+4 maps to exactly one band', () => {
    for (let s = -5; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('negative scores start at −5 (deepest sedation)', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(-5);
  });

  it('−2..0 = target zone (green) for ICU', () => {
    const b = findBand(bands, 0);
    expect(findBand(bands, -2)).toBe(b);
    expect(b.description.toLowerCase()).toMatch(/целевой|target/);
    expect(b.color).toMatch(/^#22/i);
  });

  it('−5..−4 = over-sedation', () => {
    const b = findBand(bands, -5);
    expect(findBand(bands, -4)).toBe(b);
    expect(b.description.toLowerCase()).toMatch(/седация|переседац/);
  });

  it('+3..+4 = severe agitation, safety threat', () => {
    const b = findBand(bands, 3);
    expect(findBand(bands, 4)).toBe(b);
    expect(b.description.toLowerCase()).toMatch(/безопасност|вмешательств|тяжёлая/);
  });

  it('+1..+2 = mild agitation, identify cause', () => {
    const b = findBand(bands, 1);
    expect(findBand(bands, 2)).toBe(b);
    expect(b.description.toLowerCase()).toMatch(/боль|делирий|гипоксия|причин/);
  });

  it('boundaries 0/1 and −2/−3 separate distinct bands', () => {
    expect(findBand(bands, 0)).not.toBe(findBand(bands, 1));
    expect(findBand(bands, -2)).not.toBe(findBand(bands, -3));
  });
});
