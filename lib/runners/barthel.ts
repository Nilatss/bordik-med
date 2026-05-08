/**
 * Runner: barthel — Barthel Index of Activities of Daily Living
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Mahoney FI, Barthel DW. Functional Evaluation: The Barthel
 *               Index. Md State Med J. 1965;14:61-65. PMID: 14258950
 *   MODIFIED:   Shah S, Vanclay F, Cooper B. Improving the sensitivity of
 *               the Barthel Index for stroke rehabilitation. J Clin
 *               Epidemiol. 1989;42(8):703-709.
 *               doi:10.1016/0895-4356(89)90065-6
 *   GUIDELINE:  AHA/ASA 2016 Stroke Rehabilitation Guidelines — Barthel
 *               как standard ADL outcome measure в rehab.
 *
 * 10 items (0/5/10 or 0/5/10/15 — original 100-point scale):
 *   - Feeding                    0/5/10
 *   - Bathing                    0/5
 *   - Grooming                   0/5
 *   - Dressing                   0/5/10
 *   - Bowels                     0/5/10
 *   - Bladder                    0/5/10
 *   - Toilet use                 0/5/10
 *   - Transfers (bed-chair)      0/5/10/15
 *   - Mobility (level surfaces)  0/5/10/15
 *   - Stairs                     0/5/10
 *
 *   Total: 0-100 (higher = more independent)
 *
 * Bands (clinical interpretation):
 *   0-20    → totally dependent
 *   21-40   → severely dependent
 *   41-60   → moderate dependence
 *   61-80   → mild dependence
 *   81-99   → minimally dependent
 *   100     → fully independent
 *
 * Use cases:
 *   - Pre/post rehab functional measurement
 *   - Discharge planning (home vs SNF vs LTC)
 *   - Insurance / payer authorization
 *
 * Modified Barthel (Shah 1989): expanded к 5-point per item для
 * лучше sensitivity к small functional changes.
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
    maxScore: 100,
    inputs: [
      {
        id: "feeding",
        label: "Приём пищи",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - зависим",
            points: 0
          },
          {
            value: "5",
            label: "5 - нужна помощь (резать, намазывать)",
            points: 5
          },
          {
            value: "10",
            label: "10 - независим",
            points: 10
          }
        ]
      },
      {
        id: "bathing",
        label: "Купание",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - зависим",
            points: 0
          },
          {
            value: "5",
            label: "5 - независим (или в душе)",
            points: 5
          }
        ]
      },
      {
        id: "grooming",
        label: "Уход за собой (умывание, бритьё, чистка зубов)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - нужна помощь",
            points: 0
          },
          {
            value: "5",
            label: "5 - независим",
            points: 5
          }
        ]
      },
      {
        id: "dressing",
        label: "Одевание",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - зависим",
            points: 0
          },
          {
            value: "5",
            label: "5 - нужна помощь, но делает половину самостоятельно",
            points: 5
          },
          {
            value: "10",
            label: "10 - независим (пуговицы, молнии, шнурки)",
            points: 10
          }
        ]
      },
      {
        id: "bowels",
        label: "Контроль дефекации",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - недержание (или клизмы)",
            points: 0
          },
          {
            value: "5",
            label: "5 - эпизодические происшествия",
            points: 5
          },
          {
            value: "10",
            label: "10 - полный контроль",
            points: 10
          }
        ]
      },
      {
        id: "bladder",
        label: "Контроль мочеиспускания",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - недержание / катетер (без самоухода)",
            points: 0
          },
          {
            value: "5",
            label: "5 - эпизодические происшествия",
            points: 5
          },
          {
            value: "10",
            label: "10 - полный контроль",
            points: 10
          }
        ]
      },
      {
        id: "toilet",
        label: "Пользование туалетом",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - зависим",
            points: 0
          },
          {
            value: "5",
            label: "5 - нужна помощь, но частично справляется",
            points: 5
          },
          {
            value: "10",
            label: "10 - независим",
            points: 10
          }
        ]
      },
      {
        id: "transfer",
        label: "Перемещения (кровать ↔ кресло)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - не способен, нет баланса сидя",
            points: 0
          },
          {
            value: "5",
            label: "5 - нужна значительная помощь (1-2 человека)",
            points: 5
          },
          {
            value: "10",
            label: "10 - нужна небольшая помощь / наблюдение",
            points: 10
          },
          {
            value: "15",
            label: "15 - независим",
            points: 15
          }
        ]
      },
      {
        id: "mobility",
        label: "Мобильность по ровной поверхности",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - неподвижен или < 45 м",
            points: 0
          },
          {
            value: "5",
            label: "5 - в коляске независим, включая повороты, ≥ 45 м",
            points: 5
          },
          {
            value: "10",
            label: "10 - ходит с помощью одного человека ≥ 45 м",
            points: 10
          },
          {
            value: "15",
            label: "15 - независим (возможно с опорой, тростью)",
            points: 15
          }
        ]
      },
      {
        id: "stairs",
        label: "Подъём по лестнице",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - не способен",
            points: 0
          },
          {
            value: "5",
            label: "5 - нужна помощь (вербальная/физическая, опора)",
            points: 5
          },
          {
            value: "10",
            label: "10 - независим",
            points: 10
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 20,
        label: "0-20 - полная зависимость",
        color: "#EF4444",
        description: "Пациент полностью зависим во всех сферах повседневной активности.",
        details: "Необходим круглосуточный уход. Высокий риск пролежней, контрактур, аспирации, делирия.",
        actions: [
          "Организация постоянного ухода (сиделка, ПСУ, дом ухода)",
          "Профилактика пролежней (Braden), ВТЭ, аспирации",
          "Нутритивная поддержка, мультидисциплинарная реабилитация",
          "Оценка паллиативных потребностей"
        ]
      },
      {
        min: 21,
        max: 60,
        label: "21-60 - тяжёлая зависимость",
        color: "#EF4444",
        description: "Зависим в большинстве повседневных задач.",
        actions: [
          "Реабилитация (ЛФК, ОТ, логопед)",
          "Помощь на дому (PSU) или стационар долговременного ухода",
          "Обучение родственников навыкам ухода"
        ]
      },
      {
        min: 61,
        max: 90,
        label: "61-90 - умеренная зависимость",
        color: "#F59E0B",
        description: "Нужна помощь в некоторых видах активности.",
        actions: [
          "Ранняя реабилитация для возврата к независимости",
          "Оценка безопасности дома (поручни, устранение коврами)",
          "Патронаж, дневной центр"
        ]
      },
      {
        min: 91,
        max: 99,
        label: "91-99 - лёгкая зависимость",
        color: "#22C55E",
        description: "Практически независим; помощь эпизодическая.",
        actions: [
          "Поддержание активности, профилактика падений (Tinetti, Morse)"
        ]
      },
      {
        min: 100,
        max: 100,
        label: "100 - полная независимость",
        color: "#22C55E",
        description: "Полная независимость в повседневной активности."
      }
    ],
    caveats: [
      "Оценивает только базовую ADL, не IADL - для пожилых добавьте Lawton IADL",
      "Potter ceiling effect: 100 баллов не означает полное функциональное здоровье",
      "Не учитывает когницию, поведение, безопасность (добавьте MMSE, 4AT)",
      "Shah-модификация (1989) более чувствительна в реабилитации"
    ],
    related: [
      {
        id: "katz-adl",
        title: "Katz ADL"
      },
      {
        id: "mrs",
        title: "Modified Rankin Scale"
      },
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Mahoney FI, Barthel DW. Functional evaluation: the Barthel Index. Md State Med J 1965; 14:61-65.",
    countries: "Международный",
    presets: [
      {
        label: "Полная независимость",
        values: {
          feeding: "10",
          bathing: "5",
          grooming: "5",
          dressing: "10",
          bowels: "10",
          bladder: "10",
          toilet: "10",
          transfer: "15",
          mobility: "15",
          stairs: "10"
        }
      },
      {
        label: "Умеренная зависимость",
        values: {
          feeding: "10",
          bathing: "0",
          grooming: "5",
          dressing: "5",
          bowels: "10",
          bladder: "5",
          toilet: "5",
          transfer: "10",
          mobility: "10",
          stairs: "5"
        }
      },
      {
        label: "Полная зависимость",
        values: {
          feeding: "0",
          bathing: "0",
          grooming: "0",
          dressing: "0",
          bowels: "0",
          bladder: "0",
          toilet: "0",
          transfer: "0",
          mobility: "0",
          stairs: "0"
        }
      }
    ],
    info: "### Для чего используется\n**Barthel ADL Index** - классическая шкала оценки повседневной активности (activities of daily living, ADL). 10 пунктов, сумма 0-100 (шаг 5). Применяется при инсульте, реабилитации, гериатрии, хроническом уходе.\n\n### 10 пунктов\n| Пункт | Варианты |\n|---|---|\n| Приём пищи | 0 / 5 / 10 |\n| Купание | 0 / 5 |\n| Уход за собой | 0 / 5 |\n| Одевание | 0 / 5 / 10 |\n| Контроль дефекации | 0 / 5 / 10 |\n| Контроль мочеиспускания | 0 / 5 / 10 |\n| Пользование туалетом | 0 / 5 / 10 |\n| Перемещения | 0 / 5 / 10 / 15 |\n| Мобильность | 0 / 5 / 10 / 15 |\n| Лестница | 0 / 5 / 10 |\n\n### Интерпретация\n| Сумма | Уровень зависимости |\n|---|---|\n| 0-20 | Полная |\n| 21-60 | Тяжёлая |\n| 61-90 | Умеренная |\n| 91-99 | Лёгкая |\n| 100 | Независим |\n\n### Ограничения\n- Только базовая ADL; IADL (покупки, финансы, телефон, транспорт, готовка, уборка, лекарства) - Lawton\n- Ceiling effect: 100 ≠ норма\n- Не учитывает когницию и поведение\n\n### Тактика\n- **≤ 60** - стационар/длительный уход, мультидисциплинарная реабилитация\n- **61-90** - реабилитация, ОТ-оценка домашней безопасности\n- **≥ 91** - профилактика падений и сохранение автономии"
  };

export default runner;
