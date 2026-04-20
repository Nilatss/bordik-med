// @ts-nocheck
/** Runner: ham-a — Hamilton Anxiety Rating Scale */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol. 1959;32:50-55.',
  inputs: [
    {
      id: 'total',
      label: 'Суммарный балл HAM-A (14 пунктов × 0-4, max 56)',
      type: 'number',
      min: 0,
      max: 56,
      step: 1,
      quickValues: [8, 14, 20, 27, 35],
      hint: 'Сумма 14 пунктов интервью клинициста. Каждый 0-4 балла.',
    },
    {
      id: 'psychic',
      label: 'Психические симптомы (пункты 1-6, 14) доминируют',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'somatic',
      label: 'Соматические симптомы (пункты 7-13) доминируют',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Лёгкая (12)', values: { total: 12, psychic: true, somatic: false } },
    { label: 'Средняя (20)', values: { total: 20, psychic: true, somatic: true } },
    { label: 'Тяжёлая (28)', values: { total: 28, psychic: false, somatic: true } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(56, Number(v.total) || 0));

    let color = '#22C55E';
    let label = 'Нет / минимальная (<8)';
    let details = 'Клинически значимой тревоги нет.';
    const actions: string[] = [];

    if (total >= 25) {
      color = '#991B1B';
      label = 'Тяжёлая (25-30+)';
      details = 'Тяжёлая тревога с выраженным функциональным нарушением.';
      actions.push(
        'СИОЗС/СИОЗСН + КПТ',
        'Исключить гипертиреоз, феохромоцитому, кардиологические причины',
        'Краткосрочно бензодиазепины (не более 2-4 нед)',
      );
    } else if (total >= 18) {
      color = '#EF4444';
      label = 'Средняя (18-24)';
      details = 'Умеренно выраженное тревожное расстройство.';
      actions.push(
        'СИОЗС (эсциталопрам, сертралин) первой линии',
        'КПТ с экспозицией',
      );
    } else if (total >= 8) {
      color = '#F59E0B';
      label = 'Лёгкая (<17 ~ 8-17)';
      details = 'Лёгкая тревога.';
      actions.push(
        'Психообразование, КПТ, физическая активность',
        'Снижение кофеина, алкоголя, стимуляторов',
      );
    } else {
      actions.push('Наблюдение');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'HAM-A — клиническое интервью, требует обученного интервьюера',
        'Не различает типы тревожных расстройств (ГТР, паническое, фобии)',
        'Соматические пункты перекрываются с физическими заболеваниями — оценивать в контексте',
        'Для скрининга в первичной помощи проще GAD-7',
      ],
      scale: {
        segments: [
          { min: 0, max: 7, label: '<8 норма', color: '#22C55E' },
          { min: 8, max: 17, label: '8-17 лёгкая', color: '#F59E0B' },
          { min: 18, max: 24, label: '18-24 средняя', color: '#EF4444' },
          { min: 25, max: 56, label: '≥25 тяжёлая', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'gad7', title: 'GAD-7' },
        { id: 'spin', title: 'SPIN (соц. тревога)' },
        { id: 'phq9', title: 'PHQ-9' },
      ],
      relatedCourses: [{ id: '201.3', title: 'Нейрофизиология' }],
    };
  },
  info: `### Для чего используется
**Hamilton Anxiety Rating Scale (HAM-A, Hamilton 1959)** — одна из первых клинических шкал для оценки тяжести тревожных симптомов. 14 пунктов × 0-4 балла, заполняется клиницистом после интервью.

### Структура
- **Психические (пункты 1-6, 14)**: тревожное настроение, напряжение, страхи, инсомния, когнитивные нарушения, депрессивное настроение, поведение на интервью
- **Соматические (пункты 7-13)**: мышечные, сенсорные, кардио-васкулярные, респираторные, ЖКТ, мочеполовые, вегетативные

### Интерпретация
| HAM-A | Тяжесть |
|---|---|
| <8 | Нет / минимальная |
| 8-17 | Лёгкая |
| 18-24 | Средняя |
| ≥25 | Тяжёлая (часто 25-30+) |

**Ответ на терапию** в RCT — снижение ≥50%.

### Ограничения
- Неспецифична: не различает ГТР, паническое, фобии
- Сильный упор на соматические симптомы может завышать балл при физических заболеваниях
- Требует ~20-30 мин интервью

### Источник
Hamilton M. *The assessment of anxiety states by rating.* Br J Med Psychol. 1959;32:50-55.`,
};

export default runner;
