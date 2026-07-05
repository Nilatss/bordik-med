import { describe, it, expect } from 'vitest';
import { DRUGS, calculateDose } from '@/components/course/PediatricCalculator';

describe('calculateDose — atropine minimum-dose floor', () => {
  it('enforces the documented 0.1 mg minimum for small infants', () => {
    const atropine = DRUGS.find((d) => d.name === 'Атропин')!;
    expect(atropine.minDose).toBe(0.1);
    // 3kg * 0.02 mg/kg = 0.06mg raw — below the safe 0.1mg floor.
    expect(calculateDose(atropine, 3)).toBe(0.1);
  });

  it('does not floor doses already above the minimum', () => {
    const atropine = DRUGS.find((d) => d.name === 'Атропин')!;
    // 10kg * 0.02 = 0.2mg, above the 0.1mg floor.
    expect(calculateDose(atropine, 10)).toBeCloseTo(0.2, 5);
  });

  it('still applies the max-dose ceiling for drugs without a minDose', () => {
    const epi = DRUGS.find((d) => d.name.startsWith('Адреналин'))!;
    expect(calculateDose(epi, 200)).toBe(1); // maxDose ceiling
  });
});
