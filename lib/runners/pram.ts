// @ts-nocheck
/**
 * Runner: pram
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
        id: "suprasternal",
        label: "Ретракции яремной ямки",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "2",
            label: "Есть",
            points: 2
          }
        ]
      },
      {
        id: "scalene",
        label: "Ретракции лестничных мышц",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "2",
            label: "Есть",
            points: 2
          }
        ]
      },
      {
        id: "airEntry",
        label: "Проведение воздуха",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальное",
            points: 0
          },
          {
            value: "1",
            label: "Снижено у основания",
            points: 1
          },
          {
            value: "2",
            label: "Снижено у основания и верхушки",
            points: 2
          },
          {
            value: "3",
            label: "Минимальное или отсутствует",
            points: 3
          }
        ]
      },
      {
        id: "wheeze",
        label: "Свистящее дыхание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Только на выдохе",
            points: 1
          },
          {
            value: "2",
            label: "Вдох + выдох",
            points: 2
          },
          {
            value: "3",
            label: "Слышно без стетоскопа / «немое лёгкое»",
            points: 3
          }
        ]
      },
      {
        id: "spo2",
        label: "SpO₂",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥ 95%",
            points: 0
          },
          {
            value: "1",
            label: "92-94%",
            points: 1
          },
          {
            value: "2",
            label: "< 92%",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "0-3 (лёгкое)",
        color: "#22C55E",
        description: "Лёгкое обострение. Амбулаторное ведение.",
        actions: [
          "Сальбутамол МДИ 4-8 вдохов через спейсер, каждые 20 мин × 1 ч, затем по потребности",
          "Преднизолон 1-2 мг/кг per os × 3-5 дней (при бронхиальной астме)",
          "Повторная оценка через 1 ч",
          "Выписка при стойком улучшении"
        ]
      },
      {
        min: 4,
        max: 7,
        label: "4-7 (умеренное)",
        color: "#F59E0B",
        description: "Умеренное обострение. Госпитализация/наблюдение.",
        details: "Агрессивная бронходилятация + системные стероиды + наблюдение ≥4 ч. При отсутствии ответа - ICU.",
        actions: [
          "Сальбутамол МДИ/небулайзер каждые 20 мин × 3 раза",
          "Ипратропия бромид добавить (каждые 20 мин × 3)",
          "Преднизолон 1-2 мг/кг per os или метилпреднизолон 1 мг/кг в/в",
          "Кислород для SpO₂ ≥92-94%",
          "Переоценка после часа - если PRAM ≤3 → домой"
        ]
      },
      {
        min: 8,
        max: 12,
        label: "8-12 (тяжёлое)",
        color: "#EF4444",
        description: "Тяжёлое обострение. ICU, рассмотреть MgSO₄, интубацию.",
        details: "Тяжёлое обострение с угрозой дыхательной недостаточности. Необходимы вмешательства высокого уровня.",
        actions: [
          "Небулайзер сальбутамола непрерывно (0,5 мг/кг/ч)",
          "Ипратропия бромид каждые 20 мин × 3",
          "Метилпреднизолон 2 мг/кг в/в",
          "MgSO₄ 25-50 мг/кг в/в за 20 мин (макс 2 г)",
          "Рассмотреть адреналин в/м при анафилаксии, HFNC / BiPAP",
          "ICU консультация, готовность к интубации (кетамин предпочтителен)"
        ]
      }
    ],
    caveats: [
      "PRAM валидирована для детей 2-17 лет с астмой (Chalut 2000, Ducharme 2008)",
      "Альтернативы: PASS, PRESS (Pediatric Respiratory Severity Score), Wood-Downes для астмы",
      "Для бронхиолита лучше использовать RDAI, Tal или CSS",
      "SpO₂ должна измеряться на воздухе без O₂-терапии для точной оценки",
      "Шкала субъективна - межрейтерская надёжность средняя"
    ],
    related: [
      {
        id: "westley",
        title: "Westley (круп)"
      },
      {
        id: "silverman",
        title: "Silverman-Anderson"
      },
      {
        id: "tal",
        title: "Tal (бронхиолит)"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "203.9",
        title: "Пульмонология"
      }
    ],
    reference: "Chalut DS, Ducharme FM, Davis GM. The Preschool Respiratory Assessment Measure (PRAM): a responsive index of acute asthma severity. J Pediatr 2000;137:762-768.",
    countries: "Международный",
    presets: [
      {
        label: "Лёгкое обострение",
        values: {
          suprasternal: "0",
          scalene: "0",
          airEntry: "0",
          wheeze: "1",
          spo2: "0"
        }
      },
      {
        label: "Умеренное",
        values: {
          suprasternal: "0",
          scalene: "2",
          airEntry: "1",
          wheeze: "2",
          spo2: "1"
        }
      },
      {
        label: "Тяжёлое",
        values: {
          suprasternal: "2",
          scalene: "2",
          airEntry: "2",
          wheeze: "3",
          spo2: "2"
        }
      }
    ],
    info: "### Для чего используется\n**PRAM (Preschool Respiratory Assessment Measure, Chalut 2000)** - валидированная шкала тяжести острого обострения бронхиальной астмы у детей 2-17 лет. Используется для принятия решений о госпитализации и ответе на лечение.\n\n### 5 компонентов (0-12)\n| Компонент | Баллы |\n|---|---|\n| Ретракции яремной ямки | 0 или 2 |\n| Ретракции лестничных мышц | 0 или 2 |\n| Проведение воздуха | 0-3 |\n| Свистящее дыхание | 0-3 |\n| SpO₂ | 0-2 |\n\n### Интерпретация\n| PRAM | Тяжесть | Тактика |\n|---|---|---|\n| 0-3 | Лёгкое | Бета-2 + пероральные стероиды, амбулаторно |\n| 4-7 | Умеренное | Бета-2 + ипратропий + стероиды, наблюдение ≥4 ч |\n| 8-12 | Тяжёлое | ICU, MgSO₄, непрерывный сальбутамол, готовность к интубации |\n\n### Лечение по тяжести\n**Лёгкое:**\n- Сальбутамол МДИ 4-8 вдохов q20 мин × 1 ч\n- Преднизолон 1-2 мг/кг per os\n\n**Умеренное:**\n- Сальбутамол + ипратропий q20 мин × 3\n- Метилпреднизолон 1 мг/кг в/в или преднизолон per os\n- Кислород для SpO₂ ≥92%\n\n**Тяжёлое:**\n- Непрерывный сальбутамол 0,5 мг/кг/ч\n- Ипратропий q20 мин × 3\n- Метилпреднизолон 2 мг/кг в/в\n- MgSO₄ 25-50 мг/кг в/в за 20 мин (макс 2 г)\n- HFNC / BiPAP → интубация при прогрессе (кетамин как индуктор)\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| PASS (Pediatric Asthma Severity Score) | 3 компонента, сходная точность |\n| PRESS | Рецидивы астмы |\n| Wood-Downes | Старая шкала, включает PaO₂ |\n| Tal / RDAI / CSS | Для бронхиолита |\n\n### Ограничения\n- Валидирована 2-17 лет для астмы (не бронхиолита)\n- SpO₂ измерять на воздухе без O₂\n- Субъективные компоненты (wheeze, air entry)\n\n### Источник\nChalut DS et al. *J Pediatr* 2000;137:762-768. Ducharme FM et al. Validation PRAM. *J Pediatr* 2008;152:476-480."
  };

export default runner;
