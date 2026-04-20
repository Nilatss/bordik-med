// @ts-nocheck
/** Runner: capra */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст ≥50 лет', type: 'select', options: [
      { value: '0', label: '<50 лет (0)', points: 0 },
      { value: '1', label: '≥50 лет (1)', points: 1 },
    ] },
    { id: 'psa', label: 'PSA', type: 'select', options: [
      { value: '0', label: '≤6 нг/мл (0)', points: 0 },
      { value: '1', label: '6.1–10 (1)', points: 1 },
      { value: '2', label: '10.1–20 (2)', points: 2 },
      { value: '3', label: '20.1–30 (3)', points: 3 },
      { value: '4', label: '>30 (4)', points: 4 },
    ] },
    { id: 'gleason', label: 'Gleason', type: 'select', options: [
      { value: '0', label: 'Нет паттерна 4/5 (0)', points: 0 },
      { value: '1', label: 'Вторичный 4 или 5 (1)', points: 1 },
      { value: '3', label: 'Первичный 4 или 5 (3)', points: 3 },
    ] },
    { id: 't', label: 'T-стадия', type: 'select', options: [
      { value: '0', label: 'T1/T2 (0)', points: 0 },
      { value: '1', label: 'T3a (1)', points: 1 },
    ] },
    { id: 'pos', label: '% позитивных биоптатов', type: 'select', options: [
      { value: '0', label: '<34% (0)', points: 0 },
      { value: '1', label: '≥34% (1)', points: 1 },
    ] },
  ],
  compute: (v) => {
    const total = Number(v.age) + Number(v.psa) + Number(v.gleason) + Number(v.t) + Number(v.pos);
    let color = '#22C55E', interpretation = 'Низкий риск', bfs = '~85%';
    if (total >= 6) { color = '#991B1B'; interpretation = 'Высокий риск'; bfs = '~35%'; }
    else if (total >= 3) { color = '#F59E0B'; interpretation = 'Средний риск'; bfs = '~65%'; }

    const actions = total <= 2
      ? ['Active surveillance (контроль PSA каждые 6 мес, МРТ, биопсия)',
         'Радикальная простатэктомия или брахитерапия при желании',
         'Внешняя лучевая терапия — альтернатива']
      : total <= 5
        ? ['Радикальная простатэктомия ± тазовая лимфаденэктомия',
           'Наружная лучевая терапия + короткий ADT (4–6 мес)',
           'Брахитерапия (HDR/LDR) — отдельные случаи']
        : ['Мультимодальная терапия: EBRT + длительный ADT (2–3 года)',
           'Радикальная простатэктомия + расширенная PLND в референсном центре',
           'Рассмотреть добавление доцетаксела / абиратерона (STAMPEDE)',
           'Стадирование: МРТ таза, PSMA-PET, костная сцинтиграфия'];

    return {
      value: String(total),
      unit: 'балл CAPRA',
      interpretation,
      color,
      details: `CAPRA ${total}/10. 5-летняя биохимическая рецидив-свободная выживаемость (BFS): ${bfs}.`,
      actions,
      caveats: [
        'CAPRA-S (постоперационный) использует данные операции',
        'Не заменяет молекулярные панели (Oncotype DX, Decipher)',
        'Не учитывает МРТ и PSMA-PET',
        'Валидирован для клинически локализованного РПЖ',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: 'Низкий', color: '#22C55E' },
          { min: 3, max: 6, label: 'Средний', color: '#F59E0B' },
          { min: 6, max: 11, label: 'Высокий', color: '#991B1B' },
        ],
        current: total,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'psa', title: 'PSA-кинетика' },
        { id: 'nmibc', title: 'EORTC NMIBC' },
      ],
    };
  },
  reference: 'Cooperberg MR et al. J Urol 2005;173:1938–1942.',
  countries: 'Международный (AUA/EAU)',
  presets: [
    { label: 'Низкий', values: { age: '1', psa: '0', gleason: '0', t: '0', pos: '0' } },
    { label: 'Средний', values: { age: '1', psa: '1', gleason: '1', t: '0', pos: '1' } },
    { label: 'Высокий', values: { age: '1', psa: '2', gleason: '3', t: '1', pos: '1' } },
  ],
  info: `### Для чего используется
**CAPRA (Cancer of the Prostate Risk Assessment)** — прогностическая шкала 0–10 для локализованного рака простаты; предсказывает биохимический рецидив, метастазирование, смертность.

### Компоненты
| Параметр | Баллы |
|---|---|
| Возраст ≥50 | 0–1 |
| PSA (≤6 / 6.1–10 / 10.1–20 / 20.1–30 / >30) | 0–4 |
| Gleason (вторичный 4/5 / первичный 4/5) | 0–3 |
| T-стадия (T3a) | 0–1 |
| % позитивных биоптатов ≥34 | 0–1 |

### Группы риска
| Балл | Риск | 5-yr BFS |
|---|---|---|
| 0–2 | Низкий | ~85% |
| 3–5 | Средний | ~65% |
| 6–10 | Высокий | ~35% |`,
};
export default runner;
