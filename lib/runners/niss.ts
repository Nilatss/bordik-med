// @ts-nocheck
/** Runner: niss - New Injury Severity Score (Osler 1997) */
import type { CalculatorTool } from '../tools-runners';

const AIS_OPTIONS = [
  { value: '0', label: '0 - нет' },
  { value: '1', label: '1 - минорное' },
  { value: '2', label: '2 - умеренное' },
  { value: '3', label: '3 - серьёзное' },
  { value: '4', label: '4 - тяжёлое' },
  { value: '5', label: '5 - критическое' },
  { value: '6', label: '6 - максимум' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'i1', label: 'AIS травмы #1 (любая область)', type: 'select', options: AIS_OPTIONS },
    { id: 'i2', label: 'AIS травмы #2', type: 'select', options: AIS_OPTIONS },
    { id: 'i3', label: 'AIS травмы #3', type: 'select', options: AIS_OPTIONS },
    { id: 'i4', label: 'AIS травмы #4', type: 'select', options: AIS_OPTIONS },
    { id: 'i5', label: 'AIS травмы #5', type: 'select', options: AIS_OPTIONS },
    { id: 'i6', label: 'AIS травмы #6', type: 'select', options: AIS_OPTIONS },
  ],
  compute: (v) => {
    const vals = [v.i1, v.i2, v.i3, v.i4, v.i5, v.i6].map((x) => Number(x) || 0);
    const hasSix = vals.some((x) => x === 6);
    let niss = 0;
    if (hasSix) niss = 75;
    else {
      const top3 = [...vals].sort((a, b) => b - a).slice(0, 3);
      niss = top3.reduce((s, x) => s + x * x, 0);
    }
    let interpretation = ''; let color = '#22C55E'; let details = '';
    if (niss < 9) { interpretation = 'Лёгкая травма'; color = '#22C55E'; details = 'NISS < 9 - летальность < 1%.'; }
    else if (niss < 15) { interpretation = 'Умеренная'; color = '#FACC15'; details = 'NISS 9-14.'; }
    else if (niss < 25) { interpretation = 'Тяжёлая (major trauma)'; color = '#EF4444'; details = 'NISS ≥ 15 - major trauma. NISS доказанно точнее ISS в прогнозе смертности при множественных травмах одного региона (Balogh 2003).'; }
    else { interpretation = 'Критическая'; color = '#991B1B'; details = 'NISS ≥ 25 - высокая летальность, ОРИТ, damage control.'; }
    return {
      value: String(niss),
      unit: 'баллов',
      interpretation,
      color,
      details,
      actions: niss >= 15
        ? ['Trauma team, damage control, МТP по показаниям', 'CT head-to-pelvis, повторные ФАСТ']
        : ['Госпитализация при NISS ≥ 9; амбулаторно при NISS < 9'],
      caveats: [
        'NISS берёт 3 худших AIS независимо от региона (в отличие от ISS)',
        'NISS ≥ ISS всегда',
        'Летальность при множественных травмах одного региона (напр. 3 внутричерепных) NISS прогнозирует точнее',
      ],
      scale: {
        segments: [
          { min: 0, max: 9, label: 'Minor', color: '#22C55E' },
          { min: 9, max: 15, label: 'Moderate', color: '#FACC15' },
          { min: 15, max: 25, label: 'Severe', color: '#EF4444' },
          { min: 25, max: 75, label: 'Profound', color: '#991B1B' },
        ],
        current: niss,
        unit: 'NISS',
      },
      related: [
        { id: 'iss', title: 'ISS (Baker)' },
        { id: 'triss', title: 'TRISS' },
        { id: 'rts', title: 'RTS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Реаниматология' },
      ],
    };
  },
  reference: 'Osler T, Baker SP, Long W. A modification of the injury severity score that both improves accuracy and simplifies scoring. J Trauma 1997;43:922-925. Balogh Z et al. NISS predicts postinjury multiple organ failure better than ISS. J Trauma 2003;55:624.',
  countries: 'Международный',
  presets: [
    { label: 'Изолированная ЧМТ (разрыв + контузии)', values: { i1: '5', i2: '4', i3: '3', i4: '0', i5: '0', i6: '0' } },
    { label: 'Политравма ДТП', values: { i1: '4', i2: '3', i3: '3', i4: '2', i5: '2', i6: '1' } },
    { label: 'Unsurvivable', values: { i1: '6', i2: '0', i3: '0', i4: '0', i5: '0', i6: '0' } },
  ],
  info: `### Для чего используется
**NISS (New Injury Severity Score, Osler 1997)** - модификация ISS, которая берёт три наихудших AIS **независимо от анатомического региона**. Лучше предсказывает смертность и органную дисфункцию при множественных травмах одной области (ЧМТ, торакальная политравма).

### Формула
\`NISS = A² + B² + C²\` - где A, B, C = три наибольших AIS из всех повреждений.

Если любой AIS = 6 → **NISS = 75**.

### Сравнение NISS vs ISS
| Ситуация | ISS | NISS |
|---|---|---|
| 3 травмы в разных регионах (AIS 4, 4, 3) | 41 | 41 |
| 3 травмы в одном регионе (AIS 4, 4, 3 - голова) | 16 (учтёт только 4²) | 41 |

### Связанные шкалы
- **ICISS** (Osler, Rutledge, 1996) - на основе выживаемости по ICD-9/10
- **TMPM-ICD** - regression-based модель (Glance 2009)
- **TRISS** - сочетает анатомию + физиологию + демографию

### Источники
- Osler T, Baker SP, Long W. *J Trauma* 1997;43:922
- Balogh Z et al. *J Trauma* 2003;55:624 - NISS лучше ISS для MOF
- Lavoie A et al. *J Trauma* 2004;56:1312
`,
};

export default runner;
