// @ts-nocheck
/**
 * Runner: npsi
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
        id: "q1",
        label: "1. Жжение",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q2",
        label: "2. Сжатие/сдавливание",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q3",
        label: "3. Тиски/сжимающее давление",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q4",
        label: "4. Удар электрическим током (прострелы)",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q5",
        label: "5. Прокалывающая боль",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q6",
        label: "6. Усиление при прикосновении",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q7",
        label: "7. Усиление на холод",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q8",
        label: "8. Усиление при давлении",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q9",
        label: "9. Парестезии (иголки)",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      },
      {
        id: "q10",
        label: "10. Дизэстезии (зуд, мурашки)",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        unit: "/10",
        quickValues: [
          0,
          3,
          5,
          7,
          10
        ]
      }
    ],
    compute: (v)=>{
            const items = [
                'q1',
                'q2',
                'q3',
                'q4',
                'q5',
                'q6',
                'q7',
                'q8',
                'q9',
                'q10'
            ].map((k)=>Number(v[k] ?? 0));
            const total = items.reduce((a, b)=>a + b, 0);
            const burning = items[0];
            const pressing = (items[1] + items[2]) / 2;
            const paroxysmal = (items[3] + items[4]) / 2;
            const evoked = (items[5] + items[6] + items[7]) / 3;
            const paresth = (items[8] + items[9]) / 2;
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (total < 20) {
                interpretation = 'Лёгкая нейропатическая боль';
                color = '#22C55E';
                details = 'Низкая интенсивность симптомов. Возможна начальная стадия или ответ на терапию.';
                actions = [
                    'Нефармакологические методы (ЛФК, TENS)',
                    'Габапентин/прегабалин в начальной дозе',
                    'Повторная оценка NPSI через 4 нед'
                ];
            } else if (total < 50) {
                interpretation = 'Умеренная нейропатическая боль';
                color = '#F59E0B';
                details = 'Клинически значимый нейропатический компонент. Ориентироваться на доминирующий подтип.';
                actions = [
                    'Первая линия: прегабалин 150–600 мг/сут, габапентин 900–3600 мг/сут, дулоксетин 60 мг',
                    'ТЦА (амитриптилин 25–75 мг) — при бессоннице/тревоге',
                    'Локальная терапия (лидокаин 5 %, капсаицин 8 %) при доминирующем evoked-компоненте'
                ];
            } else {
                interpretation = 'Тяжёлая нейропатическая боль';
                color = '#EF4444';
                details = 'Выраженная нейропатическая боль. Необходима комбинированная терапия и направление к специалисту по боли.';
                actions = [
                    'Комбинация: габапентиноид + СИОЗСН/ТЦА',
                    'Трамадол или тапентадол — вторая линия',
                    'Интервенционные методы (блокады, SCS при рефрактерной CRPS/PDN)',
                    'Мультидисциплинарная клиника боли'
                ];
            }
            return {
                value: String(total),
                unit: '/100',
                interpretation,
                color,
                details: `${details}\n\nПодтипы: жжение ${burning.toFixed(1)}, давящая ${pressing.toFixed(1)}, пароксизмальная ${paroxysmal.toFixed(1)}, evoked ${evoked.toFixed(1)}, парест./дизэст. ${paresth.toFixed(1)}.`,
                actions,
                caveats: [
                    'NPSI оценивает только интенсивность за последние 24 ч (не диагностирует)',
                    'Для скрининга нейропатической боли использовать DN4, LANSS или painDETECT',
                    'Подтипы помогают подобрать таргетную терапию (evoked → локальные; пароксизмальные → карбамазепин)',
                    'NPSI нечувствителен к плацебо в RCT; хорош для профиля ответа на терапию'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 20,
                            label: '< 20 лёгкая',
                            color: '#22C55E'
                        },
                        {
                            min: 20,
                            max: 50,
                            label: '20–50 умер.',
                            color: '#F59E0B'
                        },
                        {
                            min: 50,
                            max: 101,
                            label: '≥ 50 тяжёлая',
                            color: '#EF4444'
                        }
                    ],
                    current: total,
                    unit: '/100'
                },
                related: [
                    {
                        id: 'dn4',
                        title: 'DN4'
                    },
                    {
                        id: 'tcns',
                        title: 'TCNS'
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
    reference: "Bouhassira D, Attal N, Fermanian J et al. Development and validation of the Neuropathic Pain Symptom Inventory. Pain 2004;108:248–257.",
    countries: "Международный",
    info: "### Для чего используется\n**NPSI (Neuropathic Pain Symptom Inventory, Bouhassira 2004)** — валидированный опросник для **количественной оценки профиля нейропатической боли**. В отличие от скринингов (DN4, LANSS) — не диагностирует, а профилирует интенсивность 5 подтипов боли + 2 временных параметра.\n\n### Структура (10 пунктов, 0–10 NRS)\n| Подтип | Пункты |\n|---|---|\n| Жжение (поверхностное) | Q1 |\n| Давящая (глубокая) | Q2, Q3 |\n| Пароксизмальная | Q4, Q5 |\n| Evoked (провоцируемая) | Q6, Q7, Q8 |\n| Парестезии/дизэстезии | Q9, Q10 |\n\n+ длительность приступов и частота (в полной версии 12 items).\n\n### Интерпретация\n- Общий балл **0–100** (сумма 10 пунктов)\n- Подшкалы — средние по группе пунктов\n- **< 20** — лёгкая; **20–50** — умеренная; **≥ 50** — тяжёлая\n\n### Клиническое применение\n- Подбор таргетной терапии по доминирующему подтипу:\n  - Жжение → габапентиноиды, дулоксетин, лидокаин локально\n  - Пароксизмы → карбамазепин, окскарбазепин, габапентиноиды\n  - Evoked (аллодиния) → лидокаин 5 %, капсаицин 8 %\n  - Парестезии → габапентиноиды\n- Мониторинг ответа на терапию\n- Стратификация в клинических исследованиях\n\n### Альтернативные инструменты\n| Инструмент | Назначение |\n|---|---|\n| **DN4** (Bouhassira 2005) | Скрининг нейропатической боли (≥ 4/10) |\n| **LANSS** (Bennett 2001) | Скрининг (≥ 12/24) |\n| **painDETECT** (Freynhagen 2006) | Скрининг + интенсивность (≥ 19/38) |\n| **NPSI** | Профиль интенсивности (не скрининг) |\n\n### Ограничения\n- Не диагностический — используйте DN4 для скрининга\n- Суточная вариабельность — оценивать за последние 24 ч\n- Не валидирован у детей\n\n### Тактика (EFNS/IASP 2015)\n- **1-я линия:** прегабалин, габапентин, дулоксетин, амитриптилин\n- **2-я линия:** трамадол, лидокаин 5 % пластырь, капсаицин 8 %\n- **3-я линия:** опиоиды длительного действия, ботулотоксин, интервенционные\n- Комбинированная терапия при NPSI ≥ 50\n\n### Источник\nBouhassira D et al. **Development and validation of the Neuropathic Pain Symptom Inventory.** *Pain* 2004;108:248–257."
  };

export default runner;
