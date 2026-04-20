// @ts-nocheck
/**
 * Runner: score2
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
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 40,
        max: 89,
        step: 1,
        quickValues: [
          45,
          50,
          55,
          60,
          65,
          70,
          75,
          80
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      },
      {
        id: "smoker",
        label: "Курит",
        type: "checkbox"
      },
      {
        id: "sbp",
        label: "САД",
        type: "number",
        unit: "мм рт.ст.",
        min: 100,
        max: 220,
        step: 1,
        quickValues: [
          120,
          130,
          140,
          150,
          160,
          170
        ]
      },
      {
        id: "nonhdl",
        label: "Не-ЛПВП холестерин",
        type: "number",
        unit: "ммоль/л",
        min: 2,
        max: 10,
        step: 0.1,
        quickValues: [
          3,
          3.5,
          4,
          4.5,
          5,
          6
        ]
      },
      {
        id: "region",
        label: "Регион риска ESC",
        type: "select",
        options: [
          {
            value: "low",
            label: "Низкий (BE, DK, FR, IL, LU, ES, CH, NL)"
          },
          {
            value: "mod",
            label: "Умеренный (AT, CY, FI, DE, GR, IS, IE, IT, MT, NO, PT, SM, SI, SE, UK)"
          },
          {
            value: "high",
            label: "Высокий (BA, HR, CZ, EE, HU, PL, SK, TR)"
          },
          {
            value: "vhigh",
            label: "Очень высокий (AL, AM, AZ, BY, BG, GE, KZ, KG, LV, LT, MK, MD, ME, RO, RU, RS, TJ, TM, UA, UZ, DZ, EG, LY, MA, SY, TN)"
          }
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const female = v.female === true;
            const smoker = v.smoker === true;
            const sbp = Number(v.sbp);
            const nonhdl = Number(v.nonhdl);
            const region = String(v.region || 'mod');
            // SCORE2 (ESC Heart J 2021) for age < 70; SCORE2-OP for ≥ 70.
            // Коэффициенты uncalibrated (SCORE2 original) + scaling factors per region.
            // Transform values
            const cAge = (age - 60) / 5;
            const cSBP = (sbp - 120) / 20;
            const cNonHDL = nonhdl - 6;
            const cSmoker = smoker ? 1 : 0;
            let xb = 0, s0 = 0;
            if (age < 70) {
                if (female) {
                    xb = 0.4648 * cAge + 0.3781 * cSmoker + 0.3131 * cSBP + 0.1002 * cNonHDL - 0.0277 * cAge * cSmoker - 0.0226 * cAge * cSBP - 0.0061 * cAge * cNonHDL;
                    s0 = 0.9776;
                } else {
                    xb = 0.3742 * cAge + 0.6012 * cSmoker + 0.2777 * cSBP + 0.1458 * cNonHDL - 0.0255 * cAge * cSmoker - 0.0281 * cAge * cSBP - 0.0089 * cAge * cNonHDL;
                    s0 = 0.9605;
                }
            } else {
                // SCORE2-OP (age 70-89)
                if (female) {
                    xb = 0.1176 * (age - 73) + 0.3580 * cSmoker + 0.1608 * cSBP + 0.1010 * cNonHDL - 0.0126 * (age - 73) * cSmoker - 0.0109 * (age - 73) * cSBP;
                    s0 = 0.6630;
                } else {
                    xb = 0.0634 * (age - 73) + 0.3524 * cSmoker + 0.1373 * cSBP + 0.1368 * cNonHDL - 0.0088 * (age - 73) * cSmoker - 0.0077 * (age - 73) * cSBP;
                    s0 = 0.7576;
                }
            }
            let risk = 1 - Math.pow(s0, Math.exp(xb));
            // Recalibration scaling by region (ESC 2021 Supplementary Table 8)
            const scale = {
                low: {
                    mF: -0.85,
                    mM: -0.52,
                    sF: 0.82,
                    sM: 0.81
                },
                mod: {
                    mF: -0.28,
                    mM: -0.10,
                    sF: 0.81,
                    sM: 0.70
                },
                high: {
                    mF: 0.26,
                    mM: 0.23,
                    sF: 0.86,
                    sM: 0.79
                },
                vhigh: {
                    mF: 0.95,
                    mM: 0.67,
                    sF: 0.96,
                    sM: 0.89
                }
            };
            const sc = scale[region] ?? scale.mod;
            const m = female ? sc.mF : sc.mM;
            const s = female ? sc.sF : sc.sM;
            const lcl = Math.log(-Math.log(1 - risk));
            risk = 1 - Math.exp(-Math.exp(m + s * lcl));
            const r = Math.max(0, Math.min(99, risk * 100));
            // Age-adjusted thresholds (ESC 2021): < 50y low <2.5, high ≥7.5; 50-69 low <5, high ≥10; ≥70 low <7.5, high ≥15.
            let lowT = 0, highT = 0;
            if (age < 50) {
                lowT = 2.5;
                highT = 7.5;
            } else if (age < 70) {
                lowT = 5.0;
                highT = 10.0;
            } else {
                lowT = 7.5;
                highT = 15.0;
            }
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (r < lowT) {
                interpretation = 'Низкий-умеренный риск (возраст-адаптированный)';
                color = '#22C55E';
                details = `10-летний риск фатального + нефатального CVD < ${lowT} % для возрастной группы.`;
                actions = [
                    'Образ жизни',
                    'Контроль АД < 140/90'
                ];
            } else if (r < highT) {
                interpretation = 'Высокий риск';
                color = '#F59E0B';
                details = `Риск ${lowT}-${highT} % - высокая категория. Показана активная модификация ФР.`;
                actions = [
                    'Цель LDL-C < 1,8 ммоль/л (снижение ≥ 50 %)',
                    'АД < 130/80 (если переносимо)',
                    'Статин умеренной-высокой интенсивности'
                ];
            } else {
                interpretation = 'Очень высокий риск';
                color = '#EF4444';
                details = `Риск ≥ ${highT} % - очень высокий. Агрессивная превентивная терапия.`;
                actions = [
                    'Цель LDL-C < 1,4 ммоль/л (ESC 2021 Dyslipidaemia)',
                    'АД < 130/80',
                    'Статин высокой интенсивности ± эзетимиб ± PCSK9i',
                    'Аспирин 75 мг после оценки кровотечения (индивидуально)'
                ];
            }
            return {
                value: r.toFixed(1),
                unit: '%',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'SCORE2 - для возраста 40-69, SCORE2-OP - для 70-89',
                    'Регион риска выбирайте по стране пациента (ESC 2021 стратификация)',
                    'Не применять при известной ASCVD, семейной гиперхолестеринемии, СД с ПОМ, ХБП G4-G5 - риск автоматически высокий / очень высокий',
                    'Non-HDL = ТC − HDL; более точен, чем LDL, при гипертриглицеридемии'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: lowT,
                            label: 'Низк./умер.',
                            color: '#22C55E'
                        },
                        {
                            min: lowT,
                            max: highT,
                            label: 'Высокий',
                            color: '#F59E0B'
                        },
                        {
                            min: highT,
                            max: 50,
                            label: 'Очень выс.',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(r.toFixed(1)),
                    unit: '%'
                },
                related: [
                    {
                        id: 'ascvd',
                        title: 'ACC/AHA ASCVD'
                    },
                    {
                        id: 'framingham',
                        title: 'Framingham'
                    },
                    {
                        id: 'qrisk3',
                        title: 'QRISK3 (UK)'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    }
                ]
            };
        },
    reference: "SCORE2 working group & ESC CVD Risk Collaboration. SCORE2 risk prediction algorithms. Eur Heart J 2021;42:2439-54.",
    countries: "Европа (ESC)",
    presets: [
      {
        label: "♂ 55 UK, курит",
        values: {
          age: 55,
          female: false,
          smoker: true,
          sbp: 145,
          nonhdl: 4.5,
          region: "mod"
        }
      },
      {
        label: "♀ 60 RU, АГ",
        values: {
          age: 60,
          female: true,
          smoker: false,
          sbp: 160,
          nonhdl: 5,
          region: "vhigh"
        }
      },
      {
        label: "♂ 72 DE (SCORE2-OP)",
        values: {
          age: 72,
          female: false,
          smoker: false,
          sbp: 150,
          nonhdl: 4.2,
          region: "mod"
        }
      }
    ],
    info: "### Для чего используется\n**SCORE2** (для 40-69 лет) и **SCORE2-OP** (Older Persons, 70-89) - ESC-алгоритм расчёта 10-летнего риска **фатального + нефатального** CVD-события (ИМ, инсульт) на основе европейских когорт с калибровкой на 4 региона риска.\n\n### Формула\nМодель Fine-Gray с центрированными предикторами:\n- age − 60\n- SBP − 120\n- non-HDL − 6\n- курение (0/1)\n- взаимодействия age × (курение, SBP, non-HDL)\n\nФинальная рекалибровка log-log-преобразованием по региональным коэффициентам (low / moderate / high / very-high risk).\n\n### Регионы риска (ESC 2021)\n| Регион | Страны |\n|---|---|\n| Низкий | BE, DK, FR, IL, LU, ES, CH, NL |\n| Умеренный | AT, CY, FI, DE, GR, IS, IE, IT, MT, NO, PT, SM, SI, SE, UK |\n| Высокий | BA, HR, CZ, EE, HU, PL, SK, TR |\n| Очень высокий | AL, AM, AZ, BY, BG, GE, KZ, KG, LV, LT, MK, MD, ME, **RO, RU**, RS, TJ, TM, **UA, UZ**, DZ, EG, LY, MA, SY, TN |\n\n### Возраст-адаптированные пороги (ESC 2021)\n| Возраст | Низкий-умеренный | Высокий | Очень высокий |\n|---|---|---|---|\n| < 50 | < 2,5 % | 2,5-< 7,5 % | ≥ 7,5 % |\n| 50-69 | < 5 % | 5-< 10 % | ≥ 10 % |\n| ≥ 70 | < 7,5 % | 7,5-< 15 % | ≥ 15 % |\n\n### Цели при высоком/очень высоком риске (ESC 2021 Dyslipidaemia)\n| Категория | LDL-C | АД |\n|---|---|---|\n| Высокий | < 1,8 и ↓ ≥ 50 % | < 130/80 |\n| Очень высокий | < 1,4 и ↓ ≥ 50 % | < 130/80 |\n| Экстремальный (повторное событие < 2 лет) | < 1,0 | < 130/80 |\n\n### Ограничения\n- Не применять при уже диагностированной ASCVD, СД с ПОМ, ХБП G4+, семейной гиперхолестеринемии\n- Требует non-HDL-C (не LDL)\n- Калибровка 4 регионов - приблизительная; оффициальный SCORE2 включает страновые коэффициенты\n\n### Источник\nSCORE2 working group & ESC Cardiovascular Risk Collaboration. SCORE2 risk prediction algorithms: new models to estimate 10-year risk of cardiovascular disease in Europe. *Eur Heart J* 2021;42(25):2439-2454.\nSCORE2-OP working group. SCORE2-OP risk prediction algorithms. *Eur Heart J* 2021;42(25):2455-2467.\nVisseren FLJ et al. 2021 ESC Guidelines on CVD prevention. *Eur Heart J* 2021;42:3227-3337."
  };

export default runner;
