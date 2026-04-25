// @ts-nocheck
/**
 * Runner: uk-who
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
        hint: 'Возраст в годах',
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 0,
        max: 18,
        step: 0.1,
        quickValues: [
          0.5,
          1,
          2,
          4,
          10,
          15
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
        hint: 'Вес в кг (без одежды)',
        label: "Масса",
        type: "number",
        unit: "кг",
        min: 1,
        max: 150,
        step: 0.1,
        quickValues: [
          7,
          12,
          20,
          40,
          60
        ]
      },
      {
        id: "height",
        hint: 'Рост в см (без обуви)',
        label: "Рост/длина",
        type: "number",
        unit: "см",
        min: 40,
        max: 210,
        step: 0.1,
        quickValues: [
          60,
          85,
          110,
          140,
          170
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.ageYears);
            const w = Number(v.weight);
            const h = Number(v.height);
            const bmi = w / Math.pow(h / 100, 2);
            // Use WHO anchors for <4y, CDC anchors for 4-18y
            let zBMI = 0;
            let source = '';
            if (age < 4) {
                source = 'WHO (0-4 y)';
                const med = age < 1 ? 17 : age < 2 ? 16.5 : 16.0;
                zBMI = (bmi - med) / 1.3;
            } else {
                source = 'UK1990/CDC (4-18 y)';
                const med = 15.5 + (age - 4) * 0.45;
                zBMI = (bmi - med) / (1.5 + (age - 4) * 0.1);
            }
            const pct = 0.5 * (1 + Math.sign(zBMI) * Math.sqrt(1 - Math.exp(-2 * zBMI * zBMI / Math.PI))) * 100;
            let interpretation = '', color = '#22C55E';
            let details = '', actions = [];
            if (pct < 2) {
                interpretation = 'Ниже 2-го перц.';
                color = '#3B82F6';
                details = 'Ниже 2-го перцентиля по UK-WHO - низкий вес; необходима оценка причины.';
                actions = [
                    'Оценить динамику роста с рождения',
                    'Рацион и усвоение',
                    'Исключить целиакию, муковисцидоз'
                ];
            } else if (pct < 91) {
                interpretation = 'В норме (2-91-й)';
                color = '#22C55E';
                details = 'Нормальный показатель по UK-WHO. Плановое наблюдение.';
                actions = [
                    'Контроль роста по графику UK-WHO',
                    'Здоровый рацион и активность'
                ];
            } else if (pct < 98) {
                interpretation = 'Избыточная масса (91-98-й)';
                color = '#F59E0B';
                details = '91-98-й перцентиль по UK-WHO = избыточная масса (clinical overweight cut-off).';
                actions = [
                    'Рекомендации по питанию (Healthy Start, UK)',
                    'Физическая активность ≥ 60 мин/сут'
                ];
            } else {
                interpretation = 'Ожирение (≥ 98-й)';
                color = '#EF4444';
                details = 'UK-WHO cut-off для ожирения - ≥ 98-й перцентиль ИМТ.';
                actions = [
                    'Мультидисциплинарная программа Tier 2/3',
                    'Оценка кардиометаболического риска'
                ];
            }
            return {
                value: `BMI ${bmi.toFixed(1)}`,
                unit: `перц. ${pct.toFixed(0)} · ${source}`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'UK-WHO = WHO 0-4 y + UK1990 4-18 y (гибрид); упрощённая аппроксимация здесь',
                    'Официальные графики RCPCH - для точных значений используйте бумажные карты или LMSgrowth',
                    'Пороги Великобритании отличаются от CDC: клинический overweight ≥ 91, obesity ≥ 98 (популяционный мониторинг - 85/95)',
                    'У недоношенных корректировать возраст до 2 лет'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 2,
                            label: '< 2',
                            color: '#3B82F6'
                        },
                        {
                            min: 2,
                            max: 91,
                            label: '2-91',
                            color: '#22C55E'
                        },
                        {
                            min: 91,
                            max: 98,
                            label: '91-98',
                            color: '#F59E0B'
                        },
                        {
                            min: 98,
                            max: 100,
                            label: '≥ 98',
                            color: '#EF4444'
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
                        id: 'cdc-growth',
                        title: 'CDC 2-20'
                    },
                    {
                        id: 'ru-growth',
                        title: 'РФ нормы'
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
    reference: "RCPCH UK-WHO Growth Charts (2009). Гибрид: WHO 0-4 y + UK1990 4-18 y.",
    countries: "Великобритания · Ирландия",
    presets: [
      {
        label: "♀ 6 мес, 7 кг, 65 см",
        values: {
          ageYears: 0.5,
          sex: "f",
          weight: 7,
          height: 65
        }
      },
      {
        label: "♂ 10 лет, 32 кг, 140 см",
        values: {
          ageYears: 10,
          sex: "m",
          weight: 32,
          height: 140
        }
      }
    ],
    info: "### Для чего используется\n**UK-WHO Growth Charts (RCPCH, 2009)** - официальные графики роста в Великобритании и Ирландии. Гибрид: WHO 0-4 года + UK1990 4-18 лет.\n\n### Когда какой источник\n| Возраст | Референс |\n|---|---|\n| 0 - 2 нед | UK1990 (преждевременность) |\n| 2 нед - 4 года | WHO 2006 |\n| 4 - 18 лет | UK1990 |\n\n### Перцентильные пороги (UK)\n| Перцентиль | Клинический смысл |\n|---|---|\n| < 0.4 | Очень низкий - обязательное обследование |\n| < 2 | Низкий вес/рост |\n| 2-91 | Норма |\n| 91-98 | Overweight (клинический) |\n| ≥ 98 | Obesity (клинический) |\n| 85/95 | Популяционный мониторинг (как CDC) |\n\n### Особенности UK-WHO\n- Используется возраст с коррекцией у недоношенных до 2 лет\n- Отдельные карты для детей с синдромом Дауна, ахондроплазией, Turner\n- Отдельный preterm chart для < 32 нед"
  };

export default runner;
