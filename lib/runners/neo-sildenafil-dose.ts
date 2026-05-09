/**
 * Runner: neo-sildenafil-dose — Силденафил (PPHN, PO/IV alternative iNO)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * PDE5 inhibitor — selective pulmonary vasodilator. Альтернатива/adjunct
 * к iNO для PPHN. Также для weaning iNO (silденафил sustains effect).
 *
 * Дозы:
 *   PO: 0.5-3 мг/кг q6-8h (start 0.5; titrate up)
 *   IV: 0.4 мг/кг loading × 3 ч + 1.6 мг/кг/сут continuous (LOAD-SUSTAIN protocol)
 *
 * Показания:
 *   - PPHN — alternative или adjunct к iNO (при non-availability)
 *   - Weaning iNO — minimizes rebound PHN
 *   - BPD-associated pulmonary hypertension (chronic use)
 *   - CHD-related pulmonary hypertension (post-Glenn, post-Fontan)
 *
 * SOURCES:
 *   - Baquero H et al. Pediatrics 2006 — sildenafil PPHN trial
 *   - Steinhorn RH et al. — neonatal sildenafil
 *   - Khorana AA et al. (LOAD-SUSTAIN trial)
 *   - AAP COFN — pediatric pulmonary hypertension
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Персистирующая лёгочная гипертензия" (2024)
 *
 * NB: STARTS-1 trial (children, sildenafil monotherapy) — повышенная mortality
 * у длительной high-dose use; FDA black box у дeтей (но not specifically newborn).
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Pediatrics 2006 / NeoFax / AAP)',
  reference: 'Baquero H Pediatrics 2006. Steinhorn RH neonatal sildenafil. AAP COFN. NeoFax.',
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
        { value: 'po_low', label: 'PO 0.5 мг/кг q6h (start)' },
        { value: 'po_med', label: 'PO 1 мг/кг q6h (стандарт)' },
        { value: 'po_high', label: 'PO 2 мг/кг q6h (high)' },
        { value: 'po_max', label: 'PO 3 мг/кг q6h (max)' },
        { value: 'iv_load', label: 'IV loading 0.4 мг/кг × 3 ч' },
        { value: 'iv_inf', label: 'IV maintenance 1.6 мг/кг/сут (=0.067 мг/кг/ч)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'po_med');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type SildMode = { perKg: number; isInfusion: boolean; route: string; freq: string; label: string };
    const modes: Record<string, SildMode> = {
      po_low: { perKg: 0.5, isInfusion: false, route: 'PO через зонд', freq: 'q6h', label: 'PO low (start)' },
      po_med: { perKg: 1, isInfusion: false, route: 'PO через зонд', freq: 'q6h', label: 'PO standard' },
      po_high: { perKg: 2, isInfusion: false, route: 'PO через зонд', freq: 'q6h', label: 'PO high' },
      po_max: { perKg: 3, isInfusion: false, route: 'PO через зонд', freq: 'q6h', label: 'PO max' },
      iv_load: { perKg: 0.4, isInfusion: false, route: 'IV slow infusion 3 ч', freq: 'однократно', label: 'IV loading' },
      iv_inf: { perKg: 0.067, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'IV continuous' },
    };
    const m = modes[mode] ?? modes.po_med;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    // PO suspension 1 мг/мл (compound by pharmacy); IV 0.8 мг/мл (1 мг + 1.25 мл NS)
    const conc = mode.startsWith('iv') ? 0.8 : 1;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Силденафил: ${total.toFixed(2)} мг${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ ${conc} мг/мл (${mode.startsWith('iv') ? 'IV' : 'PO suspension'})`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (mode.startsWith('po')) {
      actions.push('--- PO administration ---');
      actions.push('Onset: 30-60 мин; peak 1-2 ч; t½ 4-6 ч у н/р');
      actions.push('Compounded suspension 1 мг/мл (pharmacy)');
      actions.push('Bioavailability ~ 40-50 % у н/р (variable)');
      actions.push('Меньше эффект чем IV — use для chronic / wean');
    } else if (mode === 'iv_load') {
      actions.push('--- IV loading ---');
      actions.push('Onset: 5-15 мин IV; peak 30 мин');
      actions.push('LOAD-SUSTAIN protocol (Khorana): 0.4 мг/кг × 3 ч loading + 1.6 мг/кг/сут maintenance');
      actions.push('После loading: continuous infusion 0.067 мг/кг/ч');
    } else if (mode === 'iv_inf') {
      actions.push('--- IV continuous ---');
      actions.push('Continuous: stable level — best для acute PPHN');
      actions.push('После initial loading или standalone start');
    }

    actions.push('--- Когда использовать ---');
    actions.push('PPHN — first-line iNO; sildenafil — alternative или adjunct');
    actions.push('iNO weaning — sildenafil sustains pulmonary vasodilation effect');
    actions.push('BPD-associated PHN — chronic PO');
    actions.push('CHD-related PHN — post-cardiac surgery');
    actions.push('LMIC settings — alternative iNO (cheaper)');

    actions.push('--- Combination strategies ---');
    actions.push('iNO + sildenafil: synergistic (LOAD-SUSTAIN)');
    actions.push('Sildenafil + milrinone: PPHN + RV failure (off-label)');
    actions.push('Sildenafil + bosentan: PPHN refractory (controversial у н/р)');

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: ЧСС, АД (systemic hypotension possible), SpO₂');
    actions.push('Echocardiography q24h: PVR, RV function');
    actions.push('Газы крови q4-6h при titration');
    actions.push('Liver function q1-2 нед при chronic use');

    actions.push('--- Side effects ---');
    actions.push('Systemic hypotension (vasodilation effect)');
    actions.push('Тахикардия');
    actions.push('GI: diarrhea, feeding intolerance');
    actions.push('Visual: nystagmus, retinal blue-green discoloration (rare у н/р)');
    actions.push('Hepatic enzyme elevation (long-term)');
    actions.push('STARTS-1 trial: высокая mortality у chronic high-dose у дeтей; FDA black box');

    actions.push('--- ⚠️ Каutions ---');
    actions.push('STARTS-1 (Barst 2012): ↑ mortality у adolescents с chronic high-dose');
    actions.push('У neonates short-term use — generally safe (limited data)');
    actions.push('Avoid concomitant нитроглицерин / nitrates (severe hypotension)');
    actions.push('CYP3A4 inhibitors (fluconazole, erythromycin) — increase sildenafil levels');

    return {
      value: total.toFixed(2),
      unit: `мг${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(2)} мг${m.isInfusion ? '/ч' : ''}.`,
      actions,
    };
  },
  caveats: [
    'Sildenafil — alternative/adjunct iNO для PPHN, особенно при non-availability iNO',
    'iNO weaning: sildenafil PO sustains pulmonary vasodilation после iNO discontinuation',
    'Baquero 2006 trial: sildenafil снижает mortality у newborns с PPHN в LMIC settings',
    'STARTS-1 (Barst 2012): caution у chronic high-dose у дeтей; FDA black box у adolescents',
    'У н/р short-term use generally safe (limited evidence base)',
    'Bioavailability PO ~ 40-50 % у н/р (variable); IV preferred для acute',
    'CYP3A4 inhibitors (fluconazole, erythromycin) — increase sildenafil levels',
    'Avoid concomitant nitroglycerin / nitrates — severe synergistic hypotension',
    'Combination iNO + sildenafil — LOAD-SUSTAIN protocol (Khorana)',
    'У BPD-associated PHN: chronic PO sildenafil — long-term echo monitoring обязателен',
    'PDE5 inhibitor — also affects retinal PDE6 (visual disturbances у adults rare у н/р)',
  ],
  related: [
    { id: 'neo-ino-dose', title: 'iNO' },
    { id: 'neo-milrinone-dose', title: 'Милринон' },
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
  ],
  info: `### Силденафил у новорождённых

PDE5 inhibitor — selective pulmonary vasodilator. Альтернатива/adjunct
к iNO для PPHN; также для chronic BPD-PHN.

### Дозы

#### PO
| Уровень | Доза |
|---|---|
| Low (start) | 0.5 мг/кг q6h |
| **Standard** | **1 мг/кг q6h** |
| High | 2 мг/кг q6h |
| Max | 3 мг/кг q6h |

#### IV (LOAD-SUSTAIN protocol)
| Phase | Доза |
|---|---|
| Loading | 0.4 мг/кг × 3 ч |
| Maintenance | 1.6 мг/кг/сут (= 0.067 мг/кг/ч) |

### Показания

- **PPHN** — alternative/adjunct iNO
- **iNO weaning** — sustains effect
- **BPD-associated PHN** — chronic PO
- **CHD-related PHN** — post-cardiac surgery
- **LMIC** — alternative iNO (cheaper)

### Combination strategies

| Combo | Indication |
|---|---|
| iNO + sildenafil | Synergistic (LOAD-SUSTAIN) |
| iNO wean + sildenafil | Bridge after iNO |
| Sildenafil + milrinone | PPHN + RV failure |
| Sildenafil + bosentan | Refractory PHN (off-label) |

### Onset / kinetics

| Route | Onset | Peak | Duration | t½ |
|---|---|---|---|---|
| PO | 30-60 мин | 1-2 ч | 4-6 ч | 4-6 ч (н/р) |
| IV | 5-15 мин | 30 мин | 3-4 ч | 3 ч |

Bioavailability PO ~ 40-50 % у н/р (variable).

### Trials

#### Baquero 2006 Pediatrics
- Sildenafil PO у newborns с PPHN в LMIC
- ↓ Mortality vs control
- → Alternative when iNO not available

#### STARTS-1 (Barst 2012)
- Children with PHN, sildenafil monotherapy chronic high-dose
- **↑ Mortality** у high-dose long-term
- → FDA black box у adolescents
- У н/р short-term — generally safe

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Systemic hypotension | + (vasodilation) | Volume, vasopressors |
| Тахикардия | + | Heart rate monitoring |
| GI symptoms | + | Reduce dose if severe |
| Visual disturbances | rare у н/р | — |
| Hepatic enzyme ↑ | chronic | Monitor LFTs |
| Long-term concerns | dose-dependent | Avoid chronic high-dose |

### Drug interactions

| Drug | Effect |
|---|---|
| **Nitrates / nitroglycerin** | ⚠️ Severe synergistic hypotension |
| **CYP3A4 inhibitors** (fluconazole, erythromycin) | ↑ sildenafil levels |
| **Riociguat** | Avoid combination |
| **α-blockers** | Increased hypotension risk |

### Источники

- Baquero H et al. Pediatrics 2006 — PPHN trial
- Steinhorn RH et al. — neonatal sildenafil reviews
- Khorana AA et al. LOAD-SUSTAIN trial
- Barst RJ et al. STARTS-1 (children chronic)
- AAP COFN — pediatric pulmonary hypertension
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "Персистирующая лёгочная гипертензия" (2024)
`,
};

export default runner;
