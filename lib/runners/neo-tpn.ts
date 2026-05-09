/**
 * Runner: neo-tpn — TPN macronutrient calculator (ESPGHAN/ESPEN/ESPR/CSPEN PN 2018)
 *
 * NEONATOLOGY MODULE A13 (P1).
 *
 * Source: Joint position paper ESPGHAN/ESPEN/ESPR/CSPEN PN 2018
 * (15 papers in series). Clin Nutr 2018;37:2306-2314 + companions.
 *
 * Daily macronutrient targets для full PN (g/kg/day):
 *
 *   Protein (amino acids):
 *     Day 1+: start 2-2.5, advance к 3.0-3.5 (term), 3.5-4.5 (preterm)
 *     ELBW особенно: target ≥3.5 для anabolism
 *
 *   Lipid (IV emulsion):
 *     Day 1+: start 1-2, advance к 3-4 максимум
 *     SMOFlipid (mixed) > pure soybean (Intralipid) для long-term TPN
 *     Hold или ↓ при triglycerides >250 мг/дл
 *
 *   Carbohydrate (dextrose):
 *     Start GIR 4-6 мг/кг/мин, advance к 8-12 для anabolism
 *     Maximum ~14 мг/кг/мин (>16 = liver overload, hyperglycemia)
 *     ≥12.5% concentration → центральный доступ обязателен
 *
 *   Energy:
 *     Term: 80-100 ккал/кг/сут (PN), 100-120 enteral
 *     Preterm: 90-120 ккал/кг/сут (PN), 110-135 enteral
 *
 *   Electrolytes (typical day 3+):
 *     Sodium: 2-5 ммоль/кг/сут (start 0 day 1-2 для ELBW)
 *     Potassium: 2-3 ммоль/кг/сут (start day 2 после void)
 *     Calcium: 2-3 ммоль/кг/сут (1.5-2 ммоль/кг preterm protein bone health)
 *     Phosphate: 1.5-2 ммоль/кг/сут
 *     Magnesium: 0.15-0.3 ммоль/кг/сут
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ESPGHAN/ESPEN/ESPR/CSPEN PN 2018)',
  reference: 'ESPGHAN/ESPEN/ESPR/CSPEN guidelines on pediatric PN. Clin Nutr 2018;37:2306-2314 (15-paper series).',
  inputs: [
    { id: 'weight', label: 'Вес', type: 'number', unit: 'г', min: 400, max: 6000, step: 10, quickValues: [600, 1000, 1500, 2500, 3500] },
    { id: 'category', label: 'Категория', type: 'select', options: [
      { value: 'elbw', label: 'ELBW (<1000 г)' },
      { value: 'vlbw', label: 'VLBW (1000-1500 г)' },
      { value: 'preterm', label: 'Преэрм (1500-2500 г)' },
      { value: 'term', label: 'Термин (>2500 г)' },
    ] },
    { id: 'day', label: 'День TPN', type: 'number', unit: 'сут', min: 0, max: 28, step: 1, quickValues: [0, 1, 3, 5, 7] },
    { id: 'goal', label: 'Цель', type: 'select', options: [
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'growth', label: 'Active growth (полная PN)' },
      { value: 'restrict', label: 'Restriction (СН/БЛД)' },
    ] },
  ],
  presets: [
    { label: 'ELBW 800 г day 1 start', values: { weight: 800, category: 'elbw', day: 1, goal: 'growth' } },
    { label: 'VLBW 1300 г day 5 active', values: { weight: 1300, category: 'vlbw', day: 5, goal: 'growth' } },
    { label: 'Преэрм 2200 г day 3', values: { weight: 2200, category: 'preterm', day: 3, goal: 'growth' } },
    { label: 'Термин 3500 г maintenance', values: { weight: 3500, category: 'term', day: 5, goal: 'maintenance' } },
  ],
  compute: (v) => {
    const weight_g = Number(v.weight) || 1500;
    const weight_kg = weight_g / 1000;
    const category = String(v.category || 'preterm');
    const day = Number(v.day) || 1;
    const goal = String(v.goal || 'growth');

    // Protein g/kg/day
    let protein_target_min: number;
    let protein_target_max: number;
    if (category === 'elbw') {
      protein_target_min = 3.5;
      protein_target_max = 4.5;
    } else if (category === 'vlbw') {
      protein_target_min = 3.5;
      protein_target_max = 4.0;
    } else if (category === 'preterm') {
      protein_target_min = 3.0;
      protein_target_max = 3.5;
    } else {
      protein_target_min = 2.0;
      protein_target_max = 3.0;
    }

    // Day-based ramp-up (start day 1 with 2-2.5, advance daily)
    const protein_today = day === 0 ? 0 : Math.min(protein_target_max, 2 + (day - 1) * 0.5);
    const protein_g = protein_today * weight_kg;

    // Lipid g/kg/day
    let lipid_target_min: number;
    let lipid_target_max: number;
    if (category === 'elbw' || category === 'vlbw') {
      lipid_target_min = 3;
      lipid_target_max = 4;
    } else {
      lipid_target_min = 2;
      lipid_target_max = 3.5;
    }
    const lipid_today = day === 0 ? 0 : Math.min(lipid_target_max, 1 + (day - 1) * 0.5);
    const lipid_g = lipid_today * weight_kg;

    // Carbohydrate (GIR) — depends on overall fluid + dextrose %
    const gir_min = day === 0 ? 4 : 4 + (day - 1) * 1;
    const gir_max = goal === 'restrict' ? 8 : category === 'elbw' || category === 'vlbw' ? 12 : 14;
    const gir_today = Math.min(gir_max, gir_min);

    // Energy
    const protein_kcal = protein_g * 4;
    const lipid_kcal = lipid_g * 9;
    const carbs_kcal = gir_today * 1.44 * weight_kg; // 1.44 = (60×24/1000)×4 for GIR mg/kg/min → kcal/kg/day
    const total_kcal = protein_kcal + lipid_kcal + carbs_kcal;
    const kcal_per_kg = total_kcal / weight_kg;

    // Energy target
    let kcal_target_min: number;
    let kcal_target_max: number;
    if (goal === 'growth') {
      kcal_target_min = category === 'term' ? 80 : 90;
      kcal_target_max = category === 'term' ? 100 : 120;
    } else if (goal === 'restrict') {
      kcal_target_min = 70;
      kcal_target_max = 90;
    } else {
      kcal_target_min = 70;
      kcal_target_max = 90;
    }

    // Electrolytes (day 3+ typical; adjust for ELBW в первые дни)
    const na_target = day < 3 && category === 'elbw' ? 0 : '2-5 ммоль/кг';
    const k_target = day < 1 ? '0 (после void)' : '2-3 ммоль/кг';
    const ca_target = '2-3 ммоль/кг';
    const phosphate_target = '1.5-2 ммоль/кг';
    const mg_target = '0.15-0.3 ммоль/кг';

    let interpretation = '';
    let color = '#22C55E';

    if (kcal_per_kg < kcal_target_min) {
      color = '#F59E0B';
      interpretation = `Calories ${kcal_per_kg.toFixed(0)} ккал/кг/сут — ниже target (${kcal_target_min}-${kcal_target_max}); advance ↑`;
    } else if (kcal_per_kg > kcal_target_max) {
      color = '#F59E0B';
      interpretation = `Calories ${kcal_per_kg.toFixed(0)} ккал/кг/сут — выше target; рассмотреть ↓`;
    } else {
      interpretation = `Calories ${kcal_per_kg.toFixed(0)} ккал/кг/сут — в target диапазоне`;
    }

    const actions: string[] = [
      `**Protein (AA):** ${protein_today.toFixed(1)} г/кг/сут = ${protein_g.toFixed(1)} г/день (target ${protein_target_min}-${protein_target_max})`,
      `**Lipid:** ${lipid_today.toFixed(1)} г/кг/сут = ${lipid_g.toFixed(1)} г/день (target ${lipid_target_min}-${lipid_target_max})`,
      `**Carbohydrate (GIR):** ${gir_today} мг/кг/мин (target до ${gir_max})`,
      `**Total energy:** ${kcal_per_kg.toFixed(0)} ккал/кг/сут (target ${kcal_target_min}-${kcal_target_max})`,
      `**Electrolytes (day ${day}):** Na ${na_target}, K ${k_target}, Ca ${ca_target}, P ${phosphate_target}, Mg ${mg_target}`,
      day === 0 ? 'Day 0 — обычно только AA + dextrose (no lipid first 12-24ч); добавить lipid day 1' : '',
      day < 3 && category === 'elbw' ? 'ELBW day 1-2: Na 0 (insensible water loss → physiological hypernatremia)' : '',
      gir_today > 12.5 ? 'GIR >12.5 → центральный доступ (UVC/PICC) обязателен' : '',
      'Vitamins: Cernevit / MVI-Pediatric daily; trace elements: zinc, copper, selenium, manganese, chromium',
      'Liver protection: SMOFlipid > pure soybean Intralipid для long-term TPN (>3 нед)',
    ].filter(Boolean);

    const details = `### Расчёт для ${weight_g} г · ${category} · day ${day} · ${goal}

| Macro | g/kg/сут | Total g/сут | Calories |
|---|---|---|---|
| Protein (AA) | ${protein_today.toFixed(1)} | ${protein_g.toFixed(1)} | ${protein_kcal.toFixed(0)} ккал |
| Lipid | ${lipid_today.toFixed(1)} | ${lipid_g.toFixed(1)} | ${lipid_kcal.toFixed(0)} ккал |
| Carbs (GIR ${gir_today}) | ~${(gir_today * 1.44).toFixed(1)} | — | ${carbs_kcal.toFixed(0)} ккал |
| **Total** | | | **${total_kcal.toFixed(0)} ккал = ${kcal_per_kg.toFixed(0)} ккал/кг** |

### Targets (ESPGHAN 2018)

| Macro | ELBW/VLBW | Term |
|---|---|---|
| Protein | 3.5-4.5 г/кг | 2-3 г/кг |
| Lipid | 3-4 г/кг | 2-3.5 г/кг |
| GIR (max) | 12 мг/кг/мин | 14 мг/кг/мин |
| Energy (PN) | 90-120 ккал/кг | 80-100 ккал/кг |
| Energy (enteral) | 110-135 | 100-120 |

### Electrolytes (typical day 3+)

| Element | Target |
|---|---|
| Na | 2-5 ммоль/кг (ELBW: 0 day 1-2) |
| K | 2-3 ммоль/кг (start day 2 после void) |
| Ca | 2-3 ммоль/кг (high preterm для bone) |
| Phosphate | 1.5-2 ммоль/кг (Ca:P ~1.3:1 molar) |
| Magnesium | 0.15-0.3 ммоль/кг |

### Vitamins + trace elements

- **Multivitamin:** Cernevit / MVI-Pediatric daily
- **Trace elements:** Zn 250-400 мкг/кг, Cu 20 мкг/кг, Se 2 мкг/кг,
  Mn 1 мкг/кг (cholestasis risk → ↓ Mn после 2 нед TPN)

### Lipid emulsion choice

| Type | Composition | Use case |
|---|---|---|
| Intralipid (100% soybean) | High ω-6 | Avoid >2 нед (cholestasis) |
| SMOFlipid | Soy + MCT + olive + fish | **Preferred** для ≥1 нед TPN |
| Omegaven (100% fish) | High ω-3 | Cholestasis treatment |

### Hold / ↓ criteria

- **Lipids:** triglycerides >250 мг/дл → ↓ или hold 4-6 ч
- **Carbs:** glucose >180 мг/дл sustained → ↓ GIR 1-2; insulin только refractory
- **Protein:** BUN >40 мг/дл OR severe metabolic acidosis → reassess
- **Electrolytes:** Na <130 OR >150 → adjustment

### Cholestasis prevention (PN-associated cholestasis, PNAC)

- Early initiation of enteral feeds (trophic >0)
- SMOFlipid > Intralipid
- Cycling TPN (off 4-6 ч/сут) при extended use
- Monitor direct bilirubin q1-2 нед`;

    return {
      value: `${kcal_per_kg.toFixed(0)} ккал/кг`,
      unit: `сут (P/L/G ${protein_today.toFixed(1)}/${lipid_today.toFixed(1)}/${gir_today})`,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'ESPGHAN 2018 — current standard; full 15-paper series в Clin Nutr 37:2306',
        'Day 0: только AA + dextrose; lipid начать day 1',
        'ELBW: Na 0 в первые 1-2 дня (physiological hypernatremia phase)',
        'GIR >12.5 → центральный доступ обязателен',
        'Lipid hold/↓ при TG >250 мг/дл',
        'SMOFlipid лучше Intralipid для extended TPN (>3 нед) — ↓ cholestasis',
        'Cycling TPN (off 4-6 ч) при extended use — мобилизация bile',
        'Bordik MVP — simplified targets; реальные расчёты с pharmacy + nutrition',
        'Always co-prescribe: vitamins, trace elements, electrolytes, fluid (отдельно от calories)',
      ],
      scale: {
        segments: [
          { min: 0, max: 60, label: 'Insufficient', color: '#EF4444' },
          { min: 60, max: 90, label: 'Maintenance', color: '#84CC16' },
          { min: 90, max: 120, label: 'Growth', color: '#22C55E' },
          { min: 120, max: 200, label: 'Excessive', color: '#F59E0B' },
        ],
        current: kcal_per_kg,
        unit: 'ккал/кг/сут',
      },
      related: [
        { id: 'neo-fluid', title: 'Жидкость по дням' },
        { id: 'neo-gir', title: 'GIR' },
        { id: 'neo-enteral', title: 'Enteral feed advancement' },
        { id: 'neo-fenton', title: 'Fenton growth' },
      ],
      relatedCourses: [{ id: '301.4', title: 'Неонатология' }, { id: '300.4', title: 'Нутрициология' }],
    };
  },
  info: `### Macronutrient targets (ESPGHAN 2018)

| Macro | ELBW | VLBW | Преэрм | Term |
|---|---|---|---|---|
| Protein (g/kg) | 3.5-4.5 | 3.5-4.0 | 3-3.5 | 2-3 |
| Lipid (g/kg) | 3-4 | 3-4 | 2-3.5 | 2-3 |
| GIR max (mg/kg/min) | 12 | 12 | 14 | 14 |
| Energy PN (kcal/kg) | 90-120 | 90-120 | 90-110 | 80-100 |
| Energy enteral (kcal/kg) | 110-135 | 110-135 | 110-130 | 100-120 |

### Day-by-day ramp-up

| Day | Protein g/kg | Lipid g/kg | GIR mg/kg/min |
|---|---|---|---|
| 0 | 0 | 0 (start day 1) | 4-6 |
| 1 | 2-2.5 | 1 | 5-7 |
| 2 | 2.5-3 | 1.5-2 | 6-8 |
| 3 | 3-3.5 | 2-2.5 | 7-10 |
| 4 | 3.5-4 | 2.5-3 | 8-11 |
| 5+ | target | target | 10-14 |

### Lipid emulsions

- **Intralipid** (100% soybean) — высокий ω-6, cholestasis risk при >2 нед
- **SMOFlipid** (mixed: soy/MCT/olive/fish) — **PREFERRED** для extended use
- **Omegaven** (100% fish) — для PNAC treatment

### Cholestasis prevention (PNAC)

- Early enteral feeds (trophic >0)
- SMOFlipid > Intralipid
- TPN cycling (off 4-6ч/сут)
- Direct bilirubin q1-2 нед

### Vitamins / trace elements

- **MVI:** Cernevit / MVI-Pediatric daily
- **Trace:** Zn, Cu, Se, Mn, Cr — daily
- ↓ Mn после 2 нед TPN (accumulation в cholestasis)

### Hold criteria

| Parameter | Hold trigger |
|---|---|
| Triglycerides | >250 мг/дл → lipid ↓ или hold 4-6ч |
| Glucose | >180 мг/дл sustained → GIR ↓ |
| BUN | >40 мг/дл → reassess protein |
| Direct bili | >2 мг/дл → cycling, switch to SMOF |

### Источники

- ESPGHAN/ESPEN/ESPR/CSPEN 2018 — full 15-paper series Clin Nutr 37:2306+
- Companion: PediTools/TPN — open online calculator с full prescription
- AAP Pediatric Nutrition Handbook 8 ed. (2020)

### Ограничения

- Bordik MVP — simplified targets
- Реальная prescription через pharmacy + nutritionist
- Local protocols variable (Cernevit vs MVI-Ped, fluid balance)
- Always check compatibility (Ca + PO4 precipitation)
`,
};

export default runner;
