/**
 * Runner: maggic
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
        id: "age",
        hint: 'Возраст в годах',
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 18,
        max: 100,
        step: 1,
        quickValues: [
          60,
          65,
          70,
          75,
          80
        ]
      },
      {
        id: "male",
        label: "Мужской пол",
        type: "checkbox"
      },
      {
        id: "bmi",
        hint: 'ИМТ = вес (кг) / рост² (м²)',
        label: "ИМТ",
        type: "number",
        unit: "кг/м²",
        min: 15,
        max: 50,
        step: 0.1,
        quickValues: [
          20,
          22,
          25,
          28,
          30,
          35
        ]
      },
      {
        id: "sbp",
        hint: 'САД, мм рт.ст. Норма: <130',
        label: "САД",
        type: "number",
        unit: "мм рт.ст.",
        min: 60,
        max: 220,
        step: 1,
        quickValues: [
          100,
          110,
          120,
          130,
          140
        ]
      },
      {
        id: "cr",
        hint: 'Креатинин сыворотки, мкмоль/л',
        label: "Креатинин",
        type: "number",
        unit: "мкмоль/л",
        min: 40,
        max: 800,
        step: 1,
        quickValues: [
          80,
          100,
          120,
          150,
          200
        ]
      },
      {
        id: "ef",
        hint: 'ФВ ЛЖ по Симпсону. Норма: ≥55%; СНнФВ: ≤40%',
        label: "ФВ ЛЖ",
        type: "number",
        unit: "%",
        min: 10,
        max: 75,
        step: 1,
        quickValues: [
          20,
          25,
          30,
          35,
          40,
          50
        ]
      },
      {
        id: "nyha",
        label: "NYHA класс",
        type: "select",
        options: [
          {
            value: "1",
            label: "I"
          },
          {
            value: "2",
            label: "II"
          },
          {
            value: "3",
            label: "III"
          },
          {
            value: "4",
            label: "IV"
          }
        ]
      },
      {
        id: "smoker",
        label: "Курит",
        type: "checkbox"
      },
      {
        id: "dm",
        label: "Сахарный диабет",
        type: "checkbox"
      },
      {
        id: "copd",
        label: "ХОБЛ",
        type: "checkbox"
      },
      {
        id: "recent",
        label: "Впервые диагностирована ХСН < 18 мес",
        type: "checkbox"
      },
      {
        id: "bb",
        label: "β-блокатор",
        type: "checkbox"
      },
      {
        id: "acei",
        label: "иАПФ / АРА",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const male = v.male === true;
            const bmi = Number(v.bmi);
            const sbp = Number(v.sbp);
            const cr = Number(v.cr);
            // креатинин мкмоль/л → мг/дл
            const crMg = cr / 88.4;
            const ef = Number(v.ef);
            const nyha = Number(v.nyha);
            const smoker = v.smoker === true;
            const dm = v.dm === true;
            const copd = v.copd === true;
            const recent = v.recent === true;
            const bb = v.bb === true;
            const acei = v.acei === true;
            // MAGGIC (Pocock 2013, Eur Heart J 2013;34:1404) - simplified integer points table
            let p = 0;
            // EF
            if (ef < 20) p += 7;
            else if (ef <= 24) p += 6;
            else if (ef <= 29) p += 5;
            else if (ef <= 34) p += 3;
            else if (ef <= 39) p += 2;
            else p += 0;
            // Age (additional points for higher EF)
            const ageBand = age < 55 ? 0 : age < 60 ? 1 : age < 65 ? 2 : age < 70 ? 4 : age < 75 ? 6 : age < 80 ? 8 : 10;
            let ageP = ageBand;
            if (ef >= 40) ageP = Math.round(ageBand * 1.5);
            p += ageP;
            // SBP (по EF-бендам)
            let sbpP = 0;
            if (ef < 30) {
                sbpP = sbp < 110 ? 5 : sbp < 120 ? 4 : sbp < 130 ? 3 : sbp < 140 ? 2 : sbp < 150 ? 1 : 0;
            } else if (ef < 40) {
                sbpP = sbp < 110 ? 3 : sbp < 120 ? 2 : sbp < 130 ? 1 : sbp < 140 ? 1 : 0;
            } else {
                sbpP = sbp < 110 ? 2 : sbp < 130 ? 1 : 0;
            }
            p += sbpP;
            // BMI
            p += bmi < 15 ? 6 : bmi < 20 ? 5 : bmi < 25 ? 3 : bmi < 30 ? 2 : 0;
            // Creatinine mg/dL
            p += crMg < 1.0 ? 0 : crMg < 1.2 ? 1 : crMg < 1.4 ? 2 : crMg < 1.6 ? 3 : crMg < 1.8 ? 4 : crMg < 2.0 ? 5 : crMg < 2.5 ? 6 : 8;
            // NYHA
            p += nyha === 1 ? 0 : nyha === 2 ? 2 : nyha === 3 ? 6 : 8;
            // Male
            if (male) p += 1;
            // Smoker
            if (smoker) p += 1;
            // Diabetes
            if (dm) p += 3;
            // COPD
            if (copd) p += 2;
            // HF <18 mo
            if (recent) p += 2;
            // NOT on β-blocker
            if (!bb) p += 3;
            // NOT on ACEi/ARB
            if (!acei) p += 1;
            const score = Math.max(0, Math.min(52, p));
            // Published 3y mortality from MAGGIC total score (approx interpolation)
            // 0 → 10 %, 10 → 20 %, 20 → 40 %, 30 → 65 %, ≥ 40 → 85 %
            const mort3y = score <= 5 ? 10 + score * 1 : score <= 10 ? 15 + (score - 5) * 1 : score <= 20 ? 20 + (score - 10) * 2 : score <= 30 ? 40 + (score - 20) * 2.5 : score <= 40 ? 65 + (score - 30) * 2 : Math.min(95, 85 + (score - 40) * 0.5);
            const mort1y = Math.max(2, mort3y / 2.3);
            let interpretation = '', color = '', details = '';
            let actions = [];
            if (score < 17) {
                interpretation = 'Низкий / умеренный риск';
                color = '#22C55E';
                details = '3-летняя смертность < 30 %. Продолжить оптимизацию GDMT.';
                actions = [
                    'Оптимизация GDMT (4 столпа)',
                    'Вакцинация (грипп, пневмококк, COVID)',
                    'Контроль волемии'
                ];
            } else if (score < 30) {
                interpretation = 'Высокий риск';
                color = '#F59E0B';
                details = '3-летняя смертность 30-60 %. Пересмотреть терапию, рассмотреть ИКД/СРТ при показаниях.';
                actions = [
                    'ARNI вместо иАПФ',
                    'SGLT2i обязательно',
                    'ИКД при EF ≤ 35 % + NYHA II-III',
                    'CRT при QRS > 130 мс + LBBB'
                ];
            } else {
                interpretation = 'Очень высокий риск';
                color = '#EF4444';
                details = '3-летняя смертность > 60 %. Направление в центр advanced HF для обсуждения LVAD / трансплантации.';
                actions = [
                    'Направление в advanced HF / транспл. центр',
                    'LVAD / трансплантация',
                    'Паллиативная консультация',
                    'Пересмотр GDMT переносимости'
                ];
            }
            return {
                value: String(score),
                unit: `баллов · 1 г ≈ ${mort1y.toFixed(0)} %, 3 г ≈ ${mort3y.toFixed(0)} %`,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Разработан в когорте HFrEF и HFpEF (n ≈ 39 000); меньше данных для NYHA IV',
                    'Упрощённая integer-таблица - возможна небольшая недооценка/переоценка vs оригинальная модель',
                    'Не учитывает NT-proBNP, железодефицит, ФП - рассмотреть как дополнение',
                    'На фоне ARNI/SGLT2i реальная смертность ниже табличной (эпоха разработки - до ARNI)'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 16,
                            label: 'Низкий',
                            color: '#22C55E'
                        },
                        {
                            min: 16,
                            max: 29,
                            label: 'Высокий',
                            color: '#F59E0B'
                        },
                        {
                            min: 29,
                            max: 52,
                            label: 'Очень высокий',
                            color: '#EF4444'
                        }
                    ],
                    current: score,
                    unit: 'баллов'
                },
                related: [
                    {
                        id: 'acc-aha-hf',
                        title: 'ACC/AHA стадии HF'
                    },
                    {
                        id: 'nyha',
                        title: 'NYHA'
                    },
                    {
                        id: 'nt-probnp',
                        title: 'NT-proBNP'
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
    reference: "Pocock SJ et al. Predicting survival in heart failure: the MAGGIC risk score. Eur Heart J 2013;34:1404-1413.",
    countries: "Международный",
    presets: [
      {
        label: "Компенс. HFrEF",
        values: {
          age: 65,
          male: true,
          bmi: 27,
          sbp: 125,
          cr: 100,
          ef: 35,
          nyha: "2",
          smoker: false,
          dm: false,
          copd: false,
          recent: false,
          bb: true,
          acei: true
        }
      },
      {
        label: "Декомпенс.",
        values: {
          age: 75,
          male: true,
          bmi: 22,
          sbp: 100,
          cr: 150,
          ef: 20,
          nyha: "3",
          smoker: false,
          dm: true,
          copd: true,
          recent: true,
          bb: false,
          acei: false
        }
      }
    ],
    info: "### Для чего используется\n**MAGGIC (Meta-Analysis Global Group in Chronic Heart Failure)** - риск-шкала прогнозирования **1- и 3-летней смертности** у пациентов с ХСН. Разработана на мета-анализе > 39 000 пациентов, применима как при HFrEF, так и HFpEF.\n\n### Предикторы (13 переменных → сумма 0-52)\n- Возраст, пол, ИМТ, САД, креатинин\n- ФВ ЛЖ, NYHA класс\n- Курение, сахарный диабет, ХОБЛ\n- ХСН впервые < 18 мес\n- Приём β-блокатора / иАПФ или АРА\n\n### Интерпретация\n| Баллы | 3-летняя смертность |\n|---|---|\n| 0-5 | 10-15 % |\n| 10 | ~ 20 % |\n| 20 | ~ 40 % |\n| 30 | ~ 65 % |\n| ≥ 40 | ≥ 85 % |\n\n### Ограничения\n- Разработана до эры ARNI и SGLT2i - реальная смертность на современной терапии ниже\n- Не учитывает NT-proBNP, ФП, железодефицит\n- Требует актуальной ФВ ЛЖ (ЭхоКГ)\n\n### Тактика\n- **Низкий** - оптимизация GDMT, ежегодный контроль\n- **Высокий** - ARNI + SGLT2i, обсудить ИКД/СРТ\n- **Очень высокий** - направление в advanced HF / трансплантационный центр"
  };

export default runner;
