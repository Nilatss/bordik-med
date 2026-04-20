// @ts-nocheck
/** Runner: apri-hep — APRI + FIB-4 + NAFLD Fibrosis Score */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ast', label: 'АСТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [20, 40, 80, 150, 300] },
    { id: 'ast_uln', label: 'Верхняя норма АСТ', type: 'number', unit: 'Ед/л', min: 20, max: 50, quickValues: [33, 35, 40] },
    { id: 'alt', label: 'АЛТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [20, 40, 80, 150, 300] },
    { id: 'plt', label: 'Тромбоциты', type: 'number', unit: '×10⁹/л', min: 10, max: 600, quickValues: [80, 120, 180, 250, 350] },
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 0, max: 100, quickValues: [30, 45, 55, 65] },
    { id: 'albumin', label: 'Альбумин', type: 'number', unit: 'г/дл', min: 1, max: 6, step: 0.1, quickValues: [3.0, 3.5, 4.0, 4.5] },
  ],
  compute: (v) => {
    const ast = Number(v.ast) || 0;
    const astUln = Number(v.ast_uln) || 35;
    const alt = Number(v.alt) || 0;
    const plt = Number(v.plt) || 0;
    const age = Number(v.age) || 0;
    const albumin = Number(v.albumin) || 0;

    const apri = plt > 0 && astUln > 0 ? ((ast / astUln) * 100) / plt : 0;
    const fib4 = plt > 0 && alt > 0 ? (age * ast) / (plt * Math.sqrt(alt)) : 0;

    let apriStage = 'F0–F1';
    let apriColor = '#22C55E';
    if (apri > 2) { apriStage = 'F4 (цирроз)'; apriColor = '#EF4444'; }
    else if (apri > 1) { apriStage = 'F3–F4'; apriColor = '#F97316'; }
    else if (apri > 0.5) { apriStage = 'F1–F2'; apriColor = '#F59E0B'; }

    let fib4Stage = 'F0–F1';
    let fib4Color = '#22C55E';
    if (fib4 > 3.25) { fib4Stage = 'F3–F4'; fib4Color = '#EF4444'; }
    else if (fib4 >= 1.45) { fib4Stage = 'Серая зона'; fib4Color = '#F59E0B'; }

    const worst = apri > 1 || fib4 > 3.25 ? '#EF4444'
      : (apri > 0.5 || fib4 >= 1.45) ? '#F59E0B' : '#22C55E';

    return {
      value: `APRI ${apri.toFixed(2)}`,
      unit: `FIB-4 ${fib4.toFixed(2)}`,
      interpretation: `APRI → ${apriStage}; FIB-4 → ${fib4Stage}`,
      color: worst,
      details: `**APRI** = (АСТ/ВГН) × 100 / Тромбоциты. Пороги: < 0,5 (F0–F1), > 1,0 (F3–F4), > 2,0 (цирроз).\n**FIB-4** = Возраст × АСТ / (Тромб × √АЛТ). Пороги: < 1,45 (F0–F1, NPV 90 %), > 3,25 (F3–F4, PPV 65 %).`,
      actions: [
        apri > 1 || fib4 > 3.25 ? 'Направить на фиброэластографию (FibroScan) или МР-эластографию' : 'Повторить через 1–2 года при ХГB/C, NAFLD',
        apri > 2 || fib4 > 3.25 ? 'Начать скрининг ГЦК (УЗИ + АФП каждые 6 мес)' : null,
        apri > 2 ? 'ЭГДС-скрининг варикозов пищевода при циррозе' : null,
        albumin < 3.5 ? 'Низкий альбумин — оценить печёночную недостаточность, MELD, Child-Pugh' : null,
        'Исключить обратимые причины: HCV (DAA), HBV (тенофовир), алкоголь, NAFLD (диета, похудение)',
        'Вакцинация HAV/HBV у всех с ХЗП',
      ].filter(Boolean),
      caveats: [
        'APRI/FIB-4 точны для исключения F3–F4 (высокий NPV), хуже для подтверждения',
        'Ложно-высокие значения: острый гепатит, гемолиз, беременность',
        'У NAFLD FIB-4 точнее APRI; NAFLD Fibrosis Score (NFS) — альтернатива',
        'Фиброэластография (стиффнесс) — золотой стандарт неинвазивной оценки',
        'Биопсия остаётся эталоном при расхождении',
      ],
      scale: {
        segments: [
          { min: 0, max: 1.45, label: 'Низкий', color: '#22C55E' },
          { min: 1.45, max: 3.25, label: 'Серая зона', color: '#F59E0B' },
          { min: 3.25, max: 10, label: 'F3–F4', color: '#EF4444' },
        ],
        current: Math.min(fib4, 10),
        unit: 'FIB-4',
      },
      relatedCourses: [
        { id: '301.3', title: 'Гастро / гепатология' },
        { id: '305.1', title: 'Инфекции' },
      ],
      related: [
        { id: 'meld', title: 'MELD' },
        { id: 'child-pugh', title: 'Child-Pugh' },
        { id: 'aasld', title: 'AASLD HCC' },
      ],
    };
  },
  reference: 'Wai CT et al. Hepatology 2003;38:518 (APRI). Sterling RK et al. Hepatology 2006;43:1317 (FIB-4). WHO 2015 HCV Guidelines.',
  countries: 'Международный (WHO / AASLD / EASL)',
  presets: [
    { label: 'Норма', values: { ast: 25, ast_uln: 35, alt: 25, plt: 250, age: 40, albumin: 4.2 } },
    { label: 'Хр. гепатит (средний фиброз)', values: { ast: 90, ast_uln: 35, alt: 80, plt: 150, age: 50, albumin: 3.9 } },
    { label: 'Цирроз', values: { ast: 120, ast_uln: 35, alt: 80, plt: 75, age: 60, albumin: 3.0 } },
  ],
  info: `### Для чего используется
**APRI** и **FIB-4** — неинвазивные индексы фиброза печени. Используются для триажа: кого направлять на фиброэластографию / биопсию.

### Формулы
- **APRI** = (АСТ / ВГН) × 100 / Тромбоциты (×10⁹/л)
- **FIB-4** = (Возраст × АСТ) / (Тромбоциты × √АЛТ)

### Пороги APRI (WHO, HCV)
| APRI | Фиброз |
|---|---|
| < 0,5 | F0–F1 (нет/минимальный) |
| 0,5–1,0 | F1–F2 |
| 1,0–2,0 | F3 |
| > 2,0 | F4 (цирроз) |

### Пороги FIB-4
| FIB-4 | Интерпретация |
|---|---|
| < 1,45 | F0–F2 (NPV 90 %) — фиброэластография не нужна |
| 1,45–3,25 | Серая зона — фиброэластография |
| > 3,25 | F3–F4 (PPV 65 %) — гепатолог, скрининг ГЦК |

### NAFLD Fibrosis Score (NFS)
Возраст, BMI, диабет/глюкоза натощак, АСТ/АЛТ, тромбоциты, альбумин.
- NFS < −1,455 — исключает F3–F4
- NFS > 0,675 — подтверждает F3–F4

### Алгоритм (AASLD / EASL)
1. APRI + FIB-4 в первичном звене
2. Серая зона → фиброэластография
3. Несоответствие → биопсия
4. F3–F4 → гепатолог + скрининг ГЦК + ЭГДС

### Ограничения
- Острый гепатит (АСТ > 10 ×N) даёт ложно-высокий
- Гемолиз, беременность — искажают
- FIB-4 валидирован у > 35 лет; не применять у детей и < 35`,
};

export default runner;
