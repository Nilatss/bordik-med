// @ts-nocheck
/** Runner: aa-grad - Alveolar-arterial gradient (lab panel view) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'pao2', label: 'PaO₂', type: 'number', unit: 'мм рт.ст.', min: 20, max: 600, step: 1, quickValues: [50, 70, 90, 120] },
    { id: 'paco2', label: 'PaCO₂', type: 'number', unit: 'мм рт.ст.', min: 10, max: 120, step: 1, quickValues: [30, 40, 50, 60] },
    { id: 'fio2', label: 'FiO₂', type: 'number', unit: 'доля (0.21-1.0)', min: 0.21, max: 1.0, step: 0.01, quickValues: [0.21, 0.3, 0.5, 0.8, 1.0] },
    { id: 'patm', label: 'Атм. давление', type: 'number', unit: 'мм рт.ст.', min: 500, max: 800, step: 1, quickValues: [760] },
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 1, max: 110, step: 1, quickValues: [25, 50, 75] },
  ],
  compute: (v) => {
    const pao2 = Number(v.pao2);
    const paco2 = Number(v.paco2);
    const fio2 = Number(v.fio2);
    const patm = Number(v.patm);
    const age = Number(v.age);

    const ph2o = 47; // water vapor at 37°C
    const pAo2 = fio2 * (patm - ph2o) - paco2 / 0.8;
    const aaGrad = pAo2 - pao2;
    const expectedAaGrad = age / 4 + 4; // normal age-adjusted upper limit approx

    let band = '', color = '#22C55E', details = '';
    if (aaGrad <= expectedAaGrad) {
      band = 'Норма'; color = '#22C55E';
      details = `A-a градиент ${aaGrad.toFixed(1)} мм рт.ст. в норме (ожид. ≤ ${expectedAaGrad.toFixed(0)} для ${age} лет).`;
    } else if (aaGrad <= 20) {
      band = 'Слегка повышен'; color = '#84CC16';
      details = `A-a градиент ${aaGrad.toFixed(1)} незначительно повышен. Возможно раннее V/Q несоответствие.`;
    } else if (aaGrad <= 50) {
      band = 'Умеренно повышен'; color = '#F59E0B';
      details = `A-a градиент ${aaGrad.toFixed(1)} умеренно повышен. Дыхательная недостаточность с нарушением диффузии или V/Q.`;
    } else {
      band = 'Значительно повышен'; color = '#EF4444';
      details = `A-a градиент ${aaGrad.toFixed(1)} значительно повышен. Шунтирование или тяжёлая V/Q patho.`;
    }

    const causes = aaGrad > expectedAaGrad ? [
      'V/Q несоответствие: пневмония, ТЭЛА, ХОБЛ, астма',
      'Шунтирование: пневмония (alveolar collapse), ARDS, врождённые пороки сердца',
      'Нарушение диффузии: ИЛБ, фиброз, эмфизема',
      'Низкое вдыхаемое O₂ (высокогорье) - A-a в норме',
    ] : ['A-a в норме - гипоксемия связана с гиповентиляцией или низким FiO₂'];

    return {
      value: aaGrad.toFixed(1), unit: 'мм рт.ст. A-a',
      interpretation: band, color,
      details,
      actions: causes,
      caveats: [
        'Формула: PAO₂ = FiO₂ × (Patm - 47) - PaCO₂ / 0.8',
        'Age-adjusted upper limit: (возраст/4) + 4',
        'При FiO₂ > 0.6 формула ненадёжна (используйте P/F ratio или OI)',
        'Коэффициент дыхания R = 0.8 (стандарт)',
      ],
      scale: {
        segments: [
          { min: 0, max: expectedAaGrad, label: 'Норма', color: '#22C55E' },
          { min: expectedAaGrad, max: 20, label: 'Слегка ↑', color: '#84CC16' },
          { min: 20, max: 50, label: 'Умер. ↑', color: '#F59E0B' },
          { min: 50, max: 200, label: 'Знач. ↑', color: '#EF4444' },
        ],
        current: Math.min(aaGrad, 200),
        unit: 'мм рт.ст.',
      },
      related: [
        { id: 'aa-gradient', title: 'A-a gradient base' },
        { id: 'pf-ratio', title: 'P/F ratio' },
        { id: 'winter', title: 'Winter formula' },
      ],
      relatedCourses: [
        { id: '304.2', title: 'КЩС и газы' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Raoof S et al. Clin Chest Med 2019;40:285. ABG interpretation.',
  countries: 'Международный',
  presets: [
    { label: 'Норма (молодой, комн. воздух)', values: { pao2: 95, paco2: 40, fio2: 0.21, patm: 760, age: 25 } },
    { label: 'ТЭЛА', values: { pao2: 55, paco2: 30, fio2: 0.21, patm: 760, age: 60 } },
    { label: 'Пневмония тяж.', values: { pao2: 60, paco2: 40, fio2: 0.5, patm: 760, age: 55 } },
  ],
  info: `### Для чего используется
Дифференциация причин гипоксемии: V/Q несоответствие, шунтирование, диффузия vs гиповентиляция.

### Формулы
- **PAO₂** (альвеолярный) = FiO₂ × (Patm - PH₂O) - PaCO₂/R
- **A-a grad** = PAO₂ - PaO₂
- Стандартно R = 0.8, PH₂O = 47 мм рт.ст. при 37°C на уровне моря (Patm = 760)

### Age-adjusted норма
Upper limit = (возраст / 4) + 4 мм рт.ст.
Молодой (25 лет): ≤ 10; пожилой (75): ≤ 23.

### Дифф.диагноз
| A-a градиент | Возможные причины |
|---|---|
| Норма | Гиповентиляция (наркотики, нервно-мышечная), низкое FiO₂ (высокогорье) |
| Повышен | V/Q: пневмония, ТЭЛА, ХОБЛ, астма · Шунт: ARDS, ателектаз · Диффузия: ИЛБ |

### Источник
Raoof S, Mehrishi S, Prakash UB. Clin Chest Med 2019;40:285.`,
};

export default runner;
