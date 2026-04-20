// @ts-nocheck
/**
 * Runner: acdu
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
        id: "level",
        label: "Уровень сознания (ACDU)",
        type: "select",
        options: [
          {
            value: "4",
            label: "A - Alert (ясное сознание)",
            points: 4
          },
          {
            value: "3",
            label: "C - Confused (спутанность, дезориентация)",
            points: 3
          },
          {
            value: "2",
            label: "D - Drowsy (сонливость, но пробуждается)",
            points: 2
          },
          {
            value: "1",
            label: "U - Unresponsive (нет реакции)",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 4,
        max: 4,
        label: "A - Alert",
        color: "#22C55E",
        description: "Ясное сознание, ориентирован.",
        actions: [
          "Рутинный мониторинг"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "C - Confused",
        color: "#F59E0B",
        description: "Спутанность / дезориентация.",
        details: "Часто пропускается AVPU (пациент «alert», но дезориентирован). Ранний маркер делирия, гипоксии, инфекции.",
        actions: [
          "CAM / 4AT для оценки делирия",
          "Скрининг: глюкоза, SpO₂, температура, электролиты",
          "Поиск инфекции (моча, рентген, кровь)"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "D - Drowsy",
        color: "#EF4444",
        description: "Сонливость, пробуждается на стимул.",
        actions: [
          "GCS / FOUR",
          "Мониторинг каждые 15 мин",
          "Оценка дыхательных путей"
        ]
      },
      {
        min: 1,
        max: 1,
        label: "U - Unresponsive",
        color: "#991B1B",
        description: "Нет реакции.",
        actions: [
          "Интубация, ICU",
          "ABCDE, КТ головы"
        ]
      }
    ],
    caveats: [
      "ACDU чувствительнее AVPU к лёгкому ухудшению (добавляет уровень Confused)",
      "Glasgow-Liege = GCS + 5 стволовых рефлексов (0-20) - точнее при коме",
      "Jouvet coma scale (0-4 × 4 компонента) - французская классификация",
      "Все «4-уровневые» шкалы - только скрининг; при D/U обязательно GCS или FOUR"
    ],
    related: [
      {
        id: "avpu",
        title: "AVPU"
      },
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "four",
        title: "FOUR"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Grady Memorial Hospital (Atlanta) 1988. Вариант AVPU с добавлением уровня «Confused» для раннего выявления делирия.",
    countries: "США · Международный",
    info: "### Для чего используется\n**ACDU (Grady Coma Scale)** - 4-уровневая альтернатива AVPU. Добавляет уровень **Confused** (спутанность) - часто пропускаемый AVPU, но важный при делирии, раннем сепсисе, гипоксии.\n\n### Уровни\n| Буква | Значение | GCS ~ |\n|---|---|---|\n| **A** | Alert | 15 |\n| **C** | Confused - дезориентирован, но отвечает | 13-14 |\n| **D** | Drowsy - сонлив, но пробуждается | 9-12 |\n| **U** | Unresponsive | ≤ 8 |\n\n### Варианты «расширенных» шкал сознания\n| Шкала | Описание |\n|---|---|\n| **ACDU** (Grady) | A / C / D / U |\n| **Jouvet** | 4 уровня (ответ, движения глаз) × 4 компонента |\n| **Glasgow-Liege** | GCS (3-15) + 5 стволовых рефлексов (0-5) = 0-20 |\n| **Innsbruck Coma Scale** | 7 компонентов, 0-23 |\n| **FOUR** | E/M/B/R × 0-4 (современный стандарт) |\n\n### Glasgow-Liege score (GLS)\n| Параметр | Баллы |\n|---|---|\n| GCS | 3-15 |\n| Лоб-вестибуло-глазной рефлекс | 5 |\n| Вертикальный окуло-цефалический | 4 |\n| Зрачковый | 3 |\n| Горизонтальный окуло-цефалический | 2 |\n| Окуло-кардиальный | 1 |\n| **Всего** | 0-20 |\n\nGLS < 7 - тяжёлая кома, > 70 % смертности.\n\n### Преимущества ACDU\n- Простота\n- Улавливает спутанность (пропускается AVPU)\n- Полезен в палате после операции / экстренной помощи\n\n### Ограничения\n- Не объективизирует (нет балла для моторики / речи)\n- Не применяется для прогноза\n\n### Тактика\n- **A** - мониторинг\n- **C** - CAM, 4AT, лабораторный скрининг\n- **D** - GCS, FOUR, нейровизуализация\n- **U** - интубация, ICU\n\n### Источник\nSmith J, Fay ML. **The Alert / Confused / Drowsy / Unresponsive (ACDU) coma scale.** Grady Memorial Hospital, Atlanta, 1988. Born JD. **The Glasgow-Liège Scale.** *Acta Neurochir (Wien)* 1988;91:1-11."
  };

export default runner;
