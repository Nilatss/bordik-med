// @ts-nocheck
/**
 * Runner: midas
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
        id: "q1",
        label: "1. Дней пропуска работы/учёбы за 3 мес",
        type: "number",
        min: 0,
        max: 90,
        step: 1,
        quickValues: [
          0,
          2,
          5,
          10,
          20
        ]
      },
      {
        id: "q2",
        label: "2. Дней со снижением продуктивности на работе ≥ 50 %",
        type: "number",
        min: 0,
        max: 90,
        step: 1,
        quickValues: [
          0,
          2,
          5,
          10,
          20
        ]
      },
      {
        id: "q3",
        label: "3. Дней пропуска домашних дел",
        type: "number",
        min: 0,
        max: 90,
        step: 1,
        quickValues: [
          0,
          2,
          5,
          10,
          20
        ]
      },
      {
        id: "q4",
        label: "4. Дней со снижением продуктивности дома ≥ 50 %",
        type: "number",
        min: 0,
        max: 90,
        step: 1,
        quickValues: [
          0,
          2,
          5,
          10,
          20
        ]
      },
      {
        id: "q5",
        label: "5. Дней пропуска семейных/социальных событий",
        type: "number",
        min: 0,
        max: 90,
        step: 1,
        quickValues: [
          0,
          2,
          5,
          10,
          20
        ]
      }
    ],
    compute: (v)=>{
            const q1 = Number(v.q1) || 0;
            const q2 = Number(v.q2) || 0;
            const q3 = Number(v.q3) || 0;
            const q4 = Number(v.q4) || 0;
            const q5 = Number(v.q5) || 0;
            const total = q1 + q2 + q3 + q4 + q5;
            let interpretation = '';
            let color = '#22C55E';
            let details = '';
            let actions = [];
            if (total <= 5) {
                interpretation = 'I — минимальная / нет инвалидизации';
                color = '#22C55E';
                details = 'MIDAS 0–5 указывает на низкий уровень инвалидизации от мигрени. Обычно не требует профилактики.';
                actions = [
                    'Абортивная терапия: НПВП, триптаны',
                    'Модификация триггеров, сон, гидратация'
                ];
            } else if (total <= 10) {
                interpretation = 'II — лёгкая инвалидизация';
                color = '#84CC16';
                details = 'Лёгкая степень. Рассмотреть оптимизацию абортивной терапии.';
                actions = [
                    'Триптаны в оптимальной дозе',
                    'Дневник головной боли, идентификация триггеров'
                ];
            } else if (total <= 20) {
                interpretation = 'III — умеренная инвалидизация';
                color = '#F59E0B';
                details = 'Умеренная. Показана профилактика.';
                actions = [
                    'Профилактика: топирамат, пропранолол, кандесартан, амитриптилин',
                    'Оптимизация абортивной (триптан + НПВП)'
                ];
            } else {
                interpretation = 'IV — тяжёлая инвалидизация';
                color = '#EF4444';
                details = 'Тяжёлая инвалидизация. Активная профилактика, рассмотреть anti-CGRP.';
                actions = [
                    'Anti-CGRP моноклональные антитела (эренумаб, фреманезумаб, галкайнезумаб)',
                    'Гепанты (атогепант, римегепант) для профилактики',
                    'Онаботулинотоксин А при хронической мигрени (≥ 15 дн/мес)',
                    'Исключить MOH — ограничить острые препараты'
                ];
            }
            return {
                value: String(total),
                unit: 'дней/3 мес',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'MIDAS учитывает 3 месяца — ретроспективная оценка',
                    'HIT-6 (36–78) — альтернатива с фокусом на impact (не inhabilidad)',
                    'MSQ (Migraine-Specific Quality of Life) — качество жизни',
                    'Не заменяет дневник головной боли для определения частоты атак'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 6,
                            label: 'I (0–5)',
                            color: '#22C55E'
                        },
                        {
                            min: 6,
                            max: 11,
                            label: 'II (6–10)',
                            color: '#84CC16'
                        },
                        {
                            min: 11,
                            max: 21,
                            label: 'III (11–20)',
                            color: '#F59E0B'
                        },
                        {
                            min: 21,
                            max: 100,
                            label: 'IV (≥21)',
                            color: '#EF4444'
                        }
                    ],
                    current: total,
                    unit: 'дней'
                },
                related: [
                    {
                        id: 'ichd3',
                        title: 'ICHD-3'
                    },
                    {
                        id: 'snoop',
                        title: 'SNOOP10'
                    },
                    {
                        id: 'phq9',
                        title: 'PHQ-9'
                    }
                ],
                relatedCourses: [
                    {
                        id: '201.3',
                        title: 'Нейрофизиология'
                    }
                ]
            };
        },
    reference: "Stewart WF, Lipton RB, Dowson AJ, Sawyer J. Development and testing of the Migraine Disability Assessment (MIDAS) Questionnaire. Neurology 2001;56(Suppl 1):S20–S28.",
    countries: "Международный",
    presets: [
      {
        label: "Норма",
        values: {
          q1: 0,
          q2: 1,
          q3: 0,
          q4: 2,
          q5: 0
        }
      },
      {
        label: "Умеренная",
        values: {
          q1: 3,
          q2: 5,
          q3: 2,
          q4: 4,
          q5: 1
        }
      },
      {
        label: "Тяжёлая",
        values: {
          q1: 8,
          q2: 10,
          q3: 5,
          q4: 8,
          q5: 3
        }
      }
    ],
    info: "### Для чего используется\n**MIDAS (Migraine Disability Assessment, Stewart 2001)** — опросник для оценки **степени инвалидизации от мигрени** за последние 3 месяца.\n\n### 5 вопросов\nКоличество дней за 3 месяца, когда:\n1. Пропустили работу/учёбу\n2. Продуктивность на работе снижена ≥ 50 %\n3. Пропустили домашние дела\n4. Продуктивность дома снижена ≥ 50 %\n5. Пропустили семейные/социальные события\n\nПлюс 2 вопроса о частоте и интенсивности (не включаются в сумму).\n\n### Интерпретация (сумма баллов)\n| MIDAS | Степень | Тактика |\n|---|---|---|\n| 0–5 | I — минимальная | Абортивная |\n| 6–10 | II — лёгкая | Оптимизация |\n| 11–20 | III — умеренная | Начать профилактику |\n| ≥ 21 | IV — тяжёлая | Активная профилактика, anti-CGRP |\n\n### Альтернативы\n| Шкала | Применение |\n|---|---|\n| **HIT-6** | Impact Test, 6 вопросов, 36–78; быстрый |\n| **MSQ** | Качество жизни, 14 вопросов |\n| **Migraine Photophobia Score** | Специфично для фото-фобии |\n\n### Ограничения\n- Ретроспективная оценка — recall bias\n- Не учитывает качество жизни между атаками\n- Не работает при очень частой / хронической мигрени (потолок)\n\n### Тактика по MIDAS IV\n- Anti-CGRP: эренумаб 70–140 мг/мес, фреманезумаб 225 мг/мес\n- Топирамат 50–100 мг/сут, пропранолол 40–240 мг/сут\n- Онаботулинотоксин А (PREEMPT) при хронической (≥ 15 дн/мес)\n- Гепанты для профилактики: атогепант 60 мг/сут\n\n### Источник\nStewart WF et al. *Neurology* 2001;56(Suppl 1):S20–S28. Kosinski M et al. *Qual Life Res* 2003;12:963–974 (HIT-6)."
  };

export default runner;
