// @ts-nocheck
/** Runner: faced */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'fev1', label: 'ОФВ₁ (% от предсказанного)', type: 'select', options: [
      { value: 'ge50', label: '≥ 50 % — 0 баллов' },
      { value: 'lt50', label: '< 50 % — 2 балла' },
    ] },
    { id: 'age', label: 'Возраст', type: 'select', options: [
      { value: 'le70', label: '≤ 70 лет — 0 баллов' },
      { value: 'gt70', label: '> 70 лет — 2 балла' },
    ] },
    { id: 'psa', label: 'Хроническая колонизация Pseudomonas aeruginosa', type: 'checkbox', points: 1 },
    { id: 'extent', label: 'Поражение ≥ 2 долей (HRCT)', type: 'checkbox', points: 1 },
    { id: 'dyspnoea', label: 'mMRC ≥ 2 (одышка)', type: 'checkbox', points: 1 },
  ],
  compute: (v) => {
    const fevPts = v.fev1 === 'lt50' ? 2 : 0;
    const agePts = v.age === 'gt70' ? 2 : 0;
    const psaPts = v.psa ? 1 : 0;
    const extPts = v.extent ? 1 : 0;
    const dysPts = v.dyspnoea ? 1 : 0;
    const score = fevPts + agePts + psaPts + extPts + dysPts;

    let label = '', color = '', interp = '', mort = '';
    if (score <= 2) {
      label = 'Лёгкий';
      color = '#10B981';
      interp = 'Лёгкие бронхоэктазы. Низкая 5-летняя смертность (< 5 %).';
      mort = '< 5 %';
    } else if (score <= 4) {
      label = 'Умеренный';
      color = '#F59E0B';
      interp = 'Умеренная тяжесть. 5-летняя смертность ~ 5-20 %.';
      mort = '5-20 %';
    } else {
      label = 'Тяжёлый';
      color = '#EF4444';
      interp = 'Тяжёлые бронхоэктазы. 5-летняя смертность > 50 %. Агрессивная терапия и мониторинг.';
      mort = '> 50 %';
    }

    return {
      value: String(score) + ' баллов',
      interpretation: interp,
      color,
      details: `ОФВ₁: ${fevPts} • Возраст: ${agePts} • Pseudomonas: ${psaPts} • ≥ 2 долей: ${extPts} • mMRC ≥ 2: ${dysPts}. 5-летняя смертность: ${mort}.`,
      actions: [
        score >= 3 ? 'Ингаляционные антибиотики при хроническом Pseudomonas (колистин, тобрамицин)' : 'Гигиена дыхательных путей (постуральный дренаж, PEP-устройства)',
        'Регулярная физиотерапия и очищение дыхательных путей',
        'Вакцинация: грипп, пневмококк, COVID-19',
        score >= 5 ? 'Оценка в специализированном центре, рассмотреть трансплантацию лёгких' : 'Лечение обострений с культурой мокроты',
      ],
      caveats: [
        'Разработан для не-CF бронхоэктазов взрослых',
        'Альтернатива — Bronchiectasis Severity Index (BSI) с 9 параметрами',
        'Не учитывает обострения в анамнезе (BSI — да)',
        'Валидирован в многоцентровом европейском когорте (n = 819)',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'лёгкий', color: '#10B981' },
          { min: 3, max: 4, label: 'умеренный', color: '#F59E0B' },
          { min: 5, max: 7, label: 'тяжёлый', color: '#EF4444' },
        ],
        current: score,
        unit: 'балл.',
      },
      related: [
        { id: 'mmrc', title: 'mMRC' },
        { id: 'gold', title: 'GOLD' },
        { id: 'gli', title: 'GLI' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Пульмонология' },
        { id: '305.4', title: 'Инфекции' },
      ],
    };
  },
  reference: 'Martínez-García MA et al. FACED score. Eur Respir J 2014;43(5):1357-67.',
  countries: 'Международный (ERS)',
  presets: [
    { label: 'Лёгкий (1 балл)', values: { fev1: 'ge50', age: 'le70', psa: false, extent: true, dyspnoea: false } },
    { label: 'Умеренный (4 балла)', values: { fev1: 'lt50', age: 'le70', psa: true, extent: true, dyspnoea: false } },
    { label: 'Тяжёлый (7 баллов)', values: { fev1: 'lt50', age: 'gt70', psa: true, extent: true, dyspnoea: true } },
  ],
  info: `### Для чего используется
**FACED** — прогностическая шкала 5-летней смертности при **бронхоэктазах (не муковисцидозной этиологии)**.

### Мнемоника FACED
| Буква | Параметр | Баллы |
|---|---|---|
| **F** | FEV₁ < 50 % | 2 |
| **A** | Age > 70 | 2 |
| **C** | Chronic colonization Pseudomonas | 1 |
| **E** | Extension ≥ 2 lobes | 1 |
| **D** | Dyspnoea mMRC ≥ 2 | 1 |

Диапазон: 0-7.

### Интерпретация
| Балл | Тяжесть | 5-летняя смертность |
|---|---|---|
| 0-2 | Лёгкие | < 5 % |
| 3-4 | Умеренные | ~ 10-20 % |
| 5-7 | Тяжёлые | > 50 % |

### Клиническое применение
- Стратификация риска для планирования интенсивности наблюдения
- Решение о направлении в специализированный центр
- Обсуждение прогноза с пациентом

### Альтернатива — BSI
**Bronchiectasis Severity Index** (Chalmers 2014) — 9 параметров, включая госпитализации и обострения. Лучше прогнозирует обострения, FACED — смертность.

### Ограничения
- Только для взрослых, не-CF
- Не учитывает частоту обострений
- Pseudomonas колонизация определяется как ≥ 2 позитивных культуры с интервалом ≥ 3 мес

### Источник
Martínez-García MA et al. Eur Respir J 2014;43(5):1357-67.`,
};

export default runner;
