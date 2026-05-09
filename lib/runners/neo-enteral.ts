/**
 * Runner: neo-enteral — Enteral feed advancement для VLBW/ELBW
 *
 * NEONATOLOGY MODULE A14 (P1).
 *
 * Source: ESPGHAN Committee on Nutrition. Position Paper on the
 * enteral feeding of preterm infants. J Pediatr Gastroenterol Nutr.
 * 2022;75(2):205-220. doi:10.1097/MPG.0000000000003488
 *
 * Trophic feeds (priming): 10-20 ml/kg/day for first 2-7 days,
 * then advance.
 *
 * Advancement rates:
 *   <750 g    — 15-25 ml/kg/day
 *   750-1500 — 20-30 ml/kg/day
 *   1500-2500 — 25-35 ml/kg/day
 *   >2500 (term) — feed by demand or 150-180 ml/kg/day
 *
 * Target: 150-180 ml/kg/day full feeds. Most preterm reach this в 7-14 дней.
 *
 * Fortification: при достижении 100-150 ml/kg/day breast milk → fortify
 * к 24 kcal/oz (с HMF — human milk fortifier) для preterm <1500 g.
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ESPGHAN 2022 EN Position Paper)',
  reference: 'ESPGHAN CoN. Enteral feeding of preterm infants. JPGN 2022;75:205. doi:10.1097/MPG.0000000000003488',
  inputs: [
    { id: 'weight', label: 'Текущий вес', type: 'number', unit: 'г', min: 400, max: 6000, step: 10, quickValues: [600, 1000, 1500, 2500, 3500] },
    { id: 'current_volume', label: 'Текущий объём кормления', type: 'number', unit: 'мл/кг/сут', min: 0, max: 200, step: 5, quickValues: [0, 20, 50, 100, 150] },
    { id: 'feed_type', label: 'Тип молока/смеси', type: 'select', options: [
      { value: 'mom', label: "Mother's own milk (MOM) — оптимально" },
      { value: 'donor', label: 'Donor human milk' },
      { value: 'preterm_formula', label: 'Preterm formula (24 kcal/oz)' },
      { value: 'term_formula', label: 'Term formula (20 kcal/oz)' },
    ] },
    { id: 'fortified', label: 'Fortified (HMF/breastmilk fortifier добавлен)', type: 'checkbox' },
    { id: 'phase', label: 'Фаза кормления', type: 'select', options: [
      { value: 'trophic', label: 'Trophic / priming (10-20 мл/кг)' },
      { value: 'advance', label: 'Advancement' },
      { value: 'full', label: 'Full feeds achieved' },
    ] },
  ],
  presets: [
    { label: 'ELBW 800 г trophic day 3', values: { weight: 800, current_volume: 20, feed_type: 'mom', fortified: false, phase: 'trophic' } },
    { label: 'VLBW 1300 г advancing', values: { weight: 1300, current_volume: 80, feed_type: 'mom', fortified: false, phase: 'advance' } },
    { label: 'Преэрм 2000 г full feeds fortified', values: { weight: 2000, current_volume: 160, feed_type: 'mom', fortified: true, phase: 'full' } },
    { label: 'Термин 3500 г demand feeding', values: { weight: 3500, current_volume: 150, feed_type: 'mom', fortified: false, phase: 'full' } },
  ],
  compute: (v) => {
    const weight_g = Number(v.weight) || 1500;
    const weight_kg = weight_g / 1000;
    const current = Number(v.current_volume) || 0;
    const feed_type = String(v.feed_type || 'mom');
    const fortified = v.fortified === true;
    const phase = String(v.phase || 'advance');

    // Determine advancement rate
    let advance_rate_min: number;
    let advance_rate_max: number;
    if (weight_g < 750) {
      advance_rate_min = 15;
      advance_rate_max = 25;
    } else if (weight_g < 1500) {
      advance_rate_min = 20;
      advance_rate_max = 30;
    } else if (weight_g < 2500) {
      advance_rate_min = 25;
      advance_rate_max = 35;
    } else {
      advance_rate_min = 30;
      advance_rate_max = 40;
    }

    // Total daily volume
    const total_ml_day = Math.round(current * weight_kg);
    const ml_per_feed_q3h = Math.round((total_ml_day / 8) * 10) / 10;
    const ml_per_feed_q2h = Math.round((total_ml_day / 12) * 10) / 10;

    // Calorie estimation
    const kcal_per_ml = feed_type === 'preterm_formula' ? 0.81 : feed_type === 'term_formula' ? 0.67 : fortified ? 0.81 : 0.67; // 24 vs 20 kcal/oz
    const kcal_per_kg_day = current * kcal_per_ml;
    const protein_per_kg_day = feed_type === 'preterm_formula' ? current * 0.024 : fortified ? current * 0.022 : current * 0.014; // approximate g/kg/day

    let interpretation = '';
    let color = '#22C55E';
    const actions: string[] = [];

    const target_min = 140;
    const target_max = 180;
    const target_kcal_min = weight_g < 1500 ? 110 : 100;
    const target_kcal_max = weight_g < 1500 ? 135 : 120;

    if (phase === 'trophic') {
      interpretation = `Trophic feeds: ${current} мл/кг/сут (${total_ml_day} мл/день)`;
      color = '#3B82F6';
      actions.push(
        'Trophic / priming (10-20 мл/кг/сут × 2-7 дней)',
        `Advance после 24-72ч stable: +${advance_rate_min}-${advance_rate_max} мл/кг/сут`,
        'Цель: gut maturation, preserve mucosal integrity, ↓ NEC risk',
        'MOM первая линия > donor > preterm formula',
        'Hold или ↓ при significant residuals (>50% prior feed), bilious aspirate, distention',
      );
    } else if (phase === 'advance') {
      const expected_advance = (advance_rate_min + advance_rate_max) / 2;
      interpretation = `Advancing: ${current} мл/кг/сут (advance +${advance_rate_min}-${advance_rate_max}/сут)`;
      color = '#84CC16';
      actions.push(
        `Текущий: ${current} мл/кг/сут (${total_ml_day} мл/день)`,
        `Increase by +${advance_rate_min}-${advance_rate_max} мл/кг/сут (среднее ~${expected_advance})`,
        `Per feed (q3ч): ${ml_per_feed_q3h} мл; (q2ч): ${ml_per_feed_q2h} мл`,
        `Target full feeds: ${target_min}-${target_max} мл/кг/сут (typically reached в 7-14 дней)`,
        weight_g < 1500 && current >= 100 ? 'При ≥100 мл/кг breastmilk — рассмотреть fortification (HMF к 24 kcal/oz)' : '',
        'Hold advance если: residuals >50%, bilious aspirate, abdominal distention, blood in stool',
        'Cup/syringe feeding при невозможности direct breastfeeding',
      );
    } else {
      interpretation = `Full feeds: ${current} мл/кг/сут (~${kcal_per_kg_day.toFixed(0)} ккал/кг)`;
      color = '#22C55E';
      actions.push(
        `Full feeds achieved: ${current} мл/кг/сут (${total_ml_day} мл/день)`,
        `Calories: ~${kcal_per_kg_day.toFixed(0)} ккал/кг/сут (target ${target_kcal_min}-${target_kcal_max})`,
        `Protein: ~${protein_per_kg_day.toFixed(2)} г/кг/сут (target preterm: 3.5-4.5)`,
        weight_g < 1500 && !fortified ? '⚠️ <1500 г + не-fortified — consider fortification для adequate growth' : '',
        kcal_per_kg_day < target_kcal_min ? '⚠️ Калорий недостаточно — fortify или ↑ volume' : '',
        weight_g >= 2500 ? 'Demand feeding если стабилен; q3ч feeding нерутинно для term' : '',
        'Continue weight monitoring 2-3× в неделю; цель 15-20 г/кг/сут после 1-й недели',
      );
    }

    if (current > target_max) {
      actions.push('⚠️ Volume >180 мл/кг — рассмотреть fluid restriction (СН, БЛД)');
    }

    const details = `### Текущий статус

| Параметр | Значение |
|---|---|
| Вес | ${weight_g} г (${weight_kg.toFixed(2)} кг) |
| Текущий объём | ${current} мл/кг/сут (${total_ml_day} мл/день) |
| Тип кормления | ${feed_type === 'mom' ? "MOM" : feed_type === 'donor' ? 'Donor HM' : feed_type === 'preterm_formula' ? 'Preterm formula' : 'Term formula'}${fortified ? ' (fortified)' : ''} |
| Фаза | ${phase} |
| Calories est. | ${kcal_per_kg_day.toFixed(0)} ккал/кг/сут (target ${target_kcal_min}-${target_kcal_max}) |

### Volume per feed

| Schedule | мл/feed |
|---|---|
| q3ч (8 feeds/сут) | ${ml_per_feed_q3h} |
| q2ч (12 feeds/сут) | ${ml_per_feed_q2h} |

### Advancement rates (ESPGHAN 2022)

| Weight | Advance rate (мл/кг/сут) |
|---|---|
| <750 г | 15-25 |
| 750-1500 | 20-30 |
| 1500-2500 | 25-35 |
| >2500 (term) | 30-40 / demand |

### Targets

| Parameter | Target (preterm) | Target (term) |
|---|---|---|
| Volume full feeds | 150-180 мл/кг/сут | 150-180 (или demand) |
| Calories | 110-135 ккал/кг/сут | 100-120 |
| Protein | 3.5-4.5 г/кг/сут | 2-2.5 |
| Fat | 5-7 г/кг/сут | 4.5-6 |
| Carbs | 11-15 г/кг/сут | 10-14 |

### Fortification (preterm <1500 г)

При достижении ≥100-150 мл/кг breast milk:
- Add HMF (Human Milk Fortifier) к target 24 kcal/oz (~0.81 kcal/ml)
- Increases protein, calcium, phosphate, iron
- Continue до discharge OR 50 нед PMA OR target weight reached
- Cochrane 2020: fortification ↑ growth velocity без ↑ NEC risk`;

    return {
      value: `${current} мл/кг`,
      unit: '/сут',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'MOM (mother\'s own milk) первая линия — снижает NEC, sepsis, BPD',
        'Donor HM > formula если MOM недоступно',
        'Trophic feeds × 2-7 дней перед advancement (особенно ELBW)',
        'Не advance при: significant residuals (>50% prior feed), bilious aspirate, abdominal distention, blood in stool',
        'Fortification рутинно для <1500 г при достижении ≥100 мл/кг breast milk',
        'Probiotics — Cochrane 2017 показал ↓ NEC ~40%; обсудить с командой',
        'Volume >180 мл/кг — рассмотреть fluid restriction при СН, БЛД, anasarca',
        'Standardised feeding protocols ↓ NEC and time to full feeds',
      ],
      scale: {
        segments: [
          { min: 0, max: 30, label: 'Trophic', color: '#3B82F6' },
          { min: 30, max: 100, label: 'Advance', color: '#84CC16' },
          { min: 100, max: 180, label: 'Full feeds', color: '#22C55E' },
          { min: 180, max: 250, label: 'Excessive', color: '#F59E0B' },
        ],
        current,
        unit: 'мл/кг/сут',
      },
      related: [
        { id: 'neo-fluid', title: 'Жидкость по дням' },
        { id: 'neo-tpn', title: 'TPN расчёт' },
        { id: 'neo-newt', title: 'NEWT (потеря массы)' },
        { id: 'neo-bell-nec', title: 'Bell NEC' },
      ],
      relatedCourses: [{ id: '301.4', title: 'Неонатология' }],
    };
  },
  info: `### Enteral feed advancement (ESPGHAN 2022)

Стандартный protocol для VLBW/ELBW preterm infants после initial
stabilization.

### Phases

| Phase | Volume | Duration |
|---|---|---|
| Trophic / priming | 10-20 мл/кг/сут | 2-7 дней |
| Advancement | +20-30 мл/кг/сут | 7-14 дней |
| Full feeds | 150-180 мл/кг/сут | maintain |

### Advancement rates by weight

| Weight | Advance/day |
|---|---|
| <750 г | 15-25 мл/кг |
| 750-1500 | 20-30 мл/кг |
| 1500-2500 | 25-35 мл/кг |
| >2500 | 30-40 мл/кг или demand |

### Fortification (HMF)

Для preterm <1500 г:
- Start при ≥100-150 мл/кг breast milk
- Target 24 kcal/oz (~0.81 kcal/ml)
- Continue до discharge OR 50 нед PMA

### Hold criteria

- Residuals >50% prior feed (если bottled feeding)
- Bilious aspirate
- Abdominal distention >2 см от baseline
- Visible bowel loops
- Blood in stool (gross OR occult)
- Sepsis suspected

### Targets (full feeds)

| Parameter | Preterm | Term |
|---|---|---|
| Volume | 150-180 мл/кг | demand or 150-180 |
| Calories | 110-135 ккал/кг | 100-120 |
| Protein | 3.5-4.5 г/кг | 2-2.5 |
| Growth velocity | 15-20 г/кг/сут | 20-30 г/сут |

### Источники

- ESPGHAN CoN 2022 — JPGN 75:205
- ESPGHAN/ESPEN/ESPR PN 2018 — Clin Nutr 37:2306
- Cochrane reviews: probiotics, fortification, donor milk

### Ограничения

- Bordik MVP — simplified targets; реальные protocols по локальному NICU
- Probiotics decision требует team discussion
- Standardised feeding protocols (SFP) consistently показывают benefits
`,
};

export default runner;
