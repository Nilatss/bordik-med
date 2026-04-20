// @ts-nocheck
/** Runner: tnm-hn - TNM 8th ed for head & neck cancers */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'site', label: 'Локализация', type: 'select', options: [
      { value: 'oral', label: 'Полость рта (язык, дно, щека)' },
      { value: 'oropharynx-hpv+', label: 'Ротоглотка HPV(+) / p16+' },
      { value: 'oropharynx-hpv-', label: 'Ротоглотка HPV(-) / p16-' },
      { value: 'nasopharynx', label: 'Носоглотка (NPC)' },
      { value: 'larynx', label: 'Гортань' },
    ] },
    { id: 't', label: 'T (первичная опухоль)', type: 'select', options: [
      { value: 'T1', label: 'T1 - ≤ 2 см (для полости рта: и ≤ 5 мм глубина)' },
      { value: 'T2', label: 'T2 - 2-4 см' },
      { value: 'T3', label: 'T3 - > 4 см или DOI > 10 мм' },
      { value: 'T4a', label: 'T4a - местно распространённая, резектабельная' },
      { value: 'T4b', label: 'T4b - нерезектабельная (сонная артерия, основание черепа, превертебр. фасция)' },
    ] },
    { id: 'n', label: 'N (лимфоузлы)', type: 'select', options: [
      { value: 'N0', label: 'N0 - нет метастазов' },
      { value: 'N1', label: 'N1 - ипсилатеральный единичный ≤ 3 см' },
      { value: 'N2a', label: 'N2a - ипсилат. единичный 3-6 см' },
      { value: 'N2b', label: 'N2b - ипсилат. множественные ≤ 6 см' },
      { value: 'N2c', label: 'N2c - контр./билат. ≤ 6 см' },
      { value: 'N3a', label: 'N3a - > 6 см, без ENE' },
      { value: 'N3b', label: 'N3b - экстракапсулярное распространение (ENE+)' },
    ] },
    { id: 'm', label: 'M (отдалённые метастазы)', type: 'select', options: [
      { value: 'M0', label: 'M0 - нет' },
      { value: 'M1', label: 'M1 - есть' },
    ] },
  ],
  compute: (v) => {
    const site = String(v.site);
    const t = String(v.t);
    const n = String(v.n);
    const m = String(v.m);

    let stage = 'IV';
    if (m === 'M1') stage = site === 'oropharynx-hpv+' ? 'IV' : 'IVC';
    else if (site === 'oropharynx-hpv+') {
      // HPV+ oropharynx уникальное стадирование (AJCC 8th)
      if (t === 'T1' && n === 'N0') stage = 'I';
      else if (['T1','T2'].includes(t) && ['N0','N1'].includes(n)) stage = 'I';
      else if (['T1','T2'].includes(t) && ['N2a','N2b','N2c'].includes(n)) stage = 'II';
      else if (['T3'].includes(t) || n === 'N3a' || n === 'N3b') stage = 'III';
      else stage = 'III';
    } else {
      // Стандартное стадирование для остальных HN
      if (t === 'T1' && n === 'N0') stage = 'I';
      else if (t === 'T2' && n === 'N0') stage = 'II';
      else if ((t === 'T3' && ['N0','N1'].includes(n)) || (['T1','T2'].includes(t) && n === 'N1')) stage = 'III';
      else if (t === 'T4a' || ['N2a','N2b','N2c'].includes(n)) stage = 'IVA';
      else if (t === 'T4b' || n === 'N3a' || n === 'N3b') stage = 'IVB';
    }

    const survivalMap = {
      'I': '5-yr OS ~ 80-90%',
      'II': '5-yr OS ~ 65-80%',
      'III': '5-yr OS ~ 50-65%',
      'IVA': '5-yr OS ~ 30-50%',
      'IVB': '5-yr OS ~ 15-30%',
      'IVC': '5-yr OS ~ 5-15% (palliation)',
      'IV': '5-yr OS ~ 10-30%',
    };

    const color = stage === 'I' ? '#22C55E' : stage === 'II' ? '#84CC16' : stage === 'III' ? '#F59E0B' : stage.startsWith('IV') ? '#EF4444' : '#991B1B';

    return {
      value: 'Stage ' + stage, unit: '',
      interpretation: `Stage ${stage} · ${t} ${n} ${m}`,
      color,
      details: `${site} - ${survivalMap[stage] ?? ''}. Лечение мультидисциплинарное (tumor board).`,
      actions: [
        'МРТ шеи + КТ грудной клетки (стадирование)',
        'Биопсия с HPV/p16 тестированием для ротоглотки',
        'Tumor board: хирург + онколог + лучевой терапевт',
        stage === 'I' || stage === 'II' ? 'Локальное лечение (хирургия или лучевая терапия)' : 'Комбинированное: хирургия + лучевая ± химио',
        stage === 'IVB' ? 'Паллиативная химио-лучевая терапия' : '',
        'Программы курения / алкоголя - снижают риск рецидива',
      ].filter(Boolean),
      caveats: [
        'AJCC 8th (2017/2018) - отдельное стадирование для HPV+ ротоглотки, кожи (для HN)',
        'DOI (depth of invasion) - критический параметр для полости рта в 8-й редакции',
        'ENE (extranodal extension) - N3b в 8-й ред., резкое ухудшение прогноза',
        'Носоглотка - своя классификация с акцентом на ЛУ по уровням (IIA/IIB)',
      ],
      scale: {
        segments: [
          { min: 1, max: 1, label: 'I', color: '#22C55E' },
          { min: 2, max: 2, label: 'II', color: '#84CC16' },
          { min: 3, max: 3, label: 'III', color: '#F59E0B' },
          { min: 4, max: 4, label: 'IV', color: '#EF4444' },
        ],
        current: stage === 'I' ? 1 : stage === 'II' ? 2 : stage === 'III' ? 3 : 4,
        unit: 'Stage',
      },
      related: [{ id: 'tnm', title: 'TNM base' }, { id: 'ecog-kps', title: 'ECOG/KPS' }, { id: 'velscope', title: 'VELscope' }],
      relatedCourses: [{ id: '313.7', title: 'Онкостоматология' }, { id: '309.1', title: 'Онкология ГШ' }],
    };
  },
  reference: 'Amin MB et al. AJCC Cancer Staging Manual. 8th ed. Springer 2017.',
  countries: 'Международный (AJCC · UICC)',
  presets: [
    { label: 'T1N0M0 (Stage I)', values: { site: 'oral', t: 'T1', n: 'N0', m: 'M0' } },
    { label: 'HPV+ T3N2b (Stage II)', values: { site: 'oropharynx-hpv+', t: 'T3', n: 'N2b', m: 'M0' } },
    { label: 'T4bN3b (Stage IVB)', values: { site: 'larynx', t: 'T4b', n: 'N3b', m: 'M0' } },
  ],
  info: `### Для чего используется
TNM 8th edition для рака головы и шеи. Ключевые обновления 8-й редакции:
- **HPV(+) ротоглотка** - отдельное стадирование (лучший прогноз)
- **DOI (depth of invasion)** - для полости рта
- **ENE (extranodal extension)** - для всех HN (N3b)

### Стадии (не-HPV+ oropharynx)
| Stage | T | N | M |
|---|---|---|---|
| I | T1 | N0 | M0 |
| II | T2 | N0 | M0 |
| III | T3 или T1-3/N1 | N0-1 | M0 |
| IVA | T4a или N2 | любые | M0 |
| IVB | T4b или N3 | любые | M0 |
| IVC | любое | любое | M1 |

### Специфика
- **HPV+** - лучше прогноз, можно деэскалировать терапию
- **Носоглотка** - отдельная TNM с важностью ЛУ уровней
- **T4b** обычно = нерезектабельный → ХЛТ

### Источник
Amin MB et al. AJCC 8th ed. Springer 2017.`,
};

export default runner;
