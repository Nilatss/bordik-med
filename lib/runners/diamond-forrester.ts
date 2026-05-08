/**
 * Runner: diamond-forrester
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
        id: "age",
        hint: 'Возраст в годах',
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 30,
        max: 100,
        step: 1,
        quickValues: [
          35,
          45,
          55,
          65,
          75
        ]
      },
      {
        id: "sex",
        label: "Пол",
        type: "select",
        options: [
          {
            value: "m",
            label: "Мужской"
          },
          {
            value: "f",
            label: "Женский"
          }
        ]
      },
      {
        id: "symptom",
        label: "Характер симптомов",
        type: "select",
        options: [
          {
            value: "typical",
            label: "Типичная стенокардия (3 из 3 признаков)"
          },
          {
            value: "atypical",
            label: "Атипичная стенокардия (2 из 3)"
          },
          {
            value: "nonanginal",
            label: "Некоронарная боль (0-1 из 3)"
          },
          {
            value: "dyspnoea",
            label: "Одышка"
          }
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const sex = String(v.sex);
            const sym = String(v.symptom);
            // ESC 2019 pretest probability table (CAD Consortium, Juarez-Orozco 2019)
            // Rows: age bands 30-39, 40-49, 50-59, 60-69, ≥70
            // Values: % pretest probability
            const table: Record<string, Record<string, number[]>> = {
                typical: {
                    m: [
                        3,
                        22,
                        32,
                        44,
                        52
                    ],
                    f: [
                        5,
                        10,
                        13,
                        16,
                        27
                    ]
                },
                atypical: {
                    m: [
                        4,
                        10,
                        17,
                        26,
                        34
                    ],
                    f: [
                        3,
                        6,
                        6,
                        11,
                        19
                    ]
                },
                nonanginal: {
                    m: [
                        5,
                        14,
                        8,
                        11,
                        22
                    ],
                    f: [
                        1,
                        2,
                        2,
                        3,
                        4
                    ]
                },
                dyspnoea: {
                    m: [
                        0,
                        3,
                        4,
                        7,
                        14
                    ],
                    f: [
                        3,
                        3,
                        6,
                        6,
                        10
                    ]
                }
            };
            let idx;
            if (age < 40) idx = 0;
            else if (age < 50) idx = 1;
            else if (age < 60) idx = 2;
            else if (age < 70) idx = 3;
            else idx = 4;
            const pct = table[sym]?.[sex]?.[idx] ?? 0;
            let interpretation = '', color = '', details = '', actions = [];
            if (pct < 5) {
                interpretation = 'Очень низкая вероятность ИБС';
                color = '#22C55E';
                details = 'Пре-тестовая вероятность обструктивной ИБС < 5 %. Рутинное тестирование не показано - риск ложноположительных результатов превышает пользу. Искать неишемические причины боли.';
                actions = [
                    'Отложить тестирование - искать другие причины (ГЭРБ, костно-мышечная, тревожная)',
                    'Оценить ФР (SCORE2, ASCVD)',
                    'Повторить оценку при изменении симптомов'
                ];
            } else if (pct < 15) {
                interpretation = 'Низкая-промежуточная вероятность';
                color = '#84CC16';
                details = 'Пре-тестовая вероятность 5-15 %. ESC 2019: предпочтительна **коронарная КТ-ангиография (CCTA)** - высокая отрицательная прогностическая ценность (> 99 %).';
                actions = [
                    'Коронарная КТ-ангиография (CCTA) - первая линия',
                    'Альтернатива: стресс-ЭхоКГ / стресс-МРТ при противопоказаниях к йодному КВ',
                    'Коронарный кальций (CAC) score как gatekeeper'
                ];
            } else if (pct < 50) {
                interpretation = 'Промежуточная вероятность';
                color = '#F59E0B';
                details = 'Пре-тестовая вероятность 15-50 %. Показано функциональное или анатомическое тестирование в зависимости от локальной доступности и клинических особенностей.';
                actions = [
                    'Стресс-визуализация (ЭхоКГ / МРТ / ОФЭКТ) или CCTA',
                    'Выбор метода - ESC 2019 Figure 3',
                    'Оптимизировать ОМТ параллельно'
                ];
            } else if (pct < 85) {
                interpretation = 'Промежуточно-высокая вероятность';
                color = '#EF4444';
                details = 'Пре-тестовая вероятность 50-85 %. Предпочтительна функциональная стресс-визуализация - определяет ишемическое бремя и прогноз.';
                actions = [
                    'Стресс-визуализация (ЭхоКГ / МРТ / ОФЭКТ / ПЭТ)',
                    'При подтверждённой значительной ишемии (> 10 % миокарда) - коронарография',
                    'ОМТ: АСК + статин high-intensity + β-блок / АК'
                ];
            } else {
                interpretation = 'Высокая вероятность ИБС';
                color = '#991B1B';
                details = 'Пре-тестовая вероятность > 85 %. Функциональное тестирование имеет низкую добавочную ценность. При тяжёлых симптомах (CCS III-IV) - прямая коронарография.';
                actions = [
                    'Инвазивная коронарография при CCS III-IV или значительной ишемии',
                    'ОМТ как базовая терапия',
                    'Heart Team при сложной анатомии / многососудистом поражении'
                ];
            }
            return {
                value: pct.toString(),
                unit: '%',
                interpretation,
                color,
                details,
                actions,
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 5,
                            label: '< 5 %',
                            color: '#22C55E'
                        },
                        {
                            min: 5,
                            max: 15,
                            label: '5-15 %',
                            color: '#84CC16'
                        },
                        {
                            min: 15,
                            max: 50,
                            label: '15-50 %',
                            color: '#F59E0B'
                        },
                        {
                            min: 50,
                            max: 85,
                            label: '50-85 %',
                            color: '#EF4444'
                        },
                        {
                            min: 85,
                            max: 100,
                            label: '> 85 %',
                            color: '#991B1B'
                        }
                    ],
                    current: pct,
                    unit: '%'
                },
                caveats: [
                    'ESC 2019 снизила оценки по сравнению с исторической Diamond-Forrester 1979 - современные значения ниже благодаря учёту эффекта статинов, контроля АД и кальций-скрининга.',
                    'Не применимо к острым симптомам - используйте HEART / GRACE.',
                    'Модификаторы вероятности (CAC ≥ 400, семейная ИБС, диабет) могут сдвигать оценку на одну категорию.',
                    'У женщин < 60 лет с атипичными симптомами - особая осторожность (INOCA / ANOCA).'
                ],
                related: [
                    {
                        id: 'heart',
                        title: 'HEART (ОКС)'
                    },
                    {
                        id: 'ccs',
                        title: 'CCS'
                    },
                    {
                        id: 'duke-treadmill',
                        title: 'Duke Treadmill'
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
    reference: "Knuuti J, Ballo H, Juarez-Orozco LE et al. The performance of non-invasive tests to rule-in and rule-out significant coronary artery stenoses in patients with stable angina: a meta-analysis focused on post-test disease probability. Eur Heart J 2018;39:3322-3330. ESC 2019 Chronic Coronary Syndromes Guidelines.",
    countries: "ЕС · Международный",
    presets: [
      {
        label: "55 ♂ типичная",
        values: {
          age: 55,
          sex: "m",
          symptom: "typical"
        }
      },
      {
        label: "45 ♀ атипичная",
        values: {
          age: 45,
          sex: "f",
          symptom: "atypical"
        }
      },
      {
        label: "70 ♂ одышка",
        values: {
          age: 70,
          sex: "m",
          symptom: "dyspnoea"
        }
      }
    ],
    info: "### Для чего используется\n**Оценка пре-тестовой вероятности (PTP) обструктивной ИБС** у пациента со стабильными симптомами - ключевой шаг диагностического алгоритма ESC 2019.\n\n### Эволюция моделей\n| Год | Модель | Особенности |\n|---|---|---|\n| 1979 | Diamond-Forrester | Возраст + пол + тип боли |\n| 2011 | CAD Consortium | Добавлены ФР, ниже оценки |\n| 2019 | ESC (Juarez-Orozco) | Учитывает диспноэ, ещё ниже из-за статинов |\n\n### Таблица ESC 2019 (% PTP)\n#### Типичная стенокардия (3/3: загрудинная, провоцируется нагрузкой, купируется нитратами/покоем)\n| Возраст | ♂ | ♀ |\n|---|---|---|\n| 30-39 | 3 | 5 |\n| 40-49 | 22 | 10 |\n| 50-59 | 32 | 13 |\n| 60-69 | 44 | 16 |\n| ≥70 | 52 | 27 |\n\n### Интерпретация\n| PTP | Тактика |\n|---|---|\n| < 5 % | Отложить тестирование |\n| 5-15 % | CCTA первой линии |\n| 15-50 % | Функц. визуализация ИЛИ CCTA |\n| 50-85 % | Функц. визуализация (ишемическое бремя) |\n| > 85 % | Прямая коронарография при CCS III-IV |\n\n### Определения типа боли\n3 признака: (1) загрудинная локализация и характер, (2) провокация физ. нагрузкой / эмоциями, (3) купирование покоем / нитратами за 5 мин.\n- **Типичная** - 3/3\n- **Атипичная** - 2/3\n- **Некоронарная** - 0-1/3\n\n### Модификаторы (сдвиг на категорию)\n- CAC score ≥ 400\n- Первая степень родства с ранней ИБС\n- Диабет, курение, дислипидемия\n- ГЛЖ на ЭКГ\n\n### Ограничения\n- Не для острых симптомов (→ HEART, GRACE).\n- Не учитывает INOCA / ANOCA (коронарная микрососудистая дисфункция).\n- Модель CAD Consortium может переоценивать у очень молодых."
  };

export default runner;
