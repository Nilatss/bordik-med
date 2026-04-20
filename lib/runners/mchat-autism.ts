// @ts-nocheck
/** Runner: mchat-autism — Modified Checklist for Autism in Toddlers, Revised with Follow-up (M-CHAT-R/F) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP)',
  reference:
    'Robins DL, Casagrande K, Barton M, Chen CM, Dumont-Mathieu T, Fein D. Validation of the Modified Checklist for Autism in Toddlers, Revised With Follow-up (M-CHAT-R/F). Pediatrics. 2014;133(1):37-45.',
  inputs: [
    {
      id: 'total',
      label: 'Количество положительных ответов (red flag) M-CHAT-R (0-20)',
      type: 'number',
      min: 0,
      max: 20,
      step: 1,
      quickValues: [0, 2, 5, 8, 15],
      hint: 'Каждый пункт: ответ "red flag" (обычно "нет", пункты 2, 5, 12 — "да") = 1 балл.',
    },
    {
      id: 'age',
      label: 'Возраст ребёнка (месяцы)',
      type: 'number',
      min: 16,
      max: 30,
      step: 1,
      quickValues: [16, 18, 24, 30],
    },
    {
      id: 'followup',
      label: 'Follow-up интервью подтвердил ≥2 "фейлов"',
      type: 'checkbox',
      points: 0,
      hint: 'При medium risk (3-7) провести структурированное интервью; подтверждённые пункты ≥2 → положительный скрининг.',
    },
  ],
  presets: [
    { label: 'Низкий риск (1)', values: { total: 1, age: 20, followup: false } },
    { label: 'Средний риск (5)', values: { total: 5, age: 24, followup: true } },
    { label: 'Высокий риск (10)', values: { total: 10, age: 18, followup: false } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(20, Number(v.total) || 0));
    const age = Number(v.age) || 0;
    const followup = v.followup === true;

    let color = '#22C55E';
    let label = 'Низкий риск (0-2)';
    let details = 'Низкий риск РАС. Продолжить рутинный скрининг развития.';
    const actions: string[] = [];

    if (total >= 8) {
      color = '#991B1B';
      label = 'Высокий риск (≥8)';
      details = 'Высокий риск расстройства аутистического спектра.';
      actions.push(
        'Немедленное направление на диагностическую оценку (ADOS-2, ADI-R)',
        'Параллельно — Early Intervention (Part C в США, аналоги в РФ)',
        'Аудиологическая оценка (исключить тугоухость)',
        'Генетическое тестирование (CMA, Fragile X)',
        'НЕ проводить follow-up — сразу на специалиста',
      );
    } else if (total >= 3) {
      color = '#F59E0B';
      label = 'Средний риск (3-7)';
      details = 'Средний риск — требуется follow-up интервью.';
      actions.push(
        'Follow-up интервью M-CHAT-R/F (структурированное)',
        'Если follow-up ≥2 → направление на ADOS-2',
        'Если follow-up <2 → повтор M-CHAT-R через 3-6 мес',
        'Параллельно — раннее вмешательство (Early Intervention)',
      );
      if (followup) {
        color = '#991B1B';
        actions.unshift('Follow-up подтвердил ≥2 → положительный скрининг → направление на ADOS-2');
      }
    } else {
      actions.push(
        'Повторить скрининг в 24 мес (AAP рекомендует 18 и 24 мес)',
        'Мониторинг развития (Denver-II, ASQ-3)',
      );
    }

    if (age < 16 || age > 30) {
      actions.unshift('⚠️ M-CHAT-R валидна для возраста 16-30 мес');
    }

    return {
      value: String(total),
      unit: 'red flag',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'M-CHAT-R/F валидирована для 16-30 мес',
        'При high risk (≥8) follow-up пропускается — сразу на ADOS-2',
        'При medium risk (3-7) — follow-up снижает false positive на ~50%',
        'Чувствительность 85%, специфичность 99% (после follow-up)',
        'PPV ~54% для РАС; ~95% для любой задержки развития',
        'AAP рекомендует скрининг в 18 и 24 мес',
        'Критические пункты (critical items): 2, 7, 9, 13, 14, 15 — вес у них больший',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: '0-2 низкий', color: '#22C55E' },
          { min: 3, max: 7, label: '3-7 средний', color: '#F59E0B' },
          { min: 8, max: 20, label: '≥8 высокий', color: '#991B1B' },
        ],
        current: total,
        unit: 'red flag',
      },
      related: [
        { id: 'conners', title: 'Conners-3' },
        { id: 'asrs', title: 'ASRS (взрослые)' },
      ],
      relatedCourses: [
        { id: '306.5', title: 'Психиатрия — РАС' },
        { id: '310.4', title: 'Неврология развития' },
      ],
    };
  },
  info: `### Для чего используется
**M-CHAT-R/F (Modified Checklist for Autism in Toddlers, Revised with Follow-up; Robins 2014)** — 20-пунктовый родительский опросник для скрининга РАС у детей 16-30 мес. Рекомендован **AAP** для рутинного скрининга в 18 и 24 мес.

### Алгоритм 2-этапный
1. **M-CHAT-R** (20 вопросов)
2. При medium risk → **follow-up интервью** (структурированное)

### Интерпретация
| M-CHAT-R | Риск | Действие |
|---|---|---|
| 0-2 | Низкий | Повтор в 24 мес |
| **3-7** | **Средний** | Follow-up интервью |
| **≥8** | **Высокий** | Сразу на ADOS-2 (пропустить follow-up) |

### Критические пункты (больший вес)
- #2: реагирует ли, когда зовут по имени?
- #7: показывает ли пальцем на интерес?
- #9: приносит ли предметы показать?
- #13: ходит ли?
- #14: смотрит ли в глаза во время общения?
- #15: подражает ли?

### Диагностика (после положительного M-CHAT-R/F)
- **ADOS-2** (Autism Diagnostic Observation Schedule) — золотой стандарт
- **ADI-R** (Autism Diagnostic Interview-Revised) — родительское интервью
- DSM-5 критерии РАС

### Психометрика
- Чувствительность 85% / специфичность 99%
- PPV 54% для РАС (95% для любой задержки развития)
- Без follow-up — PPV только 6-27%

### Раннее вмешательство
- **Early Start Denver Model (ESDM)** — 1-я линия
- **ABA** (Applied Behavior Analysis)
- **PECS** для невербальных

### Ограничения
- Возраст 16-30 мес (вне → невалидна)
- Зависит от точности родительского отчёта
- Культурные различия в реагировании на пункты

### Источник
Robins DL et al. *Pediatrics.* 2014;133:37-45. mchatscreen.com`,
};

export default runner;
