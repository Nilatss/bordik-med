// @ts-nocheck
/**
 * Runner: rsbi - Rapid Shallow Breathing Index (Yang-Tobin 1991)
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'rr',
hint: 'ЧДД, в минуту. Норма: 12-20', label: 'ЧДД (во время SBT/T-piece)', type: 'number', unit: '/мин', min: 5, max: 60, step: 1, quickValues: [12, 18, 22, 26, 30, 35] },
    { id: 'vt',
hint: 'Объём в миллилитрах', label: 'Дыхательный объём (Vt)', type: 'number', unit: 'мл', min: 50, max: 1000, step: 10, quickValues: [300, 400, 450, 500, 600] },
  ],
  compute: (v) => {
    const rr = Number(v.rr);
    const vt = Number(v.vt);
    const rsbi = rr / (vt / 1000);
    const val = rsbi.toFixed(0);
    let interpretation = '', color = '', details = '', actions: string[] = [];
    if (rsbi < 65) {
      interpretation = 'Высокая вероятность успешного отлучения';
      color = '#22C55E';
      details = 'RSBI < 65 - очень высокая вероятность успеха SBT (ЧДД низкая, Vt большой - эффективная спонтанная вентиляция).';
      actions = ['Продолжить SBT 30-120 мин', 'Экстубация при стабильных параметрах', 'Чек-лист: защитные рефлексы, секреция, сознание'];
    } else if (rsbi < 105) {
      interpretation = 'Вероятно успешное отлучение';
      color = '#84CC16';
      details = 'RSBI 65-104 - приемлемый диапазон, большинство пациентов успешно экстубируются. Yang-Tobin: порог < 105 имеет PPV ~ 80 %.';
      actions = ['Завершить SBT 30-120 мин', 'Оценить кашель, секрецию, сознание', 'Экстубация при стабильном RSBI'];
    } else {
      interpretation = 'Высокий риск неудачи экстубации';
      color = '#EF4444';
      details = 'RSBI ≥ 105 - быстрое поверхностное дыхание, признак высокой вентиляционной нагрузки или слабости дыхательных мышц. Высокий риск реинтубации.';
      actions = ['Продолжить ИВЛ', 'Оптимизировать седацию, баланс жидкости, нутрицию', 'Искать причину: усталость мышц, кардиальная причина, секреция, метаболические', 'Повторить SBT через 24 часа'];
    }
    return {
      value: val,
      unit: '/мин/л',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Формула: RSBI = ЧДД / Vt(л); измеряется во время SBT (T-piece или PS 0 / PEEP 0)',
        'PPV для успешной экстубации при < 105 ≈ 80 %; NPV при ≥ 105 ≈ 95 %',
        'Не использовать при CPAP/PS - искусственно снижает RSBI',
        'Оценивать на 1-й минуте SBT (Yang-Tobin); меньше валидирован в конце SBT',
      ],
      related: [
        { id: 'pf-ratio', title: 'P/F ratio' },
        { id: 'rox', title: 'ROX' },
        { id: 'hacor', title: 'HACOR' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: 65, label: 'Отлично', color: '#22C55E' },
          { min: 65, max: 105, label: 'Успех вероятен', color: '#84CC16' },
          { min: 105, max: 300, label: 'Неудача вероятна', color: '#EF4444' },
        ],
        current: Number(val),
        unit: '/мин/л',
      },
    };
  },
  reference: 'Yang KL, Tobin MJ. N Engl J Med 1991;324:1445-1450.',
  countries: 'Международный',
  presets: [
    { label: 'Готов к экстубации', values: { rr: 18, vt: 500 } },
    { label: 'Пограничный', values: { rr: 25, vt: 300 } },
    { label: 'Высокий риск неудачи', values: { rr: 35, vt: 250 } },
  ],
  caveats: [
    'RSBI = ЧДД / Vt (в литрах)',
    'Измеряется в первые 1-3 мин SBT',
    'Порог < 105 - классический Yang-Tobin',
  ],
  info: `
### Для чего используется
**Rapid Shallow Breathing Index (Yang-Tobin 1991)** - простейший и самый валидированный предиктор успеха отлучения от ИВЛ. Измеряется на T-piece или минимальной поддержке.

### Формула
\`RSBI = ЧДД / Vt(л)\`

единицы /мин/л

### Пороги
| RSBI | Интерпретация |
|---|---|
| < 65 | Очень высокая вероятность успеха |
| 65-104 | Успех вероятен (PPV ~ 80 %) |
| ≥ 105 | Высокий риск неудачи (NPV ~ 95 %) |

### Как мерить
1. Перевести на T-piece или PS 0 / PEEP 0
2. На 1-й минуте: зафиксировать ЧДД и среднее Vt
3. Рассчитать RSBI

### Источник
Yang KL, Tobin MJ. A prospective study of indexes predicting the outcome of trials of weaning from mechanical ventilation. N Engl J Med 1991;324:1445-50.`,
};

export default runner;
