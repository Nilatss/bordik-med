// @ts-nocheck
/**
 * Runner: wilson-arne
 * Wilson risk sum score for difficult tracheal intubation (Wilson 1988).
 */

import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 10,
  inputs: [
    {
      id: 'weight',
      label: 'Вес',
      type: 'select',
      options: [
        { value: '0', label: '< 90 кг', points: 0 },
        { value: '1', label: '90-110 кг', points: 1 },
        { value: '2', label: '> 110 кг', points: 2 },
      ],
    },
    {
      id: 'head_neck',
      label: 'Подвижность головы и шеи (разгибание)',
      type: 'select',
      options: [
        { value: '0', label: '> 90° (норма)', points: 0 },
        { value: '1', label: '≈ 90° (ограничено)', points: 1 },
        { value: '2', label: '< 90° (резко ограничено)', points: 2 },
      ],
    },
    {
      id: 'jaw',
      label: 'Подвижность челюсти',
      type: 'select',
      options: [
        { value: '0', label: 'Межрезцовый зазор ≥ 5 см или субсюлюксация +', points: 0 },
        { value: '1', label: 'Зазор < 5 см или субсюлюксация нейтральная', points: 1 },
        { value: '2', label: 'Зазор < 5 см и субсюлюксация −', points: 2 },
      ],
    },
    {
      id: 'retro',
      label: 'Ретрогнатия (скошенная нижняя челюсть)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Умеренная', points: 1 },
        { value: '2', label: 'Выраженная', points: 2 },
      ],
    },
    {
      id: 'teeth',
      label: 'Выступание верхних резцов («buck teeth»)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Умеренное', points: 1 },
        { value: '2', label: 'Выраженное', points: 2 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 2,
      label: '0-2',
      color: '#22C55E',
      description: 'Низкий риск трудной интубации. Стандартная техника.',
      details: 'Wilson 1988: при сумме < 3 PPV для трудной интубации < 5%.',
      actions: ['Стандартная прямая ларингоскопия Macintosh', 'План B рутинно'],
    },
    {
      min: 3,
      max: 4,
      label: '3-4',
      color: '#F59E0B',
      description: 'Умеренный риск. Подготовить видеоларингоскоп и bougie.',
      details: 'При сумме 3-4 чувствительность для трудной интубации ≈ 75%, специфичность ≈ 88% (Wilson 1988).',
      actions: [
        'Видеоларингоскоп (McGrath / C-MAC / GlideScope) наготове',
        'Bougie, LMA 2-го поколения',
        'Ramped position, преоксигенация ≥ 3 мин',
      ],
    },
    {
      min: 5,
      max: 10,
      label: '≥ 5',
      color: '#EF4444',
      description: 'Высокий риск. Awake fiberoptic intubation - препарат выбора.',
      details: 'При сумме ≥ 5 PPV для трудной интубации > 50%. Обсудить AFOI до индукции.',
      actions: [
        'Awake fiberoptic intubation (AFOI) как первая линия',
        'DAS / ASA Difficult Airway Algorithm',
        'Два анестезиолога, ЛОР наготове',
        'Регионарная анестезия - альтернатива при возможности',
      ],
    },
  ],
  caveats: [
    'Wilson score оценивает только трудную ларингоскопию, не прогнозирует трудную масочную вентиляцию',
    'Субъективность оценок «умеренно/выраженно» - межрейтерская вариабельность',
    'Не учитывает беременность, анатомию шеи, ожирение лица, бороду',
    'Для ICU-интубаций использовать MACOCHA (De Jong 2013)',
  ],
  related: [
    { id: 'mallampati', title: 'Mallampati + LEMON' },
    { id: 'asa-ps', title: 'ASA-PS' },
  ],
  relatedCourses: [
    { id: '300.4', title: 'Неотложная помощь' },
    { id: '201.2', title: 'Дыхательная физиология' },
  ],
  reference: 'Wilson ME et al. Predicting difficult intubation. Br J Anaesth 1988;61:211-6.',
  info: `### Для чего используется
**Wilson risk sum score (Wilson 1988)** - прикроватная прогностическая шкала **трудной прямой ларингоскопии** у взрослых перед общей анестезией. Одна из старейших и наиболее изученных шкал.

### 5 критериев (0-2 балла каждый)
1. **Вес** (< 90 / 90-110 / > 110 кг)
2. **Подвижность головы и шеи** (> 90° / ≈ 90° / < 90°)
3. **Подвижность челюсти** (зазор + субсюлюксация)
4. **Ретрогнатия**
5. **Выступание верхних резцов (buck teeth)**

### Интерпретация
| Сумма | Риск трудной интубации |
|---|---|
| 0-2 | Низкий |
| 3-4 | Умеренный |
| ≥ 5 | Высокий |

### Операционные характеристики (Wilson 1988)
| Порог | Sensitivity | Specificity |
|---|---|---|
| ≥ 2 | 75% | 88% |
| ≥ 3 | 42% | 96% |

### Ограничения
- Не прогнозирует трудную вентиляцию мешком-маской (для этого OBESE/MOANS)
- Не применим при выраженной патологии шеи (опухоли, гематомы, эпиглоттит)
- Низкий PPV в общей популяции - обязательно комбинировать с Mallampati, LEMON`,
};

export default runner;
