// @ts-nocheck
/**
 * Runner: qsofa — quick Sequential Organ Failure Assessment
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Singer M, Deutschman CS, Seymour CW, et al. The Third
 *               International Consensus Definitions for Sepsis and Septic
 *               Shock (Sepsis-3). JAMA. 2016;315(8):801-810.
 *               doi:10.1001/jama.2016.0287
 *   GUIDELINE:  Surviving Sepsis Campaign 2021 — qSOFA остаётся bedside
 *               screening tool, но НЕ замена SOFA или clinical judgement.
 *               doi:10.1097/CCM.0000000000005337
 *
 * Items (1 балл каждый, max 3):
 *   1 — Respiratory rate ≥22/min
 *   1 — Altered mentation (GCS <15)
 *   1 — Systolic BP ≤100 mmHg
 *
 * Interpretation:
 *   0-1 → unlikely sepsis (low specificity, high sensitivity)
 *   ≥2  → high risk for poor outcome / sepsis — escalate care, full SOFA
 *
 * Caveats:
 *   - НЕ диагноз сепсиса, а триггер для full work-up
 *   - low sensitivity для early sepsis vs NEWS2 (предпочтителен NEWS2)
 *   - применяется ТОЛЬКО при подозрении на инфекцию
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
    maxScore: 3,
    inputs: [
      {
        id: "rr",
        label: "ЧДД ≥22/мин",
        type: "checkbox",
        points: 1
      },
      {
        id: "sbp",
        label: "Систолическое АД ≤100 мм рт.ст.",
        type: "checkbox",
        points: 1
      },
      {
        id: "mental",
        label: "Изменение сознания (GCS <15)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 балл",
        color: "#22C55E",
        description: "Риск плохого исхода низкий."
      },
      {
        min: 2,
        max: 3,
        label: "≥2 балла",
        color: "#EF4444",
        description: "Высокий риск. Продолжить оценку (лактат, SOFA). Возможен сепсис.",
        details: "qSOFA ≥ 2 + подозрение на инфекцию - высокий риск смертности ( > 10 %). Применять Sepsis-3: считать полный SOFA, лактат, начинать sepsis bundle-1h.",
        actions: [
          "Sepsis bundle-1h: лактат, гемокультуры × 2, АБ широкого спектра, кристаллоиды 30 мл/кг при гипотензии/лактат ≥ 4",
          "Полный SOFA для диагноза сепсиса (Δ ≥ 2)",
          "При рефрактерной гипотензии - норэпинефрин, цель MAP ≥ 65",
          "Источник: по возможности контроль в первые 6-12 ч"
        ]
      }
    ],
    caveats: [
      "qSOFA - скрининг, не диагностический критерий сепсиса (требуется SOFA Δ ≥ 2)",
      "Низкая чувствительность в ER (пропускает ~30 % сепсиса) - не использовать изолированно",
      "Surviving Sepsis 2021 рекомендует NEWS2 или SIRS как альтернативный скрининг",
      "В ICU применяют полный SOFA, не qSOFA"
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
        id: "sofa",
        title: "SOFA (полный)"
      },
      {
        id: "news2",
        title: "NEWS2"
      },
      {
        id: "curb65",
        title: "CURB-65 (пневмония)"
      }
    ],
    reference: "Sepsis-3 (2016): ≥2 вне ICU - подозрение на сепсис. Быстрый прикроватный скрининг.",
    countries: "Международный (SSC, Sepsis-3)",
    info: "### Для чего используется\n**qSOFA (quick SOFA)** - прикроватный скрининг **риска плохого исхода при подозрении на сепсис** вне ICU. Определён в **Sepsis-3 consensus (2016)**.\n\n### 3 критерия (по 1 баллу)\n| Критерий | Порог |\n|---|---|\n| **ЧДД** | ≥ 22/мин |\n| **САД** | ≤ 100 мм рт.ст. |\n| **Сознание** | Изменено (GCS < 15) |\n\n### Интерпретация\n| qSOFA | Значение |\n|---|---|\n| ≤ 1 | Низкий риск - продолжить обычное наблюдение |\n| ≥ 2 | Высокий риск - расширенная оценка (лактат, полный SOFA), возможен сепсис |\n\nqSOFA ≥ 2 ассоциирован со **смертностью ~ 10 %** у нехирургических стационарных.\n\n### Sepsis-3 определения\n**Сепсис** = дисрегулируемый ответ на инфекцию с **органной дисфункцией** (ΔSOFA ≥ 2).\n\n**Септический шок** = сепсис + необходимость вазопрессоров для МАР ≥ 65 **и** лактат > 2 ммоль/л **несмотря на адекватную инфузию**.\n\n### qSOFA vs SIRS vs NEWS2\n| Скрининг | Чувствительность | Специфичность | Где применять |\n|---|---|---|---|\n| SIRS (устарел) | Высокая | Низкая | Не рекомендуется с 2016 |\n| **qSOFA** | ~ 60 % | ~ 80 % | Вне ICU |\n| **SOFA (полный)** | Высокая | Высокая | ICU, прогноз |\n| **NEWS2** | Чувствительнее qSOFA | Меньше специфичность | Стационар UK |\n\n⚠️ **SSC 2021 рекомендует: НЕ использовать qSOFA как единственный скрининг** - он упускает часть пациентов с сепсисом. Лучше комбинация с SIRS, NEWS2, лактатом.\n\n### Алгоритм при подозрении на сепсис (Hour-1 Bundle, SSC)\n1. **Лактат** - измерить; повторить через 2-4 ч если > 2\n2. **Гемокультуры** × 2 до антибиотиков\n3. **Антибиотики широкого спектра** в течение 1 ч (эмпирически)\n4. **Инфузия кристаллоидов** 30 мл/кг при гипотензии или лактат ≥ 4\n5. **Вазопрессоры** (норэпинефрин) при МАР < 65 после инфузии\n\n### Эмпирические антибиотики\n- Внебольничная пневмония + септический шок: цефтриаксон + азитромицин (+ ванкомицин при риске MRSA)\n- Интраабдоминальная: пиперациллин-тазобактам или меропенем\n- Мочевая: цефтриаксон, пиперациллин-тазобактам\n- Неясный источник у нейтропеника: цефепим + ванкомицин\n- Подозрение на MRSA: добавить ванкомицин / линезолид\n- Candida (long ICU, ПП, центральные катетеры): микафунгин\n\n### Почему нужен быстрый ответ\nКаждый час задержки в антибиотиках при септическом шоке - **+ 7,6 %** смертности (Kumar 2006).\n\n### Ограничения qSOFA\n- Низкая чувствительность - пропускает ~ 40 % ранних сепсисов\n- Не учитывает лабораторные показатели (лактат, лейкоцитоз, тромбоциты)\n- В амбулаторной практике хуже работает, чем в ER\n- Не валидирован у беременных, детей"
  };

export default runner;
