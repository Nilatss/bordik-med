/** Runner: rer */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'species',
      label: 'Вид',
      type: 'select',
      options: [
        { value: 'dog', label: 'Собака' },
        { value: 'cat', label: 'Кошка' },
      ],
    },
    { id: 'weight',
hint: 'Вес в кг (без одежды)', label: 'Масса тела (кг)', type: 'number', min: 0.3, max: 100, step: 0.1, unit: 'кг' },
    {
      id: 'factor',
      label: 'Фактор DER',
      type: 'select',
      options: [
        { value: 1.0, label: '1,0 — Госпитализация / снижение веса (цель)' },
        { value: 1.2, label: '1,2 — Кастрированная кошка' },
        { value: 1.4, label: '1,4 — Интактная кошка / старший возраст' },
        { value: 1.6, label: '1,6 — Кастрированная собака' },
        { value: 1.8, label: '1,8 — Интактная собака' },
        { value: 2.0, label: '2,0 — Щенок/котёнок 4-12 мес' },
        { value: 2.5, label: '2,5 — Умеренная активность / рабочая' },
        { value: 3.0, label: '3,0 — Щенок < 4 мес / высокая активность' },
        { value: 4.0, label: '4,0 — Лактация' },
      ],
    },
  ],
  compute: (v) => {
    const sp = String(v.species);
    const w = Number(v.weight) || 0;
    const f = Number(v.factor) || 1.6;

    const useLinear = w < 2 || w > 30;
    const rer = w > 0 ? (useLinear ? 30 * w + 70 : 70 * Math.pow(w, 0.75)) : 0;
    const der = Math.round(rer * f);
    const rerR = Math.round(rer);

    return {
      value: `${der}`,
      unit: 'ккал/сут (DER)',
      interpretation: `RER ${rerR} · DER ${der} ккал/сут`,
      color: '#4B8DF5',
      details: `Формула RER:\n${useLinear ? `30 × ${w} + 70 = **${rerR} ккал/сут**` : `70 × ${w}^0,75 = **${rerR} ккал/сут**`}\n\nDER = RER × ${f} = ${der} ккал/сут\n\nВид: ${sp === 'cat' ? 'кошка' : 'собака'}`,
      actions: [
        `Рассчитать объём корма: ${der} ккал ÷ плотность корма (ккал/г)`,
        sp === 'dog' ? 'Разделить на 2 приёма/сут (щенки — 3-4)' : 'Кошки — 3-4 мелких приёма или свободный доступ',
        'Взвешивание еженедельно 2 нед, затем 1×/мес',
        'Для снижения веса — считать DER на ЦЕЛЕВУЮ массу, не текущую',
        'Для госпитальных — начинать с 25-50 % RER, наращивать за 3 дня (refeeding)',
      ],
      caveats: [
        'Формула 70 × BW^0,75 — для 2-30 кг (стандарт)',
        '< 2 или > 30 кг — линейная формула 30 × BW + 70',
        'Индивидуальная вариабельность ± 20 % — корректировать по BCS',
        'У госпитализированных без ИВЛ метаболические потребности обычно РАВНЫ RER (не ×1,5)',
        'Лактация — DER до 4-6 × RER, щенки растущие — 2-3 × RER',
      ],
      scale: {
        segments: [
          { min: 0, max: 200, label: 'Малый', color: '#60A5FA' },
          { min: 200, max: 600, label: 'Средний', color: '#22C55E' },
          { min: 600, max: 1500, label: 'Крупный', color: '#F59E0B' },
          { min: 1500, max: 5000, label: 'Гигант', color: '#EF4444' },
        ],
        current: der,
        unit: 'ккал',
      },
      related: [
        { id: 'bcs', title: 'BCS (9-point)' },
        { id: 'purina-fediaf', title: 'Purina · FEDIAF' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'NRC. Nutrient Requirements of Dogs and Cats. Washington: National Academies Press; 2006. · WSAVA Global Nutrition Guidelines 2011.',
  countries: 'Международный (NRC · WSAVA)',
  presets: [
    { label: 'Кот 4 кг кастрат', values: { species: 'cat', weight: 4, factor: 1.2 } },
    { label: 'Лабр 30 кг кастрат', values: { species: 'dog', weight: 30, factor: 1.6 } },
    { label: 'Щенок 2 кг', values: { species: 'dog', weight: 2, factor: 3.0 } },
  ],
  info: `
### Для чего используется
**Resting Energy Requirement (RER)** — базальные энергетические потребности собак и кошек в покое. Основа для расчёта суточной калорийности (DER — Daily Energy Requirement).

### Формулы RER
| Масса | Формула |
|---|---|
| 2-30 кг | \`RER = 70 × BW^0,75 ккал/сут\` |
| < 2 или > 30 кг | \`RER = 30 × BW + 70 ккал/сут\` |

### DER = RER × фактор
| Фактор | Статус |
|---|---|
| 1,0 | Госпитализация / снижение веса (цель) |
| 1,2 | Кастр. кошка |
| 1,4 | Интакт. кошка, старший возраст |
| 1,6 | Кастр. собака |
| 1,8 | Интакт. собака |
| 2,0 | Щенок 4-12 мес |
| 2,5 | Умеренная активность |
| 3,0 | Щенок < 4 мес, высокая активность |
| 4,0 | Лактация |

### Примеры
- **Кот 4 кг** (кастрат): RER = 70 × 4^0,75 = 198 ккал; DER = 198 × 1,2 = **238 ккал/сут**
- **Лабр 30 кг**: RER = 70 × 30^0,75 = 897 ккал; DER = 897 × 1,6 = **1 435 ккал/сут**

### Клиническое применение
- Подбор суточного рациона
- Планирование snижения / набора веса
- Расчёт энтерального питания госпитализированных
- Refeeding — начинать с 25-50 % RER, наращивать 3 дня

### Источник
NRC 2006 · WSAVA Global Nutrition Guidelines 2011 · Small Animal Clinical Nutrition, 5th ed.`,
};
export default runner;
