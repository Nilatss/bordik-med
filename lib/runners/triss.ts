// @ts-nocheck
/** Runner: triss — TRISS (Boyd 1987) probability of survival */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'mech',
      label: 'Механизм',
      type: 'select',
      options: [
        { value: 'blunt', label: 'Тупая травма (blunt)' },
        { value: 'pen', label: 'Проникающая (penetrating)' },
      ],
    },
    { id: 'iss', label: 'ISS', type: 'number', unit: 'баллов', min: 0, max: 75, step: 1, quickValues: [9, 16, 25, 35, 50] },
    {
      id: 'gcs',
      label: 'GCS (для RTS)',
      type: 'select',
      options: [
        { value: '15', label: '13–15' },
        { value: '12', label: '9–12' },
        { value: '8', label: '6–8' },
        { value: '5', label: '4–5' },
        { value: '3', label: '3' },
      ],
    },
    {
      id: 'sbpc',
      label: 'САД',
      type: 'select',
      options: [
        { value: '4', label: '≥ 90' },
        { value: '3', label: '76–89' },
        { value: '2', label: '50–75' },
        { value: '1', label: '1–49' },
        { value: '0', label: '0' },
      ],
    },
    {
      id: 'rrc',
      label: 'ЧДД',
      type: 'select',
      options: [
        { value: '4', label: '10–29' },
        { value: '3', label: '> 29' },
        { value: '2', label: '6–9' },
        { value: '1', label: '1–5' },
        { value: '0', label: '0' },
      ],
    },
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 0, max: 120, step: 1, quickValues: [25, 40, 54, 55, 70] },
  ],
  compute: (v) => {
    const mech = String(v.mech || 'blunt');
    const iss = Number(v.iss) || 0;
    const gcs = Number(v.gcs);
    const sbpc = Number(v.sbpc);
    const rrc = Number(v.rrc);
    const age = Number(v.age) || 0;
    const gcsC = gcs >= 13 ? 4 : gcs >= 9 ? 3 : gcs >= 6 ? 2 : gcs >= 4 ? 1 : 0;
    const rts = 0.9368 * gcsC + 0.7326 * sbpc + 0.2908 * rrc;
    const ageIdx = age >= 55 ? 1 : 0;
    const coef = mech === 'pen'
      ? { b0: -2.5355, b1: 0.9934, b2: -0.0651, b3: -1.1360 }
      : { b0: -0.4499, b1: 0.8085, b2: -0.0835, b3: -1.7430 };
    const b = coef.b0 + coef.b1 * rts + coef.b2 * iss + coef.b3 * ageIdx;
    const ps = 1 / (1 + Math.exp(-b));
    const pct = (ps * 100).toFixed(1);
    let interpretation = ''; let color = '#22C55E';
    if (ps >= 0.9) { interpretation = 'Высокая вероятность выживания'; color = '#22C55E'; }
    else if (ps >= 0.5) { interpretation = 'Средняя вероятность выживания'; color = '#FACC15'; }
    else if (ps >= 0.25) { interpretation = 'Низкая вероятность выживания'; color = '#EF4444'; }
    else { interpretation = 'Очень низкая вероятность выживания'; color = '#991B1B'; }
    return {
      value: pct,
      unit: '% Ps',
      interpretation,
      color,
      details: `TRISS Ps = ${pct}% (RTS ${rts.toFixed(3)}, ISS ${iss}, ${mech === 'pen' ? 'penetrating' : 'blunt'}, возраст ${age < 55 ? '<' : '≥'} 55).`,
      actions: [
        'TRISS — ретроспективный аудит trauma registry (MTOS, TARN, NTDB)',
        'Неожиданные исходы: смерть при Ps > 0.5 или выживание при Ps < 0.5 → peer review',
        'Для современных коэффициентов см. NTDB Research Dataset или TARN Probability of Survival',
      ],
      caveats: [
        'Исторические MTOS coefficients (1987) занижают выживаемость в современной системе',
        'TRISS не подходит для > 1 сочетания механизмов или ожогов',
        'ASCOT (A Severity Characterization of Trauma) — более точная альтернатива',
        'Для проникающих ранений точность ниже при изолированных ЧМТ',
      ],
      scale: {
        segments: [
          { min: 0, max: 25, label: 'Очень низкая', color: '#991B1B' },
          { min: 25, max: 50, label: 'Низкая', color: '#EF4444' },
          { min: 50, max: 90, label: 'Средняя', color: '#FACC15' },
          { min: 90, max: 100, label: 'Высокая', color: '#22C55E' },
        ],
        current: Number(pct),
        unit: '% Ps',
      },
      related: [
        { id: 'iss', title: 'ISS' },
        { id: 'niss', title: 'NISS' },
        { id: 'rts', title: 'RTS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Реаниматология' },
      ],
    };
  },
  reference: 'Boyd CR, Tolson MA, Copes WS. Evaluating trauma care: the TRISS method. J Trauma 1987;27:370–378. Major Trauma Outcome Study (MTOS) coefficients.',
  countries: 'Международный (MTOS)',
  presets: [
    { label: 'Молодой, blunt, ISS 25, RTS 7.84', values: { mech: 'blunt', iss: 25, gcs: '15', sbpc: '4', rrc: '4', age: 30 } },
    { label: 'Пожилой, blunt, ISS 25', values: { mech: 'blunt', iss: 25, gcs: '15', sbpc: '4', rrc: '4', age: 70 } },
    { label: 'Огнестрел, тяжёлый шок', values: { mech: 'pen', iss: 35, gcs: '8', sbpc: '2', rrc: '3', age: 25 } },
  ],
  info: `### Для чего используется
**TRISS (Boyd, 1987)** — логистическая регрессия для оценки вероятности выживания (Ps) пациента травмы. Основа trauma registry аудита.

### Формула
\`b = b0 + b1 × RTS + b2 × ISS + b3 × AgeIndex\`
\`Ps = 1 / (1 + exp(−b))\`

**MTOS коэффициенты:**
| Параметр | Blunt | Penetrating |
|---|---|---|
| b0 | −0.4499 | −2.5355 |
| b1 (RTS) | 0.8085 | 0.9934 |
| b2 (ISS) | −0.0835 | −0.0651 |
| b3 (Age) | −1.7430 | −1.1360 |

AgeIndex = 0 (< 55) или 1 (≥ 55).

### Компоненты
- **RTS** (mortality-weighted) = 0.9368 × GCS-c + 0.7326 × SBP-c + 0.2908 × RR-c
- **ISS** — anatomical severity
- **Age** — binary cutoff 55 лет
- **Mechanism** — blunt/penetrating

### Использование
- Peer review: **неожиданная смерть** (Ps > 0.5, exited), **неожиданное выживание** (Ps < 0.5, survived)
- Benchmarking госпиталей (Z- и W-statistics vs MTOS norm)
- Не применяется индивидуально для клинических решений

### Ограничения
- MTOS coefficients устарели (1987) — занижают Ps для современной помощи
- Не подходит: изолированные ожоги, утопление, комбинированные механизмы, пожилые с несколькими порогами
- Плохая калибровка для ИВЛ-зависимых (GCS нельзя оценить)

### Альтернативы
- **ASCOT** — Champion 1990, включает AIS-коды регионов
- **ICISS** — Osler 1996, ICD-9 survival ratios
- **TMPM-ICD** — Glance 2009, современный regression
- **NTDB / TARN** — локальные обновлённые coefficients

### Источник
Boyd CR et al. *Evaluating trauma care: the TRISS method.* J Trauma 1987;27:370
`,
};

export default runner;
