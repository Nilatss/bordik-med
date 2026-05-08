/**
 * Runner: doac
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
        id: "drug",
        label: "Препарат",
        type: "select",
        options: [
          {
            value: "apixaban",
            label: "Апиксабан (Eliquis)"
          },
          {
            value: "rivaroxaban",
            label: "Ривароксабан (Xarelto)"
          },
          {
            value: "dabigatran",
            label: "Дабигатран (Pradaxa)"
          },
          {
            value: "edoxaban",
            label: "Эдоксабан (Lixiana)"
          }
        ]
      },
      {
        id: "indication",
        label: "Показание",
        type: "select",
        options: [
          {
            value: "af",
            label: "Неклапанная ФП"
          },
          {
            value: "vteTx",
            label: "Лечение ВТЭ"
          },
          {
            value: "vteProph",
            label: "Профилактика ВТЭ"
          },
          {
            value: "postHip",
            label: "После эндопротезирования ТБС/КС"
          }
        ]
      },
      {
        id: "crcl",
        label: "CrCl (Cockcroft-Gault)",
        type: "number",
        unit: "мл/мин",
        min: 5,
        max: 200,
        step: 1,
        quickValues: [
          15,
          30,
          50,
          70,
          90,
          120
        ]
      },
      {
        id: "age",
        hint: 'Возраст в годах',
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 18,
        max: 110,
        quickValues: [
          55,
          65,
          75,
          80,
          85
        ]
      },
      {
        id: "weight",
        hint: 'Вес в кг (без одежды)',
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
          90,
          100
        ]
      },
      {
        id: "scr",
        hint: 'Креатинин сыворотки',
        label: "Креатинин",
        type: "number",
        unit: "мкмоль/л",
        min: 30,
        max: 1000,
        step: 1,
        quickValues: [
          70,
          90,
          110,
          133,
          160
        ]
      }
    ],
    compute: (v)=>{
            const drug = String(v.drug);
            const ind = String(v.indication);
            const crcl = Number(v.crcl);
            const age = Number(v.age);
            const w = Number(v.weight);
            const scr = Number(v.scr);
            let dose = '';
            let rationale = '';
            let color = '#22C55E';
            let interpretation = 'Стандартная доза';
            if (drug === 'apixaban') {
                if (ind === 'af') {
                    if (crcl < 15) {
                        dose = 'Избегать / осторожно 2,5 мг × 2';
                        rationale = 'CrCl < 15 мл/мин - ограниченные данные';
                        color = '#EF4444';
                        interpretation = 'Избегать или с осторожностью';
                    } else {
                        const reduce = [
                            age >= 80,
                            w <= 60,
                            scr >= 133
                        ].filter(Boolean).length;
                        if (reduce >= 2) {
                            dose = '2,5 мг × 2 раза/сут';
                            rationale = `Сниженная доза: ≥ 2 критериев (возраст ≥ 80, масса ≤ 60 кг, креатинин ≥ 133 мкмоль/л)`;
                            color = '#F59E0B';
                            interpretation = 'Сниженная доза ФП';
                        } else {
                            dose = '5 мг × 2 раза/сут';
                            rationale = 'Стандартная доза при неклапанной ФП (ARISTOTLE)';
                        }
                    }
                } else if (ind === 'vteTx') {
                    dose = '10 мг × 2 × 7 дней, затем 5 мг × 2';
                    rationale = 'Схема AMPLIFY для лечения острой ВТЭ';
                    if (crcl < 30) {
                        color = '#F59E0B';
                        rationale += ' (при CrCl 15-29 - осторожно)';
                    }
                } else if (ind === 'vteProph') {
                    dose = '2,5 мг × 2 раза/сут';
                    rationale = 'Длительная вторичная профилактика после 6 мес лечения ВТЭ';
                } else {
                    dose = '2,5 мг × 2 раза/сут × 12 дней (КС) / 32-38 дней (ТБС)';
                    rationale = 'ADVANCE-2/3';
                }
            } else if (drug === 'rivaroxaban') {
                if (ind === 'af') {
                    if (crcl < 15) {
                        dose = 'Противопоказан';
                        color = '#991B1B';
                        interpretation = 'Противопоказан';
                        rationale = 'CrCl < 15 мл/мин';
                    } else if (crcl < 50) {
                        dose = '15 мг × 1 раз/сут с едой';
                        color = '#F59E0B';
                        interpretation = 'Сниженная доза';
                        rationale = 'CrCl 15-49 мл/мин (ROCKET-AF)';
                    } else {
                        dose = '20 мг × 1 раз/сут с едой';
                        rationale = 'Стандарт при неклапанной ФП';
                    }
                } else if (ind === 'vteTx') {
                    dose = '15 мг × 2 × 21 день, затем 20 мг × 1';
                    rationale = 'EINSTEIN-DVT/PE';
                    if (crcl < 30) {
                        color = '#F59E0B';
                        rationale += ' (CrCl 15-29 - осторожно)';
                    }
                } else if (ind === 'vteProph') {
                    dose = '10 мг × 1 раз/сут';
                    rationale = 'Длительная профилактика после лечения';
                } else {
                    dose = '10 мг × 1 раз/сут × 14 дней (КС) / 35 дней (ТБС)';
                    rationale = 'RECORD-1/3';
                }
            } else if (drug === 'dabigatran') {
                if (crcl < 30) {
                    dose = 'Противопоказан (ЕС). В США при CrCl 15-30 - 75 мг × 2';
                    color = '#991B1B';
                    interpretation = 'Противопоказан в ЕС';
                    rationale = 'CrCl < 30 мл/мин';
                } else if (ind === 'af') {
                    if (age >= 80) {
                        dose = '110 мг × 2 раза/сут';
                        color = '#F59E0B';
                        interpretation = 'Сниженная доза';
                        rationale = 'Возраст ≥ 80 (RE-LY)';
                    } else if (crcl < 50) {
                        dose = '110 мг × 2 раза/сут';
                        color = '#F59E0B';
                        interpretation = 'Сниженная доза';
                        rationale = 'CrCl 30-49 мл/мин';
                    } else {
                        dose = '150 мг × 2 раза/сут';
                        rationale = 'Стандарт (RE-LY)';
                    }
                } else if (ind === 'vteTx') {
                    dose = 'LMWH ≥ 5 дней, затем 150 мг × 2';
                    rationale = 'RE-COVER: парентеральный мост обязателен';
                } else {
                    dose = '220 мг × 1 раз/сут × 10 дней (КС) / 28-35 дней (ТБС)';
                    rationale = 'RE-MODEL / RE-NOVATE';
                }
            } else if (drug === 'edoxaban') {
                if (crcl < 15) {
                    dose = 'Противопоказан';
                    color = '#991B1B';
                    interpretation = 'Противопоказан';
                    rationale = 'CrCl < 15 мл/мин';
                } else if (ind === 'af' && crcl > 95) {
                    dose = 'НЕ использовать при ФП';
                    color = '#EF4444';
                    interpretation = 'Не рекомендован при CrCl > 95';
                    rationale = 'FDA black box: снижение эффективности при высокой СКФ';
                } else if (ind === 'af') {
                    const reduce = crcl <= 50 || w <= 60;
                    if (reduce) {
                        dose = '30 мг × 1 раз/сут';
                        color = '#F59E0B';
                        interpretation = 'Сниженная доза';
                        rationale = `${crcl <= 50 ? 'CrCl 15-50' : ''}${w <= 60 ? ' или масса ≤ 60 кг' : ''} (ENGAGE-AF)`;
                    } else {
                        dose = '60 мг × 1 раз/сут';
                        rationale = 'Стандарт при неклапанной ФП';
                    }
                } else if (ind === 'vteTx') {
                    const reduce = crcl <= 50 || w <= 60;
                    dose = `LMWH ≥ 5 дней, затем ${reduce ? '30' : '60'} мг × 1`;
                    rationale = 'Hokusai-VTE';
                } else {
                    dose = 'Не показан для профилактики ВТЭ';
                    color = '#6B7280';
                    interpretation = 'Показание не зарегистрировано';
                    rationale = '-';
                }
            }
            return {
                value: dose,
                unit: drug.toUpperCase(),
                interpretation,
                color,
                details: `${drug} · ${ind} при CrCl ${crcl} мл/мин, возраст ${age}, масса ${w} кг, креатинин ${scr} мкмоль/л.\n\nРекомендация: ${dose}.\n\nОбоснование: ${rationale}.`,
                actions: [
                    'Подтвердить CrCl по Cockcroft-Gault (не CKD-EPI!) - FDA/EMA требуют именно CrCl',
                    'Контроль функции почек: исходно, через 1 мес, далее каждые 6-12 мес (чаще при CrCl < 60 или возрасте > 75)',
                    'Исключить сильные ингибиторы P-gp/CYP3A4 (кетоконазол, ритонавир, циклоспорин) - требуют снижения дозы или отмены',
                    'При переходе с варфарина - дождаться INR < 2,0 перед началом DOAC',
                    'Оценить HAS-BLED для оценки риска кровотечения'
                ],
                caveats: [
                    'DOAC противопоказаны при механических клапанах и митральном стенозе (RE-ALIGN) - использовать варфарин',
                    'У пациентов с APS (антифосфолипидный синдром) DOAC уступают варфарину (TRAPS)',
                    'При CrCl < 15 мл/мин - данных мало, предпочтителен варфарин',
                    'У ожирения (> 120 кг или BMI > 40) ISTH 2021 рекомендует измерение уровня анти-Xa или варфарин',
                    'Эдоксабан при ФП + CrCl > 95 мл/мин НЕ использовать (FDA black box)'
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '301.5',
                        title: 'Нефрология'
                    }
                ],
                related: [
                    {
                        id: 'cockcroft',
                        title: 'CrCl (Cockcroft-Gault)'
                    },
                    {
                        id: 'warfarin',
                        title: 'Варфарин - старт'
                    },
                    {
                        id: 'has-bled',
                        title: 'HAS-BLED'
                    }
                ]
            };
        },
    reference: "ESC 2020 (A-fib) · EHRA Practical Guide 2021 · ACCP 2016 · FDA/EMA labels (RE-LY, ROCKET-AF, ARISTOTLE, ENGAGE-AF).",
    countries: "Международный (EHRA / ESC) · США (FDA) · ЕС (EMA)",
    presets: [
      {
        label: "Апиксабан ФП 70 лет, 80 кг",
        values: {
          drug: "apixaban",
          indication: "af",
          crcl: 70,
          age: 70,
          weight: 80,
          scr: 90
        }
      },
      {
        label: "Апиксабан ФП 85 лет, 55 кг",
        values: {
          drug: "apixaban",
          indication: "af",
          crcl: 45,
          age: 85,
          weight: 55,
          scr: 140
        }
      },
      {
        label: "Ривароксабан ФП, CrCl 40",
        values: {
          drug: "rivaroxaban",
          indication: "af",
          crcl: 40,
          age: 75,
          weight: 70,
          scr: 120
        }
      },
      {
        label: "Дабигатран ФП 82 года",
        values: {
          drug: "dabigatran",
          indication: "af",
          crcl: 55,
          age: 82,
          weight: 72,
          scr: 110
        }
      },
      {
        label: "Эдоксабан ВТЭ, 55 кг",
        values: {
          drug: "edoxaban",
          indication: "vteTx",
          crcl: 70,
          age: 65,
          weight: 55,
          scr: 85
        }
      }
    ],
    info: "### Для чего используется\nПодбор дозы прямых пероральных антикоагулянтов (DOAC) при неклапанной фибрилляции предсердий, ВТЭ и послеоперационной профилактике в зависимости от CrCl, возраста, массы и сопутствующих факторов.\n\n### Апиксабан (Eliquis)\n| Показание | Доза |\n|---|---|\n| Неклапанная ФП | **5 мг × 2** |\n| ФП + ≥ 2 факторов (возраст ≥ 80, масса ≤ 60 кг, Cr ≥ 133 мкмоль/л) | 2,5 мг × 2 |\n| CrCl < 15 | С осторожностью / избегать |\n| Лечение ВТЭ | 10 мг × 2 × 7 дней → 5 мг × 2 |\n| Вторичная профилактика ВТЭ | 2,5 мг × 2 |\n| Ортопедическая профилактика | 2,5 мг × 2 (КС 12 дн / ТБС 32-38 дн) |\n\n### Ривароксабан (Xarelto)\n| Показание | Доза |\n|---|---|\n| ФП, CrCl ≥ 50 | **20 мг × 1** с едой |\n| ФП, CrCl 15-49 | 15 мг × 1 |\n| ФП, CrCl < 15 | Противопоказан |\n| Лечение ВТЭ | 15 мг × 2 × 21 дн → 20 мг × 1 |\n| Ортопедическая профилактика | 10 мг × 1 (КС 14 дн / ТБС 35 дн) |\n\n### Дабигатран (Pradaxa)\n| Показание | Доза |\n|---|---|\n| ФП, возраст < 80, CrCl ≥ 50 | **150 мг × 2** |\n| ФП, возраст ≥ 80 или CrCl 30-49 | 110 мг × 2 |\n| CrCl < 30 | Противопоказан (ЕС); в США CrCl 15-30 → 75 мг × 2 |\n| Лечение ВТЭ | LMWH ≥ 5 дн → 150 мг × 2 |\n\n### Эдоксабан (Lixiana)\n| Показание | Доза |\n|---|---|\n| ФП, стандарт | **60 мг × 1** |\n| ФП + CrCl 15-50 или масса ≤ 60 кг или P-gp ингибитор | 30 мг × 1 |\n| ФП + CrCl > 95 | **НЕ использовать** (FDA black box) |\n| CrCl < 15 | Противопоказан |\n| Лечение ВТЭ | LMWH ≥ 5 дн → 60 (или 30) мг × 1 |\n\n### Когда НЕ использовать DOAC\n| Ситуация | Альтернатива |\n|---|---|\n| Механический клапанный протез | Варфарин (RE-ALIGN) |\n| Митральный стеноз (ревматический) | Варфарин |\n| Антифосфолипидный синдром (тройная позитивность) | Варфарин (TRAPS) |\n| Беременность, лактация | LMWH |\n| CrCl < 15 мл/мин | Варфарин или LMWH |\n| Ожирение > 120 кг / BMI > 40 | Измерение анти-Xa или варфарин (ISTH 2021) |\n\n### Взаимодействия\nСильные ингибиторы P-gp/CYP3A4 (кетоконазол, итраконазол, ритонавир, кобицистат) - избегать или снижать дозу. Индукторы (рифампицин, карбамазепин, зверобой) - снижают концентрацию, избегать.\n\n### Антидоты\n| Препарат | Антидот |\n|---|---|\n| Дабигатран | Идаруцизумаб (Praxbind) 5 г в/в |\n| Апиксабан, Ривароксабан, Эдоксабан | Андексанет альфа (Ondexxya) |\n| Все | ПКК 50 Ед/кг при недоступности специф. антидотов |"
  };

export default runner;
