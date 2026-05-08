/** Runner: ao-cmf — AO CMF (Craniomaxillofacial) fracture classification */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AO Foundation · AO CMF)',
  reference: 'Cornelius CP, Audige L, Kunz C, et al. The AO CMF classification system for fractures of the craniomaxillofacial skeleton. Craniomaxillofac Trauma Reconstr. 2014;7(Suppl 1):S006-S040.',
  inputs: [
    { id: 'region', label: 'Регион', type: 'select', options: [
      { value: 'mandible', label: 'Нижняя челюсть (Mandible, code 91)' },
      { value: 'midface', label: 'Среднее лицо (Midface, code 92)' },
      { value: 'skull-base', label: 'Основание черепа (Skull base, code 93)' },
      { value: 'cranial-vault', label: 'Свод черепа (Cranial vault, code 94)' },
    ]},
    { id: 'level', label: 'AO CMF уровень детализации', type: 'select', options: [
      { value: '1', label: 'Level 1 — локализация (region/subregion)' },
      { value: '2', label: 'Level 2 — топография (specific site)' },
      { value: '3', label: 'Level 3 — морфология (fragmentation/displacement)' },
    ]},
    { id: 'displacement', label: 'Смещение', type: 'select', options: [
      { value: 'none', label: 'Нет (undisplaced)' },
      { value: 'mild', label: 'Умеренное (<2 мм)' },
      { value: 'severe', label: 'Выраженное (≥2 мм / comminuted)' },
    ]},
  ],
  presets: [
    { label: 'Mandible body L2', values: { region: 'mandible', level: '2', displacement: 'mild' } },
    { label: 'Midface Le Fort II L3', values: { region: 'midface', level: '3', displacement: 'severe' } },
    { label: 'Skull base L1', values: { region: 'skull-base', level: '1', displacement: 'none' } },
  ],
  compute: (v) => {
    const region = String(v.region || 'mandible');
    const level = String(v.level || '1');
    const displacement = String(v.displacement || 'none');
    const codes: Record<string, string> = {
      'mandible': '91', 'midface': '92', 'skull-base': '93', 'cranial-vault': '94',
    };
    const names: Record<string, string> = {
      'mandible': 'Нижняя челюсть',
      'midface': 'Среднее лицо',
      'skull-base': 'Основание черепа',
      'cranial-vault': 'Свод черепа',
    };
    const code = codes[region];
    const severityColor = displacement === 'severe' ? '#EF4444' : displacement === 'mild' ? '#F59E0B' : '#22C55E';
    const surgical = displacement === 'severe' ? 'ORIF (открытая репозиция + остеосинтез)'
      : displacement === 'mild' ? 'Closed reduction ± MMF 4-6 нед'
      : 'Консервативно (мягкая диета 2-4 нед)';
    return {
      value: `AO ${code}.L${level}`,
      unit: 'AO CMF',
      color: severityColor,
      interpretation: `AO CMF ${code} (${names[region]}), Level ${level} — ${surgical}`,
      details: `Регион: ${names[region]} (code ${code})\nУровень: ${level}\nСмещение: ${displacement}\nТактика: ${surgical}\n\nAO CMF — иерархическая система с 3 уровнями детализации: L1 локализация → L2 топография → L3 морфология фрагментации.`,
      actions: [
        'CT с 3D реконструкцией — стандарт для middle face/skull base',
        'L3 severe: ORIF титановыми миниплатинами (1.5-2.0 мм)',
        'Mandible: контроль окклюзии (MMF или IMF screws)',
        'Skull base: нейрохирургия, ликворея → воздержание от сморкания',
      ],
      caveats: [
        'AO CMF не заменяет Le Fort / Markowitz — дополняет',
        'Skull base fractures часто сопровождаются повреждением ЧМН',
        'Mandibular condyle — отдельная подклассификация (Loukota)',
      ],
      related: [
        { id: 'lefort', title: 'Le Fort classification' },
        { id: 'ao-spine', title: 'AO Spine' },
        { id: 'ao-ota', title: 'AO/OTA long bones' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
        { id: '310.1', title: 'Челюстно-лицевая хирургия' },
      ],
    };
  },
  info: `### Для чего используется
**AO CMF (Craniomaxillofacial)** — классификация переломов лицевого/мозгового черепа AO Foundation (2014). Иерархическая: 3 уровня детализации.

### Регионы
| Код | Регион |
|---|---|
| 91 | Mandible |
| 92 | Midface |
| 93 | Skull base |
| 94 | Cranial vault |

### Уровни
- L1 — локализация (регион/подрегион)
- L2 — топография (точное место)
- L3 — морфология (фрагментация, смещение)

### Тактика
- Undisplaced: консервативно
- Mild displacement: closed reduction ± MMF
- Severe/comminuted: ORIF

### Источник
Cornelius CP, Audige L, et al. Craniomaxillofac Trauma Reconstr 2014.`,
};
export default runner;
