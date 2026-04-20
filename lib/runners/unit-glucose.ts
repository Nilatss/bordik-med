// @ts-nocheck
/**
 * Runner: unit-glucose
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
        id: "value",
        label: "Глюкоза",
        type: "number",
        unit: "mg/dL",
        min: 20,
        max: 800,
        step: 1,
        quickValues: [
          70,
          100,
          140,
          200,
          300
        ]
      }
    ],
    compute: (v)=>{
            const mgdl = Number(v.value);
            const mmol = mgdl / 18.0182;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            if (mgdl < 70) {
                interpretation = 'Гипогликемия';
                color = '#3B82F6';
                details = 'Уровень глюкозы < 70 mg/dL (< 3,9 ммоль/л) - гипогликемия (ADA Level 1). При < 54 mg/dL (3,0 ммоль/л) - клинически значимая (Level 2), высокий риск нейроглюкопении.';
                actions = [
                    'Правило 15: 15 г быстрых углеводов → контроль через 15 минут',
                    'При нарушении сознания - глюкагон в/м 1 мг или 40% глюкоза в/в 20-50 мл',
                    'Поиск причины: передозировка инсулина/СМ, алкоголь, надпочечниковая недостаточность, инсулинома'
                ];
            } else if (mgdl < 100) {
                interpretation = 'Норма натощак';
                color = '#22C55E';
                details = 'Глюкоза натощак 70-99 mg/dL (3,9-5,5 ммоль/л) - норма по ADA.';
            } else if (mgdl < 126) {
                interpretation = 'Преддиабет (натощак)';
                color = '#F59E0B';
                details = 'Нарушенная гликемия натощак (IFG) - 100-125 mg/dL (5,6-6,9 ммоль/л). Повышенный риск СД2.';
                actions = [
                    'Модификация образа жизни: −7% массы, 150 мин/нед нагрузки',
                    'Повторить натощак или ПГТТ; измерить HbA1c',
                    'Обсудить метформин при высоком риске (возраст < 60, BMI > 35, ГСД в анамнезе)'
                ];
            } else {
                interpretation = 'Диабетический диапазон';
                color = '#EF4444';
                details = 'Глюкоза натощак ≥ 126 mg/dL (≥ 7,0 ммоль/л) - критерий СД2 (требует подтверждения повторным анализом или HbA1c).';
                actions = [
                    'Подтвердить: повторный анализ натощак ИЛИ HbA1c ≥ 6,5% ИЛИ ПГТТ 2ч ≥ 200 mg/dL',
                    'Скрининг осложнений: HbA1c, липиды, креатинин/рСКФ, UACR, офтальмоскопия, стопы',
                    'Начать терапию: метформин + модификация образа жизни; при ASCVD/ХСН/ХБП - SGLT2/GLP-1'
                ];
            }
            return {
                value: `${mgdl.toFixed(0)} mg/dL = ${mmol.toFixed(1)} ммоль/л`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Критерии ADA даны для глюкозы натощак (≥ 8 ч голода); для случайного измерения пороги другие',
                    'Венозная плазма vs капиллярная кровь: разница до 10-15%',
                    'Стресс-гипергликемия у госпитализированных не равна СД - требует контроля после выписки'
                ],
                scale: {
                    segments: [
                        {
                            min: 40,
                            max: 70,
                            label: 'Гипо',
                            color: '#3B82F6'
                        },
                        {
                            min: 70,
                            max: 100,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 100,
                            max: 126,
                            label: 'Преддиаб',
                            color: '#F59E0B'
                        },
                        {
                            min: 126,
                            max: 400,
                            label: 'Диабет',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(mgdl.toFixed(0)),
                    unit: 'mg/dL'
                },
                related: [
                    {
                        id: 'hba1c',
                        title: 'HbA1c → средняя глюкоза'
                    },
                    {
                        id: 'homa-ir',
                        title: 'HOMA-IR'
                    },
                    {
                        id: 'unit-creatinine',
                        title: 'Конверсия креатинина'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.4',
                        title: 'Эндокринология'
                    },
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    }
                ]
            };
        },
    reference: "ммоль/л = mg/dL ÷ 18,0182 (молекулярная масса глюкозы 180,16). ADA Standards of Care 2024.",
    countries: "Международный (США используют mg/dL; СИ - ммоль/л)",
    presets: [
      {
        label: "Норма натощак",
        values: {
          value: 90
        }
      },
      {
        label: "Преддиабет",
        values: {
          value: 110
        }
      },
      {
        label: "Диабет",
        values: {
          value: 180
        }
      },
      {
        label: "Гипогликемия",
        values: {
          value: 55
        }
      }
    ],
    info: "### Для чего используется\nКонверсия между **mg/dL** (принято в США, Германии) и **ммоль/л** (СИ, принято в РФ, ЕС, Великобритании, Азии).\n\n### Формула\n`ммоль/л = mg/dL ÷ 18,0182`\n`mg/dL = ммоль/л × 18,0182`\n\nКоэффициент - молекулярная масса глюкозы (180,16 г/моль) / 10.\n\n### Интерпретация (натощак, ADA 2024)\n| mg/dL | ммоль/л | Категория |\n|---|---|---|\n| < 70 | < 3,9 | Гипогликемия |\n| 70-99 | 3,9-5,5 | Норма |\n| 100-125 | 5,6-6,9 | Преддиабет (IFG) |\n| ≥ 126 | ≥ 7,0 | Диабет (требует подтверждения) |\n\n### Быстрые ориентиры\n- 100 mg/dL ≈ 5,5 ммоль/л\n- 180 mg/dL ≈ 10 ммоль/л (почечный порог глюкозы)\n- 200 mg/dL ≈ 11,1 ммоль/л (критерий СД при случайном измерении)\n\n### Ограничения\n- Пороги ADA - для плазмы венозной крови натощак\n- Капиллярная кровь отличается на 10-15%\n- При гиперлипидемии/гиперпротеинемии - возможна ошибка лабораторного метода\n\n### Источник\nAmerican Diabetes Association. Standards of Medical Care in Diabetes - 2024. *Diabetes Care* 47 (Suppl. 1): S1-S321."
  };

export default runner;
