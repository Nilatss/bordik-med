/**
 * Runner: neo-vaccination-calendar — Календарь вакцинации н/р (РФ + UZ + Intl)
 *
 * NEONATOLOGY MODULE — protocol classification (В12).
 *
 * Календарь вакцинации новорождённого с возможностью переключения по
 * региону: Россия (Приказ МЗ РФ № 1122н от 06.12.2021), Узбекистан
 * (нацкалендарь), Международный (WHO + CDC ACIP).
 *
 * SOURCES:
 *   - Приказ МЗ РФ № 1122н от 06.12.2021 (НКПП) — Russia
 *   - UZ Min Health Calendar — gov.uz/ru/ssv
 *   - WHO Immunization Schedule (2024)
 *   - CDC ACIP 2024 — United States
 *   - КР МЗ РФ "Иммунопрофилактика" (2024)
 *
 * NB: For preterm infants — vaccinate по chronologic age, не corrected age
 * (с few exceptions, e.g., RSV palivizumab).
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'РФ (Приказ МЗ РФ 1122н) · UZ нацкалендарь · WHO/CDC',
  reference: 'Приказ МЗ РФ № 1122н от 06.12.2021. UZ gov.uz/ru/ssv. WHO 2024. CDC ACIP 2024.',
  inputs: [
    {
      id: 'age_visit',
      label: 'Возраст визита',
      type: 'select',
      options: [
        { value: '0', label: 'Первые 24 ч жизни (HepB-1 + БЦЖ)', points: 0 },
        { value: '1', label: '1 мес (HepB-2)', points: 1 },
        { value: '2', label: '2 мес (DTP-1, IPV-1, HepB-3, Hib-1, ПКВ-1)', points: 2 },
        { value: '3', label: '4-5 мес (DTP-2/3, IPV-2/3, Hib-2/3, ПКВ-2)', points: 3 },
        { value: '4', label: '6 мес (HepB-4, ПКВ-3, ротавирус)', points: 4 },
      ],
    },
    {
      id: 'region',
      label: 'Регион',
      type: 'select',
      options: [
        { value: 'ru', label: 'РФ (НКПП Приказ № 1122н)', points: 0 },
        { value: 'uz', label: 'Узбекистан (нацкалендарь)', points: 0 },
        { value: 'intl', label: 'Международный (WHO/CDC)', points: 0 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: 'Первые 24 ч жизни',
      color: '#3B82F6',
      description: 'HepB-1 (роддом) + БЦЖ-М/БЦЖ (в течение 3-7 дней) при отсутствии противопоказаний.',
      actions: [
        '--- РФ (Приказ № 1122н) ---',
        'HepB-1 (рекомбинантная) — в 1-е 24 ч жизни',
        'БЦЖ-М (или БЦЖ для контактов) — на 3-7 день жизни',
        '--- UZ нацкалендарь ---',
        'HepB-1 — в первые 24 ч',
        'БЦЖ — в роддоме перед выпиской',
        '--- WHO recommendation ---',
        'HepB birth dose — все newborns в 24 ч',
        'BCG — единичная dose в роддоме (в endemic regions)',
        '--- Противопоказания ---',
        'БЦЖ: ELBW < 2000 г, активные ID, мать с активным TB',
        'HepB: anaphylaxis к компонентам vaccine; preterm < 2000 г: 4-dose schedule (0, 1, 2, 6 мес)',
      ],
    },
    {
      min: 1,
      max: 1,
      label: '1 мес визит',
      color: '#3B82F6',
      description: 'HepB-2 (РФ + UZ + intl).',
      actions: [
        '--- РФ ---',
        'HepB-2 — 1 мес жизни',
        '--- UZ ---',
        'HepB-2 — 2 мес (отличие от РФ)',
        'OPV-1 — 2 мес (или 6 нед)',
        '--- WHO/CDC ---',
        'HepB-2 — 1-2 мес (per region)',
      ],
    },
    {
      min: 2,
      max: 2,
      label: '2 мес визит',
      color: '#3B82F6',
      description: 'Множественные вакцины — DTP-1, IPV-1, HepB-3, Hib-1, ПКВ-1.',
      actions: [
        '--- РФ (Приказ № 1122н) ---',
        '3 мес (РФ schedule):',
        '  - DTP (АКДС) -1 (либо ИДС/АДС-М)',
        '  - IPV-1 (полиомиелит инактивированный)',
        '  - HepB-3',
        '  - ХИБ-1 (для риска)',
        '  - ПКВ (пневмококк) -1',
        '--- UZ ---',
        '2 мес:',
        '  - Pentavalent vaccine (DTP-HepB-Hib) — 1-я доза',
        '  - OPV-1 (или IPV)',
        '  - PCV-1 (пневмококковая)',
        '--- WHO/CDC ---',
        '2 мес:',
        '  - DTaP-1',
        '  - IPV-1',
        '  - HepB-2 или -3',
        '  - Hib-1',
        '  - PCV-1',
        '  - Rotavirus-1',
      ],
    },
    {
      min: 3,
      max: 3,
      label: '4-5 мес визит',
      color: '#3B82F6',
      description: 'DTP-2/3, IPV-2/3, Hib-2/3, ПКВ-2.',
      actions: [
        '--- РФ ---',
        '4.5 мес: DTP-2, IPV-2, ХИБ-2, ПКВ-2',
        '6 мес: DTP-3, IPV-3 (oral OPV-1), HepB-4',
        '--- UZ ---',
        '4 мес: Pentavalent-2, OPV-2, PCV-2',
        '6 мес: Pentavalent-3, OPV-3, PCV-3',
        '--- WHO/CDC ---',
        '4 мес: DTaP-2, IPV-2, Hib-2, PCV-2, Rotavirus-2',
        '6 мес: DTaP-3, HepB-3, Hib-3 (some vaccines), PCV-3, Rotavirus-3 (если applicable), Influenza (annual)',
      ],
    },
    {
      min: 4,
      max: 4,
      label: '6 мес визит',
      color: '#3B82F6',
      description: 'HepB-4 (РФ schedule), ПКВ-3, ротавирус booster (intl).',
      actions: [
        '--- РФ ---',
        '6 мес: HepB-4, OPV-1 (oral after 3 IPV)',
        '12 мес: MMR (ЖКВ + ЖПВ + ЖКВ-2/корь паротит краснуха)',
        '15 мес: ПКВ revaccination',
        '18 мес: DTP-4, OPV-2, ХИБ revaccination',
        '20 мес: OPV-3',
        '--- UZ ---',
        '9 мес: MMR (или 12 мес)',
        '15 мес: MMR-2',
        '18 мес: DTP-4, OPV-4',
        '--- WHO/CDC ---',
        '6 мес: HepB-3, Influenza (annual)',
        '12-15 мес: MMR-1, Varicella-1, Hib booster, PCV-4',
        '12-23 мес: HepA-1, Influenza (annual)',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const visit = Number(values.age_visit ?? 0);
    const region = String(values.region ?? 'ru');

    const band = findBand(runner.bands, visit);

    let regionLabel = 'РФ';
    if (region === 'uz') regionLabel = 'UZ';
    else if (region === 'intl') regionLabel = 'WHO/CDC';

    return {
      value: regionLabel,
      unit: 'регион',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label} (Регион: ${regionLabel}).`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Preterm: vaccinate по chronologic age, не corrected age (с rare exceptions)',
    'ELBW < 2000 г: HepB 4-dose schedule (0, 1, 2, 6 мес) для better seroconversion',
    'БЦЖ contraindicated < 2000 г, активные ID, мать с TB',
    'OPV (oral polio): нельзя immunocompromised, household contacts immunocompromised',
    'IPV preferred первое 3 doses; OPV add-on в РФ schedule',
    'Live vaccines (MMR, varicella, BCG, oral polio): contraindicated при immunodeficiency',
    'DTP: pertussis component — DTaP (acellular) preferred современно vs DTwP (whole-cell)',
    'Influenza: annual ≥ 6 мес; pediatric formulation',
    'RSV palivizumab (passive immunization): preterm < 32 нед, BPD, CHD — separate calendar',
    'Catch-up schedule: для preterm/late-presenters — accelerated по WHO/CDC catch-up tables',
    'РФ Приказ № 1122н — обязательные vaccines + recommended; updated 06.12.2021',
    'UZ: routine immunization сравнима с WHO; some differences в OPV/IPV preference',
    'Documentation: vaccination card обязательна (для school entry, daycare)',
  ],
  related: [
    { id: 'neo-prematurity-class', title: 'Классификация недоношенности' },
    { id: 'neo-discharge-criteria', title: 'Критерии выписки' },
    { id: 'neo-vitk-dose', title: 'Витамин K profilaxis' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
  ],
  info: `### Календарь вакцинации новорождённого

Календарь по регионам: РФ (Приказ № 1122н), UZ (нацкалендарь), WHO/CDC.

### Первые 24 ч жизни

| Vaccine | РФ | UZ | WHO |
|---|---|---|---|
| **HepB-1** | + (24 ч) | + (24 ч) | + (24 ч) |
| **БЦЖ** | 3-7 d (БЦЖ-М) | роддом | endemic regions |

### Schedule по возрасту (РФ Приказ № 1122н)

| Возраст | Вакцины |
|---|---|
| **24 ч** | HepB-1 |
| **3-7 d** | БЦЖ / БЦЖ-М |
| **1 мес** | HepB-2 |
| **2 мес** | HepB-3 (риск-группа); ПКВ-1 |
| **3 мес** | DTP-1, IPV-1, ХИБ-1 (риск), ПКВ-1 (если не сделано) |
| **4.5 мес** | DTP-2, IPV-2, ХИБ-2, ПКВ-2 |
| **6 мес** | DTP-3, IPV-3, HepB-4, OPV-1 |
| **12 мес** | MMR (КПК) |
| **15 мес** | ПКВ revaccination |
| **18 мес** | DTP-4, OPV-2, ХИБ revaccination |
| **20 мес** | OPV-3 |

### Schedule по возрасту (UZ нацкалендарь)

| Возраст | Вакцины |
|---|---|
| **24 ч** | HepB-1 |
| **роддом** | БЦЖ |
| **2 мес** | Pentavalent (DTP-HepB-Hib) -1, OPV-1, PCV-1 |
| **4 мес** | Pentavalent-2, OPV-2, PCV-2 |
| **6 мес** | Pentavalent-3, OPV-3, PCV-3 |
| **9-12 мес** | MMR-1 |
| **15 мес** | MMR-2 |
| **18 мес** | DTP-4, OPV-4 |

### Schedule (WHO/CDC general)

| Возраст | Вакцины |
|---|---|
| **Birth** | HepB-1, BCG (endemic) |
| **2 мес** | DTaP-1, IPV-1, HepB-2, Hib-1, PCV-1, Rotavirus-1 |
| **4 мес** | DTaP-2, IPV-2, Hib-2, PCV-2, Rotavirus-2 |
| **6 мес** | DTaP-3, HepB-3, Hib-3 (some), PCV-3, Rotavirus-3 (некоторые), **Influenza (annual)** |
| **12-15 мес** | MMR-1, Varicella-1, Hib booster, PCV-4 |
| **12-23 мес** | HepA-1 |
| **15-18 мес** | DTaP-4 |

### Special considerations

#### Preterm
- **Vaccinate по chronologic age** (не corrected age)
- **ELBW < 2000 г: HepB 4-dose** (0, 1, 2, 6 мес) для better seroconversion
- БЦЖ: contraindicated < 2000 г, mother с TB, active ID

#### Immunocompromised
- **Live vaccines contraindicated:** MMR, varicella, BCG, oral polio
- IPV preferred over OPV
- Inactivated vaccines OK

#### RSV passive immunization (palivizumab)
- Preterm < 32 нед
- BPD
- CHD (hemodynamically significant)
- Separate calendar — monthly during RSV season

#### Catch-up schedule
- WHO/CDC catch-up tables
- Accelerate но maintain minimum intervals
- Don't restart series даже если interrupted

### Documentation

| Region | Form |
|---|---|
| РФ | Карта вакцинации (Ф063) |
| UZ | Картa вакцинации (national) |
| EU/US | Vaccine record / yellow book |

### Источники

- Приказ МЗ РФ № 1122н от 06.12.2021 (НКПП)
- UZ Min Health — gov.uz/ru/ssv
- WHO Immunization Schedule 2024
- CDC ACIP 2024
- AAP / WHO catch-up schedules
- КР МЗ РФ "Иммунопрофилактика" (2024)
`,
};

export default runner;
