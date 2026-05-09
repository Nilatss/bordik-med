/**
 * Runner: neo-glucose-bolus-dose — Глюкоза болюс при гипогликемии
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Расчёт болюса D10W (10% глюкоза) для коррекции острой
 * гипогликемии у н/р. Standard у term + late preterm.
 *
 * Доза: 2 мл/кг D10W IV болюс slow push 1-2 мин (= 200 мг/кг = 0.2 г/кг)
 *   Затем continuous infusion для maintenance (см. GIR calculator)
 *
 * Definitions hypoglycemia (PES 2015):
 *   Term newborn:
 *     - First 4 ч: < 1.8 ммоль/л (35 мг/дл) operational threshold
 *     - 4-24 ч: < 2.0 ммоль/л (40 мг/дл)
 *     - > 24 ч: < 2.6 ммоль/л (47 мг/дл)
 *     - > 48 ч (целевой): ≥ 4.0 ммоль/л (70 мг/дл)
 *
 *   Symptomatic / preterm: < 2.6 ммоль/л → лечить
 *
 *   Glucose 1 мг/дл = 0.0555 ммоль/л
 *   Glucose 1 ммоль/л = 18.02 мг/дл
 *
 * SOURCES:
 *   - PES 2015 Pediatric Endocrine Society guidelines (Thornton J Pediatr)
 *   - AAP CFN 2011 — Hypoglycemia
 *   - BAPM 2017 — Identification & Management of Hypoglycaemia
 *   - WHO Pocket Book of Hospital Care for Children (2013)
 *   - КР МЗ РФ "Гипогликемия новорождённого" (2024)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (PES 2015 / AAP / BAPM 2017 / WHO) · РФ',
  reference: 'PES 2015 Thornton J Pediatr. AAP CFN 2011. BAPM 2017. КР МЗ РФ "Гипогликемия н/р" 2024.',
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
      id: 'glucose_solution',
      label: 'Раствор глюкозы',
      type: 'select',
      options: [
        { value: '10', label: 'D10W (10 % глюкоза, стандарт)' },
        { value: '12.5', label: 'D12.5W (12.5 % — peripheral max)' },
        { value: '5', label: 'D5W (5 % — для preterm с риском гипергликемии)' },
      ],
    },
    {
      id: 'severity',
      label: 'Severity',
      type: 'select',
      options: [
        { value: 'standard', label: 'Standard (2 мл/кг D10W)' },
        { value: 'severe', label: 'Severe / неврологические симптомы (5 мл/кг D10W)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const concentration = Number(values.glucose_solution ?? 10); // %
    const severity = String(values.severity ?? 'standard');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    const mlPerKg = severity === 'severe' ? 5 : 2;
    // 1 мл D10W = 100 мг глюкозы; 1 мл D5W = 50 мг
    const mgPerMl = concentration * 10; // 10% = 100 мг/мл
    const totalVol = w * mlPerKg;
    const totalGlucose = totalVol * mgPerMl;

    const actions: string[] = [];
    actions.push(`Глюкоза болюс: ${totalVol.toFixed(1)} мл D${concentration}W (= ${totalGlucose.toFixed(0)} мг = ${(totalGlucose / 1000).toFixed(2)} г)`);
    actions.push(`Доза: ${mlPerKg} мл/кг D${concentration}W IV slow push 1-2 мин`);
    actions.push('Сразу после болюса — start continuous infusion D10W (см. GIR calculator)');

    actions.push('--- Подтверждение перед болюсом ---');
    actions.push('Glucose level (сапиллярный или артериальный — точечный):');
    actions.push('  - Term first 4 ч: < 1.8 ммоль/л (< 35 мг/дл) → лечить');
    actions.push('  - Term 4-24 ч: < 2.0 ммоль/л (< 40 мг/дл) → лечить');
    actions.push('  - Term > 24 ч: < 2.6 ммоль/л (< 47 мг/дл) → лечить');
    actions.push('  - Symptomatic ИЛИ preterm: < 2.6 ммоль/л → лечить ВСЕГДА');
    actions.push('Если значение < 1.4 ммоль/л (< 25 мг/дл) — emergency болюс + GIR ↑↑');

    actions.push('--- After bolus ---');
    actions.push('Контроль гликемии через 30 мин после болюса');
    actions.push('Целевой post-bolus: > 2.6 ммоль/л (> 47 мг/дл) для term');
    actions.push('Maintenance GIR: start 6-8 мг/кг/мин (~ 80-110 мл/кг/сут D10W)');
    actions.push('При persistent hypoglycemia: ↑ GIR на 2 мг/кг/мин q15-30 мин');
    actions.push('Max peripheral GIR: D12.5W (limited concentration через peripheral)');
    actions.push('Beyond: central доступ + D15-20W');

    actions.push('--- Если refractory ---');
    actions.push('GIR ≥ 12-15 мг/кг/мин persistent hypoglycemia → workup:');
    actions.push('  - Hyperinsulinism (CHI): plasma insulin / glucose ratio > 0.3 при гипогликемии');
    actions.push('  - Glucagon, cortisol, GH, fatty acids, ketones, lactate, ammonia');
    actions.push('  - Genetic testing CHI');
    actions.push('Glucagon 0.1-0.3 мг/кг IM/IV emergency (если CHI)');
    actions.push('Diazoxide 5-15 мг/кг/сут PO разделить q8h (CHI maintenance)');
    actions.push('Hydrocortisone 1-2 мг/кг q8h (если adrenal insufficiency suspected)');

    actions.push('--- Side effects ---');
    actions.push('Hyperglycemia rebound — особенно при > 2 мл/кг bolus');
    actions.push('Hypokalemia (insulin response) — мониторинг K');
    actions.push('Phlebitis при D > 12.5% peripheral');
    actions.push('Extravasation: tissue necrosis при concentrated solutions; central preferred');

    return {
      value: totalVol.toFixed(1),
      unit: `мл D${concentration}W (${totalGlucose.toFixed(0)} мг)`,
      interpretation: `${mlPerKg} мл/кг D${concentration}W болюс (${severity === 'severe' ? 'severe' : 'standard'})`,
      color: '#3B82F6',
      details: `${mlPerKg} мл/кг × ${w} кг = ${totalVol.toFixed(1)} мл D${concentration}W = ${totalGlucose.toFixed(0)} мг глюкозы IV slow push.`,
      actions,
    };
  },
  caveats: [
    'PES 2015 (Thornton): operational thresholds зависят от часа жизни — ранее установление',
    'Точечная гликемия лабораторно > бедстайд (POC) для critically low values — confirm если < 1.4',
    'Symptomatic hypoglycemia (jitteriness, lethargy, seizures, hypothermia, tachypnea) → лечить независимо от threshold',
    'Большие дозы > 5 мл/кг D10W → rebound hyperglycemia, hyponatremia',
    'D > 12.5% — central access обязателен (osmolality, phlebitis)',
    'Glucagon 0.1-0.3 мг/кг IM/IV emergency для CHI suspected — но временный effect (30 мин)',
    'Diazoxide 5-15 мг/кг/сут PO для CHI maintenance — после biochemical confirmation',
    'Persistent hypoglycemia > 48 ч жизни: workup hyperinsulinism (CHI / nesidioblastoma)',
    'НЕ использовать D50W (50%) у newborns — выраженный osmolality, ↑ риск IVH',
    'Adrenal insufficiency rare у term, но possible у preterm + sepsis: hydrocortisone trial',
  ],
  related: [
    { id: 'neo-gir', title: 'GIR calculator' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
  ],
  info: `### Глюкоза болюс — лечение гипогликемии

Острая коррекция неонатальной гипогликемии при значениях ниже
operational threshold ИЛИ при симптомах.

### Дозы

| Severity | D10W | Glucose total |
|---|---|---|
| **Standard** | 2 мл/кг | 200 мг/кг (0.2 г/кг) |
| **Severe / sympt** | 5 мл/кг | 500 мг/кг (0.5 г/кг) |

Slow push 1-2 мин IV.

### Operational thresholds (PES 2015)

#### Term newborn (asymptomatic)
| Возраст | Threshold | Action |
|---|---|---|
| First 4 ч | < 1.8 ммоль/л (< 35 мг/дл) | Treat |
| 4-24 ч | < 2.0 ммоль/л (< 40 мг/дл) | Treat |
| > 24 ч | < 2.6 ммоль/л (< 47 мг/дл) | Treat |
| > 48 ч target | ≥ 4.0 ммоль/л (≥ 70 мг/дл) | Goal |

#### Always treat
- Symptomatic (jitteriness, lethargy, seizures, hypothermia, tachypnea)
- Preterm < 2.6 ммоль/л
- Severe < 1.4 ммоль/л (< 25 мг/дл)

### Conversion units

| мг/дл | × 0.0555 | ммоль/л |
| ммоль/л | × 18.02 | мг/дл |

### Algorithm

1. **Confirm** glucose < threshold (POC + lab if < 1.4 ммоль/л)
2. **Bolus 2 мл/кг D10W** IV slow push
3. **Start GIR 6-8 мг/кг/мин** continuous (D10W ≈ 80-110 мл/кг/сут)
4. **Recheck 30 мин:** target > 2.6 ммоль/л
5. **If persists:**
   - ↑ GIR by 2 мг/кг/мин q15-30 мин
   - Switch к D12.5W peripheral or D15-20W central
6. **If GIR ≥ 12-15 persistent:**
   - Hyperinsulinism (CHI) workup
   - Glucagon 0.1-0.3 мг/кг IM/IV
   - Diazoxide 5-15 мг/кг/сут PO
   - Hydrocortisone 1-2 мг/кг q8h trial

### Hyperinsulinism (CHI)

#### Workup при persistent hypoglycemia + GIR ≥ 12 мг/кг/мин:

| Lab | CHI consistent |
|---|---|
| **Insulin / glucose ratio** | > 0.3 при гипогликемии |
| **β-OH butyrate** | inappropriately низкий (< 1 ммоль/л) |
| **Free fatty acids** | inappropriately низкие |
| **Ammonia** | повышен у HI/HA syndrome |
| **Lactate** | повышен у GSD |

#### Treatment CHI

| Препарат | Доза | Применение |
|---|---|---|
| **Glucagon** | 0.1-0.3 мг/кг IM/IV | Emergency, t½ короткий |
| **Diazoxide** | 5-15 мг/кг/сут PO q8h | Maintenance KATP |
| **Octreotide** | 5-25 мкг/кг/сут SC | KATP-resistant CHI |
| **Surgery** | partial pancreatectomy | Focal disease |

### Side effects болюса

- Rebound hyperglycemia (особенно > 5 мл/кг bolus)
- Hypokalemia (insulin response)
- Phlebitis при > 12.5 % concentration peripheral
- Extravasation: tissue necrosis (central preferred)
- Lactic acidosis при excessive infusion (> 18 мг/кг/мин)

### Источники

- PES 2015 Pediatric Endocrine Society (Thornton J Pediatr)
- AAP CFN 2011 — Hypoglycemia
- BAPM 2017 — Identification & Management
- WHO Pocket Book of Hospital Care (2013)
- КР МЗ РФ "Гипогликемия новорождённого" (2024)
`,
};

export default runner;
