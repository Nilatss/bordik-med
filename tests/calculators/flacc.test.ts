/**
 * Golden tests for FLACC behavioural pain scale (children 2 mo - 7 yrs).
 *
 * Reference: Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S. The
 * FLACC: a behavioral scale for scoring postoperative pain in young
 * children. Pediatr Nurs 1997;23(3):293-297.
 *
 * 5 domains × 0-2 = max 10:
 *   F — Face
 *   L — Legs
 *   A — Activity
 *   C — Cry
 *   C — Consolability
 *
 * Bands:
 *   0    → no pain
 *   1-3  → mild discomfort
 *   4-6  → moderate pain (intervene)
 *   7-10 → severe pain (escalate analgesia)
 */
import { describe, it, expect } from 'vitest';
import flacc from '@/lib/runners/flacc';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const bands = (flacc as { bands: ScoreBand[] }).bands;

describe('flacc · bands', () => {
  it('declares 4 pain bands', () => {
    expect(bands.length).toBe(4);
  });

  it('every score 0..10 maps to exactly one band', () => {
    for (let s = 0; s <= 10; s++) {
      const matches = bands.filter((b) => s >= b.min && s <= b.max);
      expect(matches.length, `score ${s}`).toBe(1);
    }
  });

  it('score 0 → no pain', () => {
    const b = findBand(bands, 0);
    expect(b.min).toBe(0);
    expect(b.max).toBe(0);
    expect(b.label.toLowerCase()).toMatch(/нет боли/);
  });

  it('boundary 3 vs 4 (mild → moderate)', () => {
    expect(findBand(bands, 3)).not.toBe(findBand(bands, 4));
    expect(findBand(bands, 4).label.toLowerCase()).toMatch(/умерен|4-6/);
  });

  it('boundary 6 vs 7 (moderate → severe)', () => {
    expect(findBand(bands, 6)).not.toBe(findBand(bands, 7));
    expect(findBand(bands, 7).label.toLowerCase()).toMatch(/сильная|7-10/);
  });

  it('top band covers up to 10', () => {
    expect(findBand(bands, 10).max).toBe(10);
  });
});
