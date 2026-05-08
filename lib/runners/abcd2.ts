/**
 * Runner: abcd2 — ABCD² Score for TIA → Stroke Risk
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al.
 *               Validation and refinement of scores to predict very early
 *               stroke risk after transient ischaemic attack. Lancet.
 *               2007;369(9558):283-292. doi:10.1016/S0140-6736(07)60150-0
 *   GUIDELINE:  AHA/ASA 2021 TIA Statement — ABCD² ≥4 = high-risk
 *               TIA → admit, expedited workup. ESO 2008 — ABCD² ≥6
 *               warrants immediate hospitalisation.
 *               doi:10.1161/STR.0000000000000354
 *
 * Items + points (max 7):
 *   A — Age ≥60                                        1
 *   B — Blood pressure ≥140/90 at presentation         1
 *   C — Clinical features:
 *       Unilateral weakness                            2
 *       Speech disturbance без weakness                1
 *       Other                                          0
 *   D — Duration of symptoms:
 *       ≥60 min                                        2
 *       10-59 min                                      1
 *       <10 min                                        0
 *   D — Diabetes                                       1
 *
 * 2-day stroke risk:
 *   0-3   → low (1.0%)        — outpatient workup
 *   4-5   → moderate (4.1%)   — admit, urgent imaging
 *   6-7   → high (8.1%)       — emergent admission, full stroke pathway
 *
 * Caveats:
 *   - ABCD² overestimates во time-of-event (TIA fact обычно known
 *     по retrospect)
 *   - DWI-MRI positive (acute infarct) → high-risk regardless of ABCD²
 *   - Modern era: ABCD³-I (с DWI + ipsilateral carotid stenosis) более
 *     specific для acute decision-making
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
    maxScore: 7,
    inputs: [
      {
        id: "age",
        label: "A - Возраст ≥60",
        type: "checkbox",
        points: 1
      },
      {
        id: "bp",
        label: "B - АД ≥140/90",
        type: "checkbox",
        points: 1
      },
      {
        id: "clinical",
        label: "C - Клиника ТИА",
        type: "select",
        options: [
          {
            value: "0",
            label: "Другое",
            points: 0
          },
          {
            value: "1",
            label: "Только речевые нарушения",
            points: 1
          },
          {
            value: "2",
            label: "Односторонняя слабость",
            points: 2
          }
        ]
      },
      {
        id: "duration",
        label: "D - Длительность",
        type: "select",
        options: [
          {
            value: "0",
            label: "<10 мин",
            points: 0
          },
          {
            value: "1",
            label: "10-59 мин",
            points: 1
          },
          {
            value: "2",
            label: "≥60 мин",
            points: 2
          }
        ]
      },
      {
        id: "diabetes",
        label: "D - Диабет",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "0-3 (низкий)",
        color: "#22C55E",
        description: "2-дн. риск инсульта 1%."
      },
      {
        min: 4,
        max: 5,
        label: "4-5 (умеренный)",
        color: "#F59E0B",
        description: "~4%. Ранняя оценка."
      },
      {
        min: 6,
        max: 7,
        label: "6-7 (высокий)",
        color: "#EF4444",
        description: "~8%. Экстренная оценка и профилактика.",
        details: "Высокий 2-дн риск инсульта. Экстренная визуализация (КТ/МРТ, УЗДС сонных) и начало вторичной профилактики.",
        actions: [
          "Двойная антитромбоцитарная терапия (АСК + клопидогрель) первые 21-90 дн (CHANCE/POINT)",
          "Статин высокой интенсивности",
          "УЗДС сонных артерий; при стенозе ≥ 70 % - CEA/CAS в первые 14 дн",
          "Оценка на ФП - ЭКГ, холтер"
        ]
      }
    ],
    caveats: [
      "Современные гайды рекомендуют МРТ и дообследование независимо от балла",
      "ABCD² может недооценивать риск при ФП или стенозе сонных",
      "ABCD3-I (+ визуализация + клиника в паре) точнее"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    related: [
      {
        id: "nihss",
        title: "NIHSS"
      },
      {
        id: "chads-vasc",
        title: "CHA₂DS₂-VASc"
      },
      {
        id: "aspects",
        title: "ASPECTS"
      }
    ],
    reference: "Johnston 2007. Риск инсульта после ТИА в первые 2 дня.",
    info: "### Для чего используется\n**ABCD² score (Johnston 2007)** - оценка риска развития **инсульта в первые 2 и 7 дней после ТИА**. Помогает определить срочность обследования и госпитализации.\n\n### Мнемоника ABCD² (0-7 баллов)\n| Буква | Критерий | Баллы |\n|---|---|---|\n| **A** | Age ≥ 60 | 1 |\n| **B** | Blood pressure ≥ 140/90 на момент ТИА | 1 |\n| **C** | Clinical features: односторонняя слабость | 2 |\n| | речевые нарушения без слабости | 1 |\n| **D** | Duration ≥ 60 мин | 2 |\n| | 10-59 мин | 1 |\n| **²** | Diabetes mellitus | 1 |\n\n### Риск инсульта по баллам\n| ABCD² | Риск инсульта 2 дн | 7 дн | 90 дн |\n|---|---|---|---|\n| 0-3 | 1,0 % | 1,2 % | 3,1 % |\n| 4-5 | 4,1 % | 5,9 % | 9,8 % |\n| 6-7 | 8,1 % | 11,7 % | 17,8 % |\n\n### Тактика\n| ABCD² | Действие |\n|---|---|\n| 0-3 | Амбулаторное обследование в течение 1 нед (ТИА клиника) |\n| 4-5 | Госпитализация или TIA fast-track (< 24 ч) |\n| 6-7 | Экстренная госпитализация, МРТ/КТ-ангио, ЭхоКГ |\n\n### Обязательное обследование при ТИА\n| Исследование | Цель |\n|---|---|\n| **МРТ головы** | Выявление скрытого инсульта (до 30 % «ТИА» имеют ишемию на DWI) |\n| **КТ/МР-ангиография** | Стеноз сонных, базилярной, интракраниальных |\n| **ЭхоКГ** | Источник эмболии (ФП, ОИМ, аневризма ЛЖ) |\n| **Холтер** | Выявление пароксизмальной ФП |\n| **Липиды, HbA1c, ТТГ** | Факторы риска |\n\n### Вторичная профилактика\n| Ситуация | Терапия |\n|---|---|\n| Атеротромботический | АСК 100 мг + статин высокоинтенсивный (аторвастатин 80, розувастатин 40) |\n| Острая ТИА (первые дни) | Двойная антиагрегация (АСК + клопидогрел) × 21 день (CHANCE, POINT) |\n| Кардиоэмболический / ФП | Антикоагулянты (DOAC предпочтительно) |\n| Стеноз сонной > 70 % | **CEA** (эндартерэктомия) или **стентирование** в течение 2 нед |\n\n### Современные модификации\n| Шкала | Особенность |\n|---|---|\n| **ABCD³-I** | + КТ-ангио (показывает стеноз сонной) |\n| **ABCD²-I** | + МРТ-DWI позитивность |\n| **CHA₂DS₂-VASc** | Для ФП-ассоциированных |\n\n### Ограничения\n- Чувствительность ограничена, особенно у молодых\n- Не учитывает атеросклероз (cтеноз), тромбофилию\n- Не подходит для определения срочности эндартерэктомии\n- Современные алгоритмы (ТИА-clinic fast-track) могут быть лучше"
  };

export default runner;
