/**
 * Runner: neo-levetiracetam-dose — Леветирацетам (anticonvulsant alternative)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Anticonvulsant — альтернатива/adjunct phenobarbital. SV2A binder.
 * Better side-effect profile, но lower seizure cessation rate (NeoLEV2 2020).
 *
 * Дозы:
 *   Loading: 40-60 мг/кг IV slow infusion 15-30 мин (могут до 100 мг/кг при refractory)
 *   Maintenance: 20-30 мг/кг q12h IV или PO
 *   Range total daily: 40-60 мг/кг/сут разделить q12h
 *
 * SOURCES:
 *   - Sharpe C et al. NeoLEV2 trial Pediatrics 2020;145:e20193182
 *   - Glass HC et al. JAMA Neurol 2017
 *   - WHO Guidelines on Neonatal Seizures 2011
 *   - NeoFax / Neonatal Formulary 9 ed
 *   - КР МЗ РФ "Судороги новорождённых" (2024)
 *
 * Therapeutic plasma level: 12-46 мг/л (target 30 мг/л)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NeoLEV2 / WHO 2011)',
  reference: 'Sharpe C NeoLEV2 Pediatrics 2020;145:e20193182. Glass HC JAMA Neurol 2017. WHO 2011.',
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
      id: 'phase',
      label: 'Phase',
      type: 'select',
      options: [
        { value: 'load_low', label: 'Loading low 40 мг/кг IV (15-30 мин)' },
        { value: 'load_med', label: 'Loading standard 60 мг/кг IV (15-30 мин)' },
        { value: 'load_high', label: 'Loading high 100 мг/кг IV (refractory, 30-60 мин)' },
        { value: 'maint_low', label: 'Maintenance 20 мг/кг q12h' },
        { value: 'maint_med', label: 'Maintenance 30 мг/кг q12h (стандарт)' },
        { value: 'maint_high', label: 'Maintenance 40 мг/кг q12h (refractory)' },
      ],
    },
    {
      id: 'route',
      label: 'Путь',
      type: 'select',
      options: [
        { value: 'iv', label: 'IV (vials 100 мг/мл)' },
        { value: 'po', label: 'PO (sirop 100 мг/мл)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const phase = String(values.phase ?? 'load_med');
    const route = String(values.route ?? 'iv');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type LevPhase = { perKg: number; freq: string; label: string };
    const phases: Record<string, LevPhase> = {
      load_low: { perKg: 40, freq: 'однократно', label: 'Loading low' },
      load_med: { perKg: 60, freq: 'однократно', label: 'Loading standard' },
      load_high: { perKg: 100, freq: 'однократно', label: 'Loading high (refractory)' },
      maint_low: { perKg: 20, freq: 'q12h', label: 'Maintenance low' },
      maint_med: { perKg: 30, freq: 'q12h', label: 'Maintenance standard' },
      maint_high: { perKg: 40, freq: 'q12h', label: 'Maintenance high' },
    };
    const p = phases[phase] ?? phases.load_med;
    if (!p) {
      return { value: '—', interpretation: 'Неизвестная phase', color: '#9CA3AF', details: '' };
    }
    const total = w * p.perKg;
    const conc = 100; // 100 мг/мл (стандарт vials и sirop)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Леветирацетам: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ 100 мг/мл`);
    actions.push(`Доза: ${p.perKg} мг/кг ${p.freq}`);
    actions.push(`Путь: ${route === 'iv' ? 'IV slow infusion 15-30 мин (loading) или 5 мин (maint)' : 'PO через зонд'}`);

    if (phase.startsWith('load')) {
      actions.push('--- Loading ---');
      actions.push('Onset действия: 30-60 мин IV (slower than phenobarb)');
      actions.push('Если seizures persist: пробовать второй loading или switch к phenobarb');
      actions.push('Maintenance: start через 12 ч после loading: 30 мг/кг q12h');
    } else {
      actions.push('--- Maintenance ---');
      actions.push('Onset: 30-60 мин IV; peak 1 ч; t½ 5-10 ч у н/р');
      actions.push('Steady state: ~ 24 ч у н/р');
      actions.push('IV-PO interchangeable 1:1 (oral bioavailability ~ 100 %)');
    }

    actions.push('--- Therapeutic Drug Monitoring ---');
    actions.push('Therapeutic level: 12-46 мг/л (target 30 мг/л)');
    actions.push('Toxicity rare; не routine TDM');
    actions.push('Renal-dependent clearance — adjust в renal failure');

    actions.push('--- Side effects ---');
    actions.push('Sedation, lethargy (мiniмal vs phenobarb)');
    actions.push('Behavioral irritability (rare у н/р)');
    actions.push('Тромбоцитопения rare');
    actions.push('Stevens-Johnson syndrome (very rare)');
    actions.push('Без significant respiratory depression — preferred у unstable patients');

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose, lactated Ringer');
    actions.push('Compatible с многими IV препаратами (less issue чем phenobarb)');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: p.label,
      color: '#8B5CF6',
      details: `${p.perKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг ${p.freq}.`,
      actions,
    };
  },
  caveats: [
    'NeoLEV2 trial (Sharpe 2020): lev 28-50 % seizure cessation vs phenobarb 80 %',
    'Despite lower efficacy, lev лучше side-effect profile (нет sedation, hypotension, hyperbili)',
    'Tendency перехода к lev first-line в некоторых centers (особенно Europe)',
    'WHO 2011 + many AAP guidelines: phenobarb остаётся first-line; lev second-line',
    'У cardiogenic instability / hyperbilirubinemia близкой к exchange: lev predпочитают',
    'IV-PO interchangeable 1:1 (oral bioavailability ~ 100 %) — упрощает дозирование',
    'Renal-dependent excretion: adjust в renal failure (Cr clearance < 50)',
    'Combination с phenobarb для refractory seizures возможна',
    'Therapeutic level 12-46 мг/л — не routine measure (similar к pediatric)',
    'Не interaction с major CYP enzymes — fewer drug-drug interactions',
  ],
  related: [
    { id: 'neo-phenobarbital-dose', title: 'Фенобарбитал' },
    { id: 'neo-fentanyl-dose', title: 'Фентанил' },
    { id: 'neo-hie-cooling', title: 'TH eligibility' },
    { id: 'thompson', title: 'Thompson / Sarnat' },
  ],
  info: `### Леветирацетам у новорождённых

SV2A binder — alternative anticonvulsant. Better side-effect profile,
но lower efficacy чем phenobarbital (NeoLEV2 trial 2020).

### Дозы

| Phase | Доза |
|---|---|
| **Loading low** | 40 мг/кг IV (15-30 мин) |
| **Loading standard** | **60 мг/кг IV** |
| **Loading high** | 100 мг/кг IV (refractory) |
| **Maintenance low** | 20 мг/кг q12h |
| **Maintenance standard** | **30 мг/кг q12h** |
| **Maintenance high** | 40 мг/кг q12h |

### NeoLEV2 trial (Sharpe 2020)

| Outcome | Lev | Phenobarb |
|---|---|---|
| **Seizure cessation** | 28-50 % | **80 %** |
| **Sedation** | minimal | + |
| **Hypotension** | rare | + |
| **Hyperbilirubinemia** | minimal | + |
| **Apnea** | rare | + |

→ Phenobarb остаётся first-line; lev second-line ИЛИ first-line при
specific concerns (hemodynamic instability, hyperbilirubinemia).

### IV-PO 1:1 interchange

Bioavailability oral ~ 100 % → одна и та же доза IV и PO. Easy to
switch при stabilization.

### PK у новорождённых

| Параметр | Term | Preterm | Adult |
|---|---|---|---|
| **t½** | 5-10 ч | 8-12 ч | 6-8 ч |
| **Bioavailability** | ~100 % | ~100 % | ~100 % |
| **Renal clearance** | major | major | major |

### Therapeutic level

- Target: 12-46 мг/л (some recommend 30 мг/л)
- TDM не routine — wide therapeutic window, rare toxicity

### Side effects (vs phenobarb)

| Effect | Lev | Phenobarb |
|---|---|---|
| Sedation | minimal | significant |
| Apnea | rare | + |
| Hypotension | rare | + |
| Behavioral changes | + (irritability) | + (sedation) |
| Hyperbilirubinemia | rare | + |
| Тромбоцитопения | rare | rare |
| Drug interactions | minimal | many (CYP induction) |

### Drug interactions

- **Minimal CYP enzyme effect** — few interactions
- **Renal:** other renal drugs may compete excretion
- **Anticoagulants:** no significant interaction

### Источники

- Sharpe C et al. NeoLEV2 Pediatrics 2020;145:e20193182
- Glass HC et al. JAMA Neurol 2017
- WHO Guidelines on Neonatal Seizures 2011
- NeoFax / Neonatal Formulary 9 ed
- BNFc
- КР МЗ РФ "Судороги новорождённых" (2024)
`,
};

export default runner;
