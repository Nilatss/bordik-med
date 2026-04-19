// @ts-nocheck
/**
 * Runner: charlson
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
    maxScore: 37,
    inputs: [
      {
        id: "mi",
        label: "Инфаркт миокарда в анамнезе",
        type: "checkbox",
        points: 1
      },
      {
        id: "chf",
        label: "Хроническая сердечная недостаточность",
        type: "checkbox",
        points: 1
      },
      {
        id: "pvd",
        label: "Заболевание периферических артерий",
        type: "checkbox",
        points: 1
      },
      {
        id: "cvd",
        label: "Цереброваскулярная болезнь (инсульт/ТИА без тяжёлых последствий)",
        type: "checkbox",
        points: 1
      },
      {
        id: "dementia",
        label: "Деменция",
        type: "checkbox",
        points: 1
      },
      {
        id: "copd",
        label: "Хроническое заболевание лёгких (ХОБЛ, БА тяжёлая)",
        type: "checkbox",
        points: 1
      },
      {
        id: "ctd",
        label: "Заболевание соединительной ткани",
        type: "checkbox",
        points: 1
      },
      {
        id: "ulcer",
        label: "Язвенная болезнь",
        type: "checkbox",
        points: 1
      },
      {
        id: "mild_liver",
        label: "Лёгкое заболевание печени (без портальной гипертензии)",
        type: "checkbox",
        points: 1
      },
      {
        id: "dm",
        label: "Сахарный диабет без осложнений",
        type: "checkbox",
        points: 1
      },
      {
        id: "hemiplegia",
        label: "Гемиплегия / параплегия",
        type: "checkbox",
        points: 2
      },
      {
        id: "ckd",
        label: "Умеренно-тяжёлая ХБП (креатинин > 265 мкмоль/л, диализ, трансплантация)",
        type: "checkbox",
        points: 2
      },
      {
        id: "dm_end",
        label: "СД с поражением органов-мишеней (ретино-/нефро-/нейропатия)",
        type: "checkbox",
        points: 2
      },
      {
        id: "tumor",
        label: "Солидная опухоль (любая, < 5 лет)",
        type: "checkbox",
        points: 2
      },
      {
        id: "leukemia",
        label: "Лейкоз",
        type: "checkbox",
        points: 2
      },
      {
        id: "lymphoma",
        label: "Лимфома",
        type: "checkbox",
        points: 2
      },
      {
        id: "mod_liver",
        label: "Умеренно-тяжёлое заболевание печени (цирроз с портальной гипертензией, варикоз)",
        type: "checkbox",
        points: 3
      },
      {
        id: "mets",
        label: "Метастатическая солидная опухоль",
        type: "checkbox",
        points: 6
      },
      {
        id: "aids",
        label: "СПИД (не ВИЧ-носительство)",
        type: "checkbox",
        points: 6
      },
      {
        id: "age",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 50 лет",
            points: 0
          },
          {
            value: "1",
            label: "50–59 лет",
            points: 1
          },
          {
            value: "2",
            label: "60–69 лет",
            points: 2
          },
          {
            value: "3",
            label: "70–79 лет",
            points: 3
          },
          {
            value: "4",
            label: "≥ 80 лет",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 баллов",
        color: "#22C55E",
        description: "Низкий риск. 10-летняя выживаемость ≈ 98 %."
      },
      {
        min: 1,
        max: 2,
        label: "1–2 балла",
        color: "#84CC16",
        description: "Умеренный риск. 10-летняя выживаемость ≈ 90 %."
      },
      {
        min: 3,
        max: 4,
        label: "3–4 балла",
        color: "#F59E0B",
        description: "Высокий риск. 10-летняя выживаемость ≈ 53–77 %.",
        details: "Множественная коморбидность значимо ухудшает прогноз. Учитывать при планировании плановых вмешательств и онкологического лечения.",
        actions: [
          "Комплексная гериатрическая оценка при возрасте > 65",
          "Обсуждение целей лечения с пациентом и семьёй",
          "Оптимизация сопутствующих заболеваний перед операцией",
          "Оценка фрагильности (CFS, Edmonton Frail Scale)"
        ]
      },
      {
        min: 5,
        max: 37,
        label: "≥ 5 баллов",
        color: "#EF4444",
        description: "Очень высокий риск. 10-летняя выживаемость < 21 %.",
        details: "Крайне выраженная коморбидность. Ожидаемая продолжительность жизни существенно ограничена — радикальные вмешательства и агрессивное онкологическое лечение редко оправданы.",
        actions: [
          "Пересмотр показаний к радикальному лечению",
          "Рассмотрение паллиативной тактики / терапии сопровождения",
          "Мультидисциплинарный консилиум (онколог, терапевт, гериатр)",
          "Обсуждение DNR / предварительных директив"
        ]
      }
    ],
    caveats: [
      "Разработана в 1987 г. на онкологической когорте — валидация в других популяциях ограничена",
      "Не учитывает степень контроля заболеваний (напр., HbA1c при СД)",
      "Ряд современных болезней (ВИЧ на АРТ, ранние стадии рака) переоценён — СПИД = 6 баллов устарело с эпохи АРТ",
      "Альтернативы — индекс Elixhauser (31 состояние) и van Walraven-модификация (взвешенная)"
    ],
    relatedCourses: [
      {
        id: "301.7",
        title: "Онкология"
      }
    ],
    related: [
      {
        id: "asa-ps",
        title: "ASA-PS"
      },
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      },
      {
        id: "ecog",
        title: "ECOG"
      }
    ],
    reference: "Charlson ME et al. J Chronic Dis 1987; 40:373–383. Adjustment: Charlson 1994. Validated across >600 studies.",
    info: "### Для чего используется\n**Charlson Comorbidity Index (CCI)** — взвешенная оценка **10-летней смертности** на основе сопутствующих заболеваний. Используется:\n\n- Прогноз при онкологических заболеваниях\n- Стратификация риска плановых вмешательств\n- Коррекция рисков в эпидемиологических исследованиях\n- Принятие решений об агрессивности лечения у пожилых\n\n### Компоненты (весовые коэффициенты)\n| Баллы | Состояния |\n|---|---|\n| **1** | ИМ, ХСН, ЗПА, ЦВБ, деменция, ХОБЛ, СЗСТ, язвенная болезнь, лёгкое заболевание печени, СД без осложнений |\n| **2** | Гемиплегия, умеренно-тяжёлая ХБП, СД с поражением органов-мишеней, любая солидная опухоль (< 5 лет), лейкоз, лимфома |\n| **3** | Умеренно-тяжёлое заболевание печени (цирроз с портальной гипертензией) |\n| **6** | Метастатическая солидная опухоль, СПИД |\n\n### Возрастная поправка (Charlson 1994)\n+1 балл за каждое десятилетие ≥ 50 лет: 50–59 (+1), 60–69 (+2), 70–79 (+3), ≥ 80 (+4).\n\n### Интерпретация — 10-летняя выживаемость\n| Сумма баллов | Выживаемость |\n|---|---|\n| 0 | ≈ 98 % |\n| 1 | ≈ 96 % |\n| 2 | ≈ 90 % |\n| 3 | ≈ 77 % |\n| 4 | ≈ 53 % |\n| 5 | ≈ 21 % |\n| ≥ 6 | < 2 % |\n\n### Альтернативы\n| Индекс | Особенность |\n|---|---|\n| **Elixhauser** | 31 состояние, более детализирован, лучше для административных баз |\n| **van Walraven** | Взвешенная модификация Elixhauser (одна сумма, 0–30+) |\n| **Kaplan-Feinstein** | Более старая, трёхуровневая |\n| **CIRS-G** | Шкала по 14 системам × 5 степеней, применяется в гериатрии |\n\n### Ограничения\n- Разработана до эпохи АРТ — веса СПИДа и некоторых опухолей устарели\n- Не включает фрагильность, когнитивный статус, функциональную способность\n- Не учитывает тяжесть конкретной болезни (компенсированный vs декомпенсированный СД)\n\n### Тактика\n| CCI + возраст | Действие |\n|---|---|\n| 0–2 | Стандартный подход к лечению |\n| 3–4 | Оптимизация коморбидностей, обсуждение целей |\n| ≥ 5 | Паллиативная тактика часто предпочтительнее радикальной |\n\n### Источник\nCharlson ME, Pompei P, Ales KL, MacKenzie CR. A new method of classifying prognostic comorbidity in longitudinal studies: development and validation. *J Chronic Dis* 1987; 40(5):373–383.\nCharlson M et al. Validation of a combined comorbidity index. *J Clin Epidemiol* 1994; 47(11):1245–1251."
  };

export default runner;
