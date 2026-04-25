// @ts-nocheck
/** Runner: fib4-lab — FIB-4 laboratory view */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 100, quickValues: [35, 50, 60, 70] },
    { id: 'ast',
hint: 'АСТ. Норма: М <40, Ж <32 Ед/л', label: 'АСТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [25, 60, 120, 250] },
    { id: 'alt',
hint: 'АЛТ. Норма: М <40, Ж <32 Ед/л', label: 'АЛТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [25, 60, 120, 250] },
    { id: 'plt',
hint: 'Тромбоциты. Норма: 150-400 ×10⁹/л', label: 'Тромбоциты', type: 'number', unit: '×10⁹/л', min: 20, max: 600, quickValues: [80, 150, 220, 300] },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const ast = Number(v.ast) || 0;
    const alt = Number(v.alt) || 0;
    const plt = Number(v.plt) || 1;

    const fib4 = (plt > 0 && alt > 0) ? (age * ast) / (plt * Math.sqrt(alt)) : 0;

    let interpretation = 'F0–F1 (низкий)';
    let color = '#22C55E';
    let stage = 'low';
    if (fib4 > 2.67) { interpretation = 'F3–F4 (распр. фиброз)'; color = '#EF4444'; stage = 'high'; }
    else if (fib4 >= 1.3) { interpretation = 'Неопределённый'; color = '#F59E0B'; stage = 'mid'; }

    return {
      value: fib4.toFixed(2),
      unit: 'FIB-4',
      interpretation,
      color,
      details: `FIB-4 = Возраст × АСТ / (Тромбоциты × √АЛТ)
Cut-off (NAFLD/MASLD, AASLD 2023): < 1,3 — низкий (NPV 90 %), 1,3–2,67 — серая зона, > 2,67 — распр. фиброз (PPV ~80 %).`,
      actions: [
        stage === 'low' ? 'Контроль FIB-4 каждые 2–3 года; модификация ОЖ' : null,
        stage === 'mid' ? 'Вторичный тест: фиброэластография (FibroScan) или ELF' : null,
        stage === 'high' ? 'Направить к гепатологу; фиброэластография + оценка цирроза' : null,
        stage === 'high' ? 'Скрининг ГЦК (УЗИ + АФП каждые 6 мес) при подтверждении F3–F4' : null,
        stage === 'high' ? 'ЭГДС-скрининг варикозов пищевода при циррозе' : null,
        'Исключить обратимые причины: HCV, HBV, алкоголь, MASLD',
      ].filter(Boolean),
      caveats: [
        'FIB-4 разработан для HCV (Sterling 2006), валидирован для NAFLD/MASLD/HBV/HIV-HCV',
        'Cut-off < 1,3 — для возраста < 65 лет; у > 65 рекомендуют сдвинуть на 2,0 (AGA 2021)',
        'Острый гепатит (АСТ/АЛТ > 10× ULN) даёт ложно-высокий',
        'Не применять у < 35 лет (низкая валидация)',
        'Тромбоцитопения (не печёночная) → ложно-высокий',
      ],
      scale: {
        segments: [
          { min: 0, max: 1.3, label: 'Низкий', color: '#22C55E' },
          { min: 1.3, max: 2.67, label: 'Серая зона', color: '#F59E0B' },
          { min: 2.67, max: 10, label: 'F3–F4', color: '#EF4444' },
        ],
        current: Math.min(fib4, 10),
        unit: 'FIB-4',
      },
      relatedCourses: [
        { id: '301.3', title: 'Гепатология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: 'apri-hep', title: 'APRI/FIB-4' },
        { id: 'nafld-fs', title: 'NAFLD FS' },
        { id: 'fibrotest', title: 'FibroTest' },
      ],
    };
  },
  reference: 'Sterling RK et al. Hepatology 2006;43:1317. AASLD 2023 MASLD Guidance. EASL 2024 Clinical Practice Guideline on MASLD.',
  countries: 'Международный (AASLD / EASL)',
  presets: [
    { label: 'Норма', values: { age: 40, ast: 25, alt: 30, plt: 260 } },
    { label: 'Серая зона', values: { age: 55, ast: 60, alt: 55, plt: 180 } },
    { label: 'Распр. фиброз', values: { age: 65, ast: 120, alt: 70, plt: 95 } },
  ],
  info: `
### Для чего используется
**FIB-4** — неинвазивный лабораторный индекс фиброза печени. Первая линия триажа при MASLD, HCV, HBV, ВИЧ/HCV.

### Формула
\`FIB-4 = (Возраст × АСТ) / (Тромбоциты × √АЛТ)\`

Единицы: возраст — годы, АСТ/АЛТ — Ед/л, тромбоциты — ×10⁹/л.

### Cut-off (AASLD 2023, MASLD)
| FIB-4 | Вероятность | Действие |
|---|---|---|
| < 1,3 | Низкая (NPV 90 %) | Контроль каждые 2–3 года |
| 1,3–2,67 | Неопределённая | Вторичный тест: эластометрия или ELF |
| > 2,67 | Высокая (PPV ~80 %) | Гепатолог + эластометрия; скрининг ГЦК при F3–F4 |

### Для возраста > 65 лет
AGA 2021 предлагает сдвинуть низкий cut-off до **< 2,0** — FIB-4 переоценивает фиброз у пожилых.

### Двухшаговый алгоритм AASLD/AGA
1. **FIB-4** в первичном звене
2. Серая зона (1,3–2,67) → **FibroScan (LSM)** или **ELF**
   - LSM < 8 kPa → низкий; > 12 kPa → F3–F4
3. Несоответствие → биопсия
4. F3–F4 → гепатолог, скрининг ГЦК (УЗИ + АФП q6 мес)

### Преимущества
- Бесплатный, доступен в обычной лаборатории
- Не требует доп. исследований
- Высокий NPV для исключения F3–F4

### Ограничения
- Низкая валидация у возраста < 35 лет
- Острый гепатит искажает
- Тромбоцитопения вне печёночной патологии → ложно-высокий
- Не дифференцирует F0 vs F1 vs F2`,
};

export default runner;
