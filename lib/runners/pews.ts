// @ts-nocheck
/**
 * Runner: pews
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
        id: "behavior",
        label: "Поведение / сознание",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - Играет, ведёт себя нормально",
            points: 0
          },
          {
            value: "1",
            label: "1 - Спит / капризен",
            points: 1
          },
          {
            value: "2",
            label: "2 - Раздражим, успокаивается с трудом",
            points: 2
          },
          {
            value: "3",
            label: "3 - Вялый, спутанный, сниженная реакция на боль",
            points: 3
          }
        ]
      },
      {
        id: "cv",
        label: "Сердечно-сосудистая система",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - Розовый, CRT 1-2 с",
            points: 0
          },
          {
            value: "1",
            label: "1 - Бледный, CRT 3 с",
            points: 1
          },
          {
            value: "2",
            label: "2 - Серый, CRT 4 с, ЧСС +20 от нормы",
            points: 2
          },
          {
            value: "3",
            label: "3 - Серый и пятнистый, CRT ≥5 с, ЧСС +30 от нормы или брадикардия",
            points: 3
          }
        ]
      },
      {
        id: "resp",
        label: "Дыхательная система",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - В норме, без ретракций",
            points: 0
          },
          {
            value: "1",
            label: "1 - ЧДД +10 от нормы, FiO₂ ≥30% или 3+ л/мин",
            points: 1
          },
          {
            value: "2",
            label: "2 - ЧДД +20 от нормы, ретракции, FiO₂ ≥40% или 6+ л/мин",
            points: 2
          },
          {
            value: "3",
            label: "3 - ЧДД −5 от нормы, стонущее дыхание, FiO₂ ≥50% или 8+ л/мин",
            points: 3
          }
        ]
      },
      {
        id: "nebuliser",
        label: "Каждые 15 мин небулайзер при остром обострении",
        type: "checkbox",
        points: 2
      },
      {
        id: "vomiting",
        label: "Стойкая рвота после операции",
        type: "checkbox",
        points: 2
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (норма)",
        color: "#22C55E",
        description: "Рутинный мониторинг каждые 4 ч."
      },
      {
        min: 3,
        max: 4,
        label: "3-4 (беспокоит)",
        color: "#F59E0B",
        description: "Осмотр педиатра, мониторинг каждые 1 ч.",
        actions: [
          "Вызов педиатра",
          "Мониторинг каждые 1 ч",
          "Оценить на сепсис / обезвоживание"
        ]
      },
      {
        min: 5,
        max: 9,
        label: "≥5 (критический)",
        color: "#EF4444",
        description: "MET-вызов (medical emergency team). Рассмотреть PICU.",
        details: "PEWS ≥ 5 ассоциирован с риском остановки кровообращения и перевода в PICU. Немедленный осмотр и эскалация.",
        actions: [
          "MET / pediatric rapid response team",
          "ABCDE, жидкостная реанимация при шоке (20 мл/кг болюс)",
          "Кислород высокого потока",
          "Гемокультуры, лактат, газы крови; АБ при подозрении на сепсис ≤ 1 ч"
        ]
      }
    ],
    caveats: [
      "Возрастные нормы витальных - строго по APLS/WHO (см. info); «норма» у подростка отличается от младенца",
      "PEWS - триггер, не диагноз; всегда интегрируйте с клинической оценкой",
      "Не валидизирован у недоношенных новорожденных (используйте NEWS неонатальные варианты)",
      "Существует несколько версий (Bedside PEWS, Brighton PEWS) - пороги могут отличаться"
    ],
    related: [
      {
        id: "news2",
        title: "NEWS2 (взрослые)"
      },
      {
        id: "mews",
        title: "MEWS"
      },
      {
        id: "apgar",
        title: "Apgar"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия 0-2"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Parshuram CS, Duncan HP, Joffe AR, et al. Multicentre validation of the bedside paediatric early warning system score. Crit Care 2011;15:R184.",
    countries: "Международный",
    presets: [
      {
        label: "Здоровый ребёнок",
        values: {
          behavior: "0",
          cv: "0",
          resp: "0",
          nebuliser: false,
          vomiting: false
        }
      },
      {
        label: "Бронхиолит, беспокоит",
        values: {
          behavior: "1",
          cv: "1",
          resp: "2",
          nebuliser: false,
          vomiting: false
        }
      },
      {
        label: "Септический шок",
        values: {
          behavior: "3",
          cv: "3",
          resp: "3",
          nebuliser: false,
          vomiting: false
        }
      }
    ],
    info: "### Для чего используется\n**PEWS (Paediatric Early Warning Score)** - прикроватная шкала раннего распознавания ухудшения у детей. Разработан в Brighton и валидизирован Parshuram (Bedside PEWS, Toronto).\n\n### 3 основных компонента (по 0-3)\n| Компонент | Что оценивается |\n|---|---|\n| **Поведение** | игра → сонливость → раздражимость → вялость |\n| **Сердечно-сосудистая** | цвет кожи, CRT, ЧСС относительно возрастной нормы |\n| **Дыхательная** | ЧДД, ретракции, потребность в О₂ |\n\n**Бонусные баллы**: +2 за небулайзер каждые 15 мин, +2 за persistent vomiting после операции.\n\n### Возрастные нормы витальных (APLS)\n| Возраст | ЧСС | ЧДД | САД |\n|---|---|---|---|\n| <1 года | 110-160 | 30-40 | 70-90 |\n| 1-2 года | 100-150 | 25-35 | 80-95 |\n| 2-5 лет | 95-140 | 25-30 | 80-100 |\n| 5-12 лет | 80-120 | 20-25 | 90-110 |\n| >12 лет | 60-100 | 15-20 | 100-120 |\n\n### Интерпретация\n| PEWS | Действие |\n|---|---|\n| 0-2 | Мониторинг каждые 4 ч |\n| 3 | Медсестра-рестра, мониторинг 1 ч |\n| 4 | Педиатр у койки, рассмотреть сепсис |\n| ≥ 5 | MET-вызов, PICU consult |\n| ≥ 7 | Почти всегда - перевод в PICU |\n\n### Ограничения\n- Не применим у недоношенных новорожденных в NICU\n- Разные версии (Brighton, Bedside/Parshuram, Cardiff&Vale) имеют разные пороги\n- Лихорадка без других параметров часто даёт ложное повышение\n\n### Тактика\n- **0-2**: обычный педиатрический обход\n- **3-4**: эскалация, sepsis six при подозрении\n- **≥ 5**: MET, PICU, педиатрическая реанимация"
  };

export default runner;
