/**
 * Runner: neo-phenobarbital-dose — Фенобарбитал (anticonvulsant + NAS)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * First-line антиконвульсант для неонатальных судорог. Также используется
 * как adjunct при тяжёлой NAS-абстиненции (особенно при non-opioid
 * polysubstance withdrawal).
 *
 * Дозы:
 *   Anticonvulsant:
 *     Loading: 20 мг/кг IV slow infusion 15-20 мин
 *     If continued seizures: + 10 мг/кг q15-20 мин до total max 40 мг/кг
 *     Maintenance: 3-5 мг/кг q24h IV/PO
 *
 *   NAS adjunct (полисубстанция):
 *     Loading: 10-20 мг/кг IV/PO
 *     Maintenance: 5-10 мг/кг/сут разделить q12h PO
 *     Tapering: ↓ 10-20 % q24h после 24-48 ч stable
 *
 * Therapeutic plasma level: 15-40 мг/л
 * Toxicity: > 60 мг/л (sedation, апноэ, hypotension)
 *
 * SOURCES:
 *   - Glass HC et al. JAMA Neurol 2017 — phenobarbital vs levetiracetam
 *   - Sharpe C et al. Pediatrics 2020 — NeoLEV2 trial (lev = 1st line at some centers)
 *   - WHO Guidelines on Treatment of Neonatal Seizures 2011
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Судороги новорождённых" (2024)
 *   - Hudak ML, Tan RC. AAP NAS Pediatrics 2012
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO 2011 / NeoFax / AAP) · РФ',
  reference: 'Glass HC JAMA Neurol 2017. Sharpe C NeoLEV2 Pediatrics 2020. WHO 2011. КР МЗ РФ.',
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
      label: 'Режим / показание',
      type: 'select',
      options: [
        { value: 'load_seiz', label: 'Loading anticonvulsant 20 мг/кг IV' },
        { value: 'load_extra', label: 'Loading дополнительный 10 мг/кг (после 20)' },
        { value: 'maint_iv', label: 'Maintenance 5 мг/кг q24h IV' },
        { value: 'maint_po', label: 'Maintenance 5 мг/кг q24h PO' },
        { value: 'nas_load', label: 'NAS loading 15 мг/кг PO/IV' },
        { value: 'nas_maint', label: 'NAS maintenance 5 мг/кг q12h PO' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'load_seiz');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type PbMode = { perKg: number; route: string; freq: string; label: string };
    const modes: Record<string, PbMode> = {
      load_seiz: { perKg: 20, route: 'IV slow infusion 15-20 мин', freq: 'однократно', label: 'Loading anticonvulsant' },
      load_extra: { perKg: 10, route: 'IV slow infusion 10-15 мин', freq: 'q15-20 мин (max total 40 мг/кг)', label: 'Loading extra' },
      maint_iv: { perKg: 5, route: 'IV slow push 5 мин', freq: 'q24h', label: 'Maintenance IV' },
      maint_po: { perKg: 5, route: 'PO через зонд', freq: 'q24h', label: 'Maintenance PO' },
      nas_load: { perKg: 15, route: 'PO через зонд (или IV)', freq: 'однократно', label: 'NAS loading' },
      nas_maint: { perKg: 5, route: 'PO через зонд', freq: 'q12h', label: 'NAS maintenance' },
    };
    const m = modes[mode] ?? modes.load_seiz;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const conc = 65; // мг/мл стандартная concentration ампулы (200 мг/мл слишком concentrated for neo)
    // Diluted: 200 мг + 3 мл NS = ~50 мг/мл; используем 65 мг/мл as common diluted form
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Фенобарбитал: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл (diluted)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (mode === 'load_seiz') {
      actions.push('--- Anticonvulsant loading ---');
      actions.push('Onset действия: 5-15 мин IV');
      actions.push('При продолжении судорог через 15 мин: дополнительный 10 мг/кг');
      actions.push('Максимум total loading 40 мг/кг (20 + 10 + 10) за 1 ч');
      actions.push('Если seizures persist: switch / add к levetiracetam, midazolam, или fosphenytoin');
      actions.push('Maintenance: начать через 24 ч после loading: 3-5 мг/кг q24h');
    } else if (mode.startsWith('nas')) {
      actions.push('--- NAS adjunct ---');
      actions.push('Используется при polysubstance withdrawal или resistant к morphine alone');
      actions.push('Loading 15 мг/кг PO once → maintenance 5 мг/кг q12h');
      actions.push('Tapering: ↓ 10-20 % q24h после 24-48 ч stable mFNAS < 8');
      actions.push('NB: phenobarbital у NAS — controversial; обсудить с consultant');
      actions.push('Альтернатива: clonidine 1-2 мкг/кг q4-6h как adjunct');
    } else {
      actions.push('--- Maintenance ---');
      actions.push('Onset: 5-15 мин IV; peak 10-20 мин; t½ 90-100 ч у н/р (vs 60-80 у adult)');
      actions.push('Длительный t½ — может быть q24h dosing достаточно (или даже q48h)');
    }

    actions.push('--- Therapeutic Drug Monitoring ---');
    actions.push('Целевой level: 15-40 мг/л plasma');
    actions.push('Toxicity: > 60 мг/л (sedation, апноэ, hypotension)');
    actions.push('Первый level: через 2-3 часа после loading; затем перед next maintenance dose');
    actions.push('Steady state: 14-21 день у н/р (long t½)');

    actions.push('--- Side effects ---');
    actions.push('Sedation, lethargy (ожидаемое после loading)');
    actions.push('Апноэ (особенно при > 40 мг/кг loading) — готовность к ИВЛ');
    actions.push('Гипотензия (vasodilation, decreased contractility)');
    actions.push('Hyperbilirubinemia (induction enzyme → ускоренное conjugation, но displacement bilirubin от albumin)');
    actions.push('Cognitive concerns long-term (controversial при курсе > 6 мес у term)');
    actions.push('Hepatic enzyme induction (drug interactions с другими anticonvulsants, vitamin K)');

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose');
    actions.push('НЕСОВМЕСТИМО (in-line): hydrocortisone, hydromorphone, vancomycin, diazepam, levofloxacin');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: '#8B5CF6',
      details: `${m.perKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг ${m.freq}.`,
      actions,
    };
  },
  caveats: [
    'WHO 2011: фенобарбитал — first-line для неонатальных судорог',
    'NeoLEV2 trial (Sharpe 2020): levetiracetam НЕ inferior phenobarbital для seizure cessation, но ниже side-effect profile',
    'Tendency перехода к leviteracetam first-line в некоторых centers',
    'У ELBW < 1000 g: t½ удлинён (до 200 ч); reduce maintenance dose 50%',
    'Hepatic enzyme inducer: ↑ метаболизм theophylline, vitamin K (повышенный риск кровотечения), digoxin',
    'NAS adjunct: phenobarbital у polysubstance withdrawal или non-opioid; для opioid-only NAS — morphine first-line',
    'Hyperbilirubinemia: enzyme induction ускоряет conjugation, НО displacement albumin → caution возле exchange threshold',
    'Long-term cognitive concerns у survivors of seizures + chronic phenobarbital — обсудить с neurology',
    'Toxicity > 60 мг/л: severe sedation, apnea, hypotension — может потребовать ИВЛ + volume',
    'Tapering: для NAS tapering 10-20 % q24h; для chronic seizures — long taper 6-12 мес',
  ],
  related: [
    { id: 'neo-finnegan', title: 'Modified Finnegan (NAS)' },
    { id: 'neo-morphine-dose', title: 'Морфин н/р' },
    { id: 'neo-bili-2022', title: 'Bili-2022' },
    { id: 'neo-hie-cooling', title: 'TH eligibility' },
  ],
  info: `### Фенобарбитал у новорождённых

First-line антиконвульсант для неонатальных судорог. Также adjunct
для тяжёлой polysubstance NAS.

### Дозы

#### Anticonvulsant
| Phase | Доза | Note |
|---|---|---|
| **Loading** | 20 мг/кг IV slow 15-20 мин | First step |
| **Loading extra** | 10 мг/кг q15-20 мин | If seizures persist |
| **Max total loading** | 40 мг/кг (20+10+10) за 1 ч | Beyond → add lev/midazolam |
| **Maintenance** | 3-5 мг/кг q24h | Start 24 ч после loading |

#### NAS adjunct
| Phase | Доза |
|---|---|
| **Loading** | 15 мг/кг PO once |
| **Maintenance** | 5 мг/кг q12h PO |
| **Tapering** | ↓ 10-20 % q24h |

### Therapeutic Drug Monitoring

| Параметр | Цель |
|---|---|
| **Therapeutic level** | 15-40 мг/л |
| **Toxicity** | > 60 мг/л |
| **First level** | 2-3 ч после loading |
| **Steady state** | 14-21 день |

### PK у новорождённых

| Параметр | Term | Preterm | Adult |
|---|---|---|---|
| **Onset IV** | 5-15 мин | 5-15 мин | 5-15 мин |
| **t½** | 90-100 ч | 100-200 ч (ELBW) | 60-80 ч |
| **Vd** | 0.6-0.7 л/кг | 0.6-0.7 | 0.6 |

### Когда использовать

#### First-line (WHO 2011)
- Любой неонатальный seizure (clinical или EEG)
- 95 % control в 90 % случаев в loading dose

#### Switch / add (если фенобарбитал fails)
- **Levetiracetam** 40-60 мг/кг IV loading + 20-30 мг/кг q12h
- **Midazolam** 0.05-0.15 мг/кг IV bolus + 0.06-0.4 мг/кг/ч infusion
- **Fosphenytoin** 15-20 мг PE/кг IV (rarely в RU practice)
- **Lidocaine** 2 мг/кг IV bolus + 7 мг/кг/ч (refractory only)

### NeoLEV2 trial (Sharpe 2020 Pediatrics)

- Levetiracetam vs Phenobarbital у н/р seizures
- Phenobarbital выше efficacy (80 vs 28 % seizure cessation)
- Lev лучше side-effect profile
- → Phenobarbital остаётся first-line, особенно для tonic/clonic

### Сравнение vs Levetiracetam

| | Phenobarbital | Levetiracetam |
|---|---|---|
| **Efficacy** | 80 % | 28-50 % |
| **Onset** | 5-15 мин IV | 30-60 мин IV |
| **t½ (н/р)** | 90-200 ч | 5-10 ч |
| **Side effects** | sedation, apnea, hyperbili | minimal |
| **Cognitive concerns** | + | minimal |
| **Cost** | low | higher |
| **TDM** | + | not routine |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Sedation | expected | Wear off 24-48 ч |
| Apnea | при > 40 мг/кг | ИВЛ ready |
| Hypotension | + | Volume, vasopressors |
| Hyperbilirubinemia | enzyme | Caution возле exchange |
| Long-term cognitive | controversial | Discuss neurology |

### Совместимость

| Совместимо | Несовместимо |
|---|---|
| 0.9 % NaCl | Hydrocortisone |
| 5 % Glucose | Hydromorphone |
| Lactated Ringer | Vancomycin |
| Furosemide | Diazepam |

### Источники

- Glass HC et al. JAMA Neurol 2017 — phenobarbital vs lev
- Sharpe C et al. NeoLEV2 trial Pediatrics 2020
- WHO Guidelines on Neonatal Seizures 2011
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "Судороги новорождённых" (2024)
- Hudak ML, Tan RC. AAP NAS Pediatrics 2012
`,
};

export default runner;
