// @ts-nocheck
/**
 * Runner: asia
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
        id: "grade",
        label: "ASIA Impairment Scale (ISNCSCI 2019)",
        type: "select",
        options: [
          {
            value: "1",
            label: "A - полный (нет sensory/motor в S4-S5)",
            points: 1
          },
          {
            value: "2",
            label: "B - сенсорно неполный",
            points: 2
          },
          {
            value: "3",
            label: "C - моторно неполный, > 50 % ключевых мышц < grade 3",
            points: 3
          },
          {
            value: "4",
            label: "D - моторно неполный, ≥ 50 % ключевых мышц ≥ grade 3",
            points: 4
          },
          {
            value: "5",
            label: "E - норма",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "A - полное",
        color: "#991B1B",
        description: "Полное повреждение спинного мозга",
        details: "Нет сенсорной или моторной функции в сегментах S4-S5. Отсутствие аногенитальной чувствительности и произвольного сокращения анального сфинктера. Худший прогноз восстановления.",
        actions: [
          "Стабилизация позвоночника (хирургическая декомпрессия < 24 ч - STASCIS)",
          "Метилпреднизолон: не рутинно (противоречивые данные; учитывать риск vs польза)",
          "Среднее АД ≥ 85-90 мм рт.ст. 5-7 дней (AANS/CNS)",
          "Профилактика ТГВ, пролежней, автономной дисрефлексии",
          "Ранняя реабилитация"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "B - сенсорно неполное",
        color: "#EF4444",
        description: "Сенсорно неполное",
        details: "Сенсорная функция сохранена ниже уровня, включая S4-S5, но нет моторной функции. Около 50 % → D за 1 год.",
        actions: [
          "Хирургическая декомпрессия < 24 ч",
          "MAP ≥ 85-90 мм рт.ст.",
          "Интенсивная реабилитация",
          "Обследование на zone of partial preservation"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "C - моторно неполное",
        color: "#F97316",
        description: "Моторно неполное",
        details: "Моторная функция сохранена ниже уровня, более половины ключевых мышц < grade 3.",
        actions: [
          "Декомпрессия + стабилизация",
          "Интенсивная реабилитация (locomotor training, FES)",
          "Цель: переход в D (амбулаторность)"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "D - моторно неполное",
        color: "#F59E0B",
        description: "Моторно неполное, большинство мышц ≥ grade 3",
        details: "Благоприятный прогноз; 70-80 % достигают амбулаторности.",
        actions: [
          "Реабилитация на восстановление ходьбы",
          "Экзоскелеты, FES, гимнастика",
          "Коррекция нейрогенного мочевого пузыря / кишечника"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "E - норма",
        color: "#22C55E",
        description: "Нормальная сенсорная и моторная функция",
        details: "Нет дефицита. Возможны остаточные нарушения (спастичность, боль, вегетативные).",
        actions: [
          "Продолжить наблюдение",
          "Реабилитация при остаточных симптомах"
        ]
      }
    ],
    reference: "ASIA and ISCoS International Standards for Neurological Classification of Spinal Cord Injury (ISNCSCI), Revised 2019.",
    countries: "Международный (ASIA / ISCoS)",
    caveats: [
      "Оценку необходимо повторять через 72 ч (до этого - спинальный шок искажает)",
      "S4-S5 - ключевой анатомический критерий полноты (аногенит. чувствительность, DAP, произвольное сокращение)",
      "Frankel grade (1969) - исторический предшественник (5 степеней A-E)",
      "Zone of Partial Preservation (ZPP) только для AIS A",
      "Нейрологический уровень (NLI) = самый каудальный сегмент с нормальной функцией"
    ],
    related: [
      {
        id: "slic",
        title: "SLIC"
      },
      {
        id: "gcs",
        title: "GCS"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    info: "### Для чего используется\n**ASIA Impairment Scale (ISNCSCI 2019)** - международный стандарт **классификации неврологического повреждения спинного мозга**.\n\n### Пять степеней\n| Grade | Определение |\n|---|---|\n| **A** | Полное - нет сенсорной/моторной функции в S4-S5 |\n| **B** | Сенсорно неполное - сенсорная сохранена ниже уровня (включая S4-S5), нет моторной > 3 сегментов ниже motor level |\n| **C** | Моторно неполное - моторная сохранена ниже уровня, **> половины** ключевых мышц ниже < grade 3 |\n| **D** | Моторно неполное - моторная сохранена, **≥ половины** ключевых мышц ниже ≥ grade 3 |\n| **E** | Норма - все функции нормальны (при анамнезе SCI) |\n\n### Критерии \"неполноты\"\nСохранение в сегментах S4-S5 любого из:\n- Лёгкое прикосновение\n- Болевая чувствительность (pinprick)\n- Deep Anal Pressure (DAP)\n- Произвольное сокращение анального сфинктера (VAC)\n\n### Ключевые мышцы (10 на каждую сторону)\n| Уровень | Мышца |\n|---|---|\n| C5 | Elbow flexors (сгибатели) |\n| C6 | Wrist extensors |\n| C7 | Elbow extensors |\n| C8 | Finger flexors |\n| T1 | Finger abductors (5th digit) |\n| L2 | Hip flexors |\n| L3 | Knee extensors |\n| L4 | Ankle dorsiflexors |\n| L5 | Long toe extensor |\n| S1 | Ankle plantar flexors |\n\nСила 0-5 (MRC).\n\n### Ключевые сенсорные точки\n28 дерматомов × 2 (лёгкое прикосновение + болевая) = 56 баллов на сторону.\n\n### Нейрологические уровни\n- **Sensory Level** (SL)\n- **Motor Level** (ML) - самый каудальный с grade ≥ 3 при всех выше grade 5\n- **Neurological Level of Injury (NLI)** - самый каудальный нормальный\n- **ZPP (Zone of Partial Preservation)** - только для AIS A\n\n### Альтернативы / исторические\n- **Frankel (1969)** - 5 степеней A-E, предшественник; A = complete motor & sensory loss; D = useful motor\n- **SCIM III (Spinal Cord Independence Measure)** - функциональный\n- **WISCI II** - Walking Index for SCI\n\n### Прогноз\n| AIS на поступлении | Амбулаторность через 1 год |\n|---|---|\n| A | ~ 5 % |\n| B | ~ 50 % (в D) |\n| C | ~ 75 % |\n| D | ~ 95 % |\n\n### Тактика острого SCI\n- **Ранняя декомпрессия < 24 ч** (STASCIS - Fehlings 2012)\n- **MAP ≥ 85-90 мм рт.ст. 5-7 дней** (AANS/CNS)\n- **Метилпреднизолон:** не рутинно (NASCIS-II/III противоречивы)\n- Профилактика ТГВ (LMWH через 24-72 ч после стабилизации)\n- Пролежни, автономная дисрефлексия (выше T6), нейрогенный кишечник/мочевой пузырь\n- Ранняя реабилитация, FES, экзоскелеты"
  };

export default runner;
