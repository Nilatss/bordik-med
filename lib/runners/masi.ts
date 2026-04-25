// @ts-nocheck
/** Runner: masi - MASI (Melasma Area and Severity Index) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'fa', label: 'Лоб: площадь (0-6)', type: 'number', min: 0, max: 6, step: 1 },
    { id: 'fd', label: 'Лоб: интенсивность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'fh', label: 'Лоб: гомогенность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'ra', label: 'Правая щека: площадь (0-6)', type: 'number', min: 0, max: 6, step: 1 },
    { id: 'rd', label: 'Правая щека: интенсивность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'rh', label: 'Правая щека: гомогенность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'la', label: 'Левая щека: площадь (0-6)', type: 'number', min: 0, max: 6, step: 1 },
    { id: 'ld', label: 'Левая щека: интенсивность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'lh', label: 'Левая щека: гомогенность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'ca',
hint: 'Кальций общий. Норма: 2.15-2.55 ммоль/л', label: 'Подбородок: площадь (0-6)', type: 'number', min: 0, max: 6, step: 1 },
    { id: 'cd', label: 'Подбородок: интенсивность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
    { id: 'ch', label: 'Подбородок: гомогенность (0-4)', type: 'number', min: 0, max: 4, step: 1 },
  ],
  compute: (v) => {
    const F = Number(v.fa || 0) * (Number(v.fd || 0) + Number(v.fh || 0)) * 0.3;
    const R = Number(v.ra || 0) * (Number(v.rd || 0) + Number(v.rh || 0)) * 0.3;
    const L = Number(v.la || 0) * (Number(v.ld || 0) + Number(v.lh || 0)) * 0.3;
    const C = Number(v.ca || 0) * (Number(v.cd || 0) + Number(v.ch || 0)) * 0.1;
    const total = F + R + L + C;
    const score = Math.round(total * 10) / 10;

    let color = '#22C55E', band = 'Лёгкая';
    if (score >= 25) { color = '#EF4444'; band = 'Тяжёлая'; }
    else if (score >= 10) { color = '#F59E0B'; band = 'Среднетяжёлая'; }

    return {
      value: String(score),
      unit: '/48',
      interpretation: band,
      color,
      details: `MASI = 0.3·F + 0.3·R + 0.3·L + 0.1·C, где каждая зона = A·(D+H).`,
      actions: [
        'Строгая фотопротекция: SPF 50+ broad-spectrum, тонированные физические фильтры (iron oxide против HEV-света), ежедневно',
        'Первая линия: тройная комбинация Kligman (гидрохинон 4% + третиноин 0.05% + флуоцинолон 0.01%) на ночь 8-12 нед',
        score < 10 ? 'Монотерапия: гидрохинон 2-4%, азелаиновая кислота 20%, ретиноиды' : '',
        score >= 10 ? 'Альтернативы: цистеамин 5%, транексамовая кислота топически / перорально 250 мг 2×/сут' : '',
        score >= 25 ? 'Процедурные: химические пилинги (гликолевая, салициловая, ТСА 15%), Q-switched Nd:YAG 1064 пико/нано, micro-needling' : '',
        'Избегать комбинированных оральных контрацептивов, тестостерон-содержащих',
        'Избегать тепловых триггеров (сауны, горячие ванны, плита)',
      ].filter(Boolean),
      caveats: [
        'Гидрохинон > 12 нед — риск охроноза, особенно Fitzpatrick V-VI',
        'IPL / аблятивные лазеры противопоказаны — обостряют меласму и вызывают PIH',
        'mMASI (modified, 2011) — исключает гомогенность, проще в применении',
        'Wood\'s lamp: эпидермальная форма ярче, дермальная — нет; лечение эпидермальной эффективнее',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: 'Лёгкая', color: '#22C55E' },
          { min: 10, max: 25, label: 'Среднетяжёлая', color: '#F59E0B' },
          { min: 25, max: 48, label: 'Тяжёлая', color: '#EF4444' },
        ],
        current: score,
        unit: 'MASI',
      },
      related: [{ id: 'fitzpatrick', title: 'Fitzpatrick' }, { id: 'pasi', title: 'PASI' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Kimbrough-Green CK, Griffiths CE, Finkel LJ, et al. Topical retinoic acid (tretinoin) for melasma in black patients. Arch Dermatol 1994;130:727-733. Pandya AG et al. JAAD 2011 (mMASI).',
  countries: 'Международный (AAD)',
  presets: [
    { label: 'Лёгкая', values: { fa:2, fd:1, fh:1, ra:2, rd:1, rh:1, la:2, ld:1, lh:1, ca:1, cd:1, ch:1 } },
    { label: 'Среднетяжёлая', values: { fa:4, fd:2, fh:2, ra:4, rd:2, rh:2, la:4, ld:2, lh:2, ca:2, cd:2, ch:2 } },
    { label: 'Тяжёлая', values: { fa:6, fd:3, fh:3, ra:6, rd:3, rh:3, la:6, ld:3, lh:3, ca:5, cd:3, ch:3 } },
  ],
  info: `### Для чего используется
**MASI (Melasma Area and Severity Index)** — количественная оценка тяжести **меласмы** на лице.

### Формула
\`MASI = 0.3·F·(D_F + H_F)·A_F + 0.3·R·(...) + 0.3·L·(...) + 0.1·C·(...)\`

4 зоны: лоб (30%), правая щека (30%), левая щека (30%), подбородок (10%).

Для каждой зоны:
- **A (Area)** 0-6: 0 (нет), 1 (< 10%), 2 (10-29%), 3 (30-49%), 4 (50-69%), 5 (70-89%), 6 (≥ 90%)
- **D (Darkness)** 0-4
- **H (Homogeneity)** 0-4

Максимум = 48.

### Интерпретация (условная)
| MASI | Тяжесть |
|---|---|
| < 10 | Лёгкая |
| 10-25 | Среднетяжёлая |
| > 25 | Тяжёлая |

### Ключевая терапия
1. Фотопротекция SPF 50+ с iron oxide (блок HEV-света) — **основа**
2. Тройная Kligman (гидрохинон + третиноин + флуоцинолон)
3. Транексамовая кислота 250 мг × 2/сут per os (off-label, контроль D-димера)
4. Пилинги, Q-switched Nd:YAG 1064 пико

### Что НЕ делать
- IPL, ablative лазеры — обострят
- Длительный гидрохинон > 12 нед
- Оральные эстрогены

### Источник
Kimbrough-Green CK. Arch Dermatol 1994. Pandya AG (mMASI). JAAD 2011.`,
};

export default runner;
