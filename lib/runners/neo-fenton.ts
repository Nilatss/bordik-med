/**
 * Runner: neo-fenton — Fenton 2025 Growth Calculator (22-50 weeks PMA)
 *
 * NEONATOLOGY MODULE A18 (P0). Source attribution:
 *   PRIMARY:    Fenton TR, Elmrayed S, Alshaikh BN. The 2025 Update of the
 *               Fenton Growth Charts and the BMI-for-age Reference for
 *               Preterm Infants. Pediatrics. 2025;155(6):e2024069896.
 *               doi:10.1542/peds.2024-069896
 *   COMPANION:  PediTools/fenton2025 — peditools.org/fenton2025/
 *               Открытая web-implementation, на основе которой Bordik
 *               воспроизводит percentile/Z-score интерполяцию.
 *   PRIOR:      Fenton TR, Kim JH. A systematic review and meta-analysis
 *               to revise the Fenton growth chart for preterm infants. BMC
 *               Pediatrics. 2013;13:59.
 *   GUIDELINE:  AAP Pediatric Nutrition Handbook 8 ed. (2020) — Fenton как
 *               стандарт для оценки роста преэрмов в США/Канаде.
 *
 * Что считает:
 *   Z-scores и перцентили для weight, length, head circumference (HC) у
 *   premature infants 22-50 weeks postmenstrual age (PMA).
 *
 *   PMA = gestational age + chronological age (weeks since birth)
 *   Например: 28 нед при рождении + 4 нед после = 32 нед PMA
 *
 * Особенности 2025 update vs 2013:
 *   - Расширен возрастной диапазон до 50 нед PMA (был 50)
 *   - Добавлен BMI-for-age reference (Body Mass Index)
 *   - Уточнены reference data на основе ~250k preterm infants
 *   - Лучше покрытие <26 нед (extreme preterm)
 *
 * Caveats:
 *   - Не использовать для termin (≥37 нед) после 50 нед PMA — переходить
 *     на WHO Growth Standards (0-24 мес) или Intergrowth-21st
 *   - Z-scores предполагают gaussian distribution; для extremes (Z>3)
 *     percentile не интерпретируется буквально
 *   - SGA cut-off: <10th percentile (или Z<-1.28)
 *   - LGA cut-off: >90th percentile (Z>1.28)
 *   - AGA: 10-90th percentile
 *
 * Bordik implementation note:
 *   Полная Fenton 2025 интерполяция требует реference dataset (LMS values
 *   per week PMA per measurement). В этом MVP-runner мы используем
 *   simplified interpolation на ключевых точках (10/50/90 percentiles)
 *   для демонстрации функциональности; для точного расчёта рекомендуем
 *   peditools.org/fenton2025/ или Bordik server-side endpoint когда
 *   reference dataset загружен.
 *
 * SOURCES (audit 1.15):
 *   [1] Fenton 2025: doi.org/10.1542/peds.2024-069896
 *   [2] PediTools: peditools.org/fenton2025
 *   [3] Fenton 2013 systematic review: doi.org/10.1186/1471-2431-13-59
 *   [4] AAP Pediatric Nutrition Handbook 8 ed. 2020
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

// Simplified P10/P50/P90 для weight (g) at PMA — derived from Fenton 2013/2025
// reference. Real implementation должен использовать LMS values через интерполяцию.
const FENTON_WEIGHT_P50: Record<number, number> = {
  // PMA week → P50 weight in grams (approximate, Fenton 2025 male/female combined)
  22: 470,
  24: 600,
  26: 850,
  28: 1100,
  30: 1400,
  32: 1750,
  34: 2150,
  36: 2600,
  38: 3050,
  40: 3500,
  42: 3800,
  44: 4100,
  46: 4400,
  48: 4700,
  50: 5000,
};

function interpolatePMA(pma: number, table: Record<number, number>): number {
  const keys = Object.keys(table)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  if (pma <= keys[0]!) return table[keys[0]!]!;
  if (pma >= keys[keys.length - 1]!) return table[keys[keys.length - 1]!]!;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (pma >= a && pma <= b) {
      const frac = (pma - a) / (b - a);
      return table[a]! + frac * (table[b]! - table[a]!);
    }
  }
  return table[keys[0]!]!;
}

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Fenton 2025 / PediTools / AAP 2020)',
  reference:
    'Fenton TR, Elmrayed S, Alshaikh BN. The 2025 Update of the Fenton Growth Charts. Pediatrics 2025;155:e2024069896. doi:10.1542/peds.2024-069896',
  inputs: [
    {
      id: 'ga',
      label: 'Гестационный возраст при рождении',
      type: 'number',
      unit: 'нед',
      min: 22,
      max: 42,
      step: 1,
      hint: 'Полные недели на момент рождения',
      quickValues: [24, 28, 32, 36, 40],
    },
    {
      id: 'days_after_birth',
      label: 'Дней после рождения (chronological)',
      type: 'number',
      unit: 'дней',
      min: 0,
      max: 200,
      step: 1,
      hint: 'PMA = GA + дни/7',
      quickValues: [0, 7, 14, 28, 60],
    },
    {
      id: 'weight',
      label: 'Текущий вес',
      type: 'number',
      unit: 'г',
      min: 300,
      max: 6500,
      step: 10,
      hint: 'Актуальная масса',
      quickValues: [800, 1500, 2500, 3500],
    },
    {
      id: 'sex',
      label: 'Пол',
      type: 'select',
      options: [
        { value: 'm', label: 'Мужской' },
        { value: 'f', label: 'Женский' },
      ],
    },
  ],
  presets: [
    { label: 'ELBW 28 нед / 0 дней / 1100 г', values: { ga: 28, days_after_birth: 0, weight: 1100, sex: 'm' } },
    { label: '32 нед / 14 дней / 1700 г', values: { ga: 32, days_after_birth: 14, weight: 1700, sex: 'f' } },
    { label: 'Термин 40 нед / 0 / 3500 г', values: { ga: 40, days_after_birth: 0, weight: 3500, sex: 'm' } },
    { label: '34 нед, через 4 нед, 2300 г (SGA?)', values: { ga: 34, days_after_birth: 28, weight: 2300, sex: 'm' } },
  ],
  compute: (v) => {
    const ga = Math.max(22, Math.min(42, Number(v.ga) || 28));
    const days = Math.max(0, Math.min(200, Number(v.days_after_birth) || 0));
    const weight_g = Math.max(300, Math.min(6500, Number(v.weight) || 1500));
    // PMA = GA + chronological age in weeks
    const pma = ga + days / 7;

    // Get P50 expected weight at this PMA
    const expected_p50 = interpolatePMA(pma, FENTON_WEIGHT_P50);

    // Approximate Z-score using simplified SD assumption
    // Real Fenton uses LMS values; here we approximate SD as ~15% of P50
    const sd_approx = expected_p50 * 0.15;
    const z_score = (weight_g - expected_p50) / sd_approx;

    // Approximate percentile from Z-score (normal CDF approximation)
    // P = 0.5 * (1 + erf(z / sqrt(2)))
    function approxPercentile(z: number): number {
      // Abramowitz-Stegun erf approximation
      const t = 1 / (1 + 0.2316419 * Math.abs(z));
      const d = 0.3989423 * Math.exp((-z * z) / 2);
      let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      if (z > 0) p = 1 - p;
      return p * 100;
    }

    const percentile = approxPercentile(z_score);

    // Classification
    let classification: string;
    let color: string;
    if (percentile < 3) {
      classification = '<3-й перцентиль — выраженный SGA';
      color = '#7F1D1D';
    } else if (percentile < 10) {
      classification = '<10-й перцентиль — SGA';
      color = '#EF4444';
    } else if (percentile <= 90) {
      classification = `${Math.round(percentile)}-й перцентиль — AGA (нормальный для возраста)`;
      color = '#22C55E';
    } else if (percentile <= 97) {
      classification = '>90-й перцентиль — LGA';
      color = '#F59E0B';
    } else {
      classification = '>97-й перцентиль — выраженный LGA';
      color = '#EF4444';
    }

    const interpretation = `${weight_g} г при PMA ${pma.toFixed(1)} нед: ${classification}`;

    const details = `### Расчёт PMA

PMA = GA при рождении + chronological age
    = ${ga} + ${days}/7 = **${pma.toFixed(1)} нед PMA**

### Текущий статус роста

| Параметр | Значение |
|---|---|
| Текущий вес | **${weight_g} г** |
| Ожидаемый P50 (Fenton 2025) | ~${expected_p50.toFixed(0)} г |
| Z-score (приблизительно) | **${z_score >= 0 ? '+' : ''}${z_score.toFixed(2)}** |
| Перцентиль (приблизительно) | **${percentile.toFixed(0)}-й** |

### Классификация (Fenton 2025 / WHO)

| Cut-off | Категория |
|---|---|
| <3-й перц. (Z<-1.88) | Выраженный SGA — оценить etiology, monitor |
| 3-10-й перц. (Z<-1.28) | SGA (Small for Gestational Age) |
| 10-90-й перц. | AGA (Appropriate for Gestational Age) |
| >90-й перц. (Z>1.28) | LGA (Large for Gestational Age) |
| >97-й перц. (Z>1.88) | Выраженный LGA — IDM? |

### Reference points (Fenton 2025 P50, simplified)

| PMA нед | P50 вес (г) |
|---|---|
| 22 | 470 |
| 24 | 600 |
| 26 | 850 |
| 28 | 1100 |
| 30 | 1400 |
| 32 | 1750 |
| 34 | 2150 |
| 36 | 2600 |
| 38 | 3050 |
| 40 | 3500 |

⚠️ **Точный расчёт** (с LMS интерполяцией, length, HC, BMI) на peditools.org/fenton2025/`;

    const actions = [
      `Фактический ${classification.toLowerCase()}`,
      percentile < 10
        ? 'SGA — обследование на TORCH, плацентарную недостаточность, генетические синдромы'
        : percentile > 90
          ? 'LGA — исключить материнский диабет (IDM), синдром Beckwith-Wiedemann, hyperinsulinism'
          : 'AGA — стандартный nutrition plan и weekly weight monitoring',
      'Ежедневное взвешивание первые 7-10 дней; затем 2-3× в неделю до выписки',
      'Catch-up growth: цель 15-20 г/кг/сут после первой недели для преэрма',
      'Length и HC monitor weekly; для accurate Fenton percentile использовать длину и HC тоже',
      'Для точных Z-scores и percentiles → peditools.org/fenton2025/',
    ];

    return {
      value: `${percentile.toFixed(0)}-й`,
      unit: `перцентиль (PMA ${pma.toFixed(1)} нед)`,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Bordik MVP — simplified P50 интерполяция; для точных Z-scores и LMS использовать peditools.org/fenton2025/',
        'Z-score >3 или <-3 — extrapolation outside reference range, интерпретация ограничена',
        'Fenton 2025 покрывает 22-50 нед PMA; после 50 нед — переход на WHO Growth (term-corrected)',
        'SGA = <10th percentile — это конституциональная мера, не диагноз; нужна etiology workup',
        'IUGR (intrauterine growth restriction) — динамическая категория, требует серийных измерений',
        'Length и HC critical — preterm часто имеют пропорциональную SGA, но disproportionate (только weight) → IUGR',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: '<3 SGA+', color: '#7F1D1D' },
          { min: 3, max: 10, label: 'SGA', color: '#EF4444' },
          { min: 10, max: 90, label: 'AGA', color: '#22C55E' },
          { min: 90, max: 97, label: 'LGA', color: '#F59E0B' },
          { min: 97, max: 100, label: 'LGA+', color: '#EF4444' },
        ],
        current: percentile,
        unit: 'перц.',
      },
      related: [
        { id: 'intergrowth', title: 'Intergrowth-21st' },
        { id: 'who-growth', title: 'WHO Growth (post-term)' },
        { id: 'ballard', title: 'Ballard GA' },
        { id: 'apgar', title: 'Apgar' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '300.4', title: 'Педиатрия' },
      ],
    };
  },
  info: `### Что такое Fenton 2025

Растовые кривые для **преждевременно родившихся** младенцев от 22 до 50
недель postmenstrual age (PMA). Основной reference в США/Канаде.

**Update 2025:**
- Расширение возрастного диапазона до 50 нед PMA
- Добавлен **BMI-for-age** reference
- Reference data из ~250 000 preterm infants
- Лучшее покрытие micro-preterm (<26 нед)

### Что такое PMA

\`\`\`
PMA (Postmenstrual Age) = GA при рождении + chronological age (нед.)
\`\`\`

Пример: ребёнок родился в 28 нед, прошло 4 нед после рождения
→ PMA = 28 + 4 = **32 нед PMA**.

### Классификация (cut-offs)

| Перцентиль | Z-score | Категория |
|---|---|---|
| <3-й | <-1.88 | Выраженный SGA |
| 3-10-й | -1.28 to -1.88 | SGA |
| 10-90-й | -1.28 to +1.28 | **AGA** (нормальный) |
| >90-й | >1.28 | LGA |
| >97-й | >1.88 | Выраженный LGA |

### Когда использовать Fenton vs альтернативы

| Стандарт | Применение | Возрастной диапазон |
|---|---|---|
| **Fenton 2025** | Преэрм born <37 нед | 22-50 нед PMA |
| **Intergrowth-21st** | Newborn (33+ нед) + post-natal до 64 нед PMA | 33-64 нед PMA |
| **WHO Growth Standards** | Term + post-term, 0-5 лет | 0-260 нед |
| **CDC Growth Charts** | 2-20 лет в США | 2-20 лет |

### Что делать с результатом

| Категория | Действия |
|---|---|
| AGA | Стандартный nutrition plan, weekly weight check |
| SGA (<10 перц.) | TORCH workup, placental insufficiency, генетика |
| LGA (>90 перц.) | IDM exclusion, Beckwith-Wiedemann, hyperinsulinism |
| Catch-up growth | 15-20 г/кг/сут после 1-й нед — преэрм |

### Обязательно мониторить

- **Weight** — daily первые 7-10 дней, затем 2-3× в нед
- **Length** — weekly (важно для proportional vs disproportional SGA)
- **Head circumference** — weekly (критично, последний catch-up)
- **BMI-for-age** (новое в 2025) — индикатор overweight/underweight

### Ограничения Bordik MVP

- Калькулятор — **simplified interpolation** P50; точные Z-scores и
  LMS-based percentiles требуют полного reference dataset
- Length и HC pure не реализованы — добавить в follow-up release
- BMI-for-age не реализован — добавить в follow-up release
- Для точных расчётов рекомендуем **peditools.org/fenton2025/** в
  параллель этому калькулятору

### Источники

- Fenton TR, Elmrayed S, Alshaikh BN. Pediatrics 2025;155:e2024069896
- PediTools 2025: peditools.org/fenton2025/
- Fenton TR, Kim JH. BMC Pediatrics 2013;13:59 (systematic review)
- AAP Pediatric Nutrition Handbook 8 ed. (2020)

### Disclaimer

Образовательно-справочный инструмент. Не заменяет:
- Полные растовые кривые в EMR (Cerner, Epic — встроенный Fenton 2013/2025)
- Клиническое суждение неонатолога
- Серийные измерения (динамика > одна точка)
`,
};

export default runner;
