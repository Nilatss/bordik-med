/**
 * Runner: nyha
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
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
    maxScore: 4,
    inputs: [
      {
        id: "cl",
        label: "Функциональный класс",
        type: "select",
        options: [
          {
            value: "1",
            label: "I - Обычная нагрузка без симптомов",
            points: 1
          },
          {
            value: "2",
            label: "II - Обычная нагрузка вызывает симптомы",
            points: 2
          },
          {
            value: "3",
            label: "III - Небольшая нагрузка вызывает симптомы",
            points: 3
          },
          {
            value: "4",
            label: "IV - Симптомы в покое",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "I",
        color: "#22C55E",
        description: "Компенсированная СН."
      },
      {
        min: 2,
        max: 2,
        label: "II",
        color: "#84CC16",
        description: "Лёгкое ограничение активности."
      },
      {
        min: 3,
        max: 3,
        label: "III",
        color: "#F59E0B",
        description: "Выраженное ограничение."
      },
      {
        min: 4,
        max: 4,
        label: "IV",
        color: "#EF4444",
        description: "Тяжёлое. Покой не приносит облегчения."
      }
    ],
    caveats: [
      "Субъективная клиническая классификация - пациент может колебаться между классами",
      "Не отражает ФВ - пациент с ФВ 25 % может быть NYHA II на фоне лечения",
      "Использовать вместе с ACC/AHA стадиями A-D (более структурно)",
      "Для объективной оценки - тест 6-мин ходьбы, CPET"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "killip",
        title: "Killip (ОСН при ОИМ)"
      },
      {
        id: "forrester",
        title: "Forrester/Nohria"
      },
      {
        id: "nt-probnp",
        title: "NT-proBNP"
      }
    ],
    reference: "New York Heart Association. Функциональная классификация ХСН.",
    info: "### Для чего используется\n**NYHA (New York Heart Association)** - функциональная классификация **хронической сердечной недостаточности** по симптомам и переносимости нагрузки. Применяется для стратификации, показаний к терапии, оценки динамики.\n\n### Классы\n| Класс | Ограничение активности | Пример |\n|---|---|---|\n| **I** | Нет | Обычная нагрузка без симптомов |\n| **II** | Лёгкое | Обычная физ. нагрузка вызывает симптомы |\n| **III** | Выраженное | Небольшая нагрузка вызывает симптомы |\n| **IV** | Тяжёлое | Симптомы в покое |\n\n### Симптомы\nОдышка, слабость, сердцебиение, пресинкопе при нагрузке / в покое.\n\n### Связь с терапией (ESC 2021)\n| NYHA | Цель терапии |\n|---|---|\n| I-II | Первая линия: ARNI (сакубитрил-валсартан) / ИАПФ, β-блок, MRA, SGLT2 |\n| III | Добавить ивабрадин если ЧСС > 70; рассмотреть CRT-D при QRS ≥ 130 и ФВ ≤ 35 |\n| IV | Инотропы временно; трансплантация или LVAD при refractory |\n\n### ACC/AHA stages (дополнение к NYHA)\n| Стадия | Описание |\n|---|---|\n| A | Риск СН, нет структурной болезни |\n| B | Структурная болезнь, нет симптомов (безсимптомная дисфункция) |\n| C | Структурная болезнь + симптомы (актуальная СН) |\n| D | Рефрактерная, терминальная |\n\nNYHA и ACC/AHA - комплементарны: ACC/AHA статичны (прогрессируют в одну сторону), NYHA могут меняться в обе стороны.\n\n### Ограничения\n- Субъективная\n- Низкая межрейтерская надёжность\n- Не учитывает этиологию, ФВ, объективные параметры (BNP, 6MWT)"
  };

export default runner;
