// @ts-nocheck
/** Runner: iief */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const mkOptions = () => [
  { value: '1', label: '1 — почти никогда', points: 1 },
  { value: '2', label: '2 — редко', points: 2 },
  { value: '3', label: '3 — иногда', points: 3 },
  { value: '4', label: '4 — часто', points: 4 },
  { value: '5', label: '5 — почти всегда', points: 5 },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'q1', label: '1. Уверенность в эрекции', type: 'select', options: mkOptions() },
    { id: 'q2', label: '2. Жёсткость для проникновения', type: 'select', options: mkOptions() },
    { id: 'q3', label: '3. Поддержание эрекции после проникновения', type: 'select', options: mkOptions() },
    { id: 'q4', label: '4. Удержание эрекции до конца акта', type: 'select', options: mkOptions() },
    { id: 'q5', label: '5. Удовлетворённость актом', type: 'select', options: mkOptions() },
  ],
  compute: (v) => {
    const total = Number(v.q1) + Number(v.q2) + Number(v.q3) + Number(v.q4) + Number(v.q5);
    let color = '#22C55E', interpretation = 'Нет ЭД';
    if (total <= 7) { color = '#991B1B'; interpretation = 'Тяжёлая ЭД'; }
    else if (total <= 11) { color = '#EF4444'; interpretation = 'Умеренная ЭД'; }
    else if (total <= 16) { color = '#F59E0B'; interpretation = 'Лёгко-умеренная ЭД'; }
    else if (total <= 21) { color = '#FACC15'; interpretation = 'Лёгкая ЭД'; }

    const actions = total >= 22
      ? ['Эректильная функция в пределах нормы', 'Общие рекомендации: физ. активность, контроль СД/АГ, отказ от курения']
      : total >= 12
        ? ['PDE5-ингибиторы 1-й линии (силденафил, тадалафил, варденафил)',
           'Исключить вторичные причины: СД, АГ, гипогонадизм (тестостерон утром)',
           'Психосексуальное консультирование при тревожности',
           'Модификация образа жизни']
        : ['PDE5 в высоких дозах или ежедневный тадалафил 5 мг',
           'Проверить тестостерон, пролактин, ТТГ, глюкозу, липиды',
           'При неэффективности PDE5: интракавернозные инъекции, вакуумные устройства',
           'Фаллопротезирование при рефрактерной ЭД'];

    return {
      value: String(total),
      unit: 'балл IIEF-5',
      interpretation,
      color,
      details: `IIEF-5 (SHIM): ${total}/25. ${interpretation}.`,
      actions,
      caveats: [
        'IIEF-5 валидирован как скрининг; полный IIEF-15 — 5 доменов',
        'Не применим при отсутствии сексуальной активности за последние 6 мес',
        'ЭД часто маркер ССЗ — оценить ASCVD-риск',
        'Исключить приём препаратов: β-блокаторы, СИОЗС, антиандрогены',
      ],
      scale: {
        segments: [
          { min: 1, max: 8, label: 'Тяжёлая', color: '#991B1B' },
          { min: 8, max: 12, label: 'Умеренная', color: '#EF4444' },
          { min: 12, max: 17, label: 'Лёгко-умер.', color: '#F59E0B' },
          { min: 17, max: 22, label: 'Лёгкая', color: '#FACC15' },
          { min: 22, max: 26, label: 'Норма', color: '#22C55E' },
        ],
        current: total,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'ipss', title: 'IPSS (ДГПЖ)' },
        { id: 'iciq', title: 'ICIQ-UI SF' },
      ],
    };
  },
  reference: 'Rosen RC et al. Int J Impot Res 1999;11:319–326 (IIEF-5/SHIM).',
  countries: 'Международный',
  presets: [
    { label: 'Норма', values: { q1: '5', q2: '5', q3: '5', q4: '5', q5: '5' } },
    { label: 'Умеренная ЭД', values: { q1: '2', q2: '2', q3: '2', q4: '2', q5: '2' } },
    { label: 'Тяжёлая ЭД', values: { q1: '1', q2: '1', q3: '1', q4: '1', q5: '1' } },
  ],
  info: `### Для чего используется
**IIEF-5 (SHIM)** — сокращённая форма IIEF для скрининга и мониторинга эректильной дисфункции.

### Интерпретация
| Балл | Тяжесть ЭД |
|---|---|
| 22–25 | Нет ЭД |
| 17–21 | Лёгкая |
| 12–16 | Лёгко-умеренная |
| 8–11 | Умеренная |
| 1–7 | Тяжёлая |

### Полный IIEF-15
Включает 5 доменов: эректильная функция (Q1–5, 15), оргастическая (9–10), либидо (11–12), удовлетворённость актом (6–7, 8), общая удовлетворённость (13–14).`,
};
export default runner;
