/**
 * Runner: berlin-ards - Berlin Definition of ARDS (Ranieri 2012) + Global 2023
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'timing', label: 'Начало в течение < 1 недели от известного инсульта/новых симптомов', type: 'checkbox' },
    { id: 'bilateral', label: 'Двусторонние инфильтраты на КТ/рентгене (не объяснимые выпотом/коллапсом/узлами)', type: 'checkbox' },
    { id: 'noncardiac', label: 'Отёк не полностью объясняется сердечной недостаточностью/перегрузкой', type: 'checkbox' },
    { id: 'pf', label: 'PaO₂/FiO₂ (мм рт. ст.)', type: 'number', unit: 'мм рт. ст.', min: 20, max: 600, step: 1, quickValues: [80, 150, 200, 250, 300] },
    { id: 'peep', label: 'PEEP или CPAP (см H₂O)', type: 'number', unit: 'см H₂O', min: 0, max: 30, step: 1, quickValues: [5, 8, 10, 12, 15] },
  ],
  compute: (v) => {
    const timing = !!v.timing, bilat = !!v.bilateral, nc = !!v.noncardiac;
    const pf = Number(v.pf);
    const peep = Number(v.peep);
    if (!timing || !bilat || !nc) {
      return {
        value: 'Не ARDS',
        interpretation: 'Критерии ARDS не выполнены',
        color: '#22C55E',
        details: 'Для диагноза ARDS по Berlin 2012 необходимы ВСЕ 3 предпосылки: начало < 1 нед, двусторонние инфильтраты, отёк не кардиогенного генеза. Отсутствует как минимум одна.',
        actions: ['Искать альтернативные причины гипоксемии', 'Оценить сердечную функцию (ЭхоКГ, BNP)'],
        related: [
          { id: 'pf-ratio', title: 'P/F ratio' }, { id: 'murray', title: 'Murray LIS' },
          { id: 'rox', title: 'ROX' },
        ],
        relatedCourses: [{ id: '300.4', title: 'Интенсивная терапия' }],
      };
    }
    if (peep < 5) {
      return {
        value: 'PEEP < 5',
        interpretation: 'Требуется PEEP ≥ 5 см H₂O',
        color: '#F59E0B',
        details: 'Berlin 2012 требует PEEP или CPAP ≥ 5 см H₂O для оценки P/F. Global 2023 допускает HFNC ≥ 30 л/мин.',
        actions: ['Установить PEEP ≥ 5 и пересчитать P/F', 'При НИВЛ - CPAP ≥ 5'],
        related: [{ id: 'pf-ratio', title: 'P/F ratio' }, { id: 'murray', title: 'Murray LIS' }],
        relatedCourses: [{ id: '300.4', title: 'Интенсивная терапия' }],
      };
    }
    let severity = '', color = '', details = '', actions: string[] = [];
    if (pf > 300) {
      return {
        value: 'P/F > 300',
        interpretation: 'Критерии оксигенации не выполнены',
        color: '#22C55E',
        details: 'P/F > 300 не соответствует ни одной степени ARDS.',
        actions: ['Наблюдение', 'Рассмотреть другие причины'],
        related: [{ id: 'pf-ratio', title: 'P/F ratio' }],
        relatedCourses: [{ id: '300.4', title: 'Интенсивная терапия' }],
      };
    }
    if (pf > 200) {
      severity = 'Лёгкий ARDS'; color = '#F59E0B';
      details = 'Лёгкий ARDS (P/F 201-300). Госпитальная летальность ~ 27%.';
      actions = ['Низкообъёмная ИВЛ Vt 6 мл/кг IBW', 'Plateau ≤ 30 см H₂O', 'PEEP-таблица ARDSnet', 'Консервативная жидкостная стратегия'];
    } else if (pf > 100) {
      severity = 'Умеренный ARDS'; color = '#EF4444';
      details = 'Умеренный ARDS (P/F 101-200). Госпитальная летальность ~ 32%.';
      actions = ['Vt 6 мл/кг, Plateau ≤ 30', 'Высокий PEEP (PEEP-таблица ARDSnet high-PEEP)', 'Прон-позиция ≥ 16 ч/сут при P/F < 150', 'Рассмотреть нейромышечную блокаду ≤ 48 ч'];
    } else {
      severity = 'Тяжёлый ARDS'; color = '#991B1B';
      details = 'Тяжёлый ARDS (P/F ≤ 100). Госпитальная летальность ~ 45%.';
      actions = ['Прон-позиция 16+ ч/сут (PROSEVA)', 'Рассмотреть VV-ECMO (EOLIA, критерии Berlin)', 'Нейромышечная блокада', 'Ингаляционный NO/эпопростенол - rescue'];
    }
    return {
      value: `${severity} · P/F ${pf}`,
      interpretation: severity,
      color,
      details,
      actions,
      caveats: [
        'Berlin 2012 требует PEEP ≥ 5; Global 2023 допускает HFNC ≥ 30 л/мин',
        'Global 2023 вводит SpO₂/FiO₂ как альтернативу P/F при недоступности ABG',
        'Дифф.диагноз: TRALI, ДАД, ОЛ, пневмонит',
      ],
      related: [
        { id: 'pf-ratio', title: 'P/F ratio' }, { id: 'murray', title: 'Murray LIS' },
        { id: 'rox', title: 'ROX' }, { id: 'hacor', title: 'HACOR' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
    };
  },
  reference: 'ARDS Definition Task Force (Ranieri VM). JAMA 2012;307:2526-2533. Global Definition: Matthay MA et al. Am J Respir Crit Care Med 2024;209:37-47.',
  countries: 'Международный (ESICM/ATS/SCCM)',
  presets: [
    { label: 'Лёгкий ARDS', values: { timing: true, bilateral: true, noncardiac: true, pf: 250, peep: 5 } },
    { label: 'Умеренный ARDS', values: { timing: true, bilateral: true, noncardiac: true, pf: 150, peep: 10 } },
    { label: 'Тяжёлый ARDS', values: { timing: true, bilateral: true, noncardiac: true, pf: 80, peep: 12 } },
  ],
  caveats: [
    'Все 3 предпосылки обязательны: timing, bilateral infiltrates, non-cardiac origin',
    'PEEP/CPAP ≥ 5 см H₂O - обязательное условие для оценки P/F',
    'Global Definition 2023 расширяет на HFNC и SpO₂/FiO₂',
  ],
  info: `### Для чего используется
**Берлинское определение ARDS (2012)** + **Глобальное определение (2023)** - диагностика и стратификация ОРДС по тяжести.

### Предпосылки (все 3)
1. Начало < 1 недели
2. Двусторонние инфильтраты
3. Отёк не кардиогенного происхождения (ЭхоКГ если сомнения)

### Классификация по P/F при PEEP/CPAP ≥ 5
| Степень | P/F | Летальность |
|---|---|---|
| Лёгкий | 201-300 | ~ 27 % |
| Умеренный | 101-200 | ~ 32 % |
| Тяжёлый | ≤ 100 | ~ 45 % |

### Global Definition 2023
- Добавлены HFNC ≥ 30 л/мин и SpO₂/FiO₂ (при SpO₂ ≤ 97 %)
- Нет требования ИВЛ для диагноза при наличии HFNC

### Источники
- Ranieri VM et al. Acute respiratory distress syndrome: the Berlin Definition. JAMA 2012;307:2526-33.
- Matthay MA et al. A New Global Definition of ARDS. Am J Respir Crit Care Med 2024;209:37-47.`,
};

export default runner;
