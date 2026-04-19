// @ts-nocheck
/**
 * Runner: broselow
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
        id: "length",
        label: "Длина тела (рост)",
        type: "number",
        unit: "см",
        min: 45,
        max: 150,
        step: 1,
        quickValues: [
          55,
          65,
          75,
          85,
          95,
          110,
          125,
          140
        ]
      }
    ],
    compute: (v)=>{
            const len = Number(v.length);
            const zones = [
                {
                    color: 'Grey',
                    name: 'Grey',
                    weight: 3,
                    lenRange: '46–53 см',
                    et: '3,5 (без манжеты)',
                    ngSize: '5–8 Fr',
                    foley: '5 Fr',
                    hex: '#9CA3AF'
                },
                {
                    color: 'Pink',
                    name: 'Pink',
                    weight: 7,
                    lenRange: '54–61 см',
                    et: '3,5',
                    ngSize: '8 Fr',
                    foley: '8 Fr',
                    hex: '#F9A8D4'
                },
                {
                    color: 'Red',
                    name: 'Red',
                    weight: 9,
                    lenRange: '62–69 см',
                    et: '3,5',
                    ngSize: '8–10 Fr',
                    foley: '8 Fr',
                    hex: '#EF4444'
                },
                {
                    color: 'Purple',
                    name: 'Purple',
                    weight: 11,
                    lenRange: '70–79 см',
                    et: '4,0',
                    ngSize: '10 Fr',
                    foley: '10 Fr',
                    hex: '#A855F7'
                },
                {
                    color: 'Yellow',
                    name: 'Yellow',
                    weight: 14,
                    lenRange: '80–89 см',
                    et: '4,5',
                    ngSize: '10 Fr',
                    foley: '10 Fr',
                    hex: '#EAB308'
                },
                {
                    color: 'White',
                    name: 'White',
                    weight: 18,
                    lenRange: '90–104 см',
                    et: '5,0',
                    ngSize: '10–12 Fr',
                    foley: '10 Fr',
                    hex: '#F3F4F6'
                },
                {
                    color: 'Blue',
                    name: 'Blue',
                    weight: 22,
                    lenRange: '105–115 см',
                    et: '5,5',
                    ngSize: '12 Fr',
                    foley: '10 Fr',
                    hex: '#3B82F6'
                },
                {
                    color: 'Orange',
                    name: 'Orange',
                    weight: 28,
                    lenRange: '116–129 см',
                    et: '6,0 с манж.',
                    ngSize: '12–14 Fr',
                    foley: '12 Fr',
                    hex: '#F97316'
                },
                {
                    color: 'Green',
                    name: 'Green',
                    weight: 36,
                    lenRange: '130–143 см',
                    et: '6,5 с манж.',
                    ngSize: '14 Fr',
                    foley: '12 Fr',
                    hex: '#22C55E'
                }
            ];
            let zone = zones[0];
            if (len >= 130) zone = zones[8];
            else if (len >= 116) zone = zones[7];
            else if (len >= 105) zone = zones[6];
            else if (len >= 90) zone = zones[5];
            else if (len >= 80) zone = zones[4];
            else if (len >= 70) zone = zones[3];
            else if (len >= 62) zone = zones[2];
            else if (len >= 54) zone = zones[1];
            else zone = zones[0];
            const w = zone.weight;
            const details = `**Зона ${zone.name}** (${zone.lenRange}). Расчётный вес ≈ **${w} кг**.

**Оборудование:**
- ЭТТ: ${zone.et}
- NG-зонд: ${zone.ngSize}
- Foley: ${zone.foley}

**Ключевые дозы (PALS):**
- **Эпинефрин** (остановка): 0,01 мг/кг в/в/в/к = **${(w * 0.01).toFixed(2)} мг** (${(w * 0.1).toFixed(1)} мл 1:10 000)
- **Эпинефрин ЭТТ**: 0,1 мг/кг = **${(w * 0.1).toFixed(1)} мг**
- **Амиодарон** (VF/pVT): 5 мг/кг = **${(w * 5).toFixed(0)} мг**
- **Лидокаин**: 1 мг/кг = **${w} мг**
- **Аденозин** (SVT): 0,1 мг/кг (1-я доза) = **${(w * 0.1).toFixed(1)} мг**; 0,2 мг/кг (2-я) = **${(w * 0.2).toFixed(1)} мг**
- **Атропин** (брадикардия): 0,02 мг/кг = **${(w * 0.02).toFixed(2)} мг** (мин 0,1 мг)
- **Дефибрилляция**: 2 Дж/кг 1-я → 4 Дж/кг след. = **${(w * 2).toFixed(0)} → ${(w * 4).toFixed(0)} Дж**
- **Кардиоверсия**: 0,5–1 Дж/кг = **${(w * 0.5).toFixed(0)}–${w} Дж**
- **Бикарбонат натрия**: 1 мЭкв/кг = **${w} мЭкв**
- **Глюкоза 10%**: 5 мл/кг = **${(w * 5).toFixed(0)} мл**
- **NaCl 0,9% болюс**: 20 мл/кг = **${(w * 20).toFixed(0)} мл**
- **Налоксон**: 0,1 мг/кг = **${(w * 0.1).toFixed(1)} мг**
- **Мидазолам** (судороги): 0,1 мг/кг в/в = **${(w * 0.1).toFixed(1)} мг**`;
            return {
                value: `${w} кг`,
                unit: '',
                interpretation: `Зона ${zone.name}`,
                color: zone.hex,
                details,
                actions: [
                    'Сверить с паспортными данными если возможно',
                    'Использовать реальный вес при наличии',
                    'При ожирении — лента недооценивает дозу'
                ],
                caveats: [
                    'Lute-Broselow разработан для детей до ~36 кг (~10 лет)',
                    'При ожирении вес недооценивается (используйте идеальный или реальный вес)',
                    'Для препаратов с липофильной кинетикой — рассчитывать по LBW',
                    'Обновления: Broselow 2011 и 2017 — минимальные изменения',
                    'Не заменяет клиническую оценку веса'
                ],
                related: [
                    {
                        id: 'pals',
                        title: 'PALS алгоритмы'
                    },
                    {
                        id: 'holliday-segar',
                        title: 'Holliday-Segar (жидкость)'
                    },
                    {
                        id: 'apgar',
                        title: 'Apgar'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия раннего возраста'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ]
            };
        },
    reference: "Luten RC, Wears RL, Broselow J, et al. Length-based endotracheal tube and emergency equipment in pediatrics. Ann Emerg Med 1992;21:900–904. AHA PALS 2020.",
    countries: "Международный (AHA/PALS)",
    presets: [
      {
        label: "Младенец 6 мес (~65 см)",
        values: {
          length: 65
        }
      },
      {
        label: "Ребёнок 2 года (~85 см)",
        values: {
          length: 85
        }
      },
      {
        label: "Ребёнок 5 лет (~110 см)",
        values: {
          length: 110
        }
      },
      {
        label: "Ребёнок 8 лет (~125 см)",
        values: {
          length: 125
        }
      }
    ],
    info: "### Для чего используется\n**Broselow-Luten Tape (1986, Luten 1992)** — цветная лента для быстрого расчёта веса, доз лекарств и размеров оборудования у детей по длине тела. Стандарт педиатрической реанимации.\n\n### Цветные зоны\n| Зона | Длина | Вес |\n|---|---|---|\n| Grey | 46–53 см | 3 кг |\n| Pink | 54–61 см | 7 кг |\n| Red | 62–69 см | 9 кг |\n| Purple | 70–79 см | 11 кг |\n| Yellow | 80–89 см | 14 кг |\n| White | 90–104 см | 18 кг |\n| Blue | 105–115 см | 22 кг |\n| Orange | 116–129 см | 28 кг |\n| Green | 130–143 см | 36 кг |\n\n### Ключевые дозы PALS (по весу)\n| Препарат | Доза |\n|---|---|\n| Эпинефрин (остановка) | 0,01 мг/кг в/в (0,1 мл/кг 1:10 000) |\n| Амиодарон (VF/pVT) | 5 мг/кг болюс |\n| Аденозин (SVT) | 0,1 → 0,2 мг/кг |\n| Атропин | 0,02 мг/кг (мин 0,1 мг) |\n| Дефибрилляция | 2 → 4 Дж/кг |\n| Кардиоверсия | 0,5–1 Дж/кг |\n| Жидкостный болюс | 20 мл/кг NaCl 0,9% |\n\n### Ограничения\n- До ~36 кг / ~10 лет\n- При ожирении недооценивает вес\n- Липофильные препараты — по LBW\n\n### Тактика\n- Измерьте длину тела от пятки до макушки\n- Определите цветную зону\n- Считайте дозы и размеры из таблицы соответствующего цвета\n\n### Источник\nLuten RC et al. *Ann Emerg Med* 1992;21:900–904. Broselow J. Оригинальная лента 1986. AHA PALS 2020."
  };

export default runner;
