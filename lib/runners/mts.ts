// @ts-nocheck
/**
 * Runner: mts
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
    maxScore: 5,
    inputs: [
      {
        id: "threat",
        label: "Угроза жизни / проходимость ДП",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Есть (обструкция ДП, апноэ, шок, судороги)",
            points: 1
          }
        ]
      },
      {
        id: "hemo",
        label: "Кровотечение",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "2",
            label: "Неконтролируемое большое - оранжевый",
            points: 2
          },
          {
            value: "3",
            label: "Контролируемое большое - жёлтый",
            points: 3
          },
          {
            value: "4",
            label: "Небольшое - зелёный",
            points: 4
          }
        ]
      },
      {
        id: "pain",
        label: "Боль (по шкале)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет / лёгкая",
            points: 0
          },
          {
            value: "2",
            label: "Очень сильная (≥8/10) - оранжевый",
            points: 2
          },
          {
            value: "3",
            label: "Умеренная (4-7/10) - жёлтый",
            points: 3
          },
          {
            value: "4",
            label: "Лёгкая (1-3/10) - зелёный",
            points: 4
          }
        ]
      },
      {
        id: "fever",
        label: "Лихорадка",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "2",
            label: "Очень высокая (>41°C) - оранжевый",
            points: 2
          },
          {
            value: "3",
            label: "Высокая (38.5-41) - жёлтый",
            points: 3
          },
          {
            value: "4",
            label: "Субфебрильная - зелёный",
            points: 4
          }
        ]
      },
      {
        id: "default",
        label: "Если все выше «нет» - базовая категория",
        type: "select",
        options: [
          {
            value: "5",
            label: "Несрочные жалобы (синий)",
            points: 5
          },
          {
            value: "0",
            label: "Не применимо",
            points: 0
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "Красный - Immediate",
        color: "#DC2626",
        description: "Осмотр немедленно (0 мин). Угроза жизни.",
        details: "Обструкция дыхательных путей, остановка дыхания/кровообращения, шок, активные судороги, массивное неконтролируемое кровотечение.",
        actions: [
          "Resus bay немедленно, ABCDE",
          "Команда реанимации, монитор",
          "Параллельные терапия и диагностика"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "Оранжевый - Very urgent",
        color: "#EA580C",
        description: "Осмотр ≤ 10 мин. Высокий риск ухудшения.",
        actions: [
          "Коечная зона ≤ 10 мин",
          "Анальгезия при сильной боли",
          "Контроль витальных каждые 15 мин"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "Жёлтый - Urgent",
        color: "#FACC15",
        description: "Осмотр ≤ 60 мин."
      },
      {
        min: 4,
        max: 4,
        label: "Зелёный - Standard",
        color: "#22C55E",
        description: "Осмотр ≤ 120 мин."
      },
      {
        min: 5,
        max: 5,
        label: "Синий - Non-urgent",
        color: "#3B82F6",
        description: "Осмотр ≤ 240 мин."
      }
    ],
    caveats: [
      "MTS использует 52 клинические схемы (flowcharts) - данный калькулятор - упрощение",
      "Окончательный цвет определяется наивысшим (самым срочным) дискриминатором",
      "Не валидизирован полноценно у детей < 1 года - применять PaedCTAS/JumpSTART",
      "Шкалы боли у пожилых и когнитивно нарушенных - используйте PAINAD"
    ],
    related: [
      {
        id: "esi",
        title: "ESI v.5 (США)"
      },
      {
        id: "ctas",
        title: "CTAS (Канада)"
      },
      {
        id: "ats",
        title: "ATS (Австралия)"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Mackway-Jones K, Marsden J, Windle J. Emergency Triage: Manchester Triage Group. 3rd ed., Wiley-Blackwell 2014.",
    countries: "Великобритания/Европа",
    presets: [
      {
        label: "Обструкция ДП",
        values: {
          threat: "1",
          hemo: "0",
          pain: "0",
          fever: "0",
          default: "0"
        }
      },
      {
        label: "Боль 9/10 в животе",
        values: {
          threat: "0",
          hemo: "0",
          pain: "2",
          fever: "0",
          default: "0"
        }
      },
      {
        label: "Ссадина пальца",
        values: {
          threat: "0",
          hemo: "4",
          pain: "4",
          fever: "0",
          default: "0"
        }
      }
    ],
    info: "### Для чего используется\n**MTS (Manchester Triage System)** - британская пятицветная система сортировки, разработанная Manchester Triage Group в 1994. Основа - 52 presenting-chart по жалобам; в каждой - набор дискриминаторов, определяющих цвет.\n\n### Критерии (цвета и время до осмотра)\n| Цвет | Уровень | Целевое время |\n|---|---|---|\n| **Красный** | Immediate | 0 мин |\n| **Оранжевый** | Very urgent | 10 мин |\n| **Жёлтый** | Urgent | 60 мин |\n| **Зелёный** | Standard | 120 мин |\n| **Синий** | Non-urgent | 240 мин |\n\n### Ключевые дискриминаторы (general)\n| Дискриминатор | Красный | Оранжевый | Жёлтый | Зелёный |\n|---|---|---|---|---|\n| Угроза жизни | + | | | |\n| Шок | + | | | |\n| Неконтролируемое кровотечение | | + | | |\n| Очень сильная боль (≥8) | | + | | |\n| Умеренная боль | | | + | |\n| Температура >41 °C | | + | | |\n| Температура 38.5-41 | | | + | |\n| Свежая травма | | | | + |\n\n### Интерпретация\nПриоритет - наивысший (самый срочный) выявленный дискриминатор.\n\n### Ограничения\n- Недостаточно чувствителен у пожилых с атипичной клиникой\n- Педиатрия < 1 года - отдельные педиатрические схемы\n- Беременность > 20 нед - отдельные акушерские карты\n\n### Тактика\n- **Красный**: реанимационный зал\n- **Оранжевый**: основная зона с монитором\n- **Жёлтый/Зелёный**: общая ER\n- **Синий**: fast-track / к врачу общей практики\n\n### Источник\nMackway-Jones K. *Emergency Triage: Manchester Triage Group.* BMJ Books, 3rd ed., 2014. Валидизация: Parenti N et al. *Int Emerg Nurs.* 2014."
  };

export default runner;
