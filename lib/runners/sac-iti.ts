/** Runner: sac-iti - ITI SAC (Straightforward/Advanced/Complex) implant difficulty */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'esthetic', label: 'Эстетическая зона', type: 'checkbox' },
    { id: 'bone', label: 'Качество кости', type: 'select', options: [
      { value: 'good', label: 'D2-D3 - хорошая' },
      { value: 'medium', label: 'D3-D4 - средняя' },
      { value: 'poor', label: 'D4 / требуется аугментация' },
    ] },
    { id: 'systemic', label: 'Системные факторы риска', type: 'select', options: [
      { value: 'none', label: 'Нет' },
      { value: 'mild', label: 'Лёгкие (курение, диабет контрол.)' },
      { value: 'major', label: 'Выраженные (бисфосфонаты, лучевая терапия, неконтрол. диабет)' },
    ] },
    { id: 'anatomy', label: 'Сложная анатомия (близко к нерву/синусу)', type: 'checkbox' },
  ],
  compute: (v) => {
    const est = !!v.esthetic;
    const bone = String(v.bone);
    const sys = String(v.systemic);
    const anat = !!v.anatomy;

    let complexity = 'S';
    if (sys === 'major' || anat || bone === 'poor') complexity = 'C';
    else if (est || bone === 'medium' || sys === 'mild') complexity = 'A';

    const map = {
      S: { band: 'Straightforward', color: '#22C55E', details: 'Стандартная операция, может выполнять подготовленный врач-имплантолог.' },
      A: { band: 'Advanced', color: '#F59E0B', details: 'Требует опытного имплантолога. Могут потребоваться дополнительные процедуры (аугментация, мягкотканная пластика).' },
      C: { band: 'Complex', color: '#EF4444', details: 'Требует высоко опытного специалиста (хирург-имплантолог, пародонтолог, ортодонт). Мультидисциплинарный подход.' },
    }[complexity];

    return {
      value: complexity, unit: 'SAC',
      interpretation: map?.band ?? '', color: map?.color ?? '#6B7280',
      details: map?.details ?? '',
      actions: [
        complexity === 'S' ? 'Стандартное планирование имплантации' : 'КТ планирование + хирургический шаблон',
        complexity !== 'S' ? 'Консультация смежных специалистов' : 'Наблюдение 3/6/12 мес',
        complexity === 'C' ? 'Подробная информированное согласие о рисках' : 'Стандартное согласие',
      ],
      caveats: [
        'SAC - инструмент классификации, не заменяет клиническое суждение',
        'Эстетическая зона = от премоляра до премоляра',
        'Курение > 10 сиг/сут - значимый риск, рассмотреть отказ за 3 мес',
        'Бисфосфонаты - риск ONJ, консилиум онколога',
      ],
      scale: {
        segments: [
          { min: 1, max: 1, label: 'S', color: '#22C55E' },
          { min: 2, max: 2, label: 'A', color: '#F59E0B' },
          { min: 3, max: 3, label: 'C', color: '#EF4444' },
        ],
        current: complexity === 'S' ? 1 : complexity === 'A' ? 2 : 3,
        unit: 'SAC',
      },
      related: [{ id: 'abo-ce', title: 'ABO-CE' }, { id: 'asa-dental', title: 'ASA dental' }],
      relatedCourses: [{ id: '313.3', title: 'Имплантология' }],
    };
  },
  reference: 'Dawson A, Chen S. The SAC Classification in Implant Dentistry. Quintessence 2009.',
  countries: 'Международный (ITI)',
  presets: [
    { label: 'Straightforward (жев. зона)', values: { esthetic: false, bone: 'good', systemic: 'none', anatomy: false } },
    { label: 'Advanced', values: { esthetic: true, bone: 'medium', systemic: 'mild', anatomy: false } },
    { label: 'Complex', values: { esthetic: true, bone: 'poor', systemic: 'major', anatomy: true } },
  ],
  info: `### Для чего используется
SAC (Straightforward/Advanced/Complex) - классификация сложности имплантологического случая от International Team for Implantology (ITI). Помогает оценить требуемый уровень подготовки специалиста.

### Уровни
- **Straightforward** - стандартный случай, подготовленный имплантолог
- **Advanced** - опытный специалист, могут требоваться дополнительные процедуры
- **Complex** - высоко опытный, мультидисциплинарный подход

### Факторы сложности
1. Эстетическая зона (верхняя челюсть фронт)
2. Качество кости (D1-D4)
3. Системные факторы (ASA, курение, диабет, бисфосфонаты)
4. Анатомические особенности (близость к нерву, синусу)`,
};

export default runner;
