/**
 * Runner: neo-rop-screen-timing — Timing ROP screening (когда первый осмотр)
 *
 * NEONATOLOGY MODULE — protocol classification.
 *
 * Расчёт первого ROP screening visit на основе GA + chronologic age.
 *
 * Critria для screening (AAP/AAO/AAPOS 2018, обновлённый):
 *   - GA ≤ 30+6 нед при рождении ИЛИ
 *   - Birth weight ≤ 1500 г ИЛИ
 *   - GA 31-32 нед или BW 1500-2000 г с unstable clinical course (cardiopulmonary
 *     compromise, sepsis, surgery)
 *
 * Timing первого examina:
 *   GA ≤ 27 нед: 31 нед PMA
 *   GA 28-31 нед: 4 нед chronologic age
 *   GA 32 нед: 4 нед chronologic age
 *
 * Whichever comes LATER (max of PMA-based or chronologic-based).
 *
 * SOURCES:
 *   - AAP/AAO/AAPOS 2018 — Screening ROP (Pediatrics 142:e20183061)
 *   - Chiang MF et al. ICROP3 Ophthalmology 2021
 *   - КР МЗ РФ "Ретинопатия недоношенных" (2024)
 *
 * Stages (ICROP3): см. neo-icrop3 calculator
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  countries: 'Международный (AAP/AAO/AAPOS 2018 / ICROP3) · РФ',
  reference: 'AAP/AAO/AAPOS 2018 (Pediatrics 142:e20183061). Chiang MF ICROP3 Ophth 2021.',
  inputs: [
    {
      id: 'ga_weeks',
      label: 'GA при рождении (полные недели)',
      type: 'select',
      options: [
        { value: '5', label: '< 27 нед (extreme preterm)', points: 5 },
        { value: '4', label: '27-29 нед (very preterm)', points: 4 },
        { value: '3', label: '30-31 нед (moderate-very preterm)', points: 3 },
        { value: '2', label: '32 нед (late preterm если unstable)', points: 2 },
        { value: '1', label: '33-36 нед (only если unstable course + BW < 2000 г)', points: 1 },
        { value: '0', label: '≥ 37 нед (no screening если no risk factors)', points: 0 },
      ],
    },
    {
      id: 'birth_weight',
      label: 'Birth weight',
      type: 'select',
      options: [
        { value: '3', label: '< 750 г (ELBW high-risk)', points: 3 },
        { value: '2', label: '750-999 г (ELBW)', points: 2 },
        { value: '1', label: '1000-1500 г (VLBW)', points: 1 },
        { value: '0', label: '> 1500 г (only screen if other risk factors)', points: 0 },
      ],
    },
    {
      id: 'unstable',
      label: 'Unstable clinical course (cardiopulmonary, sepsis, surgery, prolonged O₂)',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'Не нужен скрининг',
      color: '#22C55E',
      description: 'Не соответствует критериям screening.',
      actions: [
        'GA ≥ 32 нед + BW > 2000 г + stable course → no routine ROP screening',
        'Если develops complications (sepsis, surgery, prolonged O₂) → reassess',
        'Routine eye examination в pediatric follow-up (term schedule)',
      ],
    },
    {
      min: 2,
      max: 4,
      label: 'Screening показан — стандартный timing',
      color: '#F59E0B',
      description: 'Соответствует screening criteria.',
      actions: [
        'First ROP exam: 4-6 нед chronologic age ИЛИ 31 нед PMA (whichever later)',
        'GA 28-31 нед: 4 нед chronologic age',
        'GA 32 нед: 4 нед chronologic age',
        'Examiner: ophthalmologist trained в ROP / ICROP3',
        'Mydriatic drops 30 мин перед exam (cyclopentolate 0.2 % + phenylephrine 1 %)',
        'Documentation: zone, stage, plus disease, AROP',
      ],
    },
    {
      min: 5,
      max: 9,
      label: 'High-risk — screening немедленно',
      color: '#EF4444',
      description: 'Extreme preterm / ELBW — high ROP risk.',
      actions: [
        '⚠️ High-risk ROP — screening критически важен',
        'GA ≤ 27 нед: First exam 31 нед PMA',
        'ELBW < 1000 г: priorititized for ROP screening team',
        'Frequent follow-up: q1-2 нед если any zone 1 disease, plus disease, или stage 2+ in zone 2',
        'Immediate ophthalmologic referral если ICROP3 stage 3+ ANYWHERE',
        'Treatment threshold (Type 1 ROP): laser ± anti-VEGF в 72 ч',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const gaPoints = Number(values.ga_weeks ?? 0);
    const wtPoints = Number(values.birth_weight ?? 0);
    const unstable = values.unstable === true ? 1 : 0;
    const total = gaPoints + wtPoints + unstable;

    const band = findBand(runner.bands, total);

    // Detailed timing calculation
    let timingDetails = '';
    if (gaPoints >= 4) {
      timingDetails = '31 нед PMA (для GA ≤ 27 нед)';
    } else if (gaPoints === 3) {
      timingDetails = '4 нед chronologic age ИЛИ 31 нед PMA (later)';
    } else if (gaPoints === 2) {
      timingDetails = '4 нед chronologic age';
    } else if (gaPoints === 1) {
      timingDetails = 'Если screening criteria met (unstable course): 4 нед chronologic age';
    } else {
      timingDetails = 'No routine ROP screening unless other risk factors';
    }

    return {
      value: String(total),
      unit: 'risk score',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. Timing: ${timingDetails}.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'AAP/AAO/AAPOS 2018: GA ≤ 30+6 нед ИЛИ BW ≤ 1500 г → screening obligatory',
    'GA 31-32 нед или BW 1500-2000 г → screen только если unstable course',
    'First exam timing rule: whichever comes LATER (PMA-based or chronologic-based)',
    'Mydriatic drops 30 мин перед exam: cyclopentolate 0.2 % + phenylephrine 1 % (не tropicamide alone)',
    'Frequent follow-up при findings: zone 1 disease, plus disease, stage 2+ в zone 2',
    'Treatment threshold (Type 1 ROP): zone 1 any stage with plus, ИЛИ zone 1 stage 3 без plus, ИЛИ zone 2 stage 2-3 with plus',
    'Treatment options: laser photocoagulation (gold standard), anti-VEGF (bevacizumab, ranibizumab — для zone 1)',
    'Treatment timing: в 72 ч от Type 1 diagnosis',
    'Discharge eye exam: документировать перед home (если completed screen — confirm regression / mature retina)',
    'Long-term: refraction error, strabismus, glaucoma, retinal detachment риск даже после treatment',
  ],
  related: [
    { id: 'neo-icrop3', title: 'ICROP3 ROP staging' },
    { id: 'neo-prematurity-class', title: 'Классификация недоношенности' },
    { id: 'neo-low-flow-o2', title: 'Low-flow O₂' },
    { id: 'neo-fenton', title: 'Fenton growth' },
  ],
  info: `### Timing ROP screening у новорождённых

Расчёт когда начинать ROP (retinopathy of prematurity) screening
по AAP/AAO/AAPOS 2018 guidelines.

### Критерии screening

| Критерий | Threshold |
|---|---|
| **GA при рождении** | ≤ 30+6 нед |
| **Birth weight** | ≤ 1500 г |
| **Unstable course** | GA 31-32 нед / BW 1500-2000 г + cardiopulmonary, sepsis, prolonged O₂ |

### Timing первого examination

| GA при рождении | First exam |
|---|---|
| **≤ 27 нед** | **31 нед PMA** |
| 28-31 нед | 4 нед chronologic age |
| 32 нед (если unstable) | 4 нед chronologic age |

**Rule:** whichever comes LATER (PMA-based или chronologic-based).

### Subsequent examinations

#### Frequency:
| Findings | Follow-up |
|---|---|
| **Zone 1, stage 1-2** | q1 нед |
| **Zone 1, stage 3 ± plus** | **Treatment в 72 ч** |
| Zone 2, stage 1-2 | q2 нед |
| Zone 2, stage 3 + plus | Treatment в 72 ч |
| Zone 3, stage 1-2 | q2-3 нед |
| Mature retina | Discharge with eye exam follow-up |
| Plus disease | More frequent → treatment если indicated |
| AROP | Treatment в 72 ч |

### Mydriatic protocol (перед exam)

- **30 мин до exam:**
  - Cyclopentolate 0.2 % — 1 капля в каждый глаз
  - Phenylephrine 1 % — 1 капля в каждый глаз (или 2.5 %)
- **Не tropicamide alone** (insufficient mydriasis у dark iris)
- **Caution:** systemic effects (cyclopentolate apnea, phenylephrine HTN) у preterm — observe

### Treatment thresholds (Type 1 ROP — ETROP)

Treatment indicated в 72 ч если:
- **Zone 1**, any stage, **with plus disease**
- **Zone 1**, **stage 3**, без plus
- **Zone 2**, **stage 2-3**, **with plus disease**
- **AROP** (aggressive posterior ROP)

### Treatment options

| Option | Indication | Note |
|---|---|---|
| **Laser** photocoagulation | Gold standard | Anesthesia, multiple sessions |
| **Anti-VEGF** (bevacizumab, ranibizumab) | Zone 1, AROP | Single injection; off-label у preterm |
| **Vitrectomy** | Stage 4-5 (retinal detachment) | Severe cases |
| **Cryotherapy** | Historical | Replaced by laser |

### Long-term consequences

| Issue | Frequency | Management |
|---|---|---|
| **Myopia** | + (most common) | Glasses |
| **Strabismus** | + | Surgery PRN |
| **Glaucoma** | rare | Routine monitoring |
| **Retinal detachment** | severe ROP даже treated | Vitrectomy |
| **Vision impairment** | severe ROP | Education, support |

### NIH consensus / ICROP3 (Chiang 2021 Ophth)

- Updated classification: zones 1-3, stages 0-5
- Plus disease: dilated/tortuous vessels in posterior pole
- AROP (aggressive posterior): rapid progression, often with plus
- See **neo-icrop3** для detailed staging

### Источники

- AAP/AAO/AAPOS 2018 (Pediatrics 142:e20183061)
- Chiang MF et al. ICROP3 Ophthalmology 2021
- ETROP study Group (treatment thresholds)
- BEAT-ROP trial (anti-VEGF)
- КР МЗ РФ "Ретинопатия недоношенных" (2024)
`,
};

export default runner;
