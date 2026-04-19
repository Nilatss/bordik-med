// @ts-nocheck
/**
 * Runner: framingham-hf
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
    maxScore: 23,
    inputs: [
      {
        id: "pnd",
        label: "Пароксизмальная ночная одышка / ортопноэ (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "jvd",
        label: "Набухание шейных вен (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "rales",
        label: "Влажные хрипы (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "cmegaly",
        label: "Кардиомегалия на рентгене (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "pul_ed",
        label: "Острый отёк лёгких (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "s3",
        label: "S3 галоп (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "cvp",
        label: "ЦВД > 16 см вод.ст. (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "weight",
        label: "Потеря ≥ 4,5 кг за 5 дней на диуретике (major)",
        type: "checkbox",
        points: 2
      },
      {
        id: "edema",
        label: "Двусторонние отёки голеней (minor)",
        type: "checkbox",
        points: 1
      },
      {
        id: "cough",
        label: "Ночной кашель (minor)",
        type: "checkbox",
        points: 1
      },
      {
        id: "doe",
        label: "Одышка при нагрузке (minor)",
        type: "checkbox",
        points: 1
      },
      {
        id: "hepat",
        label: "Гепатомегалия (minor)",
        type: "checkbox",
        points: 1
      },
      {
        id: "pleur",
        label: "Плевральный выпот (minor)",
        type: "checkbox",
        points: 1
      },
      {
        id: "vc",
        label: "ЖЕЛ < 70 % от должной (minor)",
        type: "checkbox",
        points: 1
      },
      {
        id: "hr",
        label: "ЧСС ≥ 120 (minor)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "Недостаточно критериев",
        color: "#22C55E",
        description: "Диагноз ХСН не подтверждён по Framingham.",
        actions: [
          "Исключить альтернативы (ХОБЛ, анемия, ТЭЛА)",
          "NT-proBNP / BNP",
          "ЭхоКГ при сохраняющемся подозрении"
        ]
      },
      {
        min: 3,
        max: 23,
        label: "Критерии ХСН выполнены",
        color: "#EF4444",
        description: "2 major или 1 major + 2 minor (≥ 3 баллов при корректном подсчёте) = ХСН.",
        details: "Чувствительность ~ 97 %, специфичность ~ 79 % (Senni 1998). Работают у всех EF-фенотипов. Подтверждающий тест — ЭхоКГ + NT-proBNP.",
        actions: [
          "NT-proBNP / BNP для подтверждения",
          "ЭхоКГ: EF, структурные изменения",
          "Определение этиологии (ИБС, АГ, клапанная, кардиомиопатия)",
          "GDMT по стадии ACC/AHA + фенотипу EF"
        ]
      }
    ],
    reference: "McKee PA et al. NEJM 1971;285:1441. Валидация Senni M. Circulation 1998;98:2282.",
    countries: "Международный",
    caveats: [
      "Для диагноза: 2 major ИЛИ 1 major + 2 minor (балльная сумма — упрощение)",
      "Minor критерий засчитывается только если не объясняется альтернативой (ХОБЛ, ХПН, цирроз)",
      "Не учитывает NT-proBNP и ЭхоКГ (современные ESC-критерии это включают)",
      "Разработан в эпоху до ЭхоКГ — сегодня используется как скрининг + ESC 2021 критерии"
    ],
    related: [
      {
        id: "acc-aha-hf",
        title: "ACC/AHA стадии HF"
      },
      {
        id: "nt-probnp",
        title: "NT-proBNP"
      },
      {
        id: "nyha",
        title: "NYHA"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    info: "### Для чего используется\n**Framingham criteria (Boston-style)** — клинические критерии диагностики **хронической сердечной недостаточности** на основе анамнеза, осмотра и рентгенограммы. Разработаны до эры ЭхоКГ, но сохраняют чувствительность ~ 97 %.\n\n### Критерии\n**Major (2 балла каждый):**\n- Пароксизмальная ночная одышка / ортопноэ\n- Набухание шейных вен (JVD)\n- Влажные хрипы в лёгких\n- Кардиомегалия на рентгене грудной клетки\n- Острый отёк лёгких\n- S3 галоп\n- ЦВД > 16 см Н₂O\n- Потеря массы ≥ 4,5 кг за 5 дней на фоне диуретика\n\n**Minor (1 балл каждый):**\n- Двусторонние отёки голеней\n- Ночной кашель\n- Одышка при физической нагрузке\n- Гепатомегалия\n- Плевральный выпот\n- ЖЕЛ < 70 % от должной\n- ЧСС ≥ 120/мин\n\n### Интерпретация\nДиагноз **ХСН** выставляется при:\n- **2 major** критериях **ИЛИ**\n- **1 major + 2 minor** критериях\n\n### Ограничения\n- Minor критерий не засчитывается, если есть альтернативное объяснение (ХОБЛ даёт хрипы, цирроз — отёки)\n- Чувствительность выше, чем специфичность (97 % vs 79 %)\n- Не использует биомаркеры и ЭхоКГ — для современной диагностики см. ESC 2021 HF Guidelines\n\n### Тактика\n- Диагноз подтверждён → NT-proBNP + ЭхоКГ\n- Далее: определение этиологии и фенотипа EF (HFrEF / HFmrEF / HFpEF)\n- GDMT по стадии ACC/AHA и фенотипу\n\n### Источник\nMcKee PA, Castelli WP, McNamara PM, Kannel WB. The natural history of congestive heart failure: the Framingham study. *N Engl J Med* 1971;285:1441–1446.\nSenni M et al. Congestive heart failure in the community. *Circulation* 1998;98:2282–2289."
  };

export default runner;
