// @ts-nocheck
/**
 * Runner: bishop
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
    maxScore: 13,
    inputs: [
      {
        id: "dilatation",
        label: "Раскрытие (см)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Закрыта",
            points: 0
          },
          {
            value: "1",
            label: "1–2",
            points: 1
          },
          {
            value: "2",
            label: "3–4",
            points: 2
          },
          {
            value: "3",
            label: "≥5",
            points: 3
          }
        ]
      },
      {
        id: "effacement",
        label: "Сглаженность (%)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0–30",
            points: 0
          },
          {
            value: "1",
            label: "40–50",
            points: 1
          },
          {
            value: "2",
            label: "60–70",
            points: 2
          },
          {
            value: "3",
            label: "≥80",
            points: 3
          }
        ]
      },
      {
        id: "station",
        label: "Позиция предлежащей части",
        type: "select",
        options: [
          {
            value: "0",
            label: "−3",
            points: 0
          },
          {
            value: "1",
            label: "−2",
            points: 1
          },
          {
            value: "2",
            label: "−1 / 0",
            points: 2
          },
          {
            value: "3",
            label: "+1 / +2",
            points: 3
          }
        ]
      },
      {
        id: "consistency",
        label: "Консистенция",
        type: "select",
        options: [
          {
            value: "0",
            label: "Плотная",
            points: 0
          },
          {
            value: "1",
            label: "Средняя",
            points: 1
          },
          {
            value: "2",
            label: "Мягкая",
            points: 2
          }
        ]
      },
      {
        id: "position",
        label: "Положение",
        type: "select",
        options: [
          {
            value: "0",
            label: "Кзади",
            points: 0
          },
          {
            value: "1",
            label: "Среднее",
            points: 1
          },
          {
            value: "2",
            label: "Кпереди",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 5,
        label: "0–5 (незрелая)",
        color: "#EF4444",
        description: "Шейка незрелая. Индукция малоэффективна без предварительной подготовки."
      },
      {
        min: 6,
        max: 8,
        label: "6–8 (переходная)",
        color: "#F59E0B",
        description: "Умеренно зрелая. Индукция возможна."
      },
      {
        min: 9,
        max: 13,
        label: "≥9 (зрелая)",
        color: "#22C55E",
        description: "Зрелая шейка. Успешная индукция вероятна."
      }
    ],
    caveats: [
      "Субъективная пальпаторная оценка — межрейтерская вариабельность",
      "При незрелой шейке (≤ 5) сначала preinduction: мизопростол / динопростон / Foley",
      "Не использовать при противопоказаниях к вагинальным родам",
      "Модифицированный Bishop (Laughon) точнее, но сложнее"
    ],
    related: [
      {
        id: "naegele",
        title: "Naegele (ПДР)"
      },
      {
        id: "apgar",
        title: "Apgar"
      }
    ],
    reference: "Bishop 1964. ≥8 — высокая вероятность вагинальных родов.",
    info: "### Для чего используется\n**Bishop score (Bishop 1964)** — прикроватная оценка **зрелости шейки матки** для прогноза успеха индукции родов.\n\n### Компоненты (сумма 0–13)\n| Параметр | 0 баллов | 1 балл | 2 балла | 3 балла |\n|---|---|---|---|---|\n| Раскрытие, см | 0 | 1–2 | 3–4 | ≥ 5 |\n| Длина / укорочение, % | 0–30 | 40–50 | 60–70 | ≥ 80 |\n| Положение (station) | −3 | −2 | −1 / 0 | +1 / +2 |\n| Консистенция | Плотная | Средняя | Мягкая | — |\n| Позиция шейки | Кзади | Срединная | Кпереди | — |\n\n### Интерпретация\n| Bishop | Прогноз индукции |\n|---|---|\n| ≤ 3 | Неблагоприятный. Требуется предварительное созревание (простагландины, баллон, мифепристон) |\n| 4–7 | Промежуточный. Возможна индукция с предварительной подготовкой |\n| ≥ 8 | Благоприятный. Высокая вероятность вагинальных родов, как при спонтанном начале |\n\n### Методы созревания шейки (при Bishop < 6)\n| Метод | Комментарий |\n|---|---|\n| Динопростон (PGE2) гель/вагинальная таблетка | Стандарт; повторы через 6 ч |\n| Мизопростол (PGE1) | 25 мкг интравагинально; эффективнее и дешевле |\n| Баллон Фолея / двойной баллон | Механически; безопасен при рубце на матке |\n| Мифепристон (РФ) | Преиндукция; 200 мг per os |\n| Амниотомия | Только при созревшей шейке |\n\n### Modified / Simplified Bishop\nУпрощённые версии используют 3 параметра (раскрытие, укорочение, положение) — корреляция сохраняется.\n\n### Ограничения\n- Субъективность при оценке консистенции и позиции\n- Низкая надёжность у нерожавших (PPV падает)\n- Не учитывает индивидуальные факторы (вес плода, индикацию)"
  };

export default runner;
