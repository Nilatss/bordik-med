/**
 * Runner: neo-npass — Neonatal Pain, Agitation, and Sedation Scale
 *
 * NEONATOLOGY MODULE A36 (P1).
 *
 * Source: Hummel P, Puchalski M, Creech SD, Weiss MG. Clinical reliability
 * and validity of the N-PASS: Neonatal Pain, Agitation and Sedation
 * Scale with prolonged pain. J Perinatol 2008;28(1):55-60.
 * doi:10.1038/sj.jp.7211861
 *
 * Unique feature: оценивает BOTH pain (positive scores) AND sedation
 * (negative scores) по 5 indicators × −2 to +2 = range −10 to +10.
 *
 * 5 indicators (each −2/−1/0/+1/+2):
 *   - Crying / Irritability
 *   - Behavioural state
 *   - Facial expression
 *   - Extremities tone
 *   - Vital signs (HR, RR, BP, SpO₂)
 *
 * Interpretation:
 *   −10 to −5: deeply sedated (over-sedated)
 *   −4 to −2:  moderately sedated
 *   −1 to +2:  desired sedation level / no pain
 *   +3 to +5:  mild-moderate pain
 *   +6 to +10: significant pain — analgesia titration
 *
 * +1 added для preterm GA <30 нед (compensation для blunted response).
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 10,
  countries: 'Международный (Hummel 2008)',
  reference: 'Hummel P et al. N-PASS validation. J Perinatol 2008;28:55.',
  inputs: [
    {
      id: 'crying',
      label: 'Crying / Irritability',
      type: 'select',
      options: [
        { value: '-2', label: '−2: No cry с painful stimuli', points: -2 },
        { value: '-1', label: '−1: Moans / cry с painful stimuli', points: -1 },
        { value: '0', label: '0: Appropriate cry', points: 0 },
        { value: '1', label: '+1: Irritable / crying at intervals', points: 1 },
        { value: '2', label: '+2: Continuous cry / inconsolable', points: 2 },
      ],
    },
    {
      id: 'state',
      label: 'Behavioural state',
      type: 'select',
      options: [
        { value: '-2', label: '−2: No arousal к stimuli, no movement', points: -2 },
        { value: '-1', label: '−1: Arouses к stimuli, little movement', points: -1 },
        { value: '0', label: '0: Appropriate активность', points: 0 },
        { value: '1', label: '+1: Restless, squirming, awakening freq.', points: 1 },
        { value: '2', label: '+2: Arching, kicking, constantly awake', points: 2 },
      ],
    },
    {
      id: 'face',
      label: 'Facial expression',
      type: 'select',
      options: [
        { value: '-2', label: '−2: Mouth lax, no expression', points: -2 },
        { value: '-1', label: '−1: Minimal expression с stimuli', points: -1 },
        { value: '0', label: '0: Relaxed, appropriate', points: 0 },
        { value: '1', label: '+1: Some grimacing', points: 1 },
        { value: '2', label: '+2: Grimace continuous', points: 2 },
      ],
    },
    {
      id: 'extremities',
      label: 'Extremities tone',
      type: 'select',
      options: [
        { value: '-2', label: '−2: No grasp reflex, flaccid', points: -2 },
        { value: '-1', label: '−1: Weak grasp, decreased tone', points: -1 },
        { value: '0', label: '0: Relaxed hands и feet, normal tone', points: 0 },
        { value: '1', label: '+1: Intermittent clenched fists, не stiff', points: 1 },
        { value: '2', label: '+2: Continual clenched fists, body stiff', points: 2 },
      ],
    },
    {
      id: 'vitals',
      label: 'Vital signs (HR, RR, BP, SpO₂)',
      type: 'select',
      options: [
        { value: '-2', label: '−2: Не reactivity, hypoventilation, apnea', points: -2 },
        { value: '-1', label: '−1: <10% variability с stimuli', points: -1 },
        { value: '0', label: '0: Within baseline', points: 0 },
        { value: '1', label: '+1: ↑ 10-20% от baseline / SpO₂ 76-85%', points: 1 },
        { value: '2', label: '+2: ↑ >20% от baseline / SpO₂ <75%', points: 2 },
      ],
    },
    {
      id: 'preterm_adj',
      label: 'GA <30 нед (+1 для preterm pain compensation)',
      type: 'checkbox',
    },
  ],
  bands: [
    {
      min: -10,
      max: -5,
      label: '−10 to −5 deep sedation',
      color: '#7F1D1D',
      description: 'Глубокая седация — переседация.',
      actions: [
        '⚠️ Over-sedation — снизить opioid / sedative dose',
        'Wean infusion на 25-50% за следующие 4 ч',
        'Reassess через 1 ч',
        'Consider ETT extubation criteria если on mechanical ventilation',
      ],
    },
    {
      min: -4,
      max: -2,
      label: '−4 to −2 moderate sedation',
      color: '#F59E0B',
      description: 'Умеренная седация — приемлемо для некоторых сценариев.',
      actions: [
        'Acceptable для intubated/sedated patient после major surgery',
        'Если sedation NOT желательна — снизить opioid dose',
        'Reassess 30-60 мин',
      ],
    },
    {
      min: -1,
      max: 2,
      label: '−1 to +2 target',
      color: '#22C55E',
      description: 'Целевой диапазон — comfort без excess sedation.',
      actions: [
        '✅ Целевой уровень — comfortable, не переседирован',
        'Continue current pain management plan',
        'Reassess q4-6ч',
      ],
    },
    {
      min: 3,
      max: 5,
      label: '+3 to +5 mild-moderate pain',
      color: '#F59E0B',
      description: 'Лёгкая-умеренная боль.',
      actions: [
        'Non-pharmacologic: kangaroo, breastfeeding, swaddling, sucrose',
        'Acetaminophen 10-15 мг/кг PO/IV q6-8h',
        'Если несidequate — морфин 50 мкг/кг IV',
        'Reassess 30 мин после intervention',
      ],
    },
    {
      min: 6,
      max: 10,
      label: '+6 to +10 significant pain',
      color: '#EF4444',
      description: 'Выраженная боль — требует analgesia titration.',
      actions: [
        '⚠️ Significant pain — titrate analgesia немедленно',
        'Морфин 100 мкг/кг IV bolus, затем infusion 10-20 мкг/кг/ч',
        'Fentanyl 1-2 мкг/кг IV для acute procedural pain',
        'Multimodal: + acetaminophen 15 мг/кг q6-8h',
        'Pain team consult если sustained >24 ч',
        'Reassess каждые 30 мин до контроля',
      ],
    },
  ],
  caveats: [
    'N-PASS — единственная шкала которая оценивает BOTH pain AND sedation',
    'Range −10 to +10, but realistic range typically −5 to +5',
    'Preterm <30 нед: добавить +1 для compensation blunted response',
    'Validated для both acute procedural и prolonged/chronic pain',
    'Sleep state CAN mask pain — not diagnostic of "no pain"',
    'Useful для guidance opioid weaning protocols',
    'Aggressively titrate analgesia при sustained ≥6 — neurodevelopment risk',
  ],
  related: [
    { id: 'nips', title: 'NIPS (term)' },
    { id: 'neo-pipp-r', title: 'PIPP-R (preterm acute)' },
    { id: 'rass', title: 'RASS (adult ICU sedation)' },
  ],
  relatedCourses: [{ id: '301.4', title: 'Неонатология' }],
  presets: [
    { label: 'Целевая sedation', values: { crying: '0', state: '0', face: '0', extremities: '0', vitals: '0' } },
    { label: 'Mild pain', values: { crying: '1', state: '1', face: '1', extremities: '0', vitals: '1' } },
    { label: 'Significant pain', values: { crying: '2', state: '2', face: '2', extremities: '2', vitals: '2' } },
    { label: 'Over-sedated', values: { crying: '-2', state: '-2', face: '-2', extremities: '-2', vitals: '-2' } },
  ],
  info: `### N-PASS overview

Уникальная шкала которая оценивает **and pain AND sedation** одновременно
по бимодальной системе −10 to +10.

### Range interpretation

\`\`\`
−10 ─────────── −5 ─── −2 ─── 0 ─── +2 ─── +5 ─────────── +10
   Deep sedation      Target            Significant pain
\`\`\`

### Use cases

- Intubated infants on opioid infusions — guide weaning
- Post-operative pain management
- Procedural pain (heel sticks, ophthalmology exams)
- Chronic pain assessment (NEC recovery, fractures)

### Multimodal pain plan (recommended ESPNIC)

| Component | Examples |
|---|---|
| Non-pharmacologic | Kangaroo care, breastfeeding, swaddling, sucrose |
| Mild analgesia | Acetaminophen 10-15 мг/кг q6-8h |
| Moderate-severe | Morphine 50-100 мкг/кг IV; infusion 10-20 мкг/кг/ч |
| Acute procedural | Fentanyl 1-2 мкг/кг IV; topical EMLA |
| Adjuncts | Dexmedetomidine (avoid <34 нед PMA) |

### Источники

- Hummel P et al. N-PASS J Perinatol 2008;28:55
- ESPNIC guidelines pain management
- AAP CFN — pain in newborn

### Ограничения

- Sleep state CAN mask pain
- Bimodal scale — both ends important
- Document in EMR для team continuity
`,
};

export default runner;
