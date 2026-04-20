// @ts-nocheck
/**
 * Runner: wilkins
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
    inputs: [
      {
        id: "mobility",
        label: "Подвижность створок",
        type: "select",
        options: [
          {
            value: 1,
            label: "1 - высокоподвижные, ограничены только кончики",
            points: 1
          },
          {
            value: 2,
            label: "2 - нормальная подвижность основания и середины",
            points: 2
          },
          {
            value: 3,
            label: "3 - вперёд движется преимущественно основание",
            points: 3
          },
          {
            value: 4,
            label: "4 - минимальная подвижность, почти неподвижны",
            points: 4
          }
        ]
      },
      {
        id: "thickening",
        label: "Утолщение створок",
        type: "select",
        options: [
          {
            value: 1,
            label: "1 - почти нормальное (4-5 мм)",
            points: 1
          },
          {
            value: 2,
            label: "2 - умеренное (5-8 мм), преимущественно края",
            points: 2
          },
          {
            value: 3,
            label: "3 - утолщение всей створки (5-8 мм)",
            points: 3
          },
          {
            value: 4,
            label: "4 - значительное утолщение всей створки (> 8-10 мм)",
            points: 4
          }
        ]
      },
      {
        id: "subvalvular",
        label: "Субвальвулярное утолщение",
        type: "select",
        options: [
          {
            value: 1,
            label: "1 - минимальное ограниченное участком хорд",
            points: 1
          },
          {
            value: 2,
            label: "2 - до 1/3 длины хорд",
            points: 2
          },
          {
            value: 3,
            label: "3 - до дистальной трети хорд",
            points: 3
          },
          {
            value: 4,
            label: "4 - обширное до папиллярных мышц",
            points: 4
          }
        ]
      },
      {
        id: "calcification",
        label: "Кальцификация",
        type: "select",
        options: [
          {
            value: 1,
            label: "1 - единичный очаг повышенной эхогенности",
            points: 1
          },
          {
            value: 2,
            label: "2 - разрозненные участки по краям",
            points: 2
          },
          {
            value: 3,
            label: "3 - распространение до середины створок",
            points: 3
          },
          {
            value: 4,
            label: "4 - обширная кальцификация всей створки",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 4,
        max: 8,
        label: "≤ 8 баллов",
        color: "#22C55E",
        description: "Благоприятная анатомия - чрескожная митральная баллонная вальвулопластика (PMBV) показана.",
        details: "Высокая вероятность успеха (> 80 %) при отсутствии митральной регургитации > 2/4, тромба ЛП, комиссуральной кальцификации. Оптимальный выбор у молодых пациентов без кальциноза.",
        actions: [
          "Чрескожная митральная баллонная вальвулопластика (Inoue balloon)",
          "ЧП-ЭхоКГ для исключения тромба ЛП",
          "Оценить комиссуральную кальцификацию (Cormier score)"
        ]
      },
      {
        min: 9,
        max: 11,
        label: "9-11 баллов",
        color: "#F59E0B",
        description: "Промежуточный - PMBV возможна, но результат менее предсказуем.",
        details: "Индивидуальное решение Heart Team: учесть возраст, сопутствующие заболевания, хирургический риск (EuroSCORE II). При значимой МР или комиссуральной кальцификации - предпочтительна хирургия.",
        actions: [
          "Heart Team",
          "Оценить EuroSCORE II / STS",
          "PMBV при отсутствии противопоказаний / высоком операционном риске",
          "Альтернатива - хирургическая комиссуротомия / протезирование"
        ]
      },
      {
        min: 12,
        max: 16,
        label: "≥ 12 баллов",
        color: "#EF4444",
        description: "Неблагоприятная анатомия - хирургия (протезирование) предпочтительна.",
        details: "Высокий риск осложнений PMBV (МР, неполное раскрытие). Показано хирургическое лечение - протезирование митрального клапана (механический / биопротез).",
        actions: [
          "Протезирование митрального клапана",
          "Heart Team - выбор протеза (возраст, ожидаемая продолжительность жизни)",
          "Оценить хирургический риск (EuroSCORE II, STS)"
        ]
      }
    ],
    maxScore: 16,
    reference: "Wilkins GT, Weyman AE, Abascal VM, Block PC, Palacios IF. Percutaneous balloon dilatation of the mitral valve: an analysis of echocardiographic variables related to outcome and the mechanism of dilatation. Br Heart J 1988;60:299-308.",
    countries: "Международный (ESC · AHA · ACC)",
    caveats: [
      "Wilkins score не оценивает комиссуральную кальцификацию - используйте Cormier classification / Padial score (для прогноза МР после PMBV).",
      "Противопоказания к PMBV независимо от Wilkins: МР ≥ 2/4, тромб ЛП, двухкомиссуральная кальцификация, сопутствующий тяжёлый АК-стеноз / АКШ.",
      "У пожилых кальцификация доминирует - Wilkins может недооценивать риск.",
      "Операторная кривая обучения: результаты зависят от опыта центра."
    ],
    related: [
      {
        id: "duke",
        title: "Duke Criteria (ИЭ)"
      },
      {
        id: "euroscore",
        title: "EuroSCORE II"
      },
      {
        id: "nyha",
        title: "NYHA"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    info: "### Для чего используется\n**Wilkins score** (1988) - эхокардиографическая шкала пригодности митрального клапана для **чрескожной митральной баллонной вальвулопластики (PMBV)** при ревматическом митральном стенозе.\n\n### Критерии (4 × 1-4)\n| Параметр | 1 | 4 |\n|---|---|---|\n| Подвижность створок | Почти нормальная | Почти неподвижны |\n| Утолщение створок | 4-5 мм | > 8-10 мм |\n| Субвальвулярное утолщение | Минимальное | До папиллярных мышц |\n| Кальцификация | Единичный очаг | Обширная всей створки |\n\nСумма 4-16.\n\n### Интерпретация\n| Балл | Пригодность | Тактика |\n|---|---|---|\n| ≤ 8 | Благоприятная | **PMBV показана**, успех > 80 % |\n| 9-11 | Промежуточная | Heart Team - PMBV возможна |\n| ≥ 12 | Неблагоприятная | **Хирургия** (протезирование) |\n\n### Альтернативы\n- **Cormier classification** - учитывает кальцификацию и подвижность (группа 1-3).\n- **Padial score** - прогноз МР ≥ 3/4 после PMBV (≥ 10 - плохой прогноз).\n- **Echo score 2007 (Reid)** - модификация с учётом комиссур.\n\n### Ограничения\n- Не учитывает комиссуральную кальцификацию - ключевой фактор МР после PMBV.\n- У пожилых с дегенеративным кальцинозом Wilkins недооценивает тяжесть.\n- МР ≥ 2/4, тромб ЛП - абсолютные противопоказания к PMBV независимо от Wilkins.\n\n### Тактика\n- ≤ 8 + нет противопоказаний → PMBV (Inoue баллон).\n- 9-11 → Heart Team, индивидуальное решение.\n- ≥ 12 → хирургическое протезирование.\n\n### Источник\nWilkins GT, Weyman AE, Abascal VM, Block PC, Palacios IF. **Percutaneous balloon dilatation of the mitral valve: an analysis of echocardiographic variables related to outcome and the mechanism of dilatation.** *Br Heart J* 1988;60:299-308. ESC/EACTS 2021 Valvular Guidelines."
  };

export default runner;
