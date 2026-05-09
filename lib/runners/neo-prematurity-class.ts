/**
 * Runner: neo-prematurity-class — Классификация недоношенности
 *
 * NEONATOLOGY MODULE — Б1 (классификации, audit issue 3.B).
 *
 * Унифицированная классификация недоношенности по WHO + AAP +
 * КР МЗ РФ. Объединяет два critical параметра — gestational age (GA)
 * и birth weight — для определения risk groups и protocols.
 *
 * SOURCES:
 *   - WHO ICD-11 P07 (preterm + low birth weight)
 *   - AAP / Engle WA 2009 — Late preterm definition
 *   - КР МЗ РФ "Преждевременные роды" / "Недоношенность" (2024)
 *   - Cochrane / NICE preterm management guidelines
 *
 * Категории:
 *   GA-based:
 *     - Поздние недоношенные:    34+0 - 36+6 нед (late preterm)
 *     - Умеренно недоношенные:   32+0 - 33+6 нед (moderate preterm)
 *     - Глубоко недоношенные:    28+0 - 31+6 нед (very preterm)
 *     - Экстремально н/р:        < 28+0 нед (extremely preterm)
 *
 *   Weight-based (LBW):
 *     - Низкая масса (LBW):      1500-2499 г
 *     - Очень низкая (VLBW):     1000-1499 г
 *     - Экстремально низкая (ELBW): < 1000 г
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 8,
  countries: 'Международный (WHO ICD-11 / AAP) · РФ',
  reference: 'WHO ICD-11 P07. AAP/Engle 2009. КР МЗ РФ "Преждевременные роды".',
  inputs: [
    {
      id: 'ga_weeks',
      label: 'GA полные недели',
      type: 'select',
      options: [
        { value: '4', label: '< 28 нед (extremely preterm)', points: 4 },
        { value: '3', label: '28-31+6 нед (very preterm)', points: 3 },
        { value: '2', label: '32-33+6 нед (moderate preterm)', points: 2 },
        { value: '1', label: '34-36+6 нед (late preterm)', points: 1 },
        { value: '0', label: '≥ 37 нед (доношенный)', points: 0 },
      ],
    },
    {
      id: 'birth_weight',
      label: 'Birth weight (кг)',
      type: 'select',
      options: [
        { value: '4', label: '< 1.000 кг (ELBW)', points: 4 },
        { value: '3', label: '1.000-1.499 кг (VLBW)', points: 3 },
        { value: '2', label: '1.500-2.499 кг (LBW)', points: 2 },
        { value: '1', label: '2.500-3.999 кг (норма)', points: 1 },
        { value: '0', label: '≥ 4.000 кг (макросомия)', points: 0 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'Доношенный, нормальная масса',
      color: '#22C55E',
      description: 'Term newborn, normal birth weight.',
      actions: [
        'Стандартный уход за доношенным',
        'Routine screening: метаболика, слух, зрение, врождённые пороки',
        'Кормление по требованию; контакт кожа-к-коже',
        'Vit K profilaxis 1 мг IM',
        'Vaccinations по нацкалендарю',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'Late preterm / LBW',
      color: '#84CC16',
      description: 'Late preterm (34-36+6 нед) или low birth weight 1500-2499 г.',
      actions: [
        'Late preterm уход — high risk группа (smaller than term, similar size to LBW)',
        'Контроль гипогликемии, гипотермии, RDS, гипербилирубинемии',
        'Раннее кормление (предпочтительно грудь); контроль массы и диуреза',
        'TSB измерение через 24-48 ч; phototherapy threshold снижен',
        'Длинее observation в роддоме (48-72 ч минимум, не 24)',
      ],
    },
    {
      min: 4,
      max: 5,
      label: 'Moderate-very preterm / VLBW',
      color: '#F59E0B',
      description: 'Moderate-very preterm (28-33+6 нед) или very low birth weight 1000-1499 г.',
      actions: [
        'NICU уход; мониторинг continuous SpO₂, ЧСС, температура',
        'Surfactant подготовка (LISA / INSURE если RDS)',
        'CPAP / pNCPAP с golden hour',
        'Vit K 0.5 мг IM; caffeine 20 мг/кг loading (if < 32 нед)',
        'Polyethylene wrap + cap для термозащиты',
        'TPN (ESPGHAN PN 2018) если NPO; trophic feeding ASAP',
        'Эмпирические abx если EOS suspected (Puopolo / Kaiser)',
        'Echo для PDA в 1-7 дней',
      ],
    },
    {
      min: 6,
      max: 8,
      label: 'Extremely preterm / ELBW',
      color: '#7F1D1D',
      description: 'Extremely preterm (< 28 нед) или extremely low birth weight < 1000 г.',
      actions: [
        '⚠️ ELBW — повышенный риск всех осложнений',
        'NICU level III; consultant neonatologist сразу',
        'Early surfactant + LISA (preferred); CPAP first if stable',
        'UVC + UAC immediately; thermal management — polyethylene wrap critical',
        'Caffeine 20 мг/кг loading (universal у < 32 нед)',
        'TPN ASAP; minimal trophic feeding (< 20 мл/кг/сут)',
        'Эмпирические abx pending cultures (LOS у CONS — high incidence)',
        'Hydrocortisone considered для refractory hypotension',
        'Echo screening for PDA; head US screening for ВЖК (q3-7d)',
        'ROP screening start at 31 нед PMA или 4 нед age (whichever later)',
        'Family communication realistic re prognosis',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const gaPoints = Number(values.ga_weeks ?? 0);
    const wtPoints = Number(values.birth_weight ?? 0);
    // Сумма с capping для interpretation
    const total = Math.min(gaPoints + wtPoints, 8);

    const band = findBand(runner.bands, total);

    return {
      value: String(total),
      unit: 'категория',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. GA + weight risk score: ${total}/8.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'GA + weight могут не coincide: SGA term (например 36 нед, 1800 г) — like late preterm',
    'IUGR (ЗВУР) — отдельная классификация, дополняет prematurity',
    'AGA / SGA / LGA по Fenton 2025 — runner отдельный (neo-fenton)',
    'Late preterm ≠ near-term: incidence respiratory distress 8× higher than term',
    'Mortality по GA: < 24 нед ~ 50-90 %, 24-25 нед ~ 30-50 %, 26-27 ~ 10-20 %, 28-32 ~ 5-10 %, 33-36 ~ 1-3 %',
    'Antenatal corticosteroids (betamethasone 12 мг IM × 2 за 24-48 ч до родов) — ↓ RDS, IVH, NEC, mortality на 30-50 %',
    'Magnesium sulfate antepartum (если < 32 нед) — neuroprotection (snijaeт CP riski)',
    'ELBW < 750 г — extreme high risk: NEC, IVH, BPD, ROP, mortality 20-40 %',
    'Catch-up growth: VLBW обычно догоняют к 2-3 годам; ELBW могут до 5-8 лет',
    'Long-term outcomes: < 28 нед — 25-50 % cognitive / motor delay; late preterm — 1.5-2× учеба issues',
  ],
  related: [
    { id: 'ballard', title: 'Ballard / New Ballard' },
    { id: 'neo-petrussa', title: 'Petrussa Score' },
    { id: 'neo-fenton', title: 'Fenton 2025 growth' },
    { id: 'apgar', title: 'Apgar' },
  ],
  info: `### Классификация недоношенности

Унифицированная классификация по GA + birth weight для определения
risk groups и стандартов протоколов.

### GA-based classification

| Категория | GA | English |
|---|---|---|
| **Extremely preterm** | < 28+0 нед | Extremely preterm |
| **Very preterm** | 28-31+6 нед | Very preterm |
| **Moderate preterm** | 32-33+6 нед | Moderate preterm |
| **Late preterm** | 34-36+6 нед | Late preterm |
| **Term** | 37-41+6 нед | Term |
| **Post-term** | ≥ 42+0 нед | Post-term |

### Weight-based classification

| Категория | Birth weight | Сокращение |
|---|---|---|
| **ELBW** (extremely low) | < 1000 г | < 1.0 кг |
| **VLBW** (very low) | 1000-1499 г | < 1.5 кг |
| **LBW** (low) | 1500-2499 г | < 2.5 кг |
| **Normal** | 2500-3999 г | norm |
| **Macrosomia** | ≥ 4000 г | LGA если term |

### Combined risk score (Bordik MVP)

| Сумма | Категория |
|---|---|
| 0-1 | Term + normal |
| 2-3 | Late preterm / LBW |
| 4-5 | Moderate-very preterm / VLBW |
| 6-8 | Extremely preterm / ELBW |

### Mortality / outcomes by GA

| GA | Mortality | CP / cognitive issues |
|---|---|---|
| < 24 нед | 50-90 % | 30-50 % survivors |
| 24-25 нед | 30-50 % | 25-40 % |
| 26-27 нед | 10-20 % | 15-25 % |
| 28-32 нед | 5-10 % | 5-15 % |
| 33-36 нед | 1-3 % | 1.5-2× term issues |
| 37-41 нед | < 1 % | baseline |

### Anticipatory care

#### < 28 нед / ELBW
- NICU level III, neonatologist immediate
- Surfactant + LISA early
- UVC + UAC, thermal management
- Caffeine universal
- TPN ASAP
- Imaging screening: head US (IVH), echo (PDA), ROP

#### 28-33 нед / VLBW
- NICU
- Surfactant if RDS
- Caffeine if < 32 нед
- Vit K 0.5 мг IM
- Empiric abx if EOS suspected

#### 34-36 нед / LBW
- Можно палата интенсивной терапии or step-down
- Late preterm pitfalls: гипогликемия, гипотермия, hyperbili, RDS
- Длинная observation 48-72 ч в роддоме

#### Term + normal
- Routine ward
- Kangaroo, breastfeeding, vit K 1 мг IM

### Antenatal interventions (← когда возможны)

| Intervention | Effect |
|---|---|
| **Betamethasone** 12 мг × 2 IM | ↓ RDS, IVH, NEC, mortality 30-50 % |
| **Magnesium sulfate** | Neuroprotection (snijaeт CP riski) |
| **Tocolytics** | Buy 24-48 ч for steroids |
| **Antibiotics** (PROM) | ↓ neonatal sepsis |

### Источники

- WHO ICD-11 P07 (preterm + LBW)
- AAP / Engle WA 2009 — Late preterm definition
- КР МЗ РФ "Преждевременные роды" / "Недоношенность" (2024)
- Cochrane antenatal corticosteroids
- NICE NG201 — Preterm labour and birth
`,
};

export default runner;
