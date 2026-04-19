// @ts-nocheck
/**
 * Runner: ru-growth
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
        id: "ageYears",
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 0,
        max: 18,
        step: 0.1,
        quickValues: [
          1,
          3,
          7,
          10,
          14,
          17
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
        id: "weight",
        label: "Масса",
        type: "number",
        unit: "кг",
        min: 2,
        max: 150,
        step: 0.1,
        quickValues: [
          10,
          20,
          30,
          50,
          70
        ]
      },
      {
        id: "height",
        label: "Рост",
        type: "number",
        unit: "см",
        min: 45,
        max: 210,
        step: 0.1,
        quickValues: [
          75,
          95,
          120,
          150,
          170
        ]
      }
    ],
    compute: (v)=>{
            const age = Number(v.ageYears);
            const w = Number(v.weight);
            const h = Number(v.height);
            const sex = String(v.sex);
            // Approximate Russian (Мазурин, Воронцов) median by age — simplified
            const medHeight = sex === 'm' ? 50 + (age < 1 ? age * 25 : age < 4 ? 25 + (age - 1) * 8 : 49 + (age - 4) * 6) : 49 + (age < 1 ? age * 25 : age < 4 ? 25 + (age - 1) * 8 : 49 + (age - 4) * 5.8);
            const medWeight = sex === 'm' ? 3.3 + (age < 1 ? age * 7 : age < 5 ? 10 + (age - 1) * 2.2 : 18 + (age - 5) * 3.2) : 3.2 + (age < 1 ? age * 6.7 : age < 5 ? 9.7 + (age - 1) * 2.1 : 17.5 + (age - 5) * 3.0);
            const zH = (h - medHeight) / (medHeight * 0.05);
            const zW = (w - medWeight) / (medWeight * 0.12);
            let interpretation = '', color = '#22C55E';
            let details = '', actions = [];
            const minZ = Math.min(zH, zW);
            if (minZ < -2) {
                interpretation = 'Ниже нормы';
                color = '#EF4444';
                details = 'По РФ-нормам Мазурина-Воронцова — значительное отклонение ниже нормы. Обследование педиатром.';
                actions = [
                    'Педиатр, эндокринолог',
                    'Оценка рациона и хронических болезней'
                ];
            } else if (zW > 2) {
                interpretation = 'Избыточная масса';
                color = '#F59E0B';
                details = 'Избыточная масса по РФ-нормам. Рекомендуется подтверждение по WHO/CDC перцентилям ИМТ.';
                actions = [
                    'Диетолог',
                    'Физическая активность',
                    'Оценка по ИМТ-для-возраста (WHO/CDC)'
                ];
            } else {
                interpretation = 'В норме';
                color = '#22C55E';
                details = 'Антропометрия в пределах национальных референсов РФ.';
                actions = [
                    'Диспансерное наблюдение педиатра'
                ];
            }
            return {
                value: `Z рост ${zH.toFixed(2)} · Z вес ${zW.toFixed(2)}`,
                unit: `мед. ${medHeight.toFixed(0)} см / ${medWeight.toFixed(1)} кг`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Российские национальные таблицы (Мазурин, Воронцов, СПбГПМУ) основаны на выборках 1970-80-х годов — до эпидемии ожирения',
                    'Рекомендуется параллельно оценивать по WHO Growth Standards как международному эталону',
                    'Региональные различия в РФ значительны — уточнять по местным центильным таблицам',
                    'Приказ МЗ РФ № 514н использует в т.ч. центильные таблицы; для научной точности — WHO'
                ],
                related: [
                    {
                        id: 'who-growth',
                        title: 'WHO 0–5 (рекоменд.)'
                    },
                    {
                        id: 'cdc-growth',
                        title: 'CDC 2–20'
                    },
                    {
                        id: 'uk-who',
                        title: 'UK-WHO'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия 0-2'
                    }
                ]
            };
        },
    reference: "Мазурин А.В., Воронцов И.М. «Пропедевтика детских болезней» (центильные таблицы). РФ.",
    countries: "Российская Федерация · СНГ",
    presets: [
      {
        label: "♂ 3 года, 15 кг, 95 см",
        values: {
          ageYears: 3,
          sex: "m",
          weight: 15,
          height: 95
        }
      },
      {
        label: "♀ 10 лет, 32 кг, 140 см",
        values: {
          ageYears: 10,
          sex: "f",
          weight: 32,
          height: 140
        }
      }
    ],
    info: "### Для чего используется\n**Национальные центильные таблицы РФ (Мазурин, Воронцов; СПбГПМУ)** — традиционный референс физического развития детей в России. Используется в поликлиниках согласно Приказу МЗ РФ № 514н (проф. осмотры).\n\n### Ограничения\n- Таблицы 1970-1980-х годов — до эпохи массового ожирения\n- Разные центильные таблицы (Воронцов, Тихвинский, Юрьев) дают разные границы\n- Рекомендуется использовать **параллельно с WHO Growth Standards** — международный стандарт\n\n### Когда WHO лучше РФ-норм\n- Оценка тяжёлой нутритивной недостаточности (SAM) — WHO\n- Грудное вскармливание → WHO (основан на детях на ГВ)\n- Международный мониторинг и исследования — WHO\n\n### Когда РФ-таблицы уместны\n- Рутинные профосмотры в РФ (нормативно закреплены)\n- Региональные мониторинги\n\n### Источник\nМазурин А.В., Воронцов И.М. *Пропедевтика детских болезней.* 3-е изд. СПб: Фолиант, 2009.\nПриказ МЗ РФ № 514н от 10.08.2017 — профилактические медицинские осмотры несовершеннолетних.\nWHO Child Growth Standards (2006) — рекомендован как международный эталон."
  };

export default runner;
