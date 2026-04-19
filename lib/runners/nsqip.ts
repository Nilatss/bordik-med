// @ts-nocheck
/**
 * Runner: nsqip
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
    maxScore: 20,
    inputs: [
      {
        id: "age_ge_65",
        label: "Возраст ≥ 65 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "age_ge_80",
        label: "Возраст ≥ 80 лет (дополнительно)",
        type: "checkbox",
        points: 1
      },
      {
        id: "asa_ge_3",
        label: "ASA ≥ 3",
        type: "checkbox",
        points: 1
      },
      {
        id: "asa_ge_4",
        label: "ASA ≥ 4 (дополнительно)",
        type: "checkbox",
        points: 1
      },
      {
        id: "emergency",
        label: "Экстренная операция",
        type: "checkbox",
        points: 1
      },
      {
        id: "dependent",
        label: "Функциональный статус: зависимый / частично зависимый",
        type: "checkbox",
        points: 1
      },
      {
        id: "steroid",
        label: "Хроническая стероидная терапия",
        type: "checkbox",
        points: 1
      },
      {
        id: "ascites",
        label: "Асцит (30 дней до операции)",
        type: "checkbox",
        points: 1
      },
      {
        id: "sepsis",
        label: "Системный сепсис / SIRS (48 ч до операции)",
        type: "checkbox",
        points: 1
      },
      {
        id: "ventilator",
        label: "ИВЛ-зависимость",
        type: "checkbox",
        points: 1
      },
      {
        id: "dialysis",
        label: "Диализ",
        type: "checkbox",
        points: 1
      },
      {
        id: "disseminated_ca",
        label: "Диссеминированный рак",
        type: "checkbox",
        points: 1
      },
      {
        id: "copd",
        label: "Тяжёлая ХОБЛ",
        type: "checkbox",
        points: 1
      },
      {
        id: "chf_30d",
        label: "ХСН в последние 30 дней",
        type: "checkbox",
        points: 1
      },
      {
        id: "htn",
        label: "АГ на лечении",
        type: "checkbox",
        points: 1
      },
      {
        id: "dyspnea",
        label: "Одышка в покое / при незначительной нагрузке",
        type: "checkbox",
        points: 1
      },
      {
        id: "smoker",
        label: "Курение (в последний год)",
        type: "checkbox",
        points: 1
      },
      {
        id: "prior_cardiac",
        label: "Предшествующее кардиохирургическое вмешательство",
        type: "checkbox",
        points: 1
      },
      {
        id: "prior_mi",
        label: "ИМ в последние 6 месяцев",
        type: "checkbox",
        points: 1
      },
      {
        id: "diabetes_ins",
        label: "СД на инсулинотерапии",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0–2 факторов (низкий)",
        color: "#22C55E",
        description: "Низкая априорная вероятность осложнений. Ориентировочная 30-дн. смертность < 1 %."
      },
      {
        min: 3,
        max: 5,
        label: "3–5 факторов (средний)",
        color: "#F59E0B",
        description: "Умеренный риск. Ориентировочная 30-дн. смертность 1–5 %, осложнения 10–20 %.",
        details: "Для точной количественной оценки нужно вбить все 20+ переменных + CPT-код в ACS NSQIP онлайн-калькулятор (riskcalculator.facs.org).",
        actions: [
          "Ввести полный профиль в онлайн-калькулятор ACS NSQIP",
          "Сопоставить с RCRI и ASA-PS",
          "Оптимизация модифицируемых факторов (контроль СД, отказ от курения ≥ 4 нед)"
        ]
      },
      {
        min: 6,
        max: 20,
        label: "≥ 6 факторов (высокий)",
        color: "#EF4444",
        description: "Высокий риск. Ориентировочная 30-дн. смертность > 5 %, осложнения > 30 %.",
        details: "Сочетание множества факторов — обязательна предоперационная оптимизация и обсуждение альтернатив. Точный прогноз — в онлайн-калькуляторе ACS NSQIP с CPT-кодом вмешательства.",
        actions: [
          "Мультидисциплинарный консилиум",
          "Планирование ОРИТ после операции",
          "Оптимизация анемии, волемии, нутриционного статуса",
          "Обсуждение \"prehabilitation\" (4–6 нед физической подготовки)",
          "Информированное согласие с детальной калькуляцией в ACS NSQIP"
        ]
      }
    ],
    caveats: [
      "Это — УПРОЩЁННЫЙ скрининг; точный расчёт % риска требует онлайн-калькулятора ACS NSQIP с CPT-кодом",
      "Оригинальная модель использует > 20 переменных + специфику операции, а не сумму факторов",
      "Разработана в США (2007–2012) — региональная калибровка в России/СНГ не валидирована",
      "Не заменяет клиническое суждение и обсуждение с пациентом"
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    related: [
      {
        id: "asa-ps",
        title: "ASA-PS"
      },
      {
        id: "rcri",
        title: "RCRI"
      },
      {
        id: "possum",
        title: "POSSUM"
      }
    ],
    reference: "Bilimoria KY et al. J Am Coll Surg 2013; 217:833–842. Онлайн: riskcalculator.facs.org",
    info: "### Для чего используется\n**ACS NSQIP Surgical Risk Calculator** — универсальный прогностический инструмент для оценки **30-дневной смертности, серьёзных осложнений, специфических событий и повторной госпитализации** при большинстве плановых и экстренных операций.\n\nОснован на > 1,4 млн операций из National Surgical Quality Improvement Program (США).\n\n### Компоненты (оригинал)\n20 + 1 = 21 предоперационная переменная:\n- **Демография:** возраст, пол, рост, вес\n- **Коморбидность:** ASA-класс, функциональный статус, стероиды, асцит, сепсис, ИВЛ-зависимость, диализ, диссеминированный рак, ХОБЛ, ХСН, АГ, одышка, курение, кардиохирургия в анамнезе, ИМ < 6 мес, СД на инсулине\n- **Оперативное:** CPT-код процедуры, экстренная/плановая\n\n### Что прогнозирует\n| Исход | Определение |\n|---|---|\n| Смертность | 30-дн. |\n| Serious complication | Cardiac arrest, ИМ, пневмония, ПЭ, ОПН, СМС, возврат в ОР, глубокая SSI, сепсис |\n| Любое осложнение | Включая поверхностную SSI, UTI, DVT |\n| Пневмония | Послеоперационная |\n| Сердечный инцидент | ИМ / остановка |\n| SSI | Surgical site infection |\n| UTI | Мочевая инфекция |\n| VTE | Тромбоз глубоких вен / ПЭ |\n| Повторная операция | В течение 30 дн. |\n| Повторная госпитализация | В течение 30 дн. |\n\n### Этот упрощённый runner\nПодсчитывает **число факторов риска**. Это **скрининг**, а не замена калькулятору. Для точных процентов:\n\n1. Откройте **[riskcalculator.facs.org](https://riskcalculator.facs.org)**\n2. Введите CPT-код процедуры\n3. Заполните все 20 переменных\n4. Получите процент риска по каждому исходу + «Risk vs. Average»\n\n### Валидация\n- C-statistic 0,82–0,94 в зависимости от исхода\n- Калибровка Hosmer-Lemeshow p > 0,05 для большинства исходов\n- Валидирована в ряде неамериканских когорт (Европа, Азия) с умеренной коррекцией\n\n### Surgeon Adjustment\nВ калькуляторе есть поле «Surgeon Adjustment» — хирург может сдвинуть прогноз на 1–3 уровня вверх, если считает пациента нестандартным.\n\n### Ограничения\n- Не включает специфические тесты (ФВ, NT-proBNP)\n- Калибрация смещается при редких операциях\n- Не учитывает госпитальные факторы (объём центра)\n- Точность ниже при экзотических сочетаниях (напр., трансплантация + сепсис)\n\n### Источник\nBilimoria KY, Liu Y, Paruch JL et al. Development and evaluation of the universal ACS NSQIP surgical risk calculator. *J Am Coll Surg* 2013; 217(5):833–842.e3."
  };

export default runner;
