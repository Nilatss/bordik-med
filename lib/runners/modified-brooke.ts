// @ts-nocheck
/**
 * Runner: modified-brooke
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
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 1,
        max: 300,
        step: 0.1,
        quickValues: [
          20,
          40,
          60,
          70,
          80,
          90
        ]
      },
      {
        id: "tbsa",
        label: "% TBSA (II+III степень)",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.5,
        quickValues: [
          10,
          15,
          20,
          30,
          40,
          50
        ]
      }
    ],
    compute: (v)=>{
            const w = Number(v.weight), tbsa = Number(v.tbsa);
            const brooke = 2 * w * tbsa;
            const parkland = 4 * w * tbsa;
            const first8h = brooke / 2;
            const rate8 = first8h / 8;
            return {
                value: `${Math.round(brooke)} мл / 24 ч`,
                unit: `(½ за первые 8 ч = ${Math.round(first8h)} мл)`,
                interpretation: 'Модифицированный Брук - менее агрессивный вариант, US military / ABLS.',
                color: '#F59E0B',
                details: `Расчёт: 2 мл × ${w} кг × ${tbsa} % TBSA = ${Math.round(brooke)} мл раствора Рингера лактат за 24 ч. Половина (${Math.round(first8h)} мл) - в первые 8 ч от МОМЕНТА ожога, темп ≈ ${Math.round(rate8)} мл/ч. Для сравнения, Parkland (4 мл/кг/%TBSA) даст ${Math.round(parkland)} мл - вдвое больше. Modified Brooke выбран ABLS (American Burn Life Support) и US military из-за меньшего риска «fluid creep».`,
                actions: [
                    `Рингер лактат, стартовый темп ≈ ${Math.round(rate8)} мл/ч в первые 8 ч`,
                    'Титровать по диурезу: взрослые 0,5 мл/кг/ч, дети < 30 кг - 1 мл/кг/ч',
                    'Почасовой мониторинг: диурез, АД, лактат, Ht, сознание',
                    'Перевод в ожоговый центр при TBSA ≥ 10 % (ABA critera)',
                    'У детей < 30 кг - добавить поддерживающую инфузию по Holliday-Segar',
                    'При электро- и ингаляционных ожогах потребности выше расчётных'
                ],
                caveats: [
                    'Учитываются только ожоги II-III степени; эритема (I ст.) не входит',
                    'У ожирения обе формулы завышают - рассмотреть IBW или Galveston (дети)',
                    'Расчёт - только стартовая оценка; реальный темп подбирают по диурезу',
                    'Половина объёма считается от МОМЕНТА ожога, а не от поступления'
                ],
                relatedCourses: [
                    {
                        id: '308.2',
                        title: 'Хирургия ожогов'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ],
                related: [
                    {
                        id: 'parkland',
                        title: 'Parkland formula'
                    },
                    {
                        id: 'rule-nines',
                        title: 'Правило девяток'
                    },
                    {
                        id: 'holliday-segar',
                        title: 'Holliday-Segar (дети)'
                    }
                ]
            };
        },
    reference: "Modified Brooke (Pruitt, 1979). ABLS / ATLS - 2 мл × кг × %TBSA Рингер за 24 ч, ½ в первые 8 ч.",
    countries: "США (ABA / ABLS) · Международный",
    presets: [
      {
        label: "Взрослый 70 кг, 20 %",
        values: {
          weight: 70,
          tbsa: 20
        }
      },
      {
        label: "Взрослый 80 кг, 40 %",
        values: {
          weight: 80,
          tbsa: 40
        }
      },
      {
        label: "Ребёнок 20 кг, 15 %",
        values: {
          weight: 20,
          tbsa: 15
        }
      }
    ],
    info: "### Для чего используется\n**Модифицированная формула Брука (Pruitt, 1979)** - расчёт стартовой инфузионной терапии при ожогах. Менее агрессивная, чем Parkland, - основана на опыте US Army Institute of Surgical Research. Рекомендуется ABA (American Burn Association) и ABLS как альтернатива Паркланду.\n\n### Формула\n`Объём (мл за 24 ч) = 2 × масса (кг) × % TBSA`\n\nПоловина - в первые 8 ч, половина - в следующие 16 ч.\nРаствор: **Рингер лактат**.\n\n### Сравнение с другими формулами\n| Формула | Коэффициент | Для кого |\n|---|---|---|\n| Parkland (Baxter) | **4** × кг × %TBSA | ATLS стандарт |\n| Modified Brooke | **2** × кг × %TBSA | ABLS, US military |\n| Consensus (ABA) | 2-4 × кг × %TBSA | Рабочий диапазон |\n| Galveston (дети) | 5000 × м²×TBSA + 2000 × м² maintenance | Педиатрия |\n\n### Почему снижен коэффициент\nМноголетний опыт показал, что Паркланд часто приводит к избыточной инфузии (\"fluid creep\") → компартмент-синдромы (брюшной полости, конечностей, орбитальный), ARDS, полиорганная недостаточность. Modified Brooke даёт меньший стартовый объём при сравнимых клинических исходах при условии титрования по диурезу.\n\n### Цели ресусцитации\n| Параметр | Цель |\n|---|---|\n| Диурез (взрослые) | 0,5 мл/кг/ч |\n| Диурез (дети < 30 кг) | 1 мл/кг/ч |\n| САД | ≥ 60 мм рт.ст. |\n| Лактат | Динамика снижения |\n\n### Ограничения\n- Как и Parkland - только ожоги II-III степени\n- У детей требуется maintenance сверх расчётного\n- Электроожоги / ингаляционные - объём часто больше"
  };

export default runner;
