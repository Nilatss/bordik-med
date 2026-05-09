/**
 * Runner: neo-indomethacin-pda-dose — Индометацин (PDA closure / IVH prophylaxis)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * COX inhibitor — alternative ибупрофену для PDA closure. Также используется
 * для IVH prophylaxis у extreme preterm < 28 нед.
 *
 * Дозы:
 *   PDA closure (Heymann protocol):
 *     0.2 мг/кг IV slow infusion 30 мин, затем
 *     0.1 мг/кг q12h × 2 (если < 48 ч жизни)
 *     0.2 мг/кг q12h × 2 (если 2-7 дней жизни)
 *     0.25 мг/кг q12h × 2 (если > 7 дней жизни)
 *
 *   IVH prophylaxis:
 *     0.1 мг/кг IV q24h × 3 doses, начать в 6-12 ч жизни
 *     (TIPP trial Schmidt 2001 NEJM — снижает severe IVH у ELBW)
 *
 * SOURCES:
 *   - Heymann MA et al. — original PDA closure protocol
 *   - Schmidt B et al. TIPP trial NEJM 2001;344:1966 — IVH prophylaxis
 *   - Mitra S et al. JAMA 2018;319:1221 — meta-analysis (ибупрофен vs indomethacin)
 *   - Cochrane Indomethacin для PDA 2020
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Открытый артериальный проток" (2024)
 *
 * Vs ибупрофен: indomethacin старший препарат, больше mesenteric/renal
 * vasoconstriction, поэтому ибупрофен чаще предпочитают (Mitra 2018).
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Cochrane / Mitra JAMA 2018) · РФ',
  reference: 'Heymann MA — PDA closure. Schmidt B TIPP NEJM 2001;344:1966. Mitra S JAMA 2018;319:1221.',
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
      id: 'age_days',
      label: 'Возраст (дни)',
      type: 'select',
      options: [
        { value: '0', label: '< 48 ч' },
        { value: '5', label: '2-7 дней' },
        { value: '10', label: '> 7 дней' },
      ],
    },
    {
      id: 'mode',
      label: 'Показание / dose',
      type: 'select',
      options: [
        { value: 'pda_first', label: 'PDA closure 1-я доза 0.2 мг/кг' },
        { value: 'pda_subsequent', label: 'PDA closure 2-3 доза (по age)' },
        { value: 'ivh_prophy', label: 'IVH prophylaxis 0.1 мг/кг q24h × 3 (TIPP)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const ageDays = Number(values.age_days ?? 0);
    const mode = String(values.mode ?? 'pda_first');

    if (w <= 0 || w > 3) {
      return { value: '—', interpretation: 'Введите массу 0.4-3 кг (для preterm)', color: '#9CA3AF', details: '' };
    }

    let dosePerKg = 0.2;
    let label = '';
    let freq = 'однократно';
    let duration = '';

    if (mode === 'pda_first') {
      dosePerKg = 0.2;
      label = 'PDA closure 1-я доза';
      freq = 'однократно';
      duration = 'затем 2-3 доза';
    } else if (mode === 'pda_subsequent') {
      if (ageDays < 2) dosePerKg = 0.1;
      else if (ageDays < 7) dosePerKg = 0.2;
      else dosePerKg = 0.25;
      label = `PDA closure 2-3 доза (age ${ageDays < 2 ? '< 48 ч' : ageDays < 7 ? '2-7 d' : '> 7 d'})`;
      freq = 'q12h × 2';
      duration = 'total 3-doses course';
    } else if (mode === 'ivh_prophy') {
      dosePerKg = 0.1;
      label = 'IVH prophylaxis (TIPP)';
      freq = 'q24h';
      duration = '× 3 doses';
    }

    const total = w * dosePerKg;
    // Концентрация после reconstitution: 1 мг + 1 мл NS = 1 мг/мл, then dilute 1:5 = 0.2 мг/мл
    const conc = 0.2;
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Индометацин: ${total.toFixed(3)} мг = ${vol.toFixed(2)} мл @ 0.2 мг/мл (diluted)`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${freq}`);
    actions.push(`Длительность: ${duration}`);
    actions.push('Путь: IV slow infusion 30 мин (НЕ rapid push)');

    if (mode.startsWith('pda')) {
      actions.push('--- PDA closure protocol ---');
      actions.push('Heymann age-adjusted: ↑ доза с возрастом (better closure rate)');
      actions.push('Closure rate ~ 70 % (similar to ibuprofen — Mitra 2018 meta-analysis)');
      actions.push('Echo через 24-48 ч после course для оценки closure');
      actions.push('Repeat course × 1 если no closure (50-70 % closure после 2 courses)');
      actions.push('Surgical ligation если remains hsPDA');
    } else if (mode === 'ivh_prophy') {
      actions.push('--- IVH prophylaxis (TIPP trial) ---');
      actions.push('Schmidt B 2001 NEJM 344:1966');
      actions.push('Start в 6-12 ч жизни; total 3 doses q24h');
      actions.push('Снижает severe IVH (Grade III-IV) у ELBW < 1000 г');
      actions.push('НЕ улучшает long-term neurodev outcomes');
      actions.push('В современной practice: меньше используется (CONSENSUS shifted к conservative)');
    }

    actions.push('--- Подтверждение перед инициированием ---');
    actions.push('Adequate hydration; нет concomitant NSAIDs');
    actions.push('Renal function: Cr < 1.5 мг/дл, диурез > 1 мл/кг/ч × 8 ч');
    actions.push('Тромбоциты ≥ 50 × 10⁹/л');
    actions.push('Нет active hemorrhage / NEC / sepsis');
    actions.push('Echo confirm hsPDA (если PDA closure indication)');

    actions.push('--- Контраиндикации ---');
    actions.push('Active hemorrhage / тромбоцитопения < 50');
    actions.push('NEC active / suspected (особенно с сyмптoms)');
    actions.push('Renal failure (Cr > 1.5 мг/дл, anuria)');
    actions.push('Sepsis active');
    actions.push('Right-to-left shunt (duct-dependent CHD)');
    actions.push('Coagulopathy (INR > 2)');

    actions.push('--- Мониторинг ---');
    actions.push('Echo через 24-48 ч после course (PDA assessment)');
    actions.push('Cr / urea / диурез q24h');
    actions.push('CBC (тромбоцитопения)');
    actions.push('Гликемия');

    actions.push('--- Side effects ---');
    actions.push('Renal: oliguria, ↑ Cr (more pronounced than ибупрофен)');
    actions.push('GI: NEC risk (~ 5-10 %); particular concern с steroids');
    actions.push('Hematologic: тромбоцитопения, кровотечение');
    actions.push('Hepatic: hyperbilirubinemia (albumin displacement)');
    actions.push('Cerebral: vasoconstriction → ↓ blood flow (особенно у asphyxia / IVH)');

    actions.push('--- Vs ибупрофен (Mitra JAMA 2018) ---');
    actions.push('Closure rate: similar (~ 70 %)');
    actions.push('Renal effects: indomethacin > ибупрофен (oliguria)');
    actions.push('NEC risk: indomethacin > ибупрофен');
    actions.push('Cerebral blood flow: indomethacin ↓; ибупрофен neutral');
    actions.push('→ Ибупрофен предпочтительнее в большинстве scenarios');

    return {
      value: total.toFixed(3),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: label,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(3)} мг IV slow infusion 30 мин ${freq}.`,
      actions,
    };
  },
  caveats: [
    'Mitra JAMA 2018 meta-analysis: ибупрофен предпочтительнее indomethacin (similar closure, fewer side effects)',
    'Indomethacin > ибупрофен mesenteric / renal vasoconstriction → выше NEC и oliguria risk',
    'TIPP trial (Schmidt 2001): IVH prophylaxis снижает severe IVH у ELBW, но НЕ улучшает long-term neurodev',
    'Concurrent steroids (hydrocortisone, dexamethasone) — повышает GI perforation risk × 5-10',
    'Concurrent furosemide — НЕ рекомендуется (NSAID blunts diuresis)',
    'Cerebral blood flow ↓ — особенно concern у asphyxia, IVH, hypotension',
    'Renal function — pre-dose check critical; oliguria за 24 ч → задержать следующую дозу',
    'IV slow infusion 30 мин (НЕ rapid push — увеличивает renal vasoconstriction)',
    'Concentration после reconstitution: 1 мг + 1 мл NS = 1 мг/мл; dilute 1:5 = 0.2 мг/мл',
    'Conservative management — alternative для < 32 нед asymptomatic PDA (BeNeDuctus 2022)',
    'Не routine prophylaxis в современной practice (CONSENSUS shifted)',
  ],
  related: [
    { id: 'neo-ibuprofen-pda-dose', title: 'Ибупрофен PDA' },
    { id: 'neo-papile', title: 'Papile ВЖК' },
    { id: 'neo-pge1-dose', title: 'PGE1 (для поддержания PDA)' },
    { id: 'neo-bell-nec', title: 'Bell NEC staging' },
  ],
  info: `### Индометацин у новорождённых

COX inhibitor — alternative ибупрофену для PDA closure. Также для IVH
prophylaxis у extreme preterm.

### Дозы

#### PDA closure (Heymann protocol — age-adjusted)
| Phase | Age | Доза |
|---|---|---|
| **1-я доза** | any | 0.2 мг/кг IV slow 30 мин |
| 2-я и 3-я (q12h) | < 48 ч | 0.1 мг/кг |
| 2-я и 3-я (q12h) | 2-7 d | 0.2 мг/кг |
| 2-я и 3-я (q12h) | > 7 d | 0.25 мг/кг |

#### IVH prophylaxis (TIPP trial)
- 0.1 мг/кг IV q24h × 3 doses
- Start в 6-12 ч жизни
- ELBW < 1000 г

### TIPP trial (Schmidt 2001 NEJM)

- 1202 ELBW newborns randomized
- Indomethacin prophylaxis vs placebo
- ↓ Severe IVH (Grade III-IV)
- ↓ PDA need for ligation
- **No improvement** в death, neurodev disability в 18 мес
- → Не routine standard в современной practice

### Vs ибупрофен (Mitra JAMA 2018 meta-analysis)

| | Indomethacin | Ибупрофен |
|---|---|---|
| **Closure rate** | ~ 70 % | ~ 70 % |
| **Renal effects** | + (oliguria) | minimal |
| **NEC risk** | + | low |
| **Cerebral BF** | ↓ | neutral |
| **Hyperbili** | + (displacement) | + |
| **Cost** | low | medium |
| **Preferred** | second-line | **first-line** |

### Противопоказания

- Active hemorrhage / тромбоцитопения < 50 × 10⁹/л
- NEC active / suspected
- Renal failure (Cr > 1.5 мг/дл, anuria)
- Sepsis active
- Right-to-left shunt (duct-dependent CHD)
- Coagulopathy (INR > 2)

### Concurrent risks

| Concurrent | Effect |
|---|---|
| **Hydrocortisone** / dex | ↑↑ GI perforation (× 5-10) |
| **Furosemide** | Blunts diuresis |
| **Aminoglycosides** | ↑ nephrotoxicity |
| **Anticoagulants** | ↑ bleeding |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Oliguria | 20-30 % | Hold next dose if persistent |
| ↑ Cr | + | Monitor renal function |
| Тромбоцитопения | 5-10 % | Skip course если < 50 |
| NEC | 5-10 % | Stop, abx, NPO |
| Hyperbili | + | Caution возле exchange |
| Cerebral BF ↓ | concerning у asphyxia | Avoid in unstable |

### Hemodynamically significant PDA — критерии (как ибупрофен)

| Параметр | Значение |
|---|---|
| **Diameter** | > 1.5 мм |
| **LA/Ao ratio** | > 1.4 |
| **Descending aorta** | Diastolic flow reverse |
| **Continuous murmur** | + |

### Источники

- Heymann MA et al. — original PDA closure protocol
- Schmidt B et al. TIPP trial NEJM 2001;344:1966
- Mitra S et al. JAMA 2018;319:1221 — meta-analysis
- Ohlsson A et al. Cochrane Indomethacin for PDA 2020
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Открытый артериальный проток" (2024)
`,
};

export default runner;
