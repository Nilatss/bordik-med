/**
 * Runner: gad7 — Generalised Anxiety Disorder 7-item scale
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief
 *               measure for assessing generalized anxiety disorder: the
 *               GAD-7. Arch Intern Med. 2006;166(10):1092-1097.
 *               doi:10.1001/archinte.166.10.1092
 *   GUIDELINE:  NICE CG113 (Generalised anxiety disorder) — GAD-7 как
 *               primary screening tool в primary care + outcome measure
 *               для CBT / SSRI treatment monitoring.
 *
 * 7 questions (frequency in past 2 weeks, 0-3 each):
 *   1. Feeling nervous, anxious, or on edge
 *   2. Not being able to stop or control worrying
 *   3. Worrying too much about different things
 *   4. Trouble relaxing
 *   5. Being so restless that it is hard to sit still
 *   6. Becoming easily annoyed or irritable
 *   7. Feeling afraid as if something awful might happen
 *
 *   Each scored: 0 (not at all) / 1 (several days) /
 *                2 (more than half the days) / 3 (nearly every day)
 *
 * Total: 0-21
 *
 * Severity bands:
 *   0-4    → minimal anxiety
 *   5-9    → mild anxiety        — watchful waiting / self-help
 *   10-14  → moderate anxiety    — active treatment (psychotherapy)
 *   15-21  → severe anxiety      — combination CBT + medication
 *
 * Caveats:
 *   - Self-report — может быть искажён social desirability
 *   - НЕ specific GAD — ловит panic, social phobia, PTSD overlap
 *   - Pediatric / elderly populations требуют адаптированные cut-offs
 *
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
    maxScore: 21,
    inputs: [
      {
        id: "q1",
        label: "1. Нервозность, тревога или раздражительность",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Несколько дней",
            points: 1
          },
          {
            value: "2",
            label: "Более половины дней",
            points: 2
          },
          {
            value: "3",
            label: "Почти каждый день",
            points: 3
          }
        ]
      },
      {
        id: "q2",
        label: "2. Невозможность остановить или контролировать беспокойство",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Несколько дней",
            points: 1
          },
          {
            value: "2",
            label: "Более половины дней",
            points: 2
          },
          {
            value: "3",
            label: "Почти каждый день",
            points: 3
          }
        ]
      },
      {
        id: "q3",
        label: "3. Излишнее беспокойство о разных вещах",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Несколько дней",
            points: 1
          },
          {
            value: "2",
            label: "Более половины дней",
            points: 2
          },
          {
            value: "3",
            label: "Почти каждый день",
            points: 3
          }
        ]
      },
      {
        id: "q4",
        label: "4. Трудности с расслаблением",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Несколько дней",
            points: 1
          },
          {
            value: "2",
            label: "Более половины дней",
            points: 2
          },
          {
            value: "3",
            label: "Почти каждый день",
            points: 3
          }
        ]
      },
      {
        id: "q5",
        label: "5. Такое беспокойство, что трудно усидеть на месте",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Несколько дней",
            points: 1
          },
          {
            value: "2",
            label: "Более половины дней",
            points: 2
          },
          {
            value: "3",
            label: "Почти каждый день",
            points: 3
          }
        ]
      },
      {
        id: "q6",
        label: "6. Легко раздражаюсь",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Несколько дней",
            points: 1
          },
          {
            value: "2",
            label: "Более половины дней",
            points: 2
          },
          {
            value: "3",
            label: "Почти каждый день",
            points: 3
          }
        ]
      },
      {
        id: "q7",
        label: "7. Страх, что может случиться что-то ужасное",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Несколько дней",
            points: 1
          },
          {
            value: "2",
            label: "Более половины дней",
            points: 2
          },
          {
            value: "3",
            label: "Почти каждый день",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "0-4 (минимальная)",
        color: "#22C55E",
        description: "Нет клинически значимой тревоги."
      },
      {
        min: 5,
        max: 9,
        label: "5-9 (лёгкая)",
        color: "#84CC16",
        description: "Лёгкое тревожное расстройство."
      },
      {
        min: 10,
        max: 14,
        label: "10-14 (умеренная)",
        color: "#F59E0B",
        description: "Умеренное. Рассмотреть лечение."
      },
      {
        min: 15,
        max: 21,
        label: "15-21 (тяжёлая)",
        color: "#EF4444",
        description: "Тяжёлое. Активное лечение.",
        details: "Высокая вероятность ГТР или другого тяжёлого тревожного расстройства. Часто коморбидна с депрессией - параллельный PHQ-9.",
        actions: [
          "СИОЗС/СИОЗСН (сертралин, эсциталопрам, венлафаксин) как первая линия",
          "КПТ с экспозицией",
          "Избегать длительного приёма бензодиазепинов (риск зависимости)",
          "Исключить гипертиреоз, кофеин, стимуляторы, алкогольную/седативную абстиненцию"
        ]
      }
    ],
    caveats: [
      "Неспецифична - отличать ГТР от паники, социального тревожного, ПТСР требует клиники",
      "Скрининг, не диагноз (DSM-5)",
      "Соматические симптомы могут быть при гипертиреозе, феохромоцитоме, синдроме отмены",
      "Часто коморбидна с депрессией - всегда параллельный PHQ-9"
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    related: [
      {
        id: "phq9",
        title: "PHQ-9 (депрессия)"
      },
      {
        id: "epds",
        title: "EPDS (послеродовая)"
      },
      {
        id: "audit-c",
        title: "AUDIT-C (алкоголь)"
      }
    ],
    reference: "Spitzer 2006. Cutoff ≥10 - скрининг ГТР.",
    info: "### Для чего используется\n**GAD-7 (Generalized Anxiety Disorder, Spitzer 2006)** - скрининг **генерализованного тревожного расстройства** и других тревожных расстройств у взрослых (≥ 12 лет). Самозаполняемый. Также используется для оценки **панического, социального тревожного расстройства, ПТСР**.\n\n### Интерпретация\n| GAD-7 | Тяжесть |\n|---|---|\n| 0-4 | Минимальная |\n| 5-9 | Лёгкая |\n| 10-14 | Умеренная |\n| 15-21 | Тяжёлая |\n\n**Cutoff ≥ 10** - скрининг-позитивен для ГТР (чувствительность 89 %, специфичность 82 %).\n\n### Диагноз ГТР (DSM-5)\n- Чрезмерная тревога и беспокойство относительно множества событий ≥ 6 мес\n- Трудно контролировать беспокойство\n- ≥ 3 из 6 симптомов: беспокойство/\"на взводе\", утомляемость, трудности концентрации, раздражительность, мышечное напряжение, нарушение сна\n- Значимое функциональное нарушение\n\n### Скрининг в первичной помощи\nРекомендован USPSTF (2023) у всех взрослых ≥ 8 лет - положительный → полная оценка.\n\n### Лечение (NICE, APA)\n**Лёгкая-умеренная (GAD-7 5-14)**:\n- **КПТ** - первая линия (включая онлайн-КПТ, iCBT)\n- Психообразование, релаксация, физическая активность\n- Избегать кофеина, алкоголя, никотина\n\n**Умеренно-тяжёлая (GAD-7 ≥ 15)**:\n- **СИОЗС**: эсциталопрам, сертралин, пароксетин\n- **СИОЗСН**: венлафаксин, дулоксетин\n- Альтернатива: буспирон (частичный агонист 5-HT1A)\n\n**Краткосрочно** (при обострении, до развития эффекта СИОЗС):\n- Бензодиазепины (лоразепам, диазепам) - **не более 2-4 нед** из-за зависимости\n- Гидроксизин - альтернатива без зависимости\n- Прегабалин (FDA off-label для ГТР в США; в ЕС одобрен)\n\n### Не используйте первой линией\n| Класс | Причина избегать |\n|---|---|\n| Бензодиазепины долгосрочно | Зависимость, когнитивные нарушения у пожилых |\n| Трициклики | Больше побочных эффектов, низкий терапевтический индекс |\n\n### Специфические тревожные расстройства\n| Расстройство | Первая линия | Дополнительно |\n|---|---|---|\n| Паническое расстройство | СИОЗС + КПТ | Бензодиазепины/гидроксизин при острой атаке |\n| Социальное тревожное | СИОЗС + КПТ | β-блокаторы (пропранолол) ситуационно |\n| ПТСР | Сертралин/пароксетин (FDA) | КПТ-травма-ориентированная, EMDR, prazosin при ночных кошмарах |\n| ОКР | СИОЗС в высоких дозах | КПТ с exposure/response prevention |\n| Специфические фобии | КПТ-экспозиция | - |\n\n### Скрининг суицидальности\nGAD-7 не содержит прямого вопроса о суициде, но ГТР повышает риск - оценивайте совместно с PHQ-9.\n\n### Сравнение\n| Шкала | Применение |\n|---|---|\n| **GAD-7** | Скрининг ГТР + другие тревожные |\n| **GAD-2** | Ультра-краткий (первые 2 пункта) |\n| **Beck Anxiety Inventory (BAI)** | Фокусируется на соматических симптомах |\n| **Hamilton Anxiety (HAM-A)** | Интервью клинициста, для исследований |\n| **PCL-5** | Специфичен для ПТСР |\n| **Panic Disorder Severity Scale (PDSS)** | Для панических |\n| **Y-BOCS** | Для ОКР |\n\n### Мониторинг\nПовтор каждые 4 нед в начале лечения. Цель - снижение ≥ 50 % или GAD-7 < 10.\n\n### Физические причины исключить\n| Состояние | Что проверить |\n|---|---|\n| Гипертиреоз | ТТГ всем |\n| Феохромоцитома | Метанефрины мочи при пароксизмах + АГ |\n| Гипогликемия | СД, подозрение на инсулиному |\n| Тахиаритмии | Холтер-мониторинг |\n| Дефицит B12 | Уровень B12 в сыворотке |\n| Отмена ПАВ | Алкоголь, бензодиазепины, опиоиды |\n| Стимуляторы | Кофеин, амфетамины, кокаин, никотин |\n\n### Ограничения\n- Не отличает первичную тревогу от физических причин\n- Культурные различия в выражении тревоги\n- У пожилых тревога часто маскируется соматическими жалобами"
  };

export default runner;
