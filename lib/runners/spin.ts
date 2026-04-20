// @ts-nocheck
/** Runner: spin — Social Phobia Inventory */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Connor KM, Davidson JR, Churchill LE, et al. Psychometric properties of the Social Phobia Inventory (SPIN). Br J Psychiatry. 2000;176:379-386.',
  inputs: [
    {
      id: 'total',
      label: 'Суммарный балл SPIN (17 пунктов × 0-4, max 68)',
      type: 'number',
      min: 0,
      max: 68,
      step: 1,
      quickValues: [10, 19, 30, 40, 50],
      hint: 'Сумма 17 пунктов самоопросника. Каждый 0-4 балла.',
    },
    {
      id: 'avoidance',
      label: 'Выраженное избегание социальных ситуаций',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Норма (12)', values: { total: 12, avoidance: false } },
    { label: 'Соц. тревога (25)', values: { total: 25, avoidance: true } },
    { label: 'Тяжёлая (45)', values: { total: 45, avoidance: true } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(68, Number(v.total) || 0));
    const avoid = v.avoidance === true;

    let color = '#22C55E';
    let label = 'Нет социальной фобии (0-18)';
    let details = 'Балл ниже клинического порога.';
    const actions: string[] = [];

    if (total >= 51) {
      color = '#7F1D1D';
      label = 'Очень тяжёлая (≥51)';
      details = 'Очень тяжёлое социальное тревожное расстройство с выраженной нетрудоспособностью.';
      actions.push(
        'КПТ с экспозицией — первая линия',
        'СИОЗС (пароксетин, сертралин, эсциталопрам) в стандартных или повышенных дозах',
        'Рассмотреть комбинированную терапию',
      );
    } else if (total >= 41) {
      color = '#EF4444';
      label = 'Тяжёлая (41-50)';
      details = 'Тяжёлое социальное тревожное расстройство.';
      actions.push(
        'СИОЗС + КПТ',
        'Венлафаксин — альтернатива',
      );
    } else if (total >= 31) {
      color = '#F59E0B';
      label = 'Умеренная (31-40)';
      details = 'Умеренно выраженное социальное тревожное расстройство.';
      actions.push(
        'КПТ (групповая или индивидуальная)',
        'СИОЗС при функциональном нарушении',
      );
    } else if (total >= 19) {
      color = '#FACC15';
      label = 'Лёгкая / вероятное расстройство (19-30)';
      details = 'Cutoff ≥19 — вероятное социальное тревожное расстройство.';
      actions.push(
        'Структурированное клиническое интервью для подтверждения',
        'КПТ первой линии; психообразование',
      );
    } else {
      actions.push('Наблюдение; при выраженном избегании — повторная оценка');
    }

    if (avoid) {
      actions.push('Активное избегание — ключевой мишень экспозиционной терапии');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'Cutoff ≥19 — отсечение для вероятного социального тревожного расстройства',
        'Самоопросник; диагноз требует клинического интервью (DSM-5 / ICD-11)',
        'Высокая коморбидность с депрессией, алкогольной зависимостью, паническим расстройством',
        'Бета-блокаторы (пропранолол) — только ситуационно при публичных выступлениях, не для генерализованной формы',
      ],
      scale: {
        segments: [
          { min: 0, max: 18, label: '0-18 норма', color: '#22C55E' },
          { min: 19, max: 30, label: '19-30 лёгкая', color: '#FACC15' },
          { min: 31, max: 40, label: '31-40 умеренная', color: '#F59E0B' },
          { min: 41, max: 50, label: '41-50 тяжёлая', color: '#EF4444' },
          { min: 51, max: 68, label: '≥51 оч.тяж.', color: '#7F1D1D' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'gad7', title: 'GAD-7' },
        { id: 'ham-a', title: 'HAM-A' },
        { id: 'phq9', title: 'PHQ-9' },
      ],
      relatedCourses: [{ id: '201.3', title: 'Нейрофизиология' }],
    };
  },
  info: `### Для чего используется
**Social Phobia Inventory (SPIN, Connor 2000)** — 17-пунктовый самоопросник для оценки **социального тревожного расстройства** (социальной фобии). Охватывает 3 домена: страх, избегание, физиологический дискомфорт (потливость, тремор, тахикардия).

### Интерпретация
| SPIN | Тяжесть |
|---|---|
| 0-18 | Норма |
| 19-30 | Лёгкая (вероятное расстройство) |
| 31-40 | Умеренная |
| 41-50 | Тяжёлая |
| ≥51 | Очень тяжёлая |

**Cutoff ≥19** — скрининг-позитив для социального тревожного расстройства (чувствительность 73%, специфичность 84%).

### Лечение (DSM-5 / NICE)
| Форма | Первая линия |
|---|---|
| Генерализованная | СИОЗС (пароксетин, сертралин, эсциталопрам) + КПТ с экспозицией |
| Специфическая (публичные выступления) | β-блокатор пропранолол 10-40 мг за 1 ч |
| Коморбидная с депрессией | СИОЗС + КПТ |

### Короткая версия
**Mini-SPIN** — 3 пункта, cutoff ≥6 — быстрый скрининг в первичной помощи.

### Ограничения
- Самоопросник, нужен клинический интервью для диагноза
- Не отличает генерализованную от специфической формы
- Высокая коморбидность с депрессией, ГТР, алкоголем

### Источник
Connor KM, Davidson JR, Churchill LE, et al. *Psychometric properties of the Social Phobia Inventory (SPIN).* Br J Psychiatry. 2000;176:379-386.`,
};

export default runner;
