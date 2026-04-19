// @ts-nocheck
/**
 * Runner: esi
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
    maxScore: 5,
    inputs: [
      {
        id: "level",
        label: "Решение по алгоритму ESI",
        type: "select",
        options: [
          {
            value: "1",
            label: "A. Требует немедленного жизнеспасающего вмешательства (интубация, дефибрилляция, вазопрессоры, CPR, апноэ, шок, SpO₂<90)",
            points: 1
          },
          {
            value: "2",
            label: "B. Высокий риск / дезориентация / тяжёлая боль (>7/10) или витальные вне диапазона",
            points: 2
          },
          {
            value: "3",
            label: "C. Стабилен, ожидается ≥2 ресурсов (лабы + рентген + в/в инфузия и т.п.)",
            points: 3
          },
          {
            value: "4",
            label: "D. Стабилен, требуется 1 ресурс (1 рентген ИЛИ 1 лаборатория ИЛИ 1 процедура)",
            points: 4
          },
          {
            value: "5",
            label: "E. Стабилен, 0 ресурсов (осмотр, рецепт, перевязка)",
            points: 5
          }
        ]
      },
      {
        id: "danger_vitals",
        label: "Danger zone vitals (справочно, для уровня 2 vs 3 у стабильных)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Витальные в норме",
            points: 0
          },
          {
            value: "1",
            label: ">3 мес: ЧСС>100, ЧДД>20, SpO₂<92% — уточнить уровень",
            points: 0
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "Уровень 1 — Resuscitation",
        color: "#DC2626",
        description: "Немедленное жизнеспасающее вмешательство. Смертность без помощи — часы.",
        details: "Пациент требует немедленного мультидисциплинарного вмешательства. Примеры: остановка сердца, апноэ, тяжёлая гипоксия, шок, активные судороги, GCS <9, неконтролируемое кровотечение.",
        actions: [
          "Reanimation bay немедленно, врач + медсестра у койки",
          "ABCDE, монитор, венозный доступ × 2, О₂",
          "Вызов реаниматолога / травма-тима",
          "Без ожидания — параллельная диагностика и терапия"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "Уровень 2 — Emergent",
        color: "#EA580C",
        description: "Высокий риск, нельзя ждать. Осмотр в течение минут.",
        details: "Пациенты с высоким риском ухудшения, выраженной болью/дистрессом, с аномалиями витальных или изменённым сознанием, которых нельзя оставлять в очереди.",
        actions: [
          "В коечную зону в течение 10 минут",
          "Быстрый осмотр врача, ЭКГ при боли в груди",
          "Начало диагностики параллельно с триажем"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "Уровень 3 — Urgent",
        color: "#FACC15",
        description: "Стабилен, ожидается ≥2 ресурсов. Целевое ожидание ≤30 мин."
      },
      {
        min: 4,
        max: 4,
        label: "Уровень 4 — Less urgent",
        color: "#22C55E",
        description: "Стабилен, 1 ресурс. Fast-track."
      },
      {
        min: 5,
        max: 5,
        label: "Уровень 5 — Non-urgent",
        color: "#3B82F6",
        description: "Стабилен, 0 ресурсов. Амбулаторный визит."
      }
    ],
    caveats: [
      "ESI — алгоритм решения, а не сумма баллов; «ресурсы» подсчитываются по AHRQ 2020",
      "Danger zone vitals (дети, пожилые) могут повышать уровень с 3 до 2",
      "Не использовать у MCI — применять START/SALT",
      "Боль ≥7/10 сама по себе не определяет уровень 2 без клинического суждения"
    ],
    related: [
      {
        id: "mts",
        title: "Manchester Triage"
      },
      {
        id: "ctas",
        title: "CTAS"
      },
      {
        id: "start",
        title: "START (MCI)"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Gilboy N, Tanabe P, Travers D, Rosenau AM. ESI Implementation Handbook v.5. AHRQ 2020.",
    countries: "США",
    presets: [
      {
        label: "Остановка сердца",
        values: {
          level: "1",
          danger_vitals: "0"
        }
      },
      {
        label: "Боль в груди, стабилен",
        values: {
          level: "2",
          danger_vitals: "1"
        }
      },
      {
        label: "Растяжение голеностопа",
        values: {
          level: "4",
          danger_vitals: "0"
        }
      }
    ],
    info: "### Для чего используется\n**ESI (Emergency Severity Index) v.5** — пятиуровневая система медицинской сортировки в приёмных отделениях США. Комбинирует остроту состояния и ожидаемое потребление ресурсов.\n\n### Алгоритм (4 decision points)\n1. **A.** Требует ли пациент немедленного жизнеспасающего вмешательства? → **Уровень 1**\n2. **B.** Нельзя ли ему ждать (высокий риск / изменение сознания / тяжёлая боль)? → **Уровень 2**\n3. **C.** Сколько ресурсов потребуется?\n   - ≥ 2 → **Уровень 3** (далее сверка с danger zone vitals)\n   - 1 → **Уровень 4**\n   - 0 → **Уровень 5**\n4. **D.** Danger zone vitals у уровня 3 → поднять до уровня 2.\n\n### Что считается ресурсом\n| Считается | Не считается |\n|---|---|\n| Лаборатория (ОАК, биохимия) | Анамнез/физикальный осмотр |\n| Рентген/КТ/УЗИ/МРТ | PO меды, рецепт |\n| В/в инфузия, в/в/в/м лекарства | Перевязка, местная обработка |\n| Консультация специалиста | Прививка от столбняка |\n| Простая процедура (шов, катетер) | — |\n\n### Danger zone vitals (AHRQ)\n| Возраст | ЧСС | ЧДД | SpO₂ |\n|---|---|---|---|\n| <3 мес | >180 | >50 | <92 |\n| 3 мес–3 года | >160 | >40 | <92 |\n| 3–8 лет | >140 | >30 | <92 |\n| >8 лет | >100 | >20 | <92 |\n\n### Интерпретация и целевые ожидания\n| Уровень | Цвет | Целевое время |\n|---|---|---|\n| 1 Resuscitation | Красный | 0 мин |\n| 2 Emergent | Оранжевый | ≤ 10 мин |\n| 3 Urgent | Жёлтый | ≤ 30 мин |\n| 4 Less urgent | Зелёный | ≤ 60 мин |\n| 5 Non-urgent | Синий | ≤ 120 мин |\n\n### Ограничения\n- Субъективная оценка «high-risk» — требует опыта\n- Недооценка боли и психиатрии\n- Не подходит для MCI — переключаться на START/SALT\n\n### Тактика\n- **1–2**: реанимационный зал, врач у койки\n- **3**: основная зона, быстрая диагностика\n- **4–5**: fast-track / амбулаторно\n\n### Источник\nGilboy N, Tanabe P, Travers D, Rosenau AM. *Emergency Severity Index (ESI): A Triage Tool for Emergency Department Care, Version 5.* AHRQ Publication No. 20-0046, 2020."
  };

export default runner;
