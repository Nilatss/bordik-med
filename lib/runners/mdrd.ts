// @ts-nocheck
/**
 * Runner: mdrd
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
        id: "age",
        hint: 'Возраст в годах',
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 18,
        max: 120,
        quickValues: [
          30,
          45,
          60,
          70,
          80
        ]
      },
      {
        id: "creatinine",
        hint: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л',
        label: "Креатинин сыворотки",
        type: "number",
        unit: "мкмоль/л",
        min: 10,
        max: 2000,
        step: 1,
        quickValues: [
          70,
          90,
          120,
          160,
          220,
          350
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const scr_mgdl = Number(v.creatinine) / 88.4;
            const female = v.female === true;
            const egfr = 175 * Math.pow(scr_mgdl, -1.154) * Math.pow(age, -0.203) * (female ? 0.742 : 1);
            let interpretation = '', color = '#1A1A1A';
            if (egfr >= 90) {
                interpretation = 'G1 - норма';
                color = '#22C55E';
            } else if (egfr >= 60) {
                interpretation = 'G2 - лёгкое сниж.';
                color = '#22C55E';
            } else if (egfr >= 30) {
                interpretation = 'G3 - умеренное';
                color = '#F59E0B';
            } else if (egfr >= 15) {
                interpretation = 'G4 - тяжёлое';
                color = '#EF4444';
            } else {
                interpretation = 'G5 - ТПН';
                color = '#991B1B';
            }
            return {
                value: egfr.toFixed(0),
                unit: 'мл/мин/1.73м²',
                interpretation,
                color,
                details: 'MDRD (4-var, 1999) - историческая формула оценки СКФ. Занижает истинную СКФ в диапазоне > 60 мл/мин/1,73 м² и хуже работает у молодых и здоровых. Современный стандарт - CKD-EPI 2021 (race-free). Используйте MDRD только для сравнения со старыми лабораторными отчётами.',
                actions: [
                    'Для стадирования ХБП и принятия решений - пересчитать по CKD-EPI 2021',
                    'Для дозирования препаратов - использовать Cockcroft-Gault (требование FDA/EMA)',
                    'Не использовать у пациентов старше 70 лет как основной метод (MDRD недооценивает СКФ)'
                ],
                caveats: [
                    'Занижает СКФ при истинных значениях > 60 мл/мин/1,73 м²',
                    'Валидизирована на пациентах с ХБП, не на здоровой популяции',
                    'Исходная версия включала расовую поправку - современные руководства отказались от неё',
                    'Не применима при AKI и беременности'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 15,
                            label: 'G5',
                            color: '#991B1B'
                        },
                        {
                            min: 15,
                            max: 30,
                            label: 'G4',
                            color: '#EF4444'
                        },
                        {
                            min: 30,
                            max: 60,
                            label: 'G3',
                            color: '#F59E0B'
                        },
                        {
                            min: 60,
                            max: 90,
                            label: 'G2',
                            color: '#22C55E'
                        },
                        {
                            min: 90,
                            max: 150,
                            label: 'G1',
                            color: '#22C55E'
                        }
                    ],
                    current: Number(egfr.toFixed(0)),
                    unit: 'мл/мин/1.73м²'
                },
                relatedCourses: [
                    {
                        id: '301.5',
                        title: "Нефрология"
                    }
                ],
                related: [
                    {
                        id: 'ckd-epi',
                        title: 'CKD-EPI 2021'
                    },
                    {
                        id: 'cockcroft',
                        title: 'Cockcroft-Gault'
                    }
                ]
            };
        },
    reference: "MDRD Study (4-var), 2006. Для эпидемиологических исследований.",
    presets: [
      {
        label: "Норма ♂",
        values: {
          age: 40,
          creatinine: 88,
          female: false
        }
      },
      {
        label: "Норма ♀",
        values: {
          age: 40,
          creatinine: 70,
          female: true
        }
      },
      {
        label: "G3 ХБП",
        values: {
          age: 65,
          creatinine: 160,
          female: false
        }
      },
      {
        label: "G4 ХБП",
        values: {
          age: 70,
          creatinine: 280,
          female: true
        }
      }
    ],
    info: "### Для чего используется\n**MDRD Study Equation (4-variable, 2006)** - историческая формула для оценки СКФ, выведенная из исследования **Modification of Diet in Renal Disease**. Была стандартом в США в 2005-2012 гг.\n\nСейчас заменена на **CKD-EPI**, но всё ещё встречается в старых протоколах и некоторых европейских лабораториях.\n\n### Формула\n`eGFR = 175 × SCr(mg/dL)^−1,154 × возраст^−0,203 × (0,742 если жен) × (1,212 если афроамер.)`\n\nЕдиницы: мл/мин/1,73 м²\n\n### Почему MDRD заменили\n- **Неточная при СКФ > 60** - систематически занижает у здоровых\n- Расовый коэффициент (как и у CKD-EPI 2009) убран в 2021\n- CKD-EPI точнее во всём диапазоне\n\n### Когда ещё встречается MDRD\n- Старые лабораторные отчёты\n- Некоторые клинические протоколы\n- Формулы перевода (\"MDRD → CKD-EPI\")\n- Листы ожидания трансплантации почек в ряде центров\n\n### Стадии (те же, что у CKD-EPI)\n| Стадия | eGFR |\n|---|---|\n| G1 | ≥ 90 |\n| G2 | 60-89 |\n| G3 | 30-59 |\n| G4 | 15-29 |\n| G5 | < 15 |\n\n### Рекомендация\n⚠️ Для новых расчётов используйте **CKD-EPI 2021 (race-free)**. MDRD оставлен для обратной совместимости и чтения старых карт.\n\n### Ограничения (общие с CKD-EPI)\n- Не применима при AKI\n- Неточна при экстремальных BMI\n- Основана на креатинине (зависит от мышечной массы)"
  };

export default runner;
