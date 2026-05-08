/**
 * Runner: nutric
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
    maxScore: 10,
    inputs: [
      {
        id: "age",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 50 лет",
            points: 0
          },
          {
            value: "1",
            label: "50-74 года",
            points: 1
          },
          {
            value: "2",
            label: "≥ 75 лет",
            points: 2
          }
        ]
      },
      {
        id: "apache",
        label: "APACHE II",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 15",
            points: 0
          },
          {
            value: "1",
            label: "15-19",
            points: 1
          },
          {
            value: "2",
            label: "20-27",
            points: 2
          },
          {
            value: "3",
            label: "≥ 28",
            points: 3
          }
        ]
      },
      {
        id: "sofa",
        label: "SOFA",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 6",
            points: 0
          },
          {
            value: "1",
            label: "6-9",
            points: 1
          },
          {
            value: "2",
            label: "≥ 10",
            points: 2
          }
        ]
      },
      {
        id: "comorb",
        label: "Коморбидности",
        type: "select",
        options: [
          {
            value: "0",
            label: "0-1",
            points: 0
          },
          {
            value: "1",
            label: "≥ 2",
            points: 1
          }
        ]
      },
      {
        id: "days",
        label: "Дней от госпитализации до ОРИТ",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - < 1",
            points: 0
          },
          {
            value: "1",
            label: "≥ 1",
            points: 1
          }
        ]
      },
      {
        id: "il6",
        label: "IL-6 ≥ 400 пг/мл (если доступно)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "0-4 - низкий риск",
        color: "#22C55E",
        description: "Низкий риск неблагоприятного исхода, связанного с нутритивным статусом.",
        details: "Без IL-6: 0-4 = низкий. С IL-6: 0-5 = низкий. Интенсивная ранняя нутритивная поддержка, вероятно, не даёт значимого преимущества.",
        actions: [
          "Стандартный протокол кормления (25 ккал/кг, белок 1,2 г/кг)",
          "Энтеральное питание в течение 24-48 ч",
          "Переоценка при изменении тяжести"
        ]
      },
      {
        min: 5,
        max: 10,
        label: "≥ 5 - высокий риск",
        color: "#EF4444",
        description: "Высокий риск - агрессивная нутритивная поддержка.",
        details: "Без IL-6: ≥ 5 = высокий. С IL-6: ≥ 6 = высокий. Раннее достижение целевой калорийности и белка снижает смертность и инфекционные осложнения (Heyland 2011, 2016).",
        actions: [
          "Энтеральное питание в течение 24-48 ч",
          "Цель: 25-30 ккал/кг, белок 1,2-2,0 г/кг/сут",
          "Достичь ≥ 80 % цели к 72 ч",
          "При невозможности EN - добавить PN с 3-7 сут",
          "Мониторинг: остаточный объём желудка, GI-симптомы, электролиты",
          "Ежедневная переоценка плана"
        ]
      }
    ],
    caveats: [
      "Разработан и валидирован в ОРИТ - не для общих отделений",
      "Модифицированный NUTRIC (без IL-6) часто используется, т.к. IL-6 редко доступен рутинно",
      "Без IL-6: max 9, порог ≥ 5; с IL-6: max 10, порог ≥ 6",
      "APACHE II и SOFA должны быть рассчитаны на момент поступления в ОРИТ",
      "ASPEN/SCCM 2016 рекомендует NUTRIC и NRS-2002 для скрининга в ОРИТ"
    ],
    related: [
      {
        id: "nrs2002",
        title: "NRS-2002"
      },
      {
        id: "must",
        title: "MUST"
      },
      {
        id: "glim",
        title: "GLIM criteria"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная"
      },
      {
        id: "202.3",
        title: "Метаболизм"
      }
    ],
    reference: "Heyland DK, Dhaliwal R, Jiang X, Day AG. Identifying critically ill patients who benefit the most from nutrition therapy: the development and initial validation of a novel risk assessment tool (NUTRIC). Crit Care 2011; 15:R268.",
    countries: "Международный · ОРИТ (ASPEN/SCCM)",
    presets: [
      {
        label: "Низкий риск",
        values: {
          age: "0",
          apache: "0",
          sofa: "0",
          comorb: "0",
          days: "0",
          il6: false
        }
      },
      {
        label: "Высокий риск (без IL-6)",
        values: {
          age: "1",
          apache: "2",
          sofa: "1",
          comorb: "1",
          days: "1",
          il6: false
        }
      },
      {
        label: "Очень высокий риск",
        values: {
          age: "2",
          apache: "3",
          sofa: "2",
          comorb: "1",
          days: "1",
          il6: true
        }
      }
    ],
    info: "### Для чего используется\n**NUTRIC score** (NUTrition RIsk in the Critically ill) - единственный нутритивный скрининг, разработанный и валидированный специально для ОРИТ. Идентифицирует пациентов, которым агрессивная ранняя нутритивная терапия даёт наибольшую пользу.\n\n### Компоненты\n| Параметр | Баллы |\n|---|---|\n| Возраст: < 50 / 50-74 / ≥ 75 | 0 / 1 / 2 |\n| APACHE II: < 15 / 15-19 / 20-27 / ≥ 28 | 0 / 1 / 2 / 3 |\n| SOFA: < 6 / 6-9 / ≥ 10 | 0 / 1 / 2 |\n| Коморбидности: 0-1 / ≥ 2 | 0 / 1 |\n| Дней госпитализации до ОРИТ: < 1 / ≥ 1 | 0 / 1 |\n| IL-6 ≥ 400 пг/мл (опционально) | 0 / 1 |\n\n### Интерпретация\n**Без IL-6** (модифицированный NUTRIC, max 9):\n- 0-4 - низкий риск\n- 5-9 - высокий риск\n\n**С IL-6** (оригинальный, max 10):\n- 0-5 - низкий риск\n- 6-10 - высокий риск\n\n### Ограничения\n- Только для ОРИТ\n- IL-6 редко доступен → чаще используется mNUTRIC\n- APACHE II и SOFA нужны на момент поступления в ОРИТ\n\n### Тактика\n- **Низкий риск** - стандартный протокол EN, 25 ккал/кг, 1,2 г/кг белка\n- **Высокий риск** - агрессивное раннее EN (24-48 ч), цель ≥ 80 % к 72 ч, белок до 2,0 г/кг, рассмотреть supplemental PN с 3-7 сут"
  };

export default runner;
