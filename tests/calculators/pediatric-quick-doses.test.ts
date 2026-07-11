/**
 * Regression tests for the resuscitation quick-reference table
 * (components/course/PediatricCalculator.tsx via lib/pediatric-quick-doses.ts).
 *
 * Bug: Atropine's row documented "Мин. доза 0.1 мг" in its `notes` field,
 * but the dose math only clamped to `maxDose` - never floored to a
 * minimum. A light child (e.g. 1-4 kg, routine in a NICU/PICU) got a
 * calculated dose below the clinically required floor with nothing in
 * the displayed number reflecting it.
 */
import { describe, it, expect } from 'vitest';
import { calculateDrugDose, DRUGS } from '@/lib/pediatric-quick-doses';

const atropine = DRUGS.find((d) => d.name === 'Атропин')!;

describe('calculateDrugDose · min-dose floor', () => {
  it('below-floor weight (1 kg → 0.02 mg raw) is floored to the documented 0.1 mg minimum', () => {
    const r = calculateDrugDose(atropine, 1);
    expect(r.calculatedDose).toBeCloseTo(0.1, 6);
    expect(r.isMinned).toBe(true);
    expect(r.isMaxed).toBe(false);
  });

  it('at-floor weight (5 kg → exactly 0.1 mg raw) is not flagged as floored', () => {
    const r = calculateDrugDose(atropine, 5);
    expect(r.calculatedDose).toBeCloseTo(0.1, 6);
    expect(r.isMinned).toBe(false);
  });

  it('mid-range weight (15 kg → 0.3 mg) is untouched by either clamp', () => {
    const r = calculateDrugDose(atropine, 15);
    expect(r.calculatedDose).toBeCloseTo(0.3, 6);
    expect(r.isMinned).toBe(false);
    expect(r.isMaxed).toBe(false);
  });

  it('above-ceiling weight (30 kg → 0.6 mg raw) is capped to the 0.5 mg maximum', () => {
    const r = calculateDrugDose(atropine, 30);
    expect(r.calculatedDose).toBeCloseTo(0.5, 6);
    expect(r.isMaxed).toBe(true);
    expect(r.isMinned).toBe(false);
  });

  it('a drug with no minDose (e.g. Adrenaline) is never flagged as floored', () => {
    const adrenaline = DRUGS.find((d) => d.name === 'Адреналин (Epinephrine)')!;
    const r = calculateDrugDose(adrenaline, 1);
    expect(r.isMinned).toBe(false);
  });
});
