/**
 * Runner: neo-asphyxia-criteria — Критерии асфиксии новорождённого (P21 МКБ-10)
 *
 * NEONATOLOGY MODULE — Б3 (классификации, audit issue 3.B).
 *
 * Унифицированные критерии диагностики асфиксии у новорождённого по
 * AAP/ACOG 2014, NICHD 2014, КР МЗ РФ.
 *
 * SOURCES:
 *   - AAP/ACOG 2014 Joint Statement: Neonatal Encephalopathy and Neurologic Outcome
 *   - ACOG Committee Opinion 348 (2006, reaff 2017): Definition of Term Asphyxia
 *   - КР МЗ РФ "Гипоксически-ишемическая энцефалopathy" (2024)
 *   - WHO ICD-10 P21: Birth asphyxia
 *
 * 4 критерия (всё для diagnosis):
 *   1. Метаболический ацидоз пуповинной артерии: pH < 7.0 ИЛИ BE ≥ -12 ммоль/л
 *   2. Apgar 0-3 на 5+ мин
 *   3. Неонатальная неврологическая симптоматика (HIE)
 *   4. Multi-organ dysfunction (renal, кардио, ЖКТ, гемат)
 *
 * Severity (P21 ICD-10):
 *   - P21.0 Severe birth asphyxia: pH < 7.0 + Apgar 0-3 + clinical encephalopathy
 *   - P21.1 Mild/moderate birth asphyxia: less severe criteria, без encephalopathy
 *   - P21.9 Unspecified
 *
 * Note: эти криterии — для диагноза, не для приема решения о
 * therapeutic hypothermia (см. neo-hie-cooling).
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'Международный (AAP/ACOG 2014 / WHO ICD) · РФ',
  reference: 'AAP/ACOG 2014 Neonatal Encephalopathy. ACOG Committee Opinion 348. КР МЗ РФ ХИЭ 2024.',
  inputs: [
    {
      id: 'umbilical_acidosis',
      label: 'Пуповинный артериальный pH < 7.0 ИЛИ BE ≥ -12 ммоль/л',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'apgar_low',
      label: 'Apgar 0-3 на 5-й или 10-й минуте',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'encephalopathy',
      label: 'Клинические признаки HIE (Sarnat I-III: tone abnormalities, judorги, lethargy)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'multiorgan',
      label: 'Multi-organ dysfunction (renal injury / ↑ AST / cardiac / coagulopathy)',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: 'Нет асфиксии',
      color: '#22C55E',
      description: 'Критерии не выполняются.',
      actions: [
        'Стандартный уход за новорождённым',
        'Apgar score; thermal management; кенгуру',
        'Если respiratory distress — Silverman/Downes; CPAP при необходимости',
      ],
    },
    {
      min: 1,
      max: 2,
      label: 'P21.1 — Лёгкая / умеренная асфиксия (1-2 критерия)',
      color: '#F59E0B',
      description: 'Лёгкая или умеренная birth asphyxia.',
      actions: [
        'Транспорт в NICU / step-down',
        'Continuous SpO₂, ЧСС, температура',
        'Газы крови q4-6h до stabilization',
        'CBC, COAG (асфиксия → DIC риск)',
        'AST / ALT / лактат / Cr — multi-organ assessment',
        'Не подходит для therapeutic hypothermia (нет encephalopathy)',
        'Реассессмент Sarnat staging q12h',
      ],
    },
    {
      min: 3,
      max: 4,
      label: 'P21.0 — Severe birth asphyxia (≥ 3 критерия)',
      color: '#7F1D1D',
      description: 'Тяжёлая асфиксия + HIE — критерии для cooling.',
      actions: [
        '⚠️ Severe asphyxia + encephalopathy → подходит для therapeutic hypothermia (TH)',
        'TH eligibility check — neo-hie-cooling',
        'NICU level III; consultant neonatologist немедленно',
        'Cooling 33-34 °C × 72 ч если NICHD/TOBY criteria met (start ≤ 6 ч)',
        'Multi-organ support: renal (UO mon), cardiac (echo, troponin), liver (AST/ALT)',
        'EEG monitoring continuous (aEEG / video EEG)',
        'Glucose, calcium, electrolytes — frequent labs',
        'Anticonvulsants готовы (phenobarbital 20 мг/кг loading)',
        'Family communication: реалистичная prognosis (NDI rate 30-50 % в severe HIE даже с TH)',
        'MRI brain @ 7-10 d after cooling (если применимо)',
      ],
    },
  ],
  compute(values): CalculatorResult {
    let count = 0;
    if (values.umbilical_acidosis === true) count++;
    if (values.apgar_low === true) count++;
    if (values.encephalopathy === true) count++;
    if (values.multiorgan === true) count++;

    const band = findBand(runner.bands, count);

    let icd = 'нет диагноза';
    if (count >= 3) icd = 'P21.0';
    else if (count >= 1) icd = 'P21.1';

    return {
      value: String(count),
      unit: 'критерия / 4',
      interpretation: `${band.label} (МКБ-10 ${icd})`,
      color: band.color,
      details: `${band.description ?? band.label}. AAP/ACOG 2014 4-criteria approach.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'AAP/ACOG 2014: ALL 4 criteria для definitive diagnosis; presence 1-3 — possible / probable',
    'Apgar НЕ должен использоваться как единственный критерий (особенно у preterm и при maternal medications)',
    'Pumbilical pH > 7.0 без encephalopathy = НЕ asphyxia diagnosis',
    'Encephalopathy без cord acidosis возможна (NEHIE — non-encephalopathy HIE) — другая этиология',
    'P21.0 (severe) — критерий для therapeutic hypothermia (см. neo-hie-cooling)',
    'TH window ≤ 6 ч от рождения; критично — diagnosis быстро',
    'Multi-organ injury (renal, кардио, hepatic, гемат) — strongly correlate с long-term NDI',
    'Neonatal encephalopathy ≠ HIE — другие causes: stroke, infection, IEM, congenital malformation',
    'NDI rate в severe HIE: 30-50 % (даже с TH); 60-80 % без TH',
    'Mild encephalopathy (Sarnat I) — обычно good outcome (5-10 % NDI), но недавние данные suggest TH benefit',
    'Cord blood pH < 7.0 + base deficit ≥ 12 — prognostic для encephalopathy и outcomes',
  ],
  related: [
    { id: 'apgar', title: 'Apgar score' },
    { id: 'thompson', title: 'Thompson Score / Sarnat staging' },
    { id: 'neo-hie-cooling', title: 'TH eligibility (NICHD/TOBY)' },
    { id: 'neo-abg', title: 'ABG / acid-base' },
  ],
  info: `### Критерии асфиксии (AAP/ACOG 2014)

Для definitive diagnosis "birth asphyxia" нужны **все 4 критерия**.
Presence 1-3 — possible / probable asphyxia.

### 4 критерия

1. **Метаболический ацидоз** в пуповинной артериальной крови:
   - pH < 7.0 ИЛИ BE ≥ -12 ммоль/л

2. **Apgar 0-3 на 5-й или 10-й минуте**

3. **Клинические признаки neonatal encephalopathy:**
   - Sarnat I-III: tone abnormalities, judorги, lethargy
   - HIE clinical syndrome

4. **Multi-organ dysfunction:**
   - **Renal:** ОПН, ↑ Cr, oliguria
   - **Кардио:** ↑ troponin, hypotension, ↓ contractility
   - **Liver:** ↑ AST / ALT
   - **Hematologic:** thrombocytopenia, DIC
   - **GI:** NEC

### МКБ-10 коды

| Code | Описание | Critria met |
|---|---|---|
| **P21.0** | Severe birth asphyxia | ≥ 3 critirium + encephalopathy |
| **P21.1** | Mild/moderate birth asphyxia | 1-2 critirium |
| **P21.9** | Unspecified | без classification |

### Severity correlation

| Critria | Likelihood definitive asphyxia | Outcome |
|---|---|---|
| 4/4 | High | NDI 30-50 % even with TH |
| 3/4 | Probable | NDI 20-40 % |
| 1-2/4 | Possible | NDI 5-20 % |

### Cooling criteria (neo-hie-cooling separate)

Для therapeutic hypothermia дополнительно нужны:
- GA ≥ 36 нед, BW ≥ 1800 г
- Возраст ≤ 6 ч от рождения
- НЕТ contraindications (chromosomal anomaly, etc.)
- Sarnat moderate-severe (II-III)

### Дифф диагноз encephalopathy

Не все neonatal encephalopathies — HIE:

| Cause | Distinguishing features |
|---|---|
| **HIE** | Cord acidosis + Apgar low + multi-organ |
| **Stroke** | Focal seizures, MRI focal lesion |
| **Infection** | Fever, sepsis markers, CSF |
| **IEM** | Familial history, specific labs |
| **Congenital malformation** | Imaging, dysmorphic features |
| **Maternal drugs** | History (anesthesia, opioids) |

### Apgar pitfalls

- **Не для preterm** — score часто low independently of asphyxia
- **Maternal anesthesia / opioids** → low Apgar without asphyxia
- **Congenital malformations** → low Apgar (е.g., diaphragmatic hernia)
- **Use:** retrospective marker, не triage tool

### Источники

- AAP/ACOG 2014 Joint Statement: Neonatal Encephalopathy and Neurologic Outcome
- ACOG Committee Opinion 348 (2006, reaff 2017)
- WHO ICD-10 P21
- КР МЗ РФ "Гипоксически-ишемическая энцефалопатия" (2024)
- NICHD / TOBY UK / SIBEN cooling criteria
`,
};

export default runner;
