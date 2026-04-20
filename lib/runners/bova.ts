// @ts-nocheck
/**
 * Runner: bova
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
    maxScore: 7,
    inputs: [
      {
        id: "hr",
        label: "ЧСС ≥ 110 / мин",
        type: "checkbox",
        points: 1
      },
      {
        id: "sbp",
        label: "САД 90-100 мм рт.ст.",
        type: "checkbox",
        points: 2
      },
      {
        id: "trop",
        label: "Повышенный тропонин",
        type: "checkbox",
        points: 2
      },
      {
        id: "rv",
        label: "Дисфункция ПЖ (ЭхоКГ или КТ)",
        type: "checkbox",
        points: 2
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "Стадия I (низкий)",
        color: "#22C55E",
        description: "30-дн. смертность < 4 %, осложнения < 4 %.",
        actions: [
          "Антикоагуляция: DOAC (апиксабан 10 мг × 2 / 7 дн → 5 мг × 2 или ривароксабан 15 мг × 2 / 21 дн → 20 мг)",
          "Рассмотреть амбулаторное лечение (Hestia / sPESI 0)",
          "Амбулаторный контроль через 1-2 нед"
        ]
      },
      {
        min: 3,
        max: 4,
        label: "Стадия II (промежуточный)",
        color: "#F59E0B",
        description: "30-дн. смертность ~ 10 %, осложнения 20 %.",
        details: "Интермедиат-хай риск по ESC. Пациент гемодинамически стабилен, но есть маркеры ПЖ-дисфункции + некроза - высокий риск декомпенсации.",
        actions: [
          "Госпитализация, мониторинг в ICU/мониторном отделении",
          "Антикоагуляция (гепарин/LMWH, не DOAC в первые часы при нестабильности)",
          "Готовность к rescue-тромболизису при декомпенсации (PEITHO)",
          "Рассмотреть катетер-направленный тромболизис (USAT) или механическую тромбэктомию"
        ]
      },
      {
        min: 5,
        max: 7,
        label: "Стадия III (высокий)",
        color: "#EF4444",
        description: "30-дн. смертность > 25 %, осложнения > 40 %.",
        details: "Несмотря на сохранённое АД, - крайне высокий риск гемодинамического коллапса в первые 48 ч.",
        actions: [
          "Госпитализация в ICU",
          "Обсудить первичный тромболизис (альтеплаза 100 мг / 2 ч)",
          "Альтернатива - катетер-направленный тромболизис / тромбэктомия",
          "МДК (реаниматолог + интервенционист + кардиохирург) - PERT team"
        ]
      }
    ],
    reference: "Bova C et al. Eur Respir J 2014;44:694. FAST score - Dellas C. Int J Cardiol 2014;176:1038.",
    countries: "Международный",
    caveats: [
      "Применим только к гемодинамически стабильной ТЭЛА (САД ≥ 90)",
      "Требует тропонина и ЭхоКГ/КТ для оценки ПЖ - ограничение в ED",
      "FAST score (Dellas 2014): H-FABP ≥ 6 нг/мл + ЧСС ≥ 100 + синкопе - альтернативный с биомаркером H-FABP",
      "Не заменяет sPESI для решения об амбулаторном ведении"
    ],
    related: [
      {
        id: "wells-pe",
        title: "Wells (ТЭЛА)"
      },
      {
        id: "pesi",
        title: "PESI / sPESI"
      },
      {
        id: "esc-pe",
        title: "ESC PE 2019"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      },
      {
        id: "301.2",
        title: "Пульмонология"
      }
    ],
    info: "### Для чего используется\n**Bova score** - стратификация **30-дневной смертности и гемодинамических осложнений** у пациентов с **нормотензивной (intermediate-risk) ТЭЛА**. Дополняет sPESI, который хорош для выявления низкого риска, но плохо дискриминирует intermediate-хай и intermediate-лоу.\n\n### Критерии (макс. 7)\n| Параметр | Балл |\n|---|---|\n| ЧСС ≥ 110 /мин | 1 |\n| САД 90-100 мм рт.ст. | 2 |\n| Повышенный тропонин | 2 |\n| Дисфункция ПЖ (ЭхоКГ или КТ) | 2 |\n\n### Интерпретация - стадии\n| Стадия | Баллы | 30-дн. смертность | Осложнения |\n|---|---|---|---|\n| I | 0-2 | < 4 % | < 4 % |\n| II | 3-4 | ~ 10 % | ~ 20 % |\n| III | 5-7 | > 25 % | > 40 % |\n\n### Альтернатива - FAST score (Dellas 2014)\n| Критерий | Балл |\n|---|---|\n| H-FABP ≥ 6 нг/мл | 1,5 |\n| ЧСС ≥ 100 | 2 |\n| Синкопе в дебюте | 1,5 |\n\nFAST ≥ 3 → высокий риск, сопоставимо с Bova III.\n\n### Ограничения\n- Только для гемодинамически стабильной ТЭЛА\n- Требует тропонина + визуализации ПЖ\n- Не применять при шоке/гипотензии (это high-risk по ESC - тромболизис немедленно)\n\n### Тактика\n- **Стадия I** - антикоагуляция, возможно амбулаторно (+ Hestia/sPESI 0)\n- **Стадия II** - госпитализация, мониторинг, готовность к rescue тромболизису\n- **Стадия III** - ICU, обсуждение тромболизиса / катетерной терапии (PERT team)\n\n### Источник\nBova C, Sanchez O, Prandoni P et al. Identification of intermediate-risk patients with acute symptomatic pulmonary embolism. *Eur Respir J* 2014;44:694-703.\nDellas C et al. A novel H-FABP assay and a fast prognostic score for risk assessment of normotensive pulmonary embolism. *Int J Cardiol* 2014;176:1038-1042."
  };

export default runner;
