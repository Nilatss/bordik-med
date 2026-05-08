/**
 * Runner: ats
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
        label: "Категория ATS",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - Immediate: остановка, шок, апноэ, активные судороги",
            points: 1
          },
          {
            value: "2",
            label: "2 - 10 мин: критическая угроза (ОКС, инсульт <4.5 ч, тяжёлая боль >7)",
            points: 2
          },
          {
            value: "3",
            label: "3 - 30 мин: потенциально угрожающая (умеренная боль, умеренная одышка)",
            points: 3
          },
          {
            value: "4",
            label: "4 - 60 мин: потенциально серьёзная (лёгкая травма, лёгкая боль)",
            points: 4
          },
          {
            value: "5",
            label: "5 - 120 мин: менее срочная (хр. стабильные жалобы, административные)",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "ATS 1 - Immediate",
        color: "#DC2626",
        description: "Осмотр и лечение немедленно. Целевая performance - 100%.",
        actions: [
          "Reanimation bay",
          "ABCDE, монитор",
          "Немедленная команда"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "ATS 2 - 10 мин",
        color: "#EA580C",
        description: "Осмотр ≤ 10 мин. Целевая performance - 80%."
      },
      {
        min: 3,
        max: 3,
        label: "ATS 3 - 30 мин",
        color: "#FACC15",
        description: "Осмотр ≤ 30 мин. Целевая performance - 75%."
      },
      {
        min: 4,
        max: 4,
        label: "ATS 4 - 60 мин",
        color: "#22C55E",
        description: "Осмотр ≤ 60 мин. Целевая performance - 70%."
      },
      {
        min: 5,
        max: 5,
        label: "ATS 5 - 120 мин",
        color: "#3B82F6",
        description: "Осмотр ≤ 120 мин. Целевая performance - 70%."
      }
    ],
    caveats: [
      "ATS - основа для Activity-Based Funding в Австралии; аккуратная категоризация критична",
      "Категория определяется по «худшему» параметру (самому срочному)",
      "Педиатрические модификаторы отличаются - использовать PAT (Paediatric Assessment Triangle)",
      "Требует формального обучения (College of Emergency Nursing Australasia)"
    ],
    related: [
      {
        id: "ctas",
        title: "CTAS (Канада)"
      },
      {
        id: "mts",
        title: "MTS"
      },
      {
        id: "esi",
        title: "ESI v.5"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Australasian College for Emergency Medicine (ACEM). Guidelines on the Implementation of the Australasian Triage Scale, 2016.",
    countries: "Австралия",
    presets: [
      {
        label: "ОКС с элевацией ST",
        values: {
          level: "2"
        }
      },
      {
        label: "Перелом голени",
        values: {
          level: "3"
        }
      },
      {
        label: "Повтор рецепта",
        values: {
          level: "5"
        }
      }
    ],
    info: "### Для чего используется\n**ATS (Australasian Triage Scale)** - 5-категорийная система сортировки в приёмных отделениях Австралии и Новой Зеландии, поддерживаемая ACEM.\n\n### Критерии\n| Категория | Название | Макс. ожидание | Performance |\n|---|---|---|---|\n| 1 | Immediate | 0 мин | 100% |\n| 2 | Emergency | 10 мин | 80% |\n| 3 | Urgent | 30 мин | 75% |\n| 4 | Semi-urgent | 60 мин | 70% |\n| 5 | Non-urgent | 120 мин | 70% |\n\n### Типичные клинические примеры\n| Кат. | Пример |\n|---|---|\n| 1 | Остановка, апноэ, шок, GCS <9 |\n| 2 | ОКС, инсульт в окне тромболизиса, тяжёлая одышка, сепсис |\n| 3 | Умеренная одышка, умеренная боль (4-7), рвота с дегидратацией |\n| 4 | Лёгкая травма, лёгкая боль, инфекция моч. путей |\n| 5 | Хронические жалобы, рецепты, перевязки |\n\n### Интерпретация\nОценка проводится на основе самого срочного клинического признака (подход «worst-first»).\n\n### Ограничения\n- Требует обучения - без него низкая точность\n- У детей применимость ограничена - нужна PAT\n- Не применяется в MCI\n\n### Тактика\n- **1-2**: реанимационная зона\n- **3**: основная зона ER\n- **4-5**: fast-track"
  };

export default runner;
