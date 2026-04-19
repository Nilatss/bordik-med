// @ts-nocheck
/**
 * Runner: mace2
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
    maxScore: 30,
    inputs: [
      {
        id: "orient",
        label: "Ориентация (месяц, дата, день недели, год, время) — правильных",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "Все 5",
            points: 5
          }
        ]
      },
      {
        id: "imm1",
        label: "Немедленная память — попытка 1 (0–5)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          }
        ]
      },
      {
        id: "imm2",
        label: "Немедленная память — попытка 2 (0–5)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          }
        ]
      },
      {
        id: "imm3",
        label: "Немедленная память — попытка 3 (0–5)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          }
        ]
      },
      {
        id: "digits",
        label: "Цифры наоборот (0–4)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          }
        ]
      },
      {
        id: "months",
        label: "Месяцы наоборот",
        type: "checkbox",
        points: 1
      },
      {
        id: "recall",
        label: "Отсроченное воспроизведение (0–5)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 24,
        label: "< 25 — подозрение на нейрокогнитивное нарушение",
        color: "#EF4444",
        description: "Порог < 25 указывает на вероятное сотрясение.",
        details: "MACE2 < 25 с высокой вероятностью сигнализирует об остром сотрясении (в течение 12 ч от инцидента). Требуется удаление от службы, отдых, повторная оценка.",
        actions: [
          "Отстранение от обязанностей (MACE-compliant rest)",
          "Повтор MACE2 через 24–48 ч",
          "Нейровизуализация при красных флагах (потеря сознания > 5 мин, амнезия > 24 ч, очаговые симптомы)",
          "Комплексная оценка неврологом при сохранении симптомов"
        ]
      },
      {
        min: 25,
        max: 30,
        label: "≥ 25 — норма",
        color: "#22C55E",
        description: "Норма. Сотрясение не исключается полностью."
      }
    ],
    caveats: [
      "Валидирован для применения в течение 12 ч после инцидента",
      "Не исключает сотрясения при нормальном балле — симптомы могут развиться позже",
      "Baseline-тестирование (при наличии) повышает точность",
      "Не заменяет клиническую оценку и нейровизуализацию при красных флагах"
    ],
    related: [
      {
        id: "scat",
        title: "SCAT6"
      },
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "marshall-ct",
        title: "Marshall CT"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Defense and Veterans Brain Injury Center (DVBIC). Military Acute Concussion Evaluation 2 (MACE2). U.S. DoD, 2018.",
    info: "### Для чего используется\n**MACE2 (Military Acute Concussion Evaluation 2, DoD 2018)** — стандартизированный инструмент оценки **острого сотрясения у военнослужащих** в течение 12 ч после инцидента. Заменил оригинальный MACE (2006).\n\n### Структура (0–30 баллов)\n| Домен | Баллы |\n|---|---|\n| Ориентация | 5 |\n| Немедленная память (3 попытки × 5 слов) | 15 |\n| Концентрация (цифры наоборот + месяцы наоборот) | 5 |\n| Отсроченное воспроизведение | 5 |\n\n### Интерпретация\n| MACE2 | Значение |\n|---|---|\n| ≥ 25 | Норма |\n| < 25 | Подозрение на нейрокогнитивное нарушение |\n\n### Красные флаги (независимо от балла → срочная нейровизуализация)\n- Потеря сознания > 5 мин\n- Амнезия > 24 ч\n- GCS < 15 после 30 мин\n- Очаговая неврология, судороги\n- Проникающая ЧМТ\n\n### Применение\n- Поле боя и тренировки (combat / training)\n- Повтор через 24–48 ч\n- Комбинируется с VOMS (Vestibular/Ocular Motor Screening) и неврологическим осмотром\n\n### Ограничения\n- Валидирован только для первых 12 ч\n- Чувствительность ~70 %, специфичность ~85 %\n- Не заменяет КТ при красных флагах\n\n### Тактика\n- ≥ 25: наблюдение, повтор\n- < 25 или красные флаги: немедленное отстранение, нейровизуализация, консультация\n- Постепенный return-to-duty (graduated RTD protocol)\n\n### Источник\n**DoD MACE2 Clinical Recommendation.** Defense and Veterans Brain Injury Center, 2018. McCrea M et al. *Mil Med* 2020;185:e601–e608."
  };

export default runner;
