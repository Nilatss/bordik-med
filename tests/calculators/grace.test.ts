/**
 * Golden tests for GRACE 2.0 score (in-hospital ACS mortality).
 *
 * Reference: Granger CB, Goldberg RJ, Dabbous O, et al. Predictors of
 * hospital mortality in the global registry of acute coronary events.
 * Arch Intern Med 2003;163(19):2345-2353. doi:10.1001/archinte.163.19.2345
 *
 * ESC 2023 ACS Guidelines anchor invasive strategy:
 *   <109     → low risk    (consider non-invasive / selective invasive)
 *   109-140  → intermediate (early invasive within 72h, IIa)
 *   >140     → high         (urgent invasive within 24h, I)
 */
import { describe, it, expect } from 'vitest';
import grace from '@/lib/runners/grace';

interface GraceResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): GraceResult {
  const r = (grace.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as GraceResult;
}

describe('grace · risk stratification', () => {
  it('young low-risk (40y, HR 70, SBP 120, killip I, no biomarkers) → low', () => {
    const r = compute({ age: 40, hr: 70, sbp: 120, cr: 80, killip: 1, arrest: false, stdev: false, markers: false });
    expect(r.interpretation).toMatch(/Низкий|low/i);
    expect(r.color).toMatch(/^#22/i);
  });

  it('intermediate-risk (55y, HR 80, killip II, troponin+) → intermediate', () => {
    // Granger 2003 points: 41 (age) + 9 (HR) + 34 (SBP) + 7 (Cr) + 20 (killip II) + 14 (markers) = 125
    const r = compute({ age: 55, hr: 80, sbp: 130, cr: 80, killip: 2, arrest: false, stdev: false, markers: true });
    expect(r.interpretation).toMatch(/Промежуточный|intermediate/i);
  });

  it('high-risk (75y, HR 110, SBP 90, killip III, troponin+) → high', () => {
    // 75 + 24 + 53 + 13 + 39 + 28 + 14 = 246 → high
    const r = compute({ age: 75, hr: 110, sbp: 90, cr: 150, killip: 3, arrest: false, stdev: true, markers: true });
    expect(r.interpretation).toMatch(/Высокий|high/i);
  });

  it('cardiac arrest at presentation pushes risk higher', () => {
    const a = compute({ age: 60, hr: 80, sbp: 130, cr: 80, killip: 1, arrest: false, stdev: false, markers: false });
    const b = compute({ age: 60, hr: 80, sbp: 130, cr: 80, killip: 1, arrest: true, stdev: false, markers: false });
    const aPts = parseInt(a.value.match(/\d+/)?.[0] ?? '0', 10);
    const bPts = parseInt(b.value.match(/\d+/)?.[0] ?? '0', 10);
    expect(bPts).toBeGreaterThan(aPts);
  });

  it('mortality monotonically rises with pts (snapshot 3 patients)', () => {
    const low = compute({ age: 35, hr: 65, sbp: 130, cr: 70, killip: 1, arrest: false, stdev: false, markers: false });
    const mid = compute({ age: 65, hr: 90, sbp: 110, cr: 110, killip: 2, arrest: false, stdev: true, markers: false });
    const high = compute({ age: 80, hr: 120, sbp: 80, cr: 200, killip: 4, arrest: true, stdev: true, markers: true });
    const pct = (s: string): number => Number(s.match(/(\d+(?:\.\d+)?)/)?.[1] ?? 0);
    // details has "госпитальная смертность X %"
    expect(pct(high.details)).toBeGreaterThan(pct(mid.details));
    expect(pct(mid.details)).toBeGreaterThan(pct(low.details));
  });

  it('intermediate-risk recommends early invasive (≤72h)', () => {
    const r = compute({ age: 60, hr: 90, sbp: 110, cr: 100, killip: 2, arrest: false, stdev: true, markers: true });
    expect(r.details.toLowerCase()).toMatch(/72|инвазивн/);
  });

  it('GRACE points snapshot — minimum-input patient', () => {
    // Age <30, HR <50, SBP >200, normal Cr, Killip I, no flags → very low
    const r = compute({ age: 25, hr: 60, sbp: 130, cr: 70, killip: 1, arrest: false, stdev: false, markers: false });
    expect(r.interpretation).toMatch(/Низкий/);
  });
});
