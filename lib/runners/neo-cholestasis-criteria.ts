/**
 * Runner: neo-cholestasis-criteria — Критерии cholestasis у н/р
 *
 * NEONATOLOGY MODULE — classification.
 *
 * Cholestasis (conjugated hyperbilirubinemia) у н/р — defined by:
 *   - Conjugated bilirubin > 1.0 мг/дл (17 мкмоль/л) если total ≤ 5 мг/дл
 *   - Conjugated bilirubin > 20 % of total если total > 5 мг/дл
 *
 * SOURCES:
 *   - NASPGHAN/ESPGHAN 2017 — Guideline on the Diagnosis of the Cholestatic
 *     Newborn (Fawaz R et al. JPGN 2017;64(1):154)
 *   - AAP CFN — Cholestasis in newborns
 *   - КР МЗ РФ "Холестаз новорождённого / Билиарная атрезия" (2024)
 *
 * Causes:
 *   1. Биллиарная атрезия (BA) — most urgent (Kasai surgery 30-60 d)
 *   2. Idiopathic neonatal hepatitis
 *   3. Cholestasis associated TPN
 *   4. Genetic / metabolic (alpha-1 antitrypsin, galactosemia, TMPCP)
 *   5. Infectious (CMV, sepsis-related)
 *   6. Endocrine (hypothyroidism, hypopituitarism)
 *
 * Workup priority — early diagnosis Biliary Atresia critical для outcomes
 * (Kasai surgery должна быть в 30-60 дней жизни для best outcomes).
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 6,
  countries: 'Международный (NASPGHAN/ESPGHAN 2017) · РФ',
  reference: 'Fawaz R NASPGHAN/ESPGHAN JPGN 2017;64:154. AAP CFN. КР МЗ РФ.',
  inputs: [
    {
      id: 'conjugated_bili',
      label: 'Conjugated bilirubin (мг/дл)',
      type: 'select',
      options: [
        { value: '0', label: '< 1.0 мг/дл (нет cholestasis)', points: 0 },
        { value: '1', label: '1.0-2.0 мг/дл (mild cholestasis)', points: 2 },
        { value: '2', label: '2.0-5.0 мг/дл (moderate)', points: 3 },
        { value: '3', label: '> 5.0 мг/дл (severe)', points: 4 },
      ],
    },
    {
      id: 'acholic_stool',
      label: 'Acholic (white/clay-colored) stool',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'jaundice_persistence',
      label: 'Jaundice persistent > 2 нед',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'Нет cholestasis',
      color: '#22C55E',
      description: 'Conjugated bilirubin < 1.0 мг/дл — no cholestasis.',
      actions: [
        'Conjugated bili < 1.0 мг/дл — нет cholestasis',
        'Если jaundice persists > 2 нед: повторить fractionated bilirubin',
        'Routine pediatric care; вакцинации; роса',
      ],
    },
    {
      min: 2,
      max: 4,
      label: 'Cholestasis confirmed — workup urgent',
      color: '#F59E0B',
      description: 'Conjugated bilirubin > 1.0 мг/дл — cholestasis presented.',
      actions: [
        '⚠️ Cholestasis подтверждён — workup urgent',
        '⚠️ Biliary Atresia — most urgent diagnosis (Kasai в 30-60 d критично)',
        'Initial workup:',
        '  - LFTs (AST, ALT, GGT, AlkP, total bilirubin, conjugated bilirubin)',
        '  - INR / PT (vit K-dependent factors)',
        '  - Albumin, total protein',
        '  - Glucose, ammonia (rule out IEM)',
        '  - TSH, free T4 (hypothyroidism)',
        '  - α-1 antitrypsin level + phenotype',
        '  - Galactose-1-phosphate, urinary reducing substances',
        '  - Urine + serum bile acids',
        '  - Acid-base, lactate, ferritin',
        'Imaging:',
        '  - Abdominal ultrasound (liver size, gallbladder, biliary tree)',
        '  - HIDA scan (cholescintigraphy) — assess hepatic excretion',
        '  - MR cholangiography если equivocal',
        '  - Liver biopsy если diagnosis unclear',
        'Vit K administration: 1 мг IM/IV q24h × 3 days (correction coagulopathy)',
      ],
    },
    {
      min: 5,
      max: 6,
      label: 'Severe cholestasis — emergency consultation',
      color: '#7F1D1D',
      description: 'Severe cholestasis с associated symptoms — multi-systemic involvement possible.',
      actions: [
        '🚨 Severe cholestasis — emergency hepatology consultation',
        'Acholic stool + jaundice persistence — biliary atresia high suspicion',
        'Kasai surgery в 30-60 days жизни — критически for outcomes (10-year survival 30-50%)',
        'Investigate:',
        '  - Biliary atresia (most urgent)',
        '  - Sepsis (endotoxin-mediated cholestasis)',
        '  - Galactosemia (life-threatening)',
        '  - α-1 antitrypsin deficiency',
        '  - Cystic fibrosis',
        '  - Bile salt export pump (BSEP) deficiency',
        'Multi-disciplinary: neonatology + hepatology + surgery (если BA)',
        'Family counseling re prognosis depending on cause',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const bili = Number(values.conjugated_bili ?? 0);
    const acholic = values.acholic_stool === true ? 1 : 0;
    const persist = values.jaundice_persistence === true ? 1 : 0;
    const total = bili + acholic + persist;

    const band = findBand(runner.bands, total);

    return {
      value: String(total),
      unit: 'risk score',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. NASPGHAN/ESPGHAN 2017 cholestasis criteria.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Cholestasis defined: conjugated bili > 1.0 мг/дл (17 мкмоль/л) если total ≤ 5; > 20% total если total > 5',
    '⚠️ Biliary Atresia (BA) — most urgent: Kasai surgery в 30-60 days жизни критично для outcomes',
    'Acholic stool — VERY suspicious BA; pale/white/clay color (vs normal yellow/green meconium)',
    'Persistent jaundice > 2 нед в term newborn — fractionated bilirubin обязательно',
    'НЕ "physiologic" jaundice если conjugated component > 1.0 мг/дл',
    'Direct vs indirect: conjugated bili = direct bili approximately',
    'TPN-associated cholestasis: trial PN cycling, lipid restriction, fish oil emulsions (Omegaven)',
    'Galactosemia — NEONATAL EMERGENCY: stop lactose immediately если suspected (urinary reducing substances positive)',
    'CMV congenital infection: most common infectious cause cholestasis',
    'Newborn screening: галактoземия, biotinidase, congenital hypothyroidism — все могут проявиться cholestasis',
    'Kasai surgery outcomes: 10-year native liver survival 30-50% если done в 60 d жизни; lower у later',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022' },
    { id: 'neo-tcb-conversion', title: 'TcB → TSB' },
    { id: 'neo-tpn', title: 'TPN ESPGHAN PN 2018' },
    { id: 'neo-vitk-dose', title: 'Витамин K' },
  ],
  info: `### Cholestasis у новорождённых

Conjugated hyperbilirubinemia — pathologic, требует workup.
**Biliary atresia — most urgent diagnosis** (Kasai surgery в 30-60 d).

### Definition

| Total bilirubin | Cholestasis criterion |
|---|---|
| ≤ 5 мг/дл | Conjugated > **1.0 мг/дл** (17 мкмоль/л) |
| > 5 мг/дл | Conjugated > **20 % total** |

### Severity bands

| Conjugated bili (мг/дл) | Severity |
|---|---|
| < 1.0 | No cholestasis |
| 1.0-2.0 | Mild |
| 2.0-5.0 | Moderate |
| > 5.0 | Severe |

### Causes (по frequency)

#### Most common:
1. **Biliary Atresia** (most urgent — Kasai в 30-60 d)
2. **Idiopathic neonatal hepatitis**
3. **TPN-associated cholestasis**
4. **Cytomegalovirus (CMV)**
5. **α-1 antitrypsin deficiency**

#### Less common:
- Galactosemia (NEONATAL EMERGENCY)
- Hypothyroidism / hypopituitarism
- Bile acid synthesis defects (PFIC types)
- Cystic fibrosis
- Tyrosinemia, MSUD, urea cycle defects
- Sepsis (endotoxin-mediated)
- Choledochal cyst (rarer in newborn)

### Workup при cholestasis

#### Initial labs:
- **LFTs:** AST, ALT, **GGT**, alkaline phosphatase
- Total + conjugated bilirubin
- **INR / PT** (vit K-dependent factors)
- Albumin, total protein
- Glucose, ammonia
- TSH, free T4
- **α-1 antitrypsin level + phenotype**
- Galactose-1-phosphate (urine reducing substances)
- Bile acids (urine + serum)
- CMV PCR (urine + blood)
- Newborn screening review

#### Imaging:
- **Abdominal U/S** (liver size, gallbladder presence/contraction, biliary tree)
- **HIDA scan** (hepatic excretion — flow vs no flow)
- **MR cholangiography** if equivocal
- **Liver biopsy** если diagnosis unclear

### Biliary Atresia (BA) — special considerations

#### Why urgent:
- **Kasai portoenterostomy** в 30-60 days жизни
- 10-yr native liver survival:
  - 30-60 d: 30-50 %
  - > 90 d: 5-10 %
- Eventually liver transplant у many

#### Clinical features:
- Jaundice persistent > 2 нед
- **Acholic / pale stools**
- Dark urine (bilirubinuria)
- Hepatomegaly
- Failure to thrive

### TPN-associated cholestasis

#### Risk factors:
- Long-term TPN (> 14-30 days)
- Preterm < 32 нед
- Sepsis episodes
- Lack enteral feeding

#### Management:
- **Cycle PN** if possible (12-16 ч infusion)
- **Lipid reduction** to 1-2 г/кг/сут
- **Fish oil emulsion** (Omegaven, SMOFlipid) — better profile
- **Trophic feeding** ASAP
- **Ursodeoxycholic acid** 10-15 мг/кг q12h PO

### Galactosemia — emergency

| Marker | Value |
|---|---|
| **Urinary reducing substances** | Positive |
| **Direct bilirubin** | Elevated |
| **Hypoglycemia** | + |
| **Vomiting / failure to thrive** | + |

#### Treatment:
- **STOP lactose / breast milk immediately**
- Galactose-free formula (soy or hydrolyzed)
- Test mother + infant for confirmation
- Lifelong dietary restriction

### Vit K administration

Cholestatic newborns — fat-soluble vitamin malabsorption:
- **Vit K 1 мг IM/IV q24h × 3 days** (correction coagulopathy)
- **Vit ADE** supplementation chronic

### Prognosis

| Cause | Outcomes |
|---|---|
| **Biliary atresia + Kasai в 30-60 d** | 30-50 % 10-yr native liver |
| **Idiopathic neonatal hepatitis** | Most resolve |
| **TPN-cholestasis** | Reverses с enteral feeds |
| **CMV** | Variable |
| **α-1 AT deficiency** | Cirrhosis у 10-20 % adult life |
| **Galactosemia** | Good if stop lactose early |

### Источники

- Fawaz R et al. NASPGHAN/ESPGHAN 2017 Guideline (JPGN 64:154)
- AAP CFN — Cholestasis in newborns
- КР МЗ РФ "Холестаз новорождённого / Билиарная атрезия" (2024)
`,
};

export default runner;
