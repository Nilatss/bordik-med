/**
 * Runner: possum
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
    maxScore: 132,
    inputs: [
      {
        id: "age",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤ 60 лет",
            points: 1
          },
          {
            value: "2",
            label: "61-70 лет",
            points: 2
          },
          {
            value: "4",
            label: "> 70 лет",
            points: 4
          }
        ]
      },
      {
        id: "cardiac",
        label: "Сердечные признаки",
        type: "select",
        options: [
          {
            value: "1",
            label: "Норма",
            points: 1
          },
          {
            value: "2",
            label: "Диуретики / дигоксин / ИАПФ",
            points: 2
          },
          {
            value: "4",
            label: "Периферические отёки / варфарин",
            points: 4
          },
          {
            value: "8",
            label: "Повышение ЦВД / кардиомегалия",
            points: 8
          }
        ]
      },
      {
        id: "resp",
        label: "Дыхательные признаки",
        type: "select",
        options: [
          {
            value: "1",
            label: "Норма",
            points: 1
          },
          {
            value: "2",
            label: "Одышка при нагрузке / лёгкая ХОБЛ",
            points: 2
          },
          {
            value: "4",
            label: "Одышка при лестнице / умеренная ХОБЛ",
            points: 4
          },
          {
            value: "8",
            label: "Одышка в покое (ЧД > 30) / фиброз / консолидация",
            points: 8
          }
        ]
      },
      {
        id: "sbp",
        label: "Систолическое АД",
        type: "select",
        options: [
          {
            value: "1",
            label: "110-130 мм рт. ст.",
            points: 1
          },
          {
            value: "2",
            label: "131-170 или 100-109",
            points: 2
          },
          {
            value: "4",
            label: "> 170 или 90-99",
            points: 4
          },
          {
            value: "8",
            label: "< 90",
            points: 8
          }
        ]
      },
      {
        id: "hr",
        label: "Пульс",
        type: "select",
        options: [
          {
            value: "1",
            label: "50-80",
            points: 1
          },
          {
            value: "2",
            label: "81-100 или 40-49",
            points: 2
          },
          {
            value: "4",
            label: "101-120",
            points: 4
          },
          {
            value: "8",
            label: "> 120 или < 40",
            points: 8
          }
        ]
      },
      {
        id: "gcs",
        label: "Шкала Глазго",
        type: "select",
        options: [
          {
            value: "1",
            label: "15",
            points: 1
          },
          {
            value: "2",
            label: "12-14",
            points: 2
          },
          {
            value: "4",
            label: "9-11",
            points: 4
          },
          {
            value: "8",
            label: "< 9",
            points: 8
          }
        ]
      },
      {
        id: "hb",
        label: "Гемоглобин",
        type: "select",
        options: [
          {
            value: "1",
            label: "130-160 г/л",
            points: 1
          },
          {
            value: "2",
            label: "115-129 или 161-170",
            points: 2
          },
          {
            value: "4",
            label: "100-114 или 171-180",
            points: 4
          },
          {
            value: "8",
            label: "< 100 или > 180",
            points: 8
          }
        ]
      },
      {
        id: "wbc",
        label: "Лейкоциты",
        type: "select",
        options: [
          {
            value: "1",
            label: "4-10 ×10⁹/л",
            points: 1
          },
          {
            value: "2",
            label: "10,1-20 или 3,1-4",
            points: 2
          },
          {
            value: "4",
            label: "> 20 или < 3",
            points: 4
          }
        ]
      },
      {
        id: "urea",
        label: "Мочевина",
        type: "select",
        options: [
          {
            value: "1",
            label: "≤ 7,5 ммоль/л",
            points: 1
          },
          {
            value: "2",
            label: "7,6-10",
            points: 2
          },
          {
            value: "4",
            label: "10,1-15",
            points: 4
          },
          {
            value: "8",
            label: "> 15",
            points: 8
          }
        ]
      },
      {
        id: "na",
        label: "Натрий",
        type: "select",
        options: [
          {
            value: "1",
            label: "> 135 ммоль/л",
            points: 1
          },
          {
            value: "2",
            label: "131-135",
            points: 2
          },
          {
            value: "4",
            label: "126-130",
            points: 4
          },
          {
            value: "8",
            label: "< 126",
            points: 8
          }
        ]
      },
      {
        id: "k",
        label: "Калий",
        type: "select",
        options: [
          {
            value: "1",
            label: "3,5-5,0 ммоль/л",
            points: 1
          },
          {
            value: "2",
            label: "3,2-3,4 или 5,1-5,3",
            points: 2
          },
          {
            value: "4",
            label: "2,9-3,1 или 5,4-5,9",
            points: 4
          },
          {
            value: "8",
            label: "< 2,9 или > 5,9",
            points: 8
          }
        ]
      },
      {
        id: "ecg",
        label: "ЭКГ",
        type: "select",
        options: [
          {
            value: "1",
            label: "Норма",
            points: 1
          },
          {
            value: "4",
            label: "ФП 60-90 / любые другие изменения",
            points: 4
          },
          {
            value: "8",
            label: "ФП > 90 / Q-волны / ST-T изменения / > 4 эктопий",
            points: 8
          }
        ]
      },
      {
        id: "op_sev",
        label: "Сложность операции",
        type: "select",
        options: [
          {
            value: "1",
            label: "Малая",
            points: 1
          },
          {
            value: "2",
            label: "Средняя",
            points: 2
          },
          {
            value: "4",
            label: "Большая",
            points: 4
          },
          {
            value: "8",
            label: "Большая +",
            points: 8
          }
        ]
      },
      {
        id: "multi_proc",
        label: "Несколько процедур",
        type: "select",
        options: [
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "4",
            label: "> 2",
            points: 4
          }
        ]
      },
      {
        id: "blood_loss",
        label: "Объём кровопотери",
        type: "select",
        options: [
          {
            value: "1",
            label: "< 100 мл",
            points: 1
          },
          {
            value: "2",
            label: "101-500",
            points: 2
          },
          {
            value: "4",
            label: "501-999",
            points: 4
          },
          {
            value: "8",
            label: "≥ 1000",
            points: 8
          }
        ]
      },
      {
        id: "contam",
        label: "Контаминация брюшной полости",
        type: "select",
        options: [
          {
            value: "1",
            label: "Нет / серозная",
            points: 1
          },
          {
            value: "2",
            label: "Местный гной",
            points: 2
          },
          {
            value: "4",
            label: "Свободный гной",
            points: 4
          },
          {
            value: "8",
            label: "Свободный кал / кровь / моча",
            points: 8
          }
        ]
      },
      {
        id: "malig",
        label: "Онкологическая патология",
        type: "select",
        options: [
          {
            value: "1",
            label: "Нет",
            points: 1
          },
          {
            value: "2",
            label: "Только первичный очаг",
            points: 2
          },
          {
            value: "4",
            label: "Поражение л/у",
            points: 4
          },
          {
            value: "8",
            label: "Отдалённые метастазы",
            points: 8
          }
        ]
      },
      {
        id: "urgency",
        label: "Срочность",
        type: "select",
        options: [
          {
            value: "1",
            label: "Плановая",
            points: 1
          },
          {
            value: "4",
            label: "Срочная (< 24 ч, ресусцитация возможна)",
            points: 4
          },
          {
            value: "8",
            label: "Экстренная (< 2 ч)",
            points: 8
          }
        ]
      }
    ],
    bands: [
      {
        min: 18,
        max: 40,
        label: "18-40",
        color: "#22C55E",
        description: "Низкий риск. Прогнозируемая смертность < 5 %, осложнения < 15 %."
      },
      {
        min: 41,
        max: 60,
        label: "41-60",
        color: "#84CC16",
        description: "Умеренный риск. Смертность 5-15 %, осложнения 15-40 %."
      },
      {
        min: 61,
        max: 90,
        label: "61-90",
        color: "#F59E0B",
        description: "Высокий риск. Смертность 15-40 %, осложнения 40-70 %.",
        details: "Значительный периоперационный риск. Обязательна оптимизация состояния, информированное обсуждение рисков, планирование ОРИТ.",
        actions: [
          "Предоперационная оптимизация (анемия, волемия, электролиты)",
          "Консультация анестезиолога и реаниматолога",
          "Планирование послеоперационной ИВЛ / ОРИТ",
          "Мультидисциплинарное обсуждение альтернатив"
        ]
      },
      {
        min: 91,
        max: 132,
        label: "≥ 91",
        color: "#EF4444",
        description: "Очень высокий риск. Смертность > 40 %.",
        details: "Критически высокий риск смерти. Операция оправдана только при невозможности альтернативы (жизнеугрожающее состояние).",
        actions: [
          "Пересмотр показаний / рассмотреть паллиативный путь",
          "Семейный совет, информированное согласие на высокий риск",
          "Перевод в стационар с круглосуточным ОРИТ",
          "Обсуждение \"damage control surgery\" при травме"
        ]
      }
    ],
    caveats: [
      "POSSUM переоценивает смертность при низком риске и в детской хирургии",
      "P-POSSUM (Prytherch 1998) - скорректированные коэффициенты для колоректальной и общей хирургии",
      "CR-POSSUM (Tekkis 2004) - отдельная шкала для колоректальной хирургии",
      "Требует точных интраоперационных данных (кровопотеря, контаминация) - используется ретроспективно для аудита"
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      },
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "asa-ps",
        title: "ASA-PS"
      },
      {
        id: "rcri",
        title: "RCRI"
      },
      {
        id: "nsqip",
        title: "ACS NSQIP"
      }
    ],
    reference: "Copeland GP, Jones D, Walters M. POSSUM. Br J Surg 1991; 78:355-360.",
    info: "### Для чего используется\n**POSSUM (Physiological and Operative Severity Score for the enUmeration of Mortality and morbidity)** - оценка **прогнозируемой смертности и осложнений** после общехирургических операций. Используется для аудита качества и сравнения результатов между центрами.\n\n### Структура\n**Две подшкалы:**\n\n**1. Физиологический счёт (12 параметров × 1/2/4/8)** - диапазон 12-88:\nвозраст, сердечные признаки, дыхательные признаки, САД, ЧСС, ШКГ, Hb, WBC, мочевина, Na, K, ЭКГ.\n\n**2. Операционный счёт (6 параметров × 1/2/4/8)** - диапазон 6-44:\nсложность операции, число процедур, кровопотеря, контаминация брюшной полости, онкопатология, срочность.\n\n### Формула (оригинал Copeland 1991)\n**Логистическая регрессия** для смертности:\n`ln(R/1-R) = -7.04 + (0.13 × физ. счёт) + (0.16 × опер. счёт)`\n\nИ для осложнений:\n`ln(R/1-R) = -5.91 + (0.16 × физ. счёт) + (0.19 × опер. счёт)`\n\n### Упрощённая интерпретация (сумма подшкал)\n| Сумма | Риск смерти | Риск осложнений |\n|---|---|---|\n| 18-40 | < 5 % | < 15 % |\n| 41-60 | 5-15 % | 15-40 % |\n| 61-90 | 15-40 % | 40-70 % |\n| > 90 | > 40 % | > 70 % |\n\n### Модификации\n| Шкала | Область | Особенность |\n|---|---|---|\n| **P-POSSUM** (Prytherch 1998) | Общая хирургия | Корректирует переоценку смертности при низком риске |\n| **CR-POSSUM** (Tekkis 2004) | Колоректальная | 6 физиологических + 4 операционных параметра |\n| **O-POSSUM** | Пищеводно-желудочная | Скорректированные веса |\n| **V-POSSUM** | Сосудистая | Для плановой реконструкции аорты |\n\n### Ограничения\n- Переоценка смертности при низком риске (исходный дефект - решается P-POSSUM)\n- Требует интраоперационных данных (кровопотеря, контаминация)\n- Не подходит для педиатрической и кардиохирургии\n- Валидация преимущественно в британских центрах 1990-х\n\n### Тактика\n- POSSUM > 60 - планирование ОРИТ\n- POSSUM > 90 - пересмотр показаний, семейный совет\n- Использовать **совместно с ASA-PS и RCRI**, а не вместо"
  };

export default runner;
