/**
 * Runner: neo-thermal-management — Thermal Management (Golden Hour)
 *
 * NEONATOLOGY MODULE — protocol classification.
 *
 * Golden hour thermal management critical для preterm и newborn outcomes.
 * Hypothermia (< 36 °C) at admission ↑ mortality + IVH + RDS у preterm.
 *
 * QI bundle (gold standard):
 *   1. Operating room temp ≥ 25 °C (≥ 26 °C для < 32 нед)
 *   2. Servo-controlled radiant warmer + servo-controlled incubator
 *   3. Polyethylene wrap (для < 32 нед — НЕ дyringthe drying first)
 *   4. Chemical mattress (Transwarmer 40 °C)
 *   5. Cap (woolen или quilted)
 *   6. Тёплые полотенца (для term)
 *   7. Кенгуру (skin-to-skin) если стабилен
 *
 * Goal: Admission temp 36.5-37.5 °C
 *
 * SOURCES:
 *   - WHO Recommendations on Newborn Health (2017)
 *   - NRP 8 ed. 2021 — Chapter 7 Thermal Management
 *   - Helping Babies Survive (HBS) — Essential Care for Every Baby
 *   - КР МЗ РФ "Транспортировка и согревание н/р" (2024)
 *   - Cochrane Plastic wrap для prevention hypothermia 2010
 *
 * VLBW < 1500 г: inadvertent hypothermia 30-50 % при стандартной помощи;
 * QI bundle снижает к < 5 %.
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 6,
  countries: 'Международный (WHO 2017 / NRP 8 ed. / HBS) · РФ',
  reference: 'WHO Newborn Health 2017. NRP 8 ed. Ch. 7. HBS Essential Care. КР МЗ РФ.',
  inputs: [
    {
      id: 'or_temp',
      label: 'Operating room temperature',
      type: 'select',
      options: [
        { value: '0', label: '< 22 °C (cold)', points: 0 },
        { value: '1', label: '22-25 °C (suboptimal)', points: 1 },
        { value: '2', label: '≥ 25-26 °C (optimal)', points: 2 },
      ],
    },
    {
      id: 'wrap',
      label: 'Polyethylene wrap (для < 32 нед — без drying)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'cap',
      label: 'Cap (woolen / quilted) on head',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'mattress',
      label: 'Chemical mattress (Transwarmer 40 °C)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'incubator',
      label: 'Servo-controlled incubator или radiant warmer',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'Inadequate thermal management',
      color: '#EF4444',
      description: 'Significant gaps — high hypothermia risk.',
      actions: [
        '⚠️ Inadequate thermal management — high hypothermia risk',
        'Implement QI bundle ASAP:',
        '  - ↑ Operating room temp к ≥ 25 °C (≥ 26 °C для < 32 нед)',
        '  - Polyethylene wrap для < 32 нед (БЕЗ drying)',
        '  - Cap on head',
        '  - Chemical mattress',
        '  - Servo-controlled equipment',
        'Hypothermia risk: VLBW 30-50 % при inadequate measures',
        'Consequences: ↑ mortality, IVH, RDS, late-onset sepsis',
      ],
    },
    {
      min: 2,
      max: 4,
      label: 'Partial thermal management',
      color: '#F59E0B',
      description: 'Some measures but gaps — improve.',
      actions: [
        'Partial thermal management — identify gaps',
        'Common missing:',
        '  - Polyethylene wrap для < 32 нед',
        '  - Chemical mattress',
        '  - Cap',
        'Continue routine measures + add missing',
        'Re-assess после full QI bundle implementation',
      ],
    },
    {
      min: 5,
      max: 6,
      label: 'Optimal thermal management',
      color: '#22C55E',
      description: 'Full QI bundle implemented — low hypothermia risk.',
      actions: [
        '✅ Optimal thermal management',
        'All QI bundle elements в place',
        'Continue: monitor temp при transport, в incubator',
        'Goal admission temperature: 36.5-37.5 °C',
        'Skin-to-skin (kangaroo) если стабилен',
        'Document admission temperature',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const or = Number(values.or_temp ?? 0);
    const wrap = values.wrap === true ? 1 : 0;
    const cap = values.cap === true ? 1 : 0;
    const mattress = values.mattress === true ? 1 : 0;
    const incubator = values.incubator === true ? 1 : 0;
    const total = or + wrap + cap + mattress + incubator;

    const band = findBand(runner.bands, total);

    return {
      value: String(total),
      unit: 'risk score',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. WHO/NRP/HBS QI bundle elements.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'VLBW < 1500 г: inadvertent hypothermia 30-50 % при стандартной помощи; QI bundle → < 5 %',
    'Hypothermia (< 36 °C) admission ↑ mortality, IVH, RDS, late-onset sepsis',
    '< 32 нед: НЕ сушить перед polyethylene wrap (сохраняет vernix + влагу)',
    'Term: тёплые полотенца + cap; kangaroo если стабилен',
    'Operating room ≥ 25 °C (≥ 26 °C для < 32 нед) — critical часто overlooked',
    'Servo-controlled equipment > unservoed (избегает overheating)',
    'Chemical mattress (Transwarmer 40 °C) — cheap, effective adjunct',
    'Cap (woolen/quilted): heat loss через scalp ≈ 25 % у newborn',
    'Plastic bag/wrap: cheap alternative к polyethylene в LMIC settings',
    'Skin-to-skin (kangaroo) с mother — gravity-aware bonding + thermoregulation',
    'Document admission temperature: outcome metric',
    'Avoid: drying < 32 нед before wrap, single-use polyethylene wrap reuse, под radiant warmer без feedback loop',
  ],
  related: [
    { id: 'neo-hypothermia-transport', title: 'Гипотермия transport' },
    { id: 'neo-hie-cooling', title: 'TH eligibility' },
    { id: 'apgar', title: 'Apgar score' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
  ],
  info: `### Thermal Management — Golden Hour

Critical для preterm и newborn outcomes. **Hypothermia (< 36 °C) at
admission ↑ mortality, IVH, RDS, late-onset sepsis.**

### QI Bundle (gold standard)

| Element | Detail | Indication |
|---|---|---|
| **OR temp ≥ 25 °C** | (≥ 26 °C для < 32 нед) | All deliveries |
| **Servo-controlled equipment** | Radiant warmer + incubator | All preterm |
| **Polyethylene wrap** | БЕЗ drying first | < 32 нед |
| **Chemical mattress** | Transwarmer 40 °C | < 32 нед, transport |
| **Cap** | Woolen / quilted | All preterm |
| **Тёплые полотенца** | Pre-warmed | Term |
| **Skin-to-skin** (kangaroo) | After stabilization | Стабильные |

### Goal

| Time point | Target |
|---|---|
| **Admission temp** | **36.5-37.5 °C** |
| Bath / handling | Maintain 36.5-37.5 °C |
| Transport | Maintain 36.5-37.5 °C |

### Heat loss mechanisms

| Mechanism | % of total loss | Prevention |
|---|---|---|
| **Evaporation** | 25-30 % | Polyethylene wrap; dry term carefully |
| **Radiation** | 25-35 % | Radiant warmer; warm OR; cap |
| **Convection** | 15-20 % | Warm OR; closed incubator |
| **Conduction** | 5-10 % | Pre-warmed surfaces; chemical mattress |

### < 32 нед — special considerations

#### НЕ сушить перед wrap:
- Vernix + влага сохраняют warmth
- Polyethylene wrap прямо на newborn (lower body)
- Голову dry + cap

#### Polyethylene wrap technique:
1. Plastic bag pre-warmed
2. Wrap newborn от neck к feet прямо после birth
3. **БЕЗ drying первого**
4. Cap on head
5. Chemical mattress underneath
6. Place в radiant warmer / incubator

### Cochrane 2010 — Plastic wrap

- Significant ↓ admission hypothermia preterm
- ↓ Mortality (особенно ELBW)
- Easy, cheap intervention
- Recommended всем preterm < 32 нед

### Term newborns

#### Standard care:
- Pre-warmed dry towels
- Quick drying
- Cap
- Skin-to-skin (kangaroo) с mother ASAP
- Breastfeeding initiation

### Transport thermal management

| Phase | Strategy |
|---|---|
| Pre-transport | Servo-controlled incubator transport |
| In transit | Maintain 36.5-37.5 °C |
| Polyethylene wrap | < 32 нед |
| Chemical mattress | Adjunct |
| Document temp q15-30 мин | Documentation |

### Hypothermia consequences

| Severity | Consequences |
|---|---|
| **Mild (36.0-36.4)** | Cold stress, hypoglycemia, mild ↑ O₂ demand |
| **Moderate (32-35.9)** | Bradycardia, ↓ surfactant, RDS worsening, hypoglycemia |
| **Severe (< 32)** | Multi-organ dysfunction, DIC, ↑ mortality 50 % per °C drop |

### QI implementation

#### Bundles snijaeт hypothermia rates:
- **Pre-bundle:** 30-50 % VLBW hypothermic at admission
- **Post-bundle:** < 5 %

#### Key elements:
1. **Education** team
2. **Standardization** equipment + protocols
3. **Documentation** admission temp как outcome metric
4. **Continuous improvement** (monthly review, root cause analysis)

### LMIC settings

| Resource | Substitute |
|---|---|
| Radiant warmer | Heat lamp + cap |
| Polyethylene wrap | Clean plastic bag |
| Chemical mattress | Hot water bottle (carefully wrapped) |
| Servo-controlled | Manual temp checking |

### Источники

- WHO Recommendations on Newborn Health (2017)
- NRP 8 ed. 2021 — Chapter 7 Thermal Management
- Helping Babies Survive (HBS) — Essential Care for Every Baby
- Cochrane Plastic wrap для prevention hypothermia 2010
- McCarthy LK, O'Donnell CPF — golden hour reviews
- КР МЗ РФ "Транспортировка и согревание н/р" (2024)
`,
};

export default runner;
