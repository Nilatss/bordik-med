/** Runner: mascc */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'burden',
      label: 'Тяжесть симптомов (burden of illness)',
      type: 'select',
      options: [
        { value: '5', label: 'Нет или лёгкие симптомы (+5)' },
        { value: '3', label: 'Умеренные симптомы (+3)' },
        { value: '0', label: 'Тяжёлые симптомы (0)' },
      ],
    },
    {
      id: 'hypotension',
      label: 'Нет гипотензии (САД > 90 мм рт. ст.)',
      type: 'checkbox',
      points: 5,
    },
    {
      id: 'copd',
      label: 'Нет ХОБЛ',
      type: 'checkbox',
      points: 4,
    },
    {
      id: 'solid',
      label: 'Солидная опухоль / нет микозов в анамнезе',
      type: 'checkbox',
      points: 4,
    },
    {
      id: 'dehydration',
      label: 'Нет обезвоживания (без в/в инфузии)',
      type: 'checkbox',
      points: 3,
    },
    {
      id: 'outpatient',
      label: 'Амбулаторный статус при старте лихорадки',
      type: 'checkbox',
      points: 3,
    },
    {
      id: 'age',
      label: 'Возраст < 60 лет',
      type: 'checkbox',
      points: 2,
    },
  ],
  compute: (v) => {
    const burden = Number(v.burden) || 0;
    const pts = (v.hypotension ? 5 : 0) + (v.copd ? 4 : 0) + (v.solid ? 4 : 0)
      + (v.dehydration ? 3 : 0) + (v.outpatient ? 3 : 0) + (v.age ? 2 : 0);
    const total = burden + pts;

    let color = '#EF4444';
    let risk = 'Высокий риск осложнений';
    let action = 'Госпитализация, IV широкий спектр (пиперациллин-тазобактам или цефепим)';

    if (total >= 21) {
      color = '#22C55E';
      risk = 'Низкий риск (≥ 21)';
      action = 'Амбулаторное лечение возможно: амоксициллин-клавуланат + ципрофлоксацин PO';
    }

    return {
      value: `${total}`,
      unit: 'балл (макс 26)',
      interpretation: `MASCC ${total} баллов — ${risk}`,
      color,
      details: `MASCC score = ${total} / 26. ${total >= 21 ? 'Низкий риск — кандидат на амбулаторное лечение.' : 'Высокий риск осложнений — госпитализация обязательна.'}`,
      actions: [
        action,
        total >= 21 ? 'Условия амбулаторного лечения: надёжный уход, доступ к клинике ≤ 1 ч, согласие пациента' : '',
        total < 21 ? 'Гемокультуры × 2 + культура из устройства (если центральный катетер)' : '',
        total < 21 ? 'Эмпирическая терапия в течение 60 мин от диагностики' : '',
        'Переоценка через 48-72 ч; деэскалация при идентификации возбудителя',
        'G-CSF не эффективен при установленной FN (профилактика — да)',
      ].filter(Boolean),
      caveats: [
        'MASCC — Klastersky 2000, валидирован на > 1000 пациентов',
        'Применим ТОЛЬКО для фебрильной нейтропении (ANC < 500 или < 1000 с прогнозом падения)',
        'Не учитывает глубину и продолжительность нейтропении — для high-risk используйте CISNE',
        'Амбулаторное лечение требует тщательного отбора (MASCC ≥ 21 + дополнительные критерии)',
        'Флюкорцин противопоказан у пациентов с недавней (3 мес) фторхинолонной профилактикой',
        'При аллергии на пенициллины — цефепим или меропенем',
      ],
      scale: {
        segments: [
          { min: 0, max: 15, label: 'Очень высокий', color: '#7F1D1D' },
          { min: 15, max: 21, label: 'Высокий', color: '#EF4444' },
          { min: 21, max: 27, label: 'Низкий', color: '#22C55E' },
        ],
        current: total,
        unit: 'балл',
      },
      related: [
        { id: 'khorana-onco', title: 'Khorana (онко)' },
        { id: 'febrile-neutro', title: 'Febrile neutropenia' },
        { id: 'qsofa', title: 'qSOFA' },
      ],
      relatedCourses: [
        { id: '309.2', title: 'Клиническая онкология' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Klastersky J, Paesmans M, Rubenstein EB et al. The Multinational Association for Supportive Care in Cancer risk index. J Clin Oncol 2000;18:3038-51.',
  countries: 'Международный (MASCC, IDSA 2010, ESMO 2016, NCCN)',
  presets: [
    { label: 'Низкий риск', values: { burden: '5', hypotension: true, copd: true, solid: true, dehydration: true, outpatient: true, age: true } },
    { label: 'Промежут.', values: { burden: '3', hypotension: true, copd: true, solid: true, dehydration: false, outpatient: false, age: false } },
    { label: 'Высокий риск', values: { burden: '0', hypotension: false, copd: false, solid: false, dehydration: false, outpatient: false, age: false } },
  ],
  info: `### Для чего используется
**MASCC score (Multinational Association for Supportive Care in Cancer)** — шкала риска серьёзных осложнений у онкологических пациентов с фебрильной нейтропенией. Позволяет отобрать пациентов для амбулаторного лечения.

### Критерии (макс 26)
| Критерий | Баллы |
|---|---|
| Burden: нет/лёгкие симптомы | 5 |
| Burden: умеренные симптомы | 3 |
| Burden: тяжёлые симптомы | 0 |
| Нет гипотензии | 5 |
| Нет ХОБЛ | 4 |
| Солидная опухоль / нет микозов | 4 |
| Нет обезвоживания | 3 |
| Амбулаторный при старте лихорадки | 3 |
| Возраст < 60 лет | 2 |

### Интерпретация
| MASCC | Риск | Тактика |
|---|---|---|
| **≥ 21** | Низкий (< 10% осложн.) | Амбулаторно PO + наблюдение |
| **< 21** | Высокий | Госпитализация + IV антибиотики |

### Эмпирическая терапия
**Низкий риск (амбулаторно, PO):**
- **Амоксициллин-клавуланат 875/125 мг × 2** + **ципрофлоксацин 750 мг × 2**

**Высокий риск (IV):**
- **Пиперациллин-тазобактам 4.5 г × 4** или
- **Цефепим 2 г × 3** или
- **Меропенем 1 г × 3** (при септическом шоке / ESBL в анамнезе)
- + **Ванкомицин** при катетер-инфекции / MRSA риск
- + **Противогрибковое** при персистировании лихорадки > 4-7 дней

### Критерии для амбулаторного лечения (все должны быть)
- MASCC ≥ 21
- Нет острых осложнений
- ANC прогноз восстановления ≤ 10 дней
- Доступ к экстренной помощи ≤ 1 ч
- Надёжный уход на дому
- Согласие пациента / семьи

### CISNE — альтернатива для стабильных пациентов
- Более точен, но только для клинически стабильных
- 6 переменных: ECOG, ХОБЛ, ХСН, мукозит, моноциты, гипергликемия

### Ограничения
- НЕ применяется у гематологических пациентов с ожидаемой длительной (> 7 дней) нейтропенией
- Trans­plant и intensive induction — всегда high risk
- Педиатрия — отдельные шкалы`,
};
export default runner;
