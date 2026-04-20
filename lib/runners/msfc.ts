// @ts-nocheck
/**
 * Runner: msfc
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
        id: "t25fw",
        label: "Timed 25-Foot Walk (T25FW), среднее 2 попытки",
        type: "number",
        unit: "с",
        min: 1,
        max: 180,
        step: 0.1,
        quickValues: [
          5,
          7,
          10,
          15,
          30
        ]
      },
      {
        id: "hpt",
        label: "9-Hole Peg Test (9HPT), среднее 2 рук × 2 попытки",
        type: "number",
        unit: "с",
        min: 10,
        max: 300,
        step: 0.1,
        quickValues: [
          18,
          22,
          30,
          50,
          100
        ]
      },
      {
        id: "pasat",
        label: "PASAT-3 (правильные ответы, 0-60)",
        type: "number",
        unit: "отв.",
        min: 0,
        max: 60,
        step: 1,
        quickValues: [
          60,
          55,
          45,
          30,
          15
        ]
      }
    ],
    compute: (v)=>{
            const t25 = Number(v.t25fw);
            const hpt = Number(v.hpt);
            const pasat = Number(v.pasat);
            // Reference population (Fischer 1999 task force) means / SDs
            const T25_REF_MEAN = 9.5238; // sec (reciprocal-based in original - упрощённая форма)
            const T25_REF_SD = 11.4308;
            const HPT_REF_MEAN = 0.0439; // 1/HPT seconds
            const HPT_REF_SD = 0.0101;
            const PASAT_REF_MEAN = 45.0435;
            const PASAT_REF_SD = 12.2744;
            // z-scores (MSFC orientation: higher = better; invert walk/peg times)
            const zWalk = -(t25 - T25_REF_MEAN) / T25_REF_SD;
            const zHpt = (1 / hpt - HPT_REF_MEAN) / HPT_REF_SD;
            const zPasat = (pasat - PASAT_REF_MEAN) / PASAT_REF_SD;
            const msfc = (zWalk + zHpt + zPasat) / 3;
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (msfc >= 0) {
                interpretation = 'В пределах/лучше референса';
                color = '#22C55E';
                details = 'Функция соответствует или превосходит референсную популяцию РС.';
                actions = [
                    'Продолжить ПИТРС',
                    'Повторная оценка через 6-12 мес',
                    'Мониторинг МРТ и EDSS'
                ];
            } else if (msfc >= -0.5) {
                interpretation = 'Лёгкое снижение';
                color = '#F59E0B';
                details = 'Умеренное отклонение от референса. Проверить прогрессирование по отдельным доменам.';
                actions = [
                    'Сравнить с предыдущими измерениями (Δ ≥ 20 % в домене - клинически значимо)',
                    'Оптимизация ПИТРС',
                    'Нейрореабилитация'
                ];
            } else {
                interpretation = 'Значимое снижение';
                color = '#EF4444';
                details = 'Существенное функциональное снижение. Рассмотреть эскалацию терапии.';
                actions = [
                    'Эскалация ПИТРС (натализумаб / окрелизумаб / S1P / кладрибин)',
                    'Интенсивная реабилитация, лечение симптомов',
                    'Исключить альтернативные причины ухудшения (ИМП, анемия, депрессия)',
                    'МРТ с контрастом для оценки активности'
                ];
            }
            return {
                value: msfc.toFixed(2),
                unit: 'z-score',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'MSFC основан на Task Force NMSS 1999 (Fischer) - референсная популяция из clinical trials',
                    '9HPT: использовать обратную величину (1/сек) для z-преобразования',
                    'PASAT имеет выраженный learning effect - нужны ≥2 ознакомительные попытки',
                    'PASAT не применим у пациентов с тяжёлой дислексией, глухотой; использовать SDMT как замену',
                    'Клинически значимая прогрессия: Δ MSFC ≥ 20 % или EDSS ≥ 1.0 (0.5 если EDSS ≥ 6)'
                ],
                scale: {
                    segments: [
                        {
                            min: -3,
                            max: -0.5,
                            label: '< −0.5 (ухудш.)',
                            color: '#EF4444'
                        },
                        {
                            min: -0.5,
                            max: 0,
                            label: '−0.5…0',
                            color: '#F59E0B'
                        },
                        {
                            min: 0,
                            max: 3,
                            label: '≥ 0 (норма)',
                            color: '#22C55E'
                        }
                    ],
                    current: Number(msfc.toFixed(2)),
                    unit: 'z'
                },
                related: [
                    {
                        id: 'edss',
                        title: 'EDSS'
                    },
                    {
                        id: 'mcdonald',
                        title: 'McDonald 2017'
                    },
                    {
                        id: 'mmse',
                        title: 'MMSE'
                    }
                ],
                relatedCourses: [
                    {
                        id: '201.3',
                        title: 'Нейрофизиология'
                    }
                ]
            };
        },
    reference: "Fischer JS, Rudick RA, Cutter GR, Reingold SC. The Multiple Sclerosis Functional Composite Measure (MSFC): an integrated approach to MS clinical outcome assessment. Mult Scler 1999;5:244-250.",
    countries: "Международный",
    info: "### Для чего используется\n**MSFC (Multiple Sclerosis Functional Composite, Fischer 1999)** - количественная композитная мера функции при рассеянном склерозе для клинических исследований. Состоит из 3 доменов, каждый z-преобразуется к референсной популяции NMSS Task Force и усредняется.\n\n### Формула\n`MSFC = (z_T25FW + z_9HPT + z_PASAT) / 3`\n\nгде:\n- `z_T25FW = −(T25FW − 9.5238) / 11.4308` (инверсия - больше секунд = хуже)\n- `z_9HPT = (1/9HPT − 0.0439) / 0.0101` (обратная величина)\n- `z_PASAT = (PASAT − 45.0435) / 12.2744`\n\n### Компоненты\n| Домен | Тест | Измерение |\n|---|---|---|\n| Нижние конечности | T25FW | Время на 25 футов (7.62 м), ×2 |\n| Верхние конечности | 9HPT | 9 отверстий-колышек, правая+левая, ×2 |\n| Когниции | PASAT-3 | Сложение последовательных цифр (60 стимулов, интервал 3 с) |\n\n### Интерпретация\nMSFC - z-score относительно референсной популяции РС.\n- **0** = средняя реконструкция референсной когорты\n- **−1.0** = 1 SD хуже\n- **+1.0** = 1 SD лучше\n- Клинически значимое изменение: **Δ 20 %** в любом компоненте или **Δ MSFC ≥ 0.5**\n\n### Альтернативы / расширения\n- **MSSS (Multiple Sclerosis Severity Score)** - EDSS, поправленный на длительность болезни (Roxburgh 2005)\n- **ARMSS (Age-Related MSSS)** - нормализация на возраст (Manouchehrinia 2017); не требует длительности\n- **MSFC-4** - MSFC + SDMT или LCVA\n- **SDMT (Symbol Digit Modalities Test)** - замена PASAT, лучше переносится\n\n### Ограничения\n- PASAT вызывает сильный стресс → SDMT предпочтительнее в клинике\n- Learning effect: первые 1-2 измерения малонадёжны\n- Нет оценки зрительной функции (Sloan LCVA добавляет её)\n- Z-score сложен для пациента; конвертация в клинические термины нужна\n\n### Тактика\n- MSFC падает ≥ 20 % в любом домене - рассмотреть эскалацию ПИТРС\n- Оценивать каждые 6-12 мес в клинических исследованиях\n- Использовать совместно с EDSS + MRI (NEDA-3/4)\n\n### Источник\nFischer JS et al. **The MSFC: an integrated approach to MS clinical outcome assessment.** *Mult Scler* 1999;5:244-250.\nПолезные расширения: Roxburgh 2005 (MSSS), Manouchehrinia 2017 (ARMSS)."
  };

export default runner;
