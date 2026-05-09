/**
 * Runner: neo-octreotide-dose — Октреотид (CHI KATP-resistant)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Synthetic somatostatin analog. Используется при KATP-channel-resistant
 * congenital hyperinsulinism (CHI) когда diazoxide fails.
 *
 * Дозы:
 *   Initial: 5 мкг/кг/сут SC разделить q6-8h (или continuous IV)
 *   Maintenance: 5-25 мкг/кг/сут SC разделить q6-8h (titrate)
 *   Maximum: 40 мкг/кг/сут (rarely needed)
 *
 *   Long-acting form (octreotide LAR): для chronic CHI 10-30 мг IM monthly
 *
 * Mechanism:
 *   Suppresses insulin secretion via somatostatin receptors на β-cells.
 *   Также effect на growth hormone, glucagon, gastrin, secretin.
 *
 * SOURCES:
 *   - Arnoux JB et al. — CHI management guidelines
 *   - Stanley CA et al. — CHI review (Pediatrics)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Гипогликемия / CHI" (2024)
 *
 * Indications:
 *   - Diazoxide-unresponsive CHI (~ 50 % of cases)
 *   - Bridge to surgery (partial pancreatectomy для focal CHI)
 *   - Long-term medical management diffuse CHI
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Arnoux / Stanley / NeoFax)',
  reference: 'Arnoux JB CHI management. Stanley CA Pediatrics review. NeoFax. КР МЗ РФ.',
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
        { value: 'init_low', label: 'Initial low 5 мкг/кг/сут SC (start)' },
        { value: 'init_med', label: 'Initial standard 10 мкг/кг/сут SC' },
        { value: 'maint_med', label: 'Maintenance 15 мкг/кг/сут SC' },
        { value: 'maint_high', label: 'Maintenance high 25 мкг/кг/сут SC' },
        { value: 'maint_max', label: 'Maintenance max 40 мкг/кг/сут (rare)' },
        { value: 'continuous', label: 'IV continuous infusion 0.2-0.7 мкг/кг/ч' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'init_low');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type OctreoMode = { perKg: number; isContinuous: boolean; route: string; freq: string; label: string };
    const modes: Record<string, OctreoMode> = {
      init_low: { perKg: 5, isContinuous: false, route: 'SC разделить', freq: 'q6-8h', label: 'Initial low' },
      init_med: { perKg: 10, isContinuous: false, route: 'SC разделить', freq: 'q6-8h', label: 'Initial standard' },
      maint_med: { perKg: 15, isContinuous: false, route: 'SC разделить', freq: 'q6-8h', label: 'Maintenance' },
      maint_high: { perKg: 25, isContinuous: false, route: 'SC разделить', freq: 'q6-8h', label: 'Maintenance high' },
      maint_max: { perKg: 40, isContinuous: false, route: 'SC разделить', freq: 'q6-8h', label: 'Maintenance max' },
      continuous: { perKg: 0.5, isContinuous: true, route: 'IV continuous', freq: '/ч', label: 'IV continuous' },
    };
    const m = modes[mode] ?? modes.init_low;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }

    if (m.isContinuous) {
      const microPerHour = w * m.perKg;
      const microPerMin = microPerHour / 60;
      // Conc: 50 мкг/мл standard
      const conc = 50;
      const mlPerHour = microPerHour / conc;

      const actions: string[] = [];
      actions.push(`Октреотид: ${microPerHour.toFixed(2)} мкг/ч = ${microPerMin.toFixed(3)} мкг/мин`);
      actions.push(`Скорость инфузии: ${mlPerHour.toFixed(3)} мл/ч @ ${conc} мкг/мл`);
      actions.push(`Доза: ${m.perKg} мкг/кг/ч continuous`);
      actions.push('IV continuous: для acute / unstable CHI; transition к SC после stabilization');

      return {
        value: microPerHour.toFixed(2),
        unit: `мкг/ч (${mlPerHour.toFixed(3)} мл/ч)`,
        interpretation: m.label,
        color: '#3B82F6',
        details: `${m.perKg} мкг/кг/ч × ${w} кг = ${microPerHour.toFixed(2)} мкг/ч @ ${conc} мкг/мл.`,
        actions,
      };
    }

    const totalPerDay = w * m.perKg;
    const dosesPerDay = 4; // q6h
    const totalPerDose = totalPerDay / dosesPerDay;
    const conc = 50; // мкг/мл стандартный
    const volPerDose = totalPerDose / conc;

    const actions: string[] = [];
    actions.push(`Октреотид: ${totalPerDay.toFixed(0)} мкг/сут = ${totalPerDose.toFixed(1)} мкг q6h SC`);
    actions.push(`Объём: ${volPerDose.toFixed(2)} мл/доза @ 50 мкг/мл (vials 50 мкг/мл, 100 мкг/мл, 200 мкг/мл)`);
    actions.push(`Доза: ${m.perKg} мкг/кг/сут разделить q6-8h SC`);
    actions.push('Путь: subcutaneous injection (rotation injection sites)');

    actions.push('--- Когда использовать ---');
    actions.push('CHI (congenital hyperinsulinism) — KATP-channel resistant');
    actions.push('Diazoxide unresponsive (~ 50 % of CHI cases)');
    actions.push('Bridge to surgery (partial pancreatectomy для focal CHI)');
    actions.push('Long-term medical management diffuse CHI');

    actions.push('--- Mechanism ---');
    actions.push('Synthetic somatostatin analog — binds somatostatin receptors на β-cells');
    actions.push('↓ Insulin secretion');
    actions.push('Также ↓ growth hormone, glucagon, gastrin, secretin');
    actions.push('Onset: 30-60 мин SC; peak 1-2 ч; t½ 2-3 ч');

    actions.push('--- CHI workup ---');
    actions.push('Diagnosis: insulin/glucose ratio > 0.3 при гипогликемии');
    actions.push('β-OH butyrate inappropriately низкий (< 1 ммоль/л)');
    actions.push('Free fatty acids inappropriately низкие');
    actions.push('Genetic testing: KCNJ11, ABCC8, GLUD1, GCK, HADH mutations');
    actions.push('18F-DOPA PET — focal vs diffuse CHI distinction');

    actions.push('--- CHI treatment algorithm ---');
    actions.push('1. Diazoxide trial 5-15 мг/кг/сут PO q8h × 5-7 days');
    actions.push('2. Если no response: octreotide (KATP-resistant)');
    actions.push('3. Bridge to PET imaging для focal vs diffuse');
    actions.push('4. Focal CHI: partial pancreatectomy (curative)');
    actions.push('5. Diffuse CHI: continued medical (octreotide ± diazoxide partial response)');

    actions.push('--- Мониторинг ---');
    actions.push('Glucose q1-2h initial, затем q4-6h когда стабилен');
    actions.push('Goal: glucose 4-8 ммоль/л (70-150 мг/дл)');
    actions.push('CBC weekly');
    actions.push('LFTs monthly (long-term)');
    actions.push('Echocardiography baseline + annual (somatostatin effect on heart)');
    actions.push('Growth charts (somatostatin может suppress GH)');

    actions.push('--- Side effects ---');
    actions.push('GI: diarrhea, vomiting, abdominal cramping, gallstones (long-term)');
    actions.push('Hyperglycemia (rare у CHI patient — но possible)');
    actions.push('Tachyphylaxis (decreasing efficacy через 2-3 нед — increase dose)');
    actions.push('Suppression GH → growth retardation у chronic use');
    actions.push('Bradycardia, sinus pauses (rare у н/р)');
    actions.push('Hepatic enzyme elevation');
    actions.push('Necrotizing enterocolitis (rare у preterm — caution)');

    actions.push('--- Long-acting form (octreotide LAR) ---');
    actions.push('Octreotide LAR: monthly IM injection — для chronic stable CHI');
    actions.push('Dose: 10-30 мг IM monthly');
    actions.push('Transition после stable on regular octreotide');

    return {
      value: totalPerDay.toFixed(0),
      unit: `мкг/сут (${volPerDose.toFixed(2)} мл q6h @ 50 мкг/мл)`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мкг/кг/сут × ${w} кг = ${totalPerDay.toFixed(0)} мкг/сут разделить ${m.freq} SC.`,
      actions,
    };
  },
  caveats: [
    'Octreotide use в CHI после diazoxide failure (~ 50 % CHI cases KATP-resistant)',
    'Bridge к surgery (partial pancreatectomy для focal CHI) ИЛИ chronic medical management diffuse CHI',
    'Tachyphylaxis через 2-3 нед — increase dose 25-50 % may be needed',
    'GI side effects common: diarrhea, vomiting; usually resolve в 1-2 нед',
    'Long-term: gallstones (chronic use), suppress GH у growing children',
    'NEC (necrotizing enterocolitis) reported in some preterm cases — caution у preterm',
    'Echocardiography baseline + annual (somatostatin effect heart valves long-term)',
    'Genetic testing: KCNJ11, ABCC8 (KATP), GLUD1 (HI/HA syndrome), GCK, HADH',
    '18F-DOPA PET differentiates focal (curable by surgery) vs diffuse CHI (chronic medical)',
    'PMA-based dosing not as relevant для octreotide; weight-based standard',
    'Octreotide LAR (monthly IM): для chronic stable CHI — improves compliance',
    'Concomitant diazoxide partial responders: combination возможна',
  ],
  related: [
    { id: 'neo-glucagon-dose', title: 'Глюкагон emergency' },
    { id: 'neo-glucose-bolus-dose', title: 'Глюкоза болюс' },
    { id: 'neo-gir', title: 'GIR calculator' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
  ],
  info: `### Октреотид (CHI KATP-resistant)

Synthetic somatostatin analog для CHI после diazoxide failure.

### Дозы

| Phase | Доза |
|---|---|
| **Initial low** | 5 мкг/кг/сут SC q6-8h |
| Initial standard | 10 мкг/кг/сут SC q6-8h |
| **Maintenance** | **15-25 мкг/кг/сут SC q6-8h** |
| Max | 40 мкг/кг/сут SC q6-8h |
| IV continuous | 0.5 мкг/кг/ч (acute) |
| Long-acting LAR | 10-30 мг IM monthly (chronic) |

### CHI Workup

#### Diagnostic criteria:
- **Insulin/glucose ratio > 0.3** при гипогликемии
- **β-OH butyrate < 1 ммоль/л** (inappropriately low)
- **Free fatty acids low** (inappropriately)
- **Glucose response к глюкагону** (1 мг IV bolus → ↑ glucose ≥ 30 мг/дл)

#### Genetic testing:
| Gene | Phenotype |
|---|---|
| **KCNJ11** | KATP channel — focal или diffuse |
| **ABCC8** | KATP channel — most common |
| **GLUD1** | HI/HA (hyperammonia) |
| **GCK** | Persistent CHI |
| **HADH** | Short-chain HAD deficiency |

### CHI Treatment Algorithm

1. **Diazoxide trial** 5-15 мг/кг/сут PO q8h × 5-7 days
2. **If unresponsive (≈ 50 %):** Octreotide
3. **18F-DOPA PET** — focal vs diffuse
4. **Focal CHI:** Partial pancreatectomy (curative)
5. **Diffuse CHI:** Chronic medical management

### Mechanism

#### Somatostatin receptor binding:
- ↓ Insulin secretion (β-cells)
- ↓ Growth hormone
- ↓ Glucagon
- ↓ Gastrin, secretin
- ↓ Splanchnic blood flow

### Onset / kinetics

| Параметр | Value |
|---|---|
| **Onset SC** | 30-60 мин |
| **Peak SC** | 1-2 ч |
| **t½** | 2-3 ч |
| **Duration SC** | 6-8 ч (q6-8h dosing) |
| **Long-acting LAR** | 30 days |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| GI symptoms | common (50 %) | Usually resolve 1-2 нед |
| **Tachyphylaxis** | 2-3 нед | ↑ dose 25-50 % |
| Gallstones | long-term | U/S annual |
| GH suppression | chronic | Growth monitoring |
| **NEC** в preterm | rare but reported | Caution preterm |
| Bradycardia | rare у н/р | ECG baseline |
| ↑ LFTs | + | Monthly LFTs |

### Long-acting Octreotide (LAR)

Для chronic stable CHI:
- **10-30 мг IM monthly**
- Transition after stable on regular octreotide
- Improved compliance vs q6-8h SC injections
- Slow release — стабильные plasma levels

### Combination therapy

| Combination | Application |
|---|---|
| **Diazoxide + octreotide** | Partial diazoxide responders |
| **Octreotide + frequent feeds** | Bridge to surgery |
| **High-dose continuous IV octreotide** | Acute decompensation |

### Monitoring

| Parameter | Frequency |
|---|---|
| Glucose | q1-2h initial, q4-6h stable |
| Goal glucose | 4-8 ммоль/л (70-150 мг/дл) |
| CBC | Weekly |
| LFTs | Monthly |
| Abdominal U/S (gallstones) | Annual |
| Echocardiography | Baseline + annual |
| Growth charts | Q3 мес |

### Источники

- Arnoux JB et al. — CHI management guidelines
- Stanley CA et al. — CHI review (Pediatrics)
- Hussain K et al. — CHI clinical practice
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Гипогликемия / Гиперинсулинизм" (2024)
`,
};

export default runner;
