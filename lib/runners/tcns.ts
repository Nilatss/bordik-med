// @ts-nocheck
/**
 * Runner: tcns
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
    maxScore: 19,
    inputs: [
      {
        id: "s_pain",
        label: "Симптом: боль в стопах",
        type: "checkbox",
        points: 1
      },
      {
        id: "s_numb",
        label: "Симптом: онемение",
        type: "checkbox",
        points: 1
      },
      {
        id: "s_tingle",
        label: "Симптом: покалывание",
        type: "checkbox",
        points: 1
      },
      {
        id: "s_weak",
        label: "Симптом: слабость",
        type: "checkbox",
        points: 1
      },
      {
        id: "s_ataxia",
        label: "Симптом: атаксия",
        type: "checkbox",
        points: 1
      },
      {
        id: "s_upper",
        label: "Симптом: в верхних конечностях",
        type: "checkbox",
        points: 1
      },
      {
        id: "r_knee",
        label: "Коленный рефлекс",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Снижен",
            points: 1
          },
          {
            value: "2",
            label: "Отсутствует",
            points: 2
          }
        ]
      },
      {
        id: "r_ankle",
        label: "Ахиллов рефлекс",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "1",
            label: "Снижен",
            points: 1
          },
          {
            value: "2",
            label: "Отсутствует",
            points: 2
          }
        ]
      },
      {
        id: "t_pin",
        label: "Болевая чувствительность (большой палец стопы)",
        type: "checkbox",
        points: 1
      },
      {
        id: "t_temp",
        label: "Температурная чувствительность",
        type: "checkbox",
        points: 1
      },
      {
        id: "t_touch",
        label: "Тактильная чувствительность (monofilament)",
        type: "checkbox",
        points: 1
      },
      {
        id: "t_vibr",
        label: "Вибрационная чувствительность (128 Гц)",
        type: "checkbox",
        points: 1
      },
      {
        id: "t_pos",
        label: "Суставно-мышечное чувство",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 5,
        label: "0-5 нет",
        color: "#22C55E",
        description: "Нет клинически значимой нейропатии",
        details: "Риск DPN низкий. Продолжить ежегодный скрининг у диабетиков.",
        actions: [
          "Ежегодный осмотр стоп",
          "Контроль HbA1c < 7 %",
          "Образование пациента по уходу за стопами"
        ]
      },
      {
        min: 6,
        max: 8,
        label: "6-8 лёгкая",
        color: "#3B82F6",
        description: "Лёгкая диабетическая нейропатия",
        details: "Ранние признаки DPN. Акцент на гликемический контроль и симптомы.",
        actions: [
          "Оптимизация HbA1c",
          "Габапентин/прегабалин при боли",
          "Дулоксетин при депрессии + боли"
        ]
      },
      {
        min: 9,
        max: 11,
        label: "9-11 умеренная",
        color: "#F59E0B",
        description: "Умеренная DPN",
        details: "Клинически явная нейропатия с риском язв стопы.",
        actions: [
          "Регулярный подиатрический осмотр (каждые 3-6 мес)",
          "Специализированная обувь",
          "Лечение боли: прегабалин/дулоксетин",
          "Исключить недиабетические причины (B12, гипотиреоз, CIDP)"
        ]
      },
      {
        min: 12,
        max: 19,
        label: "12-19 тяжёлая",
        color: "#EF4444",
        description: "Тяжёлая DPN, высокий риск язв и ампутации",
        details: "Тяжёлая сенсомоторная нейропатия с риском нейропатической язвы, Шарко-стопы.",
        actions: [
          "Подиатрия ежемесячно",
          "Шарко-стопа: иммобилизация при первых признаках",
          "Мультимодальная аналгезия",
          "Скрининг автономной нейропатии (ортостаз, гастропарез)",
          "Исключить амилоидоз, CIDP при быстром прогрессировании"
        ]
      }
    ],
    reference: "Bril V, Perkins BA. Validation of the Toronto Clinical Scoring System for diabetic polyneuropathy. Diabetes Care 2002;25:2048-2052.",
    countries: "Международный",
    caveats: [
      "TCNS валидирован для DPN (диабетической полинейропатии)",
      "Комбинирует симптомы + рефлексы + сенсорику - более объективен, чем MNSI",
      "Порог ≥ 6 для клинически значимой нейропатии (DPN) с чувствительностью ~93 %",
      "У пожилых возможна физиологическая утрата ахиллова рефлекса без DPN"
    ],
    related: [
      {
        id: "dn4",
        title: "DN4"
      },
      {
        id: "npsi",
        title: "NPSI"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    info: "### Для чего используется\n**TCNS (Toronto Clinical Neuropathy Score, Bril 2002)** - валидированная шкала **для диагностики и стадирования диабетической полинейропатии (DPN)**.\n\n### Критерии (0-19 баллов)\n| Раздел | Пункты | Баллы |\n|---|---|---|\n| Симптомы | 6 (боль, онемение, покалывание, слабость, атаксия, верх. конечн.) | 0-6 |\n| Рефлексы | Коленный + ахиллов (0/1/2 каждый) | 0-4 |\n| Сенсорные тесты | Pinprick, температура, тактильная, вибрация, положение | 0-5 |\n\nИтого: максимум **19** (6 + 4×2 + 5 = 19).\n\n### Интерпретация\n| Баллы | Стадия |\n|---|---|\n| 0-5 | Нет нейропатии |\n| 6-8 | Лёгкая DPN |\n| 9-11 | Умеренная DPN |\n| 12-19 | Тяжёлая DPN |\n\nЧувствительность 93 %, специфичность 72 % при пороге ≥ 6 (по сравнению с ЭНМГ-подтверждённой DPN).\n\n### Альтернативы\n- **MNSI (Michigan Neuropathy Screening Instrument)** - опросник (15 вопросов) + осмотр (8 пунктов); лучше для скрининга\n- **NDS (Neuropathy Disability Score)** - аналогичная структура, другие пороги\n- **Utah Early Neuropathy Scale (UENS)** - чувствительнее на ранних стадиях\n- **DN4** - нейропатический характер боли\n\n### Применение\n- Рутинный скрининг у диабетиков (ADA: ≥ раз в год)\n- Мониторинг прогрессии\n- Включение в клинические исследования DPN\n\n### Ограничения\n- Физиологическое снижение рефлексов/вибрации у пожилых\n- Не заменяет ЭНМГ для фенотипирования\n- Слабо чувствителен к small-fiber нейропатии (QST + biopsy предпочтительны)\n\n### Тактика при ≥ 6\n- Оптимизация гликемического контроля (HbA1c 6.5-7.5 %)\n- Обучение уходу за стопами, обувь\n- Габапентиноиды / дулоксетин при болевой форме\n- Исключить альтернативы: B12, гипотиреоз, алкоголь, CIDP, амилоидоз, ВИЧ\n- При ≥ 9 - подиатрия регулярно; при ≥ 12 - высокий риск язв"
  };

export default runner;
