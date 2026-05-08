/**
 * Runner: henderson
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
        id: "ph",
        hint: 'pH крови. Норма: 7.35-7.45',
        label: "pH",
        type: "number",
        unit: "",
        min: 6.5,
        max: 7.8,
        step: 0.01,
        quickValues: [
          7.2,
          7.35,
          7.4,
          7.45,
          7.55
        ]
      },
      {
        id: "pco2",
        hint: 'Артериальное давление в мм ртутного столба',
        label: "PaCO₂",
        type: "number",
        unit: "мм рт.ст.",
        min: 10,
        max: 120,
        step: 0.1,
        quickValues: [
          25,
          35,
          40,
          45,
          55
        ]
      },
      {
        id: "hco3",
        hint: 'HCO₃⁻ сыворотки. Норма: 22-26 ммоль/л',
        label: "HCO₃⁻",
        type: "number",
        unit: "ммоль/л",
        min: 3,
        max: 50,
        step: 0.1,
        quickValues: [
          10,
          18,
          24,
          30
        ]
      },
      {
        id: "na",
        hint: 'Натрий сыворотки. Норма: 135-145 ммоль/л',
        label: "Na⁺",
        type: "number",
        unit: "ммоль/л",
        min: 100,
        max: 180,
        step: 0.1,
        quickValues: [
          135,
          140,
          145
        ]
      },
      {
        id: "cl",
        hint: 'Хлор. Норма: 96-106 ммоль/л',
        label: "Cl⁻",
        type: "number",
        unit: "ммоль/л",
        min: 60,
        max: 140,
        step: 0.1,
        quickValues: [
          98,
          102,
          105,
          110
        ]
      },
      {
        id: "albumin",
        hint: 'Альбумин. Норма: 35-50 г/л',
        label: "Альбумин (для коррекции AG)",
        type: "number",
        unit: "г/л",
        min: 10,
        max: 55,
        step: 0.1,
        quickValues: [
          20,
          30,
          40
        ]
      }
    ],
    compute: (v)=>{
            const ph = Number(v.ph);
            const pco2 = Number(v.pco2);
            const hco3 = Number(v.hco3);
            const na = Number(v.na);
            const cl = Number(v.cl);
            const alb = Number(v.albumin) || 40;
            const ag = na - (cl + hco3);
            const agCorrected = ag + 2.5 * (40 - alb) / 10;
            const winter = 1.5 * hco3 + 8;
            const winterLow = winter - 2;
            const winterHigh = winter + 2;
            const deltaAG = agCorrected - 12;
            const deltaHCO3 = 24 - hco3;
            const deltaRatio = deltaHCO3 !== 0 ? deltaAG / deltaHCO3 : 0;
            // Primary disorder
            let primary = '';
            let color = '#4B8DF5';
            const acidemia = ph < 7.35;
            const alkalemia = ph > 7.45;
            if (acidemia && hco3 < 22) {
                primary = 'Метаболический ацидоз';
                color = '#EF4444';
            } else if (acidemia && pco2 > 45) {
                primary = 'Респираторный ацидоз';
                color = '#EF4444';
            } else if (alkalemia && hco3 > 26) {
                primary = 'Метаболический алкалоз';
                color = '#3B82F6';
            } else if (alkalemia && pco2 < 35) {
                primary = 'Респираторный алкалоз';
                color = '#3B82F6';
            } else {
                primary = 'Смешанное / компенсированное расстройство';
                color = '#F59E0B';
            }
            // Analyse compensation
            const isMetAcid = primary === 'Метаболический ацидоз';
            const compensationOK = isMetAcid ? pco2 >= winterLow && pco2 <= winterHigh : true;
            const highAG = agCorrected > 12;
            let mixed = '';
            if (isMetAcid) {
                if (pco2 > winterHigh) mixed = 'Неадекватная компенсация (респираторный ацидоз сверху)';
                else if (pco2 < winterLow) mixed = 'Избыточная компенсация (сопутствующий респираторный алкалоз)';
            }
            // Delta ratio
            let deltaInterp = '';
            if (highAG) {
                if (deltaRatio < 0.4) deltaInterp = 'Δ/Δ < 0,4: HAGMA + NAGMA (смешанный)';
                else if (deltaRatio < 1) deltaInterp = 'Δ/Δ 0,4-1: HAGMA + NAGMA';
                else if (deltaRatio <= 2) deltaInterp = 'Δ/Δ 1-2: чистый HAGMA';
                else deltaInterp = 'Δ/Δ > 2: HAGMA + метаболический алкалоз (или хроническая респираторная компенсация)';
            }
            const details = `**pH ${ph}, PaCO₂ ${pco2}, HCO₃⁻ ${hco3}.**

**Первичное расстройство: ${primary}.**

AG = ${ag.toFixed(1)}, AG_corr (альб ${alb}) = **${agCorrected.toFixed(1)}** (норма 8-12).
${isMetAcid ? `Winter: ожидаемый PaCO₂ = 1,5 × ${hco3} + 8 = **${winter.toFixed(1)} ± 2** (${winterLow.toFixed(1)}-${winterHigh.toFixed(1)}). Фактический ${pco2} → ${compensationOK ? 'компенсация адекватна' : mixed}.\n\n` : ''}${highAG ? `Δ/Δ = (AG − 12) / (24 − HCO₃) = ${deltaAG.toFixed(1)} / ${deltaHCO3.toFixed(1)} = **${deltaRatio.toFixed(2)}** → ${deltaInterp}.` : ''}`;
            const actions = [
                isMetAcid ? 'Дифф. при ↑AG: MUDPILES (метанол, уремия, ДКА, лактат, этиленгликоль, салицилаты)' : '',
                isMetAcid && !highAG ? 'Дифф. при нормальном AG: HARDUPS (диарея, RTA, ИКА, парентеральное питание)' : '',
                primary === 'Респираторный ацидоз' ? 'Оценка ХОБЛ, опиоидной депрессии дыхания, нервно-мышечных болезней; NIV/IV при pH < 7,25' : '',
                primary === 'Метаболический алкалоз' ? 'Cl-чувствительный (рвота, диуретики) vs резистентный (гиперальдостеронизм, Барттер)' : '',
                primary === 'Респираторный алкалоз' ? 'Гипервентиляция: тревога, ТЭЛА, сепсис, салицилаты, беременность, печёночная недостаточность' : '',
                'Повторить газы через 30-60 мин после коррекции',
                'При любом тяжёлом расстройстве (pH < 7,2 или > 7,6) - консультация реаниматолога'
            ].filter(Boolean);
            return {
                value: primary,
                unit: `pH ${ph}`,
                interpretation: mixed || (compensationOK ? 'Простое расстройство с адекватной компенсацией' : 'Смешанное расстройство'),
                color,
                details,
                actions,
                caveats: [
                    'Анализ Henderson-Hasselbalch - стандарт; Stewart/SID-подход даёт дополнительную информацию при тяжёлых нарушениях',
                    'Winter применим только к метаболическому ацидозу; для алкалоза PaCO₂ = 0,7 × HCO₃ + 20 ± 5',
                    'Для хронического респираторного ацидоза HCO₃ ↑ на 3,5 за каждый ↑ PaCO₂ на 10; острого - на 1',
                    'AG-коррекция критична при гипоальбуминемии (-2,5 ммоль/л на каждые -10 г/л альбумина)',
                    'Δ/Δ < 1 требует двух дисбалансов - не забывать искать NAGMA даже при высоком AG'
                ],
                relatedCourses: [
                    {
                        id: '201.6',
                        title: 'Мочевыделительная физиология'
                    },
                    {
                        id: '202.5',
                        title: 'Клиническая биохимия'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ],
                related: [
                    {
                        id: 'anion-gap',
                        title: 'Анионный разрыв'
                    },
                    {
                        id: 'osm-gap',
                        title: 'Осмоляльный разрыв'
                    },
                    {
                        id: 'winter',
                        title: 'Winter формула'
                    }
                ]
            };
        },
    reference: "Berend K et al. Physiological approach to assessment of acid-base disturbances. *N Engl J Med* 2014;371:1434.",
    countries: "Международный",
    presets: [
      {
        label: "ДКА (HAGMA)",
        values: {
          ph: 7.15,
          pco2: 22,
          hco3: 8,
          na: 138,
          cl: 100,
          albumin: 40
        }
      },
      {
        label: "ХОБЛ (хрон. респ. ацидоз)",
        values: {
          ph: 7.34,
          pco2: 60,
          hco3: 32,
          na: 140,
          cl: 100,
          albumin: 38
        }
      },
      {
        label: "Рвота (мет. алкалоз)",
        values: {
          ph: 7.52,
          pco2: 48,
          hco3: 38,
          na: 140,
          cl: 92,
          albumin: 40
        }
      },
      {
        label: "Сепсис (лактат + респ.)",
        values: {
          ph: 7.25,
          pco2: 28,
          hco3: 12,
          na: 138,
          cl: 102,
          albumin: 28
        }
      }
    ],
    info: "### Для чего используется\n**Пошаговый анализ кислотно-щелочного состояния** (Henderson-Hasselbalch). Позволяет идентифицировать первичное расстройство, оценить адекватность компенсации и обнаружить скрытые смешанные нарушения.\n\n### Алгоритм (6 шагов)\n1. **pH** - acidemia (< 7,35) или alkalemia (> 7,45)?\n2. **HCO₃ / PaCO₂** - метаболическое или респираторное?\n3. **Компенсация** - Winter (мет. ацидоз), Bicarb rule (респ.)\n4. **AG (корр. по альбумину)** - высокий vs нормальный\n5. **Δ/Δ** - искать смешанные расстройства\n6. **Клинический контекст** - мнемоники MUDPILES / HARDUPS\n\n### Формулы компенсации\n| Расстройство | Ожидание |\n|---|---|\n| Мет. ацидоз (Winter) | PaCO₂ = 1,5 × HCO₃ + 8 ± 2 |\n| Мет. алкалоз | PaCO₂ = 0,7 × HCO₃ + 20 ± 5 |\n| Острый респ. ацидоз | ΔHCO₃ = 0,1 × ΔPaCO₂ |\n| Хрон. респ. ацидоз | ΔHCO₃ = 0,35 × ΔPaCO₂ |\n| Острый респ. алкалоз | ΔHCO₃ = −0,2 × ΔPaCO₂ |\n| Хрон. респ. алкалоз | ΔHCO₃ = −0,5 × ΔPaCO₂ |\n\n### Δ/Δ\n`Δ/Δ = (AG − 12) / (24 − HCO₃)`\n\n| Δ/Δ | Интерпретация |\n|---|---|\n| < 0,4 | HAGMA + NAGMA |\n| 1-2 | Чистый HAGMA |\n| > 2 | HAGMA + мет. алкалоз |"
  };

export default runner;
