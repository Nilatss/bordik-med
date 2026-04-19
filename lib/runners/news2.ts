// @ts-nocheck
/**
 * Runner: news2
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
    maxScore: 20,
    inputs: [
      {
        id: "rr",
        label: "ЧДД (/мин)",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤8",
            points: 3
          },
          {
            value: "2",
            label: "9–11",
            points: 1
          },
          {
            value: "3",
            label: "12–20",
            points: 0
          },
          {
            value: "4",
            label: "21–24",
            points: 2
          },
          {
            value: "5",
            label: "≥25",
            points: 3
          }
        ]
      },
      {
        id: "spo2",
        label: "SpO₂ (%) — шкала 1",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤91",
            points: 3
          },
          {
            value: "2",
            label: "92–93",
            points: 2
          },
          {
            value: "3",
            label: "94–95",
            points: 1
          },
          {
            value: "4",
            label: "≥96",
            points: 0
          }
        ]
      },
      {
        id: "o2",
        label: "Кислородотерапия",
        type: "checkbox",
        points: 2
      },
      {
        id: "sbp",
        label: "САД (мм рт.ст.)",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤90",
            points: 3
          },
          {
            value: "2",
            label: "91–100",
            points: 2
          },
          {
            value: "3",
            label: "101–110",
            points: 1
          },
          {
            value: "4",
            label: "111–219",
            points: 0
          },
          {
            value: "5",
            label: "≥220",
            points: 3
          }
        ]
      },
      {
        id: "hr",
        label: "ЧСС (/мин)",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤40",
            points: 3
          },
          {
            value: "2",
            label: "41–50",
            points: 1
          },
          {
            value: "3",
            label: "51–90",
            points: 0
          },
          {
            value: "4",
            label: "91–110",
            points: 1
          },
          {
            value: "5",
            label: "111–130",
            points: 2
          },
          {
            value: "6",
            label: "≥131",
            points: 3
          }
        ]
      },
      {
        id: "conscious",
        label: "Сознание (ACVPU)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Alert (норма)",
            points: 0
          },
          {
            value: "1",
            label: "C/V/P/U (спутанность или ниже)",
            points: 3
          }
        ]
      },
      {
        id: "temp",
        label: "Температура (°C)",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤35.0",
            points: 3
          },
          {
            value: "2",
            label: "35.1–36.0",
            points: 1
          },
          {
            value: "3",
            label: "36.1–38.0",
            points: 0
          },
          {
            value: "4",
            label: "38.1–39.0",
            points: 1
          },
          {
            value: "5",
            label: "≥39.1",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0",
        color: "#22C55E",
        description: "Минимальный риск. Рутинный мониторинг (12 ч)."
      },
      {
        min: 1,
        max: 4,
        label: "1–4",
        color: "#84CC16",
        description: "Низкий. Мед. сестра — каждые 4–6 ч."
      },
      {
        min: 5,
        max: 6,
        label: "5–6",
        color: "#F59E0B",
        description: "Средний. Срочная оценка врача + частый мониторинг (1 ч)."
      },
      {
        min: 7,
        max: 20,
        label: "≥7",
        color: "#EF4444",
        description: "Высокий. Экстренная оценка, возможен перевод в ICU.",
        details: "Экстренная реакция rapid response team. Оценить сепсис, ОСН, ОДН, шок.",
        actions: [
          "Немедленный осмотр врача, оценка ABCDE",
          "Лактат, газы крови, ОАК, креатинин, АМК, гемокультуры",
          "Кислород до SpO₂ 92–96 % (88–92 % при ХОБЛ-риске гиперкапнии)",
          "Рассмотреть перевод в ICU"
        ]
      }
    ],
    caveats: [
      "При ХОБЛ с риском гиперкапнии цель SpO₂ 88–92 % (шкала 2 NEWS2) — иначе балл будет ложно-высоким",
      "Не заменяет клиническую оценку — используйте как триггер",
      "Единичный параметр с 3 баллами = \"средний риск\" независимо от суммы",
      "Не валидизирован у беременных (≥ 20 нед) — применять MEOWS"
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    related: [
      {
        id: "qsofa",
        title: "qSOFA"
      },
      {
        id: "sofa",
        title: "SOFA"
      },
      {
        id: "curb65",
        title: "CURB-65"
      }
    ],
    reference: "RCP 2017, NHS стандарт. Единичный критерий =3 балла → уровень \"средний\".",
    countries: "Великобритания (NHS, RCP) · EU",
    info: "### Для чего используется\n**NEWS2 (National Early Warning Score 2, RCP 2017)** — стандарт **раннего распознавания клинического ухудшения** у взрослых стационарных пациентов. Обязателен во всех NHS-больницах UK с 2017, широко принят в EU и части РФ.\n\n### 7 параметров (каждый 0–3 балла)\n| Параметр | 0 баллов |\n|---|---|\n| ЧДД | 12–20 |\n| SpO₂ (шкала 1, без ХОБЛ) | ≥ 96 % |\n| SpO₂ (шкала 2, целевая 88–92 при ХОБЛ) | 88–92 % |\n| Кислородотерапия | Нет |\n| Температура | 36,1–38,0 °C |\n| САД | 111–219 |\n| ЧСС | 51–90 |\n| Сознание (ACVPU) | Alert |\n\n### Шкалы SpO₂\n**Scale 1** — для большинства пациентов (цель ≥ 94 %)\n**Scale 2** — для **ХОБЛ и пациентов с хронической гиперкапнической дыхательной недостаточностью** (цель 88–92 %). Используется только по назначению врача.\n\n### ACVPU — сознание\n- **A**lert\n- **C**onfusion (новая) — NEW!\n- **V**oice responsive\n- **P**ain responsive\n- **U**nresponsive\n\nC/V/P/U = **3 балла**. Alert = 0.\n\n### Интерпретация и частота мониторинга\n| NEWS2 | Риск | Частота наблюдения | Действия |\n|---|---|---|---|\n| 0 | Низкий | Каждые 12 ч | Плановая |\n| 1–4 | Низко-средний | Каждые 4–6 ч | Оценка мед. сестры |\n| **3 в одной категории** | Средний | Каждый 1 ч | Срочная оценка врача |\n| 5–6 | Средний | Каждый 1 ч | Срочная оценка врача; возможна необходимость усиленной помощи |\n| ≥ 7 | Высокий | Непрерывный | Экстренная бригада, перевод в ICU |\n\n**Ключевой момент**: любая единичная цифра **3** = средний риск (не только общая сумма).\n\n### Цели использования\n- Раннее распознавание сепсиса\n- Выявление клинического ухудшения за 8–12 ч до события\n- Запуск Rapid Response Team / MET-call\n- Снижение cardiac arrest вне ICU\n\n### NEWS2 для сепсиса (Royal College 2017)\n- NEWS2 ≥ 5 у пациента с подозрением на инфекцию → пакет **Sepsis Six** в первый час:\n  1. Кислород (цель SpO₂ ≥ 94 %, у ХОБЛ 88–92 %)\n  2. Гемокультуры\n  3. Антибиотики в/в\n  4. Инфузия кристаллоидов\n  5. Лактат, Hb\n  6. Мочеотделение (катетер, учёт)\n\n### NEWS2 vs MEWS vs qSOFA\n| Шкала | Использование |\n|---|---|\n| MEWS | Предшественник NEWS, устарел |\n| **NEWS2** | Общий стационарный мониторинг |\n| qSOFA | Только подозрение на сепсис |\n| NEWS2 **чувствительнее** qSOFA для ранней идентификации ухудшения |\n\n### Когда НЕ применять\n- Беременные (используйте MEOWS — Modified Early Obstetric Warning)\n- Дети (PEWS)\n- Пациенты с терминальными заболеваниями в паллиативе\n- Пациенты после ОЦХ в первые часы (шкала не отражает норму)\n\n### Ограничения\n- Не учитывает лабораторные (лактат, Hb, лейкоциты)\n- Не валидирован для ICU\n- У пациентов с хронической гипотензией (терминальная ХСН) может давать ложно высокий балл\n- Культура использования требует обучения персонала"
  };

export default runner;
