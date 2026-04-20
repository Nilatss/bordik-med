// @ts-nocheck
/**
 * Runner: hacor - HACOR Score (Duan 2017) for NIV failure at 1 hour
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 25,
  inputs: [
    {
      id: 'hr', label: 'ЧСС',
      type: 'select',
      options: [
        { value: '0', label: '≤ 120', points: 0 },
        { value: '1', label: '> 120', points: 1 },
      ],
    },
    {
      id: 'ph', label: 'pH',
      type: 'select',
      options: [
        { value: '0', label: '≥ 7.35', points: 0 },
        { value: '2', label: '7.30-7.34', points: 2 },
        { value: '3', label: '7.25-7.29', points: 3 },
        { value: '4', label: '< 7.25', points: 4 },
      ],
    },
    {
      id: 'gcs', label: 'GCS',
      type: 'select',
      options: [
        { value: '0', label: '15', points: 0 },
        { value: '2', label: '13-14', points: 2 },
        { value: '5', label: '11-12', points: 5 },
        { value: '10', label: '≤ 10', points: 10 },
      ],
    },
    {
      id: 'pf', label: 'PaO₂/FiO₂',
      type: 'select',
      options: [
        { value: '0', label: '≥ 200', points: 0 },
        { value: '2', label: '176-199', points: 2 },
        { value: '3', label: '151-175', points: 3 },
        { value: '4', label: '126-150', points: 4 },
        { value: '5', label: '101-125', points: 5 },
        { value: '6', label: '≤ 100', points: 6 },
      ],
    },
    {
      id: 'rr', label: 'ЧДД',
      type: 'select',
      options: [
        { value: '0', label: '≤ 30', points: 0 },
        { value: '1', label: '31-35', points: 1 },
        { value: '2', label: '36-40', points: 2 },
        { value: '3', label: '41-45', points: 3 },
        { value: '4', label: '≥ 46', points: 4 },
      ],
    },
  ],
  bands: [
    { min: 0, max: 5, label: '≤ 5', color: '#22C55E', description: 'Низкий риск неудачи НИВЛ в 1-й час. Продолжать терапию.' },
    { min: 6, max: 10, label: '6-10', color: '#F59E0B', description: 'Умеренный риск - тщательный мониторинг, повторная оценка.' },
    { min: 11, max: 15, label: '11-15', color: '#EF4444', description: 'Высокий риск неудачи - рассмотреть раннюю интубацию.' },
    { min: 16, max: 25, label: '≥ 16', color: '#991B1B', description: 'Очень высокий риск - интубация, задержка ассоциирована с ростом смертности.' },
  ],
  caveats: [
    'Оценка в 1-й час НИВЛ - ключевая точка',
    'HACOR > 5 через 1 ч → чувствительность 72 %, специфичность 90 % для неудачи',
    'Задержка интубации при высоком HACOR увеличивает смертность (Duan 2022)',
    'Валидирован при острой гипоксемической ДН',
  ],
  relatedCourses: [
    { id: '300.4', title: 'Интенсивная терапия' },
    { id: '301.1', title: 'Анестезиология' },
  ],
  related: [
    { id: 'rox', title: 'ROX Index' },
    { id: 'berlin-ards', title: 'Berlin ARDS' },
    { id: 'pf-ratio', title: 'P/F ratio' },
    { id: 'gcs', title: 'GCS' },
  ],
  reference: 'Duan J, Han X, Bai L, et al. Intensive Care Med 2017;43:192-199.',
  countries: 'Международный',
  info: `### Для чего используется
**HACOR (Heart rate, Acidosis, Consciousness, Oxygenation, Respiratory rate; Duan 2017)** - прогноз неудачи неинвазивной вентиляции (НИВЛ) через **1 час** после старта у пациентов с острой гипоксемической ДН.

### Компоненты
| Параметр | Диапазон | Баллы |
|---|---|---|
| ЧСС | ≤ 120 / > 120 | 0 / 1 |
| pH | ≥ 7.35 / 7.30-7.34 / 7.25-7.29 / < 7.25 | 0 / 2 / 3 / 4 |
| GCS | 15 / 13-14 / 11-12 / ≤ 10 | 0 / 2 / 5 / 10 |
| P/F | ≥ 200 / 176-199 / 151-175 / 126-150 / 101-125 / ≤ 100 | 0 / 2 / 3 / 4 / 5 / 6 |
| ЧДД | ≤ 30 / 31-35 / 36-40 / 41-45 / ≥ 46 | 0 / 1 / 2 / 3 / 4 |

### Интерпретация (в 1-й час)
- **≤ 5** - продолжать НИВЛ
- **> 5** - высокий риск неудачи → интубация

### Источник
Duan J et al. Assessment of heart rate, acidosis, consciousness, oxygenation, and respiratory rate to predict noninvasive ventilation failure in hypoxemic patients. Intensive Care Med 2017;43:192-9.`,
};

export default runner;
