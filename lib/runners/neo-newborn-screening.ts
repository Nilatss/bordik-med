/**
 * Runner: neo-newborn-screening — Newborn Metabolic Screening (Sample Timing + Categorization)
 *
 * NEONATOLOGY MODULE — protocol classification (В13).
 *
 * Newborn screening (NBS) для metabolic disorders, congenital hypothyroidism,
 * hemoglobinopathies, и infections. Heel-prick blood spot collected в 24-72 ч
 * жизни (после first feeding для adequate detection PKU + galactosemia).
 *
 * SOURCES:
 *   - Russia: РФ-расширенный screening 36 заболеваний (с 2023 nation-wide)
 *   - US RUSP (Recommended Uniform Screening Panel) — ~ 35 conditions
 *   - UK: 9 conditions
 *   - UZ: национальный pilot, expanding
 *   - WHO 2007 — Newborn Screening principles
 *   - КР МЗ РФ "Расширенный неонатальный скрининг" (2023, обновлено 2024)
 *
 * Critical conditions (most catastrophic если undetected):
 *   - PKU (phenylketonuria) — irreversible CI без treatment
 *   - Galactosemia — life-threatening hepatic failure
 *   - Congenital hypothyroidism — neurodev impairment
 *   - SCID — life-threatening infection
 *   - MCAD (medium-chain acyl-CoA dehydrogenase) — sudden death
 *
 * Sample timing:
 *   - Optimal: 48-72 ч (после first 24 ч feeds)
 *   - Acceptable: 24-72 ч
 *   - Too early < 24 ч: false negatives для PKU, galactosemia
 *   - Too late > 7 дней: delayed diagnosis
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'РФ (расш. с 2023, 36 заболеваний) · UZ (нацпрограмма) · WHO',
  reference: 'РФ Приказ МЗ РФ 2023. UZ нацпрограмма. WHO 2007 NBS principles. КР МЗ РФ 2024.',
  inputs: [
    {
      id: 'age_at_sample',
      label: 'Возраст при взятии sample',
      type: 'select',
      options: [
        { value: '0', label: '< 24 ч (rано — re-sampling рекомендуется)', points: 0 },
        { value: '1', label: '24-48 ч', points: 1 },
        { value: '2', label: '48-72 ч (optimal)', points: 2 },
        { value: '3', label: '> 72 ч (поздно — diagnosis delay)', points: 1 },
      ],
    },
    {
      id: 'fed_status',
      label: 'Кормление к моменту взятия',
      type: 'select',
      options: [
        { value: '0', label: 'Не кормили ещё (false neg PKU/galactosemia)', points: 0 },
        { value: '1', label: 'Кормили < 24 ч (limited)', points: 1 },
        { value: '2', label: 'Кормили ≥ 24 ч (adequate)', points: 2 },
      ],
    },
    {
      id: 'preterm',
      label: 'Преждевременно рождённый (< 32 нед)?',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'transfusion',
      label: 'Получал blood transfusion / TPN до sample?',
      type: 'checkbox',
      points: 0,
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'Sample timing неоптимальный',
      color: '#F59E0B',
      description: 'Suboptimal timing — re-sampling может быть needed.',
      actions: [
        'Sample timing неоптимальный',
        'Если < 24 ч сейчас: повторить sample в 24-72 ч',
        'Если > 72 ч: minimize delay processing',
        'Document timing в medical record',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'Sample acceptable',
      color: '#84CC16',
      description: 'Adequate sample — process per protocol.',
      actions: [
        'Sample acceptable timing',
        'Process per regional NBS protocol',
        'Re-sample preterm: повторить в 28 дней + при разрешении from NICU',
        'Re-sample при transfusion / TPN: 60-120 дней после',
      ],
    },
    {
      min: 4,
      max: 4,
      label: 'Optimal timing — adequate sample',
      color: '#22C55E',
      description: 'Optimal timing для NBS.',
      actions: [
        'Optimal timing для newborn screening',
        'Heel prick blood spot collection: warm heel первый, lateral aspect, использовать sterile lancet',
        'Standard: 5 spots на filter paper (Guthrie card)',
        'Document: parent name, infant identifiers, time of birth, time of sample, feeding status',
        'Send к centralized lab per regional protocol',
        'Results typically: 1-2 нед',
        'Family education: re-sampling reasons если applicable',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const age = Number(values.age_at_sample ?? 0);
    const feeding = Number(values.fed_status ?? 0);
    const preterm = values.preterm === true ? 1 : 0;
    const transfusion = values.transfusion === true ? 1 : 0;
    let total = age + feeding;

    // Adjust для special situations
    if (preterm || transfusion) {
      // Force re-sample requirement
      total = Math.min(total, 2);
    }

    const band = findBand(runner.bands, total);

    let extraDetail = '';
    if (preterm) extraDetail += ' Preterm: re-sample в 28 d жизни.';
    if (transfusion) extraDetail += ' После transfusion/TPN: re-sample 60-120 d.';

    return {
      value: String(total),
      unit: 'cues',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}.${extraDetail}`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Optimal sample timing: 48-72 ч жизни (после ≥ 24 ч feeds)',
    'Too early < 24 ч: PKU + galactosemia may be missed (require feeding)',
    'Too late > 7 дней: delays diagnosis для catastrophic conditions (PKU, galactosemia, MCAD)',
    'Preterm: re-sample при 28 дней жизни (immature metabolic patterns)',
    'Post-transfusion / TPN: re-sample 60-120 days после (transferred substances may interfere)',
    'РФ since 2023: расширенный screening 36 заболеваний (Tandem MS-based)',
    'РФ original 5: PKU, congenital hypothyroidism, congenital adrenal hyperplasia, galactosemia, cystic fibrosis',
    'РФ extended (2023): + MSUD, MCAD, organic acidemias, lysosomal disorders, etc.',
    'UZ: национальный pilot, expanding к WHO recommendations',
    'False positives ~ 1-5 % для most disorders; positive = CONFIRMATORY testing required, не treatment yet',
    'Heel prick technique: warm heel, lateral aspect (avoid central — bone), filter paper',
    'Send blood spot к centralized lab per regional protocol; results 1-2 нед',
    'Critical: positive screen → IMMEDIATE confirmatory testing + family contact + start treatment если confirmed',
  ],
  related: [
    { id: 'neo-levothyroxine-dose', title: 'Левотироксин (CH)' },
    { id: 'neo-vaccination-calendar', title: 'Календарь вакцинации' },
    { id: 'neo-discharge-criteria', title: 'Критерии выписки' },
    { id: 'neo-cchd-pulse-oximetry', title: 'CCHD pulse oximetry' },
  ],
  info: `### Newborn Metabolic Screening (NBS)

Heel-prick blood spot screening для metabolic disorders, congenital
hypothyroidism, hemoglobinopathies, infections.

### Sample timing

| Age | Status |
|---|---|
| < 24 ч | Rано — false negatives PKU/galactosemia |
| **24-48 ч** | **Acceptable** |
| **48-72 ч** | **Optimal** |
| > 72 ч | Late — diagnosis delay |
| > 7 дней | Critical delay |

### Pre-conditions for sample

| Condition | Effect |
|---|---|
| Adequate feeding ≥ 24 ч | OK для PKU, galactosemia |
| Преждевременно (< 32 нед) | Re-sample в 28 d |
| Blood transfusion | Re-sample 60-120 d after |
| TPN > 24 ч | Re-sample 60-120 d after |

### Conditions screened (РФ расширенный с 2023)

#### 5 original conditions (с 2007):
1. **Phenylketonuria (PKU)**
2. **Congenital hypothyroidism**
3. **Congenital adrenal hyperplasia (CAH)**
4. **Galactosemia**
5. **Cystic fibrosis**

#### 36 conditions extended panel (2023+):
- All above PLUS:
- MSUD (maple syrup urine disease)
- MCAD (medium-chain acyl-CoA dehydrogenase)
- LCHAD, VLCAD (long/very long chain)
- Organic acidemias (PA, MMA, IVA)
- Tyrosinemia I, II, III
- Citrullinemia
- ASA lyase deficiency
- Glutaric aciduria I, II
- Carnitine deficiency
- Biotinidase deficiency
- Severe combined immunodeficiency (SCID)
- Lysosomal disorders
- Krabbe disease
- Mucopolysaccharidoses (MPS I)
- And more...

### Critical conditions

| Condition | Without treatment | Window |
|---|---|---|
| **PKU** | Severe CI, irreversible | Treatment by 3 нед — normal IQ |
| **Galactosemia** | Liver failure, sepsis, death | Stop lactose immediately upon suspicion |
| **CH** | Severe CI | Start L-thyroxine by 2 нед |
| **CAH** | Salt-wasting crisis | Cortisol + fludrocortisone immediate |
| **MCAD** | Sudden death | Avoid fasting; emergency glucose |
| **Biotinidase** | Skin, neuro, deafness | Biotin 5-20 мг/сут |
| **MSUD** | Toxic encephalopathy | BCAA-restricted diet, dialysis if acute |

### Sample technique

1. **Pre-warm heel** (warm towel × 3-5 мин) или use heel warmer device
2. **Position:** infant supine, heel down
3. **Site:** lateral or medial aspect of plantar heel (NOT center — bone)
4. **Sterile lancet** (depth 1-2 мм maximum)
5. **First drop wiped**, allow free flow
6. **5 separate spots** on filter paper (Guthrie card)
7. **Air dry** 4 ч horizontal
8. **Documentation:** demographic info, time of birth, time of sample, feeding status

### Results / follow-up

#### Negative screen:
- Documented in medical record
- Family informed (often through pediatrician)

#### Positive screen:
- **IMMEDIATE confirmatory testing**
- Family contact (often via state coordinator)
- Pediatric subspecialist consultation
- Start treatment IF confirmed (не on screening alone except specific situations)

### False positives / negatives

#### False positive ~ 1-5 %:
- Stress (early sample)
- TPN (interference)
- Maternal medications
- Test sensitivity limitations

#### False negative ~ 0.5 %:
- Sample collected too early
- Inadequate feeding
- Conditions с late onset
- Specific genetic variants

### Special populations

#### Preterm:
- Initial sample 24-72 h
- **Re-sample at 28 d** (or discharge if earlier) — immature metabolic patterns
- Some panels require special preterm-specific testing

#### Transfused / on TPN:
- Initial sample может быть affected
- Re-sample 60-120 d after transfusion / TPN cessation

#### Outpatient / home births:
- Public health follow-up obligation
- Refer to NBS coordinator
- Sample within 24-72 h ideally

### Programs

| Region | Program |
|---|---|
| **РФ** | Расширенный 36 disorders (с 2023) |
| **UZ** | National pilot expanding |
| **US RUSP** | ~ 35 conditions (varies state) |
| **UK** | 9 conditions |
| **EU** | Variable (2-30 conditions) |
| **WHO** | Recommends ≥ 5 priority conditions |

### Documentation

- Vaccination card / NBS card
- Medical record entry
- Parent education sheet
- Public health follow-up

### Источники

- РФ Приказ МЗ РФ "Расширенный неонатальный скрининг" (2023, 2024)
- US Recommended Uniform Screening Panel (RUSP)
- UK NHS Newborn Blood Spot Screening
- WHO 2007 Newborn Screening principles
- КР МЗ РФ "Скрининг новорождённого" (2024)
- AAP / ACMG Newborn Screening guidelines
`,
};

export default runner;
