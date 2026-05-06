/**
 * Golden tests for Renal Dose Adjustment calculator (K2 MVP, 15 drugs).
 *
 * Reference: data/renal-dosing.json — KDIGO 2024 + EHRA 2021 + FDA + ГРЛС РФ.
 * Verifies that for each drug, key eGFR/CrCl boundaries pick the correct stage.
 */
import { describe, it, expect } from 'vitest';
import renalDose from '@/lib/runners/renal-dose';

interface Result {
  value: string;
  interpretation: string;
  color: string;
  details?: string;
}

function call(drug: string, age: number, weight: number, creatinineUmol: number, female: boolean): Result {
  return (renalDose.compute as unknown as (v: {
    drug: string; age: number; weight: number; creatinine: number; female: boolean;
  }) => unknown)({
    drug, age, weight, creatinine: creatinineUmol, female,
  }) as Result;
}

describe('renal-dose · MVP-15 drugs', () => {
  // ─── P0 guard tests ─────────────────────────────────────────────────
  describe('P0 guard: invalid inputs return N/A', () => {
    it('creatinine = 0 → N/A', () => {
      const r = call('apixaban', 50, 70, 0, false);
      expect(r.value).toBe('N/A');
      expect(r.interpretation).toMatch(/корректные/i);
    });
    it('creatinine < 0 → N/A', () => {
      const r = call('metformin', 50, 70, -5, false);
      expect(r.value).toBe('N/A');
    });
    it('age = 0 → N/A', () => {
      const r = call('vancomycin', 0, 70, 90, false);
      expect(r.value).toBe('N/A');
    });
    it('weight = 0 → N/A', () => {
      const r = call('digoxin', 50, 0, 90, false);
      expect(r.value).toBe('N/A');
    });
    it('unknown drug ID → N/A', () => {
      const r = call('not-a-real-drug', 50, 70, 90, false);
      expect(r.value).toBe('N/A');
      expect(r.interpretation).toMatch(/Выберите препарат/i);
    });
  });

  // ─── Apixaban (DOAC, uses CrCl) ─────────────────────────────────────
  describe('apixaban — uses Cockcroft-Gault CrCl', () => {
    it('young healthy → standard dose', () => {
      const r = call('apixaban', 30, 80, 88, false);
      expect(r.value).toMatch(/5 мг 2 р\/сут/);
    });
    it('CrCl 25-49 → 5 мг (with possible 2.5 reduction)', () => {
      const r = call('apixaban', 75, 65, 200, true);
      // CrCl ≈ (140-75)*65*0.85 / (72 * 200/88.4) = 21.9 — should be G4 stage
      expect(r.value).toMatch(/2\.5/);
    });
    it('CrCl <15 → avoid', () => {
      const r = call('apixaban', 80, 60, 800, true);
      expect(r.value).toMatch(/Избегать/i);
    });
  });

  // ─── Metformin (uses eGFR, contraindicated <30) ─────────────────────
  describe('metformin — uses eGFR, contraindicated below G4', () => {
    it('eGFR ≥60 → standard dose', () => {
      const r = call('metformin', 50, 70, 90, false);
      expect(r.value).toMatch(/500-2550/);
    });
    it('eGFR <30 → contraindicated', () => {
      const r = call('metformin', 70, 65, 350, true);
      expect(r.value).toMatch(/Противопоказан/i);
      expect(r.color).toBe('#EF4444');
    });
  });

  // ─── Vancomycin (uses CrCl, dose by interval) ──────────────────────
  describe('vancomycin — interval extends with CKD', () => {
    it('normal renal fn → q8-12h', () => {
      const r = call('vancomycin', 30, 70, 80, false);
      expect(r.value).toMatch(/8-12 ч/);
    });
    it('severe CKD (CrCl <20) → loading + TDM', () => {
      const r = call('vancomycin', 70, 60, 600, true);
      expect(r.value).toMatch(/Нагрузка/i);
    });
  });

  // ─── Morphine (eGFR, avoid G4-G5) ──────────────────────────────────
  describe('morphine — avoid in G4-G5 (M6G accumulation)', () => {
    it('normal → standard', () => {
      const r = call('morphine', 40, 70, 80, false);
      expect(r.value).toMatch(/5-10 мг|10-30 мг/);
    });
    it('eGFR <30 → avoid', () => {
      const r = call('morphine', 70, 60, 400, true);
      expect(r.value).toMatch(/Избегать/i);
    });
  });

  // ─── Digoxin (uses CrCl, narrow therapeutic) ────────────────────────
  describe('digoxin — narrow therapeutic window', () => {
    it('eGFR ≥60 → standard 0.125-0.25', () => {
      const r = call('digoxin', 40, 70, 80, false);
      expect(r.value).toMatch(/0\.125-0\.25/);
    });
    it('eGFR <30 → tiny dose every other day', () => {
      const r = call('digoxin', 75, 65, 400, true);
      expect(r.value).toMatch(/0\.0625|через день/);
    });
  });

  // ─── Lithium (avoid <30, narrow window) ────────────────────────────
  describe('lithium — avoid in G4-G5 (cumulation)', () => {
    it('normal → standard 600-900', () => {
      const r = call('lithium', 30, 70, 80, false);
      expect(r.value).toMatch(/600-900/);
    });
    it('severe CKD → avoid', () => {
      const r = call('lithium', 65, 60, 350, true);
      expect(r.value).toMatch(/Избегать/i);
    });
  });

  // ─── New drugs in v0.2.0 (15 → 30) ──────────────────────────────────
  describe('v0.2.0 expansion — antibiotics + cardio + opioids + others', () => {
    it('gentamicin (aminoglycoside, CrCl) — once-daily standard at normal renal fn', () => {
      const r = call('gentamicin', 30, 70, 80, false);
      expect(r.value).toMatch(/Once-daily|5-7 мг\/кг/);
    });
    it('gentamicin — extended interval at G3b-G4', () => {
      // CrCl ≈ 24 (female 65 y, 75 kg, creat 250) → 20-39 band
      const r = call('gentamicin', 65, 75, 250, true);
      expect(r.value).toMatch(/36-48 ч|extended/i);
    });
    it('amikacin — TDM-based dosing at G5', () => {
      const r = call('amikacin', 75, 60, 800, true);
      expect(r.value).toMatch(/после диализа|по уровням/i);
    });
    it('meropenem — interval extends with CKD', () => {
      const r = call('meropenem', 40, 70, 80, false);
      expect(r.value).toMatch(/каждые 8 ч/);
    });
    it('cotrimoxazole — avoid below G5 (hyperkalemia)', () => {
      const r = call('cotrimoxazole', 75, 60, 600, true);
      expect(r.value).toMatch(/не рекомендуется|альтернатива/i);
    });
    it('nitrofurantoin — contraindicated at G4-G5', () => {
      const r = call('nitrofurantoin', 70, 65, 350, true);
      expect(r.value).toMatch(/Противопоказан/i);
    });
    it('bisoprolol — minimal renal adjustment (lipophilic)', () => {
      const r = call('bisoprolol', 70, 70, 200, false);
      expect(r.value).toMatch(/10 мг|осторожн/i);
    });
    it('losartan — caution in G4', () => {
      const r = call('losartan', 75, 65, 350, true);
      // CKD-EPI for that combo gives ~12 → G5 stage
      expect(r.value).toMatch(/осторожн|альтерн/i);
    });
    it('spironolactone — avoid in G4-G5 (hyperkalemia)', () => {
      const r = call('spironolactone', 70, 65, 400, true);
      expect(r.value).toMatch(/Избегать/i);
    });
    it('furosemide — high doses in G4-G5', () => {
      const r = call('furosemide', 70, 70, 350, false);
      expect(r.value).toMatch(/Высокие|160-240|инфузия/i);
    });
    it('oxycodone — preferred over morphine in CKD', () => {
      const r = call('oxycodone', 70, 65, 250, true);
      expect(r.value).toMatch(/Снизить|50%/i);
    });
    it('tramadol — extended interval below G3b', () => {
      const r = call('tramadol', 70, 65, 350, true);
      expect(r.value).toMatch(/каждые 12|200 мг/);
    });
    it('fentanyl — preferred opioid in G4-G5', () => {
      const r = call('fentanyl', 75, 60, 600, true);
      // Fentanyl has 7% renal excretion — safer at all CKD stages
      const text = `${r.value} ${r.color}`;
      expect(text).toMatch(/мкг|Снизить/i);
    });
    it('methotrexate — contraindicated at G4-G5 (myelosuppression)', () => {
      const r = call('methotrexate', 70, 65, 400, true);
      expect(r.value).toMatch(/Противопоказан/i);
    });
    it('pregabalin — drastic dose reduction (98% renal)', () => {
      const r = call('pregabalin', 75, 60, 800, true);
      expect(r.value).toMatch(/25-75 мг/);
    });
    it('acyclovir — interval extension at G4', () => {
      const r = call('acyclovir', 70, 65, 250, true);
      expect(r.value).toMatch(/q12-q24|удлин/i);
    });
  });

  // ─── Result structure ──────────────────────────────────────────────
  describe('result includes details, scale, sources', () => {
    it('details mention both eGFR and CrCl', () => {
      const r = call('apixaban', 50, 70, 100, false);
      expect(r.details).toMatch(/CKD-EPI/);
      expect(r.details).toMatch(/Cockcroft-Gault/);
    });
    it('result has BETA caveat for verified_by:null', () => {
      const r = call('metformin', 50, 70, 100, false) as Result & { caveats?: string[] };
      expect(r.caveats).toBeDefined();
      expect(r.caveats!.some((c) => /BETA/i.test(c))).toBe(true);
    });
  });
});
