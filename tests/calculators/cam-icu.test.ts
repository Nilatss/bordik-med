/**
 * Golden tests for CAM-ICU (Confusion Assessment Method for ICU).
 *
 * Reference: Ely EW et al. Evaluation of delirium in critically ill
 *   patients. Crit Care Med. 2001;29(7):1370–9.
 *
 * Algorithm: positive when
 *   F1 (acute change / fluctuating)  AND
 *   F2 (inattention)                  AND
 *   ( F3 (altered LOC) OR F4 (disorganised thinking) )
 *
 * Any other combination → negative.
 */
import { describe, it, expect } from 'vitest';
import camIcu from '@/lib/runners/cam-icu';

interface CResult { value: string; interpretation: string }

function call(f1: boolean, f2: boolean, f3: boolean, f4: boolean): CResult {
  return (camIcu.compute as unknown as (v: { f1: boolean; f2: boolean; f3: boolean; f4: boolean }) => unknown)({
    f1, f2, f3, f4,
  }) as CResult;
}

describe('cam-icu · compute', () => {
  it('all four features → positive', () => {
    const r = call(true, true, true, true);
    expect(r.value).toBe('CAM-ICU+');
    expect(r.interpretation).toMatch(/ПОЗИТИВЕН/);
  });

  it('F1 + F2 + F3 only (no F4) → positive', () => {
    const r = call(true, true, true, false);
    expect(r.value).toBe('CAM-ICU+');
  });

  it('F1 + F2 + F4 only (no F3) → positive', () => {
    const r = call(true, true, false, true);
    expect(r.value).toBe('CAM-ICU+');
  });

  it('F1 + F2 only (no F3, no F4) → negative', () => {
    const r = call(true, true, false, false);
    expect(r.value).toBe('CAM-ICU−');
    expect(r.interpretation).toMatch(/отсутствует/);
  });

  it('F1 only → negative', () => {
    const r = call(true, false, true, true);
    expect(r.value).toBe('CAM-ICU−');
  });

  it('F2 only → negative', () => {
    const r = call(false, true, true, true);
    expect(r.value).toBe('CAM-ICU−');
  });

  it('all negative → negative', () => {
    const r = call(false, false, false, false);
    expect(r.value).toBe('CAM-ICU−');
  });
});
