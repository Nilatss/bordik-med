// @ts-nocheck
/**
 * Runner: gcs — Glasgow Coma Scale
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Teasdale G, Jennett B. Assessment of coma and impaired
 *               consciousness. A practical scale. Lancet. 1974;2(7872):81-84.
 *               doi:10.1016/s0140-6736(74)91639-0
 *   UPDATE:     Teasdale G, Maas A, Lecky F, et al. The Glasgow Coma Scale
 *               at 40 years: standing the test of time. Lancet Neurol.
 *               2014;13(8):844-854. doi:10.1016/S1474-4422(14)70120-8
 *               (formal "GCS Aid" + structured assessment instructions)
 *   GUIDELINE:  ATLS 10th Edition — GCS как primary neuro assessment в
 *               trauma. ≤8 = «coma», typically intubation indication.
 *
 * Components (sum = 3-15):
 *   Eye opening (E)         — 1-4
 *     1 — none
 *     2 — to pressure (sternum/nail)
 *     3 — to sound
 *     4 — spontaneous
 *   Verbal response (V)     — 1-5
 *     1 — none
 *     2 — sounds (incomprehensible)
 *     3 — words (inappropriate)
 *     4 — confused conversation
 *     5 — orientated
 *     T — intubated/tracheostomy (record как «E?V[T]M?»)
 *   Motor response (M)      — 1-6
 *     1 — none
 *     2 — extension (decerebrate)
 *     3 — flexion abnormal (decorticate)
 *     4 — flexion normal (withdrawal from pain)
 *     5 — localising (purposeful movement to pain)
 *     6 — obeys commands
 *
 * Severity bands:
 *   13-15 → mild head injury
 *   9-12  → moderate
 *   3-8   → severe (consider airway protection, ICU)
 *
 * Caveats:
 *   - Не валидирован для intubated patients (используй FOUR Score)
 *   - Sedated patient → record pre-sedation GCS если возможно
 *   - Component scores (E, V, M) клинически информативнее total
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
    maxScore: 15,
    inputs: [
      {
        id: "eye",
        label: "Открывание глаз",
        type: "select",
        options: [
          {
            value: "4",
            label: "Спонтанное",
            points: 4
          },
          {
            value: "3",
            label: "На голос",
            points: 3
          },
          {
            value: "2",
            label: "На боль",
            points: 2
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "verbal",
        label: "Речевая реакция",
        type: "select",
        options: [
          {
            value: "5",
            label: "Ориентирован",
            points: 5
          },
          {
            value: "4",
            label: "Спутанная речь",
            points: 4
          },
          {
            value: "3",
            label: "Неадекватные слова",
            points: 3
          },
          {
            value: "2",
            label: "Непонятные звуки",
            points: 2
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      },
      {
        id: "motor",
        label: "Моторная реакция",
        type: "select",
        options: [
          {
            value: "6",
            label: "Выполняет команды",
            points: 6
          },
          {
            value: "5",
            label: "Локализует боль",
            points: 5
          },
          {
            value: "4",
            label: "Отдёргивает на боль",
            points: 4
          },
          {
            value: "3",
            label: "Патологическое сгибание",
            points: 3
          },
          {
            value: "2",
            label: "Патологическое разгибание",
            points: 2
          },
          {
            value: "1",
            label: "Нет",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 3,
        max: 8,
        label: "3-8 (тяжёлая)",
        color: "#EF4444",
        description: "Тяжёлое нарушение сознания. Интубация при ≤8.",
        details: "Классический порог интубации \"GCS ≤ 8 - intubate\". Высокий риск аспирации и вторичного повреждения мозга. Обеспечить защиту дыхательных путей и нормоксию/нормокапнию.",
        actions: [
          "Интубация и ИВЛ (RSI, избегать гипотензии и гипоксии)",
          "Головной конец 30°, седация, контроль ВЧД",
          "КТ головы немедленно (при ЧМТ / острое ухудшение)",
          "Оценить сахар крови, электролиты, токсины, Narcan/тиамин при подозрении"
        ]
      },
      {
        min: 9,
        max: 12,
        label: "9-12 (умеренная)",
        color: "#F59E0B",
        description: "Умеренное нарушение сознания."
      },
      {
        min: 13,
        max: 15,
        label: "13-15 (лёгкая)",
        color: "#22C55E",
        description: "Лёгкое нарушение / норма."
      }
    ],
    caveats: [
      "Невозможно оценить верабльный компонент у интубированных - указывать как GCSV=1T; считать суммой E+M без V при необходимости",
      "Алкоголь, седация, афазия, тяжёлая глухота/слепота искажают компоненты",
      "У детей < 5 лет использовать педиатрическую модификацию (pGCS)",
      "FOUR score - альтернатива у интубированных (учитывает ствол и дыхание)"
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    related: [
      {
        id: "nihss",
        title: "NIHSS (инсульт)"
      },
      {
        id: "mmse",
        title: "MMSE (когн. функции)"
      },
      {
        id: "ich",
        title: "ICH score"
      }
    ],
    reference: "Teasdale & Jennett 1974. Стандарт оценки ЧМТ.",
    countries: "Международный",
    info: "### Для чего используется\n**Шкала комы Глазго (GCS, Teasdale & Jennett 1974)** - стандартизированная оценка уровня сознания у пациентов с **ЧМТ, инсультом, коматозных**. Используется во всём мире в травматологии, реанимации, неврологии.\n\n### Три компонента\n| E - глаза | V - речь | M - моторика |\n|---|---|---|\n| 4: спонтанно | 5: ориентирован | 6: выполняет команды |\n| 3: на голос | 4: спутанная | 5: локализует боль |\n| 2: на боль | 3: неадекватные слова | 4: отдёргивает |\n| 1: нет | 2: непонятные звуки | 3: патологич. сгибание (decorticate) |\n|  | 1: нет | 2: патологич. разгибание (decerebrate) |\n|  |  | 1: нет |\n\nЗапись: **E_V_M_** (например, E3V4M5 = 12).\n\n### Интерпретация\n| GCS | Тяжесть | Смертность |\n|---|---|---|\n| 13-15 | Лёгкая ЧМТ | < 1 % |\n| 9-12 | Умеренная | 2-15 % |\n| 3-8 | Тяжёлая | 30-50 % |\n\n**GCS ≤ 8 = кома** → показание к **защите дыхательных путей** (интубация \"GCS ≤ 8, intubate\").\n\n### Когда пункты нельзя оценить\n- **E**: отёк периорбитальный - записывают \"**1T**\" или \"**C**\" (closed)\n- **V**: интубирован - \"**1T**\" (tube); возможны ETT адаптации\n- **M**: парализованный для ИВЛ - \"**1P**\" (paralyzed)\n\nОбщий балл тогда может быть неинформативен - **фиксируйте покомпонентно**.\n\n### Pediatric GCS\nУ детей < 2 лет речевые и моторные критерии модифицируются (детский Glasgow). У младенцев:\n- V5: улыбается / соответствующий плач\n- V4: плачет, но утешается\n- V3: неадекватный плач\n- V2: стоны\n- V1: нет\n\n### Дополнительные параметры оценки (неврологический осмотр при коме)\n- **Зрачки**: размер, симметрия, реакция на свет\n- **Стволовые рефлексы**: корнеальный, окулоцефалический (кукольные глаза), окуловестибулярный (калорическая проба)\n- **Реакция на болевой стимул** асимметрия\n- **Поза**: декортикальная (сгибательная) vs децеребрационная (разгибательная)\n\n### GCS-Pupils Score\nУточнённая шкала:\n`GCS-P = GCS − реактивные зрачки (0, 1 или 2)`\n\nГде реактивные зрачки: 2 - оба не реагируют; 1 - один; 0 - оба реагируют.\n\n### FOUR Score (альтернатива)\n**Full Outline Of UnResponsiveness** (Wijdicks 2005) - для ICU, применим у интубированных:\n- Eye\n- Motor\n- Brainstem\n- Respiration\n\nКаждый 0-4, итого 0-16. Лучше у интубированных пациентов.\n\n### Пациенты группы риска при лёгкой ЧМТ (GCS 13-15)\nКритерии для КТ головы:\n- **Canadian CT Head Rule** (взрослые)\n- **PECARN** (дети)\n- **New Orleans Criteria**\n\nОтмечу, что GCS 14 при недавней травме с амнезией часто требует КТ.\n\n### Терапевтические пороги при тяжёлой ЧМТ (GCS ≤ 8)\n- Внутричерепное давление < 22 мм рт.ст. (BTF Guidelines 2016)\n- CPP (церебральное перфузионное давление) 60-70 мм рт.ст.\n- PaCO₂ 35-45 (не гипервентилировать рутинно)\n- Изотонические растворы, избегать гипотонических\n- Гиперосмолярная терапия (гипертонический NaCl 3 % или маннитол) при признаках вклинения\n\n### Ограничения\n- Субъективность при V-компоненте у спутанных пациентов\n- Не отличает метаболическую от травматической причины\n- Интубация и паралитики делают оценку неполной\n- Низкая надёжность у очень пьяных / интоксицированных\n- Не учитывает локальные неврологические дефициты"
  };

export default runner;
