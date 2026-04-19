// @ts-nocheck
/**
 * Runner: glim
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
    maxScore: 6,
    inputs: [
      {
        id: "screen",
        label: "Шаг 1: положительный скрининг (MUST/NRS-2002/MNA-SF)",
        type: "checkbox",
        points: 0
      },
      {
        id: "ph_wl_mod",
        label: "Фенотип: потеря веса 5–10 % за 6 мес ИЛИ 10–20 % за > 6 мес (умеренно)",
        type: "checkbox",
        points: 1
      },
      {
        id: "ph_wl_sev",
        label: "Фенотип: потеря веса > 10 % за 6 мес ИЛИ > 20 % за > 6 мес (тяжело)",
        type: "checkbox",
        points: 2
      },
      {
        id: "ph_bmi_mod",
        label: "Фенотип: ИМТ < 20 (< 70 лет) или < 22 (≥ 70 лет) — умеренно",
        type: "checkbox",
        points: 1
      },
      {
        id: "ph_bmi_sev",
        label: "Фенотип: ИМТ < 18,5 (< 70 лет) или < 20 (≥ 70 лет) — тяжело",
        type: "checkbox",
        points: 2
      },
      {
        id: "ph_muscle",
        label: "Фенотип: снижение мышечной массы (DXA, BIA, CT, окружность плеча/голени)",
        type: "checkbox",
        points: 1
      },
      {
        id: "et_intake",
        label: "Этиология: снижение приёма пищи ≤ 50 % > 1 недели ИЛИ любое снижение > 2 недель ИЛИ нарушение всасывания",
        type: "checkbox",
        points: 0
      },
      {
        id: "et_inflam",
        label: "Этиология: воспаление (острое заболевание/травма ИЛИ хроническое заболевание)",
        type: "checkbox",
        points: 0
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "Нет диагноза недоедания",
        color: "#22C55E",
        description: "Критерии GLIM не выполнены.",
        details: "Для диагноза нужен (1) положительный скрининг + (2) минимум 1 фенотипический + (3) минимум 1 этиологический критерий.",
        actions: [
          "Повторный скрининг по графику",
          "Документировать вес и ИМТ"
        ]
      },
      {
        min: 1,
        max: 1,
        label: "Недоедание Stage 1 — умеренное",
        color: "#F59E0B",
        description: "Умеренное недоедание (тяжесть определяется фенотипом).",
        details: "Фенотипический порог умеренный: потеря 5–10 % за 6 мес, ИМТ < 20 (< 70 лет) / < 22 (≥ 70 лет), лёгкое снижение мышц.",
        actions: [
          "Консультация диетолога",
          "Цель: 25–30 ккал/кг/сут, белок 1,0–1,2 г/кг/сут (1,2–1,5 при воспалении)",
          "ONS, обогащение рациона",
          "Коррекция этиологии (воспаление, приём пищи)",
          "Переоценка через 4 недели"
        ]
      },
      {
        min: 2,
        max: 6,
        label: "Недоедание Stage 2 — тяжёлое",
        color: "#EF4444",
        description: "Тяжёлое недоедание (тяжёлый фенотипический критерий).",
        details: "Потеря > 10 % за 6 мес / > 20 % за > 6 мес, ИМТ < 18,5 (< 70 лет) / < 20 (≥ 70 лет), выраженная потеря мышечной массы.",
        actions: [
          "Агрессивная нутритивная поддержка (мультидисциплинарно)",
          "Цель: 30 ккал/кг/сут, белок 1,2–1,5 г/кг/сут",
          "ONS → энтеральное → парентеральное по показаниям",
          "Строгий мониторинг refeeding первые 4–7 дней",
          "Лечение основного заболевания/воспаления",
          "Еженедельная переоценка"
        ]
      }
    ],
    caveats: [
      "GLIM — диагностический инструмент (с 2019 г.), не скрининговый; шаг 1 — скрининг (MUST/NRS/MNA)",
      "Нужен ≥ 1 фенотипический + ≥ 1 этиологический критерий",
      "Тяжесть (Stage 1/2) определяется только по фенотипу",
      "Оценка мышечной массы требует DXA/BIA/CT или антропометрии (окружность плеча/голени)",
      "Воспаление: CRP, клинический контекст (сепсис, онко, ХОБЛ, ХСН, ХБП)"
    ],
    related: [
      {
        id: "must",
        title: "MUST"
      },
      {
        id: "nrs2002",
        title: "NRS-2002"
      },
      {
        id: "sga",
        title: "SGA"
      }
    ],
    relatedCourses: [
      {
        id: "202.3",
        title: "Метаболизм"
      },
      {
        id: "301.3",
        title: "Гастроэнтерология"
      },
      {
        id: "202.5",
        title: "Клиническая биохимия"
      }
    ],
    reference: "Cederholm T, Jensen GL, Correia MITD et al. GLIM criteria for the diagnosis of malnutrition — a consensus report from the global clinical nutrition community. Clin Nutr 2019; 38:1–9.",
    countries: "Международный (ESPEN · ASPEN · FELANPE · PENSA)",
    presets: [
      {
        label: "Нет недоедания",
        values: {
          screen: false,
          ph_wl_mod: false,
          ph_wl_sev: false,
          ph_bmi_mod: false,
          ph_bmi_sev: false,
          ph_muscle: false,
          et_intake: false,
          et_inflam: false
        }
      },
      {
        label: "Stage 1 (умеренное)",
        values: {
          screen: true,
          ph_wl_mod: true,
          ph_wl_sev: false,
          ph_bmi_mod: false,
          ph_bmi_sev: false,
          ph_muscle: false,
          et_intake: true,
          et_inflam: false
        }
      },
      {
        label: "Stage 2 (тяжёлое)",
        values: {
          screen: true,
          ph_wl_mod: false,
          ph_wl_sev: true,
          ph_bmi_mod: false,
          ph_bmi_sev: true,
          ph_muscle: true,
          et_intake: true,
          et_inflam: true
        }
      }
    ],
    info: "### Для чего используется\n**GLIM criteria** — международный консенсусный (ESPEN · ASPEN · FELANPE · PENSA, 2019) диагностический алгоритм недоедания. Унифицирует терминологию и облегчает сопоставимость исследований.\n\n### Двухшаговый алгоритм\n**Шаг 1. Скрининг** — MUST, NRS-2002, MNA-SF или локальный валидированный инструмент.\n\n**Шаг 2. Диагностика** — нужен минимум 1 фенотипический + 1 этиологический критерий.\n\n### Фенотипические критерии\n| Критерий | Умеренно (Stage 1) | Тяжело (Stage 2) |\n|---|---|---|\n| Непреднамеренная потеря веса | 5–10 % за 6 мес / 10–20 % > 6 мес | > 10 % за 6 мес / > 20 % > 6 мес |\n| Низкий ИМТ | < 20 (< 70 лет) / < 22 (≥ 70 лет) | < 18,5 (< 70 лет) / < 20 (≥ 70 лет) |\n| Снижение мышечной массы | Лёгкий/умеренный дефицит | Тяжёлый дефицит |\n\n### Этиологические критерии\n| Критерий | Описание |\n|---|---|\n| Снижение приёма пищи / всасывания | ≤ 50 % от потребности > 1 нед ИЛИ любое снижение > 2 нед ИЛИ мальабсорбция |\n| Воспаление | Острое (травма, инфекция) ИЛИ хроническое (онко, ХСН, ХОБЛ, ХБП, ревматологическое) |\n\n### Стадирование тяжести\n- **Stage 1 — умеренное** — только умеренные фенотипические пороги\n- **Stage 2 — тяжёлое** — любой тяжёлый фенотипический критерий\n\n### Ограничения\n- Только после положительного скрининга\n- Оценка мышечной массы требует методов (DXA/BIA/CT/антропометрия)\n- Не заменяет SGA/PG-SGA в онкологии\n\n### Тактика\n- **Stage 1** — 25–30 ккал/кг, белок 1,0–1,2 г/кг (1,2–1,5 при воспалении)\n- **Stage 2** — 30 ккал/кг, белок 1,2–1,5 г/кг, refeeding-мониторинг, мультидисциплинарно\n\n### Источник\nCederholm T et al. *Clin Nutr* 2019; 38:1–9. Jensen GL et al. *JPEN* 2019; 43:32–40."
  };

export default runner;
