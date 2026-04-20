// @ts-nocheck
/**
 * Runner: npi
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
        id: "delusions_freq",
        label: "Бред - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "delusions_sev",
        label: "Бред - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "delusions_dist",
        label: "Бред - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "hallucinations_freq",
        label: "Галлюцинации - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "hallucinations_sev",
        label: "Галлюцинации - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "hallucinations_dist",
        label: "Галлюцинации - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "agitation_freq",
        label: "Ажитация / агрессия - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "agitation_sev",
        label: "Ажитация / агрессия - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "agitation_dist",
        label: "Ажитация / агрессия - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "depression_freq",
        label: "Депрессия / дисфория - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "depression_sev",
        label: "Депрессия / дисфория - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "depression_dist",
        label: "Депрессия / дисфория - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "anxiety_freq",
        label: "Тревога - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "anxiety_sev",
        label: "Тревога - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "anxiety_dist",
        label: "Тревога - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "euphoria_freq",
        label: "Эйфория / приподнятое настроение - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "euphoria_sev",
        label: "Эйфория / приподнятое настроение - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "euphoria_dist",
        label: "Эйфория / приподнятое настроение - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "apathy_freq",
        label: "Апатия / безразличие - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "apathy_sev",
        label: "Апатия / безразличие - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "apathy_dist",
        label: "Апатия / безразличие - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "disinhibition_freq",
        label: "Расторможенность - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "disinhibition_sev",
        label: "Расторможенность - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "disinhibition_dist",
        label: "Расторможенность - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "irritability_freq",
        label: "Раздражительность / лабильность - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "irritability_sev",
        label: "Раздражительность / лабильность - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "irritability_dist",
        label: "Раздражительность / лабильность - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "motor_freq",
        label: "Аномальная моторная активность - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "motor_sev",
        label: "Аномальная моторная активность - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "motor_dist",
        label: "Аномальная моторная активность - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "night_freq",
        label: "Ночное поведение / нарушения сна - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "night_sev",
        label: "Ночное поведение / нарушения сна - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "night_dist",
        label: "Ночное поведение / нарушения сна - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      },
      {
        id: "appetite_freq",
        label: "Аппетит / изменения питания - частота",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - отсутствует"
          },
          {
            value: 1,
            label: "1 - редко (<1/нед)"
          },
          {
            value: 2,
            label: "2 - иногда (~1/нед)"
          },
          {
            value: 3,
            label: "3 - часто (несколько раз/нед)"
          },
          {
            value: 4,
            label: "4 - очень часто (ежедневно)"
          }
        ]
      },
      {
        id: "appetite_sev",
        label: "Аппетит / изменения питания - выраженность",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - лёгкая"
          },
          {
            value: 2,
            label: "2 - умеренная"
          },
          {
            value: 3,
            label: "3 - выраженная"
          }
        ]
      },
      {
        id: "appetite_dist",
        label: "Аппетит / изменения питания - дистресс опекуна",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет"
          },
          {
            value: 1,
            label: "1 - минимальный"
          },
          {
            value: 2,
            label: "2 - лёгкий"
          },
          {
            value: 3,
            label: "3 - умеренный"
          },
          {
            value: 4,
            label: "4 - выраженный"
          },
          {
            value: 5,
            label: "5 - крайне тяжёлый"
          }
        ]
      }
    ],
    compute: (v)=>{
            const domains = [
                'delusions',
                'hallucinations',
                'agitation',
                'depression',
                'anxiety',
                'euphoria',
                'apathy',
                'disinhibition',
                'irritability',
                'motor',
                'night',
                'appetite'
            ];
            let total = 0, distress = 0;
            const breakdown = [];
            const nameMap = {
                delusions: 'Бред',
                hallucinations: 'Галлюцинации',
                agitation: 'Ажитация',
                depression: 'Депрессия',
                anxiety: 'Тревога',
                euphoria: 'Эйфория',
                apathy: 'Апатия',
                disinhibition: 'Расторможенность',
                irritability: 'Раздражительность',
                motor: 'Моторика',
                night: 'Ночное поведение',
                appetite: 'Аппетит'
            };
            for (const d of domains){
                const f = Number(v[`${d}_freq`] || 0);
                const s = Number(v[`${d}_sev`] || 0);
                const di = Number(v[`${d}_dist`] || 0);
                const sub = f * s;
                total += sub;
                distress += di;
                if (sub > 0) {
                    breakdown.push({
                        term: nameMap[d],
                        desc: `F×S = ${sub} · дистресс ${di}`
                    });
                }
            }
            let interpretation = '', color = '', details = '', actions = [];
            if (total === 0) {
                interpretation = 'Нейропсихиатрических симптомов нет';
                color = '#22C55E';
                details = 'По данным опроса опекуна - поведенческие и психиатрические симптомы деменции (BPSD) не выявлены.';
                actions = [
                    'Повторная оценка каждые 6 мес или при клинических изменениях'
                ];
            } else if (total <= 12) {
                interpretation = 'Лёгкие BPSD';
                color = '#F59E0B';
                details = 'Лёгкие поведенческие/психиатрические симптомы. Первая линия - нефармакологические вмешательства.';
                actions = [
                    'Нефармакологически: средовая модификация, распорядок, музыка',
                    'Обучение опекуна',
                    'Оценить триггеры (боль, делирий, инфекция)'
                ];
            } else if (total <= 36) {
                interpretation = 'Умеренные BPSD';
                color = '#EF4444';
                details = 'Умеренные симптомы. Нефармакологические + при необходимости фармакотерапия.';
                actions = [
                    'Ингибиторы AChE / мемантин (базисная терапия деменции)',
                    'СИОЗС (циталопрам) при ажитации/депрессии',
                    'Атипичные антипсихотики - только при риске для пациента/окружающих (↑смертность, black box)',
                    'Поддержка опекуна (Zarit)'
                ];
            } else {
                interpretation = 'Тяжёлые BPSD';
                color = '#991B1B';
                details = 'Тяжёлые поведенческие симптомы. Высокий риск для пациента, опекуна и госпитализации.';
                actions = [
                    'Немедленная оценка делирия/инфекции/боли',
                    'Мультидисциплинарная команда (психиатр, гериатр)',
                    'Атипичные антипсихотики (рисперидон 0.25-1 мг, кветиапин) при неэффективности - с обсуждением рисков',
                    'Госпитализация при острой агрессии/суициде',
                    'Обсудить институционализацию, паллиатив'
                ];
            }
            return {
                value: String(total),
                unit: `/144 (дистресс ${distress}/60)`,
                interpretation,
                color,
                details,
                actions,
                differential: breakdown.length > 0 ? breakdown : undefined,
                caveats: [
                    'Опросник заполняется со слов опекуна (не пациента)',
                    'Используйте NPI-Q (краткую версию) в первичке - 10 мин',
                    'Общий балл 0-144 (12 доменов × max F4 × S3), дистресс 0-60',
                    'Для мониторинга лечения - повтор каждые 4-12 нед'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 1,
                            label: 'Нет',
                            color: '#22C55E'
                        },
                        {
                            min: 1,
                            max: 13,
                            label: 'Лёгкие',
                            color: '#F59E0B'
                        },
                        {
                            min: 13,
                            max: 37,
                            label: 'Умеренные',
                            color: '#EF4444'
                        },
                        {
                            min: 37,
                            max: 145,
                            label: 'Тяжёлые',
                            color: '#991B1B'
                        }
                    ],
                    current: total,
                    unit: 'NPI'
                },
                related: [
                    {
                        id: 'cdr',
                        title: 'CDR'
                    },
                    {
                        id: 'mmse',
                        title: 'MMSE'
                    },
                    {
                        id: 'moca',
                        title: 'MoCA'
                    }
                ],
                relatedCourses: [
                    {
                        id: '201.3',
                        title: 'Нейрофизиология'
                    }
                ]
            };
        },
    reference: "Cummings JL, Mega M, Gray K, Rosenberg-Thompson S, Carusi DA, Gornbein J. The Neuropsychiatric Inventory: comprehensive assessment of psychopathology in dementia. Neurology 1994;44:2308-2314.",
    info: "### Для чего используется\n**NPI (Neuropsychiatric Inventory, Cummings 1994)** - оценка **поведенческих и психиатрических симптомов деменции (BPSD)** по данным опроса опекуна. 12 доменов.\n\n### Домены (12)\nБред · Галлюцинации · Ажитация / агрессия · Депрессия / дисфория · Тревога · Эйфория · Апатия · Расторможенность · Раздражительность / лабильность · Аномальная моторная активность · Ночные нарушения · Аппетит / питание\n\n### Подсчёт\nДля каждого домена: **Частота (1-4) × Выраженность (1-3) = 0-12 баллов**.\nДополнительно: **дистресс опекуна 0-5**.\n\n### Максимум\n- Сумма доменов: **0-144**\n- Дистресс: **0-60**\n\n### Интерпретация (ориентировочно)\n| Сумма | Тяжесть |\n|---|---|\n| 0 | Симптомы отсутствуют |\n| 1-12 | Лёгкие BPSD |\n| 13-36 | Умеренные |\n| > 36 | Тяжёлые |\n\n### Применение\n- Болезнь Альцгеймера, FTD, LBD, сосудистая деменция\n- Мониторинг эффективности лечения (AChE, мемантин, антипсихотики)\n- Оценка опекунского бремени (→ Zarit)\n\n### Версии\n- **NPI** (оригинал) - 12 доменов, ~20 мин\n- **NPI-Q** (Kaufer 2000) - краткая, для первички, ~10 мин\n- **NPI-NH** - для домов престарелых, 10 доменов + сон/аппетит\n\n### Ограничения\n- Зависит от надёжности информанта\n- Не заменяет диагностические критерии (DSM-5 депрессии, психоза)\n- Эйфория редка в Alzheimer; типична для FTD/мании\n\n### Тактика\n- Лёгкие: нефармакологически (режим, музыка, среда)\n- Умеренные: AChE/мемантин, СИОЗС, атипичный антипсихотик (осторожно)\n- Тяжёлые: мультидисциплинарная команда, исключить делирий, обсудить институционализацию\n\n### Источник\nCummings JL et al. **The Neuropsychiatric Inventory.** *Neurology* 1994;44:2308-2314."
  };

export default runner;
