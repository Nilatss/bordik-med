// @ts-nocheck
/**
 * Runner: sipa
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
        id: "ageYears",
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 1,
        max: 18,
        step: 1,
        quickValues: [
          4,
          7,
          10,
          13,
          16
        ]
      },
      {
        id: "hr",
        label: "ЧСС",
        type: "number",
        unit: "уд/мин",
        min: 40,
        max: 220,
        step: 1,
        quickValues: [
          80,
          100,
          120,
          140,
          160
        ]
      },
      {
        id: "sbp",
        label: "САД",
        type: "number",
        unit: "мм рт.ст.",
        min: 40,
        max: 200,
        step: 1,
        quickValues: [
          70,
          80,
          90,
          100,
          110
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.ageYears);
            const hr = Number(v.hr);
            const sbp = Number(v.sbp);
            const si = sbp > 0 ? hr / sbp : 0;
            let threshold = 0;
            let ageGroup = '';
            if (age >= 4 && age <= 6) {
                threshold = 1.2;
                ageGroup = '4-6 лет';
            } else if (age >= 7 && age <= 12) {
                threshold = 1.0;
                ageGroup = '7-12 лет';
            } else if (age >= 13 && age <= 16) {
                threshold = 0.9;
                ageGroup = '13-16 лет';
            } else if (age < 4) {
                threshold = 1.2;
                ageGroup = '<4 лет (экстраполяция)';
            } else {
                threshold = 0.9;
                ageGroup = '>16 лет (взр. граница 0,9)';
            }
            const elevated = si > threshold;
            let interpretation = '', color = '#22C55E';
            let details = '';
            let actions = [];
            if (elevated) {
                interpretation = `SIPA повышен (>${threshold}) - высокий риск`;
                color = '#EF4444';
                details = `SI ${si.toFixed(2)} > возрастного порога ${threshold} для ${ageGroup}. Ассоциирован с повышенной смертностью, необходимостью массивной трансфузии и серьёзной травмой внутренних органов.`;
                actions = [
                    'Активировать массивный трансфузионный протокол при кровопотере',
                    'Два крупнокалиберных в/в доступа или ВО (внутрикостный)',
                    'Болюс кристаллоидов 20 мл/кг, затем эр. масса 10 мл/кг при шоке',
                    'FAST УЗИ, КТ при стабилизации',
                    'Транспорт в детский травмоцентр уровня I/II'
                ];
            } else {
                interpretation = `SIPA в норме (≤${threshold}) - низкий риск`;
                color = '#22C55E';
                details = `SI ${si.toFixed(2)} ≤ порога ${threshold} для ${ageGroup}. Гемодинамически стабильный пациент, вероятность серьёзной травмы ниже.`;
                actions = [
                    'Стандартная оценка ATLS / APLS',
                    'Повторная оценка витальных каждые 15 мин',
                    'Не исключает травму - продолжить поиск очага'
                ];
            }
            return {
                value: si.toFixed(2),
                unit: '',
                interpretation,
                color,
                details,
                actions,
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: threshold,
                            label: `Норма ≤${threshold}`,
                            color: '#22C55E'
                        },
                        {
                            min: threshold,
                            max: 3,
                            label: `Повышен >${threshold}`,
                            color: '#EF4444'
                        }
                    ],
                    current: Number(si.toFixed(2)),
                    unit: ''
                },
                caveats: [
                    'Возрастные пороги (Acker 2015): 4-6 лет → 1,2; 7-12 лет → 1,0; 13-16 лет → 0,9',
                    'SIPA валидизирован у пациентов с тупой травмой; при проникающей - ограниченные данные',
                    'Анальгетики, лихорадка, боль, страх могут повысить ЧСС и исказить SI',
                    'При врождённых пороках сердца и гипертензии - интерпретация индивидуальная',
                    'У <4 лет нормальные САД низкие, HR высокие - SIPA плохо валидизирован'
                ],
                related: [
                    {
                        id: 'shock-index',
                        title: 'Shock Index (взр.)'
                    },
                    {
                        id: 'pts',
                        title: 'Pediatric Trauma Score'
                    },
                    {
                        id: 'pews',
                        title: 'PEWS'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия раннего возраста'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ]
            };
        },
    reference: "Acker SN, Ross JT, Partrick DA, et al. Pediatric specific shock index accurately identifies severely injured children. J Pediatr Surg 2015;50:331-334.",
    countries: "Международный (США ATLS/PALS)",
    presets: [
      {
        label: "Норма (8 лет)",
        values: {
          ageYears: 8,
          hr: 90,
          sbp: 100
        }
      },
      {
        label: "Повышен (6 лет, шок)",
        values: {
          ageYears: 6,
          hr: 150,
          sbp: 90
        }
      },
      {
        label: "Повышен (подросток)",
        values: {
          ageYears: 15,
          hr: 120,
          sbp: 100
        }
      }
    ],
    info: "### Для чего используется\n**SIPA (Shock Index, Pediatric Age-adjusted)** - модифицированный индекс шока с возрастными порогами для раннего распознавания гемодинамически значимой травмы у детей 4-16 лет.\n\n### Формула\n`SI = ЧСС / САД`\n\n### Возрастные пороги (Acker 2015)\n| Возраст | Верхний порог SI |\n|---|---|\n| 4-6 лет | **1,2** |\n| 7-12 лет | **1,0** |\n| 13-16 лет | **0,9** |\n\nSI > порога = повышенный риск.\n\n### Интерпретация\n- **Повышен**: ассоциирован с ≥2× смертностью, массивной трансфузией, повреждением внутренних органов, необходимостью экстренной операции\n- **Норма**: низкий риск, но не исключает травму - продолжить оценку\n\n### Ограничения\n- Валидизирован при **тупой** травме; для проникающей - данных мало\n- <4 лет: физиологические нормы ЧСС/САД очень вариабельны, SIPA не валидизирован\n- Боль, тревога, гипертермия - ложно повышают ЧСС\n- Антигипертензивные / β-блокаторы - ложно занижают ЧСС\n\n### Тактика\n- **Повышен** → массивный трансфузионный протокол, 2 × в/в, болюсы, травмоцентр I/II уровня\n- **Норма** → стандартный ATLS/APLS, повторная оценка\n\n### Источник\nAcker SN et al. *J Pediatr Surg* 2015;50:331-334. Nordin A et al. - валидация PRBC потребности *J Trauma* 2018."
  };

export default runner;
