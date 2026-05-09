/**
 * Runner: neo-ino-dose — Inhaled Nitric Oxide (iNO) для PPHN
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Selective pulmonary vasodilator для лечения PPHN (persistent pulmonary
 * hypertension of newborn). Stand of care в term + late preterm с PPHN
 * + hypoxemic respiratory failure.
 *
 * Дозы (delivered concentration in vent circuit):
 *   Initial: 20 ppm
 *   Range: 5-20 ppm; redusee к 5-10 ppm после initial response
 *   Wean: ↓ 5 ppm q4-12h до 5 ppm; затем ↓ 1 ppm q1-4h
 *   Off: при FiO₂ < 50 % + stable PaO₂ + minimal need for ↑ FiO₂ during wean
 *
 * Показания:
 *   - PPHN с OI ≥ 15 (FDA approved для term + late preterm ≥ 34 нед)
 *   - Severe PPHN secondary to MAS, sepsis, RDS, CDH (controversial)
 *   - PRE-ECMO trial (рекомендуется до ECMO consideration)
 *
 * Противопоказания:
 *   - Methemoglobinemia history (NO oxidizes hemoglobin)
 *   - Severe LV dysfunction (paradoxical worsening при unloading RV)
 *
 * SOURCES:
 *   - NINOS trial (Pediatrics 1997) — landmark
 *   - AAP COFN 2014 — Inhaled NO use в neonate
 *   - AHA 2019 PPHN scientific statement
 *   - КР МЗ РФ "Персистирующая лёгочная гипертензия новорождённого" (2024)
 *   - Cochrane Inhaled NO for term/late preterm PPHN 2017
 *   - INO Therapeutics — manufacturer protocol
 *
 * Response definition:
 *   PaO₂ ↑ ≥ 20 мм рт ст или OI ↓ ≥ 15 % за 30 мин
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NINOS / AAP COFN / AHA 2019) · РФ',
  reference: 'NINOS trial Pediatrics 1997. AAP COFN 2014. AHA PPHN 2019. Cochrane 2017.',
  inputs: [
    {
      id: 'phase',
      label: 'Phase / dose',
      type: 'select',
      options: [
        { value: 'initial', label: 'Initial 20 ppm (start)' },
        { value: 'maint_high', label: 'Maintenance 10 ppm (sustained response)' },
        { value: 'maint_low', label: 'Maintenance 5 ppm (further wean)' },
        { value: 'wean_3', label: 'Wean 3 ppm' },
        { value: 'wean_2', label: 'Wean 2 ppm' },
        { value: 'wean_1', label: 'Wean 1 ppm (final pre-off)' },
      ],
    },
    {
      id: 'cylinder',
      label: 'Концентрация в баллоне',
      type: 'select',
      options: [
        { value: '800', label: '800 ppm (стандарт INOMax)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const phase = String(values.phase ?? 'initial');
    // const cylinder = Number(values.cylinder ?? 800);

    type InoPhase = { ppm: number; label: string; description: string };
    const phases: Record<string, InoPhase> = {
      initial: { ppm: 20, label: 'Initial 20 ppm', description: 'Стартовая доза для PPHN' },
      maint_high: { ppm: 10, label: 'Maintenance 10 ppm', description: 'После initial response' },
      maint_low: { ppm: 5, label: 'Maintenance 5 ppm', description: 'Ниже weaning threshold' },
      wean_3: { ppm: 3, label: 'Wean 3 ppm', description: 'Wean phase' },
      wean_2: { ppm: 2, label: 'Wean 2 ppm', description: 'Pre-off wean' },
      wean_1: { ppm: 1, label: 'Wean 1 ppm', description: 'Final pre-off' },
    };
    const p = phases[phase] ?? phases.initial;
    if (!p) {
      return { value: '—', interpretation: 'Неизвестная phase', color: '#9CA3AF', details: '' };
    }

    const actions: string[] = [];
    actions.push(`iNO: ${p.ppm} ppm delivered concentration`);
    actions.push(`Phase: ${p.description}`);

    actions.push('--- Подача ---');
    actions.push('Источник: INOMax 800 ppm cylinder');
    actions.push('Delivery: специализированный ventilator-integrated system (INOvent / INOmax DSir)');
    actions.push('Tubing: dedicated NO line у inspiratory limb близко к ETT');
    actions.push('Sampling: continuous NO + NO₂ + O₂ analyser');

    actions.push('--- Показания ---');
    actions.push('PPHN термин/late preterm (≥ 34 нед) с OI ≥ 15-25 sustained');
    actions.push('FDA approved для term + late preterm');
    actions.push('Off-label у preterm: limited evidence; не routine');
    actions.push('Pre-ECMO trial — попытка iNO до escalation');

    actions.push('--- Response definition ---');
    actions.push('PaO₂ ↑ ≥ 20 мм рт ст за 30 мин ИЛИ');
    actions.push('OI ↓ ≥ 15 % за 30 мин ИЛИ');
    actions.push('SpO₂ ↑ ≥ 5 % за 30 мин (если no arterial line)');

    actions.push('--- If no response ---');
    actions.push('Не extend trial > 1-2 ч если no response');
    actions.push('Optimize lung recruitment (HFOV если RDS-related)');
    actions.push('Echo для CHD (some VSD/large PDA — iNO ineffective)');
    actions.push('Consider ECMO consult если OI ≥ 40 sustained');
    actions.push('Alternative: sildenafil 1-2 мг/кг q6-8h PO/IV (PDE5 inhibitor)');
    actions.push('Adjuncts: milrinone (inodilator), prostacyclin (epoprostenol IV)');

    actions.push('--- Wean protocol ---');
    actions.push('Sustained response × 4-12 ч → wean');
    actions.push('20 ppm → 10 ppm → 5 ppm (q4-12h decreases)');
    actions.push('5 ppm → 3 → 2 → 1 ppm (q1-4h decreases)');
    actions.push('Off attempt: pre-oxygenate до FiO₂ + 10 % за 5 мин до stop');
    actions.push('Если SpO₂ ↓ > 5 % за 5-10 мин после off — restart 5 ppm');

    actions.push('--- Mониторинг ---');
    actions.push('NO + NO₂ continuous concentration в circuit');
    actions.push('Methaемоглобин q12-24h (возможен при > 20 ppm > 24 ч)');
    actions.push('SpO₂ pre-ductal + post-ductal continuous');
    actions.push('Echo q24h: contractility, PVR, RV function');
    actions.push('Газы крови q1-4h при titration');

    actions.push('--- Side effects ---');
    actions.push('Methemoglobinemia (chemical reaction NO + Hb): мониторинг q12-24h');
    actions.push('NO₂ formation (toxic)— sampling непрерывно, alarm < 5 ppm');
    actions.push('Rebound pulmonary hypertension при abrupt стопе — gradual wean');
    actions.push('Платformitelet inhibition (rare clinical bleeding)');
    actions.push('Worse outcomes у severe LV dysfunction (paradoxical)');

    actions.push('--- Стоимость ---');
    actions.push('iNO ≈ $3,000-5,000 USD/сут (high cost)');
    actions.push('Justification: snijaeт ECMO need у term/late preterm by ~ 50 % (NINOS)');

    return {
      value: String(p.ppm),
      unit: 'ppm',
      interpretation: p.label,
      color: phase === 'initial' ? '#3B82F6' : phase.startsWith('wean') ? '#22C55E' : '#84CC16',
      details: `iNO ${p.ppm} ppm delivered. ${p.description}.`,
      actions,
    };
  },
  caveats: [
    'NINOS trial (1997 Pediatrics): iNO снижает ECMO need у term/late preterm с PPHN на ~ 50 %',
    'AAP COFN 2014: FDA approved для term + late preterm; off-label у preterm < 34 нед (limited evidence)',
    'iNO у preterm < 34 нед: NIH Consensus 2010 — НЕ recommended routinely (NEWNO study нет benefit, INNO-NEC даже worse)',
    'PVR ↓ effect — PPHN-specific; no benefit у CHD без significant pulmonary HTN',
    'Severe LV dysfunction → paradoxical worsening (RV unloading transfers blood в LV which cannot handle)',
    'Methemoglobinemia: NO oxidizes Hb; risk при дозы > 20 ppm > 24 ч; methylene blue 1-2 мг/кг IV antidote если methHb > 5 %',
    'NO₂ formation: toxic; continuous sampling в circuit; alarm < 5 ppm',
    'Rebound pulmonary HTN при abrupt стоп — gradual wean обязателен',
    'Cost ~ $3,000-5,000 USD/сут — discuss с family и administration',
    'Sildenafil 1-2 мг/кг q6-8h PO/IV — PDE5 inhibitor, alternative или adjunct iNO; potentiates iNO effect',
    'Milrinone combination synergistic для PPHN с RV failure',
    'Не использовать в severe acidosis (pH < 7.10) — first correct acidosis',
  ],
  related: [
    { id: 'neo-resp-indices', title: 'OI / OSI / A-aDO₂' },
    { id: 'neo-milrinone-dose', title: 'Милринон' },
    { id: 'neo-rds-class', title: 'RDS classification' },
    { id: 'neo-low-flow-o2', title: 'Low-flow O₂' },
  ],
  info: `### Inhaled Nitric Oxide (iNO) у новорождённых

Selective pulmonary vasodilator для PPHN у term + late preterm.
Standard of care при OI ≥ 15-25.

### Дозы

| Phase | Dose | Когда |
|---|---|---|
| **Initial** | **20 ppm** | Start |
| Maintenance high | 10 ppm | Sustained response |
| Maintenance low | 5 ppm | Continued response |
| Wean | 3 → 2 → 1 ppm | Pre-off |

### Показания (FDA)

- **Term + late preterm (≥ 34 нед)** с PPHN
- **OI ≥ 15-25** sustained
- **Hypoxemic respiratory failure** secondary to:
  - MAS (meconium aspiration)
  - Idiopathic PPHN
  - Sepsis-related PPHN
  - RDS-associated PPHN

### NINOS trial (1997 Pediatrics)

- 235 term/late preterm с PPHN randomized
- iNO 20 ppm vs control
- **↓ ECMO need by 50 %**
- **No mortality benefit**
- → Standard of care

### Response definition

Любое из:
- PaO₂ ↑ ≥ 20 мм рт ст за 30 мин
- OI ↓ ≥ 15 % за 30 мин
- SpO₂ ↑ ≥ 5 % за 30 мин

### Algorithm PPHN

1. **Optimize ventilation:** PEEP, MAP, oxygenation
2. **Echo confirm** PPHN (no major CHD)
3. **iNO 20 ppm** trial × 30-60 мин
4. **Response?**
   - YES → maintain, taper к 5-10 ppm
   - NO → optimize ventilation, consider:
     - Milrinone (inodilator) если RV dysfunction
     - Sildenafil PO/IV (PDE5 inhibitor)
     - HFOV если conventional не optimal
5. **Failure → ECMO consult** (OI ≥ 40 sustained)

### Wean protocol

| Step | Frequency | Decrease |
|---|---|---|
| 20 → 10 ppm | q4-12h | -10 |
| 10 → 5 ppm | q4-12h | -5 |
| 5 → 3 → 2 → 1 ppm | q1-4h | -1-2 |
| 1 → off | trial | discontinue |

⚠️ **Never abrupt stop** — rebound PHN risk.

### Off attempt

1. Pre-oxygenate FiO₂ + 10 % × 5 мин
2. Stop iNO
3. Watch SpO₂ × 5-10 мин
4. If SpO₂ ↓ > 5 %: restart 5 ppm
5. Если stable: continue without iNO

### Side effects

| Effect | Mechanism | Management |
|---|---|---|
| Methemoglobinemia | NO oxidation Hb | Monitor q12-24h; methylene blue 1-2 мг/кг |
| NO₂ formation | Toxic byproduct | Continuous sampling, alarm < 5 ppm |
| Rebound PHN | Abrupt stop | Gradual wean |
| Platelet inhibition | NO effect | Rare bleeding |
| LV worsening | RV unloading | Avoid в severe LV dysfunction |

### Cost

- iNO ~ $3,000-5,000 USD/сут
- Justified: ↓ ECMO need by 50 % у term/late preterm

### Combinations

| Combo | Indication |
|---|---|
| iNO + milrinone | PPHN + RV failure |
| iNO + sildenafil | iNO sparing / wean facilitation |
| iNO + ECMO | After failure conventional |

### Источники

- NINOS trial Pediatrics 1997
- AAP COFN 2014 — Inhaled NO use
- AHA 2019 PPHN scientific statement
- Cochrane Inhaled NO for PPHN 2017
- NEWNO + INNO-NEC trials (preterm)
- КР МЗ РФ "Персистирующая лёгочная гипертензия н/р" (2024)
`,
};

export default runner;
