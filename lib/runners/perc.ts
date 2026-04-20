// @ts-nocheck
/**
 * Runner: perc
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
    maxScore: 8,
    inputs: [
      {
        id: "age50",
        label: "Возраст ≥50",
        type: "checkbox",
        points: 1
      },
      {
        id: "hr100",
        label: "ЧСС ≥100",
        type: "checkbox",
        points: 1
      },
      {
        id: "spo2",
        label: "SpO₂ <95%",
        type: "checkbox",
        points: 1
      },
      {
        id: "leg",
        label: "Односторонний отёк ноги",
        type: "checkbox",
        points: 1
      },
      {
        id: "hemo",
        label: "Кровохаркание",
        type: "checkbox",
        points: 1
      },
      {
        id: "surg",
        label: "Недавняя операция/травма (≤4 нед)",
        type: "checkbox",
        points: 1
      },
      {
        id: "pe_hx",
        label: "ТГВ/ТЭЛА в анамнезе",
        type: "checkbox",
        points: 1
      },
      {
        id: "hormones",
        label: "Приём эстрогенов",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "PERC − (все отрицательные)",
        color: "#22C55E",
        description: "ТЭЛА <2%. D-димер не нужен, диагностика не требуется."
      },
      {
        min: 1,
        max: 8,
        label: "PERC + (≥1 критерий)",
        color: "#F59E0B",
        description: "PERC не может исключить ТЭЛА. D-димер / визуализация."
      }
    ],
    caveats: [
      "Применять ТОЛЬКО при низкой клинической вероятности (Wells ≤ 4 / gestalt < 15 %)",
      "Не применим у беременных, при предыдущей ТЭЛА, при активной онкологии",
      "Не использовать в стационаре - низкая специфичность",
      "Гипоксемия (SpO₂ < 95 %) автоматически исключает правило"
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      },
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
        id: "wells-dvt",
        title: "Wells для ТГВ"
      },
      {
        id: "pf-ratio",
        title: "P/F-ratio"
      }
    ],
    reference: "Kline 2004. Применяется у пациентов с низкой клинической вероятностью ТЭЛА.",
    info: "### Для чего используется\n**PERC rule (Pulmonary Embolism Rule-out Criteria, Kline 2004)** - набор из **8 клинических критериев** для исключения ТЭЛА **без D-димера** у пациентов с **низкой** клинической вероятностью.\n\nЦель - не перегружать пациентов лишними D-димерами и КТ-ангио, которые у молодых здоровых часто ложноположительные.\n\n### 8 критериев\n| Критерий | Значение |\n|---|---|\n| Возраст ≥ 50 лет | (+) |\n| ЧСС ≥ 100 | (+) |\n| SpO₂ < 95 % на воздухе | (+) |\n| Односторонний отёк ноги | (+) |\n| Кровохаркание | (+) |\n| Недавняя операция / травма ≤ 4 нед | (+) |\n| ТЭЛА/ТГВ в анамнезе | (+) |\n| Приём эстрогенов (КОК, ЗГТ) | (+) |\n\n**PERC отрицательный** = все 8 критериев \"нет\" → ТЭЛА исключена без D-димера (NPV ≈ 99,6 %).\n\n**PERC положительный** = хотя бы один \"да\" → переходим к D-димеру или визуализации.\n\n### Когда применять PERC\nТолько в популяции с **низкой вероятностью ТЭЛА** (Wells score низкий или гештальт-оценка < 15 %).\nВ популяции со средним/высоким риском PERC **не применяется** - негативные критерии не исключают ТЭЛА.\n\n### Алгоритм (ACEP 2018, ESC 2019)\n1. Гештальт клинициста: вероятность ТЭЛА **< 15 %**?\n   - Да → PERC rule\n     - Все отрицательны → **ТЭЛА исключена**, не делать D-димер\n     - ≥ 1 положительный → D-димер (age-adjusted)\n   - Нет → Wells score → см. алгоритм ТЭЛА\n\n### Почему PERC работает\nВалидизирован в > 8000 пациентов. Ложноотрицательный результат ≤ 1 %, что ниже риска радиации и контраста от КТ-ангио. Для популяции с pre-test probability < 15 % это клинически приемлемо.\n\n### Когда НЕ применять PERC\n- Умеренная/высокая pre-test probability\n- Hospitalized pациенты\n- Беременные (специальные алгоритмы: YEARS pregnancy, Geneva)\n- ТГВ/ТЭЛА в анамнезе\n- Онкология\n- Использовать **pulmonary embolism gestalt** - субъективная оценка опытного клинициста часто точнее формальных шкал для выбора, применим ли PERC\n\n### Age-adjusted D-димер (если PERC +)\nУ пациентов > 50 лет:\n`Cutoff (нг/мл FEU) = возраст × 10`\n\nПовышает специфичность с сохранением NPV.\n\n### PERC в педиатрии\nНе валидизирован у детей. ТЭЛА у детей редка, но недооценена. При подозрении - используйте клиническую оценку и соответствующие алгоритмы.\n\n### Ограничения\n- Не применим при высокой вероятности ТЭЛА\n- Культурные различия в шкале \"низкой вероятности\" клинициста\n- Не учитывает тромбофилию"
  };

export default runner;
