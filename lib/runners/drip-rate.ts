/**
 * Runner: drip-rate
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
        id: "volume",
        hint: 'Объём в миллилитрах',
        label: "Объём инфузии",
        type: "number",
        unit: "мл",
        min: 1,
        max: 5000,
        step: 1,
        quickValues: [
          100,
          250,
          500,
          1000
        ]
      },
      {
        id: "timeHours",
        label: "Время инфузии",
        type: "number",
        unit: "часов",
        min: 0.05,
        max: 48,
        step: 0.05,
        quickValues: [
          0.5,
          1,
          2,
          4,
          8,
          12,
          24
        ]
      },
      {
        id: "dropFactor",
        label: "Drop factor системы",
        type: "select",
        options: [
          {
            value: 10,
            label: "Макро 10 gtt/мл"
          },
          {
            value: 15,
            label: "Макро 15 gtt/мл"
          },
          {
            value: 20,
            label: "Макро 20 gtt/мл (стандарт)"
          },
          {
            value: 60,
            label: "Микро 60 gtt/мл"
          }
        ]
      }
    ],
    compute: (v)=>{
            const vol = Number(v.volume);
            const timeMin = Number(v.timeHours) * 60;
            const df = Number(v.dropFactor);
            const gtt = vol * df / timeMin;
            const mlh = vol / Number(v.timeHours);
            return {
                value: `${gtt.toFixed(0)} кап/мин`,
                unit: `(${mlh.toFixed(0)} мл/ч)`,
                interpretation: df === 60 ? 'Микро-система - используется в педиатрии и при точных инфузиях' : 'Макро-система - стандарт для взрослых',
                color: '#4B8DF5',
                details: `Формула: (объём × drop factor) / время в минутах = (${vol} × ${df}) / ${timeMin.toFixed(0)} = ${gtt.toFixed(1)} кап/мин. В мл/ч: ${mlh.toFixed(1)} мл/ч. Drop factor зависит от системы: макро 10/15/20 gtt/мл (стандарт 20) - для обычных инфузий, микро 60 gtt/мл - для точных объёмов у детей и при вазоактивных препаратах.`,
                actions: [
                    'Проверить drop factor на упаковке системы - производители различаются',
                    'Для детей и вазоактивных препаратов - только микросистема или инфузомат',
                    'Контроль каждые 15-30 мин в первый час (положение, отёк, проходимость)',
                    'При нарушении темпа - НЕ компенсировать ускорением (риск перегрузки)'
                ],
                caveats: [
                    'Гравитационная инфузия зависит от высоты штатива, вязкости и положения - реально варьирует ± 20 %',
                    'Для точных режимов использовать инфузомат/шприцевой насос, а не gtt/мин',
                    'Микро-систему НИКОГДА не использовать для болюсной инфузии - слишком медленно',
                    'Вязкие растворы (маннитол, ЭП) требуют большего диаметра иглы'
                ],
                relatedCourses: [
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    },
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    }
                ],
                related: [
                    {
                        id: 'iv-dilution',
                        title: 'Разведение препаратов'
                    },
                    {
                        id: 'holliday-segar',
                        title: 'Поддерживающая инфузия'
                    }
                ]
            };
        },
    reference: "gtt/мин = (объём мл × drop factor) / время мин. Макро 10-20, микро 60 gtt/мл.",
    countries: "Международный",
    presets: [
      {
        label: "1000 мл / 8 ч макро 20",
        values: {
          volume: 1000,
          timeHours: 8,
          dropFactor: 20
        }
      },
      {
        label: "500 мл / 4 ч макро 20",
        values: {
          volume: 500,
          timeHours: 4,
          dropFactor: 20
        }
      },
      {
        label: "100 мл / 1 ч микро 60",
        values: {
          volume: 100,
          timeHours: 1,
          dropFactor: 60
        }
      }
    ],
    info: "### Для чего используется\nРасчёт скорости гравитационной в/в инфузии в **каплях в минуту (gtt/min)** при отсутствии инфузомата.\n\n### Формула\n`gtt/мин = (объём мл × drop factor) / время в минутах`\n\n### Drop factor (gtt/мл) - по системе\n| Тип | gtt/мл | Применение |\n|---|---|---|\n| Макро 10 | 10 | Старые системы / производитель-зависимо |\n| Макро 15 | 15 | Альтернативная макро-система |\n| **Макро 20** | 20 | **Стандартная взрослая система** |\n| Микро (педиатрическая) | 60 | Дети, точные объёмы, вазоактивные |\n\n### Типовые примеры\n| Инфузия | Макро 20 | Микро 60 |\n|---|---|---|\n| 1000 мл / 8 ч | ~42 gtt/мин | 125 gtt/мин |\n| 500 мл / 4 ч | ~42 gtt/мин | 125 gtt/мин |\n| 100 мл / 30 мин | ~67 gtt/мин | 200 gtt/мин |\n\n### Когда НЕ использовать gtt/мин\n| Ситуация | Почему |\n|---|---|\n| Вазоактивные (норадреналин, допамин) | Требуют точности → инфузомат |\n| Инсулин, гепарин | Узкий терапевтический индекс |\n| Дети / новорождённые | Чувствительность к перегрузке |\n| Химиотерапия | Строго по протоколу |"
  };

export default runner;
