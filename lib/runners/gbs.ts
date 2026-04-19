// @ts-nocheck
/**
 * Runner: gbs
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
    maxScore: 23,
    inputs: [
      {
        id: "urea",
        label: "Мочевина (ммоль/л)",
        type: "select",
        options: [
          {
            value: "0",
            label: "<6.5",
            points: 0
          },
          {
            value: "1",
            label: "6.5–8",
            points: 2
          },
          {
            value: "2",
            label: "8–10",
            points: 3
          },
          {
            value: "3",
            label: "10–25",
            points: 4
          },
          {
            value: "4",
            label: ">25",
            points: 6
          }
        ]
      },
      {
        id: "hb_m",
        label: "Гемоглобин у мужчин (г/л)",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥130",
            points: 0
          },
          {
            value: "1",
            label: "120–129",
            points: 1
          },
          {
            value: "2",
            label: "100–119",
            points: 3
          },
          {
            value: "3",
            label: "<100",
            points: 6
          }
        ]
      },
      {
        id: "sbp",
        label: "САД (мм рт.ст.)",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥110",
            points: 0
          },
          {
            value: "1",
            label: "100–109",
            points: 1
          },
          {
            value: "2",
            label: "90–99",
            points: 2
          },
          {
            value: "3",
            label: "<90",
            points: 3
          }
        ]
      },
      {
        id: "hr",
        label: "ЧСС ≥100",
        type: "checkbox",
        points: 1
      },
      {
        id: "melena",
        label: "Мелена",
        type: "checkbox",
        points: 1
      },
      {
        id: "syncope",
        label: "Синкопе",
        type: "checkbox",
        points: 2
      },
      {
        id: "liver",
        label: "Заболевание печени",
        type: "checkbox",
        points: 2
      },
      {
        id: "hf",
        label: "ХСН",
        type: "checkbox",
        points: 2
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 (очень низкий)",
        color: "#22C55E",
        description: "Амбулаторное ведение безопасно."
      },
      {
        min: 1,
        max: 5,
        label: "1–5",
        color: "#84CC16",
        description: "Низкий риск."
      },
      {
        min: 6,
        max: 11,
        label: "6–11",
        color: "#F59E0B",
        description: "Умеренный. Госпитализация, эндоскопия в 24 ч."
      },
      {
        min: 12,
        max: 23,
        label: "≥12",
        color: "#EF4444",
        description: "Высокий. Срочная эндоскопия, ICU.",
        details: "Высокий риск требующего вмешательства кровотечения. Немедленная стабилизация, эндоскопия в течение 12–24 ч.",
        actions: [
          "Инфузионная терапия, группа крови + перекрёстная проба",
          "ИПП в/в (омепразол 80 мг болюс, затем 8 мг/ч)",
          "При подозрении на варикоз — октреотид/терлипрессин + АБ-профилактика",
          "Эрнадоскопия с остановкой кровотечения (Forrest Ia–IIa)"
        ]
      }
    ],
    caveats: [
      "Не учитывает коморбидность и возраст",
      "Для pre-endoscopy решения; после эндоскопии — Rockall / AIMS65",
      "У пациентов на АК/ААТ риск выше, чем предсказывает GBS",
      "Не валидизирован для нижнего ЖКТ-кровотечения"
    ],
    relatedCourses: [
      {
        id: "301.9",
        title: "Инфекционные болезни"
      },
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      }
    ],
    related: [
      {
        id: "rockall",
        title: "Rockall"
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
    reference: "Blatchford 2000. 0 баллов — можно выписать.",
    info: "### Для чего используется\n**Glasgow-Blatchford Bleeding Score (GBS, Blatchford 2000)** — оценка риска клинически значимого **кровотечения из верхних отделов ЖКТ (UGIB)**, требующего эндоскопического вмешательства, переливания, хирургии. Ключевое применение — **выявление пациентов низкого риска для амбулаторного ведения**.\n\n### Компоненты (0–23)\nУчитывает: мочевину, гемоглобин, САД, пульс, мелену, обморок, печёночную недостаточность, сердечную недостаточность.\n\n### Ключевое значение\n| GBS | Тактика |\n|---|---|\n| 0 | Амбулаторное ведение возможно (NPV ≈ 99 % для необходимости вмешательства) |\n| 1–2 | Низкий риск, но госпитализация предпочтительна |\n| ≥ 3 | Госпитализация, эндоскопия |\n\n### GBS vs AIMS65 vs Rockall\n| Шкала | Лучше предсказывает |\n|---|---|\n| **GBS** | Необходимость вмешательства (эндоскопия, трансфузия, хирургия) |\n| **AIMS65** | Смертность |\n| **Pre-endoscopy Rockall** | Смертность; требует данные возраста, гемодинамики, сопутствующего |\n| **Full Rockall** | Рецидив кровотечения, смертность (после ЭГДС) |\n\n### Алгоритм UGIB (ESGE 2021)\n| Шаг | Действие |\n|---|---|\n| 1. Гемодинамика | САД < 90 / ЧСС > 100 → ресусцитация |\n| 2. Оценка риска | GBS; если 0 — амбулаторно |\n| 3. ИПП в/в | Болюс 80 мг + 8 мг/ч → 72 ч |\n| 4. Эндоскопия | В течение 24 ч у большинства; < 12 ч при гемодинамической нестабильности |\n| 5. H. pylori | Тестировать всем с язвой |\n\n### Ограничения\n- Не оценивает эндоскопические стигмы (для этого — Forrest + full Rockall)\n- Переоценивает при обезвоживании (↑ мочевина без кровотечения)\n- Слабая специфичность (высокая чувствительность)"
  };

export default runner;
