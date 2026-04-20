// @ts-nocheck
/** Runner: vertucci — Vertucci root canal classification */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Vertucci 1984)',
  reference: 'Vertucci FJ. Root canal anatomy of the human permanent teeth. Oral Surg Oral Med Oral Pathol. 1984;58(5):589-99.',
  inputs: [
    { id: 'tooth', label: 'Зуб (FDI)', type: 'select', options: [
      { value: 'maxillary-incisor', label: 'Верхний резец (11,12,21,22)' },
      { value: 'maxillary-canine', label: 'Верхний клык (13,23)' },
      { value: 'maxillary-premolar', label: 'Верхний премоляр (14,15,24,25)' },
      { value: 'maxillary-molar', label: 'Верхний моляр (16,17,26,27)' },
      { value: 'mandibular-incisor', label: 'Нижний резец (31,32,41,42)' },
      { value: 'mandibular-canine', label: 'Нижний клык (33,43)' },
      { value: 'mandibular-premolar', label: 'Нижний премоляр (34,35,44,45)' },
      { value: 'mandibular-molar', label: 'Нижний моляр (36,37,46,47)' },
    ]},
    { id: 'pattern', label: 'Паттерн канала', type: 'select', options: [
      { value: '1', label: 'Тип I — 1 канал: 1 (один канал на всём протяжении)' },
      { value: '2', label: 'Тип II — 2-1: два сливаются в один апикально' },
      { value: '3', label: 'Тип III — 1-2-1: один, разделяется, сливается' },
      { value: '4', label: 'Тип IV — 2: два независимых канала' },
      { value: '5', label: 'Тип V — 1-2: один разделяется на два апикально' },
      { value: '6', label: 'Тип VI — 2-1-2: два → один → два' },
      { value: '7', label: 'Тип VII — 1-2-1-2: четыре перехода' },
      { value: '8', label: 'Тип VIII — 3: три независимых канала' },
    ]},
  ],
  presets: [
    { label: 'Нижн. резец Type III', values: { tooth: 'mandibular-incisor', pattern: '3' } },
    { label: 'Нижн. премоляр Type V', values: { tooth: 'mandibular-premolar', pattern: '5' } },
    { label: 'Верх. моляр MB Type II', values: { tooth: 'maxillary-molar', pattern: '2' } },
  ],
  compute: (v) => {
    const pattern = String(v.pattern || '1');
    const n = Number(pattern);
    const descs: Record<string, string> = {
      '1': 'Type I (1): один канал на всём протяжении',
      '2': 'Type II (2-1): два канала сливаются в один',
      '3': 'Type III (1-2-1): один → два → один',
      '4': 'Type IV (2): два независимых канала',
      '5': 'Type V (1-2): один разделяется на два',
      '6': 'Type VI (2-1-2): два → один → два',
      '7': 'Type VII (1-2-1-2): сложный паттерн',
      '8': 'Type VIII (3): три независимых канала',
    };
    const complexity = n === 1 ? 'низкая' : n <= 3 ? 'умеренная' : n <= 5 ? 'повышенная' : 'высокая';
    const color = n === 1 ? '#22C55E' : n <= 3 ? '#84CC16' : n <= 5 ? '#F59E0B' : '#EF4444';
    return {
      value: `Type ${['I','II','III','IV','V','VI','VII','VIII'][n-1]}`,
      unit: 'Vertucci',
      color,
      interpretation: `${descs[pattern]} — сложность эндодонтии: ${complexity}`,
      details: `**Паттерн:** ${descs[pattern]}\n**Сложность обработки:** ${complexity}\n\nVertucci (1984) — 8 типов конфигурации системы корневых каналов. Классификация описывает путь от пульпарной камеры до апекса.\n\n**Дополнения:** Sert & Bayirli (2004) добавили типы IX-XXIII для редких анатомий.`,
      actions: [
        'CBCT для типов V-VIII и подозрения на сложную анатомию',
        'Операционный микроскоп / лупы ≥×3.5',
        'Type IV/V/VIII: больше файлов и ирригации (NaOCl 3-5.25%)',
        'Type VI-VII: высокий риск необнаружения канала → пропуск',
      ],
      caveats: [
        'Type II и V часто смешиваются рентгенологически — требуется CBCT',
        'MB2 в верхних молярах встречается в 60-95% (Kulild, Peters)',
        'C-shape (нижние 2-е моляры) — не входит в Vertucci, отдельная классификация Melton',
        'Расовые/популяционные различия частот паттернов',
      ],
      scale: {
        segments: [
          { min: 0.5, max: 1.5, label: 'I (simple)', color: '#22C55E' },
          { min: 1.5, max: 3.5, label: 'II-III', color: '#84CC16' },
          { min: 3.5, max: 5.5, label: 'IV-V', color: '#F59E0B' },
          { min: 5.5, max: 8.5, label: 'VI-VIII', color: '#EF4444' },
        ],
        value: n,
      },
      related: [
        { id: 'fdi-dent', title: 'FDI numbering' },
        { id: 'pai', title: 'PAI (periapical)' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**Vertucci classification** (1984) — стандарт описания анатомии системы корневых каналов. 8 типов от простого (I) к сложному (VIII).

### Типы
| Тип | Паттерн | Описание |
|---|---|---|
| I | 1 | Один канал на всём протяжении |
| II | 2-1 | Два сливаются в один апикально |
| III | 1-2-1 | Один → два → один |
| IV | 2 | Два независимых |
| V | 1-2 | Один разделяется на два |
| VI | 2-1-2 | Два → один → два |
| VII | 1-2-1-2 | Сложный |
| VIII | 3 | Три канала |

### Частые соответствия
- Нижний резец: Type I (70%), Type III (15%)
- Нижний премоляр: Type I (76%), V (11%), II (5%)
- MB корень верхнего 1-го моляра: MB1+MB2 → часто Type II или IV

### Источник
Vertucci FJ. Oral Surg Oral Med Oral Pathol 1984.`,
};
export default runner;
