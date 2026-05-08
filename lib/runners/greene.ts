/** Runner: greene - шкалы климактерия (Greene / Kupperman / MRS) */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'scale',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'greene', label: 'Greene Climacteric (21 пункт × 0-3)' },
        { value: 'kupperman', label: 'Kupperman Menopause Index (11, взвешенно)' },
        { value: 'mrs', label: 'Menopause Rating Scale (11 × 0-4)' },
      ],
    },
    { id: 'psych', label: 'Психологические симптомы (ср. балл 0-3 для Greene; вклад в Kupperman/MRS)', type: 'number', min: 0, max: 4, step: 0.5 },
    { id: 'somatic', label: 'Соматические симптомы (0-3 Greene)', type: 'number', min: 0, max: 4, step: 0.5 },
    { id: 'vasomotor', label: 'Вазомоторные (приливы) 0-3', type: 'number', min: 0, max: 4, step: 0.5 },
    { id: 'sexual', label: 'Сексуальные 0-3', type: 'number', min: 0, max: 4, step: 0.5 },
    { id: 'items', label: 'Число пунктов с жалобами (для Kupperman/MRS)', type: 'number', min: 0, max: 21, step: 1 },
  ],
  compute: (v) => {
    const scale = v.scale;
    const psych = Number(v.psych) || 0;
    const som = Number(v.somatic) || 0;
    const vaso = Number(v.vasomotor) || 0;
    const sex = Number(v.sexual) || 0;
    const items = Number(v.items) || 0;
    let total = 0;
    let max = 0;
    let name = '';
    if (scale === 'greene') {
      total = psych * 11 + som * 7 + vaso * 2 + sex * 1;
      max = 63;
      name = 'Greene Climacteric';
    } else if (scale === 'kupperman') {
      // weighted: vaso×4, paresthesia×2, insomnia×2, nervousness×2, melancholia×1, vertigo×1, weakness×1, arthralgia×1, headache×1, palpitation×1, formication×1
      total = Math.round(vaso * 4 + psych * 4 + som * 3 + sex * 1 + items);
      max = 51;
      name = 'Kupperman Menopause Index';
    } else {
      total = Math.round((psych + som + vaso + sex) * 2.75 + items * 0.5);
      max = 44;
      name = 'Menopause Rating Scale';
    }
    let sev = '';
    let color = '#22C55E';
    const pct = (total / max) * 100;
    if (pct < 20) { sev = 'Лёгкая / норма'; color = '#22C55E'; }
    else if (pct < 50) { sev = 'Средняя'; color = '#F59E0B'; }
    else { sev = 'Тяжёлая'; color = '#DC2626'; }
    return {
      value: String(total),
      unit: 'балл',
      interpretation: `${name}: ${total}/${max} - ${sev}`,
      color,
      details:
        'Greene: пороги условны (< 15 лёгкая, 15-30 средняя, > 30 тяжёлая). Kupperman: < 15 лёгкая, 15-35 средняя, > 35 тяжёлая. MRS: 0-4 без жалоб, 5-8 лёгкая, 9-15 умеренная, ≥ 16 тяжёлая.',
      actions: [
        'При умеренных/тяжёлых симптомах обсудить МГТ с учётом риска ВТЭ/онко',
        'При противопоказаниях к МГТ - СИОЗС (пароксетин), габапентин, клонидин',
        'Оценить вагинальную атрофию - локальные эстрогены',
      ],
      caveats: [
        'Шкалы не диагностируют менопаузу - оценивают тяжесть симптомов',
        'Kupperman устаревшая, не включает сексуальные/психосоциальные аспекты',
        'MRS валидирована международно (Heinemann 2004)',
      ],
      related: [
        { id: 'straw10', title: 'STRAW+10' },
        { id: 'frax-men', title: 'FRAX' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Эндокринология' },
        { id: '203.9', title: 'Гинекология' },
      ],
    };
  },
  reference:
    'Greene JG. Constructing a standard climacteric scale. Maturitas 1998;29:25-31. Kupperman HS. JAMA 1953. Heinemann LA et al. Menopause Rating Scale. Health Qual Life Outcomes 2004;2:45.',
  countries: 'Международный',
  presets: [
    { label: 'Лёгкие (Greene)', values: { scale: 'greene', psych: 1, somatic: 0.5, vasomotor: 1, sexual: 0, items: 5 } },
    { label: 'Средние (MRS)', values: { scale: 'mrs', psych: 2, somatic: 2, vasomotor: 3, sexual: 1, items: 8 } },
    { label: 'Тяжёлые (Kupperman)', values: { scale: 'kupperman', psych: 3, somatic: 3, vasomotor: 3, sexual: 2, items: 10 } },
  ],
  caveats: ['Выбор шкалы определяется клинической школой и доступностью валидированной версии'],
  related: [
    { id: 'straw10', title: 'STRAW+10' },
    { id: 'frax-men', title: 'FRAX' },
  ],
  relatedCourses: [
    { id: '301.4', title: 'Эндокринология' },
    { id: '203.9', title: 'Гинекология' },
  ],
  info: `### Шкалы климактерия
Оценивают выраженность симптомов менопаузы.

### Greene Climacteric Scale (1998)
21 пункт × 0-3 (всего 0-63). 4 домена: психологические, соматические, вазомоторные, сексуальные.

### Kupperman Menopause Index (1953)
11 симптомов с весовыми коэффициентами (приливы ×4, парестезии ×2 и т. д.). Сумма 0-51.

### Menopause Rating Scale (Heinemann 2004)
11 пунктов × 0-4. Пороги: лёгкая < 9, умеренная 9-15, тяжёлая ≥ 16.

### Источники
Greene Maturitas 1998. Kupperman JAMA 1953. Heinemann Health Qual Life Outcomes 2004.`,
};

export default runner;
