/** Runner: odi — Oswestry Disability Index */
import type { CalculatorTool } from '../tools-runners';

const opts = [
  { value: '0', label: '0', points: 0 },
  { value: '1', label: '1', points: 1 },
  { value: '2', label: '2', points: 2 },
  { value: '3', label: '3', points: 3 },
  { value: '4', label: '4', points: 4 },
  { value: '5', label: '5', points: 5 },
];

const items = [
  { id: 'i1', label: '1. Интенсивность боли' },
  { id: 'i2', label: '2. Самообслуживание' },
  { id: 'i3', label: '3. Поднятие тяжестей' },
  { id: 'i4', label: '4. Ходьба' },
  { id: 'i5', label: '5. Сидение' },
  { id: 'i6', label: '6. Стояние' },
  { id: 'i7', label: '7. Сон' },
  { id: 'i8', label: '8. Половая жизнь' },
  { id: 'i9', label: '9. Социальная активность' },
  { id: 'i10', label: '10. Путешествия' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: items.map((i) => ({ id: i.id, label: i.label, type: 'select', options: opts })),
  compute: (v) => {
    let answered = 0, sum = 0;
    items.forEach((i) => {
      const x = v[i.id];
      if (x !== undefined && x !== null && x !== '') {
        sum += Number(x);
        answered++;
      }
    });
    if (answered === 0) answered = 10;
    const pct = (sum / (answered * 5)) * 100;
    let color = '#22C55E', interp = 'Минимальное ограничение';
    if (pct >= 81) { color = '#7F1D1D'; interp = 'Прикован к постели / симуляция'; }
    else if (pct >= 61) { color = '#EF4444'; interp = 'Инвалидизирующее'; }
    else if (pct >= 41) { color = '#F59E0B'; interp = 'Тяжёлое ограничение'; }
    else if (pct >= 21) { color = '#84CC16'; interp = 'Умеренное'; }
    return {
      value: pct.toFixed(0),
      unit: '%',
      interpretation: interp,
      color,
      details: `ODI 2.1a: сумма ${sum}, отвечено пунктов ${answered}, индекс = ${sum}/(${answered}×5) × 100 = ${pct.toFixed(1)} %. Стандарт оценки инвалидизации при боли в нижней части спины.`,
      actions: [
        pct < 21 ? 'Образование, активность, возврат к работе, НПВС по потребности' : '',
        pct >= 21 && pct < 41 ? 'ЛФК по McKenzie/стабилизация, мануальная терапия, CBT при хронизации' : '',
        pct >= 41 && pct < 61 ? 'Мультидисциплинарная реабилитация, оценка «красных флагов», МРТ при неврологии' : '',
        pct >= 61 ? 'Направление к нейрохирургу / ортопеду при корешковых симптомах, МРТ' : '',
        pct >= 81 ? 'Оценка психосоциальных факторов (Yellow flags), симуляции, вторичной выгоды' : '',
        'Оценка исходно и через 6-12 нед; MCID = 12,8 %',
      ].filter(Boolean),
      caveats: [
        'MCID: 12,8 % (некорешковая) / 16 % (хирургическая)',
        'Не пропущенные пункты пересчитываются: sum / (answered × 5) × 100',
        'Альтернатива: Roland-Morris (проще), SF-36 (общий)',
        'Пункт 8 (половая жизнь) часто пропускается — это допустимо',
      ],
      scale: {
        segments: [
          { min: 0, max: 21, label: 'Минимум', color: '#22C55E' },
          { min: 21, max: 41, label: 'Умер.', color: '#84CC16' },
          { min: 41, max: 61, label: 'Тяж.', color: '#F59E0B' },
          { min: 61, max: 81, label: 'Инвалид.', color: '#EF4444' },
          { min: 81, max: 101, label: 'Лежачий', color: '#7F1D1D' },
        ],
        current: Number(pct.toFixed(0)),
        unit: 'ODI %',
      },
      related: [{ id: 'womac-rehab', title: 'WOMAC' }, { id: 'fim-rehab', title: 'FIM' }],
      relatedCourses: [{ id: '312.1', title: 'Реабилитация' }],
    };
  },
  reference: 'Fairbank JC, Pynsent PB. The Oswestry Disability Index. Spine 2000;25:2940-2953.',
  countries: 'Международный',
  presets: [
    { label: 'Минимум', values: Object.fromEntries(items.map((i) => [i.id, '1'])) },
    { label: 'Умеренное', values: Object.fromEntries(items.map((i) => [i.id, '2'])) },
    { label: 'Тяжёлое', values: Object.fromEntries(items.map((i) => [i.id, '4'])) },
  ],
  info: `### Для чего используется
**Oswestry Disability Index (ODI)** — стандарт оценки функционального ограничения при боли в нижней части спины. 10 пунктов × 0-5 = 0-50 → выражается в %.

### Интерпретация
| ODI % | Уровень |
|---|---|
| 0-20 | Минимум |
| 21-40 | Умеренное |
| 41-60 | Тяжёлое |
| 61-80 | Инвалидизирующее |
| 81-100 | Прикован к постели / симуляция |

### MCID
- 12,8 % — консервативное лечение
- ~16 % — после хирургии

### Источник
Fairbank JC, Pynsent PB. Spine 2000.`,
};

export default runner;
