/**
 * Runner: neo-abg — Neonatal Acid-Base / ABG Interpretation
 *
 * NEONATOLOGY MODULE A40 (P1).
 *
 * Интерпретация артериальных газов крови у новорождённого:
 *   - pH (норма 7.30-7.45)
 *   - PaCO₂ (норма 35-45 мм рт ст)
 *   - HCO₃⁻ (норма 18-24 ммоль/л)
 *   - BE (норма ±5 ммоль/л)
 *   - Anion gap (норма 8-16 ммоль/л)
 *
 * Алгоритм:
 *   1. Оценка pH: < 7.30 → ацидоз; > 7.45 → алкалоз
 *   2. Доминирующий: ↑PaCO₂ → респираторный, ↓HCO₃ → метаболический
 *   3. Компенсация: ожидаемый PaCO₂ или HCO₃ vs реальный
 *   4. Anion gap (если метаболический ацидоз): high vs normal
 *
 * Anion gap = Na − (Cl + HCO₃)
 *   - Норма: 8-16 ммоль/л
 *   - High AG: lactate, ketones, renal, toxins (МКБ MUDPILES адаптировано)
 *   - Normal AG: diarrhea, RTA, dilution
 *
 * SOURCES:
 *   - Tin W. Adv Neonatal Care 2017 — Neonatal acid-base
 *   - Avery's Diseases of the Newborn 11th ed.
 *   - КР МЗ РФ "Кислотно-щелочное состояние н/р" (2024)
 *   - NICUtools — ABG calculator
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный · РФ',
  reference: 'Tin W. Adv Neonatal Care 2017. Avery 11th ed. КР МЗ РФ КЩС (2024).',
  inputs: [
    {
      id: 'ph',
      label: 'pH',
      type: 'number',
      min: 6.8,
      max: 7.8,
      step: 0.01,
    },
    {
      id: 'paco2',
      label: 'PaCO₂ (мм рт ст)',
      type: 'number',
      min: 10,
      max: 100,
      step: 1,
    },
    {
      id: 'hco3',
      label: 'HCO₃⁻ (ммоль/л)',
      type: 'number',
      min: 5,
      max: 40,
      step: 0.1,
    },
    {
      id: 'be',
      label: 'BE / SBE (ммоль/л)',
      type: 'number',
      min: -30,
      max: 30,
      step: 0.1,
    },
    {
      id: 'na',
      label: 'Na⁺ (ммоль/л, опционально для AG)',
      type: 'number',
      min: 100,
      max: 180,
      step: 1,
    },
    {
      id: 'cl',
      label: 'Cl⁻ (ммоль/л, опционально для AG)',
      type: 'number',
      min: 70,
      max: 130,
      step: 1,
    },
  ],
  compute(values): CalculatorResult {
    const ph = Number(values.ph ?? 0);
    const paco2 = Number(values.paco2 ?? 0);
    const hco3 = Number(values.hco3 ?? 0);
    const be = Number(values.be ?? 0);
    const na = Number(values.na ?? 0);
    const cl = Number(values.cl ?? 0);

    if (ph <= 0 || paco2 <= 0 || hco3 <= 0) {
      return {
        value: '—',
        interpretation: 'Введите pH, PaCO₂ и HCO₃⁻',
        color: '#9CA3AF',
        details: 'Минимум pH + PaCO₂ + HCO₃⁻ для интерпретации.',
      };
    }

    // Primary disorder
    let primary = '';
    let color = '#22C55E';
    const actions: string[] = [];

    const isAcidemia = ph < 7.30;
    const isAlkalemia = ph > 7.45;
    const highCO2 = paco2 > 45;
    const lowCO2 = paco2 < 35;
    const lowHCO3 = hco3 < 18;
    const highHCO3 = hco3 > 24;

    if (isAcidemia) {
      color = '#EF4444';
      if (highCO2 && lowHCO3) {
        primary = 'Смешанный ацидоз (респ + мет)';
      } else if (highCO2) {
        primary = 'Респираторный ацидоз';
      } else if (lowHCO3) {
        primary = 'Метаболический ацидоз';
      } else {
        primary = 'Ацидемия (механизм неочевиден)';
      }
    } else if (isAlkalemia) {
      color = '#3B82F6';
      if (lowCO2 && highHCO3) {
        primary = 'Смешанный алкалоз';
      } else if (lowCO2) {
        primary = 'Респираторный алкалоз';
      } else if (highHCO3) {
        primary = 'Метаболический алкалоз';
      } else {
        primary = 'Алкалемия';
      }
    } else {
      primary = 'pH в норме';
      color = '#22C55E';
    }

    // Anion gap if Na + Cl provided
    let agText = '';
    if (na > 0 && cl > 0) {
      const ag = na - (cl + hco3);
      if (ag > 16) {
        agText = ` · AG ${ag.toFixed(0)} (повышен — lactate / ketones / renal / toxins)`;
      } else if (ag < 8) {
        agText = ` · AG ${ag.toFixed(0)} (низкий — гипоальбуминемия?)`;
      } else {
        agText = ` · AG ${ag.toFixed(0)} (норма)`;
      }
    }

    // Recommendations by primary
    if (primary.includes('Респираторный ацидоз')) {
      actions.push('↑ PEEP / ↑ RR / ↑ tidal volume — улучшить ventilation');
      actions.push('Проверить ETT position, секреция, утечка');
      actions.push('Седация / synchrony optimization');
      actions.push('При HFOV — проверить amplitude, frequency');
    } else if (primary.includes('Метаболический ацидоз')) {
      actions.push('Проверить лактат, гликемию, перфузию');
      actions.push('Differential: sepsis / shock / NEC / IEM / asphyxia');
      actions.push('Volume expansion (NS 10-20 мл/кг) если perfusion poor');
      actions.push('NaHCO₃ ТОЛЬКО при pH < 7.20 + неэффективной ventilation; 1-2 мэкв/кг slow');
      actions.push('Лечить причину; не корригировать BE как самоцель');
    } else if (primary.includes('Респираторный алкалоз')) {
      actions.push('↓ RR / ↓ ventilation если на ИВЛ');
      actions.push('Проверить sepsis (early — гипервентиляция)');
      actions.push('Боль / ажитация — седация');
    } else if (primary.includes('Метаболический алкалоз')) {
      actions.push('Differential: NG losses, diuretics, hypochloraemia');
      actions.push('KCl и/или NaCl коррекция');
      actions.push('Не использовать ацетат / лактат in IV fluid');
    } else if (primary.includes('Смешанный')) {
      actions.push('Сложный disorder — обсудить с senior');
      actions.push('Лечить обе компоненты параллельно');
      actions.push('Частый мониторинг ABG (q1-2h до stable)');
    }

    return {
      value: primary,
      interpretation: primary,
      color,
      details: `pH ${ph.toFixed(2)} · PaCO₂ ${paco2.toFixed(0)} · HCO₃ ${hco3.toFixed(1)} · BE ${be.toFixed(1)}${agText}`,
      actions,
    };
  },
  caveats: [
    'Капиллярная кровь — подходит для тренда, но pH/CO₂ занижены ~0.05 / +5 мм рт ст vs артериальная',
    'У новорождённых pH 7.25-7.35 — допустимый «physiologic»; agressive correction редко нужна',
    'Permissive hypercapnia (PaCO₂ 45-55, pH ≥ 7.25) — стратегия снижения вентилятор-индуцированной травмы лёгких',
    'NaHCO₃ controversial; не использовать рутинно при метаболическом ацидозе (увеличивает CO₂, Na load, intracellular acidosis)',
    'Anion gap norm у новорождённого 8-16; альбумин корректируется (low albumin → AG занижен)',
  ],
  related: [
    { id: 'neo-resp-indices', title: 'Респ. индексы (OI)' },
    { id: 'aa-gradient', title: 'A-a Gradient' },
    { id: 'neo-fluid', title: 'Жидкость н/р' },
  ],
  info: `### Acid-base interpretation у новорождённого

Систематическая интерпретация артериальных газов крови.

### Норма

| Параметр | Артериальная | Капиллярная |
|---|---|---|
| pH | 7.30-7.45 | 7.25-7.40 |
| PaCO₂ | 35-45 | +5 мм рт ст |
| PaO₂ | 50-80 | (не репрезентативна) |
| HCO₃⁻ | 18-24 | 18-24 |
| BE / SBE | ±5 | ±5 |
| Anion gap | 8-16 | 8-16 |

### Алгоритм 4 шагов

1. **pH:** < 7.30 → ацидоз / > 7.45 → алкалоз
2. **Доминирующий:** ↑CO₂ → респираторный / ↓HCO₃ → метаболический
3. **Компенсация:** ожидаемый PaCO₂ или HCO₃ vs реальный
4. **Anion gap** (если мет ацидоз): high vs normal

### Метаболический ацидоз: high AG vs normal AG

| High AG | Normal AG (hyperchloremic) |
|---|---|
| Lactate (sepsis, hypoxia) | Diarrhea |
| Ketones (DKA редко у н/р) | Renal tubular acidosis |
| Renal failure | Dilution (large volume NS) |
| Toxins (ethylene glycol) | Mineralocorticoid def |
| IEM (organic acidemias) | NaCl excess |

### Клиническая корреляция

| pH | Паттерн | Differential |
|---|---|---|
| 7.10, ↑CO₂ | Респ ацидоз | Hypoventilation, ETT, RDS, BPD |
| 7.10, ↓HCO₃, ↑lactate | Мет ацидоз HAG | Sepsis, shock, asphyxia, NEC, IEM |
| 7.50, ↓CO₂ | Респ алкалоз | Hyperventilation, sepsis early, pain |
| 7.50, ↑HCO₃ | Мет алкалоз | NG losses, диуретики, hypoCl |

### NaHCO₃ — controversial

- НЕ использовать рутинно при мет ацидозе у н/р
- Side effects: ↑CO₂, hypernatremia, hypocalcemia, intracellular acidosis,
  ICH risk у недоношенных
- ПОКАЗАНИЯ (узкие): pH < 7.20 + adequate ventilation + treating cause
- Доза: 1-2 мэкв/кг IV slow (≥ 30 мин)

### Permissive hypercapnia

- Стратегия для снижения VILI у недоношенных
- Целевой PaCO₂ 45-55 (некоторые до 65), pH ≥ 7.25
- Снижает BPD, не ухудшает neurodevelopment (Cochrane 2017)

### Источники

- Tin W. Adv Neonatal Care 2017
- Avery's Diseases of the Newborn 11th ed.
- КР МЗ РФ "КЩС н/р" (2024)
- NICUtools — ABG
`,
};

export default runner;
