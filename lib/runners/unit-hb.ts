// @ts-nocheck
/**
 * Runner: unit-hb
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
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
        label: "Гемоглобин",
        type: "number",
        unit: "g/dL",
        min: 3,
        max: 25,
        step: 0.1,
        quickValues: [
          8,
          10,
          12,
          13,
          14,
          15
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const gdl = Number(v.value);
            const gl = gdl * 10;
            const female = v.female === true;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            const lowerNorm = female ? 12 : 13;
            if (gdl < 7) {
                interpretation = 'Тяжёлая анемия';
                color = '#991B1B';
                details = 'Hb < 7 g/dL (< 70 g/L) — тяжёлая анемия. Порог трансфузии по большинству гайдлайнов (NICE, AABB) для стабильных пациентов; при ИБС / ОКС — Hb < 8 g/dL.';
                actions = [
                    'Решение о трансфузии: стабильный пациент — Hb < 7 g/dL; ИБС — < 8 g/dL',
                    'Поиск источника кровопотери (ЭГДС/колоноскопия при ЖДА без явной причины)',
                    'Ферритин, ретикулоциты, B12, фолат, ТТГ, креатинин'
                ];
            } else if (gdl < lowerNorm) {
                interpretation = 'Анемия (ВОЗ)';
                color = '#EF4444';
                details = `Hb ниже порога ВОЗ (${lowerNorm} g/dL для ${female ? 'женщин' : 'мужчин'}). Требуется дифф.: микроцитарная (ЖДА, талассемия), нормоцитарная (хронич. воспаление, ХБП, гемолиз), макроцитарная (B12/фолат, гипотиреоз, МДС).`;
                actions = [
                    'MCV + ретикулоциты + мазок',
                    'Ферритин, насыщение трансферрина (TSAT); B12, фолат при MCV > 100',
                    'При ЖДА — поиск кровопотери (скрытая кровь в кале, ЭГДС/колоно у > 50 лет)'
                ];
            } else if (gdl <= (female ? 16 : 17)) {
                interpretation = 'Норма';
                color = '#22C55E';
                details = `Норма ВОЗ: ♂ 13,0–17,0 g/dL (130–170 g/L); ♀ 12,0–16,0 g/dL (120–160 g/L).`;
            } else {
                interpretation = 'Эритроцитоз / полицитемия';
                color = '#F59E0B';
                details = 'Повышен Hb — дифф: относительный (обезвоживание), вторичный (гипоксия — ХОБЛ, апноэ сна, курение, высокогорье), первичный (истинная полицитемия — JAK2 V617F).';
                actions = [
                    'Исключить обезвоживание; пересдать',
                    'SpO₂, скрининг OSA (STOP-BANG), спирометрия',
                    'При стойком повышении — JAK2 V617F, ЭПО, консультация гематолога'
                ];
            }
            return {
                value: `${gdl.toFixed(1)} g/dL = ${gl.toFixed(0)} g/L`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'ВОЗ-пороги анемии: ♂ < 13, ♀ небеременные < 12, беременные < 11, дети 6 мес–5 лет < 11 g/dL',
                    'При беременности норма снижена: I триместр < 11; II–III < 10,5',
                    'У курильщиков и на высокогорье верхняя граница нормы сдвинута вверх',
                    'Псевдонорма при гемоконцентрации (дегидратация, диуретики)'
                ],
                scale: {
                    segments: [
                        {
                            min: 3,
                            max: 7,
                            label: 'Тяжёлая',
                            color: '#991B1B'
                        },
                        {
                            min: 7,
                            max: lowerNorm,
                            label: 'Анемия',
                            color: '#EF4444'
                        },
                        {
                            min: lowerNorm,
                            max: female ? 16 : 17,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: female ? 16 : 17,
                            max: 25,
                            label: 'Высокий',
                            color: '#F59E0B'
                        }
                    ],
                    current: Number(gdl.toFixed(1)),
                    unit: 'g/dL'
                },
                related: [
                    {
                        id: 'unit-bili',
                        title: 'Конверсия билирубина'
                    },
                    {
                        id: 'unit-creatinine',
                        title: 'Конверсия креатинина'
                    }
                ],
                relatedCourses: [
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    }
                ]
            };
        },
    reference: "g/L = g/dL × 10. Пороги анемии — WHO Hb cutoffs (2011).",
    countries: "Международный",
    presets: [
      {
        label: "Норма ♂",
        values: {
          value: 14.5,
          female: false
        }
      },
      {
        label: "Норма ♀",
        values: {
          value: 13,
          female: true
        }
      },
      {
        label: "ЖДА умеренная",
        values: {
          value: 9.5,
          female: true
        }
      },
      {
        label: "Тяжёлая анемия",
        values: {
          value: 6.5,
          female: false
        }
      }
    ],
    info: "### Для чего используется\nКонверсия между **g/dL** (США) и **g/L** (СИ, Европа, РФ).\n\n### Формула\n`g/L = g/dL × 10`\n`g/dL = g/L ÷ 10`\n\n### Нормы ВОЗ (2011)\n| Группа | g/dL | g/L |\n|---|---|---|\n| Мужчины ≥ 15 лет | ≥ 13,0 | ≥ 130 |\n| Женщины небеременные | ≥ 12,0 | ≥ 120 |\n| Беременные | ≥ 11,0 | ≥ 110 |\n| Дети 6 мес – 5 лет | ≥ 11,0 | ≥ 110 |\n| Дети 5–11 лет | ≥ 11,5 | ≥ 115 |\n\n### Степени анемии (ВОЗ)\n| Степень | Hb (g/dL) |\n|---|---|\n| Лёгкая | 11,0–верх. норма |\n| Умеренная | 8,0–10,9 |\n| Тяжёлая | < 8,0 |\n\n### Ограничения\n- При обезвоживании — ложно нормальный/повышенный Hb\n- Беременность: физиологическая гемодилюция\n- Горные регионы: адаптивный эритроцитоз — норма сдвинута вверх\n\n### Тактика\n- Анемия → MCV, ретикулоциты, ферритин, B12/фолат\n- Трансфузия: < 7 g/dL (стабильные) / < 8 (ИБС, ОКС)\n- Полицитемия → JAK2, ЭПО, SpO₂\n\n### Источник\nWHO. *Haemoglobin concentrations for the diagnosis of anaemia and assessment of severity*. VMNIS, 2011."
  };

export default runner;
