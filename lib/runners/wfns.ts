// @ts-nocheck
/**
 * Runner: wfns
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
    maxScore: 5,
    inputs: [
      {
        id: "grade",
        label: "Степень WFNS",
        type: "select",
        options: [
          {
            value: "1",
            label: "I — GCS 15, без дефицита",
            points: 1
          },
          {
            value: "2",
            label: "II — GCS 13–14, без дефицита",
            points: 2
          },
          {
            value: "3",
            label: "III — GCS 13–14, с дефицитом",
            points: 3
          },
          {
            value: "4",
            label: "IV — GCS 7–12",
            points: 4
          },
          {
            value: "5",
            label: "V — GCS 3–6",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 2,
        label: "I–II",
        color: "#22C55E",
        description: "Хороший прогноз."
      },
      {
        min: 3,
        max: 3,
        label: "III",
        color: "#F59E0B",
        description: "Умеренный."
      },
      {
        min: 4,
        max: 5,
        label: "IV–V",
        color: "#EF4444",
        description: "Плохой прогноз."
      }
    ],
    caveats: [
      "Оценивается после стабилизации и обратимых причин (гидроцефалия)",
      "Модифицированная WFNS лучше прогнозирует исход",
      "Не заменяет анатомическую оценку (Fisher / mFisher / HIJDRA)"
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    related: [
      {
        id: "hunt-hess",
        title: "Hunt & Hess"
      },
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "ich",
        title: "ICH"
      }
    ],
    reference: "WFNS 1988. Основано на GCS + моторный дефицит.",
    info: "### Для чего используется\n**WFNS (World Federation of Neurological Surgeons, 1988)** — современная шкала стадирования **субарахноидального кровоизлияния**, основанная на **GCS** и моторном дефиците. Более объективна, чем Hunt-Hess.\n\n### Стадии\n| WFNS | GCS | Моторный дефицит | Смертность |\n|---|---|---|---|\n| **I** | 15 | Нет | 5–10 % |\n| **II** | 13–14 | Нет | 10–20 % |\n| **III** | 13–14 | Есть | 20–30 % |\n| **IV** | 7–12 | Неважно | 40–70 % |\n| **V** | 3–6 | Неважно | > 70 % |\n\n### Преимущества перед Hunt-Hess\n| Параметр | Hunt-Hess | WFNS |\n|---|---|---|\n| Субъективность | Высокая | Низкая (GCS — объективна) |\n| Использование | Классическая | Современный международный стандарт |\n| Валидация | Ограничена | В крупных RCT |\n\n### Применение\n| Баллы | Тактика |\n|---|---|\n| WFNS I–III | Ранняя хирургия / эндоваскулярное закрытие аневризмы (< 24 ч — goto policy) |\n| WFNS IV–V | Стабилизация; закрытие аневризмы при улучшении; индивидуальный подход |\n\n### Дополнительные шкалы для САК\n| Шкала | Оценивает |\n|---|---|\n| **Modified Fisher** | Объём крови на КТ → риск вазоспазма |\n| **BNI (Barrow Neurological Institute)** | Альтернатива, объёмная КТ |\n| **PAASH** | Упрощённая, 5 категорий по GCS |\n\n### PAASH (Prognosis on Admission Aneurysmal SAH)\n| Класс | GCS | Плохой исход 3 мес |\n|---|---|---|\n| I | 15 | 14,8 % |\n| II | 11–14 | 41 % |\n| III | 8–10 | 74 % |\n| IV | 4–7 | 84,7 % |\n| V | 3 | 93,9 % |\n\n### Modified Fisher (по КТ)\n| Класс | Кровь в САП | Внутрижелудочковая |\n|---|---|---|\n| 0 | Нет | Нет |\n| 1 | Тонкий слой | Нет |\n| 2 | Тонкий слой | Есть |\n| 3 | Плотный слой | Нет |\n| 4 | Плотный слой | Есть |\n\n→ ↑ класс = ↑ риск вазоспазма.\n\n### Современные рекомендации по САК (ESO, AHA)\n- Закрытие аневризмы в первые 24 ч (goto policy)\n- Эндоваскулярная окклюзия (coiling) предпочтительнее клипирования при возможности (ISAT)\n- Нимодипин 60 мг × 6 р/сут × 21 день\n- Избегать гипотензии, обезвоживания\n- TCD-мониторинг вазоспазма"
  };

export default runner;
