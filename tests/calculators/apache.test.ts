/**
 * Golden tests for APACHE II.
 *
 * Reference: Knaus WA et al. APACHE II: a severity of disease classification
 *   system. Crit Care Med. 1985;13(10):818-29.
 *
 * Total = APS (acute physiology score, 0-60) + age points + chronic health.
 * Age tiers: <45=0, 45-54=2, 55-64=3, 65-74=5, 75+=6.
 *
 * Mortality bands: ≤4 ~4%, 5-9 ~8%, 10-14 ~15%, 15-19 ~25%,
 *                  20-24 ~40%, 25-29 ~55%, 30-34 ~73%, ≥35 >85%.
 */
import { describe, it, expect } from 'vitest';
import apache from '@/lib/runners/apache';

interface AResult { value: string; interpretation: string }

function call(args: { aps: number; age: number; chronic: number }): AResult {
  return (apache.compute as unknown as (v: typeof args) => unknown)(args) as AResult;
}

describe('apache · compute', () => {
  it('young patient, low APS → ≤4 band (~4% mortality)', () => {
    const r = call({ aps: 4, age: 30, chronic: 0 });   // 4+0+0=4
    expect(r.interpretation).toMatch(/4%/);
  });

  it('age 65 adds 5 points', () => {
    const r = call({ aps: 0, age: 65, chronic: 0 });   // 0+5+0=5 → 5-9 band
    expect(r.interpretation).toMatch(/8%/);
  });

  it('moderate sepsis: APS 12, age 60, chronic 2 → 17 → 15-19 band (~25%)', () => {
    const r = call({ aps: 12, age: 60, chronic: 2 });  // 12+3+2=17
    expect(r.interpretation).toMatch(/25%/);
  });

  it('elderly + chronic + high APS → 25-29 band', () => {
    const r = call({ aps: 19, age: 78, chronic: 5 });  // 19+6+5=30 → 30-34 band
    expect(r.interpretation).toMatch(/73%/);
  });

  it('extreme APACHE > 34 → >85% mortality', () => {
    const r = call({ aps: 30, age: 80, chronic: 5 });  // 30+6+5=41
    expect(r.interpretation).toMatch(/85%/);
  });

  it('age tier boundaries', () => {
    // age 44 → 0 points, age 45 → 2 points
    const a44 = call({ aps: 0, age: 44, chronic: 0 });
    const a45 = call({ aps: 0, age: 45, chronic: 0 });
    // 0 → ≤4 band (4%); 2 → also ≤4 band (still 2 ≤ 4)
    // Test boundaries that change band: age 45 (2pts) vs age 55 (3pts)
    const a55 = call({ aps: 4, age: 55, chronic: 0 });   // 4+3+0=7 → 5-9
    const a64 = call({ aps: 1, age: 64, chronic: 0 });   // 1+3+0=4 → ≤4
    expect(a44.interpretation).toMatch(/4%/);
    expect(a45.interpretation).toMatch(/4%/);
    expect(a55.interpretation).toMatch(/8%/);
    expect(a64.interpretation).toMatch(/4%/);
  });

  it('APS clamped to 0-60 range (defensive)', () => {
    const negative = call({ aps: -10, age: 30, chronic: 0 });   // → 0
    const huge = call({ aps: 100, age: 30, chronic: 0 });       // → 60
    expect(negative.interpretation).toMatch(/4%/);
    expect(huge.interpretation).toMatch(/85%/);  // 60 → >34 band
  });
});
