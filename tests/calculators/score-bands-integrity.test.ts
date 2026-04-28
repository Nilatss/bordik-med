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

// Cardio / VTE
import chadsVasc from '@/lib/runners/chads-vasc';
import hasBled  from '@/lib/runners/has-bled';
import wellsPe  from '@/lib/runners/wells-pe';
import wellsDvt from '@/lib/runners/wells-dvt';
import caprini  from '@/lib/runners/caprini';
import heart    from '@/lib/runners/heart';
import timi     from '@/lib/runners/timi';
// Sepsis / EWS / ICU
import qsofa    from '@/lib/runners/qsofa';
import news2    from '@/lib/runners/news2';
import mews     from '@/lib/runners/mews';
// (cam-icu / ranson / forrest are calculator-kind, not score-kind —
// inline compute() instead of bands[]; covered by their own tests.)
// Respiratory / Infection
import curb65   from '@/lib/runners/curb65';
import centor   from '@/lib/runners/centor';
// GI
import bisap    from '@/lib/runners/bisap';
import childMeld from '@/lib/runners/child-meld';
// Surgery / Acute abdomen
import alvarado from '@/lib/runners/alvarado';
import bishop   from '@/lib/runners/bishop';
// Neuro / Pain / Function / Comorbidity
import gcs      from '@/lib/runners/gcs';
import apgar    from '@/lib/runners/apgar';
import braden   from '@/lib/runners/braden';
import ecog     from '@/lib/runners/ecog';
import charlson from '@/lib/runners/charlson';
// Substance use
import cage     from '@/lib/runners/cage';
// Mental health screeners
import gad7     from '@/lib/runners/gad7';
import phq9     from '@/lib/runners/phq9';
// Stroke / TIA / vascular
import abcd2    from '@/lib/runners/abcd2';

interface ScoreRunner { bands: ScoreBand[]; maxScore: number }

// Priority list: highest clinical impact first. Each entry adds 5
// invariant assertions — adding a new tool here is the cheapest way
// to expand band-data coverage.
const SCORE_TOOLS: Array<[string, ScoreRunner]> = [
  // Cardio / VTE
  ['chads-vasc', chadsVasc as unknown as ScoreRunner],
  ['has-bled',   hasBled   as unknown as ScoreRunner],
  ['wells-pe',   wellsPe   as unknown as ScoreRunner],
  ['wells-dvt',  wellsDvt  as unknown as ScoreRunner],
  ['caprini',    caprini   as unknown as ScoreRunner],
  ['heart',      heart     as unknown as ScoreRunner],
  ['timi',       timi      as unknown as ScoreRunner],
  // Sepsis / EWS / ICU
  ['qsofa',      qsofa     as unknown as ScoreRunner],
  ['news2',      news2     as unknown as ScoreRunner],
  ['mews',       mews      as unknown as ScoreRunner],
  // Respiratory / Infection
  ['curb65',     curb65    as unknown as ScoreRunner],
  ['centor',     centor    as unknown as ScoreRunner],
  // GI
  ['bisap',      bisap     as unknown as ScoreRunner],
  ['child-meld', childMeld as unknown as ScoreRunner],
  // Surgery
  ['alvarado',   alvarado  as unknown as ScoreRunner],
  ['bishop',     bishop    as unknown as ScoreRunner],
  // Neuro / Pain / Function / Comorbidity
  ['gcs',        gcs       as unknown as ScoreRunner],
  ['apgar',      apgar     as unknown as ScoreRunner],
  ['braden',     braden    as unknown as ScoreRunner],
  ['ecog',       ecog      as unknown as ScoreRunner],
  ['charlson',   charlson  as unknown as ScoreRunner],
  // Substance use
  ['cage',       cage      as unknown as ScoreRunner],
  // Mental health
  ['gad7',       gad7      as unknown as ScoreRunner],
  ['phq9',       phq9      as unknown as ScoreRunner],
  // Stroke / TIA
  ['abcd2',      abcd2     as unknown as ScoreRunner],
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
