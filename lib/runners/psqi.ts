/**
 * Runner: psqi
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
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
        id: "c1",
        label: "C1. Субъективное качество сна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - очень хорошее"
          },
          {
            value: 1,
            label: "1 - довольно хорошее"
          },
          {
            value: 2,
            label: "2 - довольно плохое"
          },
          {
            value: 3,
            label: "3 - очень плохое"
          }
        ]
      },
      {
        id: "c2",
        label: "C2. Латентность засыпания",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - < 15 мин"
          },
          {
            value: 1,
            label: "1 - 16-30 мин"
          },
          {
            value: 2,
            label: "2 - 31-60 мин"
          },
          {
            value: 3,
            label: "3 - > 60 мин"
          }
        ]
      },
      {
        id: "c3",
        label: "C3. Продолжительность сна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - > 7 ч"
          },
          {
            value: 1,
            label: "1 - 6-7 ч"
          },
          {
            value: 2,
            label: "2 - 5-6 ч"
          },
          {
            value: 3,
            label: "3 - < 5 ч"
          }
        ]
      },
      {
        id: "c4",
        label: "C4. Эффективность сна (время во сне / в постели)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - > 85 %"
          },
          {
            value: 1,
            label: "1 - 75-84 %"
          },
          {
            value: 2,
            label: "2 - 65-74 %"
          },
          {
            value: 3,
            label: "3 - < 65 %"
          }
        ]
      },
      {
        id: "c5",
        label: "C5. Нарушения сна (пробуждения, кошмары, боль)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - реже 1/нед"
          },
          {
            value: 2,
            label: "2 - 1-2/нед"
          },
          {
            value: 3,
            label: "3 - ≥ 3/нед"
          }
        ]
      },
      {
        id: "c6",
        label: "C6. Приём снотворных",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - не применял"
          },
          {
            value: 1,
            label: "1 - < 1/нед"
          },
          {
            value: 2,
            label: "2 - 1-2/нед"
          },
          {
            value: 3,
            label: "3 - ≥ 3/нед"
          }
        ]
      },
      {
        id: "c7",
        label: "C7. Дневная дисфункция",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - значительная"
          }
        ]
      }
    ],
    compute: (v)=>{
            const sum = [
                v.c1,
                v.c2,
                v.c3,
                v.c4,
                v.c5,
                v.c6,
                v.c7
            ].map((x)=>Number(x) || 0).reduce((a, b)=>a + b, 0);
            let interpretation = '', color = '#22C55E';
            let details = '', actions = [];
            if (sum <= 5) {
                interpretation = 'Хороший сон';
                color = '#22C55E';
                details = 'Global PSQI ≤ 5 - хорошее качество сна. Оригинальная валидизация Buysse 1989 показала чувствительность 89,6 % и специфичность 86,5 % при пороге > 5.';
                actions = [
                    'Поддержание гигиены сна',
                    'При наличии симптомов днём - оценить ESS'
                ];
            } else if (sum <= 10) {
                interpretation = 'Нарушение сна (лёгкое-умеренное)';
                color = '#F59E0B';
                details = 'PSQI > 5 - плохое качество сна. Лёгкая-умеренная степень. Оценить поведенческие и медицинские причины: гигиена, кофеин, тревога, депрессия, OSA.';
                actions = [
                    'Гигиена сна: режим, экран, кофеин, алкоголь, температура спальни',
                    'Скрининг: PHQ-9, GAD-7, STOP-BANG (OSA), ESS',
                    'Рассмотреть КПТ-И (cognitive behavioural therapy for insomnia)'
                ];
            } else {
                interpretation = 'Выраженные нарушения сна';
                color = '#EF4444';
                details = 'Global PSQI > 10 - выраженные нарушения качества сна. Высокая вероятность клинически значимого расстройства (инсомния, OSA, депрессия, SDB).';
                actions = [
                    'Полная оценка: дневник сна, PSG при подозрении на OSA',
                    'КПТ-И (первая линия при хронической инсомнии, AASM 2021)',
                    'Оценить коморбидную депрессию и тревогу',
                    'Избегать длительного применения бензодиазепинов и Z-препаратов'
                ];
            }
            return {
                value: sum.toString(),
                unit: 'баллов',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'PSQI оценивает последний месяц, не острую инсомнию',
                    'Порог > 5 валидирован для взрослых; для пожилых и клинических групп пороги могут отличаться',
                    'Не различает инсомнию и другие расстройства сна (OSA, RLS, нарколепсия)',
                    'Альтернативы: Insomnia Severity Index (ISI, инсомния), SATED (5 пунктов, мультидомен), ESS (сонливость)'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 5,
                            label: 'Хороший',
                            color: '#22C55E'
                        },
                        {
                            min: 5,
                            max: 10,
                            label: 'Лёгкий-умер.',
                            color: '#F59E0B'
                        },
                        {
                            min: 10,
                            max: 21,
                            label: 'Выраженный',
                            color: '#EF4444'
                        }
                    ],
                    current: sum,
                    unit: ''
                },
                related: [
                    {
                        id: 'epworth',
                        title: 'Epworth'
                    },
                    {
                        id: 'stop-bang',
                        title: 'STOP-BANG'
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
    reference: "Buysse DJ et al. The Pittsburgh Sleep Quality Index. Psychiatry Res 1989;28:193-213.",
    countries: "Международный",
    presets: [
      {
        label: "Хороший сон",
        values: {
          c1: 0,
          c2: 0,
          c3: 0,
          c4: 0,
          c5: 1,
          c6: 0,
          c7: 0
        }
      },
      {
        label: "Умеренные наруш.",
        values: {
          c1: 2,
          c2: 2,
          c3: 1,
          c4: 1,
          c5: 1,
          c6: 0,
          c7: 1
        }
      },
      {
        label: "Выраженные",
        values: {
          c1: 3,
          c2: 3,
          c3: 2,
          c4: 2,
          c5: 2,
          c6: 1,
          c7: 2
        }
      }
    ],
    info: "### Для чего используется\n**Pittsburgh Sleep Quality Index (PSQI, Buysse 1989)** - самозаполняемый опросник для оценки **качества и структуры сна за последний месяц**. Стандарт в сомнологии и клинических исследованиях.\n\n### Структура\n19 пунктов → 7 компонентов × 0-3:\n1. Субъективное качество сна\n2. Латентность засыпания\n3. Продолжительность сна\n4. Эффективность сна\n5. Нарушения сна\n6. Использование снотворных\n7. Дневная дисфункция\n\n**Global PSQI = сумма 7 компонентов (0-21)**\n\n### Интерпретация\n| Global PSQI | Значение |\n|---|---|\n| ≤ 5 | Хороший сон |\n| > 5 | Плохой сон (чувствительность 89,6 %, специфичность 86,5 %) |\n\n### Ограничения\n- За месяц, не острое состояние\n- Не различает причины (OSA vs инсомния vs депрессия)\n- Порог > 5 валидирован для общей популяции; в клинических группах ценен кросс-сравнением\n\n### Альтернативы\n- **ISI (Insomnia Severity Index)** - 7 пунктов, 0-28, порог ≥ 15 для клинической инсомнии\n- **SATED** - 5 коротких пунктов (Satisfaction, Alertness, Timing, Efficiency, Duration)\n- **ESS (Epworth)** - дневная сонливость\n- **STOP-BANG** - скрининг OSA\n\n### Тактика\n- **≤ 5:** гигиена сна\n- **6-10:** коррекция поведения + КПТ-И\n- **> 10:** направление к сомнологу, PSG, КПТ-И, лечение коморбидностей"
  };

export default runner;
