/**
 * Runner: neo-acyclovir-dose — Ацикловир (neonatal HSV)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Antiviral для neonatal HSV (herpes simplex virus) infection.
 * High-dose IV acyclovir — standard of care; suspected или confirmed
 * neonatal HSV — emergency treatment.
 *
 * Дозы:
 *   Empiric / Treatment HSV neonatal:
 *     20 мг/кг IV q8h × 14-21 дней
 *
 *   Skin-eye-mucous (SEM) disease: 14 дней
 *   CNS / disseminated: 21 дней
 *
 *   Suppression therapy после treatment (CASG study):
 *     300 мг/м²/доза PO q8h × 6 мес после treatment
 *
 *   Renal dosing у Cr clearance < 50: extend interval
 *
 * SOURCES:
 *   - Kimberlin DW et al. CASG-103 NEJM 2011;365:1284 — high-dose acyclovir
 *   - AAP Red Book 2021-2024 — HSV
 *   - ACOG/AAP Joint Guidelines on Neonatal HSV
 *   - КР МЗ РФ "Герпесвирусная инфекция у н/р" (2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *
 * Critical: Suspected HSV → start acyclovir empirically (не ждать labs);
 * delays of even hours значительно ↑ mortality.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (CASG / AAP Red Book) · РФ',
  reference: 'Kimberlin DW CASG-103 NEJM 2011;365:1284. AAP Red Book 2021-2024. КР МЗ РФ.',
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
        { value: 'iv_treat', label: 'IV treatment 20 мг/кг q8h (стандарт)' },
        { value: 'po_supp', label: 'PO suppression 300 мг/м²/доза q8h × 6 мес' },
      ],
    },
    {
      id: 'disease_type',
      label: 'Тип HSV болезни',
      type: 'select',
      options: [
        { value: 'sem', label: 'SEM (skin-eye-mucous) — 14 дней' },
        { value: 'cns', label: 'CNS — 21 день' },
        { value: 'dissem', label: 'Disseminated — 21 день' },
        { value: 'empiric', label: 'Empiric (pending labs) — start ASAP' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'iv_treat');
    const disease = String(values.disease_type ?? 'empiric');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    let dosePerKg = 20;
    let freq = 'q8h';
    let conc = 7; // мг/мл стандартный после dilution (powder reconstituted)
    let duration = '';
    let route = 'IV slow infusion 1 ч';

    if (mode === 'po_supp') {
      // BSA-based for suppression: 300 мг/м²
      const bsa = w * 0.05; // approximate BSA
      const totalMg = bsa * 300;
      const volPerDose = totalMg / 40; // suspension 200 мг/5 мл = 40 мг/мл

      const actions: string[] = [];
      actions.push(`Ацикловир suspension: ${totalMg.toFixed(0)} мг = ${volPerDose.toFixed(2)} мл @ 40 мг/мл (PO suspension)`);
      actions.push(`Доза: 300 мг/м² × ${bsa.toFixed(2)} м² × ${w} кг wt`);
      actions.push(`Frequency: q8h (PO)`);
      actions.push('Длительность: 6 мес после completion IV treatment');
      actions.push('Suppression therapy после CNS/disseminated HSV');
      actions.push('CASG-103 trial: ↓ neurodev impairment в 12 мес');
      actions.push('Mонитор: CBC q1 мес (neutropenia possible)');

      return {
        value: totalMg.toFixed(0),
        unit: `мг (${volPerDose.toFixed(2)} мл)`,
        interpretation: 'PO suppression therapy',
        color: '#3B82F6',
        details: `300 мг/м² × ${bsa.toFixed(2)} м² = ${totalMg.toFixed(0)} мг q8h PO × 6 мес.`,
        actions,
      };
    }

    if (disease === 'sem') duration = '14 дней';
    else if (disease === 'cns') duration = '21 день';
    else if (disease === 'dissem') duration = '21 день';
    else duration = 'Empiric — продолжить per culture/PCR results';

    const total = w * dosePerKg;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Ацикловир: ${total.toFixed(0)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл (reconstituted)`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${freq}`);
    actions.push(`Длительность: ${duration}`);
    actions.push(`Путь: ${route}`);

    actions.push('--- ⚠️ Empiric initiation critical ---');
    actions.push('Start acyclovir EMPIRICALLY если HSV suspected — не ждать labs');
    actions.push('Delays of even hours значительно ↑ mortality в disseminated HSV');
    actions.push('Empiric indications:');
    actions.push('  - Maternal HSV genital lesions при родах');
    actions.push('  - Neonatal vesicular rash');
    actions.push('  - Sepsis с negative bacterial cultures');
    actions.push('  - Hepatitis / coagulopathy of unclear etiology');
    actions.push('  - Seizures unexplained');
    actions.push('  - Severe meningoencephalitis у н/р');

    actions.push('--- HSV testing ---');
    actions.push('PCR (виral DNA): blood, CSF, surface swabs (eye, mouth, nose, rectum, skin lesions)');
    actions.push('Culture: surface swabs');
    actions.push('LP с PCR HSV в CSF');
    actions.push('Skin lesion: viral culture + PCR');

    actions.push('--- Mонитор ---');
    actions.push('CBC q24-48h (neutropenia possible — dose adjustment)');
    actions.push('Cr / urea baseline + q48-72h (renal toxicity)');
    actions.push('LFTs q72h');
    actions.push('Adequate hydration ОБЯЗАТЕЛЬНА (acyclovir crystallizes в renal tubules при dehydration)');
    actions.push('Repeat HSV PCR на CSF в end of treatment если CNS disease — confirm clearance');

    actions.push('--- Длительность по типу болезни ---');
    actions.push('SEM (skin-eye-mucous): 14 дней — most common, best outcomes');
    actions.push('CNS: 21 день — longer due к CNS penetration variability');
    actions.push('Disseminated (multi-organ): 21 день — highest mortality');
    actions.push('После IV course → PO suppression 6 мес (CASG-103)');

    actions.push('--- Side effects ---');
    actions.push('Renal toxicity (crystalluria если dehydrated) — adequate hydration critical');
    actions.push('Neutropenia — common у preterm; обычно reversible');
    actions.push('Phlebitis при peripheral access (high pH formulation)');
    actions.push('Hepatic enzyme elevation (rare)');
    actions.push('Encephalopathy (rare у н/р, more concerning у renal failure adults)');

    actions.push('--- Complications ---');
    actions.push('Mortality по типу: SEM 0%, CNS 30-40%, disseminated 80-90% без treatment; с treatment significantly ↓');
    actions.push('Long-term: neurodev sequelae у CNS HSV даже после treatment');
    actions.push('CASG-103: long-term suppression снижает relapse + improves outcomes');

    return {
      value: total.toFixed(0),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${dosePerKg} мг/кг ${freq} (${disease})`,
      color: '#EF4444',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(0)} мг ${freq}, IV slow infusion 1 ч × ${duration}.`,
      actions,
    };
  },
  caveats: [
    'Suspected HSV у н/р — START EMPIRICALLY: delays of hours ↑ mortality significantly',
    'Empiric indications: maternal HSV lesions, neonatal vesicular rash, sepsis с negative bacterial cultures, unexplained hepatitis/seizures/encephalitis',
    'Длительность по типу: SEM 14 d, CNS 21 d, disseminated 21 d',
    'CASG-103 (Kimberlin 2011): high-dose 20 мг/кг q8h reduces mortality + neurodev sequelae',
    'PO suppression 300 мг/м² q8h × 6 мес после CNS/disseminated treatment — ↓ neurodev impairment',
    'Adequate hydration CRITICAL (preventing crystalluria / renal failure)',
    'Renal-dependent excretion — adjust в renal failure (Cr clearance < 50)',
    'Neutropenia common у preterm; monitor CBC q24-48h',
    'PCR primary diagnostic: blood, CSF, surface swabs (eye, mouth, nose, rectum, skin)',
    'CNS HSV: LP repeat в end treatment confirm clearance',
    'Mortality: SEM ~ 0%, CNS 30-40%, disseminated 80-90% без treatment; treatment significantly улучшает outcomes',
    'Маternal HSV history: caesarean delivery если active genital lesions; otherwise neonate observed для symptoms',
  ],
  related: [
    { id: 'neo-ampicillin-dose', title: 'Ампициллин н/р' },
    { id: 'neo-cefotaxime-dose', title: 'Цефотаксим н/р' },
    { id: 'neo-fluconazole-dose', title: 'Флуконазол' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
  ],
  info: `### Ацикловир у новорождённых (Neonatal HSV)

Anti-HSV antiviral. **EMERGENCY treatment** для suspected или confirmed
neonatal HSV — start empirically не waiting for labs.

### Дозы

#### IV Treatment
- **20 мг/кг IV q8h × 14-21 дней**
- Slow infusion 1 ч (peripheral phlebitis risk)

#### PO Suppression (CASG-103)
- **300 мг/м²/доза PO q8h × 6 мес** после IV treatment
- Particularly после CNS / disseminated disease

### Длительность по disease type

| Type | Длительность | Mortality без Rx |
|---|---|---|
| **SEM** (skin-eye-mucous) | 14 дней | ~ 0 % |
| **CNS** | 21 день | 30-40 % |
| **Disseminated** | 21 день | 80-90 % |

### Empiric initiation indications

Start ANY of these:
- Maternal HSV active genital lesions при родах
- Neonatal vesicular rash
- Sepsis с negative bacterial cultures
- Unexplained hepatitis / coagulopathy
- Unexplained seizures / encephalitis
- Severe meningoencephalitis у н/р

### CASG-103 trial (Kimberlin 2011 NEJM 365:1284)

- Standard-dose 30 мг/кг/сут vs high-dose 60 мг/кг/сут × 21 d
- High-dose не improved survival, но ↓ neurodev sequelae
- After IV: PO suppression 300 мг/м² q8h × 6 мес
- → Standard now: 20 мг/кг q8h IV (= 60 мг/кг/сут) + PO suppression

### HSV testing

#### PCR (primary):
- **Blood** — для disseminated
- **CSF** — для CNS HSV
- **Surface swabs** — eye, mouth, nose, rectum, skin lesions
- **Skin lesion** — viral PCR + culture

#### Других:
- LP с CSF: pleocytosis, ↑ protein, normal-to-low glucose
- ALT, AST elevation (disseminated)
- Coagulopathy (disseminated)
- EEG / MRI brain (CNS)

### Pharmacokinetics

| Параметр | Term | Preterm |
|---|---|---|
| **t½** | 4 ч | 5-7 ч |
| **CSF penetration** | 30-50 % | 30-50 % |
| **Renal clearance** | major | major |
| **Bioavailability oral** | 15-30 % | 15-30 % |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| **Renal crystalluria** | если dehydrated | Adequate hydration critical |
| Neutropenia | common у preterm | Monitor CBC q24-48h |
| Phlebitis | peripheral access | Central preferred |
| ↑ LFTs | rare | Monitor |
| Encephalopathy | rare у н/р | Reduce dose в renal failure |

### Adequate hydration

⚠️ **Acyclovir crystallizes в renal tubules** если dehydrated → ОПН.

Maintain:
- Adequate IV fluids
- Urine output ≥ 1 мл/кг/ч
- Hold dose при oliguria до hydration restored

### Совместимость

| Совместимо | Несовместимо |
|---|---|
| 0.9 % NaCl | High pH solutions (precipitate) |
| 5 % Glucose | Lipid emulsions |
| Lactated Ringer | Vancomycin |

### Source maternal infection

#### Если maternal HSV active genital:
1. **Cesarean delivery** если active lesions при родах
2. Если vaginal birth occurred: surface PCR + observation
3. **Empiric acyclovir** при any concerning signs

#### Без maternal lesions, asymptomatic newborn:
- Surface swabs at 24-48 ч
- Observation × 5 days minimum
- Start acyclovir если signs develop

### Long-term outcomes

| Type | Outcome с treatment |
|---|---|
| **SEM** | Excellent (rare relapse) |
| **CNS** | 50-70 % normal neurodev (varies) |
| **Disseminated** | 30-50 % normal (still significant residual) |

PO suppression × 6 мес improves outcomes (CASG-103).

### Prevention

- Maternal HSV screening late pregnancy
- Cesarean if active lesions при родах
- Acyclovir suppression maternal от 36 нед если recurrent
- Avoid scalp electrodes if maternal HSV history

### Источники

- Kimberlin DW et al. CASG-103 NEJM 2011;365:1284
- AAP Red Book 2021-2024 HSV
- ACOG/AAP Joint Guidelines Neonatal HSV
- Whitley RJ et al. — Acyclovir treatment HSV
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Герпесвирусная инфекция у н/р" (2024)
`,
};

export default runner;
