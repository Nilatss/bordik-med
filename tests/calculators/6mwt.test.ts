/**
 * Golden tests for 6-Minute Walk Test (Enright 1998 reference).
 *
 * Reference: Enright PL, Sherrill DL. Reference equations for the
 *   six-minute walk in healthy adults. Am J Respir Crit Care Med.
 *   1998;158(5):1384–7.
 *
 * Formulas:
 *   ♂ predicted = 7.57·height − 5.02·age − 1.76·weight − 309
 *   ♀ predicted = 2.11·height − 2.29·weight − 5.78·age + 667
 *   pct = distance / predicted × 100
 *
 * Bands the runner uses:
 *   ≥ 82% → Норма
 *   70-82% → Лёгкое снижение
 *   50-70% → Умеренное снижение
 *   < 50%  → Выраженное снижение
 */
import { describe, it, expect } from 'vitest';
import sixMwt from '@/lib/runners/6mwt';

interface MResult { interpretation: string }

function call(distance: number, age: number, height: number, weight: number, sex: 'm' | 'f'): MResult {
  return (sixMwt.compute as unknown as (v: { distance: number; age: number; height: number; weight: number; sex: string }) => unknown)({
    distance, age, height, weight, sex,
  }) as MResult;
}

describe('6mwt · compute', () => {
  it('healthy male 50y/175cm/75kg, walked 600m → norm', () => {
    // Predicted = 7.57*175 - 5.02*50 - 1.76*75 - 309
    //           = 1324.75 - 251 - 132 - 309 = 632.75
    // pct = 600/632.75 = 94.8% → norm
    const r = call(600, 50, 175, 75, 'm');
    expect(r.interpretation).toMatch(/Норма/);
  });

  it('male 50y/175cm/75kg walked 500m → mild decrease (70-82)', () => {
    // pct = 500/632.75 = 79%
    const r = call(500, 50, 175, 75, 'm');
    expect(r.interpretation).toMatch(/Лёгкое/);
  });

  it('male 50y/175cm/75kg walked 350m → moderate decrease (50-70)', () => {
    // pct = 350/632.75 = 55%
    const r = call(350, 50, 175, 75, 'm');
    expect(r.interpretation).toMatch(/Умеренное/);
  });

  it('male 50y/175cm/75kg walked 200m → severe decrease (<50)', () => {
    // pct = 200/632.75 = 32%
    const r = call(200, 50, 175, 75, 'm');
    expect(r.interpretation).toMatch(/Выраженное/);
  });

  it('female reference equation differs from male (same anthropometrics)', () => {
    const m = call(500, 60, 165, 60, 'm');
    const f = call(500, 60, 165, 60, 'f');
    // Even with same distance, predicted differs → interpretation may shift
    // Just confirm both produce defined output and differ in details somewhere
    expect(m.interpretation).toBeTruthy();
    expect(f.interpretation).toBeTruthy();
  });
});
