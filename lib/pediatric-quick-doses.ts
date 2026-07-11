/**
 * Data + pure dose math for the resuscitation quick-reference table shown
 * in components/course/PediatricCalculator.tsx. Extracted so the min/max
 * dose clamping is unit-testable without rendering the component (this
 * project's test runner only executes tests/**\/*.test.ts under vitest's
 * node environment, mirroring the pattern in lib/neo-context-seed.ts).
 */
export interface Drug {
  name: string;
  dosePerKg: number;
  unit: string;
  concentration: string;
  route: string;
  maxDose?: number;
  minDose?: number;
  notes?: string;
}

export const DRUGS: Drug[] = [
  { name: 'Адреналин (Epinephrine)', dosePerKg: 0.01, unit: 'мг', concentration: '1:10000 (0.1 мг/мл)', route: 'В/В, ВК', maxDose: 1, notes: 'Каждые 3-5 мин' },
  { name: 'Атропин', dosePerKg: 0.02, unit: 'мг', concentration: '0.1 мг/мл', route: 'В/В', maxDose: 0.5, minDose: 0.1, notes: 'Мин. доза 0.1 мг' },
  { name: 'Амиодарон', dosePerKg: 5, unit: 'мг', concentration: '50 мг/мл', route: 'В/В', maxDose: 300, notes: 'При VF/pVT' },
  { name: 'Транексамовая к-та (TXA)', dosePerKg: 15, unit: 'мг', concentration: '100 мг/мл', route: 'В/В', maxDose: 1000, notes: 'За 10 мин' },
  { name: 'Кетамин', dosePerKg: 1.5, unit: 'мг', concentration: '50 мг/мл', route: 'В/В', notes: 'Анальгезия/седация' },
  { name: 'Морфин', dosePerKg: 0.1, unit: 'мг', concentration: '10 мг/мл', route: 'В/В', maxDose: 5, notes: 'Титровать по эффекту' },
  { name: 'Мидазолам', dosePerKg: 0.1, unit: 'мг', concentration: '5 мг/мл', route: 'В/В, ИН', maxDose: 5, notes: 'ИН доза: 0.2 мг/кг' },
  { name: 'Налоксон', dosePerKg: 0.1, unit: 'мг', concentration: '0.4 мг/мл', route: 'В/В, ВМ, ИН', maxDose: 2, notes: 'При передозировке опиоидов' },
  { name: 'Дексаметазон', dosePerKg: 0.15, unit: 'мг', concentration: '4 мг/мл', route: 'В/В', maxDose: 10, notes: 'Круп, отёк мозга' },
  { name: 'Гидрокортизон', dosePerKg: 2, unit: 'мг', concentration: '50 мг/мл', route: 'В/В', maxDose: 100, notes: 'Надпочечниковая недостаточность' },
  { name: 'Глюкоза 10%', dosePerKg: 5, unit: 'мл', concentration: '10% (0.1 г/мл)', route: 'В/В', notes: '= 0.5 г/кг глюкозы' },
  { name: 'NaCl 0.9% болюс', dosePerKg: 20, unit: 'мл', concentration: '0.9%', route: 'В/В', notes: 'За 5-20 мин, до 3x' },
  { name: 'Допамин инфузия', dosePerKg: 10, unit: 'мкг/кг/мин', concentration: 'титровать', route: 'В/В', notes: '2-20 мкг/кг/мин' },
  { name: 'Норэпинефрин инфузия', dosePerKg: 0.1, unit: 'мкг/кг/мин', concentration: 'титровать', route: 'В/В', notes: '0.05-2 мкг/кг/мин' },
  { name: 'Фуросемид', dosePerKg: 1, unit: 'мг', concentration: '10 мг/мл', route: 'В/В', maxDose: 40, notes: 'Медленно' },
];

export interface CalculatedDrug extends Drug {
  calculatedDose: number;
  isMaxed: boolean;
  isMinned: boolean;
  volume: string;
}

/**
 * Apply dosePerKg × weight, then floor to `minDose` (documented minimum
 * effective dose) before capping to `maxDose`. Without the floor, a
 * clinically-documented minimum (e.g. Atropine 0.1 mg) was pure display
 * text - a light child's raw mg/kg dose could fall below it silently.
 */
export function calculateDrugDose(drug: Drug, weight: number): CalculatedDrug {
  const rawDose = drug.dosePerKg * weight;
  const isMinned = drug.minDose !== undefined && rawDose < drug.minDose;
  const flooredDose = isMinned ? (drug.minDose as number) : rawDose;
  const dose = drug.maxDose !== undefined ? Math.min(flooredDose, drug.maxDose) : flooredDose;
  const isMaxed = drug.maxDose !== undefined && rawDose >= drug.maxDose;
  let volume = '';
  const concMatch = drug.concentration.match(/([\d.]+)\s*мг\/мл/);
  if (concMatch && concMatch[1]) volume = `${(dose / parseFloat(concMatch[1])).toFixed(2)} мл`;
  return { ...drug, calculatedDose: dose, isMaxed, isMinned, volume };
}
