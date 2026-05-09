/**
 * Runner: neo-furosemide-dose — Фуросемид (loop diuretic у н/р)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Показания:
 *   - Pulmonary edema (post-resuscitation, sepsis-related)
 *   - Volume overload (renal failure, BPD with cor pulmonale)
 *   - Heart failure (CHD, fluid overload after PDA repair)
 *   - Hyperkalemia как adjunct
 *   - BPD: chronic diuretic for symptomatic improvement (controversial)
 *
 * Дозы:
 *   IV болюс: 1 мг/кг slow push q12-24h (q12h у term + maintenance)
 *   IV continuous: 0.05-0.4 мг/кг/ч (high-output renal failure / refractory)
 *   PO: 1-4 мг/кг q12-24h (chronic для BPD)
 *   Max: 6 мг/кг/сут IV
 *
 * Renal-failure dosing:
 *   Можно увеличить до 2-3 мг/кг IV если no response — but monitor closely
 *
 * SOURCES:
 *   - AAP CFN — Diuretics in BPD
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - Stewart A et al. Cochrane Diuretics for BPD 2017
 *   - КР МЗ РФ "БЛД" (2024)
 *   - Brion LP et al. Cochrane Loop diuretics in respiratory disease 2020
 *
 * Side effects:
 *   - Гипонатриемия, гипокалиемия, гипохлоремия (alkalosis)
 *   - Гиперкальциурия → нефрокальциноз (long-term BPD use)
 *   - Ototoxicity (irreversible — особенно с гентамицином)
 *   - Метаболический алкалоз (chloride loss)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NeoFax / BNFc) · РФ',
  reference: 'AAP CFN. NeoFax. Cochrane Diuretics BPD 2017. КР МЗ РФ "БЛД" (2024).',
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
        { value: 'iv_acute', label: 'IV болюс 1 мг/кг (acute pulm edema)' },
        { value: 'iv_high', label: 'IV болюс 2 мг/кг (refractory)' },
        { value: 'inf_low', label: 'IV continuous 0.05 мг/кг/ч' },
        { value: 'inf_high', label: 'IV continuous 0.2 мг/кг/ч (high-output)' },
        { value: 'po_low', label: 'PO 1 мг/кг q12h (BPD chronic low)' },
        { value: 'po_med', label: 'PO 2 мг/кг q12h (BPD chronic standard)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'iv_acute');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type FurMode = { perKg: number; isInfusion: boolean; route: string; freq: string; label: string };
    const modes: Record<string, FurMode> = {
      iv_acute: { perKg: 1, isInfusion: false, route: 'IV slow push 1-2 мин', freq: 'q12-24h', label: 'IV acute' },
      iv_high: { perKg: 2, isInfusion: false, route: 'IV slow push 1-2 мин', freq: 'q12-24h', label: 'IV high (refractory)' },
      inf_low: { perKg: 0.05, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'IV continuous low' },
      inf_high: { perKg: 0.2, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'IV continuous high' },
      po_low: { perKg: 1, isInfusion: false, route: 'PO через зонд', freq: 'q12h', label: 'PO BPD chronic low' },
      po_med: { perKg: 2, isInfusion: false, route: 'PO через зонд', freq: 'q12h', label: 'PO BPD chronic standard' },
    };
    const m = modes[mode] ?? modes.iv_acute;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const conc = 10; // мг/мл стандартный (vials 20 мг/2 мл)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Фуросемид: ${total.toFixed(2)} мг${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ 10 мг/мл`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (m.isInfusion) {
      actions.push('IV continuous: titrate до urine output > 1 мл/кг/ч');
      actions.push('Continuous предпочтительнее болюса для refractory edema (less hemodynamic perturbation)');
      actions.push('Onset: 5-10 мин IV; peak 30 мин; duration 2-4 ч');
    } else if (mode.startsWith('po')) {
      actions.push('PO bioavailability ~70 % у н/р (variable)');
      actions.push('Onset: 30 мин; peak 1-2 ч; duration 6-8 ч');
      actions.push('Часто сочетается с spironolactone в BPD treatment');
    } else {
      actions.push('IV slow push 1-2 мин (rapid push → reversible ototoxicity)');
      actions.push('Onset: 5-10 мин; peak 30 мин; duration 2-4 ч');
    }

    actions.push('--- Мониторинг ---');
    actions.push('Urine output q1h (target ≥ 1 мл/кг/ч)');
    actions.push('Электролиты q12h (Na, K, Cl, ионизированный Ca)');
    actions.push('Cr / urea q24h (renal function)');
    actions.push('Vital signs q15-30 мин после болюса (hypotension возможна)');

    actions.push('--- При chronic use (BPD) ---');
    actions.push('Дополнить KCl 1-3 мэкв/кг/сут per os (для возмещения K loss)');
    actions.push('Spironolactone 1-3 мг/кг q24h PO (potassium-sparing — добавляется у chronic)');
    actions.push('Renal U/S q3-6 мес — мониторинг nephrocalcinosis');
    actions.push('Auditory brainstem response (ABR) — periodic при > 6 нед курсе');

    actions.push('--- Side effects ---');
    actions.push('Гипонатриемия / гипокалиемия / гипохлоремия (alkalosis)');
    actions.push('Hypocalcemia / hypomagnesemia');
    actions.push('Гиперкальциурия → нефрокальциноз (LSP)');
    actions.push('Ototoxicity — irreversible, особенно с aminoglycosides');
    actions.push('Метаболический алкалоз (chloride loss)');
    actions.push('Hypovolemia / hypotension (dehydration)');
    actions.push('Hyperbilirubinemia (albumin displacement — caution возле exchange threshold)');

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose');
    actions.push('НЕСОВМЕСТИМО (in-line): дофамин, добутамин, gentamicin, vancomycin (separate lumens)');
    actions.push('Caution: rapid push с aminoglycosides — увеличивает ototoxicity');

    return {
      value: total.toFixed(2),
      unit: `мг${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: `${m.label} (${m.perKg} мг/кг ${m.freq})`,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(2)} мг${m.isInfusion ? '/ч' : ''}.`,
      actions,
    };
  },
  caveats: [
    'Cochrane Diuretics for BPD 2017: short-term improvement в lung function, но НЕ улучшает long-term outcomes',
    'Concomitant aminoglycosides — ototoxicity ↑↑ (irreversible) — мониторинг ABR',
    'Chronic use → nephrocalcinosis у 30-50 % (renal U/S q3-6 мес)',
    'Hyperbilirubinemia — albumin displacement; caution у jaundice близкой к exchange threshold',
    'Hypovolemia с overdose — careful titration; готовность к volume replacement',
    'Tolerance / "diuretic resistance" — после длительного применения; rotate к thiazide или add spironolactone',
    'Combination с spironolactone (potassium-sparing) — стандарт для chronic BPD therapy',
    'Не использовать concomitant с hydrocortisone у preterm < 28 нед — повышает GI perforation risk',
    'Furosemide concomitantly с ибупрофеном — НЕ рекомендуется (ибупрофен blunts diuresis)',
    'KCl supplementation 1-3 мэкв/кг/сут при chronic use необходима',
  ],
  related: [
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
    { id: 'neo-ibuprofen-pda-dose', title: 'Ибупрофен PDA' },
  ],
  info: `### Фуросемид — diuretic у новорождённых

Loop diuretic для acute pulmonary edema, volume overload, heart failure,
и chronic BPD therapy (controversial efficacy).

### Дозы

#### Acute IV
| Mode | Доза | Применение |
|---|---|---|
| IV болюс standard | 1 мг/кг q12-24h | Acute pulm edema |
| IV болюс high | 2 мг/кг q12-24h | Refractory |
| IV continuous low | 0.05 мг/кг/ч | Maintenance |
| IV continuous high | 0.2-0.4 мг/кг/ч | High-output renal failure |

#### Chronic PO (BPD)
| Mode | Доза |
|---|---|
| Low | 1 мг/кг q12h |
| Standard | 2 мг/кг q12h |
| Max | 4 мг/кг q12h (rarely) |

### Показания

- **Pulmonary edema** (post-resuscitation, sepsis)
- **Volume overload** (renal failure, post-cardiac surgery)
- **Heart failure** (CHD, after PDA repair)
- **Hyperkalemia** как adjunct
- **BPD chronic** (controversial — short-term improvement)

### BPD treatment (chronic)

#### Combination protocol:
1. **Furosemide** 1-2 мг/кг q12h PO
2. **Spironolactone** 1-3 мг/кг q24h PO (potassium-sparing)
3. **KCl** supplementation 1-3 мэкв/кг/сут
4. **Calcium / vitamin D** для bone health

#### Cochrane 2017:
- Short-term: ↑ FEV1, ↓ resistance, ↓ FiO₂ requirements
- Long-term: NO significant benefit в death, BPD, neurodev outcomes
- Trade-offs: nephrocalcinosis, ototoxicity, electrolyte imbalance

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Hyponatremia | 20-30 % | Adjust IVF Na, ограничить furosemide |
| Hypokalemia | 30-50 % | KCl supplementation |
| Гиперкальциурия | 30-50 % | Spironolactone, thiazide adjunct |
| Ototoxicity | rare alone, ↑ с amino | Avoid concomitant gent |
| Метаболический алкалоз | common chronic | Adjust IVF, KCl |
| Hypovolemia | overdose | Volume replacement |
| Hyperbilirubinemia | rare | Caution возле exchange |

### Сравнение с thiazide diuretics

| | Furosemide | Hydrochlorothiazide | Chlorothiazide |
|---|---|---|---|
| **Site action** | Loop of Henle | Distal tubule | Distal tubule |
| **Potency** | high | moderate | moderate |
| **Onset PO** | 30 мин | 1-2 ч | 1-2 ч |
| **Duration** | 6-8 ч | 6-12 ч | 6-12 ч |
| **Гиперкальциурия** | + | ↓ | ↓ |
| **Use BPD** | acute | chronic | chronic |

### Ototoxicity

- **Mechanism:** stria vascularis damage
- **Risk factors:** rapid IV push, high dose, concomitant aminoglycosides
- **Mitigation:** slow push (≥ 2 мин), avoid concomitant gent if possible
- **Monitoring:** ABR при курсе > 4 нед

### Совместимость

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | Dopamine |
| 5 % Glucose | Dobutamine |
| Lactated Ringer | Gentamicin |
| Heparin | Vancomycin |
| Hydrocortisone | Pheniramine |

### Источники

- AAP CFN — Diuretics in BPD
- Stewart A et al. Cochrane Diuretics for BPD 2017
- Brion LP et al. Cochrane Loop diuretics in respiratory disease 2020
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "БЛД" (2024)
`,
};

export default runner;
