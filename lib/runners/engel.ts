/**
 * Runner: engel
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
    maxScore: 4,
    inputs: [
      {
        id: "class",
        label: "Класс исхода после хирургии эпилепсии",
        type: "select",
        options: [
          {
            value: "1",
            label: "Ia - полное отсутствие приступов с операции",
            points: 1
          },
          {
            value: "1b",
            label: "Ib - только непровоцированные ауры",
            points: 1
          },
          {
            value: "1c",
            label: "Ic - редкие приступы с момента операции, но ≥ 2 лет без них",
            points: 1
          },
          {
            value: "1d",
            label: "Id - генерализованные судороги только при отмене АЭП",
            points: 1
          },
          {
            value: "2",
            label: "II - редкие инвалидизирующие приступы (почти без приступов)",
            points: 2
          },
          {
            value: "3",
            label: "III - значимое улучшение (≥ 90 % снижение)",
            points: 3
          },
          {
            value: "4",
            label: "IV - нет значимого улучшения",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "Класс I - свободен от инвалидизирующих приступов",
        color: "#22C55E",
        description: "Отличный исход. Цель хирургии достигнута.",
        details: "Класс I включает подкатегории Ia-Id. Наиболее благоприятный исход после темпоральной лобэктомии (50-70 % пациентов).",
        actions: [
          "Продолжение АЭП ≥ 2 года, затем постепенная отмена по согласованию",
          "ЭЭГ в динамике",
          "Психосоциальная реабилитация"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "Класс II - почти без приступов",
        color: "#84CC16",
        description: "Редкие инвалидизирующие приступы."
      },
      {
        min: 3,
        max: 3,
        label: "Класс III - значимое улучшение",
        color: "#F59E0B",
        description: "≥ 90 % снижение частоты приступов."
      },
      {
        min: 4,
        max: 4,
        label: "Класс IV - нет улучшения",
        color: "#EF4444",
        description: "Отсутствие значимого улучшения.",
        details: "Отказ хирургии. Пересмотр этиологии, re-evaluation EEG/MRI/PET, рассмотреть альтернативные методы.",
        actions: [
          "Повторная evaluation (видео-ЭЭГ, МРТ 3T, PET, SPECT, стерео-ЭЭГ)",
          "VNS (стимуляция блуждающего нерва), RNS (Responsive Neurostimulation), DBS ANT",
          "Кетогенная диета у подходящих пациентов",
          "Re-operation при выявлении нового эпилептогенного очага"
        ]
      }
    ],
    caveats: [
      "Оценка через ≥ 1 год после операции, лучше ≥ 2 лет",
      "Альтернатива - ILAE outcome (Wieser 2001): классы 1-6, более детализированная",
      "Исходы различаются по типу операции: темпоральная лобэктомия > экстратемпоральная",
      "Ауры в Engel Ib - могут быть предвестниками рецидива"
    ],
    related: [
      {
        id: "ilae",
        title: "ILAE 2017"
      },
      {
        id: "stess",
        title: "STESS"
      },
      {
        id: "mrs",
        title: "mRS"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Engel J Jr, Van Ness PC, Rasmussen TB, Ojemann LM. Outcome with respect to epileptic seizures. In: Surgical Treatment of the Epilepsies, 2nd ed. Raven Press, 1993:609-621.",
    info: "### Для чего используется\n**Engel Classification (1993)** - классическая система оценки **исходов хирургического лечения эпилепсии**. Альтернатива - ILAE outcome (Wieser 2001).\n\n### Классы (I-IV)\n| Класс | Описание |\n|---|---|\n| **I** | Свободен от инвалидизирующих приступов |\n| **Ia** | Полное отсутствие приступов с операции |\n| **Ib** | Только непровоцированные ауры |\n| **Ic** | Редкие приступы с операции, ≥ 2 лет без них |\n| **Id** | Генерализованные судороги только при отмене АЭП |\n| **II** | Редкие инвалидизирующие приступы (почти без) |\n| **III** | Значимое улучшение (≥ 90 % снижение) |\n| **IV** | Нет значимого улучшения |\n\n### ILAE Outcome (Wieser 2001) - альтернатива\n| Класс | Описание |\n|---|---|\n| 1 | Полностью свободен от приступов, без аур |\n| 2 | Только ауры |\n| 3 | 1-3 приступа/год + ауры |\n| 4 | 4 приступа/год - 50 % снижение baseline |\n| 5 | < 50 % снижение |\n| 6 | > 100 % увеличение |\n\n### Применение\n- Оценка через 1, 2, 5 лет после операции\n- Сравнение хирургических техник и центров\n- Guide для тактики АЭП (продолжать / отменять)\n\n### Ограничения\n- Субъективность понятия \"инвалидизирующие\"\n- Engel Ia требует ≥ 2 лет наблюдения\n- Не учитывает качество жизни, психосоциальные исходы (для этого QOLIE-31, NDDI-E)\n\n### Тактика\n- **I-II:** постепенная отмена АЭП через 2 года, продолжение наблюдения\n- **III:** оптимизация АЭП, рассмотреть re-evaluation\n- **IV:** полная re-evaluation (видео-ЭЭГ, МРТ, PET, SEEG), нейромодуляция (VNS/RNS/DBS), кетогенная диета"
  };

export default runner;
