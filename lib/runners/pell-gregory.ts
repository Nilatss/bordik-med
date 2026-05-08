/** Runner: pell-gregory — Pell & Gregory classification of impacted 3rd molars */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Pell GJ, Gregory GT, 1933/1942)',
  reference: 'Pell GJ, Gregory GT. Impacted mandibular third molars: classification and modified technique for removal. Dent Digest. 1933;39:330-8. Winter G. Principles of exodontia as applied to the impacted third molar. St. Louis: American Medical Book Co; 1926.',
  inputs: [
    { id: 'ramus', label: 'Отношение к ветви нижней челюсти (Pell-Gregory)', type: 'select', options: [
      { value: 'I', label: 'Class I — зуб полностью мезиальнее ветви (достаточно места)' },
      { value: 'II', label: 'Class II — коронка наполовину скрыта в ветви' },
      { value: 'III', label: 'Class III — зуб полностью в ветви (крайне сложен)' },
    ]},
    { id: 'depth', label: 'Глубина (позиция по отношению к окклюз. плоскости 2-го моляра)', type: 'select', options: [
      { value: 'A', label: 'Position A — окклюз. пов. ≥ уровня 2-го моляра' },
      { value: 'B', label: 'Position B — между окклюз. и цервик. 2-го моляра' },
      { value: 'C', label: 'Position C — ниже цервик. 2-го моляра (глубоко)' },
    ]},
    { id: 'winter', label: 'Угол по Winter (ориентация длинной оси)', type: 'select', options: [
      { value: 'mesio', label: 'Mesioangular (~45°, самый частый, легче удалить)' },
      { value: 'hori', label: 'Horizontal (90°, сложный)' },
      { value: 'verti', label: 'Vertical (норма, средняя сложность)' },
      { value: 'disto', label: 'Distoangular (обратный наклон, самый трудный)' },
      { value: 'bucco', label: 'Buccoangular / Linguoangular' },
      { value: 'inv', label: 'Inverted (редкий)' },
    ]},
  ],
  presets: [
    { label: 'IA Mesio (лёгкий)', values: { ramus: 'I', depth: 'A', winter: 'mesio' } },
    { label: 'IIB Horizontal (средний)', values: { ramus: 'II', depth: 'B', winter: 'hori' } },
    { label: 'IIIC Distoangular (сложный)', values: { ramus: 'III', depth: 'C', winter: 'disto' } },
  ],
  compute: (v) => {
    const r = String(v.ramus || 'I');
    const d = String(v.depth || 'A');
    const w = String(v.winter || 'mesio');
    const rScore: Record<string, number> = { I: 1, II: 2, III: 3 };
    const dScore: Record<string, number> = { A: 1, B: 2, C: 3 };
    const wScore: Record<string, number> = { mesio: 1, verti: 2, hori: 3, bucco: 2, disto: 4, inv: 4 };
    const score = (rScore[r] ?? 0) + (dScore[d] ?? 0) + (wScore[w] ?? 0);
    let label = 'Лёгкое удаление', color = '#22C55E';
    if (score >= 8) { label = 'Крайне сложное (OMFS, возм. остеотомия)'; color = '#B91C1C'; }
    else if (score >= 6) { label = 'Сложное'; color = '#EF4444'; }
    else if (score >= 4) { label = 'Средней сложности'; color = '#F59E0B'; }
    const winterLabel: Record<string,string> = { mesio:'Mesioangular', hori:'Horizontal', verti:'Vertical', disto:'Distoangular', bucco:'Bucco/Linguo', inv:'Inverted' };
    return {
      value: `${r}${d}`,
      unit: 'Pell-Gregory',
      color,
      interpretation: `Pell-Gregory ${r}${d} + Winter ${winterLabel[w]} — ${label}`,
      details: `Pell-Gregory: Class ${r} (ветвь) + Position ${d} (глубина)\nWinter angle: ${winterLabel[w]}\nСложность: ${label} (sum score ${score}/10)\n\n- Class I — места в ретромолярной ямке достаточно; II — половина ширины коронки покрыта ветвью; III — полностью в ветви\n- Position A — на уровне 2-го моляра; B — между; C — ниже шейки 2М (глубоко)`,
      actions: [
        'IA Mesioangular: удаление в кресле под местной анестезией',
        'IIB/IIIB: возможна остеотомия, coronectomy при близости к IAN',
        'IIIC + distoangular: направление к OMFS, общ. анестезия',
        'До удаления: OPG ± CBCT для IAN/сosudов (Rood criteria)',
        'Предупредить о lingual nerve injury (2-3%), IAN paresthesia (0.5-5%)',
      ],
      caveats: [
        'Pell-Gregory описывает только нижние третьи моляры',
        'Winter — отдельная система (угол длинной оси); обычно комбинируется с PG',
        'CBCT обязателен при близости корня к нижнечелюстному каналу (Rood signs)',
        'Coronectomy — альтернатива при высоком риске повреждения IAN',
      ],
      scale: {
        segments: [
          { min: 3, max: 4, label: 'Лёгкое', color: '#22C55E' },
          { min: 4, max: 6, label: 'Средн', color: '#F59E0B' },
          { min: 6, max: 8, label: 'Сложное', color: '#EF4444' },
          { min: 8, max: 11, label: 'Крайне сл', color: '#B91C1C' },
        ],
        value: score,
      },
      related: [
        { id: 'fdi-dent', title: 'FDI numbering' },
        { id: 'icd10-da', title: 'ICD-10-DA K01.1' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**Pell & Gregory classification** (1933) — оценка хирургической сложности удаления ретенированных/импактированных 3-х моляров нижней челюсти. Обычно комбинируется с **Winter classification** (угловая ориентация).

### Pell-Gregory: отношение к ветви
| Class | Описание |
|---|---|
| **I** | Зуб мезиальнее переднего края ветви (места достаточно) |
| **II** | Коронка наполовину в ветви |
| **III** | Зуб полностью в ветви |

### Pell-Gregory: глубина
| Position | Описание |
|---|---|
| **A** | Окклюзивная поверхность на уровне 2-го моляра |
| **B** | Между окклюзивной и шейкой 2М |
| **C** | Ниже шейки 2М (глубоко) |

### Winter: угол оси
| Угол | Частота (нижние 3М) |
|---|---|
| Mesioangular | ~45% (легче всего) |
| Horizontal | ~10% |
| Vertical | ~38% |
| Distoangular | ~6% (труднее всего) |

### Сложность
- **IA + Mesio/Vertical** — часто амбулаторно с местной анестезией
- **IIIC + Distoangular** — OMFS, возможна общая анестезия, CBCT

### Риски
- IAN paresthesia 0.5-5% (транзиентная обычно)
- Lingual nerve injury 2-3%
- Перелом нижней челюсти <0.1%

### Источник
Pell GJ, Gregory GT. Dent Digest 1933;39:330. Winter G. 1926.`,
};
export default runner;
