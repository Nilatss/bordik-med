// @ts-nocheck
/**
 * Runner: epworth
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
    maxScore: 24,
    inputs: [
      {
        id: "q1",
        label: "1. Читая сидя",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда не задремлю",
            points: 0
          },
          {
            value: "1",
            label: "Слабая вероятность",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная вероятность",
            points: 2
          },
          {
            value: "3",
            label: "Высокая вероятность",
            points: 3
          }
        ]
      },
      {
        id: "q2",
        label: "2. Смотря телевизор",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Слабая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Высокая",
            points: 3
          }
        ]
      },
      {
        id: "q3",
        label: "3. Сидя в общественном месте (театр, собрание)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Слабая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Высокая",
            points: 3
          }
        ]
      },
      {
        id: "q4",
        label: "4. Пассажиром в машине (поездка 1 час)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Слабая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Высокая",
            points: 3
          }
        ]
      },
      {
        id: "q5",
        label: "5. Днём лёжа, когда позволяет обстановка",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Слабая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Высокая",
            points: 3
          }
        ]
      },
      {
        id: "q6",
        label: "6. Сидя и разговаривая с кем-либо",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Слабая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Высокая",
            points: 3
          }
        ]
      },
      {
        id: "q7",
        label: "7. Сидя спокойно после обеда без алкоголя",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Слабая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Высокая",
            points: 3
          }
        ]
      },
      {
        id: "q8",
        label: "8. В машине за рулём, стоя в пробке несколько минут",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Слабая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Высокая",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 5,
        label: "0-5 (нижняя норма)",
        color: "#22C55E",
        description: "Нижний диапазон дневной нормы сонливости.",
        details: "Отсутствие патологической дневной сонливости. Если пациент жалуется на усталость при таком балле - искать причины утомляемости (анемия, депрессия, гипотиреоз), а не SDB."
      },
      {
        min: 6,
        max: 10,
        label: "6-10 (верхняя норма)",
        color: "#84CC16",
        description: "Верхний предел нормы. Наблюдение.",
        details: "Нормальный уровень дневной сонливости. Большинство здоровых взрослых попадают в этот диапазон."
      },
      {
        min: 11,
        max: 12,
        label: "11-12 (лёгкая EDS)",
        color: "#F59E0B",
        description: "Лёгкая избыточная дневная сонливость.",
        details: "Лёгкая Excessive Daytime Sleepiness. Оценить гигиену сна, рабочий график, скрининг OSA (STOP-BANG).",
        actions: [
          "Скрининг OSA: STOP-BANG, Berlin Questionnaire",
          "Опросник гигиены сна, дневник сна 2 недели",
          "Исключить депрессию (PHQ-9), гипотиреоз, анемию"
        ]
      },
      {
        min: 13,
        max: 15,
        label: "13-15 (умеренная EDS)",
        color: "#EF4444",
        description: "Умеренная дневная сонливость. Высокая вероятность SDB.",
        details: "Умеренная EDS ассоциирована с обструктивным апноэ сна, нарколепсией, лишением сна. Направление на полисомнографию.",
        actions: [
          "Полисомнография (PSG) или home sleep apnea test",
          "Оценка нарколепсии при характерной клинике (MSLT)",
          "Предупредить о рисках вождения"
        ]
      },
      {
        min: 16,
        max: 24,
        label: "16-24 (тяжёлая EDS)",
        color: "#991B1B",
        description: "Тяжёлая EDS. Высокий риск ДТП. Экстренное обследование.",
        details: "Тяжёлая сонливость. Высокий риск дорожно-транспортных происшествий и профессиональных ошибок. Обязательно PSG и мультидисциплинарная оценка.",
        actions: [
          "Срочная полисомнография + MSLT",
          "Запрет вождения до установления диагноза и эффективной терапии",
          "При OSA - CPAP; при нарколепсии - модафинил/солриамфетол",
          "Оценить профессиональные риски (водители, пилоты, операторы)"
        ]
      }
    ],
    caveats: [
      "ESS - самоотчёт, чувствителен к эффекту социальной желательности",
      "Коррелирует с OSA умеренно (r ≈ 0,3-0,5); нормальный ESS не исключает OSA",
      "У пожилых и женщин сонливость может быть занижена",
      "Альтернативы: STOP-BANG (скрининг OSA), MSLT (объективная нарколепсия), Insomnia Severity Index"
    ],
    related: [
      {
        id: "stop-bang",
        title: "STOP-BANG"
      },
      {
        id: "psqi",
        title: "PSQI"
      },
      {
        id: "mmse",
        title: "MMSE"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Johns MW. A new method for measuring daytime sleepiness: the Epworth Sleepiness Scale. Sleep 1991;14:540-545.",
    countries: "Международный",
    info: "### Для чего используется\n**Epworth Sleepiness Scale (ESS, Johns 1991)** - валидированный самозаполняемый опросник для оценки **дневной сонливости** за последние недели.\n\n### Структура\n8 ситуаций повседневной жизни, вероятность задремать оценивается 0-3:\n- 0 - никогда\n- 1 - слабая вероятность\n- 2 - умеренная\n- 3 - высокая\n\n### Интерпретация\n| Балл | Значение |\n|---|---|\n| 0-5 | Нижний диапазон нормы |\n| 6-10 | Верхний диапазон нормы |\n| 11-12 | Лёгкая избыточная дневная сонливость |\n| 13-15 | Умеренная EDS |\n| 16-24 | Тяжёлая EDS |\n\n### Ограничения\n- Субъективная оценка, не заменяет PSG / MSLT\n- Умеренная корреляция с OSA-тяжестью\n- Может быть нормальным при выраженном OSA (ложноотрицательный)\n\n### Тактика\n- **≤ 10:** рутинное наблюдение\n- **11-15:** скрининг OSA (STOP-BANG) + PSG при факторах риска\n- **≥ 16:** срочная PSG + запрет вождения до решения\n\n### Альтернативы\n- **STOP-BANG** - скрининг OSA\n- **PSQI** - качество сна в целом\n- **Insomnia Severity Index** - бессонница\n- **MSLT** - объективная нарколепсия\n\n### Источник\nJohns MW. *Sleep* 1991;14:540-545.\nJohns MW. Reliability and factor analysis of the ESS. *Sleep* 1992;15:376-381."
  };

export default runner;
