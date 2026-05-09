/**
 * Runner: neo-iron-dose — Железо (preterm supplementation)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Iron supplementation для preterm — обязательно из-за низких iron stores
 * (большинство iron transfer happens в last trimester). Также для AOP
 * treatment с эритропоэтином.
 *
 * Дозы:
 *   Preterm < 1500 г supplementation (старт через 2-4 нед жизни):
 *     2-4 мг/кг/сут elemental iron PO
 *     Continue до 6-12 мес corrected age
 *
 *   Iron deficiency anemia (high dose):
 *     4-6 мг/кг/сут elemental iron PO разделить q12-24h
 *     Maximum 6 мг/кг/сут (выше может cause GI symptoms)
 *
 *   AOP с Epo:
 *     4-6 мг/кг/сут elemental iron PO для adequate erythropoiesis
 *
 *   Term breastfed (RDA):
 *     1 мг/кг/сут с 4-6 мес (до introduction iron-rich foods)
 *
 *   Term formula-fed: usually adequate (formula fortified)
 *
 * Conversion:
 *   Ferrous sulfate 20% elemental iron (1 мл 25 мг/мл = 5 мг elemental)
 *   Ferrous fumarate 33% elemental
 *   Ferrous gluconate 12% elemental
 *
 * SOURCES:
 *   - AAP COFN 2010 — Iron requirements у н/р
 *   - ESPGHAN 2014 — Iron supplementation в preterm
 *   - WHO 2016 — Iron in vulnerable infants
 *   - КР МЗ РФ "Анемия / Железо у н/р" (2024)
 *   - Cochrane Iron supplementation в preterm 2014
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP COFN 2010 / ESPGHAN 2014 / WHO)',
  reference: 'AAP COFN 2010 Iron. ESPGHAN 2014 Iron supplementation. WHO 2016. КР МЗ РФ.',
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
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'preterm_supp', label: 'Preterm supplementation 2 мг/кг/сут (start 2-4 нед age)' },
        { value: 'preterm_high', label: 'Preterm high 4 мг/кг/сут (VLBW/ELBW)' },
        { value: 'epo_adjunct', label: 'AOP + Epo 6 мг/кг/сут (obligatory с Epo)' },
        { value: 'ida_treatment', label: 'IDA treatment 6 мг/кг/сут разделить q12h' },
        { value: 'term_breastfed', label: 'Term breastfed 1 мг/кг/сут с 4-6 мес' },
      ],
    },
    {
      id: 'product',
      label: 'Препарат',
      type: 'select',
      options: [
        { value: 'fe_sulfate', label: 'Ferrous sulfate 20 % elemental (стандарт)' },
        { value: 'fe_fumarate', label: 'Ferrous fumarate 33 % elemental' },
        { value: 'fe_gluconate', label: 'Ferrous gluconate 12 % elemental' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'preterm_supp');
    const product = String(values.product ?? 'fe_sulfate');

    if (w <= 0 || w > 10) {
      return { value: '—', interpretation: 'Введите массу 0.4-10 кг', color: '#9CA3AF', details: '' };
    }

    type IronMode = { mgPerKgPerDay: number; freq: string; duration: string; label: string };
    const modes: Record<string, IronMode> = {
      preterm_supp: { mgPerKgPerDay: 2, freq: 'q24h', duration: 'до 6-12 мес corrected age', label: 'Preterm supplementation' },
      preterm_high: { mgPerKgPerDay: 4, freq: 'q24h', duration: 'до 6-12 мес corrected age', label: 'Preterm high (VLBW/ELBW)' },
      epo_adjunct: { mgPerKgPerDay: 6, freq: 'q24h', duration: 'на time of Epo therapy', label: 'AOP + Epo adjunct' },
      ida_treatment: { mgPerKgPerDay: 6, freq: 'q12h', duration: '3 мес после Hb normalization', label: 'IDA treatment' },
      term_breastfed: { mgPerKgPerDay: 1, freq: 'q24h', duration: 'с 4-6 мес до weaning', label: 'Term breastfed' },
    };
    const m = modes[mode] ?? modes.preterm_supp;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }

    // Product elemental percentage
    const elementalPercent: Record<string, number> = {
      fe_sulfate: 20,
      fe_fumarate: 33,
      fe_gluconate: 12,
    };
    const elemPct = elementalPercent[product] ?? 20;
    const productNames: Record<string, string> = {
      fe_sulfate: 'Ferrous sulfate',
      fe_fumarate: 'Ferrous fumarate',
      fe_gluconate: 'Ferrous gluconate',
    };

    const elementalMgPerDay = w * m.mgPerKgPerDay;
    const productMgPerDay = elementalMgPerDay / (elemPct / 100);

    // Concentration после standard dilution: ferrous sulfate suspension 25 мг/мл (5 мг elemental/мл)
    const conc_per_ml = 5; // мг elemental/мл (ferrous sulfate)
    const volPerDay = elementalMgPerDay / conc_per_ml;
    const dosesPerDay = m.freq === 'q12h' ? 2 : 1;
    const volPerDose = volPerDay / dosesPerDay;

    const actions: string[] = [];
    actions.push(`Elemental iron: ${elementalMgPerDay.toFixed(1)} мг/сут (${m.mgPerKgPerDay} мг/кг/сут × ${w} кг)`);
    actions.push(`${productNames[product]}: ${productMgPerDay.toFixed(0)} мг/сут (${(productMgPerDay / dosesPerDay).toFixed(1)} мг ${m.freq}) — ${elemPct} % elemental`);
    actions.push(`Объём: ${volPerDose.toFixed(2)} мл/доза @ 5 мг elemental/мл (suspension)`);
    actions.push(`Длительность: ${m.duration}`);

    if (mode === 'preterm_supp' || mode === 'preterm_high') {
      actions.push('--- Preterm supplementation ---');
      actions.push('Start: 2-4 нед жизни (когда enteral feeds tolerated)');
      actions.push('Continue до 6-12 мес corrected age (or transition to iron-rich solid foods)');
      actions.push('Dose by GA: VLBW < 1500 г → 4 мг/кг/сут; LBW 1500-2500 г → 2 мг/кг/сут');
      actions.push('Cochrane 2014: ↓ iron deficiency anemia в preterm; benefit confirmed');
    } else if (mode === 'epo_adjunct') {
      actions.push('--- AOP + Epo adjunct ---');
      actions.push('Без iron — Epo не работает (iron-deficient erythropoiesis)');
      actions.push('Co-administration с Epo — start same time или 1 нед raньше');
      actions.push('Higher dose 4-6 мг/кг/сут required для adequate erythropoiesis');
      actions.push('Folic acid 50 мкг/кг/сут также рекомендуется');
    } else if (mode === 'ida_treatment') {
      actions.push('--- IDA treatment ---');
      actions.push('Diagnostic: Hb < 11 г/дл (term) или low based on age, ferritin < 12 нг/мл, TSAT < 16 %');
      actions.push('Treatment: 6 мг/кг/сут × 3 мес после Hb normalization');
      actions.push('Repeat CBC через 4 нед: Hb ↑ 1-2 г/дл expected response');
      actions.push('Если no response — workup other causes (chronic disease, inflammation, malabsorption)');
    } else if (mode === 'term_breastfed') {
      actions.push('--- Term breastfed (RDA) ---');
      actions.push('AAP 2010 recommends iron supplementation breastfed term с 4 мес');
      actions.push('1 мг/кг/сут до transition к iron-rich foods (~ 6 мес)');
      actions.push('Formula-fed term: usually adequate (formula fortified)');
    }

    actions.push('--- Administration ---');
    actions.push('Best с water, не с молоком (calcium impairs iron absorption)');
    actions.push('Не с antacids, ant-H2 blockers, фосфатами (interfere absorption)');
    actions.push('Vit C 50-100 мг сo-administration ↑ absorption на 30 %');
    actions.push('Может cause black stools (normal, not blood)');
    actions.push('Может stain teeth — temporary (rinse / brush)');

    actions.push('--- Мониторинг ---');
    actions.push('CBC через 4 нед после initiation');
    actions.push('Ferritin, transferrin saturation (TSAT) если available');
    actions.push('Reticulocyte count baseline + 1-2 нед');
    actions.push('Stooling pattern, weight gain, growth');

    actions.push('--- Side effects ---');
    actions.push('Stained teeth (temporary)');
    actions.push('GI: black stools (normal), diarrhea, constipation, abdominal cramping');
    actions.push('Iron overload (rare): ferritin > 300, TSAT > 80 % → reduce dose');
    actions.push('Pediatric overdose toxic: > 60 мг/кг elemental — emergency');

    return {
      value: elementalMgPerDay.toFixed(1),
      unit: `мг elemental/сут`,
      interpretation: m.label,
      color: '#22C55E',
      details: `${m.mgPerKgPerDay} мг/кг/сут × ${w} кг = ${elementalMgPerDay.toFixed(1)} мг elemental ${m.freq} (${productNames[product]} ${productMgPerDay.toFixed(0)} мг/сут).`,
      actions,
    };
  },
  caveats: [
    'Preterm supplementation OBLIGATORY: low iron stores at birth (most transferred 3rd trimester)',
    'Start 2-4 нед of life — earlier risks oxidative stress (NEC риск theoretically)',
    'Cochrane 2014: iron supplementation у preterm ↓ iron deficiency, no significant adverse effects',
    'Calcium impairs absorption — НЕ с молоком; predпочтительно empty stomach',
    'Vit C ↑ absorption на 30 % (50-100 мг co-administration optional)',
    'Concomitant Epo: iron mandatory — без iron Epo не работает',
    'Repeat CBC через 4 нед — Hb ↑ 1-2 г/дл expected',
    'Non-response: investigate chronic disease, infection, malabsorption (celiac), CMPI',
    'Black stools normal — not occult blood (FOBT false positive с iron)',
    'Pediatric iron overdose toxic: > 60 мг/кг elemental — emergency (chelation deferoxamine)',
    'Long-term iron в preterm: до 6-12 мес corrected age или until iron-rich solids',
  ],
  related: [
    { id: 'neo-erythropoietin-dose', title: 'Эритропоэтин н/р' },
    { id: 'neo-fenton', title: 'Fenton growth' },
    { id: 'neo-newt', title: 'NEWT weight loss' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
  ],
  info: `### Железо у новорождённых

Iron supplementation OBLIGATORY у preterm (большая часть iron transferred
в 3-м триместре, поэтому preterm rodaяn с low stores).

### Дозы

| Indication | Доза elemental | Frequency |
|---|---|---|
| **Preterm supplementation** | 2 мг/кг/сут | q24h |
| Preterm high (VLBW/ELBW) | 4 мг/кг/сут | q24h |
| **AOP + Epo adjunct** | **6 мг/кг/сут** | q24h |
| IDA treatment | 6 мг/кг/сут | q12h |
| Term breastfed (с 4-6 мес) | 1 мг/кг/сут | q24h |

### Products & elemental %

| Product | % Elemental |
|---|---|
| **Ferrous sulfate** | **20 %** (стандарт) |
| Ferrous fumarate | 33 % |
| Ferrous gluconate | 12 % |
| Iron polymaltose | 100 % (но less GI tolerated) |

### Conversion examples

| Product 100 мг | Elemental Fe |
|---|---|
| Ferrous sulfate | 20 мг |
| Ferrous fumarate | 33 мг |
| Ferrous gluconate | 12 мг |

### Schedule

#### Preterm < 1500 г
- Start: **2-4 нед age** (when enteral feeds tolerated)
- Доза: **2-4 мг/кг/сут** elemental
- Длительность: **до 6-12 мес corrected age**
- Стопаем при transition к iron-rich solid foods

#### AOP + Epo
- Start same time as Epo (или 1 нед прежде)
- Доза: **4-6 мг/кг/сут** elemental
- Без iron — Epo не работает!

#### IDA treatment (any age)
- 6 мг/кг/сут × 3 мес после Hb normalization
- Repeat CBC через 4 нед — Hb ↑ 1-2 г/дл expected

### Cochrane 2014 — Iron в preterm

- Significantly ↓ iron deficiency anemia
- No significant adverse effects (NEC, sepsis)
- Long-term cognitive: insufficient data
- → Recommended standard practice

### Administration

#### Best practices:
- **Empty stomach** preferred (food ↓ absorption 30-50 %)
- **Vit C 50-100 мг** co-administration ↑ absorption 30 %
- **NOT с молоком** (calcium impairs)
- **NOT с antacids / H2 blockers**

#### Если GI symptoms:
- Spread дозу q12h instead of q24h
- Take с small amount of food (compromise)
- Try alternative product (fumarate, gluconate)

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Stained teeth (temp) | + | Rinse, brush |
| Black stools | normal | NOT occult blood |
| Constipation | + | Adequate fluids |
| Diarrhea | rare | Reduce dose |
| Abdominal cramping | + | Spread doses |

### IDA diagnosis

| Lab | IDA |
|---|---|
| **Hb** | < 11 г/дл (term) |
| Hb | < 10.5 г/дл (preterm) |
| **Ferritin** | < 12 нг/мл |
| **TSAT** | < 16 % |
| **MCV** | < 75 fL |
| **RDW** | > 14.5 % |

### Iron overdose (rare у н/р)

- **Toxic dose:** > 60 мг/кг elemental
- **Symptoms:** vomiting, abdominal pain, GI bleeding, lethargy
- **Treatment:** **Deferoxamine** 90 мг/кг IV q8h chelation
- **Prevention:** child-proof bottles, parental education

### Источники

- AAP COFN 2010 Iron requirements у н/р
- ESPGHAN 2014 Iron supplementation в preterm
- WHO 2016 Iron in vulnerable infants
- Cochrane Iron supplementation в preterm 2014
- КР МЗ РФ "Анемия / Железо у н/р" (2024)
`,
};

export default runner;
