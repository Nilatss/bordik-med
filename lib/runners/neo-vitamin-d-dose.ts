/**
 * Runner: neo-vitamin-d-dose — Витамин D (rickets prevention / deficiency)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Vit D supplementation для prevention rickets (osteopenia of prematurity)
 * и treatment deficiency. Особенно важно в высоких широтах и для preterm.
 *
 * Дозы:
 *   Profilaxis (всем н/р, особенно breastfed):
 *     400 ед/сут PO (term) — AAP recommendation
 *     800-1000 ед/сут PO (preterm) — ESPGHAN, КР РФ
 *
 *   Vit D deficiency treatment:
 *     2000-4000 ед/сут × 4-6 нед (если 25-OH-vit D < 30 нг/мл)
 *
 *   Severe deficiency / rickets clinical:
 *     5000-10000 ед/сут × 6-12 нед, монитор Ca/phosphate
 *
 * Levels (25-hydroxy vitamin D):
 *   - Sufficient: > 30 нг/мл (75 нмоль/л)
 *   - Insufficient: 20-30 нг/мл (50-75 нмоль/л)
 *   - Deficient: < 20 нг/мл (< 50 нмоль/л)
 *   - Severe deficient: < 10 нг/мл (< 25 нмоль/л)
 *
 * SOURCES:
 *   - AAP COFN 2008 — Vit D supplementation в н/р (Pediatrics 122:1142)
 *   - ESPGHAN 2013 — Vit D в preterm
 *   - Endocrine Society 2011 — Vit D guidelines (Holick MF JCEM)
 *   - WHO 2014 — Vit D в children
 *   - КР МЗ РФ "Витамин D / Рахит у н/р" (2024)
 *
 * Conversion: 1 мкг vit D = 40 ед; 1 ед = 0.025 мкг
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP COFN 2008 / ESPGHAN / Endocrine Society) · РФ',
  reference: 'AAP COFN 2008 (Pediatrics 122:1142). ESPGHAN 2013. Endocrine Society 2011. КР МЗ РФ.',
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
      label: 'Показание / dose',
      type: 'select',
      options: [
        { value: 'prophy_term', label: 'Profilaxis term 400 ед/сут (с 1-го дня жизни)' },
        { value: 'prophy_preterm', label: 'Profilaxis preterm 800 ед/сут' },
        { value: 'prophy_preterm_high', label: 'Profilaxis preterm 1000 ед/сут (ELBW / VLBW)' },
        { value: 'def_mild', label: 'Deficiency mild 2000 ед/сут × 4-6 нед' },
        { value: 'def_mod', label: 'Deficiency moderate 3000 ед/сут × 6 нед' },
        { value: 'def_severe', label: 'Severe deficiency / rickets 5000-10000 ед/сут × 6-12 нед' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'prophy_term');

    if (w <= 0 || w > 10) {
      return { value: '—', interpretation: 'Введите массу 0.4-10 кг', color: '#9CA3AF', details: '' };
    }

    type VitDMode = { dose: number; freq: string; duration: string; label: string };
    const modes: Record<string, VitDMode> = {
      prophy_term: { dose: 400, freq: 'q24h', duration: 'до transition к iron-rich solids ~ 12 мес', label: 'Profilaxis term' },
      prophy_preterm: { dose: 800, freq: 'q24h', duration: 'до 6-12 мес corrected age', label: 'Profilaxis preterm' },
      prophy_preterm_high: { dose: 1000, freq: 'q24h', duration: 'до 6-12 мес corrected age', label: 'Profilaxis preterm high' },
      def_mild: { dose: 2000, freq: 'q24h', duration: '4-6 нед', label: 'Deficiency mild treatment' },
      def_mod: { dose: 3000, freq: 'q24h', duration: '6 нед', label: 'Deficiency moderate' },
      def_severe: { dose: 7500, freq: 'q24h (5000-10000 диапазон)', duration: '6-12 нед', label: 'Severe / rickets' },
    };
    const m = modes[mode] ?? modes.prophy_term;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }

    // Concentration: typical drops 400 ед/мл (1 капля = 100 ед for some preparations)
    // Different formulations: 5000 ед/мл (more concentrated drops), 1000 ед/мл
    const concEdPerMl = 400; // мкг ед/мл стандартная suspension
    const volPerDay = m.dose / concEdPerMl;
    const volPerDayMl = volPerDay; // 1 мл = 400 ед

    const actions: string[] = [];
    actions.push(`Vit D3 (cholecalciferol): ${m.dose} ед/сут (${(m.dose / 40).toFixed(1)} мкг/сут)`);
    actions.push(`Объём: ${volPerDayMl.toFixed(2)} мл/сут @ 400 ед/мл (стандарт drops)`);
    actions.push(`Длительность: ${m.duration}`);
    actions.push('Путь: PO drops, обычно с грудью / formula / water');

    if (mode.startsWith('prophy')) {
      actions.push('--- Profilaxis ---');
      actions.push('AAP 2008: 400 ед/сут с 1-го дня жизни всем breastfed (включая partial breastfed)');
      actions.push('Formula-fed term: usually adequate (formula fortified ~ 400 ед/л) при > 1 л/сут');
      actions.push('Preterm < 1500 г: ESPGHAN 2013 рекомендует 800-1000 ед/сут');
      actions.push('Continued до transition к iron-rich solid foods (~ 12 мес term, 6-12 мес corrected age preterm)');
    } else if (mode.startsWith('def_')) {
      actions.push('--- Deficiency treatment ---');
      actions.push('Перед началом: 25-OH-vit D level (если available)');
      actions.push('Recheck level через 4-6 нед');
      actions.push('Mild deficiency (20-30 нг/мл): 2000 ед/сут × 4-6 нед');
      actions.push('Moderate (10-20 нг/мл): 3000 ед/сут × 6 нед');
      actions.push('Severe (< 10 нг/мл): 5000-10000 ед/сут × 6-12 нед + Ca + phosphate replacement');
      actions.push('После replacement: maintenance 400-800 ед/сут lifelong');
    }

    actions.push('--- Levels (25-OH-vit D) ---');
    actions.push('Sufficient: > 30 нг/мл (75 нмоль/л)');
    actions.push('Insufficient: 20-30 нг/мл (50-75 нмоль/л) — improve но not deficient');
    actions.push('Deficient: < 20 нг/мл (< 50 нмоль/л) — treatment indicated');
    actions.push('Severe deficient: < 10 нг/мл (< 25 нмоль/л) — high-dose treatment');

    actions.push('--- Risk factors deficiency ---');
    actions.push('Maternal vit D deficiency (most common)');
    actions.push('High latitude / limited sunlight exposure');
    actions.push('Dark skin pigmentation (more melanin → less UV penetration)');
    actions.push('Exclusive breastfeeding без supplementation');
    actions.push('Prematurity (low stores)');
    actions.push('Malabsorption (celiac, CF)');
    actions.push('Anticonvulsant use (induces metabolism)');

    actions.push('--- Rickets diagnosis ---');
    actions.push('Clinical: skull softening (craniotabes), wide sutures, bowed legs, rickets rosary, frontal bossing');
    actions.push('Lab: ↓ Ca (если severe), ↓ phosphate, ↑ alkaline phosphatase, ↓ 25-OH-vit D');
    actions.push('Radiologic: cupping/fraying metaphyses, growth plate widening');

    actions.push('--- Mонитор ---');
    actions.push('Total + ionized Ca q1-2 нед (high-dose treatment)');
    actions.push('Phosphate q1-2 нед');
    actions.push('Alkaline phosphatase q4 нед');
    actions.push('25-OH-vit D через 4-6 нед');
    actions.push('Urine Ca:Cr ratio (hypercalciuria possible)');

    actions.push('--- Side effects (overdose) ---');
    actions.push('Hypercalcemia, hypercalciuria');
    actions.push('Nephrocalcinosis, nephrolithiasis');
    actions.push('Anorexia, vomiting, weight loss');
    actions.push('Polyuria, polydipsia');
    actions.push('Toxicity при > 10000 ед/сут long-term или single dose > 50000 ед');

    return {
      value: String(m.dose),
      unit: `ед/сут (${(m.dose / 40).toFixed(1)} мкг)`,
      interpretation: m.label,
      color: '#22C55E',
      details: `${m.dose} ед/сут (${(m.dose / 40).toFixed(1)} мкг/сут) PO ${m.freq} × ${m.duration}.`,
      actions,
    };
  },
  caveats: [
    'AAP 2008: 400 ед/сут profilaxis ВСЕМ breastfed (включая partial) с 1-го дня жизни',
    'Preterm < 1500 г: ESPGHAN 2013 — 800-1000 ед/сут',
    'Term formula-fed: usually adequate если > 1 л formula/сут (~400 ед/л)',
    'Maternal vit D deficiency — most common cause infant deficiency',
    '25-OH-vit D level ideal для assessment (1,25-OH preferred у renal disease)',
    'Toxicity rare при daily doses < 10000 ед; cumulative high doses опасны',
    'Hypercalciuria mon — urine Ca:Cr ratio и nephrocalcinosis на U/S',
    'Vit D2 (ergocalciferol) vs D3 (cholecalciferol): D3 предпочтительнее (better absorption, longer t½)',
    'Concomitant Ca (250-500 мг/сут elemental) при severe deficiency',
    'Anticonvulsant use (phenytoin, phenobarb) — двукратное increase в profilaxis dose required',
    'Dark skin / high latitude — risk-adapted increase профилaktic dose',
  ],
  related: [
    { id: 'neo-cagluconate-dose', title: 'Кальций глюконат' },
    { id: 'neo-iron-dose', title: 'Железо preterm' },
    { id: 'neo-fenton', title: 'Fenton growth' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
  ],
  info: `### Витамин D у новорождённых

Vit D supplementation для prevention rickets (osteopenia of prematurity)
и treatment deficiency.

### Дозы

#### Profilaxis (recommended все newborns)
| Group | Доза | Длительность |
|---|---|---|
| **Term breastfed** | **400 ед/сут** | до 12 мес |
| Preterm | 800 ед/сут | до 6-12 мес corrected |
| Preterm ELBW/VLBW | 1000 ед/сут | до 6-12 мес corrected |

#### Deficiency treatment
| Severity | Доза | Длительность |
|---|---|---|
| Mild (20-30 нг/мл) | 2000 ед/сут | 4-6 нед |
| Moderate (10-20 нг/мл) | 3000 ед/сут | 6 нед |
| Severe (< 10 нг/мл) | 5000-10000 ед/сут | 6-12 нед |
| **Rickets clinical** | **5000-10000 ед/сут + Ca/PO₄** | **6-12 нед** |

### 25-OH-Vit D levels

| Level (нг/мл) | Status |
|---|---|
| > 30 | Sufficient |
| 20-30 | Insufficient |
| < 20 | Deficient |
| < 10 | Severe deficient |

### Conversion

| Unit | Equivalent |
|---|---|
| 1 мкг vit D | 40 ед |
| 1 ед | 0.025 мкг |
| 1 нмоль/л | × 0.4 = нг/мл |

### Risk factors deficiency

| Factor | Mechanism |
|---|---|
| **Maternal deficiency** | Most common cause |
| **High latitude** | Less UVB exposure |
| **Dark skin** | More melanin |
| **Exclusive breastfeeding без supp** | Breast milk low vit D |
| **Prematurity** | Low stores |
| **Malabsorption** (celiac, CF) | Fat-soluble vit |
| **Anticonvulsants** | Induce metabolism |

### Rickets clinical features

#### Symptoms:
- Skull softening (craniotabes)
- Frontal bossing
- Wide anterior fontanelle
- Rickets rosary (palpable costochondral junctions)
- Bowed legs (если ambulating)

#### Lab:
- ↓ 25-OH-vit D
- ↓ Phosphate
- ↑ Alkaline phosphatase
- ± ↓ Ca (если severe)
- PTH ↑ (compensatory)

#### Radiologic:
- Cupping/fraying metaphyses
- Growth plate widening
- Delayed bone age

### Monitoring (high-dose treatment)

| Parameter | Frequency |
|---|---|
| Total + ionized Ca | q1-2 нед |
| Phosphate | q1-2 нед |
| Alkaline phosphatase | q4 нед |
| 25-OH-vit D | через 4-6 нед |
| Urine Ca:Cr ratio | q4 нед |

### Side effects (overdose)

| Effect | Mechanism | Management |
|---|---|---|
| Hypercalcemia | Excess vit D | Reduce dose |
| Hypercalciuria | Renal Ca excretion | Monitor U Ca:Cr |
| Nephrocalcinosis | Long-term | Renal U/S |
| Vomiting / anorexia | High dose | Reduce dose |
| Polyuria / polydipsia | Hypercalcemia | Hydration |

⚠️ **Toxicity:** > 10000 ед/сут long-term или single > 50000 ед.

### Vit D2 vs D3

| | D2 (ergocalciferol) | D3 (cholecalciferol) |
|---|---|---|
| **Source** | Plant / fungal | Animal / sun |
| **Absorption** | OK | Better |
| **t½** | shorter | longer |
| **Preferred** | — | **D3** |

### Источники

- AAP COFN 2008 (Pediatrics 122:1142)
- ESPGHAN 2013 — Vit D в preterm
- Endocrine Society 2011 (Holick MF JCEM)
- WHO 2014 Vit D в children
- КР МЗ РФ "Витамин D / Рахит у н/р" (2024)
`,
};

export default runner;
