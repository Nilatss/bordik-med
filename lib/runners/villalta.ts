// @ts-nocheck
/**
 * Runner: villalta
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
    maxScore: 34,
    inputs: [
      {
        id: "heaviness",
        label: "Тяжесть в ноге (симптом)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкая",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренная",
            points: 2
          },
          {
            value: 3,
            label: "3 — тяжёлая",
            points: 3
          }
        ]
      },
      {
        id: "pain",
        label: "Боль (симптом)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкая",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренная",
            points: 2
          },
          {
            value: 3,
            label: "3 — тяжёлая",
            points: 3
          }
        ]
      },
      {
        id: "cramps",
        label: "Судороги (симптом)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкие",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренные",
            points: 2
          },
          {
            value: 3,
            label: "3 — тяжёлые",
            points: 3
          }
        ]
      },
      {
        id: "pruritus",
        label: "Зуд (симптом)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкий",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренный",
            points: 2
          },
          {
            value: 3,
            label: "3 — тяжёлый",
            points: 3
          }
        ]
      },
      {
        id: "paresthesia",
        label: "Парестезии (симптом)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкие",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренные",
            points: 2
          },
          {
            value: 3,
            label: "3 — тяжёлые",
            points: 3
          }
        ]
      },
      {
        id: "edema",
        label: "Претибиальный отёк (признак)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкий",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренный",
            points: 2
          },
          {
            value: 3,
            label: "3 — выраженный",
            points: 3
          }
        ]
      },
      {
        id: "induration",
        label: "Индурация кожи (признак)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкая",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренная",
            points: 2
          },
          {
            value: 3,
            label: "3 — выраженная",
            points: 3
          }
        ]
      },
      {
        id: "hyperpigm",
        label: "Гиперпигментация (признак)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкая",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренная",
            points: 2
          },
          {
            value: 3,
            label: "3 — выраженная",
            points: 3
          }
        ]
      },
      {
        id: "compression_pain",
        label: "Болезненность при компрессии (признак)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкая",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренная",
            points: 2
          },
          {
            value: 3,
            label: "3 — выраженная",
            points: 3
          }
        ]
      },
      {
        id: "redness",
        label: "Покраснение кожи (признак)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкое",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренное",
            points: 2
          },
          {
            value: 3,
            label: "3 — выраженное",
            points: 3
          }
        ]
      },
      {
        id: "ectasia",
        label: "Венозная эктазия (признак)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 — нет",
            points: 0
          },
          {
            value: 1,
            label: "1 — лёгкая",
            points: 1
          },
          {
            value: 2,
            label: "2 — умеренная",
            points: 2
          },
          {
            value: 3,
            label: "3 — выраженная",
            points: 3
          }
        ]
      },
      {
        id: "ulcer",
        label: "Активная венозная язва",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "0–4 — нет ПТС",
        color: "#22C55E",
        description: "Посттромботический синдром не диагностируется. Продолжать профилактику рецидивов.",
        details: "По критерию Villalta балл <5 при отсутствии язвы — ПТС исключён. Продолжить антикоагуляцию по показаниям и модификацию ФР.",
        actions: [
          "Компрессионный трикотаж при симптомах (класс 2)",
          "Активность, контроль веса",
          "Оценка длительности антикоагуляции"
        ]
      },
      {
        min: 5,
        max: 9,
        label: "5–9 — лёгкий ПТС",
        color: "#F59E0B",
        description: "Лёгкий ПТС. Симптомы контролируются компрессией и образом жизни.",
        details: "Лёгкий ПТС — наиболее частая форма. Компрессионный трикотаж 20–30 мм рт. ст., физическая активность, веноактивные препараты.",
        actions: [
          "Компрессия 2 класс (23–32 мм рт. ст.) ежедневно",
          "Регулярная физическая нагрузка (ходьба, плавание)",
          "Веноактивная терапия (MPFF)",
          "Переоценка через 6 мес"
        ]
      },
      {
        min: 10,
        max: 14,
        label: "10–14 — умеренный ПТС",
        color: "#EF4444",
        description: "Умеренный ПТС. Значимое снижение качества жизни.",
        details: "Умеренный ПТС требует мультимодального подхода: стойкая компрессия, веноактивные препараты, оценка обструкции глубоких вен (МР/КТ-венография).",
        actions: [
          "Компрессия 3 класс (30–40 мм рт. ст.)",
          "УЗДС + при подозрении на обструкцию — венография",
          "Эндоваскулярное стентирование при илиокавальной обструкции",
          "Консультация сосудистого хирурга"
        ]
      },
      {
        min: 15,
        max: 34,
        label: "≥15 или активная язва — тяжёлый ПТС",
        color: "#991B1B",
        description: "Тяжёлый ПТС. Значимое ограничение активности, высокая вероятность язв.",
        details: "Тяжёлый ПТС — ассоциирован с активной венозной язвой или баллом ≥15. Показана детальная оценка для интервенции (стентирование при обструкции).",
        actions: [
          "МР-венография / КТ-венография тазовых и илиокавальных вен",
          "Эндоваскулярное стентирование при May-Thurner / посттромботической обструкции",
          "Многослойная компрессия при язве",
          "Мультидисциплинарное ведение (сосудистый хирург, гематолог, реабилитация)"
        ]
      }
    ],
    reference: "Villalta S, Bagatella P, Piccioli A et al. Assessment of validity and reproducibility of a clinical scale for the post-thrombotic syndrome. Haemostasis 1994;24(Suppl 1):158a.",
    countries: "Международный (ISTH · ESVS)",
    caveats: [
      "Применима через ≥3–6 мес после ТГВ (ранее — остаточные явления острого тромбоза)",
      "Активная венозная язва автоматически классифицирует как тяжёлый ПТС",
      "ISTH 2009 рекомендует Villalta как референсный инструмент",
      "Не применима при первичной ХВН — только после документированного ТГВ"
    ],
    related: [
      {
        id: "wells-dvt",
        title: "Wells (ТГВ)"
      },
      {
        id: "ceap",
        title: "CEAP"
      },
      {
        id: "abi",
        title: "ABI"
      }
    ],
    relatedCourses: [
      {
        id: "301.5",
        title: "Сосудистая хирургия"
      },
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    info: "### Для чего используется\n**Villalta score** — стандарт диагностики и оценки тяжести **посттромботического синдрома (ПТС)** у пациентов после ТГВ. Рекомендована ISTH SSC (2009) как референсный инструмент.\n\n### Критерии\n11 пунктов по 4-балльной шкале (0–3) + 1 бинарный (активная язва):\n\n**5 симптомов (оценка пациентом):**\n1. Тяжесть\n2. Боль\n3. Судороги\n4. Зуд\n5. Парестезии\n\n**6 клинических признаков (оценка врачом):**\n1. Претибиальный отёк\n2. Индурация кожи\n3. Гиперпигментация\n4. Болезненность при компрессии икры\n5. Покраснение\n6. Венозная эктазия\n\n**+1 балл** за активную венозную язву.\n\n### Интерпретация (ISTH 2009)\n| Балл | Категория |\n|---|---|\n| 0–4 | Нет ПТС |\n| 5–9 | Лёгкий |\n| 10–14 | Умеренный |\n| ≥15 **или** активная язва | Тяжёлый |\n\n### Когда применять\n- Через **≥3–6 мес** после эпизода ТГВ (Kahn 2008)\n- Односторонний ТГВ — сравнение со здоровой ногой\n- Двусторонний — оценка каждой ноги отдельно\n\n### Профилактика ПТС\n| Мера | Эффективность |\n|---|---|\n| Компрессионный трикотаж 30–40 мм рт. ст. ≥2 лет | Спорная (SOX trial 2014 негатива; ATTRACT 2017 показал при proximal DVT) |\n| Адекватная антикоагуляция | Снижает рецидив, косвенно — ПТС |\n| Ранняя мобилизация | Да |\n| Катетер-направленный тромболизис (CDT) | ATTRACT: снижает ПТС при илиофеморальном ТГВ |\n\n### Ограничения\n- Субъективность симптомов (зависит от пациента)\n- Перекрытие с первичной ХВН (до ТГВ)\n- Не учитывает качество жизни (для этого — VEINES-QOL)\n\n### Дифференциальная диагностика\n- Рецидив ТГВ (УЗДС, D-димер)\n- Лимфедема\n- Сердечная недостаточность\n- Целлюлит\n\n### Источник\nVillalta S et al. **Assessment of validity and reproducibility of a clinical scale for the post-thrombotic syndrome.** *Haemostasis* 1994;24(Suppl 1):158a. Kahn SR et al. **Definition of post-thrombotic syndrome of the leg for use in clinical investigations: a recommendation for standardization.** *J Thromb Haemost* 2009;7:879–883."
  };

export default runner;
