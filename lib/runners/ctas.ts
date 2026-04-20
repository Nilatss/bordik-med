// @ts-nocheck
/**
 * Runner: ctas
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
    maxScore: 5,
    inputs: [
      {
        id: "level",
        label: "Уровень CTAS",
        type: "select",
        options: [
          {
            value: "1",
            label: "I - Resuscitation: реанимация, шок, GCS <10, SpO₂<90, тяжёлая респ. дистресс",
            points: 1
          },
          {
            value: "2",
            label: "II - Emergent: угроза функции органа, ишемическая боль, политравма, ментальные изменения",
            points: 2
          },
          {
            value: "3",
            label: "III - Urgent: умеренная боль (4-7), умеренная одышка, рвота + дегидратация",
            points: 3
          },
          {
            value: "4",
            label: "IV - Less urgent: лёгкая боль (<4), незначительная инфекция, хр. жалобы",
            points: 4
          },
          {
            value: "5",
            label: "V - Non-urgent: хронические стабильные жалобы, рецепты, перевязки",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "I - Resuscitation",
        color: "#DC2626",
        description: "Немедленная реанимация (0 мин). Reassessment continuous.",
        actions: [
          "Reanimation room, ABCDE",
          "Команда реаниматологов",
          "Параллельная терапия и мониторинг"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "II - Emergent",
        color: "#EA580C",
        description: "Осмотр ≤ 15 мин. Reassessment каждые 15 мин."
      },
      {
        min: 3,
        max: 3,
        label: "III - Urgent",
        color: "#FACC15",
        description: "Осмотр ≤ 30 мин. Reassessment каждые 30 мин."
      },
      {
        min: 4,
        max: 4,
        label: "IV - Less urgent",
        color: "#22C55E",
        description: "Осмотр ≤ 60 мин. Reassessment каждые 60 мин."
      },
      {
        min: 5,
        max: 5,
        label: "V - Non-urgent",
        color: "#3B82F6",
        description: "Осмотр ≤ 120 мин."
      }
    ],
    caveats: [
      "CTAS имеет педиатрическую версию (PaedCTAS) с иными пороговыми витальными",
      "Система требует реассессмента при превышении целевого времени - отказ от приоритета считается критическим событием",
      "Уровень определяется наивысшим выявленным модификатором (боль, лихорадка, витальные)",
      "Не использовать у MCI"
    ],
    related: [
      {
        id: "esi",
        title: "ESI v.5"
      },
      {
        id: "mts",
        title: "MTS"
      },
      {
        id: "ats",
        title: "ATS"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Bullard MJ, Musgrave E, Warren D, et al. Revisions to the Canadian Emergency Department Triage and Acuity Scale (CTAS) Guidelines 2016. CJEM 2017.",
    countries: "Канада",
    presets: [
      {
        label: "Остановка сердца",
        values: {
          level: "1"
        }
      },
      {
        label: "Острая боль в груди",
        values: {
          level: "2"
        }
      },
      {
        label: "Мигрень без неврологии",
        values: {
          level: "3"
        }
      }
    ],
    info: "### Для чего используется\n**CTAS (Canadian Triage and Acuity Scale)** - национальная канадская 5-уровневая шкала, принятая CAEP и NENA с 1999. Первое пересмотренное издание 2004, актуальное - 2016.\n\n### Критерии (5 уровней)\n| Уровень | Название | Целевое время | Reassessment | Пример |\n|---|---|---|---|---|\n| I | Resuscitation | 0 мин | Непрерывно | Остановка сердца, шок |\n| II | Emergent | ≤ 15 мин | каждые 15 мин | ОКС, инсульт, ДКА |\n| III | Urgent | ≤ 30 мин | каждые 30 мин | Умеренная одышка, рвота с дегидратацией |\n| IV | Less urgent | ≤ 60 мин | каждые 60 мин | Инфекция моч. путей, лёгкая травма |\n| V | Non-urgent | ≤ 120 мин | по необходимости | Хр. боли, рецепты |\n\n### Интерпретация\nУровень определяется:\n1. **First-order modifiers** - витальные, боль, LOC, температура, кровотечение, дистресс\n2. **Second-order modifiers** - специфичные для жалобы (глюкоза, дегидратация и т.п.)\n\n### Витальные (взрослые, первый порядок)\n| Параметр | I | II | III |\n|---|---|---|---|\n| ЧСС | <40 / >140 + инст. | <50 / >120 | - |\n| САД | <80 | <90 | - |\n| ЧДД | <10 / >30 | <12 / >28 | - |\n| SpO₂ | <90% на О₂ | <92% | <94% |\n\n### Ограничения\n- Требует опыта - inter-rater kappa ~ 0,6\n- Недооценка у пожилых с хронической гипотензией\n- PaedCTAS - иные пороги у детей\n\n### Тактика\n- **I-II**: реанимация/основная зона немедленно\n- **III-IV**: плановая диагностика\n- **V**: fast-track"
  };

export default runner;
