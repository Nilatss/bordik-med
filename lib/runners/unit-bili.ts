// @ts-nocheck
/**
 * Runner: unit-bili
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
        id: "value",
        hint: 'Билирубин общий. Норма: 5-21 мкмоль/л',
        label: "Билирубин",
        type: "number",
        unit: "mg/dL",
        min: 0.1,
        max: 50,
        step: 0.1,
        quickValues: [
          0.8,
          1.2,
          2,
          5,
          15
        ]
      }
    ],
    compute: (v)=>{
            const mgdl = Number(v.value);
            const umol = mgdl * 17.1;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            if (mgdl < 1.2) {
                interpretation = 'Норма';
                color = '#22C55E';
                details = 'Общий билирубин < 1,2 mg/dL (< 20 мкмоль/л) - норма.';
            } else if (mgdl < 3) {
                interpretation = 'Лёгкая гипербилирубинемия';
                color = '#F59E0B';
                details = 'Билирубин 1,2-3 mg/dL (20-51 мкмоль/л) - лёгкая гипербилирубинемия. Желтуха клинически заметна при > 2-3 mg/dL. Оценить прямую/непрямую фракцию.';
                actions = [
                    'Прямой/непрямой билирубин; АЛТ, АСТ, ЩФ, ГГТ, альбумин, МНО',
                    'Изолированная непрямая - гемолиз (гаптоглобин, ЛДГ, ретикулоциты) или синдром Жильбера',
                    'Холестатический паттерн (↑ ЩФ/ГГТ) - УЗИ/МРХПГ'
                ];
            } else if (mgdl < 10) {
                interpretation = 'Умеренная гипербилирубинемия';
                color = '#EF4444';
                details = 'Выраженная желтуха. Требует срочной диф.: гепатоцеллюлярная (гепатит, лекарственное повреждение), холестатическая (обструкция протоков, ПБЦ/ПСХ), гемолиз.';
                actions = [
                    'УЗИ гепатобилиарной зоны; при дилатации протоков - МРХПГ/ЭРХПГ',
                    'Печёночная панель: АЛТ, АСТ, ЩФ, ГГТ, альбумин, МНО, фракции билирубина',
                    'Вирусный гепатит, аутоиммунные маркеры (АМА, АНА, IgG)',
                    'MELD при подозрении на цирроз'
                ];
            } else {
                interpretation = 'Тяжёлая гипербилирубинемия';
                color = '#991B1B';
                details = 'Билирубин > 10 mg/dL (> 171 мкмоль/л) - тяжёлая гипербилирубинемия. Частые причины: острая печёночная недостаточность, декомпенсированный цирроз, злокачественная обструкция, алкогольный гепатит (Maddrey DF).';
                actions = [
                    'Срочная госпитализация, оценка печёночной недостаточности (МНО, энцефалопатия)',
                    'Maddrey DF / MELD для прогноза',
                    'При ОПечН - контакт с трансплант-центром (King\u2019s College criteria)'
                ];
            }
            return {
                value: `${mgdl.toFixed(1)} mg/dL = ${umol.toFixed(0)} мкмоль/л`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Неонатальная гипербилирубинемия оценивается по Bhutani-номограмме - отдельные пороги',
                    'Желтуха склер видна при билирубине > 2-3 mg/dL (> 34-51 мкмоль/л)',
                    'Изолированный непрямой билирубин до 5 mg/dL при голодании - синдром Жильбера (до 5% населения)'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 1.2,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 1.2,
                            max: 3,
                            label: 'Лёгкая',
                            color: '#F59E0B'
                        },
                        {
                            min: 3,
                            max: 10,
                            label: 'Умер.',
                            color: '#EF4444'
                        },
                        {
                            min: 10,
                            max: 50,
                            label: 'Тяжёлая',
                            color: '#991B1B'
                        }
                    ],
                    current: Number(mgdl.toFixed(1)),
                    unit: 'mg/dL'
                },
                related: [
                    {
                        id: 'meld',
                        title: 'MELD'
                    },
                    {
                        id: 'maddrey',
                        title: 'Maddrey DF'
                    },
                    {
                        id: 'unit-creatinine',
                        title: 'Конверсия креатинина'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.3',
                        title: 'Гастроэнтерология'
                    },
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    }
                ]
            };
        },
    reference: "мкмоль/л = mg/dL × 17,1 (молекулярная масса билирубина 584,66 г/моль).",
    countries: "Международный",
    presets: [
      {
        label: "Норма",
        values: {
          value: 0.8
        }
      },
      {
        label: "Синдром Жильбера",
        values: {
          value: 2.5
        }
      },
      {
        label: "Желтуха",
        values: {
          value: 6
        }
      },
      {
        label: "Печёночная нед.",
        values: {
          value: 20
        }
      }
    ],
    info: "### Для чего используется\nКонверсия общего билирубина между **mg/dL** (США) и **мкмоль/л** (СИ).\n\n### Формула\n`мкмоль/л = mg/dL × 17,1`\n`mg/dL = мкмоль/л ÷ 17,1`\n\n### Интерпретация\n| mg/dL | мкмоль/л | Категория |\n|---|---|---|\n| < 1,2 | < 20 | Норма |\n| 1,2-3 | 20-51 | Лёгкая (желтуха склер > 2-3) |\n| 3-10 | 51-171 | Умеренная (видимая желтуха) |\n| > 10 | > 171 | Тяжёлая |\n\n### Диф. диагностика\n| Паттерн | Причины |\n|---|---|\n| ↑ Непрямой (> 80%) | Гемолиз, Жильбер, Криглера-Найяра, рассасывание гематомы |\n| ↑ Прямой + ↑ АЛТ/АСТ | Гепатоцеллюлярное (гепатит, лекарства) |\n| ↑ Прямой + ↑ ЩФ/ГГТ | Холестатическое (обструкция, ПБЦ, ПСХ) |\n\n### Ограничения\n- Неонатальная гипербилирубинемия - отдельные ориентиры (Bhutani)\n- Гемолитическая желтуха редко > 5 mg/dL без других факторов\n\n### Тактика\n- Желтуха + дилатация протоков → МРХПГ/ЭРХПГ\n- Билирубин > 10 + МНО > 1,5 → оценка ОПечН (King's College, MELD)"
  };

export default runner;
