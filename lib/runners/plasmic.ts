// @ts-nocheck
/** Runner: plasmic — PLASMIC score for TTP probability (ADAMTS13 deficiency) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'plt', label: 'Тромбоциты < 30 × 10⁹/л', type: 'checkbox' },
    { id: 'hemolysis', label: 'Гемолиз (ретик. > 2,5 % / непр. билирубин > 2 мг/дл / гаптоглобин не определяется)', type: 'checkbox' },
    { id: 'no_cancer', label: 'Нет активного рака (последние 12 мес)', type: 'checkbox' },
    { id: 'no_transplant', label: 'Нет пересадки органа / стволовых клеток в анамнезе', type: 'checkbox' },
    { id: 'mcv', label: 'MCV < 90 фл', type: 'checkbox' },
    { id: 'inr', label: 'INR < 1,5', type: 'checkbox' },
    { id: 'cr', label: 'Креатинин < 2,0 мг/дл (177 мкмоль/л)', type: 'checkbox' },
  ],
  compute: (v) => {
    const keys = ['plt','hemolysis','no_cancer','no_transplant','mcv','inr','cr'];
    const score = keys.reduce((a,k) => a + (v[k] ? 1 : 0), 0);

    let band = 'Низкий (0-4)';
    let color = '#22C55E';
    let probability = '< 5 %';
    if (score === 5) { band = 'Промежут. (5)'; color = '#F59E0B'; probability = '~ 5-24 %'; }
    else if (score >= 6) { band = 'Высокий (6-7)'; color = '#EF4444'; probability = '62-82 %'; }

    const actions = [];
    const caveats = [
      'PLASMIC валидизирован для взрослых с подозрением на ТМА (ТТП/ГУС/DIC/др.)',
      'Не заменяет активность ADAMTS13 (< 10 % — диагноз иммунной ТТП)',
      'При высоком PLASMIC — не ждать ADAMTS13, начинать плазмообмен эмпирически',
      'Беременность, HELLP, малигнизация могут имитировать ТТП',
    ];

    if (score >= 5) {
      actions.push('Забор крови на активность ADAMTS13 + ингибитор ДО плазмообмена');
      actions.push('Начать плазмообмен (PEX) 1,5 ОЦП/сут до Plt > 150 × 2 дн');
      actions.push('Метилпреднизолон 1 мг/кг/сут или пульс 1 г × 3 дн');
      actions.push('Каплацизумаб 10 мг в/в + п/к при подтверждённой иммунной ТТП');
      actions.push('Ритуксимаб 375 мг/м² еженед × 4 при рефрактерности');
    } else {
      actions.push('Маловероятна ТТП — искать иные ТМА: ГУС, DIC, HELLP, STEC-HUS, лекарства');
      actions.push('Определить ADAMTS13 при сохранении подозрения');
      actions.push('Коагулограмма, комплемент C3/C4, Шига-токсин, стул-культура');
    }

    return {
      value: `${score} балл${score === 1 ? '' : score < 5 ? 'а' : 'ов'}`,
      unit: 'из 7',
      interpretation: `${band} — вероятность ADAMTS13 < 10 %: ${probability}`,
      color,
      details: `PLASMIC (Bendapudi 2017) — клинический скрининг иммунной ТТП до получения ADAMTS13.
Сумма 7 бинарных признаков: Plt < 30, гемолиз, без онкологии, без трансплантата, MCV < 90, INR < 1,5, креатинин < 2.
- 0-4 балла: НЕ ТТП (NPV ~ 99 %)
- 5 баллов: промежуточная (5-24 % ТТП)
- 6-7 баллов: высокая (62-82 % ТТП) → эмпирический PEX`,
      actions,
      caveats,
      scale: {
        segments: [
          { min: 0, max: 4, label: 'Низкий', color: '#22C55E' },
          { min: 4, max: 5, label: 'Промежут.', color: '#F59E0B' },
          { min: 5, max: 7, label: 'Высокий', color: '#EF4444' },
        ],
        current: score,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '303.2', title: 'Гематология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: '4t', title: '4T (HIT)' },
        { id: 'dic', title: 'ISTH DIC' },
      ],
    };
  },
  reference: 'Bendapudi PK et al. Lancet Haematol 2017;4:e157-64. ISTH 2020 TTP Guidelines.',
  countries: 'Международный (ISTH 2020)',
  presets: [
    { label: 'Низкий (0-4)', values: { plt: true, hemolysis: true, no_cancer: true, no_transplant: true, mcv: false, inr: false, cr: false } },
    { label: 'Промежут. (5)', values: { plt: true, hemolysis: true, no_cancer: true, no_transplant: true, mcv: true, inr: false, cr: false } },
    { label: 'Высокий (7)', values: { plt: true, hemolysis: true, no_cancer: true, no_transplant: true, mcv: true, inr: true, cr: true } },
  ],
  info: `### Для чего используется
**PLASMIC score (Bendapudi 2017)** — клинический инструмент для прогнозирования **тяжёлого дефицита ADAMTS13 (< 10 %)** у пациентов с ТМА, до получения результата ADAMTS13-теста.

### Компоненты (каждый 1 балл)
| Параметр | Значение |
|---|---|
| **P**latelet count | < 30 × 10⁹/л |
| Hemo**L**ysis | Ретик. > 2,5 % / бил. непр. > 2 мг/дл / гапто не определяется |
| **A**bsence of active cancer | Нет рака последние 12 мес |
| Absence of **S**tem-cell / organ transplant | Нет SCT/SOT в анамнезе |
| **M**CV | < 90 фл |
| **I**NR | < 1,5 |
| **C**reatinine | < 2,0 мг/дл |

### Интерпретация
| Балл | Вероятность ADAMTS13 < 10 % |
|---|---|
| 0-4 | < 5 % (PPV низкий, NPV ~ 99 %) |
| 5 | 5-24 % |
| 6-7 | 62-82 % |

### Тактика
- **0-4:** маловероятна ТТП, искать альтернативный диагноз (ГУС, DIC, HELLP, лекарственно-индуцированная ТМА)
- **5-7:** забор ADAMTS13 + ингибитор, затем **эмпирический плазмообмен** (PEX) не откладывать; метилпреднизолон; каплацизумаб (ISTH 2020 IA)

### Лечение иммунной ТТП (подтверждённый ADAMTS13 < 10 %)
1. PEX 1,5 ОЦП/сут до Plt > 150 × 2 дн
2. Кортикостероиды (МП 1 мг/кг/сут)
3. **Каплацизумаб** (анти-vWF нанотело) — ISTH 2020 условная рекомендация
4. Ритуксимаб — при рефрактерности / рецидиве

### Ограничения
- Валидизирован только для **взрослых**
- Не применим при беременности / HELLP (перекрывающиеся паттерны)
- Не заменяет ADAMTS13-тест, а ускоряет решение о PEX`,
};

export default runner;
