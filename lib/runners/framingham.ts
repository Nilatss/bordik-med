// @ts-nocheck
/**
 * Runner: framingham
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
        max: 74,
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
          7,
          8
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
          1.5,
          1.8
        ]
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
          150,
          160,
          170
        ]
      },
      {
        id: "treated",
        label: "Антигипертензивная терапия",
        type: "checkbox"
      },
      {
        id: "smoker",
        label: "Курит",
        type: "checkbox"
      },
      {
        id: "dm",
        label: "Сахарный диабет",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const female = v.female === true;
            const tc_mgdl = Number(v.tc) * 38.67;
            const hdl_mgdl = Number(v.hdl) * 38.67;
            const sbp = Number(v.sbp);
            const treated = v.treated === true;
            const smoker = v.smoker === true;
            const dm = v.dm === true;
            // D'Agostino 2008, general CVD 10y (Circulation 2008;117:743)
            // Beta coefficients, mean values and baseline survival per sex
            let beta;
            if (female) {
                beta = {
                    logAge: 2.32888,
                    logTC: 1.20904,
                    logHDL: -0.70833,
                    logSBPu: 2.76157,
                    logSBPt: 2.82263,
                    smoker: 0.52873,
                    dm: 0.69154,
                    s0: 0.95012,
                    meanSum: 26.1931
                };
            } else {
                beta = {
                    logAge: 3.06117,
                    logTC: 1.12370,
                    logHDL: -0.93263,
                    logSBPu: 1.93303,
                    logSBPt: 1.99881,
                    smoker: 0.65451,
                    dm: 0.57367,
                    s0: 0.88936,
                    meanSum: 23.9802
                };
            }
            const logAge = Math.log(age);
            const logTC = Math.log(tc_mgdl);
            const logHDL = Math.log(hdl_mgdl);
            const logSBP = Math.log(sbp);
            const sum = beta.logAge * logAge + beta.logTC * logTC + beta.logHDL * logHDL + (treated ? beta.logSBPt : beta.logSBPu) * logSBP + (smoker ? beta.smoker : 0) + (dm ? beta.dm : 0);
            const risk = (1 - Math.pow(beta.s0, Math.exp(sum - beta.meanSum))) * 100;
            const r = Math.max(0, Math.min(99, risk));
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (r < 10) {
                interpretation = 'Низкий 10-летний риск CVD';
                color = '#22C55E';
                details = '10-летний риск общих сердечно-сосудистых событий (ИБС, инсульт, ПАБ, СН) < 10 %. Акцент на модификации образа жизни.';
                actions = [
                    'Средиземноморская диета, физическая активность ≥ 150 мин/нед',
                    'Контроль АД < 140/90 (< 130/80 при СД, ХБП)',
                    'Отказ от курения',
                    'Повторная оценка риска каждые 4-6 лет'
                ];
            } else if (r < 20) {
                interpretation = 'Промежуточный 10-летний риск';
                color = '#F59E0B';
                details = '10-летний риск 10-20 % - промежуточная категория. Рассмотреть уточнение риска (коронарный кальций, визуализация сонных артерий, hs-CRP).';
                actions = [
                    'Статин умеренной интенсивности - обсудить с пациентом',
                    'АД < 130/80, LDL-C < 2,6 ммоль/л',
                    'Возможна консультация по КТ-кальций (CAC score) для уточнения',
                    'Аспирин низких доз - только после оценки риска кровотечения'
                ];
            } else {
                interpretation = 'Высокий 10-летний риск';
                color = '#EF4444';
                details = '10-летний риск ≥ 20 % - высокий. Показана агрессивная модификация факторов риска и медикаментозная профилактика.';
                actions = [
                    'Статин высокой интенсивности (аторвастатин 40-80 мг / розувастатин 20-40 мг)',
                    'Цель LDL-C < 1,8 ммоль/л (ESC 2021: < 1,4 при очень высоком риске)',
                    'Целевое АД < 130/80',
                    'Коррекция СД (HbA1c < 7 %), отказ от курения'
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
                    'Разработан на когорте Framingham (преим. белые американцы) - может завышать риск в популяциях низкого риска Европы',
                    'Диапазон валидации - 30-74 года',
                    'Не учитывает семейный анамнез, этническую принадлежность, hs-CRP',
                    'Для пациентов с установленной ИБС, ХБП G3-G5 или СД с ПОМ расчёт не нужен - риск автоматически высокий'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 10,
                            label: 'Низкий',
                            color: '#22C55E'
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
                        id: 'ascvd',
                        title: 'ACC/AHA ASCVD'
                    },
                    {
                        id: 'score2',
                        title: 'SCORE2 (ESC)'
                    },
                    {
                        id: 'reynolds',
                        title: 'Reynolds'
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
    reference: "D'Agostino RB Sr et al. General cardiovascular risk profile for use in primary care. Circulation 2008;117:743-53.",
    countries: "США · Международный",
    presets: [
      {
        label: "♂ 55, здоров",
        values: {
          age: 55,
          female: false,
          tc: 5.2,
          hdl: 1.3,
          sbp: 125,
          treated: false,
          smoker: false,
          dm: false
        }
      },
      {
        label: "♂ 60, курит, АГ",
        values: {
          age: 60,
          female: false,
          tc: 6.2,
          hdl: 1,
          sbp: 150,
          treated: true,
          smoker: true,
          dm: false
        }
      },
      {
        label: "♀ 65, СД",
        values: {
          age: 65,
          female: true,
          tc: 6,
          hdl: 1.2,
          sbp: 140,
          treated: true,
          smoker: false,
          dm: true
        }
      }
    ],
    info: "### Для чего используется\n**Framingham General CVD Risk Score (D'Agostino 2008)** оценивает 10-летний риск **любого сердечно-сосудистого события** (коронарная смерть, ИМ, стенокардия, ишемический/геморрагический инсульт, ТИА, ПАБ, сердечная недостаточность).\n\n### Формула\nУравнение Cox-регрессии с логарифмами предикторов:\n`Risk = 1 − S₀^exp(Σβᵢxᵢ − Σβᵢx̄ᵢ)`\n\nГде S₀ - базовая 10-летняя выживаемость (0,88936 ♂ / 0,95012 ♀), βᵢ - коэффициенты для log(возраст), log(TC), log(HDL), log(SBP) с разными β для леченой/нелеченой АГ, курения и СД.\n\n### Интерпретация (общий CVD)\n| Категория | 10-летний риск |\n|---|---|\n| Низкий | < 10 % |\n| Промежуточный | 10-20 % |\n| Высокий | ≥ 20 % |\n\n### Ограничения\n- Когорта Framingham - преим. белые американцы среднего достатка\n- Для европейцев северных/южных популяций используйте SCORE2\n- Переоценивает риск у азиатов, латиноамериканцев, ряда африканских популяций\n- Не для пациентов с известной ИБС, ХБП G3+, СД с ПОМ (у них риск уже высокий)\n\n### Тактика\n- < 10 % - образ жизни, повтор через 4-6 лет\n- 10-20 % - обсудить статин умеренной интенсивности, CAC score\n- ≥ 20 % - статин высокой интенсивности, цель LDL < 1,8 ммоль/л, контроль АД < 130/80"
  };

export default runner;
