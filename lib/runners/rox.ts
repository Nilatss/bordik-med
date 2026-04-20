// @ts-nocheck
/**
 * Runner: rox - ROX Index (Roca 2019) for HFNC failure prediction
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'spo2', label: 'SpO₂', type: 'number', unit: '%', min: 50, max: 100, step: 1, quickValues: [85, 90, 92, 95, 97] },
    { id: 'fio2', label: 'FiO₂', type: 'number', unit: 'доля (0.21-1.0)', min: 0.21, max: 1.0, step: 0.01, quickValues: [0.3, 0.4, 0.5, 0.6, 0.8, 1.0] },
    { id: 'rr', label: 'ЧДД', type: 'number', unit: '/мин', min: 5, max: 60, step: 1, quickValues: [20, 25, 30, 35, 40] },
  ],
  compute: (v) => {
    const spo2 = Number(v.spo2);
    const fio2 = Number(v.fio2);
    const rr = Number(v.rr);
    const sf = spo2 / fio2;
    const rox = sf / rr;
    const val = rox.toFixed(2);
    let interpretation = '', color = '', details = '', actions: string[] = [];
    if (rox >= 4.88) {
      interpretation = 'Низкий риск неудачи HFNC';
      color = '#22C55E';
      details = 'ROX ≥ 4.88 в любой момент (2 / 6 / 12 ч) предсказывает успешную HFNC-терапию. Продолжать неинвазивную поддержку.';
      actions = ['Продолжать HFNC', 'Переоценка ROX через 2, 6, 12 ч', 'Отвыкание при стабильном ROX > 4.88'];
    } else if (rox >= 3.85) {
      interpretation = 'Неопределённая зона';
      color = '#F59E0B';
      details = 'ROX 3.85-4.87: неопределённая зона - повторить через 1-2 часа. Тщательное наблюдение.';
      actions = ['Частая переоценка (каждые 30-60 мин)', 'Готовность к интубации', 'Оптимизировать FiO₂/flow на HFNC'];
    } else {
      interpretation = 'Высокий риск неудачи HFNC';
      color = '#EF4444';
      details = 'ROX < 3.85 в любой момент - высокий риск неудачи HFNC. Рассмотреть раннюю интубацию (задержка ассоциирована с ростом летальности).';
      actions = ['Рассмотреть интубацию немедленно', 'Готовить индукцию и RSI', 'Оценить причину ухудшения (пневмония, ARDS, отёк)'];
    }
    return {
      value: val,
      unit: 'ROX',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'ROX = (SpO₂/FiO₂)/ЧДД',
        'Пороги применимы к пневмонии/ARDS при HFNC',
        'Оценка в 3 точки: 2, 6, 12 часов',
        'Не валидирован при ХОБЛ и кардиогенном ОЛ',
      ],
      related: [
        { id: 'berlin-ards', title: 'Berlin ARDS' },
        { id: 'pf-ratio', title: 'P/F ratio' },
        { id: 'hacor', title: 'HACOR' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: 3.85, label: 'Высокий риск', color: '#EF4444' },
          { min: 3.85, max: 4.88, label: 'Неопр.', color: '#F59E0B' },
          { min: 4.88, max: 15, label: 'Низкий риск', color: '#22C55E' },
        ],
        current: Number(val),
        unit: 'ROX',
      },
    };
  },
  reference: 'Roca O, Caralt B, Messika J, et al. Am J Respir Crit Care Med 2019;199:1368-1376.',
  countries: 'Международный',
  presets: [
    { label: 'Успех HFNC', values: { spo2: 96, fio2: 0.4, rr: 22 } },
    { label: 'Пограничный', values: { spo2: 92, fio2: 0.5, rr: 28 } },
    { label: 'Риск неудачи', values: { spo2: 88, fio2: 0.8, rr: 35 } },
  ],
  caveats: [
    'Формула: ROX = (SpO₂/FiO₂)/ЧДД',
    'Пороги валидированы у пациентов с пневмонией на HFNC',
    'Задержка интубации при ROX < 3.85 → рост смертности',
  ],
  info: `### Для чего используется
**ROX Index (Roca 2019)** - прогноз неудачи терапии HFNC (high-flow nasal cannula). Помогает вовремя перейти к интубации без риска переоценки неинвазивной поддержки.

### Формула
**ROX = (SpO₂ / FiO₂) / ЧДД**

### Пороги
| Время | ROX | Интерпретация |
|---|---|---|
| 2 / 6 / 12 ч | ≥ 4.88 | Низкий риск - продолжать HFNC |
| Любой | 3.85-4.87 | Зона неопределённости |
| Любой | < 3.85 | Высокий риск - рассмотреть интубацию |

### Источник
Roca O et al. An index combining respiratory rate and oxygenation to predict outcome of nasal high-flow therapy. Am J Respir Crit Care Med 2019;199:1368-76.`,
};

export default runner;
