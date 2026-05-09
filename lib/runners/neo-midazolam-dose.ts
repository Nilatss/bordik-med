/**
 * Runner: neo-midazolam-dose — Мидазолам (sedation + refractory seizures)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Benzodiazepine — для sedation у механически вентилируемых, procedural
 * sedation, refractory seizures.
 *
 * NB: Не первый choice anticonvulsant (после phenobarb / lev). Используется
 * при refractory status epilepticus.
 *
 * Дозы:
 *   Sedation IV bolus: 0.05-0.15 мг/кг q1-4h prn (max 0.2 мг/кг)
 *   Continuous infusion: 0.06-0.4 мг/кг/ч (range 1-7 мкг/кг/мин)
 *   Refractory seizures: bolus 0.05-0.15 мг/кг + infusion 0.06-1 мг/кг/ч
 *   Procedural sedation IM/intranasal: 0.1-0.3 мг/кг
 *
 * SOURCES:
 *   - AAP CFN 2016 — Pain Assessment & Management
 *   - Anand KJS et al. — sedation in NICU
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - WHO Guidelines on Neonatal Seizures 2011
 *   - NeoSEIZURE trial Painter 1999
 *   - КР МЗ РФ "Боль и седация" / "Судороги" (2024)
 *
 * Caveat: associated с adverse neurodev outcomes у preterm (Anand 2004 trial)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP CFN / WHO 2011 / NeoFax)',
  reference: 'AAP CFN 2016. Anand KJS NICU sedation. NeoFax. WHO 2011. NeoSEIZURE Painter 1999.',
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
        { value: 'sed_bolus_low', label: 'Sedation bolus 0.05 мг/кг IV' },
        { value: 'sed_bolus_med', label: 'Sedation bolus 0.1 мг/кг IV (стандарт)' },
        { value: 'sed_bolus_high', label: 'Sedation bolus 0.15 мг/кг IV' },
        { value: 'inf_low', label: 'Infusion 0.06 мг/кг/ч (1 мкг/кг/мин)' },
        { value: 'inf_med', label: 'Infusion 0.12 мг/кг/ч (2 мкг/кг/мин)' },
        { value: 'inf_high', label: 'Infusion 0.24 мг/кг/ч (4 мкг/кг/мин)' },
        { value: 'inf_max', label: 'Infusion 0.4 мг/кг/ч (refractory)' },
        { value: 'in_proc', label: 'Intranasal 0.2 мг/кг (procedure)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'sed_bolus_med');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type MidaMode = { perKg: number; isInfusion: boolean; route: string; freq: string; label: string };
    const modes: Record<string, MidaMode> = {
      sed_bolus_low: { perKg: 0.05, isInfusion: false, route: 'IV slow push 1-2 мин', freq: 'q1-4h prn', label: 'Sedation bolus low' },
      sed_bolus_med: { perKg: 0.1, isInfusion: false, route: 'IV slow push 1-2 мин', freq: 'q1-4h prn', label: 'Sedation bolus standard' },
      sed_bolus_high: { perKg: 0.15, isInfusion: false, route: 'IV slow push 1-2 мин', freq: 'q1-4h prn', label: 'Sedation bolus high' },
      inf_low: { perKg: 0.06, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'Infusion low (1 мкг/кг/мин)' },
      inf_med: { perKg: 0.12, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'Infusion medium (2 мкг/кг/мин)' },
      inf_high: { perKg: 0.24, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'Infusion high (4 мкг/кг/мин)' },
      inf_max: { perKg: 0.4, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'Infusion max (refractory)' },
      in_proc: { perKg: 0.2, isInfusion: false, route: 'Intranasal (atomized)', freq: 'однократно', label: 'Intranasal procedure' },
    };
    const m = modes[mode] ?? modes.sed_bolus_med;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    // Diluted to 1 мг/мл для NICU (5 мг/мл ампулы → 1:5 dilution)
    const conc = 1;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Мидазолам: ${total.toFixed(3)} мг${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ 1 мг/мл (diluted)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (m.isInfusion) {
      actions.push('--- Continuous infusion ---');
      actions.push('Onset: 5-10 мин; peak 30-60 мин; t½ 6-12 ч у н/р');
      actions.push('Steady state через 24-48 ч; tolerance после 5-7 дней');
      actions.push('Combine с opioids (morphine/fentanyl) для совместного эффекта');
      actions.push('Wean: ↓ 0.02 мг/кг/ч q6-12h после стабилизации; taper для prevent withdrawal');
    } else if (mode === 'in_proc') {
      actions.push('--- Intranasal sedation ---');
      actions.push('Onset: 5-10 мин; peak 30 мин; duration 1-2 ч');
      actions.push('Atomized device для лучшего absorption');
      actions.push('Procedure готовность через 15-20 мин');
      actions.push('Применение: short procedures (lumbar puncture, vascular access, отказ от интубации)');
    } else {
      actions.push('--- IV bolus ---');
      actions.push('Onset: 2-5 мин; peak 10-30 мин; duration 1-3 ч');
      actions.push('Slow push 1-2 мин (rapid → respiratory depression, hypotension)');
      actions.push('Procedural sedation: pre-procedure 5-10 мин');
    }

    actions.push('--- Refractory seizures ---');
    actions.push('Bolus 0.05-0.15 мг/кг IV → continuous 0.06-1 мг/кг/ч titrate');
    actions.push('После phenobarb 40 мг/кг loading + lev 60 мг/кг loading без response');
    actions.push('EEG monitoring continuous обязателен');
    actions.push('Wean per EEG (no seizures > 24 ч → start taper)');

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: SpO₂ (apnea risk), ЧСС, АД (hypotension)');
    actions.push('Готовность к ИВЛ — apnea возможна');
    actions.push('Sedation level: COMFORT-neo, RASS, Ramsay');
    actions.push('При infusion > 5-7 дней: tolerance assessment, daily sedation interruption');

    actions.push('--- Side effects ---');
    actions.push('Apnea / respiratory depression (особенно с opioids)');
    actions.push('Hypotension (особенно volume-depleted)');
    actions.push('Paradoxical agitation (rare у н/р, common у adult)');
    actions.push('Tolerance после 5-7 дней; withdrawal при abrupt stop');
    actions.push('Anand 2004 trial: midazolam в preterm → adverse neurodev outcomes; cautious use');
    actions.push('Myoclonus (high dose, rare)');

    actions.push('--- Antagonist ---');
    actions.push('Flumazenil 0.005-0.02 мг/кг IV (max 0.2 мг)');
    actions.push('Caution: reversal у dependent newborns → withdrawal seizures');
    actions.push('Short t½ flumazenil (40-80 мин) — repeat dosing может быть needed');

    return {
      value: total.toFixed(3),
      unit: `мг${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: m.label,
      color: '#8B5CF6',
      details: `${m.perKg} мг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(3)} мг${m.isInfusion ? '/ч' : ''}.`,
      actions,
    };
  },
  caveats: [
    'Anand 2004 trial: prophylactic midazolam в preterm → adverse neurodev outcomes — cautious use',
    'Não first-line anticonvulsant — после phenobarb / lev fails',
    'Tolerance после 5-7 дней — повышение dose / rotate to lorazepam (длиннее t½)',
    'Withdrawal при abrupt stop > 5 дней — taper 10-20 % q24h',
    'Combination с opioids (morphine/fentanyl) — synergistic, ↑ apnea risk',
    'Hypotension у unstable / volume-depleted — pre-treat volume before bolus',
    'Paradoxical agitation rare у н/р, but possible у preterm',
    'IV-PO bioavailability oral 30-50 %; не routine PO у н/р',
    'Intranasal — atomized для better absorption (раз 50 % bioavailability)',
    'Flumazenil 0.005-0.02 мг/кг IV antagonist; short t½ — может быть multiple doses',
  ],
  related: [
    { id: 'neo-fentanyl-dose', title: 'Фентанил н/р' },
    { id: 'neo-morphine-dose', title: 'Морфин н/р' },
    { id: 'neo-phenobarbital-dose', title: 'Фенобарбитал' },
    { id: 'neo-levetiracetam-dose', title: 'Леветирацетам' },
  ],
  info: `### Мидазолам у новорождённых

Benzodiazepine для sedation у механически вентилируемых, procedural
sedation, refractory seizures.

⚠️ **Anand 2004**: prophylactic midazolam у preterm → adverse neurodev
outcomes. **Cautious use**, не routine.

### Дозы

#### Sedation IV bolus
| Уровень | Доза |
|---|---|
| Low | 0.05 мг/кг q1-4h prn |
| **Standard** | **0.1 мг/кг q1-4h prn** |
| High | 0.15 мг/кг q1-4h prn |

#### Continuous infusion
| Уровень | Доза |
|---|---|
| Low | 0.06 мг/кг/ч (1 мкг/кг/мин) |
| Medium | 0.12 мг/кг/ч (2 мкг/кг/мин) |
| High | 0.24 мг/кг/ч (4 мкг/кг/мин) |
| Max | 0.4 мг/кг/ч (refractory) |

#### Intranasal procedure
- 0.2 мг/кг IN atomized

### Refractory seizures protocol

1. **Phenobarbital** 20 мг/кг IV (max 40 total)
2. **Levetiracetam** 60 мг/кг IV (если phenobarb fails)
3. **Midazolam:**
   - Bolus 0.05-0.15 мг/кг IV
   - Continuous 0.06-1 мг/кг/ч titrate
4. **Lidocaine** 2 мг/кг bolus + 7 мг/кг/ч (refractory only)
5. **EEG monitoring** continuous обязателен

### Anand 2004 trial caveats

- 67 ELBW newborns randomized
- Midazolam prophylactic vs placebo на ИВЛ
- **Worse neurodev outcomes** у midazolam group
- → Limit prophylactic use у preterm

### Onset / kinetics

| Route | Onset | Peak | Duration |
|---|---|---|---|
| IV bolus | 2-5 мин | 10-30 мин | 1-3 ч |
| IV infusion | 5-10 мин | 30-60 мин | continuous |
| IN | 5-10 мин | 30 мин | 1-2 ч |

t½ у н/р: 6-12 ч (vs 1.5-3 ч у adult)

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Apnea | + | ИВЛ ready |
| Hypotension | + | Volume, vasopressors |
| Tolerance | 5-7 d | Rotate or ↑ |
| Withdrawal | abrupt | Taper 10-20 % q24h |
| Paradoxical | rare у н/р | Switch agent |
| Myoclonus | high dose | Reduce |

### Antagonist

- **Flumazenil 0.005-0.02 мг/кг IV** (max 0.2 мг)
- Short t½ (40-80 мин) — repeat доses may be needed
- Caution: dependent newborns → withdrawal seizures

### Combination с opioids

| Combination | Effect | Caution |
|---|---|---|
| Mida + morphine | ↑ sedation + analgesia | ↑↑ apnea risk |
| Mida + fentanyl | quick sedation | acute hypotension |
| Mida + ketamine | balanced sedation | rare у н/р |

### Источники

- AAP CFN 2016 — Pain Assessment & Management
- Anand KJS NICU sedation studies
- Anand KJS et al. 2004 trial (preterm midazolam)
- NeoFax / Neonatal Formulary 9 ed
- WHO Neonatal Seizures 2011
- КР МЗ РФ "Боль и седация / Судороги" (2024)
`,
};

export default runner;
