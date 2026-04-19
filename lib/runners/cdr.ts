// @ts-nocheck
/**
 * Runner: cdr
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
        id: "memory",
        label: "Память",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет потери памяти или лёгкая непостоянная"
          },
          {
            value: 0.5,
            label: "0.5 — мягкая постоянная забывчивость, частичное припоминание"
          },
          {
            value: 1,
            label: "1 — умеренная потеря, особенно на недавние события"
          },
          {
            value: 2,
            label: "2 — тяжёлая, только хорошо заученный материал"
          },
          {
            value: 3,
            label: "3 — тяжёлая, сохранены лишь фрагменты"
          }
        ]
      },
      {
        id: "orientation",
        label: "Ориентация",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — полностью ориентирован"
          },
          {
            value: 0.5,
            label: "0.5 — полностью, кроме лёгких трудностей во времени"
          },
          {
            value: 1,
            label: "1 — дезориентирован во времени, часто — в месте"
          },
          {
            value: 2,
            label: "2 — обычно дезориентирован во времени, часто — в месте"
          },
          {
            value: 3,
            label: "3 — ориентирован только в личности"
          }
        ]
      },
      {
        id: "judgment",
        label: "Суждения и решение проблем",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — решает повседневные проблемы хорошо"
          },
          {
            value: 0.5,
            label: "0.5 — незначительные нарушения"
          },
          {
            value: 1,
            label: "1 — умеренные; социальные суждения сохранны"
          },
          {
            value: 2,
            label: "2 — серьёзные нарушения; социальные суждения нарушены"
          },
          {
            value: 3,
            label: "3 — неспособен выносить суждения"
          }
        ]
      },
      {
        id: "community",
        label: "Дела вне дома",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — независимая функция"
          },
          {
            value: 0.5,
            label: "0.5 — лёгкие затруднения"
          },
          {
            value: 1,
            label: "1 — неспособен функционировать независимо, но выглядит нормально при осмотре"
          },
          {
            value: 2,
            label: "2 — нет видимости независимой функции вне дома"
          },
          {
            value: 3,
            label: "3 — слишком болен, чтобы выходить"
          }
        ]
      },
      {
        id: "home",
        label: "Дом и хобби",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — сохранены"
          },
          {
            value: 0.5,
            label: "0.5 — лёгкое снижение"
          },
          {
            value: 1,
            label: "1 — умеренное снижение; сложные хобби утрачены"
          },
          {
            value: 2,
            label: "2 — только простые задачи; узкие интересы"
          },
          {
            value: 3,
            label: "3 — нет значимой активности"
          }
        ]
      },
      {
        id: "care",
        label: "Самообслуживание",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — полностью способен"
          },
          {
            value: 0.5,
            label: "0.5 — полностью способен"
          },
          {
            value: 1,
            label: "1 — требует напоминаний"
          },
          {
            value: 2,
            label: "2 — требует помощи в одевании, гигиене"
          },
          {
            value: 3,
            label: "3 — требует постоянной помощи; часто недержание"
          }
        ]
      }
    ],
    compute: (v)=>{
            const M = Number(v.memory);
            const O = Number(v.orientation);
            const J = Number(v.judgment);
            const C = Number(v.community);
            const H = Number(v.home);
            const P = Number(v.care);
            const secondary = [
                O,
                J,
                C,
                H,
                P
            ];
            // Morris 1993 algorithm — memory is primary category; secondary = other 5.
            // Rule set (simplified common implementation):
            // 1) CDR = M if ≥3 secondary = M
            // 2) else if ≥3 secondary on one side of M, CDR = that side (nearest to M)
            // 3) Tie-break toward M
            // 4) Special cases for M = 0 / 0.5
            const levels = [
                0,
                0.5,
                1,
                2,
                3
            ];
            let global = M;
            const countEq = secondary.filter((s)=>s === M).length;
            if (countEq >= 3) {
                global = M;
            } else {
                const above = secondary.filter((s)=>s > M).length;
                const below = secondary.filter((s)=>s < M).length;
                if (above >= 3) {
                    // move up one step
                    const idx = levels.indexOf(M);
                    global = levels[Math.min(idx + 1, levels.length - 1)];
                } else if (below >= 3) {
                    const idx = levels.indexOf(M);
                    global = levels[Math.max(idx - 1, 0)];
                } else {
                    global = M;
                }
            }
            // Special case: M = 0 — CDR = 0 unless ≥2 secondary ≥0.5 → CDR = 0.5
            if (M === 0) {
                const impaired = secondary.filter((s)=>s >= 0.5).length;
                global = impaired >= 2 ? 0.5 : 0;
            }
            // M = 0.5: CDR ≥0.5; if 3+ secondary ≥1 → CDR = 1
            if (M === 0.5) {
                const ge1 = secondary.filter((s)=>s >= 1).length;
                global = ge1 >= 3 ? 1 : 0.5;
            }
            const sumBoxes = M + O + J + C + H + P;
            const labels = {
                '0': 'Норма (CDR 0)',
                '0.5': 'Сомнительная деменция / MCI (CDR 0.5)',
                '1': 'Лёгкая деменция (CDR 1)',
                '2': 'Умеренная деменция (CDR 2)',
                '3': 'Тяжёлая деменция (CDR 3)'
            };
            const colors = {
                '0': '#22C55E',
                '0.5': '#F59E0B',
                '1': '#EF4444',
                '2': '#DC2626',
                '3': '#991B1B'
            };
            let details = '', actions = [];
            if (global === 0) {
                details = 'Когнитивная функция сохранена. При жалобах — повторное обследование через 6–12 мес.';
                actions = [
                    'Мониторинг при жалобах',
                    'Модификация факторов риска (АГ, СД, физическая активность)'
                ];
            } else if (global === 0.5) {
                details = 'MCI или очень лёгкая деменция. Высокий риск прогрессирования (~10–15 %/год).';
                actions = [
                    'Поиск обратимых причин (B12, ТТГ, депрессия, лекарственные)',
                    'МРТ головного мозга',
                    'Повтор CDR/MoCA через 6 мес',
                    'Планирование (финансы, юридически)'
                ];
            } else if (global === 1) {
                details = 'Лёгкая деменция. Нарушена инструментальная активность; базовый уход сохранён.';
                actions = [
                    'Ингибиторы AChE (донепезил, ривастигмин, галантамин)',
                    'Когнитивная стимуляция, поддержка семьи',
                    'Оценка безопасности (вождение, лекарства, финансы)'
                ];
            } else if (global === 2) {
                details = 'Умеренная деменция. Требуется помощь в основных ADL.';
                actions = [
                    'Добавить мемантин (умеренная-тяжёлая AD)',
                    'Оценка поведенческих симптомов (NPI)',
                    'Опекунская поддержка, адаптация дома',
                    'Планирование ухода'
                ];
            } else {
                details = 'Тяжёлая деменция. Полная зависимость в самообслуживании.';
                actions = [
                    'Паллиативный подход, комфорт',
                    'Профилактика осложнений (пролежни, аспирация, инфекции)',
                    'Поддержка опекунов (Zarit Burden)',
                    'Обсудить цели помощи, DNR, хоспис'
                ];
            }
            return {
                value: String(global),
                unit: `CDR (SOB ${sumBoxes.toFixed(1)})`,
                interpretation: labels[String(global)],
                color: colors[String(global)],
                details,
                actions,
                caveats: [
                    'Требуется структурированное интервью с информантом (CDR Worksheet)',
                    'Morris 1993 алгоритм для global — используйте NACC web-калькулятор при спорных случаях',
                    'Sum of Boxes (SOB, 0–18) чувствительнее для продольных изменений',
                    'Не заменяет MMSE/MoCA — оценивает функцию, не когнитивный дефицит'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 0.5,
                            label: '0',
                            color: '#22C55E'
                        },
                        {
                            min: 0.5,
                            max: 1,
                            label: '0.5',
                            color: '#F59E0B'
                        },
                        {
                            min: 1,
                            max: 2,
                            label: '1',
                            color: '#EF4444'
                        },
                        {
                            min: 2,
                            max: 3,
                            label: '2',
                            color: '#DC2626'
                        },
                        {
                            min: 3,
                            max: 3.1,
                            label: '3',
                            color: '#991B1B'
                        }
                    ],
                    current: global,
                    unit: 'CDR'
                },
                related: [
                    {
                        id: 'mmse',
                        title: 'MMSE'
                    },
                    {
                        id: 'moca',
                        title: 'MoCA'
                    },
                    {
                        id: 'npi',
                        title: 'NPI'
                    }
                ],
                relatedCourses: [
                    {
                        id: '201.3',
                        title: 'Нейрофизиология'
                    }
                ]
            };
        },
    reference: "Hughes CP, Berg L, Danziger WL, Coben LA, Martin RL. A new clinical scale for the staging of dementia. Br J Psychiatry 1982;140:566–572. Morris JC. The Clinical Dementia Rating (CDR): current version and scoring rules. Neurology 1993;43:2412–2414.",
    info: "### Для чего используется\n**CDR (Clinical Dementia Rating, Hughes 1982 / Morris 1993)** — глобальная оценка **тяжести деменции** на основе интервью с пациентом и информантом. 6 доменов × 5 уровней → global CDR.\n\n### Домены\nПамять (первичная) · Ориентация · Суждения / решение проблем · Дела вне дома · Дом и хобби · Самообслуживание\n\n### Уровни в каждом домене\n0 (нет) · 0.5 (сомнительно) · 1 (лёгкая) · 2 (умеренная) · 3 (тяжёлая)\n\n### Global CDR (алгоритм Morris 1993)\nПамять — первичная категория. Глобальный рейтинг рассчитывается с учётом совпадений/отклонений остальных 5 вторичных доменов. Для спорных случаев — [NACC calculator](https://www.alz.washington.edu/cdrnacc.html).\n\n### Sum of Boxes (SOB)\nСумма всех 6 доменов (0–18). Используется для продольного мониторинга — более чувствительна к изменениям, чем global CDR.\n\n### Интерпретация\n| CDR | Стадия |\n|---|---|\n| 0 | Норма |\n| 0.5 | MCI / сомнительная деменция |\n| 1 | Лёгкая деменция |\n| 2 | Умеренная деменция |\n| 3 | Тяжёлая деменция |\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **FAST (Reisberg 1988)** | 7 стадий функционального ухудшения; полезна в терминальной стадии |\n| **GDS (Reisberg 1982)** | Global Deterioration Scale, 1–7; оценка когнитивного снижения |\n\n### Ограничения\n- Требует обученного клинициста (~30–60 мин на интервью)\n- Плохо различает MCI и самые ранние стадии\n- Не учитывает нейропсихиатрические симптомы (NPI дополняет)\n\n### Тактика\n- CDR 0.5: поиск обратимых причин, МРТ, повтор через 6 мес\n- CDR 1: ингибиторы AChE, когнитивная стимуляция\n- CDR 2: мемантин, NPI, опекунская поддержка\n- CDR 3: паллиатив, DNR, хоспис\n\n### Источник\nMorris JC. **The Clinical Dementia Rating (CDR): current version and scoring rules.** *Neurology* 1993;43:2412–2414."
  };

export default runner;
