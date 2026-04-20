// @ts-nocheck
/** Runner: nmibc */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'count', label: 'Число опухолей', type: 'select', options: [
      { value: '0', label: '1 (0 / 0)', points: 0 },
      { value: '3', label: '2–7 (3 / 3)', points: 3 },
      { value: '6', label: '≥8 (6 / 3)', points: 6 },
    ] },
    { id: 'size', label: 'Размер ≥3 см', type: 'select', options: [
      { value: '0', label: '<3 см (0 / 0)', points: 0 },
      { value: '3', label: '≥3 см (3 / 3)', points: 3 },
    ] },
    { id: 'prior', label: 'Рецидив в анамнезе', type: 'select', options: [
      { value: '0', label: 'Первичный (0)', points: 0 },
      { value: '2', label: '≤1/год (2)', points: 2 },
      { value: '4', label: '>1/год (4)', points: 4 },
    ] },
    { id: 't', label: 'Стадия', type: 'select', options: [
      { value: '0', label: 'Ta (0 / 0)', points: 0 },
      { value: '4', label: 'T1 (4 / 4)', points: 4 },
    ] },
    { id: 'cis', label: 'Сопутствующий CIS', type: 'select', options: [
      { value: '0', label: 'Нет (0 / 0)', points: 0 },
      { value: '6', label: 'Есть (1 / 6)', points: 6 },
    ] },
    { id: 'grade', label: 'Степень (Grade)', type: 'select', options: [
      { value: '0', label: 'G1 (0 / 0)', points: 0 },
      { value: '1', label: 'G2 (1 / 0)', points: 1 },
      { value: '5', label: 'G3 (2 / 5)', points: 5 },
    ] },
  ],
  compute: (v) => {
    // EORTC: recurrence (0–17) + progression (0–23). Here we sum progression-oriented points as primary.
    const progTotal = Number(v.count) + Number(v.size) + Number(v.prior) + Number(v.t) + Number(v.cis) + Number(v.grade);
    // Recurrence simplified: derive from count, size, prior, T (approx)
    const countR = v.count === '0' ? 0 : (v.count === '3' ? 3 : 6);
    const recTotal = countR + Number(v.size) + Number(v.prior) + Number(v.t === '4' ? 1 : 0) + (v.cis === '6' ? 1 : 0) + (v.grade === '5' ? 2 : (v.grade === '1' ? 1 : 0));

    let risk = 'Низкий', color = '#22C55E';
    if (progTotal >= 14 || Number(v.t) === 4 || v.grade === '5' || v.cis === '6') {
      risk = 'Высокий'; color = '#EF4444';
    } else if (progTotal >= 7 || recTotal >= 10) {
      risk = 'Средний'; color = '#F59E0B';
    }
    if (progTotal >= 17) { risk = 'Оч. высокий'; color = '#991B1B'; }

    const details = `EORTC: рецидив ${recTotal}/17, прогрессия ${progTotal}/23. Группа риска: ${risk.toLowerCase()}.`;

    const actions = risk === 'Низкий'
      ? ['TURBT + однократная ранняя послеоперационная инстилляция митомицина/эпирубицина',
         'Цистоскопия через 3 мес, затем по протоколу EAU']
      : risk === 'Средний'
        ? ['TURBT + ре-TURBT при T1',
           'Адъювант BCG 1 год (индукция + поддержка) или химиотерапия 1 год',
           'Цистоскопия + цитология каждые 3 мес']
        : risk === 'Высокий'
          ? ['Ре-TURBT через 2–6 нед',
             'BCG 3 года (полная доза индукция + поддержка)',
             'Рассмотреть радикальную цистэктомию при T1G3 + CIS, рефрактерности BCG',
             'Цистоскопия каждые 3 мес ≥2 лет']
          : ['Радикальная цистэктомия — обсудить первично',
             'BCG только у отказавшихся от ЦЭ',
             'Мультидисциплинарное обсуждение'];

    return {
      value: String(progTotal),
      unit: 'EORTC P',
      interpretation: `${risk} риск`,
      color,
      details,
      actions,
      caveats: [
        'Шкала EORTC основана на 7 РКИ до эры BCG — переоценивает риск у BCG-получателей',
        'CUETO валидирована для BCG-получателей (альтернатива)',
        'T1G3 всегда как минимум высокий риск',
        'Всегда учитывать данные ре-TURBT при T1',
      ],
      scale: {
        segments: [
          { min: 0, max: 7, label: 'Низкий', color: '#22C55E' },
          { min: 7, max: 14, label: 'Средний', color: '#F59E0B' },
          { min: 14, max: 17, label: 'Высокий', color: '#EF4444' },
          { min: 17, max: 24, label: 'Оч. высокий', color: '#991B1B' },
        ],
        current: Math.max(0, Math.min(23, progTotal)),
        unit: 'балл',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'capra', title: 'CAPRA' },
        { id: 'renal', title: 'RENAL score' },
      ],
    };
  },
  reference: 'Sylvester RJ et al. Eur Urol 2006;49:466–477 (EORTC NMIBC).',
  countries: 'Международный (EAU)',
  presets: [
    { label: 'Низкий (Ta G1 1см)', values: { count: '0', size: '0', prior: '0', t: '0', cis: '0', grade: '0' } },
    { label: 'Средний (Ta G2 мульти)', values: { count: '3', size: '3', prior: '2', t: '0', cis: '0', grade: '1' } },
    { label: 'Высокий (T1 G3 + CIS)', values: { count: '0', size: '0', prior: '0', t: '4', cis: '6', grade: '5' } },
  ],
  info: `### Для чего используется
**EORTC NMIBC risk tables** — оценка риска рецидива и прогрессии немышечно-инвазивного рака мочевого пузыря после TURBT.

### Параметры
| Фактор | Баллы (рецидив / прогрессия) |
|---|---|
| Число опухолей | 0 / 3 / 6 |
| Размер ≥3 см | 3 / 3 |
| Рецидив в анамнезе | 0–4 |
| T-стадия (T1) | 1 / 4 |
| CIS сопутствующий | 1 / 6 |
| Grade (G2/G3) | 1–5 |

### Группы риска (EAU 2024)
- **Низкий**: Ta, G1, солитарная, <3 см, без CIS
- **Средний**: между низким и высоким
- **Высокий**: T1 **или** G3/HG **или** CIS **или** множественная + рецидивирующая + >3 см Ta G1-G2
- **Очень высокий**: T1G3 + CIS + множественная/большая/рецидивирующая; BCG-рефрактерная`,
};
export default runner;
