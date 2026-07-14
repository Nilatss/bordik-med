/**
 * Regression test: unit-conversion calculators' input hint must state the
 * reference range in the SAME unit the field actually accepts.
 *
 * Bug: unit-glucose/creatinine/hb/bili all take a value in mg/dL (or g/dL
 * for Hb) — confirmed by `unit`, `min`/`max`, `quickValues`/`presets`, and
 * compute() itself, which always treats `v.value` as that unit — but the
 * on-screen hint under the input only showed the SI (ммоль/л / мкмоль/л /
 * г/л) reference range, with no unit label. A user reading e.g. "Натощак:
 * 3.9-5.5 ммоль/л" and typing their own (correct) SI lab value into the
 * mg/dL field got it silently misinterpreted 18x too high — enough to
 * flip a normal glucose into "Гипогликемия" or a normal creatinine into
 * "Выраженно повышен". The fix rewrites each hint to lead with the actual
 * field unit and range, keeping the SI range as parenthetical context.
 */
import { describe, it, expect } from 'vitest';
import glucoseRunner from '@/lib/runners/unit-glucose';
import creatinineRunner from '@/lib/runners/unit-creatinine';
import hbRunner from '@/lib/runners/unit-hb';
import biliRunner from '@/lib/runners/unit-bili';

const CASES = [
  { name: 'unit-glucose', runner: glucoseRunner, unit: 'mg/dL' },
  { name: 'unit-creatinine', runner: creatinineRunner, unit: 'mg/dL' },
  { name: 'unit-hb', runner: hbRunner, unit: 'g/dL' },
  { name: 'unit-bili', runner: biliRunner, unit: 'mg/dL' },
];

describe('unit-conversion calculators · hint matches field unit', () => {
  for (const { name, runner, unit } of CASES) {
    it(`${name}: hint mentions the field's actual unit (${unit})`, () => {
      const field = runner.inputs[0];
      expect(field?.unit).toBe(unit);
      expect(field?.hint).toContain(unit);
    });
  }

  it('unit-glucose: hint no longer implies the field takes ммоль/л input', () => {
    const field = glucoseRunner.inputs[0];
    // The SI range is still present as context, but must not be the only
    // (unit-less) number shown — that was the original bug.
    expect(field?.hint).toMatch(/70-99 mg\/dL/);
  });

  it('unit-creatinine: hint states the mg/dL range, not just мкмоль/л', () => {
    const field = creatinineRunner.inputs[0];
    expect(field?.hint).toMatch(/0\.7-1\.3.*mg\/dL/);
  });

  it('unit-hb: hint states the g/dL range, not just г/л', () => {
    const field = hbRunner.inputs[0];
    expect(field?.hint).toMatch(/13\.0-17\.0.*g\/dL/);
  });

  it('unit-bili: hint states the mg/dL range, not just мкмоль/л', () => {
    const field = biliRunner.inputs[0];
    expect(field?.hint).toMatch(/0\.3-1\.2 mg\/dL/);
  });
});
