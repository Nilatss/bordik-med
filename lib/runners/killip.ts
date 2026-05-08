/**
 * Runner: killip — Killip Classification of Heart Failure in MI
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Killip T 3rd, Kimball JT. Treatment of myocardial
 *               infarction in a coronary care unit. A two year experience
 *               with 250 patients. Am J Cardiol. 1967;20(4):457-464.
 *               doi:10.1016/0002-9149(67)90023-9
 *   USE:        Variable в GRACE risk score (P1-CR-10 grace.ts) и в ESC
 *               2023 ACS Guidelines для in-hospital mortality estimation.
 *
 * Classes (clinical exam at presentation):
 *   I    — No clinical signs of heart failure
 *          → 30-day mortality ≈ 6%
 *   II   — Crackles в lung bases, S3 gallop, elevated JVP
 *          → 30-day mortality ≈ 17%
 *   III  — Acute pulmonary oedema (rales >50% of lung fields)
 *          → 30-day mortality ≈ 38%
 *   IV   — Cardiogenic shock (SBP <90, hypoperfusion, oliguria)
 *          → 30-day mortality ≈ 81%
 *
 * Применение:
 *   - Сразу при ED admission MI patient
 *   - Component в GRACE 2.0 calculation
 *   - Гид для disposition: Class I-II → ward, Class III-IV → CCU/ICU
 *
 * Caveats:
 *   - Subjective component (auscultation skill)
 *   - Modern Era ↓ mortality (PCI, statins) — original Killip 1967
 *     numbers overestimate, GRACE uses re-calibrated coefficients
 *   - НЕ применяй в non-MI heart failure (use NYHA / ACC/AHA stages)
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
    maxScore: 4,
    inputs: [
      {
        id: "cl",
        label: "Класс",
        type: "select",
        options: [
          {
            value: "1",
            label: "I - Нет признаков СН",
            points: 1
          },
          {
            value: "2",
            label: "II - Влажные хрипы <50% лёгких, S3",
            points: 2
          },
          {
            value: "3",
            label: "III - Отёк лёгких",
            points: 3
          },
          {
            value: "4",
            label: "IV - Кардиогенный шок",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "I",
        color: "#22C55E",
        description: "30-дн. смертность ~6%."
      },
      {
        min: 2,
        max: 2,
        label: "II",
        color: "#F59E0B",
        description: "~17%."
      },
      {
        min: 3,
        max: 3,
        label: "III",
        color: "#EF4444",
        description: "~38%."
      },
      {
        min: 4,
        max: 4,
        label: "IV",
        color: "#991B1B",
        description: "~81%. Экстренная реваскуляризация + поддержка.",
        details: "Кардиогенный шок при ОИМ. Наивысший риск смертности. Немедленная реваскуляризация (PCI) + гемодинамическая поддержка.",
        actions: [
          "Первичная PCI немедленно (CULPRIT-SHOCK: culprit-only)",
          "Инотропы/вазопрессоры (норэпинефрин + добутамин)",
          "Рассмотреть MCS: IABP, Impella, VA-ECMO",
          "ИВЛ, контроль ацидоза, CRRT при ОПП"
        ]
      }
    ],
    caveats: [
      "Применяется только для ОИМ, не при хронической ХСН",
      "Для профилей ХСН без ОИМ - Forrester/Nohria",
      "Субъективная клиническая оценка (хрипы, S3) - межрейтерская вариабельность"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "forrester",
        title: "Forrester/Nohria"
      },
      {
        id: "nyha",
        title: "NYHA"
      },
      {
        id: "timi",
        title: "TIMI"
      }
    ],
    reference: "Killip 1967. Оценка ОСН при остром ИМ по клинике.",
    info: "### Для чего используется\n**Классификация Killip (1967)** - клиническое стадирование острой сердечной недостаточности при **остром инфаркте миокарда**. Простая, не требует инструментальных методов.\n\n### Классы и смертность\n| Класс | Критерии | Госпитальная смертность |\n|---|---|---|\n| I | Нет признаков СН | 5-6 % |\n| II | S3 + хрипы в нижних отделах, JVD | 17 % |\n| III | Острый отёк лёгких (хрипы во всех полях) | 30-40 % |\n| IV | Кардиогенный шок (САД < 90, гипоперфузия) | 60-80 % |\n\n### Лечение по классам\n| Класс | Подход |\n|---|---|\n| I | Стандартная терапия ИМ: ПКВ, ДАПТ, статин, β-блок, ИАПФ |\n| II | + фуросемид в/в, нитроглицерин при САД > 90 |\n| III | НИВ / интубация; фуросемид; инотропы при гипотензии |\n| IV | ICU; инотропы (добутамин, норэпинефрин); MCS (IABP, Impella, VA-ECMO); экстренная ПКВ |\n\n### Альтернативы\n| Шкала | Основа |\n|---|---|\n| Forrester | Катетер Сван-Ганц (CI, PCWP) |\n| Nohria-Stevenson | Wet/dry, warm/cold |\n| TIMI / GRACE | Общий риск при ОКС |\n\n### Ограничения\n- Субъективная оценка хрипов\n- Не учитывает ЭхоКГ и ФВ ЛЖ\n- Оценка статическая (одномоментная)"
  };

export default runner;
