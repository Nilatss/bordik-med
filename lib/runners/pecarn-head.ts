/**
 * Runner: pecarn-head
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
        id: "ageGroup",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "under2",
            label: "<2 лет"
          },
          {
            value: "over2",
            label: "≥2 лет"
          }
        ]
      },
      {
        id: "highRisk",
        label: "Высокий риск: GCS ≤14, АМС, пальпир. перелом (<2) / базилярный перелом (≥2)",
        type: "checkbox"
      },
      {
        id: "scalpHaematoma",
        label: "<2 лет: гематома затылочная/теменная/височная (не лобная)",
        type: "checkbox"
      },
      {
        id: "losUnder2",
        label: "<2 лет: потеря сознания ≥5 с",
        type: "checkbox"
      },
      {
        id: "severeMechUnder2",
        label: "<2 лет: тяжёлый механизм (падение >0,9 м, MVC с выбросом, ЧМТ от удара)",
        type: "checkbox"
      },
      {
        id: "notActingNormal",
        label: "<2 лет: по словам родителей - «не такой, как обычно»",
        type: "checkbox"
      },
      {
        id: "losOver2",
        label: "≥2 лет: потеря сознания в анамнезе",
        type: "checkbox"
      },
      {
        id: "vomiting",
        label: "≥2 лет: рвота",
        type: "checkbox"
      },
      {
        id: "severeMechOver2",
        label: "≥2 лет: тяжёлый механизм (падение >1,5 м, MVC, ЧМТ от снаряда)",
        type: "checkbox"
      },
      {
        id: "severeHeadache",
        label: "≥2 лет: выраженная головная боль",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const under2 = v.ageGroup === 'under2';
            const highRisk = v.highRisk === true;
            let intermediate = 0;
            if (under2) {
                if (v.scalpHaematoma) intermediate++;
                if (v.losUnder2) intermediate++;
                if (v.severeMechUnder2) intermediate++;
                if (v.notActingNormal) intermediate++;
            } else {
                if (v.losOver2) intermediate++;
                if (v.vomiting) intermediate++;
                if (v.severeMechOver2) intermediate++;
                if (v.severeHeadache) intermediate++;
            }
            let interpretation = '', color = '#22C55E';
            let details = '';
            let actions = [];
            let value = '';
            if (highRisk) {
                value = 'Высокий риск';
                interpretation = 'ciTBI риск ≥ 4,4% - показана КТ';
                color = '#991B1B';
                details = 'GCS ≤ 14, нарушение сознания, пальпируемый перелом черепа (<2) или признаки базилярного перелома (≥2) - абсолютные показания к КТ головы без контраста.';
                actions = [
                    'КТ головы без контраста - немедленно',
                    'Нейрохирургическая консультация',
                    'ICU/HDU мониторинг',
                    'При ВЧД - осмоляры, элевация головы 30°'
                ];
            } else if (intermediate === 0) {
                value = 'Низкий риск';
                interpretation = 'ciTBI риск <0,05% - КТ не показана';
                color = '#22C55E';
                details = 'Нет признаков высокого риска и ни одного промежуточного фактора. Риск клинически значимой ЧМТ <0,05% (<2 лет) или <0,02% (≥2 лет).';
                actions = [
                    'Выписка домой с письменными инструкциями',
                    'Возврат при: рвоте, сонливости, неадекват. поведении, судорогах',
                    'Наблюдение родителей 24-48 ч'
                ];
            } else if (intermediate === 1) {
                value = 'Промежуточный риск';
                interpretation = 'ciTBI риск ~0,9% - наблюдение vs КТ';
                color = '#F59E0B';
                details = 'Один промежуточный фактор. Решение «наблюдение vs КТ» принимается на основе: опыта клинициста, ухудшения симптомов, возраста <3 мес, множественных факторов, предпочтения родителей, доступности нейровизуализации.';
                actions = [
                    'Наблюдение 4-6 ч в ER vs КТ',
                    'Индивидуально: возраст <3 мес, изолированная рвота vs множественные эпизоды',
                    'Shared decision-making с родителями',
                    'При ухудшении - КТ'
                ];
            } else {
                value = 'Промежуточный (множественные факторы)';
                interpretation = 'ciTBI риск ~0,9% - склоняется к КТ';
                color = '#EF4444';
                details = 'Множественные промежуточные факторы - риск клинически значимой ЧМТ выше, показания к КТ усиливаются.';
                actions = [
                    'КТ головы предпочтительна',
                    'Госпитализация для наблюдения',
                    'Неврологический осмотр каждые 1-2 ч'
                ];
            }
            return {
                value,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Правило валидировано только при GCS 14-15',
                    'Не применяется при тривиальной травме (минимальный механизм без симптомов)',
                    'Изолированная рвота или изолированная LOC у ≥2 лет - низкий риск при отсутствии других факторов',
                    'Возраст <3 мес - повышенный риск, часто показана КТ',
                    'Радиационные риски: КТ головы у детей = 1:1000-1:5000 пожизненный риск онкологии'
                ],
                related: [
                    {
                        id: 'pecarn-chalice',
                        title: 'PECARN / CHALICE'
                    },
                    {
                        id: 'pgcs',
                        title: 'Pediatric GCS'
                    },
                    {
                        id: 'pecarn-cspine',
                        title: 'PECARN C-spine'
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
    reference: "Kuppermann N, Holmes JF, Dayan PS, et al. Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study. Lancet 2009;374:1160-1170.",
    countries: "Международный (PECARN)",
    presets: [
      {
        label: "Низкий риск <2 лет",
        values: {
          ageGroup: "under2",
          highRisk: false,
          scalpHaematoma: false,
          losUnder2: false,
          severeMechUnder2: false,
          notActingNormal: false,
          losOver2: false,
          vomiting: false,
          severeMechOver2: false,
          severeHeadache: false
        }
      },
      {
        label: "Промежуточный ≥2 лет (рвота)",
        values: {
          ageGroup: "over2",
          highRisk: false,
          scalpHaematoma: false,
          losUnder2: false,
          severeMechUnder2: false,
          notActingNormal: false,
          losOver2: false,
          vomiting: true,
          severeMechOver2: false,
          severeHeadache: false
        }
      },
      {
        label: "Высокий риск",
        values: {
          ageGroup: "over2",
          highRisk: true,
          scalpHaematoma: false,
          losUnder2: false,
          severeMechUnder2: false,
          notActingNormal: false,
          losOver2: false,
          vomiting: false,
          severeMechOver2: false,
          severeHeadache: false
        }
      }
    ],
    info: "### Для чего используется\n**PECARN head injury rule (Kuppermann 2009)** - валидированное правило для минимизации ненужных КТ головы у детей с ЧМТ при сохранении чувствительности к клинически значимой ЧМТ (ciTBI).\n\n### Критерии\n#### <2 лет (2 стадии)\n**Стадия 1 - высокий риск (КТ рекомендована):**\n- GCS ≤ 14 или нарушение сознания\n- Пальпируемый перелом черепа\n\n**Стадия 2 - промежуточные факторы (наблюдение vs КТ):**\n- Затылочная/теменная/височная гематома (не лобная)\n- Потеря сознания ≥ 5 с\n- Тяжёлый механизм (падение >0,9 м, MVC)\n- «Не такой, как обычно» по словам родителей\n\n#### ≥2 лет (2 стадии)\n**Стадия 1 - высокий риск:**\n- GCS ≤ 14 или нарушение сознания\n- Признаки базилярного перелома (Battle, raccoon eyes, гемотимпанум, ликворея)\n\n**Стадия 2 - промежуточные:**\n- Потеря сознания в анамнезе\n- Рвота\n- Тяжёлый механизм (падение >1,5 м, MVC)\n- Выраженная головная боль\n\n### Интерпретация\n| Категория | Риск ciTBI | Тактика |\n|---|---|---|\n| Высокий | ≥ 4,4% | КТ |\n| Промежуточный | ~0,9% | Наблюдение 4-6 ч vs КТ (shared decision) |\n| Низкий | <0,05% | Домой |\n\n### Ограничения\n- Только GCS 14-15 (не для GCS <14)\n- Не учитывает антикоагулянты, шунты, геморрагические диатезы (отдельно - КТ)\n- Валидирован для закрытых ЧМТ\n\n### Тактика\n- **Низкий риск**: выписка, письменные инструкции\n- **Промежуточный, 1 фактор**: наблюдение 4-6 ч\n- **Промежуточный, множественные**: склонение к КТ\n- **Высокий риск**: КТ немедленно"
  };

export default runner;
