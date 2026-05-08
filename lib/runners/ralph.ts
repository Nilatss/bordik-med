/** Runner: ralph (RALE score) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const quadrantOptions = [
  { value: 0, label: '0 — нет консолидации' },
  { value: 1, label: '1 — < 25 %' },
  { value: 2, label: '2 — 25-50 %' },
  { value: 3, label: '3 — 50-75 %' },
  { value: 4, label: '4 — > 75 %' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ul', label: 'Верхний левый квадрант (0-4)', type: 'select', options: quadrantOptions },
    { id: 'ur', label: 'Верхний правый квадрант (0-4)', type: 'select', options: quadrantOptions },
    { id: 'll', label: 'Нижний левый квадрант (0-4)', type: 'select', options: quadrantOptions },
    { id: 'lr', label: 'Нижний правый квадрант (0-4)', type: 'select', options: quadrantOptions },
  ],
  compute: (v) => {
    const ul = Number(v.ul) || 0;
    const ur = Number(v.ur) || 0;
    const ll = Number(v.ll) || 0;
    const lr = Number(v.lr) || 0;
    const score = ul + ur + ll + lr;

    let label = '', color = '', interp = '';
    if (score <= 4) {
      label = 'Минимальная';
      color = '#10B981';
      interp = 'Минимальная рентгенологическая тяжесть. Прогноз благоприятный.';
    } else if (score <= 8) {
      label = 'Умеренная';
      color = '#F59E0B';
      interp = 'Умеренная консолидация. Ассоциирована со средней смертностью при ОРДС (~ 25-35 %).';
    } else if (score <= 12) {
      label = 'Тяжёлая';
      color = '#EF4444';
      interp = 'Тяжёлая консолидация. RALE ≥ 9 — независимый предиктор смертности при ОРДС.';
    } else {
      label = 'Крайне тяжёлая';
      color = '#DC2626';
      interp = 'Крайне тяжёлая консолидация (почти тотальная). Очень высокая смертность, рассмотреть ЭКМО.';
    }

    return {
      value: String(score) + ' / 16',
      interpretation: interp,
      color,
      details: `ВЛ: ${ul} • ВП: ${ur} • НЛ: ${ll} • НП: ${lr}. Сумма = ${score}.`,
      actions: [
        score >= 9 ? 'Протективная вентиляция: VT 4-6 мл/кг идеальной массы, Pplat ≤ 30, driving pressure ≤ 15' : 'Оптимизация ПДКВ по PEEP/FiO₂ таблице ARDSNet',
        score >= 9 ? 'Раннее прон-позиционирование ≥ 16 ч/сут при PaO₂/FiO₂ < 150' : 'Консервативная волемия при стабилизации',
        score >= 12 ? 'Консультация ЭКМО-центра (VV-ECMO при Murray ≥ 3, PaO₂/FiO₂ < 80)' : 'Рассмотреть нейромышечную блокаду 48 ч',
        'Этиологическая терапия (сепсис, пневмония)',
      ],
      caveats: [
        'RALE валидирован для фронтальных CXR у взрослых с ОРДС',
        'Межэкспертная согласованность умеренная (κ ~ 0.5-0.7)',
        'КТ-оценка точнее, но менее доступна у постели',
        'Не заменяет Берлинские критерии диагноза ОРДС',
        'Каждый квадрант оценивается независимо (0-4)',
      ],
      scale: {
        segments: [
          { min: 0, max: 4, label: 'минимальная', color: '#10B981' },
          { min: 5, max: 8, label: 'умеренная', color: '#F59E0B' },
          { min: 9, max: 12, label: 'тяжёлая', color: '#EF4444' },
          { min: 13, max: 16, label: 'критическая', color: '#DC2626' },
        ],
        current: score,
        unit: 'балл.',
      },
      related: [
        { id: 'aa-gradient', title: 'A-a градиент' },
        { id: 'gold', title: 'GOLD' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Пульмонология' },
        { id: '300.4', title: 'Неотложная' },
      ],
    };
  },
  reference: 'Warren MA et al. RALE score. Thorax 2018;73(9):840-846.',
  countries: 'Международный (ATS/ESICM)',
  presets: [
    { label: 'Минимальная (3)', values: { ul: 1, ur: 1, ll: 0, lr: 1 } },
    { label: 'Умеренная (7)', values: { ul: 2, ur: 2, ll: 1, lr: 2 } },
    { label: 'Тяжёлая (12)', values: { ul: 3, ur: 3, ll: 3, lr: 3 } },
    { label: 'Критическая (16)', values: { ul: 4, ur: 4, ll: 4, lr: 4 } },
  ],
  info: `### Для чего используется
**RALE score (Radiographic Assessment of Lung Edema)** — полуколичественная оценка тяжести альвеолярной консолидации / отёка на фронтальной рентгенограмме грудной клетки при **ОРДС**.

### Методика
Рентгенограмма делится на **4 квадранта** (верхние и нижние, лево и право). Каждый квадрант оценивается 0-4:
| Балл | Процент поражения |
|---|---|
| 0 | Нет консолидации |
| 1 | < 25 % |
| 2 | 25-50 % |
| 3 | 50-75 % |
| 4 | > 75 % |

**Сумма 0-16.**

### Клиническое значение
- **RALE ≥ 9** — независимый предиктор 90-дневной смертности при ОРДС (Warren 2018)
- Коррелирует с PaO₂/FiO₂, внесосудистой водой лёгких (EVLW)
- Улучшается при ответе на прон-позиционирование / ЭКМО

### Применение при ОРДС
| RALE | Тактика |
|---|---|
| < 5 | Протективная вентиляция, мониторинг |
| 5-8 | Оптимизация ПДКВ, консервативная волемия |
| 9-12 | Прон ≥ 16 ч, рассмотреть миорелаксанты |
| ≥ 13 | ЭКМО-консультация |

### Берлинские критерии ОРДС (для диагноза)
- Острое начало < 7 дней
- Двусторонние инфильтраты на CXR/КТ
- Не объясняется СН / гиперволемией
- PaO₂/FiO₂ ≤ 300 при PEEP ≥ 5

### Ограничения
- Зависит от качества снимка (проекция, экспозиция)
- Межэкспертная вариабельность
- КТ точнее, но хуже доступна
- Не учитывает динамику (trend важнее single score)`,
};

export default runner;
