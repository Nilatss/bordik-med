// @ts-nocheck
/**
 * Runner: ipss
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
    maxScore: 35,
    inputs: [
      {
        id: "incomplete",
        label: "1. Ощущение неполного опорожнения",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "<1 из 5",
            points: 1
          },
          {
            value: "2",
            label: "<50%",
            points: 2
          },
          {
            value: "3",
            label: "~50%",
            points: 3
          },
          {
            value: "4",
            label: ">50%",
            points: 4
          },
          {
            value: "5",
            label: "Почти всегда",
            points: 5
          }
        ]
      },
      {
        id: "frequency",
        label: "2. Учащённое мочеиспускание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "<1 из 5",
            points: 1
          },
          {
            value: "2",
            label: "<50%",
            points: 2
          },
          {
            value: "3",
            label: "~50%",
            points: 3
          },
          {
            value: "4",
            label: ">50%",
            points: 4
          },
          {
            value: "5",
            label: "Почти всегда",
            points: 5
          }
        ]
      },
      {
        id: "intermittency",
        label: "3. Прерывистая струя",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "<1 из 5",
            points: 1
          },
          {
            value: "2",
            label: "<50%",
            points: 2
          },
          {
            value: "3",
            label: "~50%",
            points: 3
          },
          {
            value: "4",
            label: ">50%",
            points: 4
          },
          {
            value: "5",
            label: "Почти всегда",
            points: 5
          }
        ]
      },
      {
        id: "urgency",
        label: "4. Императивные позывы",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "<1 из 5",
            points: 1
          },
          {
            value: "2",
            label: "<50%",
            points: 2
          },
          {
            value: "3",
            label: "~50%",
            points: 3
          },
          {
            value: "4",
            label: ">50%",
            points: 4
          },
          {
            value: "5",
            label: "Почти всегда",
            points: 5
          }
        ]
      },
      {
        id: "weak",
        label: "5. Слабая струя",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "<1 из 5",
            points: 1
          },
          {
            value: "2",
            label: "<50%",
            points: 2
          },
          {
            value: "3",
            label: "~50%",
            points: 3
          },
          {
            value: "4",
            label: ">50%",
            points: 4
          },
          {
            value: "5",
            label: "Почти всегда",
            points: 5
          }
        ]
      },
      {
        id: "straining",
        label: "6. Натуживание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "<1 из 5",
            points: 1
          },
          {
            value: "2",
            label: "<50%",
            points: 2
          },
          {
            value: "3",
            label: "~50%",
            points: 3
          },
          {
            value: "4",
            label: ">50%",
            points: 4
          },
          {
            value: "5",
            label: "Почти всегда",
            points: 5
          }
        ]
      },
      {
        id: "nocturia",
        label: "7. Ночные подъёмы для мочеиспускания",
        type: "select",
        options: [
          {
            value: "0",
            label: "0",
            points: 0
          },
          {
            value: "1",
            label: "1",
            points: 1
          },
          {
            value: "2",
            label: "2",
            points: 2
          },
          {
            value: "3",
            label: "3",
            points: 3
          },
          {
            value: "4",
            label: "4",
            points: 4
          },
          {
            value: "5",
            label: "5+",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 7,
        label: "0-7 (лёгкая)",
        color: "#22C55E",
        description: "Watchful waiting."
      },
      {
        min: 8,
        max: 19,
        label: "8-19 (умеренная)",
        color: "#F59E0B",
        description: "Консервативная терапия (α-блокаторы, 5-ARI)."
      },
      {
        min: 20,
        max: 35,
        label: "20-35 (тяжёлая)",
        color: "#EF4444",
        description: "Рассмотреть оперативное лечение."
      }
    ],
    caveats: [
      "Оценивает только симптомы, не анатомию (УЗИ простаты / объём, PSA)",
      "Симптомы могут быть не от ДГПЖ (нейрогенный мочевой пузырь, стриктура, инфекция)",
      "QoL (8-й вопрос) оценивается отдельно",
      "При острой задержке мочи / гематурии / рецидивирующих ИМП - не ждать, направлять к урологу"
    ],
    relatedCourses: [
      {
        id: "301.5",
        title: "Нефрология"
      }
    ],
    related: [
      {
        id: "bmi",
        title: "BMI"
      }
    ],
    reference: "Barry 1992 (AUA). Международный стандарт оценки СНМП при ДГПЖ.",
    info: "### Для чего используется\n**IPSS (International Prostate Symptom Score, Barry 1992)** - международная шкала оценки **симптомов нижних мочевыводящих путей (СНМП)** при **доброкачественной гиперплазии предстательной железы (ДГПЖ)**. Применяется для принятия решения о тактике, оценки эффекта терапии.\n\n### 7 вопросов (0-5 баллов каждый)\n| Вопрос |\n|---|\n| 1. Неполное опорожнение мочевого пузыря |\n| 2. Частое мочеиспускание (< 2 ч между) |\n| 3. Прерывистая струя |\n| 4. Императивные позывы |\n| 5. Слабая струя |\n| 6. Необходимость натуживания |\n| 7. Ноктурия (число раз за ночь) |\n\nДля каждого: 0 = никогда, 5 = почти всегда (кроме ноктурии - число раз).\n\n### Интерпретация\n| IPSS | Тяжесть | Тактика |\n|---|---|---|\n| 0-7 | Лёгкая | Наблюдение, watchful waiting |\n| 8-19 | Умеренная | α-блокаторы ± 5-ARI |\n| 20-35 | Тяжёлая | Медикаменты; рассмотреть оперативное лечение |\n\n### Дополнительно - Quality of Life (QoL) score\n8-й вопрос: «Как бы вы себя чувствовали, если бы оставшиеся годы жизни прошли с таким мочеиспусканием?»\nШкала 0-6: от «отлично» до «ужасно». QoL ≥ 4 - важный индикатор для оперативного лечения.\n\n### Медикаментозная терапия ДГПЖ\n| Группа | Препараты | Эффект |\n|---|---|---|\n| **α-блокаторы** | Тамсулозин, силодозин, доксазозин, алфузозин | Быстрое облегчение симптомов (2-4 нед) |\n| **5-ARI** | Финастерид, дутастерид | Уменьшение простаты на 20-30 % за 6 мес; замедление прогрессии |\n| **Комбинация α + 5-ARI** | Тамсулозин + дутастерид (Duodart) | Лучший эффект при простате > 40 мл (CombAT trial) |\n| **Антихолинергики** | Солифенацин, толтеродин | При императивных позывах |\n| **β3-агонисты** | Мирабегрон | Альтернатива антихолинергикам |\n| **PDE5** | Тадалафил 5 мг/сут | СНМП + ЭД |\n\n### Оперативное лечение\n| Метод | Показания |\n|---|---|\n| **TURP (резекция)** | Золотой стандарт; простата < 80 мл |\n| **HoLEP (энуклеация)** | Любой объём простаты |\n| **ThuLEP** | Аналог HoLEP |\n| **Простая простатэктомия** | > 80 мл (альтернатива HoLEP) |\n| **Rezum (парогенерация)** | Минимально инвазивное; сохраняет эректильную функцию |\n| **UroLift** | 30-80 мл; минимально инвазивное |\n| **Аquablation** | Роботизированное |\n\n### Ограничения\n- Не отличает ДГПЖ от других причин СНМП (рак простаты, стриктура)\n- Самоотчёт субъективен\n- Не включает объективные параметры (остаточная моча, урофлоуметрия)"
  };

export default runner;
