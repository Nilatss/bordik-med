/**
 * Integrity tests for every score-kind calculator's `bands` array.
 *
 * Why this exists: score-kind tools don't have an inline compute() — the
 * shared sumScore + findBand pipeline does the work. The risk is in the
 * BAND DATA itself: a typo in min/max creates either a gap (a real
 * patient score falls into the fallback band, which is the FIRST band,
 * so a high-risk patient gets classified as low-risk) or an overlap
 * (ambiguous result; first matching band wins, which may be wrong).
 *
 * For every imported score-kind runner we assert:
 *   1. Bands array is non-empty.
 *   2. Every integer score from 0..maxScore lands in exactly one band.
 *   3. Bands don't overlap.
 *   4. Every band has a non-empty label, color, description.
 *
 * Adding a new score-kind tool? Import it below and add its (id, runner,
 * maxScore) tuple to the SCORE_TOOLS array. The test set runs against
 * each automatically.
 */
import { describe, it, expect } from 'vitest';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

import chadsVasc from '@/lib/runners/chads-vasc';
import hasBled  from '@/lib/runners/has-bled';
import qsofa    from '@/lib/runners/qsofa';
import curb65   from '@/lib/runners/curb65';
import gcs      from '@/lib/runners/gcs';
import news2    from '@/lib/runners/news2';

interface ScoreRunner { bands: ScoreBand[]; maxScore: number }

const SCORE_TOOLS: Array<[string, ScoreRunner]> = [
  ['chads-vasc', chadsVasc as unknown as ScoreRunner],
  ['has-bled',   hasBled   as unknown as ScoreRunner],
  ['qsofa',      qsofa     as unknown as ScoreRunner],
  ['curb65',     curb65    as unknown as ScoreRunner],
  ['gcs',        gcs       as unknown as ScoreRunner],
  ['news2',      news2     as unknown as ScoreRunner],
];

describe('score-band integrity', () => {
  for (const [id, runner] of SCORE_TOOLS) {
    describe(id, () => {
      it('declares non-empty bands', () => {
        expect(Array.isArray(runner.bands)).toBe(true);
        expect(runner.bands.length).toBeGreaterThan(0);
      });

      it(`every clinically-possible score maps to exactly one band`, () => {
        // Some scales (e.g. GCS) have a floor > 0. Walk from the band's
        // declared minimum to maxScore — anything below the floor isn't
        // a real clinical input.
        const floor = Math.min(...runner.bands.map((b) => b.min));
        for (let s = floor; s <= runner.maxScore; s++) {
          const matches = runner.bands.filter((b) => s >= b.min && s <= b.max);
          expect(matches.length, `${id}: score ${s} matched ${matches.length} bands`).toBe(1);
        }
      });

      it('bands don\'t overlap', () => {
        const sorted = [...runner.bands].sort((a, b) => a.min - b.min);
        for (let i = 1; i < sorted.length; i++) {
          expect(
            sorted[i]!.min,
            `${id}: band[${i}] starts at ${sorted[i]!.min}, before band[${i - 1}] ends at ${sorted[i - 1]!.max}`,
          ).toBeGreaterThan(sorted[i - 1]!.max);
        }
      });

      it('every band has label, color, description', () => {
        for (const b of runner.bands) {
          expect(b.label, `${id} band ${b.min}-${b.max} has empty label`).toBeTruthy();
          expect(b.color, `${id} band ${b.min}-${b.max} has empty color`).toMatch(/^#[0-9A-F]{3,8}$/i);
          expect(b.description, `${id} band ${b.min}-${b.max} has empty description`).toBeTruthy();
        }
      });

      it('findBand returns exactly the band whose range contains the score', () => {
        const floor = Math.min(...runner.bands.map((b) => b.min));
        for (let s = floor; s <= runner.maxScore; s++) {
          const expected = runner.bands.find((b) => s >= b.min && s <= b.max)!;
          const got = findBand(runner.bands, s);
          expect(got).toBe(expected);
        }
      });
    });
  }
});
