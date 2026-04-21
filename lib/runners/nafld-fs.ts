// @ts-nocheck
/** Runner: nafld-fs — NAFLD Fibrosis Score */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 100, quickValues: [35, 50, 60, 70] },
    { id: 'bmi', label: 'ИМТ', type: 'number', unit: 'кг/м²', min: 15, max: 60, step: 0.1, quickValues: [24, 28, 32, 36] },
    { id: 'ifg_dm', label: 'НГН / СД', type: 'select', options: [
      { value: '0', label: 'Нет' },
      { value: '1', label: 'Да' },
    ] },
    { id: 'ast', label: 'АСТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [25, 60, 120] },
    { id: 'alt', label: 'АЛТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [25, 60, 120] },
    { id: 'plt', label: 'Тромбоциты', type: 'number', unit: '×10⁹/л', min: 20, max: 600, quickValues: [150, 220, 300] },
    { id: 'albumin', label: 'Альбумин', type: 'number', unit: 'г/дл', min: 1, max: 6, step: 0.1, quickValues: [3.5, 4.0, 4.5] },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const bmi = Number(v.bmi) || 0;
    const ifg = Number(v.ifg_dm) || 0;
    const ast = Number(v.ast) || 0;
    const alt = Number(v.alt) || 1;
    const plt = Number(v.plt) || 1;
    const alb = Number(v.albumin) || 0;
    const ratio = ast / alt;

    // Angulo 2007: NFS = -1.675 + 0.037 × age + 0.094 × BMI + 1.13 × IFG/DM + 0.99 × AST/ALT − 0.013 × plt − 0.66 × albumin
    const nfs = -1.675 + 0.037 * age + 0.094 * bmi + 1.13 * ifg + 0.99 * ratio - 0.013 * plt - 0.66 * alb;

    let interpretation = 'Неопред. зона';
    let color = '#F59E0B';
    if (nfs < -1.455) { interpretation = 'F0–F2 (искл.)'; color = '#22C55E'; }
    else if (nfs > 0.676) { interpretation = 'F3–F4 вероятен'; color = '#EF4444'; }

    return {
      value: nfs.toFixed(3),
      unit: 'NFS',
      interpretation,
      color,
      details: `NFS (Angulo 2007) = −1,675 + 0,037·возр + 0,094·ИМТ + 1,13·(НГН/СД) + 0,99·АСТ/АЛТ − 0,013·тромб − 0,66·альбумин.
Cut-off: < −1,455 — исключает F3–F4 (NPV 93 %); > 0,676 — подтверждает F3–F4 (PPV 90 %).`,
      actions: [
        nfs < -1.455 ? 'Низкий риск — контроль FIB-4/NFS каждые 2–3 года' : null,
        nfs >= -1.455 && nfs <= 0.676 ? 'Неопр. зона → фиброэластография (FibroScan) или ELF' : null,
        nfs > 0.676 ? 'Направить к гепатологу; подтвердить эластометрией' : null,
        nfs > 0.676 ? 'Скрининг ГЦК (УЗИ + АФП q6 мес) при подтверждении цирроза' : null,
        'Модификация ОЖ: снижение веса 7–10 %, средиземноморская диета',
        'Лечение СД 2 типа: GLP-1 RA (семаглутид), пиоглитазон — благоприятны для MASLD',
      ].filter(Boolean),
      caveats: [
        'NFS разработан для NAFLD; не применять при других этиологиях',
        'У возраста > 65 рекомендуют сдвинуть низкий cut-off до −0,12 (EASL 2021)',
        'Острый гепатит, кахексия (альбумин ↓ вне печёночной) искажают',
        '≈30 % пациентов попадают в неопределённую зону — требуют вторичного теста',
      ],
      scale: {
        segments: [
          { min: -5, max: -1.455, label: 'F0–F2', color: '#22C55E' },
          { min: -1.455, max: 0.676, label: 'Неопр.', color: '#F59E0B' },
          { min: 0.676, max: 5, label: 'F3–F4', color: '#EF4444' },
        ],
        current: Math.max(-5, Math.min(nfs, 5)),
        unit: 'NFS',
      },
      relatedCourses: [
        { id: '301.3', title: 'Гепатология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: 'fib4-lab', title: 'FIB-4' },
        { id: 'apri-hep', title: 'APRI' },
        { id: 'fibrotest', title: 'FibroTest' },
      ],
    };
  },
  reference: 'Angulo P et al. Hepatology 2007;45:846. AASLD 2023 MASLD Practice Guidance. EASL-EASD-EASO 2024.',
  countries: 'Международный (AASLD / EASL)',
  presets: [
    { label: 'Низкий риск', values: { age: 40, bmi: 26, ifg_dm: '0', ast: 30, alt: 35, plt: 260, albumin: 4.3 } },
    { label: 'Неопр. зона', values: { age: 55, bmi: 31, ifg_dm: '1', ast: 60, alt: 55, plt: 180, albumin: 4.0 } },
    { label: 'F3–F4', values: { age: 65, bmi: 34, ifg_dm: '1', ast: 90, alt: 65, plt: 120, albumin: 3.5 } },
  ],
  info: `### Для чего используется
**NAFLD Fibrosis Score (NFS)** — неинвазивный индекс распространённого фиброза (F3–F4) при MASLD/NAFLD. Совместно с FIB-4 — первая линия скрининга.

### Формула (Angulo 2007)
**NFS = −1,675 + 0,037·возраст + 0,094·ИМТ + 1,13·(НГН/СД: 1 если да, 0 если нет) + 0,99·(АСТ/АЛТ) − 0,013·тромбоциты − 0,66·альбумин**

Альбумин — г/дл, тромбоциты — ×10⁹/л.

### Cut-off
| NFS | Интерпретация | Точность |
|---|---|---|
| < −1,455 | F0–F2 (исключает распр. фиброз) | NPV 93 % |
| −1,455 до 0,676 | Неопределённая | — |
| > 0,676 | F3–F4 вероятен | PPV 90 % |

### Для возраста > 65 (EASL 2021)
Сдвинуть низкий cut-off до **−0,12** (специфичность восстанавливается).

### Алгоритм MASLD (AASLD 2023)
1. FIB-4 или NFS в первичном звене
2. Низкий → повтор через 2–3 года
3. Неопр. → FibroScan (LSM) или ELF
4. Высокий → гепатолог + эластометрия + скрининг ГЦК

### Сравнение NFS vs FIB-4
| Параметр | NFS | FIB-4 |
|---|---|---|
| Число переменных | 6 | 4 |
| Доп. данные | ИМТ, диабет, альбумин | — |
| Валидация NAFLD | Отличная | Отличная |
| Простота | Сложнее | Проще |

### Ограничения
- ≈30 % пациентов попадают в неопределённую зону
- Разработан для NAFLD; другие этиологии (HCV, алкоголь) — использовать соответствующие шкалы
- Гипоальбуминемия вне печени (нефроз, мальабсорбция) → ложно-высокий
- У возраста > 65 — завышает`,
};

export default runner;
