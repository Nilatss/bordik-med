// @ts-nocheck
/**
 * Runner: rockall
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
    inputs: [
      {
        id: "age",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: 0,
            label: "< 60 лет",
            points: 0
          },
          {
            value: 1,
            label: "60–79 лет",
            points: 1
          },
          {
            value: 2,
            label: "≥ 80 лет",
            points: 2
          }
        ]
      },
      {
        id: "shock",
        label: "Гемодинамика",
        type: "select",
        options: [
          {
            value: 0,
            label: "Нет шока (САД ≥ 100, ЧСС < 100)",
            points: 0
          },
          {
            value: 1,
            label: "Тахикардия (САД ≥ 100, ЧСС ≥ 100)",
            points: 1
          },
          {
            value: 2,
            label: "Гипотензия (САД < 100)",
            points: 2
          }
        ]
      },
      {
        id: "comorb",
        label: "Сопутствующая патология",
        type: "select",
        options: [
          {
            value: 0,
            label: "Нет тяжёлых",
            points: 0
          },
          {
            value: 2,
            label: "ИБС / ХСН / иные тяжёлые",
            points: 2
          },
          {
            value: 3,
            label: "ХПН / печёночная нед / диссеминированный рак",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0–2 (низкий)",
        color: "#10B981",
        description: "Может быть выписан амбулаторно."
      },
      {
        min: 3,
        max: 4,
        label: "3–4 (умеренный)",
        color: "#F59E0B",
        description: "Госпитализация, эндоскопия в течение 24 ч."
      },
      {
        min: 5,
        max: 7,
        label: "5–7 (высокий)",
        color: "#EF4444",
        description: "Высокий риск смерти/рецидива. ICU."
      }
    ],
    maxScore: 7,
    caveats: [
      "Полный Rockall (с эндоскопией) точнее для оценки рецидива",
      "Не учитывает лабораторные (Hb, мочевина) — в отличие от GBS",
      "Не использовать изолированно для решения об амбулаторном ведении"
    ],
    relatedCourses: [
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "gbs",
        title: "Glasgow-Blatchford"
      },
      {
        id: "aims65",
        title: "AIMS65"
      },
      {
        id: "forrest",
        title: "Forrest"
      }
    ],
    reference: "Rockall TA. Gut 1996. Pre-endoscopy Rockall Score.",
    info: "### Что считает шкала\nPre-endoscopy Rockall — оценка риска **смертности и рецидива** при остром UGIB **до выполнения** ЭГДС. Полный Rockall (с эндоскопическими данными — диагноз и стигмы кровотечения) добавляет ещё до 4 баллов (макс 11).\n\n### Когда применять\n- Поступление с гематемезис/мелена\n- До эндоскопии — для триажа (палата vs. ICU vs. амбулаторно)\n\n### Преимущества\n- Простой, не требует лабораторных данных\n- Хорошо валидизирован\n\n### Когда использовать Glasgow-Blatchford вместо Rockall\n- **Если цель — выявить пациентов низкого риска для амбулаторного ведения**: GBS = 0 имеет NPV ~ 99 % для отсутствия вмешательства/смерти\n- Pre-endoscopy Rockall лучше предсказывает смертность, GBS — необходимость вмешательства\n\n### Полный Rockall (после ЭГДС)\nДобавляются:\n- Диагноз: 0 (Mallory-Weiss/нет повреждений), 1 (другое), 2 (рак)\n- Стигмы кровотечения: 0 (нет/тёмное пятно), 2 (кровь, видимый сосуд, сгусток)\n\n### Ограничения\n- Менее чувствителен к варикозному кровотечению\n- Не учитывает приём антикоагулянтов как отдельный предиктор"
  };

export default runner;
