// @ts-nocheck
/**
 * Runner: mrs — Modified Rankin Scale (Stroke Disability)
 *
 * P1-CR-10 — Formula source attribution:
 *   ORIGIN:     Rankin J. Cerebral vascular accidents in patients over the
 *               age of 60. II. Prognosis. Scott Med J. 1957;2(5):200-215.
 *               PMID: 13432835
 *   MODIFIED:   van Swieten JC, Koudstaal PJ, Visser MC, Schouten HJ,
 *               van Gijn J. Interobserver agreement for the assessment of
 *               handicap in stroke patients. Stroke. 1988;19(5):604-607.
 *               doi:10.1161/01.STR.19.5.604
 *   GUIDELINE:  AHA/ASA 2018 Stroke Guidelines — mRS primary outcome
 *               measure в всех stroke trials. mRS-shift analysis рутинно
 *               в meta-analyses (favouring vs ordinal regression).
 *
 * 7-point ordinal scale (0-6):
 *   0 — No symptoms at all
 *   1 — No significant disability despite symptoms; able to carry out
 *       all usual duties and activities
 *   2 — Slight disability; unable to carry out all previous activities
 *       but able to look after own affairs without assistance
 *   3 — Moderate disability; requiring some help, but able to walk
 *       without assistance
 *   4 — Moderately severe disability; unable to walk without assistance
 *       and unable to attend to own bodily needs without assistance
 *   5 — Severe disability; bedridden, incontinent, requiring constant
 *       nursing care and attention
 *   6 — Dead
 *
 * Common dichotomies:
 *   "Good outcome" = mRS 0-1 OR 0-2 (depending on study endpoint)
 *   "Functional independence" = mRS ≤2
 *
 * Use cases:
 *   - 90-day primary endpoint в всех ischemic stroke trials
 *   - tPA / thrombectomy efficacy (mRS shift / dichotomised)
 *   - Long-term rehab outcome
 *
 * Caveats:
 *   - Subjective scoring — interrater agreement variable
 *   - Structured Interview версия (Wilson 2002) — improved reliability
 *   - НЕ chains rehabilitation progress — useful как outcome, не process
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
        id: "score",
        label: "Оценка",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 - нет симптомов"
          },
          {
            value: 1,
            label: "1 - нет существенных нарушений жизнедеятельности"
          },
          {
            value: 2,
            label: "2 - лёгкая инвалидизация (независим в повседневности)"
          },
          {
            value: 3,
            label: "3 - умеренная (нужна помощь, но ходит самостоятельно)"
          },
          {
            value: 4,
            label: "4 - умеренно тяжёлая (нуждается в помощи при ходьбе)"
          },
          {
            value: 5,
            label: "5 - тяжёлая (прикован к постели)"
          },
          {
            value: 6,
            label: "6 - смерть"
          }
        ]
      }
    ],
    compute: (v)=>{
            const s = Number(v.score);
            const colors = [
                '#10B981',
                '#10B981',
                '#F59E0B',
                '#F59E0B',
                '#EF4444',
                '#EF4444',
                '#1A1A1A'
            ];
            const desc = [
                'Полное восстановление.',
                'Минимальный дефицит, активность сохранена.',
                'Может выполнять повседневные дела без помощи.',
                'Нуждается в некоторой помощи, но ходит самостоятельно.',
                'Не может ходить без помощи и обслуживать базовые потребности.',
                'Постельный режим, требует постоянного ухода.',
                'Летальный исход.'
            ];
            const details = s <= 2 ? 'Функциональная независимость сохранена (mRS 0-2) - "хороший исход" в RCT по инсульту. Пациент справляется с повседневной активностью без посторонней помощи.' : s <= 4 ? 'Умеренная-выраженная инвалидизация. Требуется помощь в быту и реабилитация.' : s === 5 ? 'Тяжёлая инвалидизация, полная зависимость. Приоритет - уход, профилактика осложнений иммобилизации.' : 'Летальный исход.';
            const actions = s <= 2 ? [
                'Вторичная профилактика инсульта (антитромботическая, статины, АД, ФП)',
                'Реабилитация при резидуальных симптомах',
                'Контроль ФР, переоценка mRS в динамике'
            ] : s <= 4 ? [
                'Мультидисциплинарная реабилитация (ЛФК, логопед, ОТ)',
                'Профилактика осложнений (ВТЭ, пневмония, пролежни)',
                'Оценка депрессии, когнитивных нарушений',
                'Социальная/семейная поддержка'
            ] : s === 5 ? [
                'Паллиативный уход, профилактика пролежней, контрактур, аспирации',
                'Нутритивная поддержка, уход за кожей',
                'Поддержка семьи'
            ] : [
                '-'
            ];
            return {
                value: String(s),
                unit: 'mRS',
                interpretation: desc[s],
                color: colors[s],
                details,
                actions,
                caveats: [
                    'Низкая межрейтерская надёжность без структурированного интервью (smRSi)',
                    'Не разделяет когнитивный и моторный дефицит',
                    'Категории 3 и 4 субъективны - зависят от оценщика',
                    'Оценка обычно на 90-й день; ранние оценки менее информативны'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 1,
                            label: '0',
                            color: '#10B981'
                        },
                        {
                            min: 1,
                            max: 2,
                            label: '1',
                            color: '#10B981'
                        },
                        {
                            min: 2,
                            max: 3,
                            label: '2',
                            color: '#F59E0B'
                        },
                        {
                            min: 3,
                            max: 4,
                            label: '3',
                            color: '#F59E0B'
                        },
                        {
                            min: 4,
                            max: 5,
                            label: '4',
                            color: '#EF4444'
                        },
                        {
                            min: 5,
                            max: 6,
                            label: '5',
                            color: '#EF4444'
                        },
                        {
                            min: 6,
                            max: 7,
                            label: '6',
                            color: '#1A1A1A'
                        }
                    ],
                    current: s,
                    unit: 'mRS'
                },
                relatedCourses: [
                    {
                        id: '301.1',
                        title: "Кардиология"
                    }
                ],
                related: [
                    {
                        id: 'nihss',
                        title: 'NIHSS'
                    },
                    {
                        id: 'mrs-stroke',
                        title: 'mRS (инсульт)'
                    }
                ]
            };
        },
    reference: "van Swieten JC. Stroke 1988. Modified Rankin Scale.",
    info: "### Что измеряет\n**Модифицированная шкала Rankin (mRS)** - глобальная оценка **функциональной независимости** после инсульта или другого неврологического события. 7-балльная (0-6).\n\n### Шкала\n- **0** - нет симптомов\n- **1** - нет существенных нарушений; выполняет все привычные обязанности\n- **2** - лёгкая инвалидизация: не может выполнять некоторые прежние занятия, но независим в повседневности\n- **3** - умеренная: нуждается в некоторой помощи, но ходит без посторонней поддержки\n- **4** - умеренно тяжёлая: не может ходить без помощи, не может обслуживать базовые потребности\n- **5** - тяжёлая: прикован к постели, требует постоянного ухода\n- **6** - смерть\n\n### Применение\n- **Первичный исход** в большинстве RCT по инсульту (тромболизис, тромбэкстракция, нейропротекция)\n- \"Хороший исход\" обычно определяется как mRS 0-2\n- \"Превосходный\" - mRS 0-1\n- Оценка обычно на 90-й день\n\n### Связанные шкалы\n| Шкала | Диапазон | Применение |\n|---|---|---|\n| NIHSS | 0-42 | Острая тяжесть ишемического инсульта |\n| Barthel Index | 0-100 | Повседневная активность (ADL) |\n| GOS-E (Glasgow Outcome Scale Extended) | 1-8 | Исходы ЧМТ |\n\n### Ограничения\n- Низкая межрейтерская надёжность без структурированного интервью (используйте **smRSi** - structured mRS interview)\n- Не отделяет когнитивные дефициты от моторных\n- Категории 3 и 4 субъективны"
  };

export default runner;
