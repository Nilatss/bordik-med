/**
 * Runner: lbw
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
        id: "actualWeight",
        hint: 'Вес в кг (без одежды)',
        label: "Фактическая масса",
        type: "number",
        unit: "кг",
        min: 30,
        max: 300,
        step: 0.1,
        quickValues: [
          60,
          75,
          90,
          110,
          130
        ]
      },
      {
        id: "height",
        hint: 'Рост в см (без обуви)',
        label: "Рост",
        type: "number",
        unit: "см",
        min: 130,
        max: 220,
        step: 0.1,
        quickValues: [
          155,
          160,
          165,
          170,
          175,
          180,
          185
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const tbw = Number(v.actualWeight);
            const cm = Number(v.height);
            const m = cm / 100;
            const bmi = tbw / (m * m);
            const female = v.female === true;
            const lbw = female ? 9270 * tbw / (8780 + 244 * bmi) : 9270 * tbw / (6680 + 216 * bmi);
            const pctLbw = lbw / tbw * 100;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            if (bmi < 25) {
                interpretation = 'Нормальный BMI';
                color = '#22C55E';
                details = `LBW составляет ${pctLbw.toFixed(0)}% от TBW. При нормальном BMI разница между LBW и IBW невелика; дозирование по IBW или TBW обычно допустимо.`;
            } else if (bmi < 35) {
                interpretation = 'Ожирение - LBW применима';
                color = '#F59E0B';
                details = `LBW ${lbw.toFixed(1)} кг (${pctLbw.toFixed(0)}% TBW). Janmahasatian 2005 - современный стандарт для анестетиков (пропофол индукция, рокуроний), опиоидов (ремифентанил, фентанил).`;
            } else {
                interpretation = 'Выраженное ожирение';
                color = '#EF4444';
                details = `LBW ${lbw.toFixed(1)} кг. При BMI ≥ 35 LBW критически важна - дозирование пропофола по TBW может привести к передозировке и гемодинамическим осложнениям.`;
            }
            return {
                value: lbw.toFixed(1),
                unit: 'кг',
                interpretation,
                color,
                details,
                caveats: [
                    `BMI пациента: ${bmi.toFixed(1)} кг/м²`,
                    'LBW ≠ IBW: LBW зависит от фактической массы, IBW - только от роста',
                    'Формула Janmahasatian валидизирована на широком диапазоне BMI (17-70)',
                    'Старые формулы (James 1976, Hume 1966) завышают LBW при ожирении - не использовать'
                ],
                related: [
                    {
                        id: 'ibw-devine',
                        title: 'IBW (Devine)'
                    },
                    {
                        id: 'abw',
                        title: 'Adjusted BW'
                    },
                    {
                        id: 'bmi',
                        title: 'BMI'
                    }
                ],
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    }
                ]
            };
        },
    reference: "Janmahasatian S et al. Clin Pharmacokinet 2005;44:1051-1065. Современный стандарт LBW.",
    countries: "Международный",
    presets: [
      {
        label: "Норма ♂ 75/175",
        values: {
          actualWeight: 75,
          height: 175,
          female: false
        }
      },
      {
        label: "Норма ♀ 60/165",
        values: {
          actualWeight: 60,
          height: 165,
          female: true
        }
      },
      {
        label: "Ожирение ♂ 120/175",
        values: {
          actualWeight: 120,
          height: 175,
          female: false
        }
      },
      {
        label: "Морбидное ♀ 140/165",
        values: {
          actualWeight: 140,
          height: 165,
          female: true
        }
      }
    ],
    info: "### Для чего используется\n**Lean Body Weight (LBW)** по Janmahasatian (2005) - тощая масса тела, современный стандарт для дозирования **анестетиков и опиоидов** у пациентов с ожирением. Превосходит IBW и ABW по фармакокинетической точности.\n\n### Формула\n**Мужчины:** `LBW = 9270 × TBW / (6680 + 216 × BMI)`\n\n**Женщины:** `LBW = 9270 × TBW / (8780 + 244 × BMI)`\n\n### Применение (по BJA 2010, Ingrande-Lemmens)\n| Препарат | Доза по |\n|---|---|\n| Пропофол - индукция | LBW |\n| Пропофол - поддержание | TBW |\n| Рокуроний, векуроний | IBW или LBW |\n| Сукцинилхолин | TBW |\n| Ремифентанил, фентанил | LBW |\n| Суфентанил | TBW |\n| Парацетамол | IBW (макс 4 г/сут) |\n| Мидазолам | TBW (нагрузка), IBW (поддерж.) |\n\n### Сравнение с IBW/ABW\n| Масса | Зависит от | Основное применение |\n|---|---|---|\n| **IBW** (Devine) | Только рост + пол | Аминогликозиды (FDA), ИВЛ |\n| **ABW** | IBW + 40% избытка | Аминогликозиды при ожирении |\n| **LBW** (Janmahasatian) | TBW + BMI + пол | Анестетики, опиоиды |\n| **TBW** | Фактическая | Сукцинилхолин, НМГ лечение |\n\n### Преимущества Janmahasatian\n- Валидизирована на BMI 17-70 (включая морбидное ожирение)\n- Учитывает нелинейное изменение % жира с ростом BMI\n- Современный стандарт в анестезиологии\n\n### Ограничения\n- Не валидизирована у детей < 14 лет\n- Исходные данные - преимущественно европеоиды\n- Не учитывает крайние случаи (бодибилдеры с BMI > 30 и низким % жира)\n\n### Тактика\n- Пропофол индукция: 2 мг/кг × LBW (а не TBW - иначе гипотензия, апноэ)\n- Рокуроний: 0,6 мг/кг × IBW (или LBW)\n- Антибиотики периоперационные: цефазолин 2 г / 3 г при ≥ 120 кг"
  };

export default runner;
