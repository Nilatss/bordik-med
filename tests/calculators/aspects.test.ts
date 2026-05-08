/**
 * Golden tests for ASPECTS (Alberta Stroke Program Early CT Score).
 *
 * Reference: Barber PA, Demchuk AM, Zhang J, Buchan AM. Validity and
 * reliability of a quantitative computed tomography score in predicting
 * outcome of hyperacute stroke before thrombolytic therapy. Lancet
 * 2000;355(9216):1670-1674. doi:10.1016/S0140-6736(00)02237-6
 *
 * 10 regions (1 point each preserved); ASPECTS = 10 − damaged.
 *
 * Bands:
 *   ≥8   → favourable; thrombolysis / thrombectomy candidate
 *   6-7  → borderline; multidisciplinary decision
 *   ≤5   → extensive infarct; SELECT2 / RESCUE-Japan LIMIT extended
 *          thrombectomy indications
 */
import { describe, it, expect } from 'vitest';
import aspects from '@/lib/runners/aspects';

interface AspectsResult {
  value: string;
  unit: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(lost: number): AspectsResult {
  const r = (aspects.compute as (i: { lost: number }) => unknown)({ lost });
  return r as AspectsResult;
}

describe('aspects · band selection', () => {
  it('lost=0 → ASPECTS 10 → favourable', () => {
    const r = compute(0);
    expect(r.value).toBe('10');
    expect(r.interpretation).toMatch(/благоприятн|≥ 8|≥8/i);
  });

  it('lost=2 → ASPECTS 8 → still favourable', () => {
    const r = compute(2);
    expect(r.value).toBe('8');
    expect(r.interpretation).toMatch(/благоприятн|≥ 8|≥8/i);
  });

  it('lost=3 → ASPECTS 7 → borderline', () => {
    const r = compute(3);
    expect(r.value).toBe('7');
    expect(r.interpretation).toMatch(/погранич|6-7/i);
  });

  it('lost=4 → ASPECTS 6 → borderline (lower bound)', () => {
    const r = compute(4);
    expect(r.value).toBe('6');
    expect(r.interpretation).toMatch(/погранич|6-7/i);
  });

  it('lost=5 → ASPECTS 5 → extensive', () => {
    const r = compute(5);
    expect(r.value).toBe('5');
    expect(r.interpretation).toMatch(/обшир|≤ 5|≤5/i);
  });

  it('lost=10 → ASPECTS 0 → extensive', () => {
    const r = compute(10);
    expect(r.value).toBe('0');
    expect(r.interpretation).toMatch(/обшир/);
  });

  it('input clamped to [0..10]', () => {
    expect(compute(-5).value).toBe('10'); // lost clamped to 0
    expect(compute(15).value).toBe('0');  // lost clamped to 10
  });

  it('favourable band names tPA / thrombectomy', () => {
    const r = compute(2); // ASPECTS 8
    const text = r.actions.join(' ').toLowerCase();
    expect(text).toMatch(/tpa|альтеплаз|тенектеплаз|тромбэкстракц|тромбэктомия/);
  });

  it('extensive band cites SELECT2 / RESCUE-Japan LIMIT', () => {
    const r = compute(7); // ASPECTS 3
    const text = `${r.details ?? ''} ${r.actions.join(' ')}`.toLowerCase();
    expect(text).toMatch(/select2|rescue/);
  });
});
