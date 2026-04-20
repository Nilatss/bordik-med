// @ts-nocheck
/**
 * Runner: timi
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
        id: "age",
        label: "Возраст ≥ 65 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "cad",
        label: "≥ 3 факторов риска ИБС (АГ, ↑ХС, СД, курение, семейный анамнез)",
        type: "checkbox",
        points: 1
      },
      {
        id: "stenosis",
        label: "Известный стеноз КА ≥ 50 %",
        type: "checkbox",
        points: 1
      },
      {
        id: "aspirin",
        label: "Приём аспирина в последние 7 дней",
        type: "checkbox",
        points: 1
      },
      {
        id: "angina",
        label: "≥ 2 эпизодов стенокардии за 24 ч",
        type: "checkbox",
        points: 1
      },
      {
        id: "st",
        label: "Изменения сегмента ST ≥ 0,5 мм",
        type: "checkbox",
        points: 1
      },
      {
        id: "troponin",
        label: "Положительные кардиомаркеры (тропонин/КФК-МВ)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (низкий)",
        color: "#10B981",
        description: "14-дн. риск событий ~ 5-8 %."
      },
      {
        min: 3,
        max: 4,
        label: "3-4 (умеренный)",
        color: "#F59E0B",
        description: "14-дн. риск ~ 13-20 %. Раннее инвазивное обсуждается."
      },
      {
        min: 5,
        max: 7,
        label: "5-7 (высокий)",
        color: "#EF4444",
        description: "14-дн. риск ≥ 26 %. Раннее инвазивное лечение.",
        details: "Высокий риск смерти/ИМ/рефрактерной ишемии. Показана ранняя инвазивная стратегия (КАГ ≤ 24 ч).",
        actions: [
          "Двойная антитромбоцитарная терапия (АСК + ингибитор P2Y12)",
          "Антикоагуляция (эноксапарин или фондапаринукс)",
          "Ранняя КАГ ≤ 24 ч, при стабильном состоянии",
          "β-блокаторы, статин высокой интенсивности, иАПФ"
        ]
      }
    ],
    maxScore: 7,
    caveats: [
      "Для UA/NSTEMI, не для STEMI (другая шкала TIMI для STEMI)",
      "GRACE точнее для госпитальной смертности",
      "Не учитывает сопутствующую патологию детально (только возраст)"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "heart",
        title: "HEART"
      },
      {
        id: "killip",
        title: "Killip"
      },
      {
        id: "chads-vasc",
        title: "CHA₂DS₂-VASc"
      }
    ],
    reference: "Antman EM. JAMA 2000. TIMI Risk Score for UA/NSTEMI.",
    info: "### Что считает шкала\nTIMI Risk Score прогнозирует **14-дневный риск** общей смертности, нового/повторного ИМ или тяжёлой рецидивирующей ишемии, требующей реваскуляризации, у пациентов с **нестабильной стенокардией / ИМ без подъёма ST (UA/NSTEMI)**.\n\n### Когда применять\n- Пациент поступил с болью в грудной клетке без подъёма ST\n- Получены первые тропонины и ЭКГ\n- Нужно решить - ранняя инвазивная стратегия или консервативное ведение\n\n### Интерпретация\n| Баллы | Риск 14-дн. | Тактика |\n|---|---|---|\n| 0-2 | 5-8 % | Консервативная стратегия, ишемия-направленное ведение |\n| 3-4 | 13-20 % | Обсудить раннюю инвазивную (КАГ ≤ 24 ч) |\n| 5-7 | ≥ 26 % | Ранняя инвазивная стратегия обязательна |\n\n### Ограничения\n- Не валидизирован для STEMI (для STEMI существует отдельная TIMI STEMI 0-14)\n- Не учитывает функцию почек и сердечную недостаточность - для этих параметров используйте **GRACE 2.0** (более точная при гетерогенной популяции)\n- Тропонин может быть ложноотрицательным в первые часы - оценивайте серийно\n\n### Ключевая формула\nСумма из 7 бинарных предикторов (по 1 баллу за каждый). Получена методом логистической регрессии на популяции исследования TIMI 11B/ESSENCE (n = 7081)."
  };

export default runner;
