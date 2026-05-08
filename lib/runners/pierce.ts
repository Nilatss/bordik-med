/** Runner: pierce - fullPIERS / miniPIERS (Payne 2011/2014) */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ga',
hint: 'Срок беременности (нед+дни)', label: 'Гестационный возраст (нед)', type: 'number', unit: 'нед', min: 20, max: 42, step: 1, quickValues: [28, 32, 34, 37] },
    {
      id: 'chest',
      label: 'Боль в груди или одышка',
      type: 'select',
      options: [
        { value: 'no', label: 'Нет' },
        { value: 'yes', label: 'Да' },
      ],
    },
    { id: 'spo2',
hint: 'SpO₂, %. Норма: ≥95% на воздухе', label: 'SpO₂ (%)', type: 'number', unit: '%', min: 70, max: 100, step: 1, quickValues: [92, 95, 98] },
    { id: 'plt',
hint: 'Тромбоциты. Норма: 150-400 ×10⁹/л', label: 'Тромбоциты (×10⁹/л)', type: 'number', unit: '×10⁹/л', min: 1, max: 500, step: 1, quickValues: [80, 120, 200] },
    { id: 'cr',
hint: 'Креатинин сыворотки, мкмоль/л', label: 'Креатинин (мкмоль/л)', type: 'number', unit: 'мкмоль/л', min: 30, max: 500, step: 1, quickValues: [60, 90, 130] },
    { id: 'ast',
hint: 'АСТ. Норма: М <40, Ж <32 Ед/л', label: 'АСТ (Ед/л)', type: 'number', unit: 'Ед/л', min: 5, max: 2000, step: 1, quickValues: [30, 70, 150] },
  ],
  compute: (v) => {
    const ga = Number(v.ga);
    const chest = v.chest === 'yes' ? 1 : 0;
    const spo2 = Number(v.spo2);
    const plt = Number(v.plt);
    const cr = Number(v.cr);
    const ast = Number(v.ast);
    // fullPIERS simplified logistic model (Payne BA 2011, PLoS Med 8:e1001013)
    // logit(p) = 2.68 − 5.41·(log10[GA]) + 1.23·chestDyspnea − 2.71·log10[SpO2·100] − 0.01·Plt + 2.66·log10[Cr] + 0.20·log10[AST]
    const logit =
      2.68 -
      5.41 * Math.log10(ga) +
      1.23 * chest -
      2.71 * Math.log10(spo2) +
      -0.01 * plt +
      2.66 * Math.log10(cr) +
      0.2 * Math.log10(Math.max(ast, 5));
    const p = 1 / (1 + Math.exp(-logit));
    const pct = (p * 100).toFixed(1);
    let risk = '';
    let color = '';
    if (p >= 0.3) {
      risk = 'Высокий (≥ 30%)';
      color = '#DC2626';
    } else if (p >= 0.1) {
      risk = 'Умеренный (10-30%)';
      color = '#F59E0B';
    } else if (p >= 0.025) {
      risk = 'Низкий (2.5-10%)';
      color = '#FDE047';
    } else {
      risk = 'Очень низкий (< 2.5%)';
      color = '#22C55E';
    }
    return {
      value: `${pct}%`,
      unit: '',
      interpretation: `Вероятность тяжёлого исхода в 48 ч: ${risk}`,
      color,
      details:
        'fullPIERS (Payne 2011) прогнозирует риск тяжёлых материнских исходов (эклампсия, инсульт, ОПН, HELLP, смерть) в течение 48 ч после госпитализации по поводу преэклампсии. AUC ≈ 0.88.',
      actions: [
        'Высокий риск → перевод в перинатальный центр III уровня, MgSO₄, готовность к родоразрешению',
        'Умеренный риск → госпитализация, интенсивный мониторинг, кортикостероиды при < 34 нед',
        'Низкий риск → стационарное наблюдение, повторная оценка',
      ],
      caveats: [
        'Калькулятор не заменяет клиническую оценку',
        'miniPIERS (Payne 2014) - для низкоресурсных условий (без лаборатории): АД, ГВ, головная боль/визуальные симптомы, эпигастральная боль, тошнота/рвота, протеинурия',
        'Валидирован в >2000 пациенток; эффективен при ГВ 20-40 нед',
      ],
      related: [
        { id: 'acog-preeclampsia', title: 'Преэклампсия' },
        { id: 'hellp', title: 'HELLP' },
        { id: 'sflt', title: 'sFlt-1/PlGF' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '300.4', title: 'Интенсивная терапия' },
      ],
    };
  },
  reference:
    'Payne BA et al., fullPIERS - PLoS Med 2011;8:e1001013. miniPIERS - PLoS Med 2014;11:e1001589.',
  countries: 'Международный',
  presets: [
    { label: 'Высокий риск', values: { ga: 30, chest: 'yes', spo2: 92, plt: 60, cr: 130, ast: 200 } },
    { label: 'Умеренный', values: { ga: 33, chest: 'no', spo2: 97, plt: 150, cr: 80, ast: 60 } },
    { label: 'Низкий', values: { ga: 37, chest: 'no', spo2: 99, plt: 220, cr: 60, ast: 25 } },
  ],
  caveats: [
    'Только для подтверждённой преэклампсии',
    'Горизонт прогноза - 48 ч',
  ],
  related: [
    { id: 'acog-preeclampsia', title: 'Преэклампсия' },
    { id: 'hellp', title: 'HELLP' },
    { id: 'sflt', title: 'sFlt-1/PlGF' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '300.4', title: 'Интенсивная терапия' },
  ],
  info: `### fullPIERS
**fullPIERS (Pre-eclampsia Integrated Estimate of RiSk)** - валидированная логистическая модель для прогноза тяжёлых материнских исходов в 48 ч после госпитализации с преэклампсией.

### Переменные
- ГВ при поступлении
- Боль в груди или одышка
- SpO₂
- Тромбоциты
- Креатинин
- АСТ

### miniPIERS (2014)
Для условий без лаборатории - 6 клинических переменных.

### Источники
Payne BA et al. PLoS Med 2011;8:e1001013; 2014;11:e1001589.`,
};

export default runner;
