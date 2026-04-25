// @ts-nocheck
/**
 * Runner: bsa-haycock
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
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 2,
        max: 200,
        step: 0.1,
        quickValues: [
          3.5,
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
          50,
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
            const w = Number(v.weight);
            const h = Number(v.height);
            const bsa = 0.024265 * Math.pow(w, 0.5378) * Math.pow(h, 0.3964);
            const gehan = 0.0235 * Math.pow(w, 0.51456) * Math.pow(h, 0.42246);
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            if (bsa < 1.0) {
                interpretation = 'Малая площадь (детская)';
                color = '#3B82F6';
                details = 'BSA < 1,0 м² характерна для детей младшего возраста. Дозирование цитостатиков и педиатрических препаратов по BSA - стандарт онкологии.';
            } else if (bsa < 1.4) {
                interpretation = 'Подростковая / малая взрослая';
                color = '#22C55E';
                details = 'BSA 1,0-1,4 м² - подростки и малорослые взрослые. Дозы по BSA в онкологии часто ограничиваются максимумом 2,0-2,2 м².';
            } else if (bsa < 2.2) {
                interpretation = 'Взрослая норма';
                color = '#22C55E';
                details = 'Средний взрослый ♂ ≈ 1,9 м²; ♀ ≈ 1,6 м². BSA используется для дозирования химиотерапии, расчёта сердечного индекса (CI = CO / BSA).';
            } else {
                interpretation = 'Крупная BSA';
                color = '#F59E0B';
                details = 'BSA > 2,2 м² - крупный пациент. В онкопротоколах часто "капают" дозу при BSA > 2,0-2,2 м² из-за непропорционально высоких уровней препарата.';
            }
            return {
                value: bsa.toFixed(2),
                unit: 'м²',
                interpretation,
                color,
                details,
                caveats: [
                    'Haycock валидизирована от недоношенных до взрослых - универсальна',
                    `Gehan-George даёт близкое значение: ${gehan.toFixed(2)} м²`,
                    'При ожирении все формулы BSA завышают реальную площадь - в онкологии рекомендовано ограничивать BSA до 2,0-2,2 м²',
                    'Du Bois (1916) - классика, но завышает у детей; Mosteller - самый простой для бедсайда'
                ],
                scale: {
                    segments: [
                        {
                            min: 0.2,
                            max: 1.0,
                            label: 'Дети',
                            color: '#3B82F6'
                        },
                        {
                            min: 1.0,
                            max: 1.4,
                            label: 'Подрост',
                            color: '#22C55E'
                        },
                        {
                            min: 1.4,
                            max: 2.2,
                            label: 'Взросл.',
                            color: '#22C55E'
                        },
                        {
                            min: 2.2,
                            max: 3.0,
                            label: 'Крупный',
                            color: '#F59E0B'
                        }
                    ],
                    current: Number(bsa.toFixed(2)),
                    unit: 'м²'
                },
                related: [
                    {
                        id: 'bsa-mosteller',
                        title: 'BSA (Mosteller)'
                    },
                    {
                        id: 'bsa-dubois',
                        title: 'BSA (Du Bois)'
                    },
                    {
                        id: 'bmi',
                        title: 'BMI'
                    }
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
                ]
            };
        },
    reference: "Haycock GB et al. J Pediatr 1978;93:62-66. BSA = 0.024265 × W^0.5378 × H^0.3964.",
    countries: "Международный (особ. педиатрия и онкология)",
    presets: [
      {
        label: "Новорождённый",
        values: {
          weight: 3.5,
          height: 50
        }
      },
      {
        label: "Ребёнок 5 лет",
        values: {
          weight: 18,
          height: 110
        }
      },
      {
        label: "Взрослый ♂",
        values: {
          weight: 75,
          height: 175
        }
      },
      {
        label: "Взрослая ♀",
        values: {
          weight: 60,
          height: 165
        }
      }
    ],
    info: "### Для чего используется\n**Haycock (1978)** - формула площади поверхности тела, валидизированная от недоношенных до взрослых. Используется для:\n\n- Дозирования химиотерапии (онкология, гематология)\n- Расчёта сердечного индекса (CI = CO / BSA)\n- Расчёта рСКФ в мл/мин (eGFR × BSA / 1,73)\n- Педиатрических расчётов инфузий и препаратов\n\n### Формула\n`BSA (м²) = 0,024265 × W(кг)^0,5378 × H(см)^0,3964`\n\n### Альтернативы\n| Формула | Особенность |\n|---|---|\n| **Mosteller (1987)** | `√(W × H / 3600)` - простая, бедсайд |\n| **Du Bois (1916)** | `0,007184 × W^0,425 × H^0,725` - классика, завышает у детей |\n| **Haycock (1978)** | Универсальная от новорождённых до взрослых |\n| **Gehan-George (1970)** | `0,0235 × W^0,51456 × H^0,42246` - близка к Haycock |\n| **Boyd (1935)** | Сложная, редко используется |\n\n### Средние значения\n| Группа | BSA (м²) |\n|---|---|\n| Новорождённый | ~ 0,25 |\n| Ребёнок 5 лет | ~ 0,8 |\n| Взрослая ♀ | ~ 1,6 |\n| Взрослый ♂ | ~ 1,9 |\n\n### Ограничения\n- У пациентов с ожирением завышает - в онкопротоколах BSA часто ограничивают 2,0-2,2 м²\n- При ампутациях, тяжёлых отёках - расчёт неточен\n- Для рСКФ (CKD-EPI) BSA нужна только при нестандартной антропометрии\n\n### Тактика\n- Онкология: использовать BSA согласно протоколу (обычно Du Bois или Mosteller); в педиатрии - Haycock\n- Реанимация: CI = CO / BSA (норма 2,5-4,0 л/мин/м²)"
  };

export default runner;
