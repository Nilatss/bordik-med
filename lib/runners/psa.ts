// @ts-nocheck
/** Runner: psa */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'psa1', label: 'PSA #1 (самый ранний)', type: 'number', unit: 'нг/мл', min: 0.01, max: 500, step: 0.01, quickValues: [1, 3, 5, 8] },
    { id: 'months1', label: 'PSA #1: сколько месяцев назад', type: 'number', unit: 'мес', min: 0, max: 240, step: 1, quickValues: [24, 12, 6] },
    { id: 'psa2', label: 'PSA #2 (средний)', type: 'number', unit: 'нг/мл', min: 0.01, max: 500, step: 0.01, quickValues: [2, 4, 6, 10] },
    { id: 'months2', label: 'PSA #2: сколько месяцев назад', type: 'number', unit: 'мес', min: 0, max: 240, step: 1, quickValues: [12, 6, 3] },
    { id: 'psa3', label: 'PSA #3 (последний, текущий)', type: 'number', unit: 'нг/мл', min: 0.01, max: 500, step: 0.01, quickValues: [3, 5, 8, 14] },
  ],
  compute: (v) => {
    const psa1 = Number(v.psa1);
    const psa2 = Number(v.psa2);
    const psa3 = Number(v.psa3);
    const m1 = Number(v.months1); // months ago for PSA1
    const m2 = Number(v.months2);

    // Convert to years from PSA1 as t=0
    const t1 = 0;
    const t2 = (m1 - m2) / 12;
    const t3 = m1 / 12;

    // Linear regression for velocity: fit psa = a + v*t
    const ts = [t1, t2, t3];
    const ps = [psa1, psa2, psa3];
    const n = 3;
    const sumT = ts.reduce((s, x) => s + x, 0);
    const sumP = ps.reduce((s, x) => s + x, 0);
    const sumTP = ts.reduce((s, x, i) => s + x * ps[i], 0);
    const sumTT = ts.reduce((s, x) => s + x * x, 0);
    const denom = n * sumTT - sumT * sumT;
    const velocity = denom !== 0 ? (n * sumTP - sumT * sumP) / denom : 0;

    // Doubling time: ln2 / slope of ln(PSA) vs t
    const lps = ps.map(p => Math.log(Math.max(p, 0.001)));
    const sumLP = lps.reduce((s, x) => s + x, 0);
    const sumTLP = ts.reduce((s, x, i) => s + x * lps[i], 0);
    const slope = denom !== 0 ? (n * sumTLP - sumT * sumLP) / denom : 0;
    const dtYears = slope > 0 ? Math.log(2) / slope : Infinity;
    const dtMonths = isFinite(dtYears) ? dtYears * 12 : Infinity;

    let color = '#22C55E', interpretation = 'Низкий риск';
    if (velocity >= 2.0 || (isFinite(dtMonths) && dtMonths < 6)) { color = '#991B1B'; interpretation = 'Высокий риск — срочно'; }
    else if (velocity >= 0.75 || (isFinite(dtMonths) && dtMonths < 12)) { color = '#EF4444'; interpretation = 'Высокий риск'; }
    else if (velocity >= 0.35) { color = '#F59E0B'; interpretation = 'Повышенный риск'; }

    const dtStr = isFinite(dtMonths) ? `${dtMonths.toFixed(1)} мес` : 'стабилен / убывает';

    return {
      value: velocity.toFixed(2),
      unit: 'нг/мл/год',
      interpretation,
      color,
      details: `PSA velocity = ${velocity.toFixed(2)} нг/мл/год, PSA doubling time = ${dtStr}.`,
      actions: velocity >= 0.75 || (isFinite(dtMonths) && dtMonths < 12)
        ? ['Мультипараметрическая МРТ простаты (PI-RADS)',
           'Биопсия простаты (таргетная + систематическая)',
           'У пациентов после простатэктомии: PSMA-PET при PSA >0.2']
        : velocity >= 0.35
          ? ['Контроль PSA через 3–6 мес',
             'Свободный PSA / %fPSA',
             'Оценить по IPSS, пальцевое ректальное исследование']
          : ['Продолжить стандартный скрининг (по возрасту)', 'Повтор PSA через 12 мес'],
      caveats: [
        'PSA-V: требуется минимум 3 измерения за 12–18 мес',
        'PSADT для биохимического рецидива после РП: <3 мес — агрессивный',
        'Простатит, катетеризация, эякуляция за 48 ч — ложный рост PSA',
        'Финастерид/дутастерид снижают PSA в 2 раза',
      ],
      scale: {
        // Visible range 0-4 ng/mL/yr. Key decision points sit in 0-2;
        // values above 2 are already «very high» — no need for more bar.
        segments: [
          { min: 0, max: 0.35, label: 'Низкая', color: '#22C55E' },
          { min: 0.35, max: 0.75, label: 'Погранич.', color: '#F59E0B' },
          { min: 0.75, max: 2, label: 'Высокая', color: '#EF4444' },
          { min: 2, max: 4, label: 'Оч. высокая', color: '#991B1B' },
        ],
        current: Number(Math.max(0, Math.min(4, velocity)).toFixed(2)),
        unit: 'нг/мл/год',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'capra', title: 'CAPRA' },
        { id: 'ipss', title: 'IPSS' },
      ],
    };
  },
  reference: 'Carter HB et al. JAMA 1992 (PSA velocity); D’Amico AV. NEJM 2004 (PSADT).',
  countries: 'Международный (AUA/EAU)',
  presets: [
    { label: 'Стабильный', values: { psa1: 3, months1: 24, psa2: 3.2, months2: 12, psa3: 3.3 } },
    { label: 'Медленный рост', values: { psa1: 2, months1: 24, psa2: 2.8, months2: 12, psa3: 3.5 } },
    { label: 'Быстрый рост', values: { psa1: 2, months1: 24, psa2: 4, months2: 12, psa3: 8 } },
  ],
  info: `### Для чего используется
**PSA kinetics** — динамические параметры PSA для оценки риска рака простаты и прогрессии.

### Формулы
- **PSA velocity** (линейная регрессия ≥3 значений): нг/мл/год
- **PSA doubling time** = ln(2) / slope[ln(PSA) vs время в годах] × 12 = месяцы

### Пороги
| Параметр | Тревожный уровень |
|---|---|
| PSA-V (первичный скрининг) | ≥0.35–0.75 нг/мл/год |
| PSA-V (высокий риск) | ≥2.0 нг/мл/год |
| PSADT после РП | <12 мес (высокий риск), <6 мес (агрессивный) |
| PSADT у active surveillance | <3 года — пересмотр тактики |`,
};
export default runner;
