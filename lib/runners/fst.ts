// @ts-nocheck
/**
 * Runner: fst - Furosemide Stress Test (Chawla 2013)
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'weight', label: 'Вес', type: 'number', unit: 'кг', min: 20, max: 250, step: 0.5, quickValues: [50, 60, 70, 80, 90, 100] },
    {
      id: 'exposure', label: 'Экспозиция к петлевым диуретикам',
      type: 'select',
      options: [
        { value: 'naive', label: 'Наивный (не получал последнюю неделю) - 1,0 мг/кг' },
        { value: 'prior', label: 'Получал петлевые - 1,5 мг/кг' },
      ],
    },
    { id: 'uo2h', label: 'Диурез за 2 ч после болюса', type: 'number', unit: 'мл', min: 0, max: 2000, step: 10, quickValues: [100, 150, 200, 300, 500] },
  ],
  compute: (v) => {
    const w = Number(v.weight);
    const dosePerKg = v.exposure === 'prior' ? 1.5 : 1.0;
    const dose = (w * dosePerKg).toFixed(0);
    const uo = Number(v.uo2h);
    let label = '', color = '', details = '', actions: string[] = [];
    if (uo < 200) {
      label = `Положительный FST · диурез ${uo} мл < 200`;
      color = '#991B1B';
      details = 'Диурез < 200 мл за 2 ч после болюса фуросемида предсказывает прогрессирование в AKI стадии 3 / потребность в ЗПТ. Чувствительность 87%, специфичность 84% (Chawla 2013).';
      actions = [
        'Готовиться к ЗПТ - обсудить показания AEIOU',
        'Оптимизировать гемодинамику и волемию',
        'Нефролог; избегать нефротоксинов',
        'Пересмотреть дозы препаратов по КК',
      ];
    } else {
      label = `Отрицательный FST · диурез ${uo} мл ≥ 200`;
      color = '#22C55E';
      details = 'Диурез ≥ 200 мл за 2 ч - низкая вероятность прогрессирования в тяжёлое AKI.';
      actions = [
        'Консервативная тактика, мониторинг Cr и диуреза',
        'Избегать дальнейших нефротоксинов',
        'Оптимизировать перфузию',
      ];
    }
    return {
      value: label,
      interpretation: label,
      color,
      details: `Доза фуросемида: ${dose} мг (${dosePerKg} мг/кг). ${details}`,
      actions,
      caveats: [
        'Выполнять только у эуволемичных пациентов (не при гиповолемии/обструкции)',
        'Доза: 1,0 мг/кг (наивный), 1,5 мг/кг (получал петлевые последнюю неделю)',
        'Оценка - суммарный диурез за 2 ч',
        'Порог 200 мл: чувствительность 87%, специфичность 84% для AKI 3 / ЗПТ',
        'Не заменяет клиническую оценку; не использовать при обструкции мочевых путей',
      ],
      related: [
        { id: 'rifle', title: 'RIFLE / KDIGO' },
        { id: 'mehta', title: 'Mehta (кардиохирургия)' },
        { id: 'fena', title: 'FENa' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.2', title: 'Нефрология' },
      ],
    };
  },
  reference: 'Chawla LS, Davison DL, Brasha-Mitchell E, et al. Development and standardization of a furosemide stress test to predict the severity of acute kidney injury. Crit Care 2013;17:R207.',
  countries: 'Международный',
  presets: [
    { label: 'Наивный 70 кг, UO 100 мл (+)', values: { weight: 70, exposure: 'naive', uo2h: 100 } },
    { label: 'Наивный 70 кг, UO 350 мл (−)', values: { weight: 70, exposure: 'naive', uo2h: 350 } },
    { label: 'На диуретиках 80 кг, UO 150 мл (+)', values: { weight: 80, exposure: 'prior', uo2h: 150 } },
  ],
  caveats: [
    'Только у эуволемичных пациентов',
    'Не использовать при обструкции или гиповолемии',
    'Порог 200 мл за 2 ч',
  ],
  info: `### Для чего используется
**Furosemide Stress Test (Chawla 2013)** - функциональный тест для прогнозирования прогрессирования AKI до стадии 3 / ЗПТ.

### Протокол
1. Убедиться в эуволемии
2. Ввести болюс фуросемида:
   - **1,0 мг/кг** - если не получал петлевые диуретики последнюю неделю
   - **1,5 мг/кг** - если получал
3. Измерить суммарный диурез за 2 ч

### Интерпретация
| Диурез 2 ч | Интерпретация |
|---|---|
| < 200 мл | **Положительный** - прогрессирование в AKI 3 / ЗПТ (чувствит. 87%, специф. 84%) |
| ≥ 200 мл | **Отрицательный** - низкий риск |

### Источник
Chawla LS et al. Crit Care 2013;17:R207.`,
};

export default runner;
