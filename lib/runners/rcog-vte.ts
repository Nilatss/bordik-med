/**
 * Runner: rcog-vte
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
    maxScore: 20,
    inputs: [
      {
        id: "period",
        label: "Период",
        type: "select",
        options: [
          {
            value: "ante",
            label: "Антенатально",
            points: 0
          },
          {
            value: "post",
            label: "Постнатально",
            points: 0
          }
        ]
      },
      {
        id: "prev_vte_unprov",
        label: "Предыдущая ВТЭ (кроме однократной спровоцированной большой операцией)",
        type: "checkbox",
        points: 4
      },
      {
        id: "prev_vte_prov",
        label: "Однократная ВТЭ, спровоцированная большой операцией",
        type: "checkbox",
        points: 3
      },
      {
        id: "thrombo_high",
        label: "Высокого риска тромбофилия (антифосфолипидный, AT-дефицит)",
        type: "checkbox",
        points: 3
      },
      {
        id: "thrombo_low",
        label: "Низкого риска тромбофилия (FV Leiden гетерозигота, PT G20210A)",
        type: "checkbox",
        points: 1
      },
      {
        id: "medical",
        label: "Медицинская коморбидность (СКВ, рак, СН, нефроз и т.п.)",
        type: "checkbox",
        points: 3
      },
      {
        id: "cs_emerg",
        label: "Экстренное кесарево сечение",
        type: "checkbox",
        points: 2
      },
      {
        id: "cs_elect",
        label: "Плановое кесарево сечение",
        type: "checkbox",
        points: 1
      },
      {
        id: "age",
        label: "Возраст > 35",
        type: "checkbox",
        points: 1
      },
      {
        id: "parity",
        label: "Паритет ≥ 3",
        type: "checkbox",
        points: 1
      },
      {
        id: "smoker",
        label: "Курение",
        type: "checkbox",
        points: 1
      },
      {
        id: "varicose",
        label: "Выраженный варикоз",
        type: "checkbox",
        points: 1
      },
      {
        id: "bmi30",
        label: "BMI ≥ 30",
        type: "checkbox",
        points: 1
      },
      {
        id: "bmi40",
        label: "BMI ≥ 40 (доп. балл)",
        type: "checkbox",
        points: 1
      },
      {
        id: "preeclampsia",
        label: "Преэклампсия",
        type: "checkbox",
        points: 1
      },
      {
        id: "art",
        label: "Беременность после ВРТ (антенатально)",
        type: "checkbox",
        points: 1
      },
      {
        id: "multiple",
        label: "Многоплодная беременность",
        type: "checkbox",
        points: 1
      },
      {
        id: "immobility",
        label: "Иммобилизация / регидратация / гиперемезис",
        type: "checkbox",
        points: 1
      },
      {
        id: "ppi_hemo",
        label: "Постнатальное кровотечение > 1 л / переливание",
        type: "checkbox",
        points: 1
      },
      {
        id: "infection_post",
        label: "Инфекция в родах / послеродовая",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 - низкий",
        color: "#22C55E",
        description: "Антенатально: мобилизация / гидратация. Постнатально: мобилизация.",
        actions: [
          "Ранняя мобилизация",
          "Адекватная гидратация"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "2 - промежуточный",
        color: "#84CC16",
        description: "Антенатально: мобилизация. Постнатально: ≥ 10 дн LMWH.",
        details: "Антенатально при 2 баллах - рассмотреть LMWH при добавочных факторах. Постнатально - 10 дн LMWH.",
        actions: [
          "Постнатально: эноксапарин 40 мг п/к × 10 дн (при весе 50-90 кг)",
          "Коррекция дозы по весу: < 50 кг → 20 мг, 91-130 кг → 60 мг, > 130 → 0,6 мг/кг/сут",
          "Компрессионный трикотаж"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "3 - умеренный (антенатально)",
        color: "#F59E0B",
        description: "Антенатально: LMWH с 28 недель. Постнатально: ≥ 10 дн LMWH.",
        details: "Антенатально 3 балла - начать LMWH с 28 недель до родов и продолжить ≥ 6 нед после.",
        actions: [
          "Антенатально: эноксапарин 40 мг п/к с 28 нед",
          "Постнатально: продолжить ≥ 6 нед",
          "Отменить за 12-24 ч до планового родоразрешения"
        ]
      },
      {
        min: 4,
        max: 20,
        label: "≥ 4 - высокий",
        color: "#EF4444",
        description: "Антенатально: LMWH с 1 триместра. Постнатально: ≥ 6 нед LMWH.",
        details: "Высокий риск - LMWH сразу после подтверждения беременности и минимум 6 нед после родов. При предыдущей ВТЭ на эстрогенах/непровокационной - пожизненная после родов оценка.",
        actions: [
          "Эноксапарин 40 мг п/к 1 раз/сут с первого триместра",
          "При весе: < 50 → 20 мг, 91-130 → 60 мг, > 130 → 0,6 мг/кг",
          "≥ 6 нед после родов",
          "Компрессионный трикотаж",
          "Отменить LMWH за 24 ч до планового КС"
        ]
      }
    ],
    caveats: [
      "Антенатальная и постнатальная шкалы отличаются порогами - указывайте период в инструменте",
      "DOAC и варфарин противопоказаны при беременности и лактации (варфарин - приемлем с осторожностью)",
      "Регионарная анестезия - не ранее 12 ч после профилактической дозы LMWH и 24 ч после терапевтической",
      "Пересматривать шкалу повторно: при госпитализации, интеркуррентных заболеваниях, родах"
    ],
    related: [
      {
        id: "caprini",
        title: "Caprini"
      },
      {
        id: "wells-dvt",
        title: "Wells для ТГВ"
      },
      {
        id: "padua",
        title: "Padua"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      },
      {
        id: "300.4",
        title: "Неотложная"
      }
    ],
    countries: "UK (RCOG) · международно принята",
    reference: "RCOG Green-top Guideline No. 37a. Reducing the Risk of Venous Thromboembolism during Pregnancy and the Puerperium. April 2015.",
    presets: [
      {
        label: "Антенат. низкий",
        values: {
          period: "ante",
          age: true
        }
      },
      {
        label: "Антенат. умеренный (с 28 нед)",
        values: {
          period: "ante",
          age: true,
          bmi30: true,
          parity: true
        }
      },
      {
        label: "Антенат. высокий (LMWH с 1 трим)",
        values: {
          period: "ante",
          prev_vte_unprov: true
        }
      }
    ],
    info: "### Для чего используется\n**RCOG Green-top 37a** - британский гайдлайн оценки риска ВТЭ у беременных и родильниц и выбора тромбопрофилактики LMWH. Беременность повышает риск ВТЭ ×5, послеродовой период - ×20.\n\n### Основные весовые коэффициенты\n| Фактор | Баллы |\n|---|---|\n| ВТЭ непровокационная / рекуррентная | 4 |\n| ВТЭ спровоцированная операцией | 3 |\n| Тромбофилия высокого риска (АФС, AT дефицит) | 3 |\n| Медицинская коморбидность (СКВ, рак, СН, нефроз) | 3 |\n| Экстренное кесарево сечение | 2 |\n| BMI ≥ 40 | 2 |\n| BMI ≥ 30 | 1 |\n| Возраст > 35, курение, паритет ≥ 3, варикоз | по 1 |\n| Преэклампсия, ВРТ, многоплодие | по 1 |\n| Иммобилизация, инфекция, ППК | по 1 |\n| Плановое КС, тромбофилия низкого риска | 1 |\n\n### Интерпретация (антенатально)\n| Баллы | Тактика |\n|---|---|\n| ≥ 4 | LMWH с 1 триместра |\n| 3 | LMWH с 28 нед |\n| ≤ 2 | Мобилизация + избегание обезвоживания |\n\n### Интерпретация (постнатально)\n| Баллы | Тактика |\n|---|---|\n| ≥ 2 | LMWH минимум 10 дн |\n| ≥ 4 | LMWH ≥ 6 недель |\n\n### Дозы LMWH (по весу)\n| Вес | Эноксапарин |\n|---|---|\n| < 50 кг | 20 мг 1 раз/сут |\n| 50-90 кг | 40 мг 1 раз/сут |\n| 91-130 кг | 60 мг 1 раз/сут |\n| 131-170 кг | 80 мг |\n| > 170 кг | 0,6 мг/кг/сут |\n\n### Анестезия и LMWH\n- Регионарная блокада: ≥ 12 ч после профилактической, ≥ 24 ч после терапевтической дозы\n- Катетер не удалять в пик LMWH; возобновить LMWH ≥ 4 ч после удаления\n\n### Ограничения\n- DOAC / варфарин противопоказаны антенатально (варфарин тератогенен 6-12 нед)\n- Требует пересмотра при каждом изменении клинического статуса\n- Не оценивает риск кровотечения отдельно"
  };

export default runner;
