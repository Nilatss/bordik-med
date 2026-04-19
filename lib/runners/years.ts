// @ts-nocheck
/**
 * Runner: years
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
        id: "dvt_signs",
        label: "Клинические признаки ТГВ",
        type: "checkbox"
      },
      {
        id: "hemo",
        label: "Кровохаркание",
        type: "checkbox"
      },
      {
        id: "pe_likely",
        label: "ТЭЛА — наиболее вероятный диагноз",
        type: "checkbox"
      },
      {
        id: "ddimer",
        label: "D-димер",
        type: "number",
        unit: "нг/мл FEU",
        min: 0,
        max: 20000,
        step: 10,
        quickValues: [
          250,
          500,
          750,
          1000,
          1500,
          3000
        ]
      }
    ],
    compute: (v)=>{
            const items = [
                v.dvt_signs,
                v.hemo,
                v.pe_likely
            ].filter((x)=>x === true).length;
            const dd = Number(v.ddimer);
            const cutoff = items === 0 ? 1000 : 500;
            const ruledOut = dd < cutoff;
            let interpretation = '';
            let color = '';
            let details = '';
            let actions = [];
            if (ruledOut) {
                interpretation = `ТЭЛА исключена (D-димер ${dd} < ${cutoff} нг/мл)`;
                color = '#22C55E';
                details = `При ${items} положительных YEARS-пунктах порог D-димера ${cutoff} нг/мл. D-димер ниже порога — ТЭЛА исключена без визуализации. NPV ≈ 99,5 % (Hulle 2017, Prospective Outcome Study).`;
                actions = [
                    'КТ-ангио не требуется',
                    'Искать альтернативную причину симптомов',
                    'Переоценка при ухудшении'
                ];
            } else {
                interpretation = `КТ-ангио показана (D-димер ${dd} ≥ ${cutoff} нг/мл)`;
                color = '#EF4444';
                details = `При ${items} положительных YEARS-пунктах порог ${cutoff} нг/мл. D-димер превышает — показана КТ-ангио лёгких. Алгоритм YEARS снижает частоту КТ на ~14 % vs классический D-димер.`;
                actions = [
                    'КТ-ангиография лёгких',
                    'При беременности — адаптированный алгоритм (van der Pol 2019) + УЗДС ног',
                    'Рассмотреть эмпирическую антикоагуляцию до визуализации при высокой вероятности'
                ];
            }
            return {
                value: String(items),
                unit: items === 1 ? 'YEARS-пункт' : 'YEARS-пунктов',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Не применять при нестабильной гемодинамике — сразу ЭхоКГ / КТ',
                    'D-димер должен быть высокочувствительный (ELISA или иммунотурбидиметрия)',
                    'Беременность — использовать pregnancy-adapted YEARS (van der Pol 2019)',
                    'Не валидизирован у пациентов на антикоагулянтах'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: cutoff - 1,
                            label: 'ТЭЛА исключена',
                            color: '#22C55E'
                        },
                        {
                            min: cutoff,
                            max: 20000,
                            label: 'КТ-ангио',
                            color: '#EF4444'
                        }
                    ],
                    current: dd,
                    unit: 'нг/мл FEU'
                },
                related: [
                    {
                        id: 'wells-pe',
                        title: 'Wells для ТЭЛА'
                    },
                    {
                        id: 'geneva',
                        title: 'Geneva score'
                    },
                    {
                        id: 'perc',
                        title: 'PERC rule'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.2',
                        title: 'Пульмонология'
                    },
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    }
                ]
            };
        },
    reference: "van der Hulle T et al. Lancet 2017; 390:289–297. Simplified diagnostic management of suspected pulmonary embolism (YEARS).",
    countries: "Международный (ESC 2019)",
    presets: [
      {
        label: "0 пунктов, D-димер низкий",
        values: {
          dvt_signs: false,
          hemo: false,
          pe_likely: false,
          ddimer: 600
        }
      },
      {
        label: "1 пункт, D-димер высокий",
        values: {
          dvt_signs: true,
          hemo: false,
          pe_likely: false,
          ddimer: 1200
        }
      },
      {
        label: "0 пунктов, D-димер 1500",
        values: {
          dvt_signs: false,
          hemo: false,
          pe_likely: false,
          ddimer: 1500
        }
      }
    ],
    info: "### Для чего используется\n**YEARS algorithm (van der Hulle 2017)** — упрощённый диагностический подход к исключению ТЭЛА с **гибким порогом D-димера** в зависимости от клинической вероятности.\n\n### Три клинических пункта\n1. Клинические признаки ТГВ\n2. Кровохаркание\n3. ТЭЛА — наиболее вероятный диагноз (клинический гештальт)\n\n### Интерпретация (cutoff D-димера)\n| YEARS-пункты | Порог D-димера FEU |\n|---|---|\n| 0 | 1000 нг/мл |\n| ≥ 1 | 500 нг/мл |\n\n### Алгоритм\n- D-димер < порога → **ТЭЛА исключена**, КТ не нужна\n- D-димер ≥ порога → **КТ-ангиография**\n\n### Результаты исследования Hulle 2017\n- 3465 пациентов, 13 % ТЭЛА исходно\n- ~ 14 % снижение потребности в КТ vs классический Wells + D-димер\n- 3-месячная частота пропущенной ТЭЛА: 0,43 %\n\n### Беременность — pregnancy-adapted YEARS (van der Pol 2019)\n+ УЗДС ног при клинических признаках ТГВ. Частота пропусков 0,2 %, ~ 39 % избежали КТ.\n\n### Ограничения\n- Не применять при нестабильной гемодинамике\n- Требует высокочувствительного D-димера\n- Не валидизирован на пациентах на антикоагулянтах, при ХПН тяжёлой степени\n\n### Тактика\n- Низкий риск, D-димер < порога → амбулаторно, искать альтернативу\n- D-димер ≥ порога → КТ-ангио; при подтверждении — DOAC\n- Беременная → pregnancy-adapted YEARS + УЗДС\n\n### Источник\nvan der Hulle T, Cheung WY, Kooij S et al. Simplified diagnostic management of suspected pulmonary embolism (the YEARS study). *Lancet* 2017; 390:289–297."
  };

export default runner;
