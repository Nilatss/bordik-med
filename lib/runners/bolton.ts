/** Runner: bolton — Bolton tooth-size analysis (anterior + overall ratio) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Bolton WA, Am J Orthod, 1958/1962)',
  reference: 'Bolton WA. Disharmony in tooth size and its relation to the analysis and treatment of malocclusion. Angle Orthod. 1958;28(3):113-30.',
  inputs: [
    { id: 'mandAnt', label: 'Сумма MD ширин 6 ниж. резцов-клыков (мм)', type: 'number', min: 20, max: 60, step: 0.1 },
    { id: 'maxAnt', label: 'Сумма MD ширин 6 верх. резцов-клыков (мм)', type: 'number', min: 20, max: 60, step: 0.1 },
    { id: 'mandAll', label: 'Сумма MD 12 нижних (до 1-го моляра) (мм) — опц.', type: 'number', min: 0, max: 120, step: 0.1 },
    { id: 'maxAll', label: 'Сумма MD 12 верхних (до 1-го моляра) (мм) — опц.', type: 'number', min: 0, max: 120, step: 0.1 },
  ],
  presets: [
    { label: 'Норма anterior 77.2', values: { mandAnt: 33.5, maxAnt: 43.4, mandAll: 0, maxAll: 0 } },
    { label: 'Избыток ниж. (80%)', values: { mandAnt: 35, maxAnt: 43.8, mandAll: 0, maxAll: 0 } },
    { label: 'Полный overall 91.3', values: { mandAnt: 33.5, maxAnt: 43.4, mandAll: 91.3, maxAll: 100 } },
  ],
  compute: (v) => {
    const ma = Number(v.mandAnt || 0), xa = Number(v.maxAnt || 0);
    const mAll = Number(v.mandAll || 0), xAll = Number(v.maxAll || 0);
    const antRatio = xa > 0 ? (ma / xa) * 100 : 0;
    const overallRatio = xAll > 0 ? (mAll / xAll) * 100 : 0;
    const antNorm = 77.2, antSD = 1.65;
    const overallNorm = 91.3, overallSD = 1.91;
    const antDev = antRatio - antNorm;
    const overallDev = overallRatio - overallNorm;
    let label = 'В пределах нормы', color = '#22C55E';
    if (Math.abs(antDev) > 2 * antSD) { label = 'Значимая диспропорция anterior'; color = '#EF4444'; }
    else if (Math.abs(antDev) > antSD) { label = 'Пограничная диспропорция'; color = '#F59E0B'; }
    const tooth = antDev > 0 ? 'избыток нижних резцов' : 'избыток верхних резцов';
    return {
      value: antRatio.toFixed(1),
      unit: '%',
      color,
      interpretation: `Anterior Bolton ${antRatio.toFixed(1)}% — ${label}`,
      details: `Anterior ratio (сумма 6 ниж / 6 верх × 100) = ${antRatio.toFixed(1)}%\n  Норма: 77.2 ± 1.65%\n  Отклонение: ${antDev >= 0 ? '+' : ''}${antDev.toFixed(1)}% (${Math.abs(antDev) > antSD ? tooth : '—'})\n\n${overallRatio > 0 ? `**Overall ratio** (12/12) = ${overallRatio.toFixed(1)}%\n  Норма: **91.3 ± 1.91%**\n  Отклонение: ${overallDev >= 0 ? '+' : ''}${overallDev.toFixed(1)}%\n` : ''}`,
      actions: [
        'Anterior ratio >77.2 + 2SD → избыток нижних резцов (мб придётся stripping верх)',
        'Anterior ratio <77.2 − 2SD → избыток верхних → ipr, Bolton table',
        'Overall ratio используется для планирования premolar extraction',
        'Применять при планировании ортодонт. лечения + перед протезированием',
      ],
      caveats: [
        'Измерения мезиодистальные, требуют точного gauge / digital model',
        'Погрешность стирания/кариеса/реставраций искажает результат',
        'Bolton SD 1.65/1.91 — от его оригинальной выборки (US)',
        'Для азиатских/африканских популяций нормы могут смещаться',
      ],
      scale: {
        segments: [
          { min: 70, max: 75.5, label: 'Верх избыт', color: '#EF4444' },
          { min: 75.5, max: 78.9, label: 'Норма', color: '#22C55E' },
          { min: 78.9, max: 85, label: 'Ниж избыт', color: '#EF4444' },
        ],
        value: antRatio,
      },
      related: [
        { id: 'angle', title: 'Angle class' },
        { id: 'abo-ce', title: 'ABO CR-Eval' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**Bolton Analysis** (1958) — анализ размерной гармонии зубов, ключевой инструмент ортодонта для предсказания возможности корректного interdigitation.

### Формулы
**Anterior ratio** = Σ(6 нижних передних MD) / Σ(6 верхних передних MD) × 100
- Норма: **77.2% ± 1.65%**

**Overall ratio** = Σ(12 нижних MD до 1-го моляра) / Σ(12 верхних) × 100
- Норма: **91.3% ± 1.91%**

### Интерпретация отклонений
| Отклонение | Значение |
|---|---|
| >+2SD | Избыток нижних (mandibular tooth excess) |
| <−2SD | Избыток верхних (maxillary tooth excess) |

### Клиническое применение
- Планирование extraction / stripping (IPR)
- Предоперационная оценка для finishing occlusion
- Перед протезированием (размер виниров/коронок)

### Источник
Bolton WA. Angle Orthod 1958;28(3):113-30.`,
};
export default runner;
