/** Runner: casi — Cutaneous ALL Severity Index (psoriasis subtypes) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'erythema', label: 'Эритема (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'infiltration', label: 'Инфильтрация (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'desquamation', label: 'Шелушение (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'area', label: 'Площадь (0-6, PASI-шкала)', type: 'number', min: 0, max: 6, step: 1 },
    { id: 'pustules', label: 'Пустулы / пальпируемые очаги (0-4)', type: 'number', min: 0, max: 4, step: 1 },
  ],
  compute: (v) => {
    const e = Number(v.erythema || 0);
    const i = Number(v.infiltration || 0);
    const d = Number(v.desquamation || 0);
    const a = Number(v.area || 0);
    const p = Number(v.pustules || 0);
    const casi = (e + i + d + p) * a;
    let color = '#22C55E', interp = 'Лёгкая активность';
    if (casi >= 48) { color = '#EF4444'; interp = 'Тяжёлая активность'; }
    else if (casi >= 24) { color = '#F59E0B'; interp = 'Среднетяжёлая'; }
    return {
      value: String(casi),
      unit: 'CASI',
      interpretation: interp,
      color,
      details: `CASI = (E + I + D + P) × A = (${e} + ${i} + ${d} + ${p}) × ${a} = ${casi}. Используется для оценки редких вариантов псориаза (пустулёзного, эритродермического) и ответа на терапию.`,
      actions: [
        casi < 24 ? 'Топические ГКС, кальципотриол, NB-UVB 311 нм' : '',
        casi >= 24 && casi < 48 ? 'Метотрексат 15-25 мг/нед, ацитретин 0,3-0,5 мг/кг, апремиласт' : '',
        casi >= 48 ? 'Биологики: анти-IL-17 (секукинумаб), анти-IL-23 (рисанкизумаб), анти-ФНО' : '',
        'Скрининг ПсА (PEST), ССЗ, метаболического синдрома, депрессии',
        'Перед биологиками — TB (IGRA), HBV, HCV, HIV',
      ].filter(Boolean),
      caveats: [
        'CASI разработан для оценки пустулёзного и эритродермического псориаза',
        'В рутинной практике классический PASI остаётся стандартом',
        'Дополняйте DLQI для оценки качества жизни (порог ≥ 10)',
      ],
      scale: {
        segments: [
          { min: 0, max: 24, label: 'Лёгкая', color: '#22C55E' },
          { min: 24, max: 48, label: 'Средняя', color: '#F59E0B' },
          { min: 48, max: 96, label: 'Тяжёлая', color: '#EF4444' },
        ],
        current: casi,
        unit: 'CASI',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'dlqi', title: 'DLQI' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Berth-Jones J et al. The use of ciclosporin in psoriasis. J Dermatolog Treat 2006. (CASI modification)',
  countries: 'Международный',
  presets: [
    { label: 'Лёгкая', values: { erythema:1, infiltration:1, desquamation:1, area:2, pustules:0 } },
    { label: 'Средняя', values: { erythema:2, infiltration:2, desquamation:2, area:4, pustules:1 } },
    { label: 'Тяжёлая', values: { erythema:3, infiltration:3, desquamation:3, area:5, pustules:3 } },
  ],
  info: `### Для чего используется
**CASI (Cutaneous ALL Severity Index)** — модифицированный PASI для вариантов псориаза с пустулами (GPP) и эритродермического.

### Формула
CASI = (E + I + D + P) × A, где:
- E — эритема 0-4
- I — инфильтрация 0-4
- D — шелушение 0-4
- P — пустулы / пальпируемые очаги 0-4
- A — площадь 0-6

### Интерпретация
| CASI | Тяжесть |
|---|---|
| 0-23 | Лёгкая |
| 24-47 | Средняя |
| ≥ 48 | Тяжёлая |

### Источник
Berth-Jones J et al. 2006.`,
};

export default runner;
