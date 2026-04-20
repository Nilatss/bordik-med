// @ts-nocheck
/**
 * Runner: insulin-correction
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
        id: "tdd",
        label: "Суммарная суточная доза инсулина (TDD)",
        type: "number",
        unit: "Ед",
        min: 5,
        max: 300,
        step: 1,
        quickValues: [
          20,
          30,
          40,
          50,
          60,
          80,
          100
        ]
      },
      {
        id: "insulinType",
        label: "Тип инсулина",
        type: "select",
        options: [
          {
            value: "rapid",
            label: "Быстродействующий (аспарт, лизпро, глулизин)"
          },
          {
            value: "regular",
            label: "Короткий (regular human)"
          }
        ]
      }
    ],
    compute: (v)=>{
            const tdd = Number(v.tdd);
            const rapid = v.insulinType === 'rapid';
            const cfMgDl = (rapid ? 1800 : 1500) / tdd;
            const cfMmol = cfMgDl / 18;
            const icRatio = 500 / tdd; // grams carbs per unit (rapid)
            return {
                value: `CF ${cfMgDl.toFixed(0)} мг/дл (${cfMmol.toFixed(1)} ммоль/л) / 1 Ед`,
                unit: `I:C ≈ 1 Ед на ${icRatio.toFixed(0)} г углеводов`,
                interpretation: 'Ориентировочные настройки помпы/режима. Титровать по дневнику гликемии.',
                color: '#F59E0B',
                details: `Правило «${rapid ? '1800' : '1500'}» - для ${rapid ? 'быстродействующих аналогов' : 'короткого человеческого инсулина'}: CF = ${rapid ? '1800' : '1500'} / TDD = ${rapid ? '1800' : '1500'} / ${tdd} = ${cfMgDl.toFixed(0)} мг/дл на 1 Ед (или ${cfMmol.toFixed(1)} ммоль/л). Правило «500» для I:C-ratio: 500 / ${tdd} = ${icRatio.toFixed(0)} г углеводов на 1 Ед. TDD = базальный + болюсы за последние 1-2 нед стабильной гликемии.`,
                actions: [
                    'Верифицировать CF и I:C по дневнику 7-14 дней; корректировать по результатам',
                    'Целевая гликемия натощак и перед едой: 4-7 ммоль/л (индивидуализировать у пожилых и при гипогликемиях)',
                    'Пересчитать при изменении массы, беременности, активности, кортикостероидной терапии',
                    'У детей правило 1800 заменять на 100/TDD для ммоль/л (≈ эквивалентно)'
                ],
                caveats: [
                    'Правила 1800/1500/500 - ориентировочные; индивидуальные потребности могут отличаться в 2 раза',
                    'Не применимо в остром ДКА, при стрессовой гипергликемии, стероидах',
                    'У беременных с СД потребности растут в 2-3 триместре - обязательная эндокринологическая корректировка',
                    'Dawn phenomenon и ночные гипогликемии требуют пересмотра базальной дозы, а не CF/ICR'
                ],
                relatedCourses: [
                    {
                        id: '301.4',
                        title: 'Эндокринология'
                    },
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    }
                ],
                related: [
                    {
                        id: 'hba1c',
                        title: 'HbA1c → средняя глюкоза'
                    },
                    {
                        id: 'homa-ir',
                        title: 'HOMA-IR'
                    },
                    {
                        id: 'unit-glucose',
                        title: 'Глюкоза мг/дл ↔ ммоль/л'
                    }
                ]
            };
        },
    reference: "Davidson: правило «1800» для быстродействующих / «1500» для короткого; правило «500» для I:C. ADA/ISPAD 2024.",
    countries: "США (ADA) · Международный (ISPAD)",
    presets: [
      {
        label: "TDD 30 Ед, аналог",
        values: {
          tdd: 30,
          insulinType: "rapid"
        }
      },
      {
        label: "TDD 50 Ед, аналог",
        values: {
          tdd: 50,
          insulinType: "rapid"
        }
      },
      {
        label: "TDD 40 Ед, regular",
        values: {
          tdd: 40,
          insulinType: "regular"
        }
      }
    ],
    info: "### Для чего используется\nРасчёт индивидуальных **настроек интенсифицированной инсулинотерапии** (помпа, режим basal-bolus) по суточной дозе инсулина TDD.\n\n### Формулы\n`Коэффициент коррекции CF = 1800 / TDD` - быстродействующие аналоги (мг/дл на 1 Ед)\n`CF = 1500 / TDD` - короткий человеческий инсулин\n`I:C ratio = 500 / TDD` - грамм углеводов на 1 Ед\n\n### Как применять\n**Болюс перед едой:**\n`болюс = углеводы / ICR + (глюкоза − цель) / CF`\n\n**Коррекция гипергликемии между приёмами пищи:**\n`коррекция = (глюкоза − цель) / CF`\n\n### Таблица для быстродействующих (правило 1800)\n| TDD | CF мг/дл/Ед | CF ммоль/л/Ед | I:C (г/Ед) |\n|---|---|---|---|\n| 20 | 90 | 5,0 | 25 |\n| 30 | 60 | 3,3 | 17 |\n| 40 | 45 | 2,5 | 12 |\n| 50 | 36 | 2,0 | 10 |\n| 80 | 23 | 1,3 | 6 |\n\n### Целевые значения гликемии (ADA 2024)\n| Параметр | Небеременные взр. | Беременные | Пожилые хрупкие |\n|---|---|---|---|\n| Натощак | 4,4-7,2 | 3,9-5,3 | 5,6-10,0 |\n| Через 2 ч после еды | < 10,0 | < 6,7 | - |\n| HbA1c | < 7 % | < 6,5 % | < 8 % |\n\n### Ограничения\n- Не применимо при острых состояниях (ДКА, HHS)\n- Кортикостероиды удваивают потребности - пересчёт\n- Физическая активность снижает потребности на 20-50 %\n- Алкоголь - риск отсроченной гипогликемии (6-12 ч)\n\n### Источник\nADA. *Standards of Care in Diabetes* - 2024. *Diabetes Care* 2024;47(Suppl 1).\nDavidson PC et al. Diabetes Educ 2008;34(Suppl 1):22S."
  };

export default runner;
