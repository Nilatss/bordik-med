/** Runner: asrs — Adult ADHD Self-Report Scale (ASRS v1.1 Part A) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO)',
  reference:
    'Kessler RC, Adler L, Ames M, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale. Psychol Med. 2005;35(2):245-256.',
  inputs: [
    {
      id: 'darkened',
      label: 'Количество "затемнённых" (пороговых) ответов в Part A (0-6)',
      type: 'number',
      min: 0,
      max: 6,
      step: 1,
      quickValues: [0, 2, 4, 6],
      hint: 'Вопросы 1-3 — "часто" или "очень часто". Вопросы 4-6 — "иногда", "часто" или "очень часто".',
    },
    {
      id: 'impairment',
      label: 'Функциональное нарушение в ≥2 сферах (работа/учёба/семья)',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'childhood',
      label: 'Симптомы были в детстве (до 12 лет)',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Отрицательный (2)', values: { darkened: 2, impairment: false, childhood: false } },
    { label: 'Положительный (4)', values: { darkened: 4, impairment: true, childhood: true } },
    { label: 'Высокая вероятность (6)', values: { darkened: 6, impairment: true, childhood: true } },
  ],
  compute: (v) => {
    const darkened = Math.max(0, Math.min(6, Number(v.darkened) || 0));
    const impairment = v.impairment === true;
    const childhood = v.childhood === true;

    let color = '#22C55E';
    let label = 'Отрицательный (<4)';
    let details = 'Симптомы маловероятны для ADHD.';
    const actions: string[] = [];

    if (darkened >= 4) {
      color = '#EF4444';
      label = 'Положительный (≥4)';
      details = 'Симптомы высоко согласуются с ADHD у взрослых. Требуется диагностическое интервью.';
      actions.push(
        'Полный DSM-5 диагностический интервью (DIVA-5, CAADID)',
        'Оценка части B (12 пунктов) + функциональное нарушение',
        'Дифф.диагноз: депрессия, тревога, биполярное, СУВ, сон',
        'Психостимуляторы (метилфенидат, амфетамины) — 1-я линия у взрослых',
        'Нестимуляторы (атомоксетин, гуанфацин) — при противопоказаниях',
        'Когнитивно-поведенческая терапия для взрослых с ADHD',
      );
    } else {
      actions.push(
        'ADHD маловероятен, но возможен — оценить тревогу/депрессию',
        'Повторный скрининг при ухудшении функции',
      );
    }

    if (!childhood && darkened >= 4) {
      actions.push('⚠️ Отсутствие симптомов до 12 лет ставит диагноз ADHD под сомнение (DSM-5 Criterion B)');
    }
    if (!impairment && darkened >= 4) {
      actions.push('Нет функционального нарушения — формально не соответствует DSM-5');
    }

    return {
      value: String(darkened),
      unit: 'затемнён.',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'ASRS — скрининг, не диагноз. Чувствительность 68.7%, специфичность 99.5% при cut-off ≥4',
        'Part A (6 пунктов) — скрининг; Part B (12 пунктов) — расширение',
        'Пороговые ответы различаются: вопросы 1-3 — "часто"+, 4-6 — "иногда"+',
        'Требуется документация симптомов до 12 лет (DSM-5 Criterion B)',
        'Коморбидность >70%: тревога, депрессия, СУВ, биполярное',
        'При СУВ — стимуляторы с осторожностью (риск злоупотребления)',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: '0-3 отрицат.', color: '#22C55E' },
          { min: 4, max: 6, label: '4-6 положит.', color: '#EF4444' },
        ],
        current: darkened,
        unit: 'затемнён.',
      },
      related: [
        { id: 'conners', title: 'Conners-3' },
        { id: 'phq9', title: 'PHQ-9 (диф. деп.)' },
      ],
      relatedCourses: [{ id: '306.3', title: 'Психиатрия — СДВГ' }],
    };
  },
  info: `### Для чего используется
**ASRS v1.1 (Adult ADHD Self-Report Scale; Kessler 2005, ВОЗ)** — 18-пунктовый самоопросник для скрининга ADHD у взрослых. Часть A (6 пунктов) — быстрый скрининг.

### Структура
- **Part A** (6 пунктов) — скрининг
- **Part B** (12 пунктов) — детализация симптомов

### Пороговые ответы ("darkened")
| Пункт | "Иногда" | "Часто" | "Очень часто" |
|---|---|---|---|
| 1-3 (инаттенция) | — | ✓ | ✓ |
| 4-6 (гиперактивность) | ✓ | ✓ | ✓ |

### Интерпретация
| Darkened (Part A) | Интерпретация |
|---|---|
| 0-3 | Отрицательный скрининг |
| **≥4** | **Положительный — высокая вероятность ADHD** |

Чувствительность 68.7%, специфичность 99.5%, PPV 76%.

### DSM-5 критерии ADHD (взрослые)
- ≥5 симптомов инаттенции ИЛИ гиперактивности/импульсивности
- Появление до 12 лет (Criterion B)
- В ≥2 сферах жизни
- Функциональное нарушение

### Лечение
- **Стимуляторы** 1-я линия: метилфенидат, амфетамины (70-80% response)
- **Нестимуляторы**: атомоксетин, гуанфацин XR, клонидин XR
- **Психотерапия**: CBT, coaching, organizational skills

### Ограничения
- Самоопросник — возможна симуляция (студенты за стимуляторами)
- Не дифференцирует ADHD от тревоги/депрессии без интервью
- Требует анамнестических данных до 12 лет`,
};

export default runner;
