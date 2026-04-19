// @ts-nocheck
/**
 * Runner: rule-nines
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
        id: "head",
        label: "Голова и шея (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "armR",
        label: "Правая рука (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "armL",
        label: "Левая рука (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "chest",
        label: "Грудь / верх переднего туловища (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "abd",
        label: "Живот / низ переднего туловища (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "upBack",
        label: "Верхняя часть спины (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "loBack",
        label: "Нижняя часть спины (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "genitalia",
        label: "Промежность (1 %)",
        type: "checkbox",
        points: 1
      },
      {
        id: "legRA",
        label: "Правая нога, передняя (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "legRP",
        label: "Правая нога, задняя (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "legLA",
        label: "Левая нога, передняя (9 %)",
        type: "checkbox",
        points: 9
      },
      {
        id: "legLP",
        label: "Левая нога, задняя (9 %)",
        type: "checkbox",
        points: 9
      }
    ],
    compute: (v)=>{
            const inputs = [
                {
                    id: 'head',
                    points: 9
                },
                {
                    id: 'armR',
                    points: 9
                },
                {
                    id: 'armL',
                    points: 9
                },
                {
                    id: 'chest',
                    points: 9
                },
                {
                    id: 'abd',
                    points: 9
                },
                {
                    id: 'upBack',
                    points: 9
                },
                {
                    id: 'loBack',
                    points: 9
                },
                {
                    id: 'genitalia',
                    points: 1
                },
                {
                    id: 'legRA',
                    points: 9
                },
                {
                    id: 'legRP',
                    points: 9
                },
                {
                    id: 'legLA',
                    points: 9
                },
                {
                    id: 'legLP',
                    points: 9
                }
            ];
            let total = 0;
            for (const inp of inputs)if (v[inp.id] === true) total += inp.points;
            let interpretation = '', color = '#22C55E';
            if (total >= 20) {
                interpretation = 'Массивный ожог — ресусцитация по Parkland/Brooke, перевод в ожоговый центр';
                color = '#991B1B';
            } else if (total >= 10) {
                interpretation = 'Значительный ожог — инфузионная ресусцитация показана';
                color = '#EF4444';
            } else if (total >= 5) {
                interpretation = 'Умеренный ожог — оценить показания к госпитализации';
                color = '#F59E0B';
            } else {
                interpretation = 'Малый ожог — чаще амбулаторное лечение';
                color = '#22C55E';
            }
            return {
                value: `${total} %`,
                unit: 'TBSA',
                interpretation,
                color,
                details: `Суммарная площадь по **правилу девяток Wallace (1951)**: ${total} % TBSA. У детей использовать **Lund-Browder** — голова даёт больший процент, ноги меньший (см. info). Для оценки пятнистых ожогов — правило ладони: ладонь пациента (без пальцев) ≈ 1 % TBSA. Учитываются только ожоги **II и III степени**; поверхностная эритема (I ст.) не входит в расчёт.`,
                actions: [
                    total >= 20 ? 'Немедленно: 2 периферических катетера большого калибра, Рингер лактат по Parkland/Brooke' : 'Оценить показания к инфузионной ресусцитации (ABA: TBSA ≥ 10 %)',
                    total >= 10 ? 'Катетер Фолея, почасовой диурез, лактат, ЭКГ' : 'Перевязки, обезболивание, профилактика столбняка',
                    'Перевод в ожоговый центр при TBSA ≥ 10 %, ожогах лица/рук/промежности, электро-/химическом ожоге или подозрении на ингаляционное поражение',
                    'У детей применять Lund-Browder, а не правило девяток'
                ],
                caveats: [
                    'У детей голова составляет до 18 % TBSA (против 9 % у взрослых) — использовать Lund-Browder',
                    'Поверхностный ожог (I ст., эритема, солнечный ожог) не учитывается',
                    'Правило ладони (1 %) удобно для пятнистых / разрозненных ожогов',
                    'Завышение TBSA ведёт к избыточной инфузии и компартмент-синдромам'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 5,
                            label: 'Малый',
                            color: '#22C55E'
                        },
                        {
                            min: 5,
                            max: 10,
                            label: 'Умер.',
                            color: '#F59E0B'
                        },
                        {
                            min: 10,
                            max: 20,
                            label: 'Знач.',
                            color: '#EF4444'
                        },
                        {
                            min: 20,
                            max: 100,
                            label: 'Массив.',
                            color: '#991B1B'
                        }
                    ],
                    current: total,
                    unit: '% TBSA'
                },
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
                        id: 'modified-brooke',
                        title: 'Modified Brooke'
                    }
                ]
            };
        },
    reference: "Wallace \"rule of nines\" (1951). Lund-Browder (1944) — уточнённая схема, особенно у детей.",
    countries: "Международный (ATLS, ABA)",
    presets: [
      {
        label: "Вся правая рука",
        values: {
          armR: true
        }
      },
      {
        label: "Обе ноги (передняя часть)",
        values: {
          legRA: true,
          legLA: true
        }
      },
      {
        label: "Всё переднее туловище",
        values: {
          chest: true,
          abd: true
        }
      }
    ],
    info: "### Для чего используется\n**Правило девяток Wallace (1951)** — быстрый расчёт процента поражённой поверхности тела (%TBSA) при ожогах. Используется для решения о показаниях к инфузионной ресусцитации (Parkland/Brooke), переводе в ожоговый центр.\n\n### Правило девяток — взрослые\n| Область | % TBSA |\n|---|---|\n| Голова и шея | 9 |\n| Каждая рука | 9 (4,5 + 4,5) |\n| Передняя поверхность туловища | 18 (9 + 9) |\n| Задняя поверхность туловища | 18 (9 + 9) |\n| Каждая нога | 18 (9 + 9) |\n| Промежность | 1 |\n| **Итого** | **100** |\n\n### Lund-Browder — учёт возраста (у детей голова больше)\n| Область | Новорождённый | 1 год | 5 лет | 10 лет | Взрослый |\n|---|---|---|---|---|---|\n| Голова | 19 | 17 | 13 | 11 | 7 |\n| Одна нога (каждая) | 5,5 | 6,5 | 8 | 8,5 | 9,5 |\n| Туловище перед. | 13 | 13 | 13 | 13 | 13 |\n| Туловище задн. | 13 | 13 | 13 | 13 | 13 |\n\n### Правило ладони\nЛадонь пациента (без пальцев) ≈ **1 % TBSA**. Удобно для пятнистых ожогов.\n\n### Что учитывать\n- Только **II и III степени** (волдыри, полно-толщинные)\n- I степень (эритема, солнечный ожог) **НЕ учитывается**\n\n### Показания к ресусцитации и переводу (ABA)\n| Критерий | Порог |\n|---|---|\n| Инфузионная ресусцитация | ≥ 10 % взрослые, ≥ 10 % дети/пожилые |\n| Перевод в ожоговый центр | ≥ 10 % TBSA либо лицо / руки / стопы / промежность / суставы |\n| Электроожог, химический, ингаляционный | Всегда перевод |\n\n### Источник\nWallace AB. The exposure treatment of burns. *Lancet* 1951;1:501–504.\nLund CC, Browder NC. The estimation of areas of burns. *Surg Gynecol Obstet* 1944;79:352–358."
  };

export default runner;
