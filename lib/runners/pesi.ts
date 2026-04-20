// @ts-nocheck
/**
 * Runner: pesi
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
    maxScore: 300,
    inputs: [
      {
        id: "variant",
        label: "Вариант",
        type: "select",
        options: [
          {
            value: "spesi",
            label: "sPESI (упрощённая, 6 пунктов × 1)",
            points: 0
          },
          {
            value: "pesi",
            label: "PESI (оригинальная, 11 пунктов)",
            points: 0
          }
        ]
      },
      {
        id: "age80",
        label: "sPESI: Возраст > 80 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "cancer_s",
        label: "sPESI: Онкология",
        type: "checkbox",
        points: 1
      },
      {
        id: "cardiopulm",
        label: "sPESI: ХСН / хроническое лёгочное",
        type: "checkbox",
        points: 1
      },
      {
        id: "hr110_s",
        label: "sPESI: ЧСС ≥ 110",
        type: "checkbox",
        points: 1
      },
      {
        id: "sbp100_s",
        label: "sPESI: САД < 100",
        type: "checkbox",
        points: 1
      },
      {
        id: "spo2_s",
        label: "sPESI: SpO₂ < 90 %",
        type: "checkbox",
        points: 1
      },
      {
        id: "age_years",
        label: "PESI: Возраст (= баллы)",
        type: "number",
        unit: "лет",
        min: 0,
        max: 120,
        step: 1,
        quickValues: [
          40,
          60,
          70,
          80,
          90
        ]
      },
      {
        id: "male",
        label: "PESI: Мужской пол (+10)",
        type: "checkbox",
        points: 10
      },
      {
        id: "cancer_p",
        label: "PESI: Онкология (+30)",
        type: "checkbox",
        points: 30
      },
      {
        id: "hf_p",
        label: "PESI: ХСН (+10)",
        type: "checkbox",
        points: 10
      },
      {
        id: "lung_p",
        label: "PESI: Хроническое лёгочное (+10)",
        type: "checkbox",
        points: 10
      },
      {
        id: "hr110_p",
        label: "PESI: ЧСС ≥ 110 (+20)",
        type: "checkbox",
        points: 20
      },
      {
        id: "sbp100_p",
        label: "PESI: САД < 100 (+30)",
        type: "checkbox",
        points: 30
      },
      {
        id: "rr30",
        label: "PESI: ЧДД ≥ 30 (+20)",
        type: "checkbox",
        points: 20
      },
      {
        id: "temp36",
        label: "PESI: T < 36 °C (+20)",
        type: "checkbox",
        points: 20
      },
      {
        id: "mental",
        label: "PESI: Нарушение сознания (+60)",
        type: "checkbox",
        points: 60
      },
      {
        id: "spo2_p",
        label: "PESI: SpO₂ < 90 % (+20)",
        type: "checkbox",
        points: 20
      }
    ],
    bands: [
      {
        min: 0,
        max: 65,
        label: "Класс I / sPESI 0 - очень низкий",
        color: "#22C55E",
        description: "PESI I (≤ 65): 30-дн смертность 0-1,6 %. sPESI 0: < 1 %. Амбулаторное лечение возможно.",
        details: "При PESI I или sPESI 0 + отсутствии ПЖ-дисфункции и нормальном тропонине - амбулаторное лечение DOAC (ESC 2019 IIa).",
        actions: [
          "Амбулаторное лечение DOAC: апиксабан 10 мг × 2 / 7 дн → 5 мг × 2; ривароксабан 15 мг × 2 / 21 дн → 20 мг",
          "ЭхоКГ для оценки ПЖ",
          "Тропонин, BNP/NT-proBNP"
        ]
      },
      {
        min: 66,
        max: 85,
        label: "Класс II - низкий",
        color: "#84CC16",
        description: "PESI II: 30-дн смертность 1,7-3,5 %.",
        details: "Низкий риск. Стационарное наблюдение или ранняя выписка с антикоагуляцией при низком sPESI и отсутствии маркеров ПЖ-перегрузки.",
        actions: [
          "Стационар / ранняя выписка",
          "DOAC",
          "ЭхоКГ + тропонин"
        ]
      },
      {
        min: 86,
        max: 105,
        label: "Класс III - промежуточный",
        color: "#F59E0B",
        description: "PESI III: 30-дн смертность 3,2-7,1 %.",
        details: "Промежуточный риск. Если ПЖ-дисфункция + ↑тропонин - intermediate-high, наблюдение в ICU.",
        actions: [
          "Стационар",
          "ЭхоКГ: дисфункция ПЖ?",
          "Тропонин, BNP",
          "При intermediate-high - мониторинг в ICU, готовность к тромболизису"
        ]
      },
      {
        min: 106,
        max: 125,
        label: "Класс IV - высокий",
        color: "#EF4444",
        description: "PESI IV: 30-дн смертность 4,0-11,4 %.",
        details: "Высокая смертность. Мониторинг в ICU, при декомпенсации - rescue тромболизис.",
        actions: [
          "ICU",
          "Системная антикоагуляция (UFH/LMWH)",
          "Готовность к тромболизису / эмболэктомии"
        ]
      },
      {
        min: 126,
        max: 300,
        label: "Класс V - очень высокий",
        color: "#991B1B",
        description: "PESI V: 30-дн смертность 10-24,5 %.",
        details: "Очень высокая смертность. Рассмотреть тромболизис при гемодинамической нестабильности, ЭКМО при массивной ТЭЛА с шоком.",
        actions: [
          "ICU немедленно",
          "При шоке / САД < 90 - альтеплаза 100 мг за 2 ч",
          "Катетерная / хирургическая эмболэктомия",
          "Рассмотреть ЭКМО"
        ]
      }
    ],
    caveats: [
      "PESI валидирован для 30-дневной смертности, не для ПЖ-дисфункции",
      "sPESI проще, но менее дискриминативна по классам - используется как бинарный инструмент (0 / ≥ 1)",
      "Низкий PESI + ПЖ-дисфункция + ↑тропонин - всё равно intermediate-high (ESC 2019) - PESI не заменяет ЭхоКГ",
      "Не применяется у нестабильных пациентов (шок, СЛР) - они автоматически в категории высокого риска"
    ],
    related: [
      {
        id: "wells-pe",
        title: "Wells для ТЭЛА"
      },
      {
        id: "geneva",
        title: "Geneva score"
      },
      {
        id: "years",
        title: "YEARS"
      }
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      },
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    countries: "Международный (ESC 2019, AHA 2011)",
    reference: "Aujesky D et al. Am J Respir Crit Care Med 2005; 172:1041-6 (PESI). Jiménez D et al. Arch Intern Med 2010; 170:1383-9 (sPESI).",
    presets: [
      {
        label: "sPESI 0 (низкий)",
        values: {
          variant: "spesi",
          age80: false,
          cancer_s: false,
          cardiopulm: false,
          hr110_s: false,
          sbp100_s: false,
          spo2_s: false
        }
      },
      {
        label: "sPESI ≥ 1 (не низкий)",
        values: {
          variant: "spesi",
          age80: false,
          cancer_s: false,
          cardiopulm: false,
          hr110_s: true,
          sbp100_s: false,
          spo2_s: false
        }
      },
      {
        label: "PESI класс III",
        values: {
          variant: "pesi",
          age_years: 70,
          male: true,
          hr110_p: true
        }
      }
    ],
    info: "### Для чего используется\n**PESI / sPESI** - валидированные прогностические шкалы **30-дневной смертности при подтверждённой ТЭЛА**. Используются для выбора места лечения (амбулаторное/стационар/ICU) и решения о репер­фузионной терапии.\n\n### PESI (Aujesky 2005) - 11 пунктов\n| Фактор | Баллы |\n|---|---|\n| Возраст | = возраст в годах |\n| Мужской пол | +10 |\n| Онкология | +30 |\n| ХСН | +10 |\n| Хроническое лёгочное | +10 |\n| ЧСС ≥ 110 | +20 |\n| САД < 100 | +30 |\n| ЧДД ≥ 30 | +20 |\n| T < 36 °C | +20 |\n| Нарушение сознания | +60 |\n| SpO₂ < 90 % | +20 |\n\n### Классы PESI (30-дн смертность)\n| Класс | Баллы | Смертность |\n|---|---|---|\n| I | ≤ 65 | 0-1,6 % |\n| II | 66-85 | 1,7-3,5 % |\n| III | 86-105 | 3,2-7,1 % |\n| IV | 106-125 | 4,0-11,4 % |\n| V | > 125 | 10-24,5 % |\n\n### sPESI (Jiménez 2010) - 6 пунктов × 1 балл\n- Возраст > 80\n- Онкология\n- ХСН / хроническое лёгочное\n- ЧСС ≥ 110\n- САД < 100\n- SpO₂ < 90 %\n\n| sPESI | Риск |\n|---|---|\n| 0 | Низкий (< 1 % 30-дн) |\n| ≥ 1 | Не низкий (~ 11 %) |\n\n### Стратификация риска (ESC 2019)\n| Категория | PESI / sPESI | ПЖ-дисфункция | Тропонин |\n|---|---|---|---|\n| Высокий (шок) | - | Да | Да |\n| Intermediate-high | III-V или sPESI ≥ 1 | Да | Да |\n| Intermediate-low | III-V или sPESI ≥ 1 | Одно из двух | - |\n| Низкий | I-II или sPESI 0 | Нет | Норма |\n\n### Тактика\n- **Низкий** → амбулаторное DOAC (ESC IIa, HESTIA критерии)\n- **Intermediate-low** → стационар, антикоагуляция\n- **Intermediate-high** → ICU, готовность к rescue-тромболизису\n- **Высокий** → системный тромболизис (альтеплаза 100 мг/2 ч) или эмболэктомия\n\n### Ограничения\n- PESI не заменяет ЭхоКГ / тропонин для оценки ПЖ\n- При шоке автоматически высокий риск - шкалу не считать\n- HESTIA критерии - альтернатива для амбулаторного лечения"
  };

export default runner;
