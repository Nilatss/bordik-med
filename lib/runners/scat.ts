// @ts-nocheck
/**
 * Runner: scat
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
        id: "red_flags",
        label: "Красные флаги (шея, судороги, потеря сознания, нарастающий дефицит)",
        type: "checkbox",
        points: 0
      },
      {
        id: "symptoms_count",
        label: "Число симптомов из 22 (головная боль, головокружение, тошнота, светобоязнь и т.д.)",
        type: "number",
        min: 0,
        max: 22,
        step: 1,
        quickValues: [
          0,
          3,
          7,
          12,
          18
        ]
      },
      {
        id: "symptoms_severity",
        label: "Суммарная тяжесть симптомов (сумма баллов 0–6 × 22, макс 132)",
        type: "number",
        min: 0,
        max: 132,
        step: 1,
        quickValues: [
          0,
          10,
          30,
          60,
          90
        ]
      },
      {
        id: "orientation",
        label: "Ориентация (месяц, дата, день недели, год, время) — правильных",
        type: "number",
        min: 0,
        max: 5,
        step: 1,
        quickValues: [
          0,
          3,
          5
        ]
      },
      {
        id: "immediate_memory",
        label: "Немедленная память (3 попытки × 10 слов, макс 30)",
        type: "number",
        min: 0,
        max: 30,
        step: 1,
        quickValues: [
          15,
          20,
          25,
          30
        ]
      },
      {
        id: "concentration",
        label: "Концентрация: цифры наоборот (0–4) + месяцы наоборот (0–1)",
        type: "number",
        min: 0,
        max: 5,
        step: 1,
        quickValues: [
          0,
          2,
          4,
          5
        ]
      },
      {
        id: "bess_errors",
        label: "BESS — ошибки баланса (0–30)",
        type: "number",
        min: 0,
        max: 30,
        step: 1,
        quickValues: [
          0,
          5,
          10,
          20
        ]
      },
      {
        id: "delayed_recall",
        label: "Отсроченное воспроизведение (0–10)",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        quickValues: [
          0,
          5,
          8,
          10
        ]
      }
    ],
    compute: (v)=>{
            const redFlags = v.red_flags === true;
            const sCount = Number(v.symptoms_count) || 0;
            const sSev = Number(v.symptoms_severity) || 0;
            const orient = Number(v.orientation) || 0;
            const immMem = Number(v.immediate_memory) || 0;
            const conc = Number(v.concentration) || 0;
            const bess = Number(v.bess_errors) || 0;
            const delRec = Number(v.delayed_recall) || 0;
            let interpretation = '';
            let color = '#22C55E';
            let details = '';
            let actions = [];
            if (redFlags) {
                interpretation = 'Красные флаги — срочное обследование';
                color = '#991B1B';
                details = 'При любом красном флаге (подозрение на травму шейного отдела, потеря сознания > 1 мин, судороги, прогрессирующая головная боль, рвота, нарастающий неврологический дефицит, спутанность) — немедленное удаление с поля и госпитализация для нейровизуализации.';
                actions = [
                    'Немедленное удаление с поля — "When in doubt, sit them out"',
                    'Иммобилизация шейного отдела',
                    'Экстренная КТ головы (+ КТ шейного отдела при необходимости)',
                    'Госпитализация, наблюдение, консультация нейрохирурга'
                ];
            } else if (sCount >= 5 || sSev >= 20 || bess >= 15 || delRec < 5 || orient < 4) {
                interpretation = 'Вероятное сотрясение — удаление с поля';
                color = '#EF4444';
                details = 'Отклонения по нескольким доменам согласуются с сотрясением головного мозга. Дифференциальная диагностика со структурной травмой обязательна при стойких или нарастающих симптомах.';
                actions = [
                    'Удаление с поля, запрет возвращения в тот же день',
                    'Physical + cognitive rest 24–48 ч, затем градуированный return-to-play',
                    'Повторная оценка SCAT через 24–72 ч',
                    'Нейровизуализация при стойких/прогрессирующих симптомах'
                ];
            } else {
                interpretation = 'Признаков сотрясения не выявлено';
                color = '#22C55E';
                details = 'Острые данные SCAT в пределах нормы. Сохраняется необходимость мониторинга в первые 24–48 ч и сравнения с базовым SCAT (если есть).';
                actions = [
                    'Наблюдение 24–48 ч',
                    'Повтор SCAT при появлении симптомов',
                    'Градуированный return-to-sport при необходимости'
                ];
            }
            return {
                value: String(sCount),
                unit: `симпт · тяж ${sSev}/132`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'SCAT — не самостоятельный диагностический инструмент; используется с клинической оценкой',
                    'SCAT6 (2023) — для ≥ 13 лет; Child-SCAT6 — для 8–12 лет',
                    'Желательно базовое тестирование в сезон (baseline) для индивидуального сравнения',
                    'Симптомы могут проявиться через 24–48 ч — негативный SCAT не исключает сотрясения'
                ],
                related: [
                    {
                        id: 'mace2',
                        title: 'MACE2'
                    },
                    {
                        id: 'gcs',
                        title: 'GCS'
                    },
                    {
                        id: 'marshall-ct',
                        title: 'Marshall CT'
                    }
                ],
                relatedCourses: [
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ]
            };
        },
    reference: "Patricios JS et al. Consensus statement on concussion in sport — Amsterdam 2022. Br J Sports Med 2023;57:695–711. SCAT6 / Child-SCAT6.",
    countries: "Международный (CISG / FIFA / IOC)",
    presets: [
      {
        label: "Норма",
        values: {
          red_flags: false,
          symptoms_count: 0,
          symptoms_severity: 0,
          orientation: 5,
          immediate_memory: 28,
          concentration: 5,
          bess_errors: 3,
          delayed_recall: 9
        }
      },
      {
        label: "Вероятное сотрясение",
        values: {
          red_flags: false,
          symptoms_count: 10,
          symptoms_severity: 35,
          orientation: 4,
          immediate_memory: 18,
          concentration: 2,
          bess_errors: 18,
          delayed_recall: 4
        }
      },
      {
        label: "Красные флаги",
        values: {
          red_flags: true,
          symptoms_count: 15,
          symptoms_severity: 60,
          orientation: 2,
          immediate_memory: 12,
          concentration: 1,
          bess_errors: 25,
          delayed_recall: 2
        }
      }
    ],
    info: "### Для чего используется\n**SCAT6 (Sport Concussion Assessment Tool, 6-я редакция, Amsterdam 2022)** — стандартизированный инструмент для **оценки спортивного сотрясения** у спортсменов ≥ 13 лет. Child-SCAT6 — для 8–12 лет.\n\n### Структура\n1. **Красные флаги** — немедленная госпитализация\n2. **Наблюдаемые признаки** (сознание, судороги, тонические позы)\n3. **Симптомы** (22 пункта × 0–6 = до 132)\n4. **Когнитивный скрининг** — ориентация, память, концентрация\n5. **Неврологический скрининг** (шея, зрение, координация)\n6. **Баланс** — mBESS (0–30 ошибок)\n7. **Отсроченное воспроизведение** (5–10 мин)\n\n### Красные флаги (любой → госпитализация)\n- Подозрение на травму шейного отдела\n- Потеря сознания > 1 мин\n- Судороги\n- Прогрессирующая головная боль / рвота\n- Нарастающий неврологический дефицит / спутанность\n- Слабость / парестезии конечностей\n\n### Критерии\nSCAT6 — сравнение с базовым значением. Отклонение ≥ 1 SD или значительные симптомы → вероятное сотрясение.\n\n### Интерпретация\n- Положительный SCAT → удаление с поля (\"When in doubt, sit them out\")\n- Градуированный return-to-sport (6 шагов × 24 ч минимум)\n- Повтор SCAT в 24–72 ч\n\n### Ограничения\n- Не диагностический инструмент — клиника первична\n- Симптомы могут появиться через 24–48 ч\n- Baseline-тестирование повышает точность\n- SCAT не чувствителен к посткоммоционному синдрому (> 4 нед)\n\n### Тактика\n- Немедленно: удаление с поля при малейшем подозрении\n- 24–48 ч: relative rest\n- Return-to-learn до return-to-play\n- Повторная оценка нейропсихологом при пролонгированных симптомах\n\n### Источник\nPatricios JS et al. **Consensus statement on concussion in sport: the 6th International Conference on Concussion in Sport — Amsterdam, October 2022.** *Br J Sports Med* 2023;57:695–711. McCrory 2017 (Berlin — SCAT5)."
  };

export default runner;
