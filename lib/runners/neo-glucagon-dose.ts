/**
 * Runner: neo-glucagon-dose — Глюкагон (CHI emergency / hypoglycemia adjunct)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Pancreatic α-cell hormone — counter-regulates insulin. Используется
 * при congenital hyperinsulinism (CHI) emergency и refractory hypoglycemia
 * до получения maintenance therapy (diazoxide).
 *
 * Дозы:
 *   Emergency CHI / hypoglycemia: 0.1-0.3 мг/кг IM/IV/SC
 *   Continuous infusion (CHI bridge): 0.005-0.02 мг/кг/ч (5-20 мкг/кг/ч)
 *
 * Showings:
 *   - Refractory hypoglycemia с GIR ≥ 12 мг/кг/мин
 *   - Suspected CHI (после workup)
 *   - Bridge to diazoxide / surgery
 *   - Beta-blocker overdose у adult (off-label у н/р)
 *
 * Effect:
 *   - Glycogenolysis в liver — quick glucose release
 *   - Onset: 5-15 мин IV; peak 15-30 мин; duration 30-90 мин
 *   - Limited effect (короткий period) — bridge только
 *
 * SOURCES:
 *   - Thornton PS PES 2015 — neonatal hypoglycemia
 *   - AAP CFN — hypoglycemia management
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - Кornelisse RF et al. — CHI emergency treatment
 *   - КР МЗ РФ "Гипогликемия / CHI у н/р" (2024)
 *
 * NB: Не routine — используется только при refractory hypoglycemia
 * с подозрением на CHI.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (PES 2015 / AAP / NeoFax)',
  reference: 'Thornton PS PES 2015. AAP CFN — hypoglycemia. NeoFax. Кornelisse — CHI emergency.',
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
        { value: 'em_low', label: 'Emergency 0.1 мг/кг IM/IV/SC (low)' },
        { value: 'em_med', label: 'Emergency 0.2 мг/кг IM/IV/SC (стандарт)' },
        { value: 'em_high', label: 'Emergency 0.3 мг/кг IM/IV/SC (max bolus)' },
        { value: 'inf_low', label: 'Infusion 0.005 мг/кг/ч (5 мкг/кг/ч bridge)' },
        { value: 'inf_med', label: 'Infusion 0.01 мг/кг/ч (10 мкг/кг/ч)' },
        { value: 'inf_high', label: 'Infusion 0.02 мг/кг/ч (20 мкг/кг/ч max)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'em_med');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type GlucMode = { perKg: number; isInfusion: boolean; route: string; freq: string; label: string };
    const modes: Record<string, GlucMode> = {
      em_low: { perKg: 0.1, isInfusion: false, route: 'IM/IV/SC', freq: 'однократно', label: 'Emergency low' },
      em_med: { perKg: 0.2, isInfusion: false, route: 'IM/IV/SC', freq: 'однократно', label: 'Emergency standard' },
      em_high: { perKg: 0.3, isInfusion: false, route: 'IM/IV/SC', freq: 'однократно (max bolus)', label: 'Emergency high' },
      inf_low: { perKg: 0.005, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'Infusion low (bridge)' },
      inf_med: { perKg: 0.01, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'Infusion standard' },
      inf_high: { perKg: 0.02, isInfusion: true, route: 'IV continuous', freq: '/ч', label: 'Infusion max' },
    };
    const m = modes[mode] ?? modes.em_med;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    // Concentration после reconstitution: 1 мг + 1 мл diluent = 1 мг/мл (стандарт vials)
    const conc = 1;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Глюкагон: ${total.toFixed(3)} мг${m.isInfusion ? '/ч' : ''} = ${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''} @ 1 мг/мл (reconstituted)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Путь: ${m.route}`);

    if (m.isInfusion) {
      actions.push('--- Continuous infusion ---');
      actions.push('Применение: bridge to diazoxide / surgery в CHI');
      actions.push('Onset: 5-15 мин; sustained effect при continuous');
      actions.push('Combine с ↑ GIR (15-25 мг/кг/мин central) для adequate glucose');
      actions.push('Wean при transition к diazoxide PO');
    } else {
      actions.push('--- Emergency bolus ---');
      actions.push('Onset: 5-15 мин IV; peak 15-30 мин; duration 30-90 мин');
      actions.push('Repeat doses возможны при recurrence: q15-30 мин');
      actions.push('Limited duration → bridge только; не sustained therapy');
      actions.push('Если no response — alternative diagnosis (sepsis, IEM)');
    }

    actions.push('--- ⚠️ Showings (narrow) ---');
    actions.push('Refractory hypoglycemia с GIR ≥ 12-15 мг/кг/мин');
    actions.push('Подозрение на CHI (insulin/glucose ratio > 0.3 при гипогликемии)');
    actions.push('Bridge to diazoxide / surgical workup');
    actions.push('НЕ routine для general hypoglycemia');

    actions.push('--- Mechanism ---');
    actions.push('Glycogenolysis в hepatocytes → release glucose в blood');
    actions.push('Также lipolysis (less relevant у н/р)');
    actions.push('Adenylate cyclase activation → ↑ cAMP');
    actions.push('Limitation: depends на hepatic glycogen stores (low у preterm, post-asphyxia)');

    actions.push('--- Мониторинг ---');
    actions.push('Glucose q15-30 мин first 2 ч после bolus');
    actions.push('Vital signs continuous: ЧСС (тахикардия), АД (АГ возможна)');
    actions.push('Electrolytes: K (intracellular shift, hypokalemia)');
    actions.push('При infusion: q1h glucose, q4h electrolytes');

    actions.push('--- Side effects ---');
    actions.push('Тошнота, vomiting (rare у н/р, common у adult)');
    actions.push('Hyperglycemia rebound (особенно при repeated doses)');
    actions.push('Hypokalemia (intracellular shift)');
    actions.push('Allergic reactions (rare)');
    actions.push('Тахикардия, гипертензия (catecholamine surge)');

    actions.push('--- Bridge to definitive therapy ---');
    actions.push('CHI: diazoxide 5-15 мг/кг/сут PO q8h (KATP channel opener)');
    actions.push('Octreotide 5-25 мкг/кг/сут SC (KATP-resistant CHI)');
    actions.push('Surgery: partial pancreatectomy (focal CHI)');
    actions.push('Genetic testing (KCNJ11, ABCC8, GLUD1, GCK mutations)');

    return {
      value: total.toFixed(3),
      unit: `мг${m.isInfusion ? '/ч' : ''} (${vol.toFixed(2)} мл${m.isInfusion ? '/ч' : ''})`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг${m.isInfusion ? '/ч' : ''} × ${w} кг = ${total.toFixed(3)} мг${m.isInfusion ? '/ч' : ''} ${m.route}.`,
      actions,
    };
  },
  caveats: [
    'Глюкагон — emergency / bridge только; не sustained therapy',
    'Limited effectiveness у preterm и post-asphyxia (low hepatic glycogen stores)',
    'Refractory hypoglycemia с GIR ≥ 12-15 мг/кг/мин — workup CHI: insulin/glucose ratio, β-OH butyrate, FFA',
    'CHI suspected: bridge с глюкагоном infusion 0.005-0.02 мг/кг/ч + ↑ GIR до 15-25 мг/кг/мин',
    'Definitive: diazoxide 5-15 мг/кг/сут PO; octreotide для KATP-resistant',
    'Hypokalemia possible (intracellular shift) — monitor q4h',
    'Onset 5-15 мин; duration 30-90 мин — short bridge',
    'Reconstitution: 1 мг vial + 1 мл diluent = 1 мг/мл; stable 24 ч @ 25°C',
    'Tachycardia / hypertension expected (catecholamine surge)',
    'Não rutinen для general hypoglycemia (D10W bolus + GIR — first-line)',
  ],
  related: [
    { id: 'neo-glucose-bolus-dose', title: 'Глюкоза болюс' },
    { id: 'neo-gir', title: 'GIR calculator' },
    { id: 'neo-insulin-dose', title: 'Инсулин н/р' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
  ],
  info: `### Глюкагон у новорождённых

Pancreatic α-cell hormone — counter-regulates insulin. Используется
при CHI (congenital hyperinsulinism) emergency и refractory hypoglycemia
как bridge к definitive therapy.

### Дозы

#### Emergency bolus
| Уровень | Доза |
|---|---|
| Low | 0.1 мг/кг IM/IV/SC |
| **Standard** | **0.2 мг/кг IM/IV/SC** |
| Max | 0.3 мг/кг IM/IV/SC |

#### Continuous infusion (bridge)
| Уровень | Доза |
|---|---|
| Low | 0.005 мг/кг/ч (5 мкг/кг/ч) |
| Medium | 0.01 мг/кг/ч (10 мкг/кг/ч) |
| Max | 0.02 мг/кг/ч (20 мкг/кг/ч) |

### Pharmacokinetics

| Параметр | Value |
|---|---|
| **Onset IV** | 5-15 мин |
| **Peak** | 15-30 мин |
| **Duration** | 30-90 мин |
| **t½** | 5-15 мин |

### Когда использовать

#### YES (narrow):
- **Refractory hypoglycemia** с GIR ≥ 12-15 мг/кг/мин
- **CHI suspected** (insulin/glucose > 0.3 при гипогликемии)
- **Bridge to diazoxide** / surgery
- **Hyperinsulinism crisis** (acute decompensation)

#### NO:
- General hypoglycemia (D10W bolus + GIR first)
- Asphyxia-related hypoglycemia (low glycogen → no effect)
- Sepsis (limited effect)
- Liver failure (no glycogen stores)

### CHI workup при подозрении

| Lab | CHI consistent |
|---|---|
| Insulin / glucose ratio | > 0.3 при гипогликемии |
| β-OH butyrate | inappropriately низкий (< 1 ммоль/л) |
| Free fatty acids | inappropriately низкие |
| Ammonia | повышен у HI/HA syndrome |
| Lactate | повышен у GSD |
| Cortisol, GH | rule out adrenal/pituitary |

### Mechanism

1. Глюкагон → adenylate cyclase → ↑ cAMP
2. Activation glycogen phosphorylase → glycogenolysis
3. Также lipolysis (less relevant у н/р)
4. **Limitation:** depends на hepatic glycogen stores

### Limitations

- **Preterm:** низкие glycogen stores → poor response
- **Post-asphyxia:** depleted glycogen → poor response
- **Liver failure:** no glycogen → no effect
- **Hyperglycemia rebound** при repeated doses

### Bridge to definitive therapy

| Препарат | Application |
|---|---|
| **Diazoxide** 5-15 мг/кг/сут PO | KATP channel opener (CHI maintenance) |
| **Octreotide** 5-25 мкг/кг/сут SC | KATP-resistant CHI |
| **Surgery** | Partial pancreatectomy (focal CHI) |
| **Genetic testing** | KCNJ11, ABCC8, GLUD1, GCK mutations |

### Side effects

| Effect | Mechanism | Management |
|---|---|---|
| Vomiting | rare у н/р | Position |
| Rebound hyperglycemia | repeated doses | Monitor q15-30 мин |
| Hypokalemia | intracellular shift | Monitor K q4h |
| Tachycardia / HTN | catecholamine | Self-limited |
| Allergic reactions | rare | Discontinue |

### Источники

- Thornton PS PES 2015 — neonatal hypoglycemia
- AAP CFN — hypoglycemia management
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- Кornelisse RF et al. — CHI emergency treatment
- КР МЗ РФ "Гипогликемия / CHI у н/р" (2024)
`,
};

export default runner;
