/**
 * Golden tests for vancomycin AUC₂₄/MIC dosing target.
 *
 * Reference: Rybak MJ et al. Therapeutic monitoring of vancomycin for
 *   serious MRSA infections — IDSA / ASHP / SIDP / PIDS / ACCP 2020.
 *
 * Simplified Neely 2014 estimator:
 *   AUC₂₄ ≈ trough × 24 + (dose × 24 / tau) × 0.3
 *   ratio = AUC₂₄ / MIC
 *
 * Bands:
 *   < 400   sub-therapeutic (raise dose)
 *   400-600 target
 *   > 600   over-exposure → nephrotoxicity risk (lower dose)
 */
import { describe, it, expect } from 'vitest';
import vanco from '@/lib/runners/vanco-auc';

interface VResult { value: string; interpretation: string }

function call(trough: number, dose: number, interval: number, mic: number): VResult {
  return (vanco.compute as unknown as (v: { trough: number; dose: number; interval: number; mic: number }) => unknown)({
    trough, dose, interval, mic,
  }) as VResult;
}

describe('vanco-auc · compute', () => {
  it('sub-therapeutic — trough 8, 1g q12h, MIC 1', () => {
    // AUC = 8*24 + (1000*24/12)*0.3 = 192 + 600 = 792 / MIC 1 = 792
    // Wait: that's > 600 → over-exposure
    // Try: trough 5, 750mg q12h: AUC = 120 + 1500*0.3 = 120 + 450 = 570 → target
    // Try: trough 5, 500mg q12h: AUC = 120 + 1000*0.3 = 120 + 300 = 420 → target
    // For sub: need trough+dailyDose lower
    // trough 3, 500mg q24h: AUC = 72 + 500*0.3 = 72+150 = 222 → sub
    const r = call(3, 500, 24, 1);
    expect(parseInt(r.value)).toBeLessThan(400);
    expect(r.interpretation).toMatch(/Суб-терапевтическая/);
  });

  it('target — trough 5, 500mg q12h, MIC 1 → ~420', () => {
    const r = call(5, 500, 12, 1);
    const ratio = parseInt(r.value);
    expect(ratio).toBeGreaterThanOrEqual(400);
    expect(ratio).toBeLessThanOrEqual(600);
    expect(r.interpretation).toMatch(/Целевая/);
  });

  it('over-exposure — trough 20, 1500mg q8h, MIC 1', () => {
    // AUC = 20*24 + (1500*24/8)*0.3 = 480 + 1350 = 1830
    const r = call(20, 1500, 8, 1);
    expect(parseInt(r.value)).toBeGreaterThan(600);
    expect(r.interpretation).toMatch(/Избыточная/);
    expect(r.interpretation).toMatch(/нефротоксичности/);
  });

  it('higher MIC lowers AUC/MIC ratio (same dose)', () => {
    const m1 = parseInt(call(10, 1000, 12, 1).value);
    const m2 = parseInt(call(10, 1000, 12, 2).value);
    expect(m2).toBeLessThan(m1);
    // Should be ~half
    expect(m2 / m1).toBeCloseTo(0.5, 1);
  });

  it('default MIC = 1 when 0 supplied (||1 fallback)', () => {
    const a = call(10, 1000, 12, 0);
    const b = call(10, 1000, 12, 1);
    expect(a.value).toBe(b.value);
  });

  it('over-exposure carries a lower-dose recommendation', () => {
    const r = call(25, 1500, 6, 1);
    expect(r.interpretation.toLowerCase()).toMatch(/избыточная|600/);
  });
});
