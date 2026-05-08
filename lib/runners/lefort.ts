/** Runner: lefort — Le Fort classification of maxillary fractures */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Le Fort 1901)',
  reference: 'Le Fort R. Etude experimentale sur les fractures de la machoire superieure. Rev Chir Paris. 1901;23:208-27, 360-79, 479-507.',
  inputs: [
    { id: 'level', label: 'Уровень перелома', type: 'select', options: [
      { value: '1', label: 'Le Fort I — горизонтальный (над верхушками зубов)' },
      { value: '2', label: 'Le Fort II — пирамидальный (через нос и орбиту)' },
      { value: '3', label: 'Le Fort III — краниофасциальное разобщение' },
      { value: 'mixed', label: 'Смешанный (I+II или II+III)' },
    ]},
    { id: 'side', label: 'Сторона', type: 'select', options: [
      { value: 'bilateral', label: 'Двусторонний' },
      { value: 'unilateral-r', label: 'Односторонний правый' },
      { value: 'unilateral-l', label: 'Односторонний левый' },
    ]},
    { id: 'displacement', label: 'Смещение', type: 'select', options: [
      { value: 'none', label: 'Нет' },
      { value: 'mild', label: 'Умеренное' },
      { value: 'severe', label: 'Выраженное (craniofacial disjunction)' },
    ]},
  ],
  presets: [
    { label: 'Le Fort I двусторон.', values: { level: '1', side: 'bilateral', displacement: 'mild' } },
    { label: 'Le Fort II со смещен.', values: { level: '2', side: 'bilateral', displacement: 'severe' } },
    { label: 'Le Fort III', values: { level: '3', side: 'bilateral', displacement: 'severe' } },
  ],
  compute: (v) => {
    const level = String(v.level || '1');
    const displacement = String(v.displacement || 'mild');
    const names: Record<string, string> = {
      '1': 'Le Fort I (горизонтальный, Guerin)',
      '2': 'Le Fort II (пирамидальный)',
      '3': 'Le Fort III (craniofacial disjunction)',
      'mixed': 'Смешанный Le Fort',
    };
    const approaches: Record<string, string> = {
      '1': 'Vestibular approach + 4 miniplates (piriform + zygomaticomaxillary buttresses)',
      '2': 'Coronal + vestibular + subciliary; plates infraorbital rim + ZM buttress + nasofrontal',
      '3': 'Coronal approach, осматическая фиксация nasofrontal + zygomaticofrontal + ZM buttress',
      'mixed': 'Комбинированный подход, ORIF всех уровней',
    };
    const severityMap: Record<string, number> = { '1': 1, '2': 2, '3': 3, 'mixed': 4 };
    const severity = severityMap[level]!;
    const color = severity === 1 ? '#F59E0B' : severity === 2 ? '#EF4444' : '#B91C1C';
    return {
      value: names[level]!,
      unit: 'Le Fort',
      color,
      interpretation: `${names[level]!} — ${displacement === 'severe' ? 'ORIF показан' : 'оценить ORIF vs closed reduction'}`,
      details: `Уровень: ${names[level]!}\nХирургический доступ: ${approaches[level]!}\n\nLe Fort I — горизонт через верхнечелюстную пазуху, отделяет альвеолярный отросток.\nLe Fort II — пирамидальный, через нос, медиальную стенку орбиты, Zm-sutures.\nLe Fort III — полное разобщение лица от черепа через nasofrontal + zygomaticofrontal.`,
      actions: [
        'CT с 3D reconstruction (тонкие срезы 1 мм)',
        'Проверка прикуса до и после ORIF (MMF intraop)',
        'Le Fort II/III: оценить CSF rhinorrhea (β2-трансферрин)',
        'Антибиотикопрофилактика 7 дней (синус вовлечён)',
        'Мягкая диета 4-6 нед после ORIF',
      ],
      caveats: [
        'Реальные переломы часто не соответствуют "чистым" Le Fort — используется описательная часть',
        'Le Fort III часто сочетается с ЧМТ и ликвореей',
        'Blowout орбиты — отдельная классификация (не Le Fort)',
        'NOE (naso-orbito-ethmoid) — отдельная категория (Markowitz)',
      ],
      scale: {
        segments: [
          { min: 0, max: 1.5, label: 'LF I', color: '#F59E0B' },
          { min: 1.5, max: 2.5, label: 'LF II', color: '#EF4444' },
          { min: 2.5, max: 3.5, label: 'LF III', color: '#B91C1C' },
          { min: 3.5, max: 4.5, label: 'Mixed', color: '#7F1D1D' },
        ],
        value: severity,
      },
      related: [
        { id: 'ao-cmf', title: 'AO CMF' },
        { id: 'gcs', title: 'GCS (ЧМТ)' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
        { id: '310.1', title: 'Челюстно-лицевая хирургия' },
      ],
    };
  },
  info: `### Для чего используется
**Le Fort classification** (Rene Le Fort, 1901) — классика переломов верхней челюсти на 3 уровня, основанная на экспериментах на трупах.

### Уровни
| Тип | Линия перелома |
|---|---|
| **I (Guerin)** | Горизонт над верхушками зубов, через pterygoid plates |
| **II (пирамидальный)** | Через носовые кости, медиальную стенку орбиты, ZM suture |
| **III (disjunction)** | Nasofrontal + zygomaticofrontal + pterygoid — полное разобщение |

### Клинические признаки
- LF I: подвижность альвеолярного отростка без движения носа
- LF II: подвижность средней трети лица (mobile maxilla + nose, стабильные скулы)
- LF III: подвижность всего лицевого скелета относительно черепа

### Хирургия
- ORIF титановыми миниплатинами (1.5-2.0 мм)
- LF I: 4 plates (piriform + ZM buttresses)
- LF II/III: coronal approach, fixation buttresses

### Источник
Le Fort R. Rev Chir Paris 1901.`,
};
export default runner;
