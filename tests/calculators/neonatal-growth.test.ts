/**
 * Golden tests for neonatal growth charts (Fenton 2013).
 *
 * Source: Fenton TR, Kim JH. A systematic review and meta-analysis to
 *   revise the Fenton growth chart for preterm infants. BMC Pediatrics
 *   2013;13:59. CC-BY 2.0.
 *
 * Tests cover the math layer in lib/neonatal-growth.ts:
 *   - lmsAt: linear interpolation between anchor weeks
 *   - zScoreFromValue / valueFromZ: roundtrip via LMS
 *   - normalCdf / percentileFromZ: Abramowitz-Stegun approximation
 *   - buildChartCurves: P3/P10/P50/P90/P97 reference curves
 *   - interpretZ: clinical bands
 */
import { describe, it, expect } from 'vitest';
import {
  lmsAt,
  zScoreFromValue,
  valueFromZ,
  normalCdf,
  percentileFromZ,
  buildChartCurves,
  interpretZ,
  PERCENTILE_TO_Z,
  REFERENCE_PERCENTILES,
  type LmsPoint,
} from '@/lib/neonatal-growth';

// Mini-fixture: Fenton boys weight at 3 anchor weeks
const POINTS: LmsPoint[] = [
  { age: 28, M: 1108, S: 0.135 },
  { age: 32, M: 1782, S: 0.135 },
  { age: 40, M: 3496, S: 0.120 },
];

describe('lmsAt — linear interpolation', () => {
  it('returns first point if age <= min', () => {
    expect(lmsAt(POINTS, 20)).toEqual(POINTS[0]);
    expect(lmsAt(POINTS, 28)).toEqual(POINTS[0]);
  });

  it('returns last point if age >= max', () => {
    expect(lmsAt(POINTS, 50)).toEqual(POINTS[2]);
  });

  it('interpolates linearly between anchors', () => {
    // halfway between 28 and 32 weeks → mid-M, mid-S
    const r = lmsAt(POINTS, 30);
    expect(r).not.toBeNull();
    expect(r!.age).toBe(30);
    expect(r!.M).toBeCloseTo((1108 + 1782) / 2, 0);
    expect(r!.S).toBeCloseTo(0.135, 5);
  });

  it('handles different S between anchors', () => {
    // halfway between 32 (S=0.135) and 40 (S=0.120) → S=0.1275
    const r = lmsAt(POINTS, 36);
    expect(r!.S).toBeCloseTo(0.1275, 4);
  });

  it('returns null on empty array', () => {
    expect(lmsAt([], 30)).toBeNull();
  });

  it('returns finite M and S (not NaN) for degenerate segment with duplicate ages', () => {
    // If two consecutive points share the same age value, the denominator
    // (b.age - a.age) is zero. The guard returns a.M / a.S instead of NaN.
    const degenerate: LmsPoint[] = [
      { age: 28, M: 1108, S: 0.135 },
      { age: 32, M: 1782, S: 0.135 },
      { age: 32, M: 1900, S: 0.140 }, // duplicate age — degenerate segment
      { age: 40, M: 3496, S: 0.120 },
    ];
    const r = lmsAt(degenerate, 32);
    expect(r).not.toBeNull();
    expect(Number.isFinite(r!.M)).toBe(true);
    expect(Number.isFinite(r!.S)).toBe(true);
    expect(Number.isNaN(r!.M)).toBe(false);
    expect(Number.isNaN(r!.S)).toBe(false);
  });
});

describe('zScoreFromValue / valueFromZ — roundtrip', () => {
  const lms: LmsPoint = { age: 32, M: 1782, S: 0.135 };

  it('value at M gives z=0 (median)', () => {
    expect(zScoreFromValue(1782, lms)).toBeCloseTo(0, 6);
  });

  it('z=0 returns M', () => {
    expect(valueFromZ(0, lms)).toBeCloseTo(1782, 4);
  });

  it('positive z gives value above M', () => {
    expect(zScoreFromValue(2000, lms)).toBeGreaterThan(0);
  });

  it('negative z gives value below M', () => {
    expect(zScoreFromValue(1500, lms)).toBeLessThan(0);
  });

  it('roundtrip for z=+1', () => {
    const v = valueFromZ(1, lms);
    expect(zScoreFromValue(v, lms)).toBeCloseTo(1, 6);
  });

  it('roundtrip for z=-1.881 (P3)', () => {
    const v = valueFromZ(-1.881, lms);
    expect(zScoreFromValue(v, lms)).toBeCloseTo(-1.881, 5);
  });
});

