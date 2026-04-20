// @ts-nocheck
/** Runner: khorana-onco */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'site',
      label: 'Локализация опухоли',
      type: 'select',
      options: [
        { value: '0', label: 'Прочие (0)' },
        { value: '1', label: 'Высокий риск: лёгкое, лимфома, гин., мочевой пузырь, яичко (+1)' },
        { value: '2', label: 'Очень высокий: желудок, поджелудочная (+2)' },
      ],
    },
    {
      id: 'plt',
      label: 'Тромбоциты ≥ 350 × 10⁹/л',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'hb',
      label: 'Hb < 10 г/дл или использование ESA',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'wbc',
      label: 'Лейкоциты > 11 × 10⁹/л',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'bmi',
      label: 'BMI ≥ 35 кг/м²',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'regimen',
      label: 'Тип режима химиотерапии',
      type: 'select',
      options: [
        { value: '0', label: 'Стандартная химиотерапия' },
        { value: '1', label: 'Высокотромбогенный: цисплатин, бевацизумаб, иммуномодуляторы (IMiDs)' },
      ],
    },
  ],
  compute: (v) => {
    const site = Number(v.site) || 0;
    const pts = (v.plt ? 1 : 0) + (v.hb ? 1 : 0) + (v.wbc ? 1 : 0) + (v.bmi ? 1 : 0);
    const regimen = Number(v.regimen) || 0;
    const total = site + pts;
    const adjusted = total + (regimen ? 1 : 0);

    let color = '#22C55E';
    let risk = 'Низкий (0)';
    let action = 'Профилактика не показана; наблюдение';

    if (total === 0) {
      color = '#22C55E';
      risk = 'Низкий (0)';
      action = 'Наблюдение, обучение признакам ВТЭ';
    } else if (total <= 2) {
      color = '#F59E0B';
      risk = 'Промежуточный (1-2)';
      action = 'Обсудить профилактику DOAC при Khorana ≥ 2 (ASCO 2020)';
    } else {
      color = '#EF4444';
      risk = 'Высокий (≥ 3)';
      action = 'Рекомендована тромбопрофилактика 6 мес (apixaban 2.5 мг × 2 или rivaroxaban 10 мг)';
    }

    if (regimen === 1 && total >= 2) {
      color = '#7F1D1D';
      risk = 'Очень высокий (+ высокотромбогенный режим)';
      action = 'Профилактика обязательна; LMWH при ЖКТ-раке';
    }

    return {
      value: `${total}${regimen ? ` (+${regimen} режим)` : ''}`,
      unit: 'балл',
      interpretation: `Khorana ${total} — ${risk}. 6-мес риск ВТЭ: ${total === 0 ? '~ 0.5%' : total <= 2 ? '~ 2%' : '~ 7%'}.`,
      color,
      details: `Khorana score = ${total}. ${regimen ? 'Высокотромбогенный режим добавляет ~ 2-3x к риску. ' : ''}${action}.`,
      actions: [
        action,
        total >= 2 ? 'Apixaban 2.5 мг × 2/сут × 6 мес (AVERT 2019)' : '',
        total >= 2 ? 'Rivaroxaban 10 мг/сут × 6 мес (CASSINI 2019)' : '',
        total >= 2 ? 'При ЖКТ/урогенитальном раке — LMWH (эноксапарин 40 мг/сут) вместо DOAC' : '',
        regimen === 1 ? 'Миелома на IMiDs + дексаметазон: ASA 81 мг или LMWH обязательно' : '',
        'Переоценка каждый цикл + при смене режима',
      ].filter(Boolean),
      caveats: [
        'Валидирован для амбулаторных, начинающих ХТ (не госпитализированных)',
        'Не применим для миеломы, ХЛЛ, глиом — отдельные алгоритмы',
        'DOAC осторожно при ЖКТ/урогенитальном раке — повышен риск кровотечения',
        'Чувствительность низкая: ~ 50% ВТЭ возникает у пациентов с < 3 баллами',
        'Альтернативы: Vienna CATS, PROTECHT, COMPASS-CAT, CATS-MICA',
        'Высокотромбогенные режимы (цисплатин, бевацизумаб, IMiDs) требуют отдельной оценки',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0 низкий', color: '#22C55E' },
          { min: 1, max: 3, label: '1-2 средн.', color: '#F59E0B' },
          { min: 3, max: 8, label: '≥ 3 высок.', color: '#EF4444' },
        ],
        current: total,
        unit: 'балл',
      },
      related: [
        { id: 'khorana', title: 'Khorana' },
        { id: 'caprini', title: 'Caprini' },
        { id: 'padua', title: 'Padua' },
        { id: 'wells-dvt', title: 'Wells для ТГВ' },
      ],
      relatedCourses: [
        { id: '309.2', title: 'Клиническая онкология' },
        { id: '301.7', title: 'Онкогематология' },
      ],
    };
  },
  reference: 'Khorana AA et al. Blood 2008;111:4902-7. AVERT (Carrier NEJM 2019). CASSINI (Khorana NEJM 2019). ESMO 2022 CAT guidelines.',
  countries: 'Международный (ASCO 2020, ESMO 2022, NCCN, ITAC 2022)',
  presets: [
    { label: 'Низкий', values: { site: '0', plt: false, hb: false, wbc: false, bmi: false, regimen: '0' } },
    { label: 'Промежут.', values: { site: '1', plt: false, hb: true, wbc: false, bmi: false, regimen: '0' } },
    { label: 'Высокий', values: { site: '2', plt: true, hb: true, wbc: false, bmi: false, regimen: '1' } },
  ],
  info: `### Для чего используется
**Khorana Score (онкологическая версия)** — первая валидированная шкала риска **ВТЭ** у амбулаторных онкологических пациентов, начинающих химиотерапию. Используется для решения о тромбопрофилактике.

### Компоненты
| Фактор | Баллы |
|---|---|
| Желудок, ПЖ | +2 |
| Лёгкое, лимфома, гинекол., мочевой пузырь, яичко | +1 |
| Plt ≥ 350 × 10⁹/л | +1 |
| Hb < 10 г/дл или ESA | +1 |
| WBC > 11 × 10⁹/л | +1 |
| BMI ≥ 35 | +1 |

### Интерпретация (6-мес ВТЭ)
| Баллы | Риск |
|---|---|
| 0 | 0.3-0.8% (низкий) |
| 1-2 | ~ 2% (промежуточный) |
| ≥ 3 | ~ 7% (высокий) |

### Модификаторы режима ХТ
- **Цисплатин**: HR ~ 2-3 для ВТЭ
- **Бевацизумаб**: HR ~ 1.3
- **IMiDs (леналидомид, талидомид)** + дексаметазон: HR 3-5 (миелома)
- **L-аспарагиназа**: высокий риск ВТЭ (ALL)

### Профилактика (ASCO 2020 / ESMO 2022)
| Khorana | Препарат |
|---|---|
| ≥ 2 (обсуждение) или ≥ 3 (рекомендовано) | Apixaban 2.5 мг × 2 или Rivaroxaban 10 мг |
| ЖКТ / урогенит. | LMWH (эноксапарин 40 мг) |
| Миелома на IMiDs | ASA 81 мг (низкий риск) или LMWH (высокий) |

### Противопоказания к DOAC
- Активное кровотечение
- Plt < 50 × 10⁹/л
- ЖКТ / урогенитальный рак (относительное — выше риск кровотечения)
- Тяжёлая печёночная недостаточность (Child C)
- Ингибиторы CYP3A4 / P-gp (противогрибковые)

### Ограничения
- Не валидизирован для гематологических (миелома, ХЛЛ)
- Низкая чувствительность (~ 50% ВТЭ случаются при < 3 баллах)
- Не учитывает центральный катетер, иммобилизацию, ВТЭ в анамнезе

### Источник
Khorana AA et al. *Blood* 2008;111:4902-4907.
Carrier M et al. *N Engl J Med* 2019;380:711-719 (AVERT).
Khorana AA et al. *N Engl J Med* 2019;380:720-728 (CASSINI).`,
};
export default runner;
