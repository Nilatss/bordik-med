/**
 * Runner: neo-pipp-r — Premature Infant Pain Profile - Revised
 *
 * NEONATOLOGY MODULE A35 (P1).
 *
 * Source: Stevens BJ, Gibbins S, Yamada J, et al. The premature infant
 * pain profile-revised (PIPP-R): initial validation and feasibility.
 * Clin J Pain 2014;30(3):238-243. doi:10.1097/AJP.0b013e3182906aed
 *
 * 7 indicators (max 21):
 *   - Gestational age (≥36/32-35.99/28-31.99/<28 = 0/1/2/3)
 *   - Behavioural state (active awake/quiet awake/active sleep/quiet sleep = 0/1/2/3)
 *   - Heart rate change (Δ HR from baseline)
 *   - Oxygen saturation change (↓ SpO₂)
 *   - Brow bulge (0-3)
 *   - Eye squeeze (0-3)
 *   - Nasolabial furrow (0-3)
 *
 * Bands:
 *   ≤6   — no/mild pain (no intervention)
 *   7-12 — mild-moderate pain (non-pharm: kangaroo, breastfeeding, sucrose)
 *   ≥13  — moderate-severe pain (analgesia + non-pharm)
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 21,
  countries: 'Международный (Stevens 2014)',
  reference: 'Stevens BJ et al. PIPP-R initial validation. Clin J Pain 2014;30:238.',
  inputs: [
    {
      id: 'ga',
      label: 'Gestational age',
      type: 'select',
      options: [
        { value: '0', label: 'GA ≥36 нед', points: 0 },
        { value: '1', label: 'GA 32-35.99 нед', points: 1 },
        { value: '2', label: 'GA 28-31.99 нед', points: 2 },
        { value: '3', label: 'GA <28 нед', points: 3 },
      ],
    },
    {
      id: 'state',
      label: 'Behavioural state',
      type: 'select',
      options: [
        { value: '0', label: 'Active awake (eyes open)', points: 0 },
        { value: '1', label: 'Quiet awake', points: 1 },
        { value: '2', label: 'Active sleep', points: 2 },
        { value: '3', label: 'Quiet sleep', points: 3 },
      ],
    },
    {
      id: 'hr',
      label: 'HR change Δ от baseline',
      type: 'select',
      options: [
        { value: '0', label: '0-4 уд/мин', points: 0 },
        { value: '1', label: '5-14 уд/мин', points: 1 },
        { value: '2', label: '15-24 уд/мин', points: 2 },
        { value: '3', label: '≥25 уд/мин', points: 3 },
      ],
    },
    {
      id: 'spo2',
      label: 'SpO₂ ↓ от baseline',
      type: 'select',
      options: [
        { value: '0', label: '0-2.4%', points: 0 },
        { value: '1', label: '2.5-4.9%', points: 1 },
        { value: '2', label: '5-7.4%', points: 2 },
        { value: '3', label: '≥7.5%', points: 3 },
      ],
    },
    {
      id: 'brow',
      label: 'Brow bulge (выпячивание бровей)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Минимальный', points: 1 },
        { value: '2', label: 'Умеренный', points: 2 },
        { value: '3', label: 'Максимальный', points: 3 },
      ],
    },
    {
      id: 'eye',
      label: 'Eye squeeze (зажмуривание)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Минимальное', points: 1 },
        { value: '2', label: 'Умеренное', points: 2 },
        { value: '3', label: 'Максимальное', points: 3 },
      ],
    },
    {
      id: 'naso',
      label: 'Nasolabial furrow (носогубная складка)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Минимальная', points: 1 },
        { value: '2', label: 'Умеренная', points: 2 },
        { value: '3', label: 'Максимальная', points: 3 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 6,
      label: '0-6 — no/mild',
      color: '#22C55E',
      description: 'Боли нет или минимальная.',
      actions: [
        'Не требует pharmacologic intervention',
        'Continue routine care',
        'Reassess через 30 мин если процедура продолжается',
      ],
    },
    {
      min: 7,
      max: 12,
      label: '7-12 — mild-moderate',
      color: '#F59E0B',
      description: 'Лёгкая-умеренная боль.',
      actions: [
        'Non-pharmacologic: kangaroo care, breastfeeding/breastmilk',
        'Sucrose 24% (0.5 мл/кг) или glucose 30% PO 2 мин до процедуры',
        'Swaddling, facilitated tucking',
        'Avoid unnecessary handling',
        'Reassess 30 мин после intervention',
      ],
    },
    {
      min: 13,
      max: 21,
      label: '≥13 — moderate-severe',
      color: '#EF4444',
      description: 'Умеренная-выраженная боль. Требует analgesia.',
      actions: [
        'Pharmacologic + non-pharmacologic',
        'Морфин 50-100 мкг/кг IV slow push (или infusion 10-20 мкг/кг/ч)',
        'Fentanyl 1-2 мкг/кг IV для коротких процедур',
        'Acetaminophen 10-15 мг/кг PO/IV q6-8h для сustained pain',
        'Topical anaesthesia (EMLA cream) для needle procedures',
        'Reassess 30 мин — корректировать дозу',
        'Если sustained pain >24ч — рассмотреть pain team consult',
      ],
    },
  ],
  caveats: [
    'PIPP-R валидирован для acute procedural pain — не для chronic / postoperative',
    'GA points отражают увеличенную чувствительность younger preterms',
    'Sleep state имеет higher score — sleeping infant в pain показывает less behavioural response (≠ no pain)',
    'Reassess через 30 мин после intervention — peak effect большинства non-pharm 30-60 мин',
    'Sucrose 24% эффективен только в первые 4-12 нед жизни, не в 6+ мес',
    'Морфин титрировать осторожно у GA <28 нед — risk apnoea, hypotension',
    'Multimodal approach (non-pharm + pharm) > monotherapy',
    'Document score + intervention + reassessment в EMR',
  ],
  related: [
    { id: 'nips', title: 'NIPS (term newborn)' },
    { id: 'apgar', title: 'Apgar' },
    { id: 'silverman', title: 'Silverman' },
  ],
  relatedCourses: [{ id: '301.4', title: 'Неонатология' }],
  presets: [
    { label: 'Term newborn calm', values: { ga: '0', state: '0', hr: '0', spo2: '0', brow: '0', eye: '0', naso: '0' } },
    { label: 'Preterm 30 нед mild distress', values: { ga: '2', state: '1', hr: '1', spo2: '1', brow: '1', eye: '1', naso: '0' } },
    { label: 'ELBW в выраженной боли', values: { ga: '3', state: '0', hr: '2', spo2: '2', brow: '3', eye: '3', naso: '3' } },
  ],
  info: `### PIPP-R (2014)

Revised version PIPP — стандарт оценки острой процедурной боли у
**преждевременно родившихся** (валидирован 22-42 нед GA).

### Components (7 indicators, total 0-21)

| Indicator | Range | Notes |
|---|---|---|
| Gestational age | 0-3 | Higher для younger (более чувствительны) |
| Behavioural state | 0-3 | Higher для sleep (less response → больше score) |
| HR change | 0-3 | Δ от baseline |
| SpO₂ ↓ | 0-3 | Drop от baseline |
| Brow bulge | 0-3 | Facial expression |
| Eye squeeze | 0-3 | Facial expression |
| Nasolabial furrow | 0-3 | Facial expression |

### Interpretation bands

| PIPP-R | Pain level | Action |
|---|---|---|
| 0-6 | No/mild | No intervention; reassess if procedure continues |
| 7-12 | Mild-moderate | Non-pharmacologic (kangaroo, breastfeeding, sucrose 24%) |
| ≥13 | Moderate-severe | Analgesia + non-pharm (morphine, fentanyl) |

### Pharmacologic options

| Drug | Dose | Duration |
|---|---|---|
| Morphine | 50-100 мкг/кг IV bolus; 10-20 мкг/кг/ч infusion | 4-6 ч action |
| Fentanyl | 1-2 мкг/кг IV bolus; 0.5-1 мкг/кг/ч infusion | 30-60 мин action |
| Acetaminophen | 10-15 мг/кг PO/IV q6-8h | 4-6 ч action |
| Sucrose 24% | 0.5 мл/кг PO 2 мин до процедуры | Acute analgesia |
| EMLA cream | Topical | 30-60 мин до needle procedures |

### Источники

- Stevens BJ et al. PIPP-R Clin J Pain 2014;30:238
- Original PIPP — Stevens 1996
- Updated guidelines AAP CFN 2016 и ESPNIC

### Ограничения

- Для acute procedural pain (heel stick, immunisation) — не для chronic
- Sleep state артефакт — sleeping infant в pain less responsive ≠ no pain
- Reassess через 30 мин для peak effect non-pharm
- Sucrose эффективен только до ~12 нед жизни
`,
};

export default runner;
