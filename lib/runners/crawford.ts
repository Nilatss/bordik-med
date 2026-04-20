// @ts-nocheck
/**
 * Runner: crawford
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
        id: "type",
        label: "Тип Crawford",
        type: "select",
        options: [
          {
            value: 1,
            label: "Тип I - от левой подключичной до выше почечных артерий",
            points: 1
          },
          {
            value: 2,
            label: "Тип II - от левой подключичной до бифуркации аорты",
            points: 2
          },
          {
            value: 3,
            label: "Тип III - средняя нисходящая до бифуркации",
            points: 3
          },
          {
            value: 4,
            label: "Тип IV - инфрадиафрагмальная (включая висцеральные + инфраренальная)",
            points: 4
          },
          {
            value: 5,
            label: "Тип V (Safi) - дистальная нисходящая до ниже чревного ствола",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "Тип I",
        color: "#F59E0B",
        description: "Левая подключичная → выше почечных. Умеренный оперативный риск.",
        details: "Включает грудной отдел и верхнюю часть брюшной аорты выше почек. Риск параплегии ~ 5-10 %. Открытая хирургия с CSF-дренажем, моторными потенциалами, дистальной перфузией. TEVAR / FEVAR при благоприятной анатомии.",
        actions: [
          "Открытая хирургия с нейропротекцией (CSF drainage, MEP/SSEP, дистальная перфузия)",
          "Альтернатива - Thoracic EVAR (TEVAR) или FEVAR",
          "ОРИТ, контроль перфузии спинного мозга (MAP > 90, Hb > 100)"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "Тип II",
        color: "#991B1B",
        description: "Самый обширный: левая подключичная → бифуркация. Максимальный риск.",
        details: "Вся грудная + вся брюшная аорта. Наибольший риск параплегии (15-25 % без нейропротекции), ОПН, мезентериальной ишемии. Требует центров высокого объёма с мультидисциплинарной командой.",
        actions: [
          "Центр высокого объёма (> 30 ТААА/год)",
          "Open repair с полной нейропротекцией (CSF drain, MEP, moderate hypothermia, reimplantation of intercostals T8-L1)",
          "Альтернатива - гибридные / fenestrated + branched endografts",
          "Длительное ОРИТ наблюдение (параплегия, ОПН, кишечная ишемия)"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "Тип III",
        color: "#EF4444",
        description: "Средняя нисходящая → бифуркация.",
        details: "От Т6 до бифуркации. Риск параплегии ниже, чем у типа II, но ОПН и мезентериальная ишемия частые. Реимплантация межрёберных артерий Т8-L1.",
        actions: [
          "Open repair / гибрид / FEVAR+BEVAR",
          "Нейропротекция: CSF drain, MEP, reimplantation ≥ 1 пары межрёберных Т8-L1",
          "Реимплантация висцеральных артерий (Coselli или бранчи)"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "Тип IV",
        color: "#F59E0B",
        description: "Инфрадиафрагмальная (висцеральные + инфраренальная).",
        details: "От диафрагмы до бифуркации. Риск параплегии 2-5 % (без грудного сегмента). Основные риски - ОПН и мезентериальная ишемия. Часто - открытая хирургия с реимплантацией висцеральных ветвей или BEVAR.",
        actions: [
          "Open repair (левая торакоабдоминальная инцизия)",
          "Реимплантация чревного, SMA, обеих почечных (Coselli)",
          "Альтернатива - branched EVAR (BEVAR) при подходящей анатомии"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "Тип V (Safi)",
        color: "#EF4444",
        description: "Дистальная нисходящая → ниже чревного ствола. Модификация Safi.",
        details: "Ограниченный торакоабдоминальный сегмент. Риск параплегии ниже типа I-III. TEVAR с фенестрацией для чревного ствола или гибридный подход.",
        actions: [
          "TEVAR с фенестрацией / chimney",
          "Open repair при несоответствующей анатомии для эндоваскулярного подхода",
          "Нейропротекция при обширном покрытии грудной аорты"
        ]
      }
    ],
    maxScore: 5,
    reference: "Crawford ES, Crawford JL, Safi HJ, Coselli JS, Hess KR, Brooks B, Norton HJ, Glaeser DH. Thoracoabdominal aortic aneurysms: preoperative and intraoperative factors determining immediate and long-term results of operations in 605 patients. J Vasc Surg 1986;3:389-404. Safi HJ, Miller CC 3rd. Spinal cord protection in descending thoracic and thoracoabdominal aortic repair. Ann Thorac Surg 1999;67:1937-1939.",
    countries: "Международный (ESVS · SVS · ESC 2024)",
    caveats: [
      "Тип II - максимальный оперативный риск (смертность 5-15 %, параплегия 15-25 % без нейропротекции).",
      "Тип V - модификация Safi, не во всех источниках; иногда описывается как \"дистальная торакальная + проксимальная абдоминальная\".",
      "Современные гибридные и эндоваскулярные подходы (FEVAR, BEVAR, chimney) снижают периоперационную смертность у пожилых и пациентов высокого риска.",
      "Нейропротекция (CSF drainage, MEP, дистальная перфузия, реимплантация межрёберных Т8-L1) - стандарт для типов I-III."
    ],
    related: [
      {
        id: "stanford",
        title: "Stanford / DeBakey"
      },
      {
        id: "abi",
        title: "ABI"
      },
      {
        id: "euroscore",
        title: "EuroSCORE II"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    info: "### Для чего используется\n**Crawford classification** (1986) - анатомическая классификация **торакоабдоминальных аневризм аорты (ТААА)** для планирования хирургического лечения, прогноза параплегии, ОПН, мезентериальной ишемии.\n\n### Типы\n| Тип | Протяжённость |\n|---|---|\n| **I** | Левая подключичная → выше почечных артерий |\n| **II** | Левая подключичная → бифуркация (самая обширная) |\n| **III** | Средняя нисходящая (Т6) → бифуркация |\n| **IV** | Инфрадиафрагмальная (висцеральные + инфраренальная) |\n| **V** (Safi) | Дистальная нисходящая → ниже чревного ствола |\n\n### Риски открытой хирургии\n| Тип | Параплегия | ОПН | Смертность |\n|---|---|---|---|\n| I | 5-10 % | 5 % | 5-10 % |\n| **II** | **15-25 %** | 10 % | 10-15 % |\n| III | 5-10 % | 5-10 % | 5-10 % |\n| IV | 2-5 % | 10-15 % | 5-10 % |\n| V | 3-7 % | 5 % | 5-10 % |\n\nЦифры - при использовании современной нейропротекции (без неё риск параплегии ещё выше).\n\n### Нейропротекция (для типов I-III)\n- **CSF drainage** - поддержание CSF < 10 мм рт.ст.\n- **MEP / SSEP мониторинг**\n- **Дистальная перфузия** (левое предсердие → бедренная артерия)\n- **Moderate hypothermia** (32-34 °C)\n- **Реимплантация межрёберных Т8-L1** (артерия Адамкевича)\n- **Поддержание MAP > 90, Hb > 100**\n\n### Эндоваскулярные опции\n| Метод | Применимость |\n|---|---|\n| **TEVAR** | Тип I (проксимальная часть) + гибрид для висцеральных |\n| **FEVAR** | Fenestrated - юкстаренальные / супраренальные |\n| **BEVAR** | Branched - тип II, III, IV |\n| **Chimney / snorkel** | Экстренные случаи, bailout |\n| **Гибридный** | TEVAR + debranching |\n\n### Тактика\n- Диаметр ≥ 6 см (или ≥ 5.5 см при соединительнотканной дисплазии Marfan / Loeys-Dietz) → оперативное лечение.\n- Тип II - в центре высокого объёма, мультидисциплинарная команда.\n- Эндоваскулярный подход - у пожилых и высокого риска.\n\n### Ограничения\n- Не учитывает этиологию (атеросклеротическая, расслоение, соединительнотканная).\n- Не учитывает морфологию аневризмы (saccular vs fusiform).\n- Для планирования эндоваскулярного лечения - дополнительные классификации (Ishimaru / Safi zones)."
  };

export default runner;
