/**
 * Runner: neo-paracetamol-dose — Парацетамол (analgesia + alternative PDA closure)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Acetaminophen — analgesia + antipyretic у н/р, и alternative для PDA
 * closure (3-я линия после ибупрофен + indomethacin).
 *
 * Дозы:
 *   Analgesia / antipyretic:
 *     PO: 10-15 мг/кг q6-8h (max 75 мг/кг/сут)
 *     IV: 10 мг/кг q6h (slow infusion 15 мин)
 *     PR: 20 мг/кг loading, then 10-15 мг/кг q6-8h
 *
 *   PDA closure (Allegaert protocol):
 *     IV: 15 мг/кг q6h × 3-7 дней
 *     PO: 15 мг/кг q6h × 3-7 дней
 *
 *   Maximum: 60-75 мг/кг/сут
 *
 * SOURCES:
 *   - Allegaert K et al. Pediatrics 2014;134:e253 — paracetamol для PDA closure
 *   - Hammerman C et al. — PDA closure trials
 *   - AAP CFN — Pain Management 2016
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - Cochrane Paracetamol для PDA 2019
 *   - КР МЗ РФ "Анальгезия у н/р" / "ОАП" (2024)
 *
 * Note: Mechanism для PDA closure — peroxidase inhibition (different from
 * COX inhibitor мechanism ибупрофен/индометацин). Lower efficacy but better
 * GI / renal safety.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Allegaert / Cochrane / AAP) · РФ',
  reference: 'Allegaert K Pediatrics 2014;134:e253. Cochrane Paracetamol PDA 2019. AAP CFN 2016.',
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
      label: 'Показание / режим',
      type: 'select',
      options: [
        { value: 'pain_low', label: 'Analgesia low 10 мг/кг q8h PO/PR' },
        { value: 'pain_high', label: 'Analgesia standard 15 мг/кг q6h PO/PR' },
        { value: 'iv_pain', label: 'IV analgesia 10 мг/кг q6h (slow 15 мин)' },
        { value: 'pda_closure', label: 'PDA closure 15 мг/кг q6h × 3-7 дней' },
      ],
    },
    {
      id: 'route',
      label: 'Путь',
      type: 'select',
      options: [
        { value: 'po', label: 'PO suspension (120 мг/5 мл = 24 мг/мл)' },
        { value: 'iv', label: 'IV (Perfalgan 10 мг/мл) — slow infusion 15 мин' },
        { value: 'pr', label: 'PR (suppositories)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'pain_high');
    const route = String(values.route ?? 'po');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type ParaMode = { perKg: number; freq: string; duration: string; label: string };
    const modes: Record<string, ParaMode> = {
      pain_low: { perKg: 10, freq: 'q8h', duration: 'prn', label: 'Analgesia low' },
      pain_high: { perKg: 15, freq: 'q6h', duration: 'prn', label: 'Analgesia standard' },
      iv_pain: { perKg: 10, freq: 'q6h', duration: 'prn', label: 'IV analgesia' },
      pda_closure: { perKg: 15, freq: 'q6h', duration: '3-7 дней', label: 'PDA closure' },
    };
    const m = modes[mode] ?? modes.pain_high;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const totalPerDay = total * (24 / parseInt(m.freq.replace('q', '').replace('h', ''), 10));

    let conc: number;
    let unit: string;
    if (route === 'po') {
      conc = 24; // 120 мг/5 мл = 24 мг/мл
      unit = 'мл (PO suspension)';
    } else if (route === 'iv') {
      conc = 10; // 10 мг/мл (Perfalgan)
      unit = 'мл (IV Perfalgan)';
    } else {
      conc = 1;  // suppository
      unit = 'мг (PR suppository)';
    }
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Парацетамол: ${total.toFixed(1)} мг = ${vol.toFixed(2)} ${unit} @ ${conc} мг/мл`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq} × ${m.duration}`);
    actions.push(`Maximum: ${totalPerDay.toFixed(0)} мг/сут (≤ 60-75 мг/кг/сут)`);
    actions.push(`Путь: ${route === 'iv' ? 'IV slow infusion 15 мин' : route === 'po' ? 'PO suspension' : 'PR suppository'}`);

    if (mode === 'pda_closure') {
      actions.push('--- PDA closure ---');
      actions.push('Showings: hsPDA с contraindications к ибупрофен/indomethacin');
      actions.push('  - Renal failure (Cr > 1.5 мг/дл, oliguria)');
      actions.push('  - Active hemorrhage / тромбоцитопения');
      actions.push('  - NEC / suspected NEC');
      actions.push('  - GI perforation risk');
      actions.push('Mechanism: peroxidase inhibition (different from COX)');
      actions.push('Closure rate: ~ 60 % (lower than ибупрофен ~ 70 %)');
      actions.push('Duration: 3-7 дней; echo через 24-48 ч после course для assessment');
      actions.push('Cochrane 2019: paracetamol non-inferior к ибупрофен для closure');
    } else {
      actions.push('--- Analgesia / antipyretic ---');
      actions.push('Onset PO: 30-60 мин; peak 1-2 ч');
      actions.push('Onset IV: 10-15 мин');
      actions.push('Duration: 4-6 ч');
      actions.push('Combine с non-pharmacological measures (sucrose, kangaroo, swaddling)');
      actions.push('При severe pain: combine с opioids (morphine/fentanyl) — sparing effect');
    }

    actions.push('--- Pharmacokinetics ---');
    actions.push('Hepatic metabolism (CYP2E1, glucuronidation, sulfation)');
    actions.push('t½ у term: 3-4 ч; preterm: 5-10 ч');
    actions.push('Bioavailability PO: 70-90 %');
    actions.push('Bioavailability PR: variable 30-70 %');

    actions.push('--- Maximum dose ---');
    actions.push('Term: 60 мг/кг/сут');
    actions.push('Preterm < 32 нед: 50 мг/кг/сут');
    actions.push('ELBW < 1000 г: 40 мг/кг/сут (caution hepatic immaturity)');
    actions.push('Длительность analgesia: limit к 3-5 дней без specific indication');

    actions.push('--- Side effects ---');
    actions.push('Hepatic: rare hepatotoxicity у therapeutic doses');
    actions.push('Renal: minimal effect (vs NSAIDs)');
    actions.push('GI: well tolerated (no NSAID GI effects)');
    actions.push('Allergic reactions rare');
    actions.push('Stevens-Johnson syndrome (very rare)');
    actions.push('PDA closure: minimal hemodynamic effects (vs ибупрофен/indomethacin)');

    actions.push('--- Vs ибупрофен / indomethacin для PDA ---');
    actions.push('Closure rate: paracetamol 60 % vs ибупрофен 70 % vs indomethacin 70 %');
    actions.push('GI safety: paracetamol > ибупрофен > indomethacin');
    actions.push('Renal safety: paracetamol > ибупрофен > indomethacin');
    actions.push('Use paracetamol когда NSAIDs contraindicated');

    actions.push('--- Hepatotoxicity considerations ---');
    actions.push('Therapeutic doses: very rare hepatotoxicity у н/р');
    actions.push('Toxicity при > 90 мг/кг single dose или > 150 мг/кг/сут');
    actions.push('Antidote: N-acetylcysteine (NAC) если overdose');
    actions.push('Risk factors: malnutrition, sepsis, hepatic compromise, concomitant CYP inducers');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} ${unit})`,
      interpretation: m.label,
      color: '#22C55E',
      details: `${m.perKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг ${m.freq} × ${m.duration}.`,
      actions,
    };
  },
  caveats: [
    'PDA closure alternative: 3-я линия после ибупрофен + indomethacin (Cochrane 2019: non-inferior)',
    'Mechanism для PDA: peroxidase inhibition (different from COX inhibition NSAIDs)',
    'Showings PDA closure paracetamol: NSAID contraindications (renal, GI, hemorrhage, NEC)',
    'Closure rate paracetamol ~ 60 % vs ибупрофен ~ 70 %',
    'Better GI / renal safety profile vs NSAIDs',
    'Maximum daily dose: term 60 мг/кг; preterm < 32 нед 50 мг/кг; ELBW 40 мг/кг',
    'Длительность analgesia: limit к 3-5 дней без specific indication',
    'Hepatic metabolism у preterm slower (t½ 5-10 ч); cumulative toxicity possible',
    'Hepatotoxicity therapeutic doses rare у н/р',
    'Bioavailability variable: PO 70-90 %, PR 30-70 % (variable absorption)',
    'IV form (Perfalgan 10 мг/мл): slow infusion 15 мин (rapid → hypotension)',
    'Combination с opioids: opioid-sparing effect',
  ],
  related: [
    { id: 'neo-ibuprofen-pda-dose', title: 'Ибупрофен PDA' },
    { id: 'neo-indomethacin-pda-dose', title: 'Индометацин PDA' },
    { id: 'neo-fentanyl-dose', title: 'Фентанил н/р' },
    { id: 'neo-morphine-dose', title: 'Морфин н/р' },
  ],
  info: `### Парацетамол у новорождённых

Acetaminophen — analgesia + antipyretic у н/р, alternative для PDA
closure (3-я линия после ибупрофен / indomethacin).

### Дозы

#### Analgesia / antipyretic
| Phase | PO/PR | IV |
|---|---|---|
| Low | 10 мг/кг q8h | — |
| **Standard** | **15 мг/кг q6h** | 10 мг/кг q6h |
| Loading PR | 20 мг/кг (single) | — |

#### PDA closure (Allegaert protocol)
- **15 мг/кг q6h × 3-7 дней**
- IV или PO

### Maximum daily dose

| Group | Max |
|---|---|
| Term | 60 мг/кг/сут |
| Preterm < 32 нед | 50 мг/кг/сут |
| **ELBW < 1000 г** | **40 мг/кг/сут** |

### PDA closure (Allegaert 2014 + Cochrane 2019)

| | Paracetamol | Ibuprofen | Indomethacin |
|---|---|---|---|
| **Closure rate** | ~ 60 % | ~ 70 % | ~ 70 % |
| **Mechanism** | Peroxidase inhibition | COX inhibition | COX inhibition |
| **GI / NEC** | Excellent safety | Moderate | Concerning |
| **Renal** | Minimal | Modest oliguria | Significant |
| **Hemorrhage** | Minimal | Mild platelet dysfunction | Mild |
| **Cerebral BF** | Neutral | Neutral | ↓ |
| **Use** | NSAID contraindications | First-line | Alternative |

### Когда выбирать paracetamol для PDA

| Indication | Reason |
|---|---|
| **Renal failure** (Cr > 1.5) | Avoid NSAID nephrotoxicity |
| **Active hemorrhage / тромбоцитопения** | Better safety |
| **NEC / suspected NEC** | Лучше GI safety |
| **GI perforation risk** | Better profile |
| **Concomitant indomethacin/IBU contraindication** | Alternative |

### Onset / kinetics

| Параметр | PO | IV | PR |
|---|---|---|---|
| **Onset** | 30-60 мин | 10-15 мин | 30-60 мин |
| **Peak** | 1-2 ч | 30 мин | 1-2 ч |
| **t½ term** | 3-4 ч | 3-4 ч | 3-4 ч |
| **t½ preterm** | 5-10 ч | 5-10 ч | 5-10 ч |
| **Bioavailability** | 70-90 % | 100 % | 30-70 % |
| **Duration** | 4-6 ч | 4-6 ч | 4-6 ч |

### Concentration

| Form | Concentration |
|---|---|
| **PO suspension** | 120 мг/5 мл = 24 мг/мл |
| **IV (Perfalgan)** | 10 мг/мл |
| **PR suppositories** | various sizes (60, 80, 125 мг) |

### Hepatic toxicity

#### Therapeutic doses:
- Very rare hepatotoxicity у н/р
- Therapeutic monitoring не routine

#### Toxicity:
- > 90 мг/кг single dose
- > 150 мг/кг/сут sustained
- **Antidote:** N-acetylcysteine (NAC)
  - 150 мг/кг IV loading × 1 ч
  - 50 мг/кг IV × 4 ч
  - 100 мг/кг IV × 16 ч

#### Risk factors:
- Malnutrition
- Sepsis / hepatic compromise
- Concomitant CYP inducers (phenobarbital, phenytoin)
- ELBW (immature hepatic enzymes)

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Hepatic enzyme ↑ | rare у therapeutic | Monitor LFTs если chronic |
| Renal | minimal | Better than NSAIDs |
| GI symptoms | minimal | Better than NSAIDs |
| Allergic reactions | rare | Discontinue если severe |
| Stevens-Johnson | very rare | Discontinue |

### Combination strategies

| Combo | Application |
|---|---|
| **Paracetamol + opioids** | Opioid-sparing effect |
| Paracetamol + sucrose | Procedural pain (synergistic) |
| Paracetamol + EMLA | Procedure preparation |
| Paracetamol monotherapy | Mild-moderate pain |

### Источники

- Allegaert K et al. Pediatrics 2014;134:e253 — PDA closure
- Hammerman C et al. — PDA trials
- AAP CFN 2016 — Pain Management
- Cochrane Paracetamol для PDA 2019
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Анальгезия у н/р" / "ОАП" (2024)
`,
};

export default runner;
