/**
 * Runner: neo-vitk-dose — Витамин K (профилактика VKDB)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Vitamin K Deficiency Bleeding (VKDB) prophylaxis для всех н/р
 * сразу после рождения. Стандарт ухода всемирно (WHO, AAP, NICE, RCPCH).
 *
 * Дозы (single dose at birth):
 *   IM standard:
 *     - Term ≥ 1500 г: 1 мг IM (vastus lateralis muscle)
 *     - Preterm < 1500 г: 0.5 мг IM
 *
 *   Oral alternative (1 mg × 3 doses, NICE option):
 *     - День 1 (рождение)
 *     - День 7
 *     - День 28-42 (или возраст 4-6 недель)
 *
 *   Treatment of established VKDB (active bleeding):
 *     - 1-2 мг IV slow + FFP / PCC если significant bleeding
 *     - Continued заместительная терапия по INR
 *
 * VKDB classification:
 *   - Early VKDB (<24 ч): rare, обычно maternal anticoagulants (warfarin)
 *   - Classic VKDB (1-7 d): рутинно prevented IM
 *   - Late VKDB (8 d - 6 мес): higher mortality (50-100 % CNS bleed); breastfed только → IM
 *
 * SOURCES:
 *   - AAP COFN 2022 — Vitamin K & VKDB Prevention (Pediatrics 149:e2021055584)
 *   - NICE NG194 (2021)
 *   - RCPCH 2018 — VKDB Prevention
 *   - WHO Recommendations 2017
 *   - КР МЗ РФ "Геморрагическая болезнь новорождённого" (2024)
 *   - Sankar MJ et al. Cochrane Vitamin K for VKDB 2016
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP / NICE / WHO / RCPCH) · РФ',
  reference: 'AAP COFN 2022 (Pediatrics 149:e2021055584). NICE NG194. WHO 2017. КР МЗ РФ ГБН.',
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
      label: 'Показание / режим',
      type: 'select',
      options: [
        { value: 'prophy_term_im', label: 'Profilaxis термин IM (≥ 1500 г, 1 мг)' },
        { value: 'prophy_preterm_im', label: 'Profilaxis преэрм IM (< 1500 г, 0.5 мг)' },
        { value: 'prophy_po_d1', label: 'Profilaxis PO День 1 (1 мг, NICE option)' },
        { value: 'prophy_po_d7', label: 'Profilaxis PO День 7 (1 мг)' },
        { value: 'prophy_po_d28', label: 'Profilaxis PO День 28-42 (1 мг)' },
        { value: 'treat_minor', label: 'Treatment minor bleeding (1 мг IV)' },
        { value: 'treat_major', label: 'Treatment major bleeding (2 мг IV + FFP)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'prophy_term_im');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type VitKMode = { dose: number; route: string; label: string; isWeightBased?: boolean };
    const modes: Record<string, VitKMode> = {
      prophy_term_im: { dose: 1, route: 'IM в vastus lateralis', label: 'Profilaxis term IM' },
      prophy_preterm_im: { dose: 0.5, route: 'IM в vastus lateralis', label: 'Profilaxis preterm IM' },
      prophy_po_d1: { dose: 1, route: 'PO (NICE option)', label: 'Profilaxis PO Day 1' },
      prophy_po_d7: { dose: 1, route: 'PO (NICE option)', label: 'Profilaxis PO Day 7' },
      prophy_po_d28: { dose: 1, route: 'PO (NICE option)', label: 'Profilaxis PO Day 28-42' },
      treat_minor: { dose: 1, route: 'IV slow push 1 мин', label: 'Treatment minor bleeding' },
      treat_major: { dose: 2, route: 'IV slow push 1 мин + FFP', label: 'Treatment major bleeding' },
    };
    const m = modes[mode] ?? modes.prophy_term_im;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = m.dose;
    const conc = 2; // мг/мл стандартный (2 мг/мл ампулы Konakion neonatal)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Витамин K1: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ 2 мг/мл (Konakion neo)`);
    actions.push(`Доза: ${m.dose} мг`);
    actions.push(`Путь: ${m.route}`);

    if (mode.startsWith('prophy_term_im') || mode.startsWith('prophy_preterm_im')) {
      actions.push('--- Profilaxis IM ---');
      actions.push('Обычно в первые 1-6 ч жизни в vastus lateralis');
      actions.push('Защищает от classic VKDB (1-7 d) и late VKDB (8 d - 6 мес)');
      actions.push('Single dose — long-acting (months)');
      actions.push('AAP, NICE, WHO, RCPCH — IM первое предпочтение');
    } else if (mode.startsWith('prophy_po')) {
      actions.push('--- Profilaxis PO (NICE option) ---');
      actions.push('Schedule: День 1 (1 мг) + День 7 (1 мг) + День 28-42 (1 мг)');
      actions.push('Применимо у doxor donate-родителей, отказ от IM');
      actions.push('Длительный compliance ниже — не предпочтительно у groups высокого риска');
      actions.push('Breastfed: more episodes late VKDB при PO regimen');
    } else if (mode.startsWith('treat')) {
      actions.push('--- Treatment VKDB ---');
      actions.push('Major bleeding: + FFP 10-15 мл/кг или PCC');
      actions.push('Контроль INR / PT через 4-6 ч после дозы');
      actions.push('Repeat 1 мг IV q24h до коррекции INR (обычно 2-3 дня)');
      actions.push('Если CNS bleed: PCC более быстрая коррекция чем FFP');
      actions.push('Investigate cause: maternal anticonv, malabsorption, cholestasis, антибиотики long-term');
    }

    actions.push('--- Side effects ---');
    actions.push('IV rapid push: anaphylactoid reaction (rare у н/р) — slow push 1 мин');
    actions.push('IM bruising / induration в месте — minimal');
    actions.push('Не cancer-causing (старая теория Golding 1992 — disproved)');
    actions.push('Hyperbilirubinemia rare у IV form (особенно K3 — не используется)');

    actions.push('--- Совместимость ---');
    actions.push('IV: 0.9 % NaCl, 5 % glucose; не с lipid emulsion');
    actions.push('IM: только intramuscular в vastus lateralis (не gluteus у н/р)');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: '#22C55E',
      details: `${m.dose} мг ${m.route}.`,
      actions,
    };
  },
  caveats: [
    'IM > PO для prevention (better compliance, longer protection, особенно late VKDB)',
    'Late VKDB (8 d - 6 мес): mortality 20-50 %, intracranial bleed — главный killer',
    'Breastfed exclusive: ↑ risk late VKDB (low vit K в milk) → IM настоятельно',
    'Maternal medications which deplete vit K: phenobarbital, phenytoin, warfarin, ампициллин, INH',
    'Cholestasis / biliary atresia / CF: malabsorption fat-soluble vit → late VKDB despite prophylaxis',
    'Antibiotics long-term (>14 d) → ↓ gut flora vit K production → secondary deficiency',
    'Old theory (Golding 1992): vit K и leukemia risk → DISPROVED multiple subsequent studies',
    'Refusal vit K — informed consent; in some jurisdictions counted как neglect (NICE NG194 documentation)',
    'Ampoule Konakion neonatal 2 мг/мл (0.5 мл = 1 мг); НЕ путать с adult Konakion 10 мг/мл',
    'IV form для critically ill н/р или active bleeding — НЕ routine prophylaxis',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
  ],
  info: `### Витамин K у новорождённых

Profilaxis Vitamin K Deficiency Bleeding (VKDB) — стандарт ухода всемирно
сразу после рождения.

### Дозы

#### IM Profilaxis (предпочтительно)
| Группа | Доза |
|---|---|
| **Term ≥ 1500 г** | 1 мг IM single |
| **Preterm < 1500 г** | 0.5 мг IM single |

#### PO Alternative (NICE option, lower acceptance)
| Day | Доза |
|---|---|
| День 1 | 1 мг PO |
| День 7 | 1 мг PO |
| День 28-42 (4-6 wk) | 1 мг PO |

#### Treatment VKDB
| Severity | Доза |
|---|---|
| Minor bleeding | 1 мг IV slow push |
| Major / CNS bleeding | 2 мг IV + FFP 10-15 мл/кг или PCC |

### VKDB classification

| Type | Onset | Causes | Mortality |
|---|---|---|---|
| **Early** | < 24 ч | Maternal anticoag (warfarin, phenobarb) | rare |
| **Classic** | 1-7 d | Vit K depletion newborn | 50-200 deaths/yr global if unprev |
| **Late** | 8 d - 6 мес | Breastfed, cholestasis, malabsorption | **20-50 % (CNS bleed)** |

### Patofiziology

- Vit K нужен для активации факторов II, VII, IX, X (1972)
- Newborn deficient: ↓ placental transfer, ↓ gut bacterial production, low milk Vit K
- Bottle-fed (formula) меньше деficient (formula has + Vit K)

### Why IM > PO

| | IM | PO |
|---|---|---|
| **Single dose** | yes | needs 3 |
| **Compliance** | 100 % если administered | 30-70 % miss D7 / D28 |
| **Late VKDB rate** | 0-1.5/100,000 | 1.5-7/100,000 |
| **Refusal rate** | low | similar |
| **Cost** | low | low |

### Maternal medications that increase risk

- **Anticonvulsants:** phenytoin, phenobarbital, carbamazepine
- **Anticoagulants:** warfarin (need higher dose vit K)
- **Antibiotics:** некоторые (long course)
- **TB drugs:** isoniazid, rifampin

→ В таких случаях рассмотреть higher dose vit K (5 мг maternal pre-delivery + IM newborn).

### Cancer myth (Golding 1992)

Старое исследование предположило link vit K IM + childhood leukemia.
**Опровергнуто** многочисленными последующими исследованиями (Klebanoff 1993,
Passmore 1998, McKinney 2001).

**Рекомендация:** все н/р должны получать vit K — refusal is medical neglect
в некоторых юрисдикциях.

### Источники

- AAP COFN 2022 — Pediatrics 149:e2021055584
- NICE NG194 (2021)
- RCPCH 2018 — VKDB Prevention
- WHO Recommendations 2017
- Sankar MJ et al. Cochrane Vitamin K for VKDB 2016
- КР МЗ РФ "Геморрагическая болезнь новорождённого" (2024)
`,
};

export default runner;
