// @ts-nocheck
/** Runner: renal */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'r', label: 'R — Радиус (max диаметр)', type: 'select', options: [
      { value: '1', label: '≤4 см (1)', points: 1 },
      { value: '2', label: '4.1–7 см (2)', points: 2 },
      { value: '3', label: '>7 см (3)', points: 3 },
    ] },
    { id: 'e', label: 'E — Экзо/эндофитный', type: 'select', options: [
      { value: '1', label: '≥50% экзофитный (1)', points: 1 },
      { value: '2', label: '<50% экзофитный (2)', points: 2 },
      { value: '3', label: 'Полностью эндофитный (3)', points: 3 },
    ] },
    { id: 'n', label: 'N — Близость к ЧЛС/синусу', type: 'select', options: [
      { value: '1', label: '≥7 мм (1)', points: 1 },
      { value: '2', label: '4–7 мм (2)', points: 2 },
      { value: '3', label: '≤4 мм (3)', points: 3 },
    ] },
    { id: 'a', label: 'A — Передний/задний', type: 'select', options: [
      { value: 'a', label: 'Передний (a)', points: 0 },
      { value: 'p', label: 'Задний (p)', points: 0 },
      { value: 'x', label: 'Неопределённый (x)', points: 0 },
    ] },
    { id: 'l', label: 'L — Локация относительно полюсов', type: 'select', options: [
      { value: '1', label: 'Полностью выше/ниже полюсов (1)', points: 1 },
      { value: '2', label: 'Пересекает полюсную линию (2)', points: 2 },
      { value: '3', label: '>50% пересекает или у ворот (3)', points: 3 },
    ] },
    { id: 'hilar', label: 'Касается почечной артерии/вены (суффикс h)', type: 'checkbox' },
  ],
  compute: (v) => {
    const r = Number(v.r);
    const e = Number(v.e);
    const n = Number(v.n);
    const l = Number(v.l);
    const total = r + e + n + l;
    const suffix = String(v.a) + (v.hilar ? 'h' : '');

    let complexity = 'Низкая', color = '#22C55E';
    if (total >= 10) { complexity = 'Высокая'; color = '#EF4444'; }
    else if (total >= 7) { complexity = 'Средняя'; color = '#F59E0B'; }

    const details = `RENAL score = ${total} (${r}+${e}+${n}+${l})${suffix}. Сложность: ${complexity.toLowerCase()}.`;

    const actions = total <= 6
      ? ['Парциальная нефрэктомия — предпочтительна', 'Лапароскопический/роботический доступ', 'Возможна RFA/криоабляция при малых опухолях у коморбидных']
      : total <= 9
        ? ['Парциальная нефрэктомия возможна, но технически сложнее', 'Рассмотреть опыт хирурга и референсный центр', 'Радикальная нефрэктомия при невозможности сохранить почку']
        : ['Высокий риск осложнений (кровотечение, утечка мочи, ишемия)', 'Чаще показана радикальная нефрэктомия', 'Референсный центр, опытный хирург обязательны'];

    return {
      value: String(total),
      unit: `балл${suffix}`,
      interpretation: `Сложность: ${complexity}`,
      color,
      details,
      actions,
      caveats: [
        'Предоперационная оценка по КТ/МРТ с контрастом',
        'Суффикс h — прилежание к почечным сосудам (осторожность при резекции)',
        'Шкала предсказывает осложнения, время тёплой ишемии, но не онкологический исход',
        'Альтернативы: PADUA, C-Index, DAP',
      ],
      scale: {
        segments: [
          { min: 4, max: 7, label: 'Низкая', color: '#22C55E' },
          { min: 7, max: 10, label: 'Средняя', color: '#F59E0B' },
          { min: 10, max: 13, label: 'Высокая', color: '#EF4444' },
        ],
        current: total,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
        { id: '301.3', title: 'Нефрология' },
      ],
      related: [
        { id: 'nmibc', title: 'EORTC NMIBC' },
        { id: 'capra', title: 'CAPRA' },
      ],
    };
  },
  reference: 'Kutikov A, Uzzo RG. J Urol 2009;182:844–853.',
  countries: 'Международный (AUA)',
  presets: [
    { label: 'Простая (4)', values: { r: '1', e: '1', n: '1', a: 'a', l: '1', hilar: false } },
    { label: 'Средняя (8)', values: { r: '2', e: '2', n: '2', a: 'p', l: '2', hilar: false } },
    { label: 'Сложная (11)', values: { r: '3', e: '3', n: '3', a: 'x', l: '2', hilar: true } },
  ],
  info: `### Для чего используется
**RENAL nephrometry score** — стандартизированная оценка анатомической сложности опухоли почки перед нефронсберегающей операцией.

### Параметры (1–3 балла каждый)
| Буква | Параметр |
|---|---|
| R | Радиус (максимальный диаметр) |
| E | Экзо- / эндофитный характер |
| N | Близость к чашечно-лоханочной системе / синусу |
| A | Передний / задний / неопределённый (суффикс, без баллов) |
| L | Локация относительно полюсных линий |
| h | Касается главных почечных сосудов (суффикс) |

### Сложность
| Баллы | Сложность |
|---|---|
| 4–6 | Низкая |
| 7–9 | Средняя |
| 10–12 | Высокая |

### Источник
Kutikov A, Uzzo RG. J Urol 2009.`,
};
export default runner;
