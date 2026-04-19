// @ts-nocheck
/**
 * Runner: preserve — PRESERVE Score (Schmidt 2013) для post-ICU инвалидности после VV-ECMO
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 14,
  inputs: [
    {
      id: 'age', label: 'Возраст', type: 'select',
      options: [
        { value: '0', label: '< 45 лет', points: 0 },
        { value: '2', label: '45–55 лет', points: 2 },
        { value: '3', label: '> 55 лет', points: 3 },
      ],
    },
    { id: 'immuno', label: 'Иммунокомпрометация', type: 'checkbox', points: 2 },
    {
      id: 'sofa', label: 'SOFA на старте ECMO', type: 'select',
      options: [
        { value: '0', label: '≤ 12', points: 0 },
        { value: '1', label: '> 12', points: 1 },
      ],
    },
    {
      id: 'vent', label: 'Длительность ИВЛ до ECMO', type: 'select',
      options: [
        { value: '0', label: '< 6 сут', points: 0 },
        { value: '1', label: '≥ 6 сут', points: 1 },
      ],
    },
    {
      id: 'pf', label: 'PaO₂/FiO₂ на старте', type: 'select',
      options: [
        { value: '0', label: '≥ 70', points: 0 },
        { value: '2', label: '< 70', points: 2 },
      ],
    },
    {
      id: 'peep', label: 'PEEP на старте', type: 'select',
      options: [
        { value: '0', label: '≤ 10 см H₂O', points: 0 },
        { value: '3', label: '> 10 см H₂O', points: 3 },
      ],
    },
    {
      id: 'pplat', label: 'Plateau pressure', type: 'select',
      options: [
        { value: '0', label: '≤ 30 см H₂O', points: 0 },
        { value: '2', label: '> 30 см H₂O', points: 2 },
      ],
    },
  ],
  bands: [
    { min: 0, max: 2, label: '0–2', color: '#22C55E', description: '6-мес выживаемость ~ 97%.' },
    { min: 3, max: 4, label: '3–4', color: '#84CC16', description: '~ 79%.' },
    { min: 5, max: 6, label: '5–6', color: '#F59E0B', description: '~ 54%.' },
    { min: 7, max: 8, label: '7–8', color: '#EF4444', description: '~ 34%.' },
    {
      min: 9, max: 14, label: '≥ 9', color: '#991B1B',
      description: '~ 16% и ниже. Высокий риск стойкой функциональной инвалидности.',
      details: 'Рассмотреть цели терапии, риск post-intensive care syndrome (PICS), раннюю реабилитацию.',
      actions: [
        'Ранняя мобилизация, реабилитация после декануляции',
        'Оценка PICS (физическая / когнитивная / психическая)',
        'MDT: пульмонолог, реабилитолог, психиатр',
        'Обсудить ожидания с семьёй',
      ],
    },
  ],
  caveats: [
    'Предсказывает 6-мес выживаемость и функциональный статус после VV-ECMO при ARDS',
    'Валидирован на 140 пациентах; внешняя валидация ограничена',
    'Связанные шкалы: ECMOnet (когортная выживаемость), ENCOURAGE (VA-ECMO)',
    'Не заменяет мультидисциплинарное обсуждение',
  ],
  relatedCourses: [
    { id: '300.4', title: 'Интенсивная терапия' },
    { id: '301.1', title: 'Анестезиология' },
  ],
  related: [
    { id: 'resp', title: 'RESP Score' },
    { id: 'berlin-ards', title: 'Berlin ARDS' },
    { id: 'murray-ecmo', title: 'Murray LIS (ECMO)' },
    { id: 'sofa', title: 'SOFA' },
  ],
  reference: 'Schmidt M, Zogheib E, Rozé H, et al. The PRESERVE mortality risk score and analysis of long-term outcomes after extracorporeal membrane oxygenation for severe acute respiratory distress syndrome. Intensive Care Med 2013;39:1704–1713.',
  info: `### Для чего используется
**PRESERVE Score (Schmidt 2013)** — прогноз 6-месячной смертности и функциональной инвалидности после VV-ECMO у пациентов с тяжёлым ARDS.

### 8 предикторов (сумма 0–14)
| Параметр | Баллы |
|---|---|
| Возраст 45–55 / > 55 | 2 / 3 |
| Иммунокомпрометация | 2 |
| SOFA > 12 | 1 |
| ИВЛ ≥ 6 сут до ECMO | 1 |
| PaO₂/FiO₂ < 70 | 2 |
| PEEP > 10 | 3 |
| Plateau > 30 | 2 |

### 6-мес выживаемость
| Баллы | Выживаемость |
|---|---|
| 0–2 | 97% |
| 3–4 | 79% |
| 5–6 | 54% |
| 7–8 | 34% |
| ≥ 9 | ≤ 16% |

### Связанные шкалы
- **ECMOnet** — когортная выживаемость
- **ENCOURAGE** — для VA-ECMO после ИМ

### Источник
Schmidt M et al. Intensive Care Med 2013;39:1704–13.`,
};

export default runner;
