'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Printer } from '@/components/icons';

interface Drug {
  name: string;
  dosePerKg: number;
  unit: string;
  concentration: string;
  route: string;
  maxDose?: number;
  minDose?: number;
  notes?: string;
}

interface Equipment {
  name: string;
  formula: (weight: number) => string;
}

/** Applies a drug's max-dose ceiling and (if defined) min-dose floor to its per-kg dose. */
export function calculateDose(drug: Pick<Drug, 'dosePerKg' | 'maxDose' | 'minDose'>, weight: number): number {
  const rawDose = drug.dosePerKg * weight;
  const capped = drug.maxDose ? Math.min(rawDose, drug.maxDose) : rawDose;
  return drug.minDose ? Math.max(capped, drug.minDose) : capped;
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

/**
 * ETT sizing for infants <10 kg. The Cole age-based formula (age/4+4)
 * used above 10 kg is only validated from ~1 year onward — the previous
 * formula fed it a bogus "age" proxy of `weight/2` for lighter infants
 * (an 8 kg ~5-month-old was treated as "age 4"), producing an
 * oversized tube and a dangerously deep insertion depth for neonates.
 * Below 3 kg we use the NRP 8th ed. weight brackets (also used in
 * lib/runners/neo-ett.ts); from 3 kg to 10 kg we linearly bridge from
 * the NRP anchor to the Cole-formula value at 10 kg (≈1 yr) so the
 * two branches meet continuously instead of jumping at the seam.
 */
export function infantEttUncuffedMm(w: number): number {
  if (w < 1) return 2.5;
  if (w < 2) return 3.0;
  if (w < 3) return 3.5;
  const coleAt1yr = 1 / 4 + 4;
  return 3.5 + (coleAt1yr - 3.5) * ((w - 3) / 7);
}

export function infantEttDepthCm(w: number): number {
  if (w < 3) return w + 6; // NRP rule of thumb: weight (kg) + 6
  const nrpAt3kg = 3 + 6;
  const coleAt1yr = 1 / 2 + 12;
  return nrpAt3kg + (coleAt1yr - nrpAt3kg) * ((w - 3) / 7);
}

const EQUIPMENT: Equipment[] = [
  { name: 'ЭТТ (без манжетки)', formula: (w) => { if (w < 10) return `${infantEttUncuffedMm(w).toFixed(1)} мм`; const age = w < 20 ? (w - 8) / 2 : (w - 10) / 3; return `${Math.max(3, Math.min(Math.round((age / 4 + 4) * 10) / 10, 8)).toFixed(1)} мм`; } },
  { name: 'ЭТТ (с манжеткой)', formula: (w) => { if (w < 10) return `${Math.max(2.5, infantEttUncuffedMm(w) - 0.5).toFixed(1)} мм`; const age = w < 20 ? (w - 8) / 2 : (w - 10) / 3; return `${Math.max(3, Math.min(Math.round((age / 4 + 3.5) * 10) / 10, 7.5)).toFixed(1)} мм`; } },
  { name: 'Глубина ЭТТ (от губ)', formula: (w) => { if (w < 10) return `${Math.round(infantEttDepthCm(w))} см`; const age = w < 20 ? (w - 8) / 2 : (w - 10) / 3; return `${Math.max(9, Math.min(Math.round((age / 2 + 12) * 10) / 10, 23)).toFixed(0)} см`; } },
  { name: 'Ларингоскоп (клинок)', formula: (w) => { if (w < 4) return 'Miller 0'; if (w < 10) return 'Miller 1'; if (w < 20) return 'Miller/Mac 2'; if (w < 30) return 'Mac 2-3'; return 'Mac 3'; } },
  { name: 'IO игла', formula: (w) => { if (w < 4) return '15 мм (розовая)'; if (w < 40) return '15 мм (синяя)'; return '25 мм (жёлтая)'; } },
  { name: 'Мочевой катетер', formula: (w) => { if (w < 5) return '5-6 Fr'; if (w < 10) return '6-8 Fr'; if (w < 20) return '8-10 Fr'; if (w < 30) return '10-12 Fr'; return '12-14 Fr'; } },
  { name: 'НГ зонд', formula: (w) => { if (w < 4) return '5 Fr'; if (w < 10) return '8 Fr'; if (w < 20) return '10 Fr'; if (w < 30) return '12 Fr'; return '14-16 Fr'; } },
];

const thClass =
  'bg-[var(--md-sys-color-surface-container-high)] py-[var(--space-2)] px-[var(--space-3)] text-left font-[var(--font-body)] font-medium text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface)] border-b border-[color:var(--md-sys-color-outline-variant)]';

const tdClass =
  'py-[var(--space-2)] px-[var(--space-3)] text-[length:var(--text-xs)] font-[var(--font-body)] border-b border-[color:var(--md-sys-color-outline-variant)] text-[color:var(--md-sys-color-on-surface-variant)]';

export default function PediatricCalculator() {
  const [weight, setWeight] = useState(10);

  const calculations = useMemo(() => {
    return DRUGS.map((drug) => {
      const rawDose = drug.dosePerKg * weight;
      const dose = calculateDose(drug, weight);
      const isMax = drug.maxDose !== undefined && rawDose >= drug.maxDose;
      const isMin = drug.minDose !== undefined && rawDose < drug.minDose;
      let volume = '';
      const concMatch = drug.concentration.match(/([\d.]+)\s*мг\/мл/);
      if (concMatch && concMatch[1]) volume = `${(dose / parseFloat(concMatch[1])).toFixed(2)} мл`;
      return { ...drug, calculatedDose: dose, isMaxed: isMax, isMinned: isMin, volume };
    });
  }, [weight]);

  const equipmentSizes = useMemo(() => EQUIPMENT.map((eq) => ({ name: eq.name, size: eq.formula(weight) })), [weight]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[var(--container-max)]">
      {/* Weight slider */}
      <div className="p-[var(--space-4)] bg-[var(--md-sys-color-surface-container)] rounded-[var(--md-sys-shape-corner-medium)] mb-[var(--space-6)]">
        <h3 className="font-[var(--font-display)] text-[length:var(--text-sm)] font-medium text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-3)]">Вес ребёнка (кг)</h3>
        <div className="flex items-center gap-[var(--space-4)]">
          <input
            type="range" min={1} max={50} step={0.5} value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="flex-1 accent-[color:var(--md-sys-color-primary)]"
          />
          <input
            type="number" min={1} max={100} step={0.5} value={weight}
            onChange={(e) => setWeight(Math.max(1, Math.min(100, parseFloat(e.target.value) || 1)))}
            className="w-16 bg-[var(--md-sys-color-surface-container-high)] border border-[color:var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-small)] py-[var(--space-1)] px-[var(--space-2)] font-[var(--font-mono)] text-[length:var(--text-sm)] text-[color:var(--md-sys-color-on-surface)] text-center outline-none"
          />
          <span className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)]">кг</span>
        </div>
        <div className="flex gap-[var(--space-2)] mt-[var(--space-2)]">
          {[3, 5, 10, 15, 20, 25, 30].map((w) => (
            <button
              key={w}
              onClick={() => setWeight(w)}
              className={`py-0.5 px-[var(--space-2)] font-[var(--font-mono)] text-[0.625rem] rounded-[var(--md-sys-shape-corner-extra-small)] border-none cursor-pointer transition-colors duration-[var(--md-sys-motion-duration-short4)] [transition-timing-function:var(--md-sys-motion-easing-standard)] ${
                weight === w
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[color:var(--md-sys-color-on-primary-container)]'
                  : 'bg-[var(--md-sys-color-surface-container-high)] text-[color:var(--md-sys-color-on-surface-variant)]'
              }`}
            >{w}</button>
          ))}
        </div>
      </div>

      {/* Drug table */}
      <div className="mb-[var(--space-6)]">
        <h3 className="font-[var(--font-display)] text-[length:var(--text-sm)] font-medium text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-3)]">Дозировки препаратов</h3>
        <div className="overflow-x-auto rounded-[var(--md-sys-shape-corner-medium)] border border-[color:var(--md-sys-color-outline-variant)]">
          <table className="w-full border-collapse">
            <thead><tr>
              <th className={thClass}>Препарат</th>
              <th className={thClass}>Доза</th>
              <th className={thClass}>Объём</th>
              <th className={thClass}>Путь</th>
              <th className={thClass}>Примечание</th>
            </tr></thead>
            <tbody>
              {calculations.map((drug, i) => (
                <tr key={drug.name} className={i % 2 === 0 ? 'bg-[var(--md-sys-color-surface)]' : 'bg-[var(--md-sys-color-surface-container-low)]'}>
                  <td className={`${tdClass} font-medium text-[color:var(--md-sys-color-on-surface)]`}>{drug.name}</td>
                  <td className={`${tdClass} font-[var(--font-mono)]`}>
                    {drug.calculatedDose.toFixed(2)} {drug.unit}
                    {drug.isMaxed && <span className="ml-[var(--space-1)] text-[0.5625rem] text-[color:var(--md-sys-color-error)]">(MAX)</span>}
                    {drug.isMinned && <span className="ml-[var(--space-1)] text-[0.5625rem] text-[color:var(--md-sys-color-error)]">(MIN)</span>}
                  </td>
                  <td className={`${tdClass} font-[var(--font-mono)] text-[color:var(--md-sys-color-secondary)]`}>{drug.volume || '-'}</td>
                  <td className={tdClass}>{drug.route}</td>
                  <td className={tdClass}>{drug.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment table */}
      <div className="mb-[var(--space-6)]">
        <h3 className="font-[var(--font-display)] text-[length:var(--text-sm)] font-medium text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-3)]">Размеры оборудования</h3>
        <div className="overflow-x-auto rounded-[var(--md-sys-shape-corner-medium)] border border-[color:var(--md-sys-color-outline-variant)]">
          <table className="w-full border-collapse">
            <thead><tr>
              <th className={thClass}>Оборудование</th>
              <th className={thClass}>Размер</th>
            </tr></thead>
            <tbody>
              {equipmentSizes.map((eq, i) => (
                <tr key={eq.name} className={i % 2 === 0 ? 'bg-[var(--md-sys-color-surface)]' : 'bg-[var(--md-sys-color-surface-container-low)]'}>
                  <td className={`${tdClass} font-medium text-[color:var(--md-sys-color-on-surface)]`}>{eq.name}</td>
                  <td className={`${tdClass} font-[var(--font-mono)] text-[color:var(--md-sys-color-tertiary)]`}>{eq.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print */}
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-[var(--space-2)] px-[var(--space-6)] h-10 rounded-[var(--md-sys-shape-corner-full)] bg-transparent hover:bg-[color-mix(in_srgb,var(--md-sys-color-primary)_8%,transparent)] border border-[color:var(--md-sys-color-outline)] text-[color:var(--md-sys-color-primary)] font-[var(--font-body)] text-[length:var(--text-sm)] font-medium cursor-pointer transition-colors duration-[var(--md-sys-motion-duration-short4)] [transition-timing-function:var(--md-sys-motion-easing-standard)]"
      >
        <Printer size={18} />
        Печать таблицы
      </button>
    </motion.div>
  );
}
