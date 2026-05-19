/**
 * Hand-tests for naegele — Naegele EDD calculation.
 *
 * Audit B-2 regression: pre-fix the runner used `new Date(y, m-1, d)` and
 * `new Date()` which both operate in the user's local timezone. On DST
 * transitions and across timezones this caused off-by-one day errors at
 * the GA boundary (34+6 vs 35+0) which changes management — anti-D
 * dosing (28 нед), antenatal steroids (24-34 нед), GDM screen (24-28).
 *
 * Post-fix the runner anchors both LMP and "today" at noon UTC and
 * renders the EDD with `timeZone: 'UTC'`, making the result deterministic
 * regardless of the clinician's locale.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/naegele';
import type { CalculatorTool } from '@/lib/tools-runners';

const calc = runner as CalculatorTool;

describe('naegele · UTC date math (audit B-2)', () => {
  it('LMP 2026-01-01 → EDD shifts exactly 280 days', () => {
    const r = calc.compute({ lmpY: 2026, lmpM: 1, lmpD: 1 });
    // 2026-01-01 + 280 days = 2026-10-08
    expect(String(r.value)).toBe('08.10.2026');
  });

  it('LMP across DST spring-forward (EU, last Sunday in March)', () => {
    // 2026-03-29 is DST switch in EU. LMP before, EDD after — pre-fix
    // could lose a day in the resulting EDD when running in CET/CEST.
    const r = calc.compute({ lmpY: 2026, lmpM: 3, lmpD: 20 });
    // 2026-03-20 + 280 days = 2026-12-25
    expect(String(r.value)).toBe('25.12.2026');
  });

  it('LMP across DST autumn fall-back', () => {
    // 2026-10-25 is DST switch in EU.
    const r = calc.compute({ lmpY: 2026, lmpM: 10, lmpD: 20 });
    // 2026-10-20 + 280 days = 2027-07-27
    expect(String(r.value)).toBe('27.07.2027');
  });

  it('rejects non-finite year/month/day construction', () => {
    expect(() => calc.compute({ lmpY: NaN, lmpM: 1, lmpD: 1 })).toThrow();
  });

  it('returns valid EDD for a leap year LMP', () => {
    // 2024-02-29 + 280 days = 2024-12-05
    const r = calc.compute({ lmpY: 2024, lmpM: 2, lmpD: 29 });
    expect(String(r.value)).toBe('05.12.2024');
  });
});
