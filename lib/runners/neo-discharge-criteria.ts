/**
 * Runner: neo-discharge-criteria — Критерии выписки н/р из NICU
 *
 * NEONATOLOGY MODULE — В15 (audit issue 3.B / discharge protocol).
 *
 * AAP guidelines + КР МЗ РФ — критерии готовности выписки из NICU
 * для preterm newborns. Включает physiologic stability, feeding,
 * thermoregulation, weight gain, parental readiness.
 *
 * SOURCES:
 *   - AAP COFN 2008 — Hospital Discharge of the High-Risk Neonate
 *     (Pediatrics 2008;122(5):1119)
 *   - Engle WA et al. AAP COFN 2007 — Late preterm infants
 *   - Eichenwald EC et al. AAP COFN 2018 — Apnea of prematurity
 *   - КР МЗ РФ "Выписка н/р из стационара" (2024)
 *
 * Categorical assessment по 5 domains:
 *   1. Physiologic stability (apnea-free, normoxia, normothermia)
 *   2. Adequate feeding (oral feeds, weight gain)
 *   3. Thermoregulation (open crib, normothermia)
 *   4. Routine care (vaccines, screenings completed)
 *   5. Parental readiness (CPR, feeding, signs of illness)
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  countries: 'Международный (AAP COFN 2008) · РФ',
  reference: 'AAP COFN 2008 (Pediatrics 122:1119). Engle WA AAP COFN 2007. КР МЗ РФ Выписка н/р.',
  inputs: [
    {
      id: 'physiologic',
      label: 'Physiologic stability (apnea-free ≥ 5-7 дней + normoxia + normothermia)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'feeding',
      label: 'Adequate oral feeding (> 80 % volumes oral; weight gain ≥ 15-30 г/сут)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'thermoregulation',
      label: 'Stable in open crib (normothermia без external warming)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'routine_care',
      label: 'Routine care complete (vaccines age-appropriate, screenings, hearing, ROP)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'parental_readiness',
      label: 'Parental readiness (CPR training, feeding skills, infant warning signs)',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 2,
      label: 'НЕ готов к выписке (< 3/5 critirium)',
      color: '#EF4444',
      description: 'Significant gaps — продолжить уход в NICU.',
      actions: [
        '⚠️ НЕ готов к выписке',
        'Identify specific gaps и address',
        'Continued NICU care; reassess через 3-7 дней',
        'Document barriers (medical, social, parental readiness)',
      ],
    },
    {
      min: 3,
      max: 4,
      label: 'Близок к выписке (3-4/5 critirium)',
      color: '#F59E0B',
      description: 'Близок к готовности — несколько остающихся пунктов.',
      actions: [
        'Identify оставшиеся criteria и address actively',
        'Most common gaps: thermoregulation в open crib, oral feeding consistency',
        'Discharge planning meeting с family',
        'Home visiting / community follow-up arrangements',
        'Re-assess через 2-3 дня',
      ],
    },
    {
      min: 5,
      max: 5,
      label: 'Готов к выписке (5/5 critirium)',
      color: '#22C55E',
      description: 'Все critirium met — готов к выписке.',
      actions: [
        '✅ Готов к выписке',
        'Confirm follow-up appointments (pediatrician 24-72 ч после)',
        'Provide discharge instructions written + verbal',
        'Reduce sodium ≤ 12-24 ч pre-discharge if на TPN',
        'Removal IV access при последнем feeding tolerance check',
        'Car seat challenge (для preterm < 37 нед или LBW < 2500 г) — 90-120 мин observation',
        'Brieve — final exam, weight, vital signs',
        'Hospital social work и family resource liaison',
      ],
    },
  ],
  compute(values): CalculatorResult {
    let count = 0;
    if (values.physiologic === true) count++;
    if (values.feeding === true) count++;
    if (values.thermoregulation === true) count++;
    if (values.routine_care === true) count++;
    if (values.parental_readiness === true) count++;

    const band = findBand(runner.bands, count);

    return {
      value: `${count}/5`,
      unit: 'критериев',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. AAP COFN 2008 5-criteria approach.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'AAP COFN 2008: 5-criteria approach — все обязательны для discharge',
    'Apnea-free период: 5-7 дней без significant apnea / bradycardia / desaturation events (без caffeine)',
    'Caffeine therapy: typically discontinued 4-7 дней до discharge if used; observe для recurrence apnea',
    'Late preterm (34-36 нед): часто discharged раньше physiologic maturity → increased readmission risk',
    'Open crib stability обычно достигается @ ~ 1700-1800 г и/или PMA 35-36 нед',
    'Oral feeds: 80 % oral by volume; remaining через NG ОК for graduation',
    'Weight gain target 15-30 г/сут (preterm) или 20-30 г/сут (term recovering)',
    'Car seat challenge (90-120 мин): observe для apnea / desat / bradycardia',
    'Newborn screenings: метаболика, hearing, critical CHD pulse oximetry, ROP (если applicable)',
    'Vaccines: HepB by birth + completed first months age-appropriate; RSV (palivizumab) если eligible',
    'Parental CPR training, feeding skills, warning signs → critical для prevention SIDS, sepsis recognition',
    'Social work assessment: housing, food security, transportation, childcare resources',
    'Follow-up: pediatrician 24-72 ч после discharge; subspecialty (cardiology, neuro, ophthal) per condition',
  ],
  related: [
    { id: 'neo-prematurity-class', title: 'Классификация недоношенности' },
    { id: 'neo-newt', title: 'NEWT weight loss' },
    { id: 'neo-fenton', title: 'Fenton growth' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
  ],
  info: `### Критерии выписки н/р из NICU

AAP COFN 2008 5-criteria approach для готовности discharge. Все
critirium met для safe discharge home.

### 5 критериев (все обязательны)

1. **Physiologic stability**
   - Apnea-free период ≥ 5-7 дней (без caffeine если applicable)
   - Normoxia в room air ИЛИ stable home O₂ requirement
   - Normothermia без external warming
   - Stable vital signs

2. **Adequate feeding**
   - > 80 % volumes oral (breast, bottle, или combination)
   - Weight gain ≥ 15-30 г/сут sustained
   - Remaining volumes через NG OK для graduation

3. **Thermoregulation**
   - Stable в open crib (NICU minimum 24-72 ч)
   - Normothermia без incubator
   - Typically @ ~ 1700-1800 г и PMA 35-36 нед

4. **Routine care complete**
   - **Vaccines:** HepB by birth + age-appropriate
   - **Screenings:** метаболика (TSH, PKU, MSUD, etc.), hearing (ABR/OAE), critical CHD pulse oximetry
   - **ROP** если preterm < 32 нед / < 1500 г
   - **Eye examination** documented if BPD/preterm

5. **Parental readiness**
   - **CPR training** completed
   - **Feeding skills** demonstrated
   - **Recognition of warning signs:** sepsis, jaundice, poor feeding
   - **Medication administration** training if applicable
   - **Home equipment** (humidifier, monitors) understanding

### Bands

| Score | Severity | Tactic |
|---|---|---|
| 0-2 | НЕ готов | Continued NICU |
| 3-4 | Близок | Identify gaps, work intensively |
| 5 | Готов | Discharge |

### Discharge protocol

#### 24-48 ч до discharge:
- Physical exam
- Weight check (gain trend confirmed)
- Education completed
- Screenings results reviewed
- Follow-up appointments arranged

#### Day of discharge:
- **Car seat challenge** (90-120 мин)
- Final exam, weight, vital signs
- Removal IV / NG access
- Discharge medications dispensed
- Written/verbal instructions provided
- Hospital social work involvement

#### After discharge:
- **Pediatrician follow-up 24-72 ч** после
- **Subspecialty:** cardio, neuro, ophthal per condition
- **Hearing screening** repeat at 1-3 мес
- **Developmental follow-up** (high-risk)

### Late preterm caveats

Late preterm (34-36 нед) — особенный риск:
- Often "appears" mature
- Hypoglycemia risk
- Hyperbilirubinemia risk
- Feeding difficulties
- ↑ Readmission rate (1.5-2× term)
- Recommendation: 48-72 ч hospital stay minimum

### High-risk discharge planning

#### ELBW / VLBW:
- Multiple subspecialists
- Home oxygen if BPD
- Apnea monitor (controversial)
- Fortified breastmilk / preterm formula until corrected age
- NICU follow-up clinic

#### CHD (post-cardiac surgery):
- Cardiology follow-up
- Continued medications (digoxin, diuretics, ACE-i)
- Activity restrictions
- Sat monitoring при cyanotic CHD

#### HIE:
- Neurology follow-up
- Anticonvulsants if applicable
- Developmental follow-up
- MRI brain (если не done)

### Источники

- AAP COFN 2008 Pediatrics 122:1119
- Engle WA AAP COFN 2007 — Late preterm infants
- Eichenwald EC AAP COFN 2018 — Apnea of prematurity
- КР МЗ РФ "Выписка новорождённого" (2024)
`,
};

export default runner;
