// @ts-nocheck
/**
 * Runner: nrs2002
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
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
    maxScore: 7,
    inputs: [
      {
        id: "nutrition",
        label: "Нарушение нутритивного статуса",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 — норма",
            points: 0
          },
          {
            value: "1",
            label: "1 — потеря > 5 % за 3 мес ИЛИ приём 50–75 % за последнюю неделю",
            points: 1
          },
          {
            value: "2",
            label: "2 — потеря > 5 % за 2 мес ИЛИ ИМТ 18,5–20,5 + ухудшение общего состояния ИЛИ приём 25–60 %",
            points: 2
          },
          {
            value: "3",
            label: "3 — потеря > 5 % за 1 мес (> 15 % за 3 мес) ИЛИ ИМТ < 18,5 + плохое состояние ИЛИ приём < 25 %",
            points: 3
          }
        ]
      },
      {
        id: "severity",
        label: "Тяжесть заболевания (стресс-метаболизм)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 — норма",
            points: 0
          },
          {
            value: "1",
            label: "1 — перелом бедра, хронические болезни (ХОБЛ, цирроз, диабет, онко), диализ",
            points: 1
          },
          {
            value: "2",
            label: "2 — большая абдоминальная операция, инсульт, тяжёлая пневмония, гемобластоз",
            points: 2
          },
          {
            value: "3",
            label: "3 — ОРИТ APACHE II > 10, ЧМТ, ТГСК",
            points: 3
          }
        ]
      },
      {
        id: "age70",
        label: "Возраст ≥ 70 лет",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "< 3 — риска нет",
        color: "#22C55E",
        description: "Нет нутритивного риска.",
        actions: [
          "Повторный скрининг еженедельно (стационар)",
          "Документировать приём пищи и вес"
        ]
      },
      {
        min: 3,
        max: 7,
        label: "≥ 3 — нутритивный риск",
        color: "#EF4444",
        description: "Есть нутритивный риск — показан план нутритивной поддержки.",
        details: "Составить план питания: цель 25–30 ккал/кг/сут (30 в реабилитации), белок 1,2–1,5 г/кг/сут. При невозможности энтерального — комбинированное/парентеральное. Мониторинг refeeding-синдрома первые 4–7 дней.",
        actions: [
          "Консультация клинического диетолога",
          "Цель: 25–30 ккал/кг/сут, белок 1,2–1,5 г/кг/сут",
          "ONS → энтеральное → парентеральное (по алгоритму ESPEN)",
          "Контроль фосфора, калия, магния (refeeding)",
          "Переоценка еженедельно"
        ]
      }
    ],
    caveats: [
      "NRS-2002 — стандарт ESPEN для стационаров",
      "Не валидирован в ОРИТ — используйте NUTRIC",
      "Не для детей — используйте STRONGkids / STAMP",
      "ИМТ 18,5–20,5 как порог отражает европейские рекомендации"
    ],
    related: [
      {
        id: "must",
        title: "MUST"
      },
      {
        id: "nutric",
        title: "NUTRIC"
      },
      {
        id: "glim",
        title: "GLIM criteria"
      }
    ],
    relatedCourses: [
      {
        id: "202.3",
        title: "Метаболизм"
      },
      {
        id: "300.4",
        title: "Неотложная"
      }
    ],
    reference: "Kondrup J, Rasmussen HH, Hamberg O, Stanga Z. Nutritional Risk Screening (NRS-2002). Clin Nutr 2003; 22:321–336.",
    countries: "Европа (ESPEN) · Международный",
    presets: [
      {
        label: "Нет риска",
        values: {
          nutrition: "0",
          severity: "0",
          age70: false
        }
      },
      {
        label: "Умеренный риск (пожилой)",
        values: {
          nutrition: "1",
          severity: "1",
          age70: true
        }
      },
      {
        label: "Высокий риск (ОРИТ)",
        values: {
          nutrition: "2",
          severity: "3",
          age70: true
        }
      }
    ],
    info: "### Для чего используется\n**NRS-2002** — скрининг нутритивного риска в стационаре. Рекомендован ESPEN как стандартный инструмент для взрослых пациентов.\n\n### Алгоритм\n**Предварительный скрининг** (4 вопроса): ИМТ < 20,5? Потеря веса за 3 мес? Снижение приёма пищи на прошлой неделе? Тяжёлое заболевание? — если хотя бы один «да», проводится основная оценка.\n\n**Основная оценка**:\n| Компонент | Баллы |\n|---|---|\n| Нутритивный статус | 0–3 |\n| Тяжесть заболевания | 0–3 |\n| Возраст ≥ 70 лет | +1 |\n\n### Интерпретация\n| Сумма | Риск | Тактика |\n|---|---|---|\n| < 3 | Нет | Повторный скрининг еженедельно |\n| ≥ 3 | Есть | Нутритивная поддержка + диетолог |\n\n### Ограничения\n- Не валидирован в ОРИТ (используйте NUTRIC)\n- Не для детей\n- Не диагноз — скрининг\n\n### Тактика\n- **≥ 3 баллов** — 25–30 ккал/кг/сут, белок 1,2–1,5 г/кг/сут\n- Следить за refeeding (P, K, Mg) первые 4–7 дней\n- ESPEN алгоритм: ONS → энтеральное → смешанное → парентеральное\n\n### Источник\nKondrup J et al. *Clin Nutr* 2003; 22:321–336. ESPEN guidelines on hospital nutrition. *Clin Nutr* 2021."
  };

export default runner;
