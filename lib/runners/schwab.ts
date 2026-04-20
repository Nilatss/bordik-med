// @ts-nocheck
/**
 * Runner: schwab
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
        id: "level",
        label: "Уровень независимости",
        type: "select",
        options: [
          {
            value: 100,
            label: "100 % - полностью независим"
          },
          {
            value: 90,
            label: "90 % - независим, лёгкое замедление"
          },
          {
            value: 80,
            label: "80 % - большинство задач, с усилием"
          },
          {
            value: 70,
            label: "70 % - не полностью независим, большинство задач 3-4× дольше"
          },
          {
            value: 60,
            label: "60 % - частичная зависимость"
          },
          {
            value: 50,
            label: "50 % - более зависим, с усилиями"
          },
          {
            value: 40,
            label: "40 % - очень зависим, помощь во всём"
          },
          {
            value: 30,
            label: "30 % - с усилием, изредка сам"
          },
          {
            value: 20,
            label: "20 % - ничего не может сам, тяжёлая инвалидизация"
          },
          {
            value: 10,
            label: "10 % - полностью зависим, беспомощный"
          },
          {
            value: 0,
            label: "0 % - вегетативные функции (глотание, мочеиспускание, дефекация) нарушены, прикован к постели"
          }
        ]
      }
    ],
    compute: (v)=>{
            const s = Number(v.level);
            let interpretation = '', color = '', details = '', actions = [];
            if (s >= 80) {
                interpretation = 'Независим';
                color = '#22C55E';
                details = 'Полноценная повседневная активность, лёгкое/умеренное замедление.';
                actions = [
                    'Монотерапия при PD (MAO-B, агонисты ДА или леводопа)',
                    'Физическая активность, LSVT-BIG/LOUD',
                    'Регулярный мониторинг'
                ];
            } else if (s >= 50) {
                interpretation = 'Частично зависим';
                color = '#F59E0B';
                details = 'Частичная зависимость. Требуются адаптации и помощь в части задач.';
                actions = [
                    'Оптимизация леводопы + адъювантов',
                    'Оценка DBS/помп при флуктуациях',
                    'Реабилитация, адаптация жилья',
                    'Обсудить паллиативные опции на перспективу'
                ];
            } else {
                interpretation = 'Тяжёлая зависимость';
                color = '#EF4444';
                details = 'Выраженная зависимость. Полный уход; высокий риск осложнений.';
                actions = [
                    'Паллиативный подход; контроль симптомов',
                    'Профилактика аспирации, пролежней, ИМП',
                    'Нутритивная поддержка (ПЭГ при дисфагии)',
                    'Поддержка опекуна (Zarit)'
                ];
            }
            return {
                value: `${s}`,
                unit: '%',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Может оцениваться пациентом ИЛИ клиницистом - согласие обычно хорошее',
                    'Шаг 10 % - грубая шкала',
                    'Не заменяет MDS-UPDRS Часть II (ADL), которая детальнее',
                    'Для деменции используйте FAST / CDR'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 50,
                            label: '0-40 %',
                            color: '#EF4444'
                        },
                        {
                            min: 50,
                            max: 80,
                            label: '50-70 %',
                            color: '#F59E0B'
                        },
                        {
                            min: 80,
                            max: 101,
                            label: '80-100 %',
                            color: '#22C55E'
                        }
                    ],
                    current: s,
                    unit: '%'
                },
                related: [
                    {
                        id: 'hoehn',
                        title: 'Hoehn-Yahr'
                    },
                    {
                        id: 'updrs',
                        title: 'MDS-UPDRS'
                    },
                    {
                        id: 'pdq39',
                        title: 'PDQ-39'
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
    reference: "Schwab RS, England AC. Projection technique for evaluating surgery in Parkinson’s disease. In: Gillingham FJ, Donaldson IML (eds). Third Symposium on Parkinson’s Disease. Edinburgh: Livingstone, 1969:152-157.",
    info: "### Для чего используется\n**Schwab and England ADL Scale (1969)** - оценка **повседневной активности** при болезни Паркинсона. Единый показатель 0-100 %, шаг 10 %.\n\n### Уровни\n| % | Описание |\n|---|---|\n| 100 | Полностью независим, без замедления |\n| 90 | Независим, лёгкое замедление |\n| 80 | Большинство задач, с усилием и осознанием затруднений |\n| 70 | 3-4× медленнее, половина дня на ADL |\n| 60 | Некоторая зависимость, выполняет большую часть с усилием |\n| 50 | Более зависим, помощь в половине задач |\n| 40 | Очень зависим, помощь во всём, но немного сам |\n| 30 | С усилием изредка сам, всё требует помощи |\n| 20 | Ничего не может сам |\n| 10 | Полностью зависим |\n| 0 | Вегетативные функции нарушены, прикован |\n\n### Применение\n- Мониторинг прогрессирования PD\n- Оценка эффективности терапии (DBS, леводопа)\n- Клинические исследования - часто совместно с H-Y и UPDRS\n\n### Ограничения\n- Грубая шкала, шаг 10 %\n- Субъективна - зависит от оценщика или пациента\n- Для деменции используйте FAST / CDR / Barthel\n\n### Связанные\n- **MDS-UPDRS Часть II** - детальная оценка моторных ADL\n- **PDQ-39** - качество жизни\n- **Hoehn-Yahr** - стадия PD\n\n### Тактика\n- 80-100 %: монотерапия, физ. активность\n- 50-70 %: оптимизация, DBS/помпы, реабилитация\n- 0-40 %: паллиатив, контроль симптомов, уход"
  };

export default runner;
