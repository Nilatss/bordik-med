/**
 * Runner: neo-fluid — Neonatal Fluid Maintenance by Day of Life
 *
 * NEONATOLOGY MODULE A11 (P0). Source attribution:
 *   PRIMARY:    Joosten K, Embleton N, Yan W, et al. ESPGHAN/ESPEN/ESPR/CSPEN
 *               guidelines on pediatric parenteral nutrition: Energy. Clin
 *               Nutr. 2018;37(6 Pt B):2309-2314.
 *               doi:10.1016/j.clnu.2018.06.944
 *               (Companion: full ESPGHAN PN 2018 series — Clin Nutr
 *               37:2306-2308)
 *   GUIDELINE:  Клинические рекомендации МЗ РФ «Парентеральное питание
 *               новорождённых» (последняя редакция 2024).
 *   AAP:       Pediatric Nutrition Handbook 8th ed. (Kleinman/Greer 2020),
 *              chapter 23 — neonatal fluid and electrolyte therapy.
 *
 * Default daily fluid by day of life (term, AGA, no excess losses):
 *   Day 1:    60-80 mL/kg  (start 60 для term, 80 для preterm)
 *   Day 2:    80-100 mL/kg
 *   Day 3:    100-120 mL/kg
 *   Day 4:    120-140 mL/kg
 *   Day 5+:   140-160 mL/kg (maintenance plateau)
 *
 * Adjustments:
 *   - ELBW (<1000 g): start 100 mL/kg day 1, accelerate +20 q24h to 150
 *   - Phototherapy: +10-20 mL/kg/day (insensible losses)
 *   - Radiant warmer (no heat shield): +20-30 mL/kg/day
 *   - Fever (≥38°C): +10-12% per °C above baseline
 *   - Renal failure / SIADH / heart failure: RESTRICT (consult)
 *   - Massive 3rd-spacing (sepsis, NEC): individualised
 *
 * Output: total mL/day + mL/h + warning if patient profile triggers
 * adjustments.
 *
 * Caveats:
 *   - Это MAINTENANCE only — bolus и deficit replacement отдельно
 *   - Day-0 fluid = first 24h after birth (включая delivery room)
 *   - Sodium и electrolyte balance мониторить каждые 12-24 ч в первые 5 дней
 *   - ELBW / VLBW требуют центральный доступ (UVC/PICC) для GIR >12.5%
 *
 * SOURCES (per audit issue 1.15 — структурированные ссылки на
 * первоисточники для каждого порога):
 *   [1] ESPGHAN/ESPEN/ESPR PN 2018 — energy + fluid:
 *       https://pubmed.ncbi.nlm.nih.gov/30053005/
 *   [2] AAP Pediatric Nutrition Handbook 8th ed. (2020)
 *   [3] КР МЗ РФ «Парентеральное питание новорождённых» 2024:
 *       https://cr.minzdrav.gov.ru
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ESPGHAN/ESPEN/ESPR 2018) · РФ (КР МЗ РФ)',
  reference:
    'ESPGHAN/ESPEN/ESPR/CSPEN guidelines on pediatric PN: energy. Clin Nutr 2018;37:2309. КР МЗ РФ «Парентеральное питание новорождённых» 2024.',
  inputs: [
    {
      id: 'weight',
      label: 'Вес при рождении',
      type: 'number',
      unit: 'г',
      min: 300,
      max: 6000,
      step: 10,
      hint: 'Текущий или вес при рождении (для day 0-7)',
      quickValues: [800, 1500, 2500, 3500],
    },
    {
      id: 'day',
      label: 'День жизни',
      type: 'number',
      unit: 'сут',
      min: 0,
      max: 28,
      step: 1,
      hint: 'День 0 = первые 24 часа после рождения',
      quickValues: [0, 1, 2, 3, 5, 7],
    },
    {
      id: 'preterm',
      label: 'Недоношенный (GA <37 нед.)',
      type: 'checkbox',
    },
    {
      id: 'elbw',
      label: 'ЭНМТ (<1000 г) — старт 100 мл/кг день 1',
      type: 'checkbox',
    },
    {
      id: 'phototherapy',
      label: 'Фототерапия (+10-20 мл/кг)',
      type: 'checkbox',
    },
    {
      id: 'warmer',
      label: 'Открытый кювез / radiant warmer без heat shield (+20-30 мл/кг)',
      type: 'checkbox',
    },
    {
      id: 'fever',
      label: 'Лихорадка ≥38°C (+10-12% на °C)',
      type: 'checkbox',
    },
    {
      id: 'restrict',
      label: 'Ограничить (СН / СИАДГ / олигоанурия)',
      type: 'checkbox',
    },
  ],
  presets: [
    { label: 'Доношенный, день 1', values: { weight: 3500, day: 1, preterm: false, elbw: false } },
    { label: 'ЭНМТ 800 г, день 1', values: { weight: 800, day: 1, preterm: true, elbw: true } },
    { label: 'Преэрм 1500 г, день 3', values: { weight: 1500, day: 3, preterm: true, elbw: false } },
    { label: 'Доношенный, день 7', values: { weight: 3500, day: 7, preterm: false, elbw: false } },
  ],
  compute: (v) => {
    const weight_g = Math.max(300, Math.min(6000, Number(v.weight) || 3000));
    const weight_kg = weight_g / 1000;
    const day = Math.max(0, Math.min(28, Number(v.day) || 0));
    const preterm = v.preterm === true;
    const elbw = v.elbw === true;
    const photo = v.phototherapy === true;
    const warmer = v.warmer === true;
    const fever = v.fever === true;
    const restrict = v.restrict === true;

    // Base mL/kg/day by day of life
    let base: number;
    if (elbw) {
      // ELBW start 100, accelerate +20 q24h
      base = Math.min(160, 100 + day * 20);
    } else if (preterm) {
      // Preterm start 80, accelerate similarly to term but slightly higher
      const table = [80, 100, 120, 140, 150, 150, 160, 160];
      base = table[Math.min(day, 7)] ?? 160;
    } else {
      // Term start 60, plateau at 140-160 by day 5-7
      const table = [60, 80, 100, 120, 140, 150, 150, 150];
      base = table[Math.min(day, 7)] ?? 150;
    }

    // Adjustments
    let adjustments_pct = 0;
    if (photo) adjustments_pct += 15; // midpoint of 10-20%
    if (warmer) adjustments_pct += 25; // midpoint of 20-30%
    if (fever) adjustments_pct += 11; // midpoint of 10-12%
    if (restrict) adjustments_pct -= 30; // typical fluid restriction

    const ml_per_kg_per_day = base * (1 + adjustments_pct / 100);
    const total_ml_day = Math.round(ml_per_kg_per_day * weight_kg);
    const ml_per_hour = Math.round((total_ml_day / 24) * 10) / 10;

    // Color & interpretation
    let color = '#22C55E';
    let interpretation = '';
    if (restrict) {
      color = '#F59E0B';
      interpretation = `Ограниченный объём ${total_ml_day} мл/сут (~${ml_per_hour} мл/ч)`;
    } else if (adjustments_pct > 30) {
      color = '#F59E0B';
      interpretation = `Повышенный объём ${total_ml_day} мл/сут (~${ml_per_hour} мл/ч) — учтены потери +${adjustments_pct}%`;
    } else {
      interpretation = `${total_ml_day} мл/сут (~${ml_per_hour} мл/ч)`;
    }

    const adjustNotes: string[] = [];
    if (photo) adjustNotes.push('Фототерапия +10-20 мл/кг (учтено +15%)');
    if (warmer) adjustNotes.push('Открытый кювез/radiant +20-30 (учтено +25%)');
    if (fever) adjustNotes.push('Лихорадка +10-12% на °C (учтено +11%)');
    if (restrict) adjustNotes.push('Ограничение −30% (СН/СИАДГ/анурия)');

    const details = `**Базовый объём:** ${base.toFixed(0)} мл/кг/сут (${
      elbw ? 'ЭНМТ' : preterm ? 'преэрм' : 'термин'
    }, день ${day}).
**Расчётный объём:** ${ml_per_kg_per_day.toFixed(1)} мл/кг/сут × ${weight_kg.toFixed(2)} кг = **${total_ml_day} мл/сут** (~${ml_per_hour} мл/ч).
${adjustNotes.length ? '**Корректировки:**\n- ' + adjustNotes.join('\n- ') : ''}

**Источники объёма по дням** (ESPGHAN 2018 + КР МЗ РФ):
| День | Термин | Преэрм | ЭНМТ |
|---|---|---|---|
| 1 | 60 | 80 | 100 |
| 2 | 80 | 100 | 120 |
| 3 | 100 | 120 | 140 |
| 4 | 120 | 140 | 160 |
| 5+ | 140-160 | 150-160 | 150-160 |
`;

    const actions = [
      'Мониторинг диуреза (цель ≥1 мл/кг/ч), массы тела q12-24ч',
      'Электролиты Na/K/Cl/Ca q12-24ч в первые 5 дней',
      'Раз в сутки пересчитать на актуальный вес',
      'Глюкоза в инфузии: GIR 4-6 мг/кг/мин старт, до 8-12 для роста',
      restrict ? 'Гемодинамика, ЦВД, BNP при подозрении СН' : '',
      total_ml_day < 50 || total_ml_day > 600 ? '⚠️ Проверить ввод (объём вне типичного диапазона)' : '',
    ].filter(Boolean);

    return {
      value: String(total_ml_day),
      unit: 'мл/сут',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Только maintenance — bolus и deficit replacement отдельно',
        'Day 0 = первые 24 ч после рождения, включая родзал',
        'Контроль Na/осмолярности — гипонатриемия частая ошибка при hypotonic растворах',
        'GIR >12.5% или Ca/K/Mg концентраты — только через центральный доступ (UVC/PICC)',
        'Не валидировано для anuric / oliguric / SIADH / тяжёлой СН — индивидуальный расчёт',
        'При фототерапии + radiant warmer одновременно — пересмотреть в сторону ↑',
      ],
      scale: {
        segments: [
          { min: 0, max: 80, label: 'День 0-1', color: '#3B82F6' },
          { min: 80, max: 120, label: 'День 1-3', color: '#22C55E' },
          { min: 120, max: 150, label: 'День 3-5', color: '#84CC16' },
          { min: 150, max: 200, label: 'Plateau', color: '#F59E0B' },
        ],
        current: ml_per_kg_per_day,
        unit: 'мл/кг/сут',
      },
      related: [
        { id: 'neo-gir', title: 'GIR (глюкоза)' },
        { id: 'holliday-segar', title: 'Holliday-Segar (>28 дней)' },
        { id: 'apgar', title: 'Apgar' },
        { id: 'ballard', title: 'Ballard GA' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '300.4', title: 'Интенсивная терапия' },
      ],
    };
  },
  info: `### Для чего используется

Стартовый расчёт суточного объёма жидкости новорождённому в первые
~7 дней жизни. После day 5-7 переходим на устойчивый maintenance
(140-160 мл/кг/сут термин, 150-160 преэрм/ЭНМТ).

### Базовая таблица (мл/кг/сут)

| День | Термин | Преэрм (32-36 нед) | ЭНМТ (<1000 г) |
|---|---|---|---|
| 1 | 60-80 | 80-100 | 100-120 |
| 2 | 80-100 | 100-120 | 120-140 |
| 3 | 100-120 | 120-140 | 140 |
| 4 | 120-140 | 140 | 150 |
| 5+ | 140-160 | 150-160 | 150-160 |

### Корректировки (insensible losses)

| Фактор | Прибавка |
|---|---|
| Фототерапия (single-band) | +10-20% |
| Фототерапия (двойная / БЛ) | +30% |
| Открытый radiant warmer без heat shield | +20-30% |
| Лихорадка | +10-12% на °C |
| Тахипное | +5-10% |
| Двойные стенки кювеза, влажность 80% | без коррекции |

### Ограничение жидкости

| Состояние | Тактика |
|---|---|
| Сердечная недостаточность | 60-80% от расчёта, индивидуально |
| СИАДГ / гипонатриемия dilutional | 50-70%, повышение Na в инфузии |
| Анурия / олигурия (<0.5 мл/кг/ч × 2ч) | 30-50% (insensible only до восстановления диуреза) |
| Тяжёлая ВЖК III-IV | 60-80%, во избежание pressure swings |

### Натрий и электролиты (паралельно)

- **Day 0-3:** Na 0-3 ммоль/кг/сут (ELBW часто 0 в первые сутки)
- **Day 4+:** Na 2-5, K 2-3, Cl 2-5, Ca 2-3 ммоль/кг/сут
- Glucose: GIR 4-6 старт, рост 1-2 мг/кг/мин/сут до целевых 8-12

### Мониторинг

- Диурез q4-12ч (цель ≥1 мл/кг/ч)
- Масса q12-24ч (физиологическая потеря 7-10% термин, 10-15% преэрм)
- Na, K, Cl, Cr, лактат q12-24ч в первые 5 дней
- Осмолярность сыворотки если Na патологичен

### Источники

- ESPGHAN/ESPEN/ESPR/CSPEN PN 2018 — Clin Nutr 37:2306-2314.
- AAP Pediatric Nutrition Handbook 8th ed. 2020.
- КР МЗ РФ «Парентеральное питание новорождённых» 2024 — cr.minzdrav.gov.ru.
- BAPM Framework for Practice 2017 (Hypoglycaemia + perinatal fluid).

### Ограничения

- Калькулятор стартовый — реальный план обновляется ежедневно по
  актуальному весу, диурезу, Na, и клинике
- Не предназначен для anuric / SIADH / тяжёлой СН (индивидуальный расчёт)
- Bolus при шоке (10-20 мл/кг NS) считается отдельно
- При TPN расчёт жидкости интегрируется с белком/липидами/глюкозой/электролитами
`,
};

export default runner;
