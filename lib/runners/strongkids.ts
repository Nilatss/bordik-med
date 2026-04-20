// @ts-nocheck
/**
 * Runner: strongkids
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
    maxScore: 5,
    inputs: [
      {
        id: "clinical",
        label: "Субъективная клиническая оценка: плохое питание (потеря подкожного жира/мышц, впалое лицо)",
        type: "checkbox",
        points: 1
      },
      {
        id: "highrisk",
        label: "Заболевание высокого риска недоедания (онко, ВЗК, муковисцидоз, ДЦП, крупная операция, ожоги и др.)",
        type: "checkbox",
        points: 2
      },
      {
        id: "intake",
        label: "Нутритивный приём или потери: снижение пищи, диарея/рвота > 5/день, боли мешают есть",
        type: "checkbox",
        points: 1
      },
      {
        id: "weight",
        label: "Потеря веса или отсутствие прибавки (младенцы) за последние недели/месяцы",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 - низкий риск",
        color: "#22C55E",
        description: "Низкий риск недоедания у ребёнка.",
        actions: [
          "Повторный скрининг при следующей госпитализации",
          "Стандартное питание по возрасту"
        ]
      },
      {
        min: 1,
        max: 3,
        label: "1-3 - средний риск",
        color: "#F59E0B",
        description: "Средний риск - мониторинг.",
        details: "Консультация педиатра/диетолога. Ежедневный контроль веса и приёма пищи. Рассмотреть обогащение рациона и педиатрические ONS.",
        actions: [
          "Ежедневный контроль веса и приёма пищи",
          "Консультация детского диетолога",
          "Обогащение рациона, педиатрические ONS при необходимости",
          "Повтор STRONGkids через 48-72 ч"
        ]
      },
      {
        min: 4,
        max: 5,
        label: "4-5 - высокий риск",
        color: "#EF4444",
        description: "Высокий риск - активное вмешательство.",
        details: "Немедленная консультация детского диетолога. План нутритивной поддержки: педиатрические ONS, при необходимости зондовое / парентеральное питание. Мониторинг refeeding (особенно при длительном голодании).",
        actions: [
          "Немедленная консультация детского диетолога",
          "Оценка потребностей: Schofield / Holliday-Segar (жидкость)",
          "Педиатрические ONS → энтеральное → парентеральное",
          "Мониторинг refeeding (P, K, Mg)",
          "Еженедельная антропометрия (вес, рост, окружность головы < 2 лет)"
        ]
      }
    ],
    caveats: [
      "Валидирован у детей 1 мес - 17 лет (Hulst 2010, Нидерланды)",
      "Оценивает клиницист; субъективная часть требует опыта",
      "Альтернативы: STAMP (Lamb 2005, 2-16 лет), PYMS (Gerasimidis 2010, 1-16 лет)",
      "Для новорождённых (< 1 мес) не валидирован"
    ],
    related: [
      {
        id: "glim",
        title: "GLIM criteria"
      },
      {
        id: "pews",
        title: "PEWS"
      },
      {
        id: "holliday-segar",
        title: "Holliday-Segar"
      }
    ],
    relatedCourses: [
      {
        id: "203.9",
        title: "Педиатрическая фармакология"
      },
      {
        id: "302.2",
        title: "Педиатрия 0-2"
      }
    ],
    reference: "Hulst JM, Zwart H, Hop WC, Joosten KFM. Dutch national survey to test the STRONGkids nutritional risk screening tool in hospitalized children. Clin Nutr 2010; 29:106-111.",
    countries: "Нидерланды · ЕС · Международный (педиатрия)",
    presets: [
      {
        label: "Низкий риск",
        values: {
          clinical: false,
          highrisk: false,
          intake: false,
          weight: false
        }
      },
      {
        label: "Средний риск",
        values: {
          clinical: true,
          highrisk: false,
          intake: true,
          weight: false
        }
      },
      {
        label: "Высокий риск",
        values: {
          clinical: true,
          highrisk: true,
          intake: true,
          weight: true
        }
      }
    ],
    info: "### Для чего используется\n**STRONGkids** - педиатрический скрининг нутритивного риска у госпитализированных детей 1 мес - 17 лет. Разработан в Нидерландах (Hulst 2010), широко применяется в Европе.\n\n### 4 пункта\n| Пункт | Баллы |\n|---|---|\n| Субъективная клиническая оценка (плохое питание) | 0 / 1 |\n| Заболевание высокого риска (онко, ВЗК, МВ, ДЦП, ожоги, крупная операция) | 0 / 2 |\n| Нутритивный приём или потери (снижение пищи, диарея/рвота, боли) | 0 / 1 |\n| Потеря веса или отсутствие прибавки | 0 / 1 |\n\nСумма 0-5.\n\n### Интерпретация\n| Сумма | Риск | Тактика |\n|---|---|---|\n| 0 | Низкий | Стандартное питание |\n| 1-3 | Средний | Мониторинг + диетолог, повтор через 48-72 ч |\n| 4-5 | Высокий | Активное нутритивное вмешательство |\n\n### Альтернативы\n- **STAMP** (Lamb 2005, 2-16 лет)\n- **PYMS** (Gerasimidis 2010, 1-16 лет)\n- **PNST** (White 2016, простая)\n\n### Ограничения\n- Не для новорождённых < 1 мес\n- Субъективная часть требует опыта клинициста\n\n### Тактика\n- **Средний риск** - педиатрические ONS, антропометрия, переоценка\n- **Высокий риск** - детский диетолог, расчёт потребностей (Schofield), refeeding-мониторинг"
  };

export default runner;
