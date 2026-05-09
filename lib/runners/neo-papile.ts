/**
 * Runner: neo-papile — Papile classification of intraventricular haemorrhage (IVH)
 *
 * NEONATOLOGY MODULE A28 (P1).
 *
 * Source attribution:
 *   PRIMARY:    Papile LA, Burstein J, Burstein R, Koffler H. Incidence
 *               and evolution of subependymal and intraventricular
 *               hemorrhage: a study of infants with birth weights less
 *               than 1,500 gm. J Pediatr. 1978;92(4):529-534.
 *               doi:10.1016/s0022-3476(78)80282-0
 *   COMPANION:  Volpe JJ. Neurology of the Newborn, 6th ed. Elsevier 2018.
 *               (Современный contextualisation Papile + патогенез)
 *
 * Grading (head ultrasound через open anterior fontanelle):
 *   Grade I    — subependymal germinal matrix hemorrhage, без вентрикулов
 *   Grade II   — IVH без vehicular dilatation
 *   Grade III  — IVH с ventricular dilatation
 *   Grade IV   — IVH + parenchymal extension (intraparenchymal echodensity)
 *                Note: «Grade IV» обновлён как periventricular hemorrhagic
 *                infarction (PVHI), не направленное extension от IVH
 *
 * Outcomes (Volpe 2018, Synnes 2017):
 *   I    — Outcome ~ healthy preterm; long-term ~3-5% disability
 *   II   — ~5-10% major neurodevelopmental impairment
 *   III  — ~25-35% major NDI (cerebral palsy, cognitive delay)
 *   IV   — ~50-75% major NDI; survival 50-60%
 *
 * Screening:
 *   - All infants <32 нед GA OR <1500 g BW: head US в 7-10 days, повтор
 *     к 36 нед PMA или discharge (раньше при clinical concern)
 *   - При asphyxia / clinical seizures: emergency head US
 *
 * Caveats:
 *   - Window of detection: anterior fontanelle remains open до ~12-18 мес
 *   - Doppler / colour-flow useful для assessment perfusion при PVHI
 *   - MRI superior к US для cortical/posterior fossa lesions
 *
 * SOURCES (audit 1.15):
 *   [1] Papile 1978: pubmed.ncbi.nlm.nih.gov/305471
 *   [2] Volpe Neurology of Newborn 6 ed. (2018)
 *   [3] Synnes A et al. Pediatrics 2017 — outcomes by grade
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'Международный (Papile 1978; Volpe 2018)',
  reference:
    'Papile LA et al. J Pediatr 1978;92:529. Volpe JJ. Neurology of the Newborn 6 ed. Elsevier 2018.',
  inputs: [
    {
      id: 'grade',
      label: 'Степень ВЖК по Papile (head US)',
      type: 'select',
      options: [
        { value: '1', label: 'I — Subependymal germinal matrix hemorrhage', points: 1 },
        { value: '2', label: 'II — IVH без ventricular dilatation', points: 2 },
        { value: '3', label: 'III — IVH с ventricular dilatation', points: 3 },
        { value: '4', label: 'IV — IVH + parenchymal extension (PVHI)', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1,
      max: 1,
      label: 'I — Subependymal',
      color: '#22C55E',
      description: 'Germinal matrix hemorrhage. Outcome близок к нормальному.',
      details:
        'Кровоизлияние ограничено germinal matrix (subependymal area, около caudate nucleus). Most common тип IVH у preterm. Обычно асимптомный, выявляется на screening US.',
      actions: [
        'Стандартный neonatal monitoring',
        'Head US повторно через 7-10 дней + к 36 нед PMA',
        'Не требует специфической терапии',
        'Long-term follow-up: assessment в 2 года corrected age (Bayley-III)',
        'Disability rate ~3-5% (близко к baseline preterm risk)',
      ],
    },
    {
      min: 2,
      max: 2,
      label: 'II — IVH без dilatation',
      color: '#84CC16',
      description: 'IVH без расширения желудочков. Outcome относительно хороший.',
      details:
        'Кровоизлияние распространилось в желудочки, но не вызывает их расширения. Может разрешиться спонтанно. Long-term NDI ~5-10%.',
      actions: [
        'Head US еженедельно × 2-4 нед для monitor evolution',
        'Стандартный neonatal monitoring',
        'Не требует neurosurgical intervention обычно',
        'Long-term follow-up: Bayley-III в 2 года, MRI к term-equivalent age (TEA)',
        'Mild disability rate ~5-10%',
      ],
    },
    {
      min: 3,
      max: 3,
      label: 'III — IVH с dilatation',
      color: '#EF4444',
      description: 'Существенное кровоизлияние с расширением желудочков. Mortality + NDI ↑.',
      details:
        'Желудочки расширены кровью. 30-50% develop post-haemorrhagic ventricular dilatation (PHVD) — требует close monitoring. Major NDI ~25-35%.',
      actions: [
        'Head US дважды в неделю × 2-3 нед, затем weekly до stabilization',
        'Monitor head circumference daily (HC growth ↑ → PHVD)',
        'Neurosurgical consultation при progressive dilatation',
        'Возможен ventriculoperitoneal (VP) shunt если progressive',
        'Reservoir / external ventricular drain при acute PHVD',
        'Long-term: MRI к TEA, Bayley-III + neurology follow-up в 2 года',
      ],
    },
    {
      min: 4,
      max: 4,
      label: 'IV — Parenchymal extension (PVHI)',
      color: '#7F1D1D',
      description: 'Periventricular haemorrhagic infarction. Mortality 40-50%, NDI 50-75%.',
      details:
        'Сейчас называется PVHI (periventricular haemorrhagic infarction) — venous infarction в periventricular white matter, не direct extension. Survival 50-60%; major NDI у survivors 50-75% (cerebral palsy, cognitive impairment, epilepsy).',
      actions: [
        '⚠️ Тяжёлое состояние — требует мультидисциплинарного team',
        'ICU monitoring, support ventilation/perfusion',
        'Neurosurgical consultation немедленно',
        'Possible reservoir или external ventricular drain при obstructive hydrocephalus',
        'Aggressive seizure management если develop',
        'Family counselling — discuss prognosis honestly',
        'MRI к TEA для full assessment lesion extent',
        'Early intervention referral (PT/OT/SLT) for survivors',
        'Palliative care discussion если extensive bilateral involvement',
      ],
    },
  ],
  caveats: [
    'Papile 1978 originally описал в pre-MRI era — современный standard включает MRI к term-equivalent age',
    'Grade IV = PVHI (Volpe 2018) — это venous infarction, не direct extension',
    'Window of US imaging: anterior fontanelle открыт до 12-18 мес; для cortical/posterior fossa lesions нужен MRI',
    'Doppler / colour-flow помогает оценить perfusion при PVHI',
    '~50% IVH developments происходят в первые 24 ч жизни → ранний US',
    'Risk factors: prematurity (<32 нед), hypoxic-ischemic events, hemodynamic instability, mechanical ventilation, PDA, sepsis',
    'Cochrane: indomethacin prophylaxis ↓ severe IVH но не improves NDI; не рутинно',
    'Bordik MVP — staging only; full neurology assessment должен включать MRI + clinical neurology',
  ],
  related: [
    { id: 'apgar', title: 'Apgar' },
    { id: 'thompson', title: 'Thompson / Sarnat (HIE)' },
    { id: 'silverman', title: 'Silverman' },
    { id: 'neo-bell-nec', title: 'Bell NEC' },
  ],
  relatedCourses: [
    { id: '301.4', title: 'Неонатология' },
    { id: '301.6', title: 'Детская неврология' },
  ],
  presets: [
    { label: 'Grade I (subependymal)', values: { grade: '1' } },
    { label: 'Grade II (IVH без dilatation)', values: { grade: '2' } },
    { label: 'Grade III (IVH + dilatation)', values: { grade: '3' } },
    { label: 'Grade IV (PVHI)', values: { grade: '4' } },
  ],
  info: `### Papile classification (1978)

Стандартная classification ВЖК (intraventricular hemorrhage) у
преждевременно родившихся, основана на head ultrasound through anterior
fontanelle.

| Grade | Описание | NDI risk |
|---|---|---|
| **I** | Subependymal germinal matrix hemorrhage (без IVH) | ~3-5% |
| **II** | IVH без ventricular dilatation | ~5-10% |
| **III** | IVH с ventricular dilatation | ~25-35% |
| **IV** | IVH + parenchymal extension (PVHI) | ~50-75% |

### Современная nomenclature (Volpe 2018)

- **Grade IV** обновлён как **PVHI** (periventricular haemorrhagic
  infarction) — это venous infarction в periventricular white matter,
  НЕ direct extension от IVH
- Patogenez: PVHI происходит из-за venous obstruction вторичной к
  large IVH (germinal matrix vein compression)

### Risk factors

- **Prematurity:** ≤32 нед GA, ≤1500 г BW (strongest)
- **Hypoxic-ischemic events:** asphyxia, hypotension
- **Hemodynamic instability:** swings BP, PDA, hypotension
- **Mechanical ventilation:** especially при pressure swings
- **Sepsis, NEC**
- **Cocaine/illicit drugs maternal**

### Screening protocol

| Population | Timing |
|---|---|
| <32 нед GA OR <1500 g BW | Head US 7-10 days + 36 нед PMA / discharge |
| Asphyxia / clinical seizures | Emergency US |
| Suspected acute deterioration | Stat US + repeat |

### When MRI

- К term-equivalent age (TEA) для grade III-IV
- Cortical / posterior fossa concerns
- Subtle lesions not visible on US
- Pre-discharge для grade III-IV (prognostic)

### Treatment

**Grades I-II:** standard neonatal care, follow-up imaging

**Grade III:** monitor для PHVD (post-haemorrhagic ventricular
dilatation) — ↑ HC, ↑ ventricular size; neurosurgical referral если
progressive

**Grade IV (PVHI):**
- Multidisciplinary care (neonatology + neurosurgery + neurology)
- Reservoir или EVD при obstructive hydrocephalus
- Seizure management
- Family counseling — discuss honest prognosis
- Early intervention (PT/OT/SLT) для survivors
- Palliative care discussion при extensive bilateral

### Long-term outcomes

| Grade | Mortality | Major NDI | Mild NDI |
|---|---|---|---|
| I | <5% | 3-5% | ~10% |
| II | 5-10% | 5-10% | ~15% |
| III | 15-20% | 25-35% | ~25% |
| IV | 40-50% | 50-75% (survivors) | ~15% |

NDI = Neurodevelopmental impairment (Bayley-III ≤-1 SD, CP, MDI <70).

### Prevention

- **Antenatal corticosteroids** (если premature labor < 34 нед) — снижают
  IVH ~30%
- **Magnesium sulfate** для neuroprotection — снижает CP risk у preterm
- **Delayed cord clamping** ≥30 sec — ↓ IVH (current ILCOR rec)
- **Avoid hypotension/hypertension swings** в первые 72 ч
- **Indomethacin prophylaxis** — Cochrane: ↓ severe IVH но не improves
  long-term outcomes; не рутинно

### Источники

- Papile LA et al. J Pediatr 1978;92:529 (original)
- Volpe JJ. Neurology of the Newborn 6 ed. Elsevier 2018
- Synnes A et al. Pediatrics 2017 — outcomes by grade
- Cochrane reviews: indomethacin prophylaxis, MgSO4 neuroprotection

### Ограничения

- US — operator-dependent; standardize protocols across centers
- MRI superior для cortical/posterior fossa lesions
- Bordik MVP — staging only; clinical decision making requires
  full neurology assessment
`,
};

export default runner;
