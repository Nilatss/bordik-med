/**
 * Runner: stop-bang
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
        id: "snore",
        label: "Snoring - громкий храп",
        type: "checkbox",
        points: 1
      },
      {
        id: "tired",
        label: "Tired - усталость/сонливость днём",
        type: "checkbox",
        points: 1
      },
      {
        id: "observed",
        label: "Observed - наблюдалось апноэ во сне",
        type: "checkbox",
        points: 1
      },
      {
        id: "pressure",
        label: "Pressure - гипертензия / лечится от неё",
        type: "checkbox",
        points: 1
      },
      {
        id: "bmi",
        label: "BMI >35",
        type: "checkbox",
        points: 1
      },
      {
        id: "age",
        label: "Age >50 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "neck",
        label: "Neck circ. >40 см",
        type: "checkbox",
        points: 1
      },
      {
        id: "gender",
        label: "Gender male (мужчина)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (низкий риск)",
        color: "#22C55E",
        description: "Низкий риск СОАС."
      },
      {
        min: 3,
        max: 4,
        label: "3-4 (промежуточный)",
        color: "#F59E0B",
        description: "Средний риск. Рассмотреть полисомнографию."
      },
      {
        min: 5,
        max: 8,
        label: "5-8 (высокий)",
        color: "#EF4444",
        description: "Высокий риск. Направление на полисомнографию."
      }
    ],
    caveats: [
      "Скрининг, не диагноз - требуется полисомнография или HSAT",
      "Низкая специфичность при ожирении",
      "Особенно полезен предоперационно для оценки периоперационного риска",
      "Не применять изолированно для центрального апноэ сна"
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      }
    ],
    related: [
      {
        id: "bmi",
        title: "BMI"
      },
      {
        id: "mmrc",
        title: "mMRC"
      }
    ],
    reference: "Chung 2008. Скрининг обструктивного апноэ сна.",
    info: "### Для чего используется\n**STOP-BANG (Chung 2008)** - скрининг **синдрома обструктивного апноэ сна (СОАС)**. Применяется предоперационно, в первичной помощи, при подозрении на СОАС.\n\n### Мнемоника STOP-BANG\n| Буква | Вопрос |\n|---|---|\n| **S** | Snoring - Громкий храп? |\n| **T** | Tiredness - Дневная усталость/сонливость? |\n| **O** | Observed apnea - Свидетели наблюдали остановки дыхания? |\n| **P** | Pressure - Лечится ли АГ? |\n| **B** | BMI > 35 |\n| **A** | Age > 50 |\n| **N** | Neck circumference > 40 см |\n| **G** | Gender - мужской пол |\n\nКаждый пункт = 1 балл. Максимум 8.\n\n### Интерпретация\n| STOP-BANG | Риск СОАС |\n|---|---|\n| 0-2 | Низкий |\n| 3-4 | Промежуточный |\n| ≥ 5 | Высокий |\n| ≥ 3 + BMI > 35 или шея > 40 или мужчина | Высокий - полисомнография |\n\n### Применение\n| Ситуация | Действие |\n|---|---|\n| STOP-BANG ≥ 3 | Направление на полисомнографию |\n| Предоперационно | Осторожность с опиоидами, CPAP intraoperatively |\n| Водители грузовых | Обязательный скрининг в ряде стран |\n\n### Диагностика СОАС\n| Метод | Детали |\n|---|---|\n| **Полисомнография (PSG)** | Золотой стандарт |\n| **Home sleep apnea test (HSAT)** | Упрощённая, дома |\n| **AHI (Apnea-Hypopnea Index)** | ≥ 5 - СОАС; ≥ 30 - тяжёлый |\n\n### Альтернативы\n| Шкала | Применение |\n|---|---|\n| **Berlin Questionnaire** | 10 вопросов, 3 категории риска |\n| **Epworth Sleepiness Scale (ESS)** | Оценка дневной сонливости (> 10 - патология) |\n| **NoSAS score** | Европейская альтернатива |\n\n### Ограничения\n- Высокая чувствительность, низкая специфичность\n- Не оценивает тяжесть СОАС\n- Не заменяет полисомнографию"
  };

export default runner;
