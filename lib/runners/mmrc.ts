// @ts-nocheck
/**
 * Runner: mmrc
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
    maxScore: 4,
    inputs: [
      {
        id: "class",
        label: "Степень одышки",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - Одышка только при значительной нагрузке",
            points: 0
          },
          {
            value: "1",
            label: "1 - Одышка при быстрой ходьбе или небольшом подъёме",
            points: 1
          },
          {
            value: "2",
            label: "2 - Ходит медленнее, чем сверстники / вынужден останавливаться",
            points: 2
          },
          {
            value: "3",
            label: "3 - Останавливается после 100 м или через несколько минут",
            points: 3
          },
          {
            value: "4",
            label: "4 - Одышка при одевании / выходе из дома",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 (лёгкая)",
        color: "#22C55E",
        description: "Минимальные симптомы."
      },
      {
        min: 2,
        max: 2,
        label: "2 (умеренная)",
        color: "#F59E0B",
        description: "GOLD: ≥2 - «более симптомный»."
      },
      {
        min: 3,
        max: 4,
        label: "3-4 (тяжёлая)",
        color: "#EF4444",
        description: "Тяжёлая одышка."
      }
    ],
    caveats: [
      "Субъективная оценка - зависит от привычек пациента и физической формы",
      "GOLD использует mMRC ≥ 2 ИЛИ CAT ≥ 10 для определения \"более симптомной\" группы",
      "Не заменяет объективную оценку (спирометрия, тест 6-мин ходьбы)"
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      }
    ],
    related: [
      {
        id: "gold",
        title: "GOLD ABE"
      },
      {
        id: "bode",
        title: "BODE"
      },
      {
        id: "act",
        title: "ACT (астма)"
      }
    ],
    reference: "Modified Medical Research Council. Используется для классификации ХОБЛ по GOLD.",
    info: "### Для чего используется\n**mMRC (modified Medical Research Council dyspnea scale)** - стандартная шкала оценки **выраженности одышки** при хронических заболеваниях лёгких (ХОБЛ, ИЛФ, бронхоэктазы). Основной компонент классификации GOLD ABE.\n\n### 5 градаций (0-4)\n| Балл | Описание одышки |\n|---|---|\n| **0** | Только при тяжёлой физической нагрузке |\n| **1** | При быстрой ходьбе по ровной местности или подъёме |\n| **2** | Хожу медленнее, чем сверстники, из-за одышки; или останавливаюсь на ровной при ходьбе в обычном темпе |\n| **3** | Останавливаюсь из-за одышки через 100 м или несколько минут ходьбы |\n| **4** | Одышка не позволяет выходить из дома или возникает при одевании |\n\n### Применение\n| Использование | Детали |\n|---|---|\n| **GOLD ABE** | Пороги: 0-1 низкие симптомы, ≥ 2 высокие |\n| **BODE index** | 1 из 4 параметров |\n| **Amp/Chronic bronchitis** | Оценка тяжести |\n| **NYHA analog** | Сравнимо с NYHA у СН |\n\n### Связанные шкалы\n| Шкала | Применение |\n|---|---|\n| **CAT (COPD Assessment Test)** | 0-40 баллов, 8 вопросов; более комплексная |\n| **SGRQ** | Качество жизни при респираторных болезнях |\n| **Borg** | Оценка одышки во время нагрузки |\n| **MDP (Multidimensional Dyspnea Profile)** | Исследовательская |\n\n### Связь с GOLD\n| mMRC | CAT | Группа GOLD (при обострениях ≤ 1) |\n|---|---|---|\n| 0-1 | < 10 | A (низкие симптомы) |\n| ≥ 2 | ≥ 10 | B (высокие симптомы) |\n\n### Ограничения\n- Субъективна, зависит от самоотчёта\n- Одна шкала для всех патологий (неспецифична)\n- Не отражает динамику в короткий период\n- Плохо коррелирует с ОФВ₁ у части пациентов"
  };

export default runner;
