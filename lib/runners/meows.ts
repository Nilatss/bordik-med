/**
 * Runner: meows
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
    maxScore: 14,
    inputs: [
      {
        id: "rr",
        label: "ЧДД (/мин)",
        type: "select",
        options: [
          {
            value: "1",
            label: "<10 или >30 - red",
            points: 2
          },
          {
            value: "2",
            label: "21-30 - yellow",
            points: 1
          },
          {
            value: "3",
            label: "10-20 - норма",
            points: 0
          }
        ]
      },
      {
        id: "spo2",
        label: "SpO₂ (%)",
        type: "select",
        options: [
          {
            value: "1",
            label: "<95% - red",
            points: 2
          },
          {
            value: "2",
            label: "≥95% - норма",
            points: 0
          }
        ]
      },
      {
        id: "temp",
        label: "Температура (°C)",
        type: "select",
        options: [
          {
            value: "1",
            label: "<35 или >38 - red",
            points: 2
          },
          {
            value: "2",
            label: "35-36 - yellow",
            points: 1
          },
          {
            value: "3",
            label: "36.1-37.9 - норма",
            points: 0
          }
        ]
      },
      {
        id: "sbp",
        label: "САД (мм рт.ст.)",
        type: "select",
        options: [
          {
            value: "1",
            label: "<90 или >160 - red",
            points: 2
          },
          {
            value: "2",
            label: "150-159 - yellow",
            points: 1
          },
          {
            value: "3",
            label: "90-149 - норма",
            points: 0
          }
        ]
      },
      {
        id: "dbp",
        label: "ДАД (мм рт.ст.)",
        type: "select",
        options: [
          {
            value: "1",
            label: ">100 - red",
            points: 2
          },
          {
            value: "2",
            label: "90-100 - yellow",
            points: 1
          },
          {
            value: "3",
            label: "≤89 - норма",
            points: 0
          }
        ]
      },
      {
        id: "hr",
        label: "ЧСС (/мин)",
        type: "select",
        options: [
          {
            value: "1",
            label: "<40 или >120 - red",
            points: 2
          },
          {
            value: "2",
            label: "100-120 или 40-50 - yellow",
            points: 1
          },
          {
            value: "3",
            label: "51-99 - норма",
            points: 0
          }
        ]
      },
      {
        id: "neuro",
        label: "Неврологический статус",
        type: "select",
        options: [
          {
            value: "0",
            label: "Alert",
            points: 0
          },
          {
            value: "1",
            label: "Voice (сонная)",
            points: 1
          },
          {
            value: "2",
            label: "Pain / Unresponsive",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 - норма",
        color: "#22C55E",
        description: "Обычный антенатальный мониторинг."
      },
      {
        min: 1,
        max: 1,
        label: "1 (один yellow)",
        color: "#84CC16",
        description: "Повторная оценка через 30 мин."
      },
      {
        min: 2,
        max: 3,
        label: "2 yellow или 1 red",
        color: "#F59E0B",
        description: "Trigger - срочный осмотр врача акушера.",
        actions: [
          "Осмотр акушера в течение 30 мин",
          "Повторные витальные каждые 15 мин",
          "Оценить на преэклампсию / сепсис / кровотечение"
        ]
      },
      {
        min: 4,
        max: 14,
        label: "≥2 red или сумма ≥4",
        color: "#EF4444",
        description: "Критический trigger - срочный консультативный осмотр, рассмотреть перевод в HDU/ICU.",
        details: "Материнский ранний критический порог. Акушерские причины: преэклампсия/HELLP, кровотечение, амниотическая эмболия, сепсис. MBRRACE-UK: позднее распознавание ухудшения - основная причина материнских смертей.",
        actions: [
          "Немедленная команда (акушер, анестезиолог, реаниматолог)",
          "ABCDE, левый боковой поворот (после 20 нед)",
          "Магнезия при судорогах/преэклампсии, уточнить АД",
          "Лактат, газы, ОАК, коагулограмма, фибриноген, ЛДГ",
          "Рассмотреть HDU/ICU, родоразрешение при необходимости"
        ]
      }
    ],
    caveats: [
      "Физиология беременности сдвигает «норму»: ЧСС ↑, ЧДД ↑, САД ↓ к II триместру",
      "В UK CNST/MBRRACE рекомендует: 1 red ИЛИ 2 yellow = эскалация",
      "Версии MEOWS различаются по порогам (RCOG, local trusts) - используйте локальный протокол",
      "Не применять в раннем послеродовом (<24 ч) без коррекции - нормальные осцилляции"
    ],
    related: [
      {
        id: "news2",
        title: "NEWS2 (взрослые)"
      },
      {
        id: "mews",
        title: "MEWS"
      },
      {
        id: "qsofa",
        title: "qSOFA"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Singh S, McGlennan A, England A, Simons R. A validation study of the CEMACH recommended modified early obstetric warning system (MEOWS). Anaesthesia 2012;67:12-18.",
    countries: "Великобритания/Европа",
    presets: [
      {
        label: "Норма II триместр",
        values: {
          rr: "3",
          spo2: "2",
          temp: "3",
          sbp: "3",
          dbp: "3",
          hr: "3",
          neuro: "0"
        }
      },
      {
        label: "Преэклампсия",
        values: {
          rr: "3",
          spo2: "2",
          temp: "3",
          sbp: "1",
          dbp: "1",
          hr: "3",
          neuro: "1"
        }
      },
      {
        label: "Пуэрперальный сепсис",
        values: {
          rr: "2",
          spo2: "1",
          temp: "1",
          sbp: "1",
          dbp: "3",
          hr: "1",
          neuro: "1"
        }
      }
    ],
    info: "### Для чего используется\n**MEOWS (Modified Early Obstetric Warning Score)** - акушерская адаптация шкал раннего предупреждения, созданная после рекомендаций CEMACH (2007) и внедрённая в NHS после MBRRACE-UK отчётов о материнской смертности.\n\n### Критерии (yellow / red trigger)\n| Параметр | Yellow | Red |\n|---|---|---|\n| ЧДД | 21-30 | <10 или >30 |\n| SpO₂ | - | <95% |\n| Температура | 35-36 | <35 или >38 |\n| САД | 150-159 | <90 или >160 |\n| ДАД | 90-100 | >100 |\n| ЧСС | 100-120 или 40-50 | <40 или >120 |\n| Сознание (AVPU) | V (voice) | P / U |\n\n### Интерпретация (trigger система)\n| Триггер | Действие |\n|---|---|\n| 1 yellow | Повторить витальные через 30 мин |\n| 2 yellow ИЛИ 1 red | Срочный осмотр акушера |\n| ≥ 2 red | Немедленная команда, HDU/ICU consult |\n\n### Основные акушерские катастрофы\n| Состояние | Ключевые триггеры |\n|---|---|\n| Преэклампсия / эклампсия | Высокое САД/ДАД, головная боль, гиперрефлексия |\n| HELLP | АД, тромбоциты < 100, ЛДГ, АЛТ |\n| Пуэрперальный сепсис | Лихорадка, тахикардия, гипотензия, лактат |\n| Массивное акушерское кровотечение | Тахикардия, гипотензия, ↓ сознания |\n| Амниотическая эмболия | Внезапная гипотензия, гипоксия, ДВС |\n| Кардиомиопатия беременных | Одышка, отёки, тахикардия |\n\n### Ограничения\n- Физиологические сдвиги беременности требуют учёта (HR +10-20, RR +2-4)\n- Нет единой версии - каждый NHS trust модифицирует\n- Не заменяет специфические акушерские критерии (например, критерии Sepsis-6 для пуэрперального сепсиса)\n\n### Тактика\n- **Yellow × 1**: наблюдение\n- **Yellow × 2 или Red × 1**: эскалация к акушеру + анестезиологу\n- **Red × ≥ 2**: HDU/ICU, материнская реанимация по ALSO/MOET"
  };

export default runner;
