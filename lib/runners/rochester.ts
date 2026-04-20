// @ts-nocheck
/**
 * Runner: rochester
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
        id: "ageDays",
        label: "Возраст (дни)",
        type: "number",
        unit: "дней",
        min: 0,
        max: 120,
        step: 1,
        quickValues: [
          15,
          30,
          45,
          60,
          75,
          90
        ]
      },
      {
        id: "tempC",
        label: "Температура ректально",
        type: "number",
        unit: "°C",
        min: 35,
        max: 42,
        step: 0.1,
        quickValues: [
          38,
          38.5,
          39,
          39.5
        ]
      },
      {
        id: "healthy",
        label: "Ранее здоров, доношенный, без антибиотиков, без гипербилирубинемии",
        type: "checkbox"
      },
      {
        id: "normalExam",
        label: "Осмотр: нет очагов инфекции (уши, кожа, кости, суставы)",
        type: "checkbox"
      },
      {
        id: "wbcOk",
        label: "WBC 5 000-15 000/мкл",
        type: "checkbox"
      },
      {
        id: "bandsOk",
        label: "Абс. число палочкоядерных <1 500/мкл",
        type: "checkbox"
      },
      {
        id: "uaOk",
        label: "Анализ мочи: ≤10 WBC/hpf, нет бактерий",
        type: "checkbox"
      },
      {
        id: "stoolOk",
        label: "Стул (если диарея): ≤5 WBC/hpf",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const age = Number(v.ageDays);
            const temp = Number(v.tempC);
            const healthy = v.healthy === true;
            const exam = v.normalExam === true;
            const wbc = v.wbcOk === true;
            const bands = v.bandsOk === true;
            const ua = v.uaOk === true;
            const stool = v.stoolOk === true;
            const allLowRisk = healthy && exam && wbc && bands && ua && stool;
            const ageApplicable = age >= 0 && age <= 90;
            const fever = temp >= 38.0;
            let interpretation = '', color = '#22C55E', value = '';
            let details = '';
            let actions = [];
            if (!fever) {
                value = 'Без лихорадки';
                interpretation = 'Шкала не применяется: T <38,0 °C';
                color = '#6B7280';
                details = 'Критерии Rochester применяются у младенцев с ректальной температурой ≥38,0 °C. При отсутствии лихорадки - обычное ведение по симптомам.';
                actions = [
                    'Повторить измерение температуры',
                    'Клинический осмотр по симптомам'
                ];
            } else if (age < 29) {
                value = '0-28 дней - всегда высокий риск';
                interpretation = 'Полный септический скрининг + эмпирические АБ';
                color = '#991B1B';
                details = 'Новорождённые 0-28 дней с лихорадкой ≥38,0 °C считаются высокого риска независимо от лабораторных критериев. Требуется полный скрининг и стационар.';
                actions = [
                    'Кровь: ОАК, гемокультура, СРБ/прокальцитонин',
                    'Моча: ОАМ + посев (катетер)',
                    'Люмбальная пункция: ликвор + посев',
                    'Ампициллин + гентамицин (или цефотаксим) в/в',
                    'Ацикловир при подозрении на HSV',
                    'Госпитализация'
                ];
            } else if (!ageApplicable) {
                value = 'Возраст вне диапазона';
                interpretation = 'Критерии Rochester - 29-90 дней';
                color = '#6B7280';
                details = 'Для ≥91 дня используются другие протоколы (например, по клинике и очагу). См. Step-by-Step (до 90 дн) или общие руководства.';
            } else if (allLowRisk) {
                value = 'Низкий риск';
                interpretation = 'SBI <1%; возможна амбулаторная тактика';
                color = '#22C55E';
                details = 'Все критерии Rochester соблюдены. Риск серьёзной бактериальной инфекции (SBI) <1,1%, менингита <0,5%. Возможно амбулаторное наблюдение без эмпирических АБ при надёжных родителях и возможности контроля через 24 ч.';
                actions = [
                    'Рассмотреть выписку с контролем через 12-24 ч',
                    'Культуры крови и мочи - ждать результат',
                    'Без эмпирических АБ (при надёжном фоллоу-апе)',
                    'Инструкции родителям: возврат при ухудшении, плохом кормлении, вялости'
                ];
            } else {
                value = 'Не низкий риск';
                interpretation = 'SBI риск повышен - стационар + эмпирические АБ';
                color = '#EF4444';
                details = 'Один или более критериев не соблюдены. Риск SBI ~7-25%. Показано стационарное ведение с эмпирическими АБ до результатов культур.';
                actions = [
                    'Полный септический скрининг (кровь, моча, ЛП по клинике)',
                    'Цефтриаксон 50-75 мг/кг/сут в/в (или ампициллин+гентамицин)',
                    'Госпитализация минимум 48 ч',
                    'Пересмотр после результатов культур и СРБ'
                ];
            }
            return {
                value,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Rochester (Jaskiewicz 1994): 29-90 дней, T ≥38,0 °C ректально',
                    'Philadelphia (Baker 1993): 28-56 дней, добавляет рентген грудной клетки',
                    'Boston (Baskin 1992): 28-90 дней, допускает амбулаторное введение цефтриаксона',
                    'Step-by-Step (Gomez 2016): 22-90 дней, добавляет прокальцитонин ≥0,5 нг/мл',
                    'PECARN rule (Kuppermann 2019): 29-60 дней, использует ПКТ и UA',
                    'Новорождённые 0-28 дней - всегда высокий риск (полный скрининг + АБ)'
                ],
                related: [
                    {
                        id: 'imci',
                        title: 'IMCI (WHO)'
                    },
                    {
                        id: 'pews',
                        title: 'PEWS'
                    },
                    {
                        id: 'pat',
                        title: 'PAT'
                    }
                ],
                relatedCourses: [
                    {
                        id: '302.2',
                        title: 'Педиатрия раннего возраста'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ]
            };
        },
    reference: "Jaskiewicz JA, McCarthy CA, Richardson AC, et al. Febrile infants at low risk for serious bacterial infection - an appraisal of the Rochester criteria. Pediatrics 1994;94:390-396.",
    countries: "США · Европа (с адаптациями)",
    presets: [
      {
        label: "Низкий риск (все критерии)",
        values: {
          ageDays: 60,
          tempC: 38.5,
          healthy: true,
          normalExam: true,
          wbcOk: true,
          bandsOk: true,
          uaOk: true,
          stoolOk: true
        }
      },
      {
        label: "Новорождённый с лихорадкой",
        values: {
          ageDays: 20,
          tempC: 38.5,
          healthy: true,
          normalExam: true,
          wbcOk: true,
          bandsOk: true,
          uaOk: true,
          stoolOk: true
        }
      },
      {
        label: "Не низкий риск (WBC высокий)",
        values: {
          ageDays: 60,
          tempC: 39,
          healthy: true,
          normalExam: true,
          wbcOk: false,
          bandsOk: true,
          uaOk: true,
          stoolOk: true
        }
      }
    ],
    info: "### Для чего используется\n**Rochester criteria (Jaskiewicz 1994)** - критерии низкого риска серьёзной бактериальной инфекции (SBI) у младенцев 29-90 дней с лихорадкой ≥38,0 °C. Низкий риск → амбулаторно без эмпирических АБ.\n\n### Критерии Rochester (все должны быть выполнены)\n1. Ранее здоров (доношенный ≥37 нед, без перинатальных АБ, без гипербилирубинемии, без хронических болезней)\n2. Отсутствие очаговых инфекций на осмотре (уши, мягкие ткани, кости, суставы)\n3. WBC 5 000-15 000/мкл\n4. Абсолютное число палочкоядерных <1 500/мкл\n5. Анализ мочи ≤10 WBC/hpf без бактерий\n6. Стул (если диарея) ≤5 WBC/hpf\n\n### Сравнение протоколов\n| Критерий | Возраст | Особенности |\n|---|---|---|\n| **Rochester** (1994) | 29-90 дн | 6 критериев, без ЛП при низком риске |\n| **Philadelphia** (1993) | 29-56 дн | + рентген грудной клетки, ЛП обязательна |\n| **Boston** (1992) | 28-89 дн | Разрешает амбулаторно цефтриаксон 50 мг/кг |\n| **Step-by-Step** (2016) | 22-90 дн | Добавляет PCT ≥0,5 нг/мл, CRP >20 мг/л |\n| **PECARN** (2019) | 29-60 дн | UA + ANC + прокальцитонин |\n\n### Интерпретация\n- **Все критерии +** (низкий риск): SBI <1,1%, менингит <0,5% → амбулаторно с контролем через 24 ч\n- **≥1 критерий нарушен**: SBI 7-25% → стационар, АБ\n\n### 0-28 дней - всегда высокий риск\nНезависимо от критериев: полный скрининг (ОАК, кровь/моча/ЛП культуры), эмпирические АБ (ампициллин + гентамицин или цефотаксим), ацикловир при подозрении на HSV.\n\n### Ограничения\n- Не применяется <28 дней и >90 дней\n- Не охватывает вирусные инфекции (HSV, энтеровирус)\n- Требует надёжного фоллоу-апа и возможности родителей вернуться\n\n### Тактика\n- **Низкий риск**: выписка + контроль 12-24 ч, без АБ\n- **Высокий риск**: стационар + цефтриаксон или амп+гент\n- **0-28 дней**: полный скрининг + АБ + ЛП всегда"
  };

export default runner;
