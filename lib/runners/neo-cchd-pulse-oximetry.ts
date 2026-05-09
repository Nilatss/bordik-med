/**
 * Runner: neo-cchd-pulse-oximetry — Pulse oximetry screening для CCHD
 *
 * NEONATOLOGY MODULE — protocol classification.
 *
 * Newborn pulse oximetry screening для critical congenital heart disease
 * (CCHD). Standard of care в США (с 2011), большинство Europe, многие
 * other regions включая Россию + UZ.
 *
 * Algorithm (AAP/AHA 2018):
 *   Single-screen в 24-48 ч жизни (после first feed):
 *   - SpO₂ pre-ductal (right hand) AND post-ductal (foot) measurements
 *
 *   Pass:
 *   - SpO₂ ≥ 95 % в any extremity AND
 *   - Difference < 3 % between pre- и post-ductal
 *
 *   Fail (positive screen):
 *   - SpO₂ < 90 % в any extremity ИЛИ
 *   - SpO₂ 90-94 % в both extremities × 3 attempts (15 мин apart) ИЛИ
 *   - Difference > 3 % between pre- и post-ductal × 3 attempts
 *
 *   Failed screen → echocardiography для evaluation CCHD
 *
 * SOURCES:
 *   - AAP/AHA 2011 — Endorsement screening (Mahle WT et al. Pediatrics 2011)
 *   - AAP/AHA 2018 — Update (Pediatrics 142:e20183064)
 *   - Wright J et al. — clinical implementation studies
 *   - КР МЗ РФ "Скрининг ВПС у н/р" (2024)
 *
 * Detected CCHDs (most common):
 *   - HLHS (hypoplastic left heart syndrome)
 *   - PA (pulmonary atresia)
 *   - TGA (transposition great arteries)
 *   - TAPVR (total anomalous pulmonary venous return)
 *   - TA (tricuspid atresia)
 *   - TOF (Tetralogy of Fallot — severe)
 *   - Truncus arteriosus
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'Международный (AAP/AHA 2018) · РФ',
  reference: 'AAP/AHA 2018 (Pediatrics 142:e20183064). Mahle WT 2011 endorsement screening.',
  inputs: [
    {
      id: 'preductal_spo2',
      label: 'Pre-ductal SpO₂ (правая рука, %)',
      type: 'select',
      options: [
        { value: '0', label: '≥ 95 %', points: 0 },
        { value: '1', label: '90-94 %', points: 2 },
        { value: '2', label: '< 90 %', points: 4 },
      ],
    },
    {
      id: 'postductal_spo2',
      label: 'Post-ductal SpO₂ (нога, %)',
      type: 'select',
      options: [
        { value: '0', label: '≥ 95 %', points: 0 },
        { value: '1', label: '90-94 %', points: 2 },
        { value: '2', label: '< 90 %', points: 4 },
      ],
    },
    {
      id: 'difference',
      label: 'Разница между pre- и post-ductal',
      type: 'select',
      options: [
        { value: '0', label: '< 3 %', points: 0 },
        { value: '1', label: '3-5 %', points: 1 },
        { value: '2', label: '> 5 %', points: 2 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'PASS — screen normal',
      color: '#22C55E',
      description: 'Screen passed — low risk CCHD.',
      actions: [
        '✅ PASS — screen normal',
        'SpO₂ ≥ 95 % AND разница < 3 %',
        'Continued routine newborn care',
        'No echo necessary unless clinical concerns',
        'Documentation: pulse oximetry result в medical record',
      ],
    },
    {
      min: 2,
      max: 4,
      label: 'INDETERMINATE — повторить',
      color: '#F59E0B',
      description: 'Indeterminate — повторить × 2 раза с интервалом 15 мин.',
      actions: [
        'INDETERMINATE — повторить screen',
        'SpO₂ 90-94 % в both или difference 3-5 % — repeat × 3 attempts',
        'Interval: 15 мин между попытками',
        'Если 3 attempts все indeterminate → fail',
        'Если pass after retry → continue routine care',
      ],
    },
    {
      min: 5,
      max: 10,
      label: 'FAIL — positive screen — echo обязательно',
      color: '#EF4444',
      description: 'Positive screen — required echocardiography.',
      actions: [
        '⚠️ FAIL — positive screen',
        'SpO₂ < 90 % ИЛИ SpO₂ 90-94 % both × 3 attempts ИЛИ difference > 3 % × 3 attempts',
        '🚨 ECHOCARDIOGRAPHY OBLIGATORY ASAP',
        'Pediatric cardiology consult',
        'Confirm CCHD: echo для anatomy, function, ductal dependence',
        'Если duct-dependent CHD: PGE1 0.05 мкг/кг/мин IV continuous',
        'Transport к cardiac surgical center если confirmed CCHD',
        'Family communication',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const pre = Number(values.preductal_spo2 ?? 0);
    const post = Number(values.postductal_spo2 ?? 0);
    const diff = Number(values.difference ?? 0);
    const total = pre + post + diff;

    const band = findBand(runner.bands, total);

    return {
      value: String(total),
      unit: 'risk score',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. AAP/AHA 2018 algorithm.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Timing screen: 24-48 ч жизни (после first feed) — earlier = false positives (transition)',
    'Both extremities: pre-ductal (right hand) AND post-ductal (foot)',
    'Pulse ox accuracy: poor с motion, low pulse signal, peripheral vasoconstriction',
    'Repeat × 3 attempts с 15 мин interval перед declaring fail',
    'False positives: ~ 5-10 % (transient hypoxemia, lung disease, sepsis)',
    'False negatives: rare (~ 1 %); coarctation особенно может miss (left-to-right shunting через PDA initially adequate sat)',
    'Detected CCHDs: HLHS, PA, TGA, TAPVR, TA, severe TOF, truncus, severe coarctation',
    'TGA pitfall: pre-ductal может быть post-ductal на cardiac flow physiology — careful interpretation',
    'Premature < 35 нед: screening data limited; some institutions screen anyway',
    'Discharge eye exam + pulse oximetry — both до discharge home',
    'Newborn screening result documented в medical record + given parents',
    'Implementation: large-scale studies show ~ 4-6 cases per 10,000 newborns identified by screening alone',
  ],
  related: [
    { id: 'neo-pphn-screen', title: 'PPHN screening' },
    { id: 'neo-pge1-dose', title: 'PGE1 (duct-dependent CHD)' },
    { id: 'neo-vaccination-calendar', title: 'Календарь вакцинации' },
    { id: 'neo-discharge-criteria', title: 'Критерии выписки' },
  ],
  info: `### CCHD Pulse Oximetry Screening

Newborn pulse oximetry screening — standard of care для critical
congenital heart disease (CCHD).

### Algorithm (AAP/AHA 2018)

#### Timing:
- **24-48 ч жизни** (после first feed)
- Earlier = transition false positives

#### Sites:
- **Pre-ductal:** right hand
- **Post-ductal:** foot (any)

#### Result interpretation:

| Result | Definition |
|---|---|
| **PASS** | SpO₂ ≥ 95 % AND difference < 3 % |
| **INDETERMINATE** | SpO₂ 90-94 % both ИЛИ diff 3-5 % — repeat |
| **FAIL** | SpO₂ < 90 % ANY extremity ИЛИ SpO₂ 90-94 % both × 3 attempts ИЛИ diff > 3 % × 3 attempts |

#### Repeat protocol:
- 3 attempts total
- 15 мин interval between attempts
- Если все 3 indeterminate → fail

### Detected CCHDs

| CCHD | Frequency |
|---|---|
| **HLHS** | 1:5,000 |
| **TGA** | 1:5,000 |
| **TOF (severe)** | 1:3,500 |
| **TAPVR** | 1:15,000 |
| **TA** | 1:10,000 |
| **PA** | 1:10,000 |
| **Truncus arteriosus** | 1:10,000 |

Total CCHD prevalence: 1.5-3 per 1,000 births.

### Detection performance

| Metric | Value |
|---|---|
| Sensitivity | 75-90 % для CCHD |
| Specificity | 99 % |
| False positive rate | 0.5-1 % |
| False negative rate | 1-3 % (coarctation, certain TGAs) |

### Sample size detection

- ~ **4-6 cases per 10,000 newborns** identified by screening alone
- Combined с physical exam + family history → ~ 8-10 cases per 10,000

### Failed screen → echocardiography

#### Echo evaluation:
1. **Anatomy:** chamber sizes, valves, great vessels, septum
2. **Function:** systolic, diastolic, regional wall motion
3. **Ductal status:** patent? size? direction of flow?
4. **Coronary anatomy** (если HLHS, severe AS)
5. **Branch pulmonary arteries**
6. **Aortic arch** (coarctation, IAA, hypoplasia)

### Если confirmed CCHD

| Step | Action |
|---|---|
| **Initiate PGE1** | 0.05 мкг/кг/мин IV continuous (для duct-dependent) |
| **Cardiology consult** | Pediatric cardiology |
| **Transport** | Cardiac surgical center |
| **NPO** | Until decision о feeding strategy |
| **Family discussion** | Realistic prognosis |

### Pitfalls

#### TGA:
- Pre-ductal SpO₂ может быть higher than post-ductal (transposition physiology)
- Standard screen может miss

#### Coarctation:
- Pre-ductal SpO₂ may be adequate via left-to-right ductal shunting
- Symptom development после ductal closure (1-2 нед)
- Standard screen может miss until clinical signs develop

#### Severe lung disease:
- False positive rate higher (lung disease causes hypoxemia)
- Workup для lung pathology vs CCHD

### Premature considerations

- Screen at **35+ нед PMA** (если still inpatient)
- Earlier screening data limited
- Pulse ox accuracy lower у unstable preterm

### Documentation

- Pulse oximetry result в medical record
- Pass/Fail/Indeterminate
- Echo result if performed
- Family education
- Vaccination card / discharge note

### Источники

- AAP/AHA 2018 (Pediatrics 142:e20183064)
- Mahle WT et al. 2011 endorsement
- Wright J et al. — clinical implementation studies
- Eckersley LG et al. — Australian implementation
- КР МЗ РФ "Скрининг ВПС у н/р" (2024)
`,
};

export default runner;
