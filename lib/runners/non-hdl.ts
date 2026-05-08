/** Runner: non-hdl - Non-HDL cholesterol & atherogenic risk */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'tc',
hint: 'Концентрация в ммоль/л', label: 'Общий ХС', type: 'number', unit: 'ммоль/л', min: 1, max: 20, step: 0.01, quickValues: [4, 5.5, 7, 9] },
    { id: 'hdl',
hint: 'ЛПВП. Норма: М ≥1.0, Ж ≥1.3 ммоль/л', label: 'HDL-C', type: 'number', unit: 'ммоль/л', min: 0.3, max: 5, step: 0.01, quickValues: [1.0, 1.3, 1.8] },
    { id: 'risk', label: 'Риск ASCVD', type: 'select', options: [
      { value: 'low', label: 'Низкий' },
      { value: 'moderate', label: 'Умеренный' },
      { value: 'high', label: 'Высокий' },
      { value: 'vhigh', label: 'Очень высокий' },
    ] },
  ],
  compute: (v) => {
    const tc = Number(v.tc);
    const hdl = Number(v.hdl);
    const risk = String(v.risk);
    const nonHdl = tc - hdl;

    const targets: Record<string, number> = { vhigh: 2.2, high: 2.6, moderate: 3.4, low: 3.8 };
    const target = targets[risk]!;

    let band = '', color = '#22C55E', details = '';
    if (nonHdl <= target) {
      band = 'В цели'; color = '#22C55E';
      details = `Non-HDL ${nonHdl.toFixed(2)} ≤ цели ${target} для ${risk} риска.`;
    } else if (nonHdl <= target + 0.8) {
      band = 'Незначит. выше'; color = '#F59E0B';
      details = `Non-HDL ${nonHdl.toFixed(2)} на 0.1-0.8 выше цели ${target}. Усилить немедикаментозные меры, рассмотреть статин/эзетимиб.`;
    } else {
      band = 'Значительно выше'; color = '#EF4444';
      details = `Non-HDL ${nonHdl.toFixed(2)} значительно выше цели ${target}. Требуется агрессивная липид-снижающая терапия.`;
    }

    return {
      value: nonHdl.toFixed(2), unit: 'ммоль/л non-HDL',
      interpretation: band, color,
      details,
      actions: [
        `Целевой non-HDL для ${risk} риска: ≤ ${target} ммоль/л`,
        'Non-HDL = TC - HDL, не требует голодания (в отличие от LDL по Friedewald)',
        'Лучший предиктор ASCVD при гипертриглицеридемии (ТГ > 2.3 ммоль/л)',
        'При non-HDL выше цели - высокоинтенсивный статин (розувастатин 20-40 / аторвастатин 40-80)',
        'При недостижении - эзетимиб 10 мг + PCSK9 ингибитор (алирокумаб / эволокумаб)',
      ],
      caveats: [
        'Non-HDL включает ВСЕ атерогенные частицы: LDL + VLDL + IDL + Lp(a)',
        'Цель non-HDL = LDL цель + 0.8 ммоль/л (30 мг/дл)',
        'Предпочтителен при ТГ > 2.3 ммоль/л когда Friedewald ненадёжен',
        'Для не-голодного пациента - non-HDL предпочтительнее LDL',
      ],
      scale: {
        segments: [
          { min: 0, max: 2.2, label: '≤2.2 оч.выс.р', color: '#22C55E' },
          { min: 2.2, max: 2.6, label: '≤2.6 выс.р', color: '#84CC16' },
          { min: 2.6, max: 3.4, label: '≤3.4 умер.р', color: '#F59E0B' },
          { min: 3.4, max: 4.2, label: '≤4.2 низк.р', color: '#EF4444' },
          { min: 4.2, max: 10, label: 'Высокий', color: '#991B1B' },
        ],
        current: nonHdl,
        unit: 'ммоль/л non-HDL',
      },
      related: [
        { id: 'friedewald', title: 'Friedewald LDL' },
        { id: 'martin-hopkins', title: 'Martin-Hopkins LDL' },
        { id: 'ascvd', title: 'ASCVD risk' },
      ],
      relatedCourses: [
        { id: '304.1', title: 'Липиды' },
        { id: '302.3', title: 'Профилактика ССЗ' },
      ],
    };
  },
  reference: 'Grundy SM et al. 2018 AHA/ACC Cholesterol Guideline. J Am Coll Cardiol 2019;73:e285.',
  countries: 'Международный (ESC/EAS · AHA/ACC)',
  presets: [
    { label: 'Норма', values: { tc: 4.5, hdl: 1.4, risk: 'moderate' } },
    { label: 'Не в цели (выс. риск)', values: { tc: 6.0, hdl: 1.2, risk: 'high' } },
  ],
  info: `
### Для чего используется
Оценка атерогенной нагрузки через Non-HDL холестерин - сумму всех атерогенных частиц (LDL + VLDL + IDL + Lp(a)).

### Формула
\`Non-HDL = Общий ХС - HDL\`

### Целевые значения (ESC/EAS 2019)
| ASCVD риск | Non-HDL цель |
|---|---|
| Очень высокий | < 2.2 ммоль/л |
| Высокий | < 2.6 |
| Умеренный | < 3.4 |
| Низкий | < 3.8 |

### Преимущества
- Не требует голодания
- Работает при ТГ > 2.3 ммоль/л (когда Friedewald ненадёжен)
- Включает атерогенные remnants (VLDL remnants в non-HDL, но не в LDL)
- Дешевле ApoB (альтернативный маркёр)`,
};

export default runner;
