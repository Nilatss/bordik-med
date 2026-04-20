// @ts-nocheck
/**
 * Runner: ibw-robinson
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
        id: "height",
        label: "Рост",
        type: "number",
        unit: "см",
        min: 130,
        max: 220,
        step: 0.1,
        quickValues: [
          155,
          160,
          165,
          170,
          175,
          180,
          185,
          190
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const cm = Number(v.height);
            const inchesAbove5ft = Math.max(0, (cm - 152.4) / 2.54);
            const female = v.female === true;
            // Robinson 1983
            const robinson = (female ? 49 : 52) + (female ? 1.7 : 1.9) * inchesAbove5ft;
            // Miller 1983
            const miller = (female ? 53.1 : 56.2) + (female ? 1.36 : 1.41) * inchesAbove5ft;
            // Hamwi 1964
            const hamwi = (female ? 45.5 : 48) + (female ? 2.2 : 2.7) * inchesAbove5ft;
            return {
                value: robinson.toFixed(1),
                unit: 'кг',
                interpretation: `IBW (Robinson). Miller: ${miller.toFixed(1)} кг · Hamwi: ${hamwi.toFixed(1)} кг`,
                color: '#1A1A1A',
                details: `Три альтернативные формулы IBW дают близкие, но различающиеся значения. Robinson (1983) считается наиболее точной для большинства взрослых. Miller (1983) - альтернатива с более низким базовым весом. Hamwi (1964) - простая формула клинической практики США, часто используется диетологами. Применение как у Devine: дозирование анестетиков, аминогликозидов, дыхательный объём при ИВЛ.`,
                caveats: [
                    'Все три формулы выведены для взрослых, не для детей',
                    'При росте < 152 см (< 5 футов) возвращают базовое значение без прибавки - занижают IBW',
                    'Не учитывают телосложение и мышечную массу',
                    'Для дозирования у пациента с ожирением используйте ABW = IBW + 0,4 × (TBW − IBW)'
                ],
                related: [
                    {
                        id: 'ibw-devine',
                        title: 'IBW (Devine)'
                    },
                    {
                        id: 'abw',
                        title: 'Adjusted BW'
                    },
                    {
                        id: 'lbw',
                        title: 'Lean BW'
                    },
                    {
                        id: 'bmi',
                        title: 'BMI'
                    }
                ],
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    }
                ]
            };
        },
    reference: "Robinson 1983; Miller 1983; Hamwi 1964. Все формулы основаны на росте над 5 футами (152,4 см).",
    countries: "Международный (США - клиническая практика)",
    presets: [
      {
        label: "♂ 175 см",
        values: {
          height: 175,
          female: false
        }
      },
      {
        label: "♀ 165 см",
        values: {
          height: 165,
          female: true
        }
      },
      {
        label: "♂ 190 см",
        values: {
          height: 190,
          female: false
        }
      },
      {
        label: "♀ 155 см",
        values: {
          height: 155,
          female: true
        }
      }
    ],
    info: "### Для чего используется\nАльтернативные формулы **идеальной массы тела (IBW)**, дополняют классическую Devine. Используются для:\n\n- Дозирования лекарств при ожирении (анестетики, аминогликозиды, гепарины)\n- Расчёта дыхательного объёма при ИВЛ (6-8 мл/кг IBW - протективная вентиляция)\n- Расчёта ABW и LBW\n\n### Формулы (все: рост в дюймах, 5 футов = 60 дюймов = 152,4 см)\n| Автор | Мужчины | Женщины |\n|---|---|---|\n| **Robinson (1983)** | 52 + 1,9 × (дюймы − 60) | 49 + 1,7 × (дюймы − 60) |\n| **Miller (1983)** | 56,2 + 1,41 × (дюймы − 60) | 53,1 + 1,36 × (дюймы − 60) |\n| **Hamwi (1964)** | 48 + 2,7 × (дюймы − 60) | 45,5 + 2,2 × (дюймы − 60) |\n| **Devine (1974)** | 50 + 2,3 × (дюймы − 60) | 45,5 + 2,3 × (дюймы − 60) |\n\n### Сравнение\n- **Devine** - классика, рекомендуется FDA для дозирования аминогликозидов\n- **Robinson** - наиболее точна по сравнению с измеренной массой\n- **Miller** - даёт более низкие значения\n- **Hamwi** - простая, быстрая; популярна у диетологов (США)\n\n### Применение\n| Задача | Формула |\n|---|---|\n| Аминогликозиды, дигоксин | Devine (FDA) |\n| Пропофол, рокуроний | LBW (Janmahasatian) |\n| ИВЛ - дыхательный объём | Любая IBW × 6-8 мл/кг |\n| Низкомолекулярный гепарин (лечение) | Фактическая масса |\n\n### Ограничения\n- Не валидизированы у детей\n- При росте < 152 см формула даёт базовое значение - занижает\n- Не учитывают пол/расу/телосложение\n\n### Тактика\n- У пациента с BMI > 30 для аминогликозидов: ABW = IBW + 0,4 × (TBW − IBW)\n- Для протективной вентиляции ARDSnet: 6 мл/кг × IBW\n- Сравнить Robinson/Miller/Hamwi/Devine - если разница велика, склониться к Devine (FDA-стандарт)\n\n### Источник\nRobinson JD et al. *Am J Hosp Pharm* 1983;40:1016-1019.\nMiller DR et al. *Drug Intell Clin Pharm* 1983;17:233-237.\nHamwi GJ. *Diabetes Mellitus: Diagnosis and Treatment*. ADA 1964."
  };

export default runner;
