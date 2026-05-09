/**
 * Runner: neo-meropenem-dose — Меропенем (broad-spectrum / MDR)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Carbapenem antibiotic — broad-spectrum, активен против gram-negative
 * (включая ESBL), gram-positive (кроме MRSA, VRE), anaerobes. Reserve agent
 * для multi-drug resistant organisms или severe sepsis с meningitis.
 *
 * Дозы (PMA + PNA):
 *   Sepsis (без meningitis):
 *     PMA ≤ 32 нед, PNA 0-7 дн: 20 мг/кг q12h
 *     PMA ≤ 32 нед, PNA > 7 дн: 20 мг/кг q8h
 *     PMA > 32 нед, PNA 0-7 дн: 20 мг/кг q8h
 *     PMA > 32 нед, PNA > 7 дн: 20 мг/кг q8h
 *
 *   Meningitis: 40 мг/кг q8h (× 2 sepsis dose)
 *
 *   NEC perforation / intra-abdominal: 30 мг/кг q8h
 *
 * SOURCES:
 *   - AAP Red Book (2021-2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - Cohen-Wolkowiez M et al. — neonatal meropenem PK
 *   - КР МЗ РФ "Бактериальный сепсис н/р" (2024)
 *
 * Reserve antibiotic — не routine; usage warrants antibiotic stewardship review.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NeoFax / BNFc) · РФ',
  reference: 'AAP Red Book 2021-2024. NeoFax. Cohen-Wolkowiez M neonatal PK. КР МЗ РФ.',
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
      id: 'pma',
      label: 'PMA (нед)',
      type: 'select',
      options: [
        { value: '30', label: '≤ 32 нед' },
        { value: '38', label: '> 32 нед' },
      ],
    },
    {
      id: 'pna',
      label: 'PNA',
      type: 'select',
      options: [
        { value: 'early', label: '0-7 дней' },
        { value: 'late', label: '> 7 дней' },
      ],
    },
    {
      id: 'indication',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'sepsis', label: 'Sepsis (без meningitis): 20 мг/кг' },
        { value: 'meningitis', label: 'Meningitis: 40 мг/кг (×2)' },
        { value: 'abdominal', label: 'NEC / intra-abdominal: 30 мг/кг' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const pma = Number(values.pma ?? 38);
    const pna = String(values.pna ?? 'early');
    const indication = String(values.indication ?? 'sepsis');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    let dosePerKg = 20;
    let freq = 'q8h';

    if (indication === 'meningitis') {
      dosePerKg = 40;
      freq = 'q8h';
    } else if (indication === 'abdominal') {
      dosePerKg = 30;
      freq = 'q8h';
    } else {
      // sepsis
      dosePerKg = 20;
      freq = (pma <= 32 && pna === 'early') ? 'q12h' : 'q8h';
    }

    const total = w * dosePerKg;
    const conc = 50; // мг/мл стандартный после reconstitution (500 мг + 10 мл sterile water = 50 мг/мл)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Меропенем: ${total.toFixed(0)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл (reconstituted)`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${freq}`);
    actions.push('Путь: IV slow infusion 30 мин (или extended infusion 3 ч for severe infections)');

    actions.push('--- Когда использовать ---');
    actions.push('Reserve antibiotic — не routine');
    actions.push('Indications:');
    actions.push('  - Multi-drug resistant gram-negative (ESBL, AmpC)');
    actions.push('  - Severe sepsis с meningitis suspect');
    actions.push('  - NEC perforation / intra-abdominal sepsis');
    actions.push('  - Health-care associated late-onset sepsis');
    actions.push('  - β-lactam allergy без alternative effective options');

    actions.push('--- Антибиотик stewardship ---');
    actions.push('Меропенем — reserve antibiotic; broad use → resistance');
    actions.push('Antibiotic stewardship review при initiation');
    actions.push('Narrow к specific antibiotic как только sensitivities available');
    actions.push('Длительность: standard 7-10 d sepsis; 14-21 d meningitis; 10-14 d NEC');

    actions.push('--- Спектр ---');
    actions.push('Чувствительны: most gram-negative (включая ESBL, AmpC), gram-positive (Streptococci, Listeria), anaerobes');
    actions.push('Особенно strong: Pseudomonas, Acinetobacter, ESBL-producing Enterobacteriaceae');
    actions.push('Резистентны: MRSA / MRSE, VRE, Stenotrophomonas, некоторые Enterococci');
    actions.push('Limited activity: Mycoplasma, atypical organisms');

    actions.push('--- Длительность по типу ---');
    if (indication === 'meningitis') {
      actions.push('Meningitis: 14-21 день (longer due к CSF penetration variability)');
      actions.push('LP repeat 24-48 h после initiation для confirm efficacy');
    } else if (indication === 'abdominal') {
      actions.push('NEC / intra-abdominal: 10-14 день');
      actions.push('Combination с metronidazole для full anaerobic coverage (хотя meropenem covers most)');
    } else {
      actions.push('Sepsis: 7-10 day (positive culture); 36-48 h (negative + improvement)');
    }

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose');
    actions.push('Stable 1-3 ч post-reconstitution at room temp; 24 h refrigerated');
    actions.push('Compatible с многими IV препаратами; check specific compatibility');
    actions.push('НЕСОВМЕСТИМО: lactated Ringer (precipitate); aminoglycosides in-line (separate lumens)');

    actions.push('--- Side effects ---');
    actions.push('GI: diarrhea, vomiting');
    actions.push('Тромбоцитопения, eosinophilia (rare)');
    actions.push('Hepatic enzyme elevation (rare)');
    actions.push('Allergic reactions (β-lactam group; cross-react с penicillin 1-3 %)');
    actions.push('Seizures у high-dose / renal failure (CSF accumulation)');
    actions.push('С. difficile colitis (rare у н/р)');

    actions.push('--- Drug interactions ---');
    actions.push('Valproic acid: ↓ valproic acid levels (possible loss seizure control)');
    actions.push('Probenecid: ↑ meropenem levels (reduce probenecid in renal failure)');

    return {
      value: total.toFixed(0),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${dosePerKg} мг/кг ${freq} (${indication === 'meningitis' ? 'meningitis' : indication === 'abdominal' ? 'abdominal' : 'sepsis'})`,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(0)} мг ${freq}, IV slow infusion 30 мин.`,
      actions,
    };
  },
  caveats: [
    'Reserve antibiotic — не routine; antibiotic stewardship review at initiation',
    'Broad spectrum: gram-positive, gram-negative (включая ESBL, AmpC), anaerobes',
    'Resistant: MRSA / MRSE, VRE, Stenotrophomonas, некоторые atypical organisms',
    'Better CSF penetration than ампициллин/гентамицин — preferred meningitis (MDR organisms)',
    'NEC perforation / intra-abdominal: 30 мг/кг q8h — broad coverage including anaerobes',
    'Длительность: 7-10 d sepsis, 14-21 d meningitis, 10-14 d NEC',
    'Narrow к specific antibiotic как только sensitivities available',
    'Renal-dependent excretion — adjust в renal failure (extend interval)',
    'Seizures у high-dose / renal failure: CSF accumulation; reduce dose если concerning',
    'Valproic acid interaction: ↓ valproic levels (avoid concomitant если possible)',
    'Cross-react с penicillin allergy 1-3 %; severe penicillin allergy → consider alternative',
    'Cost ↑↑ vs ампициллин + гентамицин combination',
  ],
  related: [
    { id: 'neo-ampicillin-dose', title: 'Ампициллин н/р' },
    { id: 'neo-gentamicin-dose', title: 'Гентамицин н/р' },
    { id: 'neo-vancomycin-dose', title: 'Ванкомицин н/р' },
    { id: 'neo-cefotaxime-dose', title: 'Цефотаксим н/р' },
  ],
  info: `### Меропенем у новорождённых

Carbapenem broad-spectrum reserve antibiotic. Used для multi-drug
resistant infections, severe sepsis с meningitis, NEC perforation.

### Дозы

| Indication | Доза | Frequency |
|---|---|---|
| **Sepsis** PMA ≤ 32 + PNA 0-7 d | 20 мг/кг | q12h |
| **Sepsis** other | 20 мг/кг | q8h |
| **Meningitis** | **40 мг/кг** | q8h |
| **NEC / intra-abdominal** | 30 мг/кг | q8h |

### Спектр

#### Strong:
- **Pseudomonas aeruginosa**
- **Acinetobacter**
- **ESBL-producing Enterobacteriaceae** (E. coli, Klebsiella)
- **AmpC β-lactamase producers** (Enterobacter, Citrobacter, Serratia)
- Streptococci (S. agalactiae GBS, S. pneumoniae)
- Listeria monocytogenes
- Anaerobes (Bacteroides fragilis, Clostridium)

#### Resistant:
- **MRSA** / MRSE
- **VRE** (most strains)
- **Stenotrophomonas maltophilia**
- Some atypical (Mycoplasma, Chlamydia)
- C. difficile

### Когда выбирать меропенем

| Indication | Choice |
|---|---|
| **Multi-drug resistant gram-negative** | Meropenem first |
| **ESBL E. coli / Klebsiella** | Meropenem |
| **NEC perforation** | Meropenem (broad coverage) |
| **HCAP / late-onset sepsis** | Meropenem ± vanco |
| **Meningitis с MDR concerns** | Meropenem |
| **β-lactam allergy без alternative** | Discuss alternatives first |

### Antibiotic stewardship principles

1. **Не routine** — reserve agent
2. **Stewardship review** at initiation
3. **Document indication**
4. **Narrow к specific antibiotic** asap (sensitivities)
5. **Длительность** as recommended (не extended without indication)

### Pharmacokinetics

| Параметр | Term | Preterm |
|---|---|---|
| **t½** | 1.5-2 ч | 2-3 ч |
| **CSF penetration** | 20-30 % | 20-30 % |
| **Renal excretion** | major | major |
| **Vd** | 0.4 л/кг | 0.4 л/кг |

### Длительность

| Type | Длительность |
|---|---|
| Sepsis (positive) | 7-10 дней |
| Sepsis (negative + improvement) | 36-48 ч |
| **Meningitis** | **14-21 день** |
| NEC / intra-abdominal | 10-14 дней |
| Endocarditis | 4-6 недель |

### Reconstitution / administration

- **500 мг vial + 10 мл sterile water** = 50 мг/мл
- **Stable** 1-3 ч room temp; 24 ч refrigerated
- **IV slow infusion** 30 мин (или extended 3 ч for severe)
- **Compatible** с 0.9 % NaCl, 5 % glucose
- **Incompatible** с lactated Ringer (precipitate)

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| GI symptoms | + | Reduce dose if severe |
| Allergic reactions | β-lactam | Discontinue if severe |
| Тромбоцитопения | rare | Monitor CBC |
| Eosinophilia | + | Self-limited |
| ↑ LFTs | rare | Monitor |
| Seizures | high-dose / renal failure | Reduce dose |
| C. difficile | rare у н/р | Diarrhea workup |

### Drug interactions

| Drug | Effect |
|---|---|
| **Valproic acid** | ↓ valproic levels (loss seizure control) |
| **Probenecid** | ↑ meropenem levels |
| **Aminoglycosides** | ↑ nephrotoxicity (combined) |

### Источники

- AAP Red Book 2021-2024
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- Cohen-Wolkowiez M et al. — neonatal meropenem PK
- КР МЗ РФ "Бактериальный сепсис н/р" (2024)
`,
};

export default runner;
