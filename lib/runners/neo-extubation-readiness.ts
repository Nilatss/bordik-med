/**
 * Runner: neo-extubation-readiness — Готовность к extubation у preterm
 *
 * NEONATOLOGY MODULE — protocol classification.
 *
 * Assessment готовности preterm newborn к extubation от mechanical ventilation.
 * Predictors of extubation success у preterm — multi-factorial.
 *
 * Common indicators (Spontaneous Breathing Trial = SBT):
 *   1. Adequate spontaneous respiratory effort
 *   2. Hemodynamic stability
 *   3. FiO₂ ≤ 30 %
 *   4. Minimal ventilator support (PEEP ≤ 5-7, PIP ≤ 16-18)
 *   5. Caffeine therapy adequate
 *   6. Successful endotracheal CPAP trial (некоторые protocols)
 *
 * SOURCES:
 *   - Sant'Anna GM et al. — neonatal extubation review
 *   - Manley BJ et al. — extubation predictors trial
 *   - Polin RA et al. — preterm respiratory management
 *   - КР МЗ РФ "ИВЛ у новорождённых" (2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *
 * Failure rate без assessment: 30-40 % preterm < 28 нед PMA
 * С proper assessment: ↓ до 10-20 %
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 6,
  countries: 'Международный (Sant\'Anna / Manley) · РФ',
  reference: 'Sant\'Anna GM extubation review. Manley BJ extubation predictors. КР МЗ РФ ИВЛ.',
  inputs: [
    {
      id: 'spontaneous_breathing',
      label: 'Adequate spontaneous respiratory effort (regular pattern, не agonal)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'hemodynamic',
      label: 'Hemodynamic stability (no significant hypotension, no major inotropes)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'low_fio2',
      label: 'FiO₂ ≤ 30 % с adequate oxygenation (SpO₂ ≥ 90-95 %)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'minimal_support',
      label: 'Minimal ventilator support (PEEP ≤ 5-7, PIP ≤ 16-18, RR ≤ 30)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'caffeine',
      label: 'Caffeine therapy started (если PMA < 32 нед)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'sbt_pass',
      label: 'Spontaneous Breathing Trial (SBT) или CPAP trial successful',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 2,
      label: 'НЕ готов к extubation',
      color: '#EF4444',
      description: 'Significant gaps — продолжить ventilation.',
      actions: [
        '⚠️ НЕ готов к extubation — высокий риск failure',
        'Identify gaps:',
        '  - Если no spontaneous breathing — increase ventilator backup или sedation review',
        '  - Если hemodynamic instability — optimize fluid + inotropes',
        '  - Если FiO₂ > 30 % — investigate (RDS resolution, pneumonia, atelectasis)',
        '  - Если ventilator support high — wean settings первый',
        'Caffeine: start если PMA < 32 нед и не started',
        'Reassess через 24-48 ч',
      ],
    },
    {
      min: 3,
      max: 4,
      label: 'Близок — careful trial',
      color: '#F59E0B',
      description: 'Partial readiness — careful SBT trial.',
      actions: [
        'Partial readiness — careful SBT trial',
        'Wean ventilator settings к minimum (PEEP 5, PIP 14-16, RR 20-25)',
        'Monitor closely × 30-60 мин on minimum settings:',
        '  - SpO₂ stability',
        '  - HR / BP stability',
        '  - Work of breathing (no significant retractions, grunting)',
        'Если stable: proceed к extubation',
        'Если deterioration: continue ventilator + reassess later',
        'Family discussion / preparation',
      ],
    },
    {
      min: 5,
      max: 6,
      label: 'Готов к extubation — proceed',
      color: '#22C55E',
      description: 'Full readiness criteria met.',
      actions: [
        '✅ Готов к extubation',
        'Pre-extubation:',
        '  - Caffeine 20 мг/кг IV если не loading dose уже',
        '  - Pre-oxygenate FiO₂ + 10 % × 2 мин',
        '  - Suction airway',
        '  - Prepare CPAP / NIV at bedside',
        '  - Family present если desired',
        'Extubation:',
        '  - Remove ETT during expiration или brief positive pressure',
        '  - Immediate transition к CPAP 5-7 cmH₂O или NIV',
        '  - Monitor SpO₂, HR, work of breathing',
        'Post-extubation:',
        '  - Continue caffeine',
        '  - Watch для apnea, brady, desat × 24 ч closely',
        '  - Reintubate если: respiratory failure, persistent severe apnea, FiO₂ > 60 %',
        '  - Document successful extubation: ≥ 24 ч without reintubation',
      ],
    },
  ],
  compute(values): CalculatorResult {
    let count = 0;
    if (values.spontaneous_breathing === true) count++;
    if (values.hemodynamic === true) count++;
    if (values.low_fio2 === true) count++;
    if (values.minimal_support === true) count++;
    if (values.caffeine === true) count++;
    if (values.sbt_pass === true) count++;

    const band = findBand(runner.bands, count);

    return {
      value: `${count}/6`,
      unit: 'criteria',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. 6-criteria extubation readiness assessment.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Failure rate without proper assessment: 30-40 % preterm < 28 нед PMA',
    'С proper assessment + caffeine: ↓ до 10-20 %',
    'Caffeine therapy критично у < 32 нед — снижает apnea, ↓ extubation failure',
    'CAP trial: caffeine ↓ BPD + ↓ extubation failure rates',
    'SBT (spontaneous breathing trial) on minimum settings × 30-60 мин — useful predictor',
    'Endotracheal CPAP trial 30-60 мин — alternative SBT',
    'Pre-extubation: caffeine, pre-oxygenation, CPAP/NIV ready',
    'Post-extubation: continue caffeine, close monitoring × 24 ч',
    'Failure indicators: respiratory failure, persistent severe apnea, FiO₂ > 60 %, hemodynamic instability',
    'Reintubation criteria: RR > 80 sustained, apnea > 30 sec frequent, severe acidosis (pH < 7.20)',
    'НЕ extubate если recent: surgery, sepsis active, severe IVH (Grade III-IV)',
    'Document: ≥ 24 ч без reintubation = successful extubation',
  ],
  related: [
    { id: 'neo-caffeine-dose', title: 'Кофеин (CAP trial)' },
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'neo-surfactant-dose', title: 'Сурфактант' },
    { id: 'neo-rds-class', title: 'RDS classification' },
  ],
  info: `### Готовность к extubation у preterm

Multi-factorial assessment перед extubation от mechanical ventilation.

### 6-criteria readiness

1. **Adequate spontaneous respiratory effort**
   - Regular pattern, не agonal
   - RR в pre-extubation range (40-60 у preterm)

2. **Hemodynamic stability**
   - No significant hypotension
   - Off significant inotropes (или low-dose stable)

3. **FiO₂ ≤ 30 %**
   - Adequate oxygenation (SpO₂ ≥ 90-95 %)

4. **Minimal ventilator support**
   - PEEP ≤ 5-7 cmH₂O
   - PIP ≤ 16-18 cmH₂O
   - Rate ≤ 30
   - Pressure support adequate

5. **Caffeine therapy**
   - Started если PMA < 32 нед
   - Therapeutic level (5-25 мкг/мл если monitored)

6. **SBT or CPAP trial successful**
   - 30-60 мин on minimum settings
   - SpO₂ stability, HR/BP stability, WOB acceptable

### Spontaneous Breathing Trial (SBT)

#### Method:
1. Wean ventilator к minimum:
   - PEEP 5
   - PIP 14-16 (или endotracheal CPAP)
   - Backup rate 5-10 (или off)
2. Monitor × 30-60 мин:
   - SpO₂ ≥ 90-95 %
   - HR / BP stable
   - No significant retractions / grunting / nasal flaring
   - PaCO₂ acceptable (< 65, pH > 7.25)
3. Если stable: proceed к extubation
4. Если deterioration: continue ventilator

### Pre-extubation preparation

#### Equipment ready:
- **CPAP/NIV** circuit at bedside
- BVM, intubation supplies
- **Suction**
- **Caffeine** dose

#### Patient preparation:
- **Caffeine 20 мг/кг IV** if not on loading dose уже
- **Pre-oxygenate** FiO₂ + 10 % × 2 мин
- **Suction** ETT + oropharynx
- Family present если desired

### Extubation technique

1. **Pre-oxygenation** completed
2. **Suction** ETT
3. **Brief positive pressure** breath (некоторые protocols)
4. **Remove ETT** during expiration
5. **Immediate CPAP/NIV** (5-7 cmH₂O)
6. Monitor closely

### Post-extubation monitoring

| Parameter | Frequency |
|---|---|
| SpO₂ | Continuous |
| HR / RR | Continuous |
| Work of breathing | q15-30 мин × 2 ч |
| Blood gas | 1-2 ч after, then per protocol |

### Reintubation criteria

| Criterion | Reason |
|---|---|
| **Respiratory failure** | Severe acidosis (pH < 7.20) |
| **Persistent severe apnea** | > 30 sec frequent |
| **FiO₂ > 60 %** | Despite optimization |
| **Hemodynamic instability** | New onset |
| **Excessive WOB** | Severe retractions, grunting |
| **Aspiration** | Unable to clear |

### Failure rates

| | Without assessment | With proper protocol |
|---|---|---|
| **Preterm < 28 нед** | 30-40 % | 10-20 % |
| **Preterm 28-32 нед** | 20-30 % | 5-15 % |
| **Term/late preterm** | 10-15 % | < 10 % |

### CAP trial (Schmidt 2007 NEJM)

- Caffeine vs placebo у ELBW
- ↓ BPD (RR 0.63)
- **↓ Extubation failure rates**
- ↓ PDA, ROP severe
- Improved neurodev в 18-21 мес

### Когда AVOID extubation

| Condition | Why |
|---|---|
| Recent major surgery | Pain control, healing |
| **Active sepsis** | Hemodynamic instability |
| **Severe IVH (Grade III-IV) recent** | Risk progression |
| Active GI bleeding | Hemodynamic concern |
| **Pulmonary hypertension** active | Worsen с extubation |

### Documentation

| Item | Detail |
|---|---|
| **Reason для extubation** | Successful weaning |
| **Pre-extubation criteria** | All 6 met |
| **SBT result** | Successful × 30-60 мин |
| **Post-extubation course** | First 24 ч noted |
| **Successful extubation** | ≥ 24 ч без reintubation |

### Источники

- Sant'Anna GM et al. — neonatal extubation review
- Manley BJ et al. — extubation predictors trial
- Schmidt B et al. CAP trial NEJM 2007
- Polin RA et al. — preterm respiratory management
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "ИВЛ у новорождённых" (2024)
`,
};

export default runner;
