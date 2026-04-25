// @ts-nocheck
/**
 * Runner: intergrowth
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
        id: "gaWeeks",
        hint: 'Возраст в годах',
        label: "Гестационный возраст",
        type: "number",
        unit: "нед",
        min: 22,
        max: 42,
        step: 0.1,
        quickValues: [
          26,
          28,
          30,
          32,
          34,
          37,
          40
        ]
      },
      {
        id: "sex",
        label: "Пол",
        type: "select",
        options: [
          {
            value: "m",
            label: "Мужской"
          },
          {
            value: "f",
            label: "Женский"
          }
        ]
      },
      {
        id: "weight",
        hint: 'Вес в кг (без одежды)',
        label: "Масса при рождении",
        type: "number",
        unit: "г",
        min: 300,
        max: 5000,
        step: 10,
        quickValues: [
          800,
          1000,
          1500,
          2000,
          2500,
          3300
        ]
      },
      {
        id: "length",
        hint: 'Рост / длина в сантиметрах',
        label: "Длина тела",
        type: "number",
        unit: "см",
        min: 25,
        max: 60,
        step: 0.1,
        quickValues: [
          35,
          40,
          45,
          50
        ]
      },
      {
        id: "hc",
        hint: 'Рост / длина в сантиметрах',
        label: "Окружность головы",
        type: "number",
        unit: "см",
        min: 18,
        max: 45,
        step: 0.1,
        quickValues: [
          25,
          28,
          32,
          34
        ]
      }
    ],
    compute: (v)=>{
            const ga = Number(v.gaWeeks);
            const sex = String(v.sex);
            const w = Number(v.weight);
            const l = Number(v.length);
            const hc = Number(v.hc);
            // Fenton 2013 median weight (grams) by GA - simplified interpolation
            const fentonWeight = {
                m: [
                    {
                        ga: 24,
                        med: 640,
                        sd: 110
                    },
                    {
                        ga: 26,
                        med: 880,
                        sd: 140
                    },
                    {
                        ga: 28,
                        med: 1150,
                        sd: 170
                    },
                    {
                        ga: 30,
                        med: 1490,
                        sd: 210
                    },
                    {
                        ga: 32,
                        med: 1890,
                        sd: 260
                    },
                    {
                        ga: 34,
                        med: 2330,
                        sd: 310
                    },
                    {
                        ga: 36,
                        med: 2770,
                        sd: 360
                    },
                    {
                        ga: 38,
                        med: 3170,
                        sd: 410
                    },
                    {
                        ga: 40,
                        med: 3500,
                        sd: 450
                    },
                    {
                        ga: 42,
                        med: 3680,
                        sd: 470
                    }
                ],
                f: [
                    {
                        ga: 24,
                        med: 620,
                        sd: 105
                    },
                    {
                        ga: 26,
                        med: 850,
                        sd: 135
                    },
                    {
                        ga: 28,
                        med: 1100,
                        sd: 165
                    },
                    {
                        ga: 30,
                        med: 1430,
                        sd: 200
                    },
                    {
                        ga: 32,
                        med: 1820,
                        sd: 250
                    },
                    {
                        ga: 34,
                        med: 2250,
                        sd: 300
                    },
                    {
                        ga: 36,
                        med: 2680,
                        sd: 350
                    },
                    {
                        ga: 38,
                        med: 3060,
                        sd: 400
                    },
                    {
                        ga: 40,
                        med: 3380,
                        sd: 440
                    },
                    {
                        ga: 42,
                        med: 3550,
                        sd: 460
                    }
                ]
            };
            const tbl = fentonWeight[sex] || fentonWeight.m;
            let lo = tbl[0], hi = tbl[tbl.length - 1];
            for(let i = 0; i < tbl.length - 1; i++){
                if (ga >= tbl[i].ga && ga <= tbl[i + 1].ga) {
                    lo = tbl[i];
                    hi = tbl[i + 1];
                    break;
                }
            }
            const frac = hi.ga === lo.ga ? 0 : (ga - lo.ga) / (hi.ga - lo.ga);
            const medW = lo.med + (hi.med - lo.med) * frac;
            const sdW = lo.sd + (hi.sd - lo.sd) * frac;
            const zW = (w - medW) / sdW;
            const pct = 0.5 * (1 + Math.sign(zW) * Math.sqrt(1 - Math.exp(-2 * zW * zW / Math.PI))) * 100;
            // Length/HC approximate
            const medL = 28 + (ga - 24) * 1.4;
            const medHC = 22 + (ga - 24) * 0.9;
            const zL = (l - medL) / 2.0;
            const zHC = (hc - medHC) / 1.5;
            let interpretation = '', color = '#22C55E';
            let details = '', actions = [];
            if (pct < 3) {
                interpretation = 'SGA (< 3-й перц.)';
                color = '#EF4444';
                details = 'Small for gestational age - масса ниже 3-го перцентиля для данного ГВ. Риск гипогликемии, гипотермии, полицитемии, гипокальциемии.';
                actions = [
                    'Ранний контроль глюкозы (каждые 3 ч × 24 ч)',
                    'Тёплая цепь, ранее вскармливание',
                    'Исключить TORCH-инфекции, хромосомные аномалии'
                ];
            } else if (pct < 10) {
                interpretation = '3-10-й перцентиль';
                color = '#F59E0B';
                details = 'Пограничная зона - возможен конституциональный вариант или лёгкая задержка внутриутробного развития.';
                actions = [
                    'Ранний контроль глюкозы',
                    'Оценка плаценты, материнских факторов'
                ];
            } else if (pct > 97) {
                interpretation = 'LGA (> 97-й)';
                color = '#F59E0B';
                details = 'Large for gestational age. Риск родовых травм, гипогликемии (материнский диабет), полицитемии.';
                actions = [
                    'Контроль глюкозы каждые 3 ч × 24 ч',
                    'Оценка на родовую травму',
                    'Скрининг диабета у матери (если не был)'
                ];
            } else {
                interpretation = 'AGA (10-97-й)';
                color = '#22C55E';
                details = 'Appropriate for gestational age. Масса соответствует сроку гестации.';
                actions = [
                    'Рутинное ведение',
                    'Прогрессивный кормовой режим по протоколу'
                ];
            }
            return {
                value: `Z массы ${zW.toFixed(2)} · перц. ${pct.toFixed(0)}`,
                unit: `Z длины ${zL.toFixed(2)} · Z ОГ ${zHC.toFixed(2)}`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Упрощённая аппроксимация по Fenton 2013 - для точных значений используйте INTERGROWTH-21st / Fenton калькуляторы или PediTools',
                    'После 50 нед PMA переходить на WHO Growth Standards',
                    'INTERGROWTH-21st основан на 59 337 беременностях в 8 странах (стандарт, не референс)',
                    'Fenton 2013 - меta-анализ 4 больших когорт (референс)'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 3,
                            label: 'SGA',
                            color: '#EF4444'
                        },
                        {
                            min: 3,
                            max: 10,
                            label: '3-10',
                            color: '#F59E0B'
                        },
                        {
                            min: 10,
                            max: 97,
                            label: 'AGA',
                            color: '#22C55E'
                        },
                        {
                            min: 97,
                            max: 100,
                            label: 'LGA',
                            color: '#F59E0B'
                        }
                    ],
                    current: Number(pct.toFixed(0)),
                    unit: 'перц.'
                },
                related: [
                    {
                        id: 'who-growth',
                        title: 'WHO 0-5 (после 50 нед PMA)'
                    },
                    {
                        id: 'crib',
                        title: 'CRIB-II'
                    },
                    {
                        id: 'ballard',
                        title: 'Ballard (зрелость)'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия 0-2'
                    }
                ]
            };
        },
    reference: "INTERGROWTH-21st (Villar 2014, Lancet). Fenton 2013 preterm growth chart (meta-analysis).",
    countries: "Международный",
    presets: [
      {
        label: "♂ 28 нед, 1100 г, 37 см",
        values: {
          gaWeeks: 28,
          sex: "m",
          weight: 1100,
          length: 37,
          hc: 26
        }
      },
      {
        label: "♀ 34 нед, 2100 г, 45 см",
        values: {
          gaWeeks: 34,
          sex: "f",
          weight: 2100,
          length: 45,
          hc: 31
        }
      },
      {
        label: "♂ 40 нед, 3500 г, 50 см",
        values: {
          gaWeeks: 40,
          sex: "m",
          weight: 3500,
          length: 50,
          hc: 35
        }
      }
    ],
    info: "### Для чего используется\n**INTERGROWTH-21st (Villar 2014)** - международный стандарт внутриутробного и ранного постнатального роста для сроков **24-42 нед**. Построен как \"стандарт\" (т.е. оптимальный рост), а не референс.\n\n**Fenton 2013** - обновлённый preterm growth chart, meta-анализ 4 когорт (> 34 000 младенцев, 22-50 нед PMA). Классический инструмент в ОРИТН.\n\n### Классификация по перцентилю\n| Перцентиль | Термин | Комментарий |\n|---|---|---|\n| < 3 | SGA (тяжёлая) | Риск гипогликемии, гипотермии, полицитемии |\n| 3-10 | SGA (лёгкая) / низкая граница | Требует наблюдения |\n| 10-90 | AGA | Соответствует сроку |\n| 90-97 | Высокая граница | Рассмотреть материнский диабет |\n| > 97 | LGA | Риск родовых травм, гипогликемии |\n\n### Используемые параметры\n- Масса при рождении\n- Длина тела\n- Окружность головы\n\n### Когда какой chart\n| Срок | Рекомендация |\n|---|---|\n| Внутриутробно / при рождении | INTERGROWTH-21st |\n| Постнатально 22-50 нед PMA | Fenton 2013 |\n| ≥ 50 нед PMA | WHO 0-5 |\n\n### Ограничения\n- Не применять после 50 нед постменструального возраста (PMA)\n- Точные значения - только через PediTools / официальные калькуляторы\n- Учитывайте этничность и наследственный рост - INTERGROWTH-21st разработан как универсальный, но популяционные различия существуют"
  };

export default runner;
