/**
 * Runner: ecog
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
    maxScore: 5,
    inputs: [
      {
        id: "level",
        label: "Статус ECOG",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - полностью активен, без ограничений",
            points: 0
          },
          {
            value: "1",
            label: "1 - ограничения в физически напряжённой активности, но амбулаторен",
            points: 1
          },
          {
            value: "2",
            label: "2 - амбулаторен, самообслуживание сохранено, активен > 50% дня",
            points: 2
          },
          {
            value: "3",
            label: "3 - ограниченное самообслуживание, в постели/кресле > 50% дня",
            points: 3
          },
          {
            value: "4",
            label: "4 - полностью нетрудоспособен, постоянно в постели/кресле",
            points: 4
          },
          {
            value: "5",
            label: "5 - смерть",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 - активен",
        color: "#22C55E",
        description: "Нормальная или почти нормальная активность. Подходит для полной дозы ХТ и клинических исследований.",
        actions: [
          "Стандартная противоопухолевая терапия",
          "Отбор в клинические исследования (большинство требуют ECOG 0-1)"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "2 - амбулаторен, не работает",
        color: "#F59E0B",
        description: "Пограничная группа для химиотерапии.",
        details: "Включение в исследования ограничено (многие протоколы требуют ECOG ≤ 1). Оценить обратимые причины снижения статуса.",
        actions: [
          "Рассмотреть редукцию дозы или таргетную/иммунотерапию",
          "Параллельная паллиативная помощь (ASCO / ESMO 2017)",
          "Оценка анемии, боли, депрессии, кахексии"
        ]
      },
      {
        min: 3,
        max: 4,
        label: "3-4 - нуждается в уходе",
        color: "#EF4444",
        description: "Цитотоксическая химиотерапия обычно не показана.",
        details: "Смертность при попытке системной ХТ у ECOG 3-4 значительно выше; фокус на симптом-контроле и качестве жизни.",
        actions: [
          "Best Supportive Care, хоспис",
          "Паллиативная лучевая терапия при локальных симптомах",
          "Goals-of-care discussion, advance care planning"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "5 - смерть",
        color: "#1A1A1A",
        description: "Летальный исход."
      }
    ],
    caveats: [
      "Субъективная оценка - межрейтерская κ ≈ 0.5-0.7",
      "У пожилых одной ECOG недостаточно - добавить CFS, G8, CGA",
      "Не отражает когнитивный и эмоциональный статус",
      "Кратковременные обратимые ухудшения (инфекция, анемия) могут завышать балл"
    ],
    related: [
      {
        id: "kps",
        title: "Karnofsky Performance Status"
      },
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      },
      {
        id: "barthel",
        title: "Barthel ADL"
      }
    ],
    relatedCourses: [
      {
        id: "301.7",
        title: "Онкология"
      }
    ],
    reference: "Oken MM, Creech RH, Tormey DC, et al. Toxicity and response criteria of the Eastern Cooperative Oncology Group. Am J Clin Oncol 1982; 5:649-655.",
    countries: "Международный (ECOG/WHO)",
    presets: [
      {
        label: "Активный пациент",
        values: {
          level: "1"
        }
      },
      {
        label: "Пограничный (ECOG 2)",
        values: {
          level: "2"
        }
      },
      {
        label: "Нуждается в уходе",
        values: {
          level: "3"
        }
      }
    ],
    info: "### Для чего используется\n**ECOG Performance Status** (также WHO / Zubrod) - 6-балльная шкала функционального статуса онкологических пациентов. Проще и воспроизводимее KPS. Используется для отбора в клинические исследования, выбора режима ХТ, прогноза.\n\n### Критерии\n| Балл | Описание |\n|---|---|\n| 0 | Полностью активен, без ограничений |\n| 1 | Ограничен в физически напряжённой активности, но амбулаторен, способен к лёгкой работе |\n| 2 | Амбулаторен, самообслуживание сохранено, неспособен к работе; активен > 50 % дня |\n| 3 | Ограниченное самообслуживание; в постели или кресле > 50 % дня |\n| 4 | Полностью нетрудоспособен; не способен к самообслуживанию; постоянно в постели/кресле |\n| 5 | Смерть |\n\n### KPS ↔ ECOG\n| ECOG | KPS |\n|---|---|\n| 0 | 100 |\n| 1 | 80-90 |\n| 2 | 60-70 |\n| 3 | 40-50 |\n| 4 | 10-30 |\n| 5 | 0 |\n\n### Применение\n- **Клинические исследования**: большинство требуют ECOG ≤ 1, иногда ≤ 2\n- **Химиотерапия**: ECOG 0-1 - полная доза, 2 - пограничная, ≥ 3 - не показана\n- **Прогноз**: ECOG ≥ 2 - медиана выживаемости существенно короче\n\n### Ограничения\n- Межрейтерская κ ≈ 0.5-0.7\n- Не учитывает когницию, боль, кахексию - дополнить ESAS/NRS/MMSE\n- У пожилых использовать Comprehensive Geriatric Assessment (CGA)\n\n### Тактика\n- **0-1** - стандартная терапия\n- **2** - редукция дозы, таргетные, иммунотерапия, ранний паллиатив\n- **3-4** - BSC, хоспис, advance care planning"
  };

export default runner;
