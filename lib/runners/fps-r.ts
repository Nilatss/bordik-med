// @ts-nocheck
/**
 * Runner: fps-r
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
    maxScore: 10,
    inputs: [
      {
        id: "face",
        label: "Выбранное лицо (нейтральные лица, без слёз)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Лицо 1 - нет боли",
            points: 0
          },
          {
            value: "2",
            label: "Лицо 2 - очень лёгкая",
            points: 2
          },
          {
            value: "4",
            label: "Лицо 3 - лёгкая",
            points: 4
          },
          {
            value: "6",
            label: "Лицо 4 - умеренная",
            points: 6
          },
          {
            value: "8",
            label: "Лицо 5 - сильная",
            points: 8
          },
          {
            value: "10",
            label: "Лицо 6 - максимально сильная",
            points: 10
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0",
        color: "#22C55E",
        description: "Нет боли."
      },
      {
        min: 1,
        max: 3,
        label: "2",
        color: "#84CC16",
        description: "Лёгкая."
      },
      {
        min: 4,
        max: 6,
        label: "4-6",
        color: "#F59E0B",
        description: "Умеренная."
      },
      {
        min: 7,
        max: 10,
        label: "8-10",
        color: "#EF4444",
        description: "Сильная - активная аналгезия.",
        details: "FPS-R - предпочтительный инструмент самооценки у детей 4-16 лет по рекомендации IASP (Pain Research Group). Коррелирует с VAS лучше, чем Wong-Baker.",
        actions: [
          "Мультимодальная педиатрическая аналгезия (парацетамол + НПВС + опиоид)",
          "Регионарная анестезия при постоперационной боли где возможно",
          "Задействовать родителя и психолога (игровая терапия, отвлечение)"
        ]
      }
    ],
    caveats: [
      "Разработана для детей 4-16 лет (IASP), но используется и у взрослых с языковым барьером",
      "Нейтральные выражения лиц без слёз - снижает смешение с эмоциональным состоянием",
      "Не применима у детей < 4 лет и при тяжёлой когнитивной дисфункции"
    ],
    related: [
      {
        id: "wong-baker",
        title: "Wong-Baker FACES"
      },
      {
        id: "vas",
        title: "VAS/NRS"
      },
      {
        id: "flacc",
        title: "FLACC"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия 0-2"
      }
    ],
    reference: "Hicks CL et al. The Faces Pain Scale-Revised. *Pain* 2001; 93:173-183. Рекомендована IASP Pediatric Pain SIG.",
    countries: "Международный (IASP)",
    info: "### Для чего используется\n**FPS-R (Faces Pain Scale-Revised, Hicks 2001)** - самооценка боли у детей **школьного возраста (4-16 лет)**. Отличие от Wong-Baker - **нейтральные** выражения лиц без улыбок и слёз, что снижает смешение с эмоциональным состоянием. Рекомендована IASP.\n\n### Компоненты\n6 лиц с шагом 2 балла (0-2-4-6-8-10). Показывается горизонтально; ребёнку говорят: \"Эти лица показывают, как сильно что-то может болеть. Это лицо (0) показывает - совсем не болит. Эти лица (указать) показывают, что болит всё сильнее. Это лицо (10) - болит максимально сильно. Покажи лицо, которое показывает, как болит ТЕБЕ сейчас.\"\n\n### Интерпретация\nТа же категоризация 0 / 1-3 / 4-6 / 7-10 → ступени ВОЗ.\n\n### Ограничения\n- Не для детей < 4 лет\n- Требует сохранного зрения и понимания концепции ранжирования\n- Культурные различия в трактовке выражений лиц минимизированы, но не исключены\n\n### Тактика\nСтандартная ступенчатая аналгезия в педиатрических дозах (см. VAS / Wong-Baker)."
  };

export default runner;
