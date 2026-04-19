// @ts-nocheck
/**
 * Runner: who-ish
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
          55,
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
        id: "smoker",
        label: "Курит",
        type: "checkbox"
      },
      {
        id: "dm",
        label: "Сахарный диабет",
        type: "checkbox"
      },
      {
        id: "sbp",
        label: "САД",
        type: "number",
        unit: "мм рт.ст.",
        min: 90,
        max: 220,
        step: 1,
        quickValues: [
          120,
          140,
          160,
          180
        ]
      },
      {
        id: "tc",
        label: "Общий холестерин",
        type: "number",
        unit: "ммоль/л",
        min: 3,
        max: 10,
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
        id: "region",
        label: "Субрегион ВОЗ",
        type: "select",
        options: [
          {
            value: "euroA",
            label: "Europe A (EU-15, низкая смертность)"
          },
          {
            value: "euroB",
            label: "Europe B (Польша, Балканы)"
          },
          {
            value: "euroC",
            label: "Europe C (RU, UA, KZ, UZ и др.)"
          },
          {
            value: "amroA",
            label: "Americas A (US, CA)"
          },
          {
            value: "amroB",
            label: "Americas B (Латинская Америка)"
          },
          {
            value: "searB",
            label: "SE Asia B (TH, ID)"
          },
          {
            value: "searD",
            label: "SE Asia D (IN, BD, MM)"
          },
          {
            value: "emroB",
            label: "East Med B (Персидский залив, IR)"
          },
          {
            value: "emroD",
            label: "East Med D (AF, PK, SO)"
          },
          {
            value: "wproA",
            label: "West Pacific A (JP, AU, NZ)"
          },
          {
            value: "wproB",
            label: "West Pacific B (CN, VN, PH)"
          },
          {
            value: "afroD",
            label: "Africa D (западная)"
          },
          {
            value: "afroE",
            label: "Africa E (южная/восточная)"
          }
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const female = v.female === true;
            const smoker = v.smoker === true;
            const dm = v.dm === true;
            const sbp = Number(v.sbp);
            const tc = Number(v.tc);
            const region = String(v.region || 'euroC');
            // WHO/ISH 2019 updated charts use Globorisk/pooled approach. Approximate
            // via region baseline + points (Mendis 2007 — Bull WHO 85:12). Native charts
            // give 5 categories: <10, 10-<20, 20-<30, 30-<40, ≥40 %.
            const regionBase = {
                euroA: 0,
                amroA: 0.1,
                wproA: 0,
                amroB: 0.3,
                emroB: 0.4,
                euroB: 0.5,
                searB: 0.5,
                wproB: 0.6,
                euroC: 0.9,
                emroD: 0.7,
                searD: 0.8,
                afroD: 0.6,
                afroE: 0.8
            };
            let pts = regionBase[region] ?? 0.5;
            if (age >= 70) pts += 3.0;
            else if (age >= 60) pts += 2.2;
            else if (age >= 50) pts += 1.3;
            else pts += 0.5;
            if (!female) pts += 0.4;
            if (smoker) pts += 0.8;
            if (dm) pts += 0.9;
            if (sbp >= 180) pts += 1.6;
            else if (sbp >= 160) pts += 1.1;
            else if (sbp >= 140) pts += 0.7;
            else if (sbp >= 120) pts += 0.2;
            if (tc >= 8) pts += 0.8;
            else if (tc >= 7) pts += 0.6;
            else if (tc >= 6) pts += 0.4;
            else if (tc >= 5) pts += 0.2;
            // Map points → risk category midpoint
            let r = 5;
            if (pts >= 7) r = 45;
            else if (pts >= 6) r = 35;
            else if (pts >= 5) r = 25;
            else if (pts >= 4) r = 15;
            else if (pts >= 3) r = 7;
            else r = 3;
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (r < 10) {
                interpretation = '< 10 % — низкий риск';
                color = '#22C55E';
                details = 'WHO категория < 10 %. Модификация образа жизни.';
                actions = [
                    'Диета, физ. активность, отказ от курения',
                    'Повтор через 5 лет'
                ];
            } else if (r < 20) {
                interpretation = '10–< 20 % — умеренный';
                color = '#FBBF24';
                details = 'WHO категория 10–< 20 %. Модификация ФР + терапия АГ при стойком АД ≥ 140/90.';
                actions = [
                    'Контроль АД < 140/90',
                    'Снижение TC до < 5 ммоль/л',
                    'Отказ от курения'
                ];
            } else if (r < 30) {
                interpretation = '20–< 30 % — высокий';
                color = '#F59E0B';
                details = 'WHO категория 20–< 30 %. Антигипертензивная терапия + статин показаны.';
                actions = [
                    'Антигипертензивная терапия',
                    'Статин',
                    'Аспирин — индивидуально после оценки риска'
                ];
            } else if (r < 40) {
                interpretation = '30–< 40 % — очень высокий';
                color = '#EF4444';
                details = 'WHO категория 30–< 40 %. Полный комплекс профилактики.';
                actions = [
                    'АД < 130/80',
                    'Статин высокой интенсивности',
                    'Аспирин 75–100 мг',
                    'Коррекция СД'
                ];
            } else {
                interpretation = '≥ 40 % — экстремальный';
                color = '#991B1B';
                details = 'WHO категория ≥ 40 %. Агрессивная терапия всех ФР.';
                actions = [
                    'Агрессивное снижение АД и липидов',
                    'Мультидисциплинарное ведение'
                ];
            }
            return {
                value: r.toString(),
                unit: '%',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Упрощённая аппроксимация WHO charts — для точного расчёта используйте официальные таблицы WHO 2019',
                    'Категории WHO — 5 уровней по 10 % (<10, 10-<20, 20-<30, 30-<40, ≥40)',
                    'Используется в странах с ограниченными ресурсами (версия без холестерина тоже существует)',
                    'Субрегион выбирайте по стране пациента (WHO Global Health Observatory)'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 10,
                            label: '< 10',
                            color: '#22C55E'
                        },
                        {
                            min: 10,
                            max: 20,
                            label: '10–20',
                            color: '#FBBF24'
                        },
                        {
                            min: 20,
                            max: 30,
                            label: '20–30',
                            color: '#F59E0B'
                        },
                        {
                            min: 30,
                            max: 40,
                            label: '30–40',
                            color: '#EF4444'
                        },
                        {
                            min: 40,
                            max: 100,
                            label: '≥ 40',
                            color: '#991B1B'
                        }
                    ],
                    current: r,
                    unit: '%'
                },
                related: [
                    {
                        id: 'score2',
                        title: 'SCORE2 (ESC)'
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
    reference: "WHO/ISH. Prevention of Cardiovascular Disease: Pocket Guidelines for Assessment and Management. 2007 (updated 2019, WHO CVD risk charts).",
    countries: "Всемирный (14 субрегионов WHO)",
    presets: [
      {
        label: "♂ 55 RU, курит",
        values: {
          age: 55,
          female: false,
          smoker: true,
          dm: false,
          sbp: 150,
          tc: 5.5,
          region: "euroC"
        }
      },
      {
        label: "♀ 65 IN, СД",
        values: {
          age: 65,
          female: true,
          smoker: false,
          dm: true,
          sbp: 145,
          tc: 5,
          region: "searD"
        }
      }
    ],
    info: "### Для чего используется\n**WHO/ISH Risk Prediction Charts** — упрощённый инструмент оценки 10-летнего риска фатального + нефатального CVD-события для стран с ограниченными ресурсами. Разработан ВОЗ / Международным обществом гипертензии в 2007, **обновлён в 2019** на основе Globorisk.\n\n### Особенности\n- **14 субрегионов** ВОЗ (учитывает эпидемиологию страны)\n- Использует **лабораторную** (с холестерином) и **безлабораторную** версии\n- 5 категорий риска: < 10, 10–< 20, 20–< 30, 30–< 40, ≥ 40 %\n- Простой цветной chart (возраст × SBP × TC × курение × СД)\n\n### Категории и тактика (WHO 2019 HEARTS package)\n| Риск | Тактика |\n|---|---|\n| < 10 % | Модификация образа жизни, повтор через 5 лет |\n| 10–< 20 % | + Антигипертензивная терапия при стойком АД ≥ 140/90 |\n| 20–< 30 % | + Статин |\n| 30–< 40 % | Комплексная медикаментозная профилактика |\n| ≥ 40 % | Агрессивная терапия всех ФР |\n\n### Когда использовать\n- Первичная помощь в странах LMIC\n- Массовый скрининг\n- Когда нет доступа к локально-валидированному алгоритму\n\n### Ограничения\n- Значительно грубее Framingham/ASCVD/SCORE2/QRISK3\n- Упрощённая имплементация в Ironmed — для точного расчёта используйте официальные таблицы WHO\n- Не валидирован для ряда локальных подгрупп\n\n### Источник\nMendis S, Lindholm LH, Mancia G et al. WHO/ISH risk prediction charts. *Bull WHO* 2007;85(12):948.\nWHO. HEARTS technical package: Risk-based CVD management. 2019.\nWHO CVD Risk Chart Working Group. World Health Organization cardiovascular disease risk charts: revised models. *Lancet Glob Health* 2019;7(10):e1332–e1345."
  };

export default runner;
