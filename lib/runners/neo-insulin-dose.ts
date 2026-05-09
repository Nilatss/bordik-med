/**
 * Runner: neo-insulin-dose — Инсулин (hyperglycemia of prematurity)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Лечение neonatal hyperglycemia (особенно у ELBW < 1000 г). Использование
 * controversial — некоторые предпочитают reduce GIR (decrease glucose
 * infusion rate) над insulin.
 *
 * Дозы:
 *   Continuous infusion: 0.01-0.1 ед/кг/ч (start 0.05 ед/кг/ч)
 *   Range: 0.01-0.2 ед/кг/ч (max — beyond не improve outcomes)
 *
 *   Bolus: НЕ рекомендуется у н/р (sudden hypoglycemia risk)
 *
 *   У DKA newborn (rare): 0.05-0.1 ед/кг/ч continuous, no bolus
 *
 * Definitions hyperglycemia (varied):
 *   - > 8.3 ммоль/л (150 мг/дл): начало мониторинга
 *   - > 11.1 ммоль/л (200 мг/дл): consider treatment если persistent
 *   - > 13.9 ммоль/л (250 мг/дл): treatment recommended
 *   - > 16.7 ммоль/л (300 мг/дл): osmotic diuresis risk → treat aggressively
 *
 * SOURCES:
 *   - Beardsall K et al. NIRTURE trial NEJM 2008;359:1873 — early insulin у preterm
 *   - Hays SP et al. — neonatal hyperglycemia treatment
 *   - AAP CFN — neonatal hyperglycemia
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Гипергликемия новорождённого" (2024)
 *
 * NIRTURE 2008: routine early insulin у preterm — no benefit, ↑ hypoglycemia
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NIRTURE 2008 / NeoFax)',
  reference: 'Beardsall K NIRTURE trial NEJM 2008;359:1873. AAP CFN. NeoFax. КР МЗ РФ.',
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
      id: 'rate',
      label: 'Скорость инфузии (ед/кг/ч)',
      type: 'select',
      options: [
        { value: '0.01', label: '0.01 ед/кг/ч (very low / wean)' },
        { value: '0.025', label: '0.025 ед/кг/ч (low)' },
        { value: '0.05', label: '0.05 ед/кг/ч (стандарт start)' },
        { value: '0.1', label: '0.1 ед/кг/ч (med)' },
        { value: '0.15', label: '0.15 ед/кг/ч (high)' },
        { value: '0.2', label: '0.2 ед/кг/ч (max)' },
      ],
    },
    {
      id: 'concentration',
      label: 'Концентрация',
      type: 'select',
      options: [
        { value: '1', label: '1 ед/мл (стандарт: 10 ед + 100 мл D5W = 0.1 ед/мл; затем dilute 1:10)' },
        { value: '0.1', label: '0.1 ед/мл (concentrated NICU)' },
        { value: '0.5', label: '0.5 ед/мл (mid concentration)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const rate = Number(values.rate ?? 0.05);
    const conc = Number(values.concentration ?? 0.1);

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    // ед/кг/ч × кг = ед/ч
    const unitsPerHour = rate * w;
    const mlPerHour = unitsPerHour / conc;

    let band = 'Стандарт';
    let color = '#3B82F6';
    if (rate >= 0.1) {
      band = 'Высокая';
      color = '#F59E0B';
    }
    if (rate >= 0.2) {
      band = 'Max — caution';
      color = '#EF4444';
    }

    const actions: string[] = [];
    actions.push(`Инсулин regular: ${unitsPerHour.toFixed(4)} ед/ч = ${mlPerHour.toFixed(2)} мл/ч @ ${conc} ед/мл`);
    actions.push(`Доза: ${rate} ед/кг/ч continuous`);
    actions.push(`Severity: ${band}`);

    actions.push('--- Подготовка ---');
    if (conc === 1) {
      actions.push('Стандарт NICU: 100 ед + 100 мл D5W = 1 ед/мл; затем dilute 1:10 (10 мл этого + 90 мл D5W = 0.1 ед/мл) для small infusion volumes');
    } else if (conc === 0.5) {
      actions.push('Mid: 50 ед + 100 мл D5W = 0.5 ед/мл');
    } else {
      actions.push('Concentrated NICU: 10 ед + 100 мл D5W = 0.1 ед/мл');
    }
    actions.push('Stable 24 ч @ 25°C; D5W (НЕ NaCl alone — bonds to glass / plastic)');
    actions.push('PRE-PRIME tubing: пустить через 50 мл первой объёма (insulin adsorbs к plastic)');
    actions.push('Доступ: peripheral OK (small volume)');

    actions.push('--- Treatment indications ---');
    actions.push('Glucose > 11.1 ммоль/л (200 мг/дл) PERSISTENT despite GIR reduction');
    actions.push('Glucose > 13.9 ммоль/л (250 мг/дл) — treatment recommended');
    actions.push('Glucose > 16.7 ммоль/л (300 мг/дл) — osmotic diuresis risk, treat aggressively');
    actions.push('First-line: ↓ GIR (decrease glucose в TPN); insulin only если ↓ GIR fails');

    actions.push('--- Titration ---');
    actions.push('Start 0.05 ед/кг/ч');
    actions.push('Recheck glucose q30 мин first 2 ч; затем q1h');
    actions.push('Target glucose 4-8 ммоль/л (70-150 мг/дл)');
    actions.push('↑ rate by 0.025-0.05 ед/кг/ч q30 мин если no response');
    actions.push('↓ rate when glucose < 6 ммоль/л; stop при < 4 ммоль/л');
    actions.push('Wean: ↓ 0.01 ед/кг/ч q1h когда стабилен');

    actions.push('--- Мониторинг ---');
    actions.push('Glucose q30 мин first 2 ч, then q1h until stable, затем q4h');
    actions.push('K (insulin → intracellular shift; hypokalemia)');
    actions.push('Готовность к D10W bolus 2 мл/кг при hypoglycemia');

    actions.push('--- Side effects ---');
    actions.push('⚠️ Hypoglycemia — major concern; tightly titrate');
    actions.push('Hypokalemia (intracellular shift)');
    actions.push('Allergic reactions rare у н/р short-term use');
    actions.push('Tubing absorption: insulin loses до 30 % activity к plastic — pre-prime критично');

    actions.push('--- NIRTURE trial caveats (Beardsall 2008) ---');
    actions.push('Routine early insulin у preterm: NO benefit, ↑ hypoglycemia');
    actions.push('→ Не использовать prophylactic; treat только actual hyperglycemia');
    actions.push('First-line strategy: ↓ GIR (decrease glucose в TPN)');

    return {
      value: unitsPerHour.toFixed(4),
      unit: `ед/ч (${mlPerHour.toFixed(2)} мл/ч)`,
      interpretation: `${rate} ед/кг/ч (${band})`,
      color,
      details: `${rate} ед/кг/ч × ${w} кг = ${unitsPerHour.toFixed(4)} ед/ч @ ${conc} ед/мл → ${mlPerHour.toFixed(2)} мл/ч.`,
      actions,
    };
  },
  caveats: [
    'NIRTURE trial (Beardsall 2008): routine early insulin у preterm — NO benefit, ↑ hypoglycemia',
    'First-line strategy hyperglycemia: ↓ GIR (decrease glucose в TPN) before initiating insulin',
    'Insulin adsorbs к plastic tubing — PRE-PRIME с 50 мл первой объёма critical',
    'Hypoglycemia tight monitoring: glucose q30 мин first 2 ч, q1h thereafter',
    'Hypokalemia from intracellular shift — monitor K q4-6h',
    'Hyperglycemia у preterm не равняется DM — different pathophys (immature insulin secretion + insulin resistance + stress)',
    'Persistent hyperglycemia + GIR < 4 мг/кг/мин — alternative diagnosis (sepsis, IVH, neonatal DM rare)',
    'Tubing absorption losses: actual delivery 70-80 % of programmed — adjust rate accordingly',
    'Stable в D5W; bond к glass / plastic in NaCl alone — D5W preferred',
    'Pediatric DM (rare у н/р): different protocol; insulin glargine не рекомендуется у preterm',
    'Hyperosmolar hyperglycemia: glucose > 16.7 ммоль/л — osmotic diuresis (urine output ↑ falsely interpreted как hydration)',
  ],
  related: [
    { id: 'neo-glucose-bolus-dose', title: 'Глюкоза болюс' },
    { id: 'neo-gir', title: 'GIR calculator' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
  ],
  info: `### Инсулин у новорождённых

Лечение neonatal hyperglycemia (преимущественно у ELBW < 1000 г).
Use **selectively** — first-line: reduce glucose infusion rate (GIR).

⚠️ **NIRTURE trial (Beardsall 2008):** routine early insulin у preterm
— NO benefit, ↑ hypoglycemia.

### Дозы

| Уровень | Доза |
|---|---|
| Very low (wean) | 0.01 ед/кг/ч |
| Low | 0.025 ед/кг/ч |
| **Standard start** | **0.05 ед/кг/ч** |
| Med | 0.1 ед/кг/ч |
| High | 0.15 ед/кг/ч |
| Max | 0.2 ед/кг/ч |

⚠️ **Bolus dose НЕ рекомендуется у н/р** — sudden hypoglycemia risk.

### Подготовка раствора

| Conc | Recipe |
|---|---|
| **0.1 ед/мл** | **10 ед + 100 мл D5W** (стандарт NICU) |
| 0.5 ед/мл | 50 ед + 100 мл D5W |
| 1 ед/мл | 100 ед + 100 мл D5W (concentrated; затем 1:10) |

Stable 24 ч; **D5W** (NaCl → bonding к plastic).

⚠️ **PRE-PRIME tubing** с 50 мл первой объёма — insulin adsorbs к plastic
(losses до 30 %).

### Hyperglycemia thresholds

| Glucose | Action |
|---|---|
| > 8.3 ммоль/л (150) | Monitor, ↓ GIR if persistent |
| > 11.1 ммоль/л (200) | Consider insulin if ↓ GIR fails |
| > 13.9 ммоль/л (250) | Insulin recommended |
| > 16.7 ммоль/л (300) | Aggressive treatment (osmotic diuresis) |

### Treatment algorithm

1. **First:** ↓ GIR (decrease glucose в TPN) — if GIR > 6 мг/кг/мин
2. **If persistent** despite GIR < 6: start insulin
3. **Insulin 0.05 ед/кг/ч** continuous infusion
4. **Recheck glucose q30 мин** first 2 ч
5. **Target: 4-8 ммоль/л** (70-150 мг/дл)
6. **Titrate** ± 0.025-0.05 ед/кг/ч q30 мин
7. **Wean** ↓ 0.01 ед/кг/ч q1h когда стабилен

### NIRTURE trial findings (Beardsall NEJM 2008)

- 195 ELBW preterm randomized
- Early routine insulin (vs reactive)
- **No mortality / morbidity benefit**
- **↑ Hypoglycemia rate** (29 % vs 17 %)
- → Use insulin **selectively**, не routine

### Pathophysiology hyperglycemia of prematurity

| Factor | Mechanism |
|---|---|
| **Immature insulin secretion** | β-cell development insufficient |
| **Insulin resistance** | Postnatal adaptation |
| **Stress** | Catecholamines, cortisol |
| **High GIR** | Excessive glucose in TPN |
| **Sepsis** | Inflammatory cytokines |
| **Steroid use** | Hydrocortisone, dexamethasone |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| ⚠️ Hypoglycemia | major | Tight monitoring q30 мин |
| Hypokalemia | + | Monitor K q4-6h, supplement |
| Allergic reactions | rare | Discontinue |
| Tubing absorption | up to 30 % loss | Pre-prime |

### Adjunct considerations

- **Sepsis workup** при persistent hyperglycemia + GIR < 4
- **IVH suspicion** — head US
- **Neonatal DM** rare — endocrinology consult если > 14 дней
- **Steroid review** если on hydrocortisone

### Источники

- Beardsall K et al. NIRTURE trial NEJM 2008;359:1873
- Hays SP et al. — neonatal hyperglycemia treatment
- AAP CFN — neonatal hyperglycemia
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Гипергликемия новорождённого" (2024)
`,
};

export default runner;
