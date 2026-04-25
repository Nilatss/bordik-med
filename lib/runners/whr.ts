// @ts-nocheck
/**
 * Runner: whr
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
        id: "waist",
        hint: 'Рост / длина в сантиметрах',
        label: "Окружность талии",
        type: "number",
        unit: "см",
        min: 40,
        max: 200,
        step: 0.5,
        quickValues: [
          70,
          80,
          90,
          100,
          110
        ]
      },
      {
        id: "hip",
        hint: 'Рост / длина в сантиметрах',
        label: "Окружность бёдер",
        type: "number",
        unit: "см",
        min: 60,
        max: 200,
        step: 0.5,
        quickValues: [
          85,
          95,
          100,
          110,
          120
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const waist = Number(v.waist);
            const hip = Number(v.hip);
            const whr = waist / hip;
            const female = v.female === true;
            const moderateCut = female ? 0.80 : 0.90;
            const highCut = female ? 0.85 : 0.90;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            if (whr < moderateCut) {
                interpretation = 'Низкий риск';
                color = '#22C55E';
                details = `WHR ниже порогов ВОЗ (♂ < 0,90; ♀ < 0,80 - норма). Распределение жира безопасное (геноидный/периферический тип).`;
            } else if (whr < highCut) {
                interpretation = 'Умеренный риск';
                color = '#F59E0B';
                details = `WHR в пограничной зоне. Для ♀ 0,80-0,84 - повышенный риск; для ♂ пограничная зона отсутствует - ≥ 0,90 сразу считается высоким.`;
                actions = [
                    'Модификация образа жизни: диета + 150 мин/нед аэробной нагрузки + силовые 2×/нед',
                    'Оценить метаболический синдром: АД, глюкоза натощак, липидограмма, HbA1c'
                ];
            } else {
                interpretation = 'Высокий кардиометаболический риск';
                color = '#EF4444';
                details = `WHR выше порогов ВОЗ (♂ ≥ 0,90; ♀ ≥ 0,85). Андроидное (висцеральное) ожирение - сильный независимый предиктор СД2, ИБС, инсульта. В INTERHEART WHR превосходил BMI по прогнозу инфаркта миокарда.`;
                actions = [
                    'Скрининг метаболического синдрома (IDF/NCEP-ATP III)',
                    'HbA1c, липидограмма, АД, УЗИ печени (MASLD)',
                    'Потеря массы на 5-10% снижает WHR и риск',
                    'Агонисты GLP-1/тирзепатид эффективно уменьшают висцеральный жир'
                ];
            }
            return {
                value: whr.toFixed(2),
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'ВОЗ-пороги: ♂ < 0,90 норма, ≥ 0,90 высокий риск; ♀ < 0,80 норма, 0,80-0,84 умер., ≥ 0,85 высокий',
                    'Измерение: талия - на середине между нижним ребром и гребнем подвздошной кости; бёдра - в самой широкой точке ягодиц',
                    'Окружность талии отдельно - проще и почти так же информативна (♂ ≥ 94/102 см; ♀ ≥ 80/88 см)',
                    'У беременных и при асцитах неинформативна'
                ],
                scale: {
                    segments: female ? [
                        {
                            min: 0.5,
                            max: 0.80,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 0.80,
                            max: 0.85,
                            label: 'Умер.',
                            color: '#F59E0B'
                        },
                        {
                            min: 0.85,
                            max: 1.3,
                            label: 'Высокий',
                            color: '#EF4444'
                        }
                    ] : [
                        {
                            min: 0.5,
                            max: 0.90,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 0.90,
                            max: 1.0,
                            label: 'Высокий',
                            color: '#EF4444'
                        },
                        {
                            min: 1.0,
                            max: 1.5,
                            label: 'Очень высокий',
                            color: '#991B1B'
                        }
                    ],
                    current: Number(whr.toFixed(2))
                },
                related: [
                    {
                        id: 'bmi',
                        title: 'BMI'
                    },
                    {
                        id: 'bsa-mosteller',
                        title: 'BSA'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '202.3',
                        title: 'Метаболизм'
                    },
                    {
                        id: '301.4',
                        title: 'Эндокринология'
                    }
                ]
            };
        },
    reference: "WHO Expert Consultation, Geneva 2008. Cutoffs: ♂ 0,90; ♀ 0,85 (substantial risk).",
    countries: "Международный (ВОЗ)",
    presets: [
      {
        label: "Норма ♂",
        values: {
          waist: 85,
          hip: 100,
          female: false
        }
      },
      {
        label: "Норма ♀",
        values: {
          waist: 72,
          hip: 95,
          female: true
        }
      },
      {
        label: "Абдом. ожирение ♂",
        values: {
          waist: 105,
          hip: 102,
          female: false
        }
      },
      {
        label: "Абдом. ожирение ♀",
        values: {
          waist: 92,
          hip: 100,
          female: true
        }
      }
    ],
    info: "### Для чего используется\n**Waist-to-hip ratio (WHR)** - соотношение окружности талии к окружности бёдер. Маркер **абдоминального (висцерального) ожирения** и независимый предиктор:\n\n- Сахарного диабета 2 типа\n- Ишемической болезни сердца\n- Инсульта\n- Общей смертности\n\nВ исследовании **INTERHEART (Lancet 2005)** WHR был сильнее BMI связан с инфарктом миокарда в 52 странах.\n\n### Формула\n`WHR = окружность талии (см) / окружность бёдер (см)`\n\n### Интерпретация (ВОЗ 2008)\n| Пол | Норма | Умеренный риск | Высокий риск |\n|---|---|---|---|\n| Мужчины | < 0,90 | - | ≥ 0,90 |\n| Женщины | < 0,80 | 0,80-0,84 | ≥ 0,85 |\n\n### Методика измерения (ВОЗ)\n- **Талия:** на середине между нижним краем последнего ребра и верхним краем гребня подвздошной кости (обычно на уровне пупка у худых)\n- **Бёдра:** в самой широкой точке ягодиц\n- Стоя, расслабленный живот, лента горизонтально, без давления, в конце выдоха\n\n### Альтернативы\n| Показатель | Порог (ВОЗ/IDF) |\n|---|---|\n| Окружность талии ♂ | ≥ 94 см (повышен) / ≥ 102 см (высокий) |\n| Окружность талии ♀ | ≥ 80 см (повышен) / ≥ 88 см (высокий) |\n| WHtR (talия/рост) | > 0,5 - абдом. ожирение |\n| BMI | < 18,5 / 25 / 30 / 35 / 40 |\n\n### Ограничения\n- Не валидизирован при беременности, асцитах, гепатомегалии, крупных опухолях\n- Этнические различия: для азиатских популяций пороги ниже\n- Точность зависит от техники измерения (интер-исследовательская вариабельность до 5%)\n\n### Тактика\n- WHR выше порога → скрининг метаболического синдрома (IDF/NCEP):\n  - АД ≥ 130/85\n  - Глюкоза натощак ≥ 5,6 ммоль/л\n  - ТГ ≥ 1,7 ммоль/л\n  - ЛПВП ♂ < 1,0 / ♀ < 1,3 ммоль/л\n- 3+ критерия = метаболический синдром\n- Снижение массы на 5-10% значимо уменьшает WHR и риск ССС"
  };

export default runner;
