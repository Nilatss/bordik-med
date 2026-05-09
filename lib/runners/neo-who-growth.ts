/**
 * Runner: neo-who-growth — WHO Growth Standards 0-24 мес (term)
 *
 * NEONATOLOGY MODULE A20 (P1).
 *
 * Source: WHO Multicentre Growth Reference Study Group. WHO Child Growth
 * Standards based on length/height, weight and age. Acta Paediatr Suppl.
 * 2006;450:76-85. doi:10.1111/j.1651-2227.2006.tb02378.x
 *
 * Companion: WHO Anthro software / website (who.int/childgrowth/standards/).
 *
 * Z-scores и percentiles для weight-for-age (WAZ), length/height-for-age
 * (HAZ/LAZ), weight-for-length (WHZ), BMI-for-age у детей 0-24 мес
 * (term).
 *
 * Cut-offs:
 *   <-3 SD       severe wasting/stunting/underweight
 *   <-2 SD       moderate (also "under" cut-off in Sustainable Development Goals)
 *   -2 to +2 SD  normal range
 *   >+2 SD       overweight
 *   >+3 SD       severe overweight / obesity
 *
 * Bordik MVP: simplified P50 interpolation для weight-for-age (term).
 * Для length, HC, BMI и точных Z-scores использовать WHO Anthro (free).
 */
import type { CalculatorTool } from '../tools-runners';

// Simplified WHO P50 weight (kg) для term boys/girls combined approximate
const WHO_WEIGHT_P50_MONTHS: Record<number, number> = {
  0: 3.3, // birth
  1: 4.5,
  2: 5.6,
  3: 6.4,
  4: 7.0,
  5: 7.5,
  6: 7.9,
  7: 8.3,
  8: 8.6,
  9: 8.9,
  10: 9.2,
  11: 9.4,
  12: 9.6,
  15: 10.3,
  18: 10.9,
  21: 11.5,
  24: 12.2,
};

