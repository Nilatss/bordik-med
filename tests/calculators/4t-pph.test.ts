/**
 * Golden tests for the 4T mnemonic for postpartum haemorrhage causes.
 *
 * Reference: ACOG Practice Bulletin 183 (2017), RCOG Green-top 52.
 *
 * Categories:
 *   tone     atonia (70 % of PPH)
 *   trauma   lacerations / haematoma / uterine inversion or rupture
 *   tissue   retained placenta / fragments
 *   thrombin coagulopathy (DIC, HELLP, AFE, anticoagulants, vWD)
 */
import { describe, it, expect } from 'vitest';
import pph from '@/lib/runners/4t-pph';

interface PResult { value: string; interpretation: string }

function call(cause: 'tone' | 'trauma' | 'tissue' | 'thrombin'): PResult {
  return (pph.compute as unknown as (v: { cause: string }) => unknown)({ cause }) as PResult;
}

describe('4t-pph · compute', () => {
  it('tone → uterine atony decision path', () => {
    const r = call('tone');
    expect(r.value).toMatch(/Атония|Tone/);
    expect(r.interpretation).toMatch(/Атония|Tone/);
  });

  it('trauma → lacerations / haematoma path', () => {
    const r = call('trauma');
    expect(r.value).toMatch(/Травма|Trauma/);
  });

  it('tissue → retained placenta path', () => {
    const r = call('tissue');
    expect(r.value).toMatch(/тканей|Tissue/);
  });

  it('thrombin → coagulopathy path', () => {
    const r = call('thrombin');
    expect(r.value).toMatch(/Коагулопатия|Thrombin/);
  });

  it('every category resolves to a non-empty plan', () => {
    for (const cause of ['tone', 'trauma', 'tissue', 'thrombin'] as const) {
      const r = call(cause);
      expect(r.value).toBeTruthy();
      expect(r.interpretation).toBeTruthy();
    }
  });
});
