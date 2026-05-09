/**
 * Runner: neo-gir — Glucose Infusion Rate (GIR) для новорождённых
 *
 * NEONATOLOGY MODULE A12 (P0). Source attribution:
 *   PRIMARY:    Mesotten D, Joosten K, van Kempen A, et al. ESPGHAN/ESPEN/
 *               ESPR/CSPEN guidelines on pediatric parenteral nutrition:
 *               Carbohydrates. Clin Nutr. 2018;37(6 Pt B):2337-2343.
 *               doi:10.1016/j.clnu.2018.06.947
 *   GUIDELINE:  PES 2015 — Thornton PS et al. Recommendations from the
 *               Pediatric Endocrine Society for Evaluation and Management
 *               of Persistent Hypoglycemia in Neonates, Infants, and
 *               Children. J Pediatr. 2015;167(2):238-245.
 *   AAP 2011:  Adamkin DH. Postnatal glucose homeostasis in late-preterm
 *              and term infants. Pediatrics 2011;127(3):575-579.
 *
 * Formula:
 *   GIR (mg/kg/min) = (rate_mL_h × dextrose_% × 10) / (60 × weight_kg)
 *                   = (rate × dextrose × 0.167) / weight_kg
 *
 * Equivalent simplified:
 *   GIR = % × rate / (6 × weight_kg)   when rate is mL/h, weight kg
 *
 * Bands:
 *   <4   → недостаточно (риск гипогликемии в первые 48 ч)
 *   4-6  → стартовый maintenance
 *   6-8  → maintenance + рост
 *   8-12 → активный рост / pre-PN-only feeding
 *   12-15 → потолок энтеро-глюкозы (рассмотрение центрального доступа)
 *   >15  → гипергликемия / риск гиперосмолярности (требует инсулин)
 *
 * Целевые уровни глюкозы крови (термин <48ч):
 *   ≥45 мг/дл (2.6 ммоль/л) — пороговое
 *   ≥50 мг/дл (2.8 ммоль/л) — целевой
 *   <40 мг/дл — гипогликемия → bolus 200 мг/кг (2 мл/кг 10% glucose) +
 *                              старт инфузии GIR 6-8
 *
 * Caveats:
 *   - GIR >12.5 мг/кг/мин = осмолярность >900 мОсм/л → центральный венозный
 *     доступ (UVC/PICC)
 *   - При гипергликемии (>180 мг/дл устойчиво) — снизить GIR на 1-2,
 *     не вводить инсулин рутинно (риск hypos)
 *   - У SGA / IUGR / диабетических матерей — выше потребность в первые 24ч
 *   - PES 2015: в первые 4-72 ч цели ≥45-50 мг/дл; после 72 ч ≥60 мг/дл
 *
 * SOURCES (audit 1.15):
 *   [1] ESPGHAN PN 2018 carbohydrates: pubmed.ncbi.nlm.nih.gov/30053005
 *   [2] PES 2015 hypoglycemia: doi.org/10.1016/j.jpeds.2015.03.057
 *   [3] AAP 2011 postnatal glucose homeostasis: doi:10.1542/peds.2010-3851
 *   [4] BAPM Framework 2017: bapm.org/resources/40
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ESPGHAN 2018) · США (PES 2015 / AAP 2011) · UK (BAPM 2017)',
  reference:
    'Mesotten D et al. ESPGHAN/ESPEN/ESPR/CSPEN PN 2018 carbohydrates. Clin Nutr 2018;37:2337. Thornton PS PES 2015. J Pediatr 2015;167:238.',
  inputs: [
    {
      id: 'weight',
      label: 'Вес',
      type: 'number',
      unit: 'г',
      min: 300,
      max: 6000,
      step: 10,
      hint: 'Текущий вес в граммах',
      quickValues: [800, 1500, 2500, 3500],
    },
    {
      id: 'rate',
      label: 'Скорость инфузии',
      type: 'number',
      unit: 'мл/ч',
      min: 0.1,
      max: 50,
      step: 0.1,
      hint: 'Объём инфузионного раствора в мл/час',
      quickValues: [3, 5, 8, 12, 15],
    },
    {
      id: 'dextrose',
      label: 'Концентрация декстрозы',
      type: 'select',
      options: [
        { value: '5', label: '5% (D5W)' },
        { value: '7.5', label: '7.5% (D7.5)' },
        { value: '10', label: '10% (D10W) — стандарт неонатальный' },
        { value: '12.5', label: '12.5% (D12.5) — потолок периферической вены' },
        { value: '15', label: '15% (D15) — только центральный доступ' },
        { value: '20', label: '20% (D20) — только центральный доступ' },
      ],
    },
  ],
  presets: [
    { label: 'Термин 3500 г, D10 8 мл/ч', values: { weight: 3500, rate: 8, dextrose: '10' } },
    { label: 'ELBW 800 г, D10 3 мл/ч', values: { weight: 800, rate: 3, dextrose: '10' } },
    { label: 'Преэрм 1500 г, D12.5 5 мл/ч', values: { weight: 1500, rate: 5, dextrose: '12.5' } },
    { label: 'Гипогликемия — D10 6 мл/ч на 2.5 кг', values: { weight: 2500, rate: 6, dextrose: '10' } },
  ],
  compute: (v) => {
    const weight_g = Math.max(300, Math.min(6000, Number(v.weight) || 3000));
    const weight_kg = weight_g / 1000;
    const rate = Math.max(0.1, Math.min(50, Number(v.rate) || 5));
    const dex_pct = Math.max(2.5, Math.min(25, Number(v.dextrose) || 10));

    // GIR = (rate × dextrose%) / (6 × weight_kg)
    // = mg/min / kg, where:
    //   1 mL D10 = 100 mg dextrose
    //   rate (mL/h) × pct/100 × 1000 (mg/g) / 60 / weight_kg
    const gir = (rate * dex_pct) / (6 * weight_kg);
    const gir_rounded = Math.round(gir * 10) / 10;

    // Calorie contribution (3.4 kcal/g dextrose)
    const grams_per_day = (rate * 24 * dex_pct) / 100;
    const kcal_per_day = grams_per_day * 3.4;
    const kcal_per_kg_day = kcal_per_day / weight_kg;

    // Band + interpretation
    let interpretation = '';
    let color = '#22C55E';
    let actions: string[] = [];

    if (gir < 4) {
      color = '#EF4444';
      interpretation = `GIR ${gir_rounded} мг/кг/мин — недостаточно`;
      actions = [
        'GIR <4 — риск гипогликемии у новорождённого',
        'Минимум для термина 4-6, преэрма 5-7',
        'Увеличить скорость инфузии или концентрацию декстрозы',
        'Контроль глюкозы крови q1-2ч до стабилизации ≥2.6 ммоль/л',
      ];
    } else if (gir < 6) {
      color = '#84CC16';
      interpretation = `GIR ${gir_rounded} мг/кг/мин — стартовый maintenance`;
      actions = [
        'Минимальный maintenance, подходит на первые часы стабилизации',
        'Пересмотреть к 24ч в сторону 6-8 для роста',
        'Глюкоза крови q4-6ч',
      ];
    } else if (gir < 8) {
      color = '#22C55E';
      interpretation = `GIR ${gir_rounded} мг/кг/мин — целевой maintenance`;
      actions = [
        'Стандартный целевой диапазон для стабильного новорождённого',
        'Глюкоза крови q6-12ч после стабилизации',
      ];
    } else if (gir <= 12) {
      color = '#22C55E';
      interpretation = `GIR ${gir_rounded} мг/кг/мин — активный рост`;
      actions = [
        'Целевой для активного роста и прибавки массы',
        'ESPGHAN 2018: max 12 мг/кг/мин для preterm в первые сутки',
        'Контроль гипергликемии (>180 мг/дл = снижение GIR на 1-2)',
      ];
    } else if (gir <= 15) {
      color = '#F59E0B';
      interpretation = `GIR ${gir_rounded} мг/кг/мин — высокий, риск гипергликемии`;
      actions = [
        'GIR >12.5 → осмолярность >900 мОсм/л → ОБЯЗАТЕЛЕН центральный доступ (UVC/PICC)',
        'Глюкоза крови q4-6ч; цель ≤180 мг/дл (10 ммоль/л)',
        'При persistent гипергликемии — снизить GIR, рассмотреть инсулин (только при stable >180 × ≥6ч)',
      ];
    } else {
      color = '#EF4444';
      interpretation = `GIR ${gir_rounded} мг/кг/мин — критически высокий`;
      actions = [
        '⚠️ GIR >15 — почти всегда гипергликемия, осмолярный стресс',
        'Снизить GIR на 2-3 каждые 4-6ч до ≤12',
        'Проверить ввод (вес, скорость, концентрация — частая ошибка)',
        'Только через центральный доступ; периферия противопоказана',
      ];
    }

    if (dex_pct >= 12.5) {
      actions.push('⚠️ D ≥12.5% требует центрального доступа (флебит/некроз периферии)');
    }

    const details = `**Расчёт:**
GIR = (${rate} мл/ч × ${dex_pct}%) ÷ (6 × ${weight_kg.toFixed(2)} кг) = **${gir_rounded} мг/кг/мин**

**Калорийность:**
- Углеводы: ${grams_per_day.toFixed(1)} г/сут
- Энергия: **${kcal_per_day.toFixed(0)} ккал/сут** (${kcal_per_kg_day.toFixed(0)} ккал/кг/сут)
- 3.4 ккал/г декстрозы

**Целевые диапазоны GIR (мг/кг/мин):**
| Сценарий | GIR |
|---|---|
| Минимум термин (avoid hypoglycaemia) | 4-6 |
| Стандарт maintenance | 6-8 |
| Активный рост / pre-feeding | 8-12 |
| Потолок ESPGHAN day 1 (преэрм) | 12 |
| Maximum при стабильности (центр.) | 12-15 |

**Целевые уровни глюкозы крови:**
- 0-4 ч: ≥30 мг/дл (1.7 ммоль/л) — допустимая транзиторная hypo
- 4-72 ч: ≥45-50 мг/дл (2.6-2.8 ммоль/л) — PES 2015
- >72 ч: ≥60 мг/дл (3.3 ммоль/л)
- При гипогликемии симптоматичной: bolus 200 мг/кг = 2 мл/кг D10, затем GIR 6-8`;

    return {
      value: String(gir_rounded),
      unit: 'мг/кг/мин',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'GIR >12.5 → осмолярность >900 мОсм/л → ОБЯЗАТЕЛЕН центральный венозный доступ',
        'У SGA/IUGR/детей диабетических матерей выше базовая потребность в первые 24ч',
        'При persistent hyperglycemia — сначала снижение GIR, инсулин только при stable >180×≥6ч (риск hypos)',
        'Lipids 1-3 г/кг/сут добавляют ~9 ккал/г (нужны для total energy ≥80-100 ккал/кг/сут)',
        'PES 2015 cut-offs пороговые, не цели — клинически symptomatic hypo всегда лечить',
        'Bolus при hypoglycaemia: 2 мл/кг D10 = 200 мг/кг, затем continuous GIR 6-8',
      ],
      scale: {
        segments: [
          { min: 0, max: 4, label: 'Низкий', color: '#EF4444' },
          { min: 4, max: 6, label: 'Старт', color: '#84CC16' },
          { min: 6, max: 12, label: 'Цель', color: '#22C55E' },
          { min: 12, max: 15, label: 'Высокий', color: '#F59E0B' },
          { min: 15, max: 25, label: 'Опасн.', color: '#EF4444' },
        ],
        current: gir_rounded,
        unit: 'мг/кг/мин',
      },
      related: [
        { id: 'neo-fluid', title: 'Жидкость по дням' },
        { id: 'apgar', title: 'Apgar' },
        { id: 'ballard', title: 'Ballard GA' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '301.5', title: 'Эндокринология' },
      ],
    };
  },
  info: `### Что считает

GIR (Glucose Infusion Rate) — скорость поступления глюкозы в мг/кг/мин
из непрерывной инфузии. Ключевой параметр для:
- Профилактики гипогликемии у новорождённого
- Калорийной поддержки (3.4 ккал/г декстрозы)
- Решения о доступе (периферия vs центр)

### Формула

\`\`\`
GIR (мг/кг/мин) = (rate × dextrose%) / (6 × weight_kg)
\`\`\`

где rate в мл/ч, dextrose в %, weight в кг.

**Пример:** D10 8 мл/ч на 3.5 кг → (8 × 10) / (6 × 3.5) = 3.81 мг/кг/мин.

### Целевые диапазоны

| GIR | Сценарий | Тактика |
|---|---|---|
| <4 | Недостаточно | ↑ rate / dextrose, контроль глюкозы q1-2ч |
| 4-6 | Стартовый | Перейти на 6-8 в течение 24ч |
| 6-8 | Стандарт maintenance | Контроль q6-12ч |
| 8-12 | Активный рост | ESPGHAN max для day 1 преэрма |
| 12-15 | Высокий | Центральный доступ обязателен |
| >15 | Критический | Снизить, проверить ввод |

### Целевые уровни глюкозы крови (PES 2015)

| Возраст | Минимум | Цель |
|---|---|---|
| 0-4 ч | ≥30 мг/дл (1.7) | Симптомы → ≥45 (2.6) |
| 4-72 ч | ≥45 мг/дл (2.6) | ≥50 мг/дл (2.8) |
| >72 ч | ≥60 мг/дл (3.3) | ≥70 (3.9) |

### Гипогликемия — лечение

- **Симптоматичная или <40 мг/дл (2.2 ммоль/л):** bolus 2 мл/кг D10
  (=200 мг/кг) + старт инфузии GIR 6-8 → пересмотр через 30 мин
- **Бессимптомная 40-45 мг/дл:** trial кормление + повтор через 30 мин
- **Persistent (≥3 эпизодов или >24ч):** GIR ↑ до 12-15, исследовать
  causes (hyperinsulinism, IDM, sepsis, metabolic disease)

### Гипергликемия — лечение

- Cut-off обычно ≥180 мг/дл (10 ммоль/л) при ≥2 измерениях
- **Сначала** — снизить GIR на 1-2 мг/кг/мин (не быстрее)
- Инсулин **только при стабильной** гипергликемии >180 мг/дл × ≥6ч
  (риск hypos выше, чем benefit) — старт 0.05 ЕД/кг/ч
- Цель: 100-150 мг/дл (5.5-8.3 ммоль/л)

### Калорийный вклад

Углеводы (3.4 ккал/г) дают 60-70% non-protein calories. Total energy
для роста: 80-100 ккал/кг/сут (термин), 110-130 (преэрм).

### Источники

- ESPGHAN/ESPEN/ESPR/CSPEN PN 2018 — Clin Nutr 37:2337.
- PES 2015 (Thornton) — J Pediatr 167:238.
- AAP 2011 (Adamkin) — Pediatrics 127:575.
- BAPM Framework 2017 — bapm.org.

### Ограничения

- Расчёт только для continuous infusion; bolus рассматривается отдельно
- При TPN добавить вклад липидов и белка отдельно
- Не валидирован для шока, тяжёлой ВЖК, hyperinsulinism (индивидуально)
- Проверить совместимость с другими растворами в линии (Ca + PO4 преципитация)
`,
};

export default runner;
