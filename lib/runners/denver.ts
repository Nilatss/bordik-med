// @ts-nocheck
/**
 * Runner: denver
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
        id: "ageMonths",
        label: "Возраст",
        type: "number",
        unit: "мес",
        min: 0,
        max: 72,
        step: 1,
        quickValues: [
          6,
          12,
          18,
          24,
          36,
          48,
          60
        ]
      },
      {
        id: "personalSocial",
        label: "Личностно-социальная сфера",
        type: "select",
        options: [
          {
            value: "0",
            label: "Соответствует возрасту"
          },
          {
            value: "1",
            label: "1 задержка (caution)"
          },
          {
            value: "2",
            label: "≥ 2 задержек или невыполнения"
          }
        ]
      },
      {
        id: "fineMotor",
        label: "Тонкая моторика",
        type: "select",
        options: [
          {
            value: "0",
            label: "Соответствует возрасту"
          },
          {
            value: "1",
            label: "1 задержка (caution)"
          },
          {
            value: "2",
            label: "≥ 2 задержек"
          }
        ]
      },
      {
        id: "language",
        label: "Речь",
        type: "select",
        options: [
          {
            value: "0",
            label: "Соответствует возрасту"
          },
          {
            value: "1",
            label: "1 задержка (caution)"
          },
          {
            value: "2",
            label: "≥ 2 задержек"
          }
        ]
      },
      {
        id: "grossMotor",
        label: "Крупная моторика",
        type: "select",
        options: [
          {
            value: "0",
            label: "Соответствует возрасту"
          },
          {
            value: "1",
            label: "1 задержка (caution)"
          },
          {
            value: "2",
            label: "≥ 2 задержек"
          }
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.ageMonths);
            const domains = [
                'personalSocial',
                'fineMotor',
                'language',
                'grossMotor'
            ];
            const delays = domains.reduce((acc, d)=>acc + (Number(v[d]) === 2 ? 1 : 0), 0);
            const cautions = domains.reduce((acc, d)=>acc + (Number(v[d]) === 1 ? 1 : 0), 0);
            let interpretation = '', color = '#22C55E';
            let details = '', actions = [];
            if (delays >= 2 || delays === 1 && cautions >= 2) {
                interpretation = 'Ненормальный (abnormal)';
                color = '#EF4444';
                details = 'Две или более задержек, или 1 задержка + ≥ 2 caution. Показано направление на углублённое нейроразвитийное обследование.';
                actions = [
                    'Направление на формальную оценку (Bayley-III/4, ASQ-3 подробно)',
                    'Невролог + детский психолог',
                    'Оценка слуха и зрения',
                    'Начать раннее вмешательство (early intervention)'
                ];
            } else if (delays === 1 || cautions >= 2) {
                interpretation = 'Подозрительный (suspect)';
                color = '#F59E0B';
                details = 'Одна задержка или ≥ 2 caution. Рекомендуется повторный Denver через 1-2 недели или углублённая оценка.';
                actions = [
                    'Повторить Denver II через 1-2 нед после коррекции транзиторных факторов (болезнь, страх, усталость)',
                    'При стабильных отклонениях - формальная оценка'
                ];
            } else {
                interpretation = 'Нормальный (normal)';
                color = '#22C55E';
                details = 'Развитие соответствует возрастным нормативам Denver II.';
                actions = [
                    'Плановое наблюдение педиатра',
                    'Рекомендации по стимулирующей среде'
                ];
            }
            return {
                value: `Задержек: ${delays} · caution: ${cautions}`,
                unit: `возраст ${age} мес`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Denver II - скрининг, не диагностический инструмент',
                    'Недоношенным до 2 лет корректировать возраст (хронологический − недели недоношенности)',
                    'Транзиторные факторы (болезнь, страх, усталость, голод) снижают результаты - повтор через 1-2 нед',
                    'Чувствительность Denver II ограничена (~70 %) - альтернативы: ASQ-3 (Squires 2009), Bayley-III/4'
                ],
                related: [
                    {
                        id: 'mchat',
                        title: 'M-CHAT-R (аутизм)'
                    },
                    {
                        id: 'vanderbilt',
                        title: 'Vanderbilt ADHD'
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
    reference: "Frankenburg WK, Dodds J. Denver Developmental Screening Test II. J Pediatr 1992;89:91-97.",
    countries: "США · международный",
    presets: [
      {
        label: "12 мес, всё в норме",
        values: {
          ageMonths: 12,
          personalSocial: "0",
          fineMotor: "0",
          language: "0",
          grossMotor: "0"
        }
      },
      {
        label: "18 мес, речь отстаёт",
        values: {
          ageMonths: 18,
          personalSocial: "0",
          fineMotor: "0",
          language: "2",
          grossMotor: "0"
        }
      }
    ],
    info: "### Для чего используется\n**Denver II (Frankenburg 1992)** - скрининговый тест психомоторного развития у детей **от 0 до 6 лет**. Оценивает 4 домена:\n\n1. **Personal-social** (личностно-социальная)\n2. **Fine motor-adaptive** (тонкая моторика)\n3. **Language** (речь)\n4. **Gross motor** (крупная моторика)\n\n### Критерии (125 заданий)\nДля каждого задания определяется возрастной диапазон, когда его выполняют 25, 50, 75 и 90 % детей.\n\n- **Pass** - ребёнок выполняет задание\n- **Fail (delay)** - ребёнок не выполняет то, что делают 90 % сверстников\n- **Caution** - ребёнок не выполняет то, что делают 75-90 %\n\n### Интерпретация\n| Результат | Критерий |\n|---|---|\n| Normal | Нет delays, ≤ 1 caution |\n| Suspect | 1 delay или ≥ 2 caution |\n| Abnormal | ≥ 2 delays |\n| Untestable | ≥ 1 refusal в критической зоне |\n\n### Тактика\n| Результат | Действие |\n|---|---|\n| Normal | Плановое наблюдение |\n| Suspect / Untestable | Повтор через 1-2 нед |\n| Abnormal | Углублённая оценка: Bayley-III/4, невролог |\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **ASQ-3** (Squires 2009) | Родительский опросник, чувствительнее |\n| **Bayley-III/4** | Золотой стандарт, но требует специалиста и 1-1.5 ч |\n| **M-CHAT-R** | Специфично для аутизма 16-30 мес |\n| **CAT/CLAMS** | Когнитивный и языковой |\n\n### Ограничения\n- Чувствительность ~70 %, специфичность ~80 % - низкая для лёгких нарушений\n- Требует обучения для правильного проведения\n- Не заменяет диагностическую оценку\n- У недоношенных - корригированный возраст до 2 лет"
  };

export default runner;
