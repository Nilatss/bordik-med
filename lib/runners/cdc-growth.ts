// @ts-nocheck
/**
 * Runner: cdc-growth
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
        id: "ageYears",
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 2,
        max: 20,
        step: 0.1,
        quickValues: [
          2,
          5,
          8,
          12,
          15,
          18
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
        min: 8,
        max: 200,
        step: 0.1,
        quickValues: [
          12,
          20,
          30,
          50,
          70
        ]
      },
      {
        id: "height",
        label: "Рост",
        type: "number",
        unit: "см",
        min: 70,
        max: 220,
        step: 0.1,
        quickValues: [
          85,
          110,
          130,
          150,
          170
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.ageYears);
            const w = Number(v.weight);
            const h = Number(v.height);
            const bmi = w / Math.pow(h / 100, 2);
            // BMI-for-age approximate LMS median and SD (CDC 2000) by sex
            const bmiTable = {
                m: [
                    {
                        age: 2,
                        med: 16.0,
                        sd: 1.1
                    },
                    {
                        age: 5,
                        med: 15.3,
                        sd: 1.2
                    },
                    {
                        age: 8,
                        med: 16.0,
                        sd: 1.8
                    },
                    {
                        age: 10,
                        med: 16.7,
                        sd: 2.1
                    },
                    {
                        age: 12,
                        med: 17.8,
                        sd: 2.5
                    },
                    {
                        age: 15,
                        med: 20.2,
                        sd: 2.9
                    },
                    {
                        age: 18,
                        med: 22.3,
                        sd: 3.2
                    },
                    {
                        age: 20,
                        med: 23.0,
                        sd: 3.4
                    }
                ],
                f: [
                    {
                        age: 2,
                        med: 15.7,
                        sd: 1.1
                    },
                    {
                        age: 5,
                        med: 15.2,
                        sd: 1.3
                    },
                    {
                        age: 8,
                        med: 15.8,
                        sd: 1.9
                    },
                    {
                        age: 10,
                        med: 16.7,
                        sd: 2.3
                    },
                    {
                        age: 12,
                        med: 18.2,
                        sd: 2.7
                    },
                    {
                        age: 15,
                        med: 20.3,
                        sd: 3.0
                    },
                    {
                        age: 18,
                        med: 21.3,
                        sd: 3.3
                    },
                    {
                        age: 20,
                        med: 21.6,
                        sd: 3.5
                    }
                ]
            };
            const table = bmiTable[String(v.sex)] || bmiTable.m;
            let lo = table[0], hi = table[table.length - 1];
            for(let i = 0; i < table.length - 1; i++){
                if (age >= table[i].age && age <= table[i + 1].age) {
                    lo = table[i];
                    hi = table[i + 1];
                    break;
                }
            }
            const frac = hi.age === lo.age ? 0 : (age - lo.age) / (hi.age - lo.age);
            const med = lo.med + (hi.med - lo.med) * frac;
            const sd = lo.sd + (hi.sd - lo.sd) * frac;
            const z = (bmi - med) / sd;
            const pct = 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-2 * z * z / Math.PI))) * 100;
            let interpretation = '', color = '#22C55E';
            let details = '', actions = [];
            if (pct < 5) {
                interpretation = 'Недостаточная масса (< 5-й перц.)';
                color = '#3B82F6';
                details = 'ИМТ < 5-го перцентиля по CDC. Возможна нутритивная недостаточность, хроническое заболевание, расстройство пищевого поведения.';
                actions = [
                    'Оценка рациона, скрининг РПП (у подростков - EAT-26, SCOFF)',
                    'Исключить целиакию, ВЗК, муковисцидоз, эндокринопатии',
                    'Диетолог'
                ];
            } else if (pct < 85) {
                interpretation = 'Норма (5-85-й перц.)';
                color = '#22C55E';
                details = 'Здоровый ИМТ для возраста. Продолжать здоровый образ жизни.';
                actions = [
                    'Физическая активность ≥ 60 мин/сут',
                    'Сбалансированный рацион',
                    'Плановый контроль 1 раз в год'
                ];
            } else if (pct < 95) {
                interpretation = 'Избыточная масса (85-95-й)';
                color = '#F59E0B';
                details = 'Избыточная масса тела. Риск перехода в ожирение и кардиометаболических осложнений.';
                actions = [
                    'Семейно-ориентированная модификация образа жизни',
                    'Диетолог',
                    'Оценка АД, липидов, HbA1c при доп. факторах'
                ];
            } else if (pct < 99) {
                interpretation = 'Ожирение (≥ 95-й)';
                color = '#EF4444';
                details = 'Ожирение по CDC (ИМТ ≥ 95-й перцентиль). Высокий риск СД2, НАЖБП, артериальной гипертензии, OSA.';
                actions = [
                    'Полная метаболическая панель, липиды, HbA1c, АЛТ',
                    'АД, скрининг OSA (храп, сонливость)',
                    'Мультидисциплинарная программа снижения веса'
                ];
            } else {
                interpretation = 'Тяжёлое ожирение (≥ 99-й / BMI ≥ 120% 95-го)';
                color = '#991B1B';
                details = 'Тяжёлое ожирение. Рассмотреть интенсивные программы, фармакотерапию, метаболическую хирургию у подростков по показаниям.';
                actions = [
                    'Эндокринолог + детский бариатр',
                    'Фармакотерапия по AAP 2023 (семаглутид, орлистат, фентермин-топирамат по возрасту)',
                    'Оценка метаболического синдрома, OSA, NAFLD'
                ];
            }
            return {
                value: `BMI ${bmi.toFixed(1)}`,
                unit: `перц. ${pct.toFixed(0)}, Z ${z.toFixed(2)}`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Упрощённая аппроксимация LMS-таблиц CDC 2000 - для точного клинического решения используйте CDC Growth Chart App / PediTools',
                    'ИМТ у детей зависит от возраста и пола - абсолютное значение не интерпретируется как у взрослых',
                    'Не применима < 2 лет - используйте WHO 0-5',
                    'Мышечная масса (спортсмены) завышает ИМТ - оценивайте состав тела'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 5,
                            label: '< 5',
                            color: '#3B82F6'
                        },
                        {
                            min: 5,
                            max: 85,
                            label: '5-85',
                            color: '#22C55E'
                        },
                        {
                            min: 85,
                            max: 95,
                            label: '85-95',
                            color: '#F59E0B'
                        },
                        {
                            min: 95,
                            max: 99,
                            label: '≥ 95',
                            color: '#EF4444'
                        },
                        {
                            min: 99,
                            max: 100,
                            label: '≥ 99',
                            color: '#991B1B'
                        }
                    ],
                    current: Number(pct.toFixed(0)),
                    unit: 'перц.'
                },
                related: [
                    {
                        id: 'who-growth',
                        title: 'WHO 0-5'
                    },
                    {
                        id: 'uk-who',
                        title: 'UK-WHO'
                    },
                    {
                        id: 'bmi',
                        title: 'BMI (взрослые)'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия 0-2'
                    },
                    {
                        id: '202.3',
                        title: 'Метаболизм'
                    }
                ]
            };
        },
    reference: "CDC Growth Charts 2000 (Kuczmarski). Для детей 2-20 лет в США и как международный вариант > 5 лет.",
    countries: "США · международный 2-20 лет",
    presets: [
      {
        label: "♂ 10 лет, 32 кг, 138 см",
        values: {
          ageYears: 10,
          sex: "m",
          weight: 32,
          height: 138
        }
      },
      {
        label: "♀ 15 лет, 55 кг, 162 см",
        values: {
          ageYears: 15,
          sex: "f",
          weight: 55,
          height: 162
        }
      }
    ],
    info: "### Для чего используется\n**CDC Growth Charts (2000)** - американские референсные кривые для детей и подростков **2-20 лет** (рост, вес, ИМТ-для-возраста). Ключевой инструмент педиатрии в США.\n\n### Параметры\n- Weight-for-age\n- Stature-for-age\n- BMI-for-age (главный индикатор избыточного веса / ожирения)\n- Weight-for-stature (2-5 лет)\n\n### Пороги ИМТ-для-возраста\n| Перцентиль | Классификация |\n|---|---|\n| < 5 | Недостаточная масса |\n| 5-85 | Норма |\n| 85-95 | Избыточная масса |\n| ≥ 95 | Ожирение |\n| ≥ 99 (или BMI ≥ 120 % от 95-го) | Тяжёлое ожирение |\n\n### WHO vs CDC\nВОЗ рекомендует WHO 0-5 лет (стандарт - вскармливание грудью), далее - CDC или национальные. CDC до 5 лет даёт несколько более «тяжёлых» детей по сравнению с WHO.\n\n### Ограничения\n- CDC 2000 основан на данных NHANES до эпидемии ожирения - современные BMI-кривые выше исторических\n- Не использовать у детей < 2 лет - WHO предпочтительнее\n- При задержке/ускорении полового развития - пересматривать по Tanner\n\n### Источник\nKuczmarski RJ et al. CDC growth charts: United States. *Vital Health Stat* 2000;(314):1-27.\nHampl SE et al. AAP Clinical Practice Guideline for Pediatric Obesity. *Pediatrics* 2023;151:e2022060640."
  };

export default runner;
