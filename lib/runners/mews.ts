// @ts-nocheck
/**
 * Runner: mews
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
        id: "sbp",
        label: "Систолическое АД (мм рт.ст.)",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤70",
            points: 3
          },
          {
            value: "2",
            label: "71-80",
            points: 2
          },
          {
            value: "3",
            label: "81-100",
            points: 1
          },
          {
            value: "4",
            label: "101-199",
            points: 0
          },
          {
            value: "5",
            label: "≥200",
            points: 2
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
            label: "<40",
            points: 2
          },
          {
            value: "2",
            label: "40-50",
            points: 1
          },
          {
            value: "3",
            label: "51-100",
            points: 0
          },
          {
            value: "4",
            label: "101-110",
            points: 1
          },
          {
            value: "5",
            label: "111-129",
            points: 2
          },
          {
            value: "6",
            label: "≥130",
            points: 3
          }
        ]
      },
      {
        id: "rr",
        label: "ЧДД (/мин)",
        type: "select",
        options: [
          {
            value: "1",
            label: "<9",
            points: 2
          },
          {
            value: "2",
            label: "9-14",
            points: 0
          },
          {
            value: "3",
            label: "15-20",
            points: 1
          },
          {
            value: "4",
            label: "21-29",
            points: 2
          },
          {
            value: "5",
            label: "≥30",
            points: 3
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
            label: "<35.0",
            points: 2
          },
          {
            value: "2",
            label: "35.0-38.4",
            points: 0
          },
          {
            value: "3",
            label: "≥38.5",
            points: 2
          }
        ]
      },
      {
        id: "avpu",
        label: "Сознание (AVPU)",
        type: "select",
        options: [
          {
            value: "A",
            label: "A - Alert",
            points: 0
          },
          {
            value: "V",
            label: "V - Voice",
            points: 1
          },
          {
            value: "P",
            label: "P - Pain",
            points: 2
          },
          {
            value: "U",
            label: "U - Unresponsive",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (низкий)",
        color: "#22C55E",
        description: "Рутинный мониторинг."
      },
      {
        min: 3,
        max: 4,
        label: "3-4 (средний)",
        color: "#F59E0B",
        description: "Вызвать старшую медсестру / дежурного врача, увеличить частоту мониторинга.",
        actions: [
          "Врачебный осмотр ≤ 60 мин",
          "Мониторинг каждые 1-2 ч",
          "Рассмотреть кислород, в/в доступ"
        ]
      },
      {
        min: 5,
        max: 14,
        label: "≥5 (высокий)",
        color: "#EF4444",
        description: "Критический риск. Rapid response team / перевод в ICU.",
        details: "MEWS ≥ 5 ассоциирован со смертностью ~ 20% и потребностью в ICU. Начать sepsis screen, ABCDE, расширенный лабораторный профиль.",
        actions: [
          "Немедленный осмотр врача / rapid response team",
          "ABCDE, монитор, лактат, газы крови",
          "Кислород до SpO₂ 94-98% (88-92% при ХОБЛ)",
          "Рассмотреть перевод в ICU"
        ]
      }
    ],
    caveats: [
      "MEWS - предшественник NEWS2; в UK стандартом с 2017 г. является NEWS2",
      "Нет пункта «SpO₂ + кислород» - чувствительность к респираторному ухудшению ниже, чем у NEWS2",
      "Не валидизирован у беременных (≥ 20 нед) - используйте MEOWS",
      "В педиатрии применяется PEWS"
    ],
    related: [
      {
        id: "news2",
        title: "NEWS2"
      },
      {
        id: "pews",
        title: "PEWS"
      },
      {
        id: "meows",
        title: "MEOWS"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Subbe CP, Kruger M, Rutherford P, Gemmel L. Validation of a modified Early Warning Score in medical admissions. QJM 2001;94:521-6.",
    countries: "Великобритания/Европа",
    presets: [
      {
        label: "Стабилен",
        values: {
          sbp: "4",
          hr: "3",
          rr: "2",
          temp: "2",
          avpu: "A"
        }
      },
      {
        label: "Средний риск",
        values: {
          sbp: "3",
          hr: "4",
          rr: "3",
          temp: "3",
          avpu: "V"
        }
      },
      {
        label: "Критический",
        values: {
          sbp: "2",
          hr: "6",
          rr: "5",
          temp: "1",
          avpu: "P"
        }
      }
    ],
    info: "### Для чего используется\n**MEWS (Modified Early Warning Score, Subbe 2001)** - прикроватная шкала для раннего распознавания клинического ухудшения у взрослых стационарных пациентов.\n\n### 5 параметров (каждый 0-3)\n| Параметр | 3 | 2 | 1 | 0 | 1 | 2 | 3 |\n|---|---|---|---|---|---|---|---|\n| САД | ≤70 | 71-80 | 81-100 | 101-199 | - | ≥200 | - |\n| ЧСС | - | <40 или 111-129 | 40-50 или 101-110 | 51-100 | - | - | ≥130 |\n| ЧДД | - | <9 или 21-29 | - | 9-14 | 15-20 | - | ≥30 |\n| Темп. | - | <35.0 или ≥38.5 | - | 35.0-38.4 | - | - | - |\n| AVPU | - | - | - | A | V | P | U |\n\n### Интерпретация\n| MEWS | Риск | Действие |\n|---|---|---|\n| 0-2 | Низкий | Рутинный мониторинг |\n| 3-4 | Средний | Старшая медсестра, врачебный осмотр |\n| ≥ 5 | Высокий | Rapid response team, рассмотреть ICU |\n\n### MEWS vs NEWS2\n| | MEWS | NEWS2 |\n|---|---|---|\n| SpO₂ + O₂ | Нет | Есть |\n| Вес отдельных параметров | Меньше | Больше (до 3) |\n| Scale 2 (ХОБЛ) | Нет | Есть |\n| Рекомендация NHS | Устарел | Стандарт |\n\n### Ограничения\n- Не учитывает сатурацию и кислородотерапию\n- Беременные - MEOWS\n- Дети - PEWS\n- Не диагностирует сепсис (только триггер)\n\n### Тактика\n- **0-2**: обычный обход\n- **3-4**: эскалация, мониторинг каждые 1-2 ч\n- **≥ 5**: rapid response / критический уход\n\n### Источник\nSubbe CP et al. *QJM* 2001; 94:521-526. Gardner-Thorpe J et al. *Ann R Coll Surg Engl* 2006."
  };

export default runner;
