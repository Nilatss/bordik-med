// @ts-nocheck
/** Runner: nice-uk — NICE Guidelines (UK) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Великобритания (England, Wales; Scotland — частично, есть отдельный SIGN)',
  reference: 'National Institute for Health and Care Excellence (NICE). https://www.nice.org.uk/. Независимая публичная организация, спонсируется Department of Health and Social Care, UK.',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность / область',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Cardiovascular' },
        { value: 'cancer', label: 'Cancer / oncology' },
        { value: 'mental', label: 'Mental health' },
        { value: 'diabetes', label: 'Diabetes / endocrinology' },
        { value: 'respiratory', label: 'Respiratory' },
        { value: 'women', label: "Women's health / maternity" },
        { value: 'paeds', label: 'Paediatrics' },
        { value: 'infection', label: 'Infection / antimicrobials' },
      ],
    },
  ],
  presets: [
    { label: 'Cardiovascular', values: { specialty: 'cardio' } },
    { label: 'Diabetes', values: { specialty: 'diabetes' } },
    { label: 'Mental health', values: { specialty: 'mental' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'cardio');
    const map: Record<string, { name: string; ng: string; cg: string; ta: string }> = {
      cardio: {
        name: 'Cardiovascular',
        ng: 'NG136 Hypertension in adults (2019/2022); NG196 Acute coronary syndromes (2020); NG106 Chronic heart failure (2018); NG185 Acute heart failure (2021); NG158 Venous thromboembolic diseases (2020); NG185 AF (2021, replaces CG180)',
        cg: 'CG172 Post-MI secondary prevention (2013, updated); CG181 Cardiovascular disease: risk assessment and reduction (2014, updated 2023)',
        ta: 'TA267 Apixaban for AF stroke prevention; TA355 Edoxaban; TA677 Dapagliflozin for HF; TA773 Empagliflozin for HF; TA385 Sacubitril-valsartan',
      },
      cancer: {
        name: 'Cancer / oncology',
        ng: 'NG12 Suspected cancer: recognition and referral (2015, updated 2023); NG101 Early and locally advanced breast cancer (2018); NG151 Prostate cancer (2019); NG121 Lung cancer (2019); NG151 Colorectal cancer (2020)',
        cg: 'Many subsumed into NGs; historical: CG131 Colorectal cancer (replaced by NG151)',
        ta: 'TA886 Osimertinib for EGFR+ NSCLC; TA724 Pembrolizumab for melanoma; TA729 Abiraterone; hundreds of oncology TAs — NICE cancer appraisals update frequently',
      },
      mental: {
        name: 'Mental health',
        ng: 'NG222 Depression in adults (2022); NG134 Self-harm (2022); NG178 Suicide prevention (2018); NG87 ADHD (2018); NG116 PTSD (2018); NG10 Violence and aggression (2015)',
        cg: 'CG90 Depression in adults (replaced by NG222); CG159 Social anxiety; CG178 Psychosis and schizophrenia (2014, still current)',
        ta: 'TA367 Vortioxetine for depression; TA538 Esketamine; TA655 Cariprazine for schizophrenia',
      },
      diabetes: {
        name: 'Diabetes / endocrinology',
        ng: 'NG28 Type 2 diabetes in adults (2015, updated 2022); NG17 Type 1 diabetes in adults (2015, updated 2022); NG18 Diabetes (type 1/2) in children (2015); NG3 Diabetes in pregnancy (2015, updated 2020); NG19 Diabetic foot problems (2015)',
        cg: 'CG189 Obesity: identification, assessment and management (2014)',
        ta: 'TA390 Empagliflozin + metformin; TA583 Dapagliflozin CV; TA877 Semaglutide (Wegovy) for weight management; TA875 Tirzepatide',
      },
      respiratory: {
        name: 'Respiratory',
        ng: 'NG115 COPD (2019, updated 2023); NG80 Asthma diagnosis, monitoring and management (2017, updated 2021); NG191 COVID-19 rapid guideline; NG155 Cystic fibrosis (2017)',
        cg: 'CG191 Pneumonia (hospital-acquired, 2014); CG152 Suspected sepsis (replaced by NG51)',
        ta: 'TA565 Mepolizumab for severe asthma; TA751 Tezepelumab; TA776 Dupilumab',
      },
      women: {
        name: "Women's health / maternity",
        ng: 'NG201 Antenatal care (2021); NG25 Preterm labour and birth (2015); NG121 Intrapartum care for women with existing medical conditions (2019); NG3 Diabetes in pregnancy (2020); NG133 Hypertension in pregnancy (2019)',
        cg: 'CG44 Heavy menstrual bleeding (2007, updated); CG156 Fertility problems (2013, updated 2017)',
        ta: 'TA530 Naldemedine; TA810 Elagolix for endometriosis',
      },
      paeds: {
        name: 'Paediatrics',
        ng: 'NG143 Fever in under 5s (2019, updated 2021); NG51 Sepsis recognition (2016, updated 2024); NG9 Diabetic ketoacidosis; NG18 Diabetes (type 1/2) in children (2015); NG43 Transition from paediatric to adult services',
        cg: 'CG84 Diarrhoea and vomiting in under 5s (2009); CG160 Feverish illness in children (replaced by NG143)',
        ta: 'TA588 Nusinersen for SMA; TA755 Onasemnogene',
      },
      infection: {
        name: 'Infection / antimicrobials',
        ng: 'NG191 COVID-19; NG51 Sepsis (2016, updated 2024); NG15 Antimicrobial stewardship (2015); NG109 UTI antimicrobial prescribing (2018); NG84 Sore throat antimicrobial prescribing (2018); NG139 Tuberculosis (2016, updated 2019)',
        cg: 'CG139 Healthcare-associated infections (2012); CG64 Prophylaxis against infective endocarditis (2008, updated 2015)',
        ta: 'TA595 Lefamulin; TA787 Cefiderocol; multiple antimicrobial TAs',
      },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'NICE UK',
      color: '#6B7280',
      interpretation: `NICE guidance: ${e.name}`,
      details: `Область: ${e.name}\n\nNICE Guidelines (NG — current format):\n${e.ng}\n\nClinical Guidelines (CG — legacy, being replaced by NG):\n${e.cg}\n\nTechnology Appraisals (TA — medicines/devices):\n${e.ta}\n\nИерархия NICE guidance: NG (NICE Guideline — comprehensive, current format since 2015) > CG (Clinical Guideline — legacy, pre-2015) > TA (Technology Appraisal — single drug/device cost-effectiveness) > IPG (Interventional Procedures Guidance — safety/efficacy) > MIB (Medtech Innovation Briefing) > QS (Quality Standards).`,
      actions: [
        'NICE homepage: https://www.nice.org.uk/',
        'Search all guidance: https://www.nice.org.uk/guidance',
        'BNF (British National Formulary): https://bnf.nice.org.uk/',
        'CKS (Clinical Knowledge Summaries): https://cks.nice.org.uk/ (see runner nice-cks)',
        'Quality Standards: https://www.nice.org.uk/standards-and-indicators',
        'Interventional Procedures: https://www.nice.org.uk/about/what-we-do/our-programmes/nice-guidance/nice-interventional-procedures-guidance',
        'Sign up to NICE alerts — email updates when new guidance issued',
      ],
      caveats: [
        'NICE applies to England (and adopted by Wales via NHS Wales); Scotland has SIGN; Northern Ireland typically follows NICE',
        'TAs are funding decisions for NHS England — positive TA mandates NHS funding within 3 months',
        'NG vs CG: new guidelines issued as NG since 2015; legacy CGs being progressively replaced',
        'Cost-effectiveness threshold: £20,000-30,000 per QALY (higher for end-of-life: £50,000)',
        'Updates: NGs reviewed every 3-5 years; urgent updates via "rapid" process',
        'Applicability outside UK: evidence base is transferable, but dosing (BNF), drug availability, and cost-effectiveness thresholds differ',
        'Partial free access worldwide for guidelines; BNF/CKS — UK-restricted (geo-blocked since 2021)',
      ],
      related: [
        { id: 'nice-cks', title: 'NICE CKS (primary care summaries)' },
        { id: 'sign', title: 'SIGN (Scotland)' },
        { id: 'bnf', title: 'British National Formulary' },
        { id: 'has-fr', title: 'HAS (France, analog)' },
        { id: 'gba-de', title: 'G-BA (Germany, analog)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '312.1', title: 'Медицинское образование / EBM' },
      ],
    };
  },
  info: `### Для чего используется
**NICE (National Institute for Health and Care Excellence)** — independent public body sponsored by the UK Department of Health and Social Care. Issues evidence-based guidance for NHS England (with uptake in Wales and Northern Ireland; Scotland uses SIGN).

### Иерархия NICE guidance

| Type | Code | Purpose |
|------|------|---------|
| **NICE Guideline** | NG | Comprehensive guideline (current format since 2015) |
| **Clinical Guideline** | CG | Legacy format (pre-2015), being replaced by NGs |
| **Technology Appraisal** | TA | Cost-effectiveness of single drug/device for NHS funding |
| **Interventional Procedures Guidance** | IPG | Safety/efficacy of procedures |
| **Medtech Innovation Briefing** | MIB | Early assessment of new technologies |
| **Quality Standard** | QS | Markers of high-quality care |
| **Clinical Knowledge Summary** | CKS | Primary care quick reference (см. runner **nice-cks**) |
| **Diagnostic Guidance** | DG | Diagnostic technologies |
| **Highly Specialised Technologies** | HST | Rare/ultra-rare diseases |

### Development process
1. Topic selection (NHS England, DHSC, public)
2. Scoping consultation
3. Evidence review (systematic review + cost-effectiveness modelling)
4. Committee deliberation (clinical + lay members)
5. Public consultation on draft
6. Final guidance + implementation tools

### Methodology
- **GRADE** for certainty of evidence
- **ICER** (incremental cost-effectiveness ratio) in £/QALY
- Threshold: £20,000-30,000 per QALY (higher £50k for end-of-life)
- Equality Impact Assessment

### Links and access
- **Main guidance portal**: https://www.nice.org.uk/guidance
- **BNF** (British National Formulary — dosing): https://bnf.nice.org.uk/
- **CKS** (primary care summaries): https://cks.nice.org.uk/
- Most NICE guidance — **free worldwide**
- BNF and CKS — **UK IP-restricted** since 2021

### Legal status
- NICE TAs — NHS England must fund positive decisions within 3 months (statutory)
- NGs — strong recommendation but not mandatory; used by CQC (Care Quality Commission) for inspections
- Private sector / insurance — often align with NICE

### Relationship with international bodies
- **SIGN** (Scottish Intercollegiate Guidelines Network) — Scotland equivalent
- **RCGP**, **RCP**, royal colleges — implementation partners
- **Cochrane** — frequent evidence source
- **EMA** — medicines regulation (separate from NICE cost-effectiveness)

### Relevance for non-UK
NICE guidelines are high-quality EBM resources used worldwide as reference, but local adaptation needed for drug availability, cost-effectiveness thresholds, and healthcare system differences.

### Sources
- https://www.nice.org.uk/
- https://bnf.nice.org.uk/
- https://cks.nice.org.uk/
- Health and Social Care Act 2012 (UK)`,
};
export default runner;
