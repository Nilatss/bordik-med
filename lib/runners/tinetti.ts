// @ts-nocheck
/**
 * Runner: tinetti
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
    maxScore: 28,
    inputs: [
      {
        id: "balance",
        label: "Балансная часть (0-16): сидя, вставание, попытки вставания, балан сразу после вставания, стоя, толчок, глаза закрыты, поворот на 360°, садиться",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - неспособен",
            points: 0
          },
          {
            value: "4",
            label: "4 - выраженные нарушения",
            points: 4
          },
          {
            value: "8",
            label: "8 - умеренные нарушения",
            points: 8
          },
          {
            value: "12",
            label: "12 - лёгкие нарушения",
            points: 12
          },
          {
            value: "14",
            label: "14 - минимальные нарушения",
            points: 14
          },
          {
            value: "16",
            label: "16 - норма",
            points: 16
          }
        ]
      },
      {
        id: "gait",
        label: "Походка (0-12): начало, длина/высота шага, симметрия, непрерывность, путь, туловище, позиция при ходьбе",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - неспособен",
            points: 0
          },
          {
            value: "3",
            label: "3 - выраженные нарушения",
            points: 3
          },
          {
            value: "6",
            label: "6 - умеренные нарушения",
            points: 6
          },
          {
            value: "9",
            label: "9 - лёгкие нарушения",
            points: 9
          },
          {
            value: "12",
            label: "12 - норма",
            points: 12
          }
        ]
      }
    ],
    bands: [
      {
        min: 25,
        max: 28,
        label: "25-28 - низкий риск падений",
        color: "#22C55E",
        description: "Риск падения низкий.",
        actions: [
          "Поддержание активности, профилактика (упражнения, витамин D)"
        ]
      },
      {
        min: 19,
        max: 24,
        label: "19-24 - умеренный риск",
        color: "#F59E0B",
        description: "Умеренный риск падений.",
        actions: [
          "Программа упражнений на баланс (Tai Chi, Otago)",
          "Оценка дома на безопасность (коврики, поручни, освещение)",
          "Ревизия медикаментов"
        ]
      },
      {
        min: 0,
        max: 18,
        label: "≤ 18 - высокий риск",
        color: "#EF4444",
        description: "Высокий риск падений.",
        details: "При Tinetti ≤ 18 риск падений ~ 5× выше по сравнению с ≥ 25.",
        actions: [
          "Вспомогательное средство (трость, ходунки) + оценка физиотерапевта",
          "Структурированная программа реабилитации (ЛФК, PT, OT)",
          "Обучение родственников безопасному сопровождению",
          "Ревизия медикаментов (бензо, опиаты, α-блокаторы, антихолинергики)",
          "Оценка ортостатики, зрения, обуви, стоп"
        ]
      }
    ],
    caveats: [
      "Выполняется ~ 10-15 мин; требует место для ходьбы ≥ 3 м",
      "Менее чувствителен у хорошо функционирующих пожилых (ceiling effect)",
      "Межрейтерская надёжность выше при обучении (ICC > 0.85)",
      "Не заменяет многофакторную оценку риска падений (CDC STEADI)"
    ],
    related: [
      {
        id: "morse",
        title: "Morse Fall Scale"
      },
      {
        id: "edmonton-frail",
        title: "Edmonton Frail Scale"
      },
      {
        id: "barthel",
        title: "Barthel ADL"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Tinetti ME. Performance-oriented assessment of mobility problems in elderly patients. J Am Geriatr Soc 1986; 34:119-126.",
    countries: "Международный",
    presets: [
      {
        label: "Норма",
        values: {
          balance: "16",
          gait: "12"
        }
      },
      {
        label: "Умеренный риск",
        values: {
          balance: "14",
          gait: "9"
        }
      },
      {
        label: "Высокий риск",
        values: {
          balance: "8",
          gait: "6"
        }
      }
    ],
    info: "### Для чего используется\n**Tinetti Performance-Oriented Mobility Assessment (POMA)** - оценка баланса и походки у пожилых. Две части: баланс (0-16) + походка (0-12) = 0-28. Чем ниже, тем выше риск падений.\n\n### Компоненты\n**Balance (9 пунктов, 0-16):**\n- Сидячий баланс\n- Вставание со стула\n- Попытки встать\n- Непосредственный баланс после вставания (5 с)\n- Стоячий баланс\n- Стоячий баланс при толчке\n- Стоя с закрытыми глазами\n- Поворот на 360°\n- Посадка\n\n**Gait (7 пунктов, 0-12):**\n- Начало ходьбы\n- Длина и высота шага\n- Симметрия шага\n- Непрерывность\n- Путь (отклонение)\n- Туловище\n- Позиция при ходьбе (узкая / широкая база)\n\n### Интерпретация\n| Сумма | Риск падений |\n|---|---|\n| 25-28 | Низкий |\n| 19-24 | Умеренный |\n| ≤ 18 | Высокий |\n\n### Альтернативы\n| Инструмент | Диапазон | Порог риска |\n|---|---|---|\n| **Berg Balance Scale** | 0-56 | ≤ 45 = риск |\n| **Timed Up and Go (TUG)** | с | > 14 с = риск |\n| **Short Physical Performance Battery (SPPB)** | 0-12 | ≤ 9 = риск |\n\n### Ограничения\n- Требует места для ходьбы\n- Ceiling effect у активных пожилых\n- Не учитывает когнитивные и медикаментозные факторы\n\n### Тактика\n- **≥ 25** - профилактика, vit D, упражнения\n- **19-24** - Tai Chi / Otago программа, оценка дома\n- **≤ 18** - вспомогательные средства, PT/OT, ревизия лекарств"
  };

export default runner;