function interpolateMonths(months: number, table: Record<number, number>): number {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (months <= keys[0]!) return table[keys[0]!]!;
  if (months >= keys[keys.length - 1]!) return table[keys[keys.length - 1]!]!;
  for (let i = 0; i < keys.length - 1; i++) {
    if (months >= keys[i]! && months <= keys[i + 1]!) {
      const frac = (months - keys[i]!) / (keys[i + 1]! - keys[i]!);
      return table[keys[i]!]! + frac * (table[keys[i + 1]!]! - table[keys[i]!]!);
    }
  }
  return table[keys[0]!]!;
}

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO Multicentre Growth Reference 2006)',
  reference: 'WHO Multicentre Growth Reference Study Group. Acta Paediatr Suppl 2006;450:76. who.int/childgrowth/standards.',
  inputs: [
    { id: 'months', label: 'Возраст', type: 'number', unit: 'мес', min: 0, max: 24, step: 1, hint: 'Term (для preterm — corrected age)', quickValues: [0, 3, 6, 12, 18, 24] },
    { id: 'weight', label: 'Вес', type: 'number', unit: 'кг', min: 1, max: 20, step: 0.05, quickValues: [3, 5, 7, 10, 12] },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' },
      { value: 'f', label: 'Женский' },
    ] },
  ],
  presets: [
    { label: 'Term newborn 3.3 кг', values: { months: 0, weight: 3.3, sex: 'm' } },
    { label: '6 мес 7.5 кг (10й перц)', values: { months: 6, weight: 7.5, sex: 'm' } },
    { label: '12 мес 9.5 кг (норма)', values: { months: 12, weight: 9.5, sex: 'f' } },
    { label: '24 мес 11.0 кг (low)', values: { months: 24, weight: 11.0, sex: 'm' } },
  ],
  compute: (v) => {
    const months = Number(v.months) || 0;
    const weight = Number(v.weight) || 3.3;

    const expected_p50 = interpolateMonths(months, WHO_WEIGHT_P50_MONTHS);
    const sd_approx = expected_p50 * 0.13; // ~13% SD approximation
    const z = (weight - expected_p50) / sd_approx;

    // Approximate percentile from Z (normal CDF)
    function approxPct(z: number): number {
      const t = 1 / (1 + 0.2316419 * Math.abs(z));
      const d = 0.3989423 * Math.exp((-z * z) / 2);
      let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      if (z > 0) p = 1 - p;
      return p * 100;
    }

    const pct = approxPct(z);

    let category: string;
    let color = '#22C55E';
    if (z < -3) {
      category = 'Severe underweight (<-3 SD)';
      color = '#7F1D1D';
    } else if (z < -2) {
      category = 'Moderate underweight (-3 to -2 SD)';
      color = '#EF4444';
    } else if (z <= 2) {
      category = `Normal (${pct.toFixed(0)} перцентиль)`;
      color = '#22C55E';
    } else if (z <= 3) {
      category = 'Overweight (+2 to +3 SD)';
      color = '#F59E0B';
    } else {
      category = 'Severe overweight (>+3 SD)';
      color = '#EF4444';
    }

    const interpretation = `Weight-for-age: ${weight} кг при ${months} мес → Z=${z >= 0 ? '+' : ''}${z.toFixed(2)} (~${pct.toFixed(0)} перц.) — ${category}`;

    const actions: string[] = [];

    if (z < -2) {
      actions.push(
        '⚠️ Underweight — assessment + intervention',
        'WHO MAM/SAM management protocol (если developing country context)',
        'Feeding evaluation: latch, frequency, milk supply',
        'Medical workup: chronic infection (HIV, TB), malabsorption (CF, celiac), endocrine',
        'Nutritional supplementation: RUTF (ready-to-use therapeutic food)',
        'Growth monitoring monthly до catch-up',
      );
    } else if (z > 2) {
      actions.push(
        'Overweight — discuss feeding patterns с family',
        'Avoid overfeeding signals',
        'No formula in night feeds после 6 мес',
        'Standard WHO complementary feeding guidance',
        'Check для hyperinsulinism / Beckwith-Wiedemann если severe',
      );
    } else {
      actions.push(
        'Norma — стандартный feeding и mortality plan',
        'Continue exclusive breastfeeding до 6 мес',
        'Complementary feeding from 6 мес (WHO guideline)',
        'Monthly growth check first 6 мес, q3мес после',
      );
    }

    actions.push('Точные Z-scores и percentiles для length, HC, BMI: WHO Anthro software');

    const details = `### Weight-for-age (WHO 2006)

| Параметр | Значение |
|---|---|
| Возраст | ${months} мес |
| Текущий вес | ${weight} кг |
| Ожидаемый P50 | ~${expected_p50.toFixed(1)} кг |
| Z-score | ${z >= 0 ? '+' : ''}${z.toFixed(2)} |
| Percentile (приблиз.) | ${pct.toFixed(0)}-й |
| Категория | **${category}** |

### Cut-offs (WHO)

| Z-score | SD от mean | Категория |
|---|---|---|
| <-3 | <0.1 перц | Severe underweight (or stunting/wasting) |
| -3 to -2 | 0.1-2.3 перц | Moderate (cut-off для intervention) |
| -2 to +2 | 2.3-97.7 перц | **Normal** |
| +2 to +3 | 97.7-99.9 перц | Overweight (NOT obesity at this age) |
| >+3 | >99.9 перц | Severe overweight |

### WHO P50 reference points (term)

| Age (мес) | Weight P50 (кг) |
|---|---|
| 0 (birth) | 3.3 |
| 3 | 6.4 |
| 6 | 7.9 |
| 12 | 9.6 |
| 18 | 10.9 |
| 24 | 12.2 |

### When to use vs alternatives

| Tool | Population |
|---|---|
| **WHO Growth Standards** | Term ≥37 нед, age 0-24 мес (this calculator) |
| WHO Growth до 5 лет | Term, age 0-5 yr |
| **CDC Growth Charts** | 2-20 yr, US-specific |
| **Fenton 2025** | Preterm <37 нед, до 50 нед PMA (use neo-fenton) |
| Intergrowth-21st | Newborn до 64 нед PMA |

### Для preterm

При оценке preterm <37 нед — использовать **corrected age**
(actual age − weeks of prematurity) до 24 мес, или Fenton 2025 для
<50 нед PMA.

⚠️ Bordik MVP — simplified P50 interpolation. Для точных Z-scores и
percentiles по weight, length, head circumference и BMI используйте
**WHO Anthro** (free desktop software) или **who.int/childgrowth/
standards/computer**.`;

    return {
      value: `${pct.toFixed(0)}-й`,
      unit: `перц. (Z=${z.toFixed(1)})`,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'WHO Growth Standards (2006) — основа для term ≥37 нед',
        'Для preterm <37 нед — Fenton 2025 (neo-fenton runner) или corrected age',
        'Bordik MVP — simplified P50 interpolation; точные Z-scores → WHO Anthro',
        '<-2 SD weight-for-age — moderate underweight (intervention threshold)',
        '<-3 SD — severe; SAM/MAM management protocols (WHO/UNICEF)',
        'Sex differences modest при 0-6 мес; растут с возрастом',
        'Length и HC tracker отдельно — нужны для full nutrition assessment',
        'Anthro software free на who.int — full LMS-based точные расчёты',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: 'Severe', color: '#7F1D1D' },
          { min: 3, max: 10, label: 'Underweight', color: '#EF4444' },
          { min: 10, max: 90, label: 'Norma', color: '#22C55E' },
          { min: 90, max: 97, label: 'Overweight', color: '#F59E0B' },
          { min: 97, max: 100, label: 'Severe ow', color: '#EF4444' },
        ],
        current: pct,
        unit: 'перц.',
      },
      related: [
        { id: 'neo-fenton', title: 'Fenton 2025 (preterm)' },
        { id: 'intergrowth', title: 'Intergrowth-21st' },
        { id: 'who-growth', title: 'WHO 0-5 лет' },
        { id: 'cdc-growth', title: 'CDC Growth (2-20)' },
      ],
      relatedCourses: [{ id: '301.4', title: 'Неонатология' }, { id: '300.4', title: 'Педиатрия' }],
    };
  },
  info: `### WHO Growth Standards (2006)

International reference для assessment growth у term children
0-24 мес (или 0-5 yr extended). Основа для assessment nutrition,
growth velocity, и identification stunting/wasting/overweight.

### When to use

| Tool | Population |
|---|---|
| **WHO 0-24 мес** (this) | Term ≥37 нед, age 0-24 мес |
| WHO 0-5 yr | Term, age 0-5 yr |
| Fenton 2025 | Preterm <37 нед или PMA <50 нед |
| Intergrowth-21st | Newborn 33-42 нед, до 64 нед PMA |
| CDC Growth | 2-20 yr, US-specific |

### Z-score / percentile cut-offs

| Z-score | Percentile | Category |
|---|---|---|
| <-3 | <0.1 | Severe underweight |
| -3 to -2 | 0.1-2.3 | Moderate underweight |
| -2 to +2 | 2.3-97.7 | **Normal** |
| +2 to +3 | 97.7-99.9 | Overweight |
| >+3 | >99.9 | Severe overweight |

### SAM/MAM (WHO/UNICEF)

| Term | Definition |
|---|---|
| **SAM** (Severe Acute Malnutrition) | WHZ <-3 OR MUAC <115mm OR oedema |
| **MAM** (Moderate AM) | WHZ -3 to -2 |
| **Stunting** | HAZ <-2 |
| **Wasting** | WHZ <-2 |

### Treatment protocols

- **SAM:** RUTF (Plumpy'Nut), inpatient if complications
- **MAM:** community-based supplementary feeding
- **Stunting:** prevention focused (first 1000 days), не reversible после 2 yr

### Источники

- WHO Multicentre Growth Reference Study Group, Acta Paediatr Suppl 2006
- WHO Anthro software (free): who.int/childgrowth/standards/computer
- WHO/UNICEF Joint Statement on Management of Malnutrition

### Ограничения

- Bordik MVP — simplified weight-for-age only (P50 interpolation)
- Точные Z-scores и LMS-based percentiles → WHO Anthro
- Length/height и HC отдельно — нужны для full nutrition assessment
- Для preterm — corrected age или Fenton 2025 (neo-fenton runner)
`,
};

export default runner;
