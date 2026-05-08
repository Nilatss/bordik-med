/**
 * Runner: evans
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
        id: "frontal",
        hint: 'Размер в миллиметрах',
        label: "Максимальная ширина фронтальных рогов",
        type: "number",
        unit: "мм",
        min: 10,
        max: 100,
        step: 0.1,
        quickValues: [
          30,
          35,
          40,
          45,
          50
        ]
      },
      {
        id: "skull",
        hint: 'Размер в миллиметрах',
        label: "Внутренняя ширина черепа на том же уровне",
        type: "number",
        unit: "мм",
        min: 80,
        max: 220,
        step: 0.1,
        quickValues: [
          130,
          140,
          150,
          160,
          170
        ]
      }
    ],
    compute: (v)=>{
            const f = Number(v.frontal);
            const s = Number(v.skull);
            const idx = f / s;
            const val = idx.toFixed(3);
            let interpretation = '', color = '#22C55E';
            let details = '';
            let actions = [];
            if (idx < 0.25) {
                interpretation = 'Норма';
                color = '#22C55E';
                details = 'Evans Index < 0,25 - размер желудочков в пределах нормы. Гидроцефалия маловероятна.';
                actions = [
                    'Если есть клиника (деменция, атаксия, недержание) - искать другие причины',
                    'Контроль МРТ при появлении новой симптоматики'
                ];
            } else if (idx <= 0.30) {
                interpretation = 'Умеренная вентрикуломегалия';
                color = '#F59E0B';
                details = 'Evans Index 0,25-0,30 - пограничная вентрикуломегалия. Интерпретировать с клиникой; возможна атрофия (ex vacuo) или ранний NPH.';
                actions = [
                    'Оценить триаду Хакима (деменция + атаксия + недержание мочи) - NPH',
                    'МРТ с DESH-паттерном (disproportionately enlarged subarachnoid-space hydrocephalus)',
                    'При подозрении на NPH - tap test (30-50 мл ликвора) с оценкой походки'
                ];
            } else {
                interpretation = 'Гидроцефалия';
                color = '#EF4444';
                details = 'Evans Index > 0,30 - вентрикуломегалия, соответствующая критериям гидроцефалии (Relkin 2005, INPH criteria). Требует клинической интерпретации: обструктивная, сообщающаяся, NPH или атрофия.';
                actions = [
                    'МРТ: оценить флоу через водопровод, DESH-паттерн, признаки трансэпендимального просачивания',
                    'Клиника: уровень сознания, триада Хакима, симптомы ВЧД',
                    'При остром обструктивном процессе - экстренное нейрохирургическое решение (ВНС, ЭВС)',
                    'При NPH - tap test / люмбальный дренаж 3-5 дней → шунтирование'
                ];
            }
            return {
                value: val,
                unit: '',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Evans Index - 2D-метрика на аксиальном срезе; не заменяет объёмную оценку',
                    'В пожилом возрасте вентрикуломегалия может быть следствием атрофии (ex vacuo), а не истинной гидроцефалии',
                    'Пороговое значение 0,30 не чувствительно для асимметричной или обструктивной гидроцефалии',
                    'INPH-критерии (Relkin 2005) требуют клиники + Evans > 0,3 + отсутствие других причин'
                ],
                scale: {
                    segments: [
                        {
                            min: 0.15,
                            max: 0.25,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: 0.25,
                            max: 0.30,
                            label: 'Пограничная',
                            color: '#F59E0B'
                        },
                        {
                            min: 0.30,
                            max: 0.50,
                            label: 'Гидроцефалия',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(val),
                    unit: ''
                },
                related: [
                    {
                        id: 'gcs',
                        title: 'GCS'
                    },
                    {
                        id: 'mmse',
                        title: 'MMSE'
                    },
                    {
                        id: 'mrs',
                        title: 'mRS'
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
    reference: "Evans WA. Arch Neurol Psychiatry 1942;47:931-937. Обновлено Relkin N et al., INPH Guidelines. Neurosurgery 2005;57(3 Suppl):S4-S16.",
    countries: "Международный",
    presets: [
      {
        label: "Норма",
        values: {
          frontal: 35,
          skull: 150
        }
      },
      {
        label: "Пограничная",
        values: {
          frontal: 40,
          skull: 150
        }
      },
      {
        label: "Гидроцефалия",
        values: {
          frontal: 50,
          skull: 150
        }
      }
    ],
    info: "### Для чего используется\n**Indice Evans (1942)** - простой линейный показатель размера желудочковой системы, используется для скрининга гидроцефалии и оценки вентрикуломегалии по КТ/МРТ.\n\n### Формула\n`Evans = максимальная ширина фронтальных рогов / максимальная внутренняя ширина черепа на том же аксиальном срезе`\n\nИзмерение - на аксиальном срезе на уровне foramen of Monro.\n\n### Интерпретация\n| Evans Index | Интерпретация |\n|---|---|\n| < 0,25 | Норма |\n| 0,25-0,30 | Пограничная вентрикуломегалия |\n| > 0,30 | Гидроцефалия |\n\n### INPH-критерии (Relkin 2005)\nNormal Pressure Hydrocephalus (**NPH**):\n- Evans Index > 0,3 на МРТ\n- Триада Хакима: апраксия походки + деменция + недержание мочи\n- Давление ликвора 70-245 мм H₂O\n- Ответ на tap test или дренаж\n\n### Ограничения\n- 2D-метрика, не учитывает объём желудочков\n- Не различает истинную гидроцефалию и ex vacuo атрофию\n- Требует стандартизированного аксиального среза\n- Альтернативы: callosal angle, DESH-паттерн, объёмная МРТ\n\n### Тактика\n- **Норма:** исключить другие причины клиники\n- **Пограничная:** tap test, клиническая динамика\n- **Гидроцефалия:** МРТ-флоуметрия, оценка обструкции, решение о шунтировании (VP/VA/LP-шунт) или ЭВС"
  };

export default runner;
