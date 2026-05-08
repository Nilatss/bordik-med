/**
 * Runner: aminoglycoside
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
        id: "weight",
        hint: 'Вес в кг (без одежды)',
        label: "Масса (IBW/AdjBW при ожирении)",
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
          90,
          100
        ]
      },
      {
        id: "crcl",
        hint: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л',
        label: "Клиренс креатинина",
        type: "number",
        unit: "мл/мин",
        min: 5,
        max: 200,
        step: 1,
        quickValues: [
          20,
          40,
          60,
          80,
          100,
          120
        ]
      },
      {
        id: "drug",
        label: "Препарат",
        type: "select",
        options: [
          {
            value: "gent",
            label: "Гентамицин"
          },
          {
            value: "tobra",
            label: "Тобрамицин"
          },
          {
            value: "amik",
            label: "Амикацин"
          }
        ]
      }
    ],
    compute: (v)=>{
            const w = Number(v.weight);
            const crcl = Number(v.crcl);
            const drug = String(v.drug);
            const perKg = drug === 'amik' ? 15 : 7;
            const dose = Math.round(perKg * w);
            let interval = '';
            let interpretation = '', color = '', details = '', actions = [];
            if (crcl < 20) {
                interval = 'традиционный режим';
                interpretation = 'CrCl < 20 - отказ от Hartford, переход на традиционный режим';
                color = '#EF4444';
                details = `CrCl ${crcl} мл/мин. Hartford-номограмма НЕ применима. Использовать многоразовое дозирование: ${drug === 'amik' ? 'амикацин 7,5 мг/кг q24-48h' : 'гентамицин/тобрамицин 1,5-2 мг/кг нагрузочно, затем 1 мг/кг q24-48h'} с обязательным измерением peak и trough.`;
                actions = [
                    'Консультация клинического фармаколога',
                    'Измерение peak (через 30 мин после окончания инфузии) и trough (перед следующей дозой)',
                    'Цель trough < 1 мг/л (гент/тобра), < 5 мг/л (амикацин)',
                    'Рассмотреть альтернативу (цефепим, карбапенем) если функция почек ухудшается'
                ];
            } else if (crcl < 40) {
                interval = 'q48h';
                interpretation = `${drug === 'amik' ? 'Амикацин' : 'Гентамицин/тобрамицин'} ${dose} мг в/в q48h (Hartford)`;
                color = '#F59E0B';
                details = `CrCl ${crcl} мл/мин → расширенный интервал q48h. Доза ${perKg} мг/кг × ${w} кг = **${dose} мг**. Инфузия за 60 мин. Random level через 8-12 ч от начала инфузии - по номограмме определить следующую дозу.`;
                actions = [
                    `Развести в 100 мл 0,9% NaCl, инфузия за 60 мин`,
                    'Random level через 8-12 ч от начала инфузии - соотнести с Hartford nomogram',
                    'Креатинин ежедневно',
                    'Максимум 7-10 дней курс (кумулятивная нефро- и ототоксичность)'
                ];
            } else if (crcl < 60) {
                interval = 'q36h';
                interpretation = `${drug === 'amik' ? 'Амикацин' : 'Гентамицин/тобрамицин'} ${dose} мг в/в q36h (Hartford)`;
                color = '#F59E0B';
                details = `CrCl ${crcl} мл/мин → интервал q36h. Доза ${perKg} мг/кг × ${w} кг = **${dose} мг**. Level через 8-12 ч.`;
                actions = [
                    'Инфузия за 60 мин в 100 мл 0,9% NaCl',
                    'Random level через 8-12 ч → Hartford nomogram',
                    'Контроль креатинина ежедневно; при ↑ ≥ 1,5 × baseline - отмена'
                ];
            } else {
                interval = 'q24h';
                interpretation = `${drug === 'amik' ? 'Амикацин' : 'Гентамицин/тобрамицин'} ${dose} мг в/в q24h (Hartford)`;
                color = '#22C55E';
                details = `CrCl ≥ 60 мл/мин → стандартный once-daily режим. Доза ${perKg} мг/кг × ${w} кг = **${dose} мг**. Random level через 6-14 ч от начала инфузии → по номограмме выбрать интервал q24 / q36 / q48.`;
                actions = [
                    'Инфузия за 60 мин в 100 мл 0,9% NaCl',
                    'Random level через 6-14 ч от начала первой дозы',
                    'Trough перед 2-й дозой должен быть < 1 мг/л (гент/тобра), < 5 мг/л (амикацин)',
                    'Максимум 7-10 дней; синергизм при эндокардите - 2 мг/кг/сут (low-dose)'
                ];
            }
            return {
                value: `${dose} мг`,
                unit: interval,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'При ожирении (ABW > 1,25 × IBW) использовать AdjBW = IBW + 0,4 × (ABW − IBW)',
                    'При асците, отёках, ожогах - Vd увеличен, часто требуются более высокие дозы',
                    'Hartford не применим у беременных, детей, при муковисцидозе, эндокардите (низкодозовый синергизм), ожогах',
                    'Ототоксичность кумулятивная - риск пропорционален длительности курса, а не пиковой концентрации',
                    'Избегать сопутствующих нефротоксинов (ванкомицин, амфотерицин, диуретики, контрасты)'
                ],
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    },
                    {
                        id: '301.7',
                        title: 'Инфекционные болезни'
                    }
                ],
                related: [
                    {
                        id: 'cockcroft',
                        title: 'CrCl (Cockcroft-Gault)'
                    },
                    {
                        id: 'vanco-auc',
                        title: 'Ванкомицин AUC/MIC'
                    },
                    {
                        id: 'ibw-devine',
                        title: 'IBW (Devine)'
                    },
                    {
                        id: 'abw',
                        title: 'AdjBW'
                    }
                ]
            };
        },
    reference: "Nicolau DP et al. Experience with a once-daily aminoglycoside program administered to 2,184 adult patients. *Antimicrob Agents Chemother* 1995;39:650. Hartford Hospital nomogram.",
    countries: "США · Международный",
    presets: [
      {
        label: "Гент 70 кг, CrCl 90",
        values: {
          weight: 70,
          crcl: 90,
          drug: "gent"
        }
      },
      {
        label: "Гент 80 кг, CrCl 50",
        values: {
          weight: 80,
          crcl: 50,
          drug: "gent"
        }
      },
      {
        label: "Амик 70 кг, CrCl 30",
        values: {
          weight: 70,
          crcl: 30,
          drug: "amik"
        }
      }
    ],
    info: "### Для чего используется\n**Hartford nomogram (1995)** - расширенный-интервал режим (extended-interval dosing, EID) для аминогликозидов: гентамицина, тобрамицина, амикацина. Использует высокую разовую дозу 1 раз/сут (или реже) с опорой на концентрационно-зависимое бактерицидное действие и постантибиотический эффект.\n\n### Формула\n`Гентамицин/тобрамицин: 7 мг/кг (по AdjBW)`\n`Амикацин: 15 мг/кг`\n\n### Интервал по CrCl\n| CrCl, мл/мин | Интервал |\n|---|---|\n| ≥ 60 | q24h |\n| 40-59 | q36h |\n| 20-39 | q48h |\n| < 20 | Традиционный режим |\n\n### Мониторинг\nRandom level через **6-14 ч** от начала инфузии → соотнести с Hartford nomogram (графиком), выбрать интервал. Trough < 1 мг/л.\n\n### Когда НЕ использовать\n- Беременность\n- Эндокардит (синергизм - low-dose 2 мг/кг/сут)\n- Муковисцидоз (↑ Vd)\n- Ожоги > 20% TBSA\n- Дети"
  };

export default runner;
