// @ts-nocheck
/**
 * Runner: h2fpef
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
    maxScore: 9,
    inputs: [
      {
        id: "heavy",
        label: "Heavy — ИМТ > 30 кг/м²",
        type: "checkbox",
        points: 2
      },
      {
        id: "htn",
        label: "Hypertensive — ≥ 2 антигипертензивных",
        type: "checkbox",
        points: 1
      },
      {
        id: "af",
        label: "Фибрилляция предсердий (пароксиз. или персист.)",
        type: "checkbox",
        points: 3
      },
      {
        id: "ph",
        label: "Pulmonary HTN — PASP > 35 мм рт.ст. по ЭхоКГ",
        type: "checkbox",
        points: 1
      },
      {
        id: "elderly",
        label: "Elder — возраст > 60 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "filling",
        label: "Filling — E/e′ > 9 по ЭхоКГ",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0–1 (HFpEF маловероятна)",
        color: "#22C55E",
        description: "Вероятность HFpEF < 25 %. Искать внесердечные причины одышки.",
        actions: [
          "Исключить ХОБЛ/астму (FEV1/FVC, DLCO)",
          "Анемия, гипотиреоз, ожирение",
          "Детренированность",
          "NT-proBNP как подтверждающий тест"
        ]
      },
      {
        min: 2,
        max: 5,
        label: "2–5 (промежуточная)",
        color: "#F59E0B",
        description: "Вероятность 25–80 %. Нужно дополнительное обследование.",
        actions: [
          "NT-proBNP / BNP",
          "Стресс-ЭхоКГ или диастолический стресс-тест",
          "Катетеризация правых отделов (gold standard)",
          "Рассмотреть HFA-PEFF алгоритм ESC"
        ]
      },
      {
        min: 6,
        max: 9,
        label: "≥ 6 (HFpEF вероятна)",
        color: "#EF4444",
        description: "Вероятность HFpEF > 90 %. Диагноз подтверждён клинически.",
        details: "Reddy et al. 2018: при H2FPEF ≥ 6 диагноз HFpEF подтверждается инвазивно (↑ PCWP) у > 90 % пациентов.",
        actions: [
          "SGLT2 ингибиторы (дапа/эмпа) — I класс для HFpEF (EMPEROR-Preserved, DELIVER)",
          "Петлевой диуретик при застое",
          "Контроль АД (иАПФ/АРА/АРНИ)",
          "Контроль ЧСС при ФП, рассмотреть катетерную аблацию",
          "Лечение ожирения (диета + GLP-1 — STEP-HFpEF)"
        ]
      }
    ],
    reference: "Reddy YNV et al. A simple, evidence-based approach to help guide diagnosis of HFpEF. Circulation 2018;138:861–870.",
    countries: "Международный",
    caveats: [
      "Требует ЭхоКГ с доплером (PASP, E/e′)",
      "Низкая прогностическая ценность у пациентов с крайне высоким ИМТ (> 40) — ЭхоКГ затруднена",
      "Альтернатива — HFA-PEFF (ESC 2019) с NT-proBNP + функциональными критериями",
      "Не применять при EF ≤ 40 % (HFrEF/HFmrEF — другая шкала)"
    ],
    related: [
      {
        id: "nt-probnp",
        title: "NT-proBNP"
      },
      {
        id: "acc-aha-hf",
        title: "ACC/AHA стадии HF"
      },
      {
        id: "framingham-hf",
        title: "Framingham HF"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    info: "### Для чего используется\n**H2FPEF score** — оценка вероятности **HFpEF (heart failure with preserved ejection fraction)** у пациентов с одышкой и сохранённой ФВ ЛЖ. Валидирован против инвазивного gold standard (PCWP при нагрузке).\n\n### Критерии (макс. 9)\n| Домен | Критерий | Баллы |\n|---|---|---|\n| **H**eavy | ИМТ > 30 | 2 |\n| **H**ypertensive | ≥ 2 антигипертензивных | 1 |\n| **F**ibrillation | Любая ФП (паро/перс) | 3 |\n| **P**ulm. HTN | PASP > 35 мм рт.ст. ЭхоКГ | 1 |\n| **E**lder | Возраст > 60 | 1 |\n| **F**illing pr. | E/e′ > 9 | 1 |\n\n### Интерпретация\n| Баллы | Вероятность HFpEF |\n|---|---|\n| 0–1 | < 25 % (маловероятна) |\n| 2–5 | 25–80 % (неопределённая) |\n| 6–9 | > 90 % (вероятна) |\n\n### Ограничения\n- Требует ЭхоКГ с доплером (PASP, E/e′)\n- Не применим при EF ≤ 40 %\n- HFA-PEFF (ESC 2019) — альтернативный алгоритм с большей опорой на биомаркеры\n\n### Тактика\n- **Низкая вероятность** — искать внесердечные причины (ХОБЛ, ожирение, детрен.)\n- **Средняя** — NT-proBNP + стресс-ЭхоКГ / катетеризация\n- **Высокая** — диагноз HFpEF, терапия: SGLT2i + диуретики + контроль АД, ФП, ожирения\n\n### Источник\nReddy YNV, Carter RE, Obokata M, Redfield MM, Borlaug BA. A simple, evidence-based approach to help guide diagnosis of heart failure with preserved ejection fraction. *Circulation* 2018;138:861–870."
  };

export default runner;
