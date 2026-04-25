// @ts-nocheck
/**
 * Runner: abi
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
        id: "ankle",
        hint: 'Систолическое АД, мм рт.ст.',
        label: "Лодыжечное САД (больший из DP/PT)",
        type: "number",
        unit: "мм рт.ст.",
        min: 0,
        max: 300,
        step: 1,
        quickValues: [
          60,
          80,
          100,
          120,
          140,
          160
        ]
      },
      {
        id: "brachial",
        hint: 'Систолическое АД, мм рт.ст.',
        label: "Плечевое САД (большее из L/R)",
        type: "number",
        unit: "мм рт.ст.",
        min: 0,
        max: 300,
        step: 1,
        quickValues: [
          100,
          120,
          130,
          140,
          150,
          160
        ]
      }
    ],
    compute: (v)=>{
            const ankle = Number(v.ankle);
            const brachial = Number(v.brachial);
            const abi = brachial > 0 ? ankle / brachial : 0;
            let interpretation = '', color = '', details = '', actions = [];
            if (abi > 1.4) {
                interpretation = 'Некомпрессируемые артерии';
                color = '#991B1B';
                details = 'ABI > 1.4 - медиасклероз (Менкеберг) - часто при СД, ХБП, пожилом возрасте. Невозможно исключить или оценить ПАД по ABI. Используйте **TBI (пальце-плечевой индекс)**; нормальный TBI > 0.7.';
                actions = [
                    'Рассчитать TBI (пальце-плечевой индекс) - < 0.7 = ПАД',
                    'Дуплексное сканирование артерий',
                    'Оценить кальциноз на рентгене / КТ',
                    'Агрессивная модификация ФР (СД, ХБП, ССС)'
                ];
            } else if (abi >= 1.0) {
                interpretation = 'Норма';
                color = '#22C55E';
                details = 'ABI в пределах нормы (1.0-1.4). Обструктивное ПАД маловероятно.';
                actions = [
                    'Рутинный ССС-скрининг по возрасту',
                    'При симптомах с нормальным ABI в покое - тест с нагрузкой (post-exercise ABI)'
                ];
            } else if (abi >= 0.9) {
                interpretation = 'Пограничный';
                color = '#84CC16';
                details = 'ABI 0.9-1.0 - пограничная зона. При симптомах выполните нагрузочный тест (падение ABI после нагрузки > 20 % = ПАД).';
                actions = [
                    'Post-exercise ABI (снижение > 20 % = ПАД)',
                    'Модификация ФР (статин, АСК при повышенном риске)',
                    'Повторная оценка через 1 год'
                ];
            } else if (abi >= 0.7) {
                interpretation = 'Лёгкое ПАД';
                color = '#F59E0B';
                details = 'ABI 0.7-0.9 - лёгкое ПАД. Обычно симптоматика - перемежающаяся хромота (Rutherford 1-3).';
                actions = [
                    'Контролируемая программа ходьбы',
                    'АСК 75-100 мг + статин high-intensity',
                    'Цилостазол 100 мг × 2 при клаудикации',
                    'Контроль АД / HbA1c / курения'
                ];
            } else if (abi >= 0.4) {
                interpretation = 'Умеренное ПАД';
                color = '#EF4444';
                details = 'ABI 0.4-0.7 - умеренное ПАД. Часто - тяжёлая клаудикация или ранняя CLTI. Направление к сосудистому хирургу.';
                actions = [
                    'Направление к сосудистому хирургу',
                    'Дуплексное сканирование',
                    'Агрессивная ОМТ (COMPASS: АСК + ривароксабан 2.5 мг × 2)',
                    'Рассмотреть реваскуляризацию при инвалидизации'
                ];
            } else {
                interpretation = 'Тяжёлое ПАД / CLTI';
                color = '#991B1B';
                details = 'ABI < 0.4 - тяжёлое ПАД, высокий риск критической ишемии (CLTI). Требуется срочная сосудистая оценка.';
                actions = [
                    'Срочное направление в сосудистый центр',
                    'Оценить WIfI (при язвах / ишемии)',
                    'Ангиография (КТ / МРТ / инвазивная)',
                    'Реваскуляризация (эндоваскулярная / открытая - BEST-CLI)',
                    'АБ при инфекции, обезболивание'
                ];
            }
            return {
                value: abi.toFixed(2),
                interpretation,
                color,
                details,
                actions,
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 0.4,
                            label: 'Тяжёлое',
                            color: '#991B1B'
                        },
                        {
                            min: 0.4,
                            max: 0.7,
                            label: 'Умеренное',
                            color: '#EF4444'
                        },
                        {
                            min: 0.7,
                            max: 0.9,
                            label: 'Лёгкое',
                            color: '#F59E0B'
                        },
                        {
                            min: 0.9,
                            max: 1.0,
                            label: 'Погранич.',
                            color: '#84CC16'
                        },
                        {
                            min: 1.0,
                            max: 1.4,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 1.4,
                            max: 2.0,
                            label: 'Некомпр.',
                            color: '#991B1B'
                        }
                    ],
                    current: Number(abi.toFixed(2)),
                    unit: ''
                },
                caveats: [
                    'Измерять после 5-10 мин отдыха лёжа. Использовать больший из DP/PT и больший из L/R плечевого.',
                    'При ABI > 1.4 (кальциноз) - переходите на TBI (пальце-плечевой) или дуплекс.',
                    'Нормальный ABI в покое не исключает ПАД - при подозрении сделайте post-exercise ABI.',
                    'WIfI (SVS 2014) интегрирует Wound (язва), Ischemia (ABI/TBI/TcPO2), foot Infection - используется для прогноза при CLTI.'
                ],
                related: [
                    {
                        id: 'rutherford',
                        title: 'Rutherford / Fontaine'
                    },
                    {
                        id: 'stanford',
                        title: 'Stanford / DeBakey'
                    },
                    {
                        id: 'score2',
                        title: 'SCORE2'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    }
                ]
            };
        },
    reference: "Aboyans V, Criqui MH, Abraham P, et al. Measurement and interpretation of the Ankle-Brachial Index: a scientific statement from the AHA. Circulation 2012;126:2890-2909. TASC II 2007; ESC 2017 PAD Guidelines.",
    countries: "Международный (AHA · ESC · SVS)",
    presets: [
      {
        label: "Норма",
        values: {
          ankle: 140,
          brachial: 130
        }
      },
      {
        label: "Лёгкое ПАД",
        values: {
          ankle: 100,
          brachial: 130
        }
      },
      {
        label: "CLTI",
        values: {
          ankle: 40,
          brachial: 140
        }
      },
      {
        label: "Кальциноз (СД)",
        values: {
          ankle: 220,
          brachial: 140
        }
      }
    ],
    info: "### Для чего используется\n**ABI (Ankle-Brachial Index / Лодыжечно-плечевой индекс)** - простой неинвазивный тест для диагностики **периферического артериального заболевания (ПАД)** и стратификации сердечно-сосудистого риска.\n\n### Формула\n`ABI = САД на лодыжке (больший из DP/PT) / САД плечевое (большее из L/R)`\n\n**Техника:** пациент лёжа, 5-10 мин отдыха. Допплер 8-10 МГц на тыльной артерии стопы (DP) и задней большеберцовой (PT). Повторить на обеих ногах.\n\n### Интерпретация\n| ABI | Значение |\n|---|---|\n| > 1.4 | Некомпрессируемые артерии (медиасклероз) |\n| 1.0-1.4 | Норма |\n| 0.9-1.0 | Пограничный |\n| 0.7-0.9 | Лёгкое ПАД |\n| 0.4-0.7 | Умеренное ПАД |\n| < 0.4 | Тяжёлое ПАД / CLTI |\n\n### TBI (Toe-Brachial Index)\nПри ABI > 1.4 используйте **TBI**:\n- TBI = САД большого пальца / плечевое САД\n- Норма > 0.7, ПАД < 0.7\n- Пальцевые артерии редко поражаются медиасклерозом.\n\n### WIfI Classification (SVS 2014)\nДля CLTI интегрирует 3 компонента по 0-3:\n| Компонент | 0 | 3 |\n|---|---|---|\n| **W** (Wound) | Нет язвы | Обширная потеря тканей |\n| **I** (Ischemia) | ABI > 0.8 / TBI > 0.6 | ABI < 0.4 / TBI < 0.3 |\n| **fI** (Infection) | Нет | Системная (sepsis) |\n\nОпределяет 4 стадии с риском ампутации 1 год (от очень низкой до высокой) и пользу реваскуляризации.\n\n### Ограничения\n- Медиасклероз (СД, ХБП) - ABI недостоверен, используйте TBI / дуплекс.\n- Нормальный ABI в покое не исключает ПАД - post-exercise ABI при симптомах.\n- Не оценивает анатомию поражения (→ TASC II, GLASS).\n\n### Тактика\n| ABI | Действия |\n|---|---|\n| > 1.4 | TBI, дуплекс, ФР-модификация |\n| 0.9-1.4 | ССС-скрининг |\n| 0.4-0.9 | ОМТ, программа ходьбы, реваскуляризация при инвалидизации |\n| < 0.4 | Срочная сосудистая оценка, реваскуляризация |"
  };

export default runner;
