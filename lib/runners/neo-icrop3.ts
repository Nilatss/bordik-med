/**
 * Runner: neo-icrop3 — International Classification of Retinopathy of Prematurity (ICROP3 2021)
 *
 * NEONATOLOGY MODULE A30 (P1).
 *
 * Source attribution:
 *   PRIMARY:    Chiang MF, Quinn GE, Fielder AR, et al. International
 *               Classification of Retinopathy of Prematurity, Third
 *               Edition. Ophthalmology. 2021;128(10):e51-e68.
 *               doi:10.1016/j.ophtha.2021.05.031
 *   PRIOR:      ICROP (1984) → ICROP-Revised 2005 → ICROP3 (2021).
 *               ICROP3 update reflects expanded screening (smaller babies),
 *               anti-VEGF therapy era, and AROP (aggressive ROP) — replaces
 *               older "AP-ROP" terminology.
 *   GUIDELINE:  AAP 2018 Screening for ROP. Pediatrics. 2018;142(6):
 *               e20183061.
 *               UK NICE 2008 (с update 2024) — screening for premature
 *               infants.
 *
 * Key components:
 *   1. **Zone** — anatomical location (1, 2, 3) — distance from optic disc
 *      Zone 1 — most posterior, most severe
 *      Zone 2 — middle annulus
 *      Zone 3 — peripheral temporal crescent
 *
 *   2. **Stage** — severity of vascular disease (1-5)
 *      Stage 1 — demarcation line
 *      Stage 2 — ridge
 *      Stage 3 — ridge with extraretinal fibrovascular proliferation
 *      Stage 4 — partial retinal detachment (4A peripheral, 4B macula)
 *      Stage 5 — total retinal detachment
 *
 *   3. **Plus disease** — vascular tortuosity + dilation в посterior pole
 *      Pre-plus: abnormal but не sufficient для plus
 *      Plus: arterial tortuosity + venous dilation в ≥2 quadrants
 *
 *   4. **AROP** (aggressive ROP) — ICROP3 new term (replaces AP-ROP)
 *      Severe disease в zone 1 OR posterior zone 2, often без typical stage
 *      progression. May skip stages 1-2 → Stage 3 + plus в недели.
 *
 *   5. **Extent** — clock hours involved (1-12)
 *
 * Treatment thresholds (ETROP / BEAT-ROP / RAINBOW):
 *   Type 1 ROP (treatment indicated):
 *     - Zone 1 + any stage + plus
 *     - Zone 1 + stage 3 (без plus)
 *     - Zone 2 + stage 2-3 + plus
 *     - AROP (any zone)
 *
 *   Type 2 ROP (close observation, не treatment):
 *     - Zone 1 + stage 1-2 + no plus
 *     - Zone 2 + stage 3 + no plus
 *
 * Treatment options:
 *   - Anti-VEGF (bevacizumab, ranibizumab, aflibercept) — preferred для
 *     zone 1, AROP (RAINBOW trial)
 *   - Laser photocoagulation — peripheral avascular retina; standard
 *     для zone 2 disease
 *
 * Screening protocol (AAP 2018):
 *   - Birth GA ≤30 нед OR BW ≤1500 г: всех screen
 *   - Birth GA 30-32 нед + BW 1500-2000 г: screen if unstable course OR
 *     supplemental O₂ ≥3 days
 *   - First exam: 4 нед chronological age OR 31 нед PMA (later one)
 *   - Repeat q1-3 нед в зависимости от findings
 *
 * SOURCES (audit 1.15):
 *   [1] ICROP3 2021: doi.org/10.1016/j.ophtha.2021.05.031
 *   [2] AAP 2018 ROP screening: doi.org/10.1542/peds.2018-3061
 *   [3] ETROP 2003: archopht.jamanetwork.com
 *   [4] RAINBOW (ranibizumab): doi.org/10.1016/S0140-6736(19)31242-4
 */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ICROP3 2021 / AAP 2018)',
  reference:
    'Chiang MF et al. ICROP3. Ophthalmology 2021;128:e51. AAP 2018 Pediatrics 142:e20183061. ETROP 2003. RAINBOW Lancet 2019.',
  inputs: [
    {
      id: 'zone',
      label: 'Zone (анатомическая область)',
      type: 'select',
      options: [
        { value: '1', label: 'Zone 1 — наиболее задняя (вокруг оптического диска)' },
        { value: '2', label: 'Zone 2 — средняя кольцо (от zone 1 до ora serrata назально)' },
        { value: '3', label: 'Zone 3 — temporal crescent (наиболее периферическая)' },
      ],
    },
    {
      id: 'stage',
      label: 'Stage (severity)',
      type: 'select',
      options: [
        { value: '0', label: 'Stage 0 — immature retina, no disease' },
        { value: '1', label: 'Stage 1 — demarcation line' },
        { value: '2', label: 'Stage 2 — ridge' },
        { value: '3', label: 'Stage 3 — extraretinal fibrovascular proliferation' },
        { value: '4', label: 'Stage 4 — partial retinal detachment (4A peripheral / 4B macular)' },
        { value: '5', label: 'Stage 5 — total retinal detachment' },
      ],
    },
    {
      id: 'plus',
      label: 'Plus disease',
      type: 'select',
      options: [
        { value: 'none', label: 'No plus' },
        { value: 'pre', label: 'Pre-plus' },
        { value: 'plus', label: 'Plus disease (≥2 quadrants tortuosity + dilation)' },
      ],
    },
    {
      id: 'arop',
      label: 'AROP (Aggressive ROP) — ICROP3 new term',
      type: 'checkbox',
    },
    {
      id: 'extent',
      label: 'Extent (clock hours involved, 1-12)',
      type: 'number',
      unit: 'час',
      min: 0,
      max: 12,
      step: 1,
      hint: '0 если нет disease',
      quickValues: [0, 3, 6, 9, 12],
    },
  ],
  presets: [
    { label: 'Stage 0 (immature)', values: { zone: '2', stage: '0', plus: 'none', arop: false, extent: 0 } },
    { label: 'Type 1 ROP (Zone 1 + stage 3 + plus)', values: { zone: '1', stage: '3', plus: 'plus', arop: false, extent: 6 } },
    { label: 'Type 2 ROP (Zone 2 + stage 3, no plus)', values: { zone: '2', stage: '3', plus: 'none', arop: false, extent: 4 } },
    { label: 'AROP (zone 1)', values: { zone: '1', stage: '3', plus: 'plus', arop: true, extent: 12 } },
    { label: 'Stage 5 (total detachment)', values: { zone: '1', stage: '5', plus: 'plus', arop: false, extent: 12 } },
  ],
  compute: (v) => {
    const zone = String(v.zone || '2');
    const stage = String(v.stage || '0');
    const plus = String(v.plus || 'none');
    const arop = v.arop === true;
    const extent = Math.max(0, Math.min(12, Number(v.extent) || 0));

    // Type 1 vs Type 2 vs immature/regression
    let classification: 'Type1' | 'Type2' | 'Immature' | 'Regression' | 'Detachment';
    let recommendation: string;
    let color = '#22C55E';

    if (stage === '0') {
      classification = 'Immature';
      recommendation = 'Immature retina — repeat screening per AAP/local protocol';
      color = '#22C55E';
    } else if (stage === '4' || stage === '5') {
      classification = 'Detachment';
      recommendation = `Stage ${stage} — vitrectomy / scleral buckling, vision rescue limited`;
      color = '#7F1D1D';
    } else if (
      arop ||
      (zone === '1' && (plus === 'plus' || stage === '3')) ||
      (zone === '2' && (stage === '2' || stage === '3') && plus === 'plus')
    ) {
      classification = 'Type1';
      recommendation = 'Type 1 ROP — TREATMENT indicated в течение 72 ч';
      color = '#7F1D1D';
    } else if (
      (zone === '1' && (stage === '1' || stage === '2') && plus !== 'plus') ||
      (zone === '2' && stage === '3' && plus !== 'plus')
    ) {
      classification = 'Type2';
      recommendation = 'Type 2 ROP — close observation, не treatment';
      color = '#F59E0B';
    } else {
      classification = 'Regression';
      recommendation = 'Mild ROP / regressing disease — continue monitoring';
      color = '#84CC16';
    }

    const value = arop ? `AROP (Z${zone} S${stage})` : `Z${zone} S${stage}${plus === 'plus' ? '+' : plus === 'pre' ? ' pre+' : ''}${extent ? ` ${extent}ч` : ''}`;
    const interpretation = `${value} — ${classification === 'Type1' ? 'Type 1 (treatment)' : classification === 'Type2' ? 'Type 2 (observe)' : classification}`;

    const actions: string[] = [];

    if (classification === 'Type1' || arop) {
      actions.push(
        '⚠️ ТРЕБУЕТСЯ ЛЕЧЕНИЕ в течение 72 ч',
        'Anti-VEGF (bevacizumab 0.625 мг intravitreal) — preferred для zone 1 / AROP (RAINBOW trial показал superior к laser)',
        'Laser photocoagulation peripheral avascular retina — standard для zone 2',
        'Direct referral к pediatric ophthalmology / retina specialist',
        'Pre-op: установить IV access, sedation/anesthesia plan',
        'Post-treatment: weekly exam × 4, затем biweekly до regression OR retreat если progression',
      );
    } else if (classification === 'Type2') {
      actions.push(
        'Close observation — экзамен дважды в неделю',
        'Без treatment если не progress к Type 1',
        '~80% Type 2 регрессирует без treatment',
        'Документировать каждый exam (zone, stage, plus, extent)',
      );
    } else if (classification === 'Immature') {
      actions.push(
        'Continue screening per AAP 2018 protocol',
        'Repeat exam через 1-2 нед в зависимости от GA / vascularization',
        'Stop screening: full vascularization OR 50 нед PMA without significant ROP',
      );
    } else if (classification === 'Detachment') {
      actions.push(
        '⚠️ Stage 4-5 — поздний выход; vision rescue ограничен',
        'Stage 4A: scleral buckling может сохранить peripheral vision',
        'Stage 4B (macular detachment): vitrectomy — limited vision recovery',
        'Stage 5 (total): vitrectomy для anatomical recovery, не для vision',
        'Long-term: low vision support, retinal scarring follow-up',
      );
    }

    if (plus === 'plus') {
      actions.push('Plus disease present — usually требует treatment regardless of stage');
    }

    const details = `### Текущая classification

| Параметр | Значение |
|---|---|
| Zone | ${zone} |
| Stage | ${stage} |
| Plus | ${plus === 'plus' ? '**Plus disease**' : plus === 'pre' ? 'Pre-plus' : 'No plus'} |
| AROP | ${arop ? '**Yes (Aggressive)**' : 'No'} |
| Extent | ${extent} clock hours |
| Classification | **${classification}** |

### ICROP3 components

**Zone:**
- Zone 1 — circle around optic disc, radius = 2× distance disc-to-fovea
- Zone 2 — annulus from zone 1 outer edge to nasal ora serrata
- Zone 3 — temporal crescent выходящий за zone 2

**Stage:**
- 0 — immature retina, no disease
- 1 — demarcation line (line between vascular and avascular retina)
- 2 — ridge (line elevates into 3D structure)
- 3 — extraretinal fibrovascular proliferation (NV growing into vitreous)
- 4 — partial retinal detachment (4A peripheral, 4B includes macula)
- 5 — total retinal detachment

**Plus disease:**
- Posterior pole vascular tortuosity + venous dilation
- ≥2 quadrants involvement
- Pre-plus: abnormal but не достигает plus criteria

**AROP (Aggressive ROP, ICROP3 new term):**
- Severe ROP в zone 1 OR posterior zone 2
- Often без typical stage progression
- May skip stages 1-2 → directly stage 3 + plus
- Replaces older "AP-ROP" (Aggressive Posterior ROP)

### Treatment criteria (ETROP / RAINBOW)

| Type | Criteria | Action |
|---|---|---|
| **Type 1** | Zone 1 + any stage + plus | TREAT в 72 ч |
| | Zone 1 + stage 3 (без plus) | TREAT |
| | Zone 2 + stage 2-3 + plus | TREAT |
| | **AROP** (любой zone) | TREAT |
| **Type 2** | Zone 1 + stage 1-2 + no plus | Observe |
| | Zone 2 + stage 3 + no plus | Observe |

### Screening protocol (AAP 2018)

| Birth GA / BW | Initial exam |
|---|---|
| ≤30 нед OR ≤1500 г | All screen |
| 30-32 нед + 1500-2000 г | Screen if unstable OR ≥3 days O₂ |
| **First exam** | 4 нед chronological OR 31 нед PMA (later) |
| **Repeat** | q1-3 нед per findings |
| **Stop** | Full vascularization OR 50 нед PMA без severe |

### Treatment options

| Modality | Pros | Cons |
|---|---|---|
| **Anti-VEGF** (bevacizumab/ranibizumab) | Superior для zone 1 (RAINBOW), single injection, no anesthesia | Long-term safety unclear, late recurrence 6-12 мес |
| **Laser photocoagulation** | Standard для zone 2, durable | Loss of peripheral vision, может induce myopia |

**RAINBOW (Lancet 2019):** ranibizumab 0.2 мг intravitreal showed
superior outcomes vs laser в zone 1 disease.`;

    return {
      value,
      unit: classification,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'ICROP3 (2021) — current standard; AROP заменил older AP-ROP terminology',
        'Anti-VEGF preferred для zone 1 / AROP (RAINBOW trial); laser для zone 2',
        'Late recurrence 6-12 мес после anti-VEGF — продолжать follow-up',
        'Stage 4-5 outcomes poor — vision rescue limited даже после vitrectomy',
        'Plus disease часто triggers treatment regardless of stage',
        'Documentation each exam: zone, stage, plus status, extent (clock hours), regression vs progression',
        'Ophthalmology referral within 24-48 ч если Type 1 detected',
        'AAP 2018 screening criteria expanding — рассмотреть для borderline cases',
      ],
      scale: {
        segments: [
          { min: 0, max: 0.5, label: 'Immature', color: '#22C55E' },
          { min: 0.5, max: 1.5, label: 'Stage 1', color: '#84CC16' },
          { min: 1.5, max: 2.5, label: 'Stage 2', color: '#FACC15' },
          { min: 2.5, max: 3.5, label: 'Stage 3', color: '#F59E0B' },
          { min: 3.5, max: 4.5, label: 'Stage 4', color: '#EF4444' },
          { min: 4.5, max: 5, label: 'Stage 5', color: '#7F1D1D' },
        ],
        current: Number(stage),
        unit: 'Stage',
      },
      related: [
        { id: 'apgar', title: 'Apgar' },
        { id: 'neo-bpd-nih', title: 'NIH BPD' },
        { id: 'neo-papile', title: 'Papile ВЖК' },
        { id: 'neo-fluid', title: 'Жидкость по дням' },
      ],
      relatedCourses: [
        { id: '301.4', title: 'Неонатология' },
        { id: '315.1', title: 'Офтальмология' },
      ],
    };
  },
  info: `### ICROP3 (2021) overview

International Classification of Retinopathy of Prematurity, Third Edition
— current standard для documentation и treatment decisions.

### Components

1. **Zone** — anatomical location (1, 2, 3)
2. **Stage** — severity (0-5)
3. **Plus disease** — vascular tortuosity + dilation
4. **AROP** — aggressive ROP (new in ICROP3, replaces AP-ROP)
5. **Extent** — clock hours involved

### Treatment thresholds

**Type 1 ROP (TREAT):**
- Zone 1 + any stage + plus
- Zone 1 + stage 3 (без plus OK)
- Zone 2 + stage 2-3 + plus
- AROP (любой zone)

**Type 2 ROP (OBSERVE):**
- Zone 1 + stage 1-2 + no plus
- Zone 2 + stage 3 + no plus

### Treatment options

| Modality | Indication | Evidence |
|---|---|---|
| Anti-VEGF (bevacizumab 0.625 мг IVT) | Zone 1, AROP | RAINBOW Lancet 2019 — superior к laser |
| Laser photocoagulation | Zone 2 disease | ETROP 2003 — standard за десятилетия |

### Screening (AAP 2018)

| Population | Action |
|---|---|
| BW ≤1500 г OR GA ≤30 нед | Screen all |
| BW 1500-2000 г + GA 30-32 нед | Screen if unstable OR ≥3 days O₂ |
| First exam | 4 нед chronological OR 31 нед PMA |
| Stop | Full vascularization OR 50 нед PMA без severe |

### Risk factors

- **Prematurity:** strongest (≤28 нед especially)
- **Hyperoxia:** SpO₂ >95% supplemental O₂
- **Sepsis, NEC, IVH** — secondary risk
- **Slow growth, sudden weight changes**
- **Maternal smoking, gestational diabetes** — modest associations

### Источники

- Chiang MF et al. ICROP3. Ophthalmology 2021;128:e51
- AAP 2018 ROP screening — Pediatrics 142:e20183061
- ETROP 2003 — original treatment criteria
- RAINBOW (ranibizumab) Lancet 2019;394:1551
- BEAT-ROP (bevacizumab) NEJM 2011

### Ограничения

- ROP examination требует skilled paediatric ophthalmologist
- Plus disease assessment субъективен — fundus photography helps
- Anti-VEGF long-term safety unclear (systemic absorption у preterm)
- Late recurrence 6-12 мес после anti-VEGF — extended follow-up
`,
};

export default runner;
