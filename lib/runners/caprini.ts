// @ts-nocheck
/**
 * Runner: caprini
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
    maxScore: 40,
    inputs: [
      {
        id: "age",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "0",
            label: "< 41",
            points: 0
          },
          {
            value: "1",
            label: "41-60",
            points: 1
          },
          {
            value: "2",
            label: "61-74",
            points: 2
          },
          {
            value: "3",
            label: "≥ 75",
            points: 3
          }
        ]
      },
      {
        id: "surg_type",
        label: "Тип операции",
        type: "select",
        options: [
          {
            value: "0",
            label: "Без операции",
            points: 0
          },
          {
            value: "1",
            label: "Малая (< 45 мин)",
            points: 1
          },
          {
            value: "2",
            label: "Большая / лапароскопия > 45 мин",
            points: 2
          },
          {
            value: "5",
            label: "Артропластика, перелом бедра/таза, травма спинного мозга",
            points: 5
          }
        ]
      },
      {
        id: "bmi",
        label: "BMI > 25",
        type: "checkbox",
        points: 1
      },
      {
        id: "swelling",
        label: "Отёки ног / варикоз",
        type: "checkbox",
        points: 1
      },
      {
        id: "sepsis",
        label: "Сепсис (< 1 мес)",
        type: "checkbox",
        points: 1
      },
      {
        id: "lung",
        label: "Тяжёлые лёгочные заболевания / пневмония (< 1 мес)",
        type: "checkbox",
        points: 1
      },
      {
        id: "hormones",
        label: "КОК / ЗГТ",
        type: "checkbox",
        points: 1
      },
      {
        id: "pregnancy",
        label: "Беременность / послеродовой период",
        type: "checkbox",
        points: 1
      },
      {
        id: "abortion",
        label: "Необъяснимые выкидыши / мертворождения",
        type: "checkbox",
        points: 1
      },
      {
        id: "mi",
        label: "Острый ИМ",
        type: "checkbox",
        points: 1
      },
      {
        id: "hf",
        label: "Сердечная недостаточность",
        type: "checkbox",
        points: 1
      },
      {
        id: "ibd",
        label: "Воспалительные заболевания кишечника",
        type: "checkbox",
        points: 1
      },
      {
        id: "bedrest",
        label: "Постельный режим",
        type: "checkbox",
        points: 1
      },
      {
        id: "cast",
        label: "Иммобилизация (гипс < 1 мес)",
        type: "checkbox",
        points: 2
      },
      {
        id: "central_line",
        label: "Центральный венозный катетер",
        type: "checkbox",
        points: 2
      },
      {
        id: "cancer",
        label: "Злокачественное заболевание",
        type: "checkbox",
        points: 2
      },
      {
        id: "prev_vte",
        label: "ВТЭ в анамнезе",
        type: "checkbox",
        points: 3
      },
      {
        id: "family_vte",
        label: "Семейный анамнез ВТЭ",
        type: "checkbox",
        points: 3
      },
      {
        id: "factor_v",
        label: "Leiden / протромбин G20210A",
        type: "checkbox",
        points: 3
      },
      {
        id: "apa",
        label: "Антифосфолипидный синдром / волчаночный антикоагулянт",
        type: "checkbox",
        points: 3
      },
      {
        id: "hit_hx",
        label: "HIT в анамнезе",
        type: "checkbox",
        points: 3
      },
      {
        id: "stroke",
        label: "Инсульт (< 1 мес)",
        type: "checkbox",
        points: 5
      },
      {
        id: "spinal",
        label: "Острая травма спинного мозга / полиморбидная травма",
        type: "checkbox",
        points: 5
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 - очень низкий",
        color: "#22C55E",
        description: "Ранняя мобилизация достаточна.",
        actions: [
          "Ранняя мобилизация, гидратация"
        ]
      },
      {
        min: 1,
        max: 2,
        label: "1-2 - низкий",
        color: "#84CC16",
        description: "Механическая профилактика (IPC / компрессионный трикотаж).",
        actions: [
          "Компрессионный трикотаж",
          "Перемежающаяся пневмокомпрессия",
          "Ранняя мобилизация"
        ]
      },
      {
        min: 3,
        max: 4,
        label: "3-4 - умеренный",
        color: "#F59E0B",
        description: "Фармакопрофилактика (LMWH / UFH) + механическая.",
        details: "Риск ВТЭ ~ 0,7 %. Стандартная продолжительность - до выписки или до полной мобилизации.",
        actions: [
          "Эноксапарин 40 мг п/к 1 раз/сут",
          "UFH 5000 МЕ × 2-3 раза/сут",
          "Компрессионный трикотаж / IPC",
          "Учитывать риск кровотечения"
        ]
      },
      {
        min: 5,
        max: 40,
        label: "≥ 5 - высокий",
        color: "#EF4444",
        description: "Фармакопрофилактика обязательна, при онкохирургии - продлённая (до 28-35 дн).",
        details: "Риск ВТЭ 1,8-10 %. Продлённая профилактика после абдоминально-тазовой онкохирургии (ASCO 2020) и артропластики (ACCP 2012) - до 28-35 дней.",
        actions: [
          "Эноксапарин 40 мг 1 раз/сут (или далтепарин 5000 МЕ, надропарин)",
          "Продлённая профилактика 28-35 дн при онкохирургии брюшной полости / артропластике",
          "Ривароксабан 10 мг / апиксабан 2,5 мг × 2 - после артропластики (ACCP)",
          "Механическая профилактика дополнительно (IPC)",
          "При кровотечении - только механическая профилактика"
        ]
      }
    ],
    caveats: [
      "Для хирургических пациентов (версии 2005 и 2010 - наиболее валидизированы)",
      "Учитываются только применимые пункты - не суммировать несовместимые (напр. «без операции» + «артропластика»)",
      "Для терапевтических - Padua; для беременных - RCOG; для онко-амбулаторных - Khorana",
      "Высокий Caprini + высокий риск кровотечения - индивидуальное решение, возможна отсрочка LMWH на 12-24 ч после операции"
    ],
    related: [
      {
        id: "padua",
        title: "Padua (терапевт.)"
      },
      {
        id: "improve-bleed",
        title: "IMPROVE bleeding"
      },
      {
        id: "wells-dvt",
        title: "Wells для ТГВ"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная"
      },
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    countries: "Международный (ACCP 2012, AAOS, ASCO)",
    reference: "Caprini JA. Dis Mon 2010; 56:552-9. Bahl V et al. Ann Surg 2010 - валидация RAM.",
    presets: [
      {
        label: "Низкий риск (1-2)",
        values: {
          age: "1",
          surg_type: "1"
        }
      },
      {
        label: "Умеренный (3-4)",
        values: {
          age: "2",
          surg_type: "2"
        }
      },
      {
        label: "Высокий (≥ 5)",
        values: {
          age: "2",
          surg_type: "5",
          cancer: true
        }
      }
    ],
    info: "### Для чего используется\n**Caprini Risk Assessment Model (2010 update)** - стандарт стратификации риска ВТЭ у **хирургических пациентов** перед операцией и в раннем послеоперационном периоде. Определяет необходимость и агрессивность профилактики.\n\n### Компоненты (суммируются)\nВозраст, тип операции, BMI, сопутствующие (СН, ИМ, сепсис, ВЗК, пневмония), гормоны/беременность, иммобилизация/катетер, онкология, ВТЭ/тромбофилии, инсульт, травма спинного мозга.\n\nБаллы: 1 / 2 / 3 / 5 в зависимости от веса фактора.\n\n### Интерпретация и тактика\n| Баллы | Риск | Профилактика |\n|---|---|---|\n| 0 | Очень низкий | Мобилизация |\n| 1-2 | Низкий | Механическая (IPC, чулки) |\n| 3-4 | Умеренный | LMWH / UFH + механическая |\n| ≥ 5 | Высокий | LMWH + механическая; продлённо 28-35 дн при онкохирургии/артропластике |\n\n### Препараты\n| Препарат | Доза |\n|---|---|\n| Эноксапарин | 40 мг п/к 1 раз/сут (30 мг × 2 при артропластике) |\n| Далтепарин | 5000 МЕ 1 раз/сут |\n| Фондапаринукс | 2,5 мг 1 раз/сут |\n| Ривароксабан | 10 мг 1 раз/сут (артропластика) |\n| Апиксабан | 2,5 мг × 2 (артропластика) |\n| UFH | 5000 МЕ × 2-3 (CrCl < 30) |\n\n### Продлённая профилактика\n| Операция | Длительность |\n|---|---|\n| Артропластика тазобедренного сустава | 28-35 дн |\n| Артропластика коленного | 10-14 дн (до 35) |\n| Онкохирургия брюшной полости | 28 дн (ASCO 2020) |\n| Бариатрическая хирургия | Индивидуально |\n\n### Ограничения\n- Для терапевтических стационарных - **Padua**\n- Для беременных - **RCOG Green-top 37a**\n- Для онко-амбулаторных на химио - **Khorana**\n- Оценить риск кровотечения (IMPROVE) - отсрочка LMWH 12-24 ч при высоком риске"
  };

export default runner;
