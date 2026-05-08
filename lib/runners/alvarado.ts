// @ts-nocheck
/**
 * Runner: alvarado — Alvarado Score (MANTRELS) for Appendicitis
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Alvarado A. A practical score for the early diagnosis of
 *               acute appendicitis. Ann Emerg Med. 1986;15(5):557-564.
 *               doi:10.1016/S0196-0644(86)80993-3
 *   GUIDELINE:  WSES 2020 Jerusalem Guidelines for diagnosis & treatment
 *               of acute appendicitis — Alvarado as triage tool;
 *               Imaging (CT / US) для borderline 5-6.
 *               doi:10.1186/s13017-020-00306-3
 *
 * MANTRELS mnemonic + points (max 10):
 *   M — Migration of pain to RLQ                 1
 *   A — Anorexia                                  1
 *   N — Nausea / vomiting                          1
 *   T — Tenderness in RLQ                          2
 *   R — Rebound tenderness                         1
 *   E — Elevated temperature (≥37.3°C)             1
 *   L — Leukocytosis (>10 ×10⁹/L)                  2
 *   S — Shift to left (>75% neutrophils)           1
 *
 * Bands:
 *   1-4   → unlikely appendicitis — discharge с safety-net
 *   5-6   → equivocal — observation OR imaging (CT preferred adults,
 *          US in pregnant / pediatric)
 *   7-8   → probable — surgical consult / appendectomy
 *   9-10  → very probable — emergent surgical consult
 *
 * Caveats:
 *   - Sensitivity ↓ в women (gynae differential)
 *   - PAS (Pediatric Appendicitis Score, см. alvarado-pas.ts) — для детей
 *   - Не заменяет clinical judgement / imaging в borderline cases
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
    maxScore: 10,
    inputs: [
      {
        id: "migration",
        label: "M - Миграция боли в правую подвздошную обл.",
        type: "checkbox",
        points: 1
      },
      {
        id: "anorexia",
        label: "A - Анорексия",
        type: "checkbox",
        points: 1
      },
      {
        id: "nausea",
        label: "N - Тошнота/рвота",
        type: "checkbox",
        points: 1
      },
      {
        id: "tenderness",
        label: "T - Болезненность в правой подвздошной обл.",
        type: "checkbox",
        points: 2
      },
      {
        id: "rebound",
        label: "R - Симптом Щёткина-Блюмберга",
        type: "checkbox",
        points: 1
      },
      {
        id: "elevation",
        label: "E - Повышение температуры ≥37.3°C",
        type: "checkbox",
        points: 1
      },
      {
        id: "leukocytosis",
        label: "L - Лейкоцитоз ≥10×10⁹/л",
        type: "checkbox",
        points: 2
      },
      {
        id: "shift",
        label: "S - Сдвиг лейкоформулы влево (≥75% нейтрофилов)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "0-4 (низкая)",
        color: "#22C55E",
        description: "Низкая вероятность. Наблюдение или альтернативная диагностика."
      },
      {
        min: 5,
        max: 6,
        label: "5-6 (возможный)",
        color: "#F59E0B",
        description: "Возможный аппендицит. УЗИ/КТ."
      },
      {
        min: 7,
        max: 8,
        label: "7-8 (вероятный)",
        color: "#F97316",
        description: "Вероятный. Консультация хирурга."
      },
      {
        min: 9,
        max: 10,
        label: "9-10 (высокая)",
        color: "#EF4444",
        description: "Очень высокая. Аппендэктомия."
      }
    ],
    caveats: [
      "Чувствительность ниже у женщин (ДД с гинекологией), беременных и пожилых",
      "У детей использовать PAS (Pediatric Appendicitis Score) - валидизирован",
      "Не исключает аппендицит при низкой сумме - КТ/УЗИ при сохраняющейся клинике",
      "Лейкоцитоз и нейтрофилёз могут отсутствовать у пожилых / иммуносупрессии"
    ],
    relatedCourses: [
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "pas",
        title: "PAS (Pediatric Appendicitis)"
      },
      {
        id: "kocher",
        title: "Kocher (септический артрит)"
      }
    ],
    reference: "Alvarado 1986 (MANTRELS). Скрининговая шкала острого аппендицита.",
    info: "### Для чего используется\n**Alvarado score (MANTRELS)** - 10-балльная клиническая шкала оценки вероятности **острого аппендицита** у пациентов с болью в правой подвздошной области.\n\n### Мнемоника MANTRELS\n| Буква | Параметр | Баллы |\n|---|---|---|\n| M | Migration of pain (миграция в правую подвздошную) | 1 |\n| A | Anorexia | 1 |\n| N | Nausea / vomiting | 1 |\n| T | Tenderness (правая подвздошная) | 2 |\n| R | Rebound pain (Щёткина-Блюмберга) | 1 |\n| E | Elevation of temperature (≥ 37,3 °C) | 1 |\n| L | Leukocytosis (≥ 10 × 10⁹/л) | 2 |\n| S | Shift of WBC left (≥ 75 % нейтрофилов) | 1 |\n\n### Интерпретация\n| Баллы | Вероятность | Тактика |\n|---|---|---|\n| 0-4 | Низкая | Наблюдение или альтернативный диагноз |\n| 5-6 | Возможная | УЗИ / КТ |\n| 7-8 | Вероятная | Хирургическая консультация |\n| 9-10 | Очень высокая | Аппендэктомия |\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **AIR** | Включает CRP |\n| **PAS** | Для детей (Samuel 2002) |\n| **RIPASA** | Валидизирована в азиатской популяции |\n| **Adult Appendicitis Score** | Современная, учитывает КТ-критерии |\n\n### Ограничения\n- Менее точна у женщин (DDx: гинекология)\n- Возможна гипердиагностика у детей и пожилых\n- Не заменяет визуализацию при промежуточном балле"
  };

export default runner;
