// @ts-nocheck
/**
 * Runner: who-growth
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
        id: "ageMonths",
        label: "Возраст",
        type: "number",
        unit: "мес",
        min: 0,
        max: 60,
        step: 1,
        quickValues: [
          0,
          3,
          6,
          12,
          24,
          36,
          48,
          60
        ]
      },
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
        id: "weight",
        label: "Масса тела",
        type: "number",
        unit: "кг",
        min: 1,
        max: 40,
        step: 0.1,
        quickValues: [
          3.3,
          7,
          10,
          13,
          16,
          20
        ]
      },
      {
        id: "height",
        label: "Длина/рост",
        type: "number",
        unit: "см",
        min: 40,
        max: 130,
        step: 0.1,
        quickValues: [
          50,
          65,
          75,
          87,
          100,
          110
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.ageMonths);
            const sex = String(v.sex);
            const w = Number(v.weight);
            const h = Number(v.height);
            // Упрощённые медианы WHO (2006) по полу и возрасту (кг и см) - reference anchors
            const anchors = {
                m: [
                    {
                        age: 0,
                        wMed: 3.3,
                        wSD: 0.4,
                        hMed: 49.9,
                        hSD: 1.9
                    },
                    {
                        age: 3,
                        wMed: 6.4,
                        wSD: 0.7,
                        hMed: 61.4,
                        hSD: 2.2
                    },
                    {
                        age: 6,
                        wMed: 7.9,
                        wSD: 0.9,
                        hMed: 67.6,
                        hSD: 2.3
                    },
                    {
                        age: 12,
                        wMed: 9.6,
                        wSD: 1.1,
                        hMed: 75.7,
                        hSD: 2.6
                    },
                    {
                        age: 24,
                        wMed: 12.2,
                        wSD: 1.4,
                        hMed: 87.1,
                        hSD: 3.1
                    },
                    {
                        age: 36,
                        wMed: 14.3,
                        wSD: 1.6,
                        hMed: 95.3,
                        hSD: 3.5
                    },
                    {
                        age: 48,
                        wMed: 16.3,
                        wSD: 1.9,
                        hMed: 102.5,
                        hSD: 3.9
                    },
                    {
                        age: 60,
                        wMed: 18.3,
                        wSD: 2.2,
                        hMed: 109.2,
                        hSD: 4.3
                    }
                ],
                f: [
                    {
                        age: 0,
                        wMed: 3.2,
                        wSD: 0.4,
                        hMed: 49.1,
                        hSD: 1.9
                    },
                    {
                        age: 3,
                        wMed: 5.8,
                        wSD: 0.7,
                        hMed: 59.8,
                        hSD: 2.2
                    },
                    {
                        age: 6,
                        wMed: 7.3,
                        wSD: 0.9,
                        hMed: 65.7,
                        hSD: 2.3
                    },
                    {
                        age: 12,
                        wMed: 8.9,
                        wSD: 1.1,
                        hMed: 74.0,
                        hSD: 2.7
                    },
                    {
                        age: 24,
                        wMed: 11.5,
                        wSD: 1.4,
                        hMed: 85.7,
                        hSD: 3.1
                    },
                    {
                        age: 36,
                        wMed: 13.9,
                        wSD: 1.7,
                        hMed: 94.2,
                        hSD: 3.6
                    },
                    {
                        age: 48,
                        wMed: 16.1,
                        wSD: 2.0,
                        hMed: 101.6,
                        hSD: 4.0
                    },
                    {
                        age: 60,
                        wMed: 18.2,
                        wSD: 2.3,
                        hMed: 108.4,
                        hSD: 4.4
                    }
                ]
            };
            const table = anchors[sex] || anchors.m;
            // linear interpolation between anchors
            let lo = table[0], hi = table[table.length - 1];
            for(let i = 0; i < table.length - 1; i++){
                if (age >= table[i].age && age <= table[i + 1].age) {
                    lo = table[i];
                    hi = table[i + 1];
                    break;
                }
            }
            const frac = hi.age === lo.age ? 0 : (age - lo.age) / (hi.age - lo.age);
            const wMed = lo.wMed + (hi.wMed - lo.wMed) * frac;
            const wSD = lo.wSD + (hi.wSD - lo.wSD) * frac;
            const hMed = lo.hMed + (hi.hMed - lo.hMed) * frac;
            const hSD = lo.hSD + (hi.hSD - lo.hSD) * frac;
            const zW = (w - wMed) / wSD;
            const zH = (h - hMed) / hSD;
            // BMI-for-age (simplified normal approximation around median BMI)
            const bmi = w / Math.pow(h / 100, 2);
            const bmiMed = wMed / Math.pow(hMed / 100, 2);
            const zBMI = (bmi - bmiMed) / (bmiMed * 0.08); // rough CV-based SD ~8%
            // percentile from z (normal CDF approximation)
            const pct = (z)=>{
                const p = 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-2 * z * z / Math.PI)));
                return Math.max(0.1, Math.min(99.9, p * 100));
            };
            let interpretation = '', color = '#22C55E';
            let details = '';
            let actions = [];
            const minZ = Math.min(zW, zH);
            if (minZ < -3) {
                interpretation = 'Тяжёлое отклонение (Z < −3)';
                color = '#991B1B';
                details = 'Z-score ниже −3 по WHO = тяжёлая недостаточность питания / задержка роста. Требуется срочная оценка по протоколу SAM (severe acute malnutrition).';
                actions = [
                    'Госпитализация при тяжёлой нутритивной недостаточности (WHO/UNICEF)',
                    'Исключить туберкулёз, ВИЧ, целиакию, муковисцидоз',
                    'Терапевтическое питание F-75 / F-100, RUTF'
                ];
            } else if (minZ < -2) {
                interpretation = 'Умеренное отклонение (Z −3…−2)';
                color = '#EF4444';
                details = 'Z-score −3…−2 = умеренная недостаточность (wasting/stunting). Нужно диетологическое вмешательство и поиск причины.';
                actions = [
                    'Оценка рациона, диетологическая коррекция',
                    'Скрининг железодефицита, витамина D, B12',
                    'Наблюдение ежемесячно'
                ];
            } else if (minZ < -1) {
                interpretation = 'Пограничное (Z −2…−1)';
                color = '#F59E0B';
                details = 'Отклонение в пограничной зоне. Нужен мониторинг динамики - один замер не диагноз.';
                actions = [
                    'Повторить измерение через 1-2 мес',
                    'Оценить рацион и режим кормления'
                ];
            } else if (zW > 2) {
                interpretation = 'Z > +2 (избыточная масса)';
                color = '#F59E0B';
                details = 'Избыточная масса по WHO (Z > +2). У детей до 5 лет особенно важно - риск последующего ожирения.';
                actions = [
                    'Консультация диетолога',
                    'Физическая активность, ограничение сладких напитков',
                    'Оценка режима кормления'
                ];
            } else {
                interpretation = 'В норме (Z −1…+2)';
                color = '#22C55E';
                details = 'Антропометрия соответствует возрастной норме WHO.';
                actions = [
                    'Плановое наблюдение',
                    'Грудное вскармливание до 2 лет + прикорм с 6 мес'
                ];
            }
            return {
                value: `WAZ ${zW.toFixed(2)} · HAZ ${zH.toFixed(2)}`,
                unit: `BMI ${bmi.toFixed(1)} (Z ${zBMI.toFixed(2)})`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Упрощённая реализация по якорным точкам WHO 2006 - для точных значений используйте WHO Anthro / LMS-таблицы',
                    'Не применимо у недоношенных до скорригированного возраста - используйте Fenton / INTERGROWTH-21st',
                    'Один замер не диагноз - оценивайте динамику (траекторию роста)',
                    'WAZ недостоверен при отёках (квашиоркор) - используйте MUAC и клинический осмотр'
                ],
                scale: {
                    segments: [
                        {
                            min: -5,
                            max: -3,
                            label: 'Z<−3',
                            color: '#991B1B'
                        },
                        {
                            min: -3,
                            max: -2,
                            label: '−3…−2',
                            color: '#EF4444'
                        },
                        {
                            min: -2,
                            max: -1,
                            label: '−2…−1',
                            color: '#F59E0B'
                        },
                        {
                            min: -1,
                            max: 2,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 2,
                            max: 5,
                            label: '>+2',
                            color: '#F59E0B'
                        }
                    ],
                    current: Number(zW.toFixed(2)),
                    unit: 'WAZ'
                },
                related: [
                    {
                        id: 'cdc-growth',
                        title: 'CDC 2-20'
                    },
                    {
                        id: 'uk-who',
                        title: 'UK-WHO'
                    },
                    {
                        id: 'intergrowth',
                        title: 'INTERGROWTH-21st'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия 0-2'
                    }
                ]
            };
        },
    reference: "WHO Child Growth Standards, 2006. Multicentre Growth Reference Study (Бразилия, Гана, Индия, Норвегия, Оман, США).",
    countries: "Международный (ВОЗ)",
    presets: [
      {
        label: "♂ 3 мес, 6.4 кг, 61 см",
        values: {
          ageMonths: 3,
          sex: "m",
          weight: 6.4,
          height: 61
        }
      },
      {
        label: "♀ 12 мес, 8.9 кг, 74 см",
        values: {
          ageMonths: 12,
          sex: "f",
          weight: 8.9,
          height: 74
        }
      },
      {
        label: "♂ 24 мес, 12.2 кг, 87 см",
        values: {
          ageMonths: 24,
          sex: "m",
          weight: 12.2,
          height: 87
        }
      }
    ],
    info: "### Для чего используется\n**WHO Child Growth Standards (2006)** - международный референс физического развития детей **0-5 лет**. Основан на данных 8440 детей из 6 стран, вскармливаемых грудью и живущих в оптимальных условиях. Рекомендован ВОЗ как универсальный стандарт для всех популяций.\n\n### Параметры\n- Weight-for-age (WAZ)\n- Length/height-for-age (HAZ)\n- Weight-for-length/height (WHZ)\n- BMI-for-age (BAZ)\n- Head circumference-for-age\n- MUAC (mid-upper-arm circumference, 3-59 мес)\n\n### Интерпретация Z-score\n| Z-score | Интерпретация |\n|---|---|\n| < −3 | Тяжёлое отклонение |\n| −3 … −2 | Умеренное отклонение |\n| −2 … −1 | Пограничное |\n| −1 … +1 | Норма |\n| +1 … +2 | Выше среднего |\n| > +2 | Избыточная масса (для WHZ/BAZ) |\n\n### Классификация нутритивных нарушений\n| Показатель | Что отражает |\n|---|---|\n| WAZ | Общее недоедание (underweight) |\n| HAZ | Хроническое - задержка роста (stunting) |\n| WHZ / BAZ | Острое - истощение (wasting) |\n| MUAC < 115 мм | SAM у детей 6-59 мес |\n\n### Ограничения\n- Для недоношенных использовать Fenton / INTERGROWTH-21st до 50 нед PMA\n- Точные перцентили - через WHO Anthro (официальное приложение) или LMS-таблицы\n- Не применимо после 5 лет - переходить на WHO 5-19, CDC или национальные нормы\n\n### Источник\nWHO Multicentre Growth Reference Study Group. *WHO Child Growth Standards*, Geneva, 2006.\nde Onis M et al. *Acta Paediatr* 2006;Suppl 450."
  };

export default runner;
