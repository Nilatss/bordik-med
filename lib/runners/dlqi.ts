/** Runner: dlqi — Dermatology Life Quality Index */
import type { CalculatorTool } from '../tools-runners';

const opts = [
  { value: '0', label: 'Совсем нет / не относится', points: 0 },
  { value: '1', label: 'Немного', points: 1 },
  { value: '2', label: 'Много', points: 2 },
  { value: '3', label: 'Очень сильно', points: 3 },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'q1', label: '1. Зуд / болезненность / жжение', type: 'select', options: opts },
    { id: 'q2', label: '2. Смущение / неловкость', type: 'select', options: opts },
    { id: 'q3', label: '3. Покупки / дом / сад', type: 'select', options: opts },
    { id: 'q4', label: '4. Выбор одежды', type: 'select', options: opts },
    { id: 'q5', label: '5. Социальный / досуг', type: 'select', options: opts },
    { id: 'q6', label: '6. Спорт', type: 'select', options: opts },
    { id: 'q7', label: '7. Работа / учёба', type: 'select', options: opts },
    { id: 'q8', label: '8. Отношения с партнёром/друзьями', type: 'select', options: opts },
    { id: 'q9', label: '9. Половая жизнь', type: 'select', options: opts },
    { id: 'q10', label: '10. Лечение (сложности/мешает)', type: 'select', options: opts },
  ],
  compute: (v) => {
    const total = Array.from({ length: 10 }, (_, i) => Number(v[`q${i+1}`] || 0)).reduce((s, x) => s + x, 0);
    let color = '#22C55E', interp = 'Нет влияния';
    if (total >= 21) { color = '#7F1D1D'; interp = 'Крайне тяжёлое влияние'; }
    else if (total >= 11) { color = '#EF4444'; interp = 'Очень выраженное влияние'; }
    else if (total >= 6) { color = '#F59E0B'; interp = 'Умеренное влияние'; }
    else if (total >= 2) { color = '#84CC16'; interp = 'Небольшое влияние'; }
    return {
      value: String(total),
      unit: '/30',
      interpretation: interp,
      color,
      details: '10 вопросов о влиянии кожной патологии на жизнь за последнюю неделю. Порог ≥ 10 — критерий системной терапии (EU-консенсус, псориаз, атопический дерматит).',
      actions: [
        total >= 10 ? 'DLQI ≥ 10 — основание для системной/биологической терапии (псориаз, АД)' : '',
        total >= 11 ? 'Скрининг депрессии/тревоги (PHQ-9, GAD-7); направление к психологу' : '',
        'Оценка приверженности терапии, обучение пациента',
        'Повторная оценка через 3-6 мес для мониторинга эффекта',
      ].filter(Boolean),
      caveats: [
        'Для детей 4-16 лет — CDLQI (отдельный инструмент)',
        'MCID (минимально клинически значимое изменение) ≈ 2,2-4 балла',
        'Не валидирован для онкологической кожи (мелан., SCC)',
        'Зависит от культурных различий — интерпретация вопроса о половой жизни',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Нет', color: '#22C55E' },
          { min: 2, max: 6, label: 'Лёгкое', color: '#84CC16' },
          { min: 6, max: 11, label: 'Умеренное', color: '#F59E0B' },
          { min: 11, max: 21, label: 'Выраженное', color: '#EF4444' },
          { min: 21, max: 31, label: 'Крайне тяж.', color: '#7F1D1D' },
        ],
        current: total,
        unit: 'DLQI',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'phq9', title: 'PHQ-9' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Finlay AY, Khan GK. Dermatology Life Quality Index (DLQI)—a simple practical measure for routine clinical use. Clin Exp Dermatol 1994;19:210-216.',
  countries: 'Международный',
  presets: [
    { label: 'Лёгкое', values: { q1:'1',q2:'1',q3:'0',q4:'1',q5:'0',q6:'0',q7:'0',q8:'0',q9:'0',q10:'0' } },
    { label: 'Умеренное', values: { q1:'2',q2:'2',q3:'1',q4:'2',q5:'1',q6:'0',q7:'1',q8:'0',q9:'0',q10:'1' } },
    { label: 'Выраженное', values: { q1:'3',q2:'3',q3:'2',q4:'3',q5:'2',q6:'1',q7:'2',q8:'1',q9:'1',q10:'2' } },
  ],
  info: `### Для чего используется
**DLQI (Dermatology Life Quality Index)** — самый используемый инструмент оценки влияния кожных заболеваний на качество жизни. 10 вопросов, 0-3 балла каждый = 0-30.

### Интерпретация
| Сумма | Влияние |
|---|---|
| 0-1 | Нет |
| 2-5 | Небольшое |
| 6-10 | Умеренное |
| 11-20 | Очень выраженное |
| 21-30 | Крайне тяжёлое |

### Использование
- **≥ 10** + PASI ≥ 10 — критерий тяжёлого псориаза → системная терапия
- Монитор эффективности терапии (MCID ≈ 2-4 балла)
- Валидирован для псориаза, АД, акне, витилиго, ГТ и др.

### Источник
Finlay AY, Khan GK. Clin Exp Dermatol 1994.`,
};

export default runner;
