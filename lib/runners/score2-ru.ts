// @ts-nocheck
/**
 * Runner: score2-ru
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
          75
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
        id: "tc",
        label: "Общий холестерин",
        type: "number",
        unit: "ммоль/л",
        min: 3,
        max: 12,
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
        min: 0.5,
        max: 3,
        step: 0.05,
        quickValues: [
          0.9,
          1,
          1.2,
          1.5
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const female = v.female === true;
            const smoker = v.smoker === true;
            const sbp = Number(v.sbp);
            const tc = Number(v.tc);
            const hdl = Number(v.hdl);
            // SCORE2 (ESC 2021) - high-risk region recalibration (Russia uses high/very-high).
            // Cage = (age − 60) / 5, Cchol = (tc − 6) / 1, Chdl = (hdl − 1.3) / 0.5,
            // Csbp = (sbp − 120) / 20. Sex-specific coefficients.
            const cAge = (age - 60) / 5;
            const cTc = tc - 6;
            const cHdl = (hdl - 1.3) / 0.5;
            const cSbp = (sbp - 120) / 20;
            const cSmk = smoker ? 1 : 0;
            // Coefficients (SCORE2 risk-region models, Eur Heart J 2021;42:2439)
            let x;
            if (female) {
                x = 0.7152 * cAge + 0.2328 * cSmk + 0.3171 * cSbp + 0.1826 * cTc - 0.1785 * cHdl + -0.0515 * cSmk * cAge + -0.0067 * cSbp * cAge + -0.0078 * cTc * cAge + 0.0041 * cHdl * cAge;
            } else {
                x = 0.3742 * cAge + 0.6012 * cSmk + 0.2777 * cSbp + 0.1458 * cTc - 0.2698 * cHdl + -0.0755 * cSmk * cAge + -0.0255 * cSbp * cAge + -0.0281 * cTc * cAge + 0.0426 * cHdl * cAge;
            }
            // Baseline survival for high-risk region (SCORE2 supplement)
            const s0 = female ? 0.9776 : 0.9605;
            const raw = 1 - Math.pow(s0, Math.exp(x));
            // Recalibration - high-risk region scale factors (ESC 2021 supplement)
            const scale1 = female ? 0.81 : 0.79;
            const scale2 = female ? 0.79 : 0.80;
            const recal = 1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - raw))));
            const risk = Math.max(0, Math.min(99, recal * 100));
            // ESC 2021 thresholds by age:
            // <50: low <2.5, mod 2.5-<7.5, high ≥7.5
            // 50-69: low <5, mod 5-<10, high ≥10
            // ≥70: low <7.5, mod 7.5-<15, high ≥15
            let lowT = 5, highT = 10;
            if (age < 50) {
                lowT = 2.5;
                highT = 7.5;
            } else if (age >= 70) {
                lowT = 7.5;
                highT = 15;
            }
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (risk < lowT) {
                interpretation = 'Низкий / умеренный риск';
                color = '#22C55E';
                details = 'Общая профилактика: отказ от курения, средиземноморская диета, ≥ 150 мин/нед аэробной активности, нормализация массы тела. Медикаментозная коррекция ЛПНП обычно не требуется.';
                actions = [
                    'Коррекция образа жизни',
                    'Контроль АД < 140/90',
                    'Повтор SCORE2 через 5 лет'
                ];
            } else if (risk < highT) {
                interpretation = 'Высокий риск';
                color = '#F59E0B';
                details = 'Рассмотреть статинотерапию для достижения ЛПНП < 1,8 ммоль/л и снижения на ≥ 50 %. Целевое АД < 130/80 при переносимости.';
                actions = [
                    'Статин умеренной/высокой интенсивности',
                    'Цель ЛПНП < 1,8 ммоль/л',
                    'АД < 130/80 мм рт.ст.',
                    'HbA1c < 7 % при СД'
                ];
            } else {
                interpretation = 'Очень высокий риск';
                color = '#EF4444';
                details = 'Агрессивная профилактика: цель ЛПНП < 1,4 ммоль/л, снижение ≥ 50 %. При недостижении - эзетимиб, затем PCSK9-ингибиторы. Антиагрегант при установленном ССЗ.';
                actions = [
                    'Статин высокой интенсивности (аторвастатин 40-80 / розувастатин 20-40)',
                    'Цель ЛПНП < 1,4 ммоль/л',
                    'Эзетимиб → PCSK9i при недостижении цели',
                    'АД < 130/80, контроль диабета'
                ];
            }
            return {
                value: risk.toFixed(1),
                unit: '%',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Валидирован для возраста 40-69 (SCORE2) и 70-89 (SCORE2-OP); <40 - требует lifetime-risk подхода',
                    'Не применять при установленном ССЗ, СД 2 типа с поражением органов, СКФ < 30, СГХ',
                    'РФ относится к регионам высокого/очень высокого риска - использована high-risk recalibration',
                    'Не учитывает семейный анамнез, Lp(a), CRP, кальциевый индекс - возможна дополнительная стратификация'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: lowT,
                            label: 'Низкий',
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
                            label: 'Очень высокий',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(risk.toFixed(1)),
                    unit: '%'
                },
                related: [
                    {
                        id: 'score2',
                        title: 'SCORE2 (ЕС)'
                    },
                    {
                        id: 'framingham',
                        title: 'Framingham'
                    },
                    {
                        id: 'ascvd',
                        title: 'ACC/AHA ASCVD'
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
    reference: "SCORE2 working group & ESC Cardiovascular Risk Collaboration. Eur Heart J 2021;42:2439-2454. Высокорисковая калибровка применена для РФ (WHO Globorisk / ESC 2021).",
    countries: "РФ · СНГ (high-risk region)",
    presets: [
      {
        label: "Ж 55 л, некур.",
        values: {
          age: 55,
          female: true,
          smoker: false,
          sbp: 130,
          tc: 5.5,
          hdl: 1.4
        }
      },
      {
        label: "М 60 л, курит",
        values: {
          age: 60,
          female: false,
          smoker: true,
          sbp: 150,
          tc: 6.5,
          hdl: 1
        }
      },
      {
        label: "М 70 л, АГ",
        values: {
          age: 70,
          female: false,
          smoker: false,
          sbp: 160,
          tc: 6,
          hdl: 1.1
        }
      }
    ],
    info: "### Для чего используется\n**SCORE2-RU** - оценка **10-летнего риска фатальных и нефатальных сердечно-сосудистых событий** (ИМ, инсульт, ССС-смерть) у лиц 40-69 лет без установленного ССЗ, откалиброванная для регионов **высокого риска** по классификации ESC 2021 и WHO Globorisk. К регионам высокого риска относятся РФ, Беларусь, Украина, Казахстан, Грузия, Армения, Молдова.\n\n### Формула\nSCORE2 = Cox-регрессия с возраст-зависимыми β-коэффициентами:\n`x = Σ βᵢ · (xᵢ − meanᵢ)`; 10-летний риск = `1 − S₀^exp(x)`, затем рекалибровка для региона высокого риска.\n\n### Ключевые предикторы\n- Возраст (40-89)\n- Пол\n- Курение (текущее)\n- САД\n- Общий холестерин\n- ЛПВП\n\n### Интерпретация (ESC 2021, с поправкой на возраст)\n| Возраст | Низкий | Высокий | Очень высокий |\n|---|---|---|---|\n| < 50 | < 2,5 % | 2,5-< 7,5 % | ≥ 7,5 % |\n| 50-69 | < 5 % | 5-< 10 % | ≥ 10 % |\n| ≥ 70 | < 7,5 % | 7,5-< 15 % | ≥ 15 % |\n\n### Целевые показатели по группе риска\n| Группа | ЛПНП | АД |\n|---|---|---|\n| Низкий / умеренный | < 3,0 ммоль/л | < 140/90 |\n| Высокий | < 1,8 ммоль/л и ↓ ≥ 50 % | < 130/80 |\n| Очень высокий | < 1,4 ммоль/л и ↓ ≥ 50 % | < 130/80 |\n\n### Ограничения\n- Не применим у пациентов с установленным ССЗ, СД с поражением органов-мишеней, СКФ < 30, семейной гиперхолестеринемией (автоматически очень высокий риск)\n- Не учитывает семейный анамнез, этничность, ожирение, Lp(a), CRP, CAC-score\n- Для возраста ≥ 70 - SCORE2-OP (Older Persons)\n\n### Тактика\n- **Низкий риск** - образ жизни, повтор через 5 лет\n- **Высокий** - статин, цель ЛПНП < 1,8\n- **Очень высокий** - статин высокой интенсивности + эзетимиб/PCSK9i, цель ЛПНП < 1,4"
  };

export default runner;
