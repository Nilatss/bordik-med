/**
 * Runner: neo-erythropoietin-dose — Эритропоэтин (anemia of prematurity / neuroprotection)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Recombinant human erythropoietin (rhEpo) для:
 *   - Anemia of prematurity (AOP) — снижение transfusion need
 *   - Neuroprotection — controversial, multiple trials (PENUT, Darbe для preterm)
 *
 * Дозы:
 *   AOP (rhEpo SC/IV): 250-400 ед/кг 3 раза в неделю SC
 *     Альтернатива darbepoetin alfa (DA): 10 мкг/кг 1 раз в неделю SC
 *
 *   Neuroprotection HIE (PENUT, Juul 2020):
 *     1000 ед/кг IV q48h × 6 doses (от 24 ч до возраст 8-10 дней)
 *
 * SOURCES:
 *   - Juul SE et al. PENUT trial NEJM 2020;382:233 — Epo для preterm neuroprotection
 *   - Wu YW et al. NEAT trial — Epo для HIE adjunct (NEAT trial results pending)
 *   - Baker EC et al. — Darbepoetin для AOP
 *   - AAP CFN — anemia of prematurity
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Анемия новорождённого / Эритропоэтин" (2024)
 *
 * NB: Iron supplementation OBLIGATORY с Epo (4-6 мг/кг/сут elemental iron PO)
 *     для adequate erythropoiesis.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (PENUT 2020 / NEAT / NeoFax)',
  reference: 'Juul SE PENUT NEJM 2020;382:233. Baker EC darbepoetin AOP. AAP CFN. NeoFax.',
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
        { value: 'aop_sc_low', label: 'AOP SC 250 ед/кг 3×/нед (start)' },
        { value: 'aop_sc_high', label: 'AOP SC 400 ед/кг 3×/нед (стандарт)' },
        { value: 'aop_sc_max', label: 'AOP SC 500 ед/кг 3×/нед (high)' },
        { value: 'da_weekly', label: 'Darbepoetin alfa 10 мкг/кг SC × 1/нед (= 600 ед/кг Epo)' },
        { value: 'neuro_iv', label: 'Neuroprotection PENUT 1000 ед/кг IV q48h' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'aop_sc_high');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type EpoMode = { perKg: number; route: string; freq: string; isDarbe?: boolean; label: string };
    const modes: Record<string, EpoMode> = {
      aop_sc_low: { perKg: 250, route: 'SC', freq: '3×/нед (Mon-Wed-Fri)', label: 'AOP SC low' },
      aop_sc_high: { perKg: 400, route: 'SC', freq: '3×/нед (Mon-Wed-Fri)', label: 'AOP SC standard' },
      aop_sc_max: { perKg: 500, route: 'SC', freq: '3×/нед (Mon-Wed-Fri)', label: 'AOP SC high' },
      da_weekly: { perKg: 10, route: 'SC darbepoetin alfa', freq: '1×/нед', isDarbe: true, label: 'Darbepoetin weekly' },
      neuro_iv: { perKg: 1000, route: 'IV slow infusion 30 мин', freq: 'q48h × 6 doses', label: 'Neuroprotection PENUT' },
    };
    const m = modes[mode] ?? modes.aop_sc_high;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const unit = m.isDarbe ? 'мкг' : 'ед';
    // Concentration: Epo 4000 ед/мл; Darbe 25 мкг/мл (typical formulations)
    const conc = m.isDarbe ? 25 : 4000;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`${m.isDarbe ? 'Darbepoetin alfa' : 'rhEpo'}: ${total.toFixed(0)} ${unit} = ${vol.toFixed(2)} мл @ ${conc} ${unit}/мл`);
    actions.push(`Доза: ${m.perKg} ${unit}/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (mode.startsWith('aop')) {
      actions.push('--- AOP treatment ---');
      actions.push('Onset: 1-2 нед до noticeable увеличения reticulocytes');
      actions.push('Полный effect: 4-8 нед — peak Hb response');
      actions.push('⚠️ Iron OBLIGATORY: 4-6 мг/кг/сут elemental iron PO для erythropoiesis');
      actions.push('Folic acid 50 мкг/кг/сут также recommended');
      actions.push('Длительность: до postmenstrual age 32-34 нед или discharge');
      actions.push('Цель: ↓ transfusion need (Cochrane 2014: ↓ 12 % transfusions, no functional outcome benefit)');
    } else if (mode === 'da_weekly') {
      actions.push('--- Darbepoetin alfa (alternative AOP) ---');
      actions.push('Conversion: 10 мкг DA = 600 ед Epo (factor 1:60)');
      actions.push('Once weekly dosing — улучшение compliance');
      actions.push('Onset: similar 1-2 нед');
      actions.push('Cost ↑ vs Epo, но fewer injections');
    } else if (mode === 'neuro_iv') {
      actions.push('--- HIE Neuroprotection (PENUT trial) ---');
      actions.push('Juul SE et al. NEJM 2020: 6 doses 1000 ед/кг IV q48h');
      actions.push('Schedule: dose 1 в 24 ч жизни → q48h × 5 more (total 6 doses)');
      actions.push('Combine с therapeutic hypothermia (TH) если HIE moderate-severe');
      actions.push('PENUT preterm trial: NO neurodev benefit; не routine у preterm');
      actions.push('NEAT trial (HIE term/late preterm): results pending — wait for evidence');
      actions.push('Currently не routine standard practice');
    }

    actions.push('--- Iron supplementation ---');
    actions.push('Iron 4-6 мг/кг/сут elemental PO начать с Epo (или enteral feeding)');
    actions.push('Folic acid 50 мкг/кг/сут');
    actions.push('Vit E 25 ед/сут');
    actions.push('Vit B12 0.5 мкг/сут (rare у Epo)');

    actions.push('--- Мониторинг ---');
    actions.push('CBC weekly во время Epo therapy');
    actions.push('Reticulocyte count baseline + через 1-2 нед');
    actions.push('Iron stores: ferritin q4 нед');
    actions.push('Эффект: ↑ Hb через 4-6 нед, ↑ reticulocytes через 1-2 нед');

    actions.push('--- Side effects ---');
    actions.push('Hypertension (rare у н/р, common у adult dialysis)');
    actions.push('Polycythemia при overdose (Hct > 65 %) — partial exchange may be needed');
    actions.push('Iron-deficient erythropoiesis при inadequate iron');
    actions.push('Pure red cell aplasia (very rare)');
    actions.push('Thrombosis (rare у н/р, more concerning у adults)');

    actions.push('--- Старая концерн: ROP ---');
    actions.push('Ранние мета-анализы предполагали ↑ ROP severe risk');
    actions.push('Cochrane 2014/2017: НЕ повышает ROP риск significantly');
    actions.push('PENUT 2020 confirmed: no ROP signal у preterm с high-dose IV Epo');

    return {
      value: total.toFixed(0),
      unit: `${unit} (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: mode === 'neuro_iv' ? '#8B5CF6' : '#3B82F6',
      details: `${m.perKg} ${unit}/кг × ${w} кг = ${total.toFixed(0)} ${unit} ${m.freq} @ ${conc} ${unit}/мл.`,
      actions,
    };
  },
  caveats: [
    'AOP treatment: ↓ transfusion need (Cochrane 2014: ↓ 12 % transfusions); no functional outcome benefit',
    '⚠️ Iron supplementation OBLIGATORY с Epo: 4-6 мг/кг/сут elemental iron PO — иначе iron-deficient erythropoiesis',
    'PENUT trial (Juul 2020): preterm Epo для neuroprotection NO benefit',
    'NEAT trial (HIE term/late): results pending; не currently standard practice',
    'Old ROP concerns DISPROVED: Cochrane 2014 + PENUT 2020 — no ROP signal',
    'Polycythemia (Hct > 65 %) при overdose — monitor weekly CBC',
    'Hypertension (rare у н/р) — мониторинг АД',
    'Conversion: 10 мкг darbepoetin = 600 ед Epo (factor 1:60)',
    'Длительность AOP treatment: до PMA 32-34 нед или discharge',
    'IV vs SC: SC preferred у н/р (less fluid load); IV для acute/neuroprotection',
    'Combine с folic acid + vit E + vit B12 для optimal erythropoiesis',
  ],
  related: [
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-hie-cooling', title: 'TH eligibility' },
    { id: 'neo-newt', title: 'NEWT weight loss' },
    { id: 'thompson', title: 'Thompson / Sarnat' },
  ],
  info: `### Эритропоэтин у новорождённых

Recombinant human Epo (rhEpo) или darbepoetin alfa (DA) для:
- **Anemia of prematurity** (AOP) — снижение transfusion need
- **HIE neuroprotection** (controversial, PENUT/NEAT trials)

### Дозы

#### AOP (anemia of prematurity)
| Mode | Доза | Frequency |
|---|---|---|
| **rhEpo low** | 250 ед/кг SC | 3×/нед |
| **rhEpo standard** | **400 ед/кг SC** | **3×/нед** |
| rhEpo high | 500 ед/кг SC | 3×/нед |
| **Darbepoetin alfa** | 10 мкг/кг SC | 1×/нед |

#### HIE neuroprotection (PENUT)
| Phase | Доза |
|---|---|
| Day 1 (24 ч of life) | 1000 ед/кг IV |
| Day 3 | 1000 ед/кг IV |
| Day 5 | 1000 ед/кг IV |
| Day 7 | 1000 ед/кг IV |
| Day 9 | 1000 ед/кг IV |
| Day 11 | 1000 ед/кг IV |

Total 6 doses q48h.

### ⚠️ Iron supplementation OBLIGATORY

Без iron — iron-deficient erythropoiesis. Epo НЕ работает.

| Supplement | Доза |
|---|---|
| **Elemental iron** | **4-6 мг/кг/сут PO** |
| Folic acid | 50 мкг/кг/сут |
| Vit E | 25 ед/сут |
| Vit B12 | 0.5 мкг/сут |

### Conversion Epo ↔ Darbepoetin

| | rhEpo | Darbepoetin |
|---|---|---|
| **Frequency** | 3×/нед | 1×/нед |
| **Equivalent** | 600 ед = 10 мкг | (1:60 ratio) |
| **t½** | 4-13 ч | 25-50 ч |
| **Cost** | low | higher |
| **Compliance** | more injections | better |

### PENUT trial (Juul 2020 NEJM 382:233)

- 941 extremely preterm
- 1000 ед/кг IV q48h × 6 doses
- **No neurodev benefit** at 22-26 мес
- ↓ Transfusions (modest)
- No safety signals (включая ROP)
- → Не routine для preterm

### NEAT trial (term/late preterm HIE)

- Wu et al. multicenter
- Adjunct к TH у HIE
- Results pending (2023+)
- Currently не standard practice

### Когда использовать

| Indication | Status |
|---|---|
| **AOP** | Established (Cochrane: ↓ transfusions) |
| **HIE adjunct** | Controversial (NEAT pending) |
| **Preterm neuroprotection** | NOT recommended (PENUT negative) |
| **Anemia of chronic disease** | Off-label |
| **Subclinical hypothyroidism** | Investigational |

### Cochrane 2014 (Aher) — AOP

| Outcome | Effect |
|---|---|
| Transfusions | ↓ 12 % |
| Donor exposures | ↓ |
| Transfusion volume | ↓ |
| Mortality | no change |
| ROP | no significant change |
| Functional outcomes | no improvement |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Hypertension | rare у н/р | АД q12h |
| Polycythemia | overdose | Reduce dose, partial exchange if Hct > 65 % |
| Iron-deficient | inadequate iron | Ensure 4-6 мг/кг/сут iron |
| Pure red cell aplasia | very rare | Discontinue, anti-Epo Ab |
| ROP concern | DISPROVED | — |

### Источники

- Juul SE et al. PENUT trial NEJM 2020;382:233
- Wu YW et al. NEAT trial (results pending)
- Baker EC et al. Darbepoetin for AOP
- Aher SM et al. Cochrane Erythropoietin для AOP 2014
- AAP CFN — anemia of prematurity
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "Анемия новорождённого" (2024)
`,
};

export default runner;
