/**
 * Runner: cpot
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
    maxScore: 8,
    inputs: [
      {
        id: "face",
        label: "Выражение лица",
        type: "select",
        options: [
          {
            value: "0",
            label: "Расслаблено (мышцы не напряжены)",
            points: 0
          },
          {
            value: "1",
            label: "Напряжение (нахмуренные брови, опущение угла глаза)",
            points: 1
          },
          {
            value: "2",
            label: "Гримаса (все вышеперечисленное + плотно сжатые веки)",
            points: 2
          }
        ]
      },
      {
        id: "body",
        label: "Движения тела",
        type: "select",
        options: [
          {
            value: "0",
            label: "Отсутствие движений или обычные",
            points: 0
          },
          {
            value: "1",
            label: "Защитное поведение (медленные, осторожные, касание зоны боли)",
            points: 1
          },
          {
            value: "2",
            label: "Беспокойство, возбуждение (пытается сесть, бьёт, не следует командам)",
            points: 2
          }
        ]
      },
      {
        id: "muscle",
        label: "Мышечное напряжение (пассивное сгибание/разгибание руки)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Расслаблен, отсутствие сопротивления",
            points: 0
          },
          {
            value: "1",
            label: "Напряжён, ригиден, сопротивление пассивным движениям",
            points: 1
          },
          {
            value: "2",
            label: "Очень напряжён, невозможно завершить пассивные движения",
            points: 2
          }
        ]
      },
      {
        id: "vent",
        label: "Комплаенс с вентилятором (интубированные) ИЛИ вокализация (экстубированные)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Толерантен / нормальный тон, нет звуков",
            points: 0
          },
          {
            value: "1",
            label: "Кашель, но толерантен / вздохи, стоны",
            points: 1
          },
          {
            value: "2",
            label: "Борется с вентилятором / плач, всхлипы",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (нет / минимум)",
        color: "#22C55E",
        description: "Нет значимой боли."
      },
      {
        min: 3,
        max: 8,
        label: ">2 (боль)",
        color: "#EF4444",
        description: "Значимая боль - аналгезия.",
        details: "CPOT > 2 означает наличие боли у пациента ОРИТ. Тaргет - CPOT ≤ 2 при регулярной оценке (минимум каждые 4 ч и до/после болезненных манипуляций). Избегать чрезмерной седации - она маскирует боль и увеличивает длительность ИВЛ (SCCM PADIS 2018).",
        actions: [
          "Фентанил 25-50 мкг в/в или инфузия 0,5-2 мкг/кг/ч",
          "Или морфин 2-5 мг в/в (осторожно при ОПП)",
          "Регулярная pre-emptive аналгезия до болезненных процедур (санация, перевязки)",
          "Мультимодально: парацетамол 1 г × 4 р/сут, регионарная анестезия где возможно",
          "Оценка седации отдельно (RASS), цель - лёгкая (RASS 0 до −2)"
        ]
      }
    ],
    caveats: [
      "Валидирована у интубированных и экстубированных пациентов ОРИТ, сознание от бодрствования до лёгкой седации",
      "При глубокой седации (RASS ≤ −4) или миорелаксации оценка ограничена - ориентироваться на вегетативные признаки и регулярную превентивную аналгезию",
      "Альтернатива: BPS (Behavioral Pain Scale, Payen 2001) - 3 параметра, сумма 3-12, \"боль\" > 5",
      "Самоотчёт (NRS) - золотой стандарт; CPOT только когда пациент не может"
    ],
    related: [
      {
        id: "vas",
        title: "VAS/NRS"
      },
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "sofa",
        title: "SOFA"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Gélinas C, Fillion L, Puntillo KA, Viens C, Fortier M. Validation of the critical-care pain observation tool in adult patients. *Am J Crit Care* 2006; 15:420-427.",
    countries: "Международный (SCCM PADIS 2018)",
    info: "### Для чего используется\n**CPOT (Critical-Care Pain Observation Tool, Gélinas 2006)** - поведенческая шкала боли у пациентов ОРИТ, не способных к самоотчёту (интубация, седация). Рекомендована **SCCM PADIS 2018** наряду с BPS.\n\n### Компоненты (4 × 0-2)\n| Параметр | 0 | 1 | 2 |\n|---|---|---|---|\n| Лицо | Расслаблено | Напряжение | Гримаса |\n| Движения тела | Нет / обычные | Защитные | Беспокойство/возбуждение |\n| Мышечное напряжение | Расслаблен | Ригиден | Очень напряжён |\n| Вентилятор **ИЛИ** вокализация | Толерантен / нет звуков | Кашель, стоны | Борется / плач |\n\nСумма: **0-8**. **> 2 = боль**.\n\n### Альтернативы\n| Шкала | Сумма | Порог боли |\n|---|---|---|\n| **BPS** (Payen 2001) | 3-12 | > 5 |\n| **CPOT** | 0-8 | > 2 |\n| **NVPS** | 0-10 | > 3 |\n\nSCCM PADIS 2018 рекомендует CPOT и BPS.\n\n### Ограничения\n- Глубокая седация (RASS ≤ −4): снижен тонус → ложно-низкий балл\n- Миорелаксация: невозможно оценить мышечное напряжение и движения\n- У экстубированных - заменить \"вентилятор\" на вокализацию\n\n### Тактика (SCCM PADIS 2018, ABCDEF bundle)\n- **A** Assess/manage pain (CPOT/BPS)\n- **B** Both SAT & SBT (spontaneous awakening/breathing trials)\n- **C** Choice of analgesia/sedation (analgesia-first)\n- **D** Delirium assess (CAM-ICU)\n- **E** Early mobility\n- **F** Family engagement\n\nЦель: **аналгезия прежде седации**. Фентанил инфузией, прорывные болюсы при CPOT > 2."
  };

export default runner;
