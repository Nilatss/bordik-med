/**
 * Runner: neo-vancomycin-dose — Ванкомицин (н/р)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Расчёт дозы ванкомицина для лечения LOS / late-onset sepsis у н/р,
 * особенно при подозрении на CONS (coagulase-negative staphylococci),
 * MRSA, Enterococcus.
 *
 * SOURCES:
 *   - AAP Red Book (2021-2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth, Oxford)
 *   - BNF for Children
 *   - КР МЗ РФ "Бактериальный сепсис н/р" (2024)
 *   - Rybak MJ et al. ASHP/IDSA Vancomycin Therapeutic Monitoring 2020
 *   - Frymoyer A et al. — модели PK для preterm
 *
 * Дозы (по PMA + PNA):
 *
 *   PMA ≤ 29 нед, PNA 0-14 дн:    10-15 мг/кг q18-24h
 *   PMA ≤ 29 нед, PNA > 14 дн:    15 мг/кг q12h
 *   PMA 30-36 нед, PNA 0-14 дн:   10-15 мг/кг q12-18h
 *   PMA 30-36 нед, PNA > 14 дн:   15 мг/кг q8h
 *   PMA ≥ 37 нед, PNA 0-7 дн:     10-15 мг/кг q12h
 *   PMA ≥ 37 нед, PNA > 7 дн:     15 мг/кг q6-8h
 *
 * Therapeutic monitoring (AUC-based по ASHP 2020):
 *   AUC₂₄/MIC > 400 (target 400-600 для S. aureus с MIC ≤ 1)
 *   Trough surrogate: 10-20 мг/л (если AUC недоступен)
 *   AUC > 600 → nephrotoxicity risk
 *
 * Адекватная гидратация, никогда rapid infusion (red man syndrome).
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / ASHP-IDSA 2020 / NeoFax)',
  reference: 'AAP Red Book 2021-2024. Rybak MJ ASHP/IDSA 2020 (PharmacotherapY 40:363). NeoFax.',
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
      id: 'pma',
      label: 'PMA (постменструальный возраст, нед)',
      type: 'select',
      options: [
        { value: '28', label: '≤ 29 нед' },
        { value: '34', label: '30-36 нед' },
        { value: '40', label: '≥ 37 нед' },
      ],
    },
    {
      id: 'pna',
      label: 'PNA (постнатальный возраст)',
      type: 'select',
      options: [
        { value: '5', label: '0-7 дней' },
        { value: '12', label: '8-14 дней' },
        { value: '20', label: '> 14 дней' },
      ],
    },
    {
      id: 'indication',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'sepsis', label: 'Sepsis / LOS / CONS' },
        { value: 'meningitis', label: 'Meningitis (loading 20 мг/кг)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const pma = Number(values.pma ?? 40);
    const pna = Number(values.pna ?? 5);
    const indication = String(values.indication ?? 'sepsis');

    if (w <= 0 || w > 5) {
      return {
        value: '—',
        interpretation: 'Введите массу 0.4-5 кг',
        color: '#9CA3AF',
        details: '',
      };
    }

    let dosePerKg = 15;
    let interval = 'q12h';

    if (pma <= 29) {
      if (pna <= 14) {
        dosePerKg = 12;
        interval = 'q18-24h';
      } else {
        dosePerKg = 15;
        interval = 'q12h';
      }
    } else if (pma <= 36) {
      if (pna <= 14) {
        dosePerKg = 12;
        interval = 'q12-18h';
      } else {
        dosePerKg = 15;
        interval = 'q8h';
      }
    } else {
      if (pna <= 7) {
        dosePerKg = 12;
        interval = 'q12h';
      } else {
        dosePerKg = 15;
        interval = 'q6-8h';
      }
    }

    if (indication === 'meningitis') {
      // Loading 20 мг/кг recommended
      dosePerKg = 20;
    }

    const total = w * dosePerKg;
    const conc = 5; // мг/мл стандартный после dilution для infusion
    const vol = total / conc;
    const infusionTime = Math.max(60, total / 10); // ≥ 60 мин или 10 мг/мин

    const actions: string[] = [];
    actions.push(`Ванкомицин: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ 5 мг/мл (final concentration)`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${indication === 'meningitis' ? '(loading)' : interval}`);
    actions.push(`Infusion time: ≥ ${infusionTime.toFixed(0)} мин (НЕ быстрее 10 мг/мин — red man syndrome)`);
    actions.push(`Концентрация для central line: до 10 мг/мл; peripheral line: ≤ 5 мг/мл`);
    actions.push('Совместимость: 0.9 % NaCl, 5 % glucose, lactated Ringer');
    actions.push('НЕСОВМЕСТИМО (in-line): heparin, β-lactams, фенитоин, NaHCO₃ (separate lumens)');

    actions.push('--- Therapeutic Drug Monitoring (ASHP/IDSA 2020) ---');
    actions.push('AUC-based: AUC₂₄/MIC target 400-600 для S. aureus (MIC ≤ 1)');
    actions.push('Trough surrogate (если AUC недоступен): 10-20 мг/л');
    actions.push('Первый trough: после 2-3 доз ИЛИ перед 4-й (если EID)');
    actions.push('AUC > 600 → nephrotoxicity risk (snijaeт interval / dose)');

    actions.push('--- Toxicity ---');
    actions.push('Nephrotoxicity: ↑ Cr, ↓ диурез — особенно при concomitant aminoglycosides');
    actions.push('Ototoxicity: rare, обычно сочетается с aminoglycosides');
    actions.push('Red man syndrome: histamine release при rapid infusion → flushing, hypotension; slow rate, антигистамины');
    actions.push('Тромбофлебит при peripheral line; central line preferred при курсах > 5 дней');

    if (indication === 'meningitis') {
      actions.push('Meningitis: после loading 20 мг/кг → maintenance ' + interval);
      actions.push('Длительность: 14-21 день; LP repeat обязателен');
    } else {
      actions.push('Длительность LOS: 7-10 дней (positive culture); 14+ дней при meningitis / endocarditis');
    }

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${dosePerKg} мг/кг ${indication === 'meningitis' ? '(loading)' : interval}`,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг IV infusion ≥ ${infusionTime.toFixed(0)} мин.`,
      actions,
    };
  },
  caveats: [
    'CONS — частая причина LOS у недоношенных (~ 40 %); ванкомицин — empiric, narrow если sensitivity подтверждена',
    'AUC-based monitoring (ASHP/IDSA 2020) более accurate чем trough alone для предотвращения nephrotoxicity',
    'Trough 10-20 мг/л — surrogate; для serious infections target trough 15-20',
    'Concomitant aminoglycosides потенцируют nephrotoxicity — мониторинг Cr / диурез',
    'Red man syndrome — НЕ аллергия, histamine release; slower infusion + diphenhydramine',
    'CSF penetration слабая — для meningitis loading 20 мг/кг + maintenance верхний predел dosing',
    'Adequate trough — критично для S. aureus (MIC > 2 → escalation, например к daptomycin или linezolid)',
    'Длительность: уmeньшать ASAP при negative cultures + clinical improvement',
    'У EСМО patients: дозировка повышена 30-50% (large volume of distribution)',
  ],
  related: [
    { id: 'neo-ampicillin-dose', title: 'Ампициллин н/р' },
    { id: 'neo-gentamicin-dose', title: 'Гентамицин н/р' },
    { id: 'neo-nsofa', title: 'Neonatal SOFA' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
  ],
  info: `### Ванкомицин — LOS у новорождённых

Гликопептид, основной антибиотик для LOS у недоношенных при подозрении
на CONS (coag-negative staphylococci), MRSA, ampi-resistant Enterococcus.

### Дозы по PMA + PNA

| PMA | PNA | Доза | Interval |
|---|---|---|---|
| ≤ 29 нед | 0-14 дн | 10-15 мг/кг | q18-24h |
| ≤ 29 нед | > 14 дн | 15 мг/кг | q12h |
| 30-36 нед | 0-14 дн | 10-15 мг/кг | q12-18h |
| 30-36 нед | > 14 дн | 15 мг/кг | q8h |
| ≥ 37 нед | 0-7 дн | 10-15 мг/кг | q12h |
| ≥ 37 нед | > 7 дн | 15 мг/кг | q6-8h |

#### Loading dose

- **Sepsis:** не нужен обычно (loading dose оригинал)
- **Meningitis:** 20 мг/кг loading → maintenance

### Therapeutic Drug Monitoring (ASHP/IDSA 2020)

| Параметр | Цель | Альтернатива |
|---|---|---|
| **AUC₂₄/MIC** | 400-600 | Optimal |
| **Trough** | 10-20 мг/л | Surrogate |
| **Trough (severe)** | 15-20 мг/л | Endocarditis, meningitis |

⚠️ AUC > 600 → nephrotoxicity risk → продлить interval

### Спектр

| Чувствительны | Резистентны |
|---|---|
| MRSA / MRSE | VRE (≈ 5-15 % Enterococcus) |
| CONS (S. epidermidis) | Gram-negative |
| MSSA (less effective vs cefazolin) | Anaerobes |
| Streptococci | Mycobacterium |
| Enterococcus (если sensitive) | Listeria (некоторые) |

### Длительность

| Инфекция | Длительность |
|---|---|
| LOS / sepsis | 7-10 дней (positive); 36-48 ч (negative) |
| CONS bloodstream | 7-14 дней + remove central line |
| Meningitis | 14-21 день |
| Endocarditis | 4-6 недель |
| Bone/joint | 4-6 недель |

### Совместимость in IV

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | Heparin |
| 5 % Glucose | β-lactams (precipitate) |
| Lactated Ringer | Phenytoin |
| — | NaHCO₃ |

### Toxicity

#### Nephrotoxicity
- Acute Kidney Injury 5-15 % при курсе > 7 дней
- Concomitant gent / amikacin потенцирует
- Adequate hydration критично

#### Red man syndrome
- Histamine release (НЕ аллергия)
- Flushing верхней половины тела, hypotension
- Profilactic: slow rate (≥ 60 мин), diphenhydramine 1 мг/кг IV

#### Ototoxicity
- Rare, особенно sin concomitant aminoglycosides
- Reversible если caught early

### Источники

- AAP Red Book 2021-2024
- Rybak MJ ASHP/IDSA Vancomycin Therapeutic Monitoring 2020
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Бактериальный сепсис н/р" (2024)
- Frymoyer A et al. — pediatric/neonatal PK models
`,
};

export default runner;
