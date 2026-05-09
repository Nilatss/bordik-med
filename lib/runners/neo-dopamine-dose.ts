/**
 * Runner: neo-dopamine-dose — Допамин (inotrope / vasopressor у н/р)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Dose-dependent receptor activation:
 *   - Low (1-3 мкг/кг/мин): dopaminergic — renal vasodilation
 *   - Med (4-10 мкг/кг/мин): β1 — inotropy + chronotropy
 *   - High (> 10 мкг/кг/мин): α1 — vasoconstriction (afterload ↑)
 *   - Very high (> 20 мкг/кг/мин): preferable switch to epinephrine/norepi
 *
 * Дозировка inotropy у н/р:
 *   - Start: 5 мкг/кг/мин
 *   - Titrate: ↑ 2.5 мкг/кг/мин q5-10 мин до response
 *   - Max: 20 мкг/кг/мин (выше — переход на epi/norepi)
 *
 * Показания:
 *   - Cardiogenic shock / poor perfusion
 *   - Septic shock с CV dysfunction
 *   - Hypotension в первые 24 ч у preterm (controversial — see Saugstad 2018)
 *
 * SOURCES:
 *   - AAP CFN 2018 — Hemodynamic management
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - BNFc
 *   - Saugstad OD et al. Acta Paediatr 2018 — preterm hypotension management
 *   - ELSO ECMO Guidelines
 *   - КР МЗ РФ "Шок у новорождённого" (2024)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NeoFax / BNFc) · РФ',
  reference: 'AAP CFN 2018 Hemodynamic management. NeoFax. Saugstad Acta Paediatr 2018. КР РФ "Шок н/р".',
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
        { value: '2', label: '2 мкг/кг/мин (renal-dose / dopaminergic)' },
        { value: '5', label: '5 мкг/кг/мин (start standard)' },
        { value: '7.5', label: '7.5 мкг/кг/мин (med inotropy)' },
        { value: '10', label: '10 мкг/кг/мин (β1 max)' },
        { value: '15', label: '15 мкг/кг/мин (β1 + α1)' },
        { value: '20', label: '20 мкг/кг/мин (max — beyond → epi/norepi)' },
      ],
    },
    {
      id: 'concentration',
      label: 'Концентрация',
      type: 'select',
      options: [
        { value: '800', label: '800 мкг/мл (стандарт: 200 мг + 250 мл D5W)' },
        { value: '1600', label: '1600 мкг/мл (концентрированный для central line)' },
        { value: '400', label: '400 мкг/мл (peripheral / minor concentration)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const rate = Number(values.rate ?? 5);
    const conc = Number(values.concentration ?? 800);

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    // мкг/кг/мин × кг = мкг/мин
    // мкг/мин × 60 = мкг/ч
    // мл/ч = (мкг/мин × 60) / (мкг/мл)
    const microPerMin = rate * w;
    const microPerHour = microPerMin * 60;
    const mlPerHour = microPerHour / conc;

    let receptor = 'dopaminergic (renal)';
    let band = '#84CC16';
    if (rate >= 4 && rate < 10) {
      receptor = 'β1 (inotropy + chronotropy)';
      band = '#3B82F6';
    } else if (rate >= 10 && rate < 20) {
      receptor = 'β1 + α1 (inotropy + vasoconstriction)';
      band = '#F59E0B';
    } else if (rate >= 20) {
      receptor = 'predominant α1 — beyond optimal — switch to epi/norepi';
      band = '#EF4444';
    }

    const actions: string[] = [];
    actions.push(`Допамин: ${microPerMin.toFixed(2)} мкг/мин = ${microPerHour.toFixed(0)} мкг/ч`);
    actions.push(`Скорость инфузии: ${mlPerHour.toFixed(2)} мл/ч @ ${conc} мкг/мл`);
    actions.push(`Receptor activity: ${receptor}`);
    actions.push(`Доза: ${rate} мкг/кг/мин × ${w} кг`);

    actions.push('--- Подготовка ---');
    if (conc === 800) {
      actions.push('Стандарт: 200 мг (5 мл of 40 мг/мл) + 245 мл D5W = 800 мкг/мл');
    } else if (conc === 1600) {
      actions.push('Концентрированный (для central line): 200 мг + 122 мл D5W = 1600 мкг/мл');
    } else {
      actions.push('Peripheral: 100 мг + 245 мл D5W = 400 мкг/мл');
    }
    actions.push('Stable 24 ч @ 25°C; D5W или NS; protect from light');
    actions.push('Доступ: central preferred (UVC) при > 5 мкг/кг/мин (extravasation → tissue necrosis)');
    actions.push('Peripheral OK для start короткое время; switch ASAP на central');

    actions.push('--- Titration ---');
    actions.push('Start: 5 мкг/кг/мин (некоторые start 3 для preterm)');
    actions.push('↑ 2.5 мкг/кг/мин q5-10 мин до перфузии (CRT < 3 sec, urine output > 1 мл/кг/ч)');
    actions.push('Max effective: 15-20 мкг/кг/мин — beyond → epi 0.05-0.5 мкг/кг/мин или norepi');
    actions.push('Wean: ↓ 1 мкг/кг/мин q15-30 мин когда стабилен');

    actions.push('--- Мониторинг ---');
    actions.push('Continuous: ЧСС, АД (invasive arterial желательно), SpO₂, perfusion');
    actions.push('Urine output q1h (target ≥ 1 мл/кг/ч)');
    actions.push('Lactate q4-6h (perfusion marker)');
    actions.push('Echocardiography при unclear response: cardiac contractility, PVR');
    actions.push('Extravasation site q1h при peripheral — phentolamine 0.5 мл s.c. при extrav');

    actions.push('--- Side effects ---');
    actions.push('Тахикардия (β1 effect) — особенно при > 5 мкг/кг/мин');
    actions.push('Артериальная гипертензия при > 10 мкг/кг/мин (α1 effect)');
    actions.push('Снижение perfusion периферии при > 20 мкг/кг/мин');
    actions.push('Increased pulmonary vascular resistance — caution при PPHN (alternative dobutamine)');
    actions.push('Decreased prolactin (relevant у adolescent в long-term — NICU не critical)');

    return {
      value: microPerMin.toFixed(2),
      unit: `мкг/мин (${mlPerHour.toFixed(2)} мл/ч)`,
      interpretation: `${rate} мкг/кг/мин — ${receptor}`,
      color: band,
      details: `${rate} мкг/кг/мин × ${w} кг = ${microPerMin.toFixed(2)} мкг/мин = ${microPerHour.toFixed(0)} мкг/ч; раствор @ ${conc} мкг/мл → ${mlPerHour.toFixed(2)} мл/ч.`,
      actions,
    };
  },
  caveats: [
    'Dose-dependent receptor activation: dopa < β1 < α1',
    'Saugstad 2018: routine treatment hypotension у preterm в 1-е 24 ч — controversial; treat hypoperfusion, не хвостовое значение AД',
    'PPHN: dopamine увеличивает PVR — alternative dobutamine + iNO',
    'Extravasation → tissue necrosis: phentolamine 0.5 мл s.c. при event; central access preferred при > 5 мкг/кг/мин',
    'Adrenal insufficiency у refractory shock: добавить hydrocortisone 1-2 мг/кг q8h',
    'НЕСОВМЕСТИМО (in-line): NaHCO₃, furosemide, фенитоин, ампициллин (separate lumens)',
    'Wean ASAP когда стабилен (long-term high-dose → ischemic complications)',
    'Combine: dopamine + dobutamine при cardiogenic shock; dopamine + epi при refractory hypotension',
    'Tolerance не классическое явление, но receptor downregulation возможна при > 72 ч usage',
    'У шёока: первоначально volume bolus (NS 10 мл/кг × 2-3) перед vasopressors',
  ],
  related: [
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-nsofa', title: 'Neonatal SOFA' },
    { id: 'neo-resp-indices', title: 'OI / OSI' },
  ],
  info: `### Допамин — inotrope / vasopressor у новорождённых

First-line вasoactive agent для cardiogenic / septic shock у н/р.

### Receptor activation (dose-dependent)

| Доза (мкг/кг/мин) | Receptor | Эффект |
|---|---|---|
| 1-3 | Dopaminergic | Renal vasodilation |
| 4-10 | β1 | Inotropy + chronotropy |
| 10-20 | β1 + α1 | Inotropy + vasoconstriction |
| > 20 | Predominant α1 | Vasoconstriction (switch to epi/norepi) |

### Подготовка раствора

| Conc | Recipe |
|---|---|
| 400 мкг/мл | 100 мг + 245 мл D5W |
| **800 мкг/мл** | **200 мг + 245 мл D5W** (стандарт) |
| 1600 мкг/мл | 200 мг + 122 мл D5W (concentrated central) |

Stable 24 ч; D5W или NS; protect from light.

### Titration алгоритм

1. **Start:** 5 мкг/кг/мин (3 для extreme preterm)
2. **↑ 2.5 мкг/кг/мин q5-10 мин**
3. **Markers response:**
   - CRT < 3 sec
   - Urine output > 1 мл/кг/ч
   - Lactate ↓
   - АД per centile для GA
4. **Max effective:** 15-20 мкг/кг/мин
5. **Beyond:** add/switch к epi (0.05-0.5 мкг/кг/мин) или norepi
6. **Adrenal insufficiency:** hydrocortisone 1-2 мг/кг q8h
7. **Wean:** ↓ 1 мкг/кг/мин q15-30 мин когда стабилен

### Когда использовать

| Situation | Choice |
|---|---|
| Septic shock + ↓ contractility | Dopamine ± epi |
| Cold shock (↓ CO) | Dopamine + dobutamine |
| Warm shock (↓ SVR) | Norepi (preferred) или dopamine |
| Cardiogenic shock | Dopamine + dobutamine |
| PPHN-related shock | Dobutamine (no PVR ↑) + iNO |

### Сравнение с другими

| Препарат | Receptor | Применение |
|---|---|---|
| **Dopamine** | DA / β1 / α1 | First-line shock |
| **Dobutamine** | β1 + (β2) | ↑ contractility, ↓ SVR |
| **Epinephrine** | β1 / β2 / α1 | Refractory shock, anaphylaxis |
| **Norepinephrine** | α1 > β1 | Warm shock |
| **Vasopressin** | V1 | Refractory vasodilatory shock |
| **Milrinone** | PDE3 inhibitor | ↑ contractility + ↓ SVR (PPHN) |

### Side effects

- Тахикардия > 180/мин (snijaeт диастолу → ↓ coronary perfusion)
- АГ при > 10 мкг/кг/мин
- Periferal vasoconstriction → ↓ extremity perfusion
- ↑ Pulmonary vascular resistance (caution PPHN)
- Extravasation → tissue necrosis (phentolamine 0.5 мл s.c.)

### Совместимость

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | NaHCO₃ |
| 5 % Glucose | Furosemide |
| Lactated Ringer | Phenytoin |
| Heparin | Ampicillin |

### Источники

- AAP CFN 2018 — Hemodynamic management
- Saugstad OD et al. Acta Paediatr 2018 — preterm hypotension
- NeoFax / Neonatal Formulary 9 ed
- BNFc
- ELSO ECMO Guidelines
- КР МЗ РФ "Шок у новорождённого" (2024)
`,
};

export default runner;
