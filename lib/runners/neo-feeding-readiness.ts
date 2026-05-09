/**
 * Runner: neo-feeding-readiness — Oral Feeding Readiness у preterm
 *
 * NEONATOLOGY MODULE — protocol classification.
 *
 * Оценка готовности preterm newborn к oral feeding (breast / bottle).
 * Important transition от gavage feeding к oral feeding для discharge
 * readiness.
 *
 * Critical components (NOMAS / GENTLE / Early Feeding Skills assessment):
 *   1. Physiological stability (HR, RR, SpO₂)
 *   2. Behavioral state (alert, awake)
 *   3. Oral motor cues (rooting, tongue protrusion, bringing hand to mouth)
 *   4. Sucking pattern (organized, rhythmic)
 *   5. Swallow safety (no apnea, bradycardia, desaturation during)
 *
 * SOURCES:
 *   - Lau C et al. — Oral feeding readiness in premature infants
 *   - Howe TH et al. — Preterm Infant Oral Feeding Readiness Assessment Scale (PIOFRAS)
 *   - AAP COFN 2008 — Hospital Discharge of the High-Risk Neonate
 *   - КР МЗ РФ "Питание / Вскармливание н/р" (2024)
 *
 * Typical readiness:
 *   - PMA 32-34 нед: minimal cues
 *   - PMA 34-36 нед: developing capacity
 *   - PMA ≥ 36 нед: usually fully oral
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  countries: 'Международный (PIOFRAS / Lau / Howe) · РФ',
  reference: 'Lau C oral feeding. Howe TH PIOFRAS. AAP COFN 2008. КР МЗ РФ.',
  inputs: [
    {
      id: 'physiologic',
      label: 'Physiologic stability (стабильные ЧСС, RR, SpO₂ ≥ 30 мин)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'behavioral',
      label: 'Behavioral state (alert wakefulness, не lethargic)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'oral_motor',
      label: 'Oral motor cues (rooting, tongue protrusion, bringing hand к рту)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'sucking',
      label: 'Organized sucking pattern (rhythmic, sustained)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'swallow_safety',
      label: 'Safe swallow (no apnea / bradycardia / desat during attempts)',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'НЕ готов к oral feeding',
      color: '#EF4444',
      description: 'Significant gaps — продолжить gavage feeding.',
      actions: [
        '⚠️ НЕ готов к oral feeding',
        'Continue gavage feeding (NG/OG tube)',
        'Continue developmental care: kangaroo mother care (KMC), non-nutritive sucking',
        'PMA progression обычно improves readiness gradually',
        'Reassess через 3-7 дней',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'Развивающаяся готовность',
      color: '#F59E0B',
      description: 'Partial readiness — short trials с careful monitoring.',
      actions: [
        'Partial readiness — careful introduction',
        'Trial 5-10 минутные feeds 1-2× в день (paired с gavage)',
        'Position: head elevated, semi-upright',
        'Pace: pause feeds для regulation; никогда forced',
        'Speech / occupational therapy assessment',
        'Document feeding session details: duration, volume, behaviors',
        'Re-assess готовность через 2-3 дня',
      ],
    },
    {
      min: 4,
      max: 5,
      label: 'Готов к oral feeding',
      color: '#22C55E',
      description: 'Full readiness — transition к oral feeding.',
      actions: [
        '✅ Готов к oral feeding — transition plan',
        'Trial full oral feeds gradually',
        'Day 1-2: 1-2 oral feeds per shift × 5-10 мин, остальные через gavage',
        'Day 3-5: increase oral feeds; transition к full oral',
        'Continue gavage для residual volume первые 5-10 дней',
        'Monitor: feeding tolerance, weight gain ≥ 15-30 г/сут, stool patterns',
        'When > 80 % volumes oral consistently: ready for discharge feeding-wise',
        'Breastfeeding: encourage with mother visiting; lactation consultant support',
      ],
    },
  ],
  compute(values): CalculatorResult {
    let count = 0;
    if (values.physiologic === true) count++;
    if (values.behavioral === true) count++;
    if (values.oral_motor === true) count++;
    if (values.sucking === true) count++;
    if (values.swallow_safety === true) count++;

    const band = findBand(runner.bands, count);

    return {
      value: `${count}/5`,
      unit: 'cues',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. PIOFRAS-style 5-criteria assessment.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Oral feeding readiness — не purely PMA-based; individualized assessment',
    'Suck-swallow-breath coordination develops gradually 32-36 нед PMA',
    'Premature transition к oral feeding ↑ risk апноэ, brady, desat, weight loss',
    'Delayed transition может contribute к oral aversion later',
    'Non-nutritive sucking (pacifier во время gavage feeds) supports oral motor development',
    'Skin-to-skin (kangaroo) supports breastfeeding establishment',
    'Bottle-to-breast transition: cup feeding или paced bottle feeding можно use как bridge',
    'Speech / occupational therapy involvement у persistent feeding difficulties',
    'Failure to advance after 2-3 нед attempts: investigate underlying issues (laryngomalacia, anatomic, neurologic)',
    'Breastfed preterm: typically slower volume increase but immunologic benefits significant',
    '50 % oral feeds milestone often achieved 1-2 нед after first oral attempts',
    'Full oral feeds (без gavage support) — typically PMA 35-37 нед for most preterm',
  ],
  related: [
    { id: 'neo-discharge-criteria', title: 'Критерии выписки' },
    { id: 'neo-prematurity-class', title: 'Классификация недоношенности' },
    { id: 'neo-newt', title: 'NEWT weight loss' },
    { id: 'neo-enteral', title: 'Enteral feed advancement' },
  ],
  info: `### Oral Feeding Readiness у preterm

Assessment готовности preterm newborn к oral feeding (breast / bottle).
Important transition step для discharge planning.

### 5-criteria assessment (PIOFRAS-style)

#### 1. Physiologic stability
- ЧСС stable (110-160 awake)
- RR < 60
- SpO₂ ≥ 92 % (или target range)
- Temperature stable
- ≥ 30 мин стабильности перед feeding

#### 2. Behavioral state
- Alert / quiet wakefulness
- Не lethargic, не very fussy
- Eyes open / engaged
- Best state: quiet alert

#### 3. Oral motor cues
- **Rooting reflex** (turn toward stimulus к щеке)
- **Tongue protrusion**
- **Bringing hand к рту**
- **Lip closure / sucking on pacifier**

#### 4. Sucking pattern
- Rhythmic (1 sec on / 1 sec off)
- Sustained (≥ 30 sec without pause)
- Coordinated (synchronized с swallow)
- Adequate suction strength

#### 5. Swallow safety
- **No apnea** during feeds
- **No bradycardia** (HR drop > 20 % from baseline)
- **No desaturation** (SpO₂ drop > 5 %)
- Coordinated suck-swallow-breathe

### PMA-based progression

| PMA | Typical capability |
|---|---|
| < 32 нед | Minimal oral cues; gavage feeding |
| 32-34 нед | Developing cues; non-nutritive sucking |
| 34-36 нед | Increasing capacity; some oral feeds |
| **36-38 нед** | **Full oral feeds achievable** |
| ≥ 38 нед | Coordinated breast/bottle feeds |

### Transition strategy

#### Phase 1 (когда score 2-3): Initial trials
- 1-2 short oral attempts per day (5-10 мин)
- Paired с gavage для total volume
- Pacing: pauses for regulation
- Position: head elevated, semi-upright

#### Phase 2 (когда score 4-5): Gradual transition
- Day 1-2: 1-2 oral feeds per shift
- Day 3-5: increase frequency
- Day 5-10: transition к full oral
- Continue residual gavage

#### Phase 3 (full oral): Maintenance
- > 80 % volumes oral consistently
- Weight gain ≥ 15-30 г/сут
- Stool patterns appropriate
- Discharge criteria meeting

### Breastfeeding support

#### Encourage:
- **Skin-to-skin (kangaroo) care** — breastfeeding promotion
- **Mother's milk expression** — establish supply
- **Cup feeding** или **paced bottle** как bridge

#### Lactation consultant:
- Latching support
- Breastmilk volume optimization
- Position techniques for preterm

### Red flags (надо investigate)

- Failure to advance после 2-3 нед attempts
- Repeated episodes apnea / bradycardia / desat with feeds
- Persistent oral aversion
- Delayed milestone achievement
- Unexplained weight loss

#### Investigate:
- **Laryngomalacia** — laryngoscopy
- **Anatomic anomaly** — careful exam, U/S
- **Neurologic** — evaluation, EEG если concerning
- **GERD** — workup
- **Aspiration** — modified barium swallow study

### Adjuncts

- **Non-nutritive sucking** (pacifier) во время gavage feeds
- **Skin-to-skin** (kangaroo)
- **Specialized nipples** (slow flow для preterm)
- **Speech / occupational therapy** consultation
- **Oral motor exercises** (gentle stroking, гентильная стимуляция)

### Discharge feeding criteria

| Component | Target |
|---|---|
| **Oral feeds** | > 80 % of volume |
| **Weight gain** | ≥ 15-30 г/сут sustained |
| **Stool pattern** | Regular |
| **No apnea / brady** | ≥ 5-7 days |
| **Mother / caregiver competence** | Demonstrated |

### Источники

- Lau C et al. — Oral feeding readiness in premature infants
- Howe TH et al. — PIOFRAS scale
- AAP COFN 2008 — Hospital Discharge High-Risk Neonate
- Engle WA AAP COFN 2007 — Late preterm
- Eichenwald EC AAP COFN 2018 — Apnea of prematurity
- КР МЗ РФ "Питание / Вскармливание н/р" (2024)
`,
};

export default runner;
