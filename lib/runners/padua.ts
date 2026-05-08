/**
 * Runner: padua
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
        id: "cancer",
        label: "Активная онкология (метастазы / лечение < 6 мес)",
        type: "checkbox",
        points: 3
      },
      {
        id: "prev_vte",
        label: "ВТЭ в анамнезе (искл. тромбофлебит)",
        type: "checkbox",
        points: 3
      },
      {
        id: "mobility",
        label: "Сниженная мобильность (постельный режим ≥ 3 дн)",
        type: "checkbox",
        points: 3
      },
      {
        id: "thrombophilia",
        label: "Известная тромбофилия",
        type: "checkbox",
        points: 3
      },
      {
        id: "trauma",
        label: "Недавняя травма / операция < 1 мес",
        type: "checkbox",
        points: 2
      },
      {
        id: "elderly",
        label: "Возраст ≥ 70 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "hf_resp",
        label: "Сердечная / дыхательная недостаточность",
        type: "checkbox",
        points: 1
      },
      {
        id: "mi_stroke",
        label: "Острый ИМ / ишемический инсульт",
        type: "checkbox",
        points: 1
      },
      {
        id: "infection",
        label: "Острая инфекция / ревматологическое заболевание",
        type: "checkbox",
        points: 1
      },
      {
        id: "obesity",
        label: "BMI ≥ 30",
        type: "checkbox",
        points: 1
      },
      {
        id: "hormones",
        label: "Текущая гормональная терапия",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "< 4 - низкий риск",
        color: "#22C55E",
        description: "Риск ВТЭ ~ 0,3 %. Фармакопрофилактика не требуется.",
        details: "Достаточна механическая профилактика: ранняя мобилизация, компрессионный трикотаж при факторах риска неподвижности.",
        actions: [
          "Ранняя мобилизация",
          "Адекватная гидратация",
          "Переоценка при ухудшении"
        ]
      },
      {
        min: 4,
        max: 20,
        label: "≥ 4 - высокий риск",
        color: "#EF4444",
        description: "Риск ВТЭ ~ 11 % без профилактики. Показана фармакопрофилактика.",
        details: "При отсутствии противопоказаний (см. IMPROVE bleeding) - LMWH или фондапаринукс на весь период госпитализации. ACCP 2012, ASH 2018 подтверждают снижение ВТЭ на ~ 50 %.",
        actions: [
          "Эноксапарин 40 мг п/к 1 раз/сут",
          "Далтепарин 5000 МЕ 1 раз/сут / надропарин 3800-5700 МЕ",
          "Фондапаринукс 2,5 мг п/к 1 раз/сут (альтернатива при HIT)",
          "При CrCl < 30 - UFH 5000 МЕ × 2-3 или эноксапарин 30 мг × 1",
          "Оценить риск кровотечения (IMPROVE bleeding ≥ 7 - мех.профилактика)"
        ]
      }
    ],
    caveats: [
      "Только для терапевтических стационарных пациентов (не хирургических - см. Caprini)",
      "Перед назначением профилактики оценить риск кровотечения (IMPROVE bleeding)",
      "Не применять при Plt < 50, активном кровотечении, недавнем ВЧГ",
      "Переоценивать ежедневно - факторы риска меняются"
    ],
    related: [
      {
        id: "caprini",
        title: "Caprini (хирургические)"
      },
      {
        id: "improve-bleed",
        title: "IMPROVE bleeding risk"
      },
      {
        id: "wells-dvt",
        title: "Wells для ТГВ"
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
    countries: "Международный (ACCP 2012, ASH 2018)",
    reference: "Barbar S et al. J Thromb Haemost 2010; 8:2450-7.",
    presets: [
      {
        label: "Низкий риск",
        values: {
          cancer: false,
          prev_vte: false,
          mobility: false,
          thrombophilia: false,
          trauma: false,
          elderly: true,
          hf_resp: false,
          mi_stroke: false,
          infection: false,
          obesity: false,
          hormones: false
        }
      },
      {
        label: "Высокий риск",
        values: {
          cancer: false,
          prev_vte: false,
          mobility: true,
          thrombophilia: false,
          trauma: false,
          elderly: true,
          hf_resp: false,
          mi_stroke: false,
          infection: false,
          obesity: false,
          hormones: false
        }
      },
      {
        label: "Очень высокий",
        values: {
          cancer: true,
          prev_vte: true,
          mobility: true,
          thrombophilia: false,
          trauma: false,
          elderly: true,
          hf_resp: true,
          mi_stroke: false,
          infection: true,
          obesity: false,
          hormones: false
        }
      }
    ],
    info: "### Для чего используется\n**Padua Prediction Score (Barbar 2010)** - оценка риска **ВТЭ у терапевтических стационарных пациентов** для решения о фармакопрофилактике.\n\n### Компоненты\n| Фактор | Баллы |\n|---|---|\n| Активный рак | 3 |\n| ВТЭ в анамнезе | 3 |\n| Сниженная мобильность ≥ 3 дн | 3 |\n| Известная тромбофилия | 3 |\n| Недавняя травма/операция < 1 мес | 2 |\n| Возраст ≥ 70 | 1 |\n| Сердечная/дыхательная недост. | 1 |\n| Острый ИМ/ишем. инсульт | 1 |\n| Острая инфекция/ревматологическая | 1 |\n| BMI ≥ 30 | 1 |\n| Текущая гормональная терапия | 1 |\n\n### Интерпретация\n| Баллы | Риск ВТЭ | Тактика |\n|---|---|---|\n| < 4 | Низкий (~ 0,3 %) | Механическая профилактика |\n| ≥ 4 | Высокий (~ 11 %) | Фармакопрофилактика |\n\n### Препараты профилактики (ACCP 2012)\n- Эноксапарин 40 мг 1 раз/сут\n- Далтепарин 5000 МЕ 1 раз/сут\n- Фондапаринукс 2,5 мг 1 раз/сут\n- UFH 5000 МЕ × 2-3 раза (при CrCl < 30)\n\n### Противопоказания\nОценить **IMPROVE bleeding score** ≥ 7 → только механическая профилактика (компрессионный трикотаж, перемежающаяся пневмокомпрессия).\n\n### Ограничения\n- Не валидизирован у хирургических пациентов (используйте Caprini)\n- Не валидизирован у онкологических амбулаторных (Khorana)\n- Не применяется у беременных (RCOG)"
  };

export default runner;
