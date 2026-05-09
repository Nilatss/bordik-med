/**
 * Runner: neo-metronidazole-dose — Метронидазол (anaerobic, NEC)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Anaerobic-spectrum antibiotic для NEC (некротизирующий энтероколит),
 * intra-abdominal sepsis, anaerobic bacteremia. Часть triple-therapy для
 * NEC (ампициллин + гентамицин + метронидазол).
 *
 * Дозы (по PMA + PNA):
 *   PMA ≤ 29 нед, PNA 0-28 дн: 7.5 мг/кг q24h IV/PO
 *   PMA ≤ 29 нед, PNA > 28 дн: 7.5 мг/кг q12h
 *   PMA 30-36 нед, PNA 0-14 дн: 7.5 мг/кг q12h
 *   PMA 30-36 нед, PNA > 14 дн: 7.5 мг/кг q8h
 *   PMA ≥ 37 нед, PNA 0-7 дн: 7.5 мг/кг q12h
 *   PMA ≥ 37 нед, PNA > 7 дн: 7.5 мг/кг q8h
 *
 * Loading dose: 15 мг/кг (рассмотреть при serious infection)
 *
 * SOURCES:
 *   - AAP Red Book (2021-2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - КР МЗ РФ "НЭК" / "Бактериальный сепсис н/р" (2024)
 *   - Cochrane Antibiotics for NEC 2017
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NeoFax / BNFc) · РФ',
  reference: 'AAP Red Book 2021-2024. NeoFax. КР МЗ РФ НЭК. Cochrane Antibiotics for NEC 2017.',
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
      id: 'mode',
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'standard', label: 'Standard 7.5 мг/кг' },
        { value: 'load', label: 'Loading 15 мг/кг (serious infection)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const pma = Number(values.pma ?? 40);
    const pna = String(values.pna ?? 'early');
    const mode = String(values.mode ?? 'standard');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    // Frequency matrix
    let freq = 'q24h';
    if (pma <= 29) {
      freq = pna === 'late' ? 'q12h' : 'q24h';
    } else if (pma <= 36) {
      freq = pna === 'late' ? 'q8h' : 'q12h';
    } else {
      freq = pna === 'late' ? 'q8h' : 'q12h';
    }

    const dosePerKg = mode === 'load' ? 15 : 7.5;
    const total = w * dosePerKg;
    // Стандартная concentration metronidazole в premixed bag: 5 мг/мл
    const conc = 5;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Метронидазол: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ 5 мг/мл (premixed)`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${mode === 'load' ? '(loading)' : freq}`);
    actions.push('Путь: IV slow infusion 30-60 мин (НЕ rapid push)');

    actions.push('--- Show-up ---');
    actions.push('NEC stage IIB+ (definite + radiological signs): triple-therapy с amp + gent');
    actions.push('Intra-abdominal sepsis (abdominal abscess, perforation)');
    actions.push('Anaerobic bacteremia (Bacteroides, Clostridium)');
    actions.push('Bacterial vaginosis у matери — vertical transmission');

    actions.push('--- Длительность ---');
    actions.push('NEC: 7-14 дней по тяжести и response');
    actions.push('Intra-abdominal sepsis: 10-14 дней');
    actions.push('Anaerobic bacteremia: 7-14 дней');

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose, lactated Ringer');
    actions.push('НЕСОВМЕСТИМО (in-line): aluminum (precipitate), некоторые cephalosporins');
    actions.push('Stable 30 дней при 25°C; protect from light при > 24 ч');

    actions.push('--- Side effects ---');
    actions.push('GI: nausea, vomiting, diarrhea (rare у н/р receiving NPO)');
    actions.push('Neurological: peripheral neuropathy (long-term high-dose, rare у н/р short course)');
    actions.push('Hepatic: ↑ LFTs (mild, common); cholestasis rare');
    actions.push('Hematologic: тромбоцитопения, neutropenia (rare)');
    actions.push('Disulfiram-like reaction с alcohol (NB у matери если breastfeeding)');
    actions.push('Carcinogenicity (animal data, not confirmed humans short course)');

    actions.push('--- Спектр ---');
    actions.push('Anaerobic: Bacteroides fragilis, Clostridium species, Fusobacterium, Prevotella');
    actions.push('Microaerophilic: Helicobacter pylori, Campylobacter');
    actions.push('Protozoa: Giardia, Trichomonas (н/р редко)');
    actions.push('НЕ покрывает aerobic gram-positive (CONS, Strep, Enterococcus) или Pseudomonas');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${dosePerKg} мг/кг ${mode === 'load' ? '(loading)' : freq}`,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг IV slow infusion 30-60 мин ${mode === 'load' ? 'однократно' : freq}.`,
      actions,
    };
  },
  caveats: [
    'NEC stage IIB+: triple-therapy ampi + gent + metronidazole — стандарт',
    'Stage IIA: некоторые protocols используют только ampi + gent (anaerobic coverage debated)',
    'Stage IIIB (perforation): broader coverage — meropenem или piperacillin-tazobactam ± vancomycin',
    'IV bioavailability oral ~ 100 % — easy switch при stabilization',
    'Hepatic dysfunction: ↓ доза 50 % при severe (Cr Clearance < 10 → q24h instead of q8-12h)',
    'Renal dysfunction: minor dose adjustment',
    'Cholestasis у premature на TPN — caution; alternative agent если LFTs significantly ↑',
    'Disulfiram-like reaction если matери (breastfeeding) consume alcohol',
    'Cochrane 2017: limited evidence for routine triple-therapy в NEC; current standard',
    'Probiotics + metronidazole — possible interaction (не well studied у н/р)',
  ],
  related: [
    { id: 'neo-bell-nec', title: 'Bell NEC staging' },
    { id: 'neo-ampicillin-dose', title: 'Ампициллин н/р' },
    { id: 'neo-gentamicin-dose', title: 'Гентамицин н/р' },
    { id: 'neo-vancomycin-dose', title: 'Ванкомицин н/р' },
  ],
  info: `### Метронидазол у новорождённых

Anaerobic-spectrum antibiotic для NEC, intra-abdominal sepsis, anaerobic
bacteremia. Часть triple-therapy для NEC.

### Дозы по PMA + PNA

#### Standard 7.5 мг/кг
| PMA | PNA | Frequency |
|---|---|---|
| ≤ 29 нед | 0-28 дн | q24h |
| ≤ 29 нед | > 28 дн | q12h |
| 30-36 нед | 0-14 дн | q12h |
| 30-36 нед | > 14 дн | q8h |
| ≥ 37 нед | 0-7 дн | q12h |
| ≥ 37 нед | > 7 дн | q8h |

#### Loading dose (serious infection)
- 15 мг/кг IV slow infusion 30-60 мин

### Triple-therapy для NEC

| Drug | Доза | Spectrum |
|---|---|---|
| **Ампициллин** | 50-100 мг/кг q12-8h | GBS, Listeria, Enterococcus |
| **Гентамицин** | 4-5 мг/кг q24-48h | E. coli, Klebsiella, Enterobacter |
| **Метронидазол** | 7.5 мг/кг q12-8h | Anaerobes (Bacteroides, Clostridium) |

### Спектр

| Чувствительны | Резистентны |
|---|---|
| Bacteroides fragilis | Aerobic gram-positive (CONS, Strep) |
| Clostridium species | Pseudomonas |
| Fusobacterium | Mycobacteria |
| Prevotella | Most aerobes |
| Microaerophilic (Helicobacter, Campylobacter) | — |
| Protozoa (Giardia, Trichomonas) | — |

### Длительность

| Indication | Длительность |
|---|---|
| NEC IIB-IIIA | 7-14 дней |
| NEC IIIB (perforation) | 10-21 день |
| Intra-abdominal sepsis | 10-14 дней |
| Anaerobic bacteremia | 7-14 дней |

### Stage-specific у NEC (Bell)

| Stage | Antibiotics |
|---|---|
| **IA/IB** (suspected) | Ampi + gent (no metro обычно) |
| **IIA** (definite mild) | Ampi + gent (metro debated) |
| **IIB** (definite mod) | **Triple: ampi + gent + metro** |
| **IIIA** (advanced med) | Triple + ?vanco |
| **IIIB** (perforation) | Meropenem ± vanco |

### Совместимость

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | Aluminum |
| 5 % Glucose | Some cephalosporins |
| Lactated Ringer | — |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| ↑ LFTs | common (mild) | Monitor |
| Холестаз | rare | Discontinue if persists |
| Тромбоцитопения | rare | Hold if < 50 |
| Neutropenia | rare | Monitor |
| GI symptoms | rare у NPO | — |
| Disulfiram-like с alcohol | maternal breast | Counsel mother |

### Источники

- AAP Red Book 2021-2024
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- Cochrane Antibiotics for NEC 2017
- КР МЗ РФ "НЭК" / "Бактериальный сепсис н/р" (2024)
`,
};

export default runner;
