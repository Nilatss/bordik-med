// @ts-nocheck
/**
 * Runner: fagerstrom
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
        id: "q1",
        label: "1. Через сколько минут после пробуждения первая сигарета?",
        type: "select",
        options: [
          {
            value: "0",
            label: ">60 мин",
            points: 0
          },
          {
            value: "1",
            label: "31–60 мин",
            points: 1
          },
          {
            value: "2",
            label: "6–30 мин",
            points: 2
          },
          {
            value: "3",
            label: "≤5 мин",
            points: 3
          }
        ]
      },
      {
        id: "q2",
        label: "2. Трудно ли удержаться от курения там, где запрещено?",
        type: "checkbox",
        points: 1
      },
      {
        id: "q3",
        label: "3. От какой сигареты труднее всего отказаться?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Любой другой",
            points: 0
          },
          {
            value: "1",
            label: "Первой утром",
            points: 1
          }
        ]
      },
      {
        id: "q4",
        label: "4. Сколько сигарет в день?",
        type: "select",
        options: [
          {
            value: "0",
            label: "≤10",
            points: 0
          },
          {
            value: "1",
            label: "11–20",
            points: 1
          },
          {
            value: "2",
            label: "21–30",
            points: 2
          },
          {
            value: "3",
            label: ">30",
            points: 3
          }
        ]
      },
      {
        id: "q5",
        label: "5. Курите чаще в первые часы после пробуждения?",
        type: "checkbox",
        points: 1
      },
      {
        id: "q6",
        label: "6. Курите даже если больны и лежите в постели?",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0–2 (очень низкая)",
        color: "#22C55E",
        description: "Очень низкая никотиновая зависимость."
      },
      {
        min: 3,
        max: 4,
        label: "3–4 (низкая)",
        color: "#84CC16",
        description: "Низкая зависимость."
      },
      {
        min: 5,
        max: 7,
        label: "5–7 (средняя)",
        color: "#F59E0B",
        description: "Средняя. Рассмотреть НЗТ или варениклин."
      },
      {
        min: 8,
        max: 10,
        label: "8–10 (высокая)",
        color: "#EF4444",
        description: "Высокая. Комбинированная терапия."
      }
    ],
    caveats: [
      "Не учитывает электронные сигареты / вейпы",
      "Для оценки готовности к отказу использовать stages of change",
      "У подростков применяется модификация mFTQ"
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      }
    ],
    related: [
      {
        id: "audit-c",
        title: "AUDIT-C"
      },
      {
        id: "mmrc",
        title: "mMRC"
      },
      {
        id: "gold",
        title: "GOLD (ХОБЛ)"
      }
    ],
    reference: "Fagerström 1991 (FTND). Оценка тяжести никотиновой зависимости.",
    info: "### Для чего используется\n**Fagerström Test for Nicotine Dependence (FTND, 1991)** — стандартная шкала оценки **тяжести никотиновой зависимости**. Используется для выбора стратегии прекращения курения, дозирования никотинзаместительной терапии (NRT).\n\n### 6 вопросов (0–10 баллов)\n1. Как скоро после пробуждения вы выкуриваете первую сигарету? (≤ 5 мин = 3; 6–30 мин = 2; 31–60 = 1; > 60 = 0)\n2. Трудно ли воздерживаться там, где запрещено курить? (да = 1)\n3. От какой сигареты труднее всего отказаться? (первая утром = 1)\n4. Сколько сигарет в день? (≤ 10 = 0; 11–20 = 1; 21–30 = 2; > 30 = 3)\n5. Курите больше в первые часы после пробуждения? (да = 1)\n6. Курите во время болезни/в постели? (да = 1)\n\n### Интерпретация\n| FTND | Зависимость |\n|---|---|\n| 0–2 | Очень низкая |\n| 3–4 | Низкая |\n| 5 | Средняя |\n| 6–7 | Высокая |\n| 8–10 | Очень высокая |\n\n### Тактика лечения по степени\n| FTND | Рекомендация |\n|---|---|\n| 0–4 | Поведенческая терапия; NRT по желанию |\n| 5–6 | NRT (пластырь или ингалятор) + поведенческая |\n| ≥ 7 | **Варениклин** (Champix) или **бупропион** + NRT; длительная поддержка |\n\n### Препараты для прекращения\n| Препарат | Эффективность (OR vs placebo) |\n|---|---|\n| Варениклин (Chantix / Champix) | 2,88 |\n| Бупропион | 1,94 |\n| NRT пластырь | 1,64 |\n| NRT ингалятор / жвачка | 1,60 |\n| Цитизин (Табекс) | 1,57 |\n| Комбинация (варениклин + NRT) | Увеличивает успех |\n\n### Целевые сроки\n| Момент | Действие |\n|---|---|\n| Quit date | Начать варениклин за 1 нед до; NRT в день прекращения |\n| 4 нед | 24 % continuous abstinence при варениклине vs 10 % placebo |\n| 12 нед | Пересмотр терапии |\n| 1 год | ≤ 10 % остаются некурящими без поддержки; 25–30 % с варениклином |\n\n### Связанные шкалы\n| Шкала | Применение |\n|---|---|\n| **HSI (Heaviness of Smoking Index)** | Упрощённый FTND — 2 вопроса |\n| **Cigarette Dependence Scale (CDS)** | Расширенная оценка |\n| **GN-SBQ** | Вопросник симптомов абстиненции |\n\n### Ограничения\n- Разработана для ежедневных курильщиков\n- Не валидизирована для вейпов / электронных сигарет\n- Не отражает психосоциальную зависимость\n- Cutoff варьирует по странам"
  };

export default runner;
