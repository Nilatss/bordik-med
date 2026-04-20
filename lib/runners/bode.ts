// @ts-nocheck
/**
 * Runner: bode
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
        id: "fev1",
        label: "ОФВ₁ (% от должного)",
        type: "select",
        options: [
          {
            value: 0,
            label: "≥ 65 %",
            points: 0
          },
          {
            value: 1,
            label: "50-64 %",
            points: 1
          },
          {
            value: 2,
            label: "36-49 %",
            points: 2
          },
          {
            value: 3,
            label: "≤ 35 %",
            points: 3
          }
        ]
      },
      {
        id: "walk",
        label: "Тест 6-минутной ходьбы",
        type: "select",
        options: [
          {
            value: 0,
            label: "≥ 350 м",
            points: 0
          },
          {
            value: 1,
            label: "250-349 м",
            points: 1
          },
          {
            value: 2,
            label: "150-249 м",
            points: 2
          },
          {
            value: 3,
            label: "≤ 149 м",
            points: 3
          }
        ]
      },
      {
        id: "mmrc",
        label: "mMRC одышка",
        type: "select",
        options: [
          {
            value: 0,
            label: "0-1",
            points: 0
          },
          {
            value: 1,
            label: "2",
            points: 1
          },
          {
            value: 2,
            label: "3",
            points: 2
          },
          {
            value: 3,
            label: "4",
            points: 3
          }
        ]
      },
      {
        id: "bmi",
        label: "ИМТ",
        type: "select",
        options: [
          {
            value: 0,
            label: "> 21",
            points: 0
          },
          {
            value: 1,
            label: "≤ 21",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2",
        color: "#10B981",
        description: "4-летняя выживаемость ~ 80 %."
      },
      {
        min: 3,
        max: 4,
        label: "3-4",
        color: "#F59E0B",
        description: "4-летняя выживаемость ~ 67 %."
      },
      {
        min: 5,
        max: 6,
        label: "5-6",
        color: "#F59E0B",
        description: "4-летняя выживаемость ~ 57 %."
      },
      {
        min: 7,
        max: 10,
        label: "7-10",
        color: "#EF4444",
        description: "4-летняя выживаемость ~ 18 %.",
        details: "Плохой прогноз при тяжёлой ХОБЛ. Рассмотреть направление на трансплантацию лёгких (при отсутствии противопоказаний).",
        actions: [
          "Оптимизация: LABA+LAMA+ICS, оксигенотерапия при SpO₂ < 88 %",
          "Лёгочная реабилитация",
          "Оценка на трансплантацию / операцию по уменьшению лёгочного объёма",
          "Паллиативная помощь, планирование advance directives"
        ]
      }
    ],
    maxScore: 10,
    caveats: [
      "Требует спирометрии (ОФВ₁) и теста 6-мин ходьбы",
      "mMRC и BMI - субъективные / упрощённые компоненты",
      "Не применим для астмы, других обструктивных заболеваний",
      "Динамический показатель - переоценивать при стабилизации"
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      }
    ],
    related: [
      {
        id: "gold",
        title: "GOLD ABE"
      },
      {
        id: "mmrc",
        title: "mMRC"
      },
      {
        id: "bmi",
        title: "BMI"
      }
    ],
    reference: "Celli BR. NEJM 2004. BODE index при ХОБЛ.",
    info: "### Что предсказывает\n**BODE index** - мультипараметрический индекс **прогноза смертности** при ХОБЛ. Лучше предсказывает смерть, чем ОФВ₁ изолированно.\n\n### Аббревиатура\n- **B** - BMI\n- **O** - Obstruction (ОФВ₁ %)\n- **D** - Dyspnea (mMRC)\n- **E** - Exercise (тест 6-минутной ходьбы, 6MWD)\n\n### 4-летняя выживаемость\n| Quartile | Баллы | Выживаемость |\n|---|---|---|\n| 1 | 0-2 | ~ 80 % |\n| 2 | 3-4 | ~ 67 % |\n| 3 | 5-6 | ~ 57 % |\n| 4 | 7-10 | ~ 18 % |\n\n### Применение\n- Прогноз и **отбор на трансплантацию лёгких**: BODE 7-10 - высокий приоритет\n- Контроль эффекта реабилитации (изменение BODE)\n- Стратификация в клинических исследованиях\n\n### Альтернативы / эволюция\n| Шкала | Компоненты | Преимущество |\n|---|---|---|\n| ADO | Age, Dyspnea, Obstruction | Упрощённая, не требует 6MWT |\n| DOSE | Dyspnea, Obstruction, Smoking, Exacerbations | Амбулаторная, учитывает курение |\n\n### Тест 6-минутной ходьбы (6MWT) - стандарты\n- ATS/ERS 2014 протокол\n- 30-метровый коридор, 6 минут, разрешено замедляться/останавливаться\n- < 350 м у ХОБЛ - повышенная смертность\n- Изменение **≥ 30 м** клинически значимо\n\n### Ограничения\n- Не валидизирован при тяжёлых сопутствующих (CHF, артрит)\n- Зависит от мотивации пациента в 6MWT"
  };

export default runner;
