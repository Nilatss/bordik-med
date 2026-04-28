/**
 * Golden tests for MELD (Model for End-Stage Liver Disease).
 *
 * Reference: Kamath PS et al. A model to predict survival in patients
 *   with end-stage liver disease. Hepatology. 2001;33(2):464–70.
 *
 * Formula (UNOS clamped):
 *   MELD = 3.78 * ln(bili_mg/dL) + 11.2 * ln(INR) + 9.57 * ln(SCr_mg/dL) + 6.43
 *   - All values floored to 1.0 mg/dL / 1.0 INR before ln.
 *   - SCr capped at 4.0 mg/dL (or 4.0 if dialysis ≥ 2× / week).
 *   - Result rounded, clamped to [6, 40].
 *
 * Bands the runner uses:
 *   ≤ 9  3-mo mortality ~2%
 *   10–19 ~6%
 *   20–29 ~20%
 *   30–39 ~53%
 *   40    ~71%
 */
import { describe, it, expect } from 'vitest';
import meld from '@/lib/runners/meld';

interface MeldResult { value: string; interpretation: string }

function call(biliUmol: number, inr: number, creatUmol: number, dialysis = false): MeldResult {
  return (meld.compute as (input: { bili: number; inr: number; creat: number; dialysis: boolean }) => unknown)({
    bili: biliUmol, inr, creat: creatUmol, dialysis,
  }) as MeldResult;
}

describe('meld · compute', () => {
  it('compensated cirrhosis (low) — bili 17, INR 1.0, creat 88', () => {
    // bili_mgdl = 17/17.1 ≈ 0.99 → floored to 1.0; ln(1) = 0
    // SCr_mgdl = 88/88.4 ≈ 0.995 → floored to 1.0; ln(1) = 0
    // INR floored to 1.0; ln(1) = 0
    // MELD = 0 + 0 + 0 + 6.43 = 6.43 → 6 (clamp floor)
    const r = call(17, 1.0, 88);
    expect(parseInt(r.value)).toBe(6);
    expect(r.interpretation).toMatch(/2%/);
  });

  it('moderate (MELD 15) — bili 51, INR 1.5, creat 130', () => {
    // bili 51/17.1 = 2.98; ln ≈ 1.093; * 3.78 ≈ 4.13
    // INR 1.5; ln ≈ 0.405; * 11.2 ≈ 4.54
    // SCr 130/88.4 = 1.47; ln ≈ 0.385; * 9.57 ≈ 3.69
    // sum + 6.43 ≈ 18.79 → 19
    const r = call(51, 1.5, 130);
    expect(parseInt(r.value)).toBeGreaterThanOrEqual(15);
    expect(parseInt(r.value)).toBeLessThanOrEqual(19);
    expect(r.interpretation).toMatch(/6%/);
  });

  it('severe (MELD 30-39 band) — bili 200, INR 2.5, creat 200', () => {
    const r = call(200, 2.5, 200);
    expect(parseInt(r.value)).toBeGreaterThanOrEqual(30);
    expect(parseInt(r.value)).toBeLessThanOrEqual(39);
    expect(r.interpretation).toMatch(/53%/);
  });

  it('SCr cap at 4.0 mg/dL (≈ 354 µmol/L)', () => {
    const a = call(100, 2.0, 354);    // ≈ exactly at cap
    const b = call(100, 2.0, 700);    // way above cap → clamped
    expect(a.value).toBe(b.value);
  });

  it('dialysis flag forces SCr to cap', () => {
    const noD = call(100, 2.0, 88);   // SCr 1.0
    const yes = call(100, 2.0, 88, true);  // dialysis → SCr clamp 4.0
    expect(parseInt(yes.value)).toBeGreaterThan(parseInt(noD.value));
  });

  it('upper clamp at 40', () => {
    const r = call(800, 8.0, 800);    // very high inputs
    expect(parseInt(r.value)).toBe(40);
    expect(r.interpretation).toMatch(/71%/);
  });
});
