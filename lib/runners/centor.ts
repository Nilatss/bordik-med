/**
 * Runner: centor
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
        id: "tonsillar",
        label: "Тонзиллярный экссудат",
        type: "checkbox",
        points: 1
      },
      {
        id: "nodes",
        label: "Болезненные передние шейные лимфоузлы",
        type: "checkbox",
        points: 1
      },
      {
        id: "fever",
        label: "Лихорадка в анамнезе (>38°C)",
        type: "checkbox",
        points: 1
      },
      {
        id: "no_cough",
        label: "Отсутствие кашля",
        type: "checkbox",
        points: 1
      },
      {
        id: "age",
        label: "Возраст (McIsaac-модификация)",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥45",
            points: -1
          },
          {
            value: "1",
            label: "15-44",
            points: 0
          },
          {
            value: "2",
            label: "3-14",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: -1,
        max: 0,
        label: "≤0",
        color: "#22C55E",
        description: "~1% стрептококк. АБ не нужны."
      },
      {
        min: 1,
        max: 1,
        label: "1",
        color: "#84CC16",
        description: "~5-10%. АБ не нужны."
      },
      {
        min: 2,
        max: 2,
        label: "2",
        color: "#F59E0B",
        description: "~11-17%. Тест на Streptococcus."
      },
      {
        min: 3,
        max: 3,
        label: "3",
        color: "#F97316",
        description: "~28-35%. Тест или эмпирическая АБ-терапия."
      },
      {
        min: 4,
        max: 5,
        label: "≥4",
        color: "#EF4444",
        description: "~51-53%. Эмпирическая АБ-терапия."
      }
    ],
    caveats: [
      "Не валидизирован у < 3 лет (стрептококк редко вызывает фарингит)",
      "Тест (RADT) предпочтительнее эмпирической АБ даже при 4-5 баллах (IDSA)",
      "Модификация McIsaac добавляет возрастной компонент",
      "Не исключает другие причины фарингита (EBV, вирусы, гонококк)"
    ],
    relatedCourses: [
      {
        id: "301.9",
        title: "Инфекционные болезни"
      }
    ],
    related: [
      {
        id: "feverpain",
        title: "FeverPAIN (NICE)"
      },
      {
        id: "curb65",
        title: "CURB-65"
      }
    ],
    reference: "Centor 1981, McIsaac 1998. Дифференциация стрептококкового фарингита.",
    info: "### Для чего используется\n**Centor (1981) / McIsaac modification (1998)** - оценка вероятности **стрептококкового фарингита** (β-гемолитический стрептококк группы А, GAS) для решения об антибиотикотерапии.\n\n### Критерии (по 1 баллу)\n| Критерий |\n|---|\n| Лихорадка > 38 °C |\n| Отсутствие кашля |\n| Увеличение передних шейных лимфоузлов, болезненность |\n| Экссудат на миндалинах |\n\n### McIsaac-модификация (возраст)\n| Возраст | +/− баллы |\n|---|---|\n| 3-14 лет | +1 |\n| 15-44 | 0 |\n| ≥ 45 | −1 |\n\n### Интерпретация\n| Баллы | Вероятность GAS | Тактика |\n|---|---|---|\n| ≤ 0 | < 2 % | Антибиотики не нужны, симптоматическая терапия |\n| 1 | ~ 10 % | Антибиотики не показаны |\n| 2 | ~ 15 % | Экспресс-тест на стрептококк; лечить если положительный |\n| 3 | ~ 32 % | Экспресс-тест; лечить положительных |\n| ≥ 4 | > 50 % | Экспресс-тест или эмпирическая терапия |\n\n### Терапия GAS (при положительном тесте)\n| Препарат | Доза / длительность |\n|---|---|\n| Пенициллин V | 500 мг × 2-3 р/сут × 10 дн |\n| Амоксициллин | 500 мг × 3 р/сут × 10 дн (или 1000 мг × 1 × 10 дн для детей) |\n| При аллергии | Цефалексин, клиндамицин, азитромицин × 5 дн |\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **FeverPAIN** | Британская (NICE) - включает гнойные миндалины |\n| **Modified Centor** | То же, что McIsaac |\n\n### Ограничения\n- Не отличает вирусный мононуклеоз (похожая картина)\n- При высокой GAS-распространённости (школы) - чувствительность ниже\n- Экспресс-тесты повышают точность назначения"
  };

export default runner;
