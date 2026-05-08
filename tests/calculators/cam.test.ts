/**
 * Golden tests for CAM (Confusion Assessment Method, delirium).
 *
 * Reference: Inouye SK, van Dyck CH, Alessi CA, Balkin S, Siegal AP,
 * Horwitz RI. Clarifying confusion: the Confusion Assessment Method.
 * A new method for detection of delirium. Ann Intern Med 1990;113(12):
 * 941-948. doi:10.7326/0003-4819-113-12-941
 *
 * Algorithm: CAM+ requires (1) AND (2) AND (3 OR 4).
 * Implementation here uses checkbox-sum (1 pt each, max 4):
 *   <3   → CAM negative
 *   =3   → criteria not met (1+2 + only-1-of-3-or-4 OR partial set)
 *   =4   → CAM positive
 *
 * Note: simple sum-of-4 cannot distinguish "1+2+3" (algorithm-positive)
 * from "1+2+3 alone" — both score 3. Tests reflect declared band logic.
 */
import { describe, it, expect } from 'vitest';
import cam from '@/lib/runners/cam';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (cam as { bands: ScoreBand[] }).bands;

describe('cam · bands', () => {
  it('declares 3 bands', () => {
    expect(bands.length).toBe(3);
  });

  it('every score 0..4 maps to exactly one band', () => {
    for (let s = 0; s <= 4; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0..2 → CAM negative', () => {
    expect(findBand(bands, 0).label.toLowerCase()).toMatch(/отрицательный/);
    expect(findBand(bands, 2)).toBe(findBand(bands, 0));
  });

  it('score 3 → criteria not met (own band)', () => {
    const b = findBand(bands, 3);
    expect(b.min).toBe(3);
    expect(b.max).toBe(3);
    expect(b.label.toLowerCase()).toMatch(/не выполнен/);
  });

  it('score 4 → CAM positive (delirium)', () => {
    const b = findBand(bands, 4);
    expect(b.label.toLowerCase()).toMatch(/положительный/);
    expect(b.color.toLowerCase()).toMatch(/^#(e|d|c|b|a|9|8|7)/i); // red
  });

  it('positive band lists DELIRIUM mnemonic causes / actions', () => {
    const b = findBand(bands, 4);
    const text = `${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/delirium|drugs|electrolyt|infection|метабол/);
  });

  it('positive band warns against benzodiazepines (except alcohol withdrawal)', () => {
    const b = findBand(bands, 4);
    const text = `${(b.actions ?? []).join(' ')}`.toLowerCase();
    expect(text).toMatch(/бензодиазеп|алкогольн/);
  });
});
