/**
 * Runner: neo-tof-spell-management — TOF (Tetralogy of Fallot) cyanotic spell management
 *
 * NEONATOLOGY MODULE — protocol classification.
 *
 * Гипоксический "тет-spell" (cyanotic spell, "tet" episode) — sudden severe
 * cyanosis у newborn / infant с Tetralogy of Fallot (TOF) или other
 * right-to-left shunt CHD. Stress ↑ R→L shunting + ↓ pulmonary blood flow.
 *
 * Triggers:
 *   - Crying / agitation
 *   - Feeding (esp. cold formula)
 *   - Defecation
 *   - Bath
 *   - Awakening
 *
 * Step-wise management (TOF spell ladder):
 *   1. Knee-to-chest position (↑ SVR → ↓ R→L shunt)
 *   2. O₂ 100 % через face mask
 *   3. Calm infant (decrease catecholamine surge)
 *   4. Morphine 0.1-0.2 мг/кг IV/IM (sedation + reduce pulmonary infundibular spasm)
 *   5. Volume bolus 10-20 мл/кг NS IV (↑ preload)
 *   6. NaHCO₃ 1-2 мэкв/кг IV (correction acidosis)
 *   7. Phenylephrine 5-20 мкг/кг IV bolus или infusion (↑ SVR)
 *   8. Esmolol 100-500 мкг/кг IV bolus (↓ infundibular contractility)
 *   9. ECMO + emergency surgery если refractory
 *
 * SOURCES:
 *   - AHA / AAP — Pediatric Heart Disease guidelines
 *   - Park's Pediatric Cardiology
 *   - КР МЗ РФ "ВПС у детей" (2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  countries: 'Международный (AHA / AAP / Park) · РФ',
  reference: 'AHA Pediatric Heart Disease. Park\'s Pediatric Cardiology. КР МЗ РФ ВПС.',
  inputs: [
    {
      id: 'severity',
      label: 'Severity tet spell',
      type: 'select',
      options: [
        { value: '1', label: 'Mild (cyanosis, irritability, no LOC change)', points: 1 },
        { value: '2', label: 'Moderate (significant desat, lethargy)', points: 2 },
        { value: '3', label: 'Severe (cyanotic, decreased LOC, hypotonia)', points: 3 },
        { value: '4', label: 'Critical (loss of consciousness, hypotension)', points: 4 },
      ],
    },
    {
      id: 'response',
      label: 'Initial response к conservative measures',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 1,
      max: 1,
      label: 'Mild — conservative measures',
      color: '#84CC16',
      description: 'Mild spell — usually responds к non-pharmacological steps.',
      actions: [
        '✅ Step 1-3 (conservative measures):',
        '  - Knee-to-chest position (↑ SVR → ↓ R→L shunt)',
        '  - O₂ 100 % через face mask',
        '  - Calm infant; non-stressful environment',
        'Most mild spells resolve в 5-10 мин с conservative measures',
        'Cardiology consultation for surgical timing',
        'Discharge planning: home oxygen if recurrent',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'Moderate — pharmacological intervention',
      color: '#F59E0B',
      description: 'Moderate spell — requires medications.',
      actions: [
        'Conservative measures + pharmacological:',
        '  - Step 4: Morphine 0.1-0.2 мг/кг IV/IM (sedation + ↓ infundibular spasm)',
        '  - Step 5: Volume bolus 10-20 мл/кг NS IV (↑ preload)',
        '  - Step 6: NaHCO₃ 1-2 мэкв/кг IV (correction acidosis)',
        'Cardiology consultation urgent',
        'Echocardiography: оценить severity, plan surgical correction',
        'Persistent spell: escalate к step 7+',
      ],
    },
    {
      min: 4,
      max: 6,
      label: 'Severe / Critical — emergency intervention',
      color: '#7F1D1D',
      description: 'Severe spell — emergency therapy + surgery consultation.',
      actions: [
        '🚨 Severe / critical spell — emergency intervention',
        'Steps 1-6 simultaneously',
        'Step 7: Phenylephrine 5-20 мкг/кг IV bolus → infusion 0.1-0.5 мкг/кг/мин',
        '  Mechanism: pure α1 agonist → ↑ SVR → ↓ R→L shunt',
        'Step 8: Esmolol 100-500 мкг/кг IV bolus → infusion 50-200 мкг/кг/мин',
        '  Mechanism: short-acting β1 blocker → ↓ infundibular contractility',
        'Step 9 (refractory): ECMO + emergency surgical correction',
        'Cardiac surgery team activation',
        'Consider Blalock-Taussig shunt если definitive repair не possible',
        'Family communication: realistic prognosis',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const sev = Number(values.severity ?? 1);
    const response = values.response === true ? 1 : 0;
    const total = sev - response; // если good response — downgrade severity

    const band = findBand(runner.bands, Math.max(1, total));

    return {
      value: String(total),
      unit: 'severity score',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. Step-wise TOF spell management ladder.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Tet spell — emergency у TOF / right-to-left shunt CHD',
    'Pathophysiology: ↑ infundibular RV outflow obstruction + ↓ SVR + ↑ R→L shunt → severe cyanosis',
    'Triggers: crying, feeding, defecation, bath, awakening, anesthesia induction',
    'Step-wise management: conservative → morphine → volume → bicarb → pressors → β-blockers → surgery',
    'Knee-to-chest position critical first step — ↑ SVR mechanically',
    'NEVER use afterload reducers (ACE-i, ARB, vasodilators) — worsens R→L shunt',
    'Avoid β2-agonists (albuterol) — pulmonary vasodilation ↓ pulmonary BF',
    'Phenylephrine = pure α1 → ↑ SVR без β1 effect (preferred over norepinephrine)',
    'Esmolol = short-acting β1 → ↓ infundibular contractility (relax outflow obstruction)',
    'Refractory tet spell = surgical emergency (Blalock-Taussig shunt или definitive repair)',
    'Prevention: avoid triggers, treat fever aggressively, beta-blockers (propranolol) chronic',
    'Iron deficiency may worsen tet spells — supplementation важна',
  ],
  related: [
    { id: 'neo-pge1-dose', title: 'PGE1 (duct-dependent CHD)' },
    { id: 'neo-pphn-screen', title: 'PPHN screening' },
    { id: 'neo-cchd-pulse-oximetry', title: 'CCHD pulse oximetry' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
  ],
  info: `### TOF Tet Spell Management

Hypoxic tet spell — emergency у Tetralogy of Fallot или other R→L shunt
CHD. Step-wise management critical для выживание.

### Pathophysiology

#### Trigger → cycle:
1. **Stress** (crying, feeding, etc.) → ↑ catecholamines
2. **↑ Heart rate + ↑ infundibular contractility** → ↑ RV outflow obstruction
3. **↓ SVR** (peripheral vasodilation) → ↑ R→L shunt
4. **↓ Pulmonary blood flow** → severe hypoxemia + acidosis
5. **Acidosis** → further pulmonary vasoconstriction → vicious cycle

### Step-wise Management Ladder

#### Step 1: Knee-to-chest position
- ↑ SVR mechanically (compresses femoral arteries)
- ↓ R→L shunt
- Most mild spells resolve here

#### Step 2: 100 % O₂ via face mask
- Maximize oxygenation
- Pulmonary vasodilation effect (mild)

#### Step 3: Calm infant
- ↓ Catecholamine surge
- Non-stressful environment
- Non-nutritive sucking может помочь

#### Step 4: Morphine 0.1-0.2 мг/кг IV/IM
- Sedation
- ↓ Infundibular spasm
- Anxiolysis
- Available dose: morphine 0.1 мг/кг slow IV или IM

#### Step 5: Volume bolus 10-20 мл/кг NS IV
- ↑ Preload → ↑ filling RV
- Lateral pushes blood across pulmonary outflow
- Improves systemic perfusion

#### Step 6: NaHCO₃ 1-2 мэкв/кг IV
- Correct severe metabolic acidosis
- Pulmonary vasodilation
- Use если pH < 7.25

#### Step 7: Phenylephrine
- **Bolus 5-20 мкг/кг IV**
- **Infusion 0.1-0.5 мкг/кг/мин**
- Pure α1 agonist (no β effect)
- ↑ SVR → ↓ R→L shunt
- Preferred over norepinephrine (no β stimulation)

#### Step 8: Esmolol
- **Bolus 100-500 мкг/кг IV** × 1 мин
- **Infusion 50-200 мкг/кг/мин**
- Short-acting β1-blocker
- ↓ Infundibular contractility
- Relaxes outflow obstruction

#### Step 9 (refractory): Surgery
- Blalock-Taussig shunt (palliative)
- Definitive repair (full TOF correction)
- ECMO bridge if needed

### ⚠️ AVOID в tet spells

| Drug | Why avoid |
|---|---|
| **Vasodilators** (ACE-i, ARB) | ↓ SVR → ↑ R→L shunt |
| **β2-agonists** (albuterol) | Pulmonary vasodilation may ↓ BF |
| **Inotropes** (dopamine alone) | ↑ infundibular contractility |
| **Norepinephrine** | β1 effect → может worsen |

### Triggers (avoid если possible)

- Crying / agitation
- Feeding (cold formula особенно)
- Defecation
- Bath (cold)
- Awakening
- Anesthesia induction
- Fever
- Iron deficiency anemia

### Prevention

| Strategy | Rationale |
|---|---|
| Avoid triggers | Self-explanatory |
| **Treat fever aggressively** | Fever ↓ SVR, ↑ tachycardia |
| **Iron supplementation** | Prevent anemia exacerbating cyanosis |
| **β-blockers (propranolol)** | Chronic prophylaxis |
| **Schedule surgical repair** | Definitive treatment |

### Surgical management

| Approach | Application |
|---|---|
| **Blalock-Taussig shunt** | Palliation, infants too small для full repair |
| **Modified BT shunt (PTFE)** | Most common palliative |
| **TOF complete repair** | Typical age 4-12 мес |
| **Pulmonary valvotomy** | If valvar PS dominant |

### Long-term

- Most TOF infants have spells before complete repair
- Spell frequency ↑ as infundibular obstruction worsens
- Schedule complete repair before major spells become routine

### Источники

- AHA / AAP — Pediatric Heart Disease guidelines
- Park MK — Park's Pediatric Cardiology textbook
- Allen HD et al. — Moss & Adams' Heart Disease
- КР МЗ РФ "ВПС у детей" (2024)
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
`,
};

export default runner;
