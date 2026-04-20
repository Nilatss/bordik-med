// @ts-nocheck
/**
 * Runner: mmse
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
    maxScore: 30,
    inputs: [
      {
        id: "orientation_time",
        label: "Ориентация во времени (год, месяц, день, день недели, время)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 правильных",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "Все 5",
            points: 5
          }
        ]
      },
      {
        id: "orientation_place",
        label: "Ориентация в месте (страна, регион, город, учреждение, этаж)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "Все 5",
            points: 5
          }
        ]
      },
      {
        id: "registration",
        label: "Запоминание 3 слов",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 из 3",
            points: 0
          },
          {
            value: "1",
            label: "1 из 3",
            points: 1
          },
          {
            value: "2",
            label: "2 из 3",
            points: 2
          },
          {
            value: "3",
            label: "3 из 3",
            points: 3
          }
        ]
      },
      {
        id: "attention",
        label: "Внимание (счёт 100−7 × 5 раз ИЛИ МИР наоборот)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "Все 5",
            points: 5
          }
        ]
      },
      {
        id: "recall",
        label: "Воспроизведение 3 слов",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 из 3",
            points: 0
          },
          {
            value: "1",
            label: "1 из 3",
            points: 1
          },
          {
            value: "2",
            label: "2 из 3",
            points: 2
          },
          {
            value: "3",
            label: "3 из 3",
            points: 3
          }
        ]
      },
      {
        id: "naming",
        label: "Называние (часы, карандаш)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "Оба",
            points: 2
          }
        ]
      },
      {
        id: "repetition",
        label: "Повторение фразы («никаких если, или но»)",
        type: "checkbox",
        points: 1
      },
      {
        id: "command",
        label: "3-этапная команда (возьми лист, сложи, положи на пол)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "Все 3",
            points: 3
          }
        ]
      },
      {
        id: "reading",
        label: "Чтение и выполнение («закройте глаза»)",
        type: "checkbox",
        points: 1
      },
      {
        id: "writing",
        label: "Написать предложение",
        type: "checkbox",
        points: 1
      },
      {
        id: "drawing",
        label: "Копирование 2 пересекающихся пятиугольников",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 17,
        label: "≤17 (тяжёлая деменция)",
        color: "#991B1B",
        description: "Тяжёлые когнитивные нарушения."
      },
      {
        min: 18,
        max: 23,
        label: "18-23 (умеренная)",
        color: "#EF4444",
        description: "Умеренная деменция."
      },
      {
        min: 24,
        max: 26,
        label: "24-26 (лёгкая)",
        color: "#F59E0B",
        description: "Лёгкое когнитивное снижение."
      },
      {
        min: 27,
        max: 30,
        label: "27-30 (норма)",
        color: "#22C55E",
        description: "Без когнитивного дефицита."
      }
    ],
    caveats: [
      "Зависит от уровня образования, возраста, языка - корректировка по нормам",
      "Низкая чувствительность к MCI и лобно-исполнительным нарушениям - MoCA чувствительнее",
      "Не применим при афазии, тяжёлых нарушениях зрения/слуха, делирии",
      "Скрининг, не диагноз деменции (нужны критерии DSM-5 / NIA-AA)"
    ],
    related: [
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "phq9",
        title: "PHQ-9 (ДД псевдодеменция)"
      }
    ],
    reference: "Folstein 1975. Cutoff 24 часто используется, но зависит от образования и возраста.",
    info: "### Для чего используется\n**MMSE (Mini-Mental State Examination, Folstein 1975)** - классический скрининг **когнитивных нарушений и деменции**. Самый распространённый в мире тест на когнитивные функции.\n\n### Структура (30 баллов)\n| Домен | Баллы |\n|---|---|\n| Ориентация во времени | 5 |\n| Ориентация в пространстве | 5 |\n| Регистрация (3 слова) | 3 |\n| Внимание (100−7×5 или «МИР» наоборот) | 5 |\n| Воспроизведение (3 слова) | 3 |\n| Называние (часы, карандаш) | 2 |\n| Повторение («Никаких если, и, но») | 1 |\n| 3-этапная команда | 3 |\n| Чтение и выполнение | 1 |\n| Написание предложения | 1 |\n| Копирование пятиугольников | 1 |\n\n### Интерпретация\n| MMSE | Степень когнитивных нарушений |\n|---|---|\n| 30-28 | Норма |\n| 27-24 | Пограничная зона / лёгкое снижение |\n| 23-19 | Лёгкая деменция |\n| 18-10 | Умеренная |\n| < 10 | Тяжёлая |\n\n**Cutoff 24** - наиболее используемый порог (чувствительность 87 %, специфичность 82 %).\n\n### Коррекция по образованию и возрасту\nТочный порог зависит от уровня образования:\n\n| Образование | Cutoff |\n|---|---|\n| Неполное начальное | 20 |\n| Начальное | 23 |\n| Среднее | 26 |\n| Высшее | 29 |\n\n### Альтернативы (более современные)\n| Шкала | Преимущество |\n|---|---|\n| **MoCA (Montreal)** | Лучше выявляет лёгкие когнитивные нарушения (MCI), чувствительнее к лобной дисфункции |\n| **Mini-Cog** | Очень короткий (3 мин), подходит для первичной помощи |\n| **ACE-III (Addenbrooke's)** | Комплексный, для дифф. диагностики типов деменции |\n| **SLUMS** | Альтернатива в США |\n| **MIS (Memory Impairment Screen)** | 4 мин, узкофокусирован на памяти |\n\n### Применение\n| Ситуация | Использование |\n|---|---|\n| Скрининг деменции | В первичной помощи |\n| Мониторинг прогрессии | Повторы каждые 6-12 мес |\n| Оценка эффекта лечения | Донепезил, ривастигмин, галантамин, мемантин |\n| Сертификация для клинических исследований | Включение пациентов в RCT |\n\n### Ограничения\n- Патентованная шкала (коммерческие ограничения в США с 2001)\n- Низкая чувствительность к лёгким когнитивным нарушениям (MCI) - используйте MoCA\n- Плохо оценивает исполнительные функции (лобная дисфункция)\n- Языковые и культурные адаптации требуют валидации\n- Зависит от образования и языка"
  };

export default runner;
