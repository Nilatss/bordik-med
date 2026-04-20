// @ts-nocheck
/**
 * Runner: esc-nste
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
        id: "assay",
        label: "hs-cTn assay",
        type: "select",
        options: [
          {
            value: "elecsys",
            label: "Roche Elecsys (hs-cTnT)"
          },
          {
            value: "architect",
            label: "Abbott Architect (hs-cTnI)"
          },
          {
            value: "access",
            label: "Beckman Access (hs-cTnI)"
          },
          {
            value: "dimension",
            label: "Siemens Dimension Vista (hs-cTnI)"
          }
        ]
      },
      {
        id: "algorithm",
        label: "Алгоритм",
        type: "select",
        options: [
          {
            value: "1h",
            label: "0/1 час"
          },
          {
            value: "2h",
            label: "0/2 часа"
          }
        ]
      },
      {
        id: "baseline",
        label: "Исходный hs-cTn (0 ч)",
        type: "number",
        unit: "нг/л",
        min: 0,
        max: 10000,
        step: 1,
        quickValues: [
          3,
          5,
          10,
          20,
          50,
          100
        ]
      },
      {
        id: "repeat",
        label: "Повторный hs-cTn (1 или 2 ч)",
        type: "number",
        unit: "нг/л",
        min: 0,
        max: 10000,
        step: 1,
        quickValues: [
          3,
          5,
          10,
          20,
          50,
          100
        ]
      }
    ],
    compute: (v)=>{
            const assay = String(v.assay);
            const algo = String(v.algorithm);
            const t0 = Number(v.baseline);
            const t1 = Number(v.repeat);
            const delta = Math.abs(t1 - t0);
            const table = {
                elecsys: {
                    '1h': {
                        roSingle: 5,
                        roAny: 12,
                        roDelta: 3,
                        riSingle: 52,
                        riDelta: 5
                    },
                    '2h': {
                        roSingle: 5,
                        roAny: 14,
                        roDelta: 3,
                        riSingle: 52,
                        riDelta: 10
                    }
                },
                architect: {
                    '1h': {
                        roSingle: 4,
                        roAny: 5,
                        roDelta: 2,
                        riSingle: 64,
                        riDelta: 6
                    },
                    '2h': {
                        roSingle: 4,
                        roAny: 5,
                        roDelta: 2,
                        riSingle: 64,
                        riDelta: 15
                    }
                },
                access: {
                    '1h': {
                        roSingle: 4,
                        roAny: 5,
                        roDelta: 4,
                        riSingle: 50,
                        riDelta: 15
                    },
                    '2h': {
                        roSingle: 4,
                        roAny: 5,
                        roDelta: 5,
                        riSingle: 50,
                        riDelta: 20
                    }
                },
                dimension: {
                    '1h': {
                        roSingle: 6,
                        roAny: 8,
                        roDelta: 3,
                        riSingle: 120,
                        riDelta: 7
                    },
                    '2h': {
                        roSingle: 6,
                        roAny: 8,
                        roDelta: 7,
                        riSingle: 120,
                        riDelta: 20
                    }
                }
            };
            const c = table[assay][algo];
            let zone;
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (t0 < c.roSingle || t0 < c.roAny && delta < c.roDelta) {
                zone = 'rule-out';
                interpretation = 'Rule-out: ОИМ исключён';
                color = '#22C55E';
                details = 'При отсутствии ишемии на ЭКГ и низком клиническом подозрении (GRACE/HEART низкий) - возможна ранняя выписка с амбулаторным обследованием. Помнить о "too early" - симптомы < 3 ч у ~ 10 % пациентов требуют повтора на 3 ч.';
                actions = [
                    'При симптомах < 3 ч - дополнительный тропонин на 3 ч',
                    'ЭКГ-мониторинг до выписки',
                    'Амбулаторный стресс-тест / КТА в течение 72 ч',
                    'Коррекция факторов риска ИБС'
                ];
            } else if (t0 >= c.riSingle || delta >= c.riDelta) {
                zone = 'rule-in';
                interpretation = 'Rule-in: высокая вероятность ОИМ';
                color = '#EF4444';
                details = 'Высокая вероятность NSTEMI (позитивная прогностическая ценность ≥ 75 %). Нужна немедленная антитромботическая терапия и определение сроков КАГ по ESC risk-stratification.';
                actions = [
                    'Госпитализация в кардиологию/ICU',
                    'ASA 150-300 мг + ингибитор P2Y12 (тикагрелор 180 мг)',
                    'Антикоагулянт (фондапаринукс 2,5 мг п/к или эноксапарин)',
                    'КАГ: очень высокий риск < 2 ч, высокий риск < 24 ч, умеренный < 72 ч',
                    'Поиск альтернативных причин повышения (миокардит, ТЭЛА, сепсис)'
                ];
            } else {
                zone = 'observe';
                interpretation = 'Observe: серая зона';
                color = '#F59E0B';
                details = 'Диагноз неоднозначен - 15-25 % пациентов этой группы имеют ОИМ. Требуется повтор hs-cTn на 3 ч и дополнительное обследование (ЭхоКГ, КТА).';
                actions = [
                    'Повтор hs-cTn через 3 ч',
                    'ЭхоКГ прикроватно (нарушения локальной сократимости)',
                    'КТ-коронарография при низком/умеренном претестовом риске',
                    'КАГ при ухудшении или подтверждённой ишемии'
                ];
            }
            return {
                value: zone === 'rule-out' ? 'Rule-out' : zone === 'rule-in' ? 'Rule-in' : 'Observe',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Алгоритм валидирован только для указанных hs-cTn assays - универсальных cut-off нет',
                    'Не применять в первые 3 ч от начала симптомов без повторного теста',
                    'Повышение тропонина возможно при: миокардите, ТЭЛА, сепсисе, ХПН, расслоении аорты',
                    'ЭКГ-мониторинг обязателен независимо от зоны'
                ],
                related: [
                    {
                        id: 'heart',
                        title: 'HEART score'
                    },
                    {
                        id: 'edacs',
                        title: 'EDACS'
                    },
                    {
                        id: 'timi',
                        title: 'TIMI (UA/NSTEMI)'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ]
            };
        },
    reference: "Collet JP et al. 2020 ESC Guidelines NSTE-ACS. Eur Heart J 2021;42:1289-1367.",
    countries: "ЕС · международный",
    presets: [
      {
        label: "Elecsys rule-out",
        values: {
          assay: "elecsys",
          algorithm: "1h",
          baseline: 3,
          repeat: 4
        }
      },
      {
        label: "Architect rule-in",
        values: {
          assay: "architect",
          algorithm: "1h",
          baseline: 80,
          repeat: 95
        }
      },
      {
        label: "Access observe",
        values: {
          assay: "access",
          algorithm: "2h",
          baseline: 10,
          repeat: 14
        }
      }
    ],
    info: "### Для чего используется\n**ESC 0/1-h и 0/2-h алгоритм hs-cTn** - быстрое rule-out/rule-in ОИМ без подъёма ST у пациентов с болью в грудной клетке, поступивших в отделение неотложной помощи.\n\n### Формула (по assay, нг/л)\n| Assay | Алго | Rule-out | Δ rule-out | Rule-in | Δ rule-in |\n|---|---|---|---|---|---|\n| **Elecsys (hs-cTnT)** | 0/1h | < 5 или < 12+Δ<3 | | ≥ 52 | ≥ 5 |\n| Elecsys | 0/2h | < 5 или < 14 | Δ<3 | ≥ 52 | ≥ 10 |\n| **Architect (hs-cTnI)** | 0/1h | < 4 или < 5+Δ<2 | | ≥ 64 | ≥ 6 |\n| Architect | 0/2h | < 5 | Δ<2 | ≥ 64 | ≥ 15 |\n| **Access (hs-cTnI)** | 0/1h | < 4 или < 5+Δ<4 | | ≥ 50 | ≥ 15 |\n| Access | 0/2h | < 5 | Δ<5 | ≥ 50 | ≥ 20 |\n| **Dimension** | 0/1h | < 6 или < 8+Δ<3 | | ≥ 120 | ≥ 7 |\n\n### Интерпретация\n- **Rule-out** (NPV ≥ 99 %) - выписка возможна\n- **Rule-in** (PPV ≥ 75 %) - ОИМ, инвазивная стратегия\n- **Observe** - 15-25 % имеют ОИМ, повтор тропонина на 3 ч + ЭхоКГ/КТА\n\n### Ограничения\n- \"Too early\" presenters (< 3 ч от начала) - ≈ 10 % требуют 3-часового повтора\n- При ХБП, ТЭЛА, миокардите - тропонин хронически повышен, Δ важнее абсолютного значения\n- Cut-off не взаимозаменяемы между assays\n\n### Тактика\n- Rule-out + ЭКГ − + GRACE/HEART low → выписка\n- Observe → 3 ч hs-cTn + ЭхоКГ / КТА\n- Rule-in → кардиология, ASA + P2Y12, КАГ по риску"
  };

export default runner;
