/**
 * Runner: neo-azithromycin-dose — Азитромицин (alternative chlamydia / pertussis)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Macrolide antibiotic — alternative к erythromycin для chlamydia + pertussis.
 * Better tolerability (less GI side effects, less IHPS risk vs erythromycin),
 * shorter course (5 days vs 14).
 *
 * Дозы:
 *   Pertussis (Bordetella pertussis):
 *     10 мг/кг q24h PO × 5 дней (или IV если PO not tolerated)
 *
 *   Chlamydia trachomatis (neonatal conjunctivitis or pneumonia):
 *     20 мг/кг q24h PO × 3 дня (CDC 2021 recommendation)
 *
 *   Other infections (rare у н/р):
 *     10 мг/кг q24h × 5 дней или 20 мг/кг loading + 10 мг/кг × 4 days
 *
 * SOURCES:
 *   - CDC Pertussis 2017 (chemoprophylaxis + treatment recommendations)
 *   - AAP Red Book 2021-2024
 *   - CDC STD Treatment Guidelines 2021 — chlamydia neonatal
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Перинатальные инфекции у н/р" (2024)
 *
 * NB: IHPS (infantile hypertrophic pyloric stenosis) risk у newborn < 6 нед —
 * lower than erythromycin (5-fold less reported), but still possible.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (CDC / AAP Red Book / NeoFax) · РФ',
  reference: 'CDC Pertussis 2017. CDC STD 2021. AAP Red Book 2021-2024. NeoFax. КР МЗ РФ.',
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
        { value: 'pert_prophy', label: 'Pertussis prophylaxis 10 мг/кг q24h × 5 дней' },
        { value: 'pert_treat', label: 'Pertussis treatment 10 мг/кг q24h × 5 дней' },
        { value: 'chlamydia', label: 'Chlamydia 20 мг/кг q24h × 3 дня (CDC 2021)' },
        { value: 'other', label: 'Other infections 10 мг/кг q24h × 5 дней' },
      ],
    },
    {
      id: 'route',
      label: 'Путь',
      type: 'select',
      options: [
        { value: 'po', label: 'PO suspension (40 мг/мл)' },
        { value: 'iv', label: 'IV (если PO не tolerated)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'pert_treat');
    const route = String(values.route ?? 'po');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type AzMode = { perKg: number; freq: string; duration: string; label: string };
    const modes: Record<string, AzMode> = {
      pert_prophy: { perKg: 10, freq: 'q24h', duration: '5 дней', label: 'Pertussis prophylaxis' },
      pert_treat: { perKg: 10, freq: 'q24h', duration: '5 дней', label: 'Pertussis treatment' },
      chlamydia: { perKg: 20, freq: 'q24h', duration: '3 дня (CDC 2021)', label: 'Chlamydia neonatal' },
      other: { perKg: 10, freq: 'q24h', duration: '5 дней', label: 'Other infections' },
    };
    const m = modes[mode] ?? modes.pert_treat;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const conc = 40; // мг/мл стандартный PO suspension (200 мг/5 мл)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Азитромицин: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл (PO suspension)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq} × ${m.duration}`);
    actions.push(`Путь: ${route === 'iv' ? 'IV slow infusion 60 мин' : 'PO suspension (better absorption empty stomach)'}`);

    if (mode.startsWith('pert')) {
      actions.push('--- Pertussis (Bordetella pertussis) ---');
      actions.push('Newborn pertussis: severe disease (apnea, brady, pulmonary HTN, secondary infection)');
      actions.push('Mortality у < 3 мес: 1-3 % (intensive care often needed)');
      actions.push('Treatment: azithromycin 10 мг/кг q24h × 5 дней (preferred у < 6 мес)');
      actions.push('Prophylaxis: same dose × 5 days для close contacts');
      actions.push('Alternative: erythromycin 10-12.5 мг/кг q6h × 14 дней (longer course, more side effects)');
      actions.push('Vaccination: maternal Tdap pregnancy (27-36 нед) — passive protection newborn');
    } else if (mode === 'chlamydia') {
      actions.push('--- Chlamydia trachomatis (neonatal) ---');
      actions.push('Maternal C. trachomatis колонизация: vertical transmission ~ 50 % при vaginal delivery');
      actions.push('Manifestations:');
      actions.push('  - Conjunctivitis (5-14 дней after birth)');
      actions.push('  - Pneumonia (4-12 нед after birth)');
      actions.push('Treatment: azithromycin 20 мг/кг q24h × 3 days (CDC 2021)');
      actions.push('Alternative: erythromycin 12.5 мг/кг q6h × 14 days (older standard)');
      actions.push('Maternal partner treatment + screening necessary');
    }

    actions.push('--- Vs erythromycin ---');
    actions.push('Azithromycin advantages:');
    actions.push('  - Shorter course (5 days vs 14 days)');
    actions.push('  - Once-daily dosing (vs q6h)');
    actions.push('  - Less GI side effects');
    actions.push('  - Less drug interactions (CYP3A4)');
    actions.push('  - Lower IHPS risk (~ 5× less than erythromycin)');
    actions.push('Erythromycin disadvantages:');
    actions.push('  - Longer course');
    actions.push('  - QID dosing (compliance)');
    actions.push('  - GI side effects common');
    actions.push('  - Significant drug interactions');
    actions.push('  - Higher IHPS risk');

    actions.push('--- ⚠️ IHPS (Infantile Hypertrophic Pyloric Stenosis) ---');
    actions.push('Azithromycin: lower risk than erythromycin (~ 5× less)');
    actions.push('Risk factors: < 6 нед age (especially < 2 нед), prolonged course');
    actions.push('Monitor: projectile vomiting, weight loss, palpable mass, hypochloremic alkalosis');
    actions.push('U/S abdominal если symptoms develop');

    actions.push('--- Pharmacokinetics ---');
    actions.push('Tissue concentration: very high (intracellular accumulation)');
    actions.push('Long t½: 50-70 hours (allows 5-day course efficacy)');
    actions.push('Bioavailability PO: 38 % (lower than erythromycin)');
    actions.push('Hepatic excretion (most), renal (small portion)');

    actions.push('--- Side effects ---');
    actions.push('GI: vomiting, diarrhea (less than erythromycin)');
    actions.push('IHPS (less common than erythromycin)');
    actions.push('QT prolongation (rare у н/р, but reported в peds population)');
    actions.push('Hepatic enzyme elevation (rare)');
    actions.push('Allergic reactions (cross-reactive с erythromycin minimal)');

    actions.push('--- Drug interactions ---');
    actions.push('Less significant than erythromycin (less CYP3A4 inhibition)');
    actions.push('Caution: amiodarone (additive QT)');
    actions.push('Digoxin: ↑ digoxin levels (but less than erythromycin)');
    actions.push('Warfarin: ↑ INR');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг ${m.freq} × ${m.duration}.`,
      actions,
    };
  },
  caveats: [
    'Azithromycin preferred over erythromycin для pertussis (< 6 мес age) — shorter course, less side effects',
    'CDC 2017 pertussis guidelines: azithromycin first-line у newborn / young infant',
    'Chlamydia neonatal CDC 2021: azithromycin 20 мг/кг q24h × 3 days first-line (vs older erythromycin 14 days)',
    'IHPS risk: azithromycin ~ 5× less than erythromycin, but still possible у < 6 нед age',
    'Long tissue half-life (50-70 ч) allows 5-day course efficacy',
    'PO bioavailability 38 % — lower than IV but adequate с tissue accumulation',
    'Pertussis у newborn: severe disease (apnea, brady, mortality 1-3 %)',
    'Maternal partner treatment + screening necessary в chlamydia case',
    'Maternal Tdap pregnancy (27-36 нед) — passive protection newborn pertussis',
    'QT prolongation: less concerning than erythromycin, but monitor с amiodarone',
    'Drug interactions less than erythromycin (less CYP3A4 inhibition)',
    'Once-daily dosing improves compliance vs QID erythromycin',
  ],
  related: [
    { id: 'neo-erythromycin-dose', title: 'Эритромицин н/р' },
    { id: 'neo-vaccination-calendar', title: 'Календарь вакцинации' },
    { id: 'neo-cefotaxime-dose', title: 'Цефотаксим н/р' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
  ],
  info: `### Азитромицин у новорождённых

Macrolide antibiotic — preferred alternative к erythromycin для chlamydia
и pertussis у young infants.

### Дозы

| Indication | Доза | Frequency | Длительность |
|---|---|---|---|
| **Pertussis** (treatment + prophylaxis) | 10 мг/кг | q24h | **5 дней** |
| **Chlamydia** (CDC 2021) | 20 мг/кг | q24h | **3 дня** |
| Other infections | 10 мг/кг | q24h | 5 дней |

### Vs erythromycin

| | Azithromycin | Erythromycin |
|---|---|---|
| **Course** | 5 дней | 14 дней |
| **Dosing** | Once daily | QID (q6h) |
| **GI side effects** | Less common | Common |
| **IHPS risk** | ~ 5× less | + |
| **Drug interactions** | Less significant | Many (CYP3A4) |
| **Compliance** | Better | Worse |
| **Cost** | Higher | Lower |

### Pertussis newborn

#### Severity:
- **Mortality 1-3 %** у < 3 мес age
- Severe symptoms: apnea, brady, cyanotic spells, secondary pneumonia, pulmonary HTN
- Often needs ICU support

#### Treatment:
- **First-line:** Azithromycin 10 мг/кг q24h × 5 дней
- Alternative: Erythromycin 10-12.5 мг/кг q6h × 14 дней
- TMP-SMX: альтернатива для resistance (rare)

#### Prophylaxis (close contacts):
- Same regimen as treatment
- Within 21 days exposure
- Especially: household contacts, healthcare workers с newborn exposure

### Chlamydia trachomatis neonatal

#### Manifestations:
| Type | Onset | Features |
|---|---|---|
| **Conjunctivitis** | 5-14 d | Mucopurulent, eyelid swelling |
| **Pneumonia** | 4-12 wk | Staccato cough, tachypnea, hyperinflation X-ray |

#### Treatment (CDC STD 2021):
- **First-line:** Azithromycin 20 мг/кг q24h × 3 дня
- Alternative: Erythromycin 12.5 мг/кг q6h × 14 дней
- Maternal partner treatment + screening

### Pharmacokinetics

| Параметр | Value |
|---|---|
| **Bioavailability PO** | 38 % |
| **t½** | 50-70 ч |
| **Tissue conc** | Very high (intracellular) |
| **Excretion** | Hepatic (most), renal (small) |

### IHPS (Infantile Hypertrophic Pyloric Stenosis)

#### Risk:
- Azithromycin: low risk
- ~ 5× less than erythromycin
- Especially у < 6 нед age (peak < 2 нед)

#### Symptoms:
- Projectile vomiting (after feeds)
- Weight loss / failure to gain
- Palpable olive в epigastrium
- Hypochloremic alkalosis

#### If suspected:
- Abdominal U/S (pyloric muscle thickness > 4 мм, channel > 14 мм)
- Surgical consult (pyloromyotomy)

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| GI: vomiting, diarrhea | + (less than erythromycin) | Reduce dose if severe |
| IHPS | + (less risk) | Monitor, U/S if suspected |
| QT prolongation | rare у н/р | Avoid amiodarone |
| Hepatic enzyme ↑ | rare | Monitor LFTs |
| Allergic reactions | rare | Discontinue if severe |

### Drug interactions

| Drug | Effect |
|---|---|
| **Amiodarone** | Additive QT prolongation |
| **Digoxin** | ↑ levels (less than erythromycin) |
| **Warfarin** | ↑ INR |
| **Cyclosporine** | ↑ levels |
| **Theophylline** | ↑ levels (minor) |

### Maternal Tdap pregnancy

#### Recommendation:
- Maternal **Tdap (Adacel или Boostrix)** 27-36 нед PMA
- **Each pregnancy** (regardless prior Tdap)
- Passive antibody transfer protects newborn × 2-3 мес

#### Newborn protection:
- Mother Tdap: ↓ pertussis 78-91 % infant disease
- Critical для < 2 мес (before infant DTaP-1)

### Источники

- CDC Pertussis 2017 chemoprophylaxis + treatment
- CDC STD Treatment Guidelines 2021 — chlamydia neonatal
- AAP Red Book 2021-2024
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Перинатальные инфекции у н/р" (2024)
`,
};

export default runner;
