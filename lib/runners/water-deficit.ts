// @ts-nocheck
/**
 * Runner: water-deficit
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
        id: "mode",
        label: "Ситуация",
        type: "select",
        options: [
          {
            value: "hyper",
            label: "ГиперNa - дефицит свободной воды"
          },
          {
            value: "hypo",
            label: "ГипоNa - дефицит Na"
          }
        ]
      },
      {
        id: "serumNa",
        label: "Na⁺ сыворотки",
        type: "number",
        unit: "ммоль/л",
        min: 100,
        max: 180,
        step: 0.1,
        quickValues: [
          118,
          125,
          135,
          145,
          155,
          165
        ]
      },
      {
        id: "targetNa",
        label: "Целевой Na⁺",
        type: "number",
        unit: "ммоль/л",
        min: 125,
        max: 150,
        step: 0.1,
        quickValues: [
          130,
          135,
          140,
          145
        ]
      },
      {
        id: "weight",
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 30,
        max: 200,
        step: 0.1,
        quickValues: [
          50,
          60,
          70,
          80,
          90
        ]
      },
      {
        id: "sex",
        label: "Пол",
        type: "select",
        options: [
          {
            value: "m",
            label: "Мужской"
          },
          {
            value: "f",
            label: "Женский"
          }
        ]
      },
      {
        id: "ageGroup",
        label: "Возраст",
        type: "select",
        options: [
          {
            value: "young",
            label: "Взрослый (< 65)"
          },
          {
            value: "elderly",
            label: "Пожилой (≥ 65)"
          }
        ]
      }
    ],
    compute: (v)=>{
            const mode = String(v.mode);
            const na = Number(v.serumNa);
            const target = Number(v.targetNa);
            const w = Number(v.weight);
            const sex = String(v.sex);
            const elderly = v.ageGroup === 'elderly';
            const factor = sex === 'm' ? elderly ? 0.5 : 0.6 : elderly ? 0.45 : 0.5;
            const tbw = factor * w;
            let value = '', unit = '', interpretation = '', color = '', details = '', actions = [];
            if (mode === 'hyper') {
                // Free water deficit to bring Na down to 140
                const deficit = tbw * (na / 140 - 1);
                value = deficit.toFixed(2);
                unit = 'л свободной воды';
                interpretation = deficit > 0 ? `Дефицит свободной воды ${deficit.toFixed(2)} л (до целевого Na 140)` : 'Дефицита свободной воды нет';
                color = deficit > 4 ? '#EF4444' : deficit > 2 ? '#F59E0B' : '#22C55E';
                details = `**Water deficit = TBW × (Na/140 − 1) = ${tbw.toFixed(1)} × (${na}/140 − 1) = ${deficit.toFixed(2)} л**.\n\nЗамещение: через 48-72 ч при хронической гиперNa; не более 10-12 ммоль/л/сут. Половину дефицита восполнить за первые 24 ч. Учитывать продолжающиеся потери (insensible ~ 30-40 мл/кг/сут + диурез).`;
                actions = [
                    `Восполнение: ½ дефицита (${(deficit / 2).toFixed(2)} л) за первые 24 ч, остальное за 24-48 ч`,
                    'Раствор: D5W перорально/через зонд при возможности; иначе в/в',
                    `Скорость снижения Na ≤ 0,5 ммоль/л/ч (≤ 10-12 / 24 ч) - риск отёка мозга при быстрой коррекции`,
                    'Контроль Na каждые 4-6 ч',
                    'Учитывать продолжающиеся потери: insensible ~ 30-40 мл/кг/сут + диурез'
                ];
            } else {
                // Na deficit for hyponatremia
                const naDeficit = tbw * (target - na);
                value = naDeficit.toFixed(0);
                unit = 'ммоль Na⁺';
                interpretation = naDeficit > 0 ? `Дефицит Na ${naDeficit.toFixed(0)} ммоль для достижения цели ${target} ммоль/л` : 'Na выше целевого';
                color = naDeficit > 300 ? '#EF4444' : naDeficit > 150 ? '#F59E0B' : '#22C55E';
                details = `**Na deficit = TBW × (target − serum) = ${tbw.toFixed(1)} × (${target} − ${na}) = ${naDeficit.toFixed(0)} ммоль**.\n\n3% NaCl содержит 513 ммоль/л → потребуется ${(naDeficit / 513).toFixed(2)} л. 0,9% NaCl (154 ммоль/л) → ${(naDeficit / 154).toFixed(1)} л. ВАЖНО: формула игнорирует продолжающиеся потери и осмотический баланс; реальная потребность ниже при неограниченной воде.`;
                actions = [
                    `**Цель: ≤ 8 ммоль/л/24 ч** при хронической гипоNa (≤ 10-12 при острой)`,
                    'Симптоматическая (судороги, Na < 120): 3% NaCl 150 мл за 10-20 мин, повторить до ↑ Na на 4-6',
                    `Полное замещение дефицита: ${(naDeficit / 513).toFixed(2)} л 3% NaCl ИЛИ ${(naDeficit / 154).toFixed(1)} л 0,9% NaCl`,
                    'Контроль Na каждые 2-4 ч в первые 24 ч',
                    'При сверхбыстрой коррекции - десмопрессин 2-4 мкг в/в + D5W для «re-lowering»'
                ];
            }
            return {
                value,
                unit,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'TBW оценивается по формуле Watson: у ожирения и отёков величина неточна',
                    'Игнорируются ongoing losses - при диурезе, лихорадке, диарее реальный дефицит выше',
                    'Не применимо при SIADH (основа - ограничение воды, а не введение Na)',
                    'Формула предсказывает статическую картину - мониторинг Na каждые 2-6 ч обязателен'
                ],
                relatedCourses: [
                    {
                        id: '201.6',
                        title: 'Мочевыделительная физиология'
                    },
                    {
                        id: '301.5',
                        title: 'Нефрология'
                    }
                ],
                related: [
                    {
                        id: 'adrogue-madias',
                        title: 'Adrogué-Madias'
                    },
                    {
                        id: 'na-corrected',
                        title: 'Коррекция Na по глюкозе'
                    },
                    {
                        id: 'plasma-osm',
                        title: 'Осмоляльность плазмы'
                    }
                ]
            };
        },
    reference: "Rose BD. Clinical Physiology of Acid-Base and Electrolyte Disorders (5th ed.). Adrogué HJ, Madias NE. *N Engl J Med* 2000.",
    countries: "Международный",
    presets: [
      {
        label: "ГиперNa 158, 70 кг",
        values: {
          mode: "hyper",
          serumNa: 158,
          targetNa: 140,
          weight: 70,
          sex: "m",
          ageGroup: "young"
        }
      },
      {
        label: "ГипоNa 122, 60 кг",
        values: {
          mode: "hypo",
          serumNa: 122,
          targetNa: 135,
          weight: 60,
          sex: "f",
          ageGroup: "young"
        }
      },
      {
        label: "Пожилая ГиперNa 155",
        values: {
          mode: "hyper",
          serumNa: 155,
          targetNa: 140,
          weight: 55,
          sex: "f",
          ageGroup: "elderly"
        }
      }
    ],
    info: "### Для чего используется\nРасчёт **дефицита свободной воды** (при гипернатриемии) и **дефицита Na** (при гипонатриемии) для планирования заместительной инфузионной терапии.\n\n### Формулы\n`Water deficit (л) = TBW × (Na / 140 − 1)`\n`Na deficit (ммоль) = TBW × (target Na − serum Na)`\n\n### TBW\n| Группа | Коэф. × масса |\n|---|---|\n| Молодой мужчина | 0,6 |\n| Молодая женщина / пожилой мужчина | 0,5 |\n| Пожилая женщина | 0,45 |\n\n### Скорость коррекции\n| Состояние | Максимум/24 ч |\n|---|---|\n| Хроническая гипо- или гиперNa | 8-10 ммоль/л |\n| Острая (< 48 ч) | до 12 ммоль/л |\n\n### Источник\nRose BD, Post TW. *Clinical Physiology of Acid-Base and Electrolyte Disorders* (5th ed.), 2001.\nAdrogué HJ, Madias NE. *N Engl J Med* 2000;342:1493 & 1581.\n"
  };

export default runner;
