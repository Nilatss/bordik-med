/**
 * Runner: meld — Model for End-Stage Liver Disease (original 6-40)
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Kamath PS, Wiesner RH, Malinchoc M, et al. A model to
 *               predict survival in patients with end-stage liver disease.
 *               Hepatology. 2001;33(2):464-470.
 *               doi:10.1053/jhep.2001.22172
 *   UPDATE:     UNOS Policy 9 (Allocation of Livers and Liver-Intestines).
 *               OPTN/UNOS — MELD-Na since 2016, MELD 3.0 since July 2023.
 *               https://optn.transplant.hrsa.gov/policies-bylaws/policies/
 *
 * Formula:
 *   MELD = 9.57 × ln(creatinine mg/dL) + 3.78 × ln(bilirubin mg/dL)
 *        + 11.20 × ln(INR) + 6.43
 *
 * Каждое значение clamped к ≥ 1.0 (lower bound).
 * Креатинин max 4.0; >4.0 → 4.0 (или dialysis ≥2x/week → 4.0).
 * Round к целому, диапазон 6-40.
 *
 * 3-month mortality (waitlist data):
 *   ≤9      → 1.9%
 *   10-19   → 6.0%
 *   20-29   → 19.6%
 *   30-39   → 52.6%
 *   ≥40     → 71.3%
 *
 * Variants (НЕ реализованы здесь, отдельные runners):
 *   - MELD-Na — добавляет sodium (UNOS uses since 2016)
 *   - MELD 3.0 — добавляет albumin, female-correction (UNOS since 2023)
 *   - PELD — pediatric version (<12 yr)
 *
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
        id: "bili",
        hint: 'Билирубин общий. Норма: 5-21 мкмоль/л',
        label: "Билирубин",
        type: "number",
        unit: "мкмоль/л",
        min: 1,
        max: 1000,
        step: 0.1,
        quickValues: [
          20,
          40,
          80,
          120,
          200,
          300
        ]
      },
      {
        id: "inr",
        hint: 'МНО. Норма: 0.9-1.2 (без антикоагулянтов)',
        label: "INR",
        type: "number",
        unit: "",
        min: 0.5,
        max: 10,
        step: 0.01,
        quickValues: [
          1,
          1.3,
          1.5,
          1.8,
          2.2,
          2.8
        ]
      },
      {
        id: "creat",
        hint: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л',
        label: "Креатинин",
        type: "number",
        unit: "мкмоль/л",
        min: 10,
        max: 1500,
        step: 1,
        quickValues: [
          80,
          110,
          140,
          180,
          250,
          350
        ]
      },
      {
        id: "dialysis",
        label: "Диализ ≥2 раз/нед за последнюю неделю",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const bili = Math.max(1, Number(v.bili) / 17.1); // → mg/dL
            const inr = Math.max(1, Number(v.inr));
            let scr = Math.max(1, Number(v.creat) / 88.4); // → mg/dL
            if (v.dialysis === true || scr > 4) scr = 4;
            const meld = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(scr) + 6.43;
            const val = Math.round(Math.max(6, Math.min(40, meld)));
            let interpretation = '', color = '#1A1A1A';
            if (val <= 9) {
                interpretation = '3-мес смертность ~2%';
                color = '#22C55E';
            } else if (val <= 19) {
                interpretation = '3-мес смертность ~6%';
                color = '#22C55E';
            } else if (val <= 29) {
                interpretation = '3-мес смертность ~20%';
                color = '#F59E0B';
            } else if (val <= 39) {
                interpretation = '3-мес смертность ~53%';
                color = '#EF4444';
            } else {
                interpretation = '3-мес смертность ~71%';
                color = '#991B1B';
            }
            let details = '';
            let actions = [];
            if (val <= 9) {
                details = 'Низкая 3-месячная смертность (~2%). Компенсированный цирроз. Трансплантация печени не показана - риск операции превышает пользу.';
                actions = [
                    'Амбулаторное наблюдение гепатолога каждые 3-6 мес',
                    'Скрининг ГЦК (УЗИ + АФП каждые 6 мес при циррозе)',
                    'Скрининг варикоза при первичном диагнозе цирроза (ЭГДС)',
                    'Вакцинация: гепатит A и B, пневмококк, грипп'
                ];
            } else if (val <= 19) {
                details = 'Умеренная 3-месячная смертность (~6%). При MELD ≥ 15 трансплантация уже улучшает выживаемость - обсуждение с центром трансплантации.';
                actions = [
                    'MELD ≥ 15 - направление на оценку в центр трансплантации печени',
                    'Оптимизировать терапию асцита (спиронолактон + фуросемид), энцефалопатии (лактулоза, рифаксимин)',
                    'Профилактика СБП при асците с белком < 15 г/л (норфлоксацин/ципрофлоксацин)',
                    'Пересмотреть все препараты на предмет гепатотоксичности'
                ];
            } else if (val <= 29) {
                details = 'Высокая 3-месячная смертность (~20%). Декомпенсированный цирроз, активный листинг на трансплантацию.';
                actions = [
                    'Активная оценка и листинг на трансплантацию',
                    'При тяжёлом алкогольном гепатите MELD ≥ 21 - рассмотреть преднизолон 40 мг/сут (Maddrey ≥ 32)',
                    'Контроль гепаторенального синдрома (креатинин): альбумин + терлипрессин',
                    'ICU-уровень мониторинга при нестабильности'
                ];
            } else {
                details = 'Очень высокая 3-месячная смертность (≥ 50%). Пациент - кандидат высшего приоритета для трансплантации.';
                actions = [
                    'Срочный листинг high-priority на трансплантацию',
                    'ICU, коррекция коагулопатии, энцефалопатии, гемодинамики',
                    'Исключить обратимые причины декомпенсации: инфекция (СБП!), кровотечение, лекарства, алкоголь',
                    'При невозможности трансплантации - обсудить паллиативную тактику'
                ];
            }
            return {
                value: String(val),
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Текущий стандарт UNOS с 2023 - MELD 3.0 (с Na, альбумином, поправкой на пол). Эта версия - оригинальная MELD.',
                    'При острой печёночной недостаточности MELD не валидизирован - используйте King\'s College или Clichy criteria',
                    'Диализ ≥ 2 раз/нед за последнюю неделю автоматически делает креатинин = 4 мг/дл',
                    'Негепатическая гипербилирубинемия (гемолиз, лекарственная) искусственно завышает MELD',
                    'INR варьирует между лабораториями - требует стандартизации'
                ],
                scale: {
                    segments: [
                        {
                            min: 6,
                            max: 10,
                            label: '≤9 Низк.',
                            color: '#22C55E'
                        },
                        {
                            min: 10,
                            max: 20,
                            label: '10-19',
                            color: '#22C55E'
                        },
                        {
                            min: 20,
                            max: 30,
                            label: '20-29',
                            color: '#F59E0B'
                        },
                        {
                            min: 30,
                            max: 40,
                            label: '30-39',
                            color: '#EF4444'
                        },
                        {
                            min: 40,
                            max: 41,
                            label: '≥40',
                            color: '#991B1B'
                        }
                    ],
                    current: val
                },
                relatedCourses: [
                    {
                        id: '301.3',
                        title: "Гастроэнтерология"
                    }
                ],
                related: [
                    {
                        id: 'ckd-epi',
                        title: 'eGFR (для гепаторенального)'
                    },
                    {
                        id: 'maddrey',
                        title: 'Maddrey (алкогольный гепатит)'
                    },
                    {
                        id: 'child-meld',
                        title: 'Child-Pugh'
                    }
                ]
            };
        },
    reference: "MELD = 3.78×ln(билирубин) + 11.2×ln(INR) + 9.57×ln(креатинин) + 6.43. UNOS, OPTN.",
    countries: "США (UNOS) · Международный",
    presets: [
      {
        label: "Компенсированный цирроз",
        values: {
          bili: 20,
          inr: 1.1,
          creat: 80,
          dialysis: false
        }
      },
      {
        label: "Декомпенсированный",
        values: {
          bili: 60,
          inr: 1.8,
          creat: 130,
          dialysis: false
        }
      },
      {
        label: "Показание к трансплантации",
        values: {
          bili: 120,
          inr: 2.2,
          creat: 180,
          dialysis: false
        }
      },
      {
        label: "Тяжёлый алкогольный гепатит",
        values: {
          bili: 250,
          inr: 2.5,
          creat: 200,
          dialysis: false
        }
      }
    ],
    info: "### Для чего используется\n**MELD (Model for End-stage Liver Disease)** - прогностическая модель для оценки **3-месячной смертности** у пациентов с заболеваниями печени. С 2002 - основа **распределения трансплантатов печени** в UNOS (США) и большинстве стран.\n\n### Формула (оригинал 2000)\n`MELD = 3,78 × ln(билирубин mg/dL) + 11,2 × ln(INR) + 9,57 × ln(креатинин mg/dL) + 6,43`\n\nМинимум каждой переменной = 1. Диализ ≥ 2 р/нед → креатинин = 4,0.\n\nИтог: округлить, минимум 6, максимум 40.\n\n### Интерпретация (3-мес смертность)\n| MELD | Смертность |\n|---|---|\n| ≤ 9 | 1,9 % |\n| 10-19 | 6,0 % |\n| 20-29 | 19,6 % |\n| 30-39 | 52,6 % |\n| ≥ 40 | 71,3 % |\n\n### Эволюция - современные версии\n| Версия | Добавленный параметр | Год |\n|---|---|---|\n| MELD (оригинал) | Bili, INR, Cr | 2000 |\n| **MELD-Na** | + натрий | 2016 |\n| **MELD 3.0** | + пол (жен +1,33), альбумин, расширенные лимиты Na | 2023 |\n\n**Текущий стандарт UNOS с 2023 - MELD 3.0**.\n\n### Пороги для листа трансплантации\n| MELD | Тактика |\n|---|---|\n| ≥ 15 | Консультация в транспланте (выживаемость с трансплантацией > без) |\n| < 15 | Трансплантация не повышает 1-летнюю выживаемость |\n| Принцип распределения | Приоритет по MELD («sickest first») |\n\n### MELD-Na формула\n`MELD-Na = MELD + 1,32 × (137 − Na) − [0,033 × MELD × (137 − Na)]`\n\nNa зажат 125-137. Добавление Na улучшает предсказание у пациентов с гипонатриемией (признак тяжёлой портальной гипертензии).\n\n### MELD Exceptions - состояния с дополнительными баллами\n| Состояние | Обоснование exception points |\n|---|---|\n| ГЦК в пределах Milan criteria | Ограниченное время для трансплантации |\n| Гепатопульмональный синдром | Гипоксия не отражается в MELD |\n| Семейная амилоидная полинейропатия | Прогрессирующая нейропатия |\n| Порфирия | Риск фатальных атак |\n| Кистозный фиброз с печёночной патологией | Двойной орган |\n\n### Применение вне трансплантации\n| Ситуация | MELD-порог |\n|---|---|\n| Операция у цирротика - низкий риск | MELD < 10 |\n| Операция у цирротика - умеренный риск | MELD 10-15 |\n| Операция у цирротика - высокий риск | MELD > 15 (рассмотреть отказ или трансплантацию) |\n| Тяжёлый алкогольный гепатит | MELD ≥ 21 - показание к ГКС |\n| Прогноз при циррозе | Совместно с Child-Pugh |\n\n### MELD vs Child-Pugh\n| | MELD | Child-Pugh |\n|---|---|---|\n| Объективность | Только лаб. | Лаб. + клинич. оценка |\n| Асцит/энцефалопатия | Не включены | Включены (субъективно) |\n| Валидация | Многократная, большие когорты | Исторически |\n| Применение | Трансплантация, прогноз 3 мес | Классификация тяжести цирроза |\n\n### Ограничения\n- Не учитывает этиологию\n- Не работает при острой печёночной недостаточности (используйте **King's College criteria**, **Clichy criteria**)\n- Вариация INR между лабораториями\n- Гипербилирубинемия непеченочная (гемолиз, лекарственная) - завышает"
  };

export default runner;
