// @ts-nocheck
/**
 * Runner: lund-malmo
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
        id: "scr",
        hint: 'Креатинин сыворотки',
        label: "Креатинин сыворотки",
        type: "number",
        unit: "мкмоль/л",
        min: 20,
        max: 1200,
        step: 1,
        quickValues: [
          70,
          90,
          120,
          180,
          300
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
        step: 1,
        quickValues: [
          40,
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
      }
    ],
    compute: (v)=>{
            const scr = Number(v.scr);
            const age = Number(v.age);
            const female = v.sex === 'f';
            // Revised Lund-Malmö (Björk 2011) - piecewise on creatinine (µmol/L)
            // Female thresholds: < 150 vs ≥ 150
            // Male thresholds:   < 180 vs ≥ 180
            let x = 0;
            if (female) {
                x = scr < 150 ? 2.50 + 0.0121 * (150 - scr) : 2.50 - 0.926 * Math.log(scr / 150);
            } else {
                x = scr < 180 ? 2.56 + 0.00968 * (180 - scr) : 2.56 - 0.926 * Math.log(scr / 180);
            }
            const egfr = Math.exp(x - 0.0158 * age + 0.438 * Math.log(age));
            const v_ = egfr.toFixed(0);
            let interpretation = '', color = '', details = '', actions = [];
            let stage = '';
            if (egfr >= 90) {
                stage = 'G1 (норма или ↑)';
                color = '#22C55E';
            } else if (egfr >= 60) {
                stage = 'G2 (лёгкое ↓)';
                color = '#22C55E';
            } else if (egfr >= 45) {
                stage = 'G3a (лёгко-умеренное)';
                color = '#F59E0B';
            } else if (egfr >= 30) {
                stage = 'G3b (умеренно-выраженное)';
                color = '#F59E0B';
            } else if (egfr >= 15) {
                stage = 'G4 (тяжёлое)';
                color = '#EF4444';
            } else {
                stage = 'G5 (почечная недостаточность)';
                color = '#991B1B';
            }
            interpretation = `eGFR по LMR: ${v_} мл/мин/1,73 м² - ${stage}`;
            details = `**Revised Lund-Malmö (Björk 2011)** - европейский калькулятор eGFR, валидирован лучше CKD-EPI у пациентов > 70 лет и при сниженной мышечной массе. Формула кусочно-линейная по креатинину, поэтому точнее учитывает низкие/высокие значения.\n\n${egfr < 60 ? 'ХБП по KDIGO. Дозировку нефротоксических препаратов корректировать. При eGFR < 30 - избегать контрастных веществ, гадолиния, НПВС, метформина.' : 'Функция почек в норме или с лёгким снижением.'}`;
            actions = [
                egfr < 60 ? 'KDIGO: оценить альбуминурию (ACR), классифицировать по G/A, план ведения ХБП' : 'Плановый контроль каждые 12 мес (CKD-EPI + ACR)',
                egfr < 30 ? 'Избегать: иовыепропаноид контрасты (без профилактики), гадолиний (GBCA III группы), НПВС, метформин (> eGFR 30 - с осторожностью)' : '',
                egfr < 45 ? 'Корректировать дозы: метформин, DOAC, ванкомицин, аминогликозиды, антибиотики' : '',
                'Альтернативы: CKD-EPI 2021 (без расы), cystatin C при саркопении, измеренный GFR (51Cr-EDTA)',
                'При сомнениях - повтор через 4-12 нед + альбуминурия'
            ].filter(Boolean);
            return {
                value: v_,
                unit: 'мл/мин/1,73 м²',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'LMR валидирован на шведской популяции - в азиатской и афроамериканской может отличаться',
                    'У саркопении/цирроза креатинин занижен - eGFR переоценен; рассмотреть cystatin C',
                    'Острая ОПН - формула не применима (Scr не в steady-state)',
                    'У ампутаций, мышечной атрофии, высокобелковой диеты - ограниченная точность',
                    'BIS1/BIS2 (Berlin Initiative Study) - альтернатива для ≥ 70 лет'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 15,
                            label: 'G5',
                            color: '#991B1B'
                        },
                        {
                            min: 15,
                            max: 30,
                            label: 'G4',
                            color: '#EF4444'
                        },
                        {
                            min: 30,
                            max: 45,
                            label: 'G3b',
                            color: '#F59E0B'
                        },
                        {
                            min: 45,
                            max: 60,
                            label: 'G3a',
                            color: '#F59E0B'
                        },
                        {
                            min: 60,
                            max: 90,
                            label: 'G2',
                            color: '#22C55E'
                        },
                        {
                            min: 90,
                            max: 150,
                            label: 'G1',
                            color: '#22C55E'
                        }
                    ],
                    current: Number(v_),
                    unit: 'мл/мин/1,73 м²'
                },
                relatedCourses: [
                    {
                        id: '301.5',
                        title: 'Нефрология'
                    },
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    }
                ],
                related: [
                    {
                        id: 'ckd-epi',
                        title: 'CKD-EPI'
                    },
                    {
                        id: 'cockcroft',
                        title: 'Cockcroft-Gault'
                    },
                    {
                        id: 'cystatin',
                        title: 'Cystatin C eGFR'
                    },
                    {
                        id: 'mdrd',
                        title: 'MDRD'
                    }
                ]
            };
        },
    reference: "Björk J et al. Revised equations for estimated GFR from serum creatinine in adults with moderately impaired renal function. *Scand J Clin Lab Invest* 2011;71:232. Nyman U et al. *Scand J Clin Lab Invest* 2014;74:7.",
    countries: "Европа (Швеция, Скандинавия) · Международный",
    presets: [
      {
        label: "♂ 65 лет, Scr 110",
        values: {
          scr: 110,
          age: 65,
          sex: "m"
        }
      },
      {
        label: "♀ 80 лет, Scr 90",
        values: {
          scr: 90,
          age: 80,
          sex: "f"
        }
      },
      {
        label: "♂ 45 лет, Scr 200 (ХБП)",
        values: {
          scr: 200,
          age: 45,
          sex: "m"
        }
      }
    ],
    info: "### Для чего используется\n**Revised Lund-Malmö (LMR)** - европейская формула eGFR (Björk 2011), валидирована лучше CKD-EPI у пожилых и при сниженной мышечной массе. Использует **кусочно-линейную** зависимость от креатинина, что повышает точность в краях диапазона.\n\n### Формула\n`eGFR = e^(X − 0,0158 × age + 0,438 × ln(age))`\n\nX - функция пола и креатинина (мкмоль/л):\n\n| Пол | Scr | X |\n|---|---|---|\n| ♀ | < 150 | 2,50 + 0,0121 × (150 − Scr) |\n| ♀ | ≥ 150 | 2,50 − 0,926 × ln(Scr/150) |\n| ♂ | < 180 | 2,56 + 0,00968 × (180 − Scr) |\n| ♂ | ≥ 180 | 2,56 − 0,926 × ln(Scr/180) |\n\n### Стадии ХБП (KDIGO)\n| eGFR | Стадия |\n|---|---|\n| ≥ 90 | G1 |\n| 60-89 | G2 |\n| 45-59 | G3a |\n| 30-44 | G3b |\n| 15-29 | G4 |\n| < 15 | G5 |\n\n### Преимущества перед CKD-EPI\n- Лучше у > 70 лет (BIS1 и LMR сопоставимы)\n- Точнее при низких/высоких Scr (piecewise)\n- Без «расового» коэффициента\n\n### Ограничения\n- Валидация преимущественно на шведской популяции\n- Не применимо при ОПН\n- При саркопении - ложно завышено"
  };

export default runner;
