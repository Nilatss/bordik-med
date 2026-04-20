// @ts-nocheck
/**
 * Runner: khorana
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
        id: "site",
        label: "Локализация опухоли",
        type: "select",
        options: [
          {
            value: "0",
            label: "Прочие",
            points: 0
          },
          {
            value: "1",
            label: "Высокий риск: лёгкое, лимфома, гинекол., мочевой пузырь, яичко",
            points: 1
          },
          {
            value: "2",
            label: "Очень высокий риск: желудок, поджелудочная",
            points: 2
          }
        ]
      },
      {
        id: "plt",
        label: "Тромбоциты ≥ 350 × 10⁹/л до химиотерапии",
        type: "checkbox",
        points: 1
      },
      {
        id: "hb",
        label: "Hb < 10 г/дл или использование ESA",
        type: "checkbox",
        points: 1
      },
      {
        id: "wbc",
        label: "Лейкоциты > 11 × 10⁹/л",
        type: "checkbox",
        points: 1
      },
      {
        id: "bmi",
        label: "BMI ≥ 35",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 - низкий",
        color: "#22C55E",
        description: "~ 0,3-0,8 % 6-мес ВТЭ. Профилактика не показана.",
        actions: [
          "Наблюдение",
          "Обучение пациента признакам ВТЭ"
        ]
      },
      {
        min: 1,
        max: 2,
        label: "1-2 - промежуточный",
        color: "#F59E0B",
        description: "~ 2 % 6-мес ВТЭ. Обсудить индивидуально, рассмотреть DOAC при ≥ 2.",
        details: "ASCO 2020 допускает апиксабан 2,5 мг × 2 или ривароксабан 10 мг/сут у амбулаторных с Khorana ≥ 2 после обсуждения риска кровотечения.",
        actions: [
          "Оценить риск кровотечения, ЖКТ-рак (относит. противопоказание к DOAC)",
          "Апиксабан 2,5 мг × 2 (AVERT trial)",
          "Ривароксабан 10 мг/сут (CASSINI trial)",
          "Альтернатива: LMWH профилактическая доза"
        ]
      },
      {
        min: 3,
        max: 7,
        label: "≥ 3 - высокий",
        color: "#EF4444",
        description: "~ 7 % 6-мес ВТЭ. Рекомендуется тромбопрофилактика (ASCO 2020 IIa).",
        details: "Высокий риск ассоциированной с раком ВТЭ. Профилактика в течение первых 6 мес химиотерапии снижает ВТЭ примерно вдвое (AVERT, CASSINI).",
        actions: [
          "Апиксабан 2,5 мг × 2 (6 мес)",
          "Ривароксабан 10 мг/сут (6 мес)",
          "LMWH при ЖКТ-раке / риске кровотечения (эноксапарин 40 мг)",
          "Пересмотр при каждом цикле химиотерапии"
        ]
      }
    ],
    caveats: [
      "Валидирован для амбулаторных пациентов, начинающих химиотерапию (не госпитализированных)",
      "Не учитывает миеломы, ХЛЛ, глиомы - отдельные алгоритмы",
      "DOAC осторожно при ЖКТ / урогенитальном раке - повышен риск кровотечения",
      "Переоценивать при каждом цикле ХТ и смене режима"
    ],
    related: [
      {
        id: "caprini",
        title: "Caprini"
      },
      {
        id: "padua",
        title: "Padua"
      },
      {
        id: "wells-dvt",
        title: "Wells для ТГВ"
      }
    ],
    relatedCourses: [
      {
        id: "301.7",
        title: "Онкология"
      },
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    countries: "Международный (ASCO 2020, ESMO 2022, NCCN)",
    reference: "Khorana AA et al. Blood 2008; 111:4902-7. AVERT (Carrier 2019), CASSINI (Khorana 2019) - РКИ профилактики.",
    presets: [
      {
        label: "Низкий",
        values: {
          site: "0",
          plt: false,
          hb: false,
          wbc: false,
          bmi: false
        }
      },
      {
        label: "Промежуточный",
        values: {
          site: "1",
          plt: false,
          hb: true,
          wbc: false,
          bmi: false
        }
      },
      {
        label: "Высокий",
        values: {
          site: "2",
          plt: true,
          hb: true,
          wbc: false,
          bmi: false
        }
      }
    ],
    info: "### Для чего используется\n**Khorana Score (2008)** - первая валидированная шкала риска **ассоциированной с раком ВТЭ** у амбулаторных пациентов, начинающих химиотерапию. Используется для решения о тромбопрофилактике DOAC / LMWH.\n\n### Компоненты\n| Фактор | Баллы |\n|---|---|\n| Опухоль: желудок, ПЖ | 2 |\n| Опухоль: лёгкое, лимфома, гинекол., мочевой пузырь, яичко | 1 |\n| Plt ≥ 350 × 10⁹/л | 1 |\n| Hb < 10 или ESA | 1 |\n| WBC > 11 × 10⁹/л | 1 |\n| BMI ≥ 35 | 1 |\n\n### Интерпретация (6-мес ВТЭ)\n| Баллы | Риск |\n|---|---|\n| 0 | 0,3-0,8 % (низкий) |\n| 1-2 | ~ 2 % (промежуточный) |\n| ≥ 3 | ~ 7 % (высокий) |\n\n### Тактика (ASCO 2020, ESMO 2022)\n| Khorana | Рекомендация |\n|---|---|\n| 0 | Наблюдение |\n| 1-2 | Обсуждение, при ≥ 2 - предложить профилактику |\n| ≥ 3 | Рекомендуется профилактика 6 мес |\n\n### Препараты (профилактическая доза)\n| Препарат | Доза | Источник |\n|---|---|---|\n| Апиксабан | 2,5 мг × 2/сут | AVERT 2019 (Carrier) |\n| Ривароксабан | 10 мг/сут | CASSINI 2019 (Khorana) |\n| Далтепарин | 5000 МЕ/сут | CONKO-004 |\n| Эноксапарин | 40 мг/сут | ASCO опция |\n\n### Противопоказания к DOAC при онкологии\n- Активное кровотечение\n- Plt < 50\n- ЖКТ / урогенитальный рак - повышен риск кровотечения → предпочесть LMWH\n- Тяжёлая печёночная недостаточность\n- Лекарственные взаимодействия (ингибиторы CYP3A4 / P-gp)\n\n### Ограничения\n- Не валидизирован для гематологических (множественная миелома, ХЛЛ)\n- Низкая чувствительность: ~ 50 % ВТЭ возникает у пациентов с < 3 баллами\n- Альтернативы: PROTECHT, Vienna CATS, CATS-MICA, COMPASS-CAT\n\n### Источник\nKhorana AA, Kuderer NM, Culakova E et al. Development and validation of a predictive model for chemotherapy-associated thrombosis. *Blood* 2008; 111:4902-4907.\nCarrier M et al. *N Engl J Med* 2019; 380:711-719 (AVERT).\nKhorana AA et al. *N Engl J Med* 2019; 380:720-728 (CASSINI)."
  };

export default runner;
