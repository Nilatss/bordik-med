// @ts-nocheck
/**
 * Runner: avpu
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
        label: "Уровень сознания",
        type: "select",
        options: [
          {
            value: "4",
            label: "A - Alert (ясное сознание, открытые глаза, ориентирован)",
            points: 4
          },
          {
            value: "3",
            label: "V - Voice (реагирует на голос)",
            points: 3
          },
          {
            value: "2",
            label: "P - Pain (реагирует только на болевой раздражитель)",
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
        description: "Ясное сознание. Эквивалент GCS ~ 15.",
        details: "Пациент бодрствует, спонтанно открывает глаза, ориентирован во времени, месте и личности.",
        actions: [
          "Рутинный мониторинг",
          "Стандартный клинический осмотр"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "V - Voice",
        color: "#F59E0B",
        description: "Реагирует на голос. Эквивалент GCS ~ 12-13.",
        details: "Открывает глаза или отвечает на вербальный стимул, но не бодрствует.",
        actions: [
          "Оценка дыхательных путей",
          "Повторный мониторинг каждые 15 мин",
          "Перейти к GCS для точной оценки"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "P - Pain",
        color: "#EF4444",
        description: "Реагирует только на болевой стимул. Эквивалент GCS ~ 8.",
        details: "Движение, стон или открытие глаз только при трапециевидном / супраорбитальном / ногтевом давлении. Порог ≤ 8 соответствует показанию к интубации.",
        actions: [
          "Защита дыхательных путей (интубация если GCS ≤ 8)",
          "Исключить гипогликемию (глюкоза), опиоидную интоксикацию (налоксон)",
          "Срочный GCS, нейровизуализация"
        ]
      },
      {
        min: 1,
        max: 1,
        label: "U - Unresponsive",
        color: "#991B1B",
        description: "Нет реакции. Эквивалент GCS 3.",
        details: "Нет реакции на вербальный и болевой стимул. Требуется немедленная стабилизация ABCDE.",
        actions: [
          "Протокол ABCDE; интубация",
          "ICU; исключить Hs & Ts",
          "КТ головы, лабораторный скрининг"
        ]
      }
    ],
    caveats: [
      "Низкая гранулярность - при V/P обязательно выполнять GCS",
      "Не оценивает стволовые рефлексы и паттерн дыхания (→ FOUR)",
      "Используется как быстрый скрининг в догоспитальном этапе (START triage, NEWS2, PEWS)",
      "Соответствия с GCS приблизительные - не заменяют полноценную оценку"
    ],
    related: [
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "four",
        title: "FOUR"
      },
      {
        id: "acdu",
        title: "ACDU"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Teasdale G, Jennett B. Assessment of coma and impaired consciousness. Lancet 1974;2:81-84 (оригинальная концепция). AVPU как скрининг используется в ATLS, APLS, NEWS2.",
    countries: "Международный (ATLS / APLS / NEWS2)",
    info: "### Для чего используется\n**AVPU** - простейшая шкала экспресс-оценки уровня сознания, применяется в **догоспитальном этапе**, при **первичном осмотре** по ATLS/APLS и в **ранних скорах раннего ухудшения** (NEWS2, PEWS). Соответствует уровням GCS, но без деталей.\n\n### Критерии\n| Буква | Значение | GCS ~ |\n|---|---|---|\n| **A** | Alert - бодрствует, ориентирован | 15 |\n| **V** | Voice - реагирует на голос | 12-13 |\n| **P** | Pain - реагирует на боль | 8 |\n| **U** | Unresponsive - нет реакции | 3 |\n\n### Критический порог\n**P или U ≈ GCS ≤ 8** → показание к защите дыхательных путей (интубация).\n\n### Варианты шкалы\n| Шкала | Уровни |\n|---|---|\n| **AVPU** | A / V / P / U |\n| **ACDU** (Grady) | Alert / Confused / Drowsy / Unresponsive |\n| **Jouvet** | 5 уровней (реакция + движения глаз) |\n| **Glasgow-Liege** | GCS + стволовые рефлексы (0-20) |\n\n### Применение\n- **Primary survey** (ATLS) - шаг «D» (Disability)\n- **NEWS2** - вклад в балл раннего ухудшения\n- **PEWS** - педиатрический мониторинг\n- **Triage** (START, SALT) - сортировка при катастрофах\n\n### Тактика\n- **A** - рутина\n- **V** - дообследование, повторная оценка каждые 15 мин\n- **P** - интубация при сохранении; глюкоза, налоксон, ABC\n- **U** - интубация немедленно, ICU, КТ\n\n### Ограничения\n- Не различает степени заторможенности (→ GCS/FOUR)\n- Не оценивает стволовые функции\n- Не применяется для прогноза исхода\n\n### Источник\nKelly CA et al. **Comparison of consciousness level assessment in the poisoned patient using the alert/verbal/painful/unresponsive scale and the Glasgow Coma Scale.** *Ann Emerg Med* 2004;44:108-113. Royal College of Physicians. **National Early Warning Score (NEWS) 2.** RCP, London, 2017."
  };

export default runner;
