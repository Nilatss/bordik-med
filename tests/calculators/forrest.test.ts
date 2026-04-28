/**
 * Golden tests for the Forrest classification (UGI ulcer bleeding).
 *
 * Reference: Forrest JA, Finlayson ND, Shearman DJ. Endoscopy in
 *   gastrointestinal bleeding. Lancet. 1974;2(7877):394–7.
 *
 * Classes drive endoscopic-rebleed probability and management:
 *   Ia  active spurting   ~55%
 *   Ib  oozing            ~55%
 *   IIa visible vessel    ~43%
 *   IIb adherent clot     ~22%
 *   IIc flat pigment      ~10%
 *   III clean base        ~5%
 *
 * Ia/Ib/IIa/IIb → high-risk → IV PPI + endoscopic haemostasis.
 * IIc/III      → low-risk  → oral PPI, early discharge.
 */
import { describe, it, expect } from 'vitest';
import forrest from '@/lib/runners/forrest';

interface FResult { value: string; interpretation: string; details?: string }

function call(cls: 'Ia' | 'Ib' | 'IIa' | 'IIb' | 'IIc' | 'III'): FResult {
  return (forrest.compute as unknown as (v: { class: string }) => unknown)({ class: cls }) as FResult;
}

describe('forrest · compute', () => {
  it('Ia — spurting → very-high-risk band, IV PPI + endoscopic haemostasis', () => {
    const r = call('Ia');
    expect(r.value).toBe('Ia');
    expect(r.interpretation).toMatch(/55/);
    expect(r.interpretation.toLowerCase()).toMatch(/гемостаз|ипп/);
  });

  it('Ib — oozing → high-risk', () => {
    const r = call('Ib');
    expect(r.interpretation).toMatch(/55/);
  });

  it('IIa — visible vessel → high-risk', () => {
    const r = call('IIa');
    expect(r.interpretation).toMatch(/43/);
  });

  it('IIb — adherent clot → moderate', () => {
    const r = call('IIb');
    expect(r.interpretation).toMatch(/22/);
  });

  it('IIc — flat pigment → low-risk, oral PPI, early discharge', () => {
    const r = call('IIc');
    expect(r.interpretation).toMatch(/10/);
    expect(r.interpretation.toLowerCase()).toMatch(/амбулатор|выпис|per os/);
  });

  it('III — clean base → very-low-risk', () => {
    const r = call('III');
    expect(r.interpretation).toMatch(/5/);
  });

  it('high-risk classes carry IV-PPI guidance in details', () => {
    for (const cls of ['Ia', 'Ib', 'IIa', 'IIb'] as const) {
      const r = call(cls);
      expect(r.details).toMatch(/гемостаз|в\/в/i);
    }
  });

  it('low-risk classes do not mandate endoscopic haemostasis in details', () => {
    for (const cls of ['IIc', 'III'] as const) {
      const r = call(cls);
      expect(r.details?.toLowerCase()).toMatch(/per os|выпис/);
    }
  });
});
