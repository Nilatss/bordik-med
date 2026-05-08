/**
 * Runner: kocher
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
        id: "fever",
        label: "Лихорадка > 38,5 °C",
        type: "checkbox",
        points: 1
      },
      {
        id: "wbear",
        label: "Невозможность нагрузки на ногу",
        type: "checkbox",
        points: 1
      },
      {
        id: "esr",
        label: "СОЭ > 40 мм/ч",
        type: "checkbox",
        points: 1
      },
      {
        id: "wbc",
        label: "Лейкоцитоз > 12 ×10⁹/л",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1",
        color: "#10B981",
        description: "Вероятность септического артрита < 3 %."
      },
      {
        min: 2,
        max: 2,
        label: "2",
        color: "#F59E0B",
        description: "Вероятность ~ 40 %. УЗИ/пункция."
      },
      {
        min: 3,
        max: 3,
        label: "3",
        color: "#EF4444",
        description: "Вероятность ~ 93 %. Срочная пункция, хирург."
      },
      {
        min: 4,
        max: 4,
        label: "4",
        color: "#EF4444",
        description: "Вероятность ~ 99 %. Срочная операция."
      }
    ],
    maxScore: 4,
    caveats: [
      "Валидизирован для тазобедренного сустава у детей (2-16 лет)",
      "При высокой вероятности - диагностическая пункция под анестезией",
      "Дифдиагноз: транзиторный синовит, остеомиелит, болезнь Пертеса, ЮИА",
      "При подозрении всегда посев крови + синовиальной жидкости + СРБ/лейкоциты/СОЭ"
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      }
    ],
    related: [
      {
        id: "pas",
        title: "PAS"
      },
      {
        id: "alvarado",
        title: "Alvarado"
      }
    ],
    reference: "Kocher MS. JBJS 1999. Septic arthritis of the hip in children.",
    info: "### Что предсказывает\nВероятность **септического артрита тазобедренного сустава** у ребёнка с болью в бедре/ноге, в дифф. диагнозе с **транзиторным синовиитом**.\n\n### 4 критерия (по 1 баллу)\n- Невозможность нагрузки на ногу\n- СОЭ > 40 мм/ч\n- Лихорадка > 38,5 °C\n- Лейкоцитоз > 12 ×10⁹/л\n\n### Вероятность септического артрита\n| Баллов | Kocher 1999 | Caird 2006 (валидизация) |\n|---|---|---|\n| 0 | < 0,2 % | < 17 % |\n| 1 | 3 % | 17 % |\n| 2 | 40 % | 62 % |\n| 3 | 93 % | 83 % |\n| 4 | 99 % | 98 % |\n\n### Действия\n- **0 баллов**: транзиторный синовиит вероятен; НПВС, наблюдение, повторный осмотр через 24 ч\n- **1 балл**: УЗИ ТБС; если выпот - пункция\n- **2+ балла**: УЗИ + **пункция сустава** под анестезией; при подтверждении - артротомия + антибиотики в/в (цефазолин, цефтриаксон у > 5 лет; добавить ванкомицин при риске MRSA)\n\n### Современные модификации\n- Добавление **CRP > 20 мг/л** (Caird) - повышает точность\n- **Pediatric Septic Arthritis Score (PSAS)** включает CRP\n\n### Возбудители\n- Дети < 4 лет: **Kingella kingae** (часто требует ПЦР, плохо растёт на стандартных средах)\n- > 4 лет: **S. aureus** (включая MSSA/MRSA)\n- Подростки сексуально активные: **N. gonorrhoeae**\n\n### Ограничения\n- Низкая прогностическая ценность при 0 баллах ≠ исключает диагноз; при сильном клиническом подозрении - пункция\n- Не применимо к коленному, голеностопному и др. суставам"
  };

export default runner;
