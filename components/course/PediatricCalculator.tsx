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
  notes?: string;
}

interface Equipment {
  name: string;
  formula: (weight: number) => string;
}

const DRUGS: Drug[] = [
  { name: 'Адреналин (Epinephrine)', dosePerKg: 0.01, unit: 'мг', concentration: '1:10000 (0.1 мг/мл)', route: 'В/В, ВК', maxDose: 1, notes: 'Каждые 3-5 мин' },
  { name: 'Атропин', dosePerKg: 0.02, unit: 'мг', concentration: '0.1 мг/мл', route: 'В/В', maxDose: 0.5, notes: 'Мин. доза 0.1 мг' },
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

const EQUIPMENT: Equipment[] = [
  { name: 'ЭТТ (без манжетки)', formula: (w) => { const age = w < 10 ? w / 2 : w < 20 ? (w - 8) / 2 : (w - 10) / 3; return `${Math.max(3, Math.min(Math.round((age / 4 + 4) * 10) / 10, 8)).toFixed(1)} мм`; } },
  { name: 'ЭТТ (с манжеткой)', formula: (w) => { const age = w < 10 ? w / 2 : w < 20 ? (w - 8) / 2 : (w - 10) / 3; return `${Math.max(3, Math.min(Math.round((age / 4 + 3.5) * 10) / 10, 7.5)).toFixed(1)} мм`; } },
  { name: 'Глубина ЭТТ (от губ)', formula: (w) => { const age = w < 10 ? w / 2 : w < 20 ? (w - 8) / 2 : (w - 10) / 3; return `${Math.max(9, Math.min(Math.round((age / 2 + 12) * 10) / 10, 23)).toFixed(0)} см`; } },
  { name: 'Ларингоскоп (клинок)', formula: (w) => { if (w < 4) return 'Miller 0'; if (w < 10) return 'Miller 1'; if (w < 20) return 'Miller/Mac 2'; if (w < 30) return 'Mac 2-3'; return 'Mac 3'; } },
  { name: 'IO игла', formula: (w) => { if (w < 4) return '15 мм (розовая)'; if (w < 40) return '15 мм (синяя)'; return '25 мм (жёлтая)'; } },
  { name: 'Мочевой катетер', formula: (w) => { if (w < 5) return '5-6 Fr'; if (w < 10) return '6-8 Fr'; if (w < 20) return '8-10 Fr'; if (w < 30) return '10-12 Fr'; return '12-14 Fr'; } },
  { name: 'НГ зонд', formula: (w) => { if (w < 4) return '5 Fr'; if (w < 10) return '8 Fr'; if (w < 20) return '10 Fr'; if (w < 30) return '12 Fr'; return '14-16 Fr'; } },
];

const thStyle: React.CSSProperties = {
  background: 'var(--md-sys-color-surface-container-high)',
  padding: 'var(--space-2) var(--space-3)',
  textAlign: 'left',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: 'var(--text-xs)',
  color: 'var(--md-sys-color-on-surface)',
  borderBottom: '1px solid var(--md-sys-color-outline-variant)',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-body)',
  borderBottom: '1px solid var(--md-sys-color-outline-variant)',
  color: 'var(--md-sys-color-on-surface-variant)',
};

export default function PediatricCalculator() {
  const [weight, setWeight] = useState(10);

  const calculations = useMemo(() => {
    return DRUGS.map((drug) => {
      const rawDose = drug.dosePerKg * weight;
      const dose = drug.maxDose ? Math.min(rawDose, drug.maxDose) : rawDose;
      const isMax = drug.maxDose !== undefined && rawDose >= drug.maxDose;
      let volume = '';
      const concMatch = drug.concentration.match(/([\d.]+)\s*мг\/мл/);
      if (concMatch && concMatch[1]) volume = `${(dose / parseFloat(concMatch[1])).toFixed(2)} мл`;
      return { ...drug, calculatedDose: dose, isMaxed: isMax, volume };
    });
  }, [weight]);

  const equipmentSizes = useMemo(() => EQUIPMENT.map((eq) => ({ name: eq.name, size: eq.formula(weight) })), [weight]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 'var(--container-max)' }}>
      {/* Weight slider */}
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--md-sys-color-surface-container)',
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        marginBottom: 'var(--space-6)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-3)',
        }}>Вес ребёнка (кг)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <input
            type="range" min={1} max={50} step={0.5} value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--md-sys-color-primary)' }}
          />
          <input
            type="number" min={1} max={100} step={0.5} value={weight}
            onChange={(e) => setWeight(Math.max(1, Math.min(100, parseFloat(e.target.value) || 1)))}
            style={{
              width: 64,
              background: 'var(--md-sys-color-surface-container-high)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              borderRadius: 'var(--md-sys-shape-corner-small)',
              padding: 'var(--space-1) var(--space-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--md-sys-color-on-surface)',
              textAlign: 'center',
              outline: 'none',
            }}
          />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)' }}>кг</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {[3, 5, 10, 15, 20, 25, 30].map((w) => (
            <button key={w} onClick={() => setWeight(w)} style={{
              padding: '2px var(--space-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              borderRadius: 'var(--md-sys-shape-corner-extra-small)',
              background: weight === w ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-high)',
              color: weight === w ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
              border: 'none',
              cursor: 'pointer',
              transition: `background var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)`,
            }}>{w}</button>
          ))}
        </div>
      </div>

      {/* Drug table */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-3)' }}>Дозировки препаратов</h3>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--md-sys-shape-corner-medium)', border: '1px solid var(--md-sys-color-outline-variant)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={thStyle}>Препарат</th>
              <th style={thStyle}>Доза</th>
              <th style={thStyle}>Объём</th>
              <th style={thStyle}>Путь</th>
              <th style={thStyle}>Примечание</th>
            </tr></thead>
            <tbody>
              {calculations.map((drug, i) => (
                <tr key={drug.name} style={{ background: i % 2 === 0 ? 'var(--md-sys-color-surface)' : 'var(--md-sys-color-surface-container-low)' }}>
                  <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{drug.name}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>
                    {drug.calculatedDose.toFixed(2)} {drug.unit}
                    {drug.isMaxed && <span style={{ marginLeft: 'var(--space-1)', fontSize: '0.5625rem', color: 'var(--md-sys-color-error)' }}>(MAX)</span>}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--md-sys-color-secondary)' }}>{drug.volume || '-'}</td>
                  <td style={tdStyle}>{drug.route}</td>
                  <td style={tdStyle}>{drug.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment table */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-3)' }}>Размеры оборудования</h3>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--md-sys-shape-corner-medium)', border: '1px solid var(--md-sys-color-outline-variant)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={thStyle}>Оборудование</th>
              <th style={thStyle}>Размер</th>
            </tr></thead>
            <tbody>
              {equipmentSizes.map((eq, i) => (
                <tr key={eq.name} style={{ background: i % 2 === 0 ? 'var(--md-sys-color-surface)' : 'var(--md-sys-color-surface-container-low)' }}>
                  <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{eq.name}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: 'var(--md-sys-color-tertiary)' }}>{eq.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print */}
      <button onClick={() => window.print()} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '0 var(--space-6)',
        height: 40,
        borderRadius: 'var(--md-sys-shape-corner-full)',
        background: 'transparent',
        border: '1px solid var(--md-sys-color-outline)',
        color: 'var(--md-sys-color-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: `background var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)`,
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent)`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Printer size={18} />
        Печать таблицы
      </button>
    </motion.div>
  );
}
