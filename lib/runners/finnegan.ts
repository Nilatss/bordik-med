// @ts-nocheck
/**
 * Runner: finnegan
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
    maxScore: 46,
    inputs: [
      {
        id: "cry",
        label: "Плач: высокий/пронзительный",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "2",
            label: "Высокий плач",
            points: 2
          },
          {
            value: "3",
            label: "Непрерывный высокий плач",
            points: 3
          }
        ]
      },
      {
        id: "sleep",
        label: "Сон после кормления",
        type: "select",
        options: [
          {
            value: "0",
            label: "> 3 ч",
            points: 0
          },
          {
            value: "1",
            label: "< 3 ч",
            points: 1
          },
          {
            value: "2",
            label: "< 2 ч",
            points: 2
          },
          {
            value: "3",
            label: "< 1 ч",
            points: 3
          }
        ]
      },
      {
        id: "moro",
        label: "Рефлекс Моро",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальный",
            points: 0
          },
          {
            value: "2",
            label: "Гиперактивный",
            points: 2
          },
          {
            value: "3",
            label: "Выраженно гиперактивный",
            points: 3
          }
        ]
      },
      {
        id: "tremor_dist",
        label: "Тремор (при нарушении покоя)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкий",
            points: 1
          },
          {
            value: "2",
            label: "Выраженный",
            points: 2
          }
        ]
      },
      {
        id: "tremor_undist",
        label: "Тремор в покое",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "3",
            label: "Лёгкий",
            points: 3
          },
          {
            value: "4",
            label: "Выраженный",
            points: 4
          }
        ]
      },
      {
        id: "tone",
        label: "Повышенный мышечный тонус",
        type: "checkbox",
        points: 2
      },
      {
        id: "excoriation",
        label: "Экскориации (колени, нос, локти)",
        type: "checkbox",
        points: 1
      },
      {
        id: "myoclonic",
        label: "Миоклонические подёргивания",
        type: "checkbox",
        points: 3
      },
      {
        id: "seizures",
        label: "Генерализованные судороги",
        type: "checkbox",
        points: 5
      },
      {
        id: "sweating",
        label: "Потливость",
        type: "checkbox",
        points: 1
      },
      {
        id: "fever",
        label: "Температура",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 37,2 °C",
            points: 0
          },
          {
            value: "1",
            label: "37,3–38,3 °C",
            points: 1
          },
          {
            value: "2",
            label: "> 38,4 °C",
            points: 2
          }
        ]
      },
      {
        id: "yawn",
        label: "Частое зевание (> 3–4 раз/интервал)",
        type: "checkbox",
        points: 1
      },
      {
        id: "mottling",
        label: "Мраморность кожи",
        type: "checkbox",
        points: 1
      },
      {
        id: "nasalStuff",
        label: "Заложенность носа",
        type: "checkbox",
        points: 1
      },
      {
        id: "sneezing",
        label: "Чихание (> 3–4 раз/интервал)",
        type: "checkbox",
        points: 1
      },
      {
        id: "nasalFlare",
        label: "Раздувание крыльев носа",
        type: "checkbox",
        points: 2
      },
      {
        id: "rr",
        label: "ЧД",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 60/мин",
            points: 0
          },
          {
            value: "1",
            label: "> 60/мин",
            points: 1
          },
          {
            value: "2",
            label: "> 60/мин + втяжения",
            points: 2
          }
        ]
      },
      {
        id: "suck",
        label: "Чрезмерное сосание",
        type: "checkbox",
        points: 1
      },
      {
        id: "feed",
        label: "Плохое кормление",
        type: "checkbox",
        points: 2
      },
      {
        id: "regurg",
        label: "Срыгивания",
        type: "checkbox",
        points: 2
      },
      {
        id: "vomit",
        label: "Рвота фонтаном",
        type: "checkbox",
        points: 3
      },
      {
        id: "stoolLoose",
        label: "Стул жидкий",
        type: "checkbox",
        points: 2
      },
      {
        id: "stoolWater",
        label: "Стул водянистый",
        type: "checkbox",
        points: 3
      }
    ],
    bands: [
      {
        min: 0,
        max: 7,
        label: "0–7 (без терапии)",
        color: "#22C55E",
        description: "Лёгкая NAS. Немедикаментозный уход.",
        details: "Баллы < 8 в трёх последовательных оценках — медикаменты не показаны.",
        actions: [
          "Пеленание, тёмная тихая комната, контакт кожа-к-коже",
          "Частое кормление малыми объёмами",
          "Оценивать каждые 3–4 ч (перед кормлением)"
        ]
      },
      {
        min: 8,
        max: 11,
        label: "8–11 (наблюдение)",
        color: "#F59E0B",
        description: "Умеренная NAS. Усилить немедикаментозный уход.",
        details: "Если 2 последовательные оценки ≥ 8 или средний ≥ 8 за 3 — начать терапию.",
        actions: [
          "Усилить немедикаментозные меры",
          "При стабильно ≥ 8 — начать морфин перорально 0,04–0,08 мг/кг каждые 3–4 ч",
          "При in-utero экспозиции метадона / бупренорфина — предпочтение морфину"
        ]
      },
      {
        min: 12,
        max: 46,
        label: "≥ 12 (медикаменты)",
        color: "#EF4444",
        description: "Тяжёлая NAS. Фармакологическая терапия.",
        details: "Баллы ≥ 12 или два подряд ≥ 8 — показана фармакотерапия опиоидом.",
        actions: [
          "Морфин per os 0,04–0,1 мг/кг каждые 3–4 ч (эскалация по баллам)",
          "Альтернатива: метадон, бупренорфин сублингвально",
          "Адъюванты: клонидин, фенобарбитал (при полиэкспозиции)",
          "Постепенное снижение дозы 10 %/день по клинике",
          "ESC-подход (Eat-Sleep-Console) как альтернатива scoring"
        ]
      }
    ],
    caveats: [
      "Оценка каждые 3–4 ч перед кормлением, ребёнок должен быть разбужен",
      "Современные протоколы (AAP 2020) смещаются в сторону ESC (Eat-Sleep-Console) как более функциональной оценки",
      "Шкала чувствительна к оценщику — необходимо обучение",
      "Не различает источник NAS (опиоиды vs SSRI vs бензодиазепины)"
    ],
    related: [
      {
        id: "apgar",
        title: "Apgar"
      },
      {
        id: "thompson",
        title: "Thompson (HIE)"
      },
      {
        id: "downes",
        title: "Downes"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "203.9",
        title: "Педиатрическая фармакология"
      }
    ],
    reference: "Finnegan LP et al. Neonatal Abstinence Syndrome: assessment and management. Addict Dis 1975;2:141–158.",
    countries: "Международный",
    info: "### Для чего используется\n**Finnegan Neonatal Abstinence Scoring System (1975)** — оценка тяжести синдрома отмены у новорождённых от матерей, употреблявших опиоиды (героин, метадон, бупренорфин), SSRI, бензодиазепины.\n\n### Структура\n21 пункт, сгруппированные в 3 категории:\n- **ЦНС:** плач, сон, рефлексы Моро, тремор, тонус, судороги\n- **Метаболические/вегетативные/респираторные:** потливость, температура, мраморность, чихание, заложенность, ЧД\n- **Желудочно-кишечные:** сосание, кормление, рвота, стул\n\nВес каждого признака 1–5 баллов. Максимум ~46.\n\n### Интерпретация\n| Балл | Тактика |\n|---|---|\n| 0–7 | Наблюдение, поддерживающий уход |\n| 8–11 | Усилить нефармакологические меры; начать лечение при 2 подряд ≥ 8 или среднем ≥ 8 |\n| ≥ 12 | Фармакологическая терапия (морфин / метадон) |\n\n### Когда оценивать\n- Каждые 3–4 ч (перед кормлением)\n- Ребёнок должен быть в активном состоянии\n- Начинать с 2 ч после рождения\n\n### Ограничения\n- Субъективность, межоценочная вариабельность\n- Не дифференцирует агент\n- AAP 2020: сдвиг к ESC (Eat-Sleep-Console) — функциональная оценка вместо подсчёта\n\n### Фармакотерапия\n- **Морфин** 0,04–0,08 мг/кг каждые 3–4 ч перорально; эскалация по баллам\n- **Метадон** или **бупренорфин** как альтернатива\n- **Клонидин** 1 мкг/кг × 4–6/сут как адъювант\n- Снижение 10 %/сут после стабилизации < 8 в течение 24–48 ч\n\n### Источник\nFinnegan LP, Connaughton JF Jr, Kron RE, Emich JP. *Addict Dis* 1975;2:141–158.\nPatrick SW et al. Neonatal Opioid Withdrawal Syndrome. *Pediatrics* 2020;146:e2020029074."
  };

export default runner;
