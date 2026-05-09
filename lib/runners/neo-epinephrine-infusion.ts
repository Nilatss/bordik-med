/**
 * Runner: neo-epinephrine-infusion — Адреналин continuous infusion (н/р)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Vasopressor / inotrope для refractory shock у н/р после adequate volume
 * и dopamine. β1 + β2 + α1 receptor activation (dose-dependent).
 *
 * Note: для CPR доза адреналина = neo-resus-doses (отдельный runner)
 *
 * Дозы (continuous infusion):
 *   - Low (0.05-0.1 мкг/кг/мин): β1 преобладает (inotrope)
 *   - Med (0.1-0.5 мкг/кг/мин): β1 + α1 mix (inotrope + vasopressor)
 *   - High (> 0.5 мкг/кг/мин): α1 преобладает (predominant vasopressor)
 *   - Max: 1 мкг/кг/мин (beyond — обсудить vasopressin / norepi)
 *
 * Показания:
 *   - Refractory shock после dopamine ≥ 10 мкг/кг/мин
 *   - Cardiogenic shock (HLHS post-stage I, severe sepsis)
 *   - Pulmonary hypertension с RV failure
 *   - Anaphylaxis bolus dose: 0.01 мг/кг IV (1:10000) или 0.01 мг/кг IM (1:1000)
 *
 * SOURCES:
 *   - AAP CFN 2018 — Hemodynamic management
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Шок у новорождённого" (2024)
 *   - Surviving Sepsis Campaign Pediatric 2020
 *   - ELSO ECMO Guidelines
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / SSC Pediatric / NeoFax) · РФ',
  reference: 'AAP CFN 2018. Surviving Sepsis Campaign Pediatric 2020. NeoFax. КР МЗ РФ Шок н/р 2024.',
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
      id: 'rate',
      label: 'Скорость инфузии (мкг/кг/мин)',
      type: 'select',
      options: [
        { value: '0.05', label: '0.05 мкг/кг/мин (start, β1)' },
        { value: '0.1', label: '0.1 мкг/кг/мин (low)' },
        { value: '0.2', label: '0.2 мкг/кг/мин (med)' },
        { value: '0.3', label: '0.3 мкг/кг/мин (med-high)' },
        { value: '0.5', label: '0.5 мкг/кг/мин (high)' },
        { value: '1', label: '1.0 мкг/кг/мин (max — рассмотреть vasopressin)' },
      ],
    },
    {
      id: 'concentration',
      label: 'Концентрация раствора',
      type: 'select',
      options: [
        { value: '4', label: '4 мкг/мл (1 мг + 250 мл D5W) — стандарт' },
        { value: '8', label: '8 мкг/мл (2 мг + 250 мл) — central line' },
        { value: '16', label: '16 мкг/мл (4 мг + 250 мл) — высоко-conc' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const rate = Number(values.rate ?? 0.05);
    const conc = Number(values.concentration ?? 4);

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    const microPerMin = rate * w;
    const microPerHour = microPerMin * 60;
    const mlPerHour = microPerHour / conc;

    let receptor = 'β1 (inotrope)';
    let band = '#84CC16';
    if (rate >= 0.1 && rate < 0.3) {
      receptor = 'β1 + β2 (inotrope + vasodilator)';
      band = '#3B82F6';
    } else if (rate >= 0.3 && rate < 0.5) {
      receptor = 'β1 + α1 mix';
      band = '#F59E0B';
    } else if (rate >= 0.5) {
      receptor = 'α1 dominant (vasoconstrictor)';
      band = '#EF4444';
    }

    const actions: string[] = [];
    actions.push(`Адреналин: ${microPerMin.toFixed(3)} мкг/мин = ${microPerHour.toFixed(1)} мкг/ч`);
    actions.push(`Скорость инфузии: ${mlPerHour.toFixed(2)} мл/ч @ ${conc} мкг/мл`);
    actions.push(`Receptor: ${receptor}`);

    actions.push('--- Подготовка ---');
    if (conc === 4) {
      actions.push('Стандарт: 1 мг adrenaline + 250 мл D5W = 4 мкг/мл');
    } else if (conc === 8) {
      actions.push('Central: 2 мг + 250 мл D5W = 8 мкг/мл');
    } else {
      actions.push('Concentrated: 4 мг + 250 мл D5W = 16 мкг/мл');
    }
    actions.push('Stable 24 ч; protect from light; oxidation → pink color = degradation, заменить');
    actions.push('Доступ: ВСЕГДА central (UVC); peripheral — extravasation тяжёлая');
    actions.push('Phentolamine 0.5 мл s.c. при extravasation как antidote');

    actions.push('--- Titration ---');
    actions.push('Start: 0.05 мкг/кг/мин (после adequate volume + dopamine 10 мкг/кг/мин)');
    actions.push('↑ 0.05 мкг/кг/мин q5-10 мин до response');
    actions.push('Markers: CRT < 3 sec, urine ≥ 1 мл/кг/ч, lactate ↓, АД ≥ 5-й перцентиль для GA');
    actions.push('Max effective: 0.5-1 мкг/кг/мин — beyond → vasopressin 0.0001-0.0007 ед/кг/мин');
    actions.push('Adrenal supplement: hydrocortisone 1 мг/кг q8h при refractory');

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: ЧСС, АД (invasive arterial), SpO₂, perfusion');
    actions.push('Urine output q1h (target ≥ 1 мл/кг/ч)');
    actions.push('Lactate q4-6h');
    actions.push('Glucose (hyperglycemia от β2 effect)');
    actions.push('Echocardiography для оценки contractility, PVR');

    actions.push('--- Side effects ---');
    actions.push('Тахикардия (β1) — особенно при > 0.1 мкг/кг/мин');
    actions.push('АГ при > 0.3 мкг/кг/мин (α1)');
    actions.push('Periferal vasoconstriction ↓ extremity perfusion');
    actions.push('Hyperglycemia (β2 effect — insulin resistance)');
    actions.push('Lactic acidosis (β2 → glycogenolysis)');
    actions.push('Arrhythmias rare у н/р');

    return {
      value: microPerMin.toFixed(3),
      unit: `мкг/мин (${mlPerHour.toFixed(2)} мл/ч)`,
      interpretation: `${rate} мкг/кг/мин — ${receptor}`,
      color: band,
      details: `${rate} мкг/кг/мин × ${w} кг = ${microPerMin.toFixed(3)} мкг/мин = ${microPerHour.toFixed(1)} мкг/ч; @ ${conc} мкг/мл → ${mlPerHour.toFixed(2)} мл/ч.`,
      actions,
    };
  },
  caveats: [
    'НЕ путать с CPR-dose epinephrine: 0.01-0.03 мг/кг IV/IO (см. neo-resus-doses)',
    'Show-up после adequate volume + dopamine; не routine first-line',
    'Hyperglycemia от β2 effect (glycogenolysis + insulin resistance) — мониторинг гликемии',
    'Lactic acidosis (β2 на skeletal muscle) — caveat: lactate как perfusion marker → могут быть mixed signals',
    'Extravasation тяжёлый — phentolamine 0.5 мл s.c. немедленно; central access обязательный',
    'Coadministration с NaHCO₃ → инактивация (separate lumens)',
    'Adrenal supplement: hydrocortisone 1 мг/кг q8h при refractory',
    'Wean ASAP когда стабилен (long-term high-dose → ischemic complications, hyperglycemia)',
    'У PPHN: caution α1 effect → ↑ PVR; alternative milrinone',
    'Light-protected: oxidation → pink color = degradation, замена',
  ],
  related: [
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р (CPR)' },
    { id: 'neo-dopamine-dose', title: 'Допамин н/р' },
    { id: 'neo-hydrocortisone-dose', title: 'Гидрокортизон' },
    { id: 'neo-nsofa', title: 'Neonatal SOFA' },
  ],
  info: `### Адреналин continuous infusion у н/р

Vasopressor / inotrope для refractory shock после adequate volume +
dopamine. β1 + β2 + α1 dose-dependent.

⚠️ **CPR-dose epinephrine** (0.01-0.03 мг/кг IV/IO bolus) — отдельный
calculator (neo-resus-doses). Этот calculator ТОЛЬКО для continuous infusion.

### Receptor по дозе

| Доза (мкг/кг/мин) | Receptor | Эффект |
|---|---|---|
| 0.05-0.1 | β1 dominant | Inotrope |
| 0.1-0.3 | β1 + β2 | Inotrope + mild vasodilation |
| 0.3-0.5 | β1 + α1 mix | Inotrope + vasopressor |
| > 0.5 | α1 dominant | Predominant vasopressor |
| > 1 | Toxic | Switch к vasopressin/norepi |

### Подготовка

| Conc | Recipe |
|---|---|
| **4 мкг/мл** | **1 мг + 250 мл D5W** (стандарт) |
| 8 мкг/мл | 2 мг + 250 мл (central line) |
| 16 мкг/мл | 4 мг + 250 мл (concentrated) |

Light-protected; stable 24 ч. **Pink color = degradation → заменить**.

### Когда use

| Situation | Choice |
|---|---|
| Refractory shock после dopamine ≥ 10 | Add epinephrine 0.05 мкг/кг/мин |
| Cardiogenic shock (HLHS post-Norwood) | Epinephrine first |
| Cold septic shock (↓ CO) | Epinephrine 0.1-0.3 мкг/кг/мин |
| Warm septic shock (↓ SVR) | Norepi предпочтительно (или epi 0.3+) |
| Pulmonary HTN + RV failure | Milrinone first; epi if needed |
| Anaphylaxis bolus | 0.01 мг/кг IV (1:10000) или 0.01 мг/кг IM (1:1000) |

### Titration алгоритм

1. **Start:** 0.05 мкг/кг/мин (после adequate volume + dopamine ≥ 10)
2. **↑ 0.05 мкг/кг/мин q5-10 мин**
3. **Markers response:**
   - CRT < 3 sec
   - Urine output ≥ 1 мл/кг/ч
   - Lactate ↓
   - АД ≥ 5-й perc для GA
4. **Max effective:** 0.5-1 мкг/кг/мин
5. **Beyond:** vasopressin 0.0001-0.0007 ед/кг/мин ИЛИ norepi 0.05-1 мкг/кг/мин
6. **Adrenal:** hydrocortisone 1 мг/кг q8h при refractory
7. **Wean:** ↓ 0.05 мкг/кг/мин q15-30 мин когда стабилен

### Side effects

| Effect | Mechanism | Management |
|---|---|---|
| Тахикардия | β1 | Assess → snijaeт coronary perfusion |
| АГ | α1 (high dose) | Снизить дозу |
| Hyperglycemia | β2 — glycogenolysis | Insulin при значительной |
| Lactic acidosis | β2 muscle | Caveat for perfusion marker |
| Periferal ischemia | α1 | Wean ASAP |
| Extravasation | необратимое | Phentolamine 0.5 мл s.c. |

### Совместимость

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | NaHCO₃ (inactivates) |
| 5 % Glucose | Aminophylline |
| Lactated Ringer | Hyaluronidase |

### Источники

- AAP CFN 2018 — Hemodynamic management
- Surviving Sepsis Campaign Pediatric 2020
- NeoFax / Neonatal Formulary 9 ed
- BNFc
- ELSO ECMO Guidelines
- КР МЗ РФ "Шок у новорождённого" (2024)
`,
};

export default runner;
