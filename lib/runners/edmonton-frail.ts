// @ts-nocheck
/**
 * Runner: edmonton-frail
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
    maxScore: 17,
    inputs: [
      {
        id: "cognition",
        label: "Когниция (часы - тест рисования часов)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - без ошибок",
            points: 0
          },
          {
            value: "1",
            label: "1 - минимальные ошибки расстановки цифр",
            points: 1
          },
          {
            value: "2",
            label: "2 - другие ошибки (неправильное время, дисорганизация)",
            points: 2
          }
        ]
      },
      {
        id: "admissions",
        label: "Госпитализации за последний год",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - ни одной",
            points: 0
          },
          {
            value: "1",
            label: "1 - 1-2",
            points: 1
          },
          {
            value: "2",
            label: "2 - ≥ 3",
            points: 2
          }
        ]
      },
      {
        id: "health",
        label: "Общая оценка здоровья (субъективно)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - отлично / очень хорошо / хорошо",
            points: 0
          },
          {
            value: "1",
            label: "1 - удовлетворительно",
            points: 1
          },
          {
            value: "2",
            label: "2 - плохо",
            points: 2
          }
        ]
      },
      {
        id: "independence",
        label: "Функциональная независимость (число ADL с помощью)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - 0-1",
            points: 0
          },
          {
            value: "1",
            label: "1 - 2-4",
            points: 1
          },
          {
            value: "2",
            label: "2 - 5-8",
            points: 2
          }
        ]
      },
      {
        id: "support",
        label: "Социальная поддержка (можно ли положиться на близких)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - всегда",
            points: 0
          },
          {
            value: "1",
            label: "1 - иногда",
            points: 1
          },
          {
            value: "2",
            label: "2 - никогда",
            points: 2
          }
        ]
      },
      {
        id: "meds",
        label: "Приём медикаментов",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - < 5 препаратов и не забывает",
            points: 0
          },
          {
            value: "1",
            label: "1 - ≥ 5 препаратов ИЛИ иногда забывает",
            points: 1
          },
          {
            value: "2",
            label: "2 - ≥ 5 препаратов И часто забывает",
            points: 2
          }
        ]
      },
      {
        id: "nutrition",
        label: "Питание (недавнее похудание)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "1",
            label: "1 - одежда стала свободнее",
            points: 1
          },
          {
            value: "2",
            label: "2 - значительное похудание",
            points: 2
          }
        ]
      },
      {
        id: "mood",
        label: "Настроение (грусть / депрессия)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "1",
            label: "1 - иногда",
            points: 1
          },
          {
            value: "2",
            label: "2 - часто",
            points: 2
          }
        ]
      },
      {
        id: "continence",
        label: "Недержание",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "1",
            label: "1 - эпизодически",
            points: 1
          },
          {
            value: "2",
            label: "2 - частое / постоянное",
            points: 2
          }
        ]
      },
      {
        id: "tug",
        label: "Timed Up and Go (встать, пройти 3 м, вернуться)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - < 10 с",
            points: 0
          },
          {
            value: "1",
            label: "1 - 10-20 с",
            points: 1
          },
          {
            value: "2",
            label: "2 - > 20 с или неспособен",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 5,
        label: "0-5 - не фрагилен",
        color: "#22C55E",
        description: "Астения отсутствует.",
        actions: [
          "Поддержание активности, сбалансированное питание, социальные контакты"
        ]
      },
      {
        min: 6,
        max: 7,
        label: "6-7 - уязвимость",
        color: "#F59E0B",
        description: "Ранние признаки уязвимости.",
        actions: [
          "Физическая активность (resistance training, Tai Chi)",
          "Белковое питание 1.0-1.2 г/кг/сут",
          "Проверка полипрагмазии (deprescribing по STOPP/START)"
        ]
      },
      {
        min: 8,
        max: 9,
        label: "8-9 - лёгкая астения",
        color: "#F59E0B",
        description: "Лёгкая астения - прехабилитация показана.",
        actions: [
          "Comprehensive Geriatric Assessment",
          "Прехабилитация перед плановыми вмешательствами",
          "Коррекция обратимых причин (анемия, В12, ТТГ, депрессия)"
        ]
      },
      {
        min: 10,
        max: 11,
        label: "10-11 - умеренная астения",
        color: "#EF4444",
        description: "Умеренная астения - высокий риск неблагоприятных исходов.",
        details: "Увеличенный риск падений, госпитализаций, делирия, послеоперационных осложнений.",
        actions: [
          "CGA + междисциплинарный план",
          "Реабилитация, оценка дома",
          "Обсуждение целей помощи перед инвазивными вмешательствами"
        ]
      },
      {
        min: 12,
        max: 17,
        label: "≥ 12 - тяжёлая астения",
        color: "#EF4444",
        description: "Тяжёлая астения - преобладают риски над пользой агрессивной терапии.",
        actions: [
          "Паллиативный подход, advance care planning",
          "Ограничение инвазивных вмешательств",
          "Контроль симптомов, поддержка семьи"
        ]
      }
    ],
    caveats: [
      "Выполняется ~ 5 минут, не требует спец. обучения",
      "Валидирован в гериатрических амбулаторных и периоперационных условиях",
      "TUG и clock test требуют физической способности выполнить - модифицируйте при слепоте/параличе",
      "Не заменяет полной CGA при высоких баллах"
    ],
    related: [
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      },
      {
        id: "katz-adl",
        title: "Katz ADL"
      },
      {
        id: "tinetti",
        title: "Tinetti POMA"
      }
    ],
    relatedCourses: [
      {
        id: "301.7",
        title: "Онкология"
      }
    ],
    reference: "Rolfson DB, Majumdar SR, Tsuyuki RT, Tahir A, Rockwood K. Validity and reliability of the Edmonton Frail Scale. Age Ageing 2006; 35:526-529.",
    countries: "Канада · Международный",
    presets: [
      {
        label: "Здоровый пожилой",
        values: {
          cognition: "0",
          admissions: "0",
          health: "0",
          independence: "0",
          support: "0",
          meds: "0",
          nutrition: "0",
          mood: "0",
          continence: "0",
          tug: "0"
        }
      },
      {
        label: "Уязвимость",
        values: {
          cognition: "1",
          admissions: "1",
          health: "1",
          independence: "1",
          support: "0",
          meds: "1",
          nutrition: "0",
          mood: "1",
          continence: "1",
          tug: "1"
        }
      },
      {
        label: "Тяжёлая астения",
        values: {
          cognition: "2",
          admissions: "2",
          health: "2",
          independence: "2",
          support: "1",
          meds: "2",
          nutrition: "2",
          mood: "2",
          continence: "2",
          tug: "2"
        }
      }
    ],
    info: "### Для чего используется\n**Edmonton Frail Scale (EFS)** - быстрый (≈ 5 мин) структурированный опросник для оценки астении у пожилых. 9 доменов × 0-2 балла = 0-17. Не требует специального гериатрического обучения.\n\n### 9 доменов (10 пунктов; здоровье и госпитализации разделены)\n| Домен | 0 | 1 | 2 |\n|---|---|---|---|\n| Когниция (clock test) | Без ошибок | Мелкие | Значимые |\n| Госпитализации (год) | 0 | 1-2 | ≥ 3 |\n| Оценка здоровья | Хорошо | Удовл. | Плохо |\n| Функциональная независимость | 0-1 ADL | 2-4 | 5-8 |\n| Соц. поддержка | Всегда | Иногда | Никогда |\n| Медикаменты | < 5 | ≥ 5 или забывает | ≥ 5 и забывает |\n| Питание (похудание) | Нет | Одежда свободнее | Значимое |\n| Настроение | Нет грусти | Иногда | Часто |\n| Недержание | Нет | Эпизоды | Частое |\n| TUG | < 10 с | 10-20 с | > 20 с |\n\n### Интерпретация\n| Сумма | Значение |\n|---|---|\n| 0-5 | Не фрагилен |\n| 6-7 | Уязвимость |\n| 8-9 | Лёгкая астения |\n| 10-11 | Умеренная |\n| ≥ 12 | Тяжёлая |\n\n### Связанные концепции\n- **Frailty Index** (Rockwood, Mitnitski) - кумулятивный deficit score (30-70 пунктов); FI > 0.25 = астения\n- **Fried phenotype** (CHS criteria) - 5 критериев: похудание, слабость хвата, усталость, медленная ходьба, низкая активность; ≥ 3 = астения, 1-2 = пре-астения\n- **CFS (Rockwood)** - 1-9, клиническое суждение\n\n### Ограничения\n- TUG требует мобильности; clock test - зрения и моторики руки\n- Не заменяет CGA при высоких баллах\n- Не валидирован у молодых\n\n### Тактика\n- **0-5** - профилактика\n- **6-9** - прехабилитация, deprescribing (STOPP/START), реабилитация\n- **10-11** - CGA, обсуждение целей помощи\n- **≥ 12** - паллиативный фокус"
  };

export default runner;
