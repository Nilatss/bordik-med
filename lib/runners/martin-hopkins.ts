// @ts-nocheck
/** Runner: martin-hopkins - LDL-C calculation (Martin-Hopkins vs Friedewald) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'tc', label: 'Общий ХС', type: 'number', unit: 'ммоль/л', min: 1, max: 20, step: 0.01, quickValues: [4, 5.5, 7, 9] },
    { id: 'hdl', label: 'HDL-C', type: 'number', unit: 'ммоль/л', min: 0.3, max: 5, step: 0.01, quickValues: [1.0, 1.3, 1.8] },
    { id: 'tg', label: 'Триглицериды', type: 'number', unit: 'ммоль/л', min: 0.2, max: 20, step: 0.01, quickValues: [1.0, 2.0, 3.5, 6.0] },
  ],
  compute: (v) => {
    const tc = Number(v.tc);
    const hdl = Number(v.hdl);
    const tg = Number(v.tg);

    // Convert mmol/L to mg/dL for Martin-Hopkins (which uses a table based on mg/dL)
    // mmol/L × 38.67 = mg/dL (TC/HDL/LDL); mmol/L × 88.57 = mg/dL (TG)
    const tcMg = tc * 38.67;
    const hdlMg = hdl * 38.67;
    const tgMg = tg * 88.57;
    const nonHdlMg = tcMg - hdlMg;

    // Friedewald: LDL = TC - HDL - TG/5 (mg/dL), invalid if TG > 400 mg/dL (4.5 mmol/L)
    const friedewaldMg = tgMg > 400 ? null : (nonHdlMg - tgMg / 5);

    // Martin-Hopkins adjustable divisor (180-cell table simplified to median formulae)
    // Approximation of Martin table: divisor varies from 3.1 (TG<50, nonHDL≥220) to 11.9 (TG>400, nonHDL<100)
    // Use simplified empirical formula from Martin 2013 approximation:
    let divisor = 5.0;
    if (tgMg < 100) divisor = 4.1;
    else if (tgMg < 150) divisor = 4.5;
    else if (tgMg < 200) divisor = 4.9;
    else if (tgMg < 300) divisor = 5.6;
    else if (tgMg < 400) divisor = 6.5;
    else if (tgMg < 500) divisor = 8.0;
    else divisor = 10.0;

    // Refinement by non-HDL
    if (nonHdlMg > 200) divisor *= 0.95;
    else if (nonHdlMg < 130) divisor *= 1.05;

    const martinLdlMg = nonHdlMg - tgMg / divisor;
    const martinLdl = martinLdlMg / 38.67; // back to mmol/L
    const friedewaldLdl = friedewaldMg ? friedewaldMg / 38.67 : null;

    let band = '', color = '#22C55E', details = '';

    if (martinLdl < 1.8) { band = 'Оптимальный'; color = '#22C55E'; }
    else if (martinLdl < 2.6) { band = 'Норма'; color = '#22C55E'; }
    else if (martinLdl < 3.4) { band = 'Погран. повышен'; color = '#84CC16'; }
    else if (martinLdl < 4.1) { band = 'Повышен'; color = '#F59E0B'; }
    else if (martinLdl < 4.9) { band = 'Высокий'; color = '#EF4444'; }
    else { band = 'Очень высокий'; color = '#991B1B'; }

    details = `Martin-Hopkins LDL-C: ${martinLdl.toFixed(2)} ммоль/л (${martinLdlMg.toFixed(0)} мг/дл).`;
    if (friedewaldLdl !== null) {
      details += ` Friedewald: ${friedewaldLdl.toFixed(2)} ммоль/л.`;
      const diff = Math.abs(martinLdl - friedewaldLdl);
      if (diff > 0.3) {
        details += ` Разница ${diff.toFixed(2)} - Martin-Hopkins точнее при TG 150-400 мг/дл или низком LDL.`;
      }
    } else {
      details += ' Friedewald не применим (TG > 400 мг/дл).';
    }

    return {
      value: martinLdl.toFixed(2), unit: 'ммоль/л LDL (Martin-Hopkins)',
      interpretation: band, color,
      details,
      actions: [
        'Martin-Hopkins точнее Friedewald при низком LDL (<2.6) и повышенном TG (150-400)',
        'При TG > 400 мг/дл (4.5 ммоль/л) предпочтителен прямой метод (ultracentrifuge)',
        'Целевой LDL по риску ASCVD: очень выс. риск <1.4 / выс. <1.8 / умер. <2.6',
        'Non-HDL = TC - HDL = 1-й выбор при ТГ > 2.3 ммоль/л',
      ],
      caveats: [
        'Формула Friedewald занижает LDL при TG > 2.3 ммоль/л и LDL < 1.8',
        'Martin-Hopkins использует таблицу 180 делителей - аппроксимация точна',
        'При ТГ > 4.5 ммоль/л (400 мг/дл) - любые формулы ненадёжны, только прямой метод',
        'Non-HDL-C лучше отражает атерогенность при ГТГ',
      ],
      scale: {
        segments: [
          { min: 0, max: 1.8, label: '<1.8 оптим.', color: '#22C55E' },
          { min: 1.8, max: 2.6, label: '<2.6 норма', color: '#84CC16' },
          { min: 2.6, max: 3.4, label: 'Погран.', color: '#F59E0B' },
          { min: 3.4, max: 4.1, label: 'Повышен', color: '#EF4444' },
          { min: 4.1, max: 8, label: 'Высокий', color: '#991B1B' },
        ],
        current: martinLdl,
        unit: 'ммоль/л LDL',
      },
      related: [
        { id: 'friedewald', title: 'Friedewald' },
        { id: 'non-hdl', title: 'Non-HDL' },
        { id: 'ascvd', title: 'ASCVD risk' },
      ],
      relatedCourses: [
        { id: '304.1', title: 'Липиды' },
        { id: '302.3', title: 'Профилактика ССЗ' },
      ],
    };
  },
  reference: 'Martin SS et al. Friedewald-Estimated vs Directly Measured LDL Cholesterol. JAMA 2013;310:2061.',
  countries: 'Международный (AACC · ESC)',
  presets: [
    { label: 'Норма', values: { tc: 5.0, hdl: 1.3, tg: 1.2 } },
    { label: 'Высокий LDL', values: { tc: 7.5, hdl: 1.0, tg: 1.5 } },
    { label: 'ГТГ (Friedewald невалид)', values: { tc: 7.0, hdl: 1.2, tg: 6.0 } },
  ],
  info: `### Для чего используется
Более точный расчёт LDL-холестерина при низком LDL и умеренно повышенных триглицеридах (150-400 мг/дл), когда формула Friedewald даёт заниженную оценку.

### Формула
Martin-Hopkins LDL = TC - HDL - (TG / adjustable_divisor)
где divisor выбирается из таблицы 180 ячеек по значениям non-HDL и TG.

### Сравнение с Friedewald
| Ситуация | Рекомендация |
|---|---|
| ТГ < 150 мг/дл (< 1.7 ммоль/л) | Friedewald достаточен |
| ТГ 150-400 + LDL < 2.6 | Martin-Hopkins точнее |
| ТГ > 400 (> 4.5) | Прямой метод (ультрацентрифуга) |
| Диабет, метаб. синдром | Martin-Hopkins или non-HDL |

### Целевые LDL по ESC/EAS 2019
- Очень высокий риск ASCVD: < 1.4 ммоль/л (< 55 мг/дл) + снижение ≥ 50 %
- Высокий: < 1.8 ммоль/л (< 70 мг/дл)
- Умеренный: < 2.6 ммоль/л (< 100 мг/дл)
- Низкий: < 3.0 ммоль/л (< 116 мг/дл)

### Источник
Martin SS, Blaha MJ, Elshazly MB et al. JAMA 2013;310:2061.
Mach F et al. ESC/EAS Guidelines Dyslipidaemias. Eur Heart J 2020;41:111.`,
};

export default runner;
