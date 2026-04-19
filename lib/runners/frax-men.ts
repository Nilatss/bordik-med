// @ts-nocheck
/** Runner: frax-men — 10-летний риск остеопоротического перелома (FRAX, Kanis 2008) */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст, лет', type: 'number', min: 40, max: 90, step: 1, quickValues: [50, 55, 60, 65, 70, 75] },
    {
      id: 'sex',
      label: 'Пол',
      type: 'select',
      options: [
        { value: 'f', label: 'Женский' },
        { value: 'm', label: 'Мужской' },
      ],
    },
    { id: 'weight', label: 'Вес, кг', type: 'number', min: 30, max: 200, step: 0.5, quickValues: [50, 60, 70, 80] },
    { id: 'height', label: 'Рост, см', type: 'number', min: 120, max: 210, step: 0.5, quickValues: [155, 160, 165, 170] },
    { id: 'priorFx', label: 'Предыдущий остеопоротический перелом', type: 'checkbox' },
    { id: 'parentHip', label: 'Перелом бедра у родителей', type: 'checkbox' },
    { id: 'smoker', label: 'Текущее курение', type: 'checkbox' },
    { id: 'gluco', label: 'Глюкокортикоиды (≥ 5 мг/сут преднизона ≥ 3 мес)', type: 'checkbox' },
    { id: 'ra', label: 'Ревматоидный артрит', type: 'checkbox' },
    { id: 'secondary', label: 'Вторичный остеопороз (СД1, гипертиреоз и др.)', type: 'checkbox' },
    { id: 'alcohol', label: 'Алкоголь ≥ 3 ед/сут', type: 'checkbox' },
    { id: 'tscore', label: 'T-score шейки бедра (опционально)', type: 'number', min: -5, max: 2, step: 0.1 },
  ],
  compute: (v) => {
    const age = Number(v.age) || 60;
    const sex = v.sex || 'f';
    const w = Number(v.weight) || 65;
    const h = (Number(v.height) || 165) / 100;
    const bmi = w / (h * h);
    const ts = v.tscore === '' || v.tscore === undefined ? null : Number(v.tscore);
    // Simplified approximation of FRAX — educational
    let major = sex === 'f' ? 3 : 2;
    major += Math.max(0, (age - 50) * 0.35);
    if (bmi < 20) major += 2;
    if (v.priorFx) major *= 1.8;
    if (v.parentHip) major *= 1.5;
    if (v.smoker) major *= 1.25;
    if (v.gluco) major *= 1.6;
    if (v.ra) major *= 1.3;
    if (v.secondary) major *= 1.3;
    if (v.alcohol) major *= 1.4;
    if (ts !== null) major *= Math.pow(2, Math.max(0, -ts - 1));
    let hip = major / 4;
    if (ts !== null && ts < -2.5) hip *= 2;
    major = Math.min(major, 80);
    hip = Math.min(hip, 50);
    let action = '';
    let color = '#22C55E';
    if (hip >= 3 || major >= 20) {
      action = 'Показана фармакотерапия (бисфосфонаты, деносумаб, ромосозумаб)';
      color = '#DC2626';
    } else if (major >= 10) {
      action = 'Рассмотреть терапию с учётом T-score и факторов риска';
      color = '#F59E0B';
    } else {
      action = 'Низкий риск — модификация образа жизни, Ca/D3';
      color = '#22C55E';
    }
    return {
      value: `MOF ${major.toFixed(1)} % · Hip ${hip.toFixed(1)} %`,
      unit: '',
      interpretation: `10-летний риск: основной остеопоротический ${major.toFixed(1)} %, бедро ${hip.toFixed(1)} %. ${action}`,
      color,
      details:
        'Порог NOF/AACE: бедро ≥ 3 % ИЛИ major ≥ 20 % — показана фармакотерапия. Российские рекомендации используют FRAX-таблицы с адаптированным порогом по возрасту.',
      actions: [
        'DXA (шейка бедра, L1–L4) при T ≤ −2.5 — остеопороз',
        '1-я линия: алендронат / ризедронат / золедронат; деносумаб; ромосозумаб при тяжёлом остеопорозе',
        'Са 1000–1200 мг/сут, витамин D3 800–2000 МЕ/сут',
        'Профилактика падений, силовые упражнения',
      ],
      caveats: [
        'Это упрощённая аппроксимация — для клиники использовать официальный FRAX-калькулятор',
        'T-score вводится только по шейке бедра (DXA)',
        'FRAX валиден у лиц 40–90 лет, не получавших лечение',
        'При нескольких переломах реальный риск выше расчётного',
      ],
      related: [
        { id: 'greene', title: 'Greene / MRS' },
        { id: 'straw10', title: 'STRAW+10' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Эндокринология' },
        { id: '202.5', title: 'Костно-мышечная система' },
      ],
    };
  },
  reference:
    'Kanis JA et al. FRAX and the assessment of fracture probability. Osteoporos Int 2008;19:385-397. NOF Clinician Guide 2022. AACE/ACE Osteoporosis Postmenopausal 2020.',
  countries: 'Международный (FRAX, NOF, AACE)',
  presets: [
    { label: 'Женщина 60, без факторов', values: { age: 60, sex: 'f', weight: 65, height: 165, priorFx: false, parentHip: false, smoker: false, gluco: false, ra: false, secondary: false, alcohol: false } },
    { label: 'Женщина 70 + перелом + ГК', values: { age: 70, sex: 'f', weight: 58, height: 160, priorFx: true, parentHip: false, smoker: false, gluco: true, ra: false, secondary: false, alcohol: false } },
    { label: 'Высокий риск + T −3', values: { age: 75, sex: 'f', weight: 55, height: 160, priorFx: true, parentHip: true, smoker: true, gluco: false, ra: false, secondary: false, alcohol: false, tscore: -3 } },
  ],
  caveats: ['Только официальный FRAX валиден клинически — этот калькулятор образовательный'],
  related: [
    { id: 'greene', title: 'Greene / MRS' },
    { id: 'straw10', title: 'STRAW+10' },
  ],
  relatedCourses: [
    { id: '301.4', title: 'Эндокринология' },
    { id: '202.5', title: 'Костно-мышечная система' },
  ],
  info: `### FRAX (Kanis 2008)
Оценка 10-летней вероятности:
- **MOF** — основной остеопоротический перелом (позвоночник, предплечье, плечо, бедро)
- **Hip** — перелом бедра

### Факторы
Возраст, пол, BMI, предыдущий перелом, перелом бедра у родителей, курение, глюкокортикоиды ≥ 5 мг/сут ≥ 3 мес, РА, вторичный остеопороз, алкоголь ≥ 3 ед/сут, T-score шейки бедра.

### Пороги лечения (NOF/AACE)
- **Hip ≥ 3 %** или **MOF ≥ 20 %** — фармакотерапия
- T-score ≤ −2.5 на любом участке — остеопороз по DXA

### Источники
Kanis Osteoporos Int 2008. NOF 2022. AACE/ACE 2020.`,
};

export default runner;
