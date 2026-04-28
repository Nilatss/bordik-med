/**
 * Golden tests for the Ankle-Brachial Index (ABI).
 *
 * Reference: Aboyans V et al. Measurement and interpretation of the
 *   ankle-brachial index. Circulation. 2012;126(24):2890–2909.
 *
 * Formula: ABI = SBP_ankle / SBP_arm (highest of two arm readings).
 *
 * Bands the runner uses:
 *   > 1.4   non-compressible arteries (Mönckeberg media-sclerosis)
 *   1.0-1.4 normal
 *   0.9-1.0 borderline
 *   0.7-0.9 mild PAD
 *   0.4-0.7 moderate PAD
 *   < 0.4   severe PAD / CLTI
 */
import { describe, it, expect } from 'vitest';
import abi from '@/lib/runners/abi';

interface AbiResult { value: string; interpretation: string }

function call(ankle: number, brachial: number): AbiResult {
  return (abi.compute as unknown as (v: { ankle: number; brachial: number }) => unknown)({
    ankle, brachial,
  }) as AbiResult;
}

describe('abi · compute', () => {
  it('1.05 → normal', () => {
    // 126 / 120 = 1.05
    const r = call(126, 120);
    expect(parseFloat(r.value)).toBeCloseTo(1.05, 1);
    expect(r.interpretation).toMatch(/Норма/);
  });

  it('borderline at 0.92', () => {
    const r = call(110, 120);
    expect(parseFloat(r.value)).toBeCloseTo(0.92, 1);
    expect(r.interpretation).toMatch(/Пограничный/);
  });

  it('mild PAD at 0.80', () => {
    const r = call(96, 120);
    expect(parseFloat(r.value)).toBeCloseTo(0.80, 1);
    expect(r.interpretation).toMatch(/Лёгкое ПАД/);
  });

  it('moderate PAD at 0.55', () => {
    const r = call(66, 120);
    expect(parseFloat(r.value)).toBeCloseTo(0.55, 1);
    expect(r.interpretation).toMatch(/Умеренное ПАД/);
  });

  it('severe PAD at 0.30', () => {
    const r = call(36, 120);
    expect(parseFloat(r.value)).toBeCloseTo(0.30, 1);
    expect(r.interpretation).toMatch(/Тяжёлое|критич/i);
  });

  it('non-compressible at 1.5 (medial calcification — Mönckeberg)', () => {
    const r = call(195, 130);
    expect(parseFloat(r.value)).toBeCloseTo(1.5, 1);
    expect(r.interpretation).toMatch(/Некомпрессируемые/);
  });

  it('zero brachial → 0.0 (defensive division)', () => {
    const r = call(120, 0);
    expect(parseFloat(r.value)).toBe(0);
  });
});
