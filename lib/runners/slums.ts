// @ts-nocheck
/**
 * Runner: slums
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
        id: "education",
        label: "Образование",
        type: "select",
        options: [
          {
            value: "hs",
            label: "Среднее и выше (≥12 лет)",
            points: 0
          },
          {
            value: "less",
            label: "Меньше среднего (<12 лет)",
            points: 0
          }
        ]
      },
      {
        id: "day",
        label: "Какой сегодня день недели?",
        type: "checkbox",
        points: 1
      },
      {
        id: "year",
        label: "Какой сейчас год?",
        type: "checkbox",
        points: 1
      },
      {
        id: "state",
        label: "В каком штате/регионе мы находимся?",
        type: "checkbox",
        points: 1
      },
      {
        id: "memory5",
        label: "Запоминание 5 объектов (отложенное воспроизведение)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 из 5",
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
            label: "5 из 5",
            points: 5
          }
        ]
      },
      {
        id: "math",
        label: "Арифметика ($100 − $3 и т.д. / покупки)",
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
        id: "animals",
        label: "Беглость: назвать животных за 1 мин",
        type: "select",
        options: [
          {
            value: "0",
            label: "0-4",
            points: 0
          },
          {
            value: "1",
            label: "5-9",
            points: 1
          },
          {
            value: "2",
            label: "10-14",
            points: 2
          },
          {
            value: "3",
            label: "≥15",
            points: 3
          }
        ]
      },
      {
        id: "digits",
        label: "Цифры в обратном порядке (87, 649, 8537)",
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
        id: "clock",
        label: "Рисование часов (круг, числа, стрелки на 10 минут 11-го)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "2",
            label: "Часы верные - числа",
            points: 2
          },
          {
            value: "4",
            label: "Все компоненты верны",
            points: 4
          }
        ]
      },
      {
        id: "shapes",
        label: "Распознавание фигур (треугольник среди фигур)",
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
        id: "story",
        label: "Рассказ (имя героини, работа, штат, куда вернулась): 0-8",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "6",
            label: "6",
            points: 6
          },
          {
            value: "8",
            label: "8",
            points: 8
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 19,
        label: "0-19 - деменция (при <HS: ≤19)",
        color: "#EF4444",
        description: "Высокая вероятность деменции.",
        details: "При образовании <HS: деменция при ≤19; при HS и выше - деменция при ≤20.",
        actions: [
          "Мультидисциплинарная оценка",
          "Лабораторные + МРТ",
          "Ингибиторы AChE / мемантин",
          "Опекунская поддержка"
        ]
      },
      {
        min: 20,
        max: 26,
        label: "20-26 - MNCD (MCI)",
        color: "#F59E0B",
        description: "Лёгкое нейрокогнитивное расстройство.",
        details: "HS и выше: MNCD 21-26, норма ≥27. <HS: MNCD 20-24, норма ≥25.",
        actions: [
          "Поиск обратимых причин (B12, ТТГ, витD, депрессия)",
          "МРТ головного мозга",
          "Повтор SLUMS через 6 мес",
          "Физ. активность, когнитивная стимуляция"
        ]
      },
      {
        min: 27,
        max: 30,
        label: "27-30 - норма (HS+)",
        color: "#22C55E",
        description: "Норма (при HS-образовании)."
      }
    ],
    caveats: [
      "Cut-off зависит от образования: HS+ норма ≥27, MNCD 21-26, деменция ≤20; <HS норма ≥25, MNCD 20-24, деменция ≤19",
      "SLUMS чувствительнее MMSE к MCI (чувствительность ~95 % при MCI)",
      "Разработан в Saint Louis VA - валидизирован на американской популяции",
      "Свободный от лицензионных ограничений (в отличие от MMSE)"
    ],
    related: [
      {
        id: "mmse",
        title: "MMSE"
      },
      {
        id: "moca",
        title: "MoCA"
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
    reference: "Tariq SH, Tumosa N, Chibnall JT, Perry MH, Morley JE. Comparison of the Saint Louis University Mental Status examination and the Mini-Mental State Examination for detecting dementia and mild neurocognitive disorder. Am J Geriatr Psychiatry 2006;14:900-910.",
    info: "### Для чего используется\n**SLUMS (Saint Louis University Mental Status, Tariq 2006)** - 30-балльный скрининг когнитивных нарушений, чувствительный к **MCI**. Более сложные executive-задачи (беглость, распознавание фигур, анализ рассказа), чем в MMSE.\n\n### Компоненты (30 баллов)\n- Ориентация (день, год, штат) - 3\n- Арифметика - 3\n- Запоминание 5 объектов - 5\n- Беглость (животные за 1 мин) - 3\n- Цифры в обратном порядке - 2\n- Рисование часов - 4\n- Распознавание фигур - 2\n- Анализ рассказа - 8\n\n### Интерпретация (cut-offs зависят от образования)\n| Образование | Норма | MNCD | Деменция |\n|---|---|---|---|\n| ≥ HS (≥12 лет) | ≥ 27 | 21-26 | ≤ 20 |\n| < HS | ≥ 25 | 20-24 | ≤ 19 |\n\n### Характеристики\n- Чувствительность к деменции ~98 %, к MCI ~95 % (Tariq 2006)\n- Бесплатен для клинического и исследовательского использования (SLU)\n- Валидирован на американских ветеранах (VA)\n\n### Преимущества перед MMSE\n| Параметр | SLUMS | MMSE |\n|---|---|---|\n| Чувствительность к MCI | ~95 % | ~18 % |\n| Executive задачи | Да | Минимально |\n| Лицензия | Свободная | Платная (с 2000) |\n\n### Ограничения\n- Валидация ограничена англоязычной американской популяцией\n- Не адаптирован для многих языков/культур\n- Анализ рассказа зависит от слухового восприятия\n\n### Тактика\n- Норма: мониторинг при жалобах\n- MNCD: поиск обратимых причин, МРТ, повтор\n- Деменция: комплексная оценка, базисная терапия\n\n### Источник\nTariq SH et al. **Comparison of SLUMS and MMSE for detecting dementia and MCI.** *Am J Geriatr Psychiatry* 2006;14:900-910."
  };

export default runner;
