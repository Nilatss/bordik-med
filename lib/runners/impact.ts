// @ts-nocheck
/**
 * Runner: impact
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
        min: 14,
        max: 100,
        step: 1,
        quickValues: [
          25,
          40,
          55,
          70,
          85
        ]
      },
      {
        id: "motor",
        label: "GCS motor score",
        type: "select",
        options: [
          {
            value: "1",
            label: "M1 - нет ответа"
          },
          {
            value: "2",
            label: "M2 - разгибание"
          },
          {
            value: "3",
            label: "M3 - патологическое сгибание"
          },
          {
            value: "4",
            label: "M4 - отдёргивание"
          },
          {
            value: "5",
            label: "M5 - локализует боль"
          },
          {
            value: "6",
            label: "M6 - выполняет команды"
          }
        ]
      },
      {
        id: "pupils",
        label: "Зрачки",
        type: "select",
        options: [
          {
            value: "both",
            label: "Обе реагируют"
          },
          {
            value: "one",
            label: "Одна реагирует"
          },
          {
            value: "none",
            label: "Обе фиксированы"
          }
        ]
      },
      {
        id: "hypoxia",
        label: "Гипоксия (SpO₂ < 90 % или PaO₂ < 60)",
        type: "checkbox"
      },
      {
        id: "hypotension",
        label: "Гипотензия (САД < 90 мм рт.ст.)",
        type: "checkbox"
      },
      {
        id: "marshall",
        label: "Marshall CT класс",
        type: "select",
        options: [
          {
            value: "1",
            label: "I"
          },
          {
            value: "2",
            label: "II"
          },
          {
            value: "3",
            label: "III (swelling)"
          },
          {
            value: "4",
            label: "IV (shift)"
          },
          {
            value: "56",
            label: "V или VI (масса)"
          }
        ]
      },
      {
        id: "tsah",
        label: "Травматическое SAH на КТ",
        type: "checkbox"
      },
      {
        id: "edh",
        label: "Эпидуральная гематома",
        type: "checkbox"
      },
      {
        id: "glucose",
        hint: 'Глюкоза плазмы. Натощак: 3.9-5.5 ммоль/л',
        label: "Глюкоза, ммоль/л",
        type: "number",
        unit: "ммоль/л",
        min: 2,
        max: 40,
        step: 0.1,
        quickValues: [
          5,
          7,
          10,
          12,
          15
        ]
      },
      {
        id: "hb",
        hint: 'Гемоглобин. Норма: М 130-170, Ж 120-150 г/л',
        label: "Гемоглобин, г/л",
        type: "number",
        unit: "г/л",
        min: 40,
        max: 200,
        step: 1,
        quickValues: [
          80,
          100,
          120,
          140
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.age) || 40;
            const m = Number(v.motor) || 6;
            const pupils = String(v.pupils || 'both');
            const hypoxia = v.hypoxia === true;
            const hypotension = v.hypotension === true;
            const marshall = String(v.marshall || '1');
            const tsah = v.tsah === true;
            const edh = v.edh === true;
            const glucose = Number(v.glucose) || 7;
            const hb = Number(v.hb) || 130;
            // Simplified risk score approximation based on Steyerberg 2008
            // Age contribution
            let risk = 0;
            risk += Math.max(0, age - 40) * 0.03;
            // Motor: lower = worse
            const motorPts = {
                1: 1.5,
                2: 1.3,
                3: 1.0,
                4: 0.6,
                5: 0.3,
                6: 0
            };
            risk += motorPts[m] ?? 0;
            // Pupils
            if (pupils === 'one') risk += 0.7;
            if (pupils === 'none') risk += 1.4;
            // Secondary insults
            if (hypoxia) risk += 0.5;
            if (hypotension) risk += 0.7;
            // Marshall
            const marshallPts = {
                '1': 0,
                '2': 0.2,
                '3': 0.8,
                '4': 1.2,
                '56': 1.0
            };
            risk += marshallPts[marshall] ?? 0;
            if (tsah) risk += 0.5;
            if (edh) risk -= 0.3; // EDH = better prognosis
            // Lab
            if (glucose > 15) risk += 0.4;
            else if (glucose > 12) risk += 0.2;
            if (hb < 100) risk += 0.3;
            else if (hb < 120) risk += 0.1;
            // Convert to mortality probability via logistic-like mapping
            const logit = risk - 2.0; // baseline offset
            const mortality = 1 / (1 + Math.exp(-logit));
            const mortalityPct = Math.round(Math.max(0, Math.min(99, mortality * 100)));
            // Unfavourable (mRS 4-6 ≈ GOSE 1-4) typically ~ 1.5-2× mortality, capped
            const unfavPct = Math.min(99, Math.round(mortalityPct * 1.7));
            let interpretation = '', color = '', details = '';
            let actions: string[] = [];
            if (mortalityPct < 10) {
                interpretation = 'Низкий риск';
                color = '#22C55E';
                details = `Прогнозируемая 6-мес. смертность ~ ${mortalityPct} %. Ожидается хорошее восстановление при стандартной терапии.`;
                actions = [
                    'Стандартная интенсивная терапия',
                    'Ранняя реабилитация',
                    'Повторная КТ через 6-24 ч'
                ];
            } else if (mortalityPct < 30) {
                interpretation = 'Умеренный риск';
                color = '#F59E0B';
                details = `6-мес. смертность ~ ${mortalityPct} %, unfavourable ~ ${unfavPct} %. Активная ICU-терапия, мониторинг ВЧД.`;
                actions = [
                    'ICU, мониторинг ВЧД (при GCS ≤ 8 + патологическая КТ)',
                    'CPP 60-70, ВЧД < 22',
                    'Гиперосмолярная при необходимости',
                    'Ранняя трахеостомия при пролонгированной ИВЛ'
                ];
            } else if (mortalityPct < 60) {
                interpretation = 'Высокий риск';
                color = '#EF4444';
                details = `6-мес. смертность ~ ${mortalityPct} %, unfavourable ~ ${unfavPct} %. Рассмотреть эскалацию (декомпрессия) vs обсуждение целей лечения с семьёй.`;
                actions = [
                    'Агрессивный контроль ВЧД',
                    'Декомпрессивная краниэктомия (DECRA / RESCUEicp)',
                    'Мультидисциплинарная дискуссия с семьёй',
                    'CRASH модель для сравнения'
                ];
            } else {
                interpretation = 'Крайне высокий риск';
                color = '#991B1B';
                details = `6-мес. смертность ~ ${mortalityPct} %, unfavourable ~ ${unfavPct} %. Обсудить ограничение интенсивной терапии, паллиативные цели.`;
                actions = [
                    'Мультидисциплинарный консилиум',
                    'Обсудить с семьёй цели терапии',
                    'При решении продолжать - полная эскалация',
                    'Избегать ранних прогностических суждений в первые 72 ч'
                ];
            }
            return {
                value: `${mortalityPct}%`,
                unit: '6-мес. смертность',
                interpretation,
                color,
                details,
                actions,
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 10,
                            label: 'Низкий',
                            color: '#22C55E'
                        },
                        {
                            min: 10,
                            max: 30,
                            label: 'Умеренный',
                            color: '#F59E0B'
                        },
                        {
                            min: 30,
                            max: 60,
                            label: 'Высокий',
                            color: '#EF4444'
                        },
                        {
                            min: 60,
                            max: 100,
                            label: 'Крайний',
                            color: '#991B1B'
                        }
                    ],
                    current: mortalityPct,
                    unit: '%'
                },
                caveats: [
                    'IMPACT - прогностическая модель (умеренно-тяжёлая ЧМТ, GCS ≤ 12); не использовать для принятия ранних решений об отказе от терапии',
                    'Реализация в приложении - упрощённая аппроксимация; точный расчёт - calculator на crash2.lshtm.ac.uk или www.tbi-impact.org',
                    'Альтернатива - CRASH модель (10 008 пациентов, простые переменные, валидизирована в LMIC)',
                    'Не применимо к лёгкой ЧМТ и в первые часы после травмы (нестабильный GCS)'
                ],
                related: [
                    {
                        id: 'gcs',
                        title: 'GCS'
                    },
                    {
                        id: 'marshall-ct',
                        title: 'Marshall CT'
                    },
                    {
                        id: 'four',
                        title: 'FOUR'
                    }
                ],
                relatedCourses: [
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    },
                    {
                        id: '201.3',
                        title: 'Нейрофизиология'
                    }
                ]
            };
        },
    reference: "Steyerberg EW, Mushkudiani N, Perel P et al. Predicting outcome after traumatic brain injury: development and international validation of prognostic scores based on admission characteristics. PLoS Med 2008;5:e165.",
    countries: "Международный (IMPACT + CRASH консорциумы)",
    presets: [
      {
        label: "Молодой, M6, хорошо",
        values: {
          age: 25,
          motor: "6",
          pupils: "both",
          hypoxia: false,
          hypotension: false,
          marshall: "2",
          tsah: false,
          edh: false,
          glucose: 6,
          hb: 140
        }
      },
      {
        label: "Тяжёлая ЧМТ, M2",
        values: {
          age: 45,
          motor: "2",
          pupils: "one",
          hypoxia: true,
          hypotension: false,
          marshall: "3",
          tsah: true,
          edh: false,
          glucose: 12,
          hb: 110
        }
      },
      {
        label: "Крайне тяжёлая",
        values: {
          age: 70,
          motor: "1",
          pupils: "none",
          hypoxia: true,
          hypotension: true,
          marshall: "4",
          tsah: true,
          edh: false,
          glucose: 18,
          hb: 90
        }
      }
    ],
    info: "### Для чего используется\n**IMPACT (International Mission for Prognosis and Analysis of Clinical Trials in TBI, Steyerberg 2008)** - прогностическая модель для **6-месячной смертности и неблагоприятного исхода (GOSE 1-4, mRS 4-6)** у пациентов с **умеренной и тяжёлой ЧМТ** (GCS ≤ 12). Разработана на > 8500 пациентов из 11 РКИ.\n\n### Три модели\n| Модель | Переменные |\n|---|---|\n| **Core** | Возраст, GCS motor, зрачки |\n| **Extended (Core +)** | + гипоксия, гипотензия, Marshall CT, tSAH, EDH |\n| **Lab (Extended +)** | + глюкоза, гемоглобин |\n\n### Ключевые предикторы\n| Фактор | Направление |\n|---|---|\n| Возраст ↑ | ↑ смертность (после 40) |\n| GCS motor ↓ | ↑ смертность |\n| Обе зрачка фиксированы | ↑↑ смертность |\n| Гипоксия (SpO₂ < 90) | ↑ смертность |\n| Гипотензия (САД < 90) | ↑↑ смертность |\n| Marshall III-IV | ↑ смертность |\n| tSAH | ↑ смертность |\n| EDH | ↓ смертность (лучше изолированный) |\n| Гипергликемия | ↑ смертность |\n| Анемия | ↑ смертность |\n\n### Применение\n- Стратификация в клинических исследованиях\n- Консультирование семьи о прогнозе (после стабилизации)\n- **НЕ** использовать для решения об отказе от терапии в первые 72 ч\n- Сравнение performance центра (casemix adjustment)\n\n### Альтернативы\n| Модель | Особенности |\n|---|---|\n| **IMPACT** | 8509 пациентов, 3 уровня (core / ext / lab) |\n| **CRASH** (MRC CRASH trial 2008) | 10 008 пациентов, простые переменные, LMIC |\n| **IMPACT-TBI Lab** | + глюкоза + Hb |\n| **NeuroImage / Helsinki** | Добавляют volumetric CT |\n| **Rotterdam CT + IMPACT** | Комбинация |\n\n### CRASH модель (10 008 пациентов)\nПеременные: возраст, GCS, зрачки, большая экстра-краниальная травма, страна (HIC/LMIC), + КТ (petechial haem, obliteration 3rd ventricle/cisterns, SAH, midline shift, non-evacuated haematoma).\n\n### Цели терапии тяжёлой ЧМТ (BTF 2017)\n| Параметр | Цель |\n|---|---|\n| ВЧД | < 22 мм рт.ст. |\n| CPP | 60-70 мм рт.ст. |\n| SpO₂ | ≥ 94 % |\n| САД | > 90 (возраст > 50 - > 100) |\n| PaCO₂ | 35-40 |\n| Na | 135-145 (или > 150 при гипертонической терапии) |\n| Гликемия | 6-10 ммоль/л |\n| Температура | 36-37 °C |\n| Hb | ≥ 70 (переливание при < 70) |\n\n### Ограничения\n- Разработан для взрослых (14+)\n- Не применим к лёгкой ЧМТ\n- Данные из РКИ - highly selected, может недооценивать смертность в \"real world\"\n- Прогноз имеет неопределённость ± 15-20 %\n- Не учитывает проникающую травму\n\n### Тактика\n- **< 10 %** - стандартная ICU, реабилитация\n- **10-30 %** - активная ICU, мониторинг ВЧД\n- **30-60 %** - эскалация (декомпрессия), обсуждение с семьёй\n- **> 60 %** - мультидисциплинарный консилиум; не принимать решения в первые 72 ч"
  };

export default runner;
