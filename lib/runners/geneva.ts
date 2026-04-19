// @ts-nocheck
/**
 * Runner: geneva
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
    maxScore: 25,
    inputs: [
      {
        id: "variant",
        label: "Вариант шкалы",
        type: "select",
        options: [
          {
            value: "revised",
            label: "Revised (Le Gal 2006, 0–25)",
            points: 0
          },
          {
            value: "simplified",
            label: "Simplified (Klok 2008, 0–8)",
            points: 0
          }
        ]
      },
      {
        id: "age",
        label: "Возраст > 65 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "prev",
        label: "ТГВ / ТЭЛА в анамнезе",
        type: "select",
        options: [
          {
            value: "no",
            label: "Нет",
            points: 0
          },
          {
            value: "yes_rev",
            label: "Есть (revised: 3 балла)",
            points: 3
          },
          {
            value: "yes_simp",
            label: "Есть (simplified: 1 балл)",
            points: 1
          }
        ]
      },
      {
        id: "surg",
        label: "Операция под общим наркозом / перелом нижней конечности < 1 мес",
        type: "select",
        options: [
          {
            value: "no",
            label: "Нет",
            points: 0
          },
          {
            value: "yes_rev",
            label: "Да (revised: 2 балла)",
            points: 2
          },
          {
            value: "yes_simp",
            label: "Да (simplified: 1 балл)",
            points: 1
          }
        ]
      },
      {
        id: "cancer",
        label: "Активная онкология (лечение или <1 года ремиссии)",
        type: "select",
        options: [
          {
            value: "no",
            label: "Нет",
            points: 0
          },
          {
            value: "yes_rev",
            label: "Да (revised: 2 балла)",
            points: 2
          },
          {
            value: "yes_simp",
            label: "Да (simplified: 1 балл)",
            points: 1
          }
        ]
      },
      {
        id: "leg",
        label: "Односторонняя боль в нижней конечности",
        type: "select",
        options: [
          {
            value: "no",
            label: "Нет",
            points: 0
          },
          {
            value: "yes_rev",
            label: "Да (revised: 3 балла)",
            points: 3
          },
          {
            value: "yes_simp",
            label: "Да (simplified: 1 балл)",
            points: 1
          }
        ]
      },
      {
        id: "hemo",
        label: "Кровохаркание",
        type: "select",
        options: [
          {
            value: "no",
            label: "Нет",
            points: 0
          },
          {
            value: "yes_rev",
            label: "Да (revised: 2 балла)",
            points: 2
          },
          {
            value: "yes_simp",
            label: "Да (simplified: 1 балл)",
            points: 1
          }
        ]
      },
      {
        id: "hr",
        label: "ЧСС",
        type: "select",
        options: [
          {
            value: "lt75",
            label: "< 75",
            points: 0
          },
          {
            value: "75_94_rev",
            label: "75–94 (revised: 3)",
            points: 3
          },
          {
            value: "75_94_simp",
            label: "75–94 (simplified: 1)",
            points: 1
          },
          {
            value: "ge95_rev",
            label: "≥ 95 (revised: 5)",
            points: 5
          },
          {
            value: "ge95_simp",
            label: "≥ 95 (simplified: 2)",
            points: 2
          }
        ]
      },
      {
        id: "palp",
        label: "Болезненность при пальпации глубоких вен + односторонний отёк",
        type: "select",
        options: [
          {
            value: "no",
            label: "Нет",
            points: 0
          },
          {
            value: "yes_rev",
            label: "Да (revised: 4 балла)",
            points: 4
          },
          {
            value: "yes_simp",
            label: "Да (simplified: 1 балл)",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "Низкая вероятность",
        color: "#22C55E",
        description: "Revised: 0–3 (~8 %). Simplified: 0–1 (~8 %). D-димер для исключения.",
        details: "При низкой вероятности высокочувствительный D-димер с возрастной коррекцией (> 50 лет: возраст × 10 нг/мл) безопасно исключает ТЭЛА.",
        actions: [
          "Высокочувствительный D-димер (age-adjusted cutoff)",
          "При отрицательном — ТЭЛА исключена",
          "При положительном — КТ-ангиография лёгких"
        ]
      },
      {
        min: 4,
        max: 10,
        label: "Умеренная вероятность",
        color: "#F59E0B",
        description: "Revised: 4–10 (~29 %). Simplified: 2–4 (~29 %). D-димер / КТ-ангио.",
        details: "При умеренной вероятности допустим D-димер (алгоритм PEGeD: cutoff 1000 нг/мл при умеренной, 500 при низкой) либо сразу КТ-ангио."
      },
      {
        min: 11,
        max: 25,
        label: "Высокая вероятность",
        color: "#EF4444",
        description: "Revised: ≥ 11 (~64 %). Simplified: ≥ 5 (~64 %). КТ-ангио сразу.",
        details: "При высокой вероятности D-димер не делается — сразу КТ-ангиография лёгких. При нестабильной гемодинамике — прикроватная ЭхоКГ.",
        actions: [
          "КТ-ангиография лёгких немедленно",
          "ЭхоКГ при нестабильности (дисфункция ПЖ)",
          "Эмпирическая антикоагуляция до визуализации",
          "При шоке — тромболизис / эмболэктомия"
        ]
      }
    ],
    caveats: [
      "Geneva — полностью объективная шкала (без пункта «альтернативный диагноз»), удобна при неопытном клиницисте",
      "Не валидизирована у беременных — использовать pregnancy-adapted алгоритм (YEARS)",
      "Simplified версия (Klok 2008) имеет сопоставимую точность, но проще в клинической работе",
      "При нестабильной гемодинамике — не считать балл, идти напрямую к ЭхоКГ/КТ"
    ],
    related: [
      {
        id: "wells-pe",
        title: "Wells для ТЭЛА"
      },
      {
        id: "years",
        title: "YEARS алгоритм"
      },
      {
        id: "pesi",
        title: "PESI / sPESI"
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
    countries: "Международный (ESC 2019)",
    reference: "Le Gal G et al. Ann Intern Med 2006 (revised Geneva). Klok FA et al. Arch Intern Med 2008 (simplified Geneva).",
    presets: [
      {
        label: "Низкая (revised)",
        values: {
          variant: "revised",
          age: false,
          prev: "no",
          surg: "no",
          cancer: "no",
          leg: "no",
          hemo: "no",
          hr: "lt75",
          palp: "no"
        }
      },
      {
        label: "Умеренная (revised)",
        values: {
          variant: "revised",
          age: true,
          prev: "no",
          surg: "no",
          cancer: "no",
          leg: "yes_rev",
          hemo: "no",
          hr: "75_94_rev",
          palp: "no"
        }
      },
      {
        label: "Высокая (revised)",
        values: {
          variant: "revised",
          age: true,
          prev: "yes_rev",
          surg: "yes_rev",
          cancer: "no",
          leg: "yes_rev",
          hemo: "no",
          hr: "ge95_rev",
          palp: "no"
        }
      }
    ],
    info: "### Для чего используется\n**Geneva score** — клиническая оценка **предтестовой вероятности ТЭЛА**, альтернатива Wells. Полностью объективна: нет субъективного пункта «альтернативный диагноз менее вероятен».\n\n### Компоненты (Revised, Le Gal 2006)\n| Критерий | Баллы |\n|---|---|\n| Возраст > 65 | 1 |\n| ТГВ/ТЭЛА в анамнезе | 3 |\n| Операция / перелом ноги < 1 мес | 2 |\n| Активная онкология | 2 |\n| Односторонняя боль в ноге | 3 |\n| Кровохаркание | 2 |\n| ЧСС 75–94 | 3 |\n| ЧСС ≥ 95 | 5 |\n| Боль при пальпации + отёк одной ноги | 4 |\n\n### Интерпретация (revised)\n| Баллы | Вероятность | Частота ТЭЛА |\n|---|---|---|\n| 0–3 | Низкая | ~ 8 % |\n| 4–10 | Умеренная | ~ 29 % |\n| ≥ 11 | Высокая | ~ 64 % |\n\n### Simplified Geneva (Klok 2008)\nКаждый пункт × 1 балл, ЧСС ≥ 95 — 2 балла. Max 8.\n- 0–1 — низкая, 2–4 — умеренная, ≥ 5 — высокая\n- Двухуровневая: ≤ 2 — маловероятна, ≥ 3 — вероятна\n\n### Алгоритм (ESC 2019)\n1. Нестабильность → КТ-ангио / ЭхоКГ немедленно\n2. Стабилен → Geneva или Wells\n3. Низкая/умеренная → D-димер (age-adjusted) → при + КТ-ангио\n4. Высокая → КТ-ангио сразу\n\n### Ограничения\n- Не валидизирована у беременных\n- У стационарных менее прецизионна\n- Не применять при уже установленном диагнозе ТЭЛА\n\n### Источник\nLe Gal G, Righini M, Roy PM et al. *Ann Intern Med* 2006; 144:165–171.\nKlok FA et al. *Arch Intern Med* 2008; 168:2131–2136."
  };

export default runner;
