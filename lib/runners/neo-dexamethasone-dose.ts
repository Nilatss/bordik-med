/**
 * Runner: neo-dexamethasone-dose — Дексаметазон (BPD systemic / DART regimen)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Systemic corticosteroid для severe BPD у preterm. ⚠️ Cerebral palsy concerns
 * при early high-dose у extreme preterm (Yeh 1998); use limited к specific
 * scenarios с careful risk-benefit assessment.
 *
 * DART regimen (Doyle Cochrane 2014, low-dose late):
 *   Day 1-3: 0.075 мг/кг q12h IV/PO
 *   Day 4-6: 0.05 мг/кг q12h
 *   Day 7-9: 0.025 мг/кг q12h
 *   Day 10: 0.01 мг/кг q12h
 *   Total course: 10 days, cumulative 0.89 мг/кг
 *
 * Standard early high-dose (avoid у extreme preterm — Yeh 1998 cerebral palsy concerns):
 *   0.25 мг/кг q12h × 3 days, taper × 7 days (cumulative ~ 7-9 мг/кг)
 *   ⚠️ NOT recommended < 28 нед PMA в первые 7 дней жизни
 *
 * SOURCES:
 *   - Yeh TF et al. NEJM 1998;338:101 — early dexamethasone у preterm: ↑ cerebral palsy
 *   - Doyle LW et al. DART trial Pediatrics 2006;117:75 + Cochrane 2014
 *   - Halliday HL et al. Cochrane Postnatal corticosteroids 2017
 *   - AAP CFN 2002, 2010 — Statement on dexamethasone (cautious)
 *   - КР МЗ РФ "БЛД" (2024)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (DART / Cochrane / AAP) · РФ',
  reference: 'Doyle DART Pediatrics 2006;117:75 + Cochrane 2014. Yeh NEJM 1998;338:101.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      id: 'mode',
      label: 'Режим / схема',
      type: 'select',
      options: [
        { value: 'dart_d1_3', label: 'DART Day 1-3: 0.075 мг/кг q12h IV/PO' },
        { value: 'dart_d4_6', label: 'DART Day 4-6: 0.05 мг/кг q12h' },
        { value: 'dart_d7_9', label: 'DART Day 7-9: 0.025 мг/кг q12h' },
        { value: 'dart_d10', label: 'DART Day 10: 0.01 мг/кг q12h' },
        { value: 'high_dose', label: '⚠️ High-dose 0.25 мг/кг q12h (avoid extreme preterm)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'dart_d1_3');

    if (w <= 0 || w > 3) {
      return { value: '—', interpretation: 'Введите массу 0.4-3 кг (preterm)', color: '#9CA3AF', details: '' };
    }

    type DexMode = { perKg: number; freq: string; phase: string; label: string };
    const modes: Record<string, DexMode> = {
      dart_d1_3: { perKg: 0.075, freq: 'q12h', phase: 'Day 1-3', label: 'DART Day 1-3' },
      dart_d4_6: { perKg: 0.05, freq: 'q12h', phase: 'Day 4-6', label: 'DART Day 4-6' },
      dart_d7_9: { perKg: 0.025, freq: 'q12h', phase: 'Day 7-9', label: 'DART Day 7-9' },
      dart_d10: { perKg: 0.01, freq: 'q12h', phase: 'Day 10', label: 'DART Day 10 (final)' },
      high_dose: { perKg: 0.25, freq: 'q12h', phase: 'High-dose (older protocol)', label: 'High-dose' },
    };
    const m = modes[mode] ?? modes.dart_d1_3;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const conc = 4; // мг/мл стандартный (4 мг/мл vials, или 1 мг/мл diluted для precision)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Дексаметазон: ${total.toFixed(3)} мг = ${vol.toFixed(3)} мл @ 4 мг/мл (или dilute к 1 мг/мл для precision у н/р)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq} (${m.phase})`);
    actions.push('Путь: IV slow push 5 мин или PO');

    if (mode === 'high_dose') {
      actions.push('--- ⚠️ HIGH-DOSE WARNING ---');
      actions.push('⚠️ Yeh 1998 NEJM 338:101: high-dose dexamethasone в первые 7 дней у preterm');
      actions.push('  - ↑ Cerebral palsy (↑ 200 % risk у extreme preterm)');
      actions.push('  - Long-term neurocognitive deficits');
      actions.push('NOT recommended:');
      actions.push('  - Extreme preterm < 28 нед PMA');
      actions.push('  - Первые 7 дней жизни');
      actions.push('Use ONLY: ventilator-dependent severe BPD после adequate trial DART regimen');
    } else if (mode.startsWith('dart')) {
      actions.push('--- DART Regimen (low-dose late) ---');
      actions.push('Doyle DART trial Pediatrics 2006;117:75');
      actions.push('Cumulative dose: 0.89 мг/кг over 10 days (vs old 7-9 мг/кг)');
      actions.push('Tapering: gradual ↓ doses');
      actions.push('When: After 7-14 days of life у severe BPD ventilator-dependent');
      actions.push('Cochrane 2014: short, low-dose late steroids — 80 % chance of extubation');
      actions.push('Smaller cumulative dose → less cerebral palsy concerns');
      actions.push('Trial × 7-10 days; assess response');
    }

    actions.push('--- DART full schedule ---');
    actions.push('Day 1-3: 0.075 мг/кг q12h = 0.15 мг/кг/сут');
    actions.push('Day 4-6: 0.05 мг/кг q12h = 0.10 мг/кг/сут');
    actions.push('Day 7-9: 0.025 мг/кг q12h = 0.05 мг/кг/сут');
    actions.push('Day 10: 0.01 мг/кг q12h = 0.02 мг/кг/сут');
    actions.push('Cumulative: 0.89 мг/кг over 10 days');

    actions.push('--- Когда использовать ---');
    actions.push('Severe BPD ventilator-dependent ≥ 14 days postnatal age');
    actions.push('FiO₂ requirement > 30 % persistent');
    actions.push('Failure conservative measures (caffeine, nutrition, fluid restriction, diuretics)');
    actions.push('Extubation difficulty');

    actions.push('--- Когда AVOID ---');
    actions.push('⚠️ Extreme preterm < 28 нед PMA');
    actions.push('⚠️ Первые 7 дней жизни (early postnatal use)');
    actions.push('Active sepsis');
    actions.push('Active GI bleeding или NEC');
    actions.push('Recent intraventricular hemorrhage (severe IVH)');

    actions.push('--- Mонитор ---');
    actions.push('Glucose q4-6h (hyperglycemia common)');
    actions.push('АД q4-8h (hypertension possible)');
    actions.push('CBC q24-48h (leukocytosis expected)');
    actions.push('Stool guaiac (GI bleeding)');
    actions.push('Echocardiography baseline + post-course (cardiac hypertrophy у chronic use)');

    actions.push('--- Side effects ---');
    actions.push('Hyperglycemia (very common, up to 50%)');
    actions.push('Hypertension');
    actions.push('GI perforation (особенно concomitant с indomethacin/ibuprofen)');
    actions.push('Cardiac hypertrophy (chronic high-dose)');
    actions.push('Adrenal suppression (cumulative dose)');
    actions.push('⚠️ Long-term: cerebral palsy у extreme preterm (Yeh 1998)');
    actions.push('⚠️ Cognitive: lower IQ scores в follow-up studies');
    actions.push('Growth ↓ velocity short-term; catch-up after course');

    actions.push('--- Drug interactions ---');
    actions.push('NSAIDs (indomethacin/ibuprofen): ↑ GI perforation risk × 5-10');
    actions.push('Phenobarbital, phenytoin, rifampin: ↓ dexamethasone effect (CYP induction)');
    actions.push('Hyperglycemic agents: insulin requirements ↑');

    return {
      value: total.toFixed(3),
      unit: `мг (${vol.toFixed(3)} мл)`,
      interpretation: m.label,
      color: mode === 'high_dose' ? '#EF4444' : '#F59E0B',
      details: `${m.perKg} мг/кг × ${w} кг = ${total.toFixed(3)} мг ${m.freq} (${m.phase}).`,
      actions,
    };
  },
  caveats: [
    '⚠️ Yeh 1998 NEJM: early high-dose dexamethasone у preterm ↑ cerebral palsy (200 % увеличение)',
    'AAP CFN 2002 + 2010: dexamethasone NOT routine для BPD; use только если severe ventilator-dependent с failure conservative measures',
    'DART regimen (Doyle 2006 + Cochrane 2014): low-dose late, cumulative 0.89 мг/кг over 10 days',
    'Cumulative dose < 1 мг/кг (DART) — significantly less cerebral palsy concerns vs old high-dose 7-9 мг/кг',
    'Avoid: extreme preterm < 28 нед PMA, первые 7 дней жизни, active sepsis, GI bleed, recent severe IVH',
    'When: severe BPD ventilator-dependent ≥ 14 days postnatal с failure conservative measures',
    'Trial × 7-10 days с DART regimen; ~ 80 % chance extubation',
    'Hyperglycemia very common (50%) — monitor q4-6h',
    'Concomitant с indomethacin/ibuprofen: ↑ GI perforation risk × 5-10 — avoid combination',
    'Hydrocortisone alternative: less concerning neurodev profile (но less efficacy)',
    'Inhaled budesonide alternative: less systemic effects, но limited efficacy в severe BPD',
    'Long-term: short-term growth ↓; catch-up after course expected',
  ],
  related: [
    { id: 'neo-budesonide-dose', title: 'Будесонид (BPD inhaled)' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
    { id: 'neo-surfactant-dose', title: 'Сурфактант' },
  ],
  info: `### Дексаметазон (BPD systemic / DART regimen)

Systemic corticosteroid для severe BPD у preterm.

⚠️ **Cerebral palsy concerns** — limited use, careful risk-benefit assessment.

### Дозы

#### DART regimen (low-dose late, Doyle 2006)
| Day | Dose | Frequency |
|---|---|---|
| **1-3** | 0.075 мг/кг | q12h |
| **4-6** | 0.05 мг/кг | q12h |
| **7-9** | 0.025 мг/кг | q12h |
| **10** | 0.01 мг/кг | q12h |
| **Total** | **0.89 мг/кг** | 10 days |

#### High-dose (older protocol, AVOID extreme preterm)
- 0.25 мг/кг q12h × 3 days
- Taper × 7 days
- Cumulative ~ 7-9 мг/кг
- ⚠️ NOT recommended < 28 нед PMA в первые 7 дней

### Yeh 1998 NEJM 338:101 — Cerebral palsy concerns

- 200 ELBW newborns randomized
- Early high-dose dexamethasone × 7 days
- **↑ Cerebral palsy 200 %** (12 % vs 6 %)
- Lower IQ scores в follow-up
- → AVOID early high-dose у extreme preterm

### DART trial (Doyle 2006 Pediatrics 117:75)

- Low-dose late steroids
- Severe BPD ventilator-dependent
- ~ 80 % chance of extubation
- Less cerebral palsy concerns
- → Standard regimen для severe BPD

### Cochrane 2014 — Postnatal corticosteroids

- **Late onset** (> 7 days): more benefit, less harm
- **Low-dose** (DART): better safety profile
- **Short course** (≤ 10 days): less concerning
- → DART regimen preferred

### Когда использовать

#### YES (selective):
- **Severe BPD ventilator-dependent ≥ 14 days**
- **FiO₂ > 30 %** persistent
- **Failure conservative measures** (caffeine, nutrition, fluid restriction, diuretics)
- **Extubation difficulty** despite optimization

#### NO:
- **Extreme preterm < 28 нед PMA** в первые 7 дней
- Active sepsis (untreated)
- Active GI bleeding или NEC
- Recent severe IVH (Grade III-IV)

### Vs other corticosteroids

| | Dexamethasone | Hydrocortisone | Inhaled budesonide |
|---|---|---|---|
| **Potency** | × 30 | × 1 | local only |
| **Mineralocorticoid** | minimal | + | minimal |
| **BPD efficacy** | Strong (DART) | Moderate | Limited (severe) |
| **Cerebral palsy concern** | + | Lower | Lower |
| **Hyperglycemia** | + | + | minimal |
| **Adrenal suppression** | + | + | minimal |
| **Standard regimen** | DART (10d) | 1 мг/кг q8h × 5d | 200-500 мкг q12h |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| **Hyperglycemia** | 50 % | Monitor q4-6h, insulin if persistent |
| Hypertension | + | Monitor АД, gentle wean |
| **GI perforation** | ↑↑ с NSAIDs | Avoid combination |
| Adrenal suppression | + | Wean gradually |
| Cardiac hypertrophy | chronic | Echo monitoring |
| **Cerebral palsy** | extreme preterm early | Avoid в этой group |
| Lower IQ scores | + | Documentation |
| Growth ↓ | short-term | Catch-up after |

### Drug interactions

| Drug | Effect |
|---|---|
| **NSAIDs** (indomethacin/ibuprofen) | ↑ GI perforation × 5-10 |
| **Phenobarbital, phenytoin, rifampin** | ↓ effect (CYP induction) |
| **Hyperglycemic agents** | Insulin requirements ↑ |
| **Vaccines** | Live vaccines contraindicated during course |

### Cumulative dose comparison

| Regimen | Cumulative dose | Cerebral palsy concern |
|---|---|---|
| **DART (10 days)** | **0.89 мг/кг** | Minimal |
| Old high-dose (early 7 days) | 7-9 мг/кг | Significant |
| Hydrocortisone (5 days) | 25 мг/кг | Lower |

### Источники

- Yeh TF et al. NEJM 1998;338:101 — cerebral palsy concerns
- Doyle LW et al. DART trial Pediatrics 2006;117:75
- Halliday HL et al. Cochrane Postnatal corticosteroids 2017
- AAP CFN 2002 + 2010 Statement on dexamethasone
- КР МЗ РФ "БЛД" (2024)
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
`,
};

export default runner;
