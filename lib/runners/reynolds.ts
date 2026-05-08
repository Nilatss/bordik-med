/**
 * Runner: reynolds
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
        min: 45,
        max: 80,
        step: 1,
        quickValues: [
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
        max: 220,
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
        id: "tc",
        hint: 'Общий холестерин. Норма: <5.0 ммоль/л',
        label: "Общий холестерин",
        type: "number",
        unit: "ммоль/л",
        min: 2,
        max: 15,
        step: 0.1,
        quickValues: [
          4.5,
          5.2,
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
          1.1,
          1.3,
          1.5
        ]
      },
      {
        id: "smoker",
        label: "Курит",
        type: "checkbox"
      },
      {
        id: "hscrp",
        hint: 'СРБ. Норма: <5 мг/л',
        label: "hs-CRP",
        type: "number",
        unit: "мг/л",
        min: 0.1,
        max: 20,
        step: 0.1,
        quickValues: [
          0.5,
          1,
          2,
          3,
          5
        ]
      },
      {
        id: "fh",
        label: "Семейный анамнез ИМ у родителя < 60 лет",
        type: "checkbox"
      },
      {
        id: "hba1c_dm",
        label: "HbA1c (если СД; иначе оставьте 0)",
        type: "number",
        unit: "%",
        min: 0,
        max: 15,
        step: 0.1,
        quickValues: [
          0,
          6.5,
          7,
          8,
          9
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const female = v.female === true;
            const sbp = Number(v.sbp);
            const tc = Number(v.tc) * 38.67;
            const hdl = Number(v.hdl) * 38.67;
            const smoker = v.smoker === true;
            const hscrp = Math.max(0.1, Number(v.hscrp));
            const fh = v.fh === true;
            const hba1c = Number(v.hba1c_dm);
            const hasDM = hba1c >= 6.5;
            // Reynolds women (Ridker 2007 JAMA 297:611) + HbA1c for DM
            // Reynolds men (Ridker 2008 Circulation 118:2243)
            let xb = 0, const0 = 0, ref = 0;
            if (female) {
                xb = 0.0799 * age + 3.137 * Math.log(sbp) + 0.180 * Math.log(hscrp) + 1.382 * Math.log(tc) - 1.172 * Math.log(hdl) + (smoker ? 0.818 : 0) + (fh ? 0.438 : 0) + (hasDM ? 0.134 * hba1c : 0);
                const0 = hasDM ? 25.64 : 22.325;
                ref = 1.0;
            } else {
                xb = 4.385 * Math.log(age) + 2.607 * Math.log(sbp) + 0.963 * Math.log(tc) - 0.772 * Math.log(hdl) + 0.102 * Math.log(hscrp) + (smoker ? 0.405 : 0) + (fh ? 0.541 : 0);
                const0 = 33.097;
                ref = 1.0;
            }
            void ref;
            const B = Math.exp(xb - const0);
            const s0 = female ? 0.98756 : 0.8990;
            const risk = (1 - Math.pow(s0, B)) * 100;
            const r = Math.max(0, Math.min(99, risk));
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (r < 5) {
                interpretation = 'Низкий 10-летний риск (Reynolds)';
                color = '#22C55E';
                details = 'Риск < 5 %. Акцент на модификации образа жизни.';
                actions = [
                    'Диета, физ. активность',
                    'Повтор через 5 лет'
                ];
            } else if (r < 10) {
                interpretation = 'Нижне-промежуточный риск';
                color = '#FBBF24';
                details = 'Риск 5-10 %. При повышенном hs-CRP - рассмотреть JUPITER-подобную стратегию (розувастатин).';
                actions = [
                    'Оценить hs-CRP в динамике (повтор через 2-4 нед)',
                    'Модификация ФР, обсудить статин'
                ];
            } else if (r < 20) {
                interpretation = 'Промежуточный риск';
                color = '#F59E0B';
                details = 'Риск 10-20 %. Статин + модификация ФР.';
                actions = [
                    'Статин умеренной интенсивности',
                    'Контроль АД < 130/80',
                    'АСК индивидуально'
                ];
            } else {
                interpretation = 'Высокий риск';
                color = '#EF4444';
                details = 'Риск ≥ 20 %. Агрессивная профилактика.';
                actions = [
                    'Статин высокой интенсивности',
                    'Цель LDL-C < 1,8 ммоль/л',
                    'Контроль всех ФР'
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
                    'Включает hs-CRP - не выполнять при острой инфекции / аутоиммунном обострении (hs-CRP ≥ 10 → исключить)',
                    'Reynolds ♀ валидирован на Women\'s Health Study (n ≈ 24 558); ♂ - на Physicians\' Health Study II',
                    'Возраст 45+; не для пациентов с уже диагностированной ASCVD или СД с ПОМ',
                    'Reynolds проигрывает PCE по общему AUC, но добавляет ценности у женщин с повышенным hs-CRP'
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
                            max: 10,
                            label: 'Ниж.-промежут.',
                            color: '#FBBF24'
                        },
                        {
                            min: 10,
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
                        title: 'Framingham'
                    },
                    {
                        id: 'ascvd',
                        title: 'ACC/AHA ASCVD'
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
                    }
                ]
            };
        },
    reference: "Ridker PM et al. Development and validation of improved algorithms for the assessment of global cardiovascular risk in women: the Reynolds Risk Score. JAMA 2007;297:611. Ridker PM et al. C-reactive protein and parental history improve global cardiovascular risk prediction in men. Circulation 2008;118:2243.",
    countries: "США",
    presets: [
      {
        label: "♀ 55 + hsCRP 3",
        values: {
          age: 55,
          female: true,
          sbp: 135,
          tc: 5.7,
          hdl: 1.4,
          smoker: false,
          hscrp: 3,
          fh: false,
          hba1c_dm: 0
        }
      },
      {
        label: "♂ 60 + курит",
        values: {
          age: 60,
          female: false,
          sbp: 140,
          tc: 6,
          hdl: 1.1,
          smoker: true,
          hscrp: 2.5,
          fh: true,
          hba1c_dm: 0
        }
      },
      {
        label: "♀ 62 + СД",
        values: {
          age: 62,
          female: true,
          sbp: 140,
          tc: 5.5,
          hdl: 1.2,
          smoker: false,
          hscrp: 4,
          fh: false,
          hba1c_dm: 7.5
        }
      }
    ],
    info: "### Для чего используется\n**Reynolds Risk Score** - 10-летний риск CVD (ИМ, инсульт, коронарная реваскуляризация, CVD-смерть), добавляющий к классическим ФР **hs-CRP** и **семейный анамнез преждевременной ИБС**.\n\nПервоначально разработан для женщин (Ridker 2007, JAMA), затем адаптирован для мужчин (2008, Circulation).\n\n### Формула\nCox-регрессия:\n- Женщины (без СД): 7 переменных - возраст, SBP, hs-CRP, TC, HDL, курение, семейный анамнез\n- Женщины (СД): + HbA1c\n- Мужчины: возраст (log), SBP, TC, HDL, hs-CRP, курение, семейный анамнез\n\n### Интерпретация (общая)\n| Риск | Категория |\n|---|---|\n| < 5 % | Низкий |\n| 5-< 10 % | Нижне-промежуточный |\n| 10-< 20 % | Промежуточный |\n| ≥ 20 % | Высокий |\n\n### Ценность hs-CRP\n- У женщин с промежуточным Framingham-риском добавление hs-CRP реклассифицирует до 40-50 % случаев\n- При hs-CRP < 1 мг/л - низкий воспалительный риск\n- 1-3 мг/л - промежуточный\n- > 3 мг/л - высокий\n- > 10 мг/л - не использовать (острое воспаление)\n\n### JUPITER trial\nRidker 2008 (NEJM) показал - при LDL < 3,4 и hs-CRP ≥ 2 мг/л розувастатин 20 мг снижал CVD-события на 44 %. Это обосновало включение hs-CRP в стратификацию.\n\n### Ограничения\n- Требует hs-CRP (недоступен в ряде лабораторий)\n- Валидация на когорте медработников США (WHS, PHS II)\n- Не показал превосходства над PCE по C-statistic в общих валидациях\n- Не использовать при остром воспалении / инфекции\n\n### Тактика\nТе же принципы, что и для ASCVD: ≥ 7,5-10 % - обсудить статин, ≥ 20 % - статин высокой интенсивности."
  };

export default runner;
