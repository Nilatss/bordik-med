/**
 * Runner: neo-cagluconate-dose — Кальций глюконат (hypocalcemia)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Лечение неонатальной гипокальциемии (early < 72 ч или late > 72 ч).
 * Кальций глюконат 10 % preferred над хлоридом (less tissue irritation,
 * less acidotic).
 *
 * Дозы:
 *   Symptomatic acute (judorги, апноэ):
 *     1-2 мл/кг 10 % calcium gluconate IV slow push 5-10 мин
 *     = 100-200 мг/кг calcium gluconate (= 9-18 мг/кг elemental Ca)
 *
 *   Maintenance (preventive в TPN):
 *     200-800 мг/кг/сут calcium gluconate (= 18-72 мг/кг/сут elemental Ca)
 *     В составе TPN, разделить на 24 ч infusion
 *
 *   Severe (cardiac, prolonged QT, judorги):
 *     2 мл/кг 10 % calcium gluconate IV slow push 10-20 мин с ECG monitoring
 *
 * Definitions hypocalcemia:
 *   - Total Ca < 2.0 ммоль/л (8 мг/дл) у term; < 1.75 ммоль/л у preterm
 *   - Ionized Ca < 1.0 ммоль/л (4 мг/дл) — лучший marker
 *   - Severe: < 0.8 ммоль/л ionized + symptomatic
 *
 * SOURCES:
 *   - AAP CFN — Hypocalcemia in newborns
 *   - Demarini S et al. — neonatal calcium homeostasis review
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Гипокальциемия новорождённого" (2024)
 *
 * Conversion:
 *   1 мл 10% Ca gluconate = 100 мг Ca gluconate = 9 мг elemental Ca = 0.45 ммоль Ca
 *   1 г Ca gluconate = 90 мг elemental Ca = 4.5 ммоль Ca
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NeoFax) · РФ',
  reference: 'AAP CFN — Hypocalcemia. Demarini S — neonatal Ca homeostasis. NeoFax. КР МЗ РФ.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 5,
      step: 0.01,
    },
    {
      id: 'mode',
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'acute_low', label: 'Acute treatment 1 мл/кг 10% Ca gluc (~9 мг/кг elemental)' },
        { value: 'acute_high', label: 'Acute severe 2 мл/кг 10% Ca gluc (~18 мг/кг elemental)' },
        { value: 'maint_low', label: 'Maintenance 200 мг/кг/сут (~18 мг/кг elemental/сут)' },
        { value: 'maint_med', label: 'Maintenance 400 мг/кг/сут (~36 мг/кг elemental/сут)' },
        { value: 'maint_high', label: 'Maintenance 800 мг/кг/сут (~72 мг/кг elemental/сут)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'acute_low');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type CaMode = { mlPerKg?: number; mgPerKgPerDay?: number; isAcute: boolean; label: string };
    const modes: Record<string, CaMode> = {
      acute_low: { mlPerKg: 1, isAcute: true, label: 'Acute treatment standard' },
      acute_high: { mlPerKg: 2, isAcute: true, label: 'Acute severe / cardiac' },
      maint_low: { mgPerKgPerDay: 200, isAcute: false, label: 'Maintenance low' },
      maint_med: { mgPerKgPerDay: 400, isAcute: false, label: 'Maintenance standard (TPN)' },
      maint_high: { mgPerKgPerDay: 800, isAcute: false, label: 'Maintenance high (severe deficit)' },
    };
    const m = modes[mode] ?? modes.acute_low;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }

    const actions: string[] = [];

    if (m.isAcute && m.mlPerKg) {
      const totalMl = w * m.mlPerKg;
      const totalMg = totalMl * 100; // 10% = 100 мг/мл
      const elementalMg = totalMl * 9; // 9 мг elemental Ca per мл 10%

      actions.push(`Кальций глюконат 10 %: ${totalMl.toFixed(2)} мл = ${totalMg.toFixed(0)} мг`);
      actions.push(`Elemental Ca: ${elementalMg.toFixed(1)} мг (${(elementalMg / 40 * 1000).toFixed(2)} ммоль)`);
      actions.push(`Доза: ${m.mlPerKg} мл/кг 10 % Ca gluconate IV slow push`);
      actions.push('IV slow push 5-10 мин (rapid push → bradycardia, asystole)');
      actions.push('Continuous ECG monitoring во время и после');
      actions.push('Доступ: central preferred (extravasation тяжёлая); peripheral OK для acute');
      actions.push('После acute: maintenance 200-400 мг/кг/сут в TPN');

      actions.push('--- ⚠️ Caveats ---');
      actions.push('Rapid push → bradycardia, asystole (особенно если digitalis-treated)');
      actions.push('Extravasation → tissue necrosis (less severe than CaCl₂ but still risk)');
      actions.push('Если concomitant NaHCO₃ — separate lumens (precipitate)');
      actions.push('Hypomagnesemia часто сопутствует — также корригировать (MgSO₄ 25-50 мг/кг IV)');

      return {
        value: totalMl.toFixed(2),
        unit: `мл 10% Ca gluc (${elementalMg.toFixed(1)} мг elemental Ca)`,
        interpretation: m.label,
        color: '#F59E0B',
        details: `${m.mlPerKg} мл/кг × ${w} кг = ${totalMl.toFixed(2)} мл 10 % Ca gluconate IV slow push 5-10 мин = ${elementalMg.toFixed(1)} мг elemental Ca.`,
        actions,
      };
    } else if (!m.isAcute && m.mgPerKgPerDay) {
      const totalMgPerDay = w * m.mgPerKgPerDay;
      const elementalPerDay = totalMgPerDay * 0.09; // 9% elemental по weight
      const totalMlPerDay = totalMgPerDay / 100; // 10% Ca gluconate
      const mlPerHour = totalMlPerDay / 24;

      actions.push(`Кальций глюконат 10 %: ${totalMgPerDay.toFixed(0)} мг/сут = ${totalMlPerDay.toFixed(2)} мл/сут`);
      actions.push(`= ${mlPerHour.toFixed(2)} мл/ч continuous infusion (часть TPN)`);
      actions.push(`Elemental Ca: ${elementalPerDay.toFixed(1)} мг/сут (${(elementalPerDay / 40).toFixed(2)} ммоль/сут)`);
      actions.push(`Доза: ${m.mgPerKgPerDay} мг/кг/сут`);
      actions.push('В составе TPN; добавить к bag после mixing aminoacids');
      actions.push('Совместимость: НЕ микшировать с NaHCO₃, phosphate (precipitate)');
      actions.push('Monitor ionized Ca q24h; total Ca q24h в TPN protocol');

      return {
        value: totalMlPerDay.toFixed(2),
        unit: `мл/сут (${elementalPerDay.toFixed(1)} мг elemental Ca/сут)`,
        interpretation: m.label,
        color: '#3B82F6',
        details: `${m.mgPerKgPerDay} мг/кг/сут × ${w} кг = ${totalMgPerDay.toFixed(0)} мг Ca gluconate/сут (= ${elementalPerDay.toFixed(1)} мг elemental Ca/сут).`,
        actions,
      };
    }

    return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
  },
  caveats: [
    'Кальций глюконат 10% (vs CaCl₂ 10%) — neoнат standard: less tissue irritation, less acidotic, longer half-life',
    'Concentration: 1 мл 10% Ca gluconate = 100 мг Ca gluc = 9 мг elemental Ca = 0.45 ммоль',
    'Ionized Ca — better marker than total (binding к albumin variable у н/р)',
    'Hypocalcemia thresholds: term < 2.0 ммоль/л total or < 1.0 ммоль/л ionized; preterm < 1.75/0.9',
    'Severe symptomatic (judorги, apnea, prolonged QT): require ECG monitoring during infusion',
    'Concomitant hypomagnesemia (часто) — также treat: MgSO₄ 25-50 мг/кг IV',
    'Concomitant NaHCO₃ → precipitate (calcium carbonate); separate lumens',
    'Phosphate в TPN: separate add-in protocol; usually phosphate в lipid lumen, calcium в aminoacid',
    'Digitalis: acute Ca push potentiates digitalis toxicity (cardiac arrest)',
    'Extravasation: tissue necrosis — central access preferred при > 1 мл/кг bolus; flush thoroughly',
    'Late hypocalcemia (> 72 ч): часто associated с hypomagnesemia, hyperphosphatemia (vit D deficiency, formula related)',
  ],
  related: [
    { id: 'neo-glucose-bolus-dose', title: 'Глюкоза болюс' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы' },
  ],
  info: `### Кальций глюконат у новорождённых

Лечение неонатальной гипокальциемии (early < 72 ч от перинатальных
факторов или late > 72 ч от exogenous causes).

### Дозы

#### Acute treatment
| Severity | Доза |
|---|---|
| Standard | 1 мл/кг 10% Ca gluc IV slow push (= 9 мг/кг elemental) |
| Severe / cardiac | 2 мл/кг 10% Ca gluc IV slow push (= 18 мг/кг elemental) |

#### Maintenance (часть TPN)
| Severity | Доза |
|---|---|
| Low | 200 мг/кг/сут Ca gluc (= 18 мг/кг elemental/сут) |
| **Standard** | **400 мг/кг/сут Ca gluc (= 36 мг/кг elemental/сут)** |
| High | 800 мг/кг/сут Ca gluc (= 72 мг/кг elemental/сут) |

### Conversion

| Unit | Equivalent |
|---|---|
| 1 мл 10% Ca gluc | 100 мг Ca gluc |
| 1 г Ca gluc | 90 мг elemental Ca |
| 1 ммоль Ca | 40 мг elemental |
| 1 мг/дл | 0.25 ммоль/л |

### Hypocalcemia definitions

| Возраст | Total Ca | Ionized Ca |
|---|---|---|
| Term | < 2.0 ммоль/л (< 8 мг/дл) | < 1.0 ммоль/л (< 4 мг/дл) |
| Preterm | < 1.75 ммоль/л (< 7 мг/дл) | < 0.9 ммоль/л (< 3.6 мг/дл) |
| Severe | — | < 0.8 ммоль/л + symptomatic |

### Causes by timing

#### Early (< 72 ч)
- Prematurity (immature parathyroid)
- Maternal diabetes
- IDM (infant of diabetic mother)
- Birth asphyxia
- IUGR
- Maternal anticonvulsants

#### Late (> 72 ч)
- Vit D deficiency
- Hyperphosphatemia (cow's milk based formula)
- Hypoparathyroidism (DiGeorge)
- Hypomagnesemia (often co-existent)
- Renal disease

### Symptoms

| Severity | Symptoms |
|---|---|
| Mild | Jitteriness, irritability |
| Moderate | Поmental, tetany, hypertonus |
| Severe | Seizures, apnea, prolonged QT, cardiac arrest |

### Acute treatment algorithm

1. **Confirm** ionized Ca < 1.0 ммоль/л (or symptomatic)
2. **Check Mg** — co-existent often
3. **IV access** (central preferred for repeated doses)
4. **10% Ca gluconate 1-2 мл/кг IV slow** push 5-10 мин
5. **ECG monitoring** continuous
6. **Recheck Ca** через 30-60 мин
7. **Maintenance** в TPN или PO

### vs CaCl₂

| | Ca gluconate | Ca chloride |
|---|---|---|
| **Concentration elemental** | 9 мг/мл (10%) | 27 мг/мл (10%) |
| **Tissue irritation** | mild | severe |
| **Acidosis** | minimal | + |
| **Use in neonates** | standard | rare |
| **Use in adults** | + | preferred (CPR) |

### Side effects / precautions

| Effect | Mechanism | Management |
|---|---|---|
| Bradycardia / asystole | rapid push | Slow push 5-10 мин |
| Extravasation necrosis | severe tissue irritation | Central access |
| Precipitate с NaHCO₃ | CaCO₃ formation | Separate lumens |
| Precipitate с phosphate | CaPO₄ | TPN protocol |
| Digitalis toxicity | additive cardiac effects | Avoid in digoxin therapy |
| Hyperкальciemia | overdose | Monitor Ca q24h |

### Источники

- AAP CFN — Hypocalcemia in newborns
- Demarini S et al. — neonatal calcium homeostasis
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Гипокальциемия новорождённого" (2024)
`,
};

export default runner;
