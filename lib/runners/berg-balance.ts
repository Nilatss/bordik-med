// @ts-nocheck
/** Runner: berg-balance — Berg Balance Scale (BBS) */
import type { CalculatorTool } from '../tools-runners';

const scale04 = [
  { value: '0', label: '0 — не может', points: 0 },
  { value: '1', label: '1 — со значительной помощью', points: 1 },
  { value: '2', label: '2 — с небольшой помощью', points: 2 },
  { value: '3', label: '3 — с наблюдением', points: 3 },
  { value: '4', label: '4 — самостоятельно', points: 4 },
];

const items = [
  { id: 't1', label: '1. Встать из положения сидя' },
  { id: 't2', label: '2. Стоять без опоры' },
  { id: 't3', label: '3. Сидеть без опоры' },
  { id: 't4', label: '4. Сесть из стоя' },
  { id: 't5', label: '5. Перемещение (стул ↔ стул)' },
  { id: 't6', label: '6. Стоя с закрытыми глазами' },
  { id: 't7', label: '7. Стоя со сдвинутыми ногами' },
  { id: 't8', label: '8. Наклон вперёд вытянутой рукой' },
  { id: 't9', label: '9. Поднять предмет с пола' },
  { id: 't10', label: '10. Поворот назад через плечо' },
  { id: 't11', label: '11. Поворот 360°' },
  { id: 't12', label: '12. Попеременно на ступеньку' },
  { id: 't13', label: '13. Стояние тандем' },
  { id: 't14', label: '14. Стоя на одной ноге' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: items.map((i) => ({ id: i.id, label: i.label, type: 'select', options: scale04 })),
  compute: (v) => {
    const total = items.reduce((s, i) => s + Number(v[i.id] || 0), 0);
    let color = '#EF4444', interp = 'Высокий риск падений / кровать-коляска';
    if (total >= 41) { color = '#22C55E'; interp = 'Низкий риск — независимая ходьба'; }
    else if (total >= 21) { color = '#F59E0B'; interp = 'Умеренный риск — ходунки'; }
    return {
      value: String(total),
      unit: '/56',
      interpretation: interp,
      color,
      details: '14 заданий × 0-4 балла. Оценивает статическое и динамическое равновесие. Валидирован для инсульта, Паркинсона, гериатрии.',
      actions: [
        total <= 20 ? 'Колясочный режим, строгий надзор, профилактика падений (кровать low, сигнал)' : '',
        total >= 21 && total <= 40 ? 'Ходунки/трость, контроль среды, упражнения на равновесие 3-5×/нед' : '',
        total >= 41 ? 'Независимая ходьба; акцент на силу (Otago), tai chi' : '',
        'Связь со скоростью ходьбы: BBS < 45 → высокий риск падений',
        total < 45 ? 'Оценка падений за год, Timed Up & Go, Tinetti' : '',
      ].filter(Boolean),
      caveats: [
        'Ceiling effect у активных пожилых — добавьте Mini-BEST, DGI',
        'Не оценивает когнитивные аспекты равновесия — сочетайте с MMSE',
        'Cut-off 45 — чаще всего используемый для риска падений',
        'Занимает 15-20 мин — учитывайте у утомляемых пациентов',
      ],
      scale: {
        segments: [
          { min: 0, max: 21, label: 'Высокий', color: '#EF4444' },
          { min: 21, max: 41, label: 'Умеренный', color: '#F59E0B' },
          { min: 41, max: 57, label: 'Низкий', color: '#22C55E' },
        ],
        current: total,
        unit: 'BBS',
      },
      related: [{ id: 'barthel', title: 'Barthel' }, { id: 'fim-rehab', title: 'FIM' }],
      relatedCourses: [{ id: '312.1', title: 'Реабилитация' }],
    };
  },
  reference: 'Berg KO, Wood-Dauphinee SL, Williams JI, Maki B. Measuring balance in the elderly: validation of an instrument. Can J Public Health 1992;83 Suppl 2:S7-11.',
  countries: 'Международный',
  presets: [
    { label: 'Высокий риск', values: Object.fromEntries(items.map((i) => [i.id, '1'])) },
    { label: 'Умеренный', values: Object.fromEntries(items.map((i) => [i.id, '2'])) },
    { label: 'Низкий', values: Object.fromEntries(items.map((i) => [i.id, '4'])) },
  ],
  info: `### Для чего используется
**Berg Balance Scale (BBS)** — золотой стандарт оценки равновесия у пожилых, после инсульта, при Паркинсоне. 14 заданий × 0-4 = 0-56 баллов.

### Интерпретация
| BBS | Функциональный статус |
|---|---|
| 0-20 | Кровать / коляска — высокий риск падений |
| 21-40 | Ходунки / трость |
| 41-56 | Независимая ходьба |

### Cut-offs
- **< 45** — высокий риск падений (чувствительность 77 %, специфичность 86 %)
- **< 49** — независимость в ADL под вопросом

### MCID
- Инсульт: ~7 баллов
- Гериатрия: ~4 балла

### Источник
Berg KO et al. Can J Public Health 1992.`,
};

export default runner;
