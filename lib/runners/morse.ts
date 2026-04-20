// @ts-nocheck
/**
 * Runner: morse
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
    maxScore: 125,
    inputs: [
      {
        id: "history",
        label: "Падения в анамнезе (за 3 мес)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "25",
            label: "25 - да",
            points: 25
          }
        ]
      },
      {
        id: "secondary",
        label: "Вторичный диагноз (≥ 2 мед. диагноза)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "15",
            label: "15 - да",
            points: 15
          }
        ]
      },
      {
        id: "aid",
        label: "Вспомогательное средство при ходьбе",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - не использует / постельный режим / помощь медсестры",
            points: 0
          },
          {
            value: "15",
            label: "15 - костыли / трость / ходунки",
            points: 15
          },
          {
            value: "30",
            label: "30 - опирается на мебель",
            points: 30
          }
        ]
      },
      {
        id: "iv",
        label: "Внутривенный катетер / гепариновый замок",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нет",
            points: 0
          },
          {
            value: "20",
            label: "20 - да",
            points: 20
          }
        ]
      },
      {
        id: "gait",
        label: "Походка",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нормальная / постельный режим / неподвижен",
            points: 0
          },
          {
            value: "10",
            label: "10 - слабая (шаркающая, короткий шаг)",
            points: 10
          },
          {
            value: "20",
            label: "20 - нарушенная (шатание, хватается за опору)",
            points: 20
          }
        ]
      },
      {
        id: "mental",
        label: "Ментальный статус",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - ориентирован в собственных возможностях",
            points: 0
          },
          {
            value: "15",
            label: "15 - переоценивает / забывает ограничения",
            points: 15
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 24,
        label: "0-24 - нет риска",
        color: "#22C55E",
        description: "Риск падения низкий.",
        actions: [
          "Стандартный уход, базовая профилактика",
          "Обучение пациента безопасному перемещению"
        ]
      },
      {
        min: 25,
        max: 44,
        label: "25-44 - низкий риск",
        color: "#F59E0B",
        description: "Низкий риск падения - стандартные меры профилактики.",
        actions: [
          "Низкая кровать, тормоза, зона досягаемости",
          "Ночное освещение, нескользящая обувь",
          "Регулярное опорожнение мочевого пузыря"
        ]
      },
      {
        min: 45,
        max: 125,
        label: "≥ 45 - высокий риск",
        color: "#EF4444",
        description: "Высокий риск падения - усиленная профилактика.",
        details: "Чувствительность MFS ≥ 45 для падений ~ 70-80 %, специфичность ~ 60 %. В некоторых учреждениях порог 51.",
        actions: [
          "Маркировка \"Fall Risk\" (браслет, знак над кроватью)",
          "Ближайшая к посту палата, видеонаблюдение",
          "Сигнальные датчики (bed/chair alarms)",
          "Сопровождение в туалет, планирование обходов каждый час",
          "Ревизия медикаментов (бензо, опиаты, гипнотики, α-блокаторы)",
          "Оценка ортостатики, зрения, обуви"
        ]
      }
    ],
    caveats: [
      "MFS валидирована в стационарах; в ОРИТ и амбулаторно - ограниченная применимость",
      "Пороговое значение варьирует (45 vs 51) в зависимости от учреждения",
      "Не заменяет клиническое суждение - пациенты с низким баллом всё равно могут упасть",
      "Должна выполняться при поступлении, изменении статуса и ежедневно"
    ],
    related: [
      {
        id: "tinetti",
        title: "Tinetti POMA"
      },
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      },
      {
        id: "braden",
        title: "Braden Scale"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Morse JM, Morse RM, Tylko SJ. Development of a scale to identify the fall-prone patient. Can J Aging 1989; 8:366-377.",
    countries: "Международный",
    presets: [
      {
        label: "Нет риска",
        values: {
          history: "0",
          secondary: "0",
          aid: "0",
          iv: "0",
          gait: "0",
          mental: "0"
        }
      },
      {
        label: "Низкий риск",
        values: {
          history: "0",
          secondary: "15",
          aid: "15",
          iv: "0",
          gait: "10",
          mental: "0"
        }
      },
      {
        label: "Высокий риск",
        values: {
          history: "25",
          secondary: "15",
          aid: "15",
          iv: "20",
          gait: "20",
          mental: "15"
        }
      }
    ],
    info: "### Для чего используется\n**Morse Fall Scale (MFS)** - наиболее распространённая больничная шкала оценки риска падений. 6 пунктов, сумма 0-125.\n\n### 6 пунктов\n| Пункт | 0 | Средний | Высокий |\n|---|---|---|---|\n| Падения в анамнезе | 0 | - | 25 (да) |\n| Вторичный диагноз | 0 | - | 15 (да) |\n| Средство ходьбы | 0 (нет / постельный) | 15 (трость/ходунки) | 30 (мебель) |\n| IV / heparin lock | 0 | - | 20 (да) |\n| Походка | 0 (норма / неподвижен) | 10 (слабая) | 20 (нарушенная) |\n| Ментальный статус | 0 (ориентирован) | - | 15 (переоценивает) |\n\n### Интерпретация\n| Сумма | Риск |\n|---|---|\n| 0-24 | Нет |\n| 25-44 | Низкий |\n| ≥ 45 | Высокий |\n\n(в некоторых учреждениях порог \"высокого\" - 51)\n\n### Альтернативы\n- **Hendrich II Fall Risk Model** - 8 факторов, ≥ 5 = высокий риск\n- **STRATIFY** (St Thomas's Risk Assessment Tool) - 5 пунктов, ≥ 2 = риск\n- **Timed Up and Go** - > 14 с = риск\n- **Berg Balance Scale** - ≤ 45/56 = риск\n\n### Ограничения\n- Чувствительность ~ 70-80 %, специфичность ~ 60 % (Gates 2008)\n- Высокий ложно-положительный уровень → усталость персонала\n- Должна повторяться при изменении состояния, не только при поступлении\n\n### Тактика (CDC STEADI)\n1. Screen: MFS / TUG\n2. Assess: походка, зрение, медикаменты, ортостатика, стопы\n3. Intervene: витамин D, упражнения, deprescribing, коррекция зрения, домашняя безопасность"
  };

export default runner;
