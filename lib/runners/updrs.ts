// @ts-nocheck
/**
 * Runner: updrs
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
        id: "part1",
        label: "Часть I — немоторные аспекты (0–52)",
        type: "number",
        min: 0,
        max: 52,
        step: 1,
        quickValues: [
          0,
          5,
          10,
          20,
          30
        ]
      },
      {
        id: "part2",
        label: "Часть II — моторные ADL (0–52)",
        type: "number",
        min: 0,
        max: 52,
        step: 1,
        quickValues: [
          0,
          5,
          10,
          20,
          30
        ]
      },
      {
        id: "part3",
        label: "Часть III — моторный осмотр (0–132)",
        type: "number",
        min: 0,
        max: 132,
        step: 1,
        quickValues: [
          0,
          20,
          40,
          60,
          80
        ]
      },
      {
        id: "part4",
        label: "Часть IV — моторные осложнения (0–24)",
        type: "number",
        min: 0,
        max: 24,
        step: 1,
        quickValues: [
          0,
          4,
          8,
          12,
          16
        ]
      }
    ],
    compute: (v)=>{
            const p1 = Number(v.part1) || 0;
            const p2 = Number(v.part2) || 0;
            const p3 = Number(v.part3) || 0;
            const p4 = Number(v.part4) || 0;
            const total = p1 + p2 + p3 + p4;
            let interpretation = '', color = '', details = '', actions = [];
            // Part III severity (Martinez-Martin 2015 cut-offs)
            if (p3 <= 32) {
                interpretation = 'Лёгкая моторная симптоматика (Часть III ≤ 32)';
                color = '#22C55E';
                details = 'Лёгкие моторные нарушения. Возможна монотерапия.';
                actions = [
                    'Монотерапия: агонисты ДА у молодых или леводопа у пожилых',
                    'Физическая активность, тай-чи, LSVT-BIG',
                    'Скрининг немоторных: REM-sleep, депрессия, ортостаз'
                ];
            } else if (p3 <= 58) {
                interpretation = 'Умеренная моторная симптоматика (Часть III 33–58)';
                color = '#F59E0B';
                details = 'Умеренные нарушения. Часто требуется комбинация.';
                actions = [
                    'Леводопа + адъюванты (MAO-B, COMT)',
                    'Оценка моторных флуктуаций (Часть IV)',
                    'Реабилитация'
                ];
            } else {
                interpretation = 'Тяжёлая моторная симптоматика (Часть III ≥ 59)';
                color = '#EF4444';
                details = 'Тяжёлые нарушения с выраженной инвалидизацией.';
                actions = [
                    'Оптимизация леводопы, обсудить DBS/помпы (апоморфин, дуодопа)',
                    'Немоторные: когнитивные (ривастигмин), психоз (клозапин, пимавансерин)',
                    'Мультидисциплинарная команда'
                ];
            }
            return {
                value: String(total),
                unit: `/260 (I:${p1} · II:${p2} · III:${p3} · IV:${p4})`,
                interpretation,
                color,
                details,
                actions,
                differential: [
                    {
                        term: 'Часть I',
                        desc: `${p1}/52 — немоторные (когниция, настроение, сон, боль, вегетативные)`
                    },
                    {
                        term: 'Часть II',
                        desc: `${p2}/52 — моторные ADL (речь, слюна, еда, одевание)`
                    },
                    {
                        term: 'Часть III',
                        desc: `${p3}/132 — моторный осмотр (ригидность, тремор, брадикинезия, постура)`
                    },
                    {
                        term: 'Часть IV',
                        desc: `${p4}/24 — моторные осложнения (дискинезии, off-время)`
                    }
                ],
                caveats: [
                    'MDS-UPDRS (Goetz 2008) — пересмотр классического UPDRS (Fahn 1987)',
                    'Полная оценка требует обучения; для научных работ — сертифицированный оценщик',
                    'Часть III оценивается в определённом медикаментозном состоянии (on/off)',
                    'Не заменяет Hoehn-Yahr для стадирования'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 33,
                            label: 'Лёгк. (III≤32)',
                            color: '#22C55E'
                        },
                        {
                            min: 33,
                            max: 59,
                            label: 'Умер. (III 33–58)',
                            color: '#F59E0B'
                        },
                        {
                            min: 59,
                            max: 261,
                            label: 'Тяж. (III≥59)',
                            color: '#EF4444'
                        }
                    ],
                    current: p3,
                    unit: 'Часть III'
                },
                related: [
                    {
                        id: 'hoehn',
                        title: 'Hoehn-Yahr'
                    },
                    {
                        id: 'schwab',
                        title: 'Schwab-England ADL'
                    },
                    {
                        id: 'pdq39',
                        title: 'PDQ-39'
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
    reference: "Goetz CG, Tilley BC, Shaftman SR et al. Movement Disorder Society-sponsored revision of the Unified Parkinson Disease Rating Scale (MDS-UPDRS): scale presentation and clinimetric testing results. Mov Disord 2008;23:2129–2170.",
    info: "### Для чего используется\n**MDS-UPDRS (Goetz 2008)** — эталонная шкала оценки **болезни Паркинсона**. 4 части, суммарно 260 баллов.\n\n### Части\n| Часть | Содержание | Пункты × Макс | Макс |\n|---|---|---|---|\n| I | Немоторные аспекты повседневной жизни | 13 × 4 | 52 |\n| II | Моторные аспекты повседневной жизни | 13 × 4 | 52 |\n| III | Моторный осмотр | 33 × 4 | 132 |\n| IV | Моторные осложнения | 6 × 4 | 24 |\n| **Итого** | | | **260** |\n\n### Бэнды тяжести по Части III (Martinez-Martin 2015)\n| Часть III | Тяжесть |\n|---|---|\n| ≤ 32 | Лёгкая |\n| 33–58 | Умеренная |\n| ≥ 59 | Тяжёлая |\n\n### Применение\n- Диагностическая оценка и мониторинг PD\n- Оценка эффекта леводопы (on/off)\n- Клинические исследования — золотой стандарт\n- Предоперационная оценка DBS\n\n### Ограничения\n- Требует обучения; для клинических исследований — сертификации MDS\n- Длительность полной оценки ~30–45 мин\n- Часть III зависит от медикаментозного состояния (off/on утром или после дозы)\n- Не учитывает индивидуальную значимость симптомов (использовать PDQ-39)\n\n### Связанные\n- **Hoehn-Yahr** — быстрое стадирование (1–5)\n- **Schwab-England ADL** — повседневная активность (0–100 %)\n- **PDQ-39** — качество жизни\n\n### Тактика\nОпределяется сочетанием частей и стадии H-Y: см. тактику в отдельных разделах.\n\n### Источник\nGoetz CG et al. **MDS-UPDRS: scale presentation and clinimetric testing results.** *Mov Disord* 2008;23:2129–2170."
  };

export default runner;
