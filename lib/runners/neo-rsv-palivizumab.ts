/**
 * Runner: neo-rsv-palivizumab — Palivizumab (RSV passive immunization)
 *
 * NEONATOLOGY MODULE — Drug DB foundation + classification.
 *
 * Monoclonal antibody (anti-RSV F protein) для passive immunization
 * против severe RSV disease у high-risk preterm и newborns с CHD/BPD.
 *
 * Дозы:
 *   15 мг/кг IM monthly во время RSV season (typically Oct-March в Northern hemisphere;
 *     May-Sept в Southern; year-round в tropics)
 *
 *   Maximum 5 doses per RSV season
 *
 * Eligibility (AAP COFN 2014, Update 2023):
 *   1. Preterm < 29 нед без CHD/CLD: < 12 мес возраста при start of RSV season
 *   2. CLD / BPD: < 12 мес → 5 doses RSV season
 *      - Continued 2-й RSV season если still requiring O₂ / steroids / diuretics
 *   3. Hemodynamically significant CHD: < 12 мес — moderate-severe CHD
 *   4. Special populations: immunocompromised, neuromuscular, anatomic airway
 *
 * SOURCES:
 *   - AAP COFN 2014 (Pediatrics 134:415) — Updated guidance
 *   - AAP COFN Update 2023 — restricting eligibility
 *   - IMpact RSV Trial 1998 — original efficacy data
 *   - КР МЗ РФ "RSV-инфекция у н/р" / "Иммунопрофилактика" (2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *
 * NEW: Nirsevimab (Beyfortus) FDA approved 2023 — single dose for ALL
 * infants entering first RSV season.
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  countries: 'Международный (AAP COFN 2014/2023 / IMpact RSV) · РФ',
  reference: 'AAP COFN 2014 (Pediatrics 134:415); AAP COFN Update 2023. IMpact RSV 1998.',
  inputs: [
    {
      id: 'ga_at_birth',
      label: 'GA при рождении',
      type: 'select',
      options: [
        { value: '4', label: '< 29+0 нед (high-risk)', points: 4 },
        { value: '3', label: '29-31 нед (moderate-risk если CLD/BPD)', points: 3 },
        { value: '0', label: '≥ 32 нед (без other indications)', points: 0 },
      ],
    },
    {
      id: 'cld',
      label: 'BPD / Chronic Lung Disease (требуется O₂ / steroids / diuretics)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'chd',
      label: 'Hemodynamically significant CHD (cyanotic, large shunt, pulmonary HTN)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'special',
      label: 'Special population (immunocompromised, neuromuscular, anatomic airway anomaly)',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: 'Не показан palivizumab',
      color: '#22C55E',
      description: 'No eligibility criteria met.',
      actions: [
        'GA ≥ 32 нед без CLD/CHD/special — palivizumab НЕ показан',
        'Routine measures: hand hygiene, breastfeeding promotion, avoid sick contacts',
        'Nirsevimab (Beyfortus, FDA 2023): consider если available — single dose всем infants entering 1st RSV season',
      ],
    },
    {
      min: 1,
      max: 3,
      label: 'Может рассматриваться (моderate-risk)',
      color: '#F59E0B',
      description: 'Some criteria met — consider eligibility.',
      actions: [
        'Eligibility partial: review с pediatric infectious disease',
        'GA 29-31 нед + CLD/BPD: usually eligible 1-й RSV season',
        'CHD без significant hemodynamic compromise: usually NOT eligible',
        'Decision: AAP COFN 2014/2023 + insurance coverage + family discussion',
      ],
    },
    {
      min: 4,
      max: 7,
      label: 'Показан palivizumab — high-risk',
      color: '#EF4444',
      description: 'High-risk; palivizumab indicated по AAP guidelines.',
      actions: [
        '✅ Palivizumab показан',
        'Доза: 15 мг/кг IM monthly during RSV season (typically 5 doses)',
        'RSV season: Northern hemisphere Oct-March; Southern May-Sept; tropics year-round',
        'Administer: 1-st dose до start RSV season; repeat q28-30 дней',
        'Length: < 12 мес 1-st RSV season; selected continuing 2-й season (CLD on therapy)',
        'IM injection в anterolateral thigh (vastus lateralis) для < 12 мес',
        'Document: vaccination card, parent education',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const ga = Number(values.ga_at_birth ?? 0);
    const cld = values.cld === true ? 1 : 0;
    const chd = values.chd === true ? 1 : 0;
    const special = values.special === true ? 1 : 0;
    const total = ga + cld + chd + special;

    const band = findBand(runner.bands, total);

    return {
      value: String(total),
      unit: 'risk score',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. AAP COFN 2014/2023 eligibility.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'AAP COFN 2014/2023: палinвizumab eligibility ограничен — high-risk only',
    '⚠️ NEW: Nirsevimab (Beyfortus) FDA approved 2023 — single dose all infants entering 1st RSV season',
    'Palivizumab vs Nirsevimab: palivizumab monthly × 5 doses; nirsevimab single dose seasonally',
    'IMpact RSV Trial 1998: ↓ RSV hospitalization 55 % у preterm',
    'GA < 29 нед: eligible до 12 мес возраста при start of RSV season',
    'CLD / BPD: continued 2-й RSV season если still O₂ / steroids / diuretics',
    'Hemodynamically significant CHD: cyanotic, large shunt, pulmonary HTN — moderate-severe',
    'NOT eligible: GA ≥ 32 нед без CLD/CHD/special, asymptomatic CHD, simple ASD/VSD without HF',
    'Maximum 5 doses per RSV season; given monthly q28-30 d',
    'IM injection в anterolateral thigh < 12 мес; deltoid > 12 мес',
    'Cost ~ $5,000-15,000 USD per season — insurance coverage variable',
    'Adverse events rare: irritability, fever, mild URI symptoms; anaphylaxis very rare',
  ],
  related: [
    { id: 'neo-prematurity-class', title: 'Классификация недоношенности' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
    { id: 'neo-vaccination-calendar', title: 'Календарь вакцинации' },
    { id: 'neo-discharge-criteria', title: 'Критерии выписки' },
  ],
  info: `### Palivizumab (RSV passive immunization)

Anti-RSV F protein monoclonal antibody для prevention severe RSV у
high-risk preterm и newborns с CHD/CLD.

⚠️ **NEW 2023:** Nirsevimab (Beyfortus) FDA approved — single dose
seasonally для all infants. Может replace palivizumab в coming years.

### Дозы

- **15 мг/кг IM monthly** during RSV season
- Maximum **5 doses per season**
- Q28-30 days

### RSV Season

| Region | Season |
|---|---|
| Northern hemisphere | Oct-March |
| Southern hemisphere | May-September |
| Tropics | Year-round |

### Eligibility (AAP COFN 2014, Update 2023)

#### Strong eligibility:
1. **Preterm < 29 нед** без CHD/CLD: < 12 мес at start of RSV season
2. **CLD / BPD** (requiring O₂ / steroids / diuretics): < 12 мес
   - Continued 2-й RSV season если still on therapy
3. **Hemodynamically significant CHD**: < 12 мес
   - Cyanotic CHD
   - Large shunt с heart failure
   - Pulmonary HTN secondary к CHD
4. **Special populations:**
   - Severely immunocompromised
   - Profound neuromuscular disease
   - Anatomic airway anomaly affecting airway clearance

#### NOT eligible:
- GA ≥ 32 нед без CLD/CHD/special
- Asymptomatic CHD (small ASD, VSD без HF)
- Beyond 1-й RSV season для preterm without CLD
- Simple atrial septal defects без HF
- Down syndrome alone (без CHD/CLD)

### Administration

| Aspect | Details |
|---|---|
| Route | **IM injection** |
| Site | Anterolateral thigh (vastus lateralis) < 12 мес; deltoid > 12 мес |
| Volume | Maximum 1 мл per IM site (split if larger) |
| Concentration | 100 мг/мл |
| Frequency | q28-30 days during RSV season |
| Storage | 2-8 °C; do not freeze |

### IMpact RSV Trial 1998

- 1502 high-risk preterm randomized
- Palivizumab 15 мг/кг monthly × 5 doses
- ↓ **RSV hospitalization 55 %**
- ↓ **RSV-related ICU days**
- ↓ **Total hospital days**
- No significant mortality benefit (low base rate)

### Vs Nirsevimab (Beyfortus, 2023)

| | Palivizumab | Nirsevimab |
|---|---|---|
| **Type** | Anti-F mAb | Anti-F mAb (longer t½) |
| **Frequency** | Monthly × 5 | **Single seasonal dose** |
| **Efficacy** | 55 % ↓ hosp | 70-80 % ↓ hosp (MELODY/HARMONIE) |
| **Eligibility** | High-risk only | **All infants entering 1st RSV season** |
| **Cost** | $5K-15K/season | Lower per dose |
| **Status** | Standard 1998-2023 | FDA approved 2023; replacing palivizumab |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Irritability | + | Self-limited |
| Mild fever | rare | Self-limited |
| URI symptoms | rare | Self-limited |
| Anaphylaxis | very rare | Standard anaphylaxis protocol |
| Local reaction | + | Self-limited |

### Drug interactions

- No significant interactions
- Compatible с routine vaccines (give at separate sites)
- Not affected by passive immunoglobulin therapy

### Documentation

- Vaccination record
- RSV season number documented
- Dose number (1-5 of season)
- Site of injection
- Adverse events (если any)

### Источники

- AAP COFN 2014 (Pediatrics 134:415)
- AAP COFN Update 2023
- IMpact RSV Trial NEJM 1998;102:531
- MELODY trial NEJM 2023 (Hammitt et al.) — nirsevimab
- HARMONIE trial NEJM 2023 — nirsevimab
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "RSV-инфекция / Иммунопрофилактика" (2024)
`,
};

export default runner;
