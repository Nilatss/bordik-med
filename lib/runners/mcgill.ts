/**
 * Runner: mcgill
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
    maxScore: 220,
    inputs: [
      {
        id: "d1",
        label: "Пульсирующая (throbbing)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d2",
        label: "Стреляющая (shooting)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d3",
        label: "Колющая (stabbing)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d4",
        label: "Острая (sharp)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d5",
        label: "Спазматическая (cramping)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d6",
        label: "Грызущая (gnawing)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d7",
        label: "Жгучая (hot-burning)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d8",
        label: "Ноющая (aching)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d9",
        label: "Тяжесть (heavy)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d10",
        label: "Болезненная при прикосновении (tender)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d11",
        label: "Раскалывающая (splitting)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d12",
        label: "Изматывающая (tiring-exhausting)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d13",
        label: "Тошнотворная (sickening)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d14",
        label: "Пугающая (fearful)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d15",
        label: "Наказывающая/жестокая (punishing-cruel)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d16",
        label: "Электрические разряды (electric-shock)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d17",
        label: "Холодно-замораживающая (cold-freezing)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d18",
        label: "Пронизывающая (piercing)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d19",
        label: "Лёгкое касание вызывает боль (light touch is painful)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d20",
        label: "Зуд (itching)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d21",
        label: "Покалывание / иголки (tingling/pins-and-needles)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      },
      {
        id: "d22",
        label: "Онемение (numbness)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (0)",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкая (3)",
            points: 3
          },
          {
            value: "6",
            label: "Умеренная (6)",
            points: 6
          },
          {
            value: "10",
            label: "Сильная (10)",
            points: 10
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 22,
        label: "0-22 (минимальная)",
        color: "#22C55E",
        description: "Минимальный болевой профиль."
      },
      {
        min: 23,
        max: 66,
        label: "23-66 (умеренная)",
        color: "#84CC16",
        description: "Умеренный профиль - рассмотреть анальгезию."
      },
      {
        min: 67,
        max: 132,
        label: "67-132 (выраженная)",
        color: "#F59E0B",
        description: "Выраженный профиль. Оценить нейропатический компонент (DN4)."
      },
      {
        min: 133,
        max: 220,
        label: "133-220 (тяжёлая)",
        color: "#EF4444",
        description: "Тяжёлый, многокомпонентный болевой синдром.",
        details: "Выраженный балл по SF-MPQ-2, особенно с преобладанием нейропатических дескрипторов (жжение, удары тока, иголки, онемение), указывает на смешанный/нейропатический синдром. Учитывать аффективный компонент (пугающая, наказывающая) - предиктор плохого ответа на монотерапию.",
        actions: [
          "Подтвердить нейропатию: DN4 ≥ 4 → прегабалин/габапентин, дулоксетин, ТЦА",
          "При онко-боли - сильные опиоиды + адъюванты",
          "Психологическая поддержка, КПТ - уменьшает аффективный компонент",
          "Междисциплинарный подход (болевая клиника) при хронической боли > 3 мес"
        ]
      }
    ],
    caveats: [
      "SF-MPQ-2 - исследовательский инструмент; в рутинной клинике достаточно VAS + DN4",
      "Заполнение требует 5-10 мин и хорошего владения языком (тонкие дескрипторы)",
      "4 подшкалы: continuous, intermittent, neuropathic, affective - анализируются отдельно",
      "Не валидирован у детей и когнитивно нарушенных"
    ],
    related: [
      {
        id: "dn4",
        title: "DN4 (нейропатическая)"
      },
      {
        id: "bpi",
        title: "BPI"
      },
      {
        id: "vas",
        title: "VAS/NRS"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Dworkin RH et al. Development and initial validation of an expanded and revised version of the Short-Form McGill Pain Questionnaire (SF-MPQ-2). *Pain* 2009; 144:35-42.",
    countries: "Международный (IMMPACT)",
    info: "### Для чего используется\n**SF-MPQ-2 (Dworkin 2009)** - короткая обновлённая версия опросника McGill (оригинал Melzack 1975). Оценивает **качественные характеристики** боли, а не только интенсивность. Особенно полезен для:\n\n- Дифференциации ноцицептивной и нейропатической боли\n- Клинических исследований\n- Оценки хронической боли\n\n### Компоненты (22 дескриптора × 0-10)\nКаждый дескриптор рейтингуется 0 (нет) - 10 (максимально). Суммарно 0-220.\n\n### 4 подшкалы\n| Подшкала | Дескрипторы |\n|---|---|\n| **Continuous** | Пульсирующая, грызущая, жгучая, ноющая, тяжесть, болезненная при прикосновении |\n| **Intermittent** | Стреляющая, колющая, острая, спазматическая, раскалывающая |\n| **Neuropathic** | Жгучая, электрические разряды, холод-мороз, лёгкое касание больно, зуд, покалывание, онемение |\n| **Affective** | Изматывающая, тошнотворная, пугающая, жестокая |\n\n### Интерпретация\nСуммарный балл и соотношение подшкал. Высокая **нейропатическая** субшкала → подтвердить DN4; высокая **аффективная** → психологическое сопровождение.\n\n### Ограничения\n- Самозаполняемый - требует сохранной когнитивной функции и грамотности\n- Трудоёмкий для рутинной клиники - чаще в исследованиях\n- Культурные переводы требуют валидации (RU-версии существуют)\n\n### Тактика\nОриентируется на профиль:\n- Нейропатический: габапентиноиды, дулоксетин, ТЦА, местно лидокаин\n- Воспалительный/ноцицептивный: НПВС, опиоиды\n- Аффективный компонент: КПТ, дулоксетин, mindfulness"
  };

export default runner;
