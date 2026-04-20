// @ts-nocheck
/**
 * Runner: child-meld
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
    maxScore: 15,
    inputs: [
      {
        id: "asc",
        label: "Асцит",
        type: "select",
        options: [
          {
            value: "1",
            label: "Нет",
            points: 1
          },
          {
            value: "2",
            label: "Умеренный (контролируемый диуретиками)",
            points: 2
          },
          {
            value: "3",
            label: "Резистентный",
            points: 3
          }
        ]
      },
      {
        id: "enc",
        label: "Энцефалопатия",
        type: "select",
        options: [
          {
            value: "1",
            label: "Нет",
            points: 1
          },
          {
            value: "2",
            label: "I-II ст.",
            points: 2
          },
          {
            value: "3",
            label: "III-IV ст.",
            points: 3
          }
        ]
      },
      {
        id: "bili",
        label: "Билирубин (мкмоль/л)",
        type: "select",
        options: [
          {
            value: "1",
            label: "<34",
            points: 1
          },
          {
            value: "2",
            label: "34-50",
            points: 2
          },
          {
            value: "3",
            label: ">50",
            points: 3
          }
        ]
      },
      {
        id: "alb",
        label: "Альбумин (г/л)",
        type: "select",
        options: [
          {
            value: "1",
            label: ">35",
            points: 1
          },
          {
            value: "2",
            label: "28-35",
            points: 2
          },
          {
            value: "3",
            label: "<28",
            points: 3
          }
        ]
      },
      {
        id: "inr",
        label: "INR",
        type: "select",
        options: [
          {
            value: "1",
            label: "<1.7",
            points: 1
          },
          {
            value: "2",
            label: "1.7-2.3",
            points: 2
          },
          {
            value: "3",
            label: ">2.3",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 5,
        max: 6,
        label: "Класс A (5-6)",
        color: "#22C55E",
        description: "1-летняя выживаемость ~100%. Компенсированный цирроз."
      },
      {
        min: 7,
        max: 9,
        label: "Класс B (7-9)",
        color: "#F59E0B",
        description: "~80% / 2 года 60%. Субкомпенсация."
      },
      {
        min: 10,
        max: 15,
        label: "Класс C (10-15)",
        color: "#EF4444",
        description: "~45% / 2 года 35%. Декомпенсация, рассмотреть трансплантацию.",
        details: "Декомпенсированный цирроз. Направить в трансплант-центр. MELD/MELD-Na точнее для листа ожидания.",
        actions: [
          "Скрининг и лечение осложнений: асцит, SBP, варикоз, HRS, HE",
          "Эндоскопия для варикоза + β-блокаторы / лигирование",
          "Парацентез-контроль, SBP профилактика (норфлоксацин)",
          "Оценка на трансплантацию (MELD, MELD-Na)"
        ]
      }
    ],
    caveats: [
      "Субъективные компоненты: асцит и энцефалопатия",
      "Не учитывает почечную функцию - MELD/MELD-Na точнее при HRS",
      "Альбумин и билирубин могут измениться при ОПП/холестазе без прогрессии цирроза",
      "Для листа ожидания трансплантации используется MELD, не Child-Pugh"
    ],
    relatedCourses: [
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "meld",
        title: "MELD"
      },
      {
        id: "maddrey",
        title: "Maddrey DF"
      },
      {
        id: "lille",
        title: "Lille (ГКС-ответ)"
      }
    ],
    reference: "Pugh 1973 (модификация Child-Turcotte). Прогноз цирроза.",
    info: "### Для чего используется\n**Child-Pugh (Child-Turcotte-Pugh, CTP)** - классическая шкала прогноза выживаемости при **циррозе печени**. Используется для стратификации тяжести, оценки операционного риска у цирротиков, выбора дозы некоторых препаратов.\n\n### Компоненты\nПять параметров, каждый 1-3 балла:\n\n| Параметр | 1 балл | 2 балла | 3 балла |\n|---|---|---|---|\n| Асцит | Нет | Умеренный (контролируемый) | Резистентный |\n| Энцефалопатия | Нет | I-II ст. | III-IV ст. |\n| Билирубин | < 34 мкмоль/л | 34-50 | > 50 |\n| Альбумин | > 35 г/л | 28-35 | < 28 |\n| INR | < 1,7 | 1,7-2,3 | > 2,3 |\n\n### Классы и выживаемость\n| Класс | Баллы | 1-летняя | 2-летняя |\n|---|---|---|---|\n| A - компенсированный | 5-6 | ~ 100 % | 85 % |\n| B - субкомпенсированный | 7-9 | 80 % | 60 % |\n| C - декомпенсированный | 10-15 | 45 % | 35 % |\n\n### Применение\n| Ситуация | Рекомендация |\n|---|---|\n| Плановая операция у цирротика | Класс A - обычно возможно; B - высокий риск; C - избегать (50 % смертность) |\n| Лист трансплантации | Исторически (сейчас - MELD). Класс C - приоритет |\n| TIPS | Класс A/B по возможности; C - высокий риск печёночной энцефалопатии |\n| Дозирование лекарств | Коррекция по CTP: седативные, β-блокаторы, антикоагулянты |\n\n### Child-Pugh vs MELD\n| | Child-Pugh | MELD |\n|---|---|---|\n| Субъективность | Есть (асцит, энцефалопатия) | Нет (только лаб.) |\n| Клинич. оценка | Включена | Не учитывает асцит/энцефалопатию |\n| Применение | Общий прогноз цирроза | Трансплантация, 3-мес смертность |\n\n### Ограничения\n- Субъективные параметры (асцит, энцефалопатия) → вариабельность\n- Не учитывает причину цирроза\n- Не применим при острой печёночной недостаточности"
  };

export default runner;
