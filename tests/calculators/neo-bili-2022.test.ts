/**
 * Hand-tests for neo-bili-2022 — AAP 2022 hyperbilirubinaemia management
 * ≥35 нед GA.
 *
 * Reference: Kemper AR et al. Pediatrics 2022;150:e2022058859. AAP 2022
 *   Clinical Practice Guideline.
 *
 * Audit B-5 regression: pre-fix, paste of out-of-scope inputs (GA <35
 * нед or HOL >336 ч) was clamped to 5 mg/dL by `Math.max(5, base)`
 * inside the threshold function. The UI rendered the clamp identical
 * to a real threshold — clinically dangerous because GA <35 нед has a
 * separate nomogram (NICE 2010 / KP NeoBili) with substantially lower
 * thresholds.
 *
 * Post-fix, compute() reads RAW input values and surfaces N/A with an
 * explanatory interpretation when ga / hour fall outside the AAP 2022
 * scope.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/neo-bili-2022';
import type { CalculatorTool } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('neo-bili-2022 · in-scope inputs', () => {
  it('GA 38, HOL 24, TSB 200 → emits a recommendation (not N/A)', () => {
    const r = calc.compute({ region: 'aap', ga: 38, hour: 24, tsb: 200, g6pd: false });
    expect(r.value).not.toBe('N/A');
    expect(typeof r.value).toBe('string');
  });

  it('GA 35 (boundary) → in scope', () => {
    const r = calc.compute({ region: 'aap', ga: 35, hour: 48, tsb: 250, g6pd: false });
    expect(r.value).not.toBe('N/A');
  });

  it('GA 42 (boundary) → in scope', () => {
    const r = calc.compute({ region: 'aap', ga: 42, hour: 72, tsb: 280, g6pd: false });
    expect(r.value).not.toBe('N/A');
  });
});

describe('neo-bili-2022 · audit B-5 out-of-scope guards', () => {
  it('GA 32 → N/A with NICE 2010 redirect (was clamped to 5 mg/dL pre-fix)', () => {
    const r = calc.compute({ region: 'aap', ga: 32, hour: 48, tsb: 200, g6pd: false });
    expect(r.value).toBe('N/A');
    expect(r.interpretation).toMatch(/35-42/);
    expect(String(r.details ?? '')).toMatch(/NICE 2010|KP NeoBili/);
  });

  it('GA 28 → N/A', () => {
    const r = calc.compute({ region: 'aap', ga: 28, hour: 24, tsb: 150, g6pd: false });
    expect(r.value).toBe('N/A');
  });

  it('GA 44 (post-term) → N/A', () => {
    const r = calc.compute({ region: 'aap', ga: 44, hour: 72, tsb: 280, g6pd: false });
    expect(r.value).toBe('N/A');
  });

  it('HOL 6 (first 12 hours) → N/A redirecting to clinical jaundice workup', () => {
    const r = calc.compute({ region: 'aap', ga: 38, hour: 6, tsb: 100, g6pd: false });
    expect(r.value).toBe('N/A');
    expect(r.interpretation).toMatch(/12-336/);
  });

  it('HOL 400 (after 14 days) → N/A redirecting to prolonged jaundice workup', () => {
    const r = calc.compute({ region: 'aap', ga: 38, hour: 400, tsb: 280, g6pd: false });
    expect(r.value).toBe('N/A');
    expect(String(r.details ?? '')).toMatch(/prolonged|cholestasis/);
  });
});
