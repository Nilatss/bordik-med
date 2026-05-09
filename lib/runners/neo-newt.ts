/**
 * Runner: neo-newt — Newborn Weight Tool (% потеря массы у эксклюзивно
 *                    грудно-вскармливаемых)
 *
 * NEONATOLOGY MODULE A21 (P1).
 *
 * Source: Flaherman VJ, Schaefer EW, Kuzniewicz MW, Li SX, Walsh EM,
 * Paul IM. Early Weight Loss Nomograms for Exclusively Breastfed
 * Newborns. Pediatrics. 2015;135(1):e16-e23.
 * doi:10.1542/peds.2014-1532
 *
 * Companion: newbornweight.org — open online calculator с full nomogram
 * (vaginal vs C-section, hour-by-hour percentile).
 *
 * Cut-offs (для exclusively breastfed):
 *   - Normal: weight loss curve <75th percentile (most babies recover)
 *   - Concerning: ≥75th percentile loss → close monitoring
 *   - Pathologic: ≥10% loss in first 5 days → assess feeding, hydration,
 *     consider supplementation
 *
 * Risk factors для excessive loss:
 *   - C-section delivery (peak loss day 3-4 vs day 2 для vaginal)
 *   - Latching difficulties
 *   - Maternal IV fluids during labour (artificially inflates birth weight)
 *   - Insufficient milk supply
 *   - Tongue-tie
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Flaherman 2015 / newbornweight.org)',
  reference: 'Flaherman VJ et al. Early Weight Loss Nomograms. Pediatrics 2015;135:e16.',
  inputs: [
    { id: 'birth_weight', label: 'Вес при рождении', type: 'number', unit: 'г', min: 1500, max: 5000, step: 10, quickValues: [2800, 3200, 3500, 4000] },
    { id: 'current_weight', label: 'Текущий вес', type: 'number', unit: 'г', min: 1300, max: 5000, step: 10, quickValues: [2700, 3100, 3400, 3900] },
    { id: 'age_hours', label: 'Возраст (часов от рождения)', type: 'number', unit: 'ч', min: 0, max: 168, step: 1, quickValues: [12, 24, 48, 72, 96, 120] },
    { id: 'delivery', label: 'Способ родов', type: 'select', options: [
      { value: 'vaginal', label: 'Vaginal (peak loss day 2)' },
      { value: 'csection', label: 'C-section (peak loss day 3-4)' },
    ] },
    { id: 'feeding', label: 'Эксклюзивно грудно-вскармливаемый', type: 'checkbox' },
  ],
  presets: [
    { label: '3500 → 3300 на 48ч (vaginal)', values: { birth_weight: 3500, current_weight: 3300, age_hours: 48, delivery: 'vaginal', feeding: true } },
    { label: '3500 → 3100 на 72ч (10% loss)', values: { birth_weight: 3500, current_weight: 3100, age_hours: 72, delivery: 'csection', feeding: true } },
    { label: '3000 → 3050 day 5 (recovered)', values: { birth_weight: 3000, current_weight: 3050, age_hours: 120, delivery: 'vaginal', feeding: true } },
  ],
  compute: (v) => {
    const bw = Number(v.birth_weight) || 3500;
    const cw = Number(v.current_weight) || 3500;
    const age = Number(v.age_hours) || 24;
    const delivery = String(v.delivery || 'vaginal');
    const feeding = v.feeding === true;

    const loss_g = bw - cw;
    const loss_pct = (loss_g / bw) * 100;

    // Approximate percentile based on Flaherman 2015 nomogram (simplified)
    // Peak loss for vaginal: day 2 ~6-7%; C-section: day 3-4 ~7-8%
    const peak_pct_vaginal = 7;
    const peak_pct_csection = 8;
    const peak_pct = delivery === 'csection' ? peak_pct_csection : peak_pct_vaginal;

    let interpretation = '';
    let color = '#22C55E';
    let category: 'normal' | 'concerning' | 'pathologic' | 'recovering';

    if (cw > bw && age >= 96) {
      category = 'recovering';
      color = '#22C55E';
      interpretation = `Recovered birth weight (+${(loss_pct * -1).toFixed(1)}% выше birth) — отличный progress`;
    } else if (loss_pct >= 10) {
      category = 'pathologic';
      color = '#EF4444';
      interpretation = `Patологическая потеря ${loss_pct.toFixed(1)}% — требует assessment`;
    } else if (loss_pct >= peak_pct) {
      category = 'concerning';
      color = '#F59E0B';
      interpretation = `Концerning потеря ${loss_pct.toFixed(1)}% (выше peak ${peak_pct}% для ${delivery}) — close monitoring`;
    } else if (loss_pct < 0) {
      category = 'recovering';
      color = '#22C55E';
      interpretation = `Прибавка веса +${Math.abs(loss_pct).toFixed(1)}% от birth weight`;
    } else {
      category = 'normal';
      color = '#22C55E';
      interpretation = `Норма: потеря ${loss_pct.toFixed(1)}% (ожидаемо ≤${peak_pct}% к peak)`;
    }

    const expected_recovery = delivery === 'csection' ? '10-14 дней' : '7-10 дней';

    const actions: string[] = [];

    if (category === 'pathologic') {
      actions.push(
        '⚠️ ≥10% loss — клиническая оценка обязательна',
        'Assess: feeding (latch, frequency, suck), maternal milk supply',
        'Признаки dehydration: signs (sunken fontanelle, dry mucous membranes, jaundice level)',
        'Lab: glucose, electrolytes (гипернатриемия частая), weight q12ч',
        'Lactation consultant referral срочный',
        'Supplementation: expressed breast milk (preferred), donor milk, или formula 10-30 мл/feed',
        'Repeat weight через 12 ч',
      );
    } else if (category === 'concerning') {
      actions.push(
        'Концerning weight loss — close monitoring',
        'Lactation support: latch assessment, frequency (≥8-12 feeds/24ч)',
        'Weight q12ч до stabilisation',
        'Не automatic supplementation — оптимизировать direct breastfeeding first',
        'Recheck в 24 ч; если loss continues → escalate',
      );
    } else if (category === 'recovering') {
      actions.push(
        'Recovery on track',
        'Continue exclusive breastfeeding если adequate',
        'Routine weight check at discharge + 1-week follow-up',
      );
    } else {
      actions.push(
        'Стандартная норма',
        'Continue exclusive breastfeeding ≥8-12 раз/сут',
        'Weekly weight check next 2 нед',
        'Anticipated regain birth weight к ' + expected_recovery,
      );
    }

    actions.push('Для точной перцентильной номограммы — newbornweight.org (полный hour-by-hour Flaherman)');

    const details = `### Расчёт

| Параметр | Значение |
|---|---|
| Birth weight | ${bw} г |
| Current weight | ${cw} г |
| Loss | ${loss_g > 0 ? '−' : '+'}${Math.abs(loss_g)} г (${loss_pct.toFixed(1)}%) |
| Возраст | ${age} ч (~${(age / 24).toFixed(1)} сут) |
| Delivery | ${delivery === 'vaginal' ? 'Vaginal' : 'C-section'} |
| Categorization | **${category}** |

### Cut-offs

| Категория | Loss% | Action |
|---|---|---|
| Norma | <peak (${peak_pct}%) | Continue breastfeeding |
| Concerning | peak-9.9% | Close monitoring + lactation support |
| Pathologic | ≥10% | Clinical assessment, supplementation |

### Expected timeline

| Delivery | Peak loss day | Recovery |
|---|---|---|
| Vaginal | Day 2 (~6-7%) | 7-10 дней |
| C-section | Day 3-4 (~7-8%) | 10-14 дней |

### Risk factors для excessive loss

- C-section delivery (slower start)
- Maternal IV fluids during labour (inflates birth weight artificially)
- Latching difficulties (tongue-tie, prematurity, maxillofacial)
- Maternal supply: insufficient (delayed lactogenesis, prior breast surgery)
- Hypoglycemia / hyperbilirubinemia → reduced feeding effort

### Hypernatremic dehydration risk

- Loss >10% + signs (lethargy, poor skin turgor) → measure Na
- Cut-off Na >150 mmol/L = hypernatremia → admit, careful rehydration

### Источники

- Flaherman VJ et al. Pediatrics 2015;135:e16
- newbornweight.org — open online tool с full nomogram
- AAP Breastfeeding Section guidelines 2022`;

    return {
      value: `${loss_pct.toFixed(1)}%`,
      unit: 'потеря/прибавка от birth',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Bordik MVP — simplified cut-offs; для точной percentile nomogram → newbornweight.org',
        'Maternal IV fluids during labour могут artifically inflate birth weight (re-check at 24ч)',
        'Hypernatremic dehydration cutoff Na >150 — серьёзная complication',
        '≥7% loss требует assessment даже до 10% threshold',
        'Supplementation should not automatically interrupt direct breastfeeding — лучше express + cup feed',
        'Donor breastmilk preferred к formula если available',
        'Tongue-tie / ankyloglossia может маскироваться как inadequate supply',
      ],
      scale: {
        segments: [
          { min: -5, max: 0, label: 'Прибавка', color: '#22C55E' },
          { min: 0, max: peak_pct, label: 'Norma', color: '#84CC16' },
          { min: peak_pct, max: 10, label: 'Concerning', color: '#F59E0B' },
          { min: 10, max: 20, label: 'Pathologic', color: '#EF4444' },
        ],
        current: loss_pct,
        unit: '%',
      },
      related: [
        { id: 'apgar', title: 'Apgar' },
        { id: 'neo-fluid', title: 'Жидкость по дням' },
        { id: 'neo-bili-2022', title: 'Bili-2022 (jaundice)' },
        { id: 'kramer', title: 'Kramer / Bhutani' },
      ],
      relatedCourses: [{ id: '301.4', title: 'Неонатология' }],
    };
  },
  info: `### NEWT (Newborn Weight Tool)

Open-source nomogram для assessment весовой потери у эксклюзивно
грудно-вскармливаемых новорождённых первой недели жизни.

### Cut-offs

| Категория | Loss% | Risk |
|---|---|---|
| Normal | <peak | Standard care |
| Concerning | 75-90 percentile / 7-9.9% | Close monitor |
| Pathologic | ≥10% | Assessment + supplementation |

### Peak loss timing

| Delivery | Peak day | Peak% |
|---|---|---|
| Vaginal | 2 | 6-7% |
| C-section | 3-4 | 7-8% |

### Recovery timeline

- **Vaginal:** birth weight regained к 7-10 дней
- **C-section:** к 10-14 дней
- **Failure to regain by 14 days** → comprehensive feeding assessment

### When to supplement

| Indication | Action |
|---|---|
| ≥10% loss | Assess + lactation consult + supplement |
| Inadequate latch (subjective) | Lactation support first, supplement если no progress 24ч |
| Hypoglycemia (<2.6 mmol/L symptomatic) | Glucose protocol + supplement |
| Maternal request | Discuss benefits/risks; support choice |

### Supplementation hierarchy (AAP/WHO)

1. Expressed breastmilk (preferred)
2. Donor breastmilk (if available)
3. Formula (last resort, если 1-2 недоступны)

### Hypernatremic dehydration

- Cutoff: Na >150 mmol/L
- Causes: insufficient feeding + insensible losses
- Treatment: careful rehydration (avoid rapid correction → cerebral oedema)
- Inpatient management обычно требуется

### Источники

- Flaherman VJ et al. Pediatrics 2015;135:e16 (NEWT derivation)
- newbornweight.org — full open online tool
- AAP Breastfeeding Section 2022

### Ограничения

- Validated в US population, primarily white/Asian; less data другие
- Maternal IV fluids during labour могут inflate birth weight ~3-4%
- Cut-off varies по populations — local data > general
- Bordik MVP — simplified; full Flaherman nomogram на newbornweight.org
`,
};

export default runner;
