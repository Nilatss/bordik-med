// @ts-nocheck
/**
 * Runner: thompson
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
    maxScore: 22,
    inputs: [
      {
        id: "tone",
        label: "Тонус",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальный",
            points: 0
          },
          {
            value: "1",
            label: "Гипертонус",
            points: 1
          },
          {
            value: "2",
            label: "Гипотонус",
            points: 2
          },
          {
            value: "3",
            label: "Флакциден",
            points: 3
          }
        ]
      },
      {
        id: "los",
        label: "Уровень сознания",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальный",
            points: 0
          },
          {
            value: "1",
            label: "Гипервозбудим",
            points: 1
          },
          {
            value: "2",
            label: "Летаргичен",
            points: 2
          },
          {
            value: "3",
            label: "Кома",
            points: 3
          }
        ]
      },
      {
        id: "fits",
        label: "Судороги",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "< 3/сут",
            points: 1
          },
          {
            value: "2",
            label: "≥ 3/сут",
            points: 2
          },
          {
            value: "3",
            label: "Статус эпилептический",
            points: 3
          }
        ]
      },
      {
        id: "posture",
        label: "Поза",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальная",
            points: 0
          },
          {
            value: "1",
            label: "Велосипедирование кистей, сжатые кулаки",
            points: 1
          },
          {
            value: "2",
            label: "Сильное дистальное сгибание",
            points: 2
          },
          {
            value: "3",
            label: "Децеребрационная",
            points: 3
          }
        ]
      },
      {
        id: "moro",
        label: "Рефлекс Моро",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальный",
            points: 0
          },
          {
            value: "1",
            label: "Частичный",
            points: 1
          },
          {
            value: "2",
            label: "Отсутствует",
            points: 2
          }
        ]
      },
      {
        id: "grasp",
        label: "Хватательный рефлекс",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальный",
            points: 0
          },
          {
            value: "1",
            label: "Слабый",
            points: 1
          },
          {
            value: "2",
            label: "Отсутствует",
            points: 2
          }
        ]
      },
      {
        id: "suck",
        label: "Сосательный рефлекс",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальный",
            points: 0
          },
          {
            value: "1",
            label: "Слабый",
            points: 1
          },
          {
            value: "2",
            label: "Отсутствует ± прикусывание",
            points: 2
          }
        ]
      },
      {
        id: "resp",
        label: "Дыхание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальное",
            points: 0
          },
          {
            value: "1",
            label: "Гипервентиляция",
            points: 1
          },
          {
            value: "2",
            label: "Краткие периоды апноэ",
            points: 2
          },
          {
            value: "3",
            label: "ИВЛ",
            points: 3
          }
        ]
      },
      {
        id: "font",
        label: "Родничок",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальный",
            points: 0
          },
          {
            value: "1",
            label: "Полный, не напряжённый",
            points: 1
          },
          {
            value: "2",
            label: "Напряжённый",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 (норма)",
        color: "#22C55E",
        description: "Неврологической дисфункции нет."
      },
      {
        min: 1,
        max: 10,
        label: "1–10 (лёгкая HIE)",
        color: "#84CC16",
        description: "Лёгкая гипоксически-ишемическая энцефалопатия. Хороший прогноз.",
        details: "Лёгкая HIE (соответствует Sarnat I). Прогноз благоприятный; терапевтическая гипотермия не показана изолированно.",
        actions: [
          "Наблюдение, aEEG",
          "Поддерживающая терапия: нормогликемия, нормотермия, коррекция электролитов",
          "Если есть критерии HIE по газам (pH ≤ 7,0 / BE ≥ 12) и Sarnat II–III — обсудить охлаждение"
        ]
      },
      {
        min: 11,
        max: 14,
        label: "11–14 (умеренная HIE)",
        color: "#F59E0B",
        description: "Умеренная HIE. Показана терапевтическая гипотермия.",
        details: "Умеренная HIE (Sarnat II). Показано охлаждение до 33,5 °C × 72 ч, начатое в первые 6 ч жизни.",
        actions: [
          "Терапевтическая гипотермия 33,5 °C × 72 ч (TOBY / NICHD протокол)",
          "aEEG мониторинг",
          "МРТ головного мозга на 4–7 сутки",
          "Противосудорожные (фенобарбитал 20 мг/кг нагрузка) при ЭЭГ-судорогах"
        ]
      },
      {
        min: 15,
        max: 22,
        label: "15–22 (тяжёлая HIE)",
        color: "#EF4444",
        description: "Тяжёлая HIE. Высокий риск тяжёлого исхода.",
        details: "Тяжёлая HIE (Sarnat III). Охлаждение показано, но прогноз серьёзный: 30–60 % смертность или тяжёлая инвалидность.",
        actions: [
          "Охлаждение 33,5 °C × 72 ч (если в окне 6 ч и ≥ 36 нед)",
          "ИВЛ, инотропы по показаниям",
          "aEEG, контроль судорог",
          "МРТ на 4–7 сут для прогноза; обсудить с семьёй"
        ]
      }
    ],
    caveats: [
      "Thompson score не заменяет критерии HIE для охлаждения (pH ≤ 7,0 или BE ≥ 12 + Sarnat II–III)",
      "Оценивать ежедневно до 10-х суток — пик ≥ 15 коррелирует с плохим исходом",
      "Применим к доношенным и поздним недоношенным (≥ 36 нед)",
      "Sarnat staging (I/II/III) — альтернативная классификация; МРТ — золотой стандарт для прогноза"
    ],
    related: [
      {
        id: "apgar",
        title: "Apgar"
      },
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "finnegan",
        title: "Finnegan"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Thompson CM et al. The value of a scoring system for hypoxic-ischaemic encephalopathy in predicting neurodevelopmental outcome. Acta Paediatr 1997;86:757–761.",
    countries: "Международный",
    info: "### Для чего используется\n**Thompson HIE Score (1997)** — клиническая шкала тяжести гипоксически-ишемической энцефалопатии у доношенного новорождённого. Используется для решения о терапевтической гипотермии и прогноза.\n\n### Критерии (9 × 0–3)\n| Признак | 0 | 1 | 2 | 3 |\n|---|---|---|---|---|\n| Тонус | норма | гипер | гипо | флакциден |\n| Сознание | норма | раздражимость | летаргия | кома |\n| Судороги | нет | < 3/сут | ≥ 3/сут | статус |\n| Поза | норма | велосипед. | дист. сгиб. | децеребр. |\n| Моро | норма | частичн. | нет | — |\n| Хватат. | норма | слабый | нет | — |\n| Сосат. | норма | слабый | нет | — |\n| Дыхание | норма | гипервент. | апноэ | ИВЛ |\n| Родничок | норма | полный | напряж. | — |\n\n### Интерпретация\n| Балл | Тяжесть | Сопоставление с Sarnat |\n|---|---|---|\n| 0 | Норма | — |\n| 1–10 | Лёгкая | Sarnat I |\n| 11–14 | Умеренная | Sarnat II |\n| ≥ 15 | Тяжёлая | Sarnat III |\n\n### Критерии для охлаждения (TOBY/NICHD)\nВсе должны присутствовать:\n- ≥ 36 нед, вес ≥ 1800 г\n- ≤ 6 ч жизни\n- pH ≤ 7,0 или BE ≥ 12 ИЛИ Apgar ≤ 5 на 10 мин ИЛИ ИВЛ ≥ 10 мин\n- Умеренная/тяжёлая энцефалопатия (Sarnat II–III или Thompson ≥ 11)\n\n### Альтернативы\n- **Sarnat staging (1976)** — клинико-ЭЭГ классификация I/II/III\n- **aEEG** — амплитудно-интегрированная ЭЭГ\n- **МРТ** на 4–7 сут — золотой стандарт прогноза\n\n### Источник\nThompson CM, Puterman AS, Linley LL, et al. *Acta Paediatr* 1997;86:757–761.\nSarnat HB, Sarnat MS. Neonatal encephalopathy following fetal distress. *Arch Neurol* 1976;33:696–705.\nAzzopardi DV et al. TOBY Study Group. *N Engl J Med* 2009;361:1349–1358."
  };

export default runner;
