/**
 * Runner: neo-pyridoxine-dose — Пиридоксин (B6) для refractory neonatal seizures
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Pyridoxine (vit B6) — emergency treatment для pyridoxine-dependent
 * epilepsy (PDE) и pyridoxal phosphate-dependent seizures. Также maintenance
 * для confirmed cases.
 *
 * Дозы:
 *   Acute / trial dose:
 *     50-100 мг IV slow push 1-2 мин под EEG monitoring
 *     Можно repeat × 2 если no response (до total 200-300 мг)
 *
 *   Maintenance (confirmed PDE):
 *     15-30 мг/кг/сут PO разделить q12h (or q24h depending on protocol)
 *     Lifelong therapy
 *
 *   Pyridoxal-phosphate (PLP) trial (если pyridoxine no response):
 *     30-50 мг/кг/сут PO разделить q6h × 3-5 дней trial
 *
 * SOURCES:
 *   - Stockler S et al. — PDE clinical guidelines
 *   - Pearl PL et al. — neonatal seizures B6 review
 *   - Mills PB et al. — pyridoxine-dependent epilepsy biochemistry
 *   - AAP CFN — neonatal seizures
 *   - КР МЗ РФ "Судороги новорождённых" (2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Stockler / Pearl / Mills) · РФ',
  reference: 'Stockler S PDE guidelines. Pearl PL neonatal seizures B6. Mills PB PDE biochemistry.',
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
        { value: 'trial_low', label: 'Acute trial 50 мг IV slow push (low)' },
        { value: 'trial_high', label: 'Acute trial 100 мг IV slow push (стандарт)' },
        { value: 'maint_low', label: 'Maintenance 15 мг/кг/сут PO (PDE confirmed)' },
        { value: 'maint_high', label: 'Maintenance 30 мг/кг/сут PO (high)' },
        { value: 'plp_trial', label: 'PLP trial 30 мг/кг/сут PO q6h × 3-5 дней' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'trial_high');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type B6Mode = { dose?: number; perKg?: number; freq: string; route: string; label: string };
    const modes: Record<string, B6Mode> = {
      trial_low: { dose: 50, freq: 'однократно (можно repeat × 2)', route: 'IV slow push 1-2 мин', label: 'Acute trial low' },
      trial_high: { dose: 100, freq: 'однократно (можно repeat × 2)', route: 'IV slow push 1-2 мин', label: 'Acute trial standard' },
      maint_low: { perKg: 15, freq: 'q12h PO', route: 'PO', label: 'Maintenance low (PDE)' },
      maint_high: { perKg: 30, freq: 'q12h PO', route: 'PO', label: 'Maintenance high' },
      plp_trial: { perKg: 30, freq: 'q6h PO', route: 'PO PLP', label: 'PLP trial' },
    };
    const m = modes[mode] ?? modes.trial_high;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }

    let totalMg: number;
    if (m.dose) {
      totalMg = m.dose;
    } else {
      totalMg = w * (m.perKg ?? 15);
    }

    const conc = mode.startsWith('trial') ? 100 : 100; // мг/мл стандартный (vials 100 мг/мл)
    const vol = totalMg / conc;

    const actions: string[] = [];
    actions.push(`Пиридоксин (B6): ${totalMg.toFixed(1)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл`);
    actions.push(`Доза: ${m.dose ? m.dose + ' мг' : (m.perKg ?? 15) + ' мг/кг/сут разделить'} ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (mode.startsWith('trial')) {
      actions.push('--- ⚠️ Acute trial для refractory neonatal seizures ---');
      actions.push('Indications:');
      actions.push('  - Refractory neonatal seizures без clear cause');
      actions.push('  - Failed phenobarbital ± levetiracetam ± midazolam');
      actions.push('  - Suspected pyridoxine-dependent epilepsy (PDE)');
      actions.push('  - Genetic predisposition / family history');
      actions.push('Method:');
      actions.push('  - 50-100 мг IV slow push 1-2 мин');
      actions.push('  - **EEG monitoring CRITICAL**');
      actions.push('  - Continuous monitoring: HR, BP, SpO₂');
      actions.push('  - Anesthesia / cardiac team standby (apnea risk)');
      actions.push('Response:');
      actions.push('  - Seizure cessation в 5-10 мин');
      actions.push('  - EEG normalization');
      actions.push('  - Если no response: repeat × 2 (max 200-300 мг)');
      actions.push('  - Если still no response: try PLP (pyridoxal phosphate)');
    } else if (mode === 'plp_trial') {
      actions.push('--- PLP (pyridoxal phosphate) trial ---');
      actions.push('Когда: pyridoxine no response, but suspect B6-related epilepsy');
      actions.push('PLP-dependent epilepsy: defect в conversion pyridoxine → PLP active form');
      actions.push('Trial 30 мг/кг/сут PO q6h × 3-5 дней');
      actions.push('Improvement в 1-3 days если PLP-responsive');
      actions.push('Maintenance: 30-50 мг/кг/сут lifelong если confirmed');
    } else {
      actions.push('--- Maintenance therapy (confirmed PDE) ---');
      actions.push('Когда: positive trial dose response + clinical/genetic confirmation');
      actions.push('Doza: 15-30 мг/кг/сут PO разделить q12h (или q24h по protocol)');
      actions.push('Lifelong therapy (PDE — chronic genetic condition)');
      actions.push('Concomitant: low-protein diet, lysine restriction (некоторые protocols)');
    }

    actions.push('--- ⚠️ Apnea risk ---');
    actions.push('IV pyridoxine может cause respiratory depression / apnea');
    actions.push('Anesthesia / cardiopulmonary team standby во время acute trial');
    actions.push('Equipment: BVM, intubation supplies ready');

    actions.push('--- Diagnosis PDE ---');
    actions.push('Clinical features:');
    actions.push('  - Refractory neonatal seizures (often early onset)');
    actions.push('  - Variable: tonic, clonic, myoclonic');
    actions.push('  - Improvement с pyridoxine');
    actions.push('Lab:');
    actions.push('  - α-AASA (α-aminoadipic semialdehyde) urinary — diagnostic если ↑');
    actions.push('  - ALDH7A1 gene mutation (PDE-1) — most common PDE');
    actions.push('  - PNPO gene mutation (PLP-dependent) — PLP-responsive epilepsy');
    actions.push('  - Pipecolic acid serum/CSF (variable elevation)');

    actions.push('--- Long-term outcomes PDE ---');
    actions.push('Treated: most achieve seizure control + cognitive normal');
    actions.push('Untreated: status epilepticus, cognitive impairment');
    actions.push('Late diagnosis: residual cognitive deficits common даже после treatment');
    actions.push('Genetic counseling family');

    actions.push('--- Side effects ---');
    actions.push('Apnea / respiratory depression (acute IV — most concerning)');
    actions.push('Sedation (с large doses)');
    actions.push('Sensory neuropathy (chronic high-dose adults — rare у н/р short-term)');
    actions.push('Photosensitivity (rare у н/р)');
    actions.push('GI: nausea, vomiting (PO)');

    return {
      value: totalMg.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: '#8B5CF6',
      details: m.dose ? `${m.dose} мг ${m.freq} ${m.route}.` : `${m.perKg} мг/кг/сут × ${w} кг = ${totalMg.toFixed(1)} мг ${m.freq} ${m.route}.`,
      actions,
    };
  },
  caveats: [
    'Pyridoxine trial: refractory neonatal seizures без clear cause после phenobarbital + lev + midazolam fails',
    'EEG monitoring критично во время acute trial',
    'Apnea risk (acute IV) — anesthesia / cardiopulmonary team standby',
    'PDE diagnosis: α-AASA urinary + ALDH7A1 gene mutation (most common)',
    'PLP-dependent epilepsy: PNPO gene mutation — try PLP if pyridoxine no response',
    'Late diagnosis у untreated PDE: residual cognitive deficits common',
    'Maintenance lifelong therapy для confirmed PDE',
    'Pyridoxine 100 мг/мл vials standard; dilution к 50 мг/мл для small dose',
    'PO bioavailability 100 % — easy IV→PO switch',
    'Concomitant: low-protein diet (некоторые protocols) для PDE',
    'Genetic counseling family необходимо',
    'Differential diagnosis с other inborn errors of metabolism (sulfite oxidase, MoCo)',
  ],
  related: [
    { id: 'neo-phenobarbital-dose', title: 'Фенобарбитал' },
    { id: 'neo-levetiracetam-dose', title: 'Леветирацетам' },
    { id: 'neo-midazolam-dose', title: 'Мидазолам' },
    { id: 'thompson', title: 'Thompson / Sarnat' },
  ],
  info: `### Пиридоксин (B6) у новорождённых

Emergency treatment + maintenance для **pyridoxine-dependent epilepsy (PDE)**
и related conditions.

### Дозы

#### Acute trial
- **50-100 мг IV slow push** 1-2 мин под EEG monitoring
- Repeat × 2 если no response (max 200-300 мг)

#### Maintenance (confirmed PDE)
| Уровень | Доза |
|---|---|
| Low | 15 мг/кг/сут PO q12h |
| **Standard** | **15-30 мг/кг/сут PO q12h** |
| High | 30 мг/кг/сут PO q12h |

#### PLP (pyridoxal phosphate) trial
- 30-50 мг/кг/сут PO q6h × 3-5 days

### Когда trial pyridoxine

#### Indications:
- **Refractory neonatal seizures** без clear cause
- Failed: phenobarbital + levetiracetam + midazolam
- Suspected pyridoxine-dependent epilepsy (PDE)
- Family history seizures of unknown etiology
- Onset usually first hours-days of life

### Trial method

1. **EEG monitoring** continuous (CRITICAL)
2. **Anesthesia / cardiopulmonary standby** (apnea risk)
3. **50-100 мг IV slow push** 1-2 мин
4. **Watch для:**
   - Seizure cessation в 5-10 мин
   - EEG normalization
   - Apnea / hypotension
5. **If no response:** repeat × 2 (max 200-300 мг)
6. **If still no response:** consider PLP trial

### PDE diagnosis

| Lab | PDE consistent |
|---|---|
| **α-AASA urinary** | ↑ (diagnostic) |
| **ALDH7A1 gene** | Mutation (most common PDE) |
| **PNPO gene** | Mutation (PLP-dependent) |
| **Pipecolic acid** | ↑ serum/CSF |
| **Glutamate / GABA** | Imbalance |

### Differential

| Condition | Test |
|---|---|
| **PDE** | α-AASA urinary, ALDH7A1 |
| **PLP-dependent** | PNPO gene |
| **Sulfite oxidase deficiency** | Urinary sulfites |
| **Molybdenum cofactor** | Urinary thiosulfate |
| **Folinic acid responsive** | Folinic acid trial |

### Pharmacokinetics

| Параметр | Value |
|---|---|
| **Onset IV** | 5-10 мин (если responsive) |
| **Bioavailability PO** | ~ 100 % |
| **t½** | 30 days (tissue saturation) |
| **Active form** | Pyridoxal-5'-phosphate (PLP) |

### Apnea risk

⚠️ **Acute IV pyridoxine может cause:**
- Respiratory depression
- Apnea
- Sedation
- Hypotension (rare у н/р)

#### Preparation:
- BVM (bag-valve-mask) ready
- Intubation supplies
- Anesthesia / cardiopulmonary team
- Continuous monitoring HR, BP, SpO₂

### PDE long-term outcomes

| | Treated early | Untreated / late diagnosis |
|---|---|---|
| **Seizure control** | Most achieve | Status epilepticus |
| **Cognitive** | Normal в most cases | Variable impairment |
| **Quality of life** | Near-normal | Significantly reduced |
| **Therapy duration** | Lifelong | — |

### Maintenance protocol PDE

#### Standard regimen:
- **Pyridoxine 15-30 мг/кг/сут PO** разделить q12h
- **Lifelong therapy**
- Some protocols add:
  - Lysine restriction (low-protein diet)
  - Folinic acid 3-5 мг/сут
  - Arginine supplementation

#### Monitoring:
- Seizure log
- EEG periodic
- Developmental assessment q6 мес
- Genetic counseling family

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| **Apnea** (acute IV) | + | Standby, slow push |
| Sedation | + | Self-limited |
| Sensory neuropathy | chronic high-dose adults | Rare у н/р |
| Photosensitivity | rare | — |
| GI: nausea | PO | Reduce dose |

### Concentrations

| Form | Concentration |
|---|---|
| **IV vials** | 100 мг/мл |
| **PO tablets** | 25, 50, 100 мг |
| **PO suspension** | 25 мг/мл (compounded) |

### Источники

- Stockler S et al. — PDE clinical guidelines
- Pearl PL et al. — neonatal seizures B6 review
- Mills PB et al. — PDE biochemistry
- AAP CFN — neonatal seizures
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "Судороги новорождённых" (2024)
`,
};

export default runner;
