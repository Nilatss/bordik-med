// @ts-nocheck
/**
 * Runner: mcdonald
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
        id: "attacks",
        label: "Количество клинических атак (≥24 ч, вне лихорадки)",
        type: "select",
        options: [
          {
            value: 0,
            label: "0"
          },
          {
            value: 1,
            label: "1"
          },
          {
            value: 2,
            label: "≥ 2"
          }
        ]
      },
      {
        id: "lesions",
        label: "Объективные клинические очаги",
        type: "select",
        options: [
          {
            value: 0,
            label: "0"
          },
          {
            value: 1,
            label: "1"
          },
          {
            value: 2,
            label: "≥ 2"
          }
        ]
      },
      {
        id: "dis",
        label: "Диссеминация в пространстве (DIS) на МРТ (≥1 T2 в ≥2 из 4 зон: перивентр., юкстакортик./кортик., инфратент., спинной мозг)",
        type: "checkbox",
        points: 0
      },
      {
        id: "dit",
        label: "Диссеминация во времени (DIT): одновременно контраст+ и контраст− очаги ИЛИ новый T2/контраст+ на повторной МРТ",
        type: "checkbox",
        points: 0
      },
      {
        id: "ocb",
        label: "Олигоклональные антитела в ЦСЖ (могут заменить DIT в критериях 2017)",
        type: "checkbox",
        points: 0
      },
      {
        id: "progression",
        label: "Клиническое прогрессирование ≥1 года (для PPMS)",
        type: "checkbox",
        points: 0
      }
    ],
    compute: (v)=>{
            const attacks = Number(v.attacks);
            const lesions = Number(v.lesions);
            const dis = v.dis === true;
            const dit = v.dit === true;
            const ocb = v.ocb === true;
            const progression = v.progression === true;
            let diagnosis = '', interpretation = '', color = '', details = '';
            const actions = [];
            // RRMS criteria
            if (attacks >= 2 && lesions >= 2) {
                diagnosis = 'РС (клинически определённый)';
                interpretation = 'Критерии выполнены клинически';
                color = '#EF4444';
                details = '≥2 атаки + ≥2 объективных очага - диагноз РС подтверждён клинически, дополнительных данных не требуется.';
            } else if (attacks >= 2 && lesions === 1 && dis) {
                diagnosis = 'РС';
                interpretation = 'Критерии выполнены (DIS на МРТ подтверждает)';
                color = '#EF4444';
                details = '≥2 атаки + 1 очаг + DIS на МРТ.';
            } else if (attacks === 1 && lesions >= 2 && (dit || ocb)) {
                diagnosis = 'РС';
                interpretation = 'Критерии выполнены (DIT или ОКА)';
                color = '#EF4444';
                details = '1 атака + ≥2 очага + DIT или ОКА (2017) → РС.';
            } else if (attacks === 1 && lesions === 1 && dis && (dit || ocb)) {
                diagnosis = 'РС';
                interpretation = 'Критерии выполнены (CIS → РС)';
                color = '#EF4444';
                details = '1 атака + 1 очаг + DIS + DIT/ОКА - клинически изолированный синдром, соответствующий критериям РС.';
            } else if (progression && dis) {
                diagnosis = 'ПП РС';
                interpretation = 'Первично-прогрессирующий РС';
                color = '#EF4444';
                details = 'Прогрессирование ≥1 года + DIS головного/спинного мозга + ОКА (или DIS спинного мозга + ОКА) - PPMS.';
            } else if (attacks >= 1 || lesions >= 1) {
                diagnosis = 'CIS / неполные критерии';
                interpretation = 'Клинически изолированный синдром или неполные данные';
                color = '#F59E0B';
                details = 'Недостаточно для диагноза РС - требуется повторная МРТ или ЦСЖ для подтверждения DIS/DIT.';
            } else {
                diagnosis = 'Нет';
                interpretation = 'Критерии не выполнены';
                color = '#22C55E';
                details = 'Критерии РС не выполнены. Рассмотреть альтернативные диагнозы.';
            }
            if (diagnosis === 'РС' || diagnosis === 'ПП РС') {
                actions.push('Стартовать ПИТРС (DMT) после обсуждения активности');
                actions.push('Базовая МРТ головы + шейного отдела (для мониторинга)');
                actions.push('Оценка EDSS; регистрация в Registry РС');
                actions.push('Исключить альтернативы: NMOSD (AQP4/MOG-IgG), ADEM, саркоидоз, болезнь Лайма, СКВ, B12');
                actions.push('Витамин D, отказ от курения, вакцинация до иммуносупрессии');
            } else if (diagnosis === 'CIS / неполные критерии') {
                actions.push('Повторная МРТ через 3-6 мес для DIT');
                actions.push('ЦСЖ на ОКА и IgG-индекс (замена DIT в критериях 2017)');
                actions.push('Рассмотреть ПИТРС при высоком риске конверсии (≥2 T2 на МРТ)');
                actions.push('Исключить альтернативы');
            } else {
                actions.push('Искать альтернативные причины симптомов');
                actions.push('МРТ, ЦСЖ по показаниям');
            }
            return {
                value: diagnosis,
                unit: 'McDonald 2017',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Критерии McDonald 2017 (Thompson 2017) - включили ОКА как замену DIT для RRMS',
                    'Кортикальные очаги теперь валидны как юкстакортикальные',
                    'Симптоматические очаги могут использоваться как доказательство DIS/DIT (изменение 2017)',
                    'PPMS: 1 год прогрессирования + 2 из 3 (DIS головы, DIS спинного мозга, ОКА)',
                    'Обязательно исключить альтернативы: NMOSD, MOG-AD, ADEM, нейросаркоидоз, Лайм, B12, СКВ'
                ],
                related: [
                    {
                        id: 'edss',
                        title: 'EDSS'
                    },
                    {
                        id: 'msfc',
                        title: 'MSFC'
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
    reference: "Thompson AJ, Banwell BL, Barkhof F et al. Diagnosis of multiple sclerosis: 2017 revisions of the McDonald criteria. Lancet Neurol 2018;17:162-173.",
    info: "### Для чего используется\n**McDonald criteria 2017 (Thompson 2017)** - диагностика **рассеянного склероза**. Комбинация клинических атак, объективных очагов и МРТ/ЦСЖ доказательств DIS (диссеминация в пространстве) и DIT (диссеминация во времени).\n\n### Ключевые определения\n- **Атака:** неврологический эпизод ≥24 ч, не связанный с лихорадкой/инфекцией\n- **Объективный очаг:** абнормальность при осмотре, соответствующая МРТ-очагу\n- **DIS:** ≥1 T2-очаг в ≥2 из 4 локализаций (перивентрикулярные, юкстакортикальные/кортикальные, инфратенториальные, спинной мозг)\n- **DIT:** одновременное сосуществование контрастируемых и неконтрастируемых очагов ИЛИ новый T2/Gd+ очаг на повторной МРТ\n- **ОКА в ЦСЖ:** в критериях 2017 может заменить DIT для диагноза RRMS\n\n### Диагностические комбинации (RRMS)\n| Атаки | Очаги | Дополнительно | Диагноз |\n|---|---|---|---|\n| ≥ 2 | ≥ 2 | - | РС |\n| ≥ 2 | 1 | DIS | РС |\n| 1 | ≥ 2 | DIT или ОКА | РС |\n| 1 | 1 | DIS + (DIT или ОКА) | РС (CIS → РС) |\n\n### PPMS\n1 год клинического прогрессирования + 2 из 3:\n- DIS головного мозга (≥1 T2 в типичной локализации)\n- DIS спинного мозга (≥2 T2 очагов)\n- Положительные ОКА в ЦСЖ\n\n### Изменения 2017 vs 2010\n- ОКА могут заменить DIT (для RRMS)\n- Кортикальные очаги валидны как юкстакортикальные\n- Симптоматические очаги могут использоваться как доказательство DIS/DIT\n\n### Обязательные альтернативы (красные флаги)\n- NMOSD (AQP4-IgG) - тяжёлый оптический неврит, поперечный миелит >3 сегментов\n- MOG-антитело-ассоциированная болезнь\n- ADEM (энцефалопатия, острый дебют)\n- Нейросаркоидоз, болезнь Лайма, СКВ\n- B12/медь дефицит, CADASIL\n- Лейкодистрофии у молодых\n\n### Тактика при подтверждении\n- Старт ПИТРС (DMT): выбор по активности - интерфероны/глатирамер vs натализумаб/окрелизумаб/S1P\n- Окрелизумаб - единственный одобренный для PPMS\n- Базовая МРТ для мониторинга; повтор через 6-12 мес\n- Витамин D, отказ от курения, вакцинации до иммуносупрессии\n- EDSS на каждом визите\n\n### Ограничения критериев\n- Не применимы при нетипичном CIS (OA, длинный миелит - проверить NMOSD)\n- Требуют исключения альтернатив\n- ОКА-замена DIT не применима для педиатрии при ADEM-подобном дебюте"
  };

export default runner;
