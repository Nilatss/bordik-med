/**
 * Golden tests for Pediatric Dose Calculator (K3 MVP, 30 drugs).
 *
 * Reference: data/pediatric-dosing.json — WHO + BNFc + AAP + APLS + Минздрав РФ.
 * Verifies mg/kg calculation, max-cap enforcement, age-range checks.
 */
import { describe, it, expect } from 'vitest';
import pedDose from '@/lib/runners/pediatric-dose';

interface Result {
  value: string;
  interpretation: string;
  color: string;
  details?: string;
  actions?: string[];
}

function call(drugInd: string, weight: number, ageMonths: number): Result {
  return (pedDose.compute as unknown as (v: {
    drug_indication: string; weight: number; age_months: number;
  }) => unknown)({
    drug_indication: drugInd, weight, age_months: ageMonths,
  }) as Result;
}

describe('pediatric-dose · MVP-30 drugs', () => {
  // ─── P0 guard tests ─────────────────────────────────────────────────
  describe('P0 guard: invalid inputs return N/A', () => {
    it('weight = 0 → N/A', () => {
      const r = call('paracetamol|0', 0, 24);
      expect(r.value).toBe('N/A');
      expect(r.interpretation).toMatch(/корректные/i);
    });
    it('weight < 0 → N/A', () => {
      const r = call('paracetamol|0', -5, 24);
      expect(r.value).toBe('N/A');
    });
    it('age < 0 → N/A', () => {
      const r = call('paracetamol|0', 12, -1);
      expect(r.value).toBe('N/A');
    });
    it('unknown drug ID → N/A', () => {
      const r = call('not-a-real-drug|0', 12, 24);
      expect(r.value).toBe('N/A');
    });
    it('malformed key (no |) → N/A', () => {
      const r = call('paracetamol', 12, 24);
      expect(r.value).toBe('N/A');
    });
    it('out-of-range indication index → N/A', () => {
      const r = call('paracetamol|99', 12, 24);
      expect(r.value).toBe('N/A');
    });
  });

  // ─── Age-range checks ──────────────────────────────────────────────
  describe('age range enforcement', () => {
    it('paracetamol indication 0 (≥3 mo) blocks neonates', () => {
      const r = call('paracetamol|0', 4, 1); // 1 month old
      expect(r.value).toMatch(/Не назначать/i);
      expect(r.color).toBe('#EF4444');
      expect(r.interpretation).toMatch(/возраст/i);
    });
    it('ibuprofen blocks under 3 months', () => {
      const r = call('ibuprofen|0', 5, 2);
      expect(r.value).toMatch(/Не назначать/i);
    });
    it('amoxicillin тонзиллит requires ≥12 months', () => {
      const r = call('amoxicillin|1', 8, 6);
      expect(r.value).toMatch(/Не назначать/i);
    });
    it('phenobarbital neonatal indication has age cap (≤1 month)', () => {
      const r = call('phenobarbital|0', 12, 24); // 2-year old
      expect(r.value).toMatch(/Не назначать/i);
    });
  });

  // ─── mg/kg calculation accuracy ────────────────────────────────────
  describe('mg/kg calculation', () => {
    it('paracetamol 12 kg child → 180 mg', () => {
      const r = call('paracetamol|0', 12, 36);
      // 15 mg/kg × 12 = 180 mg (under max 1000)
      expect(r.value).toMatch(/180 мг/);
      expect(r.color).toBe('#22C55E');
    });
    it('ibuprofen 10 kg → 100 mg каждые 8 ч', () => {
      const r = call('ibuprofen|0', 10, 12);
      // 10 mg/kg × 10 = 100 mg
      expect(r.value).toMatch(/100 мг/);
      expect(r.value).toMatch(/каждые 8/);
    });
    it('amoxicillin ОСО 15 kg → 600 mg каждые 12 ч', () => {
      const r = call('amoxicillin|0', 15, 48);
      // 40 mg/kg × 15 = 600 mg, max 1500 not hit
      expect(r.value).toMatch(/600 мг/);
    });
    it('adrenaline IV 10 kg → 0.1 mg', () => {
      const r = call('epinephrine-cpr|0', 10, 60);
      // 0.01 × 10 = 0.1 mg
      expect(r.value).toMatch(/0\.1 мг/);
    });
    it('vancomycin 20 kg → 300 mg каждые 6 ч', () => {
      const r = call('vancomycin|0', 20, 60);
      // 15 × 20 = 300 mg, max 1000 not hit
      expect(r.value).toMatch(/300 мг/);
    });
  });

  // ─── Max-cap enforcement ───────────────────────────────────────────
  describe('max-dose capping for large children', () => {
    it('paracetamol 80 kg adolescent → capped at 1000 mg (not 1200)', () => {
      const r = call('paracetamol|0', 80, 192);
      // 15 × 80 = 1200, capped to 1000
      expect(r.value).toMatch(/1000 мг/);
      expect(r.color).toBe('#F59E0B'); // yellow = capped
      expect(r.actions).toBeDefined();
      expect(r.actions!.some((a) => /ограничена/i.test(a))).toBe(true);
    });
    it('amoxicillin ОСО 50 kg → capped at 1500 mg (not 2000)', () => {
      const r = call('amoxicillin|0', 50, 96);
      // 40 × 50 = 2000, capped to 1500
      expect(r.value).toMatch(/1500 мг/);
    });
    it('adrenaline IM 60 kg adolescent → capped at 0.5 mg (not 0.6)', () => {
      const r = call('epinephrine-im|0', 60, 168);
      // 0.01 × 60 = 0.6, capped to 0.5
      expect(r.value).toMatch(/0\.5 мг/);
    });
    it('vancomycin 100 kg → capped at 1000 mg per dose', () => {
      const r = call('vancomycin|0', 100, 200);
      // 15 × 100 = 1500, capped to 1000
      expect(r.value).toMatch(/1000 мг/);
    });
  });

  // ─── Frequency formatting ──────────────────────────────────────────
  describe('frequency formatting', () => {
    it('q24h displayed as "1 р/сут"', () => {
      const r = call('ceftriaxone|0', 20, 72);
      expect(r.value).toMatch(/1 р\/сут/);
    });
    it('q6h displayed as "каждые 6 ч"', () => {
      const r = call('vancomycin|0', 20, 60);
      expect(r.value).toMatch(/каждые 6 ч/);
    });
    it('once-only (frequency_hours=0) → "однократно"', () => {
      const r = call('dexamethasone|0', 12, 24); // croup
      expect(r.value).toMatch(/однократно/);
    });
    it('repeat per minutes (5 min for adrenaline) → minutes', () => {
      const r = call('epinephrine-im|0', 20, 60);
      // frequency_hours = 0.083 (5 min)
      expect(r.value).toMatch(/каждые 5 мин/);
    });
  });

  // ─── Result structure ──────────────────────────────────────────────
  describe('result structure (details, actions, caveats)', () => {
    it('details mention drug class and ATC', () => {
      const r = call('amoxicillin|0', 15, 48);
      expect(r.details).toMatch(/Аминопенициллин/);
      expect(r.details).toMatch(/J01CA04/);
    });
    it('details mention calculated and capped values', () => {
      const r = call('paracetamol|0', 80, 192);
      expect(r.details).toMatch(/15 мг\/кг × 80 кг/);
      expect(r.details).toMatch(/1200/);
      expect(r.details).toMatch(/Превышает/i);
    });
    it('caveats include BETA warning', () => {
      const r = call('paracetamol|0', 12, 36) as Result & { caveats?: string[] };
      expect(r.caveats).toBeDefined();
      expect(r.caveats!.some((c) => /BETA/i.test(c))).toBe(true);
    });
    it('vancomycin actions mention TDM', () => {
      const r = call('vancomycin|0', 20, 60);
      expect(r.actions).toBeDefined();
      expect(r.actions!.some((a) => /TDM/i.test(a))).toBe(true);
    });
    it('morphine actions mention naloxone readiness', () => {
      const r = call('morphine|0', 10, 36);
      expect(r.actions).toBeDefined();
      expect(r.actions!.some((a) => /налоксон/i.test(a))).toBe(true);
    });
  });

  // ─── Critical calculations (resuscitation) ──────────────────────────
  describe('resuscitation drugs — critical accuracy', () => {
    it('CPR adrenaline 10 kg infant → 0.1 mg every 5 min', () => {
      const r = call('epinephrine-cpr|0', 10, 12);
      expect(r.value).toMatch(/0\.1 мг/);
    });
    it('atropine bradycardia 5 kg → 0.1 mg (cap min)', () => {
      const r = call('atropine|0', 5, 12);
      // 0.02 × 5 = 0.1 mg (min effective dose)
      expect(r.value).toMatch(/0\.1 мг/);
    });
    it('naloxone OD 20 kg → 2 mg (cap)', () => {
      const r = call('naloxone|0', 20, 60);
      // 0.1 × 20 = 2 mg (at cap)
      expect(r.value).toMatch(/2 мг/);
    });
    it('dextrose 10% gypoglycaemia 5 kg → 1000 mg (= 10 mL of 10%)', () => {
      const r = call('dextrose-10|0', 5, 12);
      // 200 × 5 = 1000 mg
      expect(r.value).toMatch(/1000 мг/);
    });
    it('midazolam buccal 15 kg seizure → 4.5 mg', () => {
      const r = call('midazolam|0', 15, 36);
      // 0.3 × 15 = 4.5 mg
      expect(r.value).toMatch(/4\.5 мг/);
    });
    it('levetiracetam loading 15 kg → 900 mg', () => {
      const r = call('levetiracetam|0', 15, 36);
      // 60 × 15 = 900 mg
      expect(r.value).toMatch(/900 мг/);
    });
  });
});
