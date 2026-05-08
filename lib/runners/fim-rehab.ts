/** Runner: fim-rehab — Functional Independence Measure (FIM) */
import type { CalculatorTool } from '../tools-runners';

const scale17 = [
  { value: '1', label: '1 — полная помощь', points: 1 },
  { value: '2', label: '2 — максимальная помощь', points: 2 },
  { value: '3', label: '3 — умеренная помощь', points: 3 },
  { value: '4', label: '4 — минимальная помощь', points: 4 },
  { value: '5', label: '5 — наблюдение/подсказка', points: 5 },
  { value: '6', label: '6 — модифицированная независимость', points: 6 },
  { value: '7', label: '7 — полная независимость', points: 7 },
];

const motor = [
  { id: 'eating', label: 'Приём пищи' },
  { id: 'grooming', label: 'Уход за собой' },
  { id: 'bathing', label: 'Купание' },
  { id: 'dressUp', label: 'Одевание (верх)' },
  { id: 'dressLow', label: 'Одевание (низ)' },
  { id: 'toileting', label: 'Туалет' },
  { id: 'bladder', label: 'Контроль мочеиспускания' },
  { id: 'bowel', label: 'Контроль дефекации' },
  { id: 'transBed', label: 'Перенос: кровать/стул' },
  { id: 'transToil', label: 'Перенос: туалет' },
  { id: 'transTub', label: 'Перенос: ванна/душ' },
  { id: 'walk', label: 'Ходьба/коляска' },
  { id: 'stairs', label: 'Лестница' },
];
const cognitive = [
  { id: 'comprehen', label: 'Понимание' },
  { id: 'express', label: 'Выражение' },
  { id: 'social', label: 'Социальное взаимодействие' },
  { id: 'solving', label: 'Решение проблем' },
  { id: 'memory', label: 'Память' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    ...motor.map((m) => ({ id: m.id, label: m.label, type: 'select' as const, options: scale17 })),
    ...cognitive.map((c) => ({ id: c.id, label: c.label, type: 'select' as const, options: scale17 })),
  ],
  compute: (v) => {
    const motorSum = motor.reduce((s, m) => s + Number(v[m.id] || 1), 0);
    const cogSum = cognitive.reduce((s, c) => s + Number(v[c.id] || 1), 0);
    const total = motorSum + cogSum;
    let color = '#EF4444', interp = 'Полная зависимость';
    if (total >= 108) { color = '#22C55E'; interp = 'Полная независимость'; }
    else if (total >= 90) { color = '#84CC16'; interp = 'Модиф. независимость'; }
    else if (total >= 72) { color = '#F59E0B'; interp = 'Умеренная зависимость'; }
    else if (total >= 54) { color = '#F59E0B'; interp = 'Выраженная зависимость'; }
    return {
      value: String(total),
      unit: '/126',
      interpretation: `${interp} (motor ${motorSum}/91, cognitive ${cogSum}/35).`,
      color,
      details: '18 доменов × 1-7 баллов. Motor = 13 пунктов (max 91), Cognitive = 5 пунктов (max 35). Применяется в стационарной реабилитации (CARF, Medicare IRF-PAI).',
      actions: [
        total < 72 ? 'Интенсивная мультидисциплинарная реабилитация (ЛФК, ОТ, логопед)' : '',
        total >= 72 && total < 108 ? 'Продолжить реабилитацию с акцентом на слабые домены' : '',
        total >= 108 ? 'Амбулаторная программа, профилактика рецидивов, социальная реинтеграция' : '',
        'Оценка при поступлении и выписке для FIM-gain',
        'Goal setting по SMART + участие родственников',
      ].filter(Boolean),
      caveats: [
        'Ceiling / floor effects на крайних значениях',
        'FIM-gain / FIM-efficiency — метрики эффективности реабилитации',
        'Заменяется на CARE Item Set / Section GG в США (Medicare)',
        'Обучение оценщиков обязательно (надёжность повышается)',
      ],
      scale: {
        segments: [
          { min: 18, max: 54, label: 'Полная зав.', color: '#EF4444' },
          { min: 54, max: 72, label: 'Выраженная', color: '#F59E0B' },
          { min: 72, max: 90, label: 'Умеренная', color: '#F59E0B' },
          { min: 90, max: 108, label: 'Модиф. незав.', color: '#84CC16' },
          { min: 108, max: 127, label: 'Независим', color: '#22C55E' },
        ],
        current: total,
        unit: 'FIM',
      },
      related: [{ id: 'barthel', title: 'Barthel' }, { id: 'berg-balance', title: 'Berg Balance' }],
      relatedCourses: [{ id: '312.1', title: 'Реабилитация' }],
    };
  },
  reference: 'Keith RA, Granger CV, Hamilton BB, Sherwin FS. The Functional Independence Measure: a new tool for rehabilitation. Adv Clin Rehabil 1987;1:6-18.',
  countries: 'Международный',
  presets: [
    { label: 'Независим', values: Object.fromEntries([...motor, ...cognitive].map((x) => [x.id, '7'])) },
    { label: 'Умеренная зав.', values: Object.fromEntries([...motor, ...cognitive].map((x) => [x.id, '4'])) },
    { label: 'Полная зав.', values: Object.fromEntries([...motor, ...cognitive].map((x) => [x.id, '1'])) },
  ],
  info: `### Для чего используется
**FIM (Functional Independence Measure)** — стандарт стационарной реабилитации. 18 пунктов × 1-7 баллов = 18-126. Оценка функциональной независимости по 13 моторным и 5 когнитивным доменам.

### Шкала 1-7
| Балл | Значение |
|---|---|
| 1 | Полная помощь (< 25 %) |
| 2 | Максимальная (< 50 %) |
| 3 | Умеренная (< 75 %) |
| 4 | Минимальная (≥ 75 %) |
| 5 | Наблюдение / подсказка |
| 6 | Модиф. независимость (устройства) |
| 7 | Полная независимость |

### Интерпретация
| FIM | Уровень |
|---|---|
| 18-53 | Полная зависимость |
| 54-71 | Выраженная |
| 72-89 | Умеренная |
| 90-107 | Модиф. независимость |
| 108-126 | Независим |

### Источник
Keith RA et al. Adv Clin Rehabil 1987.`,
};

export default runner;
