// @ts-nocheck
/**
 * Runner: feverpain
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
        id: "fever",
        label: "F - Лихорадка за 24 ч",
        type: "checkbox",
        points: 1
      },
      {
        id: "pus",
        label: "P - Гнойные налёты",
        type: "checkbox",
        points: 1
      },
      {
        id: "attend",
        label: "A - Обращение в первые 3 дня",
        type: "checkbox",
        points: 1
      },
      {
        id: "inflamed",
        label: "I - Резко воспалённые миндалины",
        type: "checkbox",
        points: 1
      },
      {
        id: "no_cough",
        label: "N - Нет кашля/насморка",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1",
        color: "#22C55E",
        description: "Strep <13%. Без АБ."
      },
      {
        min: 2,
        max: 3,
        label: "2-3",
        color: "#F59E0B",
        description: "34-58%. Отложенный рецепт."
      },
      {
        min: 4,
        max: 5,
        label: "4-5",
        color: "#EF4444",
        description: "62-65%. Эмпирические АБ."
      }
    ],
    caveats: [
      "NICE рекомендует отсроченный рецепт АБ при 2-3 баллах",
      "Не валидизирован у < 3 лет",
      "Не заменяет тест на Streptococcus при доступности"
    ],
    relatedCourses: [
      {
        id: "301.9",
        title: "Инфекционные болезни"
      }
    ],
    related: [
      {
        id: "centor",
        title: "Centor / McIsaac"
      }
    ],
    reference: "Little 2013 (UK). Альтернатива Centor в NICE CG69.",
    countries: "Великобритания (NICE)",
    info: "### Для чего используется\n**FeverPAIN score (Little 2013)** - британская альтернатива Centor для оценки **вероятности бактериального (стрептококкового) фарингита** и решения о назначении антибиотиков. Рекомендована **NICE CG69**.\n\n### Мнемоника FeverPAIN (0-5 баллов)\n| Буква | Критерий |\n|---|---|\n| **F** | Fever - Лихорадка в предыдущие 24 ч |\n| **P** | Purulence - Гнойные миндалины |\n| **A** | Attend rapidly - Обращение за помощью в течение 3 дней от начала болезни |\n| **I** | Inflammation - Выраженное воспаление миндалин |\n| **N** | No cough/coryza - Нет кашля и насморка |\n\n### Интерпретация и тактика\n| FeverPAIN | Вероятность стрептококка | Тактика |\n|---|---|---|\n| 0-1 | 13-18 % | Антибиотики **не требуются**; симптоматическое лечение |\n| 2-3 | 34-40 % | Отсроченная рецептура антибиотиков или экспресс-тест |\n| **≥ 4** | **62-65 %** | Антибиотики рекомендованы (немедленно или в течение 24 ч) |\n\n### Сравнение с Centor\n| Шкала | Критериев | Популяция | Особенность |\n|---|---|---|---|\n| **Centor / McIsaac** | 4 (+ возрастной модификатор) | Все возрасты | Международный стандарт |\n| **FeverPAIN** | 5 | Взрослые / дети ≥ 3 лет | NICE - активнее отсроченных рецептов |\n\n### Отсроченные рецепты (NICE)\n| Стратегия | Детали |\n|---|---|\n| Немедленная рецептура | FeverPAIN ≥ 4 + системные симптомы |\n| Отсроченная (back-up) | FeverPAIN 2-3: рецепт выдаётся, но ждут 3-5 дней, пьют если нет улучшения |\n| Без рецепта | FeverPAIN 0-1 |\n\n### Антибиотики (NICE 2018)\n| Препарат | Доза |\n|---|---|\n| Феноксиметилпенициллин | 500 мг × 4 р/сут × 5-10 дней |\n| Амоксициллин (если пенициллин не подходит) | 500 мг × 3 р/сут |\n| Аллергия к пенициллину | Кларитромицин, эритромицин, азитромицин |\n\n### Осложнения стрептококкового фарингита (если не лечить)\n- Перитонзиллярный абсцесс\n- Ревматическая лихорадка (редко в развитых странах)\n- Острый гломерулонефрит\n- Скарлатина\n\n### Ограничения\n- Не применим у детей < 3 лет\n- Не учитывает иммуносупрессию\n- Не заменяет экспресс-тест на стрептококк при высокой вероятности"
  };

export default runner;
