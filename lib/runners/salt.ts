/** Runner: salt - SALT (Severity of Alopecia Tool) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'top', label: 'Верх скальпа: % потери волос (вес 40%)', type: 'number', min: 0, max: 100, step: 5, quickValues: [0, 25, 50, 75, 100] },
    { id: 'back', label: 'Затылок: % потери (вес 24%)', type: 'number', min: 0, max: 100, step: 5, quickValues: [0, 25, 50, 75, 100] },
    { id: 'right', label: 'Правая сторона: % потери (вес 18%)', type: 'number', min: 0, max: 100, step: 5, quickValues: [0, 25, 50, 75, 100] },
    { id: 'left', label: 'Левая сторона: % потери (вес 18%)', type: 'number', min: 0, max: 100, step: 5, quickValues: [0, 25, 50, 75, 100] },
  ],
  compute: (v) => {
    const top = Number(v.top || 0);
    const back = Number(v.back || 0);
    const right = Number(v.right || 0);
    const left = Number(v.left || 0);
    const score = Math.round((top * 0.40 + back * 0.24 + right * 0.18 + left * 0.18) * 10) / 10;

    let color = '#22C55E', band = 'Минимальная', type = '';
    if (score >= 95) { color = '#7F1D1D'; band = 'Тотальная (universalis / totalis)'; }
    else if (score >= 75) { color = '#EF4444'; band = 'Очень тяжёлая'; }
    else if (score >= 50) { color = '#F97316'; band = 'Тяжёлая'; }
    else if (score >= 25) { color = '#F59E0B'; band = 'Среднетяжёлая'; }
    else if (score >= 10) { color = '#84CC16'; band = 'Лёгкая'; }

    return {
      value: String(score),
      unit: '/100',
      interpretation: band,
      color,
      details: `Взвешенная потеря волос на скальпе = ${score}% (top·0.4 + back·0.24 + right·0.18 + left·0.18).`,
      actions: [
        score < 25 ? 'Интралезионно триамцинолон ацетонид 5-10 мг/мл каждые 4-6 нед (patchy AA)' : '',
        score < 25 ? 'Топические ГКС высокой потенции под окклюзией' : '',
        score >= 25 && score < 50 ? 'Топический миноксидил 5% + ТГКС; контактная иммунотерапия (DPCP, SADBE)' : '',
        score >= 50 ? 'Системная терапия: JAK-ингибиторы — барицитиниб (одобрен FDA), ритлецитиниб, деуруксолитиниб' : '',
        score >= 50 ? 'Пульс-терапия дексаметазоном / метилпреднизолоном может рассматриваться' : '',
        'Психологическая поддержка, ассоциация с депрессией / тревогой',
        'Скрининг сопутствующих аутоиммунных (щитовидка, витилиго, СД 1, целиакия)',
      ].filter(Boolean),
      caveats: [
        'SALT оценивает ТОЛЬКО скальп, не учитывает брови/ресницы/тело',
        'SALT II — включает бороду, брови, ресницы, тело (для universalis)',
        'Spontaneous regrowth — у 50% patchy AA в течение года без лечения',
        'JAK-i требуют скрининга TB, HBV, HCV, липидного профиля',
        'SALT-50 (регрост до ≤ 20 после ≥ 50) — маркер клинически значимого ответа',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: 'S0/S1', color: '#22C55E' },
          { min: 10, max: 25, label: 'S2 лёгкая', color: '#84CC16' },
          { min: 25, max: 50, label: 'S3', color: '#F59E0B' },
          { min: 50, max: 75, label: 'S4', color: '#F97316' },
          { min: 75, max: 95, label: 'S5', color: '#EF4444' },
          { min: 95, max: 100, label: 'S5 тотальная', color: '#7F1D1D' },
        ],
        current: score,
        unit: 'SALT',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'scorad', title: 'SCORAD' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Olsen EA, Hordinsky MK, Price VH, et al. Alopecia areata investigational assessment guidelines - Part II. J Am Acad Dermatol 2004;51:440-447.',
  countries: 'Международный (NAAF / AAD)',
  presets: [
    { label: 'Patchy (15%)', values: { top: 20, back: 10, right: 10, left: 10 } },
    { label: 'Тяжёлая (60%)', values: { top: 70, back: 60, right: 50, left: 50 } },
    { label: 'Totalis 100%', values: { top: 100, back: 100, right: 100, left: 100 } },
  ],
  info: `### Для чего используется
**SALT (Severity of Alopecia Tool)** — взвешенная оценка потери волос на скальпе при **alopecia areata**. Стандарт для клинических исследований JAK-ингибиторов.

### Формула
\`SALT = 0.4·top + 0.24·back + 0.18·right + 0.18·left\`

Каждая область оценивается % потери волос визуально.

### Стадии (NAAF)
| SALT | Стадия |
|---|---|
| 0 | S0 — нет потери |
| < 25 | S1-S2 (лёгкая) |
| 25-49 | S3 (среднетяжёлая) |
| 50-74 | S4 (тяжёлая) |
| 75-99 | S5 (очень тяжёлая) |
| 100 | Totalis (если + тело = universalis) |

### Современная терапия (2022+)
| Тяжесть | Линия |
|---|---|
| < 50 | Локальная: интралез. ТГКС, топический миноксидил, контактная иммунотерапия |
| ≥ 50 | Системная: **барицитиниб** (FDA 2022), **ритлецитиниб** (2023), **деуруксолитиниб** (2024) |

### Маркеры ответа
- **SALT-50**: достижение ≤ 20 после исходного ≥ 50
- **SALT-90**: ≤ 10 после любого исходного

### Источник
Olsen EA et al. JAAD 2004.`,
};

export default runner;
