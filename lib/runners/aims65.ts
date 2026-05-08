/**
 * Runner: aims65
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
    inputs: [
      {
        id: "alb",
        label: "Альбумин < 30 г/л",
        type: "checkbox",
        points: 1
      },
      {
        id: "inr",
        label: "INR > 1,5",
        type: "checkbox",
        points: 1
      },
      {
        id: "ms",
        label: "Изменение психического статуса",
        type: "checkbox",
        points: 1
      },
      {
        id: "sbp",
        label: "САД ≤ 90 мм рт.ст.",
        type: "checkbox",
        points: 1
      },
      {
        id: "age",
        label: "Возраст ≥ 65 лет",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 (низкий)",
        color: "#10B981",
        description: "Внутрибольничная смертность < 1 %."
      },
      {
        min: 2,
        max: 2,
        label: "2 (умеренный)",
        color: "#F59E0B",
        description: "Смертность ~ 5 %."
      },
      {
        min: 3,
        max: 5,
        label: "3-5 (высокий)",
        color: "#EF4444",
        description: "Смертность 10-25 %. Реанимация, эндоскопия неотложно."
      }
    ],
    maxScore: 5,
    caveats: [
      "Проще GBS/Rockall, но может недооценивать риск у молодых с активным кровотечением",
      "Альбумин/INR требуют лабораторных данных (в отличие от Blatchford)",
      "Для pre-endoscopy решения; после эндоскопии - полный Rockall"
    ],
    relatedCourses: [
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "rockall",
        title: "Rockall"
      },
      {
        id: "gbs",
        title: "Glasgow-Blatchford"
      },
      {
        id: "forrest",
        title: "Forrest"
      }
    ],
    reference: "Saltzman JR. Gastrointest Endosc 2011. AIMS65 для верхнего ЖКТ-кровотечения.",
    info: "### Что считает шкала\nAIMS65 - простая 5-параметровая прикроватная шкала для оценки **внутрибольничной смертности** при остром кровотечении из верхних отделов ЖКТ (UGIB).\n\n### Аббревиатура\n- **A** - Albumin < 3 г/дл (< 30 г/л)\n- **I** - INR > 1,5\n- **M** - Mental status (изменён)\n- **S** - Systolic BP ≤ 90 мм рт.ст.\n- **65** - возраст ≥ 65 лет\n\n### Когда применять\n- Любая гематемезис, мелена, \"кофейная гуща\" с гемодинамической нестабильностью или без неё\n- Доступны: альбумин, INR, ЧСС/АД, оценка сознания, возраст\n- Применяется **до эндоскопии**\n\n### Интерпретация\n| Баллы | Смертность |\n|---|---|\n| 0 | 0,3 % |\n| 1 | 1 % |\n| 2 | 5 % |\n| 3 | 10 % |\n| 4 | 15 % |\n| 5 | 25 % |\n\n### Преимущества vs. Glasgow-Blatchford / Rockall\n- Использует только лабораторные/клинические параметры, доступные в первый час\n- Не требует эндоскопических данных (в отличие от полного Rockall)\n- Лучше предсказывает смертность; **Glasgow-Blatchford** лучше для решения о низком риске и амбулаторном ведении\n\n### Ограничения\n- Не предсказывает рецидив кровотечения столь же точно, как полный Rockall\n- При портальной гипертензии (варикоз) специфичность ниже"
  };

export default runner;