describe('normalCdf — Abramowitz-Stegun approximation', () => {
  it('CDF(0) = 0.5', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
  });

  it('CDF(-∞ approx) ≈ 0', () => {
    expect(normalCdf(-6)).toBeCloseTo(0, 5);
  });

  it('CDF(+∞ approx) ≈ 1', () => {
    expect(normalCdf(6)).toBeCloseTo(1, 5);
  });

  it('CDF(1) ≈ 0.8413', () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3);
  });

  it('CDF(-1) ≈ 0.1587', () => {
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 3);
  });

  it('CDF(1.96) ≈ 0.975 (95% one-tail)', () => {
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
  });

  it('symmetry: CDF(z) + CDF(-z) = 1', () => {
    for (const z of [0.5, 1.0, 1.5, 2.0]) {
      expect(normalCdf(z) + normalCdf(-z)).toBeCloseTo(1, 5);
    }
  });
});

describe('percentileFromZ — z → 0..100', () => {
  it('z=0 → P50', () => {
    expect(percentileFromZ(0)).toBeCloseTo(50, 3);
  });

  it('PERCENTILE_TO_Z constants reverse correctly', () => {
    expect(percentileFromZ(PERCENTILE_TO_Z[3])).toBeCloseTo(3, 1);
    expect(percentileFromZ(PERCENTILE_TO_Z[10])).toBeCloseTo(10, 1);
    expect(percentileFromZ(PERCENTILE_TO_Z[50])).toBeCloseTo(50, 1);
    expect(percentileFromZ(PERCENTILE_TO_Z[90])).toBeCloseTo(90, 1);
    expect(percentileFromZ(PERCENTILE_TO_Z[97])).toBeCloseTo(97, 1);
  });
});

describe('buildChartCurves — reference percentile curves', () => {
  it('returns one curve per REFERENCE_PERCENTILES', () => {
    const curves = buildChartCurves(POINTS);
    expect(curves).toHaveLength(REFERENCE_PERCENTILES.length);
  });

  it('P50 curve passes through M values', () => {
    const curves = buildChartCurves(POINTS);
    const p50 = curves.find((c) => c.percentile === 50);
    expect(p50).toBeDefined();
    expect(p50!.points).toHaveLength(POINTS.length);
    p50!.points.forEach((p, i) => {
      expect(p.value).toBeCloseTo(POINTS[i]!.M, 3);
    });
  });

  it('P3 curve is below P50', () => {
    const curves = buildChartCurves(POINTS);
    const p3 = curves.find((c) => c.percentile === 3)!;
    const p50 = curves.find((c) => c.percentile === 50)!;
    p3.points.forEach((p, i) => {
      expect(p.value).toBeLessThan(p50.points[i]!.value);
    });
  });

  it('P97 curve is above P50', () => {
    const curves = buildChartCurves(POINTS);
    const p97 = curves.find((c) => c.percentile === 97)!;
    const p50 = curves.find((c) => c.percentile === 50)!;
    p97.points.forEach((p, i) => {
      expect(p.value).toBeGreaterThan(p50.points[i]!.value);
    });
  });

  it('curves are ordered: P3 < P10 < P50 < P90 < P97 at every age', () => {
    const curves = buildChartCurves(POINTS);
    for (let i = 0; i < POINTS.length; i++) {
      const values = curves.map((c) => c.points[i]!.value);
      const sorted = [...values].sort((a, b) => a - b);
      expect(values).toEqual(sorted);
    }
  });
});

describe('interpretZ — clinical bands', () => {
  it('z < -3 → critical', () => {
    expect(interpretZ(-3.5).tone).toBe('critical');
  });

  it('-3 ≤ z < -2 → warning (low)', () => {
    expect(interpretZ(-2.5).tone).toBe('warning');
  });

  it('-1 ≤ z ≤ 1 → ok (norm)', () => {
    expect(interpretZ(0).tone).toBe('ok');
    expect(interpretZ(0.5).tone).toBe('ok');
    expect(interpretZ(-0.5).tone).toBe('ok');
  });

  it('z > 3 → high', () => {
    expect(interpretZ(3.5).tone).toBe('high');
  });

  it('label is non-empty for all ranges', () => {
    for (const z of [-4, -2.5, -1.5, 0, 1.5, 2.5, 4]) {
      expect(interpretZ(z).label).toMatch(/.+/);
    }
  });
});
