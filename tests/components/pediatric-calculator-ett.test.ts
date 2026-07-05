import { describe, it, expect } from 'vitest';
import { infantEttUncuffedMm, infantEttDepthCm } from '@/components/course/PediatricCalculator';

describe('infantEttUncuffedMm / infantEttDepthCm — NRP-anchored sizing <10 kg', () => {
  it('uses NRP 8th ed. weight brackets below 3 kg', () => {
    expect(infantEttUncuffedMm(0.5)).toBe(2.5);
    expect(infantEttUncuffedMm(1.5)).toBe(3.0);
    expect(infantEttUncuffedMm(2.5)).toBe(3.5);
  });

  it('a 3 kg term newborn gets the NRP-correct 3.5 mm tube, not an oversized one', () => {
    // Previously the "age" proxy (weight/2 = 1.5) fed into the Cole formula
    // (1.5/4+4 = 4.375mm), overshooting the NRP-correct 3.5mm value.
    expect(infantEttUncuffedMm(3)).toBeCloseTo(3.5, 5);
  });

  it('depth uses the NRP weight+6 rule below 3 kg', () => {
    expect(infantEttDepthCm(1)).toBeCloseTo(7, 5);
    expect(infantEttDepthCm(2)).toBeCloseTo(8, 5);
    expect(infantEttDepthCm(3)).toBeCloseTo(9, 5);
  });

  it('a 3 kg term newborn gets ~9 cm depth, not the previous ~13 cm over-insertion', () => {
    // Previously: age proxy = 1.5, depth = 1.5/2+12 = 12.75cm (rounds to 13),
    // a 4cm+ over-insertion risking right-mainstem intubation.
    const depth = Math.round(infantEttDepthCm(3));
    expect(depth).toBe(9);
    expect(depth).toBeLessThan(13);
  });

  it('bridges continuously into the Cole age-formula value at the 10 kg seam', () => {
    const coleAt10 = 1 / 4 + 4;
    expect(infantEttUncuffedMm(9.999)).toBeCloseTo(coleAt10, 1);
  });

  it('is monotonically non-decreasing with weight', () => {
    for (let w = 0.5; w < 10; w += 0.5) {
      expect(infantEttUncuffedMm(w + 0.5)).toBeGreaterThanOrEqual(infantEttUncuffedMm(w));
      expect(infantEttDepthCm(w + 0.5)).toBeGreaterThanOrEqual(infantEttDepthCm(w));
    }
  });
});
