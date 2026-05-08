/**
 * Golden tests for Canadian C-Spine Rule + NEXUS criteria.
 *
 * Reference: Stiell IG, Wells GA, Vandemheen KL, et al. The Canadian
 * C-spine rule for radiography in alert and stable trauma patients.
 * JAMA 2001;286(15):1841-1848. doi:10.1001/jama.286.15.1841
 * Hoffman JR et al. NEXUS. N Engl J Med 2000;343(2):94-99.
 *
 * Two algorithms:
 *   CCR — high-risk (any) → image; else low-risk-present + active 45° rotation → no image
 *   NEXUS — all 5 low-risk absent → no image (NPV ~99.8%)
 */
import { describe, it, expect } from 'vitest';
import ccr from '@/lib/runners/can-cspine';

interface CcrResult {
  value: string;
  interpretation: string;
  color: string;
  details: string;
  actions: string[];
}

function compute(input: Record<string, unknown>): CcrResult {
  const r = (ccr.compute as (i: Record<string, unknown>) => unknown)(input);
  return r as CcrResult;
}

describe('can-cspine · NEXUS', () => {
  it('all 5 low-risk absent → no imaging', () => {
    const r = compute({
      rule: 'nexus',
      nexus_midline: false, nexus_focal: false, nexus_ams: false,
      nexus_intox: false, nexus_distract: false,
    });
    expect(r.value).toBe('Нет');
    expect(r.interpretation).toMatch(/не требуется|без рентген/i);
  });

  it('any single criterion present → imaging required', () => {
    const r = compute({
      rule: 'nexus',
      nexus_midline: true, nexus_focal: false, nexus_ams: false,
      nexus_intox: false, nexus_distract: false,
    });
    expect(r.value).toBe('Да');
    expect(r.actions.some((a) => /ct|рентген/i.test(a))).toBe(true);
  });

  it('AMS or focal deficit → imaging', () => {
    const r = compute({
      rule: 'nexus',
      nexus_midline: false, nexus_focal: false, nexus_ams: true,
      nexus_intox: false, nexus_distract: false,
    });
    expect(r.value).toBe('Да');
  });
});

describe('can-cspine · CCR', () => {
  it('high-risk (age ≥65) → imaging mandatory', () => {
    const r = compute({
      rule: 'ccr',
      highRisk_age65: true, highRisk_mech: false, highRisk_paraest: false,
      lowRisk_mva: false, lowRisk_sitting: false, lowRisk_ambul: false,
      lowRisk_delayed: false, lowRisk_nomidline: false, rotate: false,
    });
    expect(r.value).toBe('Да');
    expect(r.interpretation.toLowerCase()).toMatch(/high-risk/);
  });

  it('high-risk paraesthesia → imaging', () => {
    const r = compute({
      rule: 'ccr',
      highRisk_age65: false, highRisk_mech: false, highRisk_paraest: true,
      lowRisk_mva: false, lowRisk_sitting: false, lowRisk_ambul: false,
      lowRisk_delayed: false, lowRisk_nomidline: false, rotate: true,
    });
    expect(r.value).toBe('Да');
  });

  it('no low-risk factors present → imaging', () => {
    const r = compute({
      rule: 'ccr',
      highRisk_age65: false, highRisk_mech: false, highRisk_paraest: false,
      lowRisk_mva: false, lowRisk_sitting: false, lowRisk_ambul: false,
      lowRisk_delayed: false, lowRisk_nomidline: false, rotate: true,
    });
    expect(r.value).toBe('Да');
  });

  it('no high-risk + low-risk present + 45° rotation → no imaging', () => {
    const r = compute({
      rule: 'ccr',
      highRisk_age65: false, highRisk_mech: false, highRisk_paraest: false,
      lowRisk_mva: false, lowRisk_sitting: true, lowRisk_ambul: false,
      lowRisk_delayed: false, lowRisk_nomidline: false, rotate: true,
    });
    expect(r.value).toBe('Нет');
  });

  it('NEXUS no-image result mentions NPV ~99.8%', () => {
    const r = compute({
      rule: 'nexus',
      nexus_midline: false, nexus_focal: false, nexus_ams: false,
      nexus_intox: false, nexus_distract: false,
    });
    expect(r.details.toLowerCase()).toMatch(/99|npv/);
  });
});
