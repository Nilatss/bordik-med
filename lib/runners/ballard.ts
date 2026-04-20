// @ts-nocheck
/**
 * Runner: ballard
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
    maxScore: 50,
    inputs: [
      {
        id: "posture",
        label: "Поза",
        type: "select",
        options: [
          {
            value: "0",
            label: "Полное разгибание",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкое сгибание бёдер",
            points: 1
          },
          {
            value: "2",
            label: "Сгибание бёдер и колен",
            points: 2
          },
          {
            value: "3",
            label: "Все конечности согнуты, руки ротированы",
            points: 3
          },
          {
            value: "4",
            label: "Полная гипертония флексоров",
            points: 4
          }
        ]
      },
      {
        id: "square",
        label: "Симптом \"квадратного окна\" (запястье)",
        type: "select",
        options: [
          {
            value: "-1",
            label: "> 90°",
            points: -1
          },
          {
            value: "0",
            label: "90°",
            points: 0
          },
          {
            value: "1",
            label: "60°",
            points: 1
          },
          {
            value: "2",
            label: "45°",
            points: 2
          },
          {
            value: "3",
            label: "30°",
            points: 3
          },
          {
            value: "4",
            label: "0°",
            points: 4
          }
        ]
      },
      {
        id: "armrecoil",
        label: "Отдача рук",
        type: "select",
        options: [
          {
            value: "0",
            label: "180°",
            points: 0
          },
          {
            value: "1",
            label: "140-180°",
            points: 1
          },
          {
            value: "2",
            label: "110-140°",
            points: 2
          },
          {
            value: "3",
            label: "90-110°",
            points: 3
          },
          {
            value: "4",
            label: "< 90°",
            points: 4
          }
        ]
      },
      {
        id: "poplit",
        label: "Подколенный угол",
        type: "select",
        options: [
          {
            value: "-1",
            label: "180°",
            points: -1
          },
          {
            value: "0",
            label: "160°",
            points: 0
          },
          {
            value: "1",
            label: "140°",
            points: 1
          },
          {
            value: "2",
            label: "120°",
            points: 2
          },
          {
            value: "3",
            label: "100°",
            points: 3
          },
          {
            value: "4",
            label: "90°",
            points: 4
          },
          {
            value: "5",
            label: "< 90°",
            points: 5
          }
        ]
      },
      {
        id: "scarf",
        label: "Симптом \"шарфа\"",
        type: "select",
        options: [
          {
            value: "-1",
            label: "Локоть за среднеключичной линией противоположной стороны",
            points: -1
          },
          {
            value: "0",
            label: "Локоть на противоп. среднеключичной",
            points: 0
          },
          {
            value: "1",
            label: "Локоть заходит за середину",
            points: 1
          },
          {
            value: "2",
            label: "Локоть на середине",
            points: 2
          },
          {
            value: "3",
            label: "Локоть не доходит до середины",
            points: 3
          },
          {
            value: "4",
            label: "Локоть у своей стороны",
            points: 4
          }
        ]
      },
      {
        id: "heel",
        label: "Пятка к уху",
        type: "select",
        options: [
          {
            value: "-1",
            label: "Свободно",
            points: -1
          },
          {
            value: "0",
            label: "Почти касается",
            points: 0
          },
          {
            value: "1",
            label: "Не доходит до носа",
            points: 1
          },
          {
            value: "2",
            label: "Не доходит до соска",
            points: 2
          },
          {
            value: "3",
            label: "Не доходит до пупка",
            points: 3
          },
          {
            value: "4",
            label: "Не ниже паха",
            points: 4
          }
        ]
      },
      {
        id: "skin",
        label: "Кожа",
        type: "select",
        options: [
          {
            value: "-1",
            label: "Клейкая, хрупкая, прозрачная",
            points: -1
          },
          {
            value: "0",
            label: "Желатиновая, красная, полупрозрачная",
            points: 0
          },
          {
            value: "1",
            label: "Гладкая, розовая, видны вены",
            points: 1
          },
          {
            value: "2",
            label: "Поверхностное шелушение/сыпь, мало вен",
            points: 2
          },
          {
            value: "3",
            label: "Трещины, бледные участки, редкие вены",
            points: 3
          },
          {
            value: "4",
            label: "Пергаментная, глубокие трещины, вен нет",
            points: 4
          },
          {
            value: "5",
            label: "Кожа как дубленая, морщинистая",
            points: 5
          }
        ]
      },
      {
        id: "lanugo",
        label: "Лануго",
        type: "select",
        options: [
          {
            value: "-1",
            label: "Нет",
            points: -1
          },
          {
            value: "0",
            label: "Редкое",
            points: 0
          },
          {
            value: "1",
            label: "Обильное",
            points: 1
          },
          {
            value: "2",
            label: "Истончается",
            points: 2
          },
          {
            value: "3",
            label: "Голые участки",
            points: 3
          },
          {
            value: "4",
            label: "Преимущественно голая кожа",
            points: 4
          }
        ]
      },
      {
        id: "plantar",
        label: "Поверхность стопы",
        type: "select",
        options: [
          {
            value: "-2",
            label: "Пятка-палец 40-50 мм = -1; < 40 мм = -2",
            points: -2
          },
          {
            value: "-1",
            label: "Пятка-палец 40-50 мм",
            points: -1
          },
          {
            value: "0",
            label: "> 50 мм, нет складок",
            points: 0
          },
          {
            value: "1",
            label: "Слабые красные отметки",
            points: 1
          },
          {
            value: "2",
            label: "Только передняя поперечная складка",
            points: 2
          },
          {
            value: "3",
            label: "Складки 2/3 стопы",
            points: 3
          },
          {
            value: "4",
            label: "Складки по всей поверхности",
            points: 4
          }
        ]
      },
      {
        id: "breast",
        label: "Молочная железа",
        type: "select",
        options: [
          {
            value: "-1",
            label: "Неощутима",
            points: -1
          },
          {
            value: "0",
            label: "Едва пальпируется",
            points: 0
          },
          {
            value: "1",
            label: "Плоский ареол, нет узла",
            points: 1
          },
          {
            value: "2",
            label: "Пятнистый ареол, узел 1-2 мм",
            points: 2
          },
          {
            value: "3",
            label: "Выпуклый ареол, узел 3-4 мм",
            points: 3
          },
          {
            value: "4",
            label: "Полный ареол, узел 5-10 мм",
            points: 4
          }
        ]
      },
      {
        id: "eye",
        label: "Глаз / ухо",
        type: "select",
        options: [
          {
            value: "-2",
            label: "Веки сращены, плотно",
            points: -2
          },
          {
            value: "-1",
            label: "Веки сращены, рыхло",
            points: -1
          },
          {
            value: "0",
            label: "Pinna плоская, не возвращается",
            points: 0
          },
          {
            value: "1",
            label: "Слабый изгиб, медленное возвращение",
            points: 1
          },
          {
            value: "2",
            label: "Хорошо изогнутая, мягкая, быстрое возвращение",
            points: 2
          },
          {
            value: "3",
            label: "Сформирована, твёрдая, мгновенное возвращение",
            points: 3
          },
          {
            value: "4",
            label: "Плотный хрящ, жёсткое ухо",
            points: 4
          }
        ]
      },
      {
        id: "genital",
        label: "Гениталии",
        type: "select",
        options: [
          {
            value: "-1",
            label: "Мошонка плоская / клитор и половые губы выступают",
            points: -1
          },
          {
            value: "0",
            label: "Мошонка пустая с мелкими складками / клитор заметен, малые губы малы",
            points: 0
          },
          {
            value: "1",
            label: "Яички в верхней мошонке / клитор заметен, малые губы увеличены",
            points: 1
          },
          {
            value: "2",
            label: "Яички опущены, мало складок / большие/малые губы одинаковы",
            points: 2
          },
          {
            value: "3",
            label: "Яички опущены, хорошо выражены складки / большие губы крупнее",
            points: 3
          },
          {
            value: "4",
            label: "Яички висят, глубокие складки / большие губы покрывают клитор",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: -10,
        max: 5,
        label: "≤ 5 (20-24 нед)",
        color: "#991B1B",
        description: "Крайне недоношенный. Граница жизнеспособности.",
        details: "GA ≈ 20-24 нед. Очень высокая смертность, требует III уровня и сурфактанта.",
        actions: [
          "Интубация при необходимости, сурфактант",
          "Согревание, термонейтральная среда",
          "Мультидисциплинарный совет по жизнеспособности"
        ]
      },
      {
        min: 6,
        max: 20,
        label: "10-20 (25-28 нед)",
        color: "#EF4444",
        description: "Глубоко недоношенный.",
        details: "GA ≈ 25-28 нед. Высокий риск РДС, IVH, NEC, ROP.",
        actions: [
          "nCPAP / INSURE, мониторинг SpO₂",
          "Профилактика ROP, IVH"
        ]
      },
      {
        min: 21,
        max: 35,
        label: "25-35 (30-36 нед)",
        color: "#F59E0B",
        description: "Умеренно/поздне недоношенный.",
        details: "GA ≈ 30-36 нед. Поздний недоношенный - повышенный риск гипогликемии, желтухи, TTN."
      },
      {
        min: 36,
        max: 42,
        label: "36-42 (38-42 нед)",
        color: "#22C55E",
        description: "Доношенный.",
        details: "GA ≈ 38-42 нед. Доношенность. Стандартный уход."
      },
      {
        min: 43,
        max: 60,
        label: "≥ 44 (> 42 нед)",
        color: "#84CC16",
        description: "Переношенный.",
        details: "GA > 42 нед. Риск аспирации мекония, плацентарной недостаточности."
      }
    ],
    caveats: [
      "Соответствие балла → недели ориентировочное (балл × 0,4 + ~22 нед)",
      "Валидизирован для 20-44 нед (New Ballard); оригинальная шкала 1979 - для 35-42 нед",
      "Оценка наиболее точна в первые 12-20 ч жизни",
      "Нейромышечная часть ненадёжна у больных, седированных или с ЦНС-поражениями - опираться на физические признаки"
    ],
    related: [
      {
        id: "dubowitz",
        title: "Dubowitz"
      },
      {
        id: "apgar",
        title: "Apgar"
      },
      {
        id: "crib",
        title: "CRIB"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      }
    ],
    reference: "Ballard JL et al. New Ballard Score, expanded to include extremely premature infants. J Pediatr 1991;119:417-423.",
    countries: "Международный",
    info: "### Для чего используется\n**New Ballard Score (Ballard 1991)** - стандарт постнатальной оценки гестационного возраста. Расширяет оригинальную шкалу Ballard 1979 для экстремально недоношенных (с 20 нед).\n\n### Структура\n- **6 нейромышечных признаков** (поза, квадратное окно, отдача рук, подколенный угол, шарф, пятка-к-уху)\n- **6 физических признаков** (кожа, лануго, подошва, молочная железа, глаз/ухо, гениталии)\n- Каждый 0/-1 до 4/5 → сумма\n\n### Соответствие (ориентировочно)\n| Балл | GA (нед) |\n|---|---|\n| -10 | 20 |\n| 0 | 22 |\n| 10 | 26 |\n| 20 | 30 |\n| 30 | 34 |\n| 35 | 36 |\n| 40 | 38 |\n| 45 | 40 |\n| 50 | 44 |\n\n`GA ≈ (балл × 0,4) + 24 нед` (приближённо)\n\n### Ограничения\n- Наиболее точен в первые 12-20 ч жизни\n- Нейромышечная часть искажается седацией, асфиксией, ЦНС-травмой\n- ± 2 недели стандартная погрешность\n- Предпочтителен УЗИ-датирование в I триместре при возможности\n\n### Тактика\nОпределение GA критично для:\n- Решения о сурфактанте, антенатальных стероидах\n- Целей SpO₂, питания\n- Прогноза ROP, IVH, NEC\n- Классификации SGA/AGA/LGA"
  };

export default runner;
