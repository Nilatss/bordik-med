/**
 * Runner: murray - Murray Lung Injury Score (1988)
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'cxr', label: 'Инфильтраты на рентгенограмме (консолидация)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет консолидаций', points: 0 },
        { value: '1', label: 'Консолидации в 1 квадранте', points: 1 },
        { value: '2', label: 'Консолидации в 2 квадрантах', points: 2 },
        { value: '3', label: 'Консолидации в 3 квадрантах', points: 3 },
        { value: '4', label: 'Консолидации во всех 4 квадрантах', points: 4 },
      ],
    },
    {
      id: 'pf', label: 'Гипоксемия (PaO₂/FiO₂)',
      type: 'select',
      options: [
        { value: '0', label: '≥ 300', points: 0 },
        { value: '1', label: '225-299', points: 1 },
        { value: '2', label: '175-224', points: 2 },
        { value: '3', label: '100-174', points: 3 },
        { value: '4', label: '< 100', points: 4 },
      ],
    },
    {
      id: 'peep', label: 'PEEP (см H₂O, при ИВЛ)',
      type: 'select',
      options: [
        { value: '0', label: '≤ 5', points: 0 },
        { value: '1', label: '6-8', points: 1 },
        { value: '2', label: '9-11', points: 2 },
        { value: '3', label: '12-14', points: 3 },
        { value: '4', label: '≥ 15', points: 4 },
      ],
    },
    {
      id: 'compl', label: 'Комплаенс лёгких (мл/см H₂O, при ИВЛ)',
      type: 'select',
      options: [
        { value: '0', label: '≥ 80', points: 0 },
        { value: '1', label: '60-79', points: 1 },
        { value: '2', label: '40-59', points: 2 },
        { value: '3', label: '20-39', points: 3 },
        { value: '4', label: '≤ 19', points: 4 },
      ],
    },
  ],
  compute: (v) => {
    const a = Number(v.cxr), b = Number(v.pf), c = Number(v.peep), d = Number(v.compl);
    const total = a + b + c + d;
    const mean = total / 4;
    let interpretation = '', color = '', details = '', actions: string[] = [];
    if (mean === 0) {
      interpretation = 'Повреждение лёгких отсутствует'; color = '#22C55E';
      details = 'Score = 0: нет повреждения.';
      actions = ['Наблюдение'];
    } else if (mean <= 2.5) {
      interpretation = 'Лёгкое/умеренное повреждение'; color = '#F59E0B';
      details = 'LIS 0.1-2.5: лёгкое или умеренное повреждение лёгких.';
      actions = ['Низкообъёмная ИВЛ Vt 6 мл/кг', 'PEEP-таблица ARDSnet', 'Консервативная инфузия'];
    } else {
      interpretation = 'Тяжёлое повреждение лёгких'; color = '#991B1B';
      details = 'LIS > 2.5: тяжёлое повреждение - критерий отбора для ECMO (CESAR, EOLIA).';
      actions = ['Прон-позиция ≥ 16 ч/сут', 'VV-ECMO - рассмотреть (EOLIA/Berlin)', 'Нейромышечная блокада ≤ 48 ч', 'Rescue: NO, эпопростенол'];
    }
    return {
      value: mean.toFixed(2),
      unit: 'LIS',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Требует ИВЛ для оценки PEEP и комплаенса',
        'Сумма 4 компонентов делится на 4 (среднее)',
        'Основной инструмент отбора на ECMO (LIS > 3 - исторический порог CESAR)',
      ],
      related: [
        { id: 'berlin-ards', title: 'Berlin ARDS' },
        { id: 'pf-ratio', title: 'P/F ratio' },
        { id: 'rox', title: 'ROX' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: 0.1, label: '0', color: '#22C55E' },
          { min: 0.1, max: 2.5, label: 'Лёгкий/умер.', color: '#F59E0B' },
          { min: 2.5, max: 4, label: 'Тяжёлый', color: '#991B1B' },
        ],
        current: Number(mean.toFixed(2)),
        unit: 'LIS',
      },
    };
  },
  reference: 'Murray JF, Matthay MA, Luce JM, Flick MR. Am Rev Respir Dis 1988;138:720-723.',
  countries: 'Международный',
  presets: [
    { label: 'Тяжёлый (ECMO-кандидат)', values: { cxr: '4', pf: '4', peep: '4', compl: '4' } },
    { label: 'Умеренный', values: { cxr: '2', pf: '2', peep: '2', compl: '2' } },
    { label: 'Норма', values: { cxr: '0', pf: '0', peep: '0', compl: '0' } },
  ],
  caveats: [
    'Не валидизирован без ИВЛ',
    'Используется при отборе для ECMO (LIS > 2.5-3)',
    'Менее популярен, чем Berlin Definition',
  ],
  info: `### Для чего используется
**Lung Injury Score (Murray 1988)** - 4-компонентная шкала повреждения лёгких у пациентов на ИВЛ, исторически первая стандартизированная оценка острой дыхательной недостаточности. Используется в отборе для ECMO (CESAR trial).

### 4 компонента (0-4 балла каждый), сумма / 4
| Компонент | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| CXR квадранты | нет | 1 | 2 | 3 | 4 |
| P/F | ≥ 300 | 225-299 | 175-224 | 100-174 | < 100 |
| PEEP | ≤ 5 | 6-8 | 9-11 | 12-14 | ≥ 15 |
| Комплаенс | ≥ 80 | 60-79 | 40-59 | 20-39 | ≤ 19 |

### Интерпретация
| LIS | Интерпретация |
|---|---|
| 0 | Нет повреждения |
| 0.1-2.5 | Лёгкое/умеренное |
| > 2.5 | Тяжёлое (ECMO-кандидат) |

### Источник
Murray JF, Matthay MA, Luce JM, Flick MR. An expanded definition of the adult respiratory distress syndrome. Am Rev Respir Dis 1988;138:720-3.`,
};

export default runner;
