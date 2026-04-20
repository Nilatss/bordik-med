// @ts-nocheck
/**
 * Runner: unit-chol
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
        id: "which",
        label: "Показатель",
        type: "select",
        options: [
          {
            value: "chol",
            label: "Холестерин (общий/ЛПНП/ЛПВП)"
          },
          {
            value: "tg",
            label: "Триглицериды"
          }
        ]
      },
      {
        id: "value",
        label: "Значение",
        type: "number",
        unit: "mg/dL",
        min: 10,
        max: 1000,
        step: 1,
        quickValues: [
          100,
          150,
          200,
          240,
          300
        ]
      }
    ],
    compute: (v)=>{
            const mgdl = Number(v.value);
            const isTg = v.which === 'tg';
            const factor = isTg ? 88.57 : 38.67;
            const mmol = mgdl / factor;
            const label = isTg ? 'Триглицериды' : 'Холестерин';
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            if (isTg) {
                if (mgdl < 150) {
                    interpretation = 'Норма (ТГ)';
                    color = '#22C55E';
                    details = 'Триглицериды < 150 mg/dL (< 1,7 ммоль/л) - норма.';
                } else if (mgdl < 200) {
                    interpretation = 'Погранично высокие';
                    color = '#F59E0B';
                    details = '150-199 mg/dL (1,7-2,3 ммоль/л) - погранично повышены (ATP III).';
                } else if (mgdl < 500) {
                    interpretation = 'Высокие ТГ';
                    color = '#EF4444';
                    details = '200-499 mg/dL (2,3-5,6 ммоль/л) - высокий уровень. Исключить вторичные причины (СД2, гипотиреоз, алкоголь, эстрогены). Рассмотреть фибраты или омега-3.';
                } else {
                    interpretation = 'Очень высокие - риск панкреатита';
                    color = '#991B1B';
                    details = 'ТГ ≥ 500 mg/dL (≥ 5,6 ммоль/л) - риск острого панкреатита. Начать фибраты/омега-3 срочно; при ≥ 1000 - тяжёлая семейная гипертриглицеридемия, рассмотреть плазмаферез.';
                }
            } else {
                if (mgdl < 200) {
                    interpretation = 'Желательный уровень';
                    color = '#22C55E';
                    details = 'Общий холестерин < 200 mg/dL (< 5,2 ммоль/л) - желательный уровень. Для ЛПНП цели зависят от риска ASCVD.';
                } else if (mgdl < 240) {
                    interpretation = 'Погранично высокий';
                    color = '#F59E0B';
                    details = '200-239 mg/dL (5,2-6,2 ммоль/л) - пограничный. Оценить 10-летний риск ASCVD (SCORE2/PCE).';
                } else {
                    interpretation = 'Высокий холестерин';
                    color = '#EF4444';
                    details = '≥ 240 mg/dL (≥ 6,2 ммоль/л) - высокий. При ЛПНП ≥ 190 - вероятная семейная гиперхолестеринемия, статины высокой интенсивности.';
                }
            }
            return {
                value: `${mgdl.toFixed(0)} mg/dL = ${mmol.toFixed(2)} ммоль/л`,
                interpretation,
                color,
                details,
                caveats: [
                    'Цели ЛПНП зависят от риска ASCVD (ESC 2021): очень высокий риск - < 1,4 ммоль/л; высокий - < 1,8; умеренный - < 2,6',
                    'ТГ на голодный желудок ≥ 12 ч; постпрандиальные ТГ клинически допустимы до 175 mg/dL (ESC)',
                    'При ТГ > 400 формула Фридевальда для ЛПНП неточна - использовать прямое измерение или Martin-Hopkins'
                ],
                scale: isTg ? {
                    segments: [
                        {
                            min: 0,
                            max: 150,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 150,
                            max: 200,
                            label: 'Погран.',
                            color: '#F59E0B'
                        },
                        {
                            min: 200,
                            max: 500,
                            label: 'Высокие',
                            color: '#EF4444'
                        },
                        {
                            min: 500,
                            max: 1000,
                            label: 'Панкреатит',
                            color: '#991B1B'
                        }
                    ],
                    current: Number(mgdl.toFixed(0)),
                    unit: 'mg/dL'
                } : {
                    segments: [
                        {
                            min: 0,
                            max: 200,
                            label: 'Желательно',
                            color: '#22C55E'
                        },
                        {
                            min: 200,
                            max: 240,
                            label: 'Погран.',
                            color: '#F59E0B'
                        },
                        {
                            min: 240,
                            max: 400,
                            label: 'Высокий',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(mgdl.toFixed(0)),
                    unit: 'mg/dL'
                },
                related: [
                    {
                        id: 'friedewald',
                        title: 'ЛПНП по Фридевальду'
                    },
                    {
                        id: 'unit-glucose',
                        title: 'Конверсия глюкозы'
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
    reference: "Холестерин: ммоль/л = mg/dL ÷ 38,67 (М = 386,65). ТГ: ммоль/л = mg/dL ÷ 88,57 (М = 885,7).",
    countries: "Международный",
    presets: [
      {
        label: "Норма ХС",
        values: {
          which: "chol",
          value: 180
        }
      },
      {
        label: "Высокий ХС",
        values: {
          which: "chol",
          value: 260
        }
      },
      {
        label: "Норма ТГ",
        values: {
          which: "tg",
          value: 120
        }
      },
      {
        label: "Риск панкреатита",
        values: {
          which: "tg",
          value: 600
        }
      }
    ],
    info: "### Для чего используется\nКонверсия липидов между **mg/dL** и **ммоль/л** (СИ). Коэффициенты различаются для холестерина и триглицеридов из-за разной молекулярной массы.\n\n### Формула\n- **Холестерин** (общий, ЛПНП, ЛПВП): `ммоль/л = mg/dL ÷ 38,67`\n- **Триглицериды**: `ммоль/л = mg/dL ÷ 88,57`\n\n### Целевые значения ЛПНП (ESC 2021)\n| Риск ASCVD | Цель ЛПНП |\n|---|---|\n| Очень высокий | < 1,4 ммоль/л (< 55 mg/dL) |\n| Высокий | < 1,8 ммоль/л (< 70 mg/dL) |\n| Умеренный | < 2,6 ммоль/л (< 100 mg/dL) |\n| Низкий | < 3,0 ммоль/л (< 116 mg/dL) |\n\n### Триглицериды (ATP III)\n| mg/dL | ммоль/л | Категория |\n|---|---|---|\n| < 150 | < 1,7 | Норма |\n| 150-199 | 1,7-2,3 | Погранично |\n| 200-499 | 2,3-5,6 | Высокие |\n| ≥ 500 | ≥ 5,6 | Риск панкреатита |\n\n### Быстрые ориентиры\n- ХС 200 mg/dL ≈ 5,2 ммоль/л\n- ЛПНП 100 mg/dL ≈ 2,6 ммоль/л\n- ТГ 150 mg/dL ≈ 1,7 ммоль/л\n\n### Ограничения\n- ТГ чувствительны к приёму пищи за последние 12 ч\n- Формула Фридевальда для ЛПНП требует ТГ < 400 mg/dL"
  };

export default runner;
