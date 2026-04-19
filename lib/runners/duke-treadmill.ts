// @ts-nocheck
/**
 * Runner: duke-treadmill
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
        id: "time",
        label: "Время упражнения (Bruce protocol)",
        type: "number",
        unit: "мин",
        min: 0,
        max: 25,
        step: 0.1,
        quickValues: [
          3,
          6,
          9,
          12,
          15
        ]
      },
      {
        id: "st",
        label: "Максимальная депрессия ST",
        type: "number",
        unit: "мм",
        min: 0,
        max: 10,
        step: 0.1,
        quickValues: [
          0,
          0.5,
          1,
          2,
          3
        ]
      },
      {
        id: "angina",
        label: "Стенокардия при нагрузке",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет стенокардии"
          },
          {
            value: 1,
            label: "1 — стенокардия, не лимитирующая"
          },
          {
            value: 2,
            label: "2 — стенокардия, лимитирующая тест"
          }
        ]
      }
    ],
    compute: (v)=>{
            const time = Number(v.time);
            const st = Number(v.st);
            const angina = Number(v.angina);
            const dts = time - 5 * st - 4 * angina;
            let interpretation = '', color = '', details = '', actions = [];
            if (dts >= 5) {
                interpretation = 'Низкий риск';
                color = '#22C55E';
                details = 'Ежегодная сердечно-сосудистая смертность < 1 %. 5-летняя выживаемость 97 %. Рутинная коронарография не показана.';
                actions = [
                    'ОМТ (АСК, статин, β-блок при необходимости)',
                    'Контроль ФР (АД, LDL, HbA1c)',
                    'Повторная оценка при изменении симптомов'
                ];
            } else if (dts >= -10) {
                interpretation = 'Промежуточный риск';
                color = '#F59E0B';
                details = 'Ежегодная смертность 1–3 %. 5-летняя выживаемость 90 %. Показано дополнительное неинвазивное тестирование (стресс-визуализация) или коронарная КТ-ангиография.';
                actions = [
                    'Стресс-ЭхоКГ / ОФЭКТ / МРТ перфузии',
                    'Альтернатива — CCTA',
                    'ОМТ, оптимизация ФР'
                ];
            } else {
                interpretation = 'Высокий риск';
                color = '#EF4444';
                details = 'Ежегодная смертность ≥ 5 %. 5-летняя выживаемость 65 %. Показана коронарография. Рассмотреть реваскуляризацию (ЧКВ / АКШ).';
                actions = [
                    'Инвазивная коронарография',
                    'Реваскуляризация при значимых стенозах',
                    'Heart Team при многососудистой / ствольной патологии',
                    'Агрессивная ОМТ (high-intensity статин, ДАТТ при ЧКВ)'
                ];
            }
            return {
                value: dts.toFixed(1),
                interpretation,
                color,
                details,
                actions,
                scale: {
                    segments: [
                        {
                            min: -25,
                            max: -11,
                            label: 'Высокий',
                            color: '#EF4444'
                        },
                        {
                            min: -10,
                            max: 4,
                            label: 'Промежут.',
                            color: '#F59E0B'
                        },
                        {
                            min: 5,
                            max: 25,
                            label: 'Низкий',
                            color: '#22C55E'
                        }
                    ],
                    current: Number(dts.toFixed(1)),
                    unit: 'баллов'
                },
                caveats: [
                    'Валидация — Bruce protocol; для других протоколов требуется перевод в Bruce-эквивалент.',
                    'Не применим при блокаде ЛНПГ, WPW, ритме с желудочковой стимуляцией — ST-анализ невозможен.',
                    'У женщин и пожилых диагностическая точность ниже — предпочтительна стресс-визуализация.',
                    'Не заменяет клинической оценки (CCS, сопутствующие заболевания).'
                ],
                related: [
                    {
                        id: 'ccs',
                        title: 'CCS'
                    },
                    {
                        id: 'diamond-forrester',
                        title: 'PTP ИБС'
                    },
                    {
                        id: 'heart',
                        title: 'HEART'
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
    reference: "Mark DB, Hlatky MA, Harrell FE Jr, Lee KL, Califf RM, Pryor DB. Exercise treadmill score for predicting prognosis in coronary artery disease. Ann Intern Med 1987;106:793–800. Mark DB et al. Prognostic value of a treadmill exercise score in outpatients with suspected coronary artery disease. N Engl J Med 1991;325:849–853.",
    countries: "США · международный",
    presets: [
      {
        label: "12 мин, ST 0, ангины нет",
        values: {
          time: 12,
          st: 0,
          angina: 0
        }
      },
      {
        label: "6 мин, ST 2 мм, ангина лимит.",
        values: {
          time: 6,
          st: 2,
          angina: 2
        }
      },
      {
        label: "3 мин, ST 3 мм, ангина",
        values: {
          time: 3,
          st: 3,
          angina: 2
        }
      }
    ],
    info: "### Для чего используется\n**Duke Treadmill Score (DTS)** — прогностическая шкала по результатам **нагрузочной ЭКГ-пробы (Bruce protocol)**. Разработана Mark et al. в Duke University.\n\n### Формула\n`DTS = время (мин) − (5 × ST-депрессия мм) − (4 × индекс стенокардии)`\n\n**Индекс стенокардии:**\n- 0 — нет стенокардии\n- 1 — стенокардия без прекращения теста\n- 2 — стенокардия, вынудившая прекратить тест\n\n**Диапазон:** от −25 до +15.\n\n### Интерпретация\n| DTS | Риск | Ежегодная смертность | 5-летняя выживаемость |\n|---|---|---|---|\n| ≥ +5 | Низкий | < 1 % | 97 % |\n| −10 … +4 | Промежуточный | 1–3 % | 90 % |\n| ≤ −11 | Высокий | ≥ 5 % | 65 % |\n\n### Тактика\n| Риск | Действия |\n|---|---|\n| Низкий | ОМТ, контроль ФР, повторная оценка при изменении симптомов |\n| Промежуточный | Стресс-визуализация / CCTA |\n| Высокий | **Коронарография, реваскуляризация** |\n\n### Ограничения\n- Только Bruce protocol (или эквивалент).\n- Не применим при БЛНПГ, WPW, ритме ЭКС.\n- У женщин чувствительность ST-анализа ниже.\n- Не учитывает ФВ ЛЖ — при сниженной ФВ лучше использовать стресс-визуализацию.\n\n### Альтернативы\n- **Стресс-ЭхоКГ / ОФЭКТ / МРТ перфузии** — при невозможности интерпретации ЭКГ.\n- **CCTA** — при низкой–промежуточной PTP (ESC 2019).\n\n### Источник\nMark DB et al. **Prognostic value of a treadmill exercise score in outpatients with suspected coronary artery disease.** *N Engl J Med* 1991;325:849–853. ACC/AHA 2002 Exercise Testing Guidelines."
  };

export default runner;
