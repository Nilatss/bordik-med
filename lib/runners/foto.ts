/** Runner: foto — FOTO Functional Staging (rehab outcome) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'region', label: 'Регион', type: 'select', options: [
      { value: 'lumbar', label: 'Поясничный' },
      { value: 'cervical', label: 'Шейный' },
      { value: 'shoulder', label: 'Плечо' },
      { value: 'knee', label: 'Колено' },
      { value: 'hip', label: 'Бедро' },
      { value: 'other', label: 'Другое' },
    ]},
    { id: 'fs', label: 'Functional Staging (FS) 0-100', type: 'number', min: 0, max: 100, step: 1, quickValues: [20, 40, 55, 70, 85] },
    { id: 'episodes', label: 'Эпизодов боли за 12 мес', type: 'number', min: 0, max: 20, step: 1 },
    { id: 'chronic', label: 'Хронизация > 3 мес', type: 'checkbox' },
  ],
  compute: (v) => {
    const fs = Number(v.fs || 0);
    const ep = Number(v.episodes || 0);
    const chronic = !!v.chronic;
    let color = '#EF4444', interp = 'Стадия 1 — выраженное ограничение';
    if (fs >= 80) { color = '#22C55E'; interp = 'Стадия 5 — функциональное восстановление'; }
    else if (fs >= 65) { color = '#84CC16'; interp = 'Стадия 4 — лёгкое ограничение'; }
    else if (fs >= 50) { color = '#F59E0B'; interp = 'Стадия 3 — умеренное'; }
    else if (fs >= 30) { color = '#F59E0B'; interp = 'Стадия 2 — выраженное'; }
    const riskFactors = (chronic ? 1 : 0) + (ep >= 3 ? 1 : 0);
    return {
      value: String(fs),
      unit: 'FS / 100',
      interpretation: `${interp}. Риск-факторы хронизации: ${riskFactors}/2.`,
      color,
      details: `FOTO FS (Functional Staging) — IRT-based исход амбулаторной реабилитации. Диапазон 0-100, сопоставим между эпизодами и регионами. Эпизоды за год: ${ep}; хронизация: ${chronic ? 'да' : 'нет'}.`,
      actions: [
        fs < 30 ? 'Интенсивная реабилитация 3×/нед × 6-8 нед; ЛФК + мануальная + обучение' : '',
        fs >= 30 && fs < 65 ? 'Амбулаторная реабилитация 2×/нед × 4-6 нед' : '',
        fs >= 65 ? 'Домашняя программа, самостоятельная активность, самомониторинг' : '',
        riskFactors >= 2 ? 'Yellow flags: оценка CBT, градуированная активность, возврат к работе' : '',
        'Оценка исходно и на выписке; MCID по региону различается',
      ].filter(Boolean),
      caveats: [
        'FOTO — проприетарная система (Focus On Therapeutic Outcomes Inc.)',
        'IRT-адаптивное тестирование снижает количество вопросов до 6-8',
        'Risk-adjustment по возрасту, хронизации, операциям, сопутствующим',
        'В России не валидирован; альтернативы — ODI (спина), DASH (верхняя конечность), LEFS (нижняя)',
      ],
      scale: {
        segments: [
          { min: 0, max: 30, label: '1 — выраж.', color: '#EF4444' },
          { min: 30, max: 50, label: '2 — тяж.', color: '#F59E0B' },
          { min: 50, max: 65, label: '3 — умер.', color: '#F59E0B' },
          { min: 65, max: 80, label: '4 — лёгк.', color: '#84CC16' },
          { min: 80, max: 101, label: '5 — норма', color: '#22C55E' },
        ],
        current: fs,
        unit: 'FOTO FS',
      },
      related: [{ id: 'odi', title: 'ODI' }, { id: 'womac-rehab', title: 'WOMAC' }],
      relatedCourses: [{ id: '312.1', title: 'Реабилитация' }],
    };
  },
  reference: 'Hart DL, Werneke MW, Deutscher D, et al. Effect of numerical rating scale anchors on pain intensity. Arch Phys Med Rehabil 2010;91:1698-1704. (FOTO — Focus On Therapeutic Outcomes)',
  countries: 'США (FOTO Inc.)',
  presets: [
    { label: 'Выраженное', values: { region: 'lumbar', fs: 25, episodes: 4, chronic: true } },
    { label: 'Умеренное', values: { region: 'knee', fs: 55, episodes: 2, chronic: false } },
    { label: 'Почти норма', values: { region: 'shoulder', fs: 85, episodes: 0, chronic: false } },
  ],
  info: `### Для чего используется
**FOTO (Focus On Therapeutic Outcomes)** — североамериканская система оценки исходов амбулаторной реабилитации, основанная на IRT (item response theory) и computer-adaptive testing.

### Функциональное стадирование (FS) 0-100
| FS | Стадия | Описание |
|---|---|---|
| 0-29 | 1 | Выраженное ограничение |
| 30-49 | 2 | Тяжёлое |
| 50-64 | 3 | Умеренное |
| 65-79 | 4 | Лёгкое |
| 80-100 | 5 | Функциональное восстановление |

### Особенности
- CAT: 6-8 адаптивных вопросов вместо 20-30
- Risk-adjusted benchmarks
- Сопоставимость между эпизодами и регионами
- Интеграция в EHR

### Ограничения
- Проприетарная, платная
- Не валидирована за пределами США/Израиля

### Источник
Hart DL et al. Arch Phys Med Rehabil 2010.`,
};

export default runner;
