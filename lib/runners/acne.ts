// @ts-nocheck
/** Runner: acne — GAGS (Global Acne Grading Scale) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'forehead', label: 'Лоб: худший тип (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'rcheek', label: 'Правая щека (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'lcheek', label: 'Левая щека (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'nose', label: 'Нос (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'chin', label: 'Подбородок (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'chest', label: 'Грудь/верхняя спина (0-4)', type: 'number', min: 0, max: 4, step: 1 },
  ],
  compute: (v) => {
    const f = Number(v.forehead || 0) * 2;
    const rc = Number(v.rcheek || 0) * 2;
    const lc = Number(v.lcheek || 0) * 2;
    const n = Number(v.nose || 0) * 1;
    const ch = Number(v.chin || 0) * 1;
    const cb = Number(v.chest || 0) * 3;
    const total = f + rc + lc + n + ch + cb;
    let color = '#22C55E', interp = 'Нет / лёгкое';
    if (total >= 39) { color = '#7F1D1D'; interp = 'Очень тяжёлое'; }
    else if (total >= 31) { color = '#EF4444'; interp = 'Тяжёлое'; }
    else if (total >= 19) { color = '#F59E0B'; interp = 'Среднетяжёлое'; }
    else if (total >= 1) { color = '#84CC16'; interp = 'Лёгкое'; }
    return {
      value: String(total),
      unit: 'GAGS',
      interpretation: interp,
      color,
      details: 'GAGS: локальная оценка (0 — нет, 1 — ≥ 1 комедон, 2 — папулы, 3 — пустулы, 4 — узлы) × фактор локализации (лоб ×2, щёки ×2, нос ×1, подбородок ×1, грудь/спина ×3).',
      actions: [
        total < 19 ? 'Топические ретиноиды (адапален, третиноин) ± бензоилпероксид 2,5-5 %' : '',
        total >= 19 && total < 31 ? 'Комбинация: топический ретиноид + БПО + топический антибиотик или доксициклин 100 мг/сут × 3 мес' : '',
        total >= 31 ? 'Изотретиноин 0,5-1 мг/кг/сут, курс 16-20 нед (кумулятивная доза 120-150 мг/кг)' : '',
        total >= 31 ? 'Перед изотретиноином: iPLEDGE / контрацепция (кат. X), ЛФ, АЛТ, липиды' : '',
        'Женщины с гормональным компонентом — КОК или спиронолактон 50-100 мг/сут',
        'Избегать выдавливания, агрессивных пилингов; мягкое очищение; SPF 30+',
      ].filter(Boolean),
      caveats: [
        'GAGS — один из валидированных инструментов; альтернатива IGA 0-4 (FDA)',
        'Не заменяет клиническую оценку рубцов и поствоспалительной гиперпигментации',
        'У пациентов с фоточувствительной кожей — осторожно с ретиноидами',
        'Женщинам с изотретиноином — iPLEDGE/контрацепция за 1 мес до, во время и 1 мес после',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нет', color: '#22C55E' },
          { min: 1, max: 19, label: 'Лёгкое', color: '#84CC16' },
          { min: 19, max: 31, label: 'Среднее', color: '#F59E0B' },
          { min: 31, max: 39, label: 'Тяжёлое', color: '#EF4444' },
          { min: 39, max: 45, label: 'Оч. тяж.', color: '#7F1D1D' },
        ],
        current: total,
        unit: 'GAGS',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'dlqi', title: 'DLQI' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Doshi A, Zaheer A, Stiller MJ. A comparison of current acne grading systems and proposal of a novel system. Int J Dermatol 1997;36:416-418.',
  countries: 'Международный',
  presets: [
    { label: 'Лёгкое', values: { forehead:1, rcheek:1, lcheek:1, nose:1, chin:1, chest:0 } },
    { label: 'Среднее', values: { forehead:2, rcheek:2, lcheek:2, nose:2, chin:2, chest:1 } },
    { label: 'Тяжёлое', values: { forehead:3, rcheek:3, lcheek:3, nose:2, chin:3, chest:2 } },
  ],
  info: `### Для чего используется
**GAGS (Global Acne Grading Scale)** — объективная шкала тяжести акне по локализациям и типу элементов.

### Типы элементов (0-4)
| Балл | Элемент |
|---|---|
| 0 | Нет |
| 1 | ≥ 1 комедон |
| 2 | Папулы |
| 3 | Пустулы |
| 4 | Узлы |

### Факторы локализации
| Область | ×Фактор |
|---|---|
| Лоб, щёки | ×2 |
| Нос, подбородок | ×1 |
| Грудь/спина | ×3 |

### Интерпретация
| Сумма | Тяжесть |
|---|---|
| 0 | Нет |
| 1-18 | Лёгкое |
| 19-30 | Среднее |
| 31-38 | Тяжёлое |
| ≥ 39 | Очень тяжёлое |

### Источник
Doshi A et al. Int J Dermatol 1997.`,
};

export default runner;
