// @ts-nocheck
/**
 * Runner: start
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
    maxScore: 4,
    inputs: [
      {
        id: "ambulatory",
        label: "Может ли пациент идти?",
        type: "select",
        options: [
          {
            value: "3",
            label: "Да — walking wounded (Minor / зелёный)",
            points: 3
          },
          {
            value: "0",
            label: "Нет / не оценено",
            points: 0
          }
        ]
      },
      {
        id: "breathing",
        label: "Дыхание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма (10–30/мин у взрослого)",
            points: 0
          },
          {
            value: "1",
            label: "ЧДД >30 или <10 — Immediate",
            points: 1
          },
          {
            value: "4",
            label: "Нет даже после открытия ДП — Deceased / Expectant",
            points: 4
          }
        ]
      },
      {
        id: "perfusion",
        label: "Перфузия (радиальный пульс / КСН)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Радиальный пульс есть, CRT <2 с",
            points: 0
          },
          {
            value: "1",
            label: "Радиального нет / CRT >2 с — Immediate",
            points: 1
          }
        ]
      },
      {
        id: "mental",
        label: "Сознание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Выполняет простые команды",
            points: 0
          },
          {
            value: "1",
            label: "Не выполняет команды — Immediate",
            points: 1
          }
        ]
      },
      {
        id: "minor_override",
        label: "Тяжёлая рана/ожог у walking wounded?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет — остаётся Minor",
            points: 0
          },
          {
            value: "-1",
            label: "Да — пересортировать в Delayed",
            points: -1
          }
        ]
      }
    ],
    bands: [
      {
        min: 4,
        max: 4,
        label: "Чёрный — Deceased / Expectant",
        color: "#000000",
        description: "Апноэ после открытия ДП; ресурсы не тратятся в условиях MCI.",
        details: "В условиях массового поражения (MCI) ресурсы направляются к пациентам с наибольшей вероятностью выживания. Expectant — травмы, несовместимые с жизнью в данных условиях.",
        actions: [
          "Переместить в отведённую зону",
          "При изменении ситуации (стабилизация обстановки) — возможна переоценка",
          "Документация времени и причины"
        ]
      },
      {
        min: 1,
        max: 3,
        label: "Красный — Immediate",
        color: "#DC2626",
        description: "Требует немедленной помощи для сохранения жизни.",
        details: "ЧДД >30 или <10, нет радиального пульса, CRT >2 с или не выполняет команды — все это Immediate. Эвакуация приоритетная.",
        actions: [
          "Быстрые жизнеспасающие манипуляции: открыть ДП, остановить кровотечение жгутом",
          "Первая эвакуация",
          "Повторная оценка при первой возможности"
        ]
      },
      {
        min: 0,
        max: 0,
        label: "Жёлтый — Delayed",
        color: "#FACC15",
        description: "Стабилен, но требует лечения. Эвакуация после Immediate."
      },
      {
        min: 2,
        max: 2,
        label: "Зелёный — Minor (walking wounded)",
        color: "#22C55E",
        description: "Способен идти самостоятельно. Лёгкие травмы.",
        actions: [
          "Переместить в «зелёную» зону сбора",
          "Периодическая переоценка",
          "Лечение после Immediate/Delayed"
        ]
      }
    ],
    caveats: [
      "START применяется ТОЛЬКО в MCI и массовых поражениях, не в обычной ER",
      "JumpSTART — педиатрический вариант (< 8 лет): 5 искусственных вдохов перед признанием «чёрным», ЧДД порог 15–45",
      "SALT — альтернативная модель (Sort/Assess/Lifesaving/Treatment/Transport), стандарт NDLS США",
      "Категория Expectant/Deceased — только в условиях непоколебимого недостатка ресурсов"
    ],
    related: [
      {
        id: "esi",
        title: "ESI (обычная ER)"
      },
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "mts",
        title: "MTS"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Super G, Groth S, Hook R. START: Simple Triage and Rapid Treatment. Newport Beach Fire Dept / Hoag Hospital, 1983. SALT Triage: Lerner EB et al. Disaster Med Public Health Prep 2008.",
    countries: "Международный",
    presets: [
      {
        label: "Walking wounded",
        values: {
          ambulatory: "3",
          breathing: "0",
          perfusion: "0",
          mental: "0",
          minor_override: "0"
        }
      },
      {
        label: "ЧДД 35, нет пульса",
        values: {
          ambulatory: "0",
          breathing: "1",
          perfusion: "1",
          mental: "0",
          minor_override: "0"
        }
      },
      {
        label: "Апноэ после открытия ДП",
        values: {
          ambulatory: "0",
          breathing: "4",
          perfusion: "0",
          mental: "0",
          minor_override: "0"
        }
      }
    ],
    info: "### Для чего используется\n**START (Simple Triage And Rapid Treatment)** — система сортировки при **MCI** (massive casualty incident). Цель — за ≤ 60 секунд на пострадавшего распределить ресурсы по принципу «наибольшее благо наибольшему числу».\n\n### Алгоритм RPM (30-2-Can Do)\n1. **Walk?** — «идите сюда» → зелёный (Minor)\n2. **Respirations**\n   - Нет → открыть ДП\n     - Нет дыхания → **Чёрный / Expectant**\n     - Появилось → **Красный / Immediate**\n   - >30 или <10 → **Красный**\n3. **Perfusion** — радиальный пульс / CRT >2 с → **Красный**\n4. **Mental status** — не выполняет команды → **Красный**\n5. Иначе — **Жёлтый / Delayed**\n\n### Категории и цвета\n| Цвет | Категория | Приоритет |\n|---|---|---|\n| Красный | Immediate | 1 |\n| Жёлтый | Delayed | 2 |\n| Зелёный | Minor (walking wounded) | 3 |\n| Чёрный | Deceased / Expectant | Не эвакуируется первым |\n\n### JumpSTART (дети <8 лет или <45 кг)\n- При апноэ — 5 искусственных вдохов; если начинает дышать → **Красный**, иначе **Чёрный**\n- ЧДД: <15 или >45 → **Красный**\n- Перфузия: только пальпируемый пульс\n- Ментальный: AVPU — P (реагирует на боль неадекватно) или U → **Красный**\n\n### SALT Triage (альтернатива, US NDLS)\n1. **Sort** глобально: идти → минор; махнуть/выполнять команды → delayed; не двигаются → immediate assess\n2. **Assess** индивидуально\n3. **Lifesaving interventions**: открыть ДП, остановить кровотечение, декомпрессия тензионного пневмоторакса, автоинжектор\n4. **Treatment / Transport**\n\n### Ограничения\n- Жизнеспасающие интервенции минимальны (не начинать CPR при MCI!)\n- Субъективность «walking wounded» при травмах ног\n- Требует частых переоценок\n\n### Тактика\n- **Красный**: первая эвакуация в ближайший trauma center\n- **Жёлтый**: вторая волна эвакуации\n- **Зелёный**: самостоятельно в сборный пункт\n- **Чёрный**: зона морга; переоценка только при изменении ресурсов\n\n### Источник\nSuper G et al. *START: Simple Triage and Rapid Treatment.* Newport Beach Fire Dept, 1983. Lerner EB et al. *Disaster Med Public Health Prep* 2008; 2:S25–S34 (SALT)."
  };

export default runner;
