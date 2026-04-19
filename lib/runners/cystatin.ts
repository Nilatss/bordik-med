// @ts-nocheck
/**
 * Runner: cystatin
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
        id: "cysc",
        label: "Cystatin C",
        type: "number",
        unit: "мг/л",
        min: 0.3,
        max: 8,
        step: 0.01,
        quickValues: [
          0.6,
          0.8,
          1,
          1.5,
          2.5
        ]
      },
      {
        id: "age",
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 18,
        max: 110,
        step: 1,
        quickValues: [
          40,
          60,
          75,
          85
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
            const c = Number(v.cysc);
            const age = Number(v.age);
            const female = v.sex === 'f';
            const minTerm = Math.pow(Math.min(c / 0.8, 1), -0.499);
            const maxTerm = Math.pow(Math.max(c / 0.8, 1), -1.328);
            let egfr = 133 * minTerm * maxTerm * Math.pow(0.996, age);
            if (female) egfr *= 0.932;
            const val = egfr.toFixed(0);
            let stage = '', color = '';
            if (egfr >= 90) {
                stage = 'G1';
                color = '#22C55E';
            } else if (egfr >= 60) {
                stage = 'G2';
                color = '#22C55E';
            } else if (egfr >= 45) {
                stage = 'G3a';
                color = '#F59E0B';
            } else if (egfr >= 30) {
                stage = 'G3b';
                color = '#F59E0B';
            } else if (egfr >= 15) {
                stage = 'G4';
                color = '#EF4444';
            } else {
                stage = 'G5';
                color = '#991B1B';
            }
            return {
                value: val,
                unit: 'мл/мин/1,73 м²',
                interpretation: `eGFRcys ${val} — ХБП ${stage}`,
                color,
                details: `**CKD-EPI Cystatin C (Inker 2012)** — альтернатива креатинин-basic формулам, независима от мышечной массы. Особенно полезна при саркопении, циррозе, парализованных конечностях, ампутации, вегетарианстве, у пожилых. Комбинированная формула eGFRcr-cys (Inker 2012/2021) — **наиболее точная**, используйте её, когда доступны оба маркёра.`,
                actions: [
                    egfr < 60 ? 'KDIGO: добавить ACR для G/A-классификации' : 'Плановый контроль 12 мес',
                    'Cystatin C ↑ при гипертиреозе, ГКС, ожирении, курении — ложно ↓ eGFRcys',
                    'При расхождении eGFRcr vs eGFRcys > 20% — проверить SARC/изменения мышечной массы',
                    'Комбинированная eGFRcr-cys (CKD-EPI 2021) точнее, чем каждая в отдельности',
                    egfr < 30 ? 'Избегать нефротоксинов (НПВС, контрасты, аминогликозиды)' : ''
                ].filter(Boolean),
                caveats: [
                    'Cystatin C завышен при тиреотоксикозе, ГКС, ожирении, курении, воспалении',
                    'Cystatin C занижен при гипотиреозе, у циклоспорина',
                    'CKD-EPI 2012 cys — без расы; CKD-EPI 2021 — комбинированная cr-cys наиболее точная',
                    'Требует стандартизированного анализа (IFCC-калибровка); разные лаборатории могут давать разные значения',
                    'Острая ОПН — формула не применима'
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
                    current: Number(val),
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
                        title: 'CKD-EPI (Scr)'
                    },
                    {
                        id: 'lund-malmo',
                        title: 'LMR'
                    },
                    {
                        id: 'cockcroft',
                        title: 'Cockcroft-Gault'
                    },
                    {
                        id: 'mdrd',
                        title: 'MDRD'
                    }
                ]
            };
        },
    reference: "Inker LA et al. Estimating glomerular filtration rate from serum creatinine and cystatin C. *N Engl J Med* 2012;367:20. KDIGO 2012 CKD Guideline.",
    countries: "Международный (KDIGO)",
    presets: [
      {
        label: "♂ 50 лет, CysC 0,9",
        values: {
          cysc: 0.9,
          age: 50,
          sex: "m"
        }
      },
      {
        label: "♀ 75 лет, CysC 1,4",
        values: {
          cysc: 1.4,
          age: 75,
          sex: "f"
        }
      },
      {
        label: "♂ 60 лет цирроз, CysC 1,8",
        values: {
          cysc: 1.8,
          age: 60,
          sex: "m"
        }
      }
    ],
    info: "### Для чего используется\n**CKD-EPI Cystatin C (2012)** — формула eGFR на основе цистатина C, белка, фильтруемого гломерулами независимо от мышечной массы. Применяется как **confirmatory test** при пограничном eGFRcr или сомнении в точности (KDIGO 2012).\n\n### Формула\n`eGFRcys = 133 × min(CysC/0.8, 1)^(−0.499) × max(CysC/0.8, 1)^(−1.328) × 0.996^age × (0.932 if ♀)`\n\n### Когда предпочесть cystatin C\n| Ситуация | Причина |\n|---|---|\n| Саркопения, пожилые | Креатинин занижен → eGFRcr завышен |\n| Цирроз | То же |\n| Ампутация, параплегия | Низкая мышечная масса |\n| Вегетарианство, недоедание | Низкий приток креатинина |\n| Пограничный eGFRcr 45–60 | KDIGO confirmatory |\n\n### Когда НЕ использовать\n- Гипертиреоз, ГКС, ожирение, курение — ложно ↑ CysC\n- Острая ОПН\n\n### Лучшая практика\n**Комбинированная формула eGFRcr-cys (CKD-EPI 2021)** — наиболее точная из доступных.\n\n### Источник\nInker LA et al. *N Engl J Med* 2012;367:20.\nInker LA et al. *N Engl J Med* 2021;385:1737 (CKD-EPI 2021, без расы).\nKDIGO 2012 Clinical Practice Guideline for CKD.\n"
  };

export default runner;
