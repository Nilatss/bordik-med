/**
 * Runner: westley
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
    maxScore: 17,
    inputs: [
      {
        id: "stridor",
        label: "Инспираторный стридор",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "При возбуждении",
            points: 1
          },
          {
            value: "2",
            label: "В покое",
            points: 2
          }
        ]
      },
      {
        id: "retraction",
        label: "Ретракция",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "1",
            label: "Лёгкая",
            points: 1
          },
          {
            value: "2",
            label: "Умеренная",
            points: 2
          },
          {
            value: "3",
            label: "Выраженная",
            points: 3
          }
        ]
      },
      {
        id: "air",
        label: "Проведение воздуха",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нормальное",
            points: 0
          },
          {
            value: "1",
            label: "Снижено",
            points: 1
          },
          {
            value: "2",
            label: "Резко снижено",
            points: 2
          }
        ]
      },
      {
        id: "cyanosis",
        label: "Цианоз",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет",
            points: 0
          },
          {
            value: "4",
            label: "При возбуждении",
            points: 4
          },
          {
            value: "5",
            label: "В покое",
            points: 5
          }
        ]
      },
      {
        id: "consciousness",
        label: "Сознание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма",
            points: 0
          },
          {
            value: "5",
            label: "Нарушено",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "≤2 (лёгкий)",
        color: "#22C55E",
        description: "Лёгкий круп. Дексаметазон PO."
      },
      {
        min: 3,
        max: 5,
        label: "3-5 (умеренный)",
        color: "#F59E0B",
        description: "Умеренный. Дексаметазон + небулайзер адреналина."
      },
      {
        min: 6,
        max: 11,
        label: "6-11 (тяжёлый)",
        color: "#EF4444",
        description: "Тяжёлый. Адреналин + стероиды + госпитализация."
      },
      {
        min: 12,
        max: 17,
        label: "≥12 (критический)",
        color: "#991B1B",
        description: "Критический. Интенсивная терапия.",
        details: "Угроза дыхательной недостаточности. Требуется анестезиолог/ЛОР, готовность к интубации в контролируемых условиях.",
        actions: [
          "Небулайзер адреналина (эпинефрин 1:1000, 0,5 мл/кг)",
          "Дексаметазон 0,6 мг/кг однократно",
          "Кислород, мониторинг SpO₂",
          "Интубация трубкой на 0,5-1 размера меньше возрастной нормы"
        ]
      }
    ],
    caveats: [
      "Оценка педиатрическая (6 мес - 6 лет)",
      "Не использовать для эпиглоттита - другая патология (острая дыхательная недостаточность)",
      "Стридор в покое = минимум умеренный круп, независимо от суммы"
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      }
    ],
    related: [
      {
        id: "silverman",
        title: "Silverman-Anderson"
      },
      {
        id: "apgar",
        title: "Apgar"
      }
    ],
    reference: "Westley 1978. Оценка тяжести крупа у детей.",
    info: "### Для чего используется\n**Westley Croup Score (1978)** - клиническая оценка тяжести **крупа (ларинготрахеобронхита)** у детей. Используется для выбора тактики: амбулаторно vs стационар, дозы глюкокортикоидов, необходимость адреналина.\n\n### Интерпретация\n| Баллы | Тяжесть | Тактика |\n|---|---|---|\n| 0-2 | Лёгкий | Амбулаторно + дексаметазон 0,15-0,6 мг/кг per os |\n| 3-5 | Умеренный | Дексаметазон + небулайзер эпинефрин; наблюдение 3-4 ч |\n| 6-11 | Тяжёлый | Госпитализация; повторный эпинефрин; ICU при необходимости |\n| ≥ 12 | Жизнеугрожающий | ICU; интубация готовность |\n\n### Лечение крупа (NICE, AAP)\n| Тяжесть | Препарат | Доза |\n|---|---|---|\n| Любая | Дексаметазон | 0,15-0,6 мг/кг per os / в/м (однократно) |\n| Умеренный / тяжёлый | Адреналин небулайзер | L-эпинефрин 0,5 мл/кг (макс 5 мл) 1:1000 или рацемический 0,05 мл/кг |\n| Тяжёлый | О₂ | По сатурации |\n| Рефрактерный | Интубация | Труба на 1 размер меньше стандартной |\n\n### Дифф. диагноз\n| Заболевание | Ключевое отличие |\n|---|---|\n| **Эпиглоттит** | Сиделка, слюнотечение, токсический вид (H. influenzae - редок после вакцинации) |\n| **Бактериальный трахеит** | Более тяжёлый, гнойная мокрота |\n| **Инородное тело** | Внезапное начало, одностороннее свистящее дыхание |\n| **Ретрофарингеальный абсцесс** | Рото-шейная ригидность |\n\n### Этиология крупа\n| Возбудитель | Частота |\n|---|---|\n| Parainfluenza 1-3 | 75 % случаев |\n| RSV | Реже |\n| Adenovirus, influenza | Реже |\n\n### Возрастной пик\n6 мес - 3 года (пик 2 года). Вне этого возраста - рассмотреть альтернативный диагноз.\n\n### Ограничения\n- Субъективна (стридор, втяжения)\n- Не учитывает SpO₂\n- Не валидизирована для взрослых"
  };

export default runner;
