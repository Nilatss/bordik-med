// @ts-nocheck
/**
 * Runner: maddrey
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
        id: "pt",
        label: "ПВ пациента",
        type: "number",
        unit: "сек",
        hint: "Протромбиновое время",
        quickValues: [
          14,
          18,
          22,
          26,
          30
        ]
      },
      {
        id: "ptc",
        label: "ПВ контроль",
        type: "number",
        unit: "сек",
        hint: "Контрольное ПВ лаборатории",
        quickValues: [
          11,
          12,
          13,
          14
        ]
      },
      {
        id: "bil",
        label: "Общий билирубин",
        type: "number",
        unit: "мкмоль/л",
        hint: "Будет переведён в мг/дл",
        quickValues: [
          50,
          100,
          200,
          300,
          500
        ]
      }
    ],
    compute: (v)=>{
            const pt = Number(v.pt), ptc = Number(v.ptc);
            const bilMgDl = Number(v.bil) / 17.1; // µmol/L → mg/dL
            const df = 4.6 * (pt - ptc) + bilMgDl;
            const value = df.toFixed(1);
            const common = {
                caveats: [
                    'Зависит от тромбопластина лаборатории - используйте контрольное ПВ той же лаборатории, не INR',
                    'Не валидизирован при тяжёлой ХПН (искажение коагуляционных показателей)',
                    'MELD ≥ 21 - современный альтернативный критерий тяжёлого АГ (AASLD 2020)',
                    'Не заменяет скрининг инфекций (SBP, пневмония, бактериемия) перед стартом ГКС'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 32,
                            label: 'Лёгкий',
                            color: '#10B981'
                        },
                        {
                            min: 32,
                            max: 100,
                            label: 'Тяжёлый',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(value),
                    unit: 'DF'
                },
                relatedCourses: [
                    {
                        id: '301.3',
                        title: "Гастроэнтерология"
                    }
                ],
                related: [
                    {
                        id: 'lille',
                        title: 'Lille (день 7)'
                    },
                    {
                        id: 'meld',
                        title: 'MELD'
                    }
                ]
            };
            if (df < 32) return {
                value,
                unit: 'DF',
                interpretation: 'DF < 32 - лёгкий алкогольный гепатит. ГКС не показаны.',
                color: '#10B981',
                details: 'Лёгкий-средний АГ: 1-месячная смертность < 10%. Глюкокортикоиды не улучшают прогноз - ориентируйтесь на базисную терапию и полную абстиненцию.',
                actions: [
                    'Полная абстиненция + нутритивная поддержка (35-40 ккал/кг, белок 1,2-1,5 г/кг)',
                    'Тиамин, фолат, витамины группы B, цинк',
                    'Лечение синдрома отмены (бензодиазепины, CIWA-Ar протокол)',
                    'Скрининг гепатита B/C, коинфекций'
                ],
                ...common
            };
            return {
                value,
                unit: 'DF',
                interpretation: 'DF ≥ 32 - тяжёлый алкогольный гепатит. Рассмотреть преднизолон 40 мг/сут (Lille на 7-й день).',
                color: '#EF4444',
                details: 'Тяжёлый АГ: 1-месячная смертность 30-50%. Преднизолон 40 мг/сут × 28 дней улучшает выживаемость при отсутствии противопоказаний (активная инфекция, ЖКТ-кровотечение, неконтролируемый диабет, HBV/HCV в активной фазе).',
                actions: [
                    'Исключить противопоказания: инфекция, ЖКТ-кровотечение, ОПП (HRS), активный HBV/HCV',
                    'Преднизолон 40 мг/сут × 28 дней + N-ацетилцистеин в/в',
                    'На 7-й день - Lille score: ≥ 0,45 → отменить ГКС, обсудить раннюю трансплантацию',
                    'Нутритивная поддержка, профилактика SBP, лечение энцефалопатии'
                ],
                ...common
            };
        },
    reference: "Maddrey WC. Gastroenterology 1978. DF = 4,6×(PT−PT_control)+билирубин(mg/dL).",
    info: "### Что считает калькулятор\n**Discriminant Function (DF)** Maddrey - оценка тяжести **острого алкогольного гепатита** и решение о назначении глюкокортикоидов.\n\n### Формула\n`DF = 4,6 × (ПВ_пациента − ПВ_контроль) + билирубин (mg/dL)`\n\nВ ToolView билирубин автоматически переводится из мкмоль/л → mg/dL (÷ 17,1).\n\n### Интерпретация\n- **DF < 32** - лёгкий-средний АГ. ГКС **не показаны**, 1-мес смертность < 10 %.\n- **DF ≥ 32** - тяжёлый АГ. 1-мес смертность 30-50 %. **Преднизолон 40 мг/сут × 28 дней** (если нет противопоказаний: активная инфекция, ЖКТ-кровотечение, ОПН, HBV/HCV в активной фазе, неконтролируемый диабет).\n\n### Что делать на 7-й день преднизолона\nРассчитать **Lille score**:\n- Lille < 0,45 - ответ есть, продолжить курс до 28 дней + 2 нед таппер\n- Lille ≥ 0,45 - нет ответа, отменить ГКС, обсудить трансплантацию\n\n### Альтернативы / комплементарные шкалы\n- **MELD** ≥ 21 - также критерий тяжёлого АГ (АASLD 2020)\n- **GAHS** (Glasgow Alcoholic Hepatitis Score) ≥ 9 - независимо предсказывает смертность\n- **ABIC** (Age-Bilirubin-INR-Creatinine) - стратификация на 3 группы риска\n\n### Ограничения\n- Зависит от тромбопластина лаборатории (используйте контрольное ПВ той же лаборатории, не INR)\n- Не валидизирован при тяжёлой ХПН\n- Современные гайдлайны (AASLD/EASL) рекомендуют MELD как более точный предиктор"
  };

export default runner;
