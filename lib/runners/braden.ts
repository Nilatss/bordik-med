/**
 * Runner: braden
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
    maxScore: 23,
    inputs: [
      {
        id: "sensory",
        label: "Сенсорная перцепция (способность реагировать на дискомфорт)",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - полностью ограничена (нет реакции)",
            points: 1
          },
          {
            value: "2",
            label: "2 - очень ограничена (только на боль)",
            points: 2
          },
          {
            value: "3",
            label: "3 - слегка ограничена",
            points: 3
          },
          {
            value: "4",
            label: "4 - без ограничений",
            points: 4
          }
        ]
      },
      {
        id: "moisture",
        label: "Влажность кожи",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - постоянно влажная",
            points: 1
          },
          {
            value: "2",
            label: "2 - часто влажная",
            points: 2
          },
          {
            value: "3",
            label: "3 - иногда влажная",
            points: 3
          },
          {
            value: "4",
            label: "4 - редко влажная",
            points: 4
          }
        ]
      },
      {
        id: "activity",
        label: "Активность",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - прикован к постели",
            points: 1
          },
          {
            value: "2",
            label: "2 - прикован к креслу",
            points: 2
          },
          {
            value: "3",
            label: "3 - ходит эпизодически",
            points: 3
          },
          {
            value: "4",
            label: "4 - ходит часто",
            points: 4
          }
        ]
      },
      {
        id: "mobility",
        label: "Мобильность (способность менять положение тела)",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - полностью обездвижен",
            points: 1
          },
          {
            value: "2",
            label: "2 - очень ограничена",
            points: 2
          },
          {
            value: "3",
            label: "3 - слегка ограничена",
            points: 3
          },
          {
            value: "4",
            label: "4 - без ограничений",
            points: 4
          }
        ]
      },
      {
        id: "nutrition",
        label: "Питание",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - очень плохое (≤ 1/3 порций, альбумин < 30)",
            points: 1
          },
          {
            value: "2",
            label: "2 - возможно неадекватное (½ порций)",
            points: 2
          },
          {
            value: "3",
            label: "3 - адекватное (≥ ½ порций)",
            points: 3
          },
          {
            value: "4",
            label: "4 - отличное (всё съедает)",
            points: 4
          }
        ]
      },
      {
        id: "friction",
        label: "Трение и сдвиг",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - проблема (скользит в постели)",
            points: 1
          },
          {
            value: "2",
            label: "2 - потенциальная проблема",
            points: 2
          },
          {
            value: "3",
            label: "3 - без видимых проблем",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 19,
        max: 23,
        label: "19-23 - нет риска",
        color: "#22C55E",
        description: "Риск пролежней минимален.",
        actions: [
          "Стандартная профилактика: ежедневный осмотр кожи, мобилизация, адекватная гидратация"
        ]
      },
      {
        min: 15,
        max: 18,
        label: "15-18 - умеренный риск",
        color: "#F59E0B",
        description: "Умеренный риск пролежней.",
        actions: [
          "Изменение положения каждые 2 ч",
          "Противопролежневый матрас (статический)",
          "Защита пяток (подушки, offloading)",
          "Управление влажностью (кремы-барьеры)"
        ]
      },
      {
        min: 13,
        max: 14,
        label: "13-14 - высокий риск",
        color: "#EF4444",
        description: "Высокий риск пролежней.",
        actions: [
          "Изменение положения каждые 2 ч (или чаще)",
          "Активный противопролежневый матрас",
          "Нутритивная поддержка (белок 1.25-1.5 г/кг/сут, энергия 30-35 ккал/кг)",
          "Пленки / гидроколлоиды на зоны риска"
        ]
      },
      {
        min: 10,
        max: 12,
        label: "10-12 - очень высокий риск",
        color: "#EF4444",
        description: "Очень высокий риск.",
        details: "NPUAP/EPUAP 2019: полный протокол профилактики, ежедневная переоценка Braden.",
        actions: [
          "Переворот ≤ 2 ч, offloading пяток (подвешивание)",
          "Низкодавленчный / воздушно-флюидизированный матрас",
          "Нутриционист, дополнительные калории и белок",
          "Специалист по ранам (wound care nurse)"
        ]
      },
      {
        min: 6,
        max: 9,
        label: "≤ 9 - экстремально высокий риск",
        color: "#1A1A1A",
        description: "Экстремальный риск.",
        details: "ОРИТ-пациенты, терминальные - пролежни часто неизбежны (Kennedy Terminal Ulcer).",
        actions: [
          "Максимальный уход по протоколу NPUAP",
          "Мультидисциплинарное обсуждение целей помощи",
          "Документация неизбежности при терминальном состоянии"
        ]
      }
    ],
    caveats: [
      "Обратная шкала: чем НИЖЕ балл, тем ВЫШЕ риск (в отличие от большинства score-инструментов)",
      "Пороговые значения варьируют: NPUAP ≤ 18, некоторые ОРИТ ≤ 16",
      "Чувствительность ~ 70 %, специфичность ~ 70 % - не заменяет клинический осмотр",
      "Переоценивайте ежедневно и при изменении состояния"
    ],
    related: [
      {
        id: "morse",
        title: "Morse Fall Scale"
      },
      {
        id: "barthel",
        title: "Barthel ADL"
      },
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Bergstrom N, Braden BJ, Laguzza A, Holman V. The Braden Scale for predicting pressure sore risk. Nurs Res 1987; 36:205-210.",
    countries: "Международный (NPUAP / EPUAP / PPPIA)",
    presets: [
      {
        label: "Мобильный пациент",
        values: {
          sensory: "4",
          moisture: "4",
          activity: "4",
          mobility: "4",
          nutrition: "3",
          friction: "3"
        }
      },
      {
        label: "Умеренный риск",
        values: {
          sensory: "3",
          moisture: "3",
          activity: "2",
          mobility: "3",
          nutrition: "3",
          friction: "2"
        }
      },
      {
        label: "ОРИТ, седация, ИВЛ",
        values: {
          sensory: "1",
          moisture: "2",
          activity: "1",
          mobility: "1",
          nutrition: "2",
          friction: "1"
        }
      }
    ],
    info: "### Для чего используется\n**Braden Scale for Predicting Pressure Sore Risk** - самая распространённая шкала оценки риска пролежней (pressure injury). 6 субшкал, сумма 6-23. **Обратная**: чем ниже, тем выше риск.\n\n### 6 субшкал\n| Субшкала | Диапазон |\n|---|---|\n| Сенсорная перцепция | 1-4 |\n| Влажность | 1-4 |\n| Активность | 1-4 |\n| Мобильность | 1-4 |\n| Питание | 1-4 |\n| Трение и сдвиг | 1-3 |\n\n### Интерпретация\n| Сумма | Риск |\n|---|---|\n| 19-23 | Нет |\n| 15-18 | Умеренный |\n| 13-14 | Высокий |\n| 10-12 | Очень высокий |\n| ≤ 9 | Экстремальный |\n\n### Альтернативы\n| Шкала | Диапазон | Порог |\n|---|---|---|\n| **Norton** (1962) | 5-20 | ≤ 14 = риск |\n| **Waterlow** (1985) | открытая | ≥ 10 = риск |\n| **CALCULATE** (ОРИТ, 2013) | 0-5 | ≥ 2 = риск |\n\n### Профилактика (NPUAP / EPUAP / PPPIA 2019)\n1. **Оценка риска**: Braden ежедневно\n2. **Осмотр кожи**: сдвиг, эритема, температура, влажность\n3. **Мобилизация**: ≤ 2 ч; микродвижения\n4. **Поверхности**: статические / активные матрасы; offloading пяток\n5. **Питание**: белок 1.25-1.5 г/кг, энергия 30-35 ккал/кг, протеин, Arginine, Zn\n6. **Кожа**: чистая, сухая, увлажнённая барьерным кремом; избегать массажа костных выступов\n\n### Классификация пролежней (NPUAP 2016)\n- Stage I - неповреждённая кожа, эритема\n- Stage II - частичная потеря дермы\n- Stage III - полная потеря дермы\n- Stage IV - до кости/мышцы/сухожилия\n- Unstageable - покрыт струпом/слаф\n- Deep tissue injury - багровое/пурпурное изменение\n\n### Ограничения\n- Чувствительность ~ 70 %, специфичность ~ 70 %\n- Не заменяет осмотр\n- Пороги варьируют между протоколами"
  };

export default runner;
