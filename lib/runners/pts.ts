/**
 * Runner: pts
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
    maxScore: 12,
    inputs: [
      {
        id: "size",
        label: "Размер (вес)",
        type: "select",
        options: [
          {
            value: "2",
            label: "+2 - >20 кг",
            points: 2
          },
          {
            value: "1",
            label: "+1 - 10-20 кг",
            points: 1
          },
          {
            value: "-1",
            label: "−1 - <10 кг",
            points: -1
          }
        ]
      },
      {
        id: "airway",
        label: "Дыхательные пути",
        type: "select",
        options: [
          {
            value: "2",
            label: "+2 - норма",
            points: 2
          },
          {
            value: "1",
            label: "+1 - поддерживаемые (O₂ маска, канюля)",
            points: 1
          },
          {
            value: "-1",
            label: "−1 - интубация / крикотиреотомия / апноэ",
            points: -1
          }
        ]
      },
      {
        id: "sbp",
        label: "САД",
        type: "select",
        options: [
          {
            value: "2",
            label: "+2 - >90 мм рт.ст.",
            points: 2
          },
          {
            value: "1",
            label: "+1 - 50-90 мм рт.ст.",
            points: 1
          },
          {
            value: "-1",
            label: "−1 - <50 мм рт.ст. / не определяется",
            points: -1
          }
        ]
      },
      {
        id: "cns",
        label: "ЦНС",
        type: "select",
        options: [
          {
            value: "2",
            label: "+2 - в сознании (awake)",
            points: 2
          },
          {
            value: "1",
            label: "+1 - оглушение / ПОТЕРЯ сознания",
            points: 1
          },
          {
            value: "-1",
            label: "−1 - кома / декортикация / децеребрация",
            points: -1
          }
        ]
      },
      {
        id: "wound",
        label: "Открытая рана",
        type: "select",
        options: [
          {
            value: "2",
            label: "+2 - нет",
            points: 2
          },
          {
            value: "1",
            label: "+1 - малые ссадины / минорные раны",
            points: 1
          },
          {
            value: "-1",
            label: "−1 - большие / проникающие / потеря ткани",
            points: -1
          }
        ]
      },
      {
        id: "skeletal",
        label: "Скелет",
        type: "select",
        options: [
          {
            value: "2",
            label: "+2 - переломов нет",
            points: 2
          },
          {
            value: "1",
            label: "+1 - закрытый простой перелом",
            points: 1
          },
          {
            value: "-1",
            label: "−1 - открытый / множественные переломы",
            points: -1
          }
        ]
      }
    ],
    bands: [
      {
        min: -6,
        max: 0,
        label: "≤0 (критический)",
        color: "#991B1B",
        description: "Ожидаемая летальность >50%. Срочный перевод в педиатрический травмоцентр I уровня.",
        details: "PTS ≤0 отражает тяжёлые нарушения в нескольких системах одновременно. Требуется немедленная реанимация и транспорт.",
        actions: [
          "ATLS/APLS: ABC → контроль кровотечения → болюс 20 мл/кг",
          "Массивный трансфузионный протокол (1:1:1)",
          "Интубация, ИВЛ",
          "Срочный вызов травматолога, нейрохирурга, детского хирурга",
          "Транспорт только в педиатрический травмоцентр I уровня"
        ]
      },
      {
        min: 1,
        max: 8,
        label: "1-8 (тяжёлый)",
        color: "#EF4444",
        description: "Значимая травма. Перевод в детский травмоцентр. Летальность 5-50%.",
        actions: [
          "Полная ATLS/APLS оценка",
          "Два в/в доступа, кристаллоиды 20 мл/кг ± кровь",
          "FAST, КТ (голова/грудь/живот по показаниям)",
          "Перевод в педиатрический травмоцентр уровня I/II"
        ]
      },
      {
        min: 9,
        max: 12,
        label: "9-12 (лёгкий)",
        color: "#22C55E",
        description: "Малый риск. Стандартная оценка, локальный стационар приемлем.",
        actions: [
          "Стандартный осмотр по ATLS",
          "Рентгенография по показаниям",
          "Наблюдение 4-6 ч в ER",
          "Возможна выписка с инструкциями"
        ]
      }
    ],
    caveats: [
      "PTS ≤8 - показание к переводу в педиатрический травмоцентр (триаж-порог)",
      "Вес <10 кг автоматически даёт −1 (возраст <1 года - повышенный риск)",
      "Не учитывает механизм травмы (тупая vs проникающая) - всегда интегрировать клинически",
      "TRISS pediatric modifier: RTS + PTS + ISS → расчёт вероятности выживания",
      "Валидизирован в 1980-х; современные системы (ATOMAC, TQIP) могут быть точнее"
    ],
    related: [
      {
        id: "sipa",
        title: "SIPA"
      },
      {
        id: "pgcs",
        title: "Pediatric GCS"
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
    reference: "Tepas JJ, Mollitt DL, Talbert JL, Bryant M. The pediatric trauma score as a predictor of injury severity in the injured child. J Pediatr Surg 1987;22:14-18.",
    countries: "Международный (США ACS)",
    presets: [
      {
        label: "Лёгкая травма",
        values: {
          size: "2",
          airway: "2",
          sbp: "2",
          cns: "2",
          wound: "1",
          skeletal: "2"
        }
      },
      {
        label: "Тяжёлая травма",
        values: {
          size: "1",
          airway: "1",
          sbp: "1",
          cns: "1",
          wound: "-1",
          skeletal: "-1"
        }
      },
      {
        label: "Критическая",
        values: {
          size: "-1",
          airway: "-1",
          sbp: "-1",
          cns: "-1",
          wound: "-1",
          skeletal: "-1"
        }
      }
    ],
    info: "### Для чего используется\n**Pediatric Trauma Score (PTS, Tepas 1987)** - простая триаж-шкала у детей по 6 параметрам. Предсказывает тяжесть травмы и потребность в переводе в травмоцентр.\n\n### Критерии (6 × от −1 до +2)\n| Параметр | +2 | +1 | −1 |\n|---|---|---|---|\n| **Размер** | >20 кг | 10-20 кг | <10 кг |\n| **Дыхательные пути** | Норма | Поддержка (O₂) | Интубация / апноэ |\n| **САД** | >90 | 50-90 | <50 / не определ. |\n| **ЦНС** | В сознании | Оглушение / LOC | Кома |\n| **Рана** | Нет | Минорная | Крупная/проникающая |\n| **Скелет** | Нет | Закрытый | Открытый/множ. |\n\nСумма: **−6 до +12**.\n\n### Интерпретация / Летальность\n| PTS | Категория | Летальность |\n|---|---|---|\n| 9-12 | Лёгкая | <1% |\n| 1-8 | Значимая | 5-50% |\n| ≤0 | Критическая | >50% |\n\n### Триаж-порог\n**PTS ≤ 8 → перевод в педиатрический травмоцентр уровня I/II** (American College of Surgeons).\n\n### TRISS pediatric\n`Probability of survival = 1 / (1 + e^−b)` где b = b0 + b1×RTS + b2×ISS + b3×Age\n- Age коэффициент: детский модификатор учитывает больший резерв у детей\n\n### Ограничения\n- Не учитывает механизм (тупая vs проникающая)\n- Размер как фактор <10 кг автоматический минус - младенцы в «группе риска» по определению\n- В эпоху современных педиатрических травмоцентров ряд исследований (TQIP) показывают, что SIPA точнее SBP-only\n\n### Тактика\n- **9-12**: локальный стационар, наблюдение\n- **1-8**: педиатрический травмоцентр, полная оценка\n- **≤0**: реанимация на месте → срочный транспорт в центр I уровня"
  };

export default runner;
