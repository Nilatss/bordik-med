// @ts-nocheck
/**
 * Runner: nips
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
    maxScore: 7,
    inputs: [
      {
        id: "face",
        label: "Выражение лица",
        type: "select",
        options: [
          {
            value: "0",
            label: "Расслаблено",
            points: 0
          },
          {
            value: "1",
            label: "Гримаса",
            points: 1
          }
        ]
      },
      {
        id: "cry",
        label: "Плач",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет плача",
            points: 0
          },
          {
            value: "1",
            label: "Хныкает (лёгкий стон)",
            points: 1
          },
          {
            value: "2",
            label: "Громкий плач",
            points: 2
          }
        ]
      },
      {
        id: "breathing",
        label: "Дыхание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Спокойное, обычное",
            points: 0
          },
          {
            value: "1",
            label: "Изменённое (неравномерное, тахипноэ, задержки)",
            points: 1
          }
        ]
      },
      {
        id: "arms",
        label: "Руки",
        type: "select",
        options: [
          {
            value: "0",
            label: "Расслаблены",
            points: 0
          },
          {
            value: "1",
            label: "Согнуты/вытянуты, напряжены",
            points: 1
          }
        ]
      },
      {
        id: "legs",
        label: "Ноги",
        type: "select",
        options: [
          {
            value: "0",
            label: "Расслаблены",
            points: 0
          },
          {
            value: "1",
            label: "Согнуты/вытянуты, напряжены",
            points: 1
          }
        ]
      },
      {
        id: "state",
        label: "Состояние возбуждения",
        type: "select",
        options: [
          {
            value: "0",
            label: "Сон/спокойное бодрствование",
            points: 0
          },
          {
            value: "1",
            label: "Беспокойство, суетливость",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (нет / минимальная)",
        color: "#22C55E",
        description: "Нет значимой боли."
      },
      {
        min: 3,
        max: 3,
        label: "3 (умеренная)",
        color: "#F59E0B",
        description: "Умеренная боль - вмешательство."
      },
      {
        min: 4,
        max: 7,
        label: ">3 (выраженная)",
        color: "#EF4444",
        description: "Выраженная боль - аналгезия.",
        details: "NIPS > 3 требует вмешательства. У новорождённых приоритет немедикаментозных методов (сукроза, грудь, контакт \"кожа-к-коже\"); опиоиды - только по строгим показаниям из-за риска апноэ.",
        actions: [
          "Сукроза 24% 0,1-0,5 мл p/o за 2 мин до процедуры",
          "Контакт \"кожа-к-коже\" (kangaroo care), грудное кормление",
          "Парацетамол 10-15 мг/кг p/o или 7,5 мг/кг в/в (доношенные)",
          "При послеоперационной боли - морфин 0,02-0,05 мг/кг в/в с мониторингом SpO₂ и апноэ"
        ]
      }
    ],
    caveats: [
      "Валидирована для новорождённых 0-6 мес; для недоношенных точнее PIPP-R",
      "Различные источники дают разный максимум (6 или 7) - здесь 7 по оригинальной шкале Lawrence",
      "Седация, паралич, ИВЛ искажают оценку - использовать N-PASS",
      "Оценка должна быть перед, во время и после болезненной процедуры"
    ],
    related: [
      {
        id: "flacc",
        title: "FLACC"
      },
      {
        id: "apgar",
        title: "Apgar"
      },
      {
        id: "wong-baker",
        title: "Wong-Baker FACES"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия 0-2"
      }
    ],
    reference: "Lawrence J et al. The development of a tool to assess neonatal pain. *Neonatal Netw* 1993; 12:59-66.",
    countries: "Международный",
    info: "### Для чего используется\n**NIPS (Neonatal Infant Pain Scale, Lawrence 1993)** - наблюдательная шкала боли у новорождённых **0-6 мес**. Применяется до/во время/после болезненных процедур (венепункция, пятка, дренаж) и при послеоперационной боли.\n\n### Компоненты (6 параметров)\n| Параметр | Диапазон |\n|---|---|\n| Выражение лица | 0-1 |\n| Плач | 0-2 |\n| Дыхание | 0-1 |\n| Руки | 0-1 |\n| Ноги | 0-1 |\n| Состояние возбуждения | 0-1 |\n\nСумма: **0-7**.\n\n### Интерпретация\n- 0-2: нет боли\n- 3: умеренная\n- **> 3: вмешательство**\n\n### Альтернативы\n| Шкала | Ниша |\n|---|---|\n| **CRIES** (0-10) | Постоперационная боль новорождённых |\n| **N-PASS** | Недоношенные, седированные |\n| **PIPP-R** | Недоношенные < 36 нед - учитывает гестационный возраст |\n| **COMFORT-B** | Седация + боль в ОРИТ |\n\n### Ограничения\n- Не применять у глубоко седированных - N-PASS\n- У недоношенных оценка тонуса и реакций занижена - PIPP-R\n- Требует наблюдения ≥ 1 мин до, во время и после\n\n### Тактика\nСтупенчато:\n1. Сукроза 24 %, грудное молоко, пеленание, kangaroo care\n2. Парацетамол 10-15 мг/кг\n3. Морфин 0,02-0,05 мг/кг в/в (только с мониторингом)\n\n### Источник\nLawrence J et al. *Neonatal Netw* 1993; 12:59-66."
  };

export default runner;
