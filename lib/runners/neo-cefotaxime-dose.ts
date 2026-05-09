/**
 * Runner: neo-cefotaxime-dose — Цефотаксим (3rd gen cephalosporin для meningitis suspect)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * 3-rd generation cephalosporin. Используется когда suspect meningitis
 * (alternative gentamicin) или в combination с ампициллином для broader
 * coverage gram-negative. Better CSF penetration than aminoglycosides.
 *
 * Дозы (PMA + PNA):
 *   PMA ≤ 29 нед, PNA 0-28 дн: 50 мг/кг q12h
 *   PMA ≤ 29 нед, PNA > 28 дн: 50 мг/кг q8h
 *   PMA 30-36 нед, PNA 0-14 дн: 50 мг/кг q12h
 *   PMA 30-36 нед, PNA > 14 дн: 50 мг/кг q8h
 *   PMA ≥ 37 нед, PNA 0-7 дн: 50 мг/кг q12h
 *   PMA ≥ 37 нед, PNA > 7 дн: 50 мг/кг q8h
 *
 *   Meningitis: 50 мг/кг q6h (q8h в неонат — adjust по PMA/PNA)
 *
 * SOURCES:
 *   - AAP Red Book (2021-2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - КР МЗ РФ "Бактериальный сепсис н/р" / "Менингит" (2024)
 *
 * Vs ceftriaxone:
 *   Cefotaxime preferred у н/р; ceftriaxone bilirubin displacement (kernicterus risk)
 *   и Ca-induced precipitation (cardiac arrest).
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP Red Book / NeoFax) · РФ',
  reference: 'AAP Red Book 2021-2024. NeoFax. КР МЗ РФ "Бактериальный сепсис н/р".',
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
      label: 'PMA (постменструальный возраст, нед)',
      type: 'select',
      options: [
        { value: '28', label: '≤ 29 нед' },
        { value: '34', label: '30-36 нед' },
        { value: '40', label: '≥ 37 нед' },
      ],
    },
    {
      id: 'pna',
      label: 'PNA (постнатальный возраст)',
      type: 'select',
      options: [
        { value: 'early', label: 'Ранний (≤ 7-28 дней по PMA)' },
        { value: 'late', label: 'Поздний (> 7-28 дней по PMA)' },
      ],
    },
    {
      id: 'indication',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'sepsis', label: 'Sepsis (без meningitis)' },
        { value: 'meningitis', label: 'Meningitis (q6h dosing)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const pma = Number(values.pma ?? 40);
    const pna = String(values.pna ?? 'early');
    const indication = String(values.indication ?? 'sepsis');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    let freq = 'q12h';
    if (pma <= 29) {
      freq = pna === 'late' ? 'q8h' : 'q12h';
    } else if (pma <= 36) {
      freq = pna === 'late' ? 'q8h' : 'q12h';
    } else {
      freq = pna === 'late' ? 'q8h' : 'q12h';
    }

    if (indication === 'meningitis') {
      freq = pma <= 29 ? freq : 'q6h';
    }

    const dosePerKg = 50;
    const total = w * dosePerKg;
    const conc = 100; // мг/мл стандартный после reconstitution (1 г vial + 10 мл = 100 мг/мл)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Цефотаксим: ${total.toFixed(0)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл (reconstituted)`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${freq}`);
    actions.push('Путь: IV slow infusion 15-30 мин (или slow push 3-5 мин)');

    actions.push('--- Когда выбирать cefotaxime ---');
    actions.push('Suspect meningitis (gram-negative coverage в CSF лучше чем gentamicin)');
    actions.push('Broad gram-negative cover: E. coli, Klebsiella, Enterobacter, Citrobacter');
    actions.push('Combination с ампициллином для EOS empiric (вместо gent при meningitis suspected)');
    actions.push('Allergy / intolerance к гентамицину');
    actions.push('Renal failure (gent contraindicated)');

    actions.push('--- ⚠️ Vs ceftriaxone ---');
    actions.push('Cefotaxime preferred у н/р (особенно < 28 дней)');
    actions.push('Ceftriaxone CONTRAINDICATED:');
    actions.push('  - Bilirubin displacement → kernicterus risk');
    actions.push('  - Calcium-containing IV solutions (lactated Ringer, Ca gluc) → precipitation, cardiac arrest');
    actions.push('  - Premature < 41 нед PMA — high-risk hyperbili');

    actions.push('--- Длительность ---');
    if (indication === 'meningitis') {
      actions.push('Meningitis: 14-21 день course (уверенно negative CSF cultures)');
      actions.push('LP repeat 24-48 ч после initiation для confirmation efficacy');
      actions.push('Switch к narrow-spectrum после culture results если sensitive');
    } else {
      actions.push('Sepsis: 7-10 дней (positive culture); 36-48 ч (negative + improvement)');
    }

    actions.push('--- Спектр ---');
    actions.push('Чувствительны: Streptococci (S. pneumoniae, S. agalactiae GBS), E. coli, Klebsiella');
    actions.push('Resist some: Enterococcus (intrinsic), Pseudomonas (use ceftazidime), MRSA, anaerobes');
    actions.push('ESBL-producing: variable — consider meropenem');

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose, lactated Ringer (с cefotaxime, НЕ ceftriaxone)');
    actions.push('НЕСОВМЕСТИМО (in-line): aminoglycosides (gent — separate lumens / flush)');
    actions.push('Stable 24 ч @ 25°C после reconstitution');

    actions.push('--- Side effects ---');
    actions.push('Allergic reactions (β-lactam group — cross-react с penicillin 1-3 %)');
    actions.push('Diarrhea, GI upset (rare у NPO н/р)');
    actions.push('Тромбоцитопения, neutropenia (rare)');
    actions.push('Pseudomembranous colitis (С. difficile) — редко у н/р');
    actions.push('Disulfiram-like reaction (не cefotaxime — ceftriaxone)');

    return {
      value: total.toFixed(0),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${dosePerKg} мг/кг ${freq} (${indication === 'meningitis' ? 'meningitis' : 'sepsis'})`,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(0)} мг ${freq}, IV slow infusion 15-30 мин.`,
      actions,
    };
  },
  caveats: [
    'Cefotaxime preferred у н/р over ceftriaxone (bilirubin displacement risk + Ca precipitation)',
    'Better CSF penetration than aminoglycosides — preferred при подозрении meningitis',
    'Combination ампициллин + cefotaxime — broader EOS coverage, особенно при meningitis suspected',
    'Length of treatment: sepsis 7-10 d (positive); meningitis 14-21 d',
    'LP repeat 24-48 h после initiation meningitis treatment для confirmation efficacy',
    'Switch к narrow-spectrum (e.g. ампициллин alone для GBS) после culture sensitivity',
    'Renal-dependent excretion — adjust в renal failure',
    'Совместимость с aminoglycosides in vivo, но НЕ in vitro (separate lumens / flush 0.9 % NaCl)',
    'Cross-reactivity с penicillin 1-3 % (не universal contraindication)',
    'Resistant: Enterococcus (intrinsic), Pseudomonas (use ceftazidime), anaerobes',
    'ESBL-producing E. coli / Klebsiella: variable resistance — consider meropenem',
  ],
  related: [
    { id: 'neo-ampicillin-dose', title: 'Ампициллин н/р' },
    { id: 'neo-gentamicin-dose', title: 'Гентамицин н/р' },
    { id: 'neo-vancomycin-dose', title: 'Ванкомицин н/р' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
  ],
  info: `### Цефотаксим у новорождённых

3rd gen cephalosporin — preferred over ceftriaxone у н/р. Better CSF
penetration; combination с ампициллином для broader EOS coverage.

### Дозы 50 мг/кг

| PMA | PNA | Frequency (sepsis) | Frequency (meningitis) |
|---|---|---|---|
| ≤ 29 нед | 0-28 дн | q12h | q12h |
| ≤ 29 нед | > 28 дн | q8h | q8h |
| 30-36 нед | 0-14 дн | q12h | q12h |
| 30-36 нед | > 14 дн | q8h | q8h |
| ≥ 37 нед | 0-7 дн | q12h | q8h |
| ≥ 37 нед | > 7 дн | q8h | **q6h** |

### ⚠️ Cefotaxime vs Ceftriaxone у н/р

#### Cefotaxime (preferred у н/р):
- ✅ No bilirubin displacement
- ✅ Compatible с Ca-containing IV
- ✅ Safe у hyperbilirubinemia близкой к exchange threshold

#### Ceftriaxone (CONTRAINDICATED у н/р):
- ⚠️ Displaces bilirubin от albumin → kernicterus risk
- ⚠️ Precipitates с Ca (lactated Ringer, Ca gluc) → cardiac arrest, fatal cases reported
- ⚠️ Avoid у < 41 нед PMA
- ⚠️ Avoid с calcium-containing IV solutions

### Когда использовать cefotaxime

| Indication | Choice |
|---|---|
| **Suspected meningitis** | Cefotaxime (better CSF penetration than gent) |
| **EOS с meningitis suspect** | Ampi + cefotaxime |
| **Renal failure** (no gent) | Cefotaxime + ampi |
| **Aminoglycoside allergy** | Cefotaxime + ampi |
| **Broad gram-negative** | Cefotaxime |

### Спектр

| Чувствительны | Резистентны |
|---|---|
| Streptococci (S. pneumoniae, GBS) | Enterococcus (intrinsic) |
| E. coli (most) | Pseudomonas (use ceftazidime) |
| Klebsiella | MRSA |
| Enterobacter | Anaerobes (most) |
| H. influenzae | ESBL-producing (variable) |
| Citrobacter | C. difficile |

### Длительность

| Indication | Длительность |
|---|---|
| Sepsis (positive) | 7-10 дней |
| Sepsis (negative + improvement) | 36-48 ч |
| **Meningitis** | **14-21 день** |
| GBS meningitis | 14 дней |
| Gram-negative meningitis | 21+ дней |

### Combination logic

| Combination | Application |
|---|---|
| **Ampi + cefotaxime** | EOS + meningitis suspect |
| **Ampi + cefotaxime + vanco** | LOS с CONS / MRSA suspect |
| **Cefotaxime + clindamycin** | Aspiration / anaerobic |
| **Cefotaxime + metronidazole** | Intra-abdominal sepsis |

### Совместимость

| Совместимо | Несовместимо |
|---|---|
| 0.9 % NaCl | Aminoglycosides in-line |
| 5 % Glucose | (separate lumens) |
| **Lactated Ringer** (Ca-containing OK с cefotaxime) | Vancomycin (некоторые) |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Allergic reactions | β-lactam group | Discontinue если severe |
| GI upset | rare у NPO | — |
| Тромбоцитопения | rare | Monitor CBC |
| Pseudomembranous colitis | rare у н/р | Diarrhea workup |
| Eosinophilia | + | Self-limited |

### Cross-reactivity

- **Penicillin allergy:** 1-3 % cross-reactivity to cephalosporins
- Skin testing if history severe penicillin reaction
- Aztreonam alternative (no cross-react)

### Источники

- AAP Red Book 2021-2024
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Бактериальный сепсис н/р" / "Менингит" (2024)
- Bradley JS et al. — neonatal pharmacokinetics
`,
};

export default runner;
