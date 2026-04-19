// @ts-nocheck
/**
 * Runner: head-growth
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
        unit: "мес",
        min: 0,
        max: 60,
        step: 1,
        quickValues: [
          0,
          3,
          6,
          12,
          24,
          36,
          60
        ]
      },
      {
        id: "sex",
        label: "Пол",
        type: "select",
        options: [
          {
            value: "m",
            label: "Мальчик"
          },
          {
            value: "f",
            label: "Девочка"
          }
        ]
      },
      {
        id: "hc",
        label: "Окружность головы",
        type: "number",
        unit: "см",
        min: 25,
        max: 60,
        step: 0.1,
        quickValues: [
          35,
          40,
          45,
          47,
          50
        ]
      },
      {
        id: "muac",
        label: "MUAC (окр. плеча)",
        type: "number",
        unit: "см",
        min: 5,
        max: 25,
        step: 0.1,
        quickValues: [
          11.5,
          12.5,
          13.5,
          15
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const sex = String(v.sex);
            const hc = Number(v.hc);
            const muac = Number(v.muac);
            // Упрощённые WHO-LMS (мальчики; для девочек ~ −0.5 см)
            // Референсные данные WHO Child Growth Standards 2006
            const boysHC = {
                0: {
                    m: 34.5,
                    sd: 1.3
                },
                1: {
                    m: 37.3,
                    sd: 1.2
                },
                2: {
                    m: 39.1,
                    sd: 1.2
                },
                3: {
                    m: 40.5,
                    sd: 1.2
                },
                6: {
                    m: 43.3,
                    sd: 1.3
                },
                9: {
                    m: 45.2,
                    sd: 1.3
                },
                12: {
                    m: 46.1,
                    sd: 1.3
                },
                18: {
                    m: 47.4,
                    sd: 1.4
                },
                24: {
                    m: 48.3,
                    sd: 1.4
                },
                36: {
                    m: 49.5,
                    sd: 1.4
                },
                48: {
                    m: 50.2,
                    sd: 1.5
                },
                60: {
                    m: 50.8,
                    sd: 1.5
                }
            };
            const keys = Object.keys(boysHC).map(Number).sort((a, b)=>a - b);
            let k = keys[0];
            for (const kk of keys){
                if (kk <= age) k = kk;
            }
            const ref = boysHC[k];
            const mean = sex === 'f' ? ref.m - 0.5 : ref.m;
            const z = (hc - mean) / ref.sd;
            let interpretation = '', color = '#22C55E';
            let details = '';
            let actions = [];
            if (z < -2) {
                interpretation = 'Микроцефалия (Z < −2 SD)';
                color = '#EF4444';
                details = 'Окружность головы существенно ниже возрастной нормы. Требует оценки неврологического развития, поиска причин (врождённые инфекции TORCH, генетические синдромы, структурные аномалии, краниосиностоз).';
                actions = [
                    'Неврологическое обследование + УЗИ/МРТ головного мозга',
                    'Скрининг TORCH (если <6 мес)',
                    'Консультация генетика при ассоциированных аномалиях',
                    'Оценка психомоторного развития (Denver II)'
                ];
            } else if (z > 2) {
                interpretation = 'Макроцефалия (Z > +2 SD)';
                color = '#F59E0B';
                details = 'Окружность головы выше возрастной нормы. Исключить гидроцефалию, внутричерепные образования, семейную макроцефалию, метаболические заболевания (болезни накопления).';
                actions = [
                    'УЗИ через большой родничок (если открыт) или МРТ',
                    'Измерить окружность головы родителей (семейная макроцефалия)',
                    'Осмотр глазного дна (ВЧД)',
                    'При быстром приросте (>2 см/нед) — срочная нейровизуализация'
                ];
            } else {
                interpretation = 'Окружность головы в пределах нормы';
                color = '#22C55E';
                details = 'Z-score от −2 до +2 SD. Продолжить плановые измерения.';
                actions = [
                    'Контроль при очередных визитах по ВОЗ/CDC',
                    'Оценить динамику прироста'
                ];
            }
            // MUAC интерпретация (WHO для 6-59 мес)
            let muacNote = '';
            if (!isNaN(muac) && muac > 0) {
                if (muac < 11.5) muacNote = `MUAC ${muac.toFixed(1)} см — тяжёлая острая недостаточность питания (SAM).`;
                else if (muac < 12.5) muacNote = `MUAC ${muac.toFixed(1)} см — умеренная острая недостаточность питания (MAM).`;
                else muacNote = `MUAC ${muac.toFixed(1)} см — норма (≥12,5 см для 6–59 мес).`;
            }
            if (muacNote) details += '\n\n' + muacNote;
            return {
                value: z.toFixed(2),
                unit: 'SD',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'WHO-референс 2006 (0–60 мес); после 5 лет — CDC/UK-WHO',
                    'Для недоношенных корректируйте возраст до 24 мес скорр.',
                    'MUAC применим 6–59 мес (WHO); <6 мес — использовать вес/длину',
                    'Референсные значения упрощены — для точной оценки используйте WHO Anthro'
                ],
                scale: {
                    segments: [
                        {
                            min: -5,
                            max: -2,
                            label: '<−2 SD (микроцеф.)',
                            color: '#EF4444'
                        },
                        {
                            min: -2,
                            max: 2,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 2,
                            max: 5,
                            label: '>+2 SD (макроцеф.)',
                            color: '#F59E0B'
                        }
                    ],
                    current: Number(z.toFixed(2)),
                    unit: 'SD'
                },
                related: [
                    {
                        id: 'who-growth',
                        title: 'WHO Growth'
                    },
                    {
                        id: 'cdc-growth',
                        title: 'CDC Growth'
                    },
                    {
                        id: 'intergrowth',
                        title: 'INTERGROWTH-21'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия раннего возраста'
                    }
                ]
            };
        },
    reference: "WHO Child Growth Standards 2006. Head circumference-for-age. MUAC: WHO 2009 (SAM <11,5 см, MAM 11,5–12,4 см у 6–59 мес).",
    countries: "Международный (ВОЗ)",
    presets: [
      {
        label: "Мальчик 6 мес, норма",
        values: {
          age: 6,
          sex: "m",
          hc: 43.3,
          muac: 14
        }
      },
      {
        label: "Мальчик 12 мес, микроцеф.",
        values: {
          age: 12,
          sex: "m",
          hc: 43,
          muac: 11
        }
      },
      {
        label: "Девочка 24 мес, макроцеф.",
        values: {
          age: 24,
          sex: "f",
          hc: 52,
          muac: 15
        }
      }
    ],
    info: "### Для чего используется\n**Head circumference-for-age + MUAC + BMI-for-age Z-score** — интегральная антропометрическая оценка:\n- **Окружность головы** — отражает рост мозга; ключевой параметр до 3 лет.\n- **MUAC (mid-upper arm circumference)** — маркер острой недостаточности питания у детей 6–59 мес.\n- **Z-score** — стандартизированное отклонение от медианы референсной популяции (WHO 2006).\n\n### Формула\n`Z = (измеренное значение − медиана) / SD`\n\n### Интерпретация HC Z-score\n| Z-score | Статус |\n|---|---|\n| < −3 | Выраженная микроцефалия |\n| < −2 | Микроцефалия |\n| −2 … +2 | Норма |\n| > +2 | Макроцефалия |\n| > +3 | Выраженная макроцефалия |\n\n### Интерпретация MUAC (WHO, 6–59 мес)\n| MUAC | Статус |\n|---|---|\n| ≥ 12,5 см | Норма |\n| 11,5–12,4 см | Умеренная острая недостаточность (MAM) |\n| < 11,5 см | Тяжёлая острая недостаточность (SAM) |\n\n### Ограничения\n- Для недоношенных корректируйте возраст до 24 мес скорр.\n- WHO-референс используется до 5 лет; после — CDC или UK-WHO\n- MUAC у младенцев <6 мес не валидирован\n- Семейная макроцефалия возможна при нормальном развитии\n\n### Тактика\n- **Микроцефалия**: МРТ, TORCH, генетик, Denver II\n- **Макроцефалия**: нейровизуализация, исключить гидроцефалию, измерить ОГ родителей\n- **SAM (MUAC <11,5)**: госпитализация, RUTF, F-75/F-100 по WHO протоколу\n- **MAM**: амбулаторное питание, контроль каждые 2 нед\n\n### Источник\nWHO Multicentre Growth Reference Study Group. *WHO Child Growth Standards* 2006. WHO 2009 Guidelines for Management of SAM."
  };

export default runner;
