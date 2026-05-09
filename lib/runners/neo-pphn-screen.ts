/**
 * Runner: neo-pphn-screen — PPHN screening criteria
 *
 * NEONATOLOGY MODULE — protocol classification.
 *
 * Persistent Pulmonary Hypertension of Newborn (PPHN) — failure normal
 * postnatal decline в pulmonary vascular resistance, leading to right-to-left
 * shunting через ductus arteriosus и/или foramen ovale.
 *
 * Diagnostic criteria:
 *   1. Hypoxemia disproportionate к degree of lung disease
 *   2. Differential cyanosis (pre-ductal SpO₂ > post-ductal by > 5-10 %)
 *   3. Echocardiography evidence: PVR ↑, RV pressure ≥ 2/3 systemic
 *   4. Response к 100% O₂ < expected (hyperoxia test)
 *
 * SOURCES:
 *   - AHA 2019 — PPHN Scientific Statement
 *   - AAP COFN — pediatric pulmonary hypertension
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - Konduri GG et al. — PPHN management guidelines
 *   - КР МЗ РФ "Персистирующая лёгочная гипертензия н/р" (2024)
 *
 * Underlying causes:
 *   - MAS (meconium aspiration syndrome)
 *   - Idiopathic PPHN
 *   - Sepsis-related
 *   - Congenital diaphragmatic hernia (CDH)
 *   - RDS-associated
 *   - Asphyxia-related
 *   - Polycythemia
 *   - Drug-induced (maternal SSRI, NSAIDs antenatal)
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  countries: 'Международный (AHA 2019 / AAP COFN) · РФ',
  reference: 'AHA 2019 PPHN Scientific Statement. AAP COFN. Konduri GG management guidelines.',
  inputs: [
    {
      id: 'differential_sat',
      label: 'Differential cyanosis (pre-ductal vs post-ductal SpO₂)',
      type: 'select',
      options: [
        { value: '0', label: 'Pre-ductal = post-ductal (< 3 % разница)', points: 0 },
        { value: '1', label: 'Pre-ductal > post-ductal на 3-5 %', points: 1 },
        { value: '2', label: 'Pre-ductal > post-ductal на > 5-10 %', points: 2 },
        { value: '3', label: 'Pre-ductal > post-ductal на > 10 %', points: 3 },
      ],
    },
    {
      id: 'oi',
      label: 'OI (Oxygenation Index)',
      type: 'select',
      options: [
        { value: '0', label: '< 5 (нет PPHN)', points: 0 },
        { value: '1', label: '5-15 (mild hypoxemia)', points: 1 },
        { value: '2', label: '15-25 (moderate)', points: 2 },
        { value: '3', label: '> 25 (severe)', points: 3 },
      ],
    },
    {
      id: 'echo',
      label: 'Echocardiography findings',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'PPHN не подтверждён',
      color: '#22C55E',
      description: 'Не соответствует criteria PPHN.',
      actions: [
        'Не PPHN — исследовать другие причины hypoxemia',
        'Differential диагноз: lung disease (RDS, MAS), CHD, sepsis, anatomical anomalies',
        'Echocardiography для excluding структурных пороков',
      ],
    },
    {
      min: 2,
      max: 4,
      label: 'PPHN подозрение / mild-moderate',
      color: '#F59E0B',
      description: 'Возможный PPHN — workup и treatment.',
      actions: [
        'Echocardiography (gold standard для diagnosis)',
        'Markers:',
        '  - Tricuspid regurgitation jet velocity > 2.5 м/с (RV pressure ≥ 30 мм рт ст)',
        '  - RV pressure ≥ 2/3 systemic',
        '  - Septal flattening / paradoxical motion',
        '  - Right-to-left shunting через PDA/PFO',
        'Trial iNO 20 ppm если OI ≥ 15-25 (term/late preterm)',
        'Optimize: ventilation, oxygenation, sedation',
        'Volume status / inotropes (RV support)',
        'Адекватная hydration; correct acidosis',
      ],
    },
    {
      min: 5,
      max: 7,
      label: 'PPHN severe — emergency intervention',
      color: '#EF4444',
      description: 'Severe PPHN — multimodal therapy.',
      actions: [
        '🚨 Severe PPHN — emergency multimodal therapy',
        'iNO 20 ppm — first-line vasodilator',
        'HFOV если OI ≥ 25 на conventional vent',
        'Surfactant если RDS / MAS контрибутирует',
        'Sildenafil PO/IV — adjunct iNO или alternative',
        'Milrinone 0.33-1 мкг/кг/мин — RV support inodilator',
        'Vasopressors (dopamine ± epi) для systemic perfusion',
        'Sedation (morphine/fentanyl) — minimize stress',
        'Correct: acidosis (pH ≥ 7.25), hypocalcemia, hypoglycemia',
        'ECMO consult если OI ≥ 40 sustained × 4 ч',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const sat = Number(values.differential_sat ?? 0);
    const oi = Number(values.oi ?? 0);
    const echo = values.echo === true ? 1 : 0;
    const total = sat + oi + echo;

    const band = findBand(runner.bands, total);

    return {
      value: String(total),
      unit: 'risk score',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. AHA 2019 PPHN screening.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'PPHN — clinical + echo diagnosis; differential cyanosis pathognomonic',
    'Echo gold standard: TR jet velocity, RV pressure, RV/LV ratio, septal motion, PDA/PFO shunting',
    'Hyperoxia test: 100 % O₂ × 10 мин — PaO₂ < 100 мм рт ст suggests CCHD, mixed lesion',
    'Differential SpO₂: right hand (pre-ductal) vs leg (post-ductal); > 5-10 % difference suggests right-to-left shunt',
    'Causes: MAS (most common), idiopathic, sepsis, CDH, RDS, asphyxia, polycythemia',
    'Maternal SSRI / NSAID antenatal — associated PPHN',
    'Treatment algorithm: iNO → milrinone → sildenafil → ECMO',
    'iNO weaning: до off; sildenafil PO sustains effect (rebound prevention)',
    'Not all PPHN responds к iNO — ECMO criteria: OI ≥ 40 sustained',
    'Mortality severe PPHN: 10-30 % depending на underlying cause',
    'Long-term: chronic lung disease, BPD у survivors common',
  ],
  related: [
    { id: 'neo-resp-indices', title: 'OI / OSI / A-aDO₂' },
    { id: 'neo-ino-dose', title: 'iNO dose' },
    { id: 'neo-milrinone-dose', title: 'Милринон' },
    { id: 'neo-sildenafil-dose', title: 'Силденафил' },
  ],
  info: `### PPHN screening / diagnosis

Persistent Pulmonary Hypertension of Newborn — failure normal postnatal
decline в pulmonary vascular resistance.

### Diagnostic criteria

#### Clinical:
1. **Hypoxemia disproportionate к lung disease**
2. **Differential cyanosis** — pre-ductal SpO₂ > post-ductal by > 5-10 %
3. **Hyperoxia test** — PaO₂ < expected на 100% O₂

#### Echocardiography (gold standard):
- **Tricuspid regurgitation jet velocity** > 2.5 м/с (RV pressure ≥ 30 мм рт ст)
- **RV pressure** ≥ 2/3 systemic
- **Septal flattening** / paradoxical motion
- **Right-to-left shunting** через PDA / PFO
- **PVR ↑** quantitatively

### Severity (по OI)

| OI | Severity |
|---|---|
| < 15 | Mild |
| 15-25 | Moderate (iNO indication) |
| 25-40 | Severe (escalation) |
| ≥ 40 | Critical (ECMO criteria) |

### Underlying causes

| Cause | Frequency |
|---|---|
| **MAS** (meconium aspiration) | most common |
| **Idiopathic PPHN** | + |
| **Sepsis-related** | + |
| **CDH** (congenital diaphragmatic hernia) | + |
| **RDS-associated** | + |
| **Asphyxia-related** | + |
| **Polycythemia** | rare |
| **Drug-induced** (maternal SSRI, NSAID) | + |

### Differential SpO₂

#### How to measure:
- **Pre-ductal:** right hand
- **Post-ductal:** legs (foot)
- Compare values

#### Interpretation:
| Difference | Likely diagnosis |
|---|---|
| < 3 % | Normal |
| 3-5 % | Possible mild PPHN |
| 5-10 % | PPHN likely |
| > 10 % | PPHN definite (right-to-left shunt) |

⚠️ **Reverse differential** (post > pre): TGA (transposition great arteries)

### Treatment algorithm

1. **Optimize ventilation:** PEEP, MAP, oxygenation
2. **Correct underlying:** acidosis, hypoCa, hypoglycemia
3. **iNO 20 ppm** trial × 30-60 мин (если OI ≥ 15-25)
4. **Response?** PaO₂ ↑ ≥ 20 или OI ↓ ≥ 15 % за 30 мин
5. **If response:** continue iNO, taper к 5-10 ppm
6. **If no response:**
   - **HFOV** если на conventional
   - **Sildenafil** PO/IV (PDE5 inhibitor)
   - **Milrinone** 0.33-1 мкг/кг/мин (PDE3 inhibitor)
   - **Vasopressors** (dopamine ± epi) для perfusion
7. **Failure → ECMO consult** (OI ≥ 40 sustained)

### Algorithm complications

| Marker | Action |
|---|---|
| pH < 7.25 | Correct acidosis (волюм, NaHCO₃ controversial) |
| PaCO₂ > 55 + acidosis | ↑ ventilation |
| Hypotension | Volume + dopamine |
| Sedation needs | Morphine 10 мкг/кг/ч infusion |

### Prognosis

| Outcome | Frequency |
|---|---|
| **Mortality severe PPHN** | 10-30 % |
| **Survivors with BPD / CLD** | common |
| **Neurodev impairment** | у asphyxia + PPHN ↑ |
| **Long-term pulmonary HTN** | rare если acute resolves |

### Источники

- AHA 2019 PPHN Scientific Statement
- AAP COFN — pediatric pulmonary hypertension
- Konduri GG et al. — management guidelines
- NINOS trial 1997
- NeoFax / Neonatal Formulary 9 ed
- КР МЗ РФ "Персистирующая лёгочная гипертензия н/р" (2024)
`,
};

export default runner;
