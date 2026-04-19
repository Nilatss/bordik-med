// @ts-nocheck
/**
 * Runner: ascvd
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
        id: "age",
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 40,
        max: 79,
        step: 1,
        quickValues: [
          45,
          50,
          55,
          60,
          65,
          70,
          75
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      },
      {
        id: "aa",
        label: "Афроамериканец / негроидная раса",
        type: "checkbox"
      },
      {
        id: "tc",
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
        id: "sbp",
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
          150,
          160
        ]
      },
      {
        id: "treated",
        label: "Антигипертензивная терапия",
        type: "checkbox"
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
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const female = v.female === true;
            const aa = v.aa === true;
            const tc = Number(v.tc) * 38.67;
            const hdl = Number(v.hdl) * 38.67;
            const sbp = Number(v.sbp);
            const treated = v.treated === true;
            const dm = v.dm === true;
            const smoker = v.smoker === true;
            // Goff DC et al. ACC/AHA 2013 Pooled Cohort Equations (Circulation 2014;129 S49)
            const lnAge = Math.log(age);
            const lnTC = Math.log(tc);
            const lnHDL = Math.log(hdl);
            const lnSBP = Math.log(sbp);
            let sum = 0, meanSum = 0, s0 = 0;
            if (female && !aa) {
                sum = -29.799 * lnAge + 4.884 * lnAge * lnAge + 13.540 * lnTC - 3.114 * lnAge * lnTC - 13.578 * lnHDL + 3.149 * lnAge * lnHDL + (treated ? 2.019 : 1.957) * lnSBP + (smoker ? 7.574 - 1.665 * lnAge : 0) + (dm ? 0.661 : 0);
                meanSum = -29.18;
                s0 = 0.9665;
            } else if (!female && !aa) {
                sum = 12.344 * lnAge + 11.853 * lnTC - 2.664 * lnAge * lnTC - 7.990 * lnHDL + 1.769 * lnAge * lnHDL + (treated ? 1.797 : 1.764) * lnSBP + (smoker ? 7.837 - 1.795 * lnAge : 0) + (dm ? 0.658 : 0);
                meanSum = 61.18;
                s0 = 0.9144;
            } else if (female && aa) {
                sum = 17.114 * lnAge + 0.940 * lnTC - 18.920 * lnHDL + 4.475 * lnAge * lnHDL + (treated ? 29.291 - 6.432 * lnAge : 27.820 - 6.087 * lnAge) * lnSBP + (smoker ? 0.691 : 0) + (dm ? 0.874 : 0);
                meanSum = 86.61;
                s0 = 0.9533;
            } else {
                sum = 2.469 * lnAge + 0.302 * lnTC - 0.307 * lnHDL + (treated ? 1.916 : 1.809) * lnSBP + (smoker ? 0.549 : 0) + (dm ? 0.645 : 0);
                meanSum = 19.54;
                s0 = 0.8954;
            }
            const risk = (1 - Math.pow(s0, Math.exp(sum - meanSum))) * 100;
            const r = Math.max(0, Math.min(99, risk));
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (r < 5) {
                interpretation = 'Низкий риск ASCVD';
                color = '#22C55E';
                details = '10-летний риск ASCVD < 5 %. Акцент на здоровом образе жизни.';
                actions = [
                    'Здоровое питание, физическая активность',
                    'Отказ от курения',
                    'Повторная оценка риска каждые 4–6 лет'
                ];
            } else if (r < 7.5) {
                interpretation = 'Пограничный риск ASCVD';
                color = '#FBBF24';
                details = 'Риск 5–7,5 % — пограничная категория. Рассмотреть enhancing factors и CAC score для уточнения решения о статине.';
                actions = [
                    'Оценить усиливающие факторы: семейный анамнез, LDL-C ≥ 4,1, hs-CRP ≥ 2 мг/л, преэклампсия, ХБП, метаболический синдром',
                    'При неопределённости — CAC score (если CAC > 100 Agatston или > 75-го перцентиля → начать статин)',
                    'Обсудить статин умеренной интенсивности'
                ];
            } else if (r < 20) {
                interpretation = 'Промежуточный риск ASCVD';
                color = '#F59E0B';
                details = 'Риск 7,5–20 % — показание к статину умеренной или высокой интенсивности (ACC/AHA 2018/2019).';
                actions = [
                    'Статин умеренной интенсивности — снижение LDL на 30–49 %',
                    'При усиливающих факторах — статин высокой интенсивности',
                    'Цель LDL-C снижение ≥ 30 % (≥ 50 % при высокой интенсивности)',
                    'АД < 130/80, аспирин — индивидуально'
                ];
            } else {
                interpretation = 'Высокий риск ASCVD';
                color = '#EF4444';
                details = 'Риск ≥ 20 % — высокий. Статин высокой интенсивности показан безусловно.';
                actions = [
                    'Статин высокой интенсивности (аторвастатин 40–80 мг / розувастатин 20–40 мг)',
                    'Цель снижения LDL-C ≥ 50 %, достижение < 1,8 ммоль/л',
                    'При недостижении цели — эзетимиб, далее PCSK9-ингибитор',
                    'Агрессивный контроль АД, гликемии, массы тела'
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
                    'Валидирован только для возраста 40–79 лет',
                    'Разработан на когорте белых и афроамериканцев США — может завышать у азиатов/латиноамериканцев',
                    'Не для пациентов с известной ASCVD, LDL ≥ 4,9 ммоль/л или СД (у них статин показан независимо от риска)',
                    'Для других этнических групп ACC/AHA рекомендует использовать уравнение для "других" рас'
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
                        id: 'framingham',
                        title: 'Framingham CVD'
                    },
                    {
                        id: 'prevent',
                        title: 'AHA PREVENT'
                    },
                    {
                        id: 'score2',
                        title: 'SCORE2 (ESC)'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    }
                ]
            };
        },
    reference: "Goff DC Jr et al. 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk. Circulation 2014;129:S49–S73.",
    countries: "США (ACC/AHA)",
    presets: [
      {
        label: "♂ 55 белый, курит",
        values: {
          age: 55,
          female: false,
          aa: false,
          tc: 5.7,
          hdl: 1,
          sbp: 140,
          treated: false,
          dm: false,
          smoker: true
        }
      },
      {
        label: "♀ 60 белая, АГ",
        values: {
          age: 60,
          female: true,
          aa: false,
          tc: 5.5,
          hdl: 1.3,
          sbp: 145,
          treated: true,
          dm: false,
          smoker: false
        }
      },
      {
        label: "♂ 65 афро, СД",
        values: {
          age: 65,
          female: false,
          aa: true,
          tc: 5.2,
          hdl: 1.1,
          sbp: 135,
          treated: true,
          dm: true,
          smoker: false
        }
      }
    ],
    info: "### Для чего используется\n**ACC/AHA Pooled Cohort Equations (PCE, 2013)** — расчёт 10-летнего риска **ASCVD** (нефатальный ИМ, смерть от ИБС, нефатальный/фатальный инсульт) у лиц 40–79 лет без установленной ASCVD.\n\n### Формула\nЧетыре отдельных уравнения Cox-регрессии (♂/♀ × белый/афроамериканец) с логарифмированными предикторами и взаимодействиями. Параметры получены из объединённых когорт ARIC, CHS, CARDIA, Framingham Offspring.\n\n### Категории риска и статин (ACC/AHA 2018)\n| Риск | Тактика |\n|---|---|\n| < 5 % | Образ жизни |\n| 5–7,5 % | Пограничный — учесть enhancing factors / CAC |\n| 7,5–20 % | Умеренно-высокой интенсивности статин |\n| ≥ 20 % | Статин высокой интенсивности |\n\nПорог **≥ 7,5 %** — основание для начала статина.\n\n### Усиливающие факторы (enhancing factors)\n- Семейный анамнез преждевременной ASCVD (♂ < 55, ♀ < 65)\n- Стойкое LDL-C ≥ 4,1 ммоль/л\n- Хроническая болезнь почек (eGFR 15–59)\n- Метаболический синдром\n- Преэклампсия, преждевременная менопауза\n- Хронические воспалительные заболевания (RA, псориаз, ВИЧ)\n- Этническая принадлежность (ЮА, выходцы из Индостана)\n- hs-CRP ≥ 2 мг/л, Lp(a) ≥ 50 мг/дл, ApoB ≥ 130 мг/дл\n- Лодыжечно-плечевой индекс < 0,9\n\n### CAC score (Agatston)\n- CAC = 0 → отложить статин (кроме курильщиков, СД, семейного анамнеза)\n- CAC 1–99 → рассмотреть статин, особенно ≥ 55 лет\n- CAC ≥ 100 или ≥ 75-го перцентиля → начать статин\n\n### Ограничения\n- Только возраст 40–79\n- Расовые категории бинарные (белый / афроамериканец / другие)\n- В ряде валидаций (MESA, REGARDS) переоценивает риск\n- Не применять у пациентов с уже установленной ASCVD или LDL ≥ 4,9 ммоль/л\n\n### Источник\nGoff DC Jr, Lloyd-Jones DM, Bennett G et al. 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk. *Circulation* 2014;129(25 Suppl 2):S49–S73.\nGrundy SM et al. 2018 AHA/ACC/Multisociety Guideline on the Management of Blood Cholesterol. *Circulation* 2019;139:e1082."
  };

export default runner;
