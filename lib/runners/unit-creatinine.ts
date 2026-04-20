// @ts-nocheck
/**
 * Runner: unit-creatinine
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
        id: "value",
        label: "Креатинин",
        type: "number",
        unit: "mg/dL",
        min: 0.2,
        max: 20,
        step: 0.1,
        quickValues: [
          0.7,
          1,
          1.2,
          1.5,
          2,
          3
        ]
      }
    ],
    compute: (v)=>{
            const mgdl = Number(v.value);
            const umol = mgdl * 88.4;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            if (mgdl < 0.6) {
                interpretation = 'Сниженный креатинин';
                color = '#3B82F6';
                details = 'Может отражать низкую мышечную массу (саркопения, кахексия, ампутация, параплегия), беременность, строгое вегетарианство. Формулы eGFR завышают СКФ у таких пациентов.';
            } else if (mgdl <= 1.2) {
                interpretation = 'Норма';
                color = '#22C55E';
                details = 'Норма взрослых: ♂ 0,7-1,3 mg/dL (62-115 мкмоль/л); ♀ 0,6-1,1 mg/dL (53-97 мкмоль/л).';
            } else if (mgdl < 2.0) {
                interpretation = 'Умеренно повышен';
                color = '#F59E0B';
                details = 'Оценить рСКФ по CKD-EPI, проверить UACR, УЗИ почек при стойком повышении. Возможные причины: ХБП, преренальные (обезвоживание), лекарства (НПВС, ИАПФ, гентамицин).';
                actions = [
                    'CKD-EPI + UACR',
                    'Отменить нефротоксичные препараты',
                    'УЗИ почек при стойком повышении'
                ];
            } else {
                interpretation = 'Выраженно повышен';
                color = '#EF4444';
                details = 'Значительное снижение функции почек - ХБП 4-5 стадии или ОПП. Требует урологической/нефрологической оценки.';
                actions = [
                    'Дифф: AKI vs ХБП (динамика, УЗИ, анемия)',
                    'KDIGO AKI: ↑ на 0,3 mg/dL за 48 ч или в 1,5 раза за 7 дней',
                    'Срочная консультация нефролога при eGFR < 30'
                ];
            }
            return {
                value: `${mgdl.toFixed(2)} mg/dL = ${umol.toFixed(0)} мкмоль/л`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Креатинин зависит от мышечной массы - у пожилых и саркопеников нормальное значение может скрывать сниженную СКФ',
                    'Для оценки функции почек всегда считать eGFR (CKD-EPI) или клиренс (Cockcroft-Gault для доз лекарств)',
                    'ОПП требует динамической оценки - единичное значение недостаточно'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 0.6,
                            label: 'Низкий',
                            color: '#3B82F6'
                        },
                        {
                            min: 0.6,
                            max: 1.2,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 1.2,
                            max: 2.0,
                            label: 'Умер. ↑',
                            color: '#F59E0B'
                        },
                        {
                            min: 2.0,
                            max: 10,
                            label: 'Выраж. ↑',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(mgdl.toFixed(2)),
                    unit: 'mg/dL'
                },
                related: [
                    {
                        id: 'ckd-epi',
                        title: 'CKD-EPI (рСКФ)'
                    },
                    {
                        id: 'cockcroft',
                        title: 'Cockcroft-Gault'
                    },
                    {
                        id: 'unit-glucose',
                        title: 'Конверсия глюкозы'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.5',
                        title: 'Нефрология'
                    },
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    }
                ]
            };
        },
    reference: "мкмоль/л = mg/dL × 88,4 (молекулярная масса креатинина 113,12 г/моль).",
    countries: "Международный (США - mg/dL; СИ - мкмоль/л)",
    presets: [
      {
        label: "Норма ♂",
        values: {
          value: 1
        }
      },
      {
        label: "Норма ♀",
        values: {
          value: 0.8
        }
      },
      {
        label: "ХБП умеренная",
        values: {
          value: 1.6
        }
      },
      {
        label: "ХБП тяжёлая",
        values: {
          value: 3.5
        }
      }
    ],
    info: "### Для чего используется\nКонверсия креатинина между **mg/dL** (США) и **мкмоль/л** (СИ, Европа, РФ).\n\n### Формула\n`мкмоль/л = mg/dL × 88,4`\n`mg/dL = мкмоль/л ÷ 88,4`\n\nКоэффициент - молярная масса креатинина (113,12 г/моль), делённая на 100 и умноженная на 10000.\n\n### Нормы\n| Группа | mg/dL | мкмоль/л |\n|---|---|---|\n| Мужчины | 0,7-1,3 | 62-115 |\n| Женщины | 0,6-1,1 | 53-97 |\n| Дети 1-5 лет | 0,3-0,5 | 27-44 |\n| Дети 5-12 лет | 0,4-0,7 | 35-62 |\n\n### Быстрые ориентиры\n- 1 mg/dL ≈ 88 мкмоль/л\n- 1,5 mg/dL ≈ 133 мкмоль/л\n- 3 mg/dL ≈ 265 мкмоль/л\n\n### Ограничения\n- Единичный креатинин не отражает функцию почек - всегда считать eGFR\n- При ОПП креатинин отстаёт от реальной СКФ на 24-48 ч\n- Мышечная масса и диета существенно влияют\n\n### Тактика\n- При mg/dL > 1,5 / мкмоль/л > 130 - рассчитать eGFR (CKD-EPI)\n- При снижении eGFR < 60 стойко - критерий ХБП\n- Для дозирования DOACs/аминогликозидов - Cockcroft-Gault"
  };

export default runner;
