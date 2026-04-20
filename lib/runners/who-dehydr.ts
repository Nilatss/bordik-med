// @ts-nocheck
/**
 * Runner: who-dehydr
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
    maxScore: 8,
    inputs: [
      {
        id: "condition",
        label: "Общее состояние",
        type: "select",
        options: [
          {
            value: "0",
            label: "Бодрствует, активен",
            points: 0
          },
          {
            value: "1",
            label: "Беспокоен, раздражителен",
            points: 1
          },
          {
            value: "2",
            label: "Вял, без сознания",
            points: 2
          }
        ]
      },
      {
        id: "eyes",
        label: "Глаза",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Запавшие",
            points: 1
          },
          {
            value: "2",
            label: "Очень запавшие, сухие",
            points: 2
          }
        ]
      },
      {
        id: "thirst",
        label: "Жажда / питьё",
        type: "select",
        options: [
          {
            value: "0",
            label: "Пьёт нормально, не испытывает жажды",
            points: 0
          },
          {
            value: "1",
            label: "Жаждет, пьёт жадно",
            points: 1
          },
          {
            value: "2",
            label: "Пьёт плохо или неспособен",
            points: 2
          }
        ]
      },
      {
        id: "skinPinch",
        label: "Тургор кожи (скин-пинч)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Быстро расправляется (<1 с)",
            points: 0
          },
          {
            value: "1",
            label: "Медленно (1-2 с)",
            points: 1
          },
          {
            value: "2",
            label: "Очень медленно (>2 с)",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 (нет дегидратации, Plan A)",
        color: "#22C55E",
        description: "Нет признаков - домашнее ведение (Plan A).",
        details: "Продолжать обычное кормление + ОРС или подходящая жидкость после каждого эпизода диареи/рвоты: <2 лет - 50-100 мл, ≥2 лет - 100-200 мл.",
        actions: [
          "ОРС / домашние жидкости после каждого жидкого стула",
          "Продолжить грудное вскармливание / обычное питание",
          "Цинк 10 мг/сут (<6 мес) или 20 мг/сут (≥6 мес) × 10-14 дней",
          "Возврат при: рвоте, кровавом стуле, сонливости, жаре, снижении диуреза"
        ]
      },
      {
        min: 2,
        max: 5,
        label: "2-5 (умеренная, Plan B)",
        color: "#F59E0B",
        description: "Умеренная дегидратация (~6-9%) - Plan B.",
        details: "≥2 признаков. ОРС 75 мл/кг за 4 часа под наблюдением. Переоценка каждый час.",
        actions: [
          "ОРС 75 мл/кг за 4 ч (частое дробное питьё, по глоткам)",
          "Продолжить грудное вскармливание между порциями ОРС",
          "Переоценка через 4 ч - если улучшение → Plan A",
          "Если ухудшение → Plan C",
          "При рвоте - пауза 10 мин, затем медленнее"
        ]
      },
      {
        min: 6,
        max: 8,
        label: "6-8 (тяжёлая, Plan C)",
        color: "#991B1B",
        description: "Тяжёлая дегидратация (≥10%) - Plan C, в/в жидкости.",
        details: "Жизнеугрожающая потеря жидкости. Рингер-лактат или NaCl 0,9% в/в. Немедленный венозный доступ; если невозможно - в/к или НГ-зонд.",
        actions: [
          "Рингер-лактат / NaCl 0,9% 100 мл/кг в/в",
          "<12 мес: 30 мл/кг за 1 ч → 70 мл/кг за 5 ч",
          "≥12 мес: 30 мл/кг за 30 мин → 70 мл/кг за 2,5 ч",
          "Переоценка каждые 15-30 мин; повтор болюса при шоке",
          "Начать ОРС 5 мл/кг/ч как только ребёнок может пить",
          "Если нет в/в - в/к или НГ 20 мл/кг/ч × 6 ч"
        ]
      }
    ],
    caveats: [
      "WHO - классификация для детей с диареей в условиях LMIC",
      "У младенцев <2 мес и у тяжело недостаточных питанием - корректированный подход (ReSoMal вместо ОРС)",
      "Альтернативные шкалы: Gorelick (10 признаков), CDC, CDS (Clinical Dehydration Scale, Goldman 2008, 4 признака)",
      "CDS: общий вид, глаза, слизистые, слёзы (0-8); 0 = нет, 1-4 = умер., 5-8 = тяж.",
      "У SAM-детей признаки дегидратации могут быть замаскированы - особое ведение"
    ],
    related: [
      {
        id: "imci",
        title: "IMCI"
      },
      {
        id: "holliday-segar",
        title: "Holliday-Segar"
      },
      {
        id: "broselow",
        title: "Broselow"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "WHO. The Treatment of Diarrhoea: A manual for physicians and other senior health workers. 4th revision, 2005. IMCI guidelines.",
    countries: "Международный (ВОЗ / IMCI)",
    presets: [
      {
        label: "Нет дегидратации",
        values: {
          condition: "0",
          eyes: "0",
          thirst: "0",
          skinPinch: "0"
        }
      },
      {
        label: "Умеренная (Plan B)",
        values: {
          condition: "1",
          eyes: "1",
          thirst: "1",
          skinPinch: "1"
        }
      },
      {
        label: "Тяжёлая (Plan C)",
        values: {
          condition: "2",
          eyes: "2",
          thirst: "2",
          skinPinch: "2"
        }
      }
    ],
    info: "### Для чего используется\n**WHO Plan A/B/C** - классификация степени дегидратации у детей с острой диареей и выбор тактики регидратации. Основа **IMCI** (Integrated Management of Childhood Illness).\n\n### 4 признака оценки\n| Признак | 0 | 1 | 2 |\n|---|---|---|---|\n| Состояние | Бодр, активен | Беспокоен | Вял / без сознания |\n| Глаза | Норма | Запавшие | Очень запавшие |\n| Жажда | Пьёт норм. | Жадно, жаждет | Плохо / не может |\n| Скин-пинч | <1 с | 1-2 с | >2 с |\n\n### Классификация\n| Признаков | Дегидратация | План |\n|---|---|---|\n| 0-1 | Нет | **Plan A** (дом) |\n| ≥2 (умер.) | Умеренная ~6-9% | **Plan B** (ОРС 75 мл/кг × 4 ч) |\n| ≥2 (тяж.) | Тяжёлая ≥10% | **Plan C** (в/в 100 мл/кг) |\n\n### Plan A - домашнее ведение\n- ОРС после каждого жидкого стула: <2 лет 50-100 мл; ≥2 лет 100-200 мл\n- Продолжить грудное вскармливание\n- Цинк 10 мг (<6 мес) / 20 мг (≥6 мес) × 10-14 дней\n\n### Plan B - ОРС\n- **75 мл/кг за 4 ч** (частыми глотками)\n- Переоценка через 4 ч\n- Если рвота - пауза 10 мин\n\n### Plan C - в/в\n**Рингер-лактат 100 мл/кг**:\n| Возраст | Первые 30 мин / 1 ч | Следующие 2,5 ч / 5 ч |\n|---|---|---|\n| <12 мес | 30 мл/кг за 1 ч | 70 мл/кг за 5 ч |\n| ≥12 мес | 30 мл/кг за 30 мин | 70 мл/кг за 2,5 ч |\n\nЕсли нет в/в доступа - интракостный / назогастральный 20 мл/кг/ч × 6 ч.\n\n### Альтернативные шкалы\n- **Gorelick (10 признаков)**: ≥3 - ≥5%; ≥7 - ≥10%\n- **CDC**: mild <5%, moderate 6-9%, severe ≥10%\n- **CDS (Goldman 2008)**: 4 признака (общ. вид, глаза, слизист., слёзы); 0 нет, 1-4 умер., 5-8 тяж.\n\n### Ограничения\n- У детей с SAM (тяжёлая недостаточность питания) - **ReSoMal** и ограниченные объёмы (боязнь ОСН)\n- Признаки у младенцев и страдающих SAM менее специфичны\n- В развитых странах чаще используют CDS / Gorelick\n\n### Источник\nWHO. *The Treatment of Diarrhoea* 4th revision, 2005. IMCI handbook."
  };

export default runner;
