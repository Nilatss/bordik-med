// @ts-nocheck
/**
 * Runner: killip
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
