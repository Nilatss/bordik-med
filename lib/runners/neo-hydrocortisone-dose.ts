/**
 * Runner: neo-hydrocortisone-dose — Гидрокортизон (refractory hypotension / adrenal)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Показания:
 *   - Refractory hypotension у н/р (после adequate volume + vasopressors)
 *   - Adrenal insufficiency (CAH, secondary, ELBW preterm)
 *   - PRINCETON / NICHD trials — hydrocortisone для BPD prevention
 *     (controversial — снижает BPD но риск GI perforation, hyperglycemia)
 *
 * Дозы:
 *   Refractory hypotension: 1 мг/кг q8h IV × 5 дней (затем taper)
 *   Adrenal insufficiency / replacement: 1-2 мг/кг q8h
 *   CAH (salt-wasting): 8-15 мг/м²/сут разделить q8h + флудрокортизон
 *   BPD prevention (PRINCETON regimen): 1 мг/кг/сут × 7 дней → 0.5 мг/кг/сут × 3 дня
 *     (controversial — обсудить с consultant)
 *
 * SOURCES:
 *   - Watterberg KL et al. PRINCETON-2 trial (Pediatrics 2007)
 *   - Watterberg KL et al. NICHD Hydrocortisone trial (NEJM 2022;386:1099)
 *   - AAP CFN 2018 — Hemodynamic management
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Адренокортикальная недостаточность" / "БЛД" (2024)
 *   - Cochrane Postnatal corticosteroids 2017
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (PRINCETON / NICHD / AAP) · РФ',
  reference: 'Watterberg PRINCETON-2 Pediatrics 2007. NICHD trial NEJM 2022;386:1099. AAP CFN 2018.',
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
      id: 'indication',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'refractory_hypo', label: 'Refractory hypotension (1 мг/кг q8h × 5 дней)' },
        { value: 'adrenal', label: 'Adrenal insufficiency (1 мг/кг q8h)' },
        { value: 'cah_replace', label: 'CAH replacement (15 мг/м²/сут q8h)' },
        { value: 'bpd_high', label: 'BPD prevention high (1 мг/кг/сут q12h × 7 дней)' },
        { value: 'bpd_taper', label: 'BPD prevention taper (0.5 мг/кг/сут q12h × 3 дня)' },
        { value: 'stress', label: 'Stress dose surgery (50 мг/м² × 1)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const indication = String(values.indication ?? 'refractory_hypo');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    // BSA approximation для CAH (Mosteller у н/р): √((Ht_cm × Wt_kg) / 3600)
    // Упрощение: BSA ≈ Wt × 0.05 для н/р (более accurate чем length-based)
    const bsa = w * 0.05; // м² (~0.2 m² для 4 кг newborn)

    type Reg = { perKg?: number; perBsa?: number; freq: string; duration: string; label: string };
    const regimens: Record<string, Reg> = {
      refractory_hypo: { perKg: 1, freq: 'q8h', duration: '5 дней (затем taper)', label: 'Refractory hypotension' },
      adrenal: { perKg: 1.5, freq: 'q8h', duration: 'maintenance', label: 'Adrenal insufficiency' },
      cah_replace: { perBsa: 5, freq: 'q8h', duration: 'lifelong', label: 'CAH replacement (15 мг/м²/сут)' },
      bpd_high: { perKg: 0.5, freq: 'q12h', duration: '7 дней', label: 'BPD prevention high' },
      bpd_taper: { perKg: 0.25, freq: 'q12h', duration: '3 дня', label: 'BPD prevention taper' },
      stress: { perBsa: 50, freq: 'однократно', duration: 'pre-op', label: 'Stress dose' },
    };
    const r = regimens[indication] ?? regimens.refractory_hypo;
    if (!r) {
      return { value: '—', interpretation: 'Неизвестное показание', color: '#9CA3AF', details: '' };
    }

    let totalPerDose = 0;
    if (r.perKg) totalPerDose = w * r.perKg;
    else if (r.perBsa) totalPerDose = bsa * r.perBsa;

    const conc = 50; // мг/мл стандартный после reconstitution из 100 мг vial в 2 мл
    const vol = totalPerDose / conc;

    const actions: string[] = [];
    actions.push(`Гидрокортизон: ${totalPerDose.toFixed(1)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл`);
    actions.push(`Доза: ${r.perKg ? r.perKg + ' мг/кг' : r.perBsa + ' мг/м²'} ${r.freq}`);
    actions.push(`Длительность: ${r.duration}`);
    actions.push('Путь: IV slow push 2-3 мин (или IV infusion 15-30 мин); IM возможно');

    if (indication === 'refractory_hypo') {
      actions.push('--- Refractory hypotension protocol ---');
      actions.push('Показано после: adequate volume (NS 10-20 мл/кг × 2-3) + dopamine ≥ 10 мкг/кг/мин');
      actions.push('Reasoning: relative adrenal insufficiency у preterm + sepsis');
      actions.push('Effect: ↑ vasoresponse к catecholamines в течение 1-2 ч');
      actions.push('После 5 дней: ↓ 50 % (0.5 мг/кг q8h × 1 день) → stop');
    } else if (indication.startsWith('bpd')) {
      actions.push('--- BPD prevention (controversial) ---');
      actions.push('Watterberg PRINCETON-2: ↓ BPD у extreme preterm (< 1000 г), но GI perforation ↑');
      actions.push('NICHD 2022 trial: hydrocortisone vs placebo у ELBW — не уменьшает death/BPD');
      actions.push('Альтернатива: dexamethasone DART regimen (controversial)');
      actions.push('Discuss с senior / NICU team — не routine');
    } else if (indication === 'cah_replace') {
      actions.push('--- CAH replacement (life-long) ---');
      actions.push('15 мг/м²/сут разделить q8h + fludrocortisone 0.05-0.2 мг/сут (salt-wasting)');
      actions.push('Stress doses при febrile illness, surgery: × 3 dose');
      actions.push('Endocrinology consult обязателен');
    } else if (indication === 'stress') {
      actions.push('--- Stress dose pre-op ---');
      actions.push('50 мг/м² IV ≥ 30 мин до индукции (+ post-op коverage)');
      actions.push('У детей с известной adrenal insufficiency или > 7 дней predniso');
    }

    actions.push('--- Side effects ---');
    actions.push('Hyperglycemia (мониторинг гликемии q4-6h)');
    actions.push('Иммуносupressия — мониторинг для sepsis');
    actions.push('GI perforation — высокий риск у ELBW (особенно с indomethacin/ибупрофеном)');
    actions.push('Cardiac hypertrophy при длительном использовании > 14 дней');
    actions.push('Adrenal suppression у curse > 7 дней — taper обязателен');
    actions.push('Bone density ↓ при long-term — calcium / vitamin D');

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose, lactated Ringer');
    actions.push('НЕСОВМЕСТИМО (in-line): heparin, амикацин, фенобарбитал (separate lumens)');

    return {
      value: totalPerDose.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${r.label} (${r.perKg ? r.perKg + ' мг/кг' : r.perBsa + ' мг/м²'} ${r.freq})`,
      color: '#3B82F6',
      details: `${r.perKg ? `${r.perKg} мг/кг × ${w} кг` : `${r.perBsa} мг/м² × ${bsa.toFixed(2)} м²`} = ${totalPerDose.toFixed(1)} мг ${r.freq}.`,
      actions,
    };
  },
  caveats: [
    'Refractory hypotension: показан только после adequate volume + dopamine ≥ 10 мкг/кг/мин',
    'PRINCETON-2 (Watterberg 2007): hydrocortisone у ELBW снижает BPD, но повышает GI perforation',
    'NICHD 2022 trial (Watterberg NEJM 386:1099): hydrocortisone не улучшает outcomes у ELBW',
    'Concomitant indomethacin / ибупрофен — повышает риск GI perforation в 5-10 раз',
    'Hyperglycemia у 30-50 % при дозе ≥ 1 мг/кг q8h — мониторинг гликемии q4-6h',
    'Adrenal suppression при курсе > 7 дней — taper 50 % q24h',
    'CAH replacement: 15 мг/м²/сут — стандарт; stress doses × 3 при illness',
    'BSA у н/р: упрощение Wt × 0.05 (vs Mosteller для precision)',
    'Caution в combination с phenobarbital, rifampin, фенитоин — индукция cytochrom P450 → ↑ метаболизм',
    'Не использовать рутинно — controversial у preterm; индивидуальное решение',
  ],
  related: [
    { id: 'neo-dopamine-dose', title: 'Допамин н/р' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-nsofa', title: 'Neonatal SOFA' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
  ],
  info: `### Гидрокортизон у новорождённых

Кортикостероид для refractory hypotension, adrenal insufficiency,
controversial для BPD prevention.

### Показания

| Indication | Доза | Длительность |
|---|---|---|
| **Refractory hypotension** | 1 мг/кг q8h | 5 дней + taper |
| **Adrenal insufficiency** | 1-2 мг/кг q8h | maintenance |
| **CAH replacement** | 15 мг/м²/сут q8h + flud | lifelong |
| **BPD prevention high** | 1 мг/кг/сут q12h | 7 дней |
| **BPD prevention taper** | 0.5 мг/кг/сут q12h | 3 дня |
| **Stress dose pre-op** | 50 мг/м² × 1 | пред-op |

### Refractory hypotension protocol

1. **Adequate volume:** NS 10-20 мл/кг × 2-3 болюса
2. **First-line vasopressor:** Dopamine ≥ 10 мкг/кг/мин
3. **Persistent hypotension** despite above
4. **Hydrocortisone 1 мг/кг q8h** × 5 дней
5. **Mechanism:** corrects relative adrenal insufficiency
6. **Effect:** ↑ vasoresponse за 1-2 ч
7. **Taper:** ↓ 50 % q24h после 5 дней

### BPD prevention (controversial)

#### PRINCETON-2 (Watterberg 2007 Pediatrics)
- ELBW < 1000 г, GA < 28 нед
- Hydrocortisone 1 мг/кг/сут × 7 d → 0.5 × 3 d
- ↓ BPD risk (28 vs 41 %)
- ↑ GI perforation (особенно с indomethacin)

#### NICHD 2022 (Watterberg NEJM 386:1099)
- 800 ELBW newborns
- Hydrocortisone vs placebo
- **Не улучшает** death/severe BPD composite outcome
- Discuss с senior / individualized

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Hyperglycemia | 30-50 % | Мониторинг q4-6h, insulin при необходимости |
| GI perforation | 1-5 % (↑ с indo/ibu) | Avoid concomitant NSAIDs |
| Иммуносupressия | — | Мониторинг для sepsis |
| Cardiac hypertrophy | при > 14 дней | Echo follow-up |
| Adrenal suppression | > 7 дней usage | Taper обязателен |
| Hypertension | rare | Снизить дозу |

### Сравнение vs Dexamethasone

| | Hydrocortisone | Dexamethasone |
|---|---|---|
| **Potency** | 1× | 25-30× |
| **Mineralocorticoid** | + | minimal |
| **Effect for BPD** | ↓ BPD (PRINCETON) | ↓ BPD (DART trial) |
| **Brain effects** | safer | concerning у extreme preterm (Yeh 1998) |
| **Use** | Refractory hypoten / adrenal | DART regimen для BPD |

### Совместимость

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | Heparin |
| 5 % Glucose | Амикацин |
| Lactated Ringer | Фенобарбитал |
| Most antibiotics | Diazepam |

### Источники

- Watterberg KL et al. PRINCETON-2 Pediatrics 2007
- Watterberg KL et al. NICHD trial NEJM 2022;386:1099
- AAP CFN 2018 — Hemodynamic management
- Cochrane Postnatal corticosteroids 2017
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "Адренокортикальная недостаточность" / "БЛД" (2024)
`,
};

export default runner;
