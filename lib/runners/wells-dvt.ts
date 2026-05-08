/**
 * Runner: wells-dvt — Wells Score for DVT (deep vein thrombosis)
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Wells PS, Anderson DR, Bormanis J, et al. Value of
 *               assessment of pretest probability of deep-vein thrombosis
 *               in clinical management. Lancet. 1997;350(9094):1795-1798.
 *               doi:10.1016/S0140-6736(97)08140-3
 *   UPDATE:     Wells PS, Anderson DR, Rodger M, et al. Evaluation of
 *               D-dimer in the diagnosis of suspected deep-vein
 *               thrombosis. N Engl J Med. 2003;349(13):1227-1235.
 *               doi:10.1056/NEJMoa023153
 *   GUIDELINE:  ACEP 2018 Clinical Policy on VTE (low Wells + neg D-dimer
 *               sufficient для DVT exclusion в outpatient setting).
 *
 * Items + points:
 *   1 — Active cancer (treatment/palliative within 6 months)
 *   1 — Paralysis, paresis, or recent plaster immobilisation of leg
 *   1 — Recently bedridden ≥3 days OR major surgery <12 weeks
 *   1 — Localised tenderness along deep venous system
 *   1 — Entire leg swollen
 *   1 — Calf swelling ≥3 cm vs asymptomatic side (10 cm below tib tuber)
 *   1 — Pitting oedema на symptomatic leg только
 *   1 — Collateral superficial veins (non-varicose)
 *   1 — Previously documented DVT
 *  -2 — Alternative diagnosis ≥ likely than DVT
 *
 * Bands (3-tier original) → modified 2-tier (used clinically):
 *   ≤0      → unlikely DVT (5% prevalence)        — D-dimer; if neg, exclude
 *   1-2     → moderate DVT (17%)
 *   ≥3      → likely DVT (53%)                    — proceed direct к US
 *
 * Two-tier:
 *   <2  → DVT unlikely
 *   ≥2  → DVT likely
 *
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
    maxScore: 9,
    inputs: [
      {
        id: "cancer",
        label: "Активный рак (лечение последние 6 мес / паллиатив)",
        type: "checkbox",
        points: 1
      },
      {
        id: "paralysis",
        label: "Паралич / парез / недавняя иммобилизация нижней конечности",
        type: "checkbox",
        points: 1
      },
      {
        id: "bed",
        label: "Постельный режим >3 дней / операция <12 нед",
        type: "checkbox",
        points: 1
      },
      {
        id: "tenderness",
        label: "Болезненность по ходу глубоких вен",
        type: "checkbox",
        points: 1
      },
      {
        id: "swelling",
        label: "Отёк всей ноги",
        type: "checkbox",
        points: 1
      },
      {
        id: "calf",
        label: "Разница в окружности голени >3 см",
        type: "checkbox",
        points: 1
      },
      {
        id: "pitting",
        label: "Ямочный отёк на поражённой ноге",
        type: "checkbox",
        points: 1
      },
      {
        id: "veins",
        label: "Поверхностные вены коллатерали (не варикоз)",
        type: "checkbox",
        points: 1
      },
      {
        id: "altdx",
        label: "Альтернативный диагноз столь же вероятен",
        type: "checkbox",
        points: -2
      }
    ],
    bands: [
      {
        min: -2,
        max: 0,
        label: "Низкая вероятность",
        color: "#22C55E",
        description: "<5% - D-димер; отрицательный D-димер исключает ТГВ.",
        details: "При низкой вероятности отрицательный высокочувствительный D-димер безопасно исключает ТГВ без УЗДС.",
        actions: [
          "Высокочувствительный D-димер",
          "При положительном - УЗДС компрессионное",
          "Возрастной порог D-димера у ≥ 50 лет: возраст × 10 нг/мл"
        ]
      },
      {
        min: 1,
        max: 2,
        label: "Умеренная",
        color: "#F59E0B",
        description: "~17% - УЗДС вен или D-димер."
      },
      {
        min: 3,
        max: 9,
        label: "Высокая",
        color: "#EF4444",
        description: "~53% - УЗДС обязательно.",
        details: "При высокой вероятности D-димер не нужен - сразу УЗДС. При отрицательном УЗДС и сохраняющейся клинике - повторить через 5-7 дней или КТ-венография.",
        actions: [
          "Компрессионное УЗДС всех глубоких вен",
          "При недоступности УЗДС - начать эмпирическую антикоагуляцию",
          "При отрицательном УЗДС и клинике - повторить через 5-7 дней"
        ]
      }
    ],
    caveats: [
      "Не валидизирован у беременных, онкобольных с активной химиотерапией, пациентов с предыдущим ТГВ",
      "Не использовать при уже установленном диагнозе ТГВ",
      "D-димер неспецифичен - повышен при инфекциях, беременности, онкологии, послеоперационно",
      "У госпитализированных точность ниже, чем у амбулаторных"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "wells-pe",
        title: "Wells для ТЭЛА"
      },
      {
        id: "perc",
        title: "PERC (исключение ТЭЛА)"
      },
      {
        id: "chads-vasc",
        title: "CHA₂DS₂-VASc"
      }
    ],
    reference: "Wells 2003. Двухуровневая модель: ≥2 - вероятно ТГВ, <2 - маловероятно.",
    info: "### Для чего используется\n**Wells score для ТГВ (1997, mod. 2003)** - прикроватная клиническая оценка вероятности **тромбоза глубоких вен** до лабораторных/инструментальных исследований. Определяет нужно ли делать D-димер или идти сразу на УЗДС.\n\n### Три- или двухуровневая модель\n**Трёхуровневая (оригинал 1997)**:\n| Баллы | Вероятность |\n|---|---|\n| ≤ 0 | Низкая (3 %) |\n| 1-2 | Умеренная (17 %) |\n| ≥ 3 | Высокая (53 %) |\n\n**Двухуровневая (2003, современная)**:\n| Баллы | Вероятность |\n|---|---|\n| < 2 | ТГВ маловероятен |\n| ≥ 2 | ТГВ вероятен |\n\n### Алгоритм (ACCP 2021, ESC 2019)\n| Wells | Следующий шаг | Результат → тактика |\n|---|---|---|\n| ≥ 2 | УЗДС вен ноги (компрессионное) | Положительно → антикоагуляция; отрицательно → повтор через 5-7 дн или + D-димер |\n| < 2 | D-димер (высокочувствительный) | Отрицательный → ТГВ исключён; положительный → УЗДС |\n\n### D-димер - age-adjusted cutoff (возраст-скорректированный)\nУ пациентов > 50 лет пороговое значение зависит от возраста:\n\n| Единицы измерения | Формула cutoff |\n|---|---|\n| FEU | возраст × 10 нг/мл |\n| DDU | возраст × 5 нг/мл |\n\nПовышает специфичность с сохранением NPV ~ 100 %.\n\n### Когда D-димер не работает (ложноположительный)\n| Ситуация | Причина |\n|---|---|\n| Беременность | Всегда повышен |\n| Рак | Активация коагуляции |\n| Постоперационный период (до 4 нед) | Заживление |\n| ДВС | Активное потребление факторов |\n| Сепсис | Системное воспаление |\n| Возраст > 80 без коррекции | Физиологическое повышение |\n| Стационарные пациенты | Множественные сопутствующие причины |\n\n### Лечение подтверждённого ТГВ\n**Выбор антикоагулянта (ACCP 2021)**:\n| Ситуация | Препарат |\n|---|---|\n| Некомплицированный ТГВ | DOAC (апиксабан 10×2×7 дн → 5×2; ривароксабан 15×2×21 дн → 20×1) |\n| Рак-ассоциированный ТГВ | DOAC или LMWH (эноксапарин 1 мг/кг × 2) |\n| Беременность | LMWH |\n| CrCl < 30 | LMWH или варфарин |\n| Массивная ТЭЛА с шоком | Тромболизис + LMWH / UFH |\n\n### Длительность антикоагуляции (ACCP)\n| Характер ТГВ | Длительность |\n|---|---|\n| Провокированный (операция, иммобилизация) | 3 мес |\n| Непровокированный | ≥ 3 мес, рассмотреть пожизненную терапию |\n| Рак-ассоциированный | До излечения основного заболевания |\n\n### ТЭЛА сопутствующая\n~ 50 % пациентов с проксимальным ТГВ имеют бессимптомную ТЭЛА. При диагнозе ТГВ - КТ-ангио опционально если есть лёгочные симптомы.\n\n### Ограничения Wells для ТГВ\n| Ограничение | Детали |\n|---|---|\n| Субъективный пункт | «Альтернативный диагноз столь же вероятен» (−2 балла) |\n| Низкая специфичность | У пожилых, стационарных, онкологических |\n| ТГВ верхних конечностей | Не валидизирован - используйте Constans score |\n\n### Дополнительные предикторы риска (не входят в Wells)\n| Фактор риска | Детали |\n|---|---|\n| Возраст | > 60 |\n| Беременность | + послеродовой период до 6 нед |\n| Эстрогены | КОК, ЗГТ |\n| Тромбофилии | Leiden, протромбин G20210A, антифосфолипидный |\n| Длительный перелёт | > 4 часов |"
  };

export default runner;
