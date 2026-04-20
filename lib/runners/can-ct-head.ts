// @ts-nocheck
/**
 * Runner: can-ct-head
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
    maxScore: 7,
    inputs: [
      {
        id: "gcs",
        label: "GCS <15 через 2 ч после травмы",
        type: "checkbox",
        points: 1
      },
      {
        id: "skull_open",
        label: "Подозрение на открытый/вдавленный перелом черепа",
        type: "checkbox",
        points: 1
      },
      {
        id: "skull_base",
        label: "Признаки перелома основания черепа (гемотимпанум, глаза енота, Battle, лик.)",
        type: "checkbox",
        points: 1
      },
      {
        id: "vomit",
        label: "Рвота ≥2 раз",
        type: "checkbox",
        points: 1
      },
      {
        id: "age65",
        label: "Возраст ≥65 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "amnesia",
        label: "Ретроградная амнезия >30 мин",
        type: "checkbox",
        points: 1
      },
      {
        id: "mechanism",
        label: "Опасный механизм (ДТП пешеход/велосипед, падение с высоты >1 м / 5 ступеней)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "Нет критериев",
        color: "#22C55E",
        description: "КТ не показана. Чувствительность ~100% для клинически значимых ЧМТ."
      },
      {
        min: 1,
        max: 7,
        label: "≥1 критерий",
        color: "#EF4444",
        description: "Показана КТ головы."
      }
    ],
    caveats: [
      "Только для взрослых ≥ 16 лет с GCS 13-15",
      "Не применять при антикоагуляции, нарушении свёртывания, судорогах после травмы, очаговом дефиците",
      "Педиатрический аналог - PECARN rule",
      "Альтернатива: New Orleans criteria (меньше специфичность)"
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    related: [
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "ottawa-ankle",
        title: "Ottawa Ankle"
      }
    ],
    reference: "Stiell 2001. Для пациентов 16+ лет с ЧМТ и GCS 13-15.",
    countries: "Канада · Международный",
    info: "### Для чего используется\n**Canadian CT Head Rule (Stiell 2001)** - клинические критерии для решения о **необходимости КТ головы** у взрослых (≥ 16 лет) с лёгкой ЧМТ и GCS 13-15. Валидизирована на > 4000 пациентов.\n\n### Применимость\nИспользуется ТОЛЬКО при:\n- GCS 13-15 в момент оценки (после травмы)\n- Травма ≤ 24 ч\n- Возраст ≥ 16 лет\n- Потеря сознания, амнезия или дезориентация при травме\n\n### Показания к КТ (любой из критериев)\n#### High-risk (требуется КТ для исключения хирургической патологии):\n| Критерий |\n|---|\n| GCS < 15 через 2 часа после травмы |\n| Подозрение на открытый или импрессионный перелом черепа |\n| Признаки перелома основания (отоликворея, ринорея, гемотимпанум, «очки» гематомы) |\n| Рвота ≥ 2 раз |\n| Возраст ≥ 65 лет |\n\n#### Medium-risk (КТ для исключения любой черепно-мозговой травмы):\n| Критерий |\n|---|\n| Амнезия событий до травмы ≥ 30 мин |\n| Опасный механизм травмы (пешеход сбит автомобилем, падение с высоты ≥ 1 м / 5 ступеней) |\n\n### Если критериев НЕТ\n- КТ **не требуется**\n- Наблюдение клиническое\n- Выписка при сохранении GCS 15, нет прогрессирующих симптомов\n\n### Чувствительность\n- 100 % для клинически значимой травмы (требующей нейрохирургической коррекции)\n- 87 % для любой травмы на КТ\n\n### Альтернативы\n| Правило | Страна / особенность |\n|---|---|\n| **New Orleans Criteria** | США, более чувствительная, но менее специфична |\n| **NICE CG176** | Британские рекомендации |\n| **CHIP Rule** | Нидерланды |\n| **Scandinavian NHS** | Европейские |\n\n### У детей используйте\n| Правило | Возраст |\n|---|---|\n| **PECARN head injury** | < 2 и ≥ 2 лет |\n| **CATCH** | 0-16 лет |\n| **CHALICE** | 0-16 лет |\n\n### Симптомы для наблюдения после отрицательной КТ\n- Ухудшение сознания\n- Повторная рвота\n- Нарастающая головная боль\n- Судороги\n- Нарушения зрения, речи, движения"
  };

export default runner;
