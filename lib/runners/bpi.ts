// @ts-nocheck
/**
 * Runner: bpi
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
        id: "worst",
        label: "Наихудшая боль за 24 ч (0-10)",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "least",
        label: "Наименьшая боль за 24 ч (0-10)",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          2,
          4,
          6,
          8
        ]
      },
      {
        id: "average",
        label: "Средняя боль за 24 ч (0-10)",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "now",
        label: "Боль сейчас (0-10)",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "iActivity",
        label: "Интерференция: общая активность (0-10)",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "iMood",
        label: "Интерференция: настроение",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "iWalk",
        label: "Интерференция: ходьба",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "iWork",
        label: "Интерференция: работа",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "iRel",
        label: "Интерференция: отношения",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "iSleep",
        label: "Интерференция: сон",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      },
      {
        id: "iEnjoy",
        label: "Интерференция: удовольствие от жизни",
        type: "number",
        unit: "балл",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          3,
          5,
          7
        ]
      }
    ],
    compute: (v)=>{
            const clamp = (x)=>Math.max(0, Math.min(10, Number(x) || 0));
            const worst = clamp(Number(v.worst));
            const least = clamp(Number(v.least));
            const avg = clamp(Number(v.average));
            const now = clamp(Number(v.now));
            const sev = (worst + least + avg + now) / 4;
            const intItems = [
                v.iActivity,
                v.iMood,
                v.iWalk,
                v.iWork,
                v.iRel,
                v.iSleep,
                v.iEnjoy
            ].map((x)=>clamp(Number(x)));
            const intScore = intItems.reduce((a, b)=>a + b, 0) / intItems.length;
            const combined = (sev + intScore) / 2;
            let interpretation = '', color = '#22C55E';
            let details = '';
            let actions: string[] = [];
            if (combined < 4) {
                interpretation = 'Лёгкий болевой профиль';
                color = '#84CC16';
                details = 'Умеренная нагрузка на функционирование. Продолжать текущую схему с переоценкой каждые 2-4 нед.';
                actions = [
                    'Поддерживающая аналгезия',
                    'Образ жизни, физическая активность, психосоциальная поддержка'
                ];
            } else if (combined < 7) {
                interpretation = 'Умеренный болевой профиль';
                color = '#F59E0B';
                details = 'Значимое влияние на функционирование. Эскалация терапии и/или адъюванты.';
                actions = [
                    'Оптимизировать анальгетики: ступень 2 ВОЗ, регионарная анестезия при возможности',
                    'Оценить нейропатический компонент (DN4)',
                    'Психосоциальное сопровождение, КПТ при хронической боли'
                ];
            } else {
                interpretation = 'Тяжёлый болевой профиль';
                color = '#EF4444';
                details = 'Выраженное нарушение качества жизни. Мультидисциплинарный подход. У онко-пациентов - активная титрация опиоидов.';
                actions = [
                    'Сильные опиоиды (морфин, оксикодон, гидроморфон) - регулярно + прорывные дозы',
                    'Адъюванты при нейропатическом компоненте: прегабалин, дулоксетин',
                    'Интервенционное лечение: блокады, эпидуральный катетер, интратекальная помпа',
                    'Направление в болевую клинику; паллиативная команда'
                ];
            }
            return {
                value: `${sev.toFixed(1)} · ${intScore.toFixed(1)}`,
                unit: 'тяжесть · интерференция',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'BPI широко валидирован при онкологической и хронической неонкологической боли',
                    'Клинически значимое снижение: ≥ 2 балла или ≥ 30 %',
                    'Интерференция часто падает медленнее, чем интенсивность - отражает реабилитацию'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 4,
                            label: 'Лёгкий',
                            color: '#84CC16'
                        },
                        {
                            min: 4,
                            max: 7,
                            label: 'Умеренный',
                            color: '#F59E0B'
                        },
                        {
                            min: 7,
                            max: 10,
                            label: 'Тяжёлый',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(combined.toFixed(1)),
                    unit: '/10'
                },
                related: [
                    {
                        id: 'vas',
                        title: 'VAS/NRS'
                    },
                    {
                        id: 'mcgill',
                        title: 'SF-MPQ-2'
                    },
                    {
                        id: 'dn4',
                        title: 'DN4'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.7',
                        title: 'Онкология'
                    }
                ]
            };
        },
    reference: "Cleeland CS, Ryan KM. Pain assessment: global use of the Brief Pain Inventory. *Ann Acad Med Singapore* 1994; 23:129-138.",
    countries: "Международный (MD Anderson)",
    presets: [
      {
        label: "Контролируемая онко-боль",
        values: {
          worst: 4,
          least: 1,
          average: 2,
          now: 2,
          iActivity: 2,
          iMood: 2,
          iWalk: 1,
          iWork: 3,
          iRel: 1,
          iSleep: 2,
          iEnjoy: 2
        }
      },
      {
        label: "Неконтролируемая боль",
        values: {
          worst: 9,
          least: 5,
          average: 7,
          now: 7,
          iActivity: 8,
          iMood: 7,
          iWalk: 8,
          iWork: 9,
          iRel: 6,
          iSleep: 8,
          iEnjoy: 9
        }
      }
    ],
    info: "### Для чего используется\n**Brief Pain Inventory (BPI, Cleeland 1991)** - стандарт оценки **онкологической и хронической неонкологической боли**. Короткая форма (SF) содержит 4 пункта интенсивности и 7 пунктов интерференции. Широко используется в клинических исследованиях и рутинной онкологии (MD Anderson).\n\n### Компоненты\n**Интенсивность (0-10)**:\n- Наихудшая за 24 ч\n- Наименьшая за 24 ч\n- Средняя\n- Сейчас\n\n**Интерференция (0-10)** - насколько боль мешает:\n- Общей активности\n- Настроению\n- Ходьбе\n- Работе (включая дом)\n- Отношениям с людьми\n- Сну\n- Удовольствию от жизни\n\n### Расчёт\n- **Pain Severity** = (worst + least + average + now) / 4\n- **Pain Interference** = (сумма 7 пунктов) / 7\n\n### Интерпретация\n| Балл | Категория |\n|---|---|\n| < 4 | Лёгкая |\n| 4-6 | Умеренная |\n| ≥ 7 | Тяжёлая |\n\nКлинически значимое изменение: **≥ 2 балла** или **≥ 30 %**.\n\n### Ограничения\n- Субъективная самооценка - требует сохранной когнитивной функции\n- Интерференция \"работа\" неприменима у неработающих - допустимо пропустить\n- Не заменяет оценку нейропатического компонента (DN4)\n\n### Тактика\n- **Лёгкий**: поддерживающая ступень ВОЗ 1, реабилитация\n- **Умеренный**: ступень 2, адъюванты, психосоциальное сопровождение\n- **Тяжёлый**: ступень 3, мультидисциплинарно, интервенционно"
  };

export default runner;
