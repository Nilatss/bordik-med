// @ts-nocheck
/** Runner: sun - SUN (Standardization of Uveitis Nomenclature) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'anatomic', label: 'Анатомическая локализация', type: 'select', options: [
      { value: 'anterior', label: 'Anterior (передний увеит / иридоциклит)' },
      { value: 'intermediate', label: 'Intermediate (промежуточный / pars planitis)' },
      { value: 'posterior', label: 'Posterior (задний / хориоидит, ретинит)' },
      { value: 'pan', label: 'Panuveitis (всех отделов)' },
    ] },
    { id: 'onset', label: 'Начало', type: 'select', options: [
      { value: 'sudden', label: 'Внезапное (sudden)' },
      { value: 'insidious', label: 'Постепенное (insidious)' },
    ] },
    { id: 'duration', label: 'Длительность', type: 'select', options: [
      { value: 'limited', label: 'Limited (≤ 3 мес)' },
      { value: 'persistent', label: 'Persistent (> 3 мес)' },
    ] },
    { id: 'course', label: 'Течение', type: 'select', options: [
      { value: 'acute', label: 'Acute (внезапное + ограниченное)' },
      { value: 'recurrent', label: 'Recurrent (повторные эпизоды > 3 мес)' },
      { value: 'chronic', label: 'Chronic (< 3 мес ремиссии после отмены)' },
    ] },
    { id: 'cells', label: 'Клетки в передней камере (SUN grade)', type: 'select', options: [
      { value: '0', label: '0 (< 1 клетки / поле 1×1 мм)' },
      { value: '0.5', label: '0.5+ (1-5)' },
      { value: '1', label: '1+ (6-15)' },
      { value: '2', label: '2+ (16-25)' },
      { value: '3', label: '3+ (26-50)' },
      { value: '4', label: '4+ (> 50)' },
    ] },
  ],
  compute: (v) => {
    const anat = String(v.anatomic || 'anterior');
    const onset = String(v.onset || 'sudden');
    const dur = String(v.duration || 'limited');
    const course = String(v.course || 'acute');
    const cells = Number(v.cells || 0);

    const anatLabels: Record<string, string> = {
      anterior: 'Anterior uveitis', intermediate: 'Intermediate uveitis',
      posterior: 'Posterior uveitis', pan: 'Panuveitis',
    };

    let color = '#22C55E', band = 'Лёгкая активность';
    if (cells >= 3) { color = '#EF4444'; band = 'Тяжёлая активность'; }
    else if (cells >= 2) { color = '#F59E0B'; band = 'Умеренная активность'; }
    else if (cells >= 1) { color = '#84CC16'; band = 'Минимальная активность'; }
    else { color = '#22C55E'; band = 'Неактивно'; }

    // Causes to screen
    const causesByAnat: Record<string, string[]> = {
      anterior: ['HLA-B27 (AS, псориатический артрит, РеА, ВЗК)', 'Фукс-гетерохромия', 'HSV / VZV', 'Сифилис, TB', 'JIA (у детей)'],
      intermediate: ['Саркоидоз', 'MS', 'Lyme', 'TB', 'HTLV-1'],
      posterior: ['Токсоплазмоз', 'CMV / HSV / VZV ретинит', 'Сифилис', 'TB', 'Саркоидоз', 'Behçet'],
      pan: ['Behçet', 'VKH', 'Саркоидоз', 'Симпатическая офтальмия', 'Сифилис, TB'],
    };

    return {
      value: `${anatLabels[anat]}, ${course}, ${cells}+ cells`,
      unit: '',
      interpretation: `${band} (SUN ${cells}+)`,
      color,
      details: `Начало: ${onset === 'sudden' ? 'внезапное' : 'постепенное'}. Длительность: ${dur === 'limited' ? '≤ 3 мес' : '> 3 мес'}.`,
      actions: [
        'Минимальный workup: CBC, СОЭ, CRP, сифилис (RPR + TPHA), QuantiFERON / PPD, рентген грудной клетки',
        anat === 'intermediate' || anat === 'pan' ? 'MRI головного мозга (MS, саркоидоз)' : '',
        anat === 'posterior' || anat === 'pan' ? 'Токсо IgG, TORCH-панель, OCT / FAG / ICG' : '',
        cells >= 2 ? 'Топические ГКС (преднизолон ацетат 1% каждые 1-2 ч), мидриатики (циклопентолат / атропин)' : '',
        cells >= 3 && (anat !== 'anterior') ? 'Системные ГКС 1 мг/кг или стероид-сберегающие (метотрексат, MMF, TNFi)' : '',
        'HLA-B27 тест при рецидивирующем переднем увеите',
        `Этиология: ${causesByAnat[anat].join('; ')}`,
      ].filter(Boolean),
      caveats: [
        'SUN (2005) — стандартизированная терминология, не диагноз',
        'Grading в 1×1 мм слит-луч, яркий свет, максимальное увеличение',
        'Не считать маленькие фагоциты / пигмент за клетки',
        'Chronic uveitis требует ступенчатого отказа от ГКС с иммуносупрессантами',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0 / 0.5+', color: '#22C55E' },
          { min: 1, max: 2, label: '1+ / 2+', color: '#F59E0B' },
          { min: 2, max: 4, label: '3+ / 4+', color: '#EF4444' },
        ],
        current: cells,
        unit: 'AC cells',
      },
      related: [{ id: 'iop', title: 'IOP' }, { id: 'seidel', title: 'Seidel' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Jabs DA, Nussenblatt RB, Rosenbaum JT. Standardization of Uveitis Nomenclature (SUN) Working Group. Am J Ophthalmol 2005;140:509-516.',
  countries: 'Международный (SUN / IUSG)',
  presets: [
    { label: 'HLA-B27 передний', values: { anatomic: 'anterior', onset: 'sudden', duration: 'limited', course: 'acute', cells: '2' } },
    { label: 'Pars planitis', values: { anatomic: 'intermediate', onset: 'insidious', duration: 'persistent', course: 'chronic', cells: '1' } },
    { label: 'Behçet panuveitis', values: { anatomic: 'pan', onset: 'sudden', duration: 'persistent', course: 'recurrent', cells: '3' } },
  ],
  info: `### Для чего используется
**SUN (2005)** — международная стандартизированная номенклатура увеитов: анатомия + начало + длительность + течение + активность.

### Анатомическая локализация
| Тип | Первичный очаг |
|---|---|
| Anterior | Радужка, цилиарное тело |
| Intermediate | Витреум, pars plana |
| Posterior | Сетчатка, хориоидея |
| Panuveitis | Все отделы |

### Активность (AC cells)
В луче 1×1 мм макс. увеличение:
| SUN | Клетки |
|---|---|
| 0 | < 1 |
| 0.5+ | 1-5 |
| 1+ | 6-15 |
| 2+ | 16-25 |
| 3+ | 26-50 |
| 4+ | > 50 |

### Flare (protein)
| Grade | Признак |
|---|---|
| 0 | Нет |
| 1+ | Минимальный |
| 2+ | Умеренный, детали радужки различимы |
| 3+ | Детали радужки нечёткие |
| 4+ | Фибринозный экссудат / plasmoid |

### Минимальный workup
CBC, СОЭ, CRP, сифилис (RPR + TPHA), QuantiFERON, CXR ± ACE (саркоидоз).

### Источник
Jabs DA et al. SUN Working Group. Am J Ophthalmol 2005.`,
};

export default runner;
