// @ts-nocheck
/**
 * Runner: tal
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
    maxScore: 12,
    inputs: [
      {
        id: "rr",
        label: "ЧДД (возрастная)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - <6 мес: <30; ≥6 мес: <20",
            points: 0
          },
          {
            value: "1",
            label: "1 - <6 мес: 31-45; ≥6 мес: 21-35",
            points: 1
          },
          {
            value: "2",
            label: "2 - <6 мес: 46-60; ≥6 мес: 36-50",
            points: 2
          },
          {
            value: "3",
            label: "3 - <6 мес: >60; ≥6 мес: >50",
            points: 3
          }
        ]
      },
      {
        id: "wheeze",
        label: "Свистящее дыхание (wheeze)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "1",
            label: "1 - только в конце выдоха при аускультации",
            points: 1
          },
          {
            value: "2",
            label: "2 - на всём выдохе при аускультации",
            points: 2
          },
          {
            value: "3",
            label: "3 - на вдохе и выдохе / слышно без стетоскопа",
            points: 3
          }
        ]
      },
      {
        id: "accessory",
        label: "Использование дополнительной мускулатуры / ретракции",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "1",
            label: "1 - межрёберные",
            points: 1
          },
          {
            value: "2",
            label: "2 - межрёберные + надключичные",
            points: 2
          },
          {
            value: "3",
            label: "3 - + раздувание крыльев носа / парадоксальное дыхание",
            points: 3
          }
        ]
      },
      {
        id: "spo2",
        label: "SpO₂ / цианоз (на воздухе)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - SpO₂ ≥95%, нет цианоза",
            points: 0
          },
          {
            value: "1",
            label: "1 - SpO₂ 92-94%",
            points: 1
          },
          {
            value: "2",
            label: "2 - SpO₂ 90-91%",
            points: 2
          },
          {
            value: "3",
            label: "3 - SpO₂ <90% или цианоз",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "0-4 (лёгкое)",
        color: "#22C55E",
        description: "Лёгкое обострение. Амбулаторное ведение.",
        details: "SpO₂ ≥95% на воздухе, минимальные ретракции. Ответ на бронходилататоры обычно быстрый.",
        actions: [
          "Сальбутамол МДИ 4-8 вдохов через спейсер q20 мин × 1 ч",
          "Пероральные ГКС: преднизолон 1-2 мг/кг (макс 60 мг) × 3-5 дней",
          "Оценка через 60 мин; выписка при стабильности"
        ]
      },
      {
        min: 5,
        max: 8,
        label: "5-8 (среднее)",
        color: "#F59E0B",
        description: "Среднетяжёлое. Наблюдение ≥4 ч, комбинация β2 + ипратропий.",
        actions: [
          "Сальбутамол + ипратропий q20 мин × 3 дозы",
          "Метилпреднизолон 1-2 мг/кг в/в или преднизолон per os",
          "Кислород до SpO₂ ≥92%",
          "Повторная оценка Tal каждый час"
        ]
      },
      {
        min: 9,
        max: 12,
        label: "9-12 (тяжёлое)",
        color: "#EF4444",
        description: "Тяжёлое / угрожающее. ICU, MgSO₄, готовность к интубации.",
        details: "SpO₂ <90%, выраженные ретракции, цианоз. Риск дыхательной недостаточности.",
        actions: [
          "Непрерывный сальбутамол 0,5 мг/кг/ч небулайзером",
          "Ипратропий q20 мин × 3",
          "Метилпреднизолон 2 мг/кг в/в",
          "MgSO₄ 25-50 мг/кг в/в за 20 мин (макс 2 г)",
          "HFNC / BiPAP → интубация (кетамин 1-2 мг/кг как индуктор)",
          "ICU перевод"
        ]
      }
    ],
    caveats: [
      "Шкала Tal (1983) - для бронхиолита и астмы у младенцев/детей до 5 лет",
      "Шкала Wang (1992) - похожа, добавляет I:E ratio и ментальный статус",
      "SpO₂ оценивать без дополнительного O₂ (иначе занижение тяжести)",
      "Wheeze и retractions - субъективны; использовать одинаковый метод оценки при повторном измерении"
    ],
    related: [
      {
        id: "pram",
        title: "PRAM"
      },
      {
        id: "westley",
        title: "Westley croup"
      },
      {
        id: "silverman",
        title: "Silverman-Andersen"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "203.9",
        title: "Пульмонология детского возраста"
      }
    ],
    reference: "Tal A, Bavilski C, Yohai D, et al. Dexamethasone and salbutamol in the treatment of acute wheezing in infants. Pediatrics 1983;71:13-18. Wang EE et al. Am Rev Respir Dis 1992;145:106-109.",
    countries: "Международный",
    presets: [
      {
        label: "Лёгкое",
        values: {
          rr: "1",
          wheeze: "1",
          accessory: "1",
          spo2: "0"
        }
      },
      {
        label: "Среднее",
        values: {
          rr: "2",
          wheeze: "2",
          accessory: "2",
          spo2: "1"
        }
      },
      {
        label: "Тяжёлое",
        values: {
          rr: "3",
          wheeze: "3",
          accessory: "3",
          spo2: "3"
        }
      }
    ],
    info: "### Для чего используется\n**Шкала Tal (Tal score)** - клиническая оценка тяжести бронхиолита и обструкции у детей до 5 лет по 4 параметрам. Wang score - близкий вариант для бронхиолита.\n\n### Критерии (4 × 0-3 балла)\n| Параметр | 0 | 1 | 2 | 3 |\n|---|---|---|---|---|\n| **ЧДД (<6 мес)** | <30 | 31-45 | 46-60 | >60 |\n| **ЧДД (≥6 мес)** | <20 | 21-35 | 36-50 | >50 |\n| **Wheeze** | нет | конец выдоха | весь выдох | вдох+выдох / слышно без стетоскопа |\n| **Ретракции** | нет | межрёб. | + надключ. | + флейринг / парадокс. дыхание |\n| **SpO₂** | ≥95% | 92-94% | 90-91% | <90% / цианоз |\n\n### Wang score (1992) - альтернатива\n4 параметра: ЧДД, wheeze, ретракции, общее состояние (alert/irritable/lethargic). 0-12 баллов.\n\n### Интерпретация\n| Балл | Тяжесть | Тактика |\n|---|---|---|\n| 0-4 | Лёгкое | Сальбутамол + преднизолон per os, амбулаторно |\n| 5-8 | Среднее | Сальбутамол+ипратропий, стероиды в/в, наблюдение ≥4 ч |\n| 9-12 | Тяжёлое | ICU, MgSO₄, непрерывный небулайзер, HFNC/BiPAP |\n\n### Ограничения\n- Валидация в популяции младенцев с бронхиолитом; экстраполяция на астму ограничена\n- Субъективная оценка wheeze и ретракций\n- У младенцев <2 мес: Silverman-Andersen предпочтительнее\n\n### Тактика\n- **Лёгкое**: бронходилататоры + пероральные ГКС\n- **Среднее**: комбинированная небулайзерная терапия + в/в стероиды\n- **Тяжёлое**: MgSO₄ в/в, HFNC → BiPAP → интубация"
  };

export default runner;
