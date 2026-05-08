/** Runner: iss - Injury Severity Score (Baker 1974) */
import type { CalculatorTool } from '../tools-runners';

const AIS_OPTIONS = [
  { value: '0', label: '0 - нет повреждения' },
  { value: '1', label: '1 - минорное' },
  { value: '2', label: '2 - умеренное' },
  { value: '3', label: '3 - серьёзное, неугрожающее' },
  { value: '4', label: '4 - тяжёлое, угрожающее жизни' },
  { value: '5', label: '5 - критическое, выживание сомнительно' },
  { value: '6', label: '6 - максимальное (unsurvivable)' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'head', label: 'Голова / шея - AIS', type: 'select', options: AIS_OPTIONS },
    { id: 'face', label: 'Лицо - AIS', type: 'select', options: AIS_OPTIONS },
    { id: 'chest', label: 'Грудь - AIS', type: 'select', options: AIS_OPTIONS },
    { id: 'abd', label: 'Живот / таз - AIS', type: 'select', options: AIS_OPTIONS },
    { id: 'ext', label: 'Конечности / таз (костн.) - AIS', type: 'select', options: AIS_OPTIONS },
    { id: 'ext2', label: 'Внешнее (кожа, ожоги) - AIS', type: 'select', options: AIS_OPTIONS },
  ],
  compute: (v) => {
    const vals = [v.head, v.face, v.chest, v.abd, v.ext, v.ext2].map((x) => Number(x) || 0);
    const hasSix = vals.some((x) => x === 6);
    let iss = 0;
    if (hasSix) iss = 75;
    else {
      const top3 = [...vals].sort((a, b) => b - a).slice(0, 3);
      iss = top3.reduce((s, x) => s + x * x, 0);
    }
    let interpretation = ''; let color = '#22C55E'; let details = '';
    if (iss < 9) { interpretation = 'Лёгкая травма (Minor)'; color = '#22C55E'; details = 'ISS < 9 - летальность < 1%, обычно не требует уровня trauma center.'; }
    else if (iss < 15) { interpretation = 'Умеренная травма (Moderate)'; color = '#FACC15'; details = 'ISS 9-14 - госпитализация, мониторинг, летальность 1-5%.'; }
    else if (iss < 25) { interpretation = 'Тяжёлая травма (Severe)'; color = '#EF4444'; details = 'ISS 15-24 - «major trauma» по европейскому определению (порог ≥ 16). Trauma team activation, ОРИТ.'; }
    else { interpretation = 'Критическая травма (Profound)'; color = '#991B1B'; details = 'ISS ≥ 25 - летальность 25-75% в зависимости от возраста и физиологии. Максимум ISS 75 (любой AIS 6 или три AIS 5).'; }
    return {
      value: String(iss),
      unit: 'баллов',
      interpretation,
      color,
      details,
      actions: iss >= 15
        ? ['Trauma team activation, damage control', 'ОРИТ, trauma CT head-to-pelvis', 'TXA 1 г при кровопотере, 1:1:1 MTP при шоке']
        : iss >= 9 ? ['Госпитализация, мониторинг', 'Повторная FAST, повторная CT при ухудшении']
        : ['Амбулаторное наблюдение / короткая госпитализация'],
      caveats: [
        'Любой AIS 6 автоматически даёт ISS 75',
        'ISS учитывает ТОЛЬКО по одной (худшей) травме в каждой области - недооценивает множественные травмы одного региона',
        'Для этой проблемы - см. NISS (Osler 1997)',
        'Major trauma threshold: ISS ≥ 16 (European Trauma Course)',
      ],
      scale: {
        segments: [
          { min: 0, max: 9, label: 'Minor', color: '#22C55E' },
          { min: 9, max: 15, label: 'Moderate', color: '#FACC15' },
          { min: 15, max: 25, label: 'Severe', color: '#EF4444' },
          { min: 25, max: 75, label: 'Profound', color: '#991B1B' },
        ],
        current: iss,
        unit: 'ISS',
      },
      related: [
        { id: 'niss', title: 'NISS (Osler)' },
        { id: 'triss', title: 'TRISS (prob. survival)' },
        { id: 'rts', title: 'RTS' },
        { id: 'kts', title: 'Kampala TS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Реаниматология' },
      ],
    };
  },
  reference: 'Baker SP, O’Neill B, Haddon W, Long WB. The Injury Severity Score: a method for describing patients with multiple injuries and evaluating emergency care. J Trauma 1974;14:187-196.',
  countries: 'Международный',
  presets: [
    { label: 'Лёгкая ЧМТ', values: { head: '2', face: '1', chest: '0', abd: '0', ext: '1', ext2: '0' } },
    { label: 'ДТП: ЧМТ + грудь + таз', values: { head: '4', face: '1', chest: '3', abd: '0', ext: '3', ext2: '1' } },
    { label: 'Major trauma (ISS ≥ 16)', values: { head: '3', face: '0', chest: '4', abd: '3', ext: '2', ext2: '0' } },
    { label: 'Unsurvivable (AIS 6)', values: { head: '6', face: '0', chest: '0', abd: '0', ext: '0', ext2: '0' } },
  ],
  info: `### Для чего используется
**Injury Severity Score (Baker, 1974)** - анатомический индекс тяжести политравмы. Основа trauma registry (TRISS, NTDB, TARN, MTCR).

### Формула
\`ISS = A² + B² + C²\`

где A, B, C - три наихудших AIS из 6 областей тела:
1. **Голова/шея**
2. **Лицо**
3. **Грудь**
4. **Живот/таз (висцеральное)**
5. **Конечности/таз (костно-мышечное)**
6. **Внешнее** (кожа, ожоги, ссадины)

Если в любой области AIS = 6 → **ISS = 75**.

### AIS (Abbreviated Injury Scale)
| AIS | Тяжесть | Пример |
|---|---|---|
| 1 | минор | ушиб |
| 2 | умеренная | перелом ребра |
| 3 | серьёзная | стабильный перелом таза |
| 4 | тяжёлая | разрыв селезёнки с продолжающимся кровотечением |
| 5 | критическая | размозжение мозга |
| 6 | максимум | декапитация |

### Пороговые значения
- ISS < 9 - minor (летальность < 1%)
- 9-14 - moderate
- **15-24 - severe** (major trauma порог ≥ 16)
- ≥ 25 - profound (летальность 25-75%)

### Ограничения
- Не учитывает возраст, физиологию, механизм
- В одной области засчитывается только 1 травма (→ см. NISS)
- Зависит от полноты диагностики (CT → выше ISS)
- Не-линейная шкала (16 vs 17 ≠ 24 vs 25)

### Связанные шкалы
- **NISS** (Osler 1997) - 3 наихудших независимо от региона
- **TRISS** (Boyd 1987) - ISS + RTS + возраст + механизм → Ps
- **ICISS** - на основе ICD-9
- **TMPM** - trauma mortality prediction model (многоф. регрессия)

### Источник
Baker SP et al. *The Injury Severity Score.* J Trauma 1974;14:187
`,
};

export default runner;
