// @ts-nocheck
/**
 * Runner: iv-dilution
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
        id: "stockConc",
        label: "Концентрация стока",
        type: "number",
        unit: "мг/мл",
        min: 0.001,
        max: 10000,
        step: 0.001,
        quickValues: [
          1,
          5,
          10,
          50,
          100,
          200
        ]
      },
      {
        id: "stockVol",
        label: "Объём препарата (из стока)",
        type: "number",
        unit: "мл",
        min: 0.01,
        max: 500,
        step: 0.01,
        quickValues: [
          1,
          2,
          5,
          10,
          20
        ]
      },
      {
        id: "bagVol",
        label: "Итоговый объём в пакете",
        type: "number",
        unit: "мл",
        min: 1,
        max: 2000,
        step: 1,
        quickValues: [
          50,
          100,
          250,
          500,
          1000
        ]
      }
    ],
    compute: (v)=>{
            const c1 = Number(v.stockConc);
            const v1 = Number(v.stockVol);
            const v2 = Number(v.bagVol);
            const totalMg = c1 * v1;
            const c2 = totalMg / v2;
            const mcgPerMl = c2 * 1000;
            return {
                value: `${c2.toFixed(3)} мг/мл`,
                unit: `(${mcgPerMl.toFixed(1)} мкг/мл, всего ${totalMg.toFixed(1)} мг)`,
                interpretation: 'Конечная концентрация в инфузионном пакете. Проверьте стабильность раствора.',
                color: '#4B8DF5',
                details: `Закон разведения C₁V₁ = C₂V₂. В сток: ${c1} мг/мл × ${v1} мл = ${totalMg.toFixed(1)} мг активного вещества. После разведения в ${v2} мл пакета: концентрация = ${totalMg.toFixed(1)} / ${v2} = ${c2.toFixed(3)} мг/мл (или ${mcgPerMl.toFixed(1)} мкг/мл).`,
                actions: [
                    'Сверить совместимость с носителем (0,9 % NaCl vs 5 % декстроза - различная стабильность)',
                    'Пометить пакет: препарат, концентрация, время приготовления, инициалы',
                    'Для узкого терапевтического индекса - двойная проверка (double-check)',
                    'Хранение после разведения - обычно 24 ч при 2-8 °C либо по инструкции'
                ],
                caveats: [
                    'Формула не учитывает увеличение объёма при добавлении в пакет (приблизительно для малых объёмов)',
                    'Не все растворители совместимы (например, амиодарон - только 5 % декстроза)',
                    'Некоторые препараты требуют фильтров (маннитол, таксаны) или светозащитных пакетов',
                    'Проверить расчёт - ошибка разведения типична для вазоактивных препаратов'
                ],
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ],
                related: [
                    {
                        id: 'drip-rate',
                        title: 'Скорость инфузии gtt/мин'
                    },
                    {
                        id: 'mg-kg',
                        title: 'Доза по массе'
                    }
                ]
            };
        },
    reference: "Базовый закон разведения Dalton: C₁V₁ = C₂V₂.",
    countries: "Международный",
    presets: [
      {
        label: "Гепарин 25000 ЕД/5 мл в 500 мл",
        values: {
          stockConc: 5000,
          stockVol: 5,
          bagVol: 500
        }
      },
      {
        label: "Допамин 200 мг/5 мл в 250 мл",
        values: {
          stockConc: 40,
          stockVol: 5,
          bagVol: 250
        }
      },
      {
        label: "Норадреналин 4 мг/4 мл в 50 мл",
        values: {
          stockConc: 1,
          stockVol: 4,
          bagVol: 50
        }
      }
    ],
    info: "### Для чего используется\nРасчёт **конечной концентрации** препарата после разведения в инфузионном пакете (или шприце) - базовая операция при приготовлении вазоактивных, антибиотиков, цитостатиков.\n\n### Формула\n`C₁ × V₁ = C₂ × V₂`\n\nгде:\n- C₁ - исходная концентрация (мг/мл)\n- V₁ - объём препарата из стока (мл)\n- C₂ - конечная концентрация (мг/мл)\n- V₂ - итоговый объём в пакете (мл)\n\n### Типовые разведения вазопрессоров\n| Препарат | Сток | Разведение | Конц. |\n|---|---|---|---|\n| Норадреналин | 4 мг / 4 мл | 4 мг / 50 мл | 80 мкг/мл |\n| Допамин | 200 мг / 5 мл | 200 мг / 250 мл | 800 мкг/мл |\n| Добутамин | 250 мг / 20 мл | 250 мг / 250 мл | 1 мг/мл |\n| Адреналин | 1 мг / 1 мл | 4 мг / 250 мл | 16 мкг/мл |\n\n### Совместимость с носителем\n| Препарат | Растворитель |\n|---|---|\n| Амиодарон | Только 5 % декстроза |\n| Норадреналин | 5 % декстроза предпочт. (стабильность) |\n| Большинство антибиотиков | 0,9 % NaCl |\n| Ампициллин | Только 0,9 % NaCl (в декстрозе нестабилен) |\n\n### Ограничения\n- Простая пропорция без учёта объёма, вытесняемого сухим веществом во флаконе (для точных расчётов в педиатрии - используйте «displacement volume»)\n- Не учитывает химическую стабильность после разведения"
  };

export default runner;
