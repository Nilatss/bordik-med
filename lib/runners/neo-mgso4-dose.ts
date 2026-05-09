/**
 * Runner: neo-mgso4-dose — Магний сульфат (hypomagnesemia + neuroprotection)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Показания:
 *   - Hypomagnesemia (< 0.66 ммоль/л) — particularly если сопутствует
 *     гипокальциемии
 *   - Maternal antenatal magnesium для neuroprotection (< 32 нед)
 *   - PPHN/PPHN-related — vasodilation effect (controversial)
 *   - Refractory судороги (rarely)
 *
 * Дозы:
 *   Hypomagnesemia: 25-50 мг/кг IV slow push 30 мин (= 0.1-0.2 мл/кг 25 %)
 *   Может повторить q6-12h × 2-3 doses
 *
 *   Maternal antenatal neuroprotection (MOTHER, не newborn):
 *     4 г IV bolus + 1 г/ч infusion для 24 ч (Doyle Cochrane 2009 NEJM)
 *
 *   Newborn neuroprotection (HIE adjunct, controversial):
 *     250 мг/кг IV × 1-3 doses (limited evidence)
 *
 *   PPHN adjunct (rarely): 200 мг/кг IV bolus + 100-150 мг/кг/ч infusion
 *
 * Concentration:
 *   25 % MgSO₄ = 250 мг/мл = 1 ммоль/мл
 *   50 % MgSO₄ = 500 мг/мл = 2 ммоль/мл (rarely в neoнат)
 *
 * SOURCES:
 *   - Doyle LW et al. Cochrane Magnesium for neuroprotection 2009
 *   - Crowther CA et al. ACTOMgSO₄ NEJM 2003
 *   - AAP CFN — neonatal hypomagnesemia
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Гипомагниемия / Магний при н/р" (2024)
 *
 * Definitions:
 *   - Hypomagnesemia < 0.66 ммоль/л (1.6 мг/дл)
 *   - Severe < 0.5 ммоль/л
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Cochrane / AAP / NeoFax) · РФ',
  reference: 'Doyle LW Cochrane Mg neuroprotection 2009. ACTOMgSO₄ NEJM 2003. AAP CFN. NeoFax.',
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
      label: 'Показание / режим',
      type: 'select',
      options: [
        { value: 'hypo_low', label: 'Hypomagnesemia 25 мг/кг IV slow 30 мин' },
        { value: 'hypo_med', label: 'Hypomagnesemia 50 мг/кг IV slow 30 мин (severe)' },
        { value: 'neuro_load', label: 'HIE neuroprotection 250 мг/кг IV (controversial)' },
        { value: 'pphn_load', label: 'PPHN bolus 200 мг/кг IV' },
        { value: 'pphn_inf', label: 'PPHN infusion 100 мг/кг/ч' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'hypo_low');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type MgMode = { perKg: number; isInfusion: boolean; route: string; freq: string; label: string };
    const modes: Record<string, MgMode> = {
      hypo_low: { perKg: 25, isInfusion: false, route: 'IV slow infusion 30 мин', freq: 'q6-12h prn', label: 'Hypomagnesemia low' },
      hypo_med: { perKg: 50, isInfusion: false, route: 'IV slow infusion 30 мин', freq: 'q6-12h prn', label: 'Hypomagnesemia severe' },
      neuro_load: { perKg: 250, isInfusion: false, route: 'IV slow infusion 60 мин', freq: '× 1-3 doses', label: 'HIE neuroprotection' },
      pphn_load: { perKg: 200, isInfusion: false, route: 'IV slow infusion 30 мин', freq: 'bolus', label: 'PPHN bolus' },
      pphn_inf: { perKg: 100, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'PPHN infusion' },
    };
    const m = modes[mode] ?? modes.hypo_low;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const totalMg = w * m.perKg;
    // 25% = 250 мг/мл standard NICU
    const conc = 250;
    const vol = totalMg / conc;

    const actions: string[] = [];
    actions.push(`Магний сульфат 25 %: ${totalMg.toFixed(0)} мг${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ 250 мг/мл`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (mode.startsWith('hypo')) {
      actions.push('--- Лечение гипомагниемии ---');
      actions.push('Onset: 5-15 мин IV; peak 30-60 мин; t½ 6-8 ч у н/р');
      actions.push('Целевой Mg: 0.7-1.0 ммоль/л (1.7-2.4 мг/дл)');
      actions.push('Concomitant hypocalcemia (часто): also treat — Ca gluc 1-2 мл/кг 10 % IV');
      actions.push('Если low Mg refractory — consider repeat dose q6-12h до 2-3 doses');
    } else if (mode === 'neuro_load') {
      actions.push('--- HIE neuroprotection (controversial) ---');
      actions.push('Доказательная база ограничена; не routine');
      actions.push('NB: maternal antenatal magnesium является evidence-based (MOTHER trial)');
      actions.push('Postnatal у н/р — limited evidence (CONSENSUS adjunct к TH)');
      actions.push('Combine с therapeutic hypothermia (TH)');
    } else if (mode.startsWith('pphn')) {
      actions.push('--- PPHN ---');
      actions.push('Рассмотрите при failure iNO + milrinone (last-line)');
      actions.push('Mechanism: NMDA antagonism, calcium channel blocker, vasodilator');
      actions.push('Limited evidence у н/р для PPHN');
      actions.push('iNO предпочтительный first-line');
    }

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: ЧСС, АД, SpO₂, RR (apnea risk при overdose)');
    actions.push('Therapeutic level: 0.7-1.0 ммоль/л (1.7-2.4 мг/дл)');
    actions.push('Toxicity > 2 ммоль/л: гипотония, гипотония дыхания, hypotonia');
    actions.push('Toxicity > 3 ммоль/л: respiratory paralysis, cardiac arrest');
    actions.push('DTRs (deep tendon reflexes) — early sign toxicity (loss первый признак у adult)');

    actions.push('--- Side effects ---');
    actions.push('Hypotension (vasodilation, особенно с rapid push)');
    actions.push('Bradycardia (sinus node depression)');
    actions.push('Apnea / respiratory depression');
    actions.push('Hypotonia (NMJ blockade)');
    actions.push('Hypocalcemia paradoxical (через PTH suppression)');
    actions.push('Renal-dependent excretion: ↓ доза при renal failure');

    actions.push('--- Antidote ---');
    actions.push('Ca gluc 1-2 мл/кг 10 % IV slow — antagonist при overdose');
    actions.push('Continuous monitoring обязателен');
    actions.push('Furosemide 1 мг/кг IV — improves urinary excretion');
    actions.push('Severe overdose: hemodialysis');

    return {
      value: totalMg.toFixed(0),
      unit: `мг${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${totalMg.toFixed(0)} мг${m.isInfusion ? '/ч' : ''} @ 250 мг/мл (25 %).`,
      actions,
    };
  },
  caveats: [
    'Maternal antenatal Mg для neuroprotection (Doyle Cochrane 2009): EVIDENCE-BASED у preterm < 32 нед',
    'Postnatal Mg у н/р для neuroprotection — limited evidence; не routine',
    'Concentration 25 % MgSO₄ standard у н/р: 250 мг/мл = 1 ммоль/мл',
    'Hypomagnesemia (< 0.66 ммоль/л) часто сопутствует hypocalcemia → treat both',
    'Concomitant с therapeutic hypothermia (TH) для HIE — adjunct controversial',
    'Renal-dependent excretion: ↓ доза 50 % при ОПН (Cr clearance < 30)',
    'Toxicity progression: DTR loss → hypotension → respiratory depression → cardiac arrest',
    'Antidote: Ca gluconate 1-2 мл/кг 10 % IV slow при overdose симптомах',
    'НЕ давать с aminoglycosides без monitoring (potentiates NMJ blockade)',
    'Maternal Mg на родах → newborn hypotonia, апноэ при birth (NICU readiness)',
    'PPHN adjunct (last-line после iNO + milrinone) — limited evidence у н/р',
  ],
  related: [
    { id: 'neo-cagluconate-dose', title: 'Кальций глюконат' },
    { id: 'neo-hie-cooling', title: 'TH eligibility' },
    { id: 'neo-ino-dose', title: 'iNO' },
    { id: 'neo-milrinone-dose', title: 'Милринон' },
  ],
  info: `### Магний сульфат у новорождённых

Treatment гипомагниемии, adjunct PPHN/HIE neuroprotection, controversial
postnatal use.

### Дозы

| Indication | Доза | Frequency |
|---|---|---|
| **Hypomagnesemia low** | 25 мг/кг IV slow 30 мин | q6-12h prn |
| **Hypomagnesemia severe** | 50 мг/кг IV slow 30 мин | q6-12h prn |
| **HIE neuroprotection** | 250 мг/кг IV slow 60 мин | × 1-3 doses |
| **PPHN bolus** | 200 мг/кг IV | bolus |
| **PPHN infusion** | 100-150 мг/кг/ч | continuous |

### Concentration

| Strength | Equivalent |
|---|---|
| **25 %** (NICU standard) | 250 мг/мл = 1 ммоль/мл |
| 50 % | 500 мг/мл = 2 ммоль/мл (rarely) |

### Therapeutic level

| Level | Action |
|---|---|
| < 0.66 ммоль/л (< 1.6 мг/дл) | Hypomagnesemia — treat |
| 0.7-1.0 ммоль/л (1.7-2.4 мг/дл) | Therapeutic |
| > 2.0 ммоль/л (> 4.8 мг/дл) | Toxicity начинается |
| > 3.0 ммоль/л (> 7.3 мг/дл) | Severe toxicity |

### Toxicity progression

| Level | Symptoms |
|---|---|
| > 2 | Loss DTR, гипотензия (mild) |
| > 3 | Respiratory depression, hypotonia |
| > 4 | Cardiac arrest |

### Maternal antenatal Mg (MOTHER trial — Doyle Cochrane 2009)

- **Evidence-based** для neuroprotection у preterm < 32 нед
- 4 г IV bolus + 1 г/ч infusion за 24 ч до планируемых родов
- **↓ Cerebral palsy** на 30 % (NNT 63 для CP, 56 для death + CP)
- → Не newborn calc, но контекст для understanding

### Postnatal Mg для HIE

- **Limited evidence** — не routine
- Adjunct к therapeutic hypothermia
- Mechanism: NMDA antagonism, calcium channel blocker
- 250 мг/кг IV slow 60 мин × 1-3 doses (CONSENSUS protocol)

### Hypomagnesemia causes

| Type | Causes |
|---|---|
| **Maternal** | Maternal Mg therapy (paradoxical), DM, hyperparathyroidism |
| **Decreased intake** | TPN недостаточный, breastfeeding malnutrition |
| **Renal loss** | Diuretics, ATN, primary tubular |
| **GI loss** | Diarrhea, vomiting, NEC |
| **Endocrine** | Hyperaldosteronism, hypoparathyroidism |

### Concomitant hypocalcemia

Hypomagnesemia + hypocalcemia (часто co-existent):
- Mg deficiency impairs PTH secretion и target organ response
- → корригировать оба: MgSO₄ + Ca gluconate

### Side effects

| Effect | Mechanism | Management |
|---|---|---|
| Hypotension | vasodilation | Slow infusion, volume |
| Bradycardia | sinus node | Atropine if severe |
| Apnea | respiratory muscle | ИВЛ ready |
| Hypotonia | NMJ blockade | Time, Ca antidote |
| Hypocalcemia | PTH suppression | Concomitant Ca |

### Antidote

- **Calcium gluconate 1-2 мл/кг 10 % IV slow** — direct antagonist
- **Furosemide 1 мг/кг IV** — improves renal excretion
- **Hemodialysis** — severe overdose

### Источники

- Doyle LW et al. Cochrane Magnesium для neuroprotection 2009
- Crowther CA et al. ACTOMgSO₄ NEJM 2003
- AAP CFN — neonatal hypomagnesemia
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Гипомагниемия / Магний при н/р" (2024)
`,
};

export default runner;
