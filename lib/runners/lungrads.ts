// @ts-nocheck
/** Runner: lungrads */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'type',
      label: 'Тип узла',
      type: 'select',
      options: [
        { value: 'solid', label: 'Солидный' },
        { value: 'partsolid', label: 'Часть-солидный (part-solid)' },
        { value: 'ggn', label: 'Матовое стекло (GGN / non-solid)' },
      ],
    },
    {
      id: 'size',
      label: 'Размер узла (мм, наибольший)',
      type: 'number',
      min: 0,
      max: 80,
      step: 0.5,
    },
    {
      id: 'solid',
      label: 'Размер солидного компонента (мм, для part-solid)',
      type: 'number',
      min: 0,
      max: 80,
      step: 0.5,
    },
    {
      id: 'baseline',
      label: 'Первичное исследование (baseline)',
      type: 'checkbox',
    },
    {
      id: 'stable',
      label: 'Стабилен ≥ 3 мес без роста',
      type: 'checkbox',
    },
  ],
  compute: (v) => {
    const type = String(v.type);
    const size = Number(v.size) || 0;
    const solid = Number(v.solid) || 0;
    const baseline = !!v.baseline;
    const stable = !!v.stable;

    let category = '2';
    let color = '#22C55E';
    let action = 'Рутинный LDCT через 12 мес';
    let risk = '< 1%';

    if (size === 0) {
      category = '1';
      color = '#22C55E';
      risk = '< 1%';
      action = 'Рутинный LDCT через 12 мес';
    } else if (type === 'solid') {
      if (size < 6) { category = '2'; color = '#22C55E'; risk = '< 1%'; action = 'LDCT через 12 мес'; }
      else if (size < 8) { category = '3'; color = '#F59E0B'; risk = '1-2%'; action = 'LDCT через 6 мес'; }
      else if (size < 15) { category = '4A'; color = '#EF4444'; risk = '5-15%'; action = 'LDCT через 3 мес / PET-CT при ≥ 8 мм'; }
      else { category = '4B'; color = '#7F1D1D'; risk = '> 15%'; action = 'PET-CT + биопсия / тора­кальный хирург'; }
    } else if (type === 'partsolid') {
      if (size < 6) { category = '2'; color = '#22C55E'; risk = '< 1%'; action = 'LDCT через 12 мес'; }
      else if (solid < 6) { category = '3'; color = '#F59E0B'; risk = '1-2%'; action = 'LDCT через 6 мес'; }
      else if (solid < 8) { category = '4A'; color = '#EF4444'; risk = '5-15%'; action = 'LDCT через 3 мес'; }
      else { category = '4B'; color = '#7F1D1D'; risk = '> 15%'; action = 'PET-CT + биопсия'; }
    } else {
      if (size < 30) { category = '2'; color = '#22C55E'; risk = '< 1%'; action = 'LDCT через 12 мес'; }
      else { category = '3'; color = '#F59E0B'; risk = '1-2%'; action = 'LDCT через 6 мес'; }
    }

    if (stable && !baseline) {
      category = category + 'S';
      action += ' (стабильный узел — меньшая подозрительность)';
    }

    const catNum = category.startsWith('4B') ? 5 : category.startsWith('4A') ? 4 : category.startsWith('4X') ? 6 : category.startsWith('3') ? 3 : category.startsWith('2') ? 2 : 1;

    return {
      value: `Lung-RADS ${category}`,
      unit: type === 'solid' ? 'solid' : type === 'partsolid' ? 'part-solid' : 'GGN',
      interpretation: `Lung-RADS ${category} — риск малигнизации: ${risk}`,
      color,
      details: `Категория Lung-RADS ${category}. ${type === 'partsolid' ? `Узел ${size} мм, солидный компонент ${solid} мм.` : `Узел ${size} мм.`} Рекомендация: ${action}.`,
      actions: [
        action,
        category.startsWith('4') ? 'Мультидисциплинарный консилиум (торакальный хирург, пульмонолог)' : '',
        category.startsWith('4') && size >= 8 ? 'PET-CT для оценки метаболической активности (SUVmax > 2.5 подозрительно)' : '',
        baseline ? 'Baseline скрининг — сравнение с предыдущими CT невозможно' : 'Сравнить с предыдущими LDCT (рост > 1.5 мм или > 2 года VDT подозрительны)',
        'Курение: продолжать скрининг LDCT до 77 лет (USPSTF 2021: 50-80 лет, ≥ 20 pack-years)',
      ].filter(Boolean),
      caveats: [
        'ACR Lung-RADS v2022 — стандарт для LDCT-скрининга рака лёгкого',
        'Применим только для LDCT-скрининга (не для диагностических КТ)',
        'Размер = среднее долгой и короткой оси',
        'Volume doubling time (VDT) < 400 дней подозрителен',
        'Lung-RADS 4X — особые дополнительные находки (лимфаденопатия, плевральный выпот)',
        'Категория 0 — неполное исследование / необходимо сравнение с предыдущим',
      ],
      scale: {
        segments: [
          { min: 1, max: 3, label: '1-2', color: '#22C55E' },
          { min: 3, max: 4, label: '3', color: '#F59E0B' },
          { min: 4, max: 5, label: '4A', color: '#EF4444' },
          { min: 5, max: 7, label: '4B/4X', color: '#7F1D1D' },
        ],
        current: catNum,
        unit: 'Lung-RADS',
      },
      related: [
        { id: 'birads', title: 'BI-RADS' },
        { id: 'tirads', title: 'TI-RADS' },
        { id: 'pirads', title: 'PI-RADS' },
      ],
      relatedCourses: [
        { id: '311.1', title: 'Лучевая диагностика' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'American College of Radiology. Lung-RADS Version 2022. Reston, VA: ACR; 2022.',
  countries: 'Международный (ACR, USPSTF)',
  presets: [
    { label: 'Lung-RADS 2', values: { type: 'solid', size: 4, solid: 0, baseline: true, stable: false } },
    { label: 'Lung-RADS 4A', values: { type: 'solid', size: 10, solid: 0, baseline: false, stable: false } },
    { label: 'Lung-RADS 4B', values: { type: 'solid', size: 20, solid: 0, baseline: false, stable: false } },
  ],
  info: `### Для чего используется
**ACR Lung-RADS v2022** — стандартизированная категоризация узлов лёгкого на низкодозовой КТ (LDCT) при скрининге рака лёгкого у курильщиков.

### Показания к скринингу (USPSTF 2021)
- Возраст **50-80 лет**
- **≥ 20 pack-years** курения
- Курит сейчас или бросил **< 15 лет назад**
- Ежегодный LDCT до отказа от скрининга / 15 лет без курения

### Категории
| Кат. | Описание | Риск | Управление |
|---|---|---|---|
| **0** | Неполное | N/A | Повторить / сравнить |
| **1** | Негативное | < 1% | LDCT через 12 мес |
| **2** | Доброкачественное | < 1% | LDCT через 12 мес |
| **3** | Вероятно доброкачественное | 1-2% | LDCT через 6 мес |
| **4A** | Подозрительное | 5-15% | LDCT через 3 мес / PET-CT |
| **4B** | Очень подозрительное | > 15% | PET-CT / биопсия |
| **4X** | Доп. находки | Высокий | Индивидуальная тактика |
| **S** | Модификатор: клинически значимая не-малигн. находка | N/A | — |

### Размерные пороги (солидные)
| Размер | Baseline | Предыдущий |
|---|---|---|
| < 6 мм | 2 | 2 |
| 6-7 мм | 3 | 4A |
| 8-14 мм | 4A | 4A |
| ≥ 15 мм | 4B | 4B |

### Часть-солидные (part-solid)
- Оценивается по размеру **солидного компонента**
- Солидный компонент ≥ 8 мм → 4A/4B
- Чистый GGN ≥ 30 мм → 3

### Рост
- Δ ≥ 1.5 мм → категория ↑
- VDT < 400 дней → подозрительно

### Ограничения
- НЕ для симптомных пациентов (только скрининг)
- Не оценивает медиастинальные лимфоузлы детально
- Требует сравнения с предыдущими LDCT`,
};
export default runner;
