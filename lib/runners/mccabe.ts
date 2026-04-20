// @ts-nocheck
/** Runner: mccabe — McCabe-Jackson prognosis classification */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'category',
      label: 'Основное заболевание / прогноз',
      type: 'select',
      options: [
        { value: 'non_fatal', label: 'Нефатальное (ожидаемая продолжительность > 5 лет)' },
        { value: 'ultimately_fatal', label: 'В конечном итоге фатальное (прогноз 1–5 лет)' },
        { value: 'rapidly_fatal', label: 'Быстро фатальное (< 1 года)' },
      ],
    },
  ],
  compute: (v) => {
    const cat = String(v.category || 'non_fatal');

    let label = '';
    let mortality1y = '';
    let mortality5y = '';
    let color = '#22C55E';
    let examples = '';

    if (cat === 'non_fatal') {
      label = 'Нефатальное';
      mortality1y = '< 5 %';
      mortality5y = '~ 10 %';
      color = '#22C55E';
      examples = 'ХБП 1–3, компенсированная ХСН, СД 2 без осложнений, ГБ, РА, БА, ХОБЛ GOLD 1–2, здоровые';
    } else if (cat === 'ultimately_fatal') {
      label = 'В конечном итоге фатальное';
      mortality1y = '~ 20–30 %';
      mortality5y = '~ 60–70 %';
      color = '#F59E0B';
      examples = 'ХСН IV, ХБП 4–5 (диализ), ХОБЛ GOLD 4, цирроз Child B, онкология стабильная, СПИД на ART с низкой ВН';
    } else {
      label = 'Быстро фатальное';
      mortality1y = '> 50 %';
      mortality5y = '~ 95 %';
      color = '#EF4444';
      examples = 'Острый лейкоз без ремиссии, метастатическая онкология, цирроз Child C, СПИД продвинутый, терминальная стадия';
    }

    return {
      value: label,
      unit: '',
      interpretation: `1-год смертность: ${mortality1y}; 5-лет: ${mortality5y}. Примеры: ${examples}.`,
      color,
      details: `McCabe-Jackson (1962) — простая классификация прогноза основного заболевания, используется для стратификации в эпидемиологии нозокомиальных инфекций и антибиотикотерапии. Коррелирует с смертностью от грам-негативной бактериемии.`,
      actions: [
        cat === 'non_fatal' ? 'Стандартная антибиотикотерапия, деэскалация после посева' : null,
        cat === 'ultimately_fatal' ? 'Агрессивная терапия инфекции, но учитывать переносимость; обсудить цели лечения с пациентом' : null,
        cat === 'rapidly_fatal' ? 'Обсудить цели лечения, DNR/DNI при согласии; паллиативный подход возможен' : null,
        'Использовать при эпидемиологических исследованиях нозокомиальных инфекций (стратификация по McCabe + SENIC / APACHE)',
        'Дополнять шкалами Charlson comorbidity index или Elixhauser для детализации',
      ].filter(Boolean),
      caveats: [
        'Субъективная оценка — межоценивательная вариабельность ~ 20 %',
        'Не учитывает возраст отдельно (включается в прогноз)',
        'Современные терапии (ART, DAA, иммунотерапия) сместили категории',
        'Charlson Comorbidity Index более объективен для детализации',
        'Используется в основном в инфекционной и эпидемиологической литературе',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нефатал.', color: '#22C55E' },
          { min: 1, max: 2, label: 'Конечно фат.', color: '#F59E0B' },
          { min: 2, max: 3, label: 'Быстро фат.', color: '#EF4444' },
        ],
        current: cat === 'non_fatal' ? 0.5 : cat === 'ultimately_fatal' ? 1.5 : 2.5,
        unit: '',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
      related: [
        { id: 'charlson', title: 'Charlson CCI' },
        { id: 'senic', title: 'SENIC' },
        { id: 'apache-ii', title: 'APACHE II' },
      ],
    };
  },
  reference: 'McCabe WR, Jackson GG. Arch Intern Med 1962;110:847 (Gram-negative bacteremia, classification of underlying disease).',
  countries: 'Международный (США, эпидемиология)',
  presets: [
    { label: 'ГБ + СД 2 (нефатал.)', values: { category: 'non_fatal' } },
    { label: 'ХСН IV / ХБП 5', values: { category: 'ultimately_fatal' } },
    { label: 'Метастат. рак', values: { category: 'rapidly_fatal' } },
  ],
  info: `### Для чего используется
**McCabe-Jackson Classification** (1962) — простая 3-категорийная оценка прогноза основного заболевания. Исторически разработана для стратификации больных с грам-негативной бактериемией, сейчас используется в эпидемиологии нозокомиальных инфекций.

### 3 категории
| Категория | Прогноз | Смертность 1 г / 5 лет |
|---|---|---|
| **Нефатальное** | > 5 лет | < 5 % / ~ 10 % |
| **В конечном итоге фатальное** | 1–5 лет | 20–30 % / 60–70 % |
| **Быстро фатальное** | < 1 года | > 50 % / ~ 95 % |

### Примеры распределения
| Состояние | McCabe |
|---|---|
| Здоровый | Нефатальное |
| ГБ, СД 2 без осложнений | Нефатальное |
| ХБП 3, ХСН II–III | Нефатальное |
| ХБП 5 (диализ) | В конечном итоге фатальное |
| ХСН IV, ХОБЛ GOLD 4 | В конечном итоге фатальное |
| Цирроз Child B | В конечном итоге фатальное |
| ВИЧ на ART супрессия | Нефатальное |
| СПИД продвинутый | Быстро фатальное |
| Онкология стабильная | В конечном итоге фатальное |
| Метастатическая онкология | Быстро фатальное |
| Острый лейкоз без ремиссии | Быстро фатальное |

### Клиническое применение
- Эпидемиология нозокомиальных инфекций (стратификация)
- Анализ смертности от бактериемии, сепсиса
- Дополняет SENIC, APACHE II, Charlson CCI
- Обсуждение целей лечения (goals of care)

### Ограничения
- Субъективная — требует экспертной оценки
- Современные терапии (ART, DAA, иммунотерапия, трансплантация) меняют исходы
- Не учитывает возраст отдельно
- Charlson CCI предпочтительнее для объективной детализации
- Для индивидуального прогноза — использовать специфичные шкалы (MELD, NYHA, BODE)

### Альтернативы
| Шкала | Применение |
|---|---|
| Charlson CCI | 19 условий, взвешенная сумма, 10-летняя смертность |
| Elixhauser | 30 условий |
| APACHE II | ICU смертность, острое состояние |
| MELD | Цирроз |
| BODE | ХОБЛ |
| NYHA | ХСН |`,
};

export default runner;
