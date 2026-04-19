// @ts-nocheck
/**
 * Runner: nihss
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
    maxScore: 42,
    inputs: [
      {
        id: "consciousness",
        label: "1a. Уровень сознания",
        type: "select",
        options: [
          {
            value: "0",
            label: "Настороже",
            points: 0
          },
          {
            value: "1",
            label: "Сонлив, но реагирует",
            points: 1
          },
          {
            value: "2",
            label: "Требует повторной стимуляции",
            points: 2
          },
          {
            value: "3",
            label: "Без сознания",
            points: 3
          }
        ]
      },
      {
        id: "questions",
        label: "1b. Ответы на вопросы (возраст, месяц)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Оба правильно",
            points: 0
          },
          {
            value: "1",
            label: "Один правильно",
            points: 1
          },
          {
            value: "2",
            label: "Ни одного",
            points: 2
          }
        ]
      },
      {
        id: "commands",
        label: "1c. Выполнение команд",
        type: "select",
        options: [
          {
            value: "0",
            label: "Обе выполнены",
            points: 0
          },
          {
            value: "1",
            label: "Одна",
            points: 1
          },
          {
            value: "2",
            label: "Ни одной",
            points: 2
          }
        ]
      },
      {
        id: "gaze",
        label: "2. Взор",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Частичный парез",
            points: 1
          },
          {
            value: "2",
            label: "Форсированная девиация",
            points: 2
          }
        ]
      },
      {
        id: "visual",
        label: "3. Поля зрения",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Частичная гемианопсия",
            points: 1
          },
          {
            value: "2",
            label: "Полная гемианопсия",
            points: 2
          },
          {
            value: "3",
            label: "Билатеральная слепота",
            points: 3
          }
        ]
      },
      {
        id: "facial",
        label: "4. Парез лицевой мускулатуры",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Минимальный",
            points: 1
          },
          {
            value: "2",
            label: "Частичный",
            points: 2
          },
          {
            value: "3",
            label: "Полный",
            points: 3
          }
        ]
      },
      {
        id: "motor_la",
        label: "5a. Моторика — левая рука",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма (удерживает 10с)",
            points: 0
          },
          {
            value: "1",
            label: "Дрейф",
            points: 1
          },
          {
            value: "2",
            label: "Не преодолевает гравитацию",
            points: 2
          },
          {
            value: "3",
            label: "Не преодолевает сопротивление",
            points: 3
          },
          {
            value: "4",
            label: "Плегия",
            points: 4
          }
        ]
      },
      {
        id: "motor_ra",
        label: "5b. Моторика — правая рука",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Дрейф",
            points: 1
          },
          {
            value: "2",
            label: "Не преодолевает гравитацию",
            points: 2
          },
          {
            value: "3",
            label: "Не преодолевает сопротивление",
            points: 3
          },
          {
            value: "4",
            label: "Плегия",
            points: 4
          }
        ]
      },
      {
        id: "motor_ll",
        label: "6a. Моторика — левая нога",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Дрейф",
            points: 1
          },
          {
            value: "2",
            label: "Не преодолевает гравитацию",
            points: 2
          },
          {
            value: "3",
            label: "Не преодолевает сопротивление",
            points: 3
          },
          {
            value: "4",
            label: "Плегия",
            points: 4
          }
        ]
      },
      {
        id: "motor_rl",
        label: "6b. Моторика — правая нога",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Дрейф",
            points: 1
          },
          {
            value: "2",
            label: "Не преодолевает гравитацию",
            points: 2
          },
          {
            value: "3",
            label: "Не преодолевает сопротивление",
            points: 3
          },
          {
            value: "4",
            label: "Плегия",
            points: 4
          }
        ]
      },
      {
        id: "ataxia",
        label: "7. Атаксия",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "В одной конечности",
            points: 1
          },
          {
            value: "2",
            label: "В двух и более",
            points: 2
          }
        ]
      },
      {
        id: "sensation",
        label: "8. Чувствительность",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкая потеря",
            points: 1
          },
          {
            value: "2",
            label: "Выраженная потеря",
            points: 2
          }
        ]
      },
      {
        id: "language",
        label: "9. Речь / афазия",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкая афазия",
            points: 1
          },
          {
            value: "2",
            label: "Тяжёлая афазия",
            points: 2
          },
          {
            value: "3",
            label: "Мутизм / глобальная афазия",
            points: 3
          }
        ]
      },
      {
        id: "dysarthria",
        label: "10. Дизартрия",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкая",
            points: 1
          },
          {
            value: "2",
            label: "Тяжёлая",
            points: 2
          }
        ]
      },
      {
        id: "neglect",
        label: "11. Игнорирование (инаттеншен)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "В одной модальности",
            points: 1
          },
          {
            value: "2",
            label: "В нескольких",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "0–4 (минимальный)",
        color: "#22C55E",
        description: "Минимальный дефицит."
      },
      {
        min: 5,
        max: 15,
        label: "5–15 (умеренный)",
        color: "#F59E0B",
        description: "Умеренный инсульт."
      },
      {
        min: 16,
        max: 20,
        label: "16–20 (средне-тяж.)",
        color: "#F97316",
        description: "Средне-тяжёлый."
      },
      {
        min: 21,
        max: 42,
        label: "21–42 (тяжёлый)",
        color: "#EF4444",
        description: "Тяжёлый инсульт. Рассмотреть тромбэктомию.",
        details: "Тяжёлый неврологический дефицит, часто при окклюзии крупной артерии (ICA, M1). Показана тромбэкстракция при ASPECTS ≥ 6 (или 3–5 по SELECT2/RESCUE-Japan).",
        actions: [
          "КТ-ангиография для окклюзии крупной артерии",
          "Тромбэкстракция ≤ 6 ч (или ≤ 24 ч при DAWN/DEFUSE mismatch)",
          "При окне ≤ 4,5 ч — в/в тромболизис",
          "Контроль АД, глюкозы, температуры, ВЧД"
        ]
      }
    ],
    caveats: [
      "Не валидизирована для внутримозгового кровоизлияния",
      "Лево- и правополушарные инсульты могут давать разные баллы при схожем объёме",
      "Задние инсульты (мозжечок, ствол) часто недооцениваются",
      "Требует обучения (NIHSS certification)"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "aspects",
        title: "ASPECTS"
      },
      {
        id: "mrs-stroke",
        title: "mRS"
      },
      {
        id: "abcd2",
        title: "ABCD2 (TIA)"
      }
    ],
    reference: "NIH Stroke Scale 1989. Стандарт оценки тяжести ишемического инсульта. >6 обычно показание к реперфузии.",
    info: "### Для чего используется\n**NIHSS (NIH Stroke Scale, 1989)** — стандартная шкала оценки **тяжести неврологического дефицита при ишемическом инсульте**. Используется для отбора пациентов на реперфузионную терапию (тромболизис, тромбэктомия), мониторинга динамики, прогноза.\n\n### Структура (15 пунктов, 0–42 балла)\nШкала оценивает: уровень сознания, ориентацию, выполнение команд, движения глаз, поля зрения, парез лица, двигательные функции рук и ног, атаксия, чувствительность, речь, дизартрия, неглект.\n\n### Интерпретация\n| NIHSS | Тяжесть инсульта |\n|---|---|\n| 0 | Нет симптомов |\n| 1–4 | Малый инсульт |\n| 5–15 | Умеренный |\n| 16–20 | Умеренно-тяжёлый |\n| 21–42 | Тяжёлый |\n\n### Пороги для реперфузии\n| Порог | Тактика |\n|---|---|\n| NIHSS ≥ 6 | Рассмотреть тромбэктомию (при LVO + ASPECTS ≥ 6) |\n| NIHSS 4–5 | Обсудить индивидуально |\n| NIHSS > 25 | Осторожно — высокий риск геморрагической трансформации |\n| NIHSS ≥ 10 + симптомы афазии/неглекта | Высокая вероятность LVO |\n\n### Связанные инструменты\n| Шкала | Применение |\n|---|---|\n| **NIHSS** | Тяжесть |\n| **ASPECTS** | КТ-морфология |\n| **mRS** | Функциональный исход (3 мес) |\n| **Glasgow Coma Scale** | Уровень сознания |\n\n### Временные окна реперфузии\n| Метод | Окно |\n|---|---|\n| **Альтеплаза** (IV tPA) | До 4,5 ч от начала симптомов |\n| **Тенектеплаза** | До 4,5 ч; одобрена EU/CA, в США пока вне инструкций |\n| **Тромбэктомия** | До 6 ч у всех; до 24 ч при mismatch (DAWN, DEFUSE-3) |\n\n### Ограничения\n- Не валидизирована для внутримозговых кровоизлияний (для них — ICH Score)\n- Недооценивает задние инсульты (базилярный, мозжечок) — важны дополнительные параметры\n- Межрейтерская вариабельность без сертификации (рекомендуется стандартное обучение)\n- Не оценивает динамические когнитивные нарушения полностью"
  };

export default runner;
