// @ts-nocheck
/**
 * Runner: spetzler
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
        id: "size",
        label: "Размер AVM",
        type: "select",
        options: [
          {
            value: "1",
            label: "< 3 см (малый)",
            points: 1
          },
          {
            value: "2",
            label: "3–6 см (средний)",
            points: 2
          },
          {
            value: "3",
            label: "> 6 см (большой)",
            points: 3
          }
        ]
      },
      {
        id: "eloquent",
        label: "Элоквентная зона рядом",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет (неэлоквентная)",
            points: 0
          },
          {
            value: "1",
            label: "Да (сенсомотор., речевая, зрит., гипоталамус, таламус, внутр. капсула, ствол, мозжечковые ядра)",
            points: 1
          }
        ]
      },
      {
        id: "venous",
        label: "Венозный дренаж",
        type: "select",
        options: [
          {
            value: "0",
            label: "Только поверхностный",
            points: 0
          },
          {
            value: "1",
            label: "Глубокий (любая глубокая вена)",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "Grade I",
        color: "#22C55E",
        description: "Низкий хирургический риск",
        details: "Малая AVM, неэлоквентная, поверхностный дренаж. Хирургия — метод выбора; риск стойкого неврологического дефицита < 1 %.",
        actions: [
          "Микрохирургическая резекция",
          "Альтернатива: радиохирургия (Gamma Knife) при < 3 см"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "Grade II",
        color: "#86EFAC",
        description: "Низкий хирургический риск",
        details: "Стойкий неврологический дефицит ≈ 5 % после хирургии.",
        actions: [
          "Микрохирургическая резекция (первая линия)",
          "Радиохирургия при < 3 см или труднодоступной локализации"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "Grade III",
        color: "#F59E0B",
        description: "Умеренный хирургический риск",
        details: "Стойкий неврологический дефицит ≈ 15 %. Решение по подтипу (III− vs III+) и анатомии.",
        actions: [
          "Мультидисциплинарный консилиум",
          "Комбинированная стратегия: эмболизация (Onyx) → хирургия / радиохирургия",
          "Радиохирургия при малом диаметре (< 3 см)"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "Grade IV",
        color: "#EF4444",
        description: "Высокий хирургический риск",
        details: "Стойкий неврологический дефицит 20–30 %. Чаще — наблюдение или ARUBA-стратегия.",
        actions: [
          "Консервативное ведение (ARUBA 2014: при неразорвавшейся AVM консерватив. лучше, чем интервенционное)",
          "Хирургия только при разрыве или нарастающей симптоматике",
          "Мультимодальный подход (эмболизация + радиохирургия + хирургия)"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "Grade V",
        color: "#991B1B",
        description: "Очень высокий хирургический риск",
        details: "Стойкий неврологический дефицит ≥ 30 %. Хирургия обычно не показана.",
        actions: [
          "Консервативное ведение",
          "Симптоматическая терапия (противоэпилептическая, обезболивание)",
          "Хирургия только при разрыве с нарастанием"
        ]
      }
    ],
    reference: "Spetzler RF, Martin NA. A proposed grading system for arteriovenous malformations. J Neurosurg 1986;65:476–483.",
    countries: "Международный",
    caveats: [
      "Grade оценивается по катетер-ангиографии (золотой стандарт), дополняется МРТ/МРА",
      "Spetzler-Ponce (2011) — упрощение: A = I–II, B = III, C = IV–V",
      "ARUBA (Lancet 2014) показал преимущество консервативного ведения при неразорвавшейся AVM",
      "Supplementary Spetzler-Martin (Lawton 2010) добавляет возраст, кровоизлияние, компактность",
      "AVM-риск кровоизлияния ~ 2–4 % в год; растёт при предыдущем разрыве, глубокой локализации, глубоком дренаже"
    ],
    related: [
      {
        id: "hunt-hess",
        title: "Hunt-Hess"
      },
      {
        id: "wfns",
        title: "WFNS"
      },
      {
        id: "ich",
        title: "ICH score"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    info: "### Для чего используется\n**Spetzler-Martin Grading (1986)** — стандарт **оценки операбельности церебральных AVM**. Балл 1–5 предсказывает риск стойкого неврологического дефицита после хирургии.\n\n### Критерии\n| Параметр | Варианты | Баллы |\n|---|---|---|\n| **Размер** | < 3 см | 1 |\n|  | 3–6 см | 2 |\n|  | > 6 см | 3 |\n| **Элоквентная зона** | Нет | 0 |\n|  | Да | 1 |\n| **Венозный дренаж** | Только поверхностный | 0 |\n|  | Глубокий (любая вена) | 1 |\n\nИтого: **1–5**.\n\n### Элоквентные зоны\n- Сенсомоторная кора\n- Зрительная кора и зрительная радиация\n- Речевые зоны (Брока, Вернике)\n- Гипоталамус, таламус\n- Внутренняя капсула\n- Ствол мозга\n- Ножки мозжечка, глубокие мозжечковые ядра\n\n### Риск стойкого дефицита\n| Grade | Риск |\n|---|---|\n| I | ~ 0–1 % |\n| II | ~ 5 % |\n| III | ~ 15 % |\n| IV | ~ 20–30 % |\n| V | ~ 30–50 % |\n\n### Spetzler-Ponce упрощение (2011)\n| Класс | Spetzler-Martin |\n|---|---|\n| **A** | Grade I–II |\n| **B** | Grade III |\n| **C** | Grade IV–V |\n\nИспользуется клинически для упрощения решений.\n\n### Supplementary Spetzler-Martin (Lawton 2010)\nДобавляет:\n- Возраст (< 20, 20–40, > 40 — 1/2/3)\n- Кровоизлияние в анамнезе (0/1)\n- Компактность (diffuse 1, compact 0)\nМаксимум +5; лучше предсказывает исход, чем классика.\n\n### ARUBA trial (Lancet 2014)\nРандомизация: консервативное vs интервенционное при **неразорвавшейся AVM**. Интервенция имела **в 3 раза больше** инсультов/смертей за 33 мес. → при неразорвавшейся AVM — **наблюдение** остаётся предпочтительной тактикой в большинстве случаев.\n\n### Лечебные опции\n- **Микрохирургическая резекция** — I–II подходят; полная облитерация\n- **Стереотаксическая радиохирургия (Gamma Knife)** — малые (< 3 см), глубокие; облитерация 60–80 % за 2–3 года\n- **Эндоваскулярная эмболизация (Onyx)** — адъювант (редко кюративна); уменьшает размер перед хирургией/радио\n- **Комбинированная** — Grade III\n\n### Естественная история\n- Разрыв ~ 2–4 % в год\n- Смертность при разрыве 10 %; инвалидизация 30–50 %\n- Факторы риска: предыдущий разрыв, глубокая локализация, глубокий венозный дренаж, ассоциированная аневризма\n\n### Источник\nSpetzler RF, Martin NA. **A proposed grading system for arteriovenous malformations.** *J Neurosurg* 1986;65:476–483.\nSpetzler RF, Ponce FA. **A 3-tier classification of cerebral AVMs.** *J Neurosurg* 2011;114:842–849.\nMohr JP et al. **ARUBA: Medical management with or without interventional therapy for unruptured brain arteriovenous malformations.** *Lancet* 2014;383:614–621."
  };

export default runner;
