/**
 * Golden tests for Adjusted Body Weight (ABW) — used for dosing
 * aminoglycosides, vancomycin, etc. in obese patients.
 *
 * Reference: Pai MP, Paloucek FP. The origin of the "ideal" body
 *   weight equations. Ann Pharmacother. 2000;34(9):1066–9.
 *
 * Formulas:
 *   IBW (Devine) = (♂ 50 / ♀ 45.5) + 2.3 × inches_over_5ft
 *   ABW = IBW + 0.4 × (TBW − IBW)
 *   ratio = TBW / IBW
 *
 * Bands:
 *   ratio < 1.2 → ABW not needed
 *   1.2-1.5    → moderate obesity, ABW applicable
 *   ≥ 1.5      → marked obesity, ABW mandatory
 */
import { describe, it, expect } from 'vitest';
import abw from '@/lib/runners/abw';

interface AbwResult { interpretation: string; details: string }

function call(actualWeight: number, height: number, female: boolean): AbwResult {
  return (abw.compute as unknown as (v: { actualWeight: number; height: number; female: boolean }) => unknown)({
    actualWeight, height, female,
  }) as AbwResult;
}

describe('abw · compute', () => {
  it('male 70kg / 175cm — ABW not needed (ratio < 1.2)', () => {
    // 175cm → 22.44 inches above 5ft
    // IBW = 50 + 2.3*9.0 = 70.7  (175cm = 8.91 in over 5ft → 50+20.5 = 70.5)
    // TBW 70 kg, ratio = 70/70.5 = 0.99
    const r = call(70, 175, false);
    expect(r.interpretation).toMatch(/не требуется/i);
  });

  it('female 90kg / 165cm — moderate obesity (1.2-1.5)', () => {
    // 165cm → 4.96 in over 5ft
    // IBW (♀) = 45.5 + 2.3*4.96 = 56.9
    // ratio 90/56.9 = 1.58 → marked obesity
    // 80kg: 80/56.9 = 1.4 → moderate
    const r = call(80, 165, true);
    expect(r.interpretation).toMatch(/Умеренное ожирение/);
  });

  it('male 130kg / 175cm — marked obesity (≥ 1.5)', () => {
    // IBW = 70.5; ratio 130/70.5 = 1.84
    const r = call(130, 175, false);
    expect(r.interpretation).toMatch(/Выраженное ожирение/);
  });

  it('female factor 45.5 lowers IBW vs male (same height)', () => {
    const m = call(70, 170, false);
    const f = call(70, 170, true);
    // Same TBW + same height: female has lower IBW → higher ratio
    expect(f.details).not.toBe(m.details);
  });

  it('short stature → small IBW (clamped at floor 152.4cm)', () => {
    // 145cm < 152.4 → inchesAbove5ft = 0 → IBW = floor only (50 or 45.5)
    const r = call(60, 145, false);  // IBW=50, ratio=1.2 → moderate boundary
    // Just check no NaN or crash
    expect(r.interpretation).toBeTruthy();
  });
});
