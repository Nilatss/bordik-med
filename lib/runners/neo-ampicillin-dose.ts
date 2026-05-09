/**
 * Runner: neo-ampicillin-dose — Ампициллин (н/р)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Расчёт дозы ампициллина для эмпирической терапии раннего и позднего
 * неонатального сепсиса. First-line antibiotic в paire с гентамицином
 * (covers GBS, Listeria, E. coli).
 *
 * SOURCES:
 *   - AAP Red Book (2021-2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth, Oxford)
 *   - BNF for Children
 *   - КР МЗ РФ "Бактериальный сепсис н/р" (2024)
 *   - Bradley JS et al. Pediatr Infect Dis J 2014 — neonatal pharmacokinetics
 *
 * Дозы (по PMA + PNA):
 *
 *   Sepsis (без meningitis):
 *     PMA ≤ 29 нед, PNA 0-28 дн: 50 мг/кг q12h
 *     PMA ≤ 29 нед, PNA > 28 дн: 50 мг/кг q8h
 *     PMA 30-36 нед, PNA 0-14 дн: 50 мг/кг q12h
 *     PMA 30-36 нед, PNA > 14 дн: 50 мг/кг q8h
 *     PMA 37-44 нед, PNA 0-7 дн:  50 мг/кг q12h
 *     PMA 37-44 нед, PNA > 7 дн:  50 мг/кг q8h
 *
 *   Meningitis: 100 мг/кг (увеличить × 2) с теми же интервалами
 *
 *   Listeria meningitis: 100 мг/кг q6-8h × 14-21 день (treatment of choice)
 *
 * Concentration (стандарт): 100 мг/мл (после reconstitution из 1 г vial в 10 мл)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP Red Book / NeoFax / BNFc) · РФ',
  reference: 'AAP Red Book 2021-2024. NeoFax. КР МЗ РФ "Бактериальный сепсис н/р" 2024.',
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
        { value: '28', label: '≤ 29 нед (extreme/very preterm)' },
        { value: '34', label: '30-36 нед (преэрм / late preterm)' },
        { value: '40', label: '37-44 нед (термин)' },
      ],
    },
    {
      id: 'pna',
      label: 'PNA (постнатальный возраст)',
      type: 'select',
      options: [
        { value: 'early', label: 'Ранний (≤ 7-28 дней по PMA)' },
        { value: 'late', label: 'Поздний (> 7-28 дней по PMA)' },
      ],
    },
    {
      id: 'indication',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'sepsis', label: 'Sepsis (без meningitis), 50 мг/кг' },
        { value: 'meningitis', label: 'Meningitis (включая Listeria), 100 мг/кг' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const pma = Number(values.pma ?? 40);
    const pna = String(values.pna ?? 'early');
    const indication = String(values.indication ?? 'sepsis');

    if (w <= 0 || w > 5) {
      return {
        value: '—',
        interpretation: 'Введите массу 0.4-5 кг',
        color: '#9CA3AF',
        details: '',
      };
    }

    const dosePerKg = indication === 'meningitis' ? 100 : 50;

    // Frequency by PMA + PNA
    let freq = 'q12h';
    if (pna === 'late') {
      freq = 'q8h';
    } else {
      // Early PNA threshold по PMA
      // ≤29 нед: 0-28 дн = early; 30-36 нед: 0-14 = early; ≥37 нед: 0-7 дн = early
      freq = 'q12h';
    }

    const total = w * dosePerKg;
    const conc = 100; // мг/мл стандартный после rec
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Ампициллин: ${total.toFixed(0)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${freq}`);
    actions.push('Путь: IV slow push 3-5 мин (предпочтительно) или IV infusion 15-30 мин');
    actions.push('IM можно при отсутствии IV; PO не используется (плохая абсорбция у н/р)');

    if (indication === 'meningitis') {
      actions.push('Meningitis: продолжать 14-21 день (Listeria — 21 день минимум)');
      actions.push('LP repeat через 24-48 ч если культура изначально positive');
    } else {
      actions.push('Sepsis: 7-10 дней при positive culture; 36-48 ч если negative + clinical improvement');
    }

    actions.push('Совместимость: 0.9 % NaCl, 5 % glucose, lactated Ringer');
    actions.push('НЕСОВМЕСТИМО (in-line): аминогликозиды (separate lumens / flush), heparin, lipid emulsion');
    actions.push('Концентрация после reconstitution: 1 г vial + 10 мл sterile water = 100 мг/мл (stable 1 ч @ 37°C, 8 ч @ 25°C)');
    actions.push('Side effects: rash, тромбоцитопения, hepatotoxicity (rare), seizures (high dose)');

    return {
      value: total.toFixed(0),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${dosePerKg} мг/кг ${freq} (${indication === 'meningitis' ? 'meningitis' : 'sepsis'})`,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(0)} мг ${freq}, IV @ 100 мг/мл = ${vol.toFixed(2)} мл/доза.`,
      actions,
    };
  },
  caveats: [
    'Empiric pair с гентамицином или цефотаксимом — covers GBS, Listeria, E. coli (>90% EOS pathogens)',
    'Listeria — ампициллин first-line (TMP/SMX резерв при аллергии)',
    'Renal excretion — снижение функции почек повышает t½',
    'CSF penetration хорошая при meningitis (особенно при воспалении)',
    'Ampicillin-resistance E. coli — escalation к meropenem или piperacillin/tazobactam',
    'Совместный с гентамицином in vivo, но НЕ in vitro (separate lumens / flush)',
    'Длительность: sepsis 7-10 дней (positive); meningitis 14-21 (Listeria 21+)',
    'Аллергия β-lactam: cross-reaction 1-3% к cephalosporins, < 0.1% к monobactams (aztreonam)',
  ],
  related: [
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
    { id: 'neo-kaiser-eos', title: 'Kaiser EOS' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
    { id: 'neo-nsofa', title: 'Neonatal SOFA' },
  ],
  info: `### Ампициллин — empiric neonatal sepsis

First-line antibiotic для эмпирической терапии EOS / LOS у новорождённых
в paire с гентамицином или цефотаксимом.

### Дозы по PMA + PNA

#### Sepsis (без meningitis): 50 мг/кг

| PMA | PNA | Frequency |
|---|---|---|
| ≤ 29 нед | 0-28 дн | q12h |
| ≤ 29 нед | > 28 дн | q8h |
| 30-36 нед | 0-14 дн | q12h |
| 30-36 нед | > 14 дн | q8h |
| 37-44 нед | 0-7 дн | q12h |
| 37-44 нед | > 7 дн | q8h |

#### Meningitis: 100 мг/кг (× 2) с теми же интервалами

#### Listeria meningitis: 100 мг/кг q6-8h × 21+ дней

### Длительность

| Показание | Длительность |
|---|---|
| Sepsis (positive culture) | 7-10 дней |
| Sepsis (negative + improvement) | 36-48 ч |
| Meningitis | 14-21 день |
| Listeria meningitis | 21+ дней (минимум) |

### Спектр

| Чувствительны | Резистентны |
|---|---|
| GBS (S. agalactiae) | MRSA |
| Listeria monocytogenes | Klebsiella (some) |
| E. coli (~ 50 %) | E. coli ESBL |
| Enterococcus (без VRE) | Pseudomonas |
| H. influenzae (если sensitive) | Anaerobes (мост) |

### Combination logic

| Combination | Покрытие |
|---|---|
| Ampi + gent | EOS standard (GBS + GN) |
| Ampi + cefotaxime | EOS если meningitis suspected |
| Ampi + vanco + gent | LOS если CONS suspected |
| Mero + vanco | LOS late, MDR risk |

### Совместимость

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | Aminoglycosides (gentamicin) |
| 5 % Glucose | Heparin |
| Lactated Ringer | Lipid emulsion |
| Acyclovir | Erythromycin |

### Побочные эффекты

- Rash (≤ 7 % при курсе > 7 дней)
- Тромбоцитопения, neutropenia (rare)
- Hepatotoxicity (RUQ pain + transaminases)
- Seizures при high dose / накопление при ОПН
- Pseudomembranous colitis (С. difficile) — редко у н/р

### Источники

- AAP Red Book 2021-2024
- NeoFax / Neonatal Formulary 9 ed (Ainsworth, Oxford)
- BNF for Children (BNFc)
- КР МЗ РФ "Бактериальный сепсис н/р" (2024)
- Bradley JS et al. Pediatr Infect Dis J 2014
`,
};

export default runner;
