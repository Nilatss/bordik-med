/**
 * Runner: cfs
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
    maxScore: 9,
    inputs: [
      {
        id: "level",
        label: "Уровень по CFS",
        type: "select",
        options: [
          {
            value: "1",
            label: "1 - Очень крепок (регулярные упражнения, один из самых активных)",
            points: 1
          },
          {
            value: "2",
            label: "2 - Крепок (без активной болезни, менее активен, чем CFS 1)",
            points: 2
          },
          {
            value: "3",
            label: "3 - Хорошо справляется (контролируемые болезни, без регулярной активности)",
            points: 3
          },
          {
            value: "4",
            label: "4 - Живёт с очень лёгкой астенией (симптомы замедляют, жалобы на усталость)",
            points: 4
          },
          {
            value: "5",
            label: "5 - Лёгкая астения (нужна помощь в IADL: финансы, транспорт, покупки)",
            points: 5
          },
          {
            value: "6",
            label: "6 - Умеренная астения (нужна помощь в базовых ADL: одевание, лестница)",
            points: 6
          },
          {
            value: "7",
            label: "7 - Тяжёлая астения (полная зависимость в ADL, стабилен)",
            points: 7
          },
          {
            value: "8",
            label: "8 - Очень тяжёлая астения (полностью зависим, приближается к концу жизни)",
            points: 8
          },
          {
            value: "9",
            label: "9 - Терминально болен (ожидаемая продолжительность жизни < 6 мес)",
            points: 9
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 3,
        label: "1-3 - без астении",
        color: "#22C55E",
        description: "Крепкий или хорошо справляющийся пациент.",
        actions: [
          "Стандартное лечение / хирургия без ограничений по фрагильности",
          "Возможно включение в клинические исследования"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "4 - пре-астения",
        color: "#F59E0B",
        description: "Не зависим, но симптомы уже замедляют активность.",
        details: "Пограничная зона - рассмотреть prehabilitation перед плановыми вмешательствами, оптимизацию питания, физическую активность.",
        actions: [
          "Прехабилитация (ЛФК, белковое питание) перед плановой хирургией",
          "Коррекция обратимых причин (анемия, депрессия, саркопения)",
          "CGA - Comprehensive Geriatric Assessment"
        ]
      },
      {
        min: 5,
        max: 6,
        label: "5-6 - лёгкая-умеренная астения",
        color: "#F59E0B",
        description: "Нужна помощь в IADL (5) или ADL (6).",
        details: "Повышенный риск послеоперационных осложнений, делирия, смертности. В ОРИТ - умеренно повышенная госпитальная смертность.",
        actions: [
          "Мультидисциплинарная CGA",
          "Обсуждение целей помощи перед вмешательствами",
          "Редукция доз цитотоксических препаратов",
          "Плановая реабилитация и дома, и в стационаре"
        ]
      },
      {
        min: 7,
        max: 9,
        label: "7-9 - тяжёлая-терминальная астения",
        color: "#EF4444",
        description: "Высокий риск смертности; фокус на качестве жизни.",
        details: "CFS ≥ 7 - ограничение агрессивной терапии и ОРИТ (NICE COVID-19 guidance). Онкология: редукция дозы или best supportive care.",
        actions: [
          "Best supportive care / хоспис (CFS 9)",
          "Ограничение инвазивных вмешательств",
          "Advance care planning, DNR/DNI",
          "Контроль симптомов (боль, одышка, делирий)"
        ]
      }
    ],
    caveats: [
      "Оценка основана на клиническом суждении за 2 нед ДО острого заболевания",
      "Не применим < 65 лет и при стабильной одно-системной инвалидизации (рассеянный склероз, ДЦП)",
      "Визуальные картинки-гайды (Rockwood 2020) повышают надёжность",
      "Используется в ОРИТ-триаже и COVID-19 (NICE NG159), но не как единственный критерий"
    ],
    related: [
      {
        id: "edmonton-frail",
        title: "Edmonton Frail Scale"
      },
      {
        id: "katz-adl",
        title: "Katz ADL"
      },
      {
        id: "kps",
        title: "Karnofsky Performance Status"
      }
    ],
    relatedCourses: [
      {
        id: "301.7",
        title: "Онкология"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Rockwood K, Song X, MacKnight C, et al. A global clinical measure of fitness and frailty in elderly people. CMAJ 2005; 173:489-495. Обновлено: CFS v2.0 - Rockwood K, Theou O. Can Geriatr J 2020; 23:210-215.",
    countries: "Международный (NICE, ESICM)",
    presets: [
      {
        label: "Крепкий пациент",
        values: {
          level: "2"
        }
      },
      {
        label: "Пре-астения",
        values: {
          level: "4"
        }
      },
      {
        label: "Умеренная астения",
        values: {
          level: "6"
        }
      },
      {
        label: "Тяжёлая астения",
        values: {
          level: "8"
        }
      }
    ],
    info: "### Для чего используется\n**Clinical Frailty Scale (CFS)** - визуально-описательная шкала астении (1-9), разработанная Canadian Study of Health and Aging (Rockwood 2005, обновлённая v2.0 в 2020). Оценивается за **2 недели до** острого ухудшения. Широко применяется в гериатрии, ОРИТ-триаже, онкологии, перед плановой хирургией.\n\n### Шкала\n| Балл | Описание |\n|---|---|\n| 1 | Very Fit - один из самых активных |\n| 2 | Fit - без активных заболеваний |\n| 3 | Managing Well - контролируемые хрон. болезни |\n| 4 | Living with Very Mild Frailty (пре-астения) |\n| 5 | Living with Mild Frailty (помощь в IADL) |\n| 6 | Living with Moderate Frailty (помощь в ADL) |\n| 7 | Living with Severe Frailty (полная зависимость, стабилен) |\n| 8 | Living with Very Severe Frailty (приближается к концу жизни) |\n| 9 | Terminally Ill (ожидаемая жизнь < 6 мес) |\n\n### Клинические применения\n| Область | Использование |\n|---|---|\n| ОРИТ | Триаж; CFS ≥ 5 - более осторожный отбор на ИВЛ/ЭКМО |\n| Онкология | CFS ≥ 5 - редукция дозы, best supportive care |\n| Хирургия | CFS ≥ 5 - прехабилитация, goals-of-care discussion |\n| COVID-19 | NICE NG159 - CFS ≥ 5 не отрицает, но уточняет решение |\n\n### Связанные инструменты\n- **Frailty Index (Rockwood)** - кумулятивный deficit score (30-70 пунктов)\n- **Fried phenotype** - 5 критериев (похудание, слабость хвата, усталость, медленная ходьба, низкая активность); ≥ 3 = астения\n- **Edmonton Frail Scale** - структурированный опросник (9 доменов, 0-17)\n\n### Ограничения\n- Требует клинического суждения - обучение повышает надёжность (κ 0.7-0.9 после тренинга)\n- Не применяется при стабильной одно-системной инвалидизации\n- Не для возраста < 65 лет\n- Не единственный критерий для ограничения терапии\n\n### Тактика\n- **1-3** - стандартная терапия\n- **4** - прехабилитация, CGA, оптимизация\n- **5-6** - CGA, goals-of-care, редукция доз\n- **7-9** - BSC, хоспис, ограничение инвазивных вмешательств"
  };

export default runner;
