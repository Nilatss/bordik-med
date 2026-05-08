/**
 * Runner: pgcs
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
    maxScore: 15,
    inputs: [
      {
        id: "eye",
        label: "Открывание глаз (E)",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - нет",
            points: 1
          },
          {
            value: "2",
            label: "2 - на боль",
            points: 2
          },
          {
            value: "3",
            label: "3 - на речь/звук",
            points: 3
          },
          {
            value: "4",
            label: "4 - спонтанное",
            points: 4
          }
        ]
      },
      {
        id: "verbal",
        label: "Вербальная реакция (V, для <2 лет)",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - нет вокализации",
            points: 1
          },
          {
            value: "2",
            label: "2 - стонет на боль",
            points: 2
          },
          {
            value: "3",
            label: "3 - плач на боль (неадекватный)",
            points: 3
          },
          {
            value: "4",
            label: "4 - крик, раздражителен (утешается)",
            points: 4
          },
          {
            value: "5",
            label: "5 - улыбается, гулит, следит",
            points: 5
          }
        ]
      },
      {
        id: "motor",
        label: "Моторная реакция (M)",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - нет (или рефлекторная экстензия)",
            points: 1
          },
          {
            value: "2",
            label: "2 - разгибание на боль (decerebrate)",
            points: 2
          },
          {
            value: "3",
            label: "3 - сгибание на боль (decorticate)",
            points: 3
          },
          {
            value: "4",
            label: "4 - отдёргивание на боль",
            points: 4
          },
          {
            value: "5",
            label: "5 - отдёргивание на прикосновение / локализация боли",
            points: 5
          },
          {
            value: "6",
            label: "6 - спонтанные целенаправленные движения",
            points: 6
          }
        ]
      }
    ],
    bands: [
      {
        min: 3,
        max: 8,
        label: "3-8 (тяжёлая ЧМТ)",
        color: "#991B1B",
        description: "Тяжёлое нарушение сознания. Показана интубация, КТ, ICU.",
        details: "pGCS ≤ 8 - критический порог. Необходима защита дыхательных путей (интубация), срочная КТ головы, нейрохирургическая консультация, ICU.",
        actions: [
          "Интубация (GCS ≤ 8 = защита дыхательных путей)",
          "КТ головы без контраста срочно",
          "Нейрохирург / нейрореанимация",
          "Голова 30°, нормокапния, избегать гипотензии",
          "Осмоляры (3% NaCl 3-5 мл/кг или маннитол 0,25-1 г/кг) при признаках ВЧД"
        ]
      },
      {
        min: 9,
        max: 12,
        label: "9-12 (среднетяжёлая)",
        color: "#EF4444",
        description: "Умеренное нарушение. Наблюдение в ICU/HDU, нейровизуализация.",
        actions: [
          "КТ головы",
          "Госпитализация с мониторингом каждые 15-30 мин",
          "Повторный pGCS каждые 1-2 ч"
        ]
      },
      {
        min: 13,
        max: 14,
        label: "13-14 (лёгкая ЧМТ)",
        color: "#F59E0B",
        description: "Лёгкая травма. Оценка по PECARN head.",
        actions: [
          "Наблюдение ≥4-6 ч",
          "PECARN head правило",
          "При ухудшении - КТ"
        ]
      },
      {
        min: 15,
        max: 15,
        label: "15 (норма)",
        color: "#22C55E",
        description: "Сознание не нарушено."
      }
    ],
    caveats: [
      "Вербальная шкала модифицирована для <2 лет (pre-verbal)",
      "После 2 лет можно использовать взрослую шкалу GCS",
      "При интубации V-компонент = 1T (не суммируется с остальными)",
      "AVPU (Alert/Verbal/Pain/Unresponsive) - упрощённая альтернатива догоспитально",
      "Седация, алкоголь, гипотермия искажают оценку"
    ],
    related: [
      {
        id: "gcs",
        title: "GCS (взрослые)"
      },
      {
        id: "pecarn-head",
        title: "PECARN head"
      },
      {
        id: "pews",
        title: "PEWS"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Holmes JF, Palchak MJ, MacFarlane T, Kuppermann N. Performance of the pediatric Glasgow Coma Scale in children with blunt head trauma. Acad Emerg Med 2005;12:814-819.",
    countries: "Международный",
    presets: [
      {
        label: "Норма",
        values: {
          eye: "4",
          verbal: "5",
          motor: "6"
        }
      },
      {
        label: "Лёгкая ЧМТ",
        values: {
          eye: "4",
          verbal: "4",
          motor: "6"
        }
      },
      {
        label: "Тяжёлая ЧМТ",
        values: {
          eye: "1",
          verbal: "1",
          motor: "3"
        }
      }
    ],
    info: "### Для чего используется\n**Pediatric Glasgow Coma Scale (pGCS)** - модификация GCS для детей младше 2 лет (до развития речи). Вербальный компонент заменён на оценку плача и социального ответа.\n\n### Критерии\n| Компонент | Баллы | Для <2 лет |\n|---|---|---|\n| **E** (глаза) | 1-4 | = взрослой шкалы |\n| **V** (вербал) | 1-5 | 5: улыбается, гулит; 4: раздражим, утешается; 3: неадекват. плач; 2: стонет; 1: нет |\n| **M** (моторика) | 1-6 | 6: спонтанные; 5: отдёрг. на прикоснов.; 4: отдёрг. на боль; 3: decorticate; 2: decerebrate; 1: нет |\n\n### AVPU (упрощённая)\n| AVPU | pGCS примерно |\n|---|---|\n| **A**lert | 15 |\n| **V**erbal response | 13-14 |\n| **P**ain response | 8-12 |\n| **U**nresponsive | 3-7 |\n\n### Интерпретация\n| pGCS | Тяжесть ЧМТ | Тактика |\n|---|---|---|\n| 15 | Норма | Наблюдение |\n| 13-14 | Лёгкая | PECARN head, наблюдение |\n| 9-12 | Средняя | КТ, госпитализация |\n| 3-8 | Тяжёлая | Интубация, ICU, нейрохирург |\n\n### Ограничения\n- Для детей 2-5 лет - взрослая GCS с учётом развития\n- При интубации V = 1T\n- Седативные (мидазолам, фентанил) искажают V/M\n\n### Тактика\n- **≤ 8**: интубация, КТ, ICU\n- **9-12**: КТ, HDU, повторная оценка каждые 1-2 ч\n- **13-14**: PECARN head правило\n- **15**: наблюдение, обычный алгоритм"
  };

export default runner;
