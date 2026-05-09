/**
 * Runner: neo-norepinephrine-dose — Норэпинефрин (warm shock vasopressor)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * α1 + β1 dominant catecholamine. Preferred для warm shock (low SVR).
 *
 * Дозы:
 *   Start: 0.05 мкг/кг/мин
 *   Range: 0.05-1 мкг/кг/мин
 *   Max: 1 мкг/кг/мин (beyond — рассмотреть vasopressin)
 *
 * Показания:
 *   - Warm septic shock (low SVR, normal/high CO)
 *   - Vasodilatory shock (anaphylaxis, drug-induced)
 *   - Adjunct когда dopamine inadequate
 *
 * SOURCES:
 *   - Surviving Sepsis Campaign Pediatric 2020
 *   - SHOCKED trial Choong NEJM 2009
 *   - NeoFax / Neonatal Formulary 9 ed
 *   - КР МЗ РФ "Шок у новорождённого"
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (SSC Pediatric / NeoFax)',
  reference: 'Surviving Sepsis Campaign Pediatric 2020. NeoFax. Choong NEJM 2009.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 5,
      step: 0.01,
    },
    {
      id: 'rate',
      label: 'Скорость инфузии (мкг/кг/мин)',
      type: 'select',
      options: [
        { value: '0.05', label: '0.05 (start)' },
        { value: '0.1', label: '0.1 (low)' },
        { value: '0.3', label: '0.3 (med)' },
        { value: '0.5', label: '0.5 (med-high)' },
        { value: '1.0', label: '1.0 (max)' },
      ],
    },
    {
      id: 'concentration',
      label: 'Концентрация',
      type: 'select',
      options: [
        { value: '16', label: '16 мкг/мл (4 мг + 250 мл D5W) — стандарт' },
        { value: '32', label: '32 мкг/мл (concentrated central)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const rate = Number(values.rate ?? 0.05);
    const conc = Number(values.concentration ?? 16);

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    const microPerMin = rate * w;
    const microPerHour = microPerMin * 60;
    const mlPerHour = microPerHour / conc;

    let band = '#84CC16';
    if (rate >= 0.3) band = '#F59E0B';
    if (rate >= 1.0) band = '#EF4444';

    const actions: string[] = [];
    actions.push(`Норэпинефрин: ${microPerMin.toFixed(3)} мкг/мин = ${microPerHour.toFixed(1)} мкг/ч`);
    actions.push(`Скорость: ${mlPerHour.toFixed(2)} мл/ч @ ${conc} мкг/мл`);
    actions.push(`Доза: ${rate} мкг/кг/мин (α1 + β1 dominant)`);

    actions.push('--- Подготовка ---');
    actions.push(`${conc === 16 ? '4 мг + 250 мл D5W = 16 мкг/мл (стандарт)' : '8 мг + 250 мл = 32 мкг/мл (concentrated central)'}`);
    actions.push('Stable 24 ч; D5W (НЕ NaCl alone — degrades); protect from light');
    actions.push('Доступ: ВСЕГДА central (extravasation тяжёлая)');
    actions.push('Phentolamine 0.5 мл s.c. при extravasation');

    actions.push('--- Когда выбирать ---');
    actions.push('Warm septic shock (low SVR + normal/high CO) — α1 vasoconstriction');
    actions.push('Vasodilatory shock (anaphylaxis, drug-induced)');
    actions.push('Pediatric SSC 2020: norepi или epi first-line у warm shock');
    actions.push('vs Vasopressin: norepi catecholamine, vasopressin non-catecholamine; могут use вместе');

    actions.push('--- Titration ---');
    actions.push('Start 0.05 мкг/кг/мин');
    actions.push('↑ 0.05 мкг/кг/мин q5-10 мин до response');
    actions.push('Markers: ↑ AД (mean), CRT < 3 sec, urine ≥ 1 мл/кг/ч');
    actions.push('Max common 0.5-1 мкг/кг/мин; beyond → vasopressin adjunct');

    actions.push('--- Side effects ---');
    actions.push('Periferal vasoconstriction → digital ischemia');
    actions.push('Reflex bradycardia (high dose)');
    actions.push('Hyperglycemia (β2 effect minor)');
    actions.push('НЕ classic тахикардия как dopamine/epi (более α-selective)');

    return {
      value: microPerMin.toFixed(3),
      unit: `мкг/мин (${mlPerHour.toFixed(2)} мл/ч)`,
      interpretation: `${rate} мкг/кг/мин (α1 + β1)`,
      color: band,
      details: `${rate} мкг/кг/мин × ${w} кг = ${microPerMin.toFixed(3)} мкг/мин = ${mlPerHour.toFixed(2)} мл/ч @ ${conc} мкг/мл.`,
      actions,
    };
  },
  caveats: [
    'Norepinephrine — preferred над dopamine для warm shock (peds SSC 2020)',
    'Less тахикардия чем epinephrine — α1 dominant, β1 minor',
    'Combination с vasopressin для catecholamine-sparing strategy',
    'Reflex bradycardia при high dose — caution особенно у preterm',
    'НЕ confuse с dopamine (DA/β1/α1) — norepi pure α1+β1, no DA effect',
    'Central access обязательный — extravasation тяжёлая, phentolamine antidote',
    'Stable в D5W; degrades в NaCl alone; protect from light',
    'У ELBW — limited data; use cautiously',
  ],
  related: [
    { id: 'neo-dopamine-dose', title: 'Допамин н/р' },
    { id: 'neo-epinephrine-infusion', title: 'Адреналин continuous' },
    { id: 'neo-vasopressin-dose', title: 'Вазопрессин' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
  ],
  info: `### Норэпинефрин у новорождённых

α1 + β1 dominant catecholamine. Preferred для warm shock (low SVR).

### Дозы

| Уровень | Доза |
|---|---|
| Start | 0.05 мкг/кг/мин |
| Low | 0.1 мкг/кг/мин |
| Med | 0.3 мкг/кг/мин |
| Med-high | 0.5 мкг/кг/мин |
| Max | 1.0 мкг/кг/мин |

### Когда выбирать

| Shock type | First-line |
|---|---|
| **Warm shock** (↓ SVR, normal CO) | Norepi или epi |
| **Cold shock** (↓ CO) | Dopamine → epi |
| **Cardiogenic** | Dopamine + dobutamine |
| **PPHN-related** | Milrinone + iNO |

### vs Other vasopressors

| | Norepi | Epi | Dopa | Vaso |
|---|---|---|---|---|
| **α1** | dominant | + | high dose | none |
| **β1** | + | dominant | + | none |
| **β2** | minimal | + | none | none |
| **DA** | none | none | low dose | none |
| **V1** | none | none | none | dominant |
| **Use** | warm shock | refractory | first-line | catechol-resist |

### Источники

- Surviving Sepsis Campaign Pediatric 2020
- Choong K et al. NEJM 2009
- NeoFax / Neonatal Formulary 9 ed
- КР МЗ РФ "Шок у новорождённого" (2024)
`,
};

export default runner;
