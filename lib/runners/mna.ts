// @ts-nocheck
/**
 * Runner: mna
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
    maxScore: 14,
    inputs: [
      {
        id: "intake",
        label: "Снижение приёма пищи за последние 3 мес",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - тяжёлое снижение",
            points: 0
          },
          {
            value: "1",
            label: "1 - умеренное снижение",
            points: 1
          },
          {
            value: "2",
            label: "2 - нет снижения",
            points: 2
          }
        ]
      },
      {
        id: "weightloss",
        label: "Потеря веса за последние 3 мес",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - > 3 кг",
            points: 0
          },
          {
            value: "1",
            label: "1 - не знает",
            points: 1
          },
          {
            value: "2",
            label: "2 - 1-3 кг",
            points: 2
          },
          {
            value: "3",
            label: "3 - нет потери",
            points: 3
          }
        ]
      },
      {
        id: "mobility",
        label: "Мобильность",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - лежачий / в кресле",
            points: 0
          },
          {
            value: "1",
            label: "1 - встаёт, но не выходит",
            points: 1
          },
          {
            value: "2",
            label: "2 - выходит из дома",
            points: 2
          }
        ]
      },
      {
        id: "stress",
        label: "Психологический стресс или острое заболевание за 3 мес",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - да",
            points: 0
          },
          {
            value: "2",
            label: "2 - нет",
            points: 2
          }
        ]
      },
      {
        id: "neuro",
        label: "Нейропсихические проблемы",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - тяжёлая деменция/депрессия",
            points: 0
          },
          {
            value: "1",
            label: "1 - лёгкая деменция",
            points: 1
          },
          {
            value: "2",
            label: "2 - нет",
            points: 2
          }
        ]
      },
      {
        id: "anthro",
        label: "ИМТ (или окружность голени, если ИМТ недоступен)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - ИМТ < 19 (или окружность голени < 31 см)",
            points: 0
          },
          {
            value: "1",
            label: "1 - ИМТ 19 - < 21",
            points: 1
          },
          {
            value: "2",
            label: "2 - ИМТ 21 - < 23",
            points: 2
          },
          {
            value: "3",
            label: "3 - ИМТ ≥ 23 (или окружность голени ≥ 31 см)",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 7,
        label: "0-7 - недостаточное питание",
        color: "#EF4444",
        description: "Клинически значимое недоедание.",
        details: "Требуется полная нутритивная оценка и план вмешательства. Потеря скелетной мышечной массы, высокий риск саркопении и функционального снижения.",
        actions: [
          "Полная нутритивная оценка (диетолог)",
          "Цель: 30 ккал/кг/сут, белок 1,2-1,5 г/кг/сут",
          "ONS 2-3 раза в день ≥ 400 ккал и 30 г белка",
          "Оценить причины: депрессия, деменция, дисфагия, зубы, социальные факторы",
          "Повтор MNA через 1-3 мес"
        ]
      },
      {
        min: 8,
        max: 11,
        label: "8-11 - риск недостаточного питания",
        color: "#F59E0B",
        description: "Риск недоедания - профилактические меры.",
        actions: [
          "Обогащение рациона, дробное питание",
          "Рассмотреть ONS",
          "Оценка дисфагии, стоматологического статуса, соц. факторов",
          "Повтор MNA через 3 мес"
        ]
      },
      {
        min: 12,
        max: 14,
        label: "12-14 - норма",
        color: "#22C55E",
        description: "Нормальный нутритивный статус.",
        actions: [
          "Поддержание сбалансированного рациона, скрининг ежегодно"
        ]
      }
    ],
    caveats: [
      "Валидирована у пожилых ≥ 65 лет (≥ 60 в РФ); не для молодых",
      "При недоступности ИМТ использовать окружность голени (calf circumference)",
      "Краткая форма (SF) - 6 пунктов; полная MNA (Guigoz 1994) - 18 пунктов",
      "При деменции часть ответов собирается от опекуна"
    ],
    related: [
      {
        id: "must",
        title: "MUST"
      },
      {
        id: "glim",
        title: "GLIM criteria"
      },
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      }
    ],
    relatedCourses: [
      {
        id: "202.3",
        title: "Метаболизм"
      }
    ],
    reference: "Rubenstein LZ, Harker JO, Salva A, Guigoz Y, Vellas B. Screening for undernutrition in geriatric practice: the MNA-SF. J Gerontol A Biol Sci Med Sci 2001; 56:M366-M372.",
    countries: "Международный · Гериатрия",
    presets: [
      {
        label: "Норма",
        values: {
          intake: "2",
          weightloss: "3",
          mobility: "2",
          stress: "2",
          neuro: "2",
          anthro: "3"
        }
      },
      {
        label: "Риск недоедания",
        values: {
          intake: "1",
          weightloss: "2",
          mobility: "1",
          stress: "2",
          neuro: "1",
          anthro: "1"
        }
      },
      {
        label: "Недоедание",
        values: {
          intake: "0",
          weightloss: "0",
          mobility: "0",
          stress: "0",
          neuro: "1",
          anthro: "0"
        }
      }
    ],
    info: "### Для чего используется\n**MNA-SF** (Mini Nutritional Assessment - Short Form) - краткий скрининг недоедания у пожилых ≥ 65 лет. 6 пунктов, 0-14 баллов. Валидирована в стационаре, амбулаторно, домах ухода.\n\n### Компоненты\n| Пункт | Диапазон |\n|---|---|\n| Снижение приёма пищи (3 мес) | 0-2 |\n| Потеря веса (3 мес) | 0-3 |\n| Мобильность | 0-2 |\n| Острый стресс/болезнь | 0 или 2 |\n| Нейропсихические проблемы | 0-2 |\n| ИМТ (или окружность голени) | 0-3 |\n\n### Интерпретация\n| Сумма | Статус |\n|---|---|\n| 12-14 | Норма |\n| 8-11 | Риск недоедания |\n| 0-7 | Недоедание |\n\n### Ограничения\n- Только для пожилых\n- ИМТ ненадёжен при отёках → окружность голени\n- При деменции - сбор от опекуна\n\n### Тактика\n- **12-14** - рутинный скрининг ежегодно\n- **8-11** - обогащение рациона, ONS, оценка причин\n- **0-7** - полная оценка диетологом, ONS 400 ккал × 2-3/сут, 1,2-1,5 г/кг белка\n\n### Источник\nRubenstein LZ et al. *J Gerontol* 2001; 56:M366-M372. Kaiser MJ et al. *J Nutr Health Aging* 2009 (валидация SF)."
  };

export default runner;
