/**
 * Runner: neo-zvur-class — Классификация ЗВУР / SGA / AGA / LGA
 *
 * NEONATOLOGY MODULE — Б2 (классификации, audit issue 3.B).
 *
 * Классификация intrauterine growth restriction (ЗВУР, IUGR):
 *   - Symmetric IUGR: ↓ всех параметров (height, weight, head circ)
 *     Causes: chromosomal, congenital infections, maternal conditions, exposures
 *   - Asymmetric IUGR: head sparing, ↓ weight + abd circ
 *     Causes: placental insufficiency, late pregnancy disorders
 *
 * SGA / AGA / LGA по Fenton 2025 (preterm) или Olsen 2010 / Intergrowth-21st (term):
 *   - SGA (small for gestational age): < 10-й перцентиль
 *   - AGA (appropriate): 10-90-й перцентиль
 *   - LGA (large): > 90-й перцентиль
 *   - Severe SGA: < 3-й перцентиль (high risk perinatal morbidity)
 *
 * SOURCES:
 *   - ACOG Committee Opinion 800 (2020) — Fetal Growth Restriction
 *   - WHO ICD-11 P05 (Slow fetal growth)
 *   - Fenton 2025 (Pediatrics 155:e2024069896) — preterm growth charts
 *   - Olsen 2010 — term growth charts
 *   - Intergrowth-21st (intergrowth21.com)
 *   - КР МЗ РФ "Задержка роста плода / новорождённого" (2024)
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  countries: 'Международный (ACOG / Fenton / Intergrowth-21) · РФ',
  reference: 'ACOG Committee Opinion 800 (2020). Fenton 2025. КР МЗ РФ "ЗРП/ЗВУР" 2024.',
  inputs: [
    {
      id: 'percentile',
      label: 'Перцентиль массы для GA (Fenton/Olsen/Intergrowth-21)',
      type: 'select',
      options: [
        { value: '0', label: '> 90-й перцентиль (LGA)', points: 0 },
        { value: '1', label: '10-90-й перцентиль (AGA)', points: 1 },
        { value: '2', label: '3-9-й перцентиль (SGA mild)', points: 2 },
        { value: '3', label: '< 3-й перцентиль (SGA severe)', points: 3 },
      ],
    },
    {
      id: 'pattern',
      label: 'Паттерн (если SGA)',
      type: 'select',
      options: [
        { value: '0', label: 'Симметричный (всё пропорционально)', points: 1 },
        { value: '1', label: 'Асимметричный (head sparing)', points: 0 },
        { value: '2', label: 'Не SGA', points: 0 },
      ],
    },
  ],
  bands: [
    {
      min: 0,
      max: 0,
      label: 'LGA (> 90-й перцентиль)',
      color: '#84CC16',
      description: 'Large for gestational age.',
      actions: [
        'LGA — повышенный риск гипогликемии (insulin overproduction in utero)',
        'Контроль глюкозы q30-60 мин в первые 4-12 ч',
        'Birth trauma assessment: ключица, brachial plexus injury, hum head injury',
        'Maternal diabetes / GDM evaluation',
        'Эхокардиография при подозрении на cardiomyopathy у IDM (children of diabetic mothers)',
      ],
    },
    {
      min: 1,
      max: 1,
      label: 'AGA (норма)',
      color: '#22C55E',
      description: 'Appropriate for gestational age.',
      actions: [
        'Стандартный уход',
        'Standard screenings: hyperbilirubinemia, glucose, метаболика',
        'Routine breastfeeding, kangaroo care, vit K profilaxis',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'SGA mild (3-9-й перцентиль) — асимметричный',
      color: '#F59E0B',
      description: 'Mild SGA с head sparing — обычно placental insufficiency.',
      actions: [
        'Asymmetric SGA pattern: head sparing предполагает placental insufficiency (late pregnancy)',
        'Контроль гипогликемии q30 мин × 4 ч, затем q4h × 24-48 ч',
        'Адекватное кормление; контроль массы (catch-up growth)',
        'Hypothermia risk → polyethylene wrap, cap',
        'Polycythemia screening (Hct ≥ 65 % — partial exchange)',
        'Имaging brain: head US при sympotomatic; обычно good prognosis',
        'Routine screenings + early interventional services',
      ],
    },
    {
      min: 4,
      max: 4,
      label: 'SGA severe (< 3-й перцентиль) — симметричный',
      color: '#7F1D1D',
      description: 'Severe SGA симметричный — high-risk pattern.',
      actions: [
        '⚠️ Severe symmetric SGA — high-risk pattern: chromosomal, congenital infection, maternal condition',
        'Workup: chromosomal microarray, TORCH (CMV в первую очередь)',
        'Brain imaging: head US + при abnormality MRI',
        'Кардиологическая ассессмент: echo (CHD у IUGR ↑)',
        'Длинный мониторинг гипогликемии q30 мин в первые 24 ч',
        'Parenteral nutrition если energy intake недостаточен',
        'Multidisciplinary team: neonat, neuro, genetics, cardio, infectious disease',
        'Long-term: high risk for neurodev impairment, learning disabilities',
        'Family counselling re prognosis',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const pPoints = Number(values.percentile ?? 1);
    const patternPoints = Number(values.pattern ?? 0);
    const total = pPoints + patternPoints;

    const band = findBand(runner.bands, total);

    return {
      value: String(total),
      unit: 'категория',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? band.label}. Categorization по Fenton 2025 (preterm) или Olsen 2010 / Intergrowth-21 (term).`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'IUGR ≠ SGA: IUGR — pathologic process; SGA — статистическое расположение в нижнем перцентиле',
    'Constitutionally small (familial small parents) — SGA по definition но не IUGR',
    'Symmetric IUGR (early onset): chromosomal anomalies, congenital infections (TORCH), exposures',
    'Asymmetric IUGR (late onset): placental insufficiency — usually better prognosis',
    'Severe SGA < 3-й перцентиль: 5-10× incidence neonatal morbidity (sepsis, NEC, IVH, BPD)',
    'Long-term: SGA infants have ↑ риск metabolic syndrome, type 2 DM, hypertension в adulthood',
    'Catch-up growth: asymmetric SGA usually catches up к 2-3 лет; symmetric — incomplete',
    'CMV — most common congenital infection causing symmetric IUGR; screening recommend',
    'У SGA preterm — risk factors дополняют (отдельный risk profile)',
    'Используйте sex-specific charts (Fenton, Olsen, Intergrowth-21st)',
    'Macrosomia (LGA, > 4000 г) — тоже high-risk: shoulder dystocia, brachial plexus injury, гипогликемия',
  ],
  related: [
    { id: 'neo-fenton', title: 'Fenton 2025 growth' },
    { id: 'neo-prematurity-class', title: 'Классификация недоношенности' },
    { id: 'neo-glucose-bolus-dose', title: 'Глюкоза болюс' },
    { id: 'intergrowth', title: 'Intergrowth-21st' },
  ],
  info: `### Классификация ЗВУР / SGA / AGA / LGA

Унифицированная классификация по перцентилям массы для gestational age
(Fenton 2025 для preterm, Olsen 2010 или Intergrowth-21st для term).

### Категории

| Категория | Перцентиль | Risk profile |
|---|---|---|
| **LGA** | > 90-й | Гипогликемия, birth trauma, IDM cardiomyopathy |
| **AGA** | 10-90-й | Norm |
| **SGA mild** | 3-9-й | Asymmetric IUGR, placental insuff |
| **SGA severe** | < 3-й | Symmetric IUGR, chromosomal/infect |

### Symmetric vs Asymmetric IUGR

| Pattern | Onset | Causes | Prognosis |
|---|---|---|---|
| **Symmetric** | Early (1-2 trimester) | Chromosomal, TORCH, exposures | Worse |
| **Asymmetric** | Late (3 trimester) | Placental insufficiency | Better |

#### Symmetric features:
- ↓ Height + weight + head circumference (proportional)
- Onset 1st или 2nd trimester
- Causes:
  - Chromosomal: trisomy 13, 18, 21, Turner
  - Infections: CMV, toxoplasma, rubella, syphilis (TORCH)
  - Maternal: severe malnutrition, alcohol, smoking, drugs
  - Genetic syndromes

#### Asymmetric features:
- Head sparing (brain spared); ↓ weight + abdominal circumference
- Onset 3rd trimester
- Causes:
  - Placental insufficiency (preeclampsia, hypertension)
  - Maternal vascular disease
  - Multifetal pregnancy
  - Late maternal nutrition issues

### Diagnostic workup

#### SGA severe (< 3-й перцентиль) workup:
- **Chromosomal:** microarray (replaces karyotype если negative ultrasound abnormalities)
- **TORCH:** CMV PCR (urine), syphilis serology, toxoplasma IgM, HIV, hepatitis
- **Imaging:** head US (CMV calcifications, anomalies), echo (CHD)
- **Metabolic:** thyroid, IGF-1 levels
- **Family:** parental measurements (constitutional vs IUGR)

### Clinical management

#### LGA management
- Glucose monitoring (especially IDM): q30-60 мин × 4-12 ч
- Birth trauma assessment: clavicle, brachial plexus
- Echo если IDM или sympotomatic (cardiomyopathy)

#### SGA mild management
- Glucose monitoring q30 мин × 4 ч then q4h × 24-48 ч
- Polyethylene wrap, cap (thermal protection)
- Polycythemia screen (Hct ≥ 65 % → partial exchange)
- Adequate feeding; catch-up growth target

#### SGA severe management
- All above PLUS:
- Workup chromosomal + infection
- Brain imaging
- Cardio assessment
- TPN if energy intake inadequate
- Multidisciplinary team
- Family counselling re prognosis

### Long-term outcomes

| | LGA | AGA | SGA mild | SGA severe |
|---|---|---|---|---|
| **Neurodev impairment** | baseline | baseline | + 2-3 % | + 10-25 % |
| **Catch-up growth** | normal | normal | usually full by 2-3 yr | incomplete |
| **Adult metab risk** | type 2 DM ↑ | baseline | DM ↑, HTN ↑ | DM ↑↑, HTN ↑↑ |
| **Cognitive issues** | baseline | baseline | mild | + |

### Источники

- ACOG Committee Opinion 800 (2020) — Fetal Growth Restriction
- WHO ICD-11 P05 (Slow fetal growth)
- Fenton 2025 (Pediatrics 155:e2024069896)
- Olsen 2010
- Intergrowth-21st (intergrowth21.com)
- КР МЗ РФ "Задержка роста плода / новорождённого" (2024)
`,
};

export default runner;
