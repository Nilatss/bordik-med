// @ts-nocheck
/**
 * Runner: ranson — Ranson Criteria / Glasgow-Imrie / HAPS for Acute Pancreatitis
 *
 * P1-CR-10 — Formula source attribution:
 *   RANSON:     Ranson JH, Rifkind KM, Roses DF, Fink SD, Eng K, Spencer FC.
 *               Prognostic signs and the role of operative management in
 *               acute pancreatitis. Surg Gynecol Obstet. 1974;139(1):69-81.
 *               PMID: 4834279
 *   GLASGOW:    Imrie CW, Benjamin IS, Ferguson JC, et al. A single-centre
 *               double-blind trial of Trasylol therapy in primary acute
 *               pancreatitis. Br J Surg. 1978;65(5):337-341.
 *               doi:10.1002/bjs.1800650513
 *   HAPS:       Lankisch PG, Weber-Dany B, Hebel K, Maisonneuve P, Lowenfels AB.
 *               The harmless acute pancreatitis score: a clinical algorithm
 *               for rapid initial stratification of nonsevere disease.
 *               Clin Gastroenterol Hepatol. 2009;7(6):702-705.
 *               doi:10.1016/j.cgh.2009.02.020
 *   GUIDELINE:  AGA 2018 / ACG 2013 acute pancreatitis guidelines —
 *               рекомендуют BISAP / APACHE-II как modern alternatives;
 *               Ranson сохраняется для historical comparison.
 *
 * Three implementations в одном runner (selectable):
 *
 * 1) Ranson (gallstone OR non-gallstone):
 *    On admission (5):
 *      - Age >55 (>70 для gallstone)
 *      - WBC >16 ×10⁹/L (>18 для gallstone)
 *      - Glucose >11.1 mmol/L (>12.2 для gallstone)
 *      - LDH >350 IU/L (>400 для gallstone)
 *      - AST >250 IU/L (>250 для обоих)
 *    Within 48h (6):
 *      - Hct drop >10% (>10% для обоих)
 *      - BUN ↑ >5 mg/dL (>2 для gallstone)
 *      - Calcium <2 mmol/L (<2 для обоих)
 *      - Pa02 <60 mmHg (только non-gallstone)
 *      - Base deficit >4 (>5 для gallstone)
 *      - Fluid sequestration >6L (>4L gallstone)
 *
 *    Mortality:
 *      0-2 → 0-3%
 *      3-4 → 15%
 *      5-6 → 40%
 *      ≥7  → 100%
 *
 * 2) Glasgow-Imrie (8 criteria within 48h):
 *      - Age >55, WBC >15, Glucose >10, BUN >16,
 *      - PaO2 <60, Calcium <2, LDH >600, Albumin <32
 *    Mortality: ≥3 → severe pancreatitis
 *
 * 3) HAPS (admission, screening нежёлчного "harmless" course):
 *      - No rebound tenderness / guarding
 *      - Normal Hct (M <43, F <39.6)
 *      - Normal creatinine (<2 mg/dL)
 *    All 3 met → 98% PPV mild course, NO ICU needed
 *
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tool',
      label: 'Шкала',
      type: 'select',
      options: [
        { value: 'ranson', label: 'Ranson criteria (11 параметров: 5 при поступлении + 6 через 48 ч)' },
        { value: 'glasgow', label: 'Glasgow-Imrie (8 параметров в первые 48 ч)' },
        { value: 'haps', label: 'HAPS - Harmless Acute Pancreatitis Score (3 пункта)' },
      ],
    },
    {
      id: 'score',
      label: 'Итоговое число баллов',
      type: 'number',
      min: 0,
      max: 11,
      step: 1,
      quickValues: [0, 1, 2, 3, 4, 5, 6],
    },
  ],
  compute: (v) => {
    const tool = String(v.tool);
    const score = Number(v.score);
    let interpretation = '', color = '#22C55E', details = '';
    let actions: string[] = [];

    if (tool === 'ranson') {
      if (score <= 2) { interpretation = 'Лёгкий панкреатит (Ranson ≤ 2, mortality ~ 1%)'; color = '#22C55E'; }
      else if (score <= 4) { interpretation = 'Умеренный (Ranson 3-4, mortality ~ 15%)'; color = '#F59E0B'; }
      else if (score <= 6) { interpretation = 'Тяжёлый (Ranson 5-6, mortality ~ 40%)'; color = '#EF4444'; }
      else { interpretation = 'Критический (Ranson 7-11, mortality ~ 100%)'; color = '#991B1B'; }
      details = `Ranson (1974) - 5 критериев при поступлении: возраст > 55 (non-billiary) / > 70 (biliary), WBC > 16 ×10⁹/л (18 для biliary), glucose > 11 ммоль/л (200 мг/дл) (12,2 biliary), AST > 250 U/L, LDH > 350 U/L (400 biliary). 6 критериев через 48 ч: снижение Hct > 10%, рост BUN > 1,8 ммоль/л (5 мг/дл; 0,7 biliary), Ca < 2,0 ммоль/л (8 мг/дл), PaO₂ < 60 мм рт.ст., base deficit > 4 (5 biliary), секвестрация > 6 л (4 biliary). ≥ 3 - тяжёлый панкреатит.`;
      actions = [
        'Ресусцитация: кристаллоид Ringer lactate 5-10 мл/кг/ч первые 24 ч (цель UO 0,5 мл/кг/ч)',
        'Энтеральное питание в течение 24-72 ч (NG или NJ) при толерантности',
        'Антибиотики - НЕ рутинно (только при инфицированном некрозе, подтверждённом)',
        'ERCP срочный (< 24 ч) только при холангите или обструкции',
        'Визуализация КТ с контрастом через 72 ч - оценка некроза',
      ];
    } else if (tool === 'glasgow') {
      if (score <= 2) { interpretation = 'Лёгкий (Glasgow-Imrie < 3)'; color = '#22C55E'; }
      else { interpretation = 'Тяжёлый (Glasgow-Imrie ≥ 3)'; color = '#EF4444'; }
      details = 'Glasgow-Imrie (Blamey 1984, основан на Imrie 1978) - 8 критериев в первые 48 ч: возраст > 55, WBC > 15 ×10⁹/л, глюкоза > 10 ммоль/л, мочевина > 16 ммоль/л, PaO₂ < 60 мм рт.ст., Ca < 2,0 ммоль/л, альбумин < 32 г/л, LDH > 600 U/L. ≥ 3 - тяжёлый панкреатит.';
      actions = [
        'Эквивалент Ranson ≥ 3 по смыслу',
        'ICU при ≥ 3 + органной дисфункции',
        'Ресусцитация Ringer lactate',
        'Энтеральное питание раннее',
      ];
    } else if (tool === 'haps') {
      if (score === 0) { interpretation = 'Harmless - низкий риск (HAPS 0)'; color = '#22C55E'; }
      else { interpretation = 'Не harmless - стандартное ведение'; color = '#F59E0B'; }
      details = 'HAPS (Lankisch 2009) - 3 параметра: ОТСУТСТВИЕ rebound tenderness/guarding + нормальный Hct (≤ 43 ♂/39,6 ♀) + нормальный креатинин (< 176 μмоль/л). ВСЕ 3 = 0 баллов = harmless. Negative predictive value 98% для тяжёлого течения.';
      actions = [
        'HAPS 0 (harmless): терапия вне ICU, ранний выпис при толерантности диеты',
        'HAPS > 0: стандартная оценка тяжести (BISAP, Ranson, APACHE II)',
      ];
    }

    return {
      value: String(score),
      unit: 'баллов',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Ranson требует 48 ч для полной оценки - не применим при ранней стратификации',
        'Чувствительность Ranson ≈ 75%, специфичность ≈ 77% для тяжёлого панкреатита',
        'BISAP (5 параметров при поступлении) - современная альтернатива; проще, не хуже',
        'APACHE II ≥ 8 - используется в ICU, валидирован при панкреатите',
        'Atlanta 2012 classification - определяет тяжесть по организменной недостаточности (transient < 48 ч vs persistent) и локальным осложнениям',
        'CTSI (Balthazar) - радиологическая оценка некроза, дополняет клинические шкалы',
      ],
      related: [
        { id: 'bisap', title: 'BISAP' },
        { id: 'apache', title: 'APACHE II' },
        { id: 'sofa', title: 'SOFA' },
        { id: 'tokyo', title: 'Tokyo (холангит)' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.5', title: 'Гастроэнтерология' },
      ],
    };
  },
  reference: 'Ranson JH, Rifkind KM, Roses DF et al. Prognostic signs and the role of operative management in acute pancreatitis. Surg Gynecol Obstet 1974;139:69-81. Blamey SL, Imrie CW, O\'Neill J et al. Prognostic factors in acute pancreatitis. Gut 1984;25:1340-6. Lankisch PG, Weber-Dany B, Hebel K et al. The harmless acute pancreatitis score: a clinical algorithm for rapid initial stratification. Clin Gastroenterol Hepatol 2009;7:702-5.',
  countries: 'Международный',
  presets: [
    { label: 'Лёгкий Ranson 1', values: { tool: 'ranson', score: 1 } },
    { label: 'Тяжёлый Ranson 5', values: { tool: 'ranson', score: 5 } },
    { label: 'Glasgow-Imrie 3 (тяжёлый)', values: { tool: 'glasgow', score: 3 } },
    { label: 'HAPS 0 (harmless)', values: { tool: 'haps', score: 0 } },
  ],
  info: `### Для чего используется
Шкалы **стратификации тяжести острого панкреатита**. Применяются для принятия решения о ICU, мониторинге ресусцитации, прогнозе.

### Ranson criteria (1974)
**5 при поступлении** (non-biliary / biliary):
1. Возраст > 55 / > 70
2. WBC > 16 / > 18 ×10⁹/л
3. Glucose > 11 / > 12,2 ммоль/л
4. AST > 250 U/L (оба)
5. LDH > 350 / > 400 U/L

**6 через 48 ч**:
1. Hct снижение > 10%
2. BUN рост > 1,8 / > 0,7 ммоль/л
3. Ca < 2,0 ммоль/л
4. PaO₂ < 60 мм рт.ст.
5. Base deficit > 4 / > 5
6. Секвестрация жидкости > 6 / > 4 л

**Интерпретация**:
| Баллы | Mortality |
|---|---|
| 0-2 | ~ 1% |
| 3-4 | ~ 15% |
| 5-6 | ~ 40% |
| 7-11 | ~ 100% |

### Glasgow-Imrie (1978/1984)
**8 параметров в первые 48 ч** ("PANCREAS"):
- **P**aO₂ < 60
- **A**ge > 55
- **N**eutrophils (WBC > 15)
- **C**alcium < 2,0
- **R** renal - BUN > 16
- **E**nzymes - LDH > 600
- **A**lbumin < 32
- **S**ugar - glucose > 10

≥ 3 - тяжёлый панкреатит.

### BISAP (2008)
5 параметров при поступлении:
- **B**UN > 25 мг/дл
- **I**mpaired mental status
- **S**IRS
- **A**ge > 60
- **P**leural effusion

≥ 3 - тяжёлый (mortality ~ 20%). Проще Ranson, эквивалентная точность.

### APACHE II
В ICU, ≥ 8 - тяжёлый; чувствительнее в первые 24 ч.

### HAPS (2009)
**Harmless Acute Pancreatitis Score** - 3 параметра:
1. НЕТ rebound tenderness/guarding
2. Нормальный Hct (≤ 43 ♂/39,6 ♀)
3. Нормальный креатинин (< 176 μмоль/л)

**Все 3 = 0 баллов = "harmless"** - NPV 98% для тяжёлого течения. Подходит для ранней триажной оценки.

### CTSI (Balthazar)
Радиологическая оценка: отёк + жидкость (0-4) + некроз (0-6) = 0-10. > 6 - тяжёлый.

### Atlanta 2012
- **Mild**: без органной недостаточности и локальных осложнений
- **Moderately severe**: transient (< 48 ч) OF или локальные осложнения
- **Severe**: persistent OF (≥ 48 ч)

### Источники
Ranson JH et al. *Surg Gynecol Obstet* 1974;139:69. Blamey SL et al. *Gut* 1984;25:1340. Lankisch PG et al. *Clin Gastroenterol Hepatol* 2009;7:702. Banks PA et al. Atlanta classification revised. *Gut* 2013;62:102.
`,
};

export default runner;
