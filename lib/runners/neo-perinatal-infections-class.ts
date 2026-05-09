/**
 * Runner: neo-perinatal-infections-class — Классификация перинатальных
 * инфекций (P35-P39 МКБ-10).
 *
 * NEONATOLOGY MODULE — Б10 (audit issue 3.B).
 *
 * Унифицированная классификация перинатальных и неонатальных инфекций
 * по группам этиологии и тajming (early-onset / late-onset). Помогает
 * empiric antibiotic selection и правильное coding (МКБ-10).
 *
 * SOURCES:
 *   - WHO ICD-10 P35-P39 (Perinatal infections)
 *   - AAP Red Book 2024-2027 — congenital и perinatal infections
 *   - КР МЗ РФ "Сепсис у новорождённых" (2024)
 *   - КР МЗ РФ "TORCH-инфекции у новорождённых" (2023)
 *
 * 4 main groups:
 *   - P35 Congenital viral (TORCH: rubella, CMV, herpes, hepatitis)
 *   - P36 Bacterial sepsis of newborn (EOS / LOS / nosocomial)
 *   - P37 Other congenital infectious (toxoplasmosis, congenital tuberculosis,
 *         malaria, syphilis ranked here per ICD-10)
 *   - P38 Omphalitis
 *   - P39 Other infectious specific to perinatal period (chorioamnionitis,
 *         neonatal urinary, conjunctivitis, mastitis, sepsis NOS)
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  countries: 'Международный (WHO ICD-10) · РФ',
  reference: 'WHO ICD-10 P35-P39. AAP Red Book 2024-2027. КР МЗ РФ Сепсис н/р 2024.',
  inputs: [
    {
      id: 'category',
      label: 'Категория инфекции',
      type: 'select',
      options: [
        { label: 'P35 — Врождённые вирусные (TORCH: краснуха, CMV, HSV, гепатит, ВИЧ)', value: 1 },
        { label: 'P36 — Бактериальный сепсис новорождённого (EOS / LOS / nosocomial)', value: 2 },
        { label: 'P37 — Другие врождённые (токсоплазмоз, врождённый сифилис, ТБ, малярия)', value: 3 },
        { label: 'P38 — Омфалит', value: 4 },
        { label: 'P39 — Прочие перинатальные (конъюнктивит, UTI, мастит, sepsis NOS)', value: 5 },
      ],
    },
  ],
  bands: [
    {
      min: 1,
      max: 1,
      label: 'P35 — Врождённые вирусные инфекции (TORCH)',
      color: '#9333EA',
      description: 'Передача transplacental или intrapartum (HSV).',
      actions: [
        '⚠️ TORCH workup: TORCH IgM/IgG, ПЦР CMV (моча, слюна), HSV ПЦР (CSF, mucous/skin lesion swabs если поражения)',
        'Cranial УЗИ + офтальмологическое обследование (chorioretinitis)',
        'Аудиологический скрининг (sensorineural hearing loss — частый исход CMV)',
        'CMV: Ganciclovir IV 6 мг/кг q12h × 6 нед (CASG 218) → Valganciclovir PO 16 мг/кг q12h × 6 мес если симптомное',
        'HSV neonatal disease: Acyclovir IV 60 мг/кг/день в 3 деления × 14 дней (SEM) или 21 день (CNS/disseminated)',
        'Hepatitis B перинатально: HBIG 0.5 мл IM в первые 12 ч + HBV vaccine (3-doses)',
        'Rubella congenital: supportive only, isolation 1 год',
        'HIV: ARV prophylaxis по протоколу (zidovudine ± lamivudine ± nevirapine)',
        'Изоляция (контактные / возд-капельные precautions)',
        'Длительный follow-up: development, hearing, vision, learning',
      ],
    },
    {
      min: 2,
      max: 2,
      label: 'P36 — Бактериальный сепсис новорождённого',
      color: '#7F1D1D',
      description: 'Подкатегории: EOS (≤ 72 ч), LOS (> 72 ч), nosocomial.',
      actions: [
        '⚠️ КРИТИЧЕСКАЯ ситуация — антибиотики в первые 60 мин',
        'EOS empiric (≤ 72 ч жизни): ампициллин 50-100 мг/кг + гентамицин 4-5 мг/кг (covers GBS, E. coli, Listeria)',
        'LOS empiric (> 72 ч жизни): ванкомицин 10-15 мг/кг + гентамицин (или цефепим 50 мг/кг при severe)',
        'Госпитальная (NICU > 7 дней): ванкомицин + меропенем 20 мг/кг + противогрибковая (ампB или fluconazole) при candida-риске',
        'CSF examination: люмбальная пункция при stable patient (cell count, glucose, protein, культура, ПЦР HSV)',
        'CBC + CRP + procalcitonin q12-24h первые 48-72 ч',
        'Кровь × 2 культуры (aerobic + anaerobic) ДО первой дозы антибиотика',
        'Урин культура (особенно > 7 дней — UTI частая причина LOS)',
        'Длительность: 7-10 дней при культура-positive bacteremia, 14-21 дней при meningitis',
        'Switch на narrow-spectrum по чувствительности после 48-72 ч',
        'См. neo-kaiser-eos (term ≥ 35 нед) и neo-puopolo-eos (preterm ≤ 34 нед) для risk stratification',
      ],
    },
    {
      min: 3,
      max: 3,
      label: 'P37 — Другие врождённые инфекционные болезни',
      color: '#9333EA',
      description: 'Токсоплазмоз, врождённый сифилис, ТБ, малярия.',
      actions: [
        'Токсоплазмоз (P37.1): Sulfadiazine 50 мг/кг q12h + Pyrimethamine 1 мг/кг q24h (нагрузочно 2 мг/кг × 2 дня) + Folinic acid 10 мг 3×/нед × 1 год',
        'Врождённый сифилис (P37.0): Penicillin G aqueous 50000 ЕД/кг q12h IV × 7 дней, then q8h × ещё 3 дня',
        'Скрининг treponemal/non-treponemal serology (RPR, VDRL, FTA-ABS)',
        'CSF на VDRL при подозрении neurosyphilis',
        'R-grafика длинных трубчатых костей (osteochondritis при сифилисе)',
        'TB neonatal (P37.0): isoniazid + rifampin + pyrazinamide + ethambutol (4-drug × 2 мес, then INH+RIF × 4 мес)',
        'Ophthalmology consult — chorioretinitis у токсоплазмоза',
        'Audiology screening',
        'Long-term follow-up: development, vision, hearing',
      ],
    },
    {
      min: 4,
      max: 4,
      label: 'P38 — Омфалит',
      color: '#F59E0B',
      description: 'Инфекция пупочной ранки (стандартно стафилококки/streptococci).',
      actions: [
        'Локальная: гипергемия > 5 мм вокруг пупка ИЛИ purulent discharge',
        'Empiric: ампициллин/oxacillin 25-50 мг/кг q6-8h + гентамицин 4 мг/кг q24h',
        'Severe (extending erythema, fever, sepsis signs) — vancomycin вместо oxacillin (covers MRSA)',
        'CBC + CRP + кровь культура',
        'Осмотр на complications: omphalitis spreading → necrotizing fasciitis (rare, hostile prognosis)',
        'Длительность: 7-10 дней parenteral если bacteremia; 5-7 дней при locally limited',
        'Профилактика: chlorhexidine 4 % cord care в endemic areas (WHO 2017 для high-mortality settings)',
        'WHO 2017: для развитых стран — dry cord care достаточно',
      ],
    },
    {
      min: 5,
      max: 5,
      label: 'P39 — Прочие специфические перинатальные инфекции',
      color: '#F59E0B',
      description: 'Конъюнктивит, UTI, мастит, sepsis NOS, etc.',
      actions: [
        'Гонорея конъюнктивит (P39.1): ceftriaxone 25-50 мг/кг IM × 1 (ИЛИ cefotaxime если hyperbilirubinemia) + saline irrigation',
        'Хламидия конъюнктивит (P39.1): erythromycin 50 мг/кг/день в 4 деления PO × 14 дней (или azithromycin 20 мг/кг q24h × 3 дня)',
        'UTI (P39.3): ампициллин + гентамицин IV × 7-10 дней; УЗИ почек для excludeing anomalies',
        'Кандидоз кожи/слизистых (P37.5): nystatin 100,000 ЕД q6h PO + topical для diaper rash',
        'Mastitis neonatal (P39.0): анти-стафилококковый ABX (oxacillin или cephalexin); local heat',
        'Sepsis NOS (P39.9): empiric same как EOS/LOS depending на onset',
        'Idents organism + sensibility — narrow-spectrum по результатам',
      ],
    },
  ],
  compute(values): CalculatorResult {
    const category = typeof values.category === 'number' ? values.category : 0;
    if (category < 1) {
      return {
        value: '0',
        unit: '',
        interpretation: 'Не выбрана категория',
        color: '#6B7280',
        details: 'Выберите категорию для классификации.',
        actions: [],
      };
    }

    const band = findBand(runner.bands, category);

    const codes: Record<number, string> = {
      1: 'P35.0-P35.9',
      2: 'P36.0-P36.9',
      3: 'P37.0-P37.9',
      4: 'P38',
      5: 'P39.0-P39.9',
    };

    return {
      value: codes[category] ?? '?',
      unit: 'МКБ-10',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? ''} См. actions для empiric tactic.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'P35-P39 — отдельная глава МКБ-10 для perinatal infections (отличается от A00-B99 общих инфекций)',
    'TORCH аббревиатура устарела — current "expanded TORCH" включает Zika, parvovirus B19, varicella',
    'EOS (≤ 72 ч) vs LOS (> 72 ч) — критически разные empiric regimens',
    'GBS — самый частый возбудитель EOS у term; E. coli — у preterm',
    'CoNS (coagulase-negative staph) — самый частый LOS возбудитель в NICU (catheter-related)',
    'Listeria — rare, но должна быть covered ампициллином у всех neonates до 1 мес',
    'CSF examination обязательна при подозрении meningitis — НЕ достаточно одной лишь кровяной культуры',
    'CMV — самая частая congenital infection в мире (0.5-2 % всех новорождённых, 10-15 % симптомная)',
    'Congenital syphilis — rising incidence в США/EU; CDC рекомендует universal screening 3 раза за беременность',
    'Antibiotic stewardship: stop ABX при negative cultures × 36-48 ч если low risk',
    'Ophthalmia neonatorum prophylaxis (erythromycin ointment) — controversial; AAP отменил universal в 2020',
  ],
  related: [
    { id: 'neo-kaiser-eos', title: 'Kaiser EOS calc (term)' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS calc (preterm)' },
    { id: 'neo-bell-nec', title: 'Bell stage NEC' },
    { id: 'neo-ampicillin-dose', title: 'Ампициллин дозирование' },
    { id: 'neo-gentamicin-dose', title: 'Гентамицин дозирование' },
    { id: 'neo-vancomycin-dose', title: 'Ванкомицин дозирование' },
    { id: 'neo-acyclovir-dose', title: 'Ацикловир дозирование (HSV)' },
    { id: 'neo-fluconazole-dose', title: 'Флуконазол дозирование' },
    { id: 'neo-meropenem-dose', title: 'Меропенем дозирование' },
  ],
  info: `### Перинатальные инфекции — МКБ-10 классификация

WHO ICD-10 chapter XVI ("Certain conditions originating in the perinatal period")
содержит 5 категорий perinatal infections (P35-P39):

| Код | Категория | Примеры |
|---|---|---|
| **P35** | Врождённые вирусные | CMV, краснуха, HSV, hepatitis B, HIV, varicella |
| **P36** | Bacterial sepsis newborn | EOS (GBS, E. coli, Listeria), LOS (CoNS, S. aureus, Klebsiella, Candida — P36.9) |
| **P37** | Другие врождённые инфекции | Токсоплазмоз, syphilis, ТБ, малярия |
| **P38** | Омфалит | S. aureus, GAS, polymicrobial |
| **P39** | Прочие перинатальные | Конъюнктивит (gonorrheal/chlamydial), UTI, мастит, sepsis NOS |

### EOS vs LOS — крит. различие

| Параметр | EOS (≤ 72 ч) | LOS (> 72 ч) | Госпитальная |
|---|---|---|---|
| **Источник** | Maternal flora | Postnatal | NICU environment |
| **Возбудители** | GBS, E. coli, Listeria | CoNS, S. aureus, Klebsiella, Candida | Multi-resistant Gram (-), MRSA, Candida |
| **Empiric** | Ampi + Genta | Vanco + Genta (или cefepime) | Vanco + Mero ± antifungal |
| **Mortality** | 5-10 % term, 25 % preterm | 5-15 % | 10-30 % |

### TORCH (классическая аббревиатура)

- **T**oxoplasma gondii (P37.1)
- **O**ther — syphilis, hepatitis B/C, varicella, parvovirus B19, Zika, HIV
- **R**ubella (P35.0)
- **C**ytomegalovirus (P35.1)
- **H**erpes simplex virus (P35.2)

Современная "expanded TORCH":
- Zika (TORCH-Z), parvovirus B19, varicella, ZIKV transplacental

### Empiric antibiotic schemes (РФ КР 2024)

**EOS:**
- Ампициллин 50-100 мг/кг q8-12h IV + Гентамицин 4-5 мг/кг q24h IV

**LOS (suspect MRSA / S. aureus):**
- Ванкомицин 10-15 мг/кг q8-12h + Гентамицин (или amikacin)

**Госпитальная (NICU > 7 дней):**
- Ванкомицин + Меропенем 20 мг/кг q8h
- Antifungal (fluconazole 12 мг/кг q24h или amphotericin B liposomal) при риске Candida

**Meningitis:**
- Длительность 14-21 дней (зависит от возбудителя)
- GBS meningitis: 14 дней; Gram(-) meningitis: 21 день

### Источники

- WHO ICD-10 P35-P39
- AAP Red Book 2024-2027
- КР МЗ РФ "Сепсис у новорождённых" (2024)
- КР МЗ РФ "TORCH-инфекции у новорождённых" (2023)
- Polin RA. Pediatrics 2012;129:1006 — EOS management
- Stoll BJ et al. Pediatrics 2011;127:817 — LOS epidemiology
`,
};

export default runner;
