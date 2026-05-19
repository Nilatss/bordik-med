/**
 * Unit tests for the `hasZeroPositiveInput` clinical-safety guard.
 *
 * Audit B-1 regression: before this guard, calculators with strictly
 * positive inputs (parkland, holliday-segar, bsa-mosteller, bmi,
 * ca-corrected, neo-* dose runners — ~700 in total) would emit
 * "0 мл / 24 ч" / "0 мг/кг" when given a zero weight or volume. HTML
 * `min` attributes are bypassable via paste / preset, so the wrapper
 * needs a runtime check that turns those into N/A.
 *
 * This test file pins the guard's exact semantics so a future refactor
 * can't silently let "0 мл" results back in.
 */
import { describe, it, expect } from 'vitest';
import { hasZeroPositiveInput } from '@/lib/tool-view/utils';
import type { ToolInput } from '@/lib/tools-runners';

const weightInput: ToolInput = {
  id: 'weight',
  label: 'Вес, кг',
  type: 'number',
  min: 0.5,
  max: 250,
  step: 0.1,
};

const dayOfLifeInput: ToolInput = {
  id: 'day',
  label: 'День жизни',
  type: 'number',
  min: 0,
  max: 365,
  step: 1,
};

const ageYearsInput: ToolInput = {
  id: 'age',
  label: 'Возраст',
  type: 'number',
  // No min set — defaults to 0 in the guard logic.
  max: 120,
  step: 1,
};

const checkboxInput: ToolInput = {
  id: 'smoker',
  label: 'Курит',
  type: 'checkbox',
};

describe('hasZeroPositiveInput · clinical safety guard', () => {
  it('returns true when a weight input (min > 0) is zero', () => {
    expect(hasZeroPositiveInput([weightInput], { weight: 0 })).toBe(true);
  });

  it('returns true when a weight input is negative (paste edge case)', () => {
    expect(hasZeroPositiveInput([weightInput], { weight: -5 })).toBe(true);
  });

  it('returns false for a valid positive weight', () => {
    expect(hasZeroPositiveInput([weightInput], { weight: 70 })).toBe(false);
  });

  it('allows zero for inputs that legitimately accept 0 (day of life)', () => {
    // День жизни = 0 means "newborn at delivery" — clinically valid.
    expect(hasZeroPositiveInput([dayOfLifeInput], { day: 0 })).toBe(false);
  });

  it('allows zero for inputs with no min specified', () => {
    expect(hasZeroPositiveInput([ageYearsInput], { age: 0 })).toBe(false);
  });

  it('ignores non-number input types (checkbox / select)', () => {
    expect(hasZeroPositiveInput([checkboxInput], { smoker: false })).toBe(false);
    expect(hasZeroPositiveInput([checkboxInput], { smoker: true })).toBe(false);
  });

  it('triggers on ANY zero-positive input across a mixed input set', () => {
    // Weight=0 (bad), day=3 (ok), smoker=false → should be true because
    // weight fails the guard regardless of other inputs.
    expect(
      hasZeroPositiveInput([weightInput, dayOfLifeInput, checkboxInput], {
        weight: 0, day: 3, smoker: false,
      }),
    ).toBe(true);
  });

  it('returns false when all positive inputs are valid', () => {
    expect(
      hasZeroPositiveInput([weightInput, dayOfLifeInput], { weight: 3.2, day: 0 }),
    ).toBe(false);
  });

  it('ignores undefined / missing values (let the readiness check handle it)', () => {
    // The pre-guard `ready` check in ToolView ensures all numbers are
    // finite. If a value happens to be undefined here, the guard should
    // not flag it as a zero — that's the readiness check's job.
    expect(hasZeroPositiveInput([weightInput], {})).toBe(false);
  });
});
