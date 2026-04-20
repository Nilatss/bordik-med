// @ts-nocheck
/** Runner: gina */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'symptoms', label: 'Дневные симптомы > 2 раз/нед', type: 'checkbox', points: 1 },
    { id: 'night', label: 'Ночные пробуждения из-за астмы', type: 'checkbox', points: 1 },
    { id: 'saba', label: 'Использование SABA > 2 раз/нед', type: 'checkbox', points: 1 },
    { id: 'limit', label: 'Ограничение активности из-за астмы', type: 'checkbox', points: 1 },
    { id: 'currentStep', label: 'Текущий шаг терапии GINA', type: 'select', options: [
      { value: '1', label: 'Шаг 1 (только по требованию)' },
      { value: '2', label: 'Шаг 2 (низкие дозы ИГКС-формотерол)' },
      { value: '3', label: 'Шаг 3 (низкие ИГКС-LABA)' },
      { value: '4', label: 'Шаг 4 (средние ИГКС-LABA)' },
      { value: '5', label: 'Шаг 5 (высокие + биологические)' },
    ] },
  ],
  compute: (v) => {
    const score = (v.symptoms ? 1 : 0) + (v.night ? 1 : 0) + (v.saba ? 1 : 0) + (v.limit ? 1 : 0);
    const step = Number(v.currentStep) || 1;

    let label = '';
    let color = '';
    let interp = '';
    let actions: string[] = [];

    if (score === 0) {
      label = 'Хорошо контролируется';
      color = '#10B981';
      interp = 'Астма хорошо контролируется. Продолжить текущую терапию; оценить возможность step-down через 3 мес стабильности.';
      actions = [
        'Сохранить текущий шаг ' + step,
        'Рассмотреть step-down при ≥ 3 мес полного контроля',
        'Проверить ингаляционную технику и приверженность',
        'Пересмотр через 3 мес',
      ];
    } else if (score <= 2) {
      label = 'Частично контролируется';
      color = '#F59E0B';
      interp = 'Частичный контроль. Оцените технику ингаляции, приверженность, триггеры; рассмотрите step-up.';
      actions = [
        'Проверка техники ингаляции и приверженности',
        'Идентификация триггеров (аллергены, курение, ГЭРБ, β-блокаторы)',
        'Рассмотреть step-up: шаг ' + Math.min(5, step + 1),
        'Пересмотр через 2-6 нед',
      ];
    } else {
      label = 'Не контролируется';
      color = '#EF4444';
      interp = 'Астма не контролируется. Step-up терапии, оценка тяжёлой астмы, направление к специалисту.';
      actions = [
        'Немедленный step-up до шага ' + Math.min(5, step + 1),
        'Короткий курс пероральных ГКС при обострении (40-50 мг преднизолона × 5-7 дней)',
        'При шаге 4-5 — направление к пульмонологу, оценка T2-воспаления (эозинофилы, FeNO, IgE)',
        'Рассмотреть биологическую терапию (омализумаб, меполизумаб, дупилумаб, тезепелумаб)',
      ];
    }

    return {
      value: label,
      interpretation: interp,
      color,
      details: `Признаков плохого контроля: ${score}/4. Текущий шаг GINA: ${step}.`,
      actions,
      caveats: [
        'Оценка — за последние 4 недели',
        'GINA 2023+: SABA-only больше не рекомендуется как монотерапия (замена — ИГКС-формотерол AIR/MART)',
        'Контроль симптомов ≠ риск обострений: отдельно оценивайте факторы риска',
        'У детей 6-11 лет — отдельные критерии',
      ],
      scale: {
        segments: [
          { min: 0, max: 0, label: 'хороший', color: '#10B981' },
          { min: 1, max: 2, label: 'частичный', color: '#F59E0B' },
          { min: 3, max: 4, label: 'плохой', color: '#EF4444' },
        ],
        current: score,
        unit: 'признак.',
      },
      related: [
        { id: 'act', title: 'ACT' },
        { id: 'mmrc', title: 'mMRC' },
        { id: 'gli', title: 'GLI-2012' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Пульмонология' },
      ],
    };
  },
  reference: 'Global Initiative for Asthma. GINA Main Report 2024.',
  countries: 'Международный (GINA)',
  presets: [
    { label: 'Хороший контроль', values: { symptoms: false, night: false, saba: false, limit: false, currentStep: '2' } },
    { label: 'Частичный контроль', values: { symptoms: true, night: false, saba: true, limit: false, currentStep: '3' } },
    { label: 'Неконтролируемая', values: { symptoms: true, night: true, saba: true, limit: true, currentStep: '4' } },
  ],
  info: `### Для чего используется
**GINA (Global Initiative for Asthma) 2024** — классификация контроля бронхиальной астмы и выбор шага терапии.

### Оценка контроля (последние 4 недели)
| Признак | |
|---|---|
| Дневные симптомы > 2 раз/нед | + |
| Ночные пробуждения | + |
| SABA > 2 раз/нед | + |
| Ограничение активности | + |

| Признаков | Контроль |
|---|---|
| 0 | Хорошо контролируется |
| 1-2 | Частично контролируется |
| 3-4 | Не контролируется |

### Шаги терапии GINA 2024 (взрослые)
| Шаг | Поддерживающая |
|---|---|
| 1 | Низкие ИГКС-формотерол по требованию |
| 2 | Низкие ИГКС-формотерол по требованию или ежедневно ИГКС |
| 3 | Низкие ИГКС-LABA ежедневно + ИГКС-формотерол по требованию |
| 4 | Средние ИГКС-LABA |
| 5 | Высокие ИГКС-LABA + LAMA/биологическая терапия |

### Track 1 (MART/AIR — предпочтительный)
ИГКС-формотерол и в качестве поддерживающей, и для купирования — снижает обострения на 30-60 %.

### Биологическая терапия (шаг 5)
- **Омализумаб** — IgE-зависимая аллергическая астма
- **Меполизумаб / реслизумаб / бенрализумаб** — эозинофильная (≥ 300/мкл)
- **Дупилумаб** — T2-high (эозинофилы + FeNO)
- **Тезепелумаб** — анти-TSLP, работает независимо от T2

### Ограничения
- Оценка за 4 недели — может пропустить недавнее ухудшение
- Риск обострений оценивается отдельно (обострения в анамнезе, ОФВ₁ < 60 %, курение, T2-high)

### Источник
GINA Main Report 2024, ginasthma.org`,
};

export default runner;
