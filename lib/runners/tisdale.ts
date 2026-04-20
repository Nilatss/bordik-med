// @ts-nocheck
/**
 * Runner: tisdale
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
    maxScore: 21,
    inputs: [
      {
        id: "age68",
        label: "Возраст ≥68 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox",
        points: 1
      },
      {
        id: "loop",
        label: "Петлевой диуретик",
        type: "checkbox",
        points: 1
      },
      {
        id: "hypoK",
        label: "K⁺ <3,5 ммоль/л",
        type: "checkbox",
        points: 2
      },
      {
        id: "qtc_admit",
        label: "QTc при поступлении ≥450 мс",
        type: "checkbox",
        points: 2
      },
      {
        id: "mi",
        label: "Острый инфаркт миокарда",
        type: "checkbox",
        points: 2
      },
      {
        id: "two_qt_drugs",
        label: "≥2 QT-удлиняющих препарата",
        type: "checkbox",
        points: 3
      },
      {
        id: "sepsis",
        label: "Сепсис",
        type: "checkbox",
        points: 3
      },
      {
        id: "hf",
        label: "Сердечная недостаточность",
        type: "checkbox",
        points: 3
      },
      {
        id: "one_qt_drug",
        label: "1 QT-удлиняющий препарат",
        type: "checkbox",
        points: 3
      }
    ],
    bands: [
      {
        min: 0,
        max: 6,
        label: "≤6 - низкий риск",
        color: "#22C55E",
        description: "Низкий риск QT-удлинения в стационаре (~15% по оригинальной когорте Tisdale).",
        details: "Рутинный мониторинг ЭКГ при добавлении QT-удлиняющих препаратов. При стабильном K/Mg и отсутствии новых ФР - без дополнительных мер.",
        actions: [
          "Базовая ЭКГ перед началом QT-удлиняющего препарата",
          "Контроль K (≥4,0) и Mg (≥2,0) ммоль/л",
          "Повторная оценка при новых ФР / препаратах"
        ]
      },
      {
        min: 7,
        max: 10,
        label: "7-10 - умеренный риск",
        color: "#F59E0B",
        description: "Умеренный риск (~37% развивают QT >500 мс по оригинальному валидированию).",
        details: "Требуется активный мониторинг: ЭКГ ежедневно или после каждой новой дозы, контроль электролитов. Пересмотреть необходимость QT-удлиняющих препаратов.",
        actions: [
          "ЭКГ при поступлении и через 8-12 ч после начала/коррекции дозы",
          "Контроль K ≥4,0 и Mg ≥2,0 ммоль/л",
          "Избегать комбинаций QT-удлиняющих препаратов",
          "Рассмотреть альтернативы (CredibleMeds.org)"
        ]
      },
      {
        min: 11,
        max: 21,
        label: "≥11 - высокий риск",
        color: "#EF4444",
        description: "Высокий риск torsades de pointes (~73% развивают QT >500 по Tisdale 2013).",
        details: "Критический риск TdP. Избегать QT-удлиняющих препаратов, если возможно. При необходимости - телеметрия, ежедневная ЭКГ, агрессивная коррекция электролитов, готовность к MgSO4 в/в.",
        actions: [
          "Телеметрия на весь период приёма QT-удлиняющих препаратов",
          "ЭКГ перед каждой дозой + через 2-4 ч",
          "K ≥4,5; Mg ≥2,5 ммоль/л (профилактически)",
          "При QTc ≥500 или Δ≥60 мс - отмена препарата",
          "MgSO4 4 г в/в при torsades; изопреналин / кардиостимуляция при брадизависимых TdP"
        ]
      }
    ],
    reference: "Tisdale JE, Jaynes HA, Kingery JR et al. Development and validation of a risk score to predict QT interval prolongation in hospitalized patients. Circ Cardiovasc Qual Outcomes 2013;6:479-487.",
    countries: "Международный (AHA · HRS · CredibleMeds)",
    caveats: [
      "Разработан и валидирован в CCU-популяции; ограниченно экстраполируется на амбулаторных",
      "QT-удлиняющие препараты - см. CredibleMeds.org (список \"known\", \"possible\", \"conditional\" TdP risk)",
      "QTc рассчитывать по Bazett (ЧСС 60-100) или Fridericia (вне этого диапазона)",
      "Не заменяет клиническую оценку - при QTc ≥500 отмена независимо от балла Tisdale"
    ],
    related: [
      {
        id: "qtc",
        title: "QTc (коррекция)"
      },
      {
        id: "lqts",
        title: "Schwartz (LQTS)"
      },
      {
        id: "brugada",
        title: "Brugada (VT vs SVT)"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    info: "### Для чего используется\n**Tisdale risk score** - прогнозирование риска лекарственно-индуцированного удлинения QT и torsades de pointes (TdP) у госпитализированных пациентов в CCU/ICU.\n\n### Критерии и баллы\n| Фактор | Баллы |\n|---|---|\n| Возраст ≥68 лет | 1 |\n| Женский пол | 1 |\n| Петлевой диуретик | 1 |\n| K⁺ <3,5 ммоль/л | 2 |\n| QTc при поступлении ≥450 мс | 2 |\n| Острый ИМ | 2 |\n| ≥2 QT-удлиняющих препарата | 3 |\n| Сепсис | 3 |\n| Сердечная недостаточность | 3 |\n| 1 QT-удлиняющий препарат | 3 |\n| **Максимум** | **21** |\n\n### Интерпретация\n| Балл | Риск | % развивающих QTc >500 (Tisdale 2013) |\n|---|---|---|\n| ≤6 | Низкий | ~15% |\n| 7-10 | Умеренный | ~37% |\n| ≥11 | Высокий | ~73% |\n\n### QT-удлиняющие препараты (примеры из CredibleMeds.org, Known risk)\n| Класс | Примеры |\n|---|---|\n| Антиаритмики I/III | Амиодарон, соталол, дофетилид, ибутилид, хинидин |\n| Антибиотики | Макролиды (эритромицин, кларитромицин, азитромицин), фторхинолоны (моксифлоксацин, ципрофлоксацин) |\n| Противогрибковые | Флуконазол, вориконазол, кетоконазол |\n| Антипсихотики | Галоперидол, хлорпромазин, тиоридазин, зипразидон |\n| Антидепрессанты | Циталопрам (>40 мг), эсциталопрам |\n| Противорвотные | Ондансетрон (>16 мг в/в), домперидон |\n| Другие | Метадон, сертиндол, пимозид, цизаприд |\n\n### Тактика по баллу\n| Балл | Мониторинг |\n|---|---|\n| ≤6 | Базовая ЭКГ, контроль K/Mg |\n| 7-10 | ЭКГ q12ч, K ≥4,0, Mg ≥2,0, избегать комбинаций |\n| ≥11 | Телеметрия, ЭКГ q6ч, K ≥4,5, Mg ≥2,5; рассмотреть альтернативы |\n\n### Действие при QTc ≥500 мс или ΔQTc ≥60 мс\n1. Отмена QT-удлиняющего препарата\n2. Коррекция K (4,5-5,0) и Mg (2,5) в/в\n3. Телеметрия\n4. При TdP: **MgSO4 2-4 г в/в болюс + инфузия**, кардиоверсия при нестабильной ЖТ\n5. Изопреналин или overdrive pacing при брадизависимых TdP\n6. Отмена провоцирующих препаратов\n\n### Расчёт QTc\n| Формула | Применение |\n|---|---|\n| **Bazett**: QT/√RR | ЧСС 60-100 |\n| **Fridericia**: QT/RR^⅓ | При ЧСС <60 или >100 (более точна) |\n| Framingham | QT + 0,154 × (1 − RR) |\n\n### Ограничения\n- Разработан на CCU-популяции (Tisdale 2013, n=900), валидирован в стационаре\n- Не прогнозирует риск вне стационара\n- Не учитывает генетические причины (KCNH2, SCN5A мутации - LQTS)\n- При врождённом LQTS - использовать Schwartz score"
  };

export default runner;
