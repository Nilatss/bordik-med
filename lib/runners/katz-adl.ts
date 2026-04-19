// @ts-nocheck
/**
 * Runner: katz-adl
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
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
        id: "bathing",
        label: "Купание — независим (без помощи или помощь только с одной частью тела)",
        type: "checkbox",
        points: 1
      },
      {
        id: "dressing",
        label: "Одевание — достаёт одежду и одевается без помощи (кроме завязывания шнурков)",
        type: "checkbox",
        points: 1
      },
      {
        id: "toileting",
        label: "Туалет — ходит в туалет, снимает и надевает одежду без помощи",
        type: "checkbox",
        points: 1
      },
      {
        id: "transfer",
        label: "Перемещения — входит и выходит из кровати и кресла без помощи",
        type: "checkbox",
        points: 1
      },
      {
        id: "continence",
        label: "Контроль — полный самостоятельный контроль мочеиспускания и дефекации",
        type: "checkbox",
        points: 1
      },
      {
        id: "feeding",
        label: "Питание — ест без посторонней помощи",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 6,
        max: 6,
        label: "6 — полная функция",
        color: "#22C55E",
        description: "Полная независимость во всех 6 ADL.",
        actions: [
          "Продолжать профилактику падений, активный образ жизни, IADL-оценку (Lawton)"
        ]
      },
      {
        min: 3,
        max: 5,
        label: "3–5 — умеренная зависимость",
        color: "#F59E0B",
        description: "Нарушение в некоторых ADL.",
        details: "Katz иерархически: обычно первыми страдают купание и одевание, в последнюю очередь — питание.",
        actions: [
          "Мультидисциплинарная оценка (гериатр, ОТ, соц. работник)",
          "Реабилитация, обучение компенсаторным стратегиям",
          "Оценка дома на безопасность (поручни, душевая скамья)"
        ]
      },
      {
        min: 0,
        max: 2,
        label: "0–2 — тяжёлая зависимость",
        color: "#EF4444",
        description: "Выраженное функциональное нарушение.",
        details: "Высокий риск госпитализации, институционализации, смерти в течение года.",
        actions: [
          "Организация постоянного ухода (PSU, дом престарелых)",
          "Скрининг делирия (4AT/CAM), деменции (MMSE/MoCA)",
          "Профилактика пролежней (Braden), ВТЭ, аспирации",
          "Обсуждение целей помощи и advance care planning"
        ]
      }
    ],
    caveats: [
      "Оценка \"независимости\" дихотомична — не улавливает частичные нарушения (Barthel более чувствителен)",
      "Оценивает только базовую ADL, не IADL (Lawton) и не когницию (MMSE)",
      "Учитывайте реальное выполнение, а не заявленное пациентом",
      "Сенсорные нарушения (слепота, глухота) могут искажать оценку"
    ],
    related: [
      {
        id: "barthel",
        title: "Barthel ADL Index"
      },
      {
        id: "cfs",
        title: "Clinical Frailty Scale"
      },
      {
        id: "edmonton-frail",
        title: "Edmonton Frail Scale"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Katz S, Downs TD, Cash HR, Grotz RC. Progress in development of the index of ADL. Gerontologist 1970; 10:20–30.",
    countries: "Международный",
    presets: [
      {
        label: "Полная функция",
        values: {
          bathing: true,
          dressing: true,
          toileting: true,
          transfer: true,
          continence: true,
          feeding: true
        }
      },
      {
        label: "Умеренная (3/6)",
        values: {
          bathing: false,
          dressing: false,
          toileting: true,
          transfer: true,
          continence: false,
          feeding: true
        }
      },
      {
        label: "Тяжёлая зависимость",
        values: {
          bathing: false,
          dressing: false,
          toileting: false,
          transfer: false,
          continence: false,
          feeding: true
        }
      }
    ],
    info: "### Для чего используется\n**Katz Index of Independence in Activities of Daily Living (ADL)** — 6-пунктовый инструмент оценки базовой повседневной активности у пожилых и пациентов с хроническими заболеваниями. Простая дихотомическая шкала (0 / 1 балл за каждый пункт, сумма 0–6).\n\n### 6 пунктов (иерархия утраты)\n1. **Купание** (обычно утрачивается первым)\n2. **Одевание**\n3. **Пользование туалетом**\n4. **Перемещения**\n5. **Контроль** выделительных функций\n6. **Питание** (обычно утрачивается последним)\n\n### Интерпретация\n| Сумма | Значение |\n|---|---|\n| 6 | Полная функция |\n| 4 | Умеренное нарушение |\n| ≤ 2 | Тяжёлая функциональная зависимость |\n\n### Lawton IADL (дополнение)\n**Lawton-Brody Instrumental ADL** — 8 пунктов (0–8), более чувствителен для лёгких когнитивных нарушений:\n1. Пользование телефоном\n2. Покупки\n3. Приготовление пищи\n4. Уборка\n5. Стирка\n6. Транспорт\n7. Приём лекарств\n8. Финансы\n\nIADL обычно нарушаются **раньше** базовых ADL; их ухудшение — ранний маркер деменции (MCI → деменция).\n\n### Katz vs Barthel\n| | Katz | Barthel |\n|---|---|---|\n| Пунктов | 6 | 10 |\n| Шкала | 0–6 | 0–100 |\n| Чувствительность | Ниже | Выше |\n| Применение | Скрининг | Реабилитация |\n\n### Ограничения\n- Дихотомическая оценка — не улавливает частичные нарушения\n- Игнорирует когницию, поведение, настроение\n- Оценивайте **фактическое** выполнение, не заявленное\n\n### Тактика\n- **6/6** — профилактика падений, IADL-оценка\n- **3–5/6** — реабилитация, оценка дома, дневной центр\n- **≤ 2/6** — постоянный уход, паллиатив\n\n### Источник\nKatz S et al. *Gerontologist* 1970; 10:20–30. Lawton MP, Brody EM. *Gerontologist* 1969; 9:179–186."
  };

export default runner;
