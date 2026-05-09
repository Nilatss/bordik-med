/**
 * Runner: neo-vasopressin-dose — Вазопрессин (refractory shock)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Антидиуретический гормон — vasopressor для refractory vasodilatory
 * shock (warm shock, septic shock рефрактерный к catecholamines).
 *
 * V1 receptor → vasoconstriction
 * V2 receptor → antidiuretic effect
 *
 * Показания:
 *   - Refractory vasodilatory shock после high-dose epinephrine / norepi
 *   - Septic warm shock (low SVR, normal/high CO)
 *   - Cardiac failure with low SVR (post-Fontan, post-cardiopulmonary bypass)
 *   - Catecholamine-resistant shock as adjunct
 *
 * Дозы:
 *   - Start: 0.0001 ед/кг/мин (0.1 мЕД/кг/мин)
 *   - Range: 0.0001 - 0.0007 ед/кг/мин (некоторые до 0.001)
 *   - Max: 0.001 ед/кг/мин (beyond — risk ischemia)
 *
 * NB: 1 ед = 1000 мЕД = 1000000 мкЕД
 *
 * SOURCES:
 *   - Choong K et al. NEJM 2009 — vasopressin in pediatric shock
 *   - AHA 2019 PPHN scientific statement
 *   - SSC Pediatric 2020
 *   - NeoFax / Neonatal Formulary 9 ed
 *   - Mohamed A et al. — neonatal vasopressin pharmacokinetics
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NeoFax / SSC Pediatric 2020 / AHA 2019)',
  reference: 'Choong K NEJM 2009. SSC Pediatric 2020. AHA PPHN 2019. NeoFax. Mohamed A.',
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
      label: 'Скорость инфузии (ед/кг/мин)',
      type: 'select',
      options: [
        { value: '0.0001', label: '0.0001 ед/кг/мин (start)' },
        { value: '0.0003', label: '0.0003 ед/кг/мин (low-med)' },
        { value: '0.0005', label: '0.0005 ед/кг/мин (med)' },
        { value: '0.0007', label: '0.0007 ед/кг/мин (high)' },
        { value: '0.001', label: '0.001 ед/кг/мин (max — caution ischemia)' },
      ],
    },
    {
      id: 'concentration',
      label: 'Концентрация',
      type: 'select',
      options: [
        { value: '0.1', label: '0.1 ед/мл (стандарт: 20 ед + 200 мл D5W = 0.1 U/мл)' },
        { value: '0.4', label: '0.4 ед/мл (concentrated central)' },
        { value: '0.05', label: '0.05 ед/мл (dilute peripheral)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const rate = Number(values.rate ?? 0.0001);
    const conc = Number(values.concentration ?? 0.1);

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    // ед/кг/мин × кг = ед/мин
    const unitsPerMin = rate * w;
    const unitsPerHour = unitsPerMin * 60;
    const mlPerHour = unitsPerHour / conc;
    // milliunits для clarity
    const mUPerKgPerMin = rate * 1000;

    let band = '#84CC16';
    if (rate >= 0.0007) band = '#F59E0B';
    if (rate >= 0.001) band = '#EF4444';

    const actions: string[] = [];
    actions.push(`Вазопрессин: ${unitsPerMin.toFixed(6)} ед/мин = ${unitsPerHour.toFixed(4)} ед/ч`);
    actions.push(`= ${mUPerKgPerMin.toFixed(2)} мЕД/кг/мин (mU/kg/min)`);
    actions.push(`Скорость инфузии: ${mlPerHour.toFixed(2)} мл/ч @ ${conc} ед/мл`);
    actions.push(`Доза: ${rate} ед/кг/мин (= ${mUPerKgPerMin} мЕД/кг/мин)`);

    actions.push('--- Подготовка ---');
    if (conc === 0.1) {
      actions.push('Стандарт: 20 ед vasopressin + 200 мл D5W = 0.1 ед/мл');
      actions.push('Альтернатива: 1 ед + 10 мл D5W = 0.1 ед/мл (small volume)');
    } else if (conc === 0.4) {
      actions.push('Concentrated: 20 ед + 50 мл D5W = 0.4 ед/мл (central line)');
    } else {
      actions.push('Dilute: 5 ед + 100 мл = 0.05 ед/мл (peripheral)');
    }
    actions.push('Stable 24 ч @ 25°C; D5W (НЕ Lactated Ringer)');
    actions.push('Доступ: central preferred (extravasation тяжёлая)');

    actions.push('--- Когда использовать ---');
    actions.push('Refractory vasodilatory shock после catecholamines (epinephrine ≥ 0.5 мкг/кг/мин)');
    actions.push('Septic warm shock (низкий SVR, normal/high CO) — V1 vasoconstriction');
    actions.push('Не рутинно first-line у н/р — adjunct после catecholamines');
    actions.push('Иногда у CHD post-cardiopulmonary bypass с low SVR');

    actions.push('--- Titration ---');
    actions.push('Start: 0.0001 ед/кг/мин (0.1 мЕД/кг/мин)');
    actions.push('↑ 0.0001 ед/кг/мин q15-30 мин до response');
    actions.push('Markers: ↑ АД (mean), urine output ≥ 1 мл/кг/ч, lactate ↓');
    actions.push('Max common: 0.0005-0.0007 ед/кг/мин');
    actions.push('Beyond 0.001: значительный ischemia risk (cutaneous, mesenteric, renal)');

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: ЧСС, АД (invasive arterial), urine output, perfusion');
    actions.push('Lactate q4-6h');
    actions.push('Skin / extremity perfusion (V1 vasoconstriction → digital ischemia possible)');
    actions.push('Mesenteric perfusion: feeding intolerance, abd distention');
    actions.push('Hyponatremia (V2 antidiuretic effect) — мониторинг Na q12h');

    actions.push('--- Side effects ---');
    actions.push('Digital / cutaneous ischemia (V1 vasoconstriction в end-arteries)');
    actions.push('Mesenteric ischemia → NEC risk (особенно у preterm)');
    actions.push('Hyponatremia (V2 receptor activation → SIADH-like)');
    actions.push('Гипокалиемия');
    actions.push('Hyperbilirubinemia (rare)');
    actions.push('Bradycardia (high dose)');

    actions.push('--- Wean ---');
    actions.push('Wean ASAP когда стабилен (long-term high-dose → ischemic complications)');
    actions.push('↓ 0.0001 ед/кг/мин q4-6h');

    return {
      value: unitsPerMin.toFixed(6),
      unit: `ед/мин (${mlPerHour.toFixed(2)} мл/ч)`,
      interpretation: `${rate} ед/кг/мин (${mUPerKgPerMin} мЕД/кг/мин)`,
      color: band,
      details: `${rate} ед/кг/мин × ${w} кг = ${unitsPerMin.toFixed(6)} ед/мин = ${mlPerHour.toFixed(2)} мл/ч @ ${conc} ед/мл.`,
      actions,
    };
  },
  caveats: [
    'Vasopressin — adjunct после high-dose catecholamines, не routine first-line у н/р',
    'V1 effect → vasoconstriction (vasopressor); V2 → antidiuretic (rarely seen at clinical dose)',
    'Mesenteric ischemia risk у preterm — NEC potential; не использовать рутинно у preterm',
    'Digital ischemia: cutaneous V1 effect; мониторинг extremity perfusion q1h',
    'Hyponatremia (V2) — мониторинг Na q12h; restrict free water',
    'Combination с norepinephrine для catecholamine-resistant warm shock',
    'НЕ использовать с lactated Ringer — incompatibility (precipitate)',
    'Choong NEJM 2009: vasopressin in peds shock — increased mortality в одной cohort, mixed evidence',
    'У septic shock с adrenal insufficiency: hydrocortisone + vasopressin synergy',
    'Wean ASAP — long-term high-dose vasopressin → ischemic complications',
  ],
  related: [
    { id: 'neo-epinephrine-infusion', title: 'Адреналин continuous' },
    { id: 'neo-dopamine-dose', title: 'Допамин н/р' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
    { id: 'neo-nsofa', title: 'Neonatal SOFA' },
  ],
  info: `### Вазопрессин у новорождённых

Vasopressor для refractory vasodilatory shock после high-dose
catecholamines. V1 receptor agonist → vasoconstriction.

### Дозы

| Уровень | Доза | Применение |
|---|---|---|
| **Start** | 0.0001 ед/кг/мин | Initial trial |
| Low-med | 0.0003 ед/кг/мин | Mild response |
| Med | 0.0005 ед/кг/мин | Standard maintenance |
| High | 0.0007 ед/кг/мин | Refractory |
| Max | 0.001 ед/кг/мин | Caution ischemia risk |

⚠️ NB: 1 ед = 1000 мЕД = 1,000,000 мкЕД

### Подготовка

| Conc | Recipe |
|---|---|
| 0.05 ед/мл | 5 ед + 100 мл D5W (peripheral) |
| **0.1 ед/мл** | **20 ед + 200 мл D5W** (стандарт) |
| 0.4 ед/мл | 20 ед + 50 мл D5W (central) |

Stable 24 ч; D5W (НЕ lactated Ringer).

### Когда использовать

- **Refractory vasodilatory shock** после epinephrine ≥ 0.5 мкг/кг/мин
- **Septic warm shock** (low SVR, normal CO) — V1 vasoconstriction
- **Post-cardiopulmonary bypass** с low SVR
- **Catecholamine-resistant** shock как adjunct

### Алгоритм shock

1. **Volume:** NS 10-20 мл/кг × 2-3 болюса
2. **Catecholamines:**
   - Cold shock: dopamine → epi
   - Warm shock: norepi → vasopressin adjunct
3. **Hydrocortisone** при refractory или suspected adrenal insufficiency
4. **Vasopressin 0.0001 ед/кг/мин** start если catecholamine-resistant
5. **Titrate** до markers: AД (mean), UO ≥ 1 мл/кг/ч, lactate ↓
6. **Wean ASAP** when stable

### V1 vs V2 receptor effects

| Receptor | Location | Effect |
|---|---|---|
| **V1** | Vascular smooth muscle | Vasoconstriction (clinical dose) |
| **V2** | Renal collecting duct | Antidiuretic (low dose) |

При clinical doses доминирует V1 effect; V2 minor.

### Side effects (особенно у preterm)

| Effect | Frequency | Management |
|---|---|---|
| Digital ischemia | + (V1) | Monitoring extremity, wean |
| Mesenteric ischemia | + (NEC у preterm) | Avoid у < 32 нед если возможно |
| Hyponatremia | V2 effect | Restrict free water |
| Гипокалиемия | + | Monitor K |
| Bradycardia | high dose | Hold или dose ↓ |

### Choong NEJM 2009 (peds shock trial)

- 65 children с pressor-resistant shock
- Vasopressin 0.0005 ед/кг/мин или placebo
- **No mortality benefit, possibly worse outcomes**
- → Use selectively, не routine

### Combination strategies

| Combination | Application |
|---|---|
| **Vasopressin + norepi** | Catecholamine-sparing (warm shock) |
| **Vasopressin + hydrocortisone** | Adrenal insufficiency suspected |
| **Vasopressin + epinephrine** | Refractory cold shock |
| **Vasopressin + iNO** | PPHN + warm shock |

### Источники

- Choong K et al. NEJM 2009 — peds vasopressor-resistant shock
- AHA 2019 PPHN scientific statement
- SSC Pediatric 2020
- NeoFax / Neonatal Formulary 9 ed
- Mohamed A et al. — neonatal vasopressin PK
`,
};

export default runner;
