// @ts-nocheck
/**
 * Runner: mrs-stroke
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
    kind: "calculator",
    inputs: [
      {
        id: "score",
        label: "Оценка",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет симптомов"
          },
          {
            value: 1,
            label: "1 — без существенных нарушений"
          },
          {
            value: 2,
            label: "2 — лёгкая"
          },
          {
            value: 3,
            label: "3 — умеренная"
          },
          {
            value: 4,
            label: "4 — умеренно тяжёлая"
          },
          {
            value: 5,
            label: "5 — тяжёлая"
          },
          {
            value: 6,
            label: "6 — смерть"
          }
        ]
      }
    ],
    compute: (v)=>{
            const s = Number(v.score);
            const fav = s <= 2;
            return {
                value: String(s),
                unit: 'mRS',
                interpretation: fav ? 'Благоприятный исход (mRS 0–2).' : 'Неблагоприятный исход (mRS 3–6).',
                color: fav ? '#10B981' : '#EF4444',
                details: fav ? 'mRS 0–2 — стандартный "хороший исход" в современных RCT (тромболизис, тромбэкстракция). Пациент функционально независим в повседневной жизни.' : 'mRS 3–6 — неблагоприятный функциональный исход. Требуется реабилитация и вторичная профилактика для предотвращения рецидива и дальнейшего ухудшения.',
                actions: fav ? [
                    'Вторичная профилактика: антитромботическая терапия, статины, АД-контроль',
                    'Оценка этиологии (TOAST): ФП → антикоагуляция; стеноз СА → эндартерэктомия/стент',
                    'Реабилитация при резидуальных дефицитах (логопед, ЛФК)'
                ] : [
                    'Мультидисциплинарная реабилитация (ранняя мобилизация, ЛФК, логопед, ОТ)',
                    'Вторичная профилактика рецидива + контроль ФР',
                    'Скрининг пост-инсультной депрессии (PHQ-9) и когнитивных нарушений (MoCA)',
                    'Поддержка семьи, социальные службы, оценка потребности в уходе'
                ],
                caveats: [
                    'Стандартная оценка на 90-й день; ранние оценки завышают тяжесть',
                    'Структурированное интервью (smRSi) повышает надёжность',
                    'Shift-анализ статистически мощнее, чем дихотомия 0–2/3–6',
                    'Не учитывает когнитивные и эмоциональные исходы — параллельно используйте MoCA/PHQ-9'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 3,
                            label: '0–2 благоприятн.',
                            color: '#10B981'
                        },
                        {
                            min: 3,
                            max: 7,
                            label: '3–6 неблагопр.',
                            color: '#EF4444'
                        }
                    ],
                    current: s,
                    unit: 'mRS'
                },
                relatedCourses: [
                    {
                        id: '301.1',
                        title: "Кардиология"
                    }
                ],
                related: [
                    {
                        id: 'nihss',
                        title: 'NIHSS'
                    },
                    {
                        id: 'mrs',
                        title: 'mRS (общая)'
                    }
                ]
            };
        },
    reference: "van Swieten JC. Stroke 1988. mRS — стандартная оценка исходов инсульта.",
    info: "### mRS как первичный исход в инсульте\nДихотомия **mRS 0–2 vs 3–6** — стандартный исход всех современных RCT.\n\n### Ключевые исследования\n| Исследование (год) | Вмешательство | Результат |\n|---|---|---|\n| NINDS rt-PA (1995) | Тромболизис | ↑ шанс mRS 0–1 на 30 % за 90 дней |\n| MR CLEAN (2015) | Тромбэкстракция при крупных окклюзиях | mRS 0–2 в 33 % vs 19 % контроль |\n| DAWN / DEFUSE-3 | Продлённое окно тромбэкстракции | Расширение до 24 ч при mismatch |\n\n### Преимущества vs Barthel Index\n- mRS — глобальная функция, Barthel — конкретные ADL\n- mRS более чувствителен в \"хорошем\" диапазоне; Barthel — в тяжёлом\n\n### Тренды\n- Сдвиговый анализ (shift analysis) — статистически мощнее, чем дихотомия\n- Utility-weighted mRS (uw-mRS) — учитывает QoL предпочтения пациентов"
  };

export default runner;
