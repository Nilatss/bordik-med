/** Runner: snomed — SNOMED CT */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (SNOMED International) · США, UK, Канада, Австралия, Нидерланды (40+ стран)',
  reference: 'SNOMED International. SNOMED CT Editorial Guide. London: SNOMED International; 2024. https://www.snomed.org/',
  inputs: [
    {
      id: 'hierarchy',
      label: 'Иерархия',
      type: 'select',
      options: [
        { value: 'clinical', label: 'Clinical finding (симптомы, болезни)' },
        { value: 'procedure', label: 'Procedure (процедуры)' },
        { value: 'body', label: 'Body structure (анатомия)' },
        { value: 'organism', label: 'Organism (возбудители)' },
        { value: 'substance', label: 'Substance (вещества)' },
        { value: 'product', label: 'Pharmaceutical product' },
        { value: 'specimen', label: 'Specimen (образцы)' },
        { value: 'situation', label: 'Situation with explicit context' },
        { value: 'event', label: 'Event (события)' },
      ],
    },
  ],
  presets: [
    { label: 'Болезни/симптомы', values: { hierarchy: 'clinical' } },
    { label: 'Процедуры', values: { hierarchy: 'procedure' } },
    { label: 'Возбудители', values: { hierarchy: 'organism' } },
  ],
  compute: (v) => {
    const h = String(v.hierarchy || 'clinical');
    const map: Record<string, { name: string; example: string; parents: string; fsn: string }> = {
      clinical: {
        name: 'Clinical finding',
        example: '22298006',
        fsn: 'Myocardial infarction (disorder)',
        parents: '← Ischemic heart disease 414545008 ← Disorder of cardiovascular system 49601007 ← Disorder of body system 362965005',
      },
      procedure: {
        name: 'Procedure',
        example: '80146002',
        fsn: 'Appendectomy (procedure)',
        parents: '← Excision of intra-abdominal structure ← Excision (procedure) 65801008',
      },
      body: {
        name: 'Body structure',
        example: '181268008',
        fsn: 'Entire heart (body structure)',
        parents: '← Heart structure 80891009 ← Thoracic cavity structure ← Body structure 123037004',
      },
      organism: {
        name: 'Organism',
        example: '112283007',
        fsn: 'Escherichia coli (organism)',
        parents: '← Escherichia (genus) ← Enterobacteriaceae ← Gram-negative bacterium',
      },
      substance: {
        name: 'Substance',
        example: '372756006',
        fsn: 'Warfarin (substance)',
        parents: '← Coumarin derivative ← Anticoagulant ← Drug affecting blood constituents',
      },
      product: {
        name: 'Pharmaceutical / biologic product',
        example: '386875009',
        fsn: 'Metformin-containing product',
        parents: '← Biguanide-containing product ← Oral hypoglycemic agent',
      },
      specimen: {
        name: 'Specimen',
        example: '119297000',
        fsn: 'Blood specimen (specimen)',
        parents: '← Body fluid specimen ← Specimen from patient',
      },
      situation: {
        name: 'Situation with explicit context',
        example: '401207004',
        fsn: 'Family history of diabetes mellitus (situation)',
        parents: '← Family history of disorder ← Situation with explicit context',
      },
      event: {
        name: 'Event',
        example: '242849001',
        fsn: 'Road traffic accident (event)',
        parents: '← Accident ← Event',
      },
    };
    const e = map[h]!;
    return {
      value: e.example,
      unit: 'SCTID',
      color: '#6B7280',
      interpretation: `SNOMED CT: ${e.fsn}`,
      details: `SNOMED CT ID (SCTID): ${e.example}\nFully Specified Name (FSN): ${e.fsn}\n\nParent concepts (IS-A): ${e.parents}\n\nИерархия: ${e.name}\n\nSNOMED CT — крупнейшая медицинская онтология (>350,000 активных concepts). Каждый concept имеет unique SCTID + FSN + synonyms + relationships к другим concepts.`,
      actions: [
        'SNOMED CT Browser: https://browser.ihtsdotools.org/',
        'SNOMED International portal: https://www.snomed.org/',
        'Использовать International Edition или национальную extension (US, UK и т.д.)',
        'Для поиска — SNOMED CT Expressions (compositional grammar) для уточнения',
        'Reference Sets (RefSets) — curated подмножества для конкретных use cases',
      ],
      caveats: [
        'SNOMED CT — платная лицензия (для стран без национального affiliate)',
        '40+ стран имеют национальную licence (бесплатно для residents): US, UK, CA, AU, NZ, NL и др.',
        'РФ НЕ является членом SNOMED International (лицензия требуется коммерчески)',
        'Обновления каждые 6 мес (International Edition: January/July)',
        'Не путать с: SNOMED (1965), SNOMED II, SNOMED RT — устаревшие предшественники',
        'Mapping to ICD-10/ICD-11 — official maps, но не 1:1',
      ],
      related: [
        { id: 'icd10', title: 'ICD-10' },
        { id: 'icd11', title: 'ICD-11' },
        { id: 'loinc', title: 'LOINC (лабораторные)' },
        { id: 'rxnorm', title: 'RxNorm (лекарства)' },
        { id: 'umls', title: 'UMLS (метатезаурус)' },
      ],
      relatedCourses: [
        { id: '304.1', title: 'Диагностика и кодирование' },
      ],
    };
  },
  info: `### Для чего используется
**SNOMED CT** (Systematized Nomenclature of Medicine — Clinical Terms) — крупнейшая в мире медицинская онтология / терминология, разработана SNOMED International. Используется в EHR (Epic, Cerner), HL7 FHIR, meaningful use в США.

### Структура concept
| Компонент | Описание | Пример |
|---|---|---|
| SCTID | Уникальный ID | 22298006 |
| FSN | Fully Specified Name | Myocardial infarction (disorder) |
| Preferred term | Основной синоним | Myocardial infarction |
| Synonyms | Другие формулировки | Heart attack, MI, Cardiac infarction |
| Relationships | IS-A и атрибуты | IS-A Ischemic heart disease |

### 19 верхнеуровневых иерархий (top-level)
Clinical finding · Procedure · Body structure · Organism · Substance · Pharmaceutical product · Specimen · Situation w/ explicit context · Event · Physical object · Physical force · Environment · Staging and scales · Qualifier value · Linkage concept · Observable entity · Record artifact · Social context · SNOMED CT Model

### Ключевая сила — post-coordination
Сочетание concepts для уточнения: \`80146002 | Appendectomy | : 260870009 | Priority | = 25876001 | Emergency |\` → "срочная аппендэктомия"

### Editions
- **International Edition** — основа (англ., январь + июль)
- **National Extensions** — US Edition (добавляет CPT mappings), UK Edition (dm+d препараты) и т.д.`,
};
export default runner;
