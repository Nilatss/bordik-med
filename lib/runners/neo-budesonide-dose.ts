/**
 * Runner: neo-budesonide-dose — Будесонид (BPD inhalation / intra-tracheal)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Inhaled corticosteroid (ICS) для BPD prevention / treatment у preterm.
 * Yeh's intratracheal budesonide trial (NEJM 2016): mixed с surfactant —
 * ↓ BPD без increased adverse effects.
 *
 * Дозы:
 *   Intra-tracheal mixed surfactant (Yeh protocol):
 *     0.25 мг/кг intratracheal, mixed с 1-я доза surfactant, repeated с 2-я доза
 *     (если повторная surfactant нужна)
 *
 *   Inhaled (nebulization):
 *     500 мкг q12h via nebulizer (1 мг/сут общий) × несколько недель
 *     (используется при established BPD — controversial у preterm)
 *
 *   Inhaled chronic for BPD (alternative dexamethasone systemic):
 *     200-500 мкг q12h via nebulizer × до 4-6 нед, затем wean
 *
 * SOURCES:
 *   - Yeh TF et al. NEJM 2016;374:2229 — intra-tracheal budesonide + surfactant
 *   - Bassler D et al. NEJM 2015;373:1497 — NEUROSIS trial (chronic inhaled budesonide preterm)
 *   - Cochrane Inhaled corticosteroids для BPD 2017
 *   - AAP CFN — BPD management
 *   - КР МЗ РФ "БЛД" (2024)
 *
 * NB: Yeh трактат — single cohort показал ↑ neurodev outcome, but later studies mixed.
 * Bassler 2015 (NEUROSIS): инhaled budesonide ↓ BPD но ↑ mortality (controversial finding).
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Yeh / Bassler / Cochrane) · РФ',
  reference: 'Yeh TF NEJM 2016;374:2229. Bassler D NEUROSIS NEJM 2015;373:1497. Cochrane 2017.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 3,
      step: 0.01,
    },
    {
      id: 'mode',
      label: 'Режим',
      type: 'select',
      options: [
        { value: 'yeh_protocol', label: 'Yeh intra-tracheal: 0.25 мг/кг + surfactant' },
        { value: 'nebulizer_low', label: 'Nebulizer 200 мкг q12h (low chronic)' },
        { value: 'nebulizer_med', label: 'Nebulizer 500 мкг q12h (стандарт)' },
        { value: 'nebulizer_high', label: 'Nebulizer 500 мкг q6h (high acute)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'yeh_protocol');

    if (w <= 0 || w > 3) {
      return { value: '—', interpretation: 'Введите массу 0.4-3 кг (preterm)', color: '#9CA3AF', details: '' };
    }

    type BudesoMode = { perKg?: number; absoluteMcg?: number; freq: string; route: string; label: string };
    const modes: Record<string, BudesoMode> = {
      yeh_protocol: { perKg: 0.25, freq: 'mixed surfactant', route: 'Intra-tracheal mixed с surfactant', label: 'Yeh intra-tracheal' },
      nebulizer_low: { absoluteMcg: 200, freq: 'q12h', route: 'Nebulizer', label: 'Nebulizer low chronic' },
      nebulizer_med: { absoluteMcg: 500, freq: 'q12h', route: 'Nebulizer', label: 'Nebulizer standard' },
      nebulizer_high: { absoluteMcg: 500, freq: 'q6h', route: 'Nebulizer', label: 'Nebulizer high acute' },
    };
    const m = modes[mode] ?? modes.yeh_protocol;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }

    let totalMg: number;
    let conc: number;
    let unit: string;
    let vol: number;

    if (m.perKg) {
      // Yeh protocol — мг/кг
      totalMg = w * m.perKg;
      conc = 0.5; // мг/мл (Pulmicort respules 0.5 мг/мл и 0.25 мг/мл)
      vol = totalMg / conc;
      unit = 'мг';
    } else {
      // Nebulizer dose — absolute мкг
      totalMg = (m.absoluteMcg ?? 500) / 1000;
      conc = 0.5; // мг/мл (Pulmicort respules)
      vol = totalMg / conc;
      unit = 'мкг';
    }

    const actions: string[] = [];
    if (mode === 'yeh_protocol') {
      actions.push(`Будесонид (Yeh protocol): ${totalMg.toFixed(2)} мг = ${vol.toFixed(2)} мл (mixed с surfactant)`);
      actions.push(`Доза: 0.25 мг/кг intratracheal mixed с surfactant`);
      actions.push('Method: budesonide (Pulmicort) + surfactant, mixed gently 30 sec → instilled через ETT');
      actions.push('Repeat: с 2-й surfactant dose если повторное administration needed');
      actions.push('Yeh 2016 NEJM: ↓ BPD у extreme preterm; favorable outcomes');
      actions.push('⚠️ Limited replication — single-center study; controversial');
    } else {
      actions.push(`Будесонид inhaled: ${(m.absoluteMcg ?? 500)} мкг = ${vol.toFixed(2)} мл (Pulmicort respules 0.5 мг/мл)`);
      actions.push(`Доза: ${m.absoluteMcg} мкг ${m.freq} via nebulizer`);
      actions.push('Method: nebulizer connected к ventilator circuit или mask (если на CPAP / spontaneous)');
      actions.push('Длительность: 2-6 нед typically; assess response weekly');
    }

    actions.push('--- Когда использовать ---');
    if (mode === 'yeh_protocol') {
      actions.push('Yeh protocol: extreme preterm < 28 нед с RDS получающий surfactant');
      actions.push('Combine с surfactant treatment — not separately');
      actions.push('Timing: с 1-2-я dose surfactant');
    } else {
      actions.push('Nebulized inhaled: established BPD (28 days с O₂ requirement)');
      actions.push('Alternative к systemic dexamethasone (avoid neurodev concerns)');
      actions.push('Step-up therapy: nebulized если no improvement on supportive measures alone');
      actions.push('Caution: Bassler 2015 NEUROSIS — ↓ BPD но ↑ mortality (controversial)');
    }

    actions.push('--- Trial response ---');
    actions.push('Improvement criteria (4-7 days):');
    actions.push('  - ↓ FiO₂ requirement');
    actions.push('  - ↓ Ventilator support');
    actions.push('  - ↓ Apnea episodes');
    actions.push('Если no response after 7 days — discontinue или consider systemic steroid');

    actions.push('--- Side effects ---');
    actions.push('Local: oral candidiasis (rare у н/р не feeding orally), throat irritation');
    actions.push('Adrenal suppression rare с inhaled vs systemic');
    actions.push('Long-term concerns у chronic use: growth velocity ↓ slightly');
    actions.push('Bassler NEUROSIS 2015: ↑ mortality в budesonide group (controversial finding, mechanism unclear)');
    actions.push('Subsequent meta-analyses: budesonide inhaled может NOT replace systemic dexamethasone в severe BPD');

    actions.push('--- Vs systemic steroids ---');
    actions.push('Inhaled budesonide: less neurodev concerns, but limited efficacy в severe BPD');
    actions.push('Systemic dexamethasone (DART regimen): proven efficacy но cerebral palsy concerns у extreme preterm');
    actions.push('Hydrocortisone: middle ground (less concerning но less efficacy)');
    actions.push('Decision individualized с clinical context');

    return {
      value: m.perKg ? totalMg.toFixed(2) : String(m.absoluteMcg ?? 500),
      unit: m.perKg ? `мг (${vol.toFixed(2)} мл)` : `мкг (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: '#3B82F6',
      details: m.perKg ? `${m.perKg} мг/кг × ${w} кг = ${totalMg.toFixed(2)} мг ${m.freq}.` : `${m.absoluteMcg} мкг ${m.freq} via nebulizer.`,
      actions,
    };
  },
  caveats: [
    'Yeh 2016 NEJM: budesonide + surfactant intratracheal у extreme preterm ↓ BPD, single-center study',
    'Bassler 2015 NEJM NEUROSIS: chronic inhaled budesonide ↓ BPD но ↑ mortality (controversial)',
    'Cochrane 2017: inhaled corticosteroids small benefit для BPD, mortality concerns',
    'Inhaled vs systemic: less adrenal suppression, less neurodev concerns, but limited efficacy в severe BPD',
    'Pulmicort respules: 0.5 мг/мл (preferred) или 0.25 мг/мл',
    'Yeh protocol: 0.25 мг/кг mixed с surfactant, instilled через ETT',
    'Nebulization: 200-500 мкг q6-12h × 2-6 нед typically',
    'Trial response: assess в 4-7 days; discontinue если no improvement',
    'Combination с systemic для severe BPD: hydrocortisone + inhaled budesonide possible',
    'Long-term growth velocity slight ↓ у chronic use; не major concern если short course',
    'Не routine — selected cases с failure conservative measures',
    'Subsequent studies mixed; Yeh protocol не universally adopted',
  ],
  related: [
    { id: 'neo-surfactant-dose', title: 'Сурфактант' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
    { id: 'neo-furosemide-dose', title: 'Фуросемид (BPD)' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
  ],
  info: `### Будесонид у новорождённых (BPD)

Inhaled corticosteroid (ICS) для BPD prevention / treatment у preterm.

### Дозы

#### Yeh intratracheal protocol (NEJM 2016)
- **0.25 мг/кг intra-tracheal mixed с surfactant**
- Repeat с 2-я доза surfactant если повторное

#### Nebulization
| Уровень | Доза |
|---|---|
| Low chronic | 200 мкг q12h |
| **Standard** | **500 мкг q12h** (1 мг/сут) |
| High acute | 500 мкг q6h (2 мг/сут) |

### Yeh 2016 NEJM 374:2229 — Intratracheal budesonide

#### Method:
- Budesonide (Pulmicort) 0.25 мг/кг
- **Mixed с surfactant** (gently mix 30 sec)
- Instilled через ETT с surfactant
- Repeated с 2-я surfactant dose если applicable

#### Results:
- ↓ BPD incidence у extreme preterm с RDS
- ↓ Death + BPD composite outcome
- Improved 2-year neurodevelopmental outcomes
- Limited replication (single-center study)

### Bassler NEUROSIS 2015 NEJM 373:1497

#### Method:
- Chronic inhaled budesonide × 28 days
- Extreme preterm

#### Results:
- ↓ BPD incidence
- **↑ Mortality** (controversial finding)
- Mechanism not understood
- → Cautious use chronic inhaled budesonide

### Когда использовать

| Situation | Choice |
|---|---|
| **Extreme preterm + RDS + surfactant** | Yeh intratracheal protocol |
| **Established BPD** | Nebulized chronic + supportive |
| **Severe BPD** | Systemic dexamethasone (DART) ± inhaled |
| **Mild BPD** | Conservative + supportive |

### Vs systemic corticosteroids

| | Inhaled budesonide | Systemic dexamethasone | Hydrocortisone |
|---|---|---|---|
| **Efficacy в severe BPD** | Limited | Strong (DART) | Moderate |
| **Adrenal suppression** | Minimal | + | + |
| **Neurodev concerns** | Low | ↑ Cerebral palsy в extreme preterm (Yeh 1998) | Lower than dexamethasone |
| **GI / infection** | Minimal | + | + |
| **Use** | Selective | Severe BPD only | Refractory hypotension or BPD |

### Trial of response

| Parameter | Improvement |
|---|---|
| ↓ FiO₂ | Yes |
| ↓ Ventilator support | Yes |
| ↓ Apnea episodes | Yes |
| Wean от steroids gradually | If stable |

Trial × 4-7 days; если no improvement → discontinue или escalate.

### Cochrane 2017 — Inhaled corticosteroids для BPD

- Small benefit для preventing/treating BPD
- ↑ Mortality signal в some studies (NEUROSIS)
- → Selective use, не routine

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Oral candidiasis | rare у н/р | Topical antifungal |
| Throat irritation | + | Self-limited |
| Adrenal suppression | rare с inhaled | Monitor |
| Growth velocity ↓ | chronic use | Monitor |
| Mortality concern (Bassler) | uncertain | Cautious chronic use |

### Источники

- Yeh TF et al. NEJM 2016;374:2229
- Bassler D et al. NEUROSIS NEJM 2015;373:1497
- Cochrane Inhaled corticosteroids для BPD 2017
- AAP CFN — BPD management
- КР МЗ РФ "БЛД" (2024)
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
`,
};

export default runner;
