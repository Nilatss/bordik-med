// @ts-nocheck
/**
 * Runner: adrogue-madias
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
        id: "serumNa",
        label: "Na⁺ сыворотки",
        type: "number",
        unit: "ммоль/л",
        min: 100,
        max: 180,
        step: 0.1,
        quickValues: [
          115,
          120,
          125,
          135,
          145,
          155
        ]
      },
      {
        id: "weight",
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 30,
        max: 200,
        step: 0.1,
        quickValues: [
          50,
          60,
          70,
          80,
          90
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
        id: "ageGroup",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "young",
            label: "Взрослый (< 65)"
          },
          {
            value: "elderly",
            label: "Пожилой (≥ 65)"
          }
        ]
      },
      {
        id: "infusate",
        label: "Раствор",
        type: "select",
        options: [
          {
            value: 513,
            label: "3% NaCl (Na 513)"
          },
          {
            value: 154,
            label: "0,9% NaCl (Na 154)"
          },
          {
            value: 130,
            label: "Ringer Lactate (Na 130)"
          },
          {
            value: 77,
            label: "0,45% NaCl (Na 77)"
          },
          {
            value: 0,
            label: "D5W (Na 0)"
          }
        ]
      }
    ],
    compute: (v)=>{
            const serumNa = Number(v.serumNa);
            const w = Number(v.weight);
            const sex = String(v.sex);
            const elderly = v.ageGroup === 'elderly';
            const infusateNa = Number(v.infusate);
            // TBW
            const factor = sex === 'm' ? elderly ? 0.5 : 0.6 : elderly ? 0.45 : 0.5;
            const tbw = factor * w;
            const deltaNa = (infusateNa - serumNa) / (tbw + 1);
            const hypo = serumNa < 135;
            const hyper = serumNa > 145;
            let interpretation = '', color = '', details = '', actions = [];
            if (Math.abs(deltaNa) < 0.5) {
                interpretation = 'Минимальное изменение Na при 1 л инфузии';
                color = '#22C55E';
            } else if (deltaNa > 0) {
                interpretation = `Повышение Na на ${deltaNa.toFixed(2)} ммоль/л на каждый 1 л`;
                color = hypo ? '#F59E0B' : '#EF4444';
            } else {
                interpretation = `Снижение Na на ${Math.abs(deltaNa).toFixed(2)} ммоль/л на каждый 1 л`;
                color = hyper ? '#F59E0B' : '#EF4444';
            }
            details = `**ΔNa на 1 л = (Na_инфуз − Na_сыв) / (TBW + 1) = (${infusateNa} − ${serumNa}) / (${tbw.toFixed(1)} + 1) = ${deltaNa.toFixed(3)} ммоль/л/л**.\n\nTBW = ${factor} × ${w} кг = ${tbw.toFixed(1)} л (${sex === 'm' ? 'мужчина' : 'женщина'}${elderly ? ', пожилой' : ''}).\n\nЧтобы поднять/опустить Na на X ммоль/л, нужно ${(1 / Math.abs(deltaNa)).toFixed(1)} л × X такого раствора.`;
            if (hypo) {
                actions = [
                    `**Цель коррекции**: ≤ 8 ммоль/л за 24 ч (≤ 10 при острой гипоNa < 48 ч)`,
                    `Скорость ≥ 12 ммоль/л/сут → риск осмотического демиелинизирующего синдрома (ODS, ранее «центральный миелиноз мoста»)`,
                    `Симптоматическая (судороги, кома, Na < 120): 3% NaCl 150 мл за 10–20 мин, повторить 1–2 раза до ↑ Na на 4–6 ммоль/л`,
                    `Контроль Na каждые 2–4 ч в первые 24 ч`,
                    `При сверхбыстрой коррекции — «re-lowering» с D5W или десмопрессином 2–4 мкг в/в`
                ];
            } else if (hyper) {
                actions = [
                    `**Цель коррекции**: ≤ 10–12 ммоль/л за 24 ч (медленнее у хронической гиперNa)`,
                    `Острая гиперNa (< 48 ч) — можно корригировать быстрее; хроническая — риск отёка мозга при быстрой коррекции`,
                    `Расчёт дефицита свободной воды: deficit = TBW × (Na/140 − 1)`,
                    `Контроль Na каждые 4–6 ч`,
                    `У гипернатриемии лечение первично основано на восполнении воды (внутрь или D5W), не только на формулах`
                ];
            } else {
                actions = [
                    'Na в норме — коррекция не требуется; применять формулу при дисбалансе'
                ];
            }
            return {
                value: deltaNa > 0 ? `+${deltaNa.toFixed(2)}` : deltaNa.toFixed(2),
                unit: 'ммоль/л на 1 л',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Adrogué-Madias — прогноз только для ИЗОВОЛЕМИЧЕСКОГО состояния; при диурезе, диарее, потоотделении реальная ΔNa отличается',
                    'Формула недооценивает коррекцию при SIADH (задержка воды) и переоценивает при несахарном диабете',
                    'ОБЯЗАТЕЛЬНО мониторинг Na каждые 2–6 ч, а не расчёт в изоляции',
                    'Превышение 10–12 ммоль/л/24 ч → ODS (демиелинизация); при риске — десмопрессин + D5W для «re-lowering»',
                    'TBW у ожирения завышен обычными коэффициентами — использовать скорректированную массу'
                ],
                relatedCourses: [
                    {
                        id: '201.6',
                        title: 'Мочевыделительная физиология'
                    },
                    {
                        id: '301.5',
                        title: 'Нефрология'
                    }
                ],
                related: [
                    {
                        id: 'water-deficit',
                        title: 'Дефицит свободной воды'
                    },
                    {
                        id: 'na-corrected',
                        title: 'Коррекция Na по глюкозе'
                    },
                    {
                        id: 'osm-gap',
                        title: 'Осмоляльный разрыв'
                    }
                ]
            };
        },
    reference: "Adrogué HJ, Madias NE. Hypernatremia. *N Engl J Med* 2000;342:1493. Adrogué HJ, Madias NE. Hyponatremia. *N Engl J Med* 2000;342:1581.",
    countries: "Международный",
    presets: [
      {
        label: "ГипоNa 120, 3% NaCl",
        values: {
          serumNa: 120,
          weight: 70,
          sex: "m",
          ageGroup: "young",
          infusate: 513
        }
      },
      {
        label: "ГипоNa 128, 0,9% NaCl",
        values: {
          serumNa: 128,
          weight: 70,
          sex: "f",
          ageGroup: "elderly",
          infusate: 154
        }
      },
      {
        label: "ГиперNa 160, D5W",
        values: {
          serumNa: 160,
          weight: 80,
          sex: "m",
          ageGroup: "elderly",
          infusate: 0
        }
      }
    ],
    info: "### Для чего используется\n**Формула Adrogué-Madias** — прогноз изменения Na сыворотки при инфузии 1 л раствора известного состава. Используется при планировании коррекции гипо- и гипернатриемии.\n\n### Формула\n`ΔNa = (Na_инфузата − Na_сыворотки) / (TBW + 1)`\n\n### TBW (Total Body Water)\n| Группа | Коэффициент |\n|---|---|\n| Молодой мужчина | 0,6 |\n| Молодая женщина, пожилой мужчина | 0,5 |\n| Пожилая женщина | 0,45 |\n\nTBW = коэф × масса тела.\n\n### Цели коррекции\n| Состояние | Максимум/24 ч |\n|---|---|\n| Хроническая гипоNa | 8 ммоль/л |\n| Острая гипоNa (< 48 ч) | 10–12 ммоль/л |\n| Хроническая гиперNa | 10–12 ммоль/л |\n\nПревышение → **ODS** (осмотический демиелинизирующий синдром) при гипоNa или отёк мозга при гиперNa.\n\n### Симптоматическая гипоNa\n3% NaCl 150 мл за 10–20 мин, повторить до ↑ Na на 4–6 ммоль/л.\n\n### Ограничения\n- Формула игнорирует диурез, стул, потери\n- Пригодна только как ориентир — мониторинг Na обязателен\n- Не подходит для SIADH без ограничения воды\n\n### Источник\nAdrogué HJ, Madias NE. *N Engl J Med* 2000;342:1493 (hypernatremia) & 1581 (hyponatremia).\nSpasovski G et al. European guideline hyponatraemia. *NDT* 2014;29(Suppl 2):i1.\n"
  };

export default runner;
