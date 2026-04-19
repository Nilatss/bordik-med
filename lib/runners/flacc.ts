// @ts-nocheck
/**
 * Runner: flacc
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
        id: "face",
        label: "Лицо (Face)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет особого выражения, улыбка",
            points: 0
          },
          {
            value: "1",
            label: "Редкая гримаса, хмурится, отстранён",
            points: 1
          },
          {
            value: "2",
            label: "Частая дрожь подбородка, сжатая челюсть",
            points: 2
          }
        ]
      },
      {
        id: "legs",
        label: "Ноги (Legs)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальное положение, расслаблены",
            points: 0
          },
          {
            value: "1",
            label: "Беспокойны, напряжены",
            points: 1
          },
          {
            value: "2",
            label: "Брыкается, ноги поджаты",
            points: 2
          }
        ]
      },
      {
        id: "activity",
        label: "Активность (Activity)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Спокойно лежит, нормальные движения",
            points: 0
          },
          {
            value: "1",
            label: "Ёрзает, напряжён",
            points: 1
          },
          {
            value: "2",
            label: "Выгибается, скован, дёргается",
            points: 2
          }
        ]
      },
      {
        id: "cry",
        label: "Плач (Cry)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет плача",
            points: 0
          },
          {
            value: "1",
            label: "Стонет, хныкает, иногда жалуется",
            points: 1
          },
          {
            value: "2",
            label: "Постоянно плачет, кричит, часто жалуется",
            points: 2
          }
        ]
      },
      {
        id: "consol",
        label: "Утешаемость (Consolability)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Удовлетворён, расслаблен",
            points: 0
          },
          {
            value: "1",
            label: "Успокаивается при прикосновении, обнимании, разговоре",
            points: 1
          },
          {
            value: "2",
            label: "Не успокаивается",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 (нет боли)",
        color: "#22C55E",
        description: "Комфорт."
      },
      {
        min: 1,
        max: 3,
        label: "1–3 (лёгкий дискомфорт)",
        color: "#84CC16",
        description: "Лёгкий дискомфорт — немедикаментозные меры ± неопиоиды."
      },
      {
        min: 4,
        max: 6,
        label: "4–6 (умеренная боль)",
        color: "#F59E0B",
        description: "Умеренная боль — аналгезия необходима."
      },
      {
        min: 7,
        max: 10,
        label: "7–10 (сильная боль)",
        color: "#EF4444",
        description: "Сильная боль — срочная аналгезия.",
        details: "FLACC ≥ 7 у ребёнка — сигнал для немедленной аналгезии. Учитывать вес, возраст, путь введения. Переоценка через 30 мин.",
        actions: [
          "Морфин 0,05–0,1 мг/кг в/в (или фентанил 1–2 мкг/кг в/в)",
          "Парацетамол 15 мг/кг + ибупрофен 10 мг/кг (если нет противопоказаний)",
          "Сукроза 24% p/o у младенцев < 1 года при болезненных процедурах",
          "Переоценка FLACC через 15–30 мин; вовлечение родителей"
        ]
      }
    ],
    caveats: [
      "Валидирована для детей 2 мес – 7 лет и у невербальных (revised FLACC — для детей с когнитивными нарушениями)",
      "Седация может давать ложно низкий балл — всегда оценивать в контексте",
      "При ИВЛ/параличе применимость ограничена — использовать COMFORT-B или N-PASS"
    ],
    related: [
      {
        id: "wong-baker",
        title: "Wong-Baker FACES"
      },
      {
        id: "nips",
        title: "NIPS (новорождённые)"
      },
      {
        id: "painad",
        title: "PAINAD (деменция)"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия 0-2"
      }
    ],
    reference: "Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S. The FLACC: a behavioral scale. *Pediatr Nurs* 1997; 23:293–297.",
    countries: "Международный",
    info: "### Для чего используется\n**FLACC (Merkel 1997)** — поведенческая шкала оценки боли у **невербальных детей 2 мес – 7 лет** и у детей с когнитивными нарушениями (revised FLACC). Широко используется в отделениях послеоперационной боли, педиатрических ОРИТ, онкологии.\n\n### Компоненты (5 × 0–2)\n| | 0 | 1 | 2 |\n|---|---|---|---|\n| **F**ace | Нет особого выражения/улыбка | Хмурится, редкая гримаса | Частая дрожь подбородка, сжатая челюсть |\n| **L**egs | Нормальное положение | Беспокойны, напряжены | Брыкается, ноги поджаты |\n| **A**ctivity | Спокойно лежит | Ёрзает, напряжён | Выгибается, дёргается |\n| **C**ry | Нет плача | Стонет, хнычет | Постоянно плачет, кричит |\n| **C**onsolability | Удовлетворён | Успокаивается при контакте | Не успокаивается |\n\nСумма: 0–10.\n\n### Интерпретация\n| Балл | Категория |\n|---|---|\n| 0 | Нет боли |\n| 1–3 | Лёгкий дискомфорт |\n| 4–6 | Умеренная боль |\n| 7–10 | Сильная боль |\n\n### Ограничения\n- Не применима у глубоко седированных или парализованных\n- У недоношенных использовать N-PASS / PIPP-R\n- Revised FLACC имеет открытую строку для индивидуальных поведений у детей с ДЦП/аутизмом\n\n### Тактика\nПедиатрические дозы аналгетиков (см. Wong-Baker). Обязательно **немедикаментозное**: родитель рядом, пеленание у младенцев, сукроза 24 % p/o при процедурах.\n\n### Источник\nMerkel SI et al. *Pediatr Nurs* 1997; 23:293–297. Malviya S et al. Revised FLACC. *Pediatr Anesth* 2006; 16:258–265."
  };

export default runner;
