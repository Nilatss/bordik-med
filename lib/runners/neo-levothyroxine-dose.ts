/**
 * Runner: neo-levothyroxine-dose — Левотироксин (congenital hypothyroidism)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * L-thyroxine (T4) replacement therapy для congenital hypothyroidism (CH) —
 * critical для normal neurodev. Newborn screening detects ~ 1:2000-4000 cases.
 * Treatment must start before 2 нед возраста для optimal IQ outcome.
 *
 * Дозы (initial):
 *   Term newborn: 10-15 мкг/кг/сут PO once daily
 *   Preterm: 8-10 мкг/кг/сут PO (lower than term)
 *   Severe CH (TSH > 100): higher initial 12-17 мкг/кг/сут
 *
 *   Adjusted by age:
 *     0-3 мес: 10-15 мкг/кг/сут
 *     3-6 мес: 8-10 мкг/кг/сут
 *     6-12 мес: 6-8 мкг/кг/сут
 *
 * Goal: TSH < 5 mU/L (или 0.5-2), free T4 в upper half normal range
 *
 * SOURCES:
 *   - AAP/ESPGHAN 2014 — Update of Newborn Screening (Pediatrics 134:e1135)
 *   - Léger J et al. ESPE/PES 2014 (J Clin Endocrinol Metab 99:363)
 *   - American Thyroid Association 2014
 *   - КР МЗ РФ "Врождённый гипотиреоз" (2024)
 *
 * Critical: Start treatment в первые 2 нед жизни — delayed treatment results
 * в IQ deficit (each week delay = ~ 1 IQ point loss).
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP/ESPE/ATA 2014) · РФ',
  reference: 'AAP/ESPGHAN 2014 (Pediatrics 134:e1135). Léger J ESPE/PES 2014 JCEM 99:363.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 10,
      step: 0.01,
    },
    {
      id: 'mode',
      label: 'Severity / age',
      type: 'select',
      options: [
        { value: 'term_initial', label: 'Term initial 12 мкг/кг/сут (стандарт)' },
        { value: 'preterm_initial', label: 'Preterm initial 8 мкг/кг/сут' },
        { value: 'severe', label: 'Severe CH (TSH > 100) initial 15 мкг/кг/сут' },
        { value: 'maint_3_6mo', label: 'Maintenance 3-6 мес: 8 мкг/кг/сут' },
        { value: 'maint_6_12mo', label: 'Maintenance 6-12 мес: 6 мкг/кг/сут' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'term_initial');

    if (w <= 0 || w > 10) {
      return { value: '—', interpretation: 'Введите массу 0.4-10 кг', color: '#9CA3AF', details: '' };
    }

    type LevoMode = { perKg: number; label: string };
    const modes: Record<string, LevoMode> = {
      term_initial: { perKg: 12, label: 'Term initial' },
      preterm_initial: { perKg: 8, label: 'Preterm initial' },
      severe: { perKg: 15, label: 'Severe CH initial' },
      maint_3_6mo: { perKg: 8, label: 'Maintenance 3-6 мес' },
      maint_6_12mo: { perKg: 6, label: 'Maintenance 6-12 мес' },
    };
    const m = modes[mode] ?? modes.term_initial;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const totalMcgPerDay = w * m.perKg;
    // Tablets: 25, 50, 75, 88, 100 мкг; oral suspension 100 мкг/5 мл = 20 мкг/мл; or crushed tablets in водеа
    // Practical у н/р: crushed tablet в 1-2 мл water или breast milk, given с syringe
    const conc = 25; // мкг/таб smallest tablet (crushed approach)

    const actions: string[] = [];
    actions.push(`Левотироксин: ${totalMcgPerDay.toFixed(0)} мкг/сут PO once daily`);
    actions.push(`Доза: ${m.perKg} мкг/кг/сут`);
    actions.push('Tablets available: 25, 50, 75, 88, 100, 112, 125, 150, 175, 200 мкг');
    actions.push(`Approximation: ${(totalMcgPerDay / 25).toFixed(1)} × 25 мкг tablets`);

    actions.push('--- ⚠️ Treatment timing critical ---');
    actions.push('Start в первые 2 нед жизни ДЛЯ optimal neurodev outcome');
    actions.push('Each week delay = ~ 1 IQ point loss (Hanukoglu 2003)');
    actions.push('Newborn screening result positive → confirm + start ASAP (не ждать confirmation labs если screen high suspicion)');

    actions.push('--- Administration ---');
    actions.push('PO once daily, on empty stomach (30 мин до feeds или 1 ч после)');
    actions.push('Crushed tablet (25-50 мкг) в 1-2 мл water или breast milk; через syringe orally');
    actions.push('НЕ в formula directly (formula iron, soy, calcium impair absorption 30-50 %)');
    actions.push('IV form (Synthroid IV) reserved для tube feed / NPO patients (50-75 % oral dose)');

    actions.push('--- Newborn screening (TSH-based vs T4-based) ---');
    actions.push('TSH-based screen (most common): TSH > 50 mU/L → likely CH; TSH 20-50 → repeat');
    actions.push('T4-based screen: low T4 + high TSH confirmatory CH');
    actions.push('Sample: heel prick blood spot в 24-72 ч жизни (после first feed)');

    actions.push('--- Confirmation labs ---');
    actions.push('Serum TSH + free T4 + total T4 (confirmation от positive screen)');
    actions.push('TSH > 20 mU/L + T4 low: definitive CH');
    actions.push('Thyroid scan (technetium ИЛИ I-123): aplasia / dysgenesis / dyshormonogenesis');
    actions.push('Thyroid antibodies: anti-TPO, anti-thyroglobulin (transient hypothyroidism)');
    actions.push('Maternal thyroid status: rule out maternal-mediated transient hypoT');

    actions.push('--- Goals ---');
    actions.push('TSH < 5 mU/L (target 0.5-2) — most studies');
    actions.push('Free T4 в upper half normal range (target 1.4-2.3 нг/дл)');
    actions.push('Achievement: 2-4 нед после initiation; recheck levels');

    actions.push('--- Мониторинг ---');
    actions.push('TSH + free T4 через 2-4 нед после start, затем q1-3 мес × 1-й год');
    actions.push('Q3-6 мес во 2-й год');
    actions.push('Q6-12 мес after 2 years');
    actions.push('Growth, neurodev assessment');
    actions.push('Bone age annual (overzealous treatment → bone age advance)');

    actions.push('--- Adjustment ---');
    actions.push('TSH > 5 mU/L: ↑ dose 12.5-25 мкг');
    actions.push('TSH < 0.4 mU/L: ↓ dose 12.5-25 мкг');
    actions.push('TSH 0.5-5 + free T4 normal: continue same dose');
    actions.push('Re-check 4 нед после adjustment');

    actions.push('--- Side effects ---');
    actions.push('Overdose: тахикардия, irritability, sweating, poor sleep, weight loss, advanced bone age');
    actions.push('Underdose: lethargy, constipation, bradycardia, growth failure, neurodev delay');
    actions.push('Hyperthyroidism iatrogenic: monitor TSH closely, especially first year');
    actions.push('Allergic reactions rare');

    return {
      value: totalMcgPerDay.toFixed(0),
      unit: 'мкг/сут',
      interpretation: m.label,
      color: '#22C55E',
      details: `${m.perKg} мкг/кг/сут × ${w} кг = ${totalMcgPerDay.toFixed(0)} мкг/сут PO once daily.`,
      actions,
    };
  },
  caveats: [
    '⚠️ Treatment timing CRITICAL: start в первые 2 нед жизни для optimal IQ outcome',
    'Each week delay treatment = ~ 1 IQ point loss (Hanukoglu 2003)',
    'High initial dose (10-15 мкг/кг/сут) — quickly correct deficit; не titrate slowly как у adults',
    'PO administration: empty stomach, crushed tablet в water/breast milk',
    '⚠️ NOT directly в formula: iron, soy, calcium ↓ absorption 30-50 %',
    'IV form (Synthroid IV) reserved для NPO; 50-75 % oral dose',
    'Newborn screening: TSH > 50 mU/L → likely CH; confirm с serum TSH + free T4',
    'Imaging (thyroid scan technetium/I-123) определяет etiology: aplasia, dysgenesis, dyshormonogenesis',
    'Goals: TSH < 5 mU/L, free T4 в upper half normal range',
    'Monitoring: q2-4 нед initial, затем q1-3 мес × 1-й год',
    'Overdose signs: тахикардия, irritability, advanced bone age, weight loss',
    'Underdose signs: lethargy, constipation, growth failure, developmental delay',
    'Transient hypothyroidism (10-20 % of NBS positives): trial off therapy at 2-3 years',
  ],
  related: [
    { id: 'neo-vitk-dose', title: 'Витамин K profilaxis' },
    { id: 'neo-cholestasis-criteria', title: 'Cholestasis criteria' },
    { id: 'neo-fenton', title: 'Fenton growth' },
    { id: 'neo-vaccination-calendar', title: 'Календарь вакцинации' },
  ],
  info: `### Левотироксин у новорождённых (Congenital Hypothyroidism)

L-thyroxine (T4) replacement для CH — детектируется newborn screening.
**Treatment timing CRITICAL** для normal neurodev outcomes.

### Дозы (initial)

| Group | Доза |
|---|---|
| **Term newborn** | **10-15 мкг/кг/сут** PO |
| Preterm | 8-10 мкг/кг/сут PO |
| **Severe CH** (TSH > 100) | 12-17 мкг/кг/сут PO |
| Initial high (some protocols) | 50 мкг/сут общий term |

### Adjusted by age

| Age | Доза |
|---|---|
| 0-3 мес | 10-15 мкг/кг/сут |
| 3-6 мес | 8-10 мкг/кг/сут |
| 6-12 мес | 6-8 мкг/кг/сут |
| 1-5 лет | 5-6 мкг/кг/сут |
| > 5 лет | adult-style по weight + age |

### Treatment timing

⚠️ **START в первые 2 нед жизни:**
- Each week delay = ~ 1 IQ point loss
- Optimal: < 2 нед — normal IQ
- Late (> 6 нед): IQ 80-90
- Very late (> 3 мес): IQ < 70 у severe CH

### Goals

| Parameter | Target |
|---|---|
| **TSH** | < 5 mU/L (target 0.5-2) |
| **Free T4** | upper half normal range (1.4-2.3 нг/дл) |
| **Total T4** | upper half normal |

### Newborn screening interpretation

| Result | Action |
|---|---|
| TSH < 20 mU/L | Normal |
| TSH 20-50 | Repeat in 1-2 нед |
| TSH > 50 | High suspicion CH — serum confirmation + start treatment |
| TSH > 100 | Severe CH — high-dose initial |

### Confirmation labs

- **Serum TSH + free T4 + total T4**
- **Thyroid scan** (technetium-99m or I-123): aplasia, dysgenesis, ectopic, hyperplasia, dyshormonogenesis
- **Thyroid antibodies** (rule out maternal-mediated)
- **Maternal thyroid status**

### Etiology

| Type | Frequency |
|---|---|
| **Aplasia / dysgenesis** | 80-85 % (permanent) |
| **Dyshormonogenesis** | 10-15 % (permanent) |
| **Transient (maternal Ab, iodine, drugs)** | 10-20 % of NBS positives |
| **Central (pituitary)** | < 5 % |

### Administration

#### Best practices:
- **Empty stomach** (30 мин до feeds или 1 ч после)
- **Crushed tablet** в 1-2 мл water или breast milk, syringe oral
- **NOT в formula directly** (iron, soy, calcium ↓ absorption 30-50 %)

#### Tablets:
- 25, 50, 75, 88, 100, 112, 125, 150, 175, 200 мкг
- IV form (Synthroid IV): 50-75 % of oral dose

### Monitoring

| Phase | Frequency |
|---|---|
| Initial 1-3 мес | q2-4 нед |
| 3-12 мес | q1-3 мес |
| 1-2 года | q3-6 мес |
| > 2 лет | q6-12 мес |

#### What to monitor:
- TSH + free T4
- Growth (height/weight)
- Neurodev assessment
- **Bone age annual** (overzealous → advanced)

### Drug interactions

| Drug | Effect |
|---|---|
| **Iron** | ↓ absorption — separate by 4 ч |
| **Soy formula** | ↓ absorption |
| **Calcium** | ↓ absorption |
| **Phenobarbital** | ↑ metabolism — ↑ dose |
| **Phenytoin** | ↑ metabolism |
| **Rifampin** | ↑ metabolism |

### Adjustment

| Status | Action |
|---|---|
| TSH > 5 mU/L | ↑ dose 12.5-25 мкг |
| TSH 0.5-5 + free T4 normal | Continue |
| TSH < 0.4 mU/L | ↓ dose 12.5-25 мкг |
| Free T4 high + low TSH | ↓ dose 25 мкг |

Re-check 4 нед после adjustment.

### Side effects

#### Overdose (hyperthyroid):
- Тахикардия, irritability
- Sweating, heat intolerance
- Poor sleep
- Weight loss
- **Advanced bone age** (long-term)
- Craniosynostosis (severe overdose)

#### Underdose (hypothyroid):
- Lethargy, sleep ↑
- Constipation
- Bradycardia
- Cold intolerance
- **Growth failure**
- **Developmental delay** (irreversible если sustained)

### Trial off therapy

Transient hypothyroidism (10-20 % of NBS positives):
- **At 3 years age** (после critical neurodev period)
- Stop levothyroxine × 4-6 нед
- Recheck TSH + free T4
- If normal: confirm transient
- If abnormal: resume therapy lifelong

### Источники

- AAP/ESPGHAN 2014 (Pediatrics 134:e1135)
- Léger J et al. ESPE/PES 2014 JCEM 99:363
- American Thyroid Association 2014
- Hanukoglu A et al. 2003 — IQ outcomes by treatment timing
- КР МЗ РФ "Врождённый гипотиреоз" (2024)
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
`,
};

export default runner;
