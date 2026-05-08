// @ts-nocheck
/**
 * Runner: chads-vasc — CHA₂DS₂-VASc Score for AF Stroke Risk
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ.
 *               Refining clinical risk stratification for predicting stroke
 *               and thromboembolism in atrial fibrillation using a novel
 *               risk factor-based approach: the euro heart survey on
 *               atrial fibrillation. Chest. 2010;137(2):263-272.
 *               doi:10.1378/chest.09-1584
 *   GUIDELINE:  ESC 2024 AF Guidelines — recommend CHA₂DS₂-VASc для всех
 *               пациентов с non-valvular AF; OAC при ≥2 у мужчин / ≥3 у женщин.
 *               https://academic.oup.com/eurheartj/article/45/36/3314/7720094
 *   GUIDELINE:  AHA/ACC/HRS 2023 AF Guideline.
 *               doi:10.1161/CIR.0000000000001193
 *
 * Items + points (1 балл если не указано):
 *   1 — Congestive HF (LVEF≤40% OR HFrEF / HFpEF symptoms)
 *   1 — Hypertension (BP ≥140/90 OR на терапии)
 *   2 — Age ≥75 years
 *   1 — Diabetes mellitus
 *   2 — Stroke / TIA / thromboembolism in past
 *   1 — Vascular disease (prior MI, peripheral artery, aortic plaque)
 *   1 — Age 65-74 years
 *   1 — Sex category (female)
 *
 * Annual stroke risk (validated cohort):
 *   0  → 0.2%
 *   1  → 0.6%
 *   2  → 2.2%
 *   3  → 3.2%
 *   4  → 4.8%
 *   ≥5 → ≥7%
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
    maxScore: 9,
    inputs: [
      {
        id: "chf",
        label: "ХСН / систолическая дисфункция ЛЖ",
        type: "checkbox",
        points: 1
      },
      {
        id: "htn",
        label: "Артериальная гипертензия",
        type: "checkbox",
        points: 1
      },
      {
        id: "age75",
        label: "Возраст ≥75 лет",
        type: "checkbox",
        points: 2
      },
      {
        id: "dm",
        label: "Сахарный диабет",
        type: "checkbox",
        points: 1
      },
      {
        id: "stroke",
        label: "Инсульт / ТИА / ТЭ в анамнезе",
        type: "checkbox",
        points: 2
      },
      {
        id: "vasc",
        label: "Сосудистое заболевание (ИМ, PAD, аорта)",
        type: "checkbox",
        points: 1
      },
      {
        id: "age65",
        label: "Возраст 65-74",
        type: "checkbox",
        points: 1
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 баллов",
        color: "#22C55E",
        description: "Низкий риск. Годовой риск инсульта ~0.2%. Антикоагуляция не показана."
      },
      {
        min: 1,
        max: 1,
        label: "1 балл",
        color: "#F59E0B",
        description: "Промежуточный. ~0.6% в год. Рассмотреть антикоагуляцию (у М).",
        details: "У мужчин CHA₂DS₂-VASc = 1 - пограничная зона: ESC рекомендует рассмотреть антикоагуляцию с учётом предпочтений пациента. У женщин 1 балл за женский пол сам по себе не требует терапии.",
        actions: [
          "Обсудить баланс риск/польза с пациентом",
          "Рассмотреть ABC-AF-stroke, эхоКГ-параметры ЛП",
          "Модифицировать ФР (АГ, СД, курение)"
        ]
      },
      {
        min: 2,
        max: 9,
        label: "≥2 баллов",
        color: "#EF4444",
        description: "Высокий риск. ≥2.2% в год. Антикоагуляция показана (DOAC предпочтительно).",
        details: "Годовой риск ишемического инсульта ≥ 2,2 %, растёт до 12 % при 9 баллах. DOAC предпочтительнее варфарина (I класс, ESC 2020). Высокий HAS-BLED не отменяет антикоагуляцию - он указывает на модифицируемые ФР кровотечения.",
        actions: [
          "Начать DOAC: апиксабан 5 мг × 2 (с коррекцией при возрасте ≥80, весе ≤60, Cr ≥133)",
          "При клапанной ФП (мех. клапан, умеренный-тяжёлый митр. стеноз) - варфарин INR 2-3",
          "Оценить HAS-BLED и модифицировать ФР кровотечения",
          "При невозможности АК - окклюзия ушка ЛП (WATCHMAN)"
        ]
      }
    ],
    caveats: [
      "Не применим при клапанной ФП (механические клапаны, умеренный-тяжёлый митр. стеноз) - антикоагуляция обязательна",
      "Не учитывает бремя ФП (пароксизмальная vs персистирующая)",
      "Женский пол - модификатор, а не независимый ФР: у женщины с 0 \"не-половых\" баллов АК не нужна",
      "При ГКМП с ФП антикоагуляция показана независимо от балла"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "has-bled",
        title: "HAS-BLED (риск кровотечения)"
      },
      {
        id: "wells-dvt",
        title: "Wells (ТГВ)"
      },
      {
        id: "timi",
        title: "TIMI (ОКС)"
      }
    ],
    reference: "ESC/AHA: ≥2 М или ≥3 Ж - показание к антикоагуляции. Не учитывает Ж без других факторов.",
    countries: "Международный (ESC, AHA, РКО)",
    info: "### Для чего используется\n**CHA₂DS₂-VASc** - оценка годового риска **тромбоэмболического инсульта** при неклапанной **фибрилляции предсердий (ФП)**. Используется для принятия решения об антикоагулянтной терапии.\n\n### Расшифровка аббревиатуры\n| Буква | Фактор | Баллы |\n|---|---|---|\n| **C** | Congestive heart failure (ХСН / сист. дисфункция) | 1 |\n| **H** | Hypertension (АГ) | 1 |\n| **A₂** | Age ≥ 75 лет | 2 |\n| **D** | Diabetes mellitus | 1 |\n| **S₂** | Stroke / TIA / TE в анамнезе | 2 |\n| **V** | Vascular disease (ИБС, PAD, аорта) | 1 |\n| **A** | Age 65-74 | 1 |\n| **Sc** | Sex category (женский пол) | 1 |\n\nМаксимум - 9 баллов.\n\n### Годовой риск инсульта\n| Баллы | Риск/год |\n|---|---|\n| 0 | 0,2 % |\n| 1 | 0,6 % |\n| 2 | 2,2 % |\n| 3 | 3,2 % |\n| 4 | 4,8 % |\n| 5 | 7,2 % |\n| 6 | 9,7 % |\n| 7 | 11,2 % |\n| 8 | 10,8 % |\n| 9 | 12,2 % |\n\n### Показания к антикоагуляции (ESC 2020, AHA 2023)\n| Пол | Критерий антикоагуляции |\n|---|---|\n| Мужчины | CHA₂DS₂-VASc ≥ **2** |\n| Женщины | CHA₂DS₂-VASc ≥ **3** (без женского балла: ≥ 2) |\n\nЖенский пол - модификатор, а не независимый ФР. У женщины с 0 \"не-половых\" баллов антикоагуляция не показана.\n\n### Выбор антикоагулянта\n**DOACs предпочтительнее варфарина** (ESC 2020 I класс):\n| Препарат | Доза |\n|---|---|\n| Апиксабан | 5 мг × 2 р/сут (2,5 мг × 2 при ≥2: возраст ≥80, вес ≤60, Cr ≥133) |\n| Ривароксабан | 20 мг/сут (15 мг при CrCl 15-49) |\n| Дабигатран | 150 мг × 2 (110 × 2 при ≥75 лет / CrCl 30-50) |\n| Эдоксабан | 60 мг/сут (30 мг при CrCl 15-50 / вес ≤60) |\n\n### Когда нужен варфарин (цель INR 2,0-3,0)\n| Показание | Почему |\n|---|---|\n| Умеренно-тяжёлый митральный стеноз | Клапанная ФП, DOAC противопоказаны |\n| Механические клапаны | RE-ALIGN показал риск ← DOAC противопоказаны |\n| Антифосфолипидный синдром | Превосходство варфарина над DOAC (TRAPS) |\n| CrCl < 15 | DOAC не рекомендуются / требуют коррекции |\n\n### Парадокс \"большая ставка на кровотечение\"\nВысокий HAS-BLED (≥3) **не отменяет** антикоагуляцию - он сигнализирует о необходимости **модификации ФР кровотечения** (лечение АГ, отказ от алкоголя, коррекция НПВС).\n\n### Дополнительная стратификация\nПри пограничных случаях (CHA₂DS₂-VASc = 1 у мужчин) используют:\n\n| Метод | Что добавляет |\n|---|---|\n| ABC-AF-stroke | Биомаркеры: тропонин, NT-proBNP, GDF-15 |\n| ЭхоКГ | Структурная оценка предсердий - объём ЛП, 4D flow |\n\n### Ограничения\n| Ограничение | Детали |\n|---|---|\n| Клапанная ФП | Не применим - антикоагуляция обязательна (ревм. митр. стеноз, мех. клапаны) |\n| Гипертрофическая кардиомиопатия | Независимое показание к антикоагуляции, возможна недооценка |\n| Бремя ФП | Не учитывает пароксизмальная vs персистирующая |"
  };

export default runner;
