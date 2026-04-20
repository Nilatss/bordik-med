// @ts-nocheck
/**
 * Runner: moca
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
    maxScore: 30,
    inputs: [
      {
        id: "visuospatial",
        label: "Визуоспациальные / исполнительные (0-5: trail B, куб, часы)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          }
        ]
      },
      {
        id: "naming",
        label: "Называние 3 животных (лев, носорог, верблюд)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          }
        ]
      },
      {
        id: "attention",
        label: "Внимание (цифры вперёд+назад, вниманиe к букве, 100−7 × 5)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          },
          {
            value: "6",
            label: "6",
            points: 6
          }
        ]
      },
      {
        id: "language",
        label: "Речь (2 предложения + беглость, 0-3)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          }
        ]
      },
      {
        id: "abstraction",
        label: "Абстракция (2 аналогии - поезд-велосипед, часы-линейка)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          }
        ]
      },
      {
        id: "recall",
        label: "Отсроченное воспроизведение 5 слов",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          }
        ]
      },
      {
        id: "orientation",
        label: "Ориентация (дата, месяц, год, день недели, место, город)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          },
          {
            value: "6",
            label: "6",
            points: 6
          }
        ]
      },
      {
        id: "education_bonus",
        label: "+1 балл при образовании ≤ 12 лет",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 9,
        label: "< 10 - тяжёлая деменция",
        color: "#991B1B",
        description: "Тяжёлые когнитивные нарушения.",
        details: "Значительно нарушенная деятельность. Необходима комплексная поддержка, уход.",
        actions: [
          "Мультидисциплинарная оценка (нейропсихолог, терапевт)",
          "Оценка опекунского бремени (Zarit)",
          "Безопасность (риск падений, вождение, финансы)",
          "Планирование ухода, paliative при терминальной стадии"
        ]
      },
      {
        min: 10,
        max: 17,
        label: "10-17 - умеренная деменция",
        color: "#EF4444",
        description: "Умеренные нарушения.",
        actions: [
          "Ингибиторы ацетилхолинэстеразы (донепезил, ривастигмин, галантамин)",
          "Мемантин при умеренной-тяжёлой Alzheimer",
          "Когнитивная стимуляционная терапия"
        ]
      },
      {
        min: 18,
        max: 25,
        label: "18-25 - MCI",
        color: "#F59E0B",
        description: "Лёгкое когнитивное снижение (MCI).",
        details: "MoCA чувствительнее MMSE для MCI (чувствительность 90 % vs 18 %). Высокий риск конверсии в деменцию (~10-15 %/год).",
        actions: [
          "Поиск обратимых причин: B12, ТТГ, витамин D, депрессия",
          "Нейровизуализация (МРТ) при подозрении на структурную причину",
          "Мониторинг: повтор MoCA каждые 6-12 мес",
          "Физическая активность, средиземноморская диета, контроль ССЗ-факторов"
        ]
      },
      {
        min: 26,
        max: 30,
        label: "≥ 26 - норма",
        color: "#22C55E",
        description: "Без когнитивных нарушений."
      }
    ],
    caveats: [
      "Порог 26 валидирован Nasreddine 2005, но последующие исследования показали оптимальный 23 для популяций с ниже образованием",
      "+1 балл добавляется при образовании ≤ 12 лет (до суммы, но не свыше 30)",
      "MoCA чувствительнее MMSE для MCI, но менее специфична",
      "Необходима аккредитация пользователей (MoCA Cognition training с 2020)"
    ],
    related: [
      {
        id: "mmse",
        title: "MMSE"
      },
      {
        id: "cdr",
        title: "CDR"
      },
      {
        id: "mini-cog",
        title: "Mini-Cog"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Nasreddine ZS, Phillips NA, Bédirian V et al. The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment. J Am Geriatr Soc 2005;53:695-699.",
    info: "### Для чего используется\n**MoCA (Montreal Cognitive Assessment, Nasreddine 2005)** - короткий (~10 мин) скрининг **когнитивных нарушений и лёгкого когнитивного снижения (MCI)**. Более чувствителен к MCI, чем MMSE.\n\n### Структура (30 баллов)\n| Домен | Баллы |\n|---|---|\n| Визуоспациальные / исполнительные | 5 |\n| Называние (3 животных) | 3 |\n| Внимание (цифры, вигилия, 100−7) | 6 |\n| Речь (повторение + беглость на букву) | 3 |\n| Абстракция (2 аналогии) | 2 |\n| Отсроченное воспроизведение (5 слов) | 5 |\n| Ориентация | 6 |\n| **Бонус: +1 при образовании ≤ 12 лет** | 1 |\n\n### Интерпретация\n| MoCA | Категория |\n|---|---|\n| ≥ 26 | Норма |\n| 18-25 | MCI (лёгкое когнитивное снижение) |\n| 10-17 | Умеренная деменция |\n| < 10 | Тяжёлая деменция |\n\n### Преимущества перед MMSE\n| Параметр | MoCA | MMSE |\n|---|---|---|\n| Чувствительность к MCI | 90 % | 18 % |\n| Специфичность MCI | 87 % | 100 % |\n| Executive/frontal | Да (trail B, беглость) | Нет |\n| Отсроченное воспроизведение | 5 слов | 3 слова |\n\n### Применение\n- Скрининг деменции/MCI в первичке и геронтологии\n- Оценка BA, PD, MS, сосудистых когнитивных нарушений, пост-COVID\n- Мониторинг лечения ингибиторами ChE\n- Валидизирована для 55+ языков и адаптаций\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **MMSE** | Классический, менее чувствителен к MCI |\n| **Mini-Cog** | Ультра-короткий (3 мин) |\n| **ACE-III** | Для дифф. типов деменции |\n| **MoCA-BLIND** | Для пациентов с нарушением зрения |\n| **MoCA Mini** | 5-минутная версия |\n\n### Ограничения\n- Зависит от образования (+1 при ≤12 лет не всегда компенсирует)\n- Культурные и языковые адаптации требуют валидации\n- Аккредитация пользователей обязательна (с 2020)\n- Эффект обучения - использовать альтернативные версии при повторе\n\n### Тактика\n- ≥ 26: наблюдение, модификация факторов риска\n- 18-25 (MCI): поиск обратимых причин (B12, ТТГ, вит D, депрессия), МРТ, повтор через 6 мес\n- 10-17: ингибиторы AChE (донепезил, ривастигмин, галантамин), мемантин при умеренной-тяжёлой\n- < 10: мультидисциплинарная оценка, безопасность, опекунская поддержка\n\n### Источник\nNasreddine ZS et al. **The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment.** *J Am Geriatr Soc* 2005;53:695-699."
  };

export default runner;
