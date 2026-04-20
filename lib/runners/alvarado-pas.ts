// @ts-nocheck
/**
 * Runner: alvarado-pas
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
    kind: "score",
    maxScore: 12,
    inputs: [
      {
        id: "rlqPain",
        label: "Боль в правой подвздошной области",
        type: "checkbox",
        points: 1
      },
      {
        id: "rebound",
        label: "Симптом Щёткина-Блюмберга",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкий",
            points: 1
          },
          {
            value: "2",
            label: "Средний",
            points: 2
          },
          {
            value: "3",
            label: "Сильный",
            points: 3
          }
        ]
      },
      {
        id: "fever",
        label: "Температура ≥38,5 °C",
        type: "checkbox",
        points: 1
      },
      {
        id: "wbc",
        label: "Лейкоциты",
        type: "select",
        options: [
          {
            value: "0",
            label: "<10 × 10⁹/л",
            points: 0
          },
          {
            value: "1",
            label: "10-14,9 × 10⁹/л",
            points: 1
          },
          {
            value: "2",
            label: "≥15 × 10⁹/л",
            points: 2
          }
        ]
      },
      {
        id: "neutro",
        label: "Нейтрофилы %",
        type: "select",
        options: [
          {
            value: "0",
            label: "<70%",
            points: 0
          },
          {
            value: "1",
            label: "70-84%",
            points: 1
          },
          {
            value: "2",
            label: "≥85%",
            points: 2
          }
        ]
      },
      {
        id: "crp",
        label: "CRP",
        type: "select",
        options: [
          {
            value: "0",
            label: "<10 мг/л",
            points: 0
          },
          {
            value: "1",
            label: "10-49 мг/л",
            points: 1
          },
          {
            value: "2",
            label: "≥50 мг/л",
            points: 2
          }
        ]
      },
      {
        id: "vomiting",
        label: "Рвота",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "0-4 (низкая вероятность)",
        color: "#22C55E",
        description: "AIR 0-4. Аппендицит маловероятен. Наблюдение.",
        actions: [
          "Амбулаторное наблюдение",
          "Возврат при ухудшении",
          "Альтернативный диагноз"
        ]
      },
      {
        min: 5,
        max: 8,
        label: "5-8 (промежуточная)",
        color: "#F59E0B",
        description: "AIR 5-8. Требуется визуализация (УЗИ / КТ / МРТ).",
        details: "Промежуточная вероятность - диагностическая неопределённость. УЗИ первая линия у детей (нет лучевой нагрузки); при неинформативном - МРТ или КТ.",
        actions: [
          "УЗИ брюшной полости / правой подвздошной области",
          "При сомнительном УЗИ - МРТ (у детей, беременных) или КТ",
          "Повторный осмотр через 2-4 ч",
          "Госпитализация для наблюдения"
        ]
      },
      {
        min: 9,
        max: 12,
        label: "9-12 (высокая вероятность)",
        color: "#EF4444",
        description: "AIR 9-12. Высокая вероятность аппендицита - хирургическая консультация.",
        details: "AIR ≥ 9 - высокая вероятность аппендицита. Ранняя хирургическая консультация, при явной клинике - аппендэктомия без дополнительной визуализации.",
        actions: [
          "Хирургическая консультация",
          "Голод, в/в жидкости, анальгезия",
          "АБ периоперационно (цефазолин + метронидазол)",
          "Визуализация только при диагностических сомнениях"
        ]
      }
    ],
    caveats: [
      "Здесь реализована AIR (Andersson 2008, 0-12). PAS Samuel (0-10) - альтернативная шкала с близкими бэндами (0-3 / 4-6 / 7-10)",
      "PAS Samuel создана именно для детей 4-15 лет (Samuel M. J Pediatr Surg 2002;37:877-881)",
      "У женщин - исключить гинекологические причины (внематочная, торсия, ВЗМП)",
      "У младенцев <3 лет аппендицит часто перфорированный к моменту диагностики",
      "Alvarado (взрослые) - см. отдельный инструмент"
    ],
    related: [
      {
        id: "alvarado",
        title: "Alvarado (взрослые)"
      },
      {
        id: "pews",
        title: "PEWS"
      },
      {
        id: "imci",
        title: "IMCI"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Andersson M, Andersson RE. The appendicitis inflammatory response score: a tool for the diagnosis of acute appendicitis. World J Surg 2008;32:1843-1849. Samuel M. Pediatric appendicitis score. J Pediatr Surg 2002;37:877-881.",
    countries: "Международный",
    presets: [
      {
        label: "Низкий риск",
        values: {
          rlqPain: false,
          rebound: "0",
          fever: false,
          wbc: "0",
          neutro: "0",
          crp: "0",
          vomiting: false
        }
      },
      {
        label: "Промежуточный",
        values: {
          rlqPain: true,
          rebound: "1",
          fever: false,
          wbc: "1",
          neutro: "1",
          crp: "1",
          vomiting: false
        }
      },
      {
        label: "Высокая вероятность",
        values: {
          rlqPain: true,
          rebound: "3",
          fever: true,
          wbc: "2",
          neutro: "2",
          crp: "2",
          vomiting: true
        }
      }
    ],
    info: "### Для чего используется\n**PAS (Samuel 2002) и AIR (Andersson 2008)** - педиатрические/обобщённые шкалы вероятности острого аппендицита.\n\n### PAS (Samuel, 0-10) - педиатрическая\n| Критерий | Баллы |\n|---|---|\n| Миграция боли | 1 |\n| Анорексия | 1 |\n| Тошнота/рвота | 1 |\n| Болезненность RLQ | 2 |\n| Болезненность при кашле/перкуссии | 2 |\n| Лихорадка ≥38 °C | 1 |\n| Лейкоцитоз ≥10×10⁹/л | 1 |\n| Нейтрофильный сдвиг ≥75% | 1 |\n\n**Интерпретация:** 0-3 низкая · 4-6 промежут. · 7-10 высокая.\n\n### AIR (Andersson, 0-12) - расширенная\n| Критерий | Баллы |\n|---|---|\n| RLQ-боль | 1 |\n| Щёткин-Блюмберг: слабый/средний/сильный | 1/2/3 |\n| Температура ≥38,5 | 1 |\n| Лейкоциты 10-14,9 / ≥15 | 1/2 |\n| Нейтрофилы 70-84% / ≥85% | 1/2 |\n| CRP 10-49 / ≥50 | 1/2 |\n| Рвота | 1 |\n\n**Интерпретация:** 0-4 низкая · 5-8 промежут. · 9-12 высокая.\n\n### Преимущества AIR\n- Лучшая специфичность чем Alvarado\n- Включает CRP (не учитывается в PAS/Alvarado)\n- Валидирована у детей и взрослых\n\n### Ограничения\n- У детей <3 лет специфичность ниже (атипичная презентация)\n- У женщин репродуктивного возраста - гинекологический дифф\n- Беременные - МРТ вместо КТ\n\n### Тактика\n- **Низкая (0-4)**: амбулаторное наблюдение\n- **Промежут. (5-8)**: УЗИ → МРТ/КТ при неинформативности\n- **Высокая (9-12)**: хирургическая консультация, аппендэктомия\n\n### Источник\nAndersson M, Andersson RE. *World J Surg* 2008;32:1843-1849. Samuel M. *J Pediatr Surg* 2002;37:877-881."
  };

export default runner;
