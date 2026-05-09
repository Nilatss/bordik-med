/**
 * Runner: neo-diazoxide-dose — Диазоксид (CHI maintenance)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * KATP channel opener — first-line maintenance therapy для congenital
 * hyperinsulinism (CHI) после initial stabilization. Активирует KATP
 * channels на β-cells → suppresses insulin secretion.
 *
 * Дозы:
 *   Initial: 5 мг/кг/сут PO разделить q8h (или 5-15 мг/кг/сут разделить q12h)
 *   Maintenance: 5-15 мг/кг/сут PO q8h
 *   Maximum: 20-25 мг/кг/сут (rarely needed)
 *
 *   Combination с chlorothiazide 7-10 мг/кг/сут PO q12h — fluid retention prophylaxis
 *
 * SOURCES:
 *   - Arnoux JB et al. — CHI management guidelines
 *   - Stanley CA et al. — CHI review (Pediatrics 122:1124, 2008)
 *   - Hussain K et al. — diazoxide therapy CHI
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Гипогликемия / CHI" (2024)
 *
 * Response definition:
 *   Maintaining glucose > 4-5 ммоль/л (> 70 мг/дл) на minimum GIR (4-6 мг/кг/мин)
 *   с ad-libitum oral feeding × 5-7 дней.
 *
 * NB: ~ 50 % CHI cases are KATP-channel-resistant — diazoxide failure;
 * требуется octreotide или surgery.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Arnoux / Stanley) · РФ',
  reference: 'Arnoux JB CHI guidelines. Stanley CA Pediatrics 122:1124. Hussain K. NeoFax.',
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
      id: 'mode',
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'init_low', label: 'Initial low 5 мг/кг/сут PO q8h (start)' },
        { value: 'init_med', label: 'Initial standard 10 мг/кг/сут PO q8h' },
        { value: 'maint_high', label: 'Maintenance high 15 мг/кг/сут PO q8h' },
        { value: 'maint_max', label: 'Maintenance max 20-25 мг/кг/сут (rare)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'init_low');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type DiazMode = { perKgPerDay: number; freq: string; label: string };
    const modes: Record<string, DiazMode> = {
      init_low: { perKgPerDay: 5, freq: 'q8h', label: 'Initial low (start)' },
      init_med: { perKgPerDay: 10, freq: 'q8h', label: 'Initial standard' },
      maint_high: { perKgPerDay: 15, freq: 'q8h', label: 'Maintenance high' },
      maint_max: { perKgPerDay: 22, freq: 'q8h', label: 'Maintenance max (rare)' },
    };
    const m = modes[mode] ?? modes.init_low;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const totalPerDay = w * m.perKgPerDay;
    const dosesPerDay = 3; // q8h
    const totalPerDose = totalPerDay / dosesPerDay;
    const conc = 50; // мг/мл стандартная PO suspension (50 мг/мл compounded или Proglycem suspension)
    const volPerDose = totalPerDose / conc;

    const actions: string[] = [];
    actions.push(`Диазоксид: ${totalPerDay.toFixed(1)} мг/сут = ${totalPerDose.toFixed(1)} мг q8h PO`);
    actions.push(`Объём: ${volPerDose.toFixed(2)} мл/доза @ 50 мг/мл (PO suspension)`);
    actions.push(`Доза: ${m.perKgPerDay} мг/кг/сут разделить ${m.freq} PO`);
    actions.push('Путь: PO — empty stomach или с small amount food');

    actions.push('--- Когда использовать ---');
    actions.push('CHI (congenital hyperinsulinism) — first-line maintenance therapy');
    actions.push('После initial stabilization с GIR увеличением + glucose bolus');
    actions.push('Trial × 5-7 дней — assess response');
    actions.push('Если responsive (~ 50 % cases): chronic medication');
    actions.push('Если KATP-resistant: switch к octreotide / surgery (focal CHI)');

    actions.push('--- Mechanism ---');
    actions.push('KATP channel opener (на pancreatic β-cells)');
    actions.push('↓ Insulin secretion');
    actions.push('Также vasodilation (peripheral arterial — антиgipertензивный effect)');
    actions.push('Stimulates catecholamine release (mild)');

    actions.push('--- Combination therapy ---');
    actions.push('⚠️ Concomitant CHLOROTHIAZIDE recommended');
    actions.push('Chlorothiazide 7-10 мг/кг/сут PO q12h');
    actions.push('Mechanism: counteracts fluid retention (diazoxide side effect)');
    actions.push('Также: ↑ KATP channel activity (synergy с diazoxide)');

    actions.push('--- Onset / response ---');
    actions.push('Onset: 1-2 days до noticeable effect');
    actions.push('Full effect: 5-7 days');
    actions.push('t½: 24-36 ч у н/р (long)');
    actions.push('Steady state: 5-7 days');
    actions.push('Trial × 5-7 days perfilaxis перед declaring failure');

    actions.push('--- Response definition ---');
    actions.push('Maintained glucose > 4-5 ммоль/л (> 70 мг/дл)');
    actions.push('GIR минимизирован к 4-6 мг/кг/мин');
    actions.push('Ad-libitum oral feeding tolerated × 5-7 days');
    actions.push('Если no response — switch к octreotide');

    actions.push('--- Side effects ---');
    actions.push('⚠️ Fluid retention — pulmonary edema (особенно у preterm с PDA)');
    actions.push('⚠️ Hypertrichosis (excessive hair growth) — common, reversible after discontinuation');
    actions.push('Hyperuricemia');
    actions.push('Тромбоцитопения rare');
    actions.push('Hyperglycemia (overdose — но goal у CHI)');
    actions.push('Pulmonary hypertension (rare у newborns — caution)');
    actions.push('GI: nausea, vomiting');

    actions.push('--- Drug interactions ---');
    actions.push('Phenytoin: ↓ phenytoin levels (induces metabolism)');
    actions.push('Antihypertensives: additive hypotension');
    actions.push('Thiazide diuretics: synergy для CHI (chlorothiazide)');
    actions.push('Anticoagulants: ↑ effect (caution)');

    actions.push('--- Мониторинг ---');
    actions.push('Glucose q4-6h × 7 дней initial trial');
    actions.push('Daily fluid balance (intake/output)');
    actions.push('CBC weekly (тромбоцитопения)');
    actions.push('Echocardiography baseline (для PHTN)');
    actions.push('LFTs monthly');
    actions.push('Hair growth assessment');

    return {
      value: totalPerDay.toFixed(1),
      unit: `мг/сут (${volPerDose.toFixed(2)} мл q8h)`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKgPerDay} мг/кг/сут × ${w} кг = ${totalPerDay.toFixed(1)} мг/сут разделить ${m.freq} PO.`,
      actions,
    };
  },
  caveats: [
    'First-line maintenance для CHI — KATP channel opener у β-cells',
    '~ 50 % CHI cases KATP-resistant — diazoxide failure → switch к octreotide',
    'Trial × 5-7 days перед declaring failure (long t½ 24-36 ч у н/р)',
    'Concomitant CHLOROTHIAZIDE rec (7-10 мг/кг/сут q12h) — counteracts fluid retention + synergistic',
    'Fluid retention common у preterm — particularly concerning с PDA',
    'Hypertrichosis (excessive hair growth) — common, reversible после discontinuation',
    'Pulmonary hypertension rare but reported у newborns — caution',
    'Echocardiography baseline для exclude PHTN',
    'Тромбоцитопения rare; CBC weekly',
    'Drug interactions: phenytoin (↓ levels), antihypertensives (additive)',
    'У KATP-channel mutations (KCNJ11, ABCC8) — variable response (some focal CHI cases respond, diffuse usually not)',
    'PO administration: empty stomach или small food OK; bioavailability ~ 50 %',
  ],
  related: [
    { id: 'neo-glucagon-dose', title: 'Глюкагон CHI emergency' },
    { id: 'neo-octreotide-dose', title: 'Октреотид (KATP-resistant)' },
    { id: 'neo-glucose-bolus-dose', title: 'Глюкоза болюс' },
    { id: 'neo-gir', title: 'GIR calculator' },
  ],
  info: `### Диазоксид (CHI maintenance)

KATP channel opener — first-line maintenance therapy для congenital
hyperinsulinism (CHI).

### Дозы

| Phase | Доза |
|---|---|
| **Initial low** | 5 мг/кг/сут PO q8h |
| Initial standard | 10 мг/кг/сут PO q8h |
| **Maintenance** | **5-15 мг/кг/сут PO q8h** |
| Maintenance high | 15 мг/кг/сут PO q8h |
| Max | 20-25 мг/кг/сут (rare) |

⚠️ **Concomitant chlorothiazide** 7-10 мг/кг/сут PO q12h — counteracts fluid retention.

### Mechanism

| Effect | Mechanism |
|---|---|
| ↓ Insulin secretion | KATP channel opener в β-cells |
| Antihypertensive | Peripheral vasodilation (arterial) |
| Mild catecholamine release | Reflex sympathetic |
| Hyperglycemia (goal in CHI) | ↓ Insulin → ↑ Glucose |

### CHI Treatment Algorithm

1. **Initial stabilization:**
   - Glucose D10W bolus 2 мл/кг IV
   - Continuous GIR 6-15 мг/кг/мин
   - Frequent feeds

2. **Diazoxide trial:**
   - 5-15 мг/кг/сут PO q8h
   - Concomitant chlorothiazide
   - **Trial × 5-7 days**

3. **Response assessment:**
   - Glucose > 4-5 ммоль/л sustained
   - GIR минимизирован к 4-6 мг/кг/мин
   - Ad-libitum feeding tolerated

4. **If responsive (~ 50 %):** Continue chronic
5. **If unresponsive:** Switch к octreotide
6. **18F-DOPA PET:** focal vs diffuse CHI
7. **Focal CHI:** Surgery (curative)
8. **Diffuse CHI:** Chronic medical (octreotide or combination)

### Onset / kinetics

| Параметр | Value |
|---|---|
| **Onset** | 1-2 days |
| **Full effect** | 5-7 days |
| **t½ у н/р** | 24-36 ч |
| **Steady state** | 5-7 days |
| **Bioavailability** | ~ 50 % |

### Response definition

| Criteria | Target |
|---|---|
| Glucose | > 4-5 ммоль/л (> 70 мг/дл) sustained |
| GIR | Minimized to 4-6 мг/кг/мин |
| Feeding | Ad-libitum oral feeds tolerated |
| Period | × 5-7 days stable |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| **Fluid retention** | common | + Chlorothiazide |
| **Hypertrichosis** | common | Reversible after discontinuation |
| **Pulmonary edema** | preterm + PDA | Caution; chlorothiazide |
| **PHTN** | rare у newborn | Echo baseline |
| Hyperuricemia | + | Monitor |
| Тромбоцитопения | rare | CBC weekly |
| GI: vomiting | + | Reduce dose if severe |
| Hepatic enzyme ↑ | rare | Monthly LFTs |

### Combination therapy

| Combo | Application |
|---|---|
| **Diazoxide + chlorothiazide** | Standard CHI maintenance |
| Diazoxide + octreotide | Partial responders (rare) |
| Diazoxide + nifedipine | Если PHTN suspected |

### Drug interactions

| Drug | Effect |
|---|---|
| **Phenytoin** | ↓ phenytoin levels |
| **Antihypertensives** | Additive hypotension |
| **Thiazide diuretics** | Synergy для CHI; counteract fluid retention |
| **Anticoagulants** | ↑ effect |
| **Sulfonylureas** | Antagonistic |

### Monitoring

| Parameter | Frequency |
|---|---|
| **Glucose** | q4-6h × 7 days initial |
| Daily I/O balance | Daily |
| **CBC** | Weekly |
| LFTs | Monthly |
| **Echocardiography** | Baseline (PHTN screen) |
| Hair growth | Each visit |

### Long-term considerations

- **Hypertrichosis:** Cosmetic concern parents; reversible
- **Pulmonary HTN:** Echo monitoring annual
- **Catch-up growth:** Most CHI patients achieve normal growth
- **School performance:** Variable depending на initial hypoglycemic injury
- **Trial off therapy:** в 3-5 years age (некоторые resolve with growth)

### Источники

- Arnoux JB et al. — CHI management guidelines
- Stanley CA et al. Pediatrics 122:1124 (2008)
- Hussain K et al. — diazoxide therapy CHI
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Гипогликемия / CHI" (2024)
`,
};

export default runner;
