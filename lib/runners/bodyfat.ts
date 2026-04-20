// @ts-nocheck
/**
 * Runner: bodyfat
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
        id: "sex",
        label: "Пол",
        type: "select",
        options: [
          {
            value: "m",
            label: "Мужской"
          },
          {
            value: "f",
            label: "Женский"
          }
        ]
      },
      {
        id: "height",
        label: "Рост",
        type: "number",
        unit: "см",
        min: 130,
        max: 220,
        step: 0.1,
        quickValues: [
          160,
          165,
          170,
          175,
          180,
          185
        ]
      },
      {
        id: "waist",
        label: "Окружность талии",
        type: "number",
        unit: "см",
        min: 40,
        max: 200,
        step: 0.1,
        quickValues: [
          70,
          80,
          90,
          100,
          110
        ]
      },
      {
        id: "neck",
        label: "Окружность шеи",
        type: "number",
        unit: "см",
        min: 20,
        max: 60,
        step: 0.1,
        quickValues: [
          32,
          36,
          38,
          40,
          42
        ]
      },
      {
        id: "hip",
        label: "Окружность бёдер (только ♀)",
        type: "number",
        unit: "см",
        min: 40,
        max: 200,
        step: 0.1,
        quickValues: [
          85,
          95,
          100,
          110
        ]
      }
    ],
    compute: (v)=>{
            const female = v.sex === 'f';
            const h = Number(v.height);
            const waist = Number(v.waist);
            const neck = Number(v.neck);
            const hip = Number(v.hip) || 0;
            let bf = 0;
            if (female) {
                if (hip <= 0 || waist + hip - neck <= 0) {
                    return {
                        value: '-',
                        unit: '%',
                        interpretation: 'Для ♀ требуется окружность бёдер',
                        color: '#F59E0B',
                        details: 'Метод US Navy для женщин использует формулу с окружностью бёдер. Введите значение.'
                    };
                }
                bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(h) - 78.387;
            } else {
                if (waist - neck <= 0) {
                    return {
                        value: '-',
                        unit: '%',
                        interpretation: 'Окружность талии должна быть больше окружности шеи',
                        color: '#F59E0B',
                        details: 'Проверьте введённые значения.'
                    };
                }
                bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(h) + 36.76;
            }
            bf = Math.max(1, bf);
            const val = bf.toFixed(1);
            let category = '', color = '';
            if (female) {
                if (bf < 14) {
                    category = 'Спортсменка (< 14%)';
                    color = '#3B82F6';
                } else if (bf < 21) {
                    category = 'Атлетический (14-20%)';
                    color = '#22C55E';
                } else if (bf < 25) {
                    category = 'Фитнес (21-24%)';
                    color = '#22C55E';
                } else if (bf < 32) {
                    category = 'Среднее (25-31%)';
                    color = '#F59E0B';
                } else {
                    category = 'Ожирение (≥ 32%)';
                    color = '#EF4444';
                }
            } else {
                if (bf < 6) {
                    category = 'Эссенциальный (2-5%)';
                    color = '#3B82F6';
                } else if (bf < 14) {
                    category = 'Спортсмен (6-13%)';
                    color = '#22C55E';
                } else if (bf < 18) {
                    category = 'Фитнес (14-17%)';
                    color = '#22C55E';
                } else if (bf < 25) {
                    category = 'Среднее (18-24%)';
                    color = '#F59E0B';
                } else {
                    category = 'Ожирение (≥ 25%)';
                    color = '#EF4444';
                }
            }
            return {
                value: val,
                unit: '%',
                interpretation: category,
                color,
                details: `Метод US Navy (Hodgdon & Beckett 1984) - непрямая оценка % жира на основе антропометрии. Рост ${h} см, талия ${waist} см, шея ${neck} см${female ? `, бёдра ${hip} см` : ''}. Расчётный % жира: ${val}%. Точность ± 3-4% vs DEXA у большинства здоровых взрослых; меньше точность при крайних значениях.`,
                actions: [
                    bf > (female ? 32 : 25) ? 'Обсудить снижение массы: 500-750 ккал дефицит/сут + силовые + кардио; цель −5-10% за 6 мес' : '',
                    bf < (female ? 14 : 6) ? 'Очень низкий % жира - оценить спортивный анамнез, нутрициональный статус, менструальную функцию (RED-S у ♀)' : '',
                    'Для точной оценки композиции тела: DEXA (золотой стандарт), BIA, bod pod',
                    'Дополнить: окружность талии (♂ < 94 см, ♀ < 80 см - низкий кардиометаболический риск)',
                    'WHR (waist/hip ratio) как альтернативный маркёр висцерального ожирения'
                ].filter(Boolean),
                caveats: [
                    'US Navy точен ± 3-4% vs DEXA у среднего человека; хуже у бодибилдеров, ожирения III степени, беременных',
                    'Погрешность измерения зависит от локализации ленты: талия на уровне пупка (♂) или самое узкое место (♀)',
                    'Не применимо у детей, беременных, при отёках',
                    'Для научной точности - DEXA или MRI; BIA дешевле, но зависим от гидратации',
                    'Альтернатива - Jackson-Pollock 3-site (калиперометрия) + Siri (%BF = 495/D − 450)'
                ],
                scale: female ? {
                    segments: [
                        {
                            min: 0,
                            max: 14,
                            label: 'Спортсм.',
                            color: '#3B82F6'
                        },
                        {
                            min: 14,
                            max: 21,
                            label: 'Атлет.',
                            color: '#22C55E'
                        },
                        {
                            min: 21,
                            max: 25,
                            label: 'Фитнес',
                            color: '#22C55E'
                        },
                        {
                            min: 25,
                            max: 32,
                            label: 'Среднее',
                            color: '#F59E0B'
                        },
                        {
                            min: 32,
                            max: 60,
                            label: 'Ожирение',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(val),
                    unit: '%'
                } : {
                    segments: [
                        {
                            min: 0,
                            max: 6,
                            label: 'Эссенц.',
                            color: '#3B82F6'
                        },
                        {
                            min: 6,
                            max: 14,
                            label: 'Спортсм.',
                            color: '#22C55E'
                        },
                        {
                            min: 14,
                            max: 18,
                            label: 'Фитнес',
                            color: '#22C55E'
                        },
                        {
                            min: 18,
                            max: 25,
                            label: 'Среднее',
                            color: '#F59E0B'
                        },
                        {
                            min: 25,
                            max: 60,
                            label: 'Ожирение',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(val),
                    unit: '%'
                },
                relatedCourses: [
                    {
                        id: '202.3',
                        title: 'Метаболизм'
                    },
                    {
                        id: '301.4',
                        title: 'Эндокринология'
                    }
                ],
                related: [
                    {
                        id: 'bmi',
                        title: 'Индекс массы тела'
                    },
                    {
                        id: 'whr',
                        title: 'WHR (waist/hip)'
                    },
                    {
                        id: 'ibw-devine',
                        title: 'IBW (Devine)'
                    }
                ]
            };
        },
    reference: "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men and women from body circumferences and height. *Naval Health Research Center* 1984. ACSM Body Composition classification.",
    countries: "США (U.S. Navy) · Международный",
    presets: [
      {
        label: "♂ 175 см, талия 85",
        values: {
          sex: "m",
          height: 175,
          waist: 85,
          neck: 38,
          hip: 95
        }
      },
      {
        label: "♀ 165 см, талия 72",
        values: {
          sex: "f",
          height: 165,
          waist: 72,
          neck: 33,
          hip: 98
        }
      },
      {
        label: "♂ Ожирение 180/110",
        values: {
          sex: "m",
          height: 180,
          waist: 110,
          neck: 42,
          hip: 110
        }
      }
    ],
    info: "### Для чего используется\n**Оценка процента жировой массы** (непрямая антропометрия). Применяется в спортивной медицине, нутрициологии, эндокринологии как дополнение к BMI (не различает мышцы vs жир).\n\n### Формулы (US Navy, Hodgdon & Beckett 1984)\n**Мужчины:**\n`%BF = 86.010 × log₁₀(талия − шея) − 70.041 × log₁₀(рост) + 36.76`\n\n**Женщины:**\n`%BF = 163.205 × log₁₀(талия + бёдра − шея) − 97.684 × log₁₀(рост) − 78.387`\n\nВсе измерения в см.\n\n### Интерпретация (ACSM)\n| Категория | ♂ | ♀ |\n|---|---|---|\n| Эссенциальный | 2-5% | 10-13% |\n| Спортсмен | 6-13% | 14-20% |\n| Фитнес | 14-17% | 21-24% |\n| Среднее | 18-24% | 25-31% |\n| Ожирение | ≥ 25% | ≥ 32% |\n\n### Ограничения\n- Точность ± 3-4% vs DEXA\n- Не применимо у беременных, детей, при отёках\n- Плохо работает у бодибилдеров и ожирения III ст.\n\n### Альтернативные методы\n| Метод | Точность | Доступность |\n|---|---|---|\n| DEXA | ±1-2% | Научная |\n| MRI/CT | Золотой стандарт | Ограничена |\n| BIA | ±3-5% | Высокая (зависит от гидратации) |\n| Калиперометрия (J-P) | ±3-4% | Средняя |\n| US Navy | ±3-4% | Максимальная |\n\n### Источник\nHodgdon JA, Beckett MB. *Naval Health Research Center* 1984.\nACSM Guidelines for Exercise Testing and Prescription (11th ed.), 2021.\n"
  };

export default runner;
