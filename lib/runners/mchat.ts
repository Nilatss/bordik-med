// @ts-nocheck
/**
 * Runner: mchat
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
    maxScore: 20,
    inputs: [
      {
        id: "q1",
        label: "1. Ребёнок радуется, когда его раскачивают, подбрасывают?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q2",
        label: "2. Интересуется другими детьми?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q3",
        label: "3. Любит забираться на разные предметы (лестницы, мебель)?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q4",
        label: "4. Любит игры в прятки?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q5",
        label: "5. Играет в воображаемые игры (кормит куклу, говорит по телефону)?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q6",
        label: "6. Указывает пальцем, чтобы попросить?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q7",
        label: "7. Указывает пальцем, чтобы показать что-то интересное?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q8",
        label: "8. Играет с игрушками подобающим образом (не только крутит/грызёт)?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q9",
        label: "9. Приносит предметы родителю, чтобы показать?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q10",
        label: "10. Смотрит в глаза дольше 1–2 сек?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q11",
        label: "11. Чрезмерно чувствителен к шумам? (обратный)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Да",
            points: 1
          }
        ]
      },
      {
        id: "q12",
        label: "12. Улыбается в ответ на Вашу улыбку?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q13",
        label: "13. Подражает Вам (жестам, выражениям)?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q14",
        label: "14. Откликается на имя?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q15",
        label: "15. Если Вы показываете пальцем на игрушку — смотрит туда?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q16",
        label: "16. Ходит?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q17",
        label: "17. Смотрит туда же, куда Вы смотрите?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q18",
        label: "18. Делает необычные движения пальцами у лица? (обратный)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Да",
            points: 1
          }
        ]
      },
      {
        id: "q19",
        label: "19. Пытается привлечь Ваше внимание к тому, что делает?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Да",
            points: 0
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "q20",
        label: "20. Вы когда-либо сомневались, что ребёнок глух? (обратный)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Да",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0–2 (низкий риск)",
        color: "#22C55E",
        description: "Низкий риск расстройств аутистического спектра.",
        details: "Если ребёнок < 24 мес — повторить M-CHAT-R в 24 мес, так как многие дети с РАС начинают «терять» навыки ближе к 18–24 мес.",
        actions: [
          "Плановое наблюдение",
          "Повтор M-CHAT-R в 24 мес",
          "Общие рекомендации по развитию"
        ]
      },
      {
        min: 3,
        max: 7,
        label: "3–7 (средний риск)",
        color: "#F59E0B",
        description: "Средний риск. Нужен follow-up интервью (M-CHAT-R/F).",
        details: "Среднeрисковая группа — рекомендован structured follow-up interview. Около 50 % «средних» после follow-up становятся низким риском.",
        actions: [
          "Провести M-CHAT-R/F follow-up интервью",
          "Если после follow-up ≥ 2 балла — направить на диагностику",
          "Параллельно оценка слуха"
        ]
      },
      {
        min: 8,
        max: 20,
        label: "≥ 8 (высокий риск)",
        color: "#EF4444",
        description: "Высокий риск расстройств аутистического спектра.",
        details: "Высокий риск — follow-up не требуется, направляйте на диагностику незамедлительно. PPV при таком бальном диапазоне ~ 48 %.",
        actions: [
          "Немедленное направление на диагностическую оценку (ADOS-2, ADI-R)",
          "Раннее вмешательство (early intervention) без ожидания окончательного диагноза",
          "Оценка слуха (BERA), оценка развития в целом",
          "Консультация детского невролога и психиатра"
        ]
      }
    ],
    caveats: [
      "Применим для детей 16–30 месяцев",
      "При ответах «иногда» принимайте положительный (обычно/всегда) как норму",
      "Обратные вопросы (11, 18, 20) — «Да» считается тревожным",
      "Скрининг, не диагноз — диагноз ставится по DSM-5 через ADOS-2 / ADI-R"
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия 0-2"
      }
    ],
    related: [
      {
        id: "denver",
        title: "Denver II"
      },
      {
        id: "vanderbilt",
        title: "Vanderbilt ADHD"
      }
    ],
    reference: "Robins DL et al. Validation of the M-CHAT-R/F. Pediatrics 2014;133:37–45.",
    countries: "Международный",
    info: "### Для чего используется\n**M-CHAT-R/F (Modified Checklist for Autism in Toddlers, Revised with Follow-up, Robins 2014)** — валидированный скрининг на расстройства аутистического спектра (РАС) у детей **16–30 месяцев**. Рекомендован AAP для рутинного скрининга в 18 и 24 мес.\n\n### Структура\n- 20 вопросов да/нет для родителей\n- 17 вопросов — «нет» настораживает; 3 обратных (11, 18, 20) — «да» настораживает\n- Follow-up интервью (M-CHAT-R/F) при среднем риске\n\n### Интерпретация\n| Балл | Риск | Тактика |\n|---|---|---|\n| 0–2 | Низкий | Повтор в 24 мес |\n| 3–7 | Средний | Follow-up интервью; если ≥ 2 — направление |\n| ≥ 8 | Высокий | Немедленное направление на диагностику |\n\n### Диагностика РАС\n- **ADOS-2** (Autism Diagnostic Observation Schedule) — золотой стандарт наблюдения\n- **ADI-R** (Autism Diagnostic Interview-Revised) — интервью с родителями\n- **DSM-5 / МКБ-11** критерии\n\n### Раннее вмешательство\n- ABA (applied behavior analysis), ESDM (Early Start Denver Model)\n- Логопед, эрготерапевт\n- Начинать как можно раньше (до 3 лет — максимальная пластичность)\n\n### Ограничения\n- Скрининг, не диагноз\n- Чувствительность ~85 %, специфичность ~99 %, PPV ~ 48 % в общей популяции\n- Не использовать у детей старше 30 мес (другие инструменты: SCQ, SRS-2)\n- Родительский вопросник — возможен bias\n\n### Источник\nRobins DL, Casagrande K, Barton M et al. Validation of the Modified Checklist for Autism in Toddlers, Revised With Follow-up (M-CHAT-R/F). *Pediatrics* 2014;133:37–45.\nHyman SL et al. AAP Clinical Report on ASD. *Pediatrics* 2020;145:e20193447."
  };

export default runner;
