// @ts-nocheck
/** Runner: henderson-lab - Henderson-Hasselbalch lab-centric view */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ph', label: 'pH', type: 'number', unit: '', min: 6.8, max: 7.8, step: 0.01, quickValues: [7.2, 7.35, 7.4, 7.45, 7.55] },
    { id: 'pco2', label: 'PaCO₂', type: 'number', unit: 'мм рт.ст.', min: 10, max: 120, step: 1, quickValues: [25, 40, 50, 70] },
    { id: 'hco3', label: 'HCO₃⁻', type: 'number', unit: 'ммоль/л', min: 3, max: 50, step: 0.1, quickValues: [12, 18, 24, 30, 35] },
    { id: 'na', label: 'Na', type: 'number', unit: 'ммоль/л', min: 100, max: 180, step: 1, quickValues: [135, 140, 145] },
    { id: 'cl', label: 'Cl', type: 'number', unit: 'ммоль/л', min: 60, max: 140, step: 1, quickValues: [100, 105, 110] },
  ],
  compute: (v) => {
    const ph = Number(v.ph);
    const pco2 = Number(v.pco2);
    const hco3 = Number(v.hco3);
    const na = Number(v.na);
    const cl = Number(v.cl);

    // AG (with HCO3): Na - (Cl + HCO3), norm 8-12
    const ag = na - (cl + hco3);

    // Henderson-Hasselbalch sanity check: pH = 6.1 + log10(HCO3 / 0.03 × PaCO2)
    const calcPh = 6.1 + Math.log10(hco3 / (0.03 * pco2));
    const phDiff = Math.abs(ph - calcPh);

    // Classify disturbance
    let primary = '', compensation = '', band = '', color = '#22C55E';

    if (ph < 7.35) {
      // Acidemia
      if (hco3 < 22) {
        primary = 'Метаб. ацидоз';
        // Winter formula: expected PaCO2 = 1.5 × HCO3 + 8 ± 2
        const expPco2 = 1.5 * hco3 + 8;
        const compOk = Math.abs(pco2 - expPco2) <= 2;
        compensation = compOk ? 'компенсирован' : pco2 > expPco2 + 2 ? '+ респ. ацидоз' : '+ респ. алкалоз';
        color = '#EF4444';
      } else if (pco2 > 45) {
        primary = 'Респ. ацидоз';
        // Expected HCO3 rise: acute 1/10, chronic 3.5/10
        const expHco3Acute = 24 + (pco2 - 40) * 0.1;
        const expHco3Chronic = 24 + (pco2 - 40) * 0.35;
        compensation = hco3 < expHco3Acute ? 'острый' : hco3 > expHco3Chronic ? 'хронич. + метаб.' : 'хронич./остр.';
        color = '#EF4444';
      }
      band = `${primary} ${compensation}`;
    } else if (ph > 7.45) {
      // Alkalemia
      if (hco3 > 26) {
        primary = 'Метаб. алкалоз';
        const expPco2 = 0.7 * hco3 + 20;
        compensation = Math.abs(pco2 - expPco2) <= 2 ? 'компенс.' : '+ неполн. компенс.';
        color = '#F59E0B';
      } else if (pco2 < 35) {
        primary = 'Респ. алкалоз';
        const expHco3Acute = 24 - (40 - pco2) * 0.2;
        const expHco3Chronic = 24 - (40 - pco2) * 0.5;
        compensation = hco3 > expHco3Acute ? 'острый' : hco3 < expHco3Chronic ? 'хронич. + метаб.' : 'хронич./остр.';
        color = '#F59E0B';
      }
      band = `${primary} ${compensation}`;
    } else {
      band = 'pH в норме (компенсация возможна)';
      color = '#22C55E';
    }

    const agInterp = ag > 12 ? ' Повышенный AG (>12): уремия, ДКА, лактат, токсины (MUDPILES).' : ag < 8 ? ' Низкий AG (<8): миелома, гипоальбуминемия.' : ' AG в норме.';

    return {
      value: ag.toFixed(1), unit: 'AG (ммоль/л)',
      interpretation: band, color,
      details: `pH ${ph}, PaCO₂ ${pco2}, HCO₃⁻ ${hco3}, AG ${ag.toFixed(1)}.${agInterp} Проверка H-H: рассчитанный pH ${calcPh.toFixed(2)} (∆ ${phDiff.toFixed(2)} от измеренного).`,
      actions: [
        'Формула Henderson-Hasselbalch: pH = 6.1 + log10(HCO₃ / 0.03 × PaCO₂)',
        'Правило Winter (метаб. ацидоз): ожидаемый PaCO₂ = 1.5 × HCO₃ + 8 ± 2',
        'Метаб. алкалоз: ожидаемый PaCO₂ = 0.7 × HCO₃ + 20',
        'Респ. ацидоз острый: ∆HCO₃ = 0.1 × ∆PaCO₂; хронич.: ∆HCO₃ = 0.35 × ∆PaCO₂',
        phDiff > 0.1 ? '⚠ Разница между измеренным и расчётным pH > 0.1 - возможна лаб. ошибка' : '',
      ].filter(Boolean),
      caveats: [
        'Anion Gap требует коррекции на альбумин: AG + 2.5 × (4 - альбумин г/дл)',
        'При смешанных нарушениях - использовать ∆/∆ ratio (∆AG / ∆HCO₃ = 1 для чистого HAGMA)',
        'Kassirer-Bleich: базовый алгоритм 4 шага - pH → primary → compensation → AG',
        'Стюарт-подход (SID, ATOT) - альтернатива для критически больных',
      ],
      scale: {
        segments: [
          { min: 0, max: 8, label: '<8 низкий', color: '#84CC16' },
          { min: 8, max: 12, label: '8-12 норма', color: '#22C55E' },
          { min: 12, max: 20, label: '12-20 повыш.', color: '#F59E0B' },
          { min: 20, max: 40, label: '>20 высокий', color: '#EF4444' },
        ],
        current: ag,
        unit: 'AG',
      },
      related: [
        { id: 'anion-gap', title: 'Anion Gap' },
        { id: 'winter', title: 'Winter formula' },
        { id: 'osm-gap', title: 'Osmolar gap' },
      ],
      relatedCourses: [
        { id: '304.2', title: 'КЩС' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Kassirer JP, Bleich HL. N Engl J Med 1966;275:1067. Arbus GS. Med Clin North Am 1970;54:1261.',
  countries: 'Международный',
  presets: [
    { label: 'Норма', values: { ph: 7.4, pco2: 40, hco3: 24, na: 140, cl: 103 } },
    { label: 'ДКА (HAGMA)', values: { ph: 7.15, pco2: 22, hco3: 8, na: 135, cl: 95 } },
    { label: 'Респ. ацидоз', values: { ph: 7.28, pco2: 65, hco3: 28, na: 140, cl: 100 } },
  ],
  info: `### Для чего используется
Полный анализ КЩС: определение первичного нарушения, компенсации, AG - через уравнение Henderson-Hasselbalch.

### Формулы
**Henderson-Hasselbalch:**
pH = 6.1 + log₁₀(HCO₃⁻ / 0.03 × PaCO₂)

**Anion Gap:**
AG = Na - (Cl + HCO₃⁻) (норма 8-12, с K: 12-16)

**Правило Winter** (метаб. ацидоз):
Ожидаемый PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2

### Дифф. AG
**HAGMA (high AG):** MUDPILES
- **M**ethanol
- **U**remia
- **D**KA / alcoholic KA / starvation
- **P**ropylene glycol / paraldehyde
- **I**NH / iron
- **L**actate
- **E**thylene glycol
- **S**alicylates

**NAGMA (normal AG):** FUSEDCARS
- **F**istula (pancreatic)
- **U**reteral diversion
- **S**aline (NaCl 0.9 % большие объёмы)
- **E**ndocrine (Addison)
- **D**iarrhea
- **C**AI (acetazolamide)
- **A**rginine / ammonium
- **R**TA (I, II, IV)
- **S**pironolactone`,
};

export default runner;
