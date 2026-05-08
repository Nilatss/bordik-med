// @ts-nocheck
/**
 * Runner: holliday-segar — Holliday-Segar Pediatric Maintenance Fluid (4-2-1 rule)
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Holliday MA, Segar WE. The maintenance need for water in
 *               parenteral fluid therapy. Pediatrics. 1957;19(5):823-832.
 *               PMID: 13431307
 *   GUIDELINE:  AAP 2018 Choice of IV Fluids in Hospitalized Children —
 *               рекомендуют isotonic fluids (D5LR, D5NS, D5 1/2NS) с
 *               Holliday-Segar для maintenance rate. ОТКАЗ от hypotonic
 *               (D5 1/4NS) — historical safety concern (hyponatraemia).
 *               doi:10.1542/peds.2018-3083
 *
 * 4-2-1 Hourly Rule:
 *   First 10 kg:   4 mL/kg/h
 *   Second 10 kg:  2 mL/kg/h (i.e., 11-20 kg)
 *   Each kg >20:   1 mL/kg/h
 *
 * Daily equivalent:
 *   First 10 kg:   100 mL/kg/day
 *   Second 10 kg:  50 mL/kg/day
 *   Each kg >20:   20 mL/kg/day
 *
 * Examples:
 *   25 kg child:  4×10 + 2×10 + 1×5 = 65 mL/h (1560 mL/day)
 *   8 kg infant:  4×8 = 32 mL/h (768 mL/day)
 *
 * Caveats:
 *   - Это MAINTENANCE only (не resuscitation). Bolus / replacement —
 *     отдельно (10-20 mL/kg NS bolus при dehydration).
 *   - НЕ для neonates <28 days — у новорождённых отдельные guideline
 *     (NICU policy, ~80-100 mL/kg/day day 1, ↑ 10-20 mL/kg/day каждый
 *     день до 150-160 by day 5-7).
 *   - НЕ для anuric / oliguric / heart failure / SIADH — restrict
 *     fluids manually.
 *   - Учитывай fever (+10-12% per °C above 37.8), tachypnoea, third-
 *     spacing — adjust upward.
 *
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
    kind: "calculator",
    inputs: [
      {
        id: "weight",
        hint: 'Вес в кг (без одежды)',
        label: "Вес ребёнка",
        type: "number",
        unit: "кг",
        min: 1,
        max: 100,
        step: 0.1,
        quickValues: [
          3,
          5,
          10,
          15,
          20,
          30,
          40,
          60,
          70
        ]
      }
    ],
    compute: (v)=>{
            const w = Number(v.weight);
            let perHour = 0;
            if (w <= 10) perHour = w * 4;
            else if (w <= 20) perHour = 40 + (w - 10) * 2;
            else perHour = 60 + (w - 20) * 1;
            const perDay = perHour * 24;
            return {
                value: `${perHour.toFixed(0)} мл/ч`,
                unit: `(${perDay.toFixed(0)} мл/сут)`,
                interpretation: 'Поддерживающая инфузия (4-2-1): 4 мл/кг/ч (первые 10 кг) + 2 (10-20) + 1 (>20).',
                color: '#22C55E',
                details: 'Поддерживающая (maintenance) инфузия для ребёнка без дефицита и продолжающихся потерь. Это базовый темп - к нему добавляют коррекцию дефицита голодания, потерь на рвоту/диарею/дренажи и хирургические потери. Выбор раствора: ИЗОТОНИЧНЫЙ (0,9% NaCl или сбалансированный) + 5% декстроза; гипотонические растворы (0,45%, 0,18%) противопоказаны из-за риска ятрогенной гипонатриемии и отёка мозга (NICE 2015, AAP 2018).',
                actions: [
                    'Изотонический раствор + 5 % декстроза как стартовый (0,9 % NaCl / Рингер / Plasma-Lyte)',
                    'Добавить K⁺ 1-2 ммоль / 100 мл только при подтверждённом диурезе',
                    'При лихорадке - +12 % за каждый °C > 38',
                    'При ХСН / ОПН / SIADH - ограничить до 50-70 % от расчётного',
                    'Контроль Na⁺, K⁺, глюкозы каждые 12-24 ч при продолжающейся инфузии'
                ],
                caveats: [
                    'Не применимо у новорождённых < 72 ч (специальные протоколы 60-80 мл/кг с ступенчатым увеличением)',
                    'У взрослых > 80 кг формула часто завышает потребности - капировать на 120-150 мл/ч без показаний',
                    'При ожирении использовать IBW, а не фактическую массу',
                    'Гипотонические растворы (0,45%, 0,18% NaCl) запрещены в качестве maintenance (NICE/AAP)',
                    'Не заменяет ресусцитацию при шоке - для неё болюсы 10-20 мл/кг'
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: "Педиатрия раннего возраста"
                    },
                    {
                        id: '203.9',
                        title: "Педиатрическая фармакология"
                    }
                ],
                related: [
                    {
                        id: 'parkland',
                        title: 'Parkland (ожоги)'
                    },
                    {
                        id: 'ibw-devine',
                        title: 'Идеальная масса'
                    }
                ]
            };
        },
    reference: "Holliday & Segar, 1957. Стандарт педиатрии и анестезиологии.",
    presets: [
      {
        label: "Новорождённый 3 кг",
        values: {
          weight: 3
        }
      },
      {
        label: "Младенец 5 кг",
        values: {
          weight: 5
        }
      },
      {
        label: "Ребёнок 15 кг",
        values: {
          weight: 15
        }
      },
      {
        label: "Подросток 40 кг",
        values: {
          weight: 40
        }
      },
      {
        label: "Взрослый 70 кг",
        values: {
          weight: 70
        }
      }
    ],
    info: "### Для чего используется\n**Правило 4-2-1 (Holliday & Segar, 1957)** - расчёт поддерживающей инфузии для **детей и взрослых** на основе массы тела. Стандарт педиатрии, анестезиологии, экстренной медицины.\n\n### Формула (4-2-1)\n| Масса тела | Темп инфузии |\n|---|---|\n| Первые 10 кг | **4 мл/кг/ч** |\n| 10-20 кг | добавить **2 мл/кг/ч** за каждый кг > 10 |\n| > 20 кг | добавить **1 мл/кг/ч** за каждый кг > 20 |\n\n### Суточный вариант (100-50-20)\n| Масса | Мл/кг/сут |\n|---|---|\n| 0-10 кг | 100 мл/кг |\n| 10-20 кг | + 50 мл/кг за каждый кг > 10 |\n| > 20 кг | + 20 мл/кг за каждый кг > 20 |\n\n### Примеры\n| Вес | Темп /ч | Темп /сут |\n|---|---|---|\n| 5 кг | 20 мл/ч | 500 мл |\n| 15 кг | 50 мл/ч | 1200 мл |\n| 25 кг | 65 мл/ч | 1600 мл |\n| 50 кг | 90 мл/ч | 2100 мл |\n| 70 кг (взрослый) | 110 мл/ч | 2600 мл |\n\n### Выбор раствора (ESPGHAN 2018, NICE 2015, AAP 2018)\n| Раствор | Статус | Почему |\n|---|---|---|\n| 0,9 % NaCl | ✅ Рекомендован | Изотоничен плазме |\n| Рингер лактат, Plasma-Lyte, Sterofundin | ✅ Предпочтительны | Сбалансированные по электролитам |\n| + 5 % декстроза | ✅ Добавлять | Предотвращение гипогликемии |\n| 0,45 % NaCl, 0,18 % | ❌ НЕ рекомендованы | Риск гипонатриемии и отёка мозга |\n\n### Коррекция поддерживающего объёма\n| Состояние | Коррекция |\n|---|---|\n| Лихорадка | +12 % за каждый °C > 38 |\n| Тахипноэ | Компенсаторно (+ по балансу) |\n| Ожоги | Использовать Паркланд поверх |\n| Гастроэнтерит | Учитывать потери: рвота, диарея |\n| Полиурия (диабет, НД) | По балансу вход/выход |\n| Сердечная недостаточность | Ограничить до 50-70 % поддерживающего |\n| ОПН / олигурия | Потери + 400-500 мл/м²/сут |\n\n### Электролиты в поддерживающей инфузии\nНа каждые 100 мл воды:\n\n| Электролит | Количество | Примечание |\n|---|---|---|\n| Na⁺ | 2-3 ммоль | |\n| K⁺ | 1-2 ммоль | Только при нормальном диурезе |\n| Глюкоза | 5 г | 5 % раствор |\n\n### Анестезиологический подход\nHolliday-Segar используется как база, к которой добавляют:\n\n| Компонент | Расчёт |\n|---|---|\n| Дефицит (голодание) | Часы × maintenance; ½ в 1-й час, ¼ во 2-й и 3-й |\n| Малая операция | 3-5 мл/кг/ч потери в третье пространство |\n| Большая полостная | 5-10 мл/кг/ч |\n| Травматичная / ожог | 10-15 мл/кг/ч |\n\n### Ограничения\n| Ситуация | Ограничение |\n|---|---|\n| Новорождённые < 72 ч | Специальные протоколы (60-80 мл/кг с постепенным увеличением) |\n| Взрослые > 80 кг | Часто завышает; обычно ≤ 120-150 мл/ч без показаний |\n| Ожирение | Использовать IBW или скорректированный вес |"
  };

export default runner;
