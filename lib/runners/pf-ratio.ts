/**
 * Runner: pf-ratio
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
        id: "pao2",
        hint: 'PaO₂. Норма: 80-100 мм рт.ст.',
        label: "PaO₂",
        type: "number",
        unit: "мм рт.ст.",
        min: 20,
        max: 700,
        step: 0.1,
        quickValues: [
          60,
          80,
          100,
          150,
          250
        ]
      },
      {
        id: "fio2",
        hint: 'FiO₂ = доля O₂ во вдыхаемом воздухе (0.21 = атмосферный)',
        label: "FiO₂",
        type: "number",
        unit: "%",
        min: 21,
        max: 100,
        step: 1,
        quickValues: [
          21,
          30,
          40,
          60,
          80,
          100
        ]
      }
    ],
    compute: (v)=>{
            const pf = Number(v.pao2) / (Number(v.fio2) / 100);
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            if (pf > 300) {
                interpretation = 'Норма';
                color = '#22C55E';
                details = 'Газообмен не нарушен. Не исключает ранние стадии ОРДС - оценивайте динамически при клиническом подозрении.';
                actions = [
                    'Продолжить стандартную оксигенотерапию',
                    'При ухудшении - повторный ABG + рентген грудной клетки'
                ];
            } else if (pf > 200) {
                interpretation = 'Лёгкий ARDS (Berlin)';
                color = '#F59E0B';
                details = 'Лёгкий ОРДС при соблюдении критериев Берлина (острое начало < 1 нед, билатеральные инфильтраты, не объяснённые перегрузкой). Ранняя протективная вентиляция снижает смертность.';
                actions = [
                    'Low-Vt 4-6 мл/кг IBW, plateau ≤ 30 см H₂O',
                    'PEEP подбор по LoPEEP/HiPEEP таблицам (ARDSnet)',
                    'Рассмотреть HFNC/NIV при сохранном сознании и отсутствии шока'
                ];
            } else if (pf > 100) {
                interpretation = 'Умеренный ARDS (Berlin)';
                color = '#EF4444';
                details = 'Умеренный ОРДС - смертность ~32%. При P/F < 150 - показание к прон-позиции ≥ 12 ч/сут (PROSEVA).';
                actions = [
                    'Прон-позиция ≥ 12-16 ч при P/F < 150',
                    'Нейромышечная блокада 48 ч при выраженной десинхронизации',
                    'Рассмотреть направление в ЭКМО-центр'
                ];
            } else {
                interpretation = 'Тяжёлый ARDS (Berlin)';
                color = '#991B1B';
                details = 'Тяжёлый ОРДС - смертность ~45%. Рефрактерная гипоксемия - показание к VV-ECMO (EOLIA/ECMO to Rescue).';
                actions = [
                    'Прон-позиция, NMB, консервативная инфузионная стратегия (FACTT)',
                    'Оценка на VV-ECMO (Murray ≥ 3, P/F < 80 на FiO₂ 100%)',
                    'Поиск и лечение причины (сепсис, аспирация, панкреатит)'
                ];
            }
            return {
                value: pf.toFixed(0),
                unit: 'мм рт.ст.',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Требует PEEP ≥ 5 для Berlin-классификации',
                    'Зависит от FiO₂ - при очень высоком FiO₂ связь нелинейна',
                    'При недоступности ABG используйте SpO₂/FiO₂ (SF 315 ≈ P/F 300)',
                    'ХСН / перегрузка объёмом должны быть исключены (NT-proBNP, ЭхоКГ)'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 100,
                            label: 'Тяжёлый',
                            color: '#991B1B'
                        },
                        {
                            min: 100,
                            max: 200,
                            label: 'Умер.',
                            color: '#EF4444'
                        },
                        {
                            min: 200,
                            max: 300,
                            label: 'Лёгкий',
                            color: '#F59E0B'
                        },
                        {
                            min: 300,
                            max: 500,
                            label: 'Норма',
                            color: '#22C55E'
                        }
                    ],
                    current: Number(pf.toFixed(0)),
                    unit: 'мм рт.ст.'
                },
                relatedCourses: [
                    {
                        id: '201.2',
                        title: "Дыхательная физиология"
                    },
                    {
                        id: '301.2',
                        title: "Пульмонология"
                    }
                ],
                related: [
                    {
                        id: 'aa-gradient',
                        title: 'A-a градиент'
                    },
                    {
                        id: 'nt-probnp',
                        title: 'NT-proBNP'
                    }
                ]
            };
        },
    reference: "Berlin 2012: P/F 200-300 лёгкий, 100-200 умеренный, ≤100 тяжёлый ARDS (при PEEP ≥5).",
    info: "### Для чего используется\n**P/F ratio (PaO₂/FiO₂)** - индекс оксигенации, отражающий эффективность газообмена в лёгких. Основной критерий **диагностики и классификации тяжести ОРДС** (Berlin 2012, Global 2023).\n\n### Формула\n`P/F = PaO₂ (мм рт.ст.) / FiO₂ (десятичная дробь)`\n\nНапример: PaO₂ 75 мм рт.ст., FiO₂ 50 % → 75/0,5 = 150 мм рт.ст.\n\n### Норма и интерпретация\n| P/F | Тяжесть |\n|---|---|\n| > 400 | Норма |\n| 300-400 | Лёгкие отклонения |\n| 200-300 | **Лёгкий ОРДС** (PEEP ≥ 5) |\n| 100-200 | **Умеренный ОРДС** |\n| ≤ 100 | **Тяжёлый ОРДС** |\n\n### Berlin criteria (ОРДС)\nВсе 4 критерия должны выполняться:\n| Критерий | Требование |\n|---|---|\n| 1. Время | Острое начало (< 1 недели) |\n| 2. Визуализация | Двусторонние инфильтраты на Rg / КТ |\n| 3. Источник | Не связан с перегрузкой объёмом / ХСН (ЭхоКГ / NT-proBNP) |\n| 4. Оксигенация | P/F ≤ 300 при PEEP ≥ 5 см H₂O |\n\n### Global criteria (2023, обновление)\nВключает пациентов на неинвазивной вентиляции:\n- HFNC с потоком ≥ 30 л/мин\n- NIV с EPAP ≥ 5\n\nИспользует **SpO₂/FiO₂** как альтернативу P/F для мест, где ABG недоступен.\n\n### SpO₂/FiO₂ (SF ratio) как альтернатива\n| SF | Соответствует P/F |\n|---|---|\n| 235 | ~ 200 |\n| 315 | ~ 300 |\n\n### Вентиляционная стратегия при ОРДС\n| Подход | Детали |\n|---|---|\n| **Low tidal volume** | 4-6 мл/кг IBW, целевое плато ≤ 30 см H₂O |\n| **PEEP** | Оптимальный (ARDSnet LoPEEP/HiPEEP tables) |\n| **Prone position** | При P/F < 150 - ≥ 12 ч/сут (PROSEVA) |\n| **NMB** (нейромышечная блокада) | При тяжёлом ОРДС (< 150); 48 ч |\n| **ECMO VV** | Refractory ОРДС (EOLIA) |\n\n### Ограничения\n- Зависит от FiO₂ (не линейна при очень высоком FiO₂)\n- PEEP влияет на P/F - поэтому Berlin требует PEEP ≥ 5 для стандартизации\n- В неинвазивной вентиляции FiO₂ оценочный - используйте SF ratio"
  };

export default runner;
