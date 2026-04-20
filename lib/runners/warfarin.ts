// @ts-nocheck
/**
 * Runner: warfarin
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
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 18,
        max: 110,
        quickValues: [
          40,
          55,
          65,
          75,
          85
        ]
      },
      {
        id: "weight",
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 30,
        max: 200,
        step: 0.1,
        quickValues: [
          50,
          60,
          70,
          80,
          90
        ]
      },
      {
        id: "height",
        label: "Рост",
        type: "number",
        unit: "см",
        min: 120,
        max: 220,
        step: 1,
        quickValues: [
          155,
          165,
          170,
          175,
          180
        ]
      },
      {
        id: "baselineINR",
        label: "Исходный INR",
        type: "select",
        options: [
          {
            value: "normal",
            label: "Норма (< 1,1)"
          },
          {
            value: "mid",
            label: "1,1-1,3"
          },
          {
            value: "high",
            label: "> 1,3 (риск кровотечения)"
          }
        ]
      },
      {
        id: "amio",
        label: "Принимает амиодарон",
        type: "checkbox"
      },
      {
        id: "liver",
        label: "Цирроз / тяжёлая печёночная недостаточность",
        type: "checkbox"
      },
      {
        id: "frail",
        label: "Старческая астения / низкий BMI (< 20)",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const w = Number(v.weight);
            const h = Number(v.height) / 100;
            const bmi = w / (h * h);
            const baseline = String(v.baselineINR);
            const amio = v.amio === true;
            const liver = v.liver === true;
            const frail = v.frail === true;
            const highRisk = age >= 75 || amio || liver || frail || baseline === 'high' || bmi < 20;
            const dose = highRisk ? 2.5 : 5;
            return {
                value: `${dose} мг/сут`,
                unit: `(BMI ${bmi.toFixed(1)})`,
                interpretation: highRisk ? 'Сниженный стартовый режим - повышенный риск кровотечения' : 'Стандартный стартовый режим ACCP',
                color: highRisk ? '#EF4444' : '#22C55E',
                details: `Стартовая доза варфарина: ${dose} мг/сут первые 2 дня, далее - коррекция по INR. ${highRisk ? `Факторы, снижающие стартовую дозу: ${[
                    age >= 75 ? 'возраст ≥ 75' : '',
                    amio ? 'амиодарон (↑ эффект)' : '',
                    liver ? 'цирроз' : '',
                    frail ? 'астения' : '',
                    baseline === 'high' ? 'исходный INR > 1,3' : '',
                    bmi < 20 ? 'низкий BMI' : ''
                ].filter(Boolean).join(', ')}.` : 'Факторов высокого риска нет - стандартный старт 5 мг/сут.'} Цель INR при A-fib / ВТЭ - 2,0-3,0; при механическом протезе митрального клапана - 2,5-3,5. Контроль INR через 3 дня, далее каждые 2-3 дня до стабильности, потом 1 раз в 4 нед.`,
                actions: [
                    `Варфарин ${dose} мг перорально, 1 раз/сут вечером`,
                    'Параллельно LMWH (мост) при ВТЭ и механическом протезе МК - до достижения 2 последовательных INR в цели',
                    'НЕ нужна мостовая терапия при неклапанной ФП (ACCP 2016)',
                    'Оценить INR на 3-й день, корректировать дозу по номограмме',
                    'Информировать пациента о продуктах с высоким вит. K (зелень, брокколи), взаимодействиях с антибиотиками',
                    'Точный калькулятор доз: warfarindosing.org (IWPC/Gage)'
                ],
                caveats: [
                    'Генотипирование CYP2C9/VKORC1 (PG-x) повышает точность старта (≈ 10 % вариабельности), но не стандарт в РФ/ЕС',
                    'Многочисленные взаимодействия: амиодарон, азолы, макролиды, ТМП/СМК - усиливают; рифампицин, карбамазепин - ослабляют',
                    'В первую неделю - транзиторное гиперкоагуляционное состояние (протеин C ↓ быстрее, чем II/VII/IX/X) - отсюда необходимость моста',
                    'При INR > 4,5 без кровотечения - пропустить дозу; > 9 - витамин K 2,5 мг per os; кровотечение - ПКК + витамин K'
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    }
                ],
                related: [
                    {
                        id: 'raschke',
                        title: 'Heparin (Раштке)'
                    },
                    {
                        id: 'doac',
                        title: 'DOAC - выбор дозы'
                    },
                    {
                        id: 'has-bled',
                        title: 'HAS-BLED'
                    }
                ]
            };
        },
    reference: "ACCP Chest 2012/2018. Точный расчёт: IWPC / Gage formula (warfarindosing.org).",
    countries: "Международный (ACCP) · США · ЕС",
    presets: [
      {
        label: "Молодой 40 лет, здоровый",
        values: {
          age: 40,
          weight: 80,
          height: 180,
          baselineINR: "normal",
          amio: false,
          liver: false,
          frail: false
        }
      },
      {
        label: "Пожилой 80 лет с амиодароном",
        values: {
          age: 80,
          weight: 65,
          height: 165,
          baselineINR: "normal",
          amio: true,
          liver: false,
          frail: false
        }
      },
      {
        label: "Цирроз, INR 1,4",
        values: {
          age: 60,
          weight: 70,
          height: 170,
          baselineINR: "high",
          amio: false,
          liver: true,
          frail: false
        }
      }
    ],
    info: "### Для чего используется\nВыбор **стартовой дозы варфарина** при фибрилляции предсердий, ВТЭ, механических клапанных протезах. Упрощённая логика ACCP; для точного расчёта использовать IWPC/Gage алгоритм на warfarindosing.org (учитывает генотип CYP2C9/VKORC1).\n\n### Стартовые дозы (ACCP 2012 / 2018)\n| Ситуация | Доза |\n|---|---|\n| Стандартный пациент < 75 лет без факторов риска | **5 мг/сут × 2 дня** |\n| Пожилые (≥ 75), астеники, цирроз, амиодарон, BMI < 20 | **2,5 мг/сут** |\n| Низкий исходный INR > 1,3 или тяжёлое ССЗ | 2,5 мг/сут |\n\n### Цели INR\n| Показание | Целевой INR |\n|---|---|\n| Неклапанная ФП, ВТЭ, протез аортального клапана | 2,0-3,0 |\n| Механический митральный протез, рецидив ВТЭ на варфарине | 2,5-3,5 |\n\n### Мониторинг\n| Этап | Частота |\n|---|---|\n| Первая неделя | Через 3 дня |\n| 1-й месяц | Каждые 2-3 дня → еженедельно |\n| Стабильный | 1 раз в 4 нед |\n\n### Мостовая терапия LMWH\n| Ситуация | Мост нужен? |\n|---|---|\n| Неклапанная ФП (ACCP 2016, BRIDGE) | **Нет** |\n| ВТЭ первые 3 мес | Да |\n| Механический митральный клапан | Да |\n| Механический аортальный клапан без факторов риска | Не обязательно |\n\n### Взаимодействия - повышают эффект варфарина\nАмиодарон, флуконазол, ко-тримоксазол, метронидазол, макролиды, клопидогрел, статины, парацетамол (> 2 г/сут хронически).\n\n### Снижают эффект\nРифампицин, карбамазепин, фенитоин, барбитураты, зверобой, витамин K из пищи (зелень).\n\n### Коррекция при передозировке\n| INR | Нет кровотечения | Есть кровотечение |\n|---|---|---|\n| 4,5-10 | Пропустить 1-2 дозы, контроль | ПКК + витамин K 5-10 мг в/в |\n| > 10 | Витамин K 2,5 мг per os | ПКК + витамин K 10 мг в/в |\n\n### Ограничения\n- Упрощённый алгоритм; точный расчёт - IWPC/Gage (warfarindosing.org)\n- Не учитывает фармакогенетику (CYP2C9\\*2/\\*3, VKORC1 −1639G>A)\n- Требует лабораторного мониторинга - DOAC часто предпочтительнее при неклапанной ФП"
  };

export default runner;
