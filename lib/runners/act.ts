// @ts-nocheck
/**
 * Runner: act
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
    kind: "score",
    inputs: [
      {
        id: "q1",
        label: "1. Как часто астма мешала на работе/учёбе/дома?",
        type: "select",
        options: [
          {
            value: 1,
            label: "Постоянно",
            points: 1
          },
          {
            value: 2,
            label: "Часто",
            points: 2
          },
          {
            value: 3,
            label: "Иногда",
            points: 3
          },
          {
            value: 4,
            label: "Редко",
            points: 4
          },
          {
            value: 5,
            label: "Никогда",
            points: 5
          }
        ]
      },
      {
        id: "q2",
        label: "2. Как часто была одышка?",
        type: "select",
        options: [
          {
            value: 1,
            label: "> 1 раза в день",
            points: 1
          },
          {
            value: 2,
            label: "Раз в день",
            points: 2
          },
          {
            value: 3,
            label: "3–6 раз/нед",
            points: 3
          },
          {
            value: 4,
            label: "1–2 раза/нед",
            points: 4
          },
          {
            value: 5,
            label: "Не было",
            points: 5
          }
        ]
      },
      {
        id: "q3",
        label: "3. Как часто симптомы будили ночью / рано утром?",
        type: "select",
        options: [
          {
            value: 1,
            label: "≥ 4 ночей/нед",
            points: 1
          },
          {
            value: 2,
            label: "2–3 ночи/нед",
            points: 2
          },
          {
            value: 3,
            label: "1 раз/нед",
            points: 3
          },
          {
            value: 4,
            label: "1–2 раза/мес",
            points: 4
          },
          {
            value: 5,
            label: "Не будили",
            points: 5
          }
        ]
      },
      {
        id: "q4",
        label: "4. Как часто использовали короткодействующий ингалятор?",
        type: "select",
        options: [
          {
            value: 1,
            label: "≥ 3 раз/день",
            points: 1
          },
          {
            value: 2,
            label: "1–2 раза/день",
            points: 2
          },
          {
            value: 3,
            label: "2–3 раза/нед",
            points: 3
          },
          {
            value: 4,
            label: "≤ 1 раза/нед",
            points: 4
          },
          {
            value: 5,
            label: "Не использовал",
            points: 5
          }
        ]
      },
      {
        id: "q5",
        label: "5. Как Вы оцениваете контроль астмы?",
        type: "select",
        options: [
          {
            value: 1,
            label: "Совсем не контролируется",
            points: 1
          },
          {
            value: 2,
            label: "Плохо контролируется",
            points: 2
          },
          {
            value: 3,
            label: "Несколько контролируется",
            points: 3
          },
          {
            value: 4,
            label: "Хорошо контролируется",
            points: 4
          },
          {
            value: 5,
            label: "Полностью контролируется",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 5,
        max: 15,
        label: "5–15 (плохой контроль)",
        color: "#EF4444",
        description: "Астма не контролируется. Усиление терапии."
      },
      {
        min: 16,
        max: 19,
        label: "16–19 (частичный контроль)",
        color: "#F59E0B",
        description: "Частичный контроль. Пересмотр терапии."
      },
      {
        min: 20,
        max: 25,
        label: "20–25 (хороший контроль)",
        color: "#10B981",
        description: "Хороший контроль астмы."
      }
    ],
    maxScore: 25,
    caveats: [
      "Для взрослых и подростков ≥ 12 лет (для 4–11 лет — C-ACT)",
      "Самозаполняемая — зависит от субъективной оценки",
      "ACT ≥ 20 не исключает обострений — дополнять ОФВ₁, эозинофилы, FeNO",
      "При плохом контроле искать триггеры (аллергены, инфекции, ГЭРБ, ЛС)"
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      }
    ],
    related: [
      {
        id: "mmrc",
        title: "mMRC"
      },
      {
        id: "gold",
        title: "GOLD"
      },
      {
        id: "pf-ratio",
        title: "P/F-ratio"
      }
    ],
    reference: "Nathan RA. JACI 2004. Asthma Control Test (ACT) ≥ 12 лет.",
    info: "### Что измеряет\n**Asthma Control Test (ACT)** — самозаполняемый опросник для оценки контроля бронхиальной астмы у пациентов **≥ 12 лет** за последние **4 недели**. Для детей 4–11 лет используется **C-ACT** (7 вопросов).\n\n### Интерпретация\n| Сумма | Контроль |\n|---|---|\n| 25 | Полный контроль |\n| 20–24 | Хороший / достаточный |\n| < 20 | Недостаточный — пересмотр терапии |\n| ≤ 15 | Очень плохой — срочное усиление и оценка приверженности |\n\nМинимально клинически значимое изменение (MCID) — **3 балла**.\n\n### Связь с GINA\nACT комплементарен GINA-критериям:\n\n| Контроль GINA | Критерии |\n|---|---|\n| Хороший | Дневные симптомы ≤ 2/нед, нет ночных, SABA ≤ 2/нед, нет ограничений активности |\n| Частичный | 1–2 признака плохого контроля |\n| Не контролируется | 3–4 признака плохого контроля |\n\n### Шаги терапии (GINA 2024, взрослые)\n| Шаг | Поддерживающая |\n|---|---|\n| 1–2 | Низкие дозы ИГКС-формотерол по требованию (MART concept, AIR) |\n| 3 | Низкие дозы ИГКС-LABA ежедневно + по требованию ИГКС-формотерол |\n| 4 | Средние дозы ИГКС-LABA |\n| 5 | Высокие ИГКС-LABA + биологическая терапия (омализумаб, меполизумаб, дупилумаб, тезепелумаб) |\n\n### Биомаркеры для биологической терапии\n- **Эозинофилы крови** ≥ 300/мкл и/или **FeNO** ≥ 25 ppb → Type-2 high astma\n- IgE-обусловленная аллергия → омализумаб\n\n### Ограничения\n- Не оценивает функцию лёгких — параллельно делайте ОФВ₁ и пиковую скорость\n- Зависит от честности пациента\n- Период оценки 4 нед — может пропустить недавнее ухудшение"
  };

export default runner;
