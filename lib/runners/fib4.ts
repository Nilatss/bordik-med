// @ts-nocheck
/**
 * Runner: fib4 — FIB-4 / APRI / NAFLD FS / FibroTest / FibroScan composite
 *
 * P1-CR-10 — Formula source attribution:
 *   FIB-4:      Sterling RK, Lissen E, Clumeck N, et al. Development of
 *               a simple noninvasive index to predict significant
 *               fibrosis in patients with HIV/HCV coinfection. Hepatology.
 *               2006;43(6):1317-1325. doi:10.1002/hep.21178
 *   APRI:       Wai CT, Greenson JK, Fontana RJ, et al. A simple
 *               noninvasive index can predict both significant fibrosis
 *               and cirrhosis in patients with chronic hepatitis C.
 *               Hepatology. 2003;38(2):518-526. doi:10.1053/jhep.2003.50346
 *   NAFLD FS:   Angulo P, Hui JM, Marchesini G, et al. The NAFLD fibrosis
 *               score: a noninvasive system that identifies liver fibrosis
 *               in patients with NAFLD. Hepatology. 2007;45(4):846-854.
 *               doi:10.1002/hep.21496
 *   GUIDELINE:  AASLD 2023 NAFLD/NASH Guidance + EASL 2024 — FIB-4 как
 *               primary screen в primary care; APRI как cheap alternative
 *               (uses ALT instead of AST). FibroScan для confirmation.
 *
 * Formulas:
 *   FIB-4 = (Age × AST) / (Platelets × √ALT)
 *     где Age в годах, AST/ALT в IU/L, Platelets в ×10⁹/L
 *
 *   APRI = (AST / AST_upper_normal) × 100 / Platelets (×10⁹/L)
 *
 *   NAFLD FS = -1.675 + 0.037×age + 0.094×BMI + 1.13×IFG/diabetes
 *              + 0.99×AST/ALT - 0.013×platelets - 0.66×albumin
 *
 * FIB-4 cut-offs (AASLD 2023):
 *   <1.30  → low risk advanced fibrosis (NPV >90%) — primary care follow-up
 *   1.30-2.67 → indeterminate — refer to hepatology / FibroScan
 *   ≥2.67  → high risk advanced fibrosis — hepatology, biopsy consideration
 *
 * APRI cut-offs:
 *   <0.5   → unlikely fibrosis
 *   0.5-1  → indeterminate
 *   ≥1     → likely fibrosis
 *   ≥2     → likely cirrhosis
 *
 * Caveats:
 *   - FIB-4 inaccurate в age <35 (over-diagnoses) и age >65 (over-diagnoses).
 *     В age extremes use FibroScan / Enhanced Liver Fibrosis (ELF) test.
 *   - Не для acute hepatitis (transaminitis confounds)
 *
 * Tool implementation here: composite (3 algorithms select'able).
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tool',
      label: 'Метод',
      type: 'select',
      options: [
        { value: 'fib4', label: 'FIB-4 - (age × AST) / (Plt × √ALT)' },
        { value: 'apri', label: 'APRI - (AST/ULN × 100) / Plt' },
        { value: 'nfs', label: 'NAFLD Fibrosis Score (описательно)' },
      ],
    },
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст (лет)', type: 'number', min: 18, max: 100, step: 1, quickValues: [35, 50, 65] },
    { id: 'ast',
hint: 'АСТ. Норма: М <40, Ж <32 Ед/л', label: 'AST (U/L)', type: 'number', min: 5, max: 500, step: 1, quickValues: [20, 40, 80, 150] },
    { id: 'alt',
hint: 'АЛТ. Норма: М <40, Ж <32 Ед/л', label: 'ALT (U/L)', type: 'number', min: 5, max: 500, step: 1, quickValues: [25, 45, 90] },
    { id: 'plt',
hint: 'Тромбоциты. Норма: 150-400 ×10⁹/л', label: 'Тромбоциты (×10⁹/л)', type: 'number', min: 20, max: 500, step: 1, quickValues: [100, 150, 250] },
    { id: 'astUln', label: 'AST ULN (для APRI, обычно 40)', type: 'number', min: 20, max: 60, step: 1, quickValues: [35, 40, 45] },
  ],
  compute: (v) => {
    const tool = String(v.tool);
    const age = Number(v.age), ast = Number(v.ast), alt = Number(v.alt), plt = Number(v.plt);
    const uln = Number(v.astUln) || 40;

    if (tool === 'fib4') {
      const fib4 = (age * ast) / (plt * Math.sqrt(alt));
      let interp = '', color = '#22C55E', details = '';
      if (fib4 < 1.3) { interp = 'Низкий риск фиброза F3-F4 (NPV 90%) - rule-out advanced fibrosis'; color = '#22C55E'; }
      else if (fib4 <= 2.67) { interp = 'Неопределённая зона - нужна FibroScan / биопсия'; color = '#F59E0B'; }
      else { interp = fib4 > 3.25 ? 'Высокая вероятность F3-F4 (PPV 65%) - направить к гепатологу' : 'Промежуточная-высокая зона'; color = '#EF4444'; }
      details = `FIB-4 (Sterling 2006) = (${age} × ${ast}) / (${plt} × √${alt}) = ${fib4.toFixed(2)}. Разработан для HIV/HCV, валидирован для NAFLD/MASLD, алкогольной болезни, HBV. Cut-off > 2 у пациентов ≥ 65 лет (избежать false-positive).`;
      return {
        value: fib4.toFixed(2),
        unit: '',
        interpretation: interp,
        color,
        details,
        actions: [
          'FIB-4 < 1,3: повторить через 2-3 года при NAFLD',
          'FIB-4 1,3-2,67: FibroScan (TE) или MR-эластография',
          'FIB-4 > 2,67: гепатолог, УЗИ/ЭГДС при циррозе, HCC скрининг каждые 6 мес',
          'Non-invasive panel: FIB-4 → FibroScan → при несоответствии биопсия',
        ],
        caveats: [
          'FIB-4 > 2 у ≥ 65 лет - новый порог (AASLD 2023)',
          'AST/ALT повышены при остром гепатите - FIB-4 переоценивает фиброз',
          'Циррозные: тромбоциты могут быть норма в компенсации',
          'NAFLD → MASLD (новое наименование AASLD 2023)',
        ],
        related: [
          { id: 'meld', title: 'MELD' },
          { id: 'child-meld', title: 'Child-Pugh / MELD' },
          { id: 'maddrey', title: 'Maddrey (алк. гепатит)' },
        ],
        relatedCourses: [
          { id: '301.5', title: 'Гастроэнтерология' },
        ],
      };
    }
    if (tool === 'apri') {
      const apri = ((ast / uln) * 100) / plt;
      let interp = '', color = '#22C55E';
      if (apri < 0.5) { interp = 'F0-F1 (нет/минимальный фиброз, NPV ~ 90%)'; color = '#22C55E'; }
      else if (apri <= 1.5) { interp = 'Промежуточная зона'; color = '#F59E0B'; }
      else { interp = apri > 2 ? 'F4 цирроз (PPV 65-80%)' : 'F3-F4 (advanced fibrosis)'; color = '#EF4444'; }
      return {
        value: apri.toFixed(2),
        unit: '',
        interpretation: interp,
        color,
        details: `APRI (Wai 2003) = (AST ${ast} / ULN ${uln} × 100) / Plt ${plt} = ${apri.toFixed(2)}. WHO 2015 для HBV: APRI > 2 → цирроз.`,
        actions: [
          'APRI < 0,5: исключить advanced fibrosis при HCV',
          'APRI > 1,5: FibroScan или биопсия',
          'APRI > 2: цирроз вероятен, HCC скрининг',
        ],
        caveats: [
          'APRI менее точен, чем FIB-4 для промежуточной зоны',
          'WHO HBV guideline: APRI > 2 + ALT норма = treat',
          'Не применим при остром гепатите (AST транзиторно высок)',
        ],
        related: [
          { id: 'meld', title: 'MELD' },
          { id: 'child-meld', title: 'Child-Pugh' },
        ],
        relatedCourses: [
          { id: '301.5', title: 'Гастроэнтерология' },
        ],
      };
    }
    return {
      value: 'NAFLD FS',
      unit: '',
      interpretation: 'NAFLD Fibrosis Score (Angulo 2007) - 6 параметров: age, BMI, IFG/DM, AST/ALT, platelets, albumin. < -1,455 rule-out advanced fibrosis; > 0,676 rule-in.',
      color: '#3B82F6',
      details: 'Формула: NFS = −1,675 + 0,037 × age + 0,094 × BMI + 1,13 × (IFG/DM) + 0,99 × (AST/ALT) − 0,013 × Plt − 0,66 × albumin.',
      actions: [
        'Шаг 1 - FIB-4 или NFS (бесплатно, прикроватно)',
        'Шаг 2 - FibroScan (TE) при промежуточной зоне',
        'Шаг 3 - MRE или биопсия при несоответствии / клинической важности',
      ],
      caveats: [
        'FibroScan (TE, Echosens): < 8 kPa - F0-F2, > 12 kPa - цирроз вероятен',
        'FibroTest (BioPredictive, Франция) - α2-макроглобулин, apoA1, GGT, haptoglobin, bilirubin, ALT',
        'MR-эластография - наиболее точна, но дорого/недоступно',
        'AASLD 2023: переход от NAFLD к MASLD (metabolic dysfunction-associated)',
      ],
      related: [
        { id: 'meld', title: 'MELD' },
        { id: 'child-meld', title: 'Child-Pugh' },
        { id: 'maddrey', title: 'Maddrey DF' },
      ],
      relatedCourses: [
        { id: '301.5', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Sterling RK et al. Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection. Hepatology 2006;43:1317 (FIB-4). Wai CT et al. A simple noninvasive index can predict both significant fibrosis and cirrhosis in patients with chronic hepatitis C. Hepatology 2003;38:518 (APRI). Angulo P et al. The NAFLD fibrosis score. Hepatology 2007;45:846.',
  countries: 'Международный (AASLD 2023, EASL 2021, WHO)',
  presets: [
    { label: 'FIB-4 низкий', values: { tool: 'fib4', age: 45, ast: 25, alt: 30, plt: 220, astUln: 40 } },
    { label: 'FIB-4 высокий', values: { tool: 'fib4', age: 65, ast: 80, alt: 60, plt: 110, astUln: 40 } },
    { label: 'APRI цирроз', values: { tool: 'apri', age: 55, ast: 120, alt: 90, plt: 90, astUln: 40 } },
    { label: 'NAFLD FS описание', values: { tool: 'nfs', age: 55, ast: 50, alt: 70, plt: 180, astUln: 40 } },
  ],
  info: `### Для чего используется
Неинвазивные маркеры фиброза печени. Первая линия скрининга при NAFLD/MASLD, HCV, HBV, алкогольной болезни.

### FIB-4 (Sterling 2006)
\`FIB-4 = (Age × AST) / (Plt × √ALT)\`

| FIB-4 | Интерпретация |
|---|---|
| < 1,3 | Low risk advanced fibrosis (NPV 90%) |
| 1,3-2,67 | Grey zone - FibroScan |
| > 2,67 | High probability F3-F4 |
| > 3,25 | Very high |

**AASLD 2023**: у пациентов ≥ 65 лет пороги повышаются (FIB-4 > 2 для rule-in).

### APRI (Wai 2003)
\`APRI = (AST / ULN × 100) / Plt\`

| APRI | Интерпретация |
|---|---|
| < 0,5 | F0-F1 |
| 0,5-1,5 | Промежуточная |
| > 1,5 | F3-F4 |
| > 2 | Цирроз |

**WHO HBV 2015**: APRI > 2 - начало терапии при нормальной ALT.

### NAFLD Fibrosis Score (Angulo 2007)
6 параметров: age, BMI, IFG/DM, AST/ALT, Plt, albumin.
\`NFS < −1,455\` - rule-out; \`> 0,676\` - rule-in advanced fibrosis.

### FibroTest (BioPredictive)
α2-macroglobulin, apoA1, GGT, haptoglobin, bilirubin, ALT - коммерческий тест (Франция). Валидирован для HCV, HBV, NAFLD.

### FibroScan (Transient Elastography)
Ультразвуковая эластография (Echosens). Измеряет stiffness в kPa.

| TE (kPa) | Stage |
|---|---|
| < 7,0 | F0-F1 |
| 7,0-9,5 | F2 |
| 9,5-12,5 | F3 |
| > 12,5 | F4 цирроз |

### MR-elastography
Самый точный неинвазивный метод, AUROC > 0,95 для F3-F4.

### Алгоритм (AASLD 2023)
1. **Скрининг**: FIB-4 (каждые 2-3 года при метаболическом синдроме/T2DM)
2. **Low risk** (< 1,3): наблюдение, lifestyle
3. **Indeterminate/High** (≥ 1,3): FibroScan или ELF
4. **Confirmed advanced**: гепатолог, HCC скрининг, эндоскопия при циррозе

### Источники
Sterling RK et al. *Hepatology* 2006;43:1317. Wai CT et al. *Hepatology* 2003;38:518. Angulo P et al. *Hepatology* 2007;45:846. Rinella ME et al. MASLD nomenclature. *Hepatology* 2023.
`,
};

export default runner;
