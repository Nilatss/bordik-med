/**
 * Runner: edacs
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
    maxScore: 34,
    inputs: [
      {
        id: "age",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "18",
            label: "18-45",
            points: 2
          },
          {
            value: "46",
            label: "46-50",
            points: 4
          },
          {
            value: "51",
            label: "51-55",
            points: 6
          },
          {
            value: "56",
            label: "56-60",
            points: 8
          },
          {
            value: "61",
            label: "61-65",
            points: 10
          },
          {
            value: "66",
            label: "66-70",
            points: 12
          },
          {
            value: "71",
            label: "71-75",
            points: 14
          },
          {
            value: "76",
            label: "≥ 76",
            points: 16
          }
        ]
      },
      {
        id: "male",
        label: "Мужской пол",
        type: "checkbox",
        points: 6
      },
      {
        id: "rf",
        label: "ИБС в анамнезе или ≥ 3 ФР (только возраст 18-50)",
        type: "checkbox",
        points: 4
      },
      {
        id: "diaph",
        label: "Диафорез",
        type: "checkbox",
        points: 3
      },
      {
        id: "radiate",
        label: "Иррадиация в руку/плечо/шею/челюсть",
        type: "checkbox",
        points: 5
      },
      {
        id: "insp",
        label: "Боль усиливается на вдохе",
        type: "checkbox",
        points: -4
      },
      {
        id: "palp",
        label: "Боль воспроизводится при пальпации",
        type: "checkbox",
        points: -6
      }
    ],
    bands: [
      {
        min: -10,
        max: 15,
        label: "< 16 (низкий)",
        color: "#22C55E",
        description: "30-дн. MACE < 1 % при норме ЭКГ и тропонина 0/2 ч.",
        details: "EDACS-ADP: при EDACS < 16 + негативный hs-cTn на 0 и 2 часа + отсутствие ишемических изменений на ЭКГ - возможна выписка из ED с амбулаторным обследованием.",
        actions: [
          "Повтор hs-cTn через 2 ч",
          "ЭКГ при появлении боли",
          "Амбулаторное обследование (стресс-тест / КТ-коронарография) в течение 72 ч"
        ]
      },
      {
        min: 16,
        max: 34,
        label: "≥ 16 (не низкий)",
        color: "#EF4444",
        description: "Риск MACE выше порога для ранней выписки.",
        details: "Требуется расширенное обследование в стационаре: серийные тропонины, дополнительная визуализация, консультация кардиолога.",
        actions: [
          "Госпитализация в chest-pain unit / кардиологию",
          "Серийные hs-cTn",
          "Стресс-тест или КТ-коронарография",
          "ASA + антикоагулянт при высокой вероятности ОКС"
        ]
      }
    ],
    reference: "Than M et al. Emerg Med Australas 2014;26:34. Flaws D. EDACS-ADP валидация 2015.",
    countries: "Австралия · Н.Зеландия · международная",
    caveats: [
      "Не использовать при явном STEMI на ЭКГ - сразу реперфузия",
      "ФР (+4) засчитываются только при возрасте 18-50 лет",
      "Требует hs-cTn на 0 и 2 ч для EDACS-ADP алгоритма",
      "Валидирован в ED; амбулаторная применимость ограничена"
    ],
    related: [
      {
        id: "heart",
        title: "HEART score"
      },
      {
        id: "timi",
        title: "TIMI (UA/NSTEMI)"
      },
      {
        id: "esc-nste",
        title: "ESC 0/1h hs-cTn"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    info: "### Для чего используется\n**EDACS (Emergency Department Assessment of Chest pain Score)** - оценка 30-дневного риска MACE у пациентов с болью в грудной клетке в ED с целью **ранней безопасной выписки**.\n\n### Критерии\nСумма баллов по возрасту (2-16) + пол + клинические модификаторы + - палпаторная воспроизводимость и усиление на вдохе снижают счёт.\n\n### EDACS-ADP алгоритм (accelerated diagnostic protocol)\nНизкий риск, допускающий выписку:\n- EDACS < 16 **И**\n- ЭКГ без ишемических изменений **И**\n- hs-cTn негативный на 0 и 2 часа\n\n### Интерпретация\n| Баллы | Риск 30-дн. MACE | Тактика |\n|---|---|---|\n| < 16 + критерии | < 1 % | Выписка + амбулаторное обследование |\n| ≥ 16 или +тропонин / ЭКГ | > 1 % | Госпитализация, серийные тропонины |\n\n### Ограничения\n- Не заменяет клиническое мышление при атипичной презентации\n- Нельзя применять при STEMI, нестабильной гемодинамике, аритмии\n- Валидация преимущественно в странах Asia-Pacific\n\n### Тактика\n- **Низкий риск** - выписка, повтор через 72 ч в амбулаторных условиях\n- **Не низкий** - наблюдение, стресс-тест / КТА / КАГ по показаниям"
  };

export default runner;
