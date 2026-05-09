/**
 * Runner: neo-erythromycin-dose — Эритромицин (prokinetic для feeding intolerance)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Macrolide antibiotic, но в neonatal NICU чаще используется как
 * prokinetic agent (motilin agonist) для feeding intolerance у preterm.
 *
 * Дозы:
 *   Prokinetic: 1-3 мг/кг q6-8h PO (low-dose; some protocols up to 12.5 мг/кг/сут)
 *   IV: same dose, slow infusion (rare у н/р, prefer PO)
 *
 *   Antibiotic (Bordetella pertussis, Chlamydia trachomatis):
 *     10-12.5 мг/кг q6h PO/IV × 14 дней
 *
 *   Pyloric stenosis prevention в high-risk newborns: NOT recommended (controversial)
 *
 * SOURCES:
 *   - Ng E et al. Cochrane Erythromycin for feeding intolerance 2014
 *   - Curatola A et al. — neonatal motility и erythromycin
 *   - AAP Red Book — pertussis, chlamydia treatment
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "Питание / Гастрит у н/р" (2024)
 *
 * NB: Pylor stenosis association в первый 2 нед жизни (особенно ≤ 1500 г)
 * — caution; obstructive risk.
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Cochrane / NeoFax / AAP)',
  reference: 'Ng E Cochrane Erythromycin feeding 2014. AAP Red Book. NeoFax. КР МЗ РФ.',
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
        { value: 'prokin_low', label: 'Prokinetic low 1 мг/кг q8h PO' },
        { value: 'prokin_med', label: 'Prokinetic standard 3 мг/кг q8h PO' },
        { value: 'prokin_high', label: 'Prokinetic high 12.5 мг/кг q6h PO (= 50 мг/кг/сут)' },
        { value: 'abx_pert', label: 'Antibiotic pertussis 12.5 мг/кг q6h PO × 14 дней' },
        { value: 'abx_chlam', label: 'Antibiotic chlamydia 12.5 мг/кг q6h PO × 14 дней' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = String(values.mode ?? 'prokin_med');

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type ErythroMode = { perKg: number; route: string; freq: string; duration: string; label: string };
    const modes: Record<string, ErythroMode> = {
      prokin_low: { perKg: 1, route: 'PO suspension', freq: 'q8h', duration: '5-7 дней', label: 'Prokinetic low' },
      prokin_med: { perKg: 3, route: 'PO suspension', freq: 'q8h', duration: '5-14 дней', label: 'Prokinetic standard' },
      prokin_high: { perKg: 12.5, route: 'PO suspension', freq: 'q6h', duration: '5-14 дней', label: 'Prokinetic high' },
      abx_pert: { perKg: 12.5, route: 'PO suspension', freq: 'q6h', duration: '14 дней', label: 'Antibiotic pertussis' },
      abx_chlam: { perKg: 12.5, route: 'PO suspension', freq: 'q6h', duration: '14 дней', label: 'Antibiotic chlamydia' },
    };
    const m = modes[mode] ?? modes.prokin_med;
    if (!m) {
      return { value: '—', interpretation: 'Неизвестный режим', color: '#9CA3AF', details: '' };
    }
    const total = w * m.perKg;
    const conc = 40; // мг/мл стандартная PO suspension (200 мг/5 мл)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Эритромицин: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ ${conc} мг/мл (PO suspension)`);
    actions.push(`Доза: ${m.perKg} мг/кг ${m.freq}`);
    actions.push(`Длительность: ${m.duration}`);
    actions.push(`Путь: ${m.route}`);

    if (mode.startsWith('prokin')) {
      actions.push('--- Prokinetic indication ---');
      actions.push('Применение: feeding intolerance у preterm (gastric residuals > 50 % feed, vomiting, abdominal distention)');
      actions.push('Cochrane 2014 (Ng): erythromycin высокая dose (12.5 мг/кг q6h) — significant ↓ time to full feeds');
      actions.push('Low dose (1-3 мг/кг q8h) — debated benefit; minimal effect');
      actions.push('Onset действия: 1-2 дня evident effect');
      actions.push('Mechanism: motilin receptor agonist → стимуляция MMC (migrating motor complex)');

      actions.push('--- ⚠️ Pyloric stenosis risk ---');
      actions.push('IHPS (infantile hypertrophic pyloric stenosis) association в neonates < 2 нед жизни');
      actions.push('Особенно у ELBW < 1500 г получающих > 14 дней erythromycin');
      actions.push('Vomiting, projectile vomiting, palpable mass — investigation U/S');
      actions.push('Caveat: использовать ASAP когда indicated, не prolong > 14 дней');
    } else if (mode.startsWith('abx')) {
      actions.push('--- Antibiotic indication ---');
      actions.push('Pertussis: erythromycin first-line у н/р (azithromycin alternative)');
      actions.push('Chlamydia trachomatis (neonatal conjunctivitis или pneumonia): erythromycin standard');
      actions.push('Длительность: 14 дней full course');
      actions.push('Алтернативы: azithromycin (single dose; преферриен у > 1 мес life)');

      actions.push('--- ⚠️ Pyloric stenosis у antibiotic course ---');
      actions.push('IHPS risk особенно при курсе > 14 дней у newborn ≤ 1 мес');
      actions.push('Macrolide group эффект — clarithromycin, azithromycin тоже');
      actions.push('Monitor для projectile vomiting, weight loss, electrolyte abnormalities');
    }

    actions.push('--- Мониторинг ---');
    actions.push('Feeding tolerance: gastric residuals, distention, stooling');
    actions.push('Weekly CBC если course > 7 дней');
    actions.push('Liver function (LFT) baseline + q2 нед при chronic use');
    actions.push('При vomiting projectile + weight loss → abdominal U/S (rule out IHPS)');

    actions.push('--- Side effects ---');
    actions.push('GI: diarrhea, vomiting (paradoxical для prokinetic high dose)');
    actions.push('IHPS — особенно concern у young (< 2 нед) и preterm');
    actions.push('QT prolongation (rare у н/р, more concerning adult)');
    actions.push('Hepatic enzyme elevation (rare у short course)');

    actions.push('--- Drug interactions ---');
    actions.push('CYP3A4 inhibitor: ↑ levels carbamazepine, theophylline, fluconazole, simvastatin');
    actions.push('Amiodarone: additive QT effect');
    actions.push('Digoxin: ↑ digoxin levels (gut bacteria suppression → ↓ digoxin metabolism)');

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
    'Cochrane 2014 (Ng): high-dose erythromycin (12.5 мг/кг q6h) significantly ↓ time to full feeds у preterm',
    'Low-dose (1-3 мг/кг q8h) — debatable benefit; minimal effect (Ng 2014)',
    '⚠️ IHPS association в neonates < 2 нед, особенно ELBW и > 14 дней courses',
    'Macrolide group эффект — clarithromycin, azithromycin similar IHPS risk',
    'Pertussis у newborn — erythromycin first-line; azithromycin альтернатива (single dose в дeтей > 1 мес)',
    'Chlamydia neonatal — erythromycin standard 14 дней',
    'Drug interactions: CYP3A4 inhibitor — caution с теофиллином, fluconazole, simvastatin',
    'QT prolongation: rare у н/р, more concerning при amiodarone co-administration',
    'IV form: stable in NS, glucose; slow infusion 30-60 мин (rapid push → phlebitis)',
    'Bioavailability oral 30-40 % (variable); food может interfere',
    'Не использовать в течение длительного prolonged courses > 14 дней без strong indication',
  ],
  related: [
    { id: 'neo-enteral', title: 'Enteral feed advancement' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
    { id: 'neo-bell-nec', title: 'Bell NEC staging' },
  ],
  info: `### Эритромицин у новорождённых

Macrolide antibiotic; в neonatal NICU чаще используется как **prokinetic
agent** (motilin agonist) для feeding intolerance у preterm.

### Дозы

#### Prokinetic
| Уровень | Доза | Frequency |
|---|---|---|
| Low | 1 мг/кг PO | q8h |
| **Standard** | **3 мг/кг PO** | **q8h** |
| **High** (Cochrane 2014) | **12.5 мг/кг PO** | **q6h** (= 50 мг/кг/сут) |

#### Antibiotic
| Indication | Доза | Длительность |
|---|---|---|
| Pertussis | 12.5 мг/кг q6h PO | 14 дней |
| Chlamydia | 12.5 мг/кг q6h PO | 14 дней |

### Cochrane 2014 (Ng) — Feeding intolerance

#### High-dose (12.5 мг/кг q6h):
- ↓ Time to full feeds significantly
- ↓ TPN duration
- No effect on NEC, mortality

#### Low-dose (1-3 мг/кг q8h):
- Minimal benefit
- Not recommended

### Mechanism prokinetic

- **Motilin receptor agonist** → стимуляция MMC
- Improved gastric emptying
- Improved intestinal transit
- Effect onset: 1-2 дня
- Effect duration: prolonged use может развить tolerance

### ⚠️ IHPS (Infantile Hypertrophic Pyloric Stenosis)

#### Risk factors:
- Age < 2 нед жизни
- ELBW < 1500 г
- Course duration > 14 дней
- Macrolide group effect

#### Symptoms:
- **Projectile vomiting** (after feeds)
- **Weight loss / failure to gain**
- **Palpable olive в epigastrium**
- **Hypochloremic alkalosis** (electrolyte panel)

#### Investigation:
- **Abdominal U/S** — pyloric muscle thickness > 4 мм, channel length > 14 мм

### Antibiotic indications

| Pathogen | Treatment |
|---|---|
| Bordetella pertussis | Erythromycin first-line × 14 d |
| Chlamydia trachomatis | Erythromycin × 14 d |
| Mycoplasma | Erythromycin или azithromycin |
| Group B streptococcus (penicillin-allergic) | Erythromycin (rarely first-line) |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| GI: diarrhea, vomiting | + | Reduce dose if severe |
| **IHPS** | + (< 2 нед, ELBW, > 14 d) | Monitor, U/S |
| QT prolongation | rare у н/р | Caution с amiodarone |
| Hepatotoxicity | rare short-course | Monitor LFTs у chronic |

### Drug interactions

| Drug | Effect |
|---|---|
| **Theophylline** | ↑ theophylline levels |
| **Carbamazepine** | ↑ levels |
| **Fluconazole** | ↑ azole levels |
| **Digoxin** | ↑ digoxin (gut flora suppression) |
| **Amiodarone** | ↑ QT prolongation |
| **Simvastatin** | ↑ rhabdomyolysis risk |
| **Sildenafil** | ↑ sildenafil levels |

### Источники

- Ng E et al. Cochrane Erythromycin для feeding intolerance 2014
- Curatola A et al. — neonatal motility и erythromycin
- AAP Red Book 2021-2024 (pertussis, chlamydia)
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Питание / Гастрит у н/р" (2024)
`,
};

export default runner;
