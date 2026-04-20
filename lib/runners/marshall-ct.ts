// @ts-nocheck
/**
 * Runner: marshall-ct
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
    maxScore: 6,
    inputs: [
      {
        id: "class",
        label: "Класс по Marshall",
        type: "select",
        options: [
          {
            value: "1",
            label: "I - видимой патологии нет",
            points: 1
          },
          {
            value: "2",
            label: "II - поражение < 25 мл, цистерны сохранены, смещение < 5 мм",
            points: 2
          },
          {
            value: "3",
            label: "III - цистерны сдавлены/отсутствуют, смещение < 5 мм, без крупного очага",
            points: 3
          },
          {
            value: "4",
            label: "IV - смещение срединных структур > 5 мм, без крупного очага",
            points: 4
          },
          {
            value: "5",
            label: "V - любой хирургически эвакуированный очаг",
            points: 5
          },
          {
            value: "6",
            label: "VI - любой очаг > 25 мл, не эвакуированный",
            points: 6
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "I",
        color: "#22C55E",
        description: "Видимой патологии нет. Смертность ~ 10 %.",
        actions: [
          "Клиническое наблюдение, серийный GCS",
          "Повтор КТ при ухудшении"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "II",
        color: "#84CC16",
        description: "Небольшое поражение. Смертность ~ 14 %.",
        actions: [
          "Наблюдение в ICU",
          "Повтор КТ через 6-24 ч"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "III",
        color: "#F59E0B",
        description: "Диффузный отёк, цистерны сдавлены. Смертность ~ 34 %.",
        details: "Сдавление цистерн - маркер повышенного ВЧД. Показан мониторинг ВЧД.",
        actions: [
          "Мониторинг ВЧД",
          "Гиперосмолярная терапия (маннитол 1 г/кг или 3% NaCl)",
          "CPP ≥ 60 мм рт.ст."
        ]
      },
      {
        min: 4,
        max: 4,
        label: "IV",
        color: "#EF4444",
        description: "Смещение > 5 мм без крупного очага. Смертность ~ 56 %.",
        details: "Выраженный масс-эффект. Обсудить декомпрессивную гемикраниэктомию.",
        actions: [
          "Мониторинг ВЧД обязателен",
          "Декомпрессивная гемикраниэктомия при рефрактерной ВЧГ (DECRA, RESCUEicp)",
          "Гиперосмолярная терапия, седация"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "V",
        color: "#DC2626",
        description: "Очаг эвакуирован хирургически. Смертность ~ 39 %.",
        actions: [
          "Послеоперационный мониторинг ВЧД",
          "Повтор КТ через 6 ч"
        ]
      },
      {
        min: 6,
        max: 6,
        label: "VI",
        color: "#991B1B",
        description: "Очаг > 25 мл без эвакуации. Смертность ~ 52 %.",
        actions: [
          "Срочное нейрохирургическое решение об эвакуации",
          "Мониторинг ВЧД"
        ]
      }
    ],
    caveats: [
      "Marshall - простой, но груб: не учитывает тип поражения, SAH, количество очагов",
      "Rotterdam CT score (Maas 2005) точнее прогностически - 6 пунктов (цистерны, смещение, ЭДГ, tSAH/IVH)",
      "Helsinki CT и Stockholm CT - альтернативы, включают объём",
      "Marshall плохо работает при множественных очагах < 25 мл (попадает в II, но прогноз хуже)"
    ],
    related: [
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "impact",
        title: "IMPACT"
      },
      {
        id: "ich",
        title: "ICH"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Marshall LF, Marshall SB, Klauber MR et al. The diagnosis of head injury requires a classification based on computed axial tomography. J Neurotrauma 1992;9(Suppl 1):S287-S292.",
    countries: "Международный",
    info: "### Для чего используется\n**Marshall CT Classification (1991)** - классификация данных КТ при **ЧМТ** на 6 категорий (I-VI). Используется для прогноза исхода и стратификации в исследованиях.\n\n### Классы\n| Класс | КТ-характеристика | Смертность |\n|---|---|---|\n| **I** | Нет видимой патологии | 10 % |\n| **II** | Поражение < 25 мл, цистерны есть, смещение < 5 мм; могут быть мелкие хрон. очаги | 14 % |\n| **III** | Swelling: цистерны сдавлены/отсутствуют, смещение < 5 мм, нет крупного очага | 34 % |\n| **IV** | Shift: смещение > 5 мм, без крупного очага > 25 мл | 56 % |\n| **V** | Любой хирургически эвакуированный очаг | 39 % |\n| **VI** | Любой очаг > 25 мл, не эвакуированный | 52 % |\n\n### Альтернативные КТ-шкалы\n| Шкала | Компоненты | Диапазон |\n|---|---|---|\n| **Rotterdam** (Maas 2005) | Цистерны + смещение + ЭДГ (обратный) + tSAH/IVH + 1 | 1-6 |\n| **Stockholm** | Тип очага (эпи/субдурал/IVH/контузия) + tSAH + смещение | 0-10 |\n| **Helsinki** | Тип очага + размер + смещение + цистерны + DAI | 0-14 |\n| **NeuroIMAGE** | Машинное обучение на volumetrics | - |\n\n### Rotterdam CT (детальнее)\n| Параметр | Баллы |\n|---|---|\n| Цистерны: норма / сдавлены / отсутствуют | 0 / 1 / 2 |\n| Смещение: ≤ 5 / > 5 мм | 0 / 1 |\n| ЭДГ: есть / нет (NB: обратная шкала!) | 0 / 1 |\n| tSAH или IVH: нет / есть | 0 / 1 |\n| +1 (константа) | 1 |\n| **Сумма** | **1-6** |\n\n### Применение Marshall\n- Прогноз исхода (часть IMPACT модели)\n- Стратификация в клинических исследованиях\n- Решение о хирургии (классы V, VI)\n- Решение о мониторинге ВЧД (III, IV)\n\n### Показания к мониторингу ВЧД (BTF 2017)\n- GCS 3-8 с аномальной КТ (любой класс II-VI)\n- GCS 3-8 с нормальной КТ + ≥ 2 из: возраст > 40, моторный ответ на боль (деоб/разгибание), САД < 90\n\n### Терапевтические пороги\n| Параметр | Цель |\n|---|---|\n| ВЧД | < 22 мм рт.ст. |\n| CPP | 60-70 мм рт.ст. |\n| SpO₂ | ≥ 94 % |\n| PaCO₂ | 35-40 мм рт.ст. |\n| Температура | 36-37 °C |\n| Гликемия | 6-10 ммоль/л |\n\n### Лестница лечения ВЧГ\n1. Головной конец 30°, седация, анальгезия\n2. Гиперосмолярная (маннитол 0,25-1 г/кг или 3% NaCl 150-250 мл)\n3. ВЖД + дренаж CSF\n4. Гипервентиляция (PaCO₂ 30-35) - кратко\n5. Барбитуратовая кома\n6. Декомпрессивная гемикраниэктомия (DECRA / RESCUEicp)\n\n### Ограничения Marshall\n- Не учитывает множественные мелкие очаги\n- Плохо предсказывает класс I / II (большая гетерогенность)\n- Rotterdam точнее\n- Не учитывает ликвородинамику, DAI\n\n### Источник\nMarshall LF, Marshall SB, Klauber MR et al. **The diagnosis of head injury requires a classification based on computed axial tomography.** *J Neurotrauma* 1992;9(Suppl 1):S287-S292. Maas AI et al. **Prediction of outcome in traumatic brain injury with computed tomographic characteristics: a comparison between the computed tomographic classification and combinations of computed tomographic predictors.** *Neurosurgery* 2005;57:1173-1182. Carney N et al. **Guidelines for the Management of Severe Traumatic Brain Injury, 4th Edition.** *Neurosurgery* 2017;80:6-15."
  };

export default runner;
