// @ts-nocheck
/** Runner: umls — Unified Medical Language System */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (NLM/NIH) · мета-тезаурус 200+ словарей',
  reference: 'Bodenreider O. The Unified Medical Language System (UMLS): integrating biomedical terminology. Nucleic Acids Res. 2004;32(Database issue):D267-D270. https://www.nlm.nih.gov/research/umls/',
  inputs: [
    {
      id: 'semantic',
      label: 'Semantic Type (TUI)',
      type: 'select',
      options: [
        { value: 'dsyn', label: 'T047 Disease or Syndrome' },
        { value: 'sosy', label: 'T184 Sign or Symptom' },
        { value: 'phsf', label: 'T039 Physiologic Function' },
        { value: 'topp', label: 'T061 Therapeutic or Preventive Procedure' },
        { value: 'phsu', label: 'T121 Pharmacologic Substance' },
        { value: 'bacs', label: 'T123 Biologically Active Substance' },
        { value: 'bact', label: 'T007 Bacterium' },
        { value: 'virs', label: 'T005 Virus' },
        { value: 'anab', label: 'T017 Anatomical Structure' },
        { value: 'neop', label: 'T191 Neoplastic Process' },
      ],
    },
  ],
  presets: [
    { label: 'Болезнь', values: { semantic: 'dsyn' } },
    { label: 'Симптом', values: { semantic: 'sosy' } },
    { label: 'Фарм. в-во', values: { semantic: 'phsu' } },
  ],
  compute: (v) => {
    const sem = String(v.semantic || 'dsyn');
    const map: Record<string, { name: string; example: string; cui: string; mappings: string }> = {
      dsyn: { name: 'Disease or Syndrome (T047)', example: 'Myocardial Infarction', cui: 'C0027051', mappings: 'SNOMED CT 22298006 · ICD-10 I21.9 · ICD-10-CM I21.9 · MeSH D009203 · ICD-9-CM 410.9' },
      sosy: { name: 'Sign or Symptom (T184)', example: 'Chest Pain', cui: 'C0008031', mappings: 'SNOMED CT 29857009 · ICD-10 R07.4 · MeSH D002637 · LOINC 75321-5' },
      phsf: { name: 'Physiologic Function (T039)', example: 'Blood Pressure determination', cui: 'C0005823', mappings: 'SNOMED CT 75367002 · LOINC 85353-1 · MeSH D001795' },
      topp: { name: 'Therapeutic or Preventive Procedure (T061)', example: 'Appendectomy', cui: 'C0003611', mappings: 'SNOMED CT 80146002 · ICD-10-PCS 0DTJ0ZZ · CPT 44950 · MeSH D001062' },
      phsu: { name: 'Pharmacologic Substance (T121)', example: 'Warfarin', cui: 'C0043031', mappings: 'SNOMED CT 372756006 · RxNorm 11289 · MeSH D014859 · ATC B01AA03' },
      bacs: { name: 'Biologically Active Substance (T123)', example: 'Insulin', cui: 'C0021641', mappings: 'SNOMED CT 67866001 · RxNorm 5856 · MeSH D007328' },
      bact: { name: 'Bacterium (T007)', example: 'Escherichia coli', cui: 'C0014834', mappings: 'SNOMED CT 112283007 · MeSH D004926 · NCBI Taxonomy 562' },
      virs: { name: 'Virus (T005)', example: 'SARS-CoV-2', cui: 'C5203670', mappings: 'SNOMED CT 840533007 · MeSH D000086402 · NCBI Taxonomy 2697049' },
      anab: { name: 'Anatomical Structure (T017)', example: 'Heart', cui: 'C0018787', mappings: 'SNOMED CT 80891009 · FMA 7088 · MeSH A07.541 · ICD-O T-32000' },
      neop: { name: 'Neoplastic Process (T191)', example: 'Breast Carcinoma', cui: 'C0678222', mappings: 'SNOMED CT 254837009 · ICD-10 C50 · ICD-O-3 8500/3 · MeSH D001943' },
    };
    const e = map[sem];
    return {
      value: e.cui,
      unit: 'CUI',
      color: '#6B7280',
      interpretation: `UMLS: ${e.example} (${e.name})`,
      details: `Concept Unique Identifier (CUI): ${e.cui}\nPreferred Name: ${e.example}\nSemantic Type: ${e.name}\n\nCross-vocabulary mappings:\n${e.mappings}\n\nUMLS Metathesaurus объединяет 200+ биомедицинских словарей под единым CUI. Каждый concept имеет semantic type (из 127 категорий Semantic Network) и связи (через Semantic Network relationships).`,
      actions: [
        'UMLS Metathesaurus Browser: https://uts.nlm.nih.gov/uts/umls/home',
        'UMLS API (REST): https://documentation.uts.nlm.nih.gov/rest/home.html',
        'Регистрация в UTS (UMLS Terminology Services) — бесплатно, требуется',
        'MetamorphoSys — desktop tool для создания пользовательского subset',
        'Для NLP — использовать MetaMap / cTAKES (named entity recognition)',
      ],
      caveats: [
        'UMLS требует License Agreement (бесплатен для большинства исследований)',
        'Включённые vocabularies имеют СВОИ лицензии (SNOMED CT, CPT — платные для некоторых стран)',
        'Обновления 2 раза в год (May, November releases)',
        'Текущий релиз: 2024AB (Nov 2024)',
        'CUI стабилен между релизами, но concepts могут merge/split',
        'Semantic Network (T-коды) — 127 semantic types + 54 relationships',
      ],
      related: [
        { id: 'snomed', title: 'SNOMED CT' },
        { id: 'loinc', title: 'LOINC' },
        { id: 'rxnorm', title: 'RxNorm' },
        { id: 'icd10', title: 'ICD-10' },
        { id: 'icd11', title: 'ICD-11' },
      ],
      relatedCourses: [
        { id: '304.1', title: 'Диагностика и кодирование' },
      ],
    };
  },
  info: `### Для чего используется
**UMLS** (Unified Medical Language System) — метатезаурус, разработанный US National Library of Medicine (с 1986 г.). Объединяет 200+ биомедицинских словарей под единым Concept Unique Identifier (**CUI**).

### 3 компонента UMLS
1. **Metathesaurus** — 4+ млн concepts, 14+ млн concept names, 200+ source vocabularies
2. **Semantic Network** — 127 semantic types + 54 relationships (категоризация concepts)
3. **SPECIALIST Lexicon** — лексическая база для NLP (словоформы, синтаксис)

### Включённые словари (≈200)
- SNOMED CT (международный + US Edition)
- ICD-10, ICD-10-CM, ICD-10-PCS, ICD-9-CM
- RxNorm, MED-RT, VA NDF
- LOINC
- MeSH (medical subject headings)
- CPT, HCPCS (процедуры US)
- MedDRA (фармакобдительность)
- OMIM (генетика)
- NCBI Taxonomy (организмы)
- FMA, UBERON (анатомия)
- HPO (фенотипы)
- ORPHANET (редкие болезни)

### 127 Semantic Types (примеры)
| TUI | Название |
|---|---|
| T047 | Disease or Syndrome |
| T184 | Sign or Symptom |
| T121 | Pharmacologic Substance |
| T061 | Therapeutic/Preventive Procedure |
| T017 | Anatomical Structure |
| T007 | Bacterium |
| T005 | Virus |

### Применение
- **Cross-walking** между стандартами (ICD ↔ SNOMED ↔ MeSH)
- **Biomedical NLP** (cTAKES, MetaMap, QuickUMLS)
- **Decision support** системы
- **Информационный поиск** (PubMed MeSH — часть UMLS)
- **Маппинг pub genomic/clinical** (TCGA, ClinVar)`,
};
export default runner;
