/**
 * Runner: neo-immunoglobulin-ivig-dose — IVIG (Intravenous Immunoglobulin)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Pooled human immunoglobulin для passive immunization. Использование
 * controversial у sepsis (multiple negative trials); main indications —
 * isoimmune hemolytic disease (HDN), neonatal alloimmune thrombocytopenia
 * (NAIT), congenital immunodeficiency.
 *
 * Дозы:
 *   HDN (Rh / ABO incompatibility, severe hyperbilirubinemia):
 *     0.5-1 г/кг IV slow infusion 2-4 ч (single dose ИЛИ q12h × 2)
 *
 *   NAIT (thrombocytopenia from maternal antibody):
 *     1 г/кг IV q24h × 1-3 doses
 *
 *   Congenital immunodeficiency (replacement therapy):
 *     400-600 мг/кг IV q3-4 нед
 *
 *   Sepsis adjunct (controversial — INIS trial negative):
 *     500 мг/кг q24h × 2 doses (не routine)
 *
 * SOURCES:
 *   - INIS trial Brocklehurst P et al. NEJM 2011;365:1201 — IVIG для sepsis NEGATIVE
 *   - AAP/AAP CFN 2014 — IVIG indications
 *   - Maisels MJ AAP CFN 2009 — IVIG для HDN (Pediatrics 124:1193)
 *   - КР МЗ РФ "Иммуноглобулин у н/р" (2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - Cochrane IVIG для NAIT 2017
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (INIS / AAP / Cochrane) · РФ',
  reference: 'INIS Brocklehurst NEJM 2011;365:1201. AAP CFN 2014. Maisels MJ Pediatrics 124:1193.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 5,
      step: 0.01,
    },
    {
      id: 'mode',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'hdn_low', label: 'HDN 0.5 г/кг IV (single dose)' },
        { value: 'hdn_high', label: 'HDN 1 г/кг IV (severe)' },
        { value: 'nait', label: 'NAIT 1 г/кг IV q24h × 1-3 doses' },
        { value: 'pid_low', label: 'PID 400 мг/кг IV q3-4 нед' },
        { value: 'pid_high', label: 'PID 600 мг/кг IV q3-4 нед' },
        { value: 'sepsis_adjunct', label: 'Sepsis adjunct 500 мг/кг (controversial)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'hdn_low');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type IvigMode = { perKg: number; freq: string; duration: string; label: string };
    const modes: Record<string, IvigMode> = {
      hdn_low: { perKg: 500, freq: 'однократно', duration: '1 dose', label: 'HDN low' },
      hdn_high: { perKg: 1000, freq: 'q12h при severe', duration: '1-2 doses', label: 'HDN severe' },
      nait: { perKg: 1000, freq: 'q24h', duration: '1-3 doses', label: 'NAIT' },
      pid_low: { perKg: 400, freq: 'q3-4 нед', duration: 'lifelong replacement', label: 'PID maintenance low' },
      pid_high: { perKg: 600, freq: 'q3-4 нед', duration: 'lifelong replacement', label: 'PID maintenance high' },
      sepsis_adjunct: { perKg: 500, freq: 'q24h', duration: '× 2 doses (controversial)', label: 'Sepsis adjunct (NOT routine)' },
    };
    const m = modes[mode] ?? modes.hdn_low;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const totalMg = w * m.perKg;
    const totalG = totalMg / 1000;
    // 5 % solution = 50 мг/мл
    const conc = 50;
    const vol = totalMg / conc;
    const infusionTime = Math.max(2, Math.ceil(totalMg / 500)); // ~ 1 ч per 500 мг

    const actions: string[] = [];
    actions.push(`IVIG: ${totalG.toFixed(2)} г = ${totalMg.toFixed(0)} мг = ${vol.toFixed(2)} мл @ 5 % (50 мг/мл)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Длительность: ${m.duration}`);
    actions.push(`Infusion time: ≥ ${infusionTime} ч (slow infusion для prevent reactions)`);

    if (mode.startsWith('hdn')) {
      actions.push('--- HDN (Rh/ABO incompatibility) ---');
      actions.push('Prevention need exchange transfusion при isoimmune hemolytic disease');
      actions.push('Maisels 2009: ↓ exchange transfusion need on intensive phototherapy');
      actions.push('Use если TSB rising rapidly (≥ 0.5 мг/дл/ч на ФТ) или approaching exchange threshold');
      actions.push('Single dose 0.5-1 г/кг IV; can repeat × 1 if needed');
      actions.push('Combination с intensive phototherapy');
    } else if (mode === 'nait') {
      actions.push('--- NAIT (Neonatal Alloimmune Thrombocytopenia) ---');
      actions.push('Thrombocytopenia from maternal antiplatelet antibodies (HPA-1a most common)');
      actions.push('Severe: platelets < 30 × 10⁹/л + bleeding');
      actions.push('Treatment: IVIG 1 г/кг q24h × 1-3 doses + platelet transfusion если active bleeding');
      actions.push('Compatible (HPA-1a negative) platelets preferred — emergency: random donor platelets');
      actions.push('Platelets recover usually 4-12 нед after birth');
    } else if (mode.startsWith('pid')) {
      actions.push('--- PID (Primary Immunodeficiency) replacement ---');
      actions.push('Indications: SCID, agammaglobulinemia, hyper-IgM, CVID диагнозы');
      actions.push('Goal: maintain trough IgG > 5 г/л');
      actions.push('Длительность: lifelong replacement therapy');
      actions.push('Q3-4 нед IV или weekly SC');
    } else if (mode === 'sepsis_adjunct') {
      actions.push('--- ⚠️ Sepsis adjunct (NOT recommended) ---');
      actions.push('INIS trial (Brocklehurst 2011 NEJM): IVIG в neonatal sepsis = NO benefit');
      actions.push('No mortality reduction, no morbidity benefit');
      actions.push('→ NOT routinely recommended');
      actions.push('Some specific situations (selected toxin-mediated, рare immune dysfunction) — discuss с specialist');
    }

    actions.push('--- ⚠️ Infusion reactions (monitoring) ---');
    actions.push('Vital signs: ЧСС, АД, RR, температура q15-30 мин first 2 ч');
    actions.push('Slow infusion начала: 0.5-1 мл/кг/ч × 30 мин');
    actions.push('Затем titrate up: 2-3 мл/кг/ч до infusion completion');
    actions.push('Если reactions (фебрилитет, urticaria, rigors): slow / stop / антигистамины');
    actions.push('Anaphylaxis rare: epinephrine 0.01 мг/кг IM ready');

    actions.push('--- Side effects ---');
    actions.push('Common: фебрилитет (10-20%), headache, rigors, urticaria');
    actions.push('Hypotension (volume + slow infusion)');
    actions.push('Renal: ОПН (rare у н/р, особенно с sucrose-stabilized formulations)');
    actions.push('Thrombosis (rare у н/р, more concerning у adults)');
    actions.push('Hemolysis (anti-A/B antibodies в IVIG продукт могут вызвать AB hemolysis)');
    actions.push('Aseptic meningitis (rare у н/р)');
    actions.push('IgA-deficient patients: severe anaphylactic reactions to IgA in product');

    return {
      value: totalG.toFixed(2),
      unit: `г (${vol.toFixed(2)} мл @ 5 %)`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг × ${w} кг = ${totalMg.toFixed(0)} мг = ${totalG.toFixed(2)} г IVIG IV slow infusion ≥ ${infusionTime} ч.`,
      actions,
    };
  },
  caveats: [
    'INIS trial (Brocklehurst 2011 NEJM 365:1201): IVIG в neonatal sepsis — NO benefit; не routine',
    'HDN (Rh/ABO incompatibility): IVIG 0.5-1 г/кг + intensive phototherapy ↓ exchange transfusion need',
    'NAIT: IVIG 1 г/кг q24h × 1-3 doses + compatible platelets; HPA-1a antibodies most common',
    'PID replacement: lifelong therapy 400-600 мг/кг q3-4 нед IV; goal IgG trough > 5 г/л',
    'Severe IgA deficiency: anaphylaxis risk — use IgA-depleted formulations or alternative therapies',
    'Slow infusion critical: start 0.5-1 мл/кг/ч × 30 мин, titrate up к 2-3 мл/кг/ч',
    'Side effects: фебрилитет 10-20%, headache, rigors, urticaria — slow или premedicate с антигистамин',
    'Renal toxicity rare у н/р, but more concerning с sucrose-stabilized formulations',
    'Hemolysis от anti-A/B antibodies в IVIG product — особенно с group A or B babies receiving large dose',
    'Aseptic meningitis (rare у н/р): headache, neck stiffness, photophobia 24-72 h post-infusion',
    'Cost ↑↑↑: $5,000-15,000 USD per course depending на dose',
    'Не replaces antibiotic therapy в sepsis — supportive role only когда indicated',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022' },
    { id: 'neo-exchange-volume', title: 'Double Volume Exchange' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
    { id: 'neo-nsofa', title: 'Neonatal SOFA' },
  ],
  info: `### IVIG (Intravenous Immunoglobulin) у новорождённых

Pooled human immunoglobulin для passive immunization.

⚠️ **Sepsis use NOT recommended** (INIS 2011 — no benefit).

### Дозы

| Indication | Доза | Frequency | Длительность |
|---|---|---|---|
| **HDN** (Rh/ABO) | 0.5-1 г/кг IV | single или q12h | 1-2 doses |
| **NAIT** | 1 г/кг IV | q24h | 1-3 doses |
| **PID replacement** | 400-600 мг/кг IV | q3-4 нед | lifelong |
| **Sepsis adjunct** | 500 мг/кг IV | q24h × 2 | NOT routine |

### Showings

#### Strong evidence:
1. **HDN** (Rh/ABO incompatibility) — Maisels AAP CFN 2009
   - Prevention exchange transfusion
   - Use if TSB rising ≥ 0.5 мг/дл/ч на intensive ФТ
   - Combination с phototherapy
2. **NAIT** (Neonatal Alloimmune Thrombocytopenia)
   - Maternal antiplatelet antibodies (HPA-1a most common)
   - Severe: platelets < 30 × 10⁹/л
   - + Compatible platelets transfusion если active bleeding
3. **PID** (Primary Immunodeficiency)
   - SCID, agammaglobulinemia, hyper-IgM, CVID
   - Goal: trough IgG > 5 г/л
   - Lifelong replacement

#### Weak / NOT recommended:
- **Neonatal sepsis** (INIS 2011 — no benefit, no mortality reduction)
- Toxin-mediated infections (specific cases)
- Other: discuss с specialist

### INIS trial (Brocklehurst 2011 NEJM 365:1201)

- 3,493 newborns с sepsis randomized
- IVIG vs placebo
- **No reduction in mortality**
- **No reduction in morbidity**
- → NOT routine recommendation

### HDN (Maisels AAP CFN 2009)

#### Indications:
- Rh / ABO incompatibility confirmed
- TSB rising rapidly (≥ 0.5 мг/дл/ч на intensive ФТ)
- TSB approaching exchange threshold

#### Mechanism:
- Block Fc receptors on macrophages → ↓ hemolysis
- ↓ Need для exchange transfusion

#### Dose:
- 0.5-1 г/кг IV slow infusion 2-4 ч
- Repeat × 1 если ongoing hemolysis

### NAIT (Neonatal Alloimmune Thrombocytopenia)

#### Pathophysiology:
- Maternal IgG anti-platelet antibodies (most commonly anti-HPA-1a)
- Cross placenta → destroy fetal platelets

#### Severity:
| Platelets | Severity |
|---|---|
| > 100 × 10⁹/л | Mild |
| 50-100 | Moderate |
| 30-50 | Severe |
| < 30 | Critical (intracranial hemorrhage risk) |

#### Treatment:
- **IVIG 1 г/кг q24h × 1-3 doses**
- **HPA-1a-negative compatible platelets** (or random donor если emergency)
- Recovery 4-12 нед after birth

### PID (Primary Immunodeficiency)

#### Common newborn presentations:
- **SCID** (severe combined immunodeficiency) — bubble baby
- **X-linked agammaglobulinemia**
- **Hyper-IgM syndrome**
- **CVID** (common variable)

#### Replacement:
- 400-600 мг/кг IV q3-4 нед
- Or weekly SC immunoglobulin
- Goal trough IgG > 5 г/л
- Lifelong

### Infusion guidelines

#### Rate:
- **Start: 0.5-1 мл/кг/ч × 30 мин**
- **Titrate up: 2-3 мл/кг/ч**
- **Maximum: 4 мл/кг/ч**
- Slower if reactions

#### Monitoring:
- Vital signs q15-30 мин first 2 ч
- Then q1h until completion

#### Premedication (если history reactions):
- Diphenhydramine 1 мг/кг IV
- Acetaminophen 10 мг/кг PO
- Hydrocortisone 1 мг/кг IV (severe history)

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Фебрилитет | 10-20 % | Slow rate, premedicate |
| Headache | + | Hydration |
| Hypotension | + | Slow rate, volume |
| Urticaria | + | Antihistamines |
| Renal toxicity | rare у н/р | Hydration; avoid sucrose-stabilized |
| Hemolysis | + | Monitor Hb (anti-A/B in product) |
| Aseptic meningitis | rare у н/р | 24-72 h post-infusion |
| Anaphylaxis | rare | Epinephrine ready (особенно IgA-deficient) |
| Thrombosis | rare у н/р | Adequate hydration |

### Cost considerations

- IVIG: $5,000-15,000 USD per course
- Sucrose-stabilized formulations: $$ but renal toxicity risk
- Sucrose-free: preferred у н/р + renal failure

### Источники

- Brocklehurst P et al. INIS trial NEJM 2011;365:1201
- AAP CFN 2014 — IVIG indications
- Maisels MJ AAP CFN 2009 (Pediatrics 124:1193)
- Cochrane IVIG для NAIT 2017
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Иммуноглобулин у н/р" (2024)
`,
};

export default runner;
