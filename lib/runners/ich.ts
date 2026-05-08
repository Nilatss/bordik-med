/**
 * Runner: ich
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
    maxScore: 6,
    inputs: [
      {
        id: "gcs",
        label: "GCS",
        type: "select",
        options: [
          {
            value: "0",
            label: "13-15",
            points: 0
          },
          {
            value: "1",
            label: "5-12",
            points: 1
          },
          {
            value: "2",
            label: "3-4",
            points: 2
          }
        ]
      },
      {
        id: "age",
        label: "Возраст ≥80 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "ivh",
        label: "Внутрижелудочковое кровоизлияние",
        type: "checkbox",
        points: 1
      },
      {
        id: "infratentorial",
        label: "Инфратенториальная локализация",
        type: "checkbox",
        points: 1
      },
      {
        id: "volume",
        label: "Объём ≥30 мл",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0",
        color: "#22C55E",
        description: "30-дн. смертность 0%."
      },
      {
        min: 1,
        max: 1,
        label: "1",
        color: "#84CC16",
        description: "13%."
      },
      {
        min: 2,
        max: 2,
        label: "2",
        color: "#F59E0B",
        description: "26%."
      },
      {
        min: 3,
        max: 3,
        label: "3",
        color: "#F97316",
        description: "72%."
      },
      {
        min: 4,
        max: 4,
        label: "4",
        color: "#EF4444",
        description: "97%."
      },
      {
        min: 5,
        max: 6,
        label: "5-6",
        color: "#991B1B",
        description: "100%."
      }
    ],
    caveats: [
      "Прогностическая, но не терапевтическая - высокий балл ≠ отказ от активной терапии",
      "Требует объёма гематомы - обычно из КТ (формула ABC/2)",
      "DNR-решения не должны основываться только на шкале"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "nihss",
        title: "NIHSS"
      },
      {
        id: "mrs-stroke",
        title: "mRS"
      }
    ],
    reference: "Hemphill 2001. Простая шкала для ВМК.",
    info: "### Для чего используется\n**ICH Score (Hemphill 2001)** - прикроватная оценка **30-дневной смертности при внутримозговом кровоизлиянии (ВМК)**. Помогает в коммуникации с семьями, принятии решений о хирургии, ICU-интенсивности.\n\n### Компоненты (0-6 баллов)\n| Параметр | 0 | 1 | 2 |\n|---|---|---|---|\n| **GCS** | 13-15 | 5-12 | 3-4 |\n| **Объём ВМК** | < 30 мл | ≥ 30 мл | - |\n| **Внутрижелудочковое** | Нет | Есть | - |\n| **Инфратенториальное** (ствол, мозжечок) | Нет | Есть | - |\n| **Возраст** | < 80 лет | ≥ 80 лет | - |\n\n### Объём ВМК (метод ABC/2)\nФормула на КТ: **(A × B × C) / 2**, где A - максимальная длина, B - ширина, C - количество срезов × толщину.\n\n### 30-дневная смертность\n| ICH Score | Смертность |\n|---|---|\n| 0 | 0 % |\n| 1 | 13 % |\n| 2 | 26 % |\n| 3 | 72 % |\n| 4 | 97 % |\n| 5 | 100 % |\n| 6 | 100 % |\n\n### Тактика при ВМК (AHA 2022, INTERACT3)\n| Мероприятие | Детали |\n|---|---|\n| **АД-контроль** | САД < 140 в первые 6 ч (INTERACT3); избегать < 110 |\n| **Реверс антикоагуляции** | Варфарин: ПКЦ 4-факторный + витамин K; DOAC: идаруцизумаб (дабигатран), андексанет (ривар/апикс) |\n| **Тромбоциты** | Не переливать рутинно (PATCH - хуже исходы) |\n| **Хирургическое удаление** | Мозжечковые > 3 см с гидроцефалией / сдавлением ствола - экстренно; супратенториальные - спорно |\n| **EVD** | При внутрижелудочковом кровотечении и гидроцефалии |\n| **Гиперосмолярная терапия** | При признаках вклинения |\n| **Антиэпилептики** | Только при судорогах, не профилактически |\n\n### FUNC score (дополняет ICH Score)\nПрогноз функционального исхода через 3 месяца (не только смертности).\n\n### Ограничения\n- Не учитывает этиологию (амилоидоз, гипертензивная, АВМ)\n- Не прогнозирует качество жизни у выживших\n- Объём ABC/2 - приближённый\n- Не отражает позднее лечение (реабилитацию)"
  };

export default runner;
