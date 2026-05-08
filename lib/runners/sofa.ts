// @ts-nocheck
/**
 * Runner: sofa — Sequential Organ Failure Assessment Score
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Vincent JL, Moreno R, Takala J, et al. The SOFA (Sepsis-
 *               related Organ Failure Assessment) score to describe organ
 *               dysfunction/failure. On behalf of the Working Group on
 *               Sepsis-Related Problems of the European Society of
 *               Intensive Care Medicine. Intensive Care Med.
 *               1996;22(7):707-710. doi:10.1007/BF01709751
 *   GUIDELINE:  Sepsis-3 (Singer 2016) — sepsis = ΔSOFA ≥2 + suspected
 *               infection. Mandatory ICU score worldwide.
 *               doi:10.1001/jama.2016.0287
 *
 * 6 organ systems (0-4 each, max 24):
 *
 *   Respiratory (PaO2/FiO2):
 *     0: ≥400      1: <400      2: <300
 *     3: <200 + mechanical ventilation
 *     4: <100 + mechanical ventilation
 *
 *   Coagulation (Platelets ×10⁹/L):
 *     0: ≥150      1: <150      2: <100      3: <50      4: <20
 *
 *   Liver (Bilirubin mg/dL / μmol/L):
 *     0: <1.2 / <20      1: 1.2-1.9 / 20-32      2: 2.0-5.9 / 33-101
 *     3: 6.0-11.9 / 102-204      4: ≥12.0 / ≥204
 *
 *   Cardiovascular:
 *     0: MAP ≥70
 *     1: MAP <70
 *     2: dopamine ≤5 OR dobutamine (any dose)
 *     3: dopamine >5, OR epi/norepi ≤0.1
 *     4: dopamine >15, OR epi/norepi >0.1
 *     (μg/kg/min, doses ≥1h)
 *
 *   CNS (GCS):
 *     0: 15      1: 13-14      2: 10-12      3: 6-9      4: <6
 *
 *   Renal (Creatinine mg/dL / urine output):
 *     0: <1.2 / <110           1: 1.2-1.9 / 110-170
 *     2: 2.0-3.4 / 171-299     3: 3.5-4.9 / 300-440 OR <500 mL/day
 *     4: ≥5.0 / ≥441 OR <200 mL/day
 *
 * Sepsis-3 (Singer 2016):
 *   Sepsis = ΔSOFA ≥2 from baseline + suspected/confirmed infection
 *   Septic shock = sepsis + vasopressors needed для MAP ≥65 + lactate >2
 *   ICU mortality:
 *     SOFA <6   → ~10%
 *     SOFA 6-9  → ~20%
 *     SOFA 10-12 → ~50%
 *     SOFA ≥13  → ~80%
 *
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
    maxScore: 24,
    inputs: [
      {
        id: "resp",
        label: "Дыхание: PaO₂/FiO₂",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥400",
            points: 0
          },
          {
            value: "1",
            label: "<400",
            points: 1
          },
          {
            value: "2",
            label: "<300",
            points: 2
          },
          {
            value: "3",
            label: "<200 (с МВ)",
            points: 3
          },
          {
            value: "4",
            label: "<100 (с МВ)",
            points: 4
          }
        ]
      },
      {
        id: "coag",
        label: "Коагуляция: тромбоциты (×10⁹/л)",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥150",
            points: 0
          },
          {
            value: "1",
            label: "<150",
            points: 1
          },
          {
            value: "2",
            label: "<100",
            points: 2
          },
          {
            value: "3",
            label: "<50",
            points: 3
          },
          {
            value: "4",
            label: "<20",
            points: 4
          }
        ]
      },
      {
        id: "liver",
        label: "Печень: билирубин (мкмоль/л)",
        type: "select",
        options: [
          {
            value: "0",
            label: "<20",
            points: 0
          },
          {
            value: "1",
            label: "20-32",
            points: 1
          },
          {
            value: "2",
            label: "33-101",
            points: 2
          },
          {
            value: "3",
            label: "102-204",
            points: 3
          },
          {
            value: "4",
            label: ">204",
            points: 4
          }
        ]
      },
      {
        id: "cardio",
        label: "Сердечно-сосудистая",
        type: "select",
        options: [
          {
            value: "0",
            label: "МАД ≥70",
            points: 0
          },
          {
            value: "1",
            label: "МАД <70",
            points: 1
          },
          {
            value: "2",
            label: "Допамин ≤5 или добутамин",
            points: 2
          },
          {
            value: "3",
            label: "Допамин >5 / норэпинефрин ≤0.1",
            points: 3
          },
          {
            value: "4",
            label: "Допамин >15 / норэпинефрин >0.1",
            points: 4
          }
        ]
      },
      {
        id: "cns",
        label: "ЦНС: GCS",
        type: "select",
        options: [
          {
            value: "0",
            label: "15",
            points: 0
          },
          {
            value: "1",
            label: "13-14",
            points: 1
          },
          {
            value: "2",
            label: "10-12",
            points: 2
          },
          {
            value: "3",
            label: "6-9",
            points: 3
          },
          {
            value: "4",
            label: "<6",
            points: 4
          }
        ]
      },
      {
        id: "renal",
        label: "Почки: креатинин (мкмоль/л)",
        type: "select",
        options: [
          {
            value: "0",
            label: "<110",
            points: 0
          },
          {
            value: "1",
            label: "110-170",
            points: 1
          },
          {
            value: "2",
            label: "171-299",
            points: 2
          },
          {
            value: "3",
            label: "300-440",
            points: 3
          },
          {
            value: "4",
            label: ">440 или диализ",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 6,
        label: "0-6",
        color: "#22C55E",
        description: "Смертность <10%."
      },
      {
        min: 7,
        max: 9,
        label: "7-9",
        color: "#F59E0B",
        description: "Смертность 15-20%."
      },
      {
        min: 10,
        max: 12,
        label: "10-12",
        color: "#F97316",
        description: "Смертность 40-50%."
      },
      {
        min: 13,
        max: 14,
        label: "13-14",
        color: "#EF4444",
        description: "Смертность 50-60%."
      },
      {
        min: 15,
        max: 24,
        label: "≥15",
        color: "#991B1B",
        description: "Смертность >80%.",
        details: "Полиорганная недостаточность. Высокая госпитальная смертность. Агрессивная поддержка + поиск обратимых причин.",
        actions: [
          "Оптимизация sepsis bundle (1h, 6h)",
          "Вазопрессоры (норэпинефрин), цель MAP ≥ 65",
          "ИВЛ низкообъёмная (Vt 6 мл/кг), PEEP-лестница при ARDS",
          "CRRT при ОПП + перегрузка жидкостью или метаболические осложнения"
        ]
      }
    ],
    caveats: [
      "Прирост ΔSOFA ≥ 2 от базального + инфекция = сепсис по Sepsis-3",
      "Компонент GCS ненадёжен при седации - использовать RASS или SAS",
      "Не валидизирован у детей - pSOFA / PELOD-2",
      "Требует лабораторных данных (PaO₂, билирубин, креатинин, тромбоциты)"
    ],
    relatedCourses: [
      {
        id: "301.9",
        title: "Инфекционные болезни"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    related: [
      {
        id: "qsofa",
        title: "qSOFA (скрининг)"
      },
      {
        id: "news2",
        title: "NEWS2"
      },
      {
        id: "pf-ratio",
        title: "P/F-ratio"
      }
    ],
    reference: "Vincent 1996. Прирост ≥2 от базального = сепсис (Sepsis-3).",
    info: "### Для чего используется\n**SOFA (Sequential Organ Failure Assessment, Vincent 1996)** - динамическая оценка **органной дисфункции у пациентов в ICU**. Применяется для диагностики сепсиса (Sepsis-3), оценки прогноза, мониторинга эффекта лечения.\n\n### 6 органных систем (0-4 балла каждая, максимум 24)\n| Система | Параметр | 0 | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|---|---|\n| **Респираторная** | P/F | > 400 | ≤ 400 | ≤ 300 | ≤ 200 + ИВЛ | ≤ 100 + ИВЛ |\n| **Коагуляция** | Тромбоциты | > 150 | ≤ 150 | ≤ 100 | ≤ 50 | ≤ 20 |\n| **Печень** | Билирубин (мкмоль/л) | < 20 | 20-32 | 33-101 | 102-204 | > 204 |\n| **ССС** | МАР / вазопрессоры | МАР ≥ 70 | МАР < 70 | Доп ≤ 5 | Доп > 5 / НА ≤ 0,1 | НА > 0,1 |\n| **ЦНС** | GCS | 15 | 13-14 | 10-12 | 6-9 | < 6 |\n| **Почки** | Креатинин (мкмоль/л) / диурез | < 110 | 110-170 | 171-299 | 300-440 или < 500 мл/сут | > 440 или < 200 мл/сут |\n\n### Интерпретация\n| SOFA | Смертность в ICU |\n|---|---|\n| 0-6 | < 10 % |\n| 7-9 | 15-20 % |\n| 10-12 | 40-50 % |\n| > 12 | > 80 % |\n\n### Sepsis-3 (2016)\n**Сепсис** = Подозрение на инфекцию **+ ΔSOFA ≥ 2** от базового.\n**Септический шок** = Сепсис + вазопрессоры для МАР ≥ 65 + лактат > 2 мм/л, несмотря на адекватную инфузию.\n\n### qSOFA (вне ICU, быстрый скрининг)\n| Критерий | Пороги |\n|---|---|\n| ЧДД | ≥ 22 |\n| САД | ≤ 100 |\n| Сознание | GCS < 15 |\n\nqSOFA ≥ 2 → высокая вероятность плохого исхода; продолжить полный SOFA.\n\n### Применение\n| Ситуация | Использование |\n|---|---|\n| Диагностика сепсиса | ΔSOFA ≥ 2 + инфекция |\n| Триаж в ICU | Пороги для эскалации |\n| Прогноз | Исходная и динамическая оценка |\n| Исследования | RCT по сепсису, ICU |\n| SSC bundles | Включён в Hour-1 bundle |\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **APACHE II/III/IV** | Более сложная, один раз при поступлении |\n| **SAPS II/3** | Упрощённая, на поступлении |\n| **MPM II-0/24** | Предсказание смертности |\n| **qSOFA** | Быстрый прикроватный вариант |\n| **NEWS2** | Чувствительнее qSOFA в стационаре |\n\n### Ограничения\n- Субъективность GCS при седации (используйте RASS)\n- Креатинин у ХПН-пациентов - SOFA повышен исходно\n- Не учитывает этиологию сепсиса\n- Не валидизирован у детей (pSOFA/PELOD-2 для педиатрии)"
  };

export default runner;
