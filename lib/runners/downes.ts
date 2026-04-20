// @ts-nocheck
/**
 * Runner: downes
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
        id: "rr",
        label: "Частота дыхания",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 60/мин",
            points: 0
          },
          {
            value: "1",
            label: "60-80/мин",
            points: 1
          },
          {
            value: "2",
            label: "> 80/мин или апноэ",
            points: 2
          }
        ]
      },
      {
        id: "cyanosis",
        label: "Цианоз",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "На воздухе",
            points: 1
          },
          {
            value: "2",
            label: "В 40 % O₂",
            points: 2
          }
        ]
      },
      {
        id: "retractions",
        label: "Втяжения грудной клетки",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкие",
            points: 1
          },
          {
            value: "2",
            label: "Выраженные",
            points: 2
          }
        ]
      },
      {
        id: "grunting",
        label: "Экспираторный стон (grunting)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Слышен стетоскопом",
            points: 1
          },
          {
            value: "2",
            label: "Слышен без стетоскопа",
            points: 2
          }
        ]
      },
      {
        id: "air",
        label: "Проведение дыхания",
        type: "select",
        options: [
          {
            value: "0",
            label: "Хорошее",
            points: 0
          },
          {
            value: "1",
            label: "Ослаблено",
            points: 1
          },
          {
            value: "2",
            label: "Едва проводится",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "0-3 (лёгкий РДС)",
        color: "#22C55E",
        description: "Лёгкая дыхательная недостаточность. Наблюдение + поддержка.",
        details: "Лёгкий респираторный дистресс. Обычно достаточно кислорода низкопоточного или CPAP низкого давления.",
        actions: [
          "SpO₂, ЧСС, ЧД - мониторинг каждый час",
          "Тёплый увлажнённый O₂ через воронку / низкопоточную канюлю",
          "КЩС при усугублении"
        ]
      },
      {
        min: 4,
        max: 7,
        label: "4-7 (умеренный РДС)",
        color: "#F59E0B",
        description: "Умеренный РДС. Показан CPAP / HFNC.",
        details: "Умеренная дыхательная недостаточность. Требуется неинвазивная вентиляционная поддержка.",
        actions: [
          "nCPAP 5-8 см H₂O (PEEP)",
          "Рентген ОГК - исключить аспирацию, пневмоторакс, CDH",
          "КЩС артериальная / капиллярная",
          "Рассмотреть сурфактант (INSURE) при подтверждённом РДС недоношенного"
        ]
      },
      {
        min: 8,
        max: 10,
        label: "8-10 (тяжёлый РДС)",
        color: "#EF4444",
        description: "Тяжёлый РДС, импендинг-респираторная недостаточность. Интубация.",
        details: "Тяжёлый дыхательный дистресс, близкий к респираторной декомпенсации. Показана механическая вентиляция и сурфактант.",
        actions: [
          "Интубация + ИВЛ (целевые PaO₂ 50-80, PaCO₂ 45-55)",
          "Сурфактант экзогенный (порактант альфа 200 мг/кг первая доза)",
          "Венозный доступ, инфузия, коррекция гипогликемии и ацидоза",
          "Экстренный перевод в неонатальный реанимационный центр III уровня"
        ]
      }
    ],
    caveats: [
      "Downes score разработан до эры сурфактанта и CPAP - интерпретировать с современными протоколами",
      "Не заменяет КЩС и рентген ОГК",
      "У доношенных РДС редок - искать TTN, аспирацию меконием, сепсис, CDH, врождённые пороки",
      "Альтернатива: Silverman-Anderson (более чувствителен к ранним признакам у недоношенных)"
    ],
    related: [
      {
        id: "silverman",
        title: "Silverman-Anderson"
      },
      {
        id: "apgar",
        title: "Apgar"
      },
      {
        id: "crib",
        title: "CRIB"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      }
    ],
    reference: "Downes JJ et al. Respiratory distress syndrome of newborn infants: New clinical scoring system. Clin Pediatr 1970;9:325-331.",
    countries: "Международный",
    info: "### Для чего используется\n**Downes Score (1970)** - клиническая шкала тяжести респираторного дистресса у новорождённого. Применяется в родзале и палате интенсивной терапии для оценки необходимости и объёма респираторной поддержки.\n\n### Критерии (5 × 0-2)\n| Признак | 0 | 1 | 2 |\n|---|---|---|---|\n| ЧД | < 60 | 60-80 | > 80 или апноэ |\n| Цианоз | нет | на воздухе | в 40 % O₂ |\n| Втяжения | нет | лёгкие | выраженные |\n| Grunting | нет | через стетоскоп | слышен без |\n| Проведение | хорошее | ослаблено | едва |\n\n### Интерпретация\n| Балл | РДС | Тактика |\n|---|---|---|\n| 0-3 | Лёгкий | O₂ низкопоточный, наблюдение |\n| 4-7 | Умеренный | nCPAP / HFNC, сурфактант обсудить |\n| 8-10 | Тяжёлый | Интубация + ИВЛ + сурфактант |\n\n### Ограничения\n- Старая шкала (до эры сурфактанта)\n- Не заменяет КЩС / RG\n- Не различает РДС от TTN / CDH / сепсиса\n\n### Тактика\n- **Лёгкий:** O₂ низким потоком, мониторинг\n- **Умеренный:** CPAP 5-8 см H₂O; сурфактант при подтверждённом РДС (INSURE/LISA)\n- **Тяжёлый:** интубация, сурфактант, ИВЛ, перевод в III уровень\n\n### Источник\nDownes JJ, Vidyasagar D, Boggs TR Jr, Morrow GM 3rd. *Clin Pediatr* 1970;9:325-331.\nSweet DG et al. European Consensus Guidelines on RDS - 2022 Update. *Neonatology* 2023;120:3-23."
  };

export default runner;
