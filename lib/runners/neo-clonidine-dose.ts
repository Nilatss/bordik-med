/**
 * Runner: neo-clonidine-dose — Клонидин (NAS adjunct + sedation)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * α2-агонист — adjunct в NAS treatment + sedation у мechанически
 * вентилируемых.
 *
 * Дозы:
 *   NAS adjunct PO: 0.5-1 мкг/кг q3-4h (max 5 мкг/кг q3h)
 *   IV continuous (sedation): 0.5-2 мкг/кг/ч continuous
 *   IV bolus (rare): 1-3 мкг/кг IV slow push
 *
 * Применение:
 *   - NAS adjunct когда morphine alone insufficient (autonomic sympotms)
 *   - Sedation на ИВЛ (sparing opioids)
 *   - Pre-medication для процедур (sedation + сyмpathol effect)
 *   - Withdrawal от opioid infusion (tapering)
 *
 * SOURCES:
 *   - Hudak ML, Tan RC. AAP NAS Pediatrics 2012
 *   - Agthe AG et al. Pediatrics 2009 — clonidine in NAS
 *   - NeoFax / Neonatal Formulary 9 ed
 *   - Cochrane α2-agonists for NAS 2018
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NeoFax) · РФ',
  reference: 'Hudak/Tan AAP NAS 2012. Agthe Pediatrics 2009. Cochrane 2018.',
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
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'nas_low', label: 'NAS adjunct PO 0.5 мкг/кг q4h' },
        { value: 'nas_med', label: 'NAS adjunct PO 1 мкг/кг q3-4h' },
        { value: 'nas_high', label: 'NAS adjunct PO 2 мкг/кг q3h (severe)' },
        { value: 'inf_low', label: 'Sedation infusion 0.5 мкг/кг/ч' },
        { value: 'inf_med', label: 'Sedation infusion 1 мкг/кг/ч' },
        { value: 'inf_high', label: 'Sedation infusion 2 мкг/кг/ч' },
        { value: 'iv_bolus', label: 'IV bolus 1 мкг/кг slow push (procedure)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'nas_med');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type ClonMode = { perKg: number; freq: string; route: string; isInfusion: boolean; label: string };
    const modes: Record<string, ClonMode> = {
      nas_low: { perKg: 0.5, freq: 'q4h', route: 'PO через зонд', isInfusion: false, label: 'NAS PO low' },
      nas_med: { perKg: 1, freq: 'q3-4h', route: 'PO через зонд', isInfusion: false, label: 'NAS PO standard' },
      nas_high: { perKg: 2, freq: 'q3h', route: 'PO через зонд', isInfusion: false, label: 'NAS PO severe' },
      inf_low: { perKg: 0.5, freq: '/ч', route: 'IV continuous', isInfusion: true, label: 'Sedation infusion low' },
      inf_med: { perKg: 1, freq: '/ч', route: 'IV continuous', isInfusion: true, label: 'Sedation infusion standard' },
      inf_high: { perKg: 2, freq: '/ч', route: 'IV continuous', isInfusion: true, label: 'Sedation infusion high' },
      iv_bolus: { perKg: 1, freq: 'однократно', route: 'IV slow push 5 мин', isInfusion: false, label: 'IV bolus' },
    };
    const m = modes[mode] ?? modes.nas_med;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    // PO 100 мкг/мл; IV diluted to 5 мкг/мл
    const conc = mode.startsWith('inf') || mode.startsWith('iv') ? 5 : 100;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Клонидин: ${total.toFixed(1)} мкг${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ ${conc} мкг/мл`);
    actions.push(`Доза: ${m.perKg} мкг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (mode.startsWith('nas')) {
      actions.push('--- NAS adjunct ---');
      actions.push('Combine с morphine 0.04-0.08 мг/кг q3-4h');
      actions.push('Особенно эффективен для автономной симптоматики (potность, тахикардия, гипертензия)');
      actions.push('Tapering: ↓ 10-20 % q24h после 48 ч stable mFNAS < 8');
      actions.push('Может быть полезен у polysubstance withdrawal (alcohol, benzo, opioid)');
    } else if (m.isInfusion) {
      actions.push('--- Sedation infusion ---');
      actions.push('Onset: 30-60 мин continuous; peak 90-120 мин');
      actions.push('Opioid-sparing effect — может ↓ опиоидную потребность 30-50 %');
      actions.push('Combine с morphine/fentanyl или standalone');
      actions.push('При weaning от opioid infusion: использовать как bridge');
    } else {
      actions.push('--- IV bolus ---');
      actions.push('Pre-procedure sedation; не routine для acute analgesia');
      actions.push('Onset IV: 15-30 мин; peak 45-90 мин');
    }

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: ЧСС (bradycardia possible), АД (hypotension), SpO₂');
    actions.push('Sedation level: COMFORT-neo, RASS, Ramsay');
    actions.push('mFNAS / Finnegan если NAS use');

    actions.push('--- Side effects ---');
    actions.push('Bradycardia (α2 → vagal effect) — особенно начинающее dose');
    actions.push('Hypotension (sympatholysis) — caution у unstable patients');
    actions.push('Sedation, respiratory depression (rare у н/р clinical doses)');
    actions.push('Withdrawal при abrupt discontinuation (rebound гипертензия) — taper');
    actions.push('Dry mouth, xerostomia');

    actions.push('--- Antagonist / Reversal ---');
    actions.push('Atipamezole 0.05 мг/кг IV (α2 antagonist) — partial reversal');
    actions.push('Fluid bolus + atropine при significant bradycardia/hypotension');

    return {
      value: total.toFixed(1),
      unit: `мкг${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: `${m.label}`,
      color: '#8B5CF6',
      details: `${m.perKg} мкг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(1)} мкг${m.isInfusion ? '/ч' : ''}.`,
      actions,
    };
  },
  caveats: [
    'Clonidine NAS adjunct — preferred over phenobarbital у opioid-only NAS (Hudak/Tan AAP 2012)',
    'Agthe 2009 trial: clonidine + morphine vs morphine alone — снижает hospitalization length 27 %',
    'Polysubstance withdrawal (alcohol, benzo, opioid) — clonidine particularly useful',
    'Bradycardia / hypotension у preterm — start lower dose, monitor closely',
    'Withdrawal: rebound hypertension при abrupt stop > 7 дней usage — taper 10-20 % q24h',
    'Sedation level — может быть deeper чем expected, особенно с co-medications',
    'Не классический analgesic — не replaces opioids для pain; sedative + autonomic stabilizer',
    'IV concentration — НЕ та же что oral (100 vs 5 мкг/мл) — ошибки dosing',
    'NeoFax recommends clonidine для NAS, особенно при insufficient response к morphine alone',
    'У кардиохирургических patients: useful для post-op sedation (opioid-sparing)',
  ],
  related: [
    { id: 'neo-finnegan', title: 'Modified Finnegan (NAS)' },
    { id: 'neo-morphine-dose', title: 'Морфин н/р' },
    { id: 'neo-fentanyl-dose', title: 'Фентанил н/р' },
    { id: 'neo-phenobarbital-dose', title: 'Фенобарбитал' },
  ],
  info: `### Клонидин у новорождённых

α2-агонист — adjunct в NAS treatment + opioid-sparing sedation у н/р.

### Дозы

#### NAS adjunct PO
| Уровень | Доза |
|---|---|
| Low | 0.5 мкг/кг q4h |
| **Standard** | **1 мкг/кг q3-4h** |
| Severe | 2 мкг/кг q3h |

#### Sedation infusion
| Уровень | Доза |
|---|---|
| Low | 0.5 мкг/кг/ч |
| Standard | 1 мкг/кг/ч |
| High | 2 мкг/кг/ч |

#### IV bolus
- 1 мкг/кг IV slow push 5 мин (rarely)

### NAS combination (Hudak/Tan AAP 2012)

#### Standard regime:
1. **Morphine** 0.04-0.08 мг/кг q3-4h PO
2. **Clonidine** 1 мкг/кг q3-4h PO (adjunct когда mFNAS not improving)
3. **Phenobarbital** 5 мг/кг q12h PO (polysubstance / non-opioid component)

#### Tapering after stable mFNAS < 8 × 48 ч:
- Morphine first: ↓ 10 % q24h
- Clonidine continued during morphine taper
- Clonidine taper последним: ↓ 10-20 % q24h

### Когда clonidine более polezen morphine alone

- **Autonomic sympotms** dominant (тахикардия, гипертензия, потность)
- **Polysubstance withdrawal** (alcohol, benzo, opioid)
- **Refractory** к morphine escalation
- **Long-term sedation** на ИВЛ (opioid-sparing)

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Bradycardia | + (start) | Atropine, fluid |
| Hypotension | + | Volume bolus |
| Sedation | expected | Wean if too deep |
| Rebound hypertension | abrupt stop > 7 d | Taper |
| Xerostomia | rare у н/р | — |

### Reversal

- **Atipamezole 0.05 мг/кг IV** (α2 antagonist) — partial
- **Fluid + atropine** для bradycardia/hypotension

### Источники

- Hudak ML, Tan RC. AAP NAS Pediatrics 2012;129:e540
- Agthe AG et al. Pediatrics 2009;123:e849 (clonidine in NAS)
- NeoFax / Neonatal Formulary 9 ed
- BNFc
- Cochrane α2-agonists for NAS 2018
`,
};

export default runner;
