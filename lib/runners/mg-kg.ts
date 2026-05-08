/**
 * Runner: mg-kg
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
        id: "dosePerKg",
        label: "Доза на кг",
        type: "number",
        unit: "мг/кг",
        min: 0.01,
        max: 500,
        step: 0.01,
        quickValues: [
          1,
          5,
          10,
          15,
          25,
          50
        ]
      },
      {
        id: "weight",
        hint: 'Вес в кг (без одежды)',
        label: "Вес пациента",
        type: "number",
        unit: "кг",
        min: 2,
        max: 200,
        step: 0.1,
        quickValues: [
          5,
          10,
          20,
          40,
          60,
          70,
          80,
          100
        ]
      },
      {
        id: "frequencyPerDay",
        label: "Частота приёма",
        type: "select",
        options: [
          {
            value: 1,
            label: "1 раз/сут"
          },
          {
            value: 2,
            label: "2 раза/сут"
          },
          {
            value: 3,
            label: "3 раза/сут"
          },
          {
            value: 4,
            label: "4 раза/сут"
          }
        ]
      }
    ],
    compute: (v)=>{
            const dose = Number(v.dosePerKg);
            const w = Number(v.weight);
            const freq = Number(v.frequencyPerDay) || 1;
            const single = dose * w;
            const daily = single * freq;
            return {
                value: `${single.toFixed(1)} мг × ${freq}/сут`,
                unit: `(суточная ${daily.toFixed(0)} мг)`,
                interpretation: 'Расчётная доза - проверьте по максимальной суточной и инструкции препарата.',
                color: '#4B8DF5',
                details: `Разовая доза: ${dose} мг/кг × ${w} кг = ${single.toFixed(1)} мг. При режиме ${freq}/сут суммарно за сутки: ${daily.toFixed(0)} мг. Для многих препаратов существует потолок (max daily dose) - превышать не рекомендуется независимо от массы (например, парацетамол 4 г/сут у взрослых, амоксициллин 4 г/сут, ванкомицин - по AUC/MIC).`,
                actions: [
                    'Сравнить с максимальной суточной дозой из инструкции / BNF / Lexicomp',
                    'У пожилых и при ХБП/печёночной недостаточности - коррекция дозы и интервала',
                    'При ожирении оценить, какая масса используется: TBW, IBW или AdjBW (зависит от препарата)',
                    'У новорождённых и грудных детей - верифицировать по педиатрическому справочнику (Harriet Lane, BNFc)'
                ],
                caveats: [
                    'Формула не учитывает возраст, функцию почек/печени и сопутствующие препараты',
                    'Для липофильных препаратов (например, пропофол) при ожирении использовать TBW, для гидрофильных (аминогликозиды) - AdjBW',
                    'У детей ряд препаратов дозируются по BSA, а не по массе (химиотерапия)',
                    'Безопасность требует проверки максимальной суточной дозы - расчёт может её превысить'
                ],
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    },
                    {
                        id: '203.9',
                        title: 'Педиатрическая фармакология'
                    }
                ],
                related: [
                    {
                        id: 'bsa-dose',
                        title: 'Доза по BSA'
                    },
                    {
                        id: 'ibw-devine',
                        title: 'Идеальная масса (Devine)'
                    },
                    {
                        id: 'cockcroft',
                        title: 'CrCl (коррекция дозы)'
                    }
                ]
            };
        },
    reference: "Универсальная формула: Разовая доза (мг) = доза/кг × масса (кг). Проверяйте max daily dose по инструкции.",
    countries: "Международный",
    presets: [
      {
        label: "Амоксициллин 25 мг/кг × 3 (ребёнок 15 кг)",
        values: {
          dosePerKg: 25,
          weight: 15,
          frequencyPerDay: 3
        }
      },
      {
        label: "Парацетамол 15 мг/кг × 4 (70 кг)",
        values: {
          dosePerKg: 15,
          weight: 70,
          frequencyPerDay: 4
        }
      },
      {
        label: "Эноксапарин 1 мг/кг × 2 (80 кг)",
        values: {
          dosePerKg: 1,
          weight: 80,
          frequencyPerDay: 2
        }
      }
    ],
    info: "### Для чего используется\nУниверсальный **расчёт дозы по массе тела (мг/кг)** - базовая операция в педиатрии, неотложной помощи, антибактериальной и антикоагулянтной терапии.\n\n### Формула\n`Разовая доза (мг) = доза (мг/кг) × масса (кг)`\n`Суточная доза = разовая × кратность`\n\n### Типовые дозировки\n| Препарат | Доза | Максимум/сут |\n|---|---|---|\n| Парацетамол | 15 мг/кг × 4 | 4 г (взр.) / 60 мг/кг (дет.) |\n| Ибупрофен | 10 мг/кг × 3 | 40 мг/кг или 2,4 г |\n| Амоксициллин | 25-45 мг/кг × 3 | 4 г |\n| Цефтриаксон | 50-100 мг/кг × 1 | 4 г |\n| Эноксапарин (лечебная) | 1 мг/кг × 2 | - |\n| Гепарин (болюс) | 80 Ед/кг | - |\n\n### Выбор веса при ожирении\n| Препарат | Какую массу брать |\n|---|---|\n| Гидрофильные (аминогликозиды, гепарин) | AdjBW или IBW |\n| Липофильные (пропофол, бензодиазепины) | TBW |\n| Парацетамол | IBW (для профилактики гепатотоксичности) |\n| Эноксапарин | TBW (капирование при > 150 кг) |\n\n### Ограничения\n- Не учитывает функцию почек/печени\n- Формула не работает для препаратов, дозируемых по BSA (цитостатики)\n- У пожилых и новорождённых - обязательно справочник"
  };

export default runner;
