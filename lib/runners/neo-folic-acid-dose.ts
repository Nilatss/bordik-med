/**
 * Runner: neo-folic-acid-dose — Фолиевая кислота (preterm + AOP supplementation)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Folic acid supplementation для preterm и при megaloblastic anemia.
 * Co-administration с iron + Epo для optimal erythropoiesis.
 *
 * Дозы:
 *   Preterm supplementation: 50 мкг/кг/сут PO (≈ 100-200 мкг/сут общий)
 *   AOP + Epo adjunct: 50 мкг/кг/сут (стандарт)
 *   Megaloblastic anemia treatment: 100-300 мкг/сут × 1-3 мес
 *   Maternal antenatal (NTD prevention): 400-800 мкг/сут (preconception)
 *
 * SOURCES:
 *   - AAP COFN — folic acid в preterm
 *   - ESPGHAN 2010 — folate supplementation в preterm
 *   - WHO 2017 — folate в children
 *   - КР МЗ РФ "Анемия / Витамины у н/р" (2024)
 *
 * 1 мкг = 0.001 мг
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / ESPGHAN / WHO) · РФ',
  reference: 'AAP COFN folic acid. ESPGHAN 2010. WHO 2017. КР МЗ РФ.',
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
        { value: 'preterm_supp', label: 'Preterm supplementation 50 мкг/кг/сут' },
        { value: 'epo_adjunct', label: 'AOP + Epo adjunct 50 мкг/кг/сут' },
        { value: 'megalo_low', label: 'Megaloblastic anemia 100 мкг/сут' },
        { value: 'megalo_high', label: 'Megaloblastic anemia high 300 мкг/сут' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'preterm_supp');

    if (w <= 0 || w > 10) {
      return { value: '—', interpretation: 'Введите массу 0.4-10 кг', color: '#9CA3AF', details: '' };
    }

    type FolMode = { mcgPerKgPerDay?: number; absoluteMcgPerDay?: number; freq: string; duration: string; label: string };
    const modes: Record<string, FolMode> = {
      preterm_supp: { mcgPerKgPerDay: 50, freq: 'q24h', duration: 'до 6-12 мес corrected age', label: 'Preterm supplementation' },
      epo_adjunct: { mcgPerKgPerDay: 50, freq: 'q24h', duration: 'на time of Epo therapy', label: 'AOP + Epo adjunct' },
      megalo_low: { absoluteMcgPerDay: 100, freq: 'q24h', duration: '1-3 мес', label: 'Megaloblastic low' },
      megalo_high: { absoluteMcgPerDay: 300, freq: 'q24h', duration: '1-3 мес', label: 'Megaloblastic high' },
    };
    const m = modes[mode] ?? modes.preterm_supp;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }

    const totalMcgPerDay = m.absoluteMcgPerDay ? m.absoluteMcgPerDay : (m.mcgPerKgPerDay ?? 50) * w;
    // Drops 50 мкг/мл (или 1000 мкг/мл concentrated)
    const conc = 50;
    const volPerDay = totalMcgPerDay / conc;

    const actions: string[] = [];
    actions.push(`Фолиевая кислота: ${totalMcgPerDay.toFixed(0)} мкг/сут = ${(totalMcgPerDay / 1000).toFixed(2)} мг/сут`);
    actions.push(`Объём: ${volPerDay.toFixed(2)} мл/сут @ 50 мкг/мл (drops)`);
    actions.push(`Длительность: ${m.duration}`);
    actions.push('Путь: PO drops, can mix with breast milk или formula');

    if (mode === 'preterm_supp') {
      actions.push('--- Preterm supplementation ---');
      actions.push('Start: 2-4 нед age (когда enteral feeds tolerated)');
      actions.push('Continue: до 6-12 мес corrected age');
      actions.push('Combine с iron + vit D supplementation');
      actions.push('Folate stores низкие у preterm (transferred preferential 3-й триместр)');
    } else if (mode === 'epo_adjunct') {
      actions.push('--- AOP + Epo adjunct ---');
      actions.push('Iron + folate + vit B12 + vit E — все нужны для optimal erythropoiesis');
      actions.push('Без adequate folate: megaloblastic features имеется при reticulocytosis');
      actions.push('50 мкг/кг/сут PO co-administration с Epo');
    } else if (mode.startsWith('megalo')) {
      actions.push('--- Megaloblastic anemia treatment ---');
      actions.push('Investigate cause: dietary, malabsorption (celiac), drug-induced (anticonvulsants)');
      actions.push('Concurrent vit B12 — обязательно проверить (B12 deficiency masked by folate replacement)');
      actions.push('Recheck CBC через 2-4 нед: reticulocytosis 5-7 дней; Hb ↑ 1-2 г/дл/нед');
      actions.push('Длительность: 1-3 мес, затем maintenance dose 50 мкг/кг/сут');
    }

    actions.push('--- Co-administration ---');
    actions.push('Combine с iron supplementation (especially у preterm + AOP)');
    actions.push('Vit B12 0.5 мкг/сут if needed');
    actions.push('Vit E 25 ед/сут');
    actions.push('Avoid: methotrexate, sulfasalazine (folate antagonists)');

    actions.push('--- Мониторинг ---');
    actions.push('CBC monthly');
    actions.push('Reticulocyte count baseline + 1-2 нед if megaloblastic');
    actions.push('Peripheral blood smear for hypersegmented neutrophils (folate / B12 deficiency)');
    actions.push('Folate level (red cell folate predпочтительнее serum) — ideal');

    actions.push('--- Side effects ---');
    actions.push('Typically well-tolerated');
    actions.push('Rare: GI upset, allergic reaction');
    actions.push('Overdose: rare adverse effects (water-soluble — excreted)');
    actions.push('Concern: B12 deficiency masked by folate replacement (always check B12)');

    return {
      value: totalMcgPerDay.toFixed(0),
      unit: 'мкг/сут',
      interpretation: m.label,
      color: '#22C55E',
      details: `${totalMcgPerDay.toFixed(0)} мкг/сут (${(totalMcgPerDay / 1000).toFixed(2)} мг/сут) PO ${m.freq} × ${m.duration}.`,
      actions,
    };
  },
  caveats: [
    'Preterm supplementation: low folate stores (preferential transfer 3rd trimester)',
    'AOP + Epo: folate adjunct for optimal erythropoiesis (всегда co-administer)',
    'B12 deficiency must be ruled out перед high-dose folate (masking возможно)',
    'Anticonvulsants (phenytoin, phenobarbital) ↓ folate levels — supplement обязательно',
    'Sulfasalazine, methotrexate, trimethoprim — folate antagonists',
    'Hypersegmented neutrophils в peripheral blood — sign deficiency (folate or B12)',
    'Red cell folate level (3-mo retrospective) > serum level (2-wk window)',
    'Maternal NTD prevention: 400-800 мкг/сут preconceptionally — separate from newborn',
    'Long-term high-dose: theoretical concern colorectal cancer (adults), не relevant у н/р',
    'Neural tube defects already formed at birth — folate не reverses',
  ],
  related: [
    { id: 'neo-iron-dose', title: 'Железо preterm' },
    { id: 'neo-erythropoietin-dose', title: 'Эритропоэтин' },
    { id: 'neo-vitamin-d-dose', title: 'Витамин D' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
  ],
  info: `### Фолиевая кислота у новорождённых

Folate supplementation для preterm + adjunct в AOP/Epo therapy.

### Дозы

| Indication | Доза | Frequency |
|---|---|---|
| **Preterm supplementation** | 50 мкг/кг/сут | q24h |
| AOP + Epo adjunct | 50 мкг/кг/сут | q24h |
| Megaloblastic anemia low | 100 мкг/сут | q24h |
| Megaloblastic anemia high | 300 мкг/сут | q24h |

### Co-administration с другими

| Supplement | Доза |
|---|---|
| **Iron** | 2-6 мг/кг/сут elemental |
| Folic acid | 50 мкг/кг/сут |
| Vit D | 400-800 ед/сут |
| Vit E | 25 ед/сут |
| Vit B12 | 0.5 мкг/сут (if needed) |

### Megaloblastic anemia diagnosis

| Feature | Value |
|---|---|
| **MCV** | > 100 fL (macrocytic) |
| **Hypersegmented neutrophils** | + |
| **Red cell folate** | < 100 нг/мл |
| **Serum folate** | < 3 нг/мл |
| **Vit B12** | check (rule out) |

### Causes deficiency

| Cause | Mechanism |
|---|---|
| Inadequate intake | Diet, NPO, breast feeding without supplement |
| Malabsorption | Celiac, IBD, short bowel |
| Increased demand | Hemolysis, pregnancy |
| Drug-induced | Phenytoin, phenobarbital, sulfasalazine, methotrexate, TMP |
| Genetic | MTHFR variants |

### B12 deficiency masking

⚠️ **Always check B12** перед high-dose folate replacement.
Folate alone treats megaloblastic anemia без correcting B12 deficiency
neurologic damage (potentially irreversible).

### Drug interactions

| Drug | Effect |
|---|---|
| Phenytoin | ↓ folate; folate ↓ phenytoin levels |
| Phenobarbital | ↓ folate |
| Methotrexate | folate antagonist (folinic acid rescue) |
| Sulfasalazine | folate antagonist |
| Trimethoprim | folate antagonist |

### Источники

- AAP COFN — folic acid в preterm
- ESPGHAN 2010 — folate supplementation
- WHO 2017 — folate в children
- КР МЗ РФ "Анемия / Витамины у н/р" (2024)
`,
};

export default runner;
