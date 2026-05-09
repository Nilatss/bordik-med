/**
 * Runner: neo-fluconazole-dose — Флуконазол (antifungal)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Triazole antifungal. Используется для prophylaxis у ELBW < 1000 г + central
 * line, и для treatment invasive Candida infection у н/р.
 *
 * Дозы:
 *   Prophylaxis (ELBW < 1000 г):
 *     3 мг/кг IV/PO 2×/нед × 4-6 нед (или до удаления central line)
 *
 *   Treatment Candida infection:
 *     Loading 25 мг/кг IV (some protocols), затем
 *     12 мг/кг q24h IV/PO × 14-21 день (системный)
 *     Уменьшение к 6 мг/кг q24h после клинического улучшения
 *
 *   PMA-based maintenance:
 *     PMA ≤ 29 нед: 12 мг/кг q72h первые 2 нед жизни, затем q48h
 *     PMA 30-36 нед: 12 мг/кг q48h
 *     PMA ≥ 37 нед: 12 мг/кг q24h
 *
 * SOURCES:
 *   - Kaufman D et al. NEJM 2001;345:1660 — fluconazole prophylaxis ELBW
 *   - Manzoni P et al. NEJM 2007;356:2483 — fluconazole prophylaxis trial
 *   - AAP Red Book — Candida treatment
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Грибковые инфекции у н/р" (2024)
 *   - Cochrane Antifungal prophylaxis в preterm 2014
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Kaufman 2001 / Manzoni 2007 / NeoFax) · РФ',
  reference: 'Kaufman D NEJM 2001;345:1660. Manzoni P NEJM 2007;356:2483. AAP Red Book.',
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
      id: 'mode',
      label: 'Показание / режим',
      type: 'select',
      options: [
        { value: 'prophy', label: 'Prophylaxis ELBW 3 мг/кг 2×/нед IV/PO' },
        { value: 'load', label: 'Loading 25 мг/кг IV (severe infection)' },
        { value: 'treat', label: 'Treatment 12 мг/кг q24h × 14-21 d' },
        { value: 'maint_low', label: 'Maintenance 6 мг/кг (после improvement)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const pma = Number(values.pma ?? 40);
    const mode = String(values.mode ?? 'prophy');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type FlucMode = { perKg: number; route: string; freq: string; duration: string; label: string };
    let m: FlucMode;

    if (mode === 'prophy') {
      m = { perKg: 3, route: 'IV/PO', freq: '2×/нед', duration: '4-6 нед или до line removal', label: 'Prophylaxis ELBW' };
    } else if (mode === 'load') {
      m = { perKg: 25, route: 'IV slow infusion 30 мин', freq: 'однократно', duration: 'loading dose', label: 'Loading severe' };
    } else if (mode === 'maint_low') {
      m = { perKg: 6, route: 'IV/PO', freq: 'q24h', duration: 'после improvement', label: 'Maintenance low' };
    } else {
      // treat — PMA-based dosing
      let freq = 'q24h';
      if (pma <= 29) freq = 'q48h (q72h первые 2 нед жизни)';
      else if (pma <= 36) freq = 'q48h';
      m = { perKg: 12, route: 'IV/PO', freq, duration: '14-21 д', label: 'Treatment standard' };
    }

    const total = w * m.perKg;
    const conc = 2; // мг/мл стандартный premixed bag (200 мг/100 мл)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Флуконазол: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ 2 мг/мл (premixed)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Длительность: ${m.duration}`);
    actions.push(`Путь: ${m.route} (PO bioavailability ~ 100 % у н/р — interchangeable)`);

    if (mode === 'prophy') {
      actions.push('--- Prophylaxis в ELBW ---');
      actions.push('Indication: ELBW < 1000 г + central line + risk factors');
      actions.push('Risk factors: GA < 28 нед, central line > 7 d, broad-spectrum abx, abdominal surgery');
      actions.push('Kaufman 2001: ↓ Candida invasive 80 %, ↓ mortality');
      actions.push('Manzoni 2007: similar findings, ↓ Candida-related mortality');
      actions.push('Длительность: 4-6 нед или до удаления central line');
      actions.push('Резистентность concern (Candida glabrata, krusei): minimal у н/р usage');
    } else if (mode === 'load') {
      actions.push('--- Loading dose (severe infection) ---');
      actions.push('25 мг/кг IV slow 30 мин — для quick achievement therapeutic levels');
      actions.push('Затем maintenance 12 мг/кг q24h (или PMA-adjusted)');
      actions.push('Особенно для: invasive candidiasis, candidemia, CNS infection');
    } else if (mode === 'maint_low') {
      actions.push('--- Maintenance low (после improvement) ---');
      actions.push('Step-down после 7-10 дней standard treatment');
      actions.push('6 мг/кг q24h — подходит для completion course');
      actions.push('Total длительность: 14-21 д');
    } else {
      actions.push('--- Treatment standard ---');
      actions.push('12 мг/кг IV q24h (PMA-adjusted frequency для ELBW)');
      actions.push('Длительность: 14 d (uncomplicated candidemia после negative cultures); 21+ д (CNS / disseminated)');
      actions.push('Echocardiography для исключения endocarditis (Candida endocarditis у line patients)');
      actions.push('LP если CNS symptoms (Candida meningitis у н/р rare but devastating)');
      actions.push('Removal central line обязательна когда possible');
    }

    actions.push('--- PMA-based dosing rationale ---');
    actions.push('ELBW PMA ≤ 29 нед: t½ удлинён до 73 ч → q72h первые 2 нед, затем q48h');
    actions.push('PMA 30-36 нед: t½ ≈ 60 ч → q48h');
    actions.push('PMA ≥ 37 нед: t½ ≈ 30 ч → q24h');

    actions.push('--- Мониторинг ---');
    actions.push('LFTs: ALT/AST baseline + q1-2 нед (hepatic metabolism)');
    actions.push('CBC weekly');
    actions.push('Cultures: monitor clearance (negative blood cultures 48-72 ч perfilaxis)');
    actions.push('QT prolongation rare у н/р, но monitor если concomitant QT-prolonging drugs');

    actions.push('--- Совместимость ---');
    actions.push('Совместимо: 0.9 % NaCl, 5 % glucose, lactated Ringer');
    actions.push('Premixed solution — direct infuse');
    actions.push('PO suspension: 10 мг/мл');

    actions.push('--- Side effects ---');
    actions.push('GI: vomiting, diarrhea (rare у н/р short-term)');
    actions.push('Hepatic: ↑ LFTs (10-20 %); rarely значимая hepatotoxicity');
    actions.push('Allergic reactions rare');
    actions.push('Adrenal insufficiency у chronic high-dose (rare у н/р)');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: m.label,
      color: '#3B82F6',
      details: `${m.perKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг ${m.freq} × ${m.duration}.`,
      actions,
    };
  },
  caveats: [
    'Kaufman 2001 + Manzoni 2007: fluconazole prophylaxis у ELBW < 1000 г snijaeт invasive Candida на ~ 80 %',
    'Cochrane 2014: prophylactic antifungal в preterm — significant ↓ invasive fungal infection',
    'PMA-based dosing critical: ELBW ≤ 29 нед — t½ до 73 ч → less frequent dosing',
    'Bioavailability oral ~ 100 % — easy switch IV→PO когда tolerating feeds',
    'Loading 25 мг/кг для severe infection достигает therapeutic levels быстрее',
    'Длительность treatment: 14 d uncomplicated candidemia после negative cultures; 21+ д CNS / disseminated',
    'Central line removal obligatory когда possible (line — main reservoir Candida)',
    'Echocardiography для endocarditis exclusion у sustained candidemia',
    'LP at diagnosis (CNS Candida у н/р rare but devastating outcomes)',
    'Resistance: Candida albicans usually sensitive; krusei / glabrata — alternative agent (echinocandin, ампфотерицин)',
    'Hepatic enzyme induction: caution с phenytoin, rifampin, warfarin',
  ],
  related: [
    { id: 'neo-vancomycin-dose', title: 'Ванкомицин н/р' },
    { id: 'neo-ampicillin-dose', title: 'Ампициллин н/р' },
    { id: 'neo-prematurity-class', title: 'Классификация недоношенности' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
  ],
  info: `### Флуконазол у новорождённых

Triazole antifungal — prophylaxis у ELBW < 1000 г и treatment invasive
Candida.

### Дозы

#### Prophylaxis ELBW
- **3 мг/кг 2×/нед IV/PO**
- 4-6 нед или до удаления central line
- Indication: ELBW < 1000 г + central line + risk factors

#### Treatment

| Phase | Доза | Frequency |
|---|---|---|
| Loading | 25 мг/кг IV slow 30 мин | однократно |
| **Maintenance** | **12 мг/кг IV/PO** | **PMA-based** |
| Step-down | 6 мг/кг IV/PO | q24h after improvement |

#### PMA-based frequency

| PMA | Frequency |
|---|---|
| ≤ 29 нед | q72h первые 2 нед жизни, затем q48h |
| 30-36 нед | q48h |
| ≥ 37 нед | q24h |

### Showings

#### Prophylaxis (Kaufman 2001 + Manzoni 2007)
- ELBW < 1000 г + central line
- Risk factors:
  - GA < 28 нед
  - Central line > 7 days
  - Broad-spectrum antibiotics
  - Abdominal surgery
  - TPN > 14 days
- ↓ Invasive Candida 80 %
- ↓ Candida-related mortality

#### Treatment
- Candidemia
- Invasive candidiasis (peritonitis, hepatosplenic)
- **CNS Candida** (meningitis — rare но devastating)
- Cutaneous Candida (severe)
- Esophageal candidiasis

### Спектр

| Чувствительны | Резистентны |
|---|---|
| **Candida albicans** | C. krusei (intrinsic) |
| C. parapsilosis | C. glabrata (variable) |
| C. tropicalis | Mucor, Aspergillus |
| C. lusitaniae | — |

### Длительность treatment

| Indication | Длительность |
|---|---|
| **Uncomplicated candidemia** | 14 дней после negative cultures |
| **CNS Candida** | 21+ дней |
| **Endocarditis** | 6+ нед |
| **Disseminated** | 21+ дней |
| **Cutaneous** | 7-14 дней |

### Pharmacokinetics

| Параметр | Term | Preterm | ELBW (≤29 нед) |
|---|---|---|---|
| **t½** | 30 ч | 60 ч | 73 ч |
| **Bioavailability PO** | 100 % | 100 % | 100 % |
| **CSF penetration** | + (60-80 %) | + | + |

### Resistance

#### Switch к alternative if:
- C. krusei (intrinsic resistance)
- C. glabrata (often resistant)
- C. auris (multi-drug resistant)
- Persistent positive cultures after 5-7 d

#### Alternative agents:
- **Echinocandins** (caspofungin, micafungin): broader, low CSF
- **Amphotericin B**: severe / multi-resistant; nephrotoxicity concern
- **Voriconazole**: rare у н/р

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| ↑ LFTs | 10-20 % | Monitor q1-2 нед |
| GI symptoms | rare у н/р | Reduce dose if severe |
| Allergic reaction | rare | Discontinue |
| QT prolongation | rare у н/р | Avoid concomitant QT drugs |

### Drug interactions

| Drug | Effect |
|---|---|
| **Phenytoin** | ↑ phenytoin levels |
| **Rifampin** | ↓ fluconazole levels |
| **Warfarin** | ↑ INR |
| **Sulfonylureas** | ↑ hypoglycemic effect |
| **Tacrolimus** | ↑ tacrolimus levels |

### Источники

- Kaufman D et al. NEJM 2001;345:1660 — prophylaxis trial
- Manzoni P et al. NEJM 2007;356:2483 — prophylaxis trial
- Cochrane Antifungal prophylaxis в preterm 2014
- AAP Red Book — Candida treatment
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Грибковые инфекции у н/р" (2024)
`,
};

export default runner;
