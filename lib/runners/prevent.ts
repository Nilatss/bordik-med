// @ts-nocheck
/**
 * Runner: prevent
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
        min: 30,
        max: 79,
        step: 1,
        quickValues: [
          40,
          50,
          55,
          60,
          65,
          70
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      },
      {
        id: "sbp",
        hint: 'САД, мм рт.ст. Норма: <130',
        label: "САД",
        type: "number",
        unit: "мм рт.ст.",
        min: 80,
        max: 240,
        step: 1,
        quickValues: [
          110,
          120,
          130,
          140,
          150
        ]
      },
      {
        id: "treated",
        label: "Антигипертензивная терапия",
        type: "checkbox"
      },
      {
        id: "tc",
        hint: 'Общий холестерин. Норма: <5.0 ммоль/л',
        label: "Общий холестерин",
        type: "number",
        unit: "ммоль/л",
        min: 2,
        max: 15,
        step: 0.1,
        quickValues: [
          4,
          5,
          6,
          7
        ]
      },
      {
        id: "hdl",
        hint: 'ЛПВП. Норма: М ≥1.0, Ж ≥1.3 ммоль/л',
        label: "ХС-ЛПВП",
        type: "number",
        unit: "ммоль/л",
        min: 0.3,
        max: 4,
        step: 0.05,
        quickValues: [
          0.9,
          1,
          1.3,
          1.5
        ]
      },
      {
        id: "dm",
        label: "Сахарный диабет",
        type: "checkbox"
      },
      {
        id: "smoker",
        label: "Курит",
        type: "checkbox"
      },
      {
        id: "egfr",
        hint: 'Расчётная СКФ. ХБП ≥3 при <60',
        label: "eGFR",
        type: "number",
        unit: "мл/мин/1,73м²",
        min: 5,
        max: 150,
        step: 1,
        quickValues: [
          45,
          60,
          75,
          90,
          105
        ]
      },
      {
        id: "bmi",
        hint: 'ИМТ = вес (кг) / рост² (м²)',
        label: "BMI",
        type: "number",
        unit: "кг/м²",
        min: 15,
        max: 50,
        step: 0.1,
        quickValues: [
          22,
          25,
          28,
          30,
          35
        ]
      },
      {
        id: "statin",
        label: "Принимает статин",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const female = v.female === true;
            const sbp = Number(v.sbp);
            const treated = v.treated === true;
            const tc = Number(v.tc);
            const hdl = Number(v.hdl);
            const dm = v.dm === true;
            const smoker = v.smoker === true;
            const egfr = Number(v.egfr);
            const bmi = Number(v.bmi);
            const statin = v.statin === true;
            // Khan SS et al. Novel Prediction Equations for 10- and 30-Year Risk of Total CVD (PREVENT).
            // Circulation 2024;149:430. Non-HDL approach, mmol/L native units.
            const nonHDL = tc - hdl;
            const ageC = (age - 55) / 10;
            const nonHDLc = nonHDL - 3.5;
            const hdlC = (hdl - 1.3) / 0.3;
            const sbpLow = (Math.min(sbp, 110) - 110) / 20;
            const sbpHigh = (Math.max(sbp, 110) - 130) / 20;
            const egfrLow = (Math.min(egfr, 60) - 60) / -15;
            const egfrHigh = (Math.max(egfr, 60) - 90) / -15;
            // Total CVD 10-year coefficients (Table S6, Khan 2024)
            let xb = 0, const0 = 0;
            if (female) {
                xb = 0.7939329 * ageC + 0.0305239 * nonHDLc - 0.1606857 * hdlC - 0.2394003 * sbpLow + 0.3600781 * sbpHigh + (dm ? 0.8667604 : 0) + (smoker ? 0.5360739 : 0) + 0.6045917 * egfrLow + 0.0433769 * egfrHigh + (treated ? 0.3151672 : 0) + (statin ? -0.1477655 : 0) - 0.0663612 * (treated ? sbpHigh : 0) + 0.1197879 * (statin ? nonHDLc : 0) - 0.0819715 * ageC * nonHDLc + 0.0306769 * ageC * hdlC - 0.0946348 * ageC * sbpHigh - 0.27057 * ageC * (dm ? 1 : 0) - 0.078715 * ageC * (smoker ? 1 : 0) - 0.1637806 * ageC * egfrLow;
                const0 = -3.307728;
            } else {
                xb = 0.7688528 * ageC + 0.0736174 * nonHDLc - 0.0954431 * hdlC - 0.4347345 * sbpLow + 0.3362658 * sbpHigh + (dm ? 0.7692857 : 0) + (smoker ? 0.4386871 : 0) + 0.5378979 * egfrLow + 0.0164827 * egfrHigh + (treated ? 0.288879 : 0) + (statin ? -0.1337349 : 0) - 0.0475924 * (treated ? sbpHigh : 0) + 0.150273 * (statin ? nonHDLc : 0) - 0.0517874 * ageC * nonHDLc + 0.0191169 * ageC * hdlC - 0.1049477 * ageC * sbpHigh - 0.2251948 * ageC * (dm ? 1 : 0) - 0.0895067 * ageC * (smoker ? 1 : 0) - 0.1543702 * ageC * egfrLow;
                const0 = -3.031168;
            }
            const risk10 = 1 / (1 + Math.exp(-(xb + const0))) * 100;
            const r = Math.max(0, Math.min(99, risk10));
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (r < 5) {
                interpretation = 'Низкий 10-летний риск CVD (PREVENT)';
                color = '#22C55E';
                details = 'PREVENT 10-летний риск общего CVD (ASCVD + СН) < 5 %.';
                actions = [
                    'Образ жизни',
                    'Повтор оценки каждые 4-6 лет'
                ];
            } else if (r < 7.5) {
                interpretation = 'Пограничный риск';
                color = '#FBBF24';
                details = 'Риск 5-7,5 %. Рассмотреть CAC score для уточнения.';
                actions = [
                    'Обсудить статин',
                    'Enhancing factors + CAC'
                ];
            } else if (r < 20) {
                interpretation = 'Промежуточный риск';
                color = '#F59E0B';
                details = 'Риск 7,5-20 %. Показана статинотерапия умеренной/высокой интенсивности.';
                actions = [
                    'Статин умеренной интенсивности',
                    'Контроль АД < 130/80',
                    'Коррекция BMI и метаболических факторов'
                ];
            } else {
                interpretation = 'Высокий риск';
                color = '#EF4444';
                details = 'Риск ≥ 20 %. Агрессивная профилактика.';
                actions = [
                    'Статин высокой интенсивности',
                    'Цель LDL-C < 1,8 ммоль/л',
                    'При СД - SGLT2i/GLP-1 (учёт CKM-синдрома)'
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
                    'PREVENT включает СН в исход - риск не сопоставим напрямую с ASCVD-PCE',
                    'Разработан на современной мультиэтнической когорте США (2011-2020); лучше калиброван, чем PCE',
                    'Требует eGFR (CKD-EPI 2021) и BMI; опциональные HbA1c и ACR расширяют точность',
                    'Только возраст 30-79'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 5,
                            label: 'Низкий',
                            color: '#22C55E'
                        },
                        {
                            min: 5,
                            max: 7.5,
                            label: 'Пограничн.',
                            color: '#FBBF24'
                        },
                        {
                            min: 7.5,
                            max: 20,
                            label: 'Промежут.',
                            color: '#F59E0B'
                        },
                        {
                            min: 20,
                            max: 50,
                            label: 'Высокий',
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
                        id: 'ckd-epi',
                        title: 'CKD-EPI'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '301.5',
                        title: 'Нефрология'
                    }
                ]
            };
        },
    reference: "Khan SS et al. Development and Validation of the AHA PREVENT Equations. Circulation 2024;149:430-449.",
    countries: "США (AHA 2023)",
    presets: [
      {
        label: "♂ 55, метаб. синдр.",
        values: {
          age: 55,
          female: false,
          sbp: 135,
          treated: false,
          tc: 5.5,
          hdl: 1.1,
          dm: false,
          smoker: false,
          egfr: 80,
          bmi: 30,
          statin: false
        }
      },
      {
        label: "♀ 65, СД + ХБП",
        values: {
          age: 65,
          female: true,
          sbp: 140,
          treated: true,
          tc: 5.2,
          hdl: 1.3,
          dm: true,
          smoker: false,
          egfr: 50,
          bmi: 28,
          statin: true
        }
      }
    ],
    info: "### Для чего используется\n**AHA PREVENT (Predicting Risk of cardiovascular disease EVENTs, 2023)** - новое уравнение AHA для расчёта 10- и 30-летнего риска общего CVD (ASCVD **+ сердечная недостаточность**), заменяющее PCE 2013. Основано на когорте > 6 млн человек (2011-2020).\n\n### Особенности\n- Включает **eGFR** и **BMI** (основные факторы; опционально HbA1c, ACR, SDI)\n- **Безрасовое** (нет переменной \"раса\")\n- Использует **non-HDL холестерин** (TC − HDL)\n- Различает 10- и 30-летний горизонт\n- Интегрирует CKM-синдром (кардио-рено-метаболический)\n\n### Формула\nУравнение Weibull/логистического типа с ageC = (age − 55)/10, центрированными non-HDL, HDL, SBP, eGFR. Коэффициенты отличаются для ♂/♀ и включают age-взаимодействия.\n\n### Интерпретация (10-летний, total CVD)\n| Категория | Риск |\n|---|---|\n| Низкий | < 5 % |\n| Пограничный | 5-7,5 % |\n| Промежуточный | 7,5-20 % |\n| Высокий | ≥ 20 % |\n\n### Ограничения\n- Не эквивалентен ASCVD-PCE (включает СН → цифры выше)\n- Возраст 30-79\n- Не применять при установленной ASCVD\n- 30-летний риск - использовать для мотивации молодых пациентов\n\n### Тактика\nТе же пороги для статина (≥ 7,5 %), но интерпретация должна учитывать добавление СН в исход."
  };

export default runner;
