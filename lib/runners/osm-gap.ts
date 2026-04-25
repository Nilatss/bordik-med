// @ts-nocheck
/**
 * Runner: osm-gap
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
        id: "measuredOsm",
        label: "Измеренная осмоляльность",
        type: "number",
        unit: "мОсм/кг",
        min: 250,
        max: 450,
        step: 1,
        quickValues: [
          285,
          295,
          305,
          320
        ]
      },
      {
        id: "na",
        hint: 'Натрий сыворотки. Норма: 135-145 ммоль/л',
        label: "Na⁺",
        type: "number",
        unit: "ммоль/л",
        min: 100,
        max: 180,
        step: 0.1,
        quickValues: [
          135,
          140,
          145
        ]
      },
      {
        id: "glucose",
        hint: 'Глюкоза плазмы. Натощак: 3.9-5.5 ммоль/л',
        label: "Глюкоза",
        type: "number",
        unit: "ммоль/л",
        min: 1,
        max: 60,
        step: 0.1,
        quickValues: [
          5,
          7,
          10,
          15,
          25
        ]
      },
      {
        id: "urea",
        hint: 'Мочевина. Норма: 2.5-7.5 ммоль/л',
        label: "Мочевина",
        type: "number",
        unit: "ммоль/л",
        min: 1,
        max: 60,
        step: 0.1,
        quickValues: [
          4,
          6,
          10,
          20
        ]
      }
    ],
    compute: (v)=>{
            const measured = Number(v.measuredOsm);
            const na = Number(v.na);
            const glu = Number(v.glucose);
            const urea = Number(v.urea);
            const calculated = 2 * na + glu + urea;
            const gap = measured - calculated;
            let interpretation = '', color = '', details = '', actions = [];
            let differential;
            if (gap <= 10) {
                interpretation = 'Нормальный осмоляльный разрыв (< 10 мОсм/кг)';
                color = '#22C55E';
                details = `Рассчётная осмоляльность ${calculated.toFixed(0)} мОсм/кг, разрыв ${gap.toFixed(1)}. Значимых неизмеряемых осмолей нет. При метаболическом ацидозе с высоким AG причины ограничены эндогенными (лактат, кетоны, уремия).`;
                actions = [
                    'Продолжить дифференциальный поиск причины ацидоза (лактат, кетоны, уремия)',
                    'Если есть клиническое подозрение на интоксикацию - повторить измерение (методика!)'
                ];
            } else if (gap <= 20) {
                interpretation = 'Умеренно повышенный осмоляльный разрыв (10-20)';
                color = '#F59E0B';
                details = `Разрыв ${gap.toFixed(1)} мОсм/кг - подозрение на неизмеряемые осмоли. Возможны: этанол (каждые 100 мг/дл → +22 мОсм/кг), маннитол, пропиленгликоль (носитель лоразепама, диазепама, фенобарбитала в/в).`;
                actions = [
                    'Уровень этанола в крови (блок-фактор)',
                    'Проверить список препаратов: в/в лоразепам/диазепам (пропиленгликоль), маннитол',
                    'При метаболическом ацидозе + ↑AG + ↑OG - немедленно исключить метанол/этиленгликоль'
                ];
                differential = [
                    {
                        term: 'Ethanol',
                        desc: 'Этанол - самая частая причина; каждые 100 мг/дл → +22 мОсм/кг'
                    },
                    {
                        term: 'Mannitol',
                        desc: 'Маннитол - осмотический диуретик'
                    },
                    {
                        term: 'Propylene glycol',
                        desc: 'Пропиленгликоль - носитель в/в лоразепама, фенобарбитала'
                    },
                    {
                        term: 'Glycerol',
                        desc: 'Глицерин - в/в для ↓ ВЧД'
                    }
                ];
            } else {
                interpretation = 'Высокий осмоляльный разрыв (> 20) - подозрение на токсические спирты';
                color = '#EF4444';
                details = `Разрыв ${gap.toFixed(1)} мОсм/кг. В сочетании с метаболическим ацидозом с ↑AG - неотложная картина отравления метанолом или этиленгликолем. Оба требуют немедленного лечения фомепизолом и часто гемодиализа.`;
                actions = [
                    'СРОЧНО: фомепизол 15 мг/кг в/в нагрузочно, затем 10 мг/кг q12h × 4 дозы',
                    'Альтернатива фомепизолу: этанол в/в целевая концентрация 100-150 мг/дл',
                    'Гемодиализ при pH < 7,25 ИЛИ уровне токсина ≥ 50 мг/дл ИЛИ ОПН ИЛИ нарушении зрения (метанол)',
                    'Сопутствующее: кофакторы - фолиевая/фолиновая кислота (метанол), тиамин + пиридоксин (этиленгликоль)',
                    'Консультация токсиколога'
                ];
                differential = [
                    {
                        term: 'Methanol',
                        desc: 'Метанол - слепота, отёк зрительного нерва; каждые 100 мг/дл → +34 мОсм/кг'
                    },
                    {
                        term: 'Ethylene glycol',
                        desc: 'Этиленгликоль - оксалатурия, ОПН; +16 мОсм/кг на 100 мг/дл'
                    },
                    {
                        term: 'Isopropanol',
                        desc: 'Изопропанол - кетоны без ацидоза; +17 мОсм/кг'
                    },
                    {
                        term: 'Ethanol',
                        desc: 'Этанол - если очень высокий уровень, даёт большой OG без ацидоза'
                    },
                    {
                        term: 'DKA/AKA',
                        desc: 'Кетоацидоз - ацетон даёт небольшой вклад в OG'
                    }
                ];
            }
            return {
                value: gap.toFixed(1),
                unit: 'мОсм/кг',
                interpretation,
                color,
                details,
                actions,
                differential,
                caveats: [
                    'Формула в единицах SI: 2×Na + глюкоза + мочевина (всё ммоль/л). В США: 2×Na + glucose/18 + BUN/2.8 (мг/дл)',
                    'Норма осмоляльного разрыва −14 до +10 - вариабельна, метод-зависима',
                    'Нормальный OG не исключает отравление на поздней стадии (спирт метаболизирован → OG норма, AG высокий)',
                    'Измерение должно быть osmolality (замораживание), не osmolarity (расчётная) - разные методы'
                ],
                scale: {
                    segments: [
                        {
                            min: -20,
                            max: 10,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 10,
                            max: 20,
                            label: 'Умеренн.',
                            color: '#F59E0B'
                        },
                        {
                            min: 20,
                            max: 80,
                            label: 'Высокий',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(gap.toFixed(1)),
                    unit: 'мОсм/кг'
                },
                relatedCourses: [
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ],
                related: [
                    {
                        id: 'anion-gap',
                        title: 'Анионный разрыв'
                    },
                    {
                        id: 'henderson',
                        title: 'Кислотно-щелочной анализ'
                    },
                    {
                        id: 'na-corrected',
                        title: 'Коррекция Na по глюкозе'
                    }
                ]
            };
        },
    reference: "Krasowski MD. *Am J Kidney Dis* 2013. Worthley LIG. Recalculating the osmolality equation. *Crit Care Resusc* 2002;4:277.",
    countries: "Международный",
    presets: [
      {
        label: "Норма",
        values: {
          measuredOsm: 290,
          na: 140,
          glucose: 5,
          urea: 5
        }
      },
      {
        label: "Отравление метанолом",
        values: {
          measuredOsm: 340,
          na: 138,
          glucose: 6,
          urea: 5
        }
      },
      {
        label: "Этанол (0,2%)",
        values: {
          measuredOsm: 335,
          na: 140,
          glucose: 5,
          urea: 5
        }
      }
    ],
    info: "### Для чего используется\n**Осмоляльный разрыв (OG)** - разница между измеренной и расчётной осмоляльностью плазмы. Применяется при **подозрении на отравление токсическими спиртами** (метанол, этиленгликоль) и необъяснимом метаболическом ацидозе с ↑AG.\n\n### Формула (SI, всё в ммоль/л)\n`Расчётная осм = 2 × Na⁺ + глюкоза + мочевина`\n`OG = измеренная − расчётная`\n\nНорма: от −14 до +10 мОсм/кг.\n\n### Интерпретация при ↑AG + ↑OG\n| Патология | Ключ |\n|---|---|\n| Метанол | Слепота, отёк зрительного нерва |\n| Этиленгликоль | Оксалатные кристаллы мочи, ОПН |\n| Пропиленгликоль | Носитель в/в лоразепама |\n| Изопропанол | Кетоны БЕЗ ацидоза |\n\n### Лечение отравлений метанолом/этиленгликолем\n1. Фомепизол 15 мг/кг в/в нагрузочно → 10 мг/кг q12h\n2. Гемодиализ при pH < 7,25, токсин ≥ 50 мг/дл, ОПН\n3. Кофакторы: фолиевая/фолиновая (метанол), тиамин + пиридоксин (этиленгликоль)"
  };

export default runner;
