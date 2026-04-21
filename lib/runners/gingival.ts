// @ts-nocheck
/** Runner: gingival — Loe & Silness Gingival Index */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Loe & Silness, 1963)',
  reference: 'Löe H, Silness J. Periodontal disease in pregnancy. I. Prevalence and severity. Acta Odontol Scand. 1963;21:533-51.',
  inputs: [
    { id: 'gi', label: 'Средний GI (0.0-3.0)', type: 'number', min: 0, max: 3, step: 0.1 },
  ],
  presets: [
    { label: 'GI 0.3 (здоровая)', values: { gi: 0.3 } },
    { label: 'GI 1.5 (умеренный)', values: { gi: 1.5 } },
    { label: 'GI 2.5 (тяжёлый)', values: { gi: 2.5 } },
  ],
  compute: (v) => {
    const gi = Number(v.gi || 0);
    let label = 'Здоровая десна', color = '#22C55E';
    if (gi >= 2.1) { label = 'Тяжёлый гингивит'; color = '#B91C1C'; }
    else if (gi >= 1.1) { label = 'Умеренный гингивит'; color = '#F59E0B'; }
    else if (gi >= 0.1) { label = 'Лёгкий гингивит'; color = '#84CC16'; }
    return {
      value: gi.toFixed(2),
      unit: 'GI',
      color,
      interpretation: `GI ${gi.toFixed(2)} — ${label}`,
      details: `Gingival Index (Löe & Silness): ${gi.toFixed(2)}\nКатегория: ${label}\n\nОценка на 4 сайтах/зуб (mesio-vestib, средне-vestib, disto-vestib, lingual), усредняется по всем зубам:\n- 0 — норма\n- 1 — лёгкое воспаление (цвет, отёк; нет кровоточивости)\n- 2 — умеренное (краснота, отёк, глянец; кровоточивость при зондировании)\n- 3 — тяжёлое (резкая краснота, язвы; спонтанная кровоточивость)`,
      actions: [
        'GI 0.1-1.0: профгигиена, мотивация, чистка 2×/д + межзубн. нитка',
        'GI 1.1-2.0: scaling + повторный осмотр 2-4 нед',
        'GI 2.1-3.0: SRP + проверка на системные факторы (гормоны, СД, лекарства)',
      ],
      caveats: [
        'GI — визуальный + зондирование, субъективен → требует калибровки',
        'Зависим от пародонтального зонда (давление 25 г)',
        'Для скрининга популяции — BoP% или CPI предпочтительнее',
        'Беременность, пубертат — физиологическое повышение GI',
      ],
      scale: {
        segments: [
          { min: 0, max: 0.1, label: 'Здоров', color: '#22C55E' },
          { min: 0.1, max: 1.1, label: 'Лёгкий', color: '#84CC16' },
          { min: 1.1, max: 2.1, label: 'Умерен', color: '#F59E0B' },
          { min: 2.1, max: 3.01, label: 'Тяжёлый', color: '#B91C1C' },
        ],
        value: gi,
      },
      related: [
        { id: 'bop', title: 'BoP %' },
        { id: 'cpi', title: 'CPI (WHO)' },
        { id: 'aap-efp', title: 'AAP/EFP' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**Gingival Index (GI)** Löe & Silness (1963) — стандартный клинический индекс оценки воспаления десны.

### Шкала
| Балл | Описание |
|---|---|
| **0** | Здоровая десна |
| **1** | Лёгкое: небольшой цвет/отёк, нет кровоточивости |
| **2** | Умеренное: краснота, отёк, глянец, кровоточит при зондировании |
| **3** | Тяжёлое: резкое воспаление, язвы, спонтанная кровоточивость |

### Интерпретация среднего
| GI | Категория |
|---|---|
| 0.0 | Здоровая |
| 0.1-1.0 | Лёгкий гингивит |
| 1.1-2.0 | Умеренный |
| 2.1-3.0 | Тяжёлый |

### Методика
- 4 сайта на зуб (mesio-буккальн, среднебуккальн, дистобуккальн, язычный)
- Зонд WHO или Williams, давление ~25 г
- Среднее по всем обследованным зубам

### Источник
Löe H, Silness J. Acta Odontol Scand 1963;21:533.`,
};
export default runner;
