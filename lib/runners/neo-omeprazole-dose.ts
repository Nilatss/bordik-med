/**
 * Runner: neo-omeprazole-dose — Омепразол (GERD)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Proton pump inhibitor для GERD у preterm. Use controversial — большинство
 * cases GERD у preterm physiologic and self-resolving; PPI overuse linked
 * к NEC, infections, fractures.
 *
 * Дозы:
 *   PO/IV: 0.5-1 мг/кг q24h (разделить q12h если higher dose)
 *   Range: 0.5-1.5 мг/кг/сут
 *
 * Onset: 1-3 дня для full effect
 *
 * SOURCES:
 *   - NASPGHAN/ESPGHAN 2018 — pediatric GERD guidelines (Rosen R et al. JPGN)
 *   - AAP CFN — neonatal GERD
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "ГЭРБ у н/р" (2024)
 *   - Cochrane PPI for GERD в infants 2014
 *
 * Не использовать routinely — only с clear pathological GERD evidence.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NASPGHAN/ESPGHAN 2018 / NeoFax) · РФ',
  reference: 'Rosen R NASPGHAN/ESPGHAN JPGN 2018. AAP CFN. NeoFax. Cochrane 2014. КР МЗ РФ.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 1,
      max: 10,
      step: 0.01,
    },
    {
      id: 'dose_mode',
      label: 'Доза',
      type: 'select',
      options: [
        { value: 'low', label: '0.5 мг/кг q24h (start)' },
        { value: 'med', label: '1 мг/кг q24h (стандарт)' },
        { value: 'high', label: '1.5 мг/кг q24h (high)' },
        { value: 'split', label: '0.7 мг/кг q12h (если once-daily inadequate)' },
      ],
    },
    {
      id: 'route',
      label: 'Путь',
      type: 'select',
      options: [
        { value: 'po', label: 'PO suspension (extemporaneous)' },
        { value: 'iv', label: 'IV slow infusion 30 мин' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const dose = String(values.dose_mode ?? 'med');
    const route = String(values.route ?? 'po');

    if (w <= 0 || w > 10) {
      return { value: '—', interpretation: 'Введите массу 1-10 кг', color: '#9CA3AF', details: '' };
    }

    type OmepMode = { perKg: number; freq: string; label: string };
    const modes: Record<string, OmepMode> = {
      low: { perKg: 0.5, freq: 'q24h', label: 'Low (start)' },
      med: { perKg: 1, freq: 'q24h', label: 'Standard' },
      high: { perKg: 1.5, freq: 'q24h', label: 'High' },
      split: { perKg: 0.7, freq: 'q12h', label: 'Split (twice daily)' },
    };
    const m = modes[dose] ?? modes.med;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const totalPerDose = w * m.perKg;
    // Suspension 2 мг/мл (extemporaneous compounded из 20 мг capsules + sodium bicarbonate)
    const conc = 2;
    const vol = totalPerDose / conc;

    const actions: string[] = [];
    actions.push(`Омепразол: ${totalPerDose.toFixed(1)} мг = ${vol.toFixed(2)} мл @ 2 мг/мл (PO suspension)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${route === 'iv' ? 'IV slow infusion 30 мин' : 'PO 30 мин до feeds'}`);

    actions.push('--- ⚠️ Use selectively ---');
    actions.push('Большинство case GERD у preterm physiologic + self-resolving к 12-18 мес');
    actions.push('Симптомы (regurg, vomiting, irritability) НЕ всегда indicate pathologic GERD');
    actions.push('Use ONLY с evidence: severe esophagitis, weight loss, BPD worsening, persistent symptoms despite conservative measures');
    actions.push('Conservative first: positioning (semi-prone, elevated head), thickened feeds, smaller volume more frequent');
    actions.push('Cochrane 2014: PPI у infants — limited evidence benefit, ↑ adverse events');

    actions.push('--- Когда показан ---');
    actions.push('Esophagitis confirmed (endoscopy + biopsy)');
    actions.push('Bartonella esophageal stricture');
    actions.push('Severe BPD с suspected reflux contributing к respiratory deterioration');
    actions.push('Persistent symptoms despite 2-4 нед conservative measures');
    actions.push('Failure thicken feeds + positioning + small volume frequent feeds');

    actions.push('--- Onset / kinetics ---');
    actions.push('Onset: 1-3 дня для full effect (steady state)');
    actions.push('Peak: 1-2 ч post-dose');
    actions.push('Duration: 24 ч (irreversible inhibition gastric H+/K+ ATPase)');
    actions.push('PO bioavailability: variable у н/р (acid degradation — encapsulated suspension protects)');

    actions.push('--- Мониторинг ---');
    actions.push('Symptoms response: feeding tolerance, weight gain, irritability');
    actions.push('Labs: Mg q3-6 мес (PPI long-term → hypomagnesemia)');
    actions.push('CBC: vit B12 deficiency rare у short-term');
    actions.push('Iron status: PPI ↓ iron absorption (potential)');

    actions.push('--- Side effects ---');
    actions.push('GI: diarrhea, constipation, abdominal pain');
    actions.push('Hypomagnesemia (long-term use)');
    actions.push('Iron deficiency (↓ absorption)');
    actions.push('Vit B12 deficiency (long-term, rare у н/р short-term)');
    actions.push('⚠️ NEC risk — observational studies suggest ↑ risk у preterm');
    actions.push('⚠️ Pneumonia, sepsis — gut microbiome disruption (controversial у н/р)');
    actions.push('Bone fracture risk у long-term (years) — Mg/Ca disturbance');

    actions.push('--- Drug interactions ---');
    actions.push('Clopidogrel (≥ 1 yr age): ↓ active metabolite — avoid combination');
    actions.push('Phenytoin: ↑ phenytoin levels');
    actions.push('Diazepam: ↑ levels');
    actions.push('Iron: ↓ absorption');
    actions.push('Ketoconazole: ↓ absorption (acid-dependent)');

    actions.push('--- Wean ---');
    actions.push('Total course typically 4-12 нед then taper');
    actions.push('Taper: ↓ доза 50 % q1 нед × 2 нед then stop');
    actions.push('Не abrupt stop — rebound гипераcid possible');

    return {
      value: totalPerDose.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг × ${w} кг = ${totalPerDose.toFixed(1)} мг ${m.freq} ${route.toUpperCase()}.`,
      actions,
    };
  },
  caveats: [
    'NASPGHAN/ESPGHAN 2018 (Rosen): PPI у infants — use selectively, не routine для symptoms alone',
    'Большинство GERD у preterm physiologic, self-resolves к 12-18 мес',
    'Cochrane 2014: limited evidence benefit, ↑ adverse events (NEC, pneumonia signals)',
    'Conservative measures FIRST: positioning, thickened feeds, frequent smaller volume, kangaroo',
    'PPI use у preterm associated с ↑ NEC risk (observational, not causal)',
    'Long-term: hypomagnesemia, vit B12 deficiency, iron deficiency, fracture risk (years)',
    'PO bioavailability variable у н/р — IV preferred для critical cases',
    'Suspension extemporaneous: 20 мг omeprazole capsule + 8.4 % NaHCO₃ → 2 мг/мл; stable 30 дней refrigerated',
    'IV form: omeprazole sodium 40 мг vials reconstituted in NS — slow 30 мин',
    'Total course typically 4-12 нед then wean (not lifelong)',
    'H2 blockers (ranitidine, famotidine) — alternative с similar concerns',
  ],
  related: [
    { id: 'neo-erythromycin-dose', title: 'Эритромицин prokinetic' },
    { id: 'neo-enteral', title: 'Enteral feed advancement' },
    { id: 'neo-bell-nec', title: 'Bell NEC staging' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
  ],
  info: `### Омепразол у новорождённых

PPI для pathologic GERD у preterm. Use **selectively** — большинство
GERD у preterm physiologic.

### Дозы

| Уровень | Доза | Frequency |
|---|---|---|
| Low (start) | 0.5 мг/кг | q24h |
| **Standard** | **1 мг/кг** | q24h |
| High | 1.5 мг/кг | q24h |
| Split | 0.7 мг/кг | q12h |

### Когда использовать

#### YES (selective):
- **Esophagitis confirmed** (endoscopy + biopsy)
- **Bartonella esophageal stricture**
- **Severe BPD** с reflux contributing
- **Persistent symptoms** despite conservative × 2-4 нед

#### NO (large majority cases):
- Routine "spitting" / regurg
- Mild irritability
- Suspected GERD without confirmation
- Preterm < 36 нед PMA (high physiologic GERD rate)

### Conservative measures (first-line)

1. **Positioning:** semi-prone, elevated head 30°
2. **Thickened feeds:** rice cereal или specialized formula
3. **Smaller volumes more frequent**
4. **Kangaroo care** (gravity-assisted)
5. **Avoid:** car seats после feeds, supine immediately

### Cochrane 2014 — PPI в infants

- Limited evidence benefit
- ↑ Adverse events (NEC, pneumonia signals)
- → Use only с clear pathologic GERD

### Onset / kinetics

| Параметр | Value |
|---|---|
| **Onset** | 1-3 дня (steady state) |
| **Peak** | 1-2 ч post-dose |
| **Duration** | 24 ч (irreversible) |
| **Mechanism** | H+/K+ ATPase inhibition |

### Side effects

| Effect | Frequency | Mechanism |
|---|---|---|
| GI symptoms | + | Common |
| Hypomagnesemia | long-term | Renal Mg loss |
| ⚠️ NEC ↑ | observational | Microbiome disruption |
| ⚠️ Pneumonia ↑ | observational | Gut bacteria translocation |
| Iron deficiency | + | ↓ absorption |
| Vit B12 deficiency | long-term | Acid-dependent absorption |
| Fracture risk | years | Ca/Mg disturbance |

### Drug interactions

| Drug | Effect |
|---|---|
| **Clopidogrel** (≥ 1 yr) | ↓ active metabolite — avoid |
| **Phenytoin** | ↑ levels |
| **Diazepam** | ↑ levels |
| **Iron** | ↓ absorption |
| **Ketoconazole** | ↓ absorption (acid-dep) |
| **Digoxin** | ↑ levels |

### Wean

- Total course typically **4-12 нед**
- Taper: ↓ 50 % q1 нед × 2 нед
- Не abrupt stop — rebound hypersecretion

### Источники

- Rosen R et al. NASPGHAN/ESPGHAN 2018 (JPGN)
- AAP CFN — neonatal GERD
- Cochrane PPI для GERD в infants 2014
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "ГЭРБ у н/р" (2024)
`,
};

export default runner;
