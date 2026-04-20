// @ts-nocheck
/** Runner: iciq */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'q1', label: '1. Частота подтекания мочи', type: 'select', options: [
      { value: '0', label: 'Никогда', points: 0 },
      { value: '1', label: '≈1 раз в неделю или реже', points: 1 },
      { value: '2', label: '2–3 раза в неделю', points: 2 },
      { value: '3', label: 'Примерно 1 раз в день', points: 3 },
      { value: '4', label: 'Несколько раз в день', points: 4 },
      { value: '5', label: 'Постоянно', points: 5 },
    ] },
    { id: 'q2', label: '2. Обычное количество подтекания', type: 'select', options: [
      { value: '0', label: 'Нет', points: 0 },
      { value: '2', label: 'Небольшое', points: 2 },
      { value: '4', label: 'Умеренное', points: 4 },
      { value: '6', label: 'Большое', points: 6 },
    ] },
    { id: 'q3', label: '3. Насколько мешает в повседневной жизни (0–10)', type: 'number', unit: 'балл', min: 0, max: 10, step: 1, quickValues: [0, 3, 5, 7, 10] },
  ],
  compute: (v) => {
    const q1 = Number(v.q1);
    const q2 = Number(v.q2);
    const q3 = Math.max(0, Math.min(10, Number(v.q3)));
    const total = q1 + q2 + q3;

    let color = '#22C55E', interpretation = 'Нет/минимальное';
    if (total >= 15) { color = '#991B1B'; interpretation = 'Очень тяжёлое'; }
    else if (total >= 13) { color = '#EF4444'; interpretation = 'Тяжёлое'; }
    else if (total >= 6) { color = '#F59E0B'; interpretation = 'Умеренное'; }
    else if (total >= 1) { color = '#FACC15'; interpretation = 'Лёгкое'; }

    const actions = total <= 5
      ? ['Поведенческая терапия: тренировка мочевого пузыря, режим питья', 'Упражнения Кегеля (pelvic floor)']
      : total <= 12
        ? ['Оценить тип недержания (стрессовое/императивное/смешанное)',
           'Кегель + biofeedback',
           'При императивном — антихолинергик или β3-агонист (мирабегрон)',
           'Коррекция образа жизни: BMI, кофеин, запоры']
        : ['Направление к урогинекологу/урологу',
           'Стрессовое: слинговые операции (TVT/TOT), колпосуспензия',
           'Императивное рефрактерное: BoNT-A в детрузор, сакральная нейромодуляция',
           'Уродинамическое исследование'];

    return {
      value: String(total),
      unit: 'балл ICIQ',
      interpretation,
      color,
      details: `ICIQ-UI SF: ${total}/21 (Q1=${q1}, Q2=${q2}, Q3=${q3}). ${interpretation} недержание.`,
      actions,
      caveats: [
        'Q4 (самовосприятие типа) — описательный, в сумму не входит',
        'Чувствителен к изменениям — используется как primary outcome в РКИ',
        'Не дифференцирует стрессовое/императивное — нужен дневник мочеиспускания',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нет', color: '#22C55E' },
          { min: 1, max: 6, label: 'Лёгкое', color: '#FACC15' },
          { min: 6, max: 13, label: 'Умеренное', color: '#F59E0B' },
          { min: 13, max: 15, label: 'Тяжёлое', color: '#EF4444' },
          { min: 15, max: 22, label: 'Оч. тяжёлое', color: '#991B1B' },
        ],
        current: total,
        unit: 'балл',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'ipss', title: 'IPSS' },
        { id: 'pvr', title: 'PVR' },
      ],
    };
  },
  reference: 'Avery K et al. Neurourol Urodyn 2004 (ICIQ-UI SF).',
  countries: 'Международный (ICS)',
  presets: [
    { label: 'Лёгкое', values: { q1: '1', q2: '2', q3: 2 } },
    { label: 'Умеренное', values: { q1: '3', q2: '4', q3: 5 } },
    { label: 'Тяжёлое', values: { q1: '4', q2: '6', q3: 8 } },
  ],
  info: `### Для чего используется
**ICIQ-UI SF (International Consultation on Incontinence — Urinary Incontinence Short Form)** — валидированный опросник для оценки недержания мочи.

### Шкала (0–21)
| Балл | Тяжесть |
|---|---|
| 1–5 | Лёгкое |
| 6–12 | Умеренное |
| 13–18 | Тяжёлое |
| 19–21 | Очень тяжёлое |

### Источник
Avery K, Donovan J, Peters TJ, et al. Neurourol Urodyn 2004;23:322–330.`,
};
export default runner;
