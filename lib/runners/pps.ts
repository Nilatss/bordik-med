// @ts-nocheck
/** Runner: pps */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'pps',
      label: 'Palliative Performance Scale (%)',
      type: 'select',
      options: [
        { value: '100', label: '100% — полная активность, нет жалоб' },
        { value: '90', label: '90% — полная активность, незначительные симптомы' },
        { value: '80', label: '80% — полная активность, усилие; симптомы' },
        { value: '70', label: '70% — снижение активности, самообслуживание' },
        { value: '60', label: '60% — незначительная помощь, иногда помощь по делам' },
        { value: '50', label: '50% — значительная помощь в самообслуживании' },
        { value: '40', label: '40% — в основном в кровати, требует ухода' },
        { value: '30', label: '30% — полностью прикован к постели' },
        { value: '20', label: '20% — прикован к постели, снижение сознания, минимальный приём пищи' },
        { value: '10', label: '10% — минимальный приём, снижение сознания, тахипноэ' },
        { value: '0', label: '0% — смерть' },
      ],
    },
  ],
  compute: (v) => {
    const pps = Number(v.pps);

    const map: Record<number, { survival: string; color: string; care: string; hospice: string }> = {
      100: { survival: '> 12 мес', color: '#22C55E', care: 'Обычный амбулаторный уход', hospice: 'Не показан' },
      90: { survival: '> 12 мес', color: '#22C55E', care: 'Обычный амбулаторный уход', hospice: 'Не показан' },
      80: { survival: '~ 6-12 мес', color: '#84CC16', care: 'Амбулаторный онкологический уход', hospice: 'Не показан' },
      70: { survival: '~ 3-6 мес', color: '#F59E0B', care: 'Paliative care команда; оценка симптомов', hospice: 'Рассмотреть обсуждение целей' },
      60: { survival: '~ 2-3 мес', color: '#F59E0B', care: 'Paliative care активно; семейный уход', hospice: 'Hospice eligible (< 6 мес при PPS ≤ 60)' },
      50: { survival: '~ 30-45 дней', color: '#EF4444', care: 'Hospice / домашний уход с посещениями', hospice: 'Hospice показан' },
      40: { survival: '~ 20-30 дней', color: '#EF4444', care: 'Hospice на дому или в стационаре', hospice: 'Hospice активно' },
      30: { survival: '~ 10-20 дней', color: '#7F1D1D', care: 'Интенсивный hospice; симптоматическая терапия', hospice: 'Hospice обязательно' },
      20: { survival: '~ 7-14 дней', color: '#7F1D1D', care: 'Терминальный уход; подготовка семьи', hospice: 'Hospice — последние дни' },
      10: { survival: '~ 1-3 дня', color: '#450A0A', care: 'Активное умирание; комфорт-уход', hospice: 'Терминальная фаза' },
      0: { survival: 'Смерть', color: '#000000', care: 'Посмертный уход; поддержка семьи', hospice: '—' },
    };

    const entry = map[pps] || map[50];

    return {
      value: `PPS ${pps}%`,
      unit: 'уровень',
      interpretation: `PPS ${pps}% — медианное выживание: ${entry.survival}`,
      color: entry.color,
      details: `Palliative Performance Scale = ${pps}%. Медиана выживания: ${entry.survival}. ${entry.care}. Hospice: ${entry.hospice}.`,
      actions: [
        entry.care,
        pps <= 60 ? 'Hospice eligibility (Medicare: прогноз < 6 мес при PPS ≤ 60-70)' : '',
        pps <= 40 ? 'Обсудить advance care planning, DNR, POLST/ПОРСТ' : '',
        pps <= 30 ? 'Прекратить лабораторные анализы, мониторинг; фокус на комфорте' : '',
        pps <= 20 ? 'Сублингвальные опиоиды / бензодиазепины; прекратить в/в жидкости' : '',
        pps >= 50 && pps <= 70 ? 'ESAS / FACIT-F для количественной оценки симптомов' : '',
        'Семейная поддержка, духовный уход (по желанию), координация hospice',
      ].filter(Boolean),
      caveats: [
        'PPS v2 (Anderson 1996, обновлён Victoria Hospice 2001) — модификация Karnofsky',
        'Валидирован для прогнозирования выживания в паллиативе',
        'Оценка на основе: амбулация, активность, самообслуживание, приём пищи, сознание',
        'Медиана выживания — не индивидуальный прогноз; большой inter-individual разброс',
        'PPS ≤ 60-70 — соответствует Medicare hospice критериям (< 6 мес)',
        'Сочетать с PPI (Palliative Prognostic Index) и PaP (Palliative Prognostic Score) для точности',
      ],
      scale: {
        segments: [
          { min: 0, max: 30, label: '0-20%', color: '#450A0A' },
          { min: 30, max: 50, label: '30-40%', color: '#7F1D1D' },
          { min: 50, max: 70, label: '50-60%', color: '#EF4444' },
          { min: 70, max: 90, label: '70-80%', color: '#F59E0B' },
          { min: 90, max: 101, label: '90-100%', color: '#22C55E' },
        ],
        current: pps,
        unit: '%',
      },
      related: [
        { id: 'who-ladder', title: 'WHO Ladder' },
        { id: 'phq9', title: 'PHQ-9' },
        { id: 'gcs', title: 'GCS' },
      ],
      relatedCourses: [
        { id: '309.3', title: 'Паллиативная помощь' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Anderson F, Downing GM, Hill J et al. Palliative Performance Scale (PPS): A New Tool. J Palliat Care 1996;12:5-11.',
  countries: 'Международный (IAHPC, WHO, Medicare hospice)',
  presets: [
    { label: 'Активный', values: { pps: '80' } },
    { label: 'Hospice eligible', values: { pps: '50' } },
    { label: 'Терминальный', values: { pps: '20' } },
  ],
  info: `### Для чего используется
**Palliative Performance Scale (PPS v2)** — модификация шкалы Karnofsky для паллиативных пациентов. Оценивает функциональный статус и прогнозирует выживание.

### Шкала (0-100%)
| PPS | Амбулация | Активность | Самообслуживание | Приём | Сознание |
|---|---|---|---|---|---|
| **100** | Полная | Норма, нет симптомов | Полное | Норма | Ясное |
| **90** | Полная | Норма, минимальные симптомы | Полное | Норма | Ясное |
| **80** | Полная | С усилием, симптомы | Полное | Норма/снижен | Ясное |
| **70** | Снижена | Не может работать | Полное | Норма/снижен | Ясное |
| **60** | Снижена | Нужна помощь | Иногда помощь | Норма/снижен | Ясное/спутан. |
| **50** | Чаще сидит | Значительная помощь | Значит. помощь | Норма/снижен | Ясное/спутан. |
| **40** | В основном в кровати | Полная помощь | Полная помощь | Снижен | Сонлив/спутан |
| **30** | Полностью в кровати | Полная помощь | Полная помощь | Снижен | Сонлив/спутан |
| **20** | В кровати | Полная помощь | Полная помощь | Глотками | Сонлив/ступор |
| **10** | В кровати | Полная помощь | Полная помощь | Ротовой уход | Сонлив/кома |
| **0** | Смерть | | | | |

### Медианное выживание
| PPS | Выживание |
|---|---|
| 70-100% | Месяцы-годы |
| 60% | ~ 2-3 мес |
| 50% | ~ 30-45 дн |
| 40% | ~ 20-30 дн |
| 30% | ~ 10-20 дн |
| 20% | ~ 7-14 дн |
| 10% | 1-3 дня |

### Hospice критерии (Medicare)
- Прогноз **< 6 мес**
- PPS ≤ **60-70%** часто используется
- + клинические признаки ухудшения (вес ↓ 10%, FAST 7+ для деменции, и т.д.)

### Использование
- Триаж в паллиативные программы
- Advance care planning (ACP)
- Обсуждение прогноза с семьёй
- Решения о прекращении лечения / ресусцитации

### Комбинирование с другими шкалами
- **PPI (Palliative Prognostic Index)** — PPS + делирий + симптомы
- **PaP (Palliative Prognostic Score)** — PPS + клинический прогноз + лабораторные
- **ESAS-r** — оценка 9 симптомов (боль, слабость, одышка, и т.д.)

### Ограничения
- Большой inter-individual разброс выживания
- Не заменяет клиническую оценку
- Не учитывает отдельные органные дисфункции
- Может быстро изменяться в финальные дни`,
};
export default runner;
