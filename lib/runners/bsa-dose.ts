// @ts-nocheck
/**
 * Runner: bsa-dose
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
        id: "dosePerBSA",
        label: "Доза на м²",
        type: "number",
        unit: "мг/м²",
        min: 1,
        max: 5000,
        step: 1,
        quickValues: [
          50,
          100,
          300,
          500,
          1000,
          2000
        ]
      },
      {
        id: "weight",
        hint: 'Вес в кг (без одежды)',
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 2,
        max: 200,
        step: 0.1,
        quickValues: [
          10,
          20,
          40,
          60,
          70,
          80
        ]
      },
      {
        id: "height",
        hint: 'Рост в см (без обуви)',
        label: "Рост",
        type: "number",
        unit: "см",
        min: 30,
        max: 220,
        step: 0.1,
        quickValues: [
          75,
          110,
          140,
          160,
          170,
          180
        ]
      }
    ],
    compute: (v)=>{
            const d = Number(v.dosePerBSA);
            const w = Number(v.weight);
            const h = Number(v.height);
            const bsa = Math.sqrt(w * h / 3600);
            const total = d * bsa;
            return {
                value: `${total.toFixed(1)} мг`,
                unit: `(BSA ${bsa.toFixed(2)} м²)`,
                interpretation: 'Разовая доза на пациента. При BMI > 30 учитывайте capping.',
                color: '#4B8DF5',
                details: `BSA по Мостеллеру: √(${w} × ${h} / 3600) = ${bsa.toFixed(2)} м². Доза: ${d} мг/м² × ${bsa.toFixed(2)} м² = ${total.toFixed(1)} мг. В онкологии дозирование по BSA обеспечивает более равномерное распределение токсичности между пациентами разных размеров, чем мг/кг.`,
                actions: [
                    'Сверить расчёт с двумя независимыми источниками (ASCO: double-check chemotherapy)',
                    'Округлить до доступной лекарственной формы (vial size)',
                    'При BMI > 30 - следовать протоколу центра (ASCO 2012: НЕ капировать BSA)',
                    'При почечной/печёночной дисфункции применять стандартные редукции (Calvert formula для карбоплатина)'
                ],
                caveats: [
                    'Формула Мостеллера ± 5 % - достаточно для химиотерапии',
                    'Ранее при BSA > 2,0 м² капировали; ASCO 2012 рекомендует использовать полный BSA',
                    'При асците и выраженных отёках - завышает BSA; взвешивать "сухой" вес',
                    'У детей < 10 кг - рассмотреть формулу Хейкока'
                ],
                relatedCourses: [
                    {
                        id: '301.7',
                        title: 'Онкология'
                    },
                    {
                        id: '203.9',
                        title: 'Педиатрическая фармакология'
                    }
                ],
                related: [
                    {
                        id: 'bsa-mosteller',
                        title: 'BSA (Мостеллер)'
                    },
                    {
                        id: 'bsa-dubois',
                        title: 'BSA (Du Bois)'
                    },
                    {
                        id: 'mg-kg',
                        title: 'Доза по массе'
                    }
                ]
            };
        },
    reference: "Доза = (мг/м²) × BSA. BSA по Мостеллеру 1987. Стандарт онкологии (ASCO 2012).",
    countries: "США · ЕС · Международный",
    presets: [
      {
        label: "Доксорубицин 60 мг/м² (70/175)",
        values: {
          dosePerBSA: 60,
          weight: 70,
          height: 175
        }
      },
      {
        label: "5-FU 500 мг/м² (60/165)",
        values: {
          dosePerBSA: 500,
          weight: 60,
          height: 165
        }
      },
      {
        label: "Циклофосфамид 600 мг/м² (80/180)",
        values: {
          dosePerBSA: 600,
          weight: 80,
          height: 180
        }
      }
    ],
    info: "### Для чего используется\n**Дозирование по площади поверхности тела (BSA)** применяется в онкологии (цитостатики), педиатрии и при расчёте физиологических параметров. BSA лучше коррелирует с объёмом распределения и клиренсом препаратов, чем масса тела.\n\n### Формула\n\n- `BSA (м²) = √(вес(кг) × рост(см) / 3600)` - Мостеллер\n`Доза (мг) = (мг/м²) × BSA`\n\n### Типичные дозы цитостатиков\n| Препарат | Типовая доза |\n|---|---|\n| Доксорубицин | 60-75 мг/м² каждые 3 нед |\n| 5-Фторурацил | 400-500 мг/м² болюс |\n| Циклофосфамид | 600 мг/м² |\n| Паклитаксел | 175 мг/м² |\n| Винкристин | 1,4 мг/м² (max 2 мг!) |\n\n### Capping - устаревшая практика\nРанее при BSA > 2,0 м² дозу ограничивали, чтобы снизить токсичность. **ASCO 2012**: использовать полный BSA на основе фактической массы - низкая доза у больных ожирением приводит к субтерапевтическому эффекту.\n\n### Ограничения\n- Не учитывает фармакогенетику (DPYD для 5-FU, UGT1A1 для иринотекана)\n- При кахексии и отёках точность снижена\n- Для карбоплатина - формула Calvert по AUC, не по BSA"
  };

export default runner;
