// @ts-nocheck
/** Runner: frax-e — FRAX 10-year fracture risk (simplified English tool) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст', type: 'number', unit: 'лет', min: 40, max: 90, step: 1, quickValues: [50, 60, 65, 70, 75, 80] },
    { id: 'female', label: 'Женский пол', type: 'checkbox' },
    { id: 'bmi',
hint: 'ИМТ = вес (кг) / рост² (м²)', label: 'ИМТ', type: 'number', unit: 'кг/м²', min: 15, max: 45, step: 0.5, quickValues: [18, 22, 25, 28, 32] },
    { id: 'prevfx', label: 'Предыдущий малоэнергетический перелом', type: 'checkbox' },
    { id: 'parenthip', label: 'Перелом шейки бедра у родителей', type: 'checkbox' },
    { id: 'smoke', label: 'Курение', type: 'checkbox' },
    { id: 'steroid', label: 'ГКС ≥ 3 мес (≥ 5 мг/сут преднизолона)', type: 'checkbox' },
    { id: 'ra', label: 'Ревматоидный артрит', type: 'checkbox' },
    { id: 'secondary', label: 'Вторичный остеопороз (СД1, гипертиреоз, гипогонадизм и т.д.)', type: 'checkbox' },
    { id: 'alcohol', label: 'Алкоголь ≥ 3 ед/сут', type: 'checkbox' },
    { id: 'bmd', label: 'T-критерий шейки бедра (DXA, если известен)', type: 'number', unit: 'SD', min: -5, max: 2, step: 0.1, quickValues: [-3, -2.5, -2, -1.5, -1, 0] },
  ],
  compute: (v) => {
    const age = Number(v.age) || 60;
    const female = !!v.female;
    const bmi = Number(v.bmi) || 25;
    const prev = !!v.prevfx;
    const parent = !!v.parenthip;
    const smoke = !!v.smoke;
    const steroid = !!v.steroid;
    const ra = !!v.ra;
    const sec = !!v.secondary;
    const alc = !!v.alcohol;
    const tscore = Number(v.bmd);

    // Simplified FRAX-like model (not official Kanis coefficients).
    // Baseline MOF (major osteoporotic fracture) by age & sex
    let mof = female ? (age - 45) * 0.35 : (age - 45) * 0.20;
    mof = Math.max(mof, 1);
    let hip = female ? (age - 50) * 0.20 : (age - 50) * 0.12;
    hip = Math.max(hip, 0.3);

    // Risk factor multipliers
    const mult = (m: number) => (v: boolean, factor: number) => v ? m * factor : m;
    if (prev) { mof *= 1.85; hip *= 2.0; }
    if (parent) { mof *= 1.4; hip *= 2.2; }
    if (smoke) { mof *= 1.25; hip *= 1.6; }
    if (steroid) { mof *= 1.7; hip *= 2.1; }
    if (ra) { mof *= 1.4; hip *= 1.5; }
    if (sec) { mof *= 1.3; hip *= 1.3; }
    if (alc) { mof *= 1.5; hip *= 1.7; }

    // BMI effect (low BMI → higher hip fx)
    if (bmi < 20) { mof *= 1.3; hip *= 1.9; }
    else if (bmi > 30) { mof *= 0.85; hip *= 0.7; }

    // T-score effect
    if (!Number.isNaN(tscore) && tscore !== 0) {
      const tsMult = Math.pow(2, -tscore - 1); // each -1 SD ~ 2× hip fx
      if (tscore <= -2.5) { hip *= Math.min(tsMult, 6); mof *= Math.min(Math.sqrt(tsMult), 3); }
      else if (tscore <= -1) { hip *= Math.min(tsMult * 0.6, 3); mof *= Math.min(Math.sqrt(tsMult) * 0.8, 2); }
    }

    mof = Math.min(Math.max(mof, 0.5), 80);
    hip = Math.min(Math.max(hip, 0.1), 50);

    const mofV = mof.toFixed(1);
    const hipV = hip.toFixed(1);

    let verdict = '';
    let color = '#10B981';
    const actions: string[] = [];

    if (hip >= 3 || mof >= 20) {
      verdict = 'Высокий риск — показана антирезорбтивная терапия';
      color = '#EF4444';
      actions.push('Бисфосфонаты (алендронат/ризедронат/золедронат) 3-5 лет');
      actions.push('Деносумаб 60 мг п/к × 6 мес при непереносимости БФ');
      actions.push('Терипаратид 20 мкг п/к/сут при очень высоком риске (T ≤ -3,5 + переломы)');
      actions.push('Са 1000-1200 мг/сут + витамин D 800-2000 МЕ/сут');
      actions.push('Профилактика падений, оценка зрения, отмена психотропов');
    } else if (hip >= 1 || mof >= 10) {
      verdict = 'Промежуточный риск — DXA + решение по терапии';
      color = '#F59E0B';
      actions.push('DXA поясничного отдела + шейки бедра');
      actions.push('Начало терапии при T ≤ -2,5 или предыдущем переломе');
      actions.push('Са + витамин D, силовые упражнения');
    } else {
      verdict = 'Низкий риск — профилактика';
      color = '#10B981';
      actions.push('Са 1000 мг/сут + витамин D 800 МЕ/сут');
      actions.push('Физическая активность (силовые + баланс)');
      actions.push('Отказ от курения, алкоголь ≤ 2 ед/сут');
      actions.push('Повтор FRAX через 2-5 лет');
    }

    return {
      value: `MOF ${mofV} % · Hip ${hipV} %`,
      unit: '10-year',
      interpretation: verdict,
      color,
      details: `10-летний риск переломов (FRAX-like оценка):\n- MOF (major osteoporotic fracture — позвонок, бедро, предплечье, плечо): ${mofV} %\n- Hip (перелом шейки бедра): ${hipV} %\n\nПороги NOF / NOGG / РАЭ 2017:\n- MOF ≥ 20 % или Hip ≥ 3 % → антирезорбтивная терапия\n- MOF 10-19 % или Hip 1-3 % → DXA + индивидуальное решение\n\nЭто упрощённая оценка; для регистрации в РКИ/назначения терапии используйте официальный FRAX® (sheffield.ac.uk/FRAX).`,
      actions,
      caveats: [
        'Это упрощённая FRAX-подобная модель — официальный FRAX® использует региональные коэффициенты',
        'FRAX не учитывает: дозу ГКС, число предыдущих переломов, падения, вертебр. переломы без DXA',
        'TBS (trabecular bone score) может уточнить оценку у пациентов с СД2',
        'У пациентов с очень высоким риском (T ≤ -3,5 + ≥ 2 вертебр. переломов) — анаболическая терапия 1-й линии',
        'Официальный калькулятор: frax.shef.ac.uk',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: 'Низкий', color: '#10B981' },
          { min: 10, max: 20, label: 'Промежут.', color: '#F59E0B' },
          { min: 20, max: 80, label: 'Высокий', color: '#EF4444' },
        ],
        current: Math.min(mof, 80),
        unit: '% (MOF)',
      },
      related: [
        { id: 'garvan', title: 'Garvan' },
        { id: 'qfracture', title: 'QFracture' },
      ],
      relatedCourses: [
        { id: '301.8', title: 'Ревматология' },
        { id: '302.1', title: 'Эндокринология' },
      ],
    };
  },
  reference: 'Kanis JA et al. FRAX® and the assessment of fracture probability. Osteoporos Int 2008;19:385-97.',
  countries: 'Международный (WHO/FRAX)',
  presets: [
    { label: '65 ♀, ИМТ 24, без ФР', values: { age: 65, female: true, bmi: 24, prevfx: false, parenthip: false, smoke: false, steroid: false, ra: false, secondary: false, alcohol: false, bmd: 0 } },
    { label: '75 ♀, перелом + ГКС', values: { age: 75, female: true, bmi: 22, prevfx: true, parenthip: false, smoke: false, steroid: true, ra: false, secondary: false, alcohol: false, bmd: -2.8 } },
    { label: '60 ♂, курение + алк.', values: { age: 60, female: false, bmi: 23, prevfx: false, parenthip: true, smoke: true, steroid: false, ra: false, secondary: false, alcohol: true, bmd: -1.5 } },
  ],
  info: `### Для чего используется
**FRAX®** — 10-летний риск основных остеопоротических переломов (MOF) и шейки бедра с учётом клинических ФР ± BMD.

### Факторы риска (11)
1. Возраст (40-90)
2. Пол
3. ИМТ
4. Предыдущий перелом
5. Перелом бедра у родителей
6. Курение
7. ГКС ≥ 3 мес
8. РА
9. Вторичный остеопороз
10. Алкоголь ≥ 3 ед/сут
11. T-критерий шейки бедра (опц.)

### Пороги терапии (NOF/NOGG/РАЭ)
| MOF | Hip | Рекомендация |
|---|---|---|
| ≥ 20 % | ≥ 3 % | Антирезорбтивная терапия |
| 10-19 % | 1-3 % | DXA + индивид. решение |
| < 10 % | < 1 % | Профилактика |

### Источник
Kanis JA et al. Osteoporos Int 2008;19:385-97. Официальный калькулятор: frax.shef.ac.uk`,
};

export default runner;
