// @ts-nocheck
/**
 * Runner: rutherford
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
    inputs: [
      {
        id: "category",
        label: "Клинический статус",
        type: "select",
        options: [
          {
            value: 0,
            label: "Rutherford 0 / Fontaine I - асимптомно",
            points: 0
          },
          {
            value: 1,
            label: "Rutherford 1 / Fontaine IIa - лёгкая клаудикация (> 200 м)",
            points: 1
          },
          {
            value: 2,
            label: "Rutherford 2 / Fontaine IIb - умеренная клаудикация",
            points: 2
          },
          {
            value: 3,
            label: "Rutherford 3 / Fontaine IIb - тяжёлая клаудикация (< 200 м)",
            points: 3
          },
          {
            value: 4,
            label: "Rutherford 4 / Fontaine III - ишемическая боль в покое",
            points: 4
          },
          {
            value: 5,
            label: "Rutherford 5 / Fontaine IV - малая потеря тканей (язва)",
            points: 5
          },
          {
            value: 6,
            label: "Rutherford 6 / Fontaine IV - большая потеря тканей (гангрена)",
            points: 6
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "R0 / F I",
        color: "#22C55E",
        description: "Асимптомное ПАД. Выявлено скрининговым ABI.",
        details: "Нет клинических симптомов, но есть снижение ABI. Системный риск ССС повышен - агрессивная модификация ФР.",
        actions: [
          "Статин high-intensity (LDL < 1.4 ммоль/л)",
          "АСК 75-100 мг или клопидогрел 75 мг",
          "Контроль АД < 130/80, HbA1c < 7 %",
          "Отказ от курения (bupropion, варениклин)"
        ]
      },
      {
        min: 1,
        max: 3,
        label: "R1-3 / F IIa-b",
        color: "#F59E0B",
        description: "Перемежающаяся хромота. Модификация ФР + физическая реабилитация.",
        details: "Контролируемая программа ходьбы 30-45 мин × 3/нед (Gardner protocol) - увеличивает MWD на 50-200 %. Цилостазол 100 мг × 2 при отсутствии ХСН.",
        actions: [
          "Контролируемая программа ходьбы (Gardner protocol)",
          "Цилостазол 100 мг × 2 (если нет ХСН)",
          "АСК / клопидогрел + статин + ИАПФ/БРА",
          "Ривароксабан 2.5 мг × 2 + АСК (COMPASS) при высоком риске",
          "Реваскуляризация при инвалидизирующей хромоте и неэффективности ОМТ"
        ]
      },
      {
        min: 4,
        max: 6,
        label: "R4-6 / F III-IV",
        color: "#EF4444",
        description: "Хроническая критическая ишемия конечности (CLTI). Требуется срочная реваскуляризация.",
        details: "Критическая ишемия: боль в покое > 2 нед, язва, гангрена. Риск ампутации 25 % / смерти 25 % в течение 1 года. Немедленное направление в сосудистый центр.",
        actions: [
          "Срочная реваскуляризация (эндоваскулярная или открытая) - BASIL-2, BEST-CLI",
          "Оценка WIfI (Wound, Ischemia, foot Infection)",
          "Обезболивание (опиоиды при ишемической боли)",
          "АБ при инфекции стопы; хирургическая санация",
          "Контроль гликемии, нутриционная поддержка",
          "Сосудистый консилиум"
        ]
      }
    ],
    maxScore: 6,
    reference: "Rutherford RB, Baker JD, Ernst C, Johnston KW, Porter JM, Ahn S, Jones DN. Recommended standards for reports dealing with lower extremity ischemia: revised version. J Vasc Surg 1997;26:517-538. Fontaine R et al. Die chirurgische Behandlung der peripheren Durchblutungsstörungen. Helv Chir Acta 1954;5/6:199-533.",
    countries: "Международный (SVS · ESVS · ACC/AHA)",
    caveats: [
      "Rutherford и Fontaine - параллельные классификации; Rutherford детализирует стадии Fontaine IV (минорная vs мажорная потеря тканей).",
      "CLTI (Rutherford 4-6) заменяет устаревший термин \"критическая ишемия конечности\" (CLI).",
      "WIfI (SVS 2014) - современная шкала для CLTI: Wound (0-3) + Ischemia (0-3) + foot Infection (0-3), оценивает риск ампутации и пользу реваскуляризации.",
      "ABI < 0.9 - диагностический критерий ПАД; при кальцинозе (ABI > 1.4) используйте TBI."
    ],
    related: [
      {
        id: "abi",
        title: "ABI"
      },
      {
        id: "stanford",
        title: "Stanford / DeBakey"
      },
      {
        id: "crawford",
        title: "Crawford (ТААА)"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    info: "### Для чего используется\n**Rutherford (0-6) и Fontaine (I-IV)** - клинические классификации **хронической ишемии нижних конечностей** при периферическом артериальном заболевании (ПАД).\n\n### Соответствие классификаций\n| Rutherford | Fontaine | Описание |\n|---|---|---|\n| 0 | I | Асимптомно |\n| 1 | IIa | Лёгкая клаудикация (> 200 м) |\n| 2 | IIb | Умеренная клаудикация |\n| 3 | IIb | Тяжёлая клаудикация (< 200 м) |\n| 4 | III | Боль в покое |\n| 5 | IV | Минорная потеря тканей (язва) |\n| 6 | IV | Мажорная потеря тканей (гангрена) |\n\n### CLTI (Chronic Limb-Threatening Ischaemia)\nRutherford 4-6 = CLTI. Риск большой ампутации 25 % / смерти 25 % в течение 1 года без лечения.\n\n### Тактика\n| Категория | Тактика |\n|---|---|\n| R0 | Модификация ФР, АСК, статин |\n| R1-3 | Программа ходьбы + цилостазол + ОМТ; реваскуляризация при инвалидизации |\n| R4-6 (CLTI) | **Срочная реваскуляризация** (BASIL-2, BEST-CLI), WIfI, АБ при инфекции |\n\n### Ключевые шкалы\n- **WIfI (SVS 2014)** - Wound + Ischemia + Infection для CLTI.\n- **TASC II** - анатомическая классификация поражений для выбора эндоваскулярного vs открытого лечения.\n- **GLASS (Global Limb Anatomic Staging System)** - анатомия для CLTI.\n\n### Ограничения\n- Классификации описывают клинику, не анатомию (→ TASC II / GLASS).\n- Диабетическая нейропатия может маскировать клаудикацию.\n- Кальциноз артерий (DM, ХБП) - ABI недостоверен, используйте TBI."
  };

export default runner;
