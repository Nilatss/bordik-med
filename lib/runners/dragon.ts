// @ts-nocheck
/**
 * Runner: dragon
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
    maxScore: 10,
    inputs: [
      {
        id: "dense",
        label: "D — Плотная СМА или ранний инфаркт на КТ",
        type: "select",
        options: [
          {
            value: "0",
            label: "Ни плотной СМА, ни раннего инфаркта",
            points: 0
          },
          {
            value: "1",
            label: "Один из двух",
            points: 1
          },
          {
            value: "2",
            label: "Оба (плотная СМА + ранний инфаркт)",
            points: 2
          }
        ]
      },
      {
        id: "mrs",
        label: "R — premorbid mRS > 1",
        type: "checkbox",
        points: 1
      },
      {
        id: "age",
        label: "A — Возраст",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 65 лет",
            points: 0
          },
          {
            value: "1",
            label: "65–79 лет",
            points: 1
          },
          {
            value: "2",
            label: "≥ 80 лет",
            points: 2
          }
        ]
      },
      {
        id: "glucose",
        label: "G — Глюкоза > 8 ммоль/л (144 мг/дл)",
        type: "checkbox",
        points: 1
      },
      {
        id: "onset",
        label: "O — Onset-to-treatment > 90 мин",
        type: "checkbox",
        points: 1
      },
      {
        id: "nihss",
        label: "N — NIHSS",
        type: "select",
        options: [
          {
            value: "0",
            label: "0–4",
            points: 0
          },
          {
            value: "1",
            label: "5–9",
            points: 1
          },
          {
            value: "2",
            label: "10–15",
            points: 2
          },
          {
            value: "3",
            label: "≥ 16",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0–1 (отличный)",
        color: "#22C55E",
        description: "Хороший исход (mRS 0–2) через 3 мес — 96 %, миз­ерный (mRS 5–6) — 0–2 %.",
        details: "Ожидается хорошее восстановление. Продолжить тромболизис / тромбэктомию по показаниям.",
        actions: [
          "Стандартная терапия инсульта",
          "Ранняя реабилитация",
          "Вторичная профилактика по TOAST"
        ]
      },
      {
        min: 2,
        max: 4,
        label: "2–4 (умеренный)",
        color: "#F59E0B",
        description: "Хороший исход — 60–88 %, мизерный — 2–7 %.",
        details: "Рассмотреть тромбэктомию при LVO; ранняя нейрореабилитация."
      },
      {
        min: 5,
        max: 7,
        label: "5–7 (плохой)",
        color: "#EF4444",
        description: "Хороший исход — 0–33 %, мизерный — 29–70 %.",
        details: "Серьёзно обсудить с семьёй цели лечения. Эскалация / деэскалация индивидуально."
      },
      {
        min: 8,
        max: 10,
        label: "8–10 (мизерный)",
        color: "#991B1B",
        description: "Хороший исход — 0 %, мизерный — ≥ 70 %.",
        details: "Шанс на хороший исход практически отсутствует. Обсудить с семьёй ограничение агрессивной терапии, паллиативные цели.",
        actions: [
          "Мультидисциплинарная встреча с семьёй",
          "Обсудить DNR / DNI при высоком балле",
          "Избегать гемикраниэктомии без информированного согласия"
        ]
      }
    ],
    caveats: [
      "DRAGON валидирован для в/в альтеплазы при передней циркуляции",
      "Не используется для принятия решения о тромболизисе, а только для прогноза",
      "Не учитывает тромбэктомию (новые модели: SPAN-100, THRIVE, iScore)",
      "Глюкоза > 8 ммоль/л — маркер стрессовой гипергликемии, не всегда диабет"
    ],
    related: [
      {
        id: "nihss",
        title: "NIHSS"
      },
      {
        id: "aspects",
        title: "ASPECTS"
      },
      {
        id: "mrs-stroke",
        title: "mRS"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Strbian D, Meretoja A, Ahlhelm FJ et al. Predicting outcome of IV thrombolysis-treated ischemic stroke patients: The DRAGON score. Neurology 2012;78:427–432.",
    countries: "Международный (Helsinki Stroke)",
    info: "### Для чего используется\n**DRAGON score (Strbian 2012)** — прогноз функционального исхода через **3 месяца** у пациентов с ишемическим инсультом передней циркуляции, получивших **внутривенный тромболизис (альтеплаза)**. Помогает консультировать семью и планировать реабилитацию.\n\n### Компоненты DRAGON (0–10 баллов)\n| Буква | Критерий | Баллы |\n|---|---|---|\n| **D** | Dense MCA sign или ранний инфаркт на КТ | 0 / 1 (один) / 2 (оба) |\n| **R** | premorbid mRS > 1 | 1 |\n| **A** | Age ≥ 80 | 2; 65–79 | 1; < 65 | 0 |\n| **G** | Glucose > 144 мг/дл (8 ммоль/л) | 1 |\n| **O** | Onset-to-treatment > 90 мин | 1 |\n| **N** | NIHSS ≥ 16 | 3; 10–15 | 2; 5–9 | 1; 0–4 | 0 |\n\n### Прогноз\n| DRAGON | Хороший исход (mRS 0–2) | Мизерный (mRS 5–6) |\n|---|---|---|\n| 0–1 | 96 % | 0 % |\n| 2 | 88 % | 2 % |\n| 3 | 74 % | 3 % |\n| 4 | 60 % | 7 % |\n| 5 | 33 % | 29 % |\n| 6 | 16 % | 40 % |\n| 7 | 5 % | 59 % |\n| 8–10 | 0 % | 70–100 % |\n\n### Альтернативные модели\n| Модель | Для чего |\n|---|---|\n| **THRIVE** (Totaled Health Risks In Vascular Events) | Исход тромбэктомии (возраст + NIHSS + HTN/DM/AF) |\n| **iScore** (Saposnik 2011) | 30-дн + 1-год смертность после ишемического инсульта |\n| **ASTRAL** | Исход в 3 мес без реперфузии |\n| **SPAN-100** | age + NIHSS (простая) |\n| **HIAT-2** | Исход тромбэктомии |\n| **PLAN score** | Внутригоспитальная смертность |\n\n### Применение\n- Beратная консультация пациента / семьи после тромболизиса\n- Выбор интенсивности реабилитации\n- НЕ для отбора на тромболизис (не валидизирован как противопоказание)\n\n### Тактика\n- **0–1** — оптимизм, активная реабилитация\n- **2–4** — стандартная терапия, добавить тромбэктомию при LVO\n- **5–7** — обсудить цели лечения с семьёй\n- **8–10** — паллиативные цели могут быть уместны; обсудить DNR\n\n### Ограничения\n- Валидирован для альтеплазы — не полностью применим к тенектеплазе\n- Не включает визуализационные характеристики ASPECTS / collaterals\n- Не учитывает эффект тромбэктомии\n- Глюкоза — «острый» показатель, не всегда отражает диабет\n\n### Источник\nStrbian D, Meretoja A, Ahlhelm FJ et al. **Predicting outcome of IV thrombolysis-treated ischemic stroke patients: The DRAGON score.** *Neurology* 2012;78:427–432. Saposnik G et al. **IScore: a risk score to predict death early after hospitalization for an acute ischemic stroke.** *Circulation* 2011;123:739–749. Flint AC et al. **THRIVE score.** *Stroke* 2013;44:3365–3369."
  };

export default runner;
