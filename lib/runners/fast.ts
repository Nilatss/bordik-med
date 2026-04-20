// @ts-nocheck
/**
 * Runner: fast
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
    maxScore: 6,
    inputs: [
      {
        id: "balance",
        label: "B - Balance: внезапное нарушение равновесия / атаксия",
        type: "checkbox",
        points: 1
      },
      {
        id: "eyes",
        label: "E - Eyes: внезапная потеря/двоение зрения, выпадение поля",
        type: "checkbox",
        points: 1
      },
      {
        id: "face",
        label: "F - Face: асимметрия лица, опущение угла рта",
        type: "checkbox",
        points: 1
      },
      {
        id: "arm",
        label: "A - Arm: слабость в руке (проба Барре)",
        type: "checkbox",
        points: 1
      },
      {
        id: "speech",
        label: "S - Speech: нарушение речи (дизартрия, афазия)",
        type: "checkbox",
        points: 1
      },
      {
        id: "time",
        label: "T - Time: установлено время появления симптомов",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "Нет признаков",
        color: "#22C55E",
        description: "Инсульт маловероятен, но не исключён.",
        details: "Оценка других причин (гипогликемия, эпилепсия, мигрень, интоксикация). Если высокая настороженность - немедленный транспорт.",
        actions: [
          "Проверить глюкозу",
          "Повторить осмотр через 10 мин",
          "Исключить stroke mimics"
        ]
      },
      {
        min: 1,
        max: 6,
        label: "≥1 признак",
        color: "#991B1B",
        description: "Подозрение на инсульт. Срочная транспортировка в stroke-центр.",
        details: "Любой положительный симптом FAST/BE-FAST - достаточно для активации протокола. Цель - door-to-needle ≤ 60 мин (тромболизис ≤ 4,5 ч) и door-to-groin ≤ 90 мин (тромбэктомия ≤ 6-24 ч по визуализации).",
        actions: [
          "112 / скорая - «код инсульт»",
          "Транспорт в stroke-центр с КТ 24/7",
          "По пути: глюкоза, SpO₂, АД, ЭКГ, NIHSS",
          "Уведомление stroke-team заранее",
          "Избегать снижения АД < 220/120 до исключения ICH"
        ]
      }
    ],
    caveats: [
      "FAST упускает ~ 14 % инсультов (в основном задней циркуляции) - используйте BE-FAST",
      "Не заменяет NIHSS при поступлении в stroke-центр",
      "Stroke mimics (гипогликемия, эпилепсия, мигрень, конверсия) - проверьте глюкозу",
      "Время - ключевое: установите последний раз, когда пациент был «нормальным» (last known well)"
    ],
    related: [
      {
        id: "nihss",
        title: "NIHSS"
      },
      {
        id: "aspects",
        title: "ASPECTS"
      },
      {
        id: "abcd2",
        title: "ABCD²"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Harbison J et al. Diagnostic accuracy of stroke referrals from primary care, emergency room physicians, and ambulance staff using the FAST test. Stroke 2003;34:71-76. BE-FAST: Aroor S et al. Stroke 2017;48:479-481.",
    countries: "Международный (AHA/ASA, ESO)",
    info: "### Для чего используется\n**FAST / BE-FAST** - догоспитальный и фаст-трек скрининг подозрения на **острый инсульт**. Используется свидетелями, диспетчерами 112, фельдшерами скорой, врачами приёмного.\n\n### FAST (Harbison 2003)\n| Буква | Значение |\n|---|---|\n| **F** | Face - асимметрия (просьба улыбнуться) |\n| **A** | Arm - слабость руки (поднять обе руки на 10 с) |\n| **S** | Speech - нарушение речи (повторить фразу) |\n| **T** | Time - время появления симптомов |\n\n### BE-FAST (расширенный)\nДобавлены **B** (Balance) и **E** (Eyes) - ловит до 95 % инсультов, включая заднюю циркуляцию (мозжечок, ствол).\n\n### Альтернативные прехоспитальные шкалы\n| Шкала | Компоненты | Применение |\n|---|---|---|\n| **CPSS** (Cincinnati) | Face + Arm + Speech | Простейшая |\n| **LAPSS** (Los Angeles) | 4 анамнестических + 3 физ. | Более специфична |\n| **LAMS** (LA Motor) | Face + Arm + Grip (0-5) | Оценка тяжести |\n| **RACE** (Rapid Arterial oCclusion Eval) | 5 пунктов (0-9) | Скрининг LVO |\n| **VAN** (Vision Aphasia Neglect) | V + A + N + weakness | LVO-скрининг (чувствительность ~ 100 % для LVO) |\n\n### LVO-скрининг (для маршрутизации в тромбэктомический центр)\n| Шкала | Порог LVO | Чувствительность |\n|---|---|---|\n| LAMS | ≥ 4 | 81 % |\n| RACE | ≥ 5 | 85 % |\n| VAN | Положительный | 100 % |\n| NIHSS | ≥ 6 (частая отсечка) | 87 % |\n\n### Тактика («код инсульт»)\n1. **Установить last known well** (время, когда пациент был «нормальным»)\n2. **Проверить глюкозу** (< 3,3 ммоль/л = mimic)\n3. **Транспорт в stroke-центр** (primary или comprehensive)\n4. **Уведомить stroke team** заранее\n5. **В приёмном:** КТ/КТ-ангио ≤ 25 мин, NIHSS, решение о тромболизисе / тромбэктомии\n\n### Окна лечения\n| Терапия | Окно |\n|---|---|\n| Альтеплаза | 0-4,5 ч |\n| Тенектеплаза 0,25 мг/кг | 0-4,5 ч (EXTEND-IA TNK) |\n| Механическая тромбэктомия | 0-6 ч всем; 6-24 ч по DAWN/DEFUSE-3 (mismatch) |\n\n### Stroke mimics (10-20 %)\n- Гипогликемия\n- Судорожный приступ (Todd's palsy)\n- Мигрень с аурой\n- Конверсия / функциональное расстройство\n- Гипонатриемия, интоксикация\n- Сепсис с энцефалопатией\n\n### Ограничения\n- FAST классический упускает задние инсульты, изолированные зрительные нарушения, изолированную атаксию\n- Не применять у детей\n- Не оценивает тяжесть (→ NIHSS в приёмном)\n\n### Источник\nHarbison J, Hossain O, Jenkinson D, Davis J, Louw SJ, Ford GA. **Diagnostic accuracy of stroke referrals from primary care, emergency room physicians, and ambulance staff using the FAST test.** *Stroke* 2003;34:71-76. Aroor S, Singh R, Goldstein LB. **BE-FAST (Balance, Eyes, Face, Arm, Speech, Time): Reducing the proportion of strokes missed using the FAST mnemonic.** *Stroke* 2017;48:479-481."
  };

export default runner;
