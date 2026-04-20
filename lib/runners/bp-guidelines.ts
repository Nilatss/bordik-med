// @ts-nocheck
/**
 * Runner: bp-guidelines
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
        id: "guideline",
        label: "Гайдлайн",
        type: "select",
        options: [
          {
            value: "accaha",
            label: "ACC/AHA 2017"
          },
          {
            value: "esc",
            label: "ESC/ESH 2023"
          },
          {
            value: "nice",
            label: "NICE NG136 (2019)"
          },
          {
            value: "rko",
            label: "РКО 2022 (Россия)"
          }
        ]
      },
      {
        id: "age",
        label: "Возрастная группа",
        type: "select",
        options: [
          {
            value: "adult",
            label: "Взрослый <65 лет"
          },
          {
            value: "older",
            label: "65-79 лет"
          },
          {
            value: "elder80",
            label: "≥80 лет"
          }
        ]
      },
      {
        id: "comorbidity",
        label: "Сопутствующее",
        type: "select",
        options: [
          {
            value: "none",
            label: "Нет"
          },
          {
            value: "dm",
            label: "Сахарный диабет"
          },
          {
            value: "ckd",
            label: "ХБП"
          },
          {
            value: "cv",
            label: "ССЗ (ИБС, инсульт, PAD)"
          },
          {
            value: "hf",
            label: "ХСН"
          }
        ]
      }
    ],
    compute: (v)=>{
            const g = String(v.guideline);
            const age = String(v.age);
            const com = String(v.comorbidity);
            let sbp = 0, dbp = 0;
            let interpretation = '';
            let details = '';
            let actions = [];
            let color = '#22C55E';
            if (g === 'accaha') {
                // ACC/AHA 2017: <130/80 for all
                sbp = 130;
                dbp = 80;
                interpretation = `Цель АД <${sbp}/${dbp} мм рт. ст. (ACC/AHA 2017)`;
                details = 'ACC/AHA 2017 определяет гипертензию как ≥130/80 и рекомендует целевое АД <130/80 для всех категорий, включая пожилых, СД, ХБП и ССЗ. Основано на SPRINT (2015) - intensive (<120) снизил ССЗ-события на 25% vs standard (<140).';
                color = '#3B82F6';
                actions = [
                    'При АД ≥140/90 - немедленное начало фармакотерапии',
                    'При АД 130-139/80-89 + ASCVD ≥10% - фармакотерапия',
                    '1-я линия: тиазидоподобные (chlorthalidone), БКК, ИАПФ/БРА',
                    'Модификация образа жизни: DASH, Na <1,5 г/д, физическая нагрузка, снижение алкоголя'
                ];
            } else if (g === 'esc') {
                // ESC/ESH 2023
                if (age === 'elder80') {
                    sbp = 140;
                    dbp = 80;
                    interpretation = `Цель АД <${sbp}/${dbp} мм рт. ст. (ESC 2023, ≥80 лет)`;
                    details = 'У пациентов ≥80 лет ESC/ESH 2023 рекомендует начать при САД ≥160, цель САД 130-139 мм рт. ст. при хорошей переносимости. Соблюдать осторожность при ортостатике и фрагильности.';
                    color = '#F59E0B';
                    actions = [
                        'Начать при АД ≥160/90',
                        'Цель САД 130-139 при переносимости',
                        'Оценить ортостатику, функциональный статус',
                        'Избегать резкого снижения; учитывать фрагильность'
                    ];
                } else if (age === 'older') {
                    sbp = 130;
                    dbp = 80;
                    interpretation = `Цель АД 130-140/70-80 мм рт. ст. (ESC 2023, 65-79 лет)`;
                    details = 'ESC/ESH 2023: первичная цель САД <140; при хорошей переносимости - 130-140/70-80 мм рт. ст. у пожилых 65-79.';
                    color = '#3B82F6';
                    actions = [
                        'Начать фармакотерапию при АД ≥140/90',
                        'Цель САД 130-140, ДАД 70-80',
                        'Предпочтительно: ИАПФ/БРА + БКК или тиазид; SPC (фиксированные комбинации)'
                    ];
                } else {
                    sbp = 120;
                    dbp = 70;
                    interpretation = `Цель АД 120-130/70-80 мм рт. ст. (ESC 2023, <65 лет)`;
                    details = 'ESC/ESH 2023: у пациентов <65 лет первичная цель АД <140/90, затем 120-130/70-80 при хорошей переносимости. Для большинства пациентов.';
                    color = '#22C55E';
                    actions = [
                        'Начать при АД ≥140/90 (или ≥130/80 при высоком ССР)',
                        'Цель 120-130/70-80',
                        'SPC (single pill combination) с первого шага',
                        'ABPM/HBPM для подтверждения'
                    ];
                }
                if (com === 'ckd') {
                    details += ' При ХБП - аналогичная цель, предпочтительно ИАПФ/БРА (нефропротекция).';
                }
                if (com === 'dm') {
                    details += ' При СД - цель САД <130 при переносимости (ESC 2023).';
                }
            } else if (g === 'nice') {
                if (age === 'elder80') {
                    sbp = 150;
                    dbp = 90;
                    interpretation = `Цель АД <${sbp}/${dbp} мм рт. ст. (NICE NG136, ≥80 лет)`;
                    details = 'NICE NG136 (2019): у пациентов ≥80 лет целевое клиническое АД <150/90 (HBPM/ABPM <145/85). Более консервативный подход, основан на риск-пользе в старшем возрасте.';
                    color = '#F59E0B';
                    actions = [
                        'Клиническое АД <150/90',
                        'ABPM/HBPM <145/85',
                        'Начать при стадии 2 (клин. ≥160/100 или ABPM ≥150/95)'
                    ];
                } else {
                    sbp = 140;
                    dbp = 90;
                    interpretation = `Цель АД <${sbp}/${dbp} мм рт. ст. (NICE NG136, <80 лет)`;
                    details = 'NICE NG136 (2019): целевое клиническое АД <140/90 (HBPM/ABPM <135/85) у <80 лет. При СД2 - те же цели (CKD отдельно).';
                    color = '#3B82F6';
                    actions = [
                        'Клиническое АД <140/90 (HBPM/ABPM <135/85)',
                        '1-я линия <55 не-Black: ИАПФ/БРА; ≥55 или Black любого возраста: БКК',
                        'Стадия 1 (клин. ≥140/90, ABPM ≥135/85) + ССР ≥10% / TOD / СД / ССЗ → фармакотерапия'
                    ];
                }
            } else {
                // РКО 2022
                sbp = 130;
                dbp = 80;
                interpretation = `Цель АД 120-130/70-80 мм рт. ст. (РКО 2022)`;
                details = 'РКО 2022 (Российское кардиологическое общество): первичная цель <140/90, затем 120-130/70-80 при переносимости. Для пожилых ≥65: 130-140/70-80.';
                color = '#3B82F6';
                actions = [
                    'Начать при АД ≥140/90 (≥130/80 при высоком ССР)',
                    'Цель первичная <140/90, далее 120-130/70-80',
                    '1-я линия: ИАПФ/БРА + БКК или тиазид (SPC)',
                    'СМАД для подтверждения, скрининг вторичной АГ'
                ];
            }
            return {
                value: `${sbp}/${dbp}`,
                unit: 'мм рт. ст.',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Целевое АД в клинике отличается от ABPM/HBPM (примерно -5/-5 для дома)',
                    'У ≥80 лет при фрагильности цели могут быть мягче (индивидуально)',
                    'При ортостатике, дроппинг >20/10 - осторожность с интенсификацией',
                    'ACC/AHA и ESC различаются в определении гипертензии (≥130/80 vs ≥140/90)'
                ],
                related: [
                    {
                        id: 'abpm',
                        title: 'ABPM / HBPM'
                    },
                    {
                        id: 'htn-tod',
                        title: 'HTN Target Organ Damage'
                    },
                    {
                        id: 'ascvd',
                        title: 'ASCVD Risk'
                    },
                    {
                        id: 'score2',
                        title: 'SCORE2'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    }
                ]
            };
        },
    reference: "Whelton PK et al. 2017 ACC/AHA Guideline. JACC 2018;71:e127-e248. Mancia G et al. 2023 ESH Guidelines. J Hypertens 2023;41:1874-2071. NICE NG136 (2019). РКО Клинические рекомендации АГ 2022.",
    countries: "США (ACC/AHA) · ЕС (ESC/ESH) · Великобритания (NICE) · РФ (РКО)",
    presets: [
      {
        label: "ESC 2023, 50 лет, нет сопутствующих",
        values: {
          guideline: "esc",
          age: "adult",
          comorbidity: "none"
        }
      },
      {
        label: "ESC 2023, 75 лет",
        values: {
          guideline: "esc",
          age: "older",
          comorbidity: "none"
        }
      },
      {
        label: "ACC/AHA, 65 лет, СД",
        values: {
          guideline: "accaha",
          age: "older",
          comorbidity: "dm"
        }
      },
      {
        label: "NICE ≥80 лет",
        values: {
          guideline: "nice",
          age: "elder80",
          comorbidity: "none"
        }
      },
      {
        label: "РКО, 60 лет, ИБС",
        values: {
          guideline: "rko",
          age: "adult",
          comorbidity: "cv"
        }
      }
    ],
    info: "### Для чего используется\nСравнение **целевых уровней АД** по четырём ведущим гайдлайнам: ACC/AHA 2017, ESC/ESH 2023, NICE NG136, РКО 2022.\n\n### Определение гипертензии\n| Гайдлайн | Порог (клин.) | Порог (ABPM дневн.) |\n|---|---|---|\n| ACC/AHA 2017 | ≥130/80 | ≥130/80 |\n| ESC/ESH 2023 | ≥140/90 | ≥135/85 |\n| NICE NG136 | ≥140/90 | ≥135/85 |\n| РКО 2022 | ≥140/90 | ≥135/85 |\n\n### Целевые уровни АД\n| Гайдлайн | Общая популяция | ≥65 | ≥80 | СД / ХБП |\n|---|---|---|---|---|\n| **ACC/AHA** | <130/80 | <130/80 | <130/80 | <130/80 |\n| **ESC/ESH** | 120-130/70-80 | 130-140/70-80 | 130-140/70-80 | <130/80 |\n| **NICE** | <140/90 | <140/90 | <150/90 | <140/90 (<130/80 при ХБП+альб) |\n| **РКО** | 120-130/70-80 | 130-140/70-80 | 130-140/70-80 | <130/80 |\n\n### Модификация образа жизни (все гайдлайны)\n- **Диета DASH**, Na <2 г/д (ESC) / <1,5 г (ACC/AHA)\n- **Физическая активность** ≥150 мин/нед умеренной\n- **Снижение массы** (снижение на 1 кг ≈ −1 мм рт. ст. САД)\n- **Алкоголь** ≤14 (♂) / ≤8 (♀) единиц в неделю\n- **Отказ от курения**\n\n### Фармакотерапия 1-й линии\n| Класс | Когда | Примеры |\n|---|---|---|\n| ИАПФ / БРА | <55 не-Black (NICE); большинство (ESC) | Периндоприл, рамиприл, телмисартан |\n| БКК (дигидропиридины) | ≥55 / Black (NICE); все (ESC) | Амлодипин, лерканидипин |\n| Тиазид / тиазидоподобный | Все гайдлайны | Индапамид, хлорталидон |\n| β-блокатор | ИБС, ХСН, аритмии, беременность | Бисопролол, небиволол |\n\n**ESC 2023:** SPC (single pill combination) с 1-го шага: ИАПФ/БРА + БКК или тиазид.\n\n### Особые группы\n| Группа | Особенность |\n|---|---|\n| Беременные | Метилдопа, лабеталол, нифедипин; ИАПФ/БРА противопоказаны |\n| Чёрная раса | БКК или тиазид предпочтительнее (NICE) |\n| Резистентная АГ | + спиронолактон (PATHWAY-2); исключить вторичные причины |\n| ХБП | ИАПФ/БРА + возможно SGLT2i (при СД2 или протеинурии) |\n\n### Ограничения\n- SPRINT (<120) проводился с офисным АВТОМАТИЧЕСКИМ АД без врача - эквивалентен ~130 в обычной клинике\n- Цели у пожилых с ортостатикой, фрагильностью - индивидуально\n- NICE более консервативна; ACC/AHA более агрессивна\n\n### Источник\nWhelton PK et al. **2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults.** *JACC* 2018;71:e127-e248. Mancia G et al. **2023 ESH Guidelines for the management of arterial hypertension.** *J Hypertens* 2023;41:1874-2071. NICE **NG136 (2019) Hypertension in adults: diagnosis and management**. РКО **Клинические рекомендации «Артериальная гипертензия у взрослых» (2022)**."
  };

export default runner;
