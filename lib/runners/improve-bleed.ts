// @ts-nocheck
/**
 * Runner: improve-bleed
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
        id: "ulcer",
        label: "Активная гастродуоденальная язва",
        type: "checkbox",
        points: 4.5
      },
      {
        id: "bleed_3m",
        label: "Кровотечение < 3 мес до поступления",
        type: "checkbox",
        points: 4
      },
      {
        id: "plt_low",
        label: "Тромбоциты < 50 × 10⁹/л",
        type: "checkbox",
        points: 4
      },
      {
        id: "age85",
        label: "Возраст ≥ 85 лет",
        type: "checkbox",
        points: 3.5
      },
      {
        id: "age40_84",
        label: "Возраст 40–84 (если < 85)",
        type: "checkbox",
        points: 1.5
      },
      {
        id: "hepatic",
        label: "Печёночная недостаточность (INR > 1,5)",
        type: "checkbox",
        points: 2.5
      },
      {
        id: "gfr_lt15",
        label: "СКФ < 15 мл/мин",
        type: "checkbox",
        points: 2.5
      },
      {
        id: "gfr_15_29",
        label: "СКФ 15–29",
        type: "checkbox",
        points: 2
      },
      {
        id: "gfr_30_59",
        label: "СКФ 30–59",
        type: "checkbox",
        points: 1
      },
      {
        id: "icu",
        label: "ОРИТ / CCU",
        type: "checkbox",
        points: 2.5
      },
      {
        id: "cvc",
        label: "Центральный венозный катетер",
        type: "checkbox",
        points: 2
      },
      {
        id: "rheumatic",
        label: "Ревматическое заболевание",
        type: "checkbox",
        points: 2
      },
      {
        id: "cancer",
        label: "Активный рак",
        type: "checkbox",
        points: 2
      },
      {
        id: "male",
        label: "Мужской пол",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 6.5,
        label: "< 7 — низкий риск кровотечения",
        color: "#22C55E",
        description: "Фармакопрофилактика безопасна при высоком Padua.",
        actions: [
          "При Padua ≥ 4 — эноксапарин 40 мг",
          "Стандартный контроль Hb, Plt"
        ]
      },
      {
        min: 7,
        max: 20,
        label: "≥ 7 — высокий риск",
        color: "#EF4444",
        description: "Риск большого кровотечения ~ 4,1 %, любого ~ 7,9 %. Механическая профилактика предпочтительна.",
        details: "IMPROVE bleeding ≥ 7 — высокий риск. Избегать LMWH при высоком Padua, использовать IPC / компрессионные чулки. При снижении риска — переоценить назначение LMWH.",
        actions: [
          "Механическая профилактика: перемежающаяся пневмокомпрессия (IPC)",
          "Избегать LMWH / UFH до снижения риска",
          "Коррекция модифицируемых факторов (язва — ИПП, тромбоциты)",
          "Ежедневная переоценка"
        ]
      }
    ],
    caveats: [
      "Валидирован для терапевтических стационарных (MEDENOX-подобная когорта)",
      "Не применяется для хирургических или онкологических амбулаторных",
      "Пересекается с факторами Padua (возраст, рак) — не заменяет его, а дополняет",
      "При одновременном высоком Padua и IMPROVE bleeding — индивидуальное решение, чаще мех.профилактика"
    ],
    related: [
      {
        id: "padua",
        title: "Padua (VTE risk)"
      },
      {
        id: "has-bled",
        title: "HAS-BLED"
      },
      {
        id: "caprini",
        title: "Caprini"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      },
      {
        id: "300.4",
        title: "Неотложная"
      }
    ],
    countries: "Международный (ACCP 2012, ASH 2018)",
    reference: "Decousus H et al. Chest 2011; 139:69–79. IMPROVE registry.",
    presets: [
      {
        label: "Низкий (< 7)",
        values: {
          age40_84: true
        }
      },
      {
        label: "Высокий (язва + Plt)",
        values: {
          ulcer: true,
          plt_low: true,
          age40_84: true
        }
      },
      {
        label: "ОРИТ + ХПН",
        values: {
          icu: true,
          gfr_15_29: true,
          cvc: true,
          age40_84: true
        }
      }
    ],
    info: "### Для чего используется\n**IMPROVE bleeding risk (Decousus 2011)** — шкала оценки риска **большого кровотечения у терапевтических стационарных пациентов** при рассмотрении фармакопрофилактики ВТЭ. Пара к Padua Score.\n\n### Компоненты (максимальные веса)\n| Фактор | Баллы |\n|---|---|\n| Активная гастродуоденальная язва | 4,5 |\n| Кровотечение < 3 мес | 4 |\n| Plt < 50 | 4 |\n| Возраст ≥ 85 | 3,5 |\n| ICU / CCU | 2,5 |\n| СКФ < 15 | 2,5 |\n| INR > 1,5 / печ. недост. | 2,5 |\n| СКФ 15–29 | 2 |\n| ЦВК | 2 |\n| Ревматическое | 2 |\n| Рак | 2 |\n| Возраст 40–84 | 1,5 |\n| СКФ 30–59 | 1 |\n| Мужской пол | 1 |\n\n### Интерпретация\n| Баллы | Риск большого кровотечения (14 дн) |\n|---|---|\n| < 7 | ~ 0,4 % |\n| ≥ 7 | ~ 4,1 % |\n\nЛюбое кровотечение при ≥ 7: ~ 7,9 % vs 1,5 % при < 7.\n\n### Тактика\n| Padua / IMPROVE | Решение |\n|---|---|\n| Padua ≥ 4 + IMPROVE < 7 | LMWH (эноксапарин 40 мг) |\n| Padua ≥ 4 + IMPROVE ≥ 7 | **Механическая профилактика** (IPC/чулки) |\n| Padua < 4 | Мобилизация, без профилактики |\n\n### Ограничения\n- Разработан для терапевтических — не использовать для хирургических (для них — оценка индивидуальная)\n- Включает неспецифические факторы (возраст, мужской пол)\n- Переоценивать ежедневно\n\n### Источник\nDecousus H, Tapson VF, Bergmann JF et al. Factors at admission associated with bleeding risk in medical patients: findings from the IMPROVE investigators. *Chest* 2011; 139:69–79."
  };

export default runner;
