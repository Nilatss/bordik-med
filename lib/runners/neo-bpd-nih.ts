/**
 * Runner: neo-bpd-nih — NIH BPD (Bronchopulmonary Dysplasia) consensus 2001/2018
 *
 * NEONATOLOGY MODULE A29 (P1).
 *
 * Source attribution:
 *   PRIMARY 2001:  Jobe AH, Bancalari E. Bronchopulmonary dysplasia.
 *                  Am J Respir Crit Care Med. 2001;163(7):1723-1729.
 *                  doi:10.1164/ajrccm.163.7.2011060
 *                  (NICHD/NHLBI/ORD workshop consensus — original modern
 *                  definition with severity grades)
 *   UPDATE 2018:  Higgins RD, Jobe AH, Koso-Thomas M, et al. Bronchopulmonary
 *                 Dysplasia: Executive Summary of a Workshop. J Pediatr.
 *                 2018;197:300-308. doi:10.1016/j.jpeds.2018.01.043
 *                 (Updated to include high-flow nasal cannula; clarified
 *                  severity grading; emphasis on functional outcome)
 *
 * Definition:
 *   BPD diagnosed at 36 нед PMA (postmenstrual age) или discharge home
 *   (whichever first) для preterm infants <32 нед GA at birth.
 *
 * Severity grades (NIH 2018, simplified):
 *   - **Mild BPD:** infant breathing room air at 36 weeks PMA
 *   - **Moderate BPD:** need для FiO₂ <30% at 36 weeks PMA
 *   - **Severe BPD:** need для FiO₂ ≥30% AND/OR positive pressure
 *     (mechanical ventilation, NCPAP, NIPPV, или high-flow nasal cannula
 *     ≥2 L/min) at 36 weeks PMA
 *   - **No BPD:** не получает supplemental O₂ at 36 weeks PMA
 *
 * Prerequisite: minimum 28 days of supplemental O₂ ≥21% before 36 нед PMA.
 *
 * Outcomes:
 *   - Mild: ~90% survival к discharge; long-term respiratory baseline
 *   - Moderate: ~85%; ↑ asthma/RAD risk
 *   - Severe: ~70%; ↑ chronic lung disease, pulmonary hypertension,
 *     home O₂ requirement, ↑ NDI
 *
 * Caveats:
 *   - Definition требует ≥28 дней O₂ — short-term ventilator/CPAP не считается
 *   - Для preterm 32-36 нед — отдельные criteria (less common BPD)
 *   - 2018 update удалил "Bancalari criteria" (continuous use of O₂);
 *     current focus на clinical phenotype в 36 нед PMA
 *   - High-flow nasal cannula ≥2 L/min — теперь включено в severe (2018)
 *
 * SOURCES (audit 1.15):
 *   [1] Jobe & Bancalari 2001: doi.org/10.1164/ajrccm.163.7.2011060
 *   [2] Higgins 2018 update: doi.org/10.1016/j.jpeds.2018.01.043
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 3,
  countries: 'Международный (NIH 2001 / Jobe-Bancalari, NIH 2018 update)',
  reference:
    'Jobe AH, Bancalari E. AJRCCM 2001;163:1723. Higgins RD et al. J Pediatr 2018;197:300.',
  inputs: [
    {
      id: 'severity',
      label: 'Severity grade @ 36 нед PMA',
      type: 'select',
      options: [
        { value: '0', label: 'No BPD — breathing room air, ≥28 дней O₂ history', points: 0 },
        { value: '1', label: 'Mild — breathing room air at 36 нед PMA', points: 1 },
        { value: '2', label: 'Moderate — FiO₂ <30% at 36 нед PMA', points: 2 },
        { value: '3', label: 'Severe — FiO₂ ≥30% AND/OR positive pressure (CPAP/HFNC ≥2 L/min)', points: 3 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: 'No BPD',
      color: '#22C55E',
      description: 'Не BPD по NIH criteria — recovery без chronic lung disease.',
      details:
        'Получал supplemental O₂ ≥28 дней но к 36 нед PMA в room air. Стандартный preterm follow-up; respiratory outcomes хороший в большинстве cases.',
      actions: [
        'Standard preterm follow-up',
        'Influenza vaccination к 6 мес',
        'RSV prophylaxis (palivizumab) — обсудить с педиатром если высокий risk',
        'Routine asthma screening если respiratory symptoms develop',
      ],
    },
    {
      min: 1,
      max: 1,
      label: 'Mild BPD',
      color: '#84CC16',
      description: 'Breathing room air at 36 нед PMA. Хороший prognosis.',
      details:
        '~90% survival к discharge. Long-term respiratory baseline нормальный у большинства; небольшое ↑ asthma/recurrent wheezing risk.',
      actions: [
        'Discharge planning при stabilization',
        'RSV prophylaxis (palivizumab) — preterm <29 нед GA или с CLD требует разбора',
        'Influenza vaccination ≥6 мес corrected',
        'Avoid passive smoke exposure — major risk factor для recurrence',
        'Pulmonology follow-up если symptoms develop',
        'Bayley-III и vision/hearing screening per preterm protocol',
      ],
    },
    {
      min: 2,
      max: 2,
      label: 'Moderate BPD',
      color: '#F59E0B',
      description: 'FiO₂ <30% at 36 нед PMA. ↑ asthma/RAD risk.',
      details:
        '~85% survival; ↑ risk recurrent wheezing, asthma, post-RSV bronchiolitis. Большинство wean off O₂ к 6-12 мес corrected age.',
      actions: [
        'Continue O₂ at home if requirements stable; pulse ox monitoring',
        'RSV palivizumab — strongly recommended (CLD eligibility)',
        'Diuretics (furosemide / chlorothiazide) — discuss benefit/risk',
        'Caffeine until 34 нед PMA минимум',
        'Nutrition: ↑ caloric density (24-30 kcal/oz); growth as priority',
        'Pulmonology follow-up в 1-3 мес after discharge',
        'ECHO для PH screening при severe или persistent O₂ requirement',
      ],
    },
    {
      min: 3,
      max: 3,
      label: 'Severe BPD',
      color: '#EF4444',
      description: 'FiO₂ ≥30% AND/OR positive pressure at 36 нед PMA. Высокий risk PH + NDI.',
      details:
        '~70% survival; significant chronic lung disease, pulmonary hypertension в ~25%, home O₂ requirement, ↑ neurodevelopmental impairment, recurrent hospitalisations.',
      actions: [
        'Discharge planning с home O₂ + pulse ox',
        'RSV palivizumab — strongly recommended',
        'Pulmonology + cardiology follow-up в 1 мес',
        'ECHO for PH screening — повторно q3-6 мес если PH + treatment (sildenafil)',
        'Diuretics, inhaled bronchodilators, inhaled steroids — individualised',
        'Tracheostomy consideration если persistent vent dependency',
        'Aggressive nutrition support (calorically dense, ↑ protein)',
        'Multidisciplinary BPD clinic referral',
        'Family education о signs of respiratory deterioration, RSV avoidance',
      ],
    },
  ],
  caveats: [
    'Definition требует ≥28 дней O₂ supplementation before 36 нед PMA',
    '2018 update включил HFNC ≥2 L/min в severe — раньше unclear status',
    'Bancalari original definition (continuous O₂ use) deprecated 2018',
    '32-36 нед GA — separate criteria, less common BPD',
    'Pulmonary hypertension у severe BPD — ECHO screening обязательно',
    'Steroid therapy controversial: dexamethasone ↑ NDI, hydrocortisone — better balance',
    'BPD prevention: caffeine therapy, vitamin A, less invasive ventilation (LISA), avoid hyperoxia',
    'Long-term: ~30-40% severe BPD имеют respiratory symptoms в adulthood',
  ],
  related: [
    { id: 'silverman', title: 'Silverman-Anderson' },
    { id: 'apgar', title: 'Apgar' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы' },
  ],
  relatedCourses: [
    { id: '301.4', title: 'Неонатология' },
    { id: '301.2', title: 'Пульмонология' },
  ],
  presets: [
    { label: 'No BPD (recovery)', values: { severity: '0' } },
    { label: 'Mild BPD', values: { severity: '1' } },
    { label: 'Moderate BPD', values: { severity: '2' } },
    { label: 'Severe BPD', values: { severity: '3' } },
  ],
  info: `### NIH BPD Consensus 2001 + 2018 Update

| Severity | Determined at 36 нед PMA |
|---|---|
| **No BPD** | Breathing room air; история ≥28 дней O₂ supplementation |
| **Mild** | Breathing room air at 36 нед PMA |
| **Moderate** | FiO₂ <30% at 36 нед PMA |
| **Severe** | FiO₂ ≥30% AND/OR positive pressure (vent, CPAP, HFNC ≥2 L/min) |

### Diagnostic prerequisite

- **GA при рождении <32 нед** (для 32-36 нед — separate criteria, less common)
- **Minimum 28 дней supplemental O₂** ≥21% before 36 нед PMA
- Assessment **at 36 нед PMA** (postmenstrual age — corrected age + GA)

### 2018 Update changes (vs 2001)

- ✅ Включён **HFNC ≥2 L/min** в severe (раньше unclear)
- ✅ Удалён "Bancalari continuous O₂" criterion
- ✅ Emphasis на **functional outcome** vs purely radiologic
- ✅ Уточнено что No BPD требует история ≥28 дней O₂ (otherwise — never had BPD)

### Outcomes by severity

| Severity | Survival | Respiratory long-term | NDI risk |
|---|---|---|---|
| No BPD | ~99% | Близко normal | Baseline preterm |
| Mild | ~90% | Slight ↑ asthma | Slight ↑ |
| Moderate | ~85% | ↑ asthma, RSV, bronchiolitis | Modest ↑ |
| Severe | ~70% | Chronic lung disease, PH ~25% | Significant ↑ |

### Prevention strategies (proven)

| Intervention | Effect | Strength |
|---|---|---|
| **Caffeine** до 34 нед PMA | ↓ BPD ~10%, ↓ apnoea | Strong (CAP trial) |
| **Vitamin A** (5000 IU IM 3×/нед × 4 нед) | ↓ BPD ~7% | Moderate |
| **Less invasive surfactant (LISA/MIST)** | ↓ BPD vs intubation | Strong (OPTIMIST) |
| **Avoid hyperoxia:** SpO₂ 90-95% | ↓ ROP, не ↑ mortality | Strong (BOOST-II) |
| **Antenatal corticosteroids** | ↓ RDS → ↓ BPD downstream | Standard care |
| **Magnesium sulfate** | Neuroprotection (not BPD direct) | Standard |

### Treatment of established BPD

**Pharmacologic:**
- **Diuretics:** furosemide (acute), chlorothiazide + spironolactone (chronic) — мoderate evidence
- **Inhaled bronchodilators:** salbutamol — short-term wheezing
- **Inhaled corticosteroids:** budesonide — controversial, может ↓ readmission
- **Systemic corticosteroids:** dexamethasone (DART regimen) ↓ extubation failure но ↑ NDI;
  hydrocortisone — better balance, less neurotoxicity
- **Sildenafil** — для pulmonary hypertension; PDE-5 inhibitor

**Non-pharmacologic:**
- High-calorie nutrition (24-30 kcal/oz) — рост priority
- O₂ titration: SpO₂ 92-95% target (avoid hyperoxia)
- Less invasive ventilation: LISA, MIST, NIPPV, HFNC
- Tracheostomy если persistent vent dependency >40 нед PMA

### Pulmonary hypertension (PH) в severe BPD

- ~25% severe BPD имеют PH к discharge
- ECHO screening: SPAP, RV function, IVS shape
- Treatment: sildenafil (oral), inhaled NO (acute), bosentan (refractory)
- Mortality risk при PH-BPD ↑ 2-3×

### RSV prophylaxis (palivizumab)

- **Eligibility:** preterm <29 нед GA OR <32 нед GA + BPD/CHD/cystic
  fibrosis
- **Dose:** 15 mg/kg IM monthly during RSV season (October-April US)
- **AAP 2014 update** restricted eligibility — local guidelines

### Источники

- Jobe AH, Bancalari E. AJRCCM 2001;163:1723 (original NIH consensus)
- Higgins RD et al. J Pediatr 2018;197:300 (2018 update)
- Cochrane reviews: caffeine, vitamin A, dexamethasone
- AAP Committee на Infectious Diseases — palivizumab guidelines

### Ограничения

- BPD definition focused на 36 нед PMA — long-term outcomes более complex
- 32-36 нед GA — separate (less common) criteria
- Steroid therapy controversies — discuss benefit/risk per case
- Bordik MVP — staging only; full pulmonary management требует
  multidisciplinary BPD clinic

### Connect to roadmap

- M3-M6: добавить ECHO PH screening calculator, ICROP3 ROP staging
- M7-M9: pulmonary hypertension severity score, sildenafil dosing
- Long-term follow-up: respiratory outcomes tracker
`,
};

export default runner;
