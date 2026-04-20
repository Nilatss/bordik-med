// @ts-nocheck
/** Runner: loinc — Logical Observation Identifiers Names and Codes */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Regenstrief Institute, США) · 180+ стран',
  reference: 'Regenstrief Institute. LOINC Users\' Guide. Indianapolis: Regenstrief Institute; 2024. https://loinc.org/',
  inputs: [
    {
      id: 'category',
      label: 'Категория теста',
      type: 'select',
      options: [
        { value: 'cbc', label: 'Общий анализ крови (CBC)' },
        { value: 'chem', label: 'Биохимия' },
        { value: 'coag', label: 'Коагулограмма' },
        { value: 'endo', label: 'Эндокринология' },
        { value: 'micro', label: 'Микробиология' },
        { value: 'urine', label: 'Моча' },
        { value: 'document', label: 'Клинические документы' },
        { value: 'vitals', label: 'Витальные показатели' },
      ],
    },
  ],
  presets: [
    { label: 'Биохимия', values: { category: 'chem' } },
    { label: 'ОАК', values: { category: 'cbc' } },
    { label: 'Коагулограмма', values: { category: 'coag' } },
  ],
  compute: (v) => {
    const c = String(v.category || 'chem');
    const map: Record<string, { name: string; examples: string; note: string }> = {
      cbc: {
        name: 'Complete Blood Count',
        examples: '**718-7** Hemoglobin [Mass/volume] in Blood; **26464-8** Leukocytes [#/volume] in Blood by Automated count; **777-3** Platelets [#/volume] in Blood by Automated count; **4544-3** Hematocrit [Volume Fraction] of Blood by Automated count',
        note: 'CBC panel = 58410-2 Complete blood count panel - Blood',
      },
      chem: {
        name: 'Биохимия',
        examples: '**2345-7** Glucose [Mass/volume] in Serum/Plasma; **2160-0** Creatinine [Mass/volume] in Serum/Plasma; **3094-0** BUN (Urea nitrogen) [Mass/volume] in Serum/Plasma; **2951-2** Sodium [Moles/volume] in Serum/Plasma; **2823-3** Potassium [Moles/volume] in Serum/Plasma; **1751-7** Albumin [Mass/volume] in Serum/Plasma',
        note: 'Basic metabolic panel = 24321-2; Comprehensive metabolic = 24323-8',
      },
      coag: {
        name: 'Коагулограмма',
        examples: '**5902-2** Prothrombin time (PT) in Platelet poor plasma by Coag assay; **6301-6** INR in Platelet poor plasma by Coag assay; **14979-9** aPTT in Platelet poor plasma by Coag assay; **3255-7** Fibrinogen [Mass/volume] in Platelet poor plasma; **48066-5** D-dimer [Mass/volume] in Platelet poor plasma',
        note: 'INR должен отправляться вместе с ISI + PT метода',
      },
      endo: {
        name: 'Эндокринология',
        examples: '**3016-3** TSH [Units/volume] in Serum/Plasma; **3051-0** Free T4 [Mass/volume] in Serum/Plasma; **4548-4** HbA1c [Mass fraction] in Blood; **2571-8** Triglycerides [Mass/volume] in Serum/Plasma; **14647-2** Cholesterol [Moles/volume] in Serum/Plasma',
        note: 'HbA1c в разных единицах — 4548-4 % vs 59261-8 mmol/mol (IFCC)',
      },
      micro: {
        name: 'Микробиология',
        examples: '**600-7** Bacteria identified in Blood by Culture; **88262-1** HIV 1 RNA [#/volume] in Plasma by NAA + probe detection; **94500-6** SARS-CoV-2 RNA [Presence] in Respiratory specimen by NAA + probe detection',
        note: 'Для антибиотикограмм — отдельные LOINC коды по методу (MIC, Kirby-Bauer, E-test)',
      },
      urine: {
        name: 'Моча',
        examples: '**5804-0** Protein [Mass/volume] in Urine by Test strip; **5794-3** Ketones in Urine by Test strip; **2349-9** Glucose in Urine by Test strip; **5767-9** Appearance of Urine; **5811-5** Specific gravity of Urine',
        note: 'Панель = 24357-6 Urinalysis complete panel - Urine',
      },
      document: {
        name: 'Клинические документы (LOINC Document Ontology)',
        examples: '**11506-3** Progress note; **18842-5** Discharge summary; **34117-2** History and physical note; **11488-4** Consultation note; **11502-2** Laboratory report',
        note: 'Обязательно для CDA / CCDA / FHIR document-level resources',
      },
      vitals: {
        name: 'Витальные показатели',
        examples: '**8480-6** Systolic blood pressure; **8462-4** Diastolic blood pressure; **8867-4** Heart rate; **8310-5** Body temperature; **9279-1** Respiratory rate; **2708-6** Oxygen saturation in Arterial blood by Pulse oximetry; **29463-7** Body weight; **8302-2** Body height; **39156-5** BMI',
        note: 'Стандарт FHIR Observation — используй LOINC vital signs',
      },
    };
    const e = map[c];
    const firstCode = (e.examples.match(/\*\*([^*]+)\*\*/) || [null, '—'])[1];
    return {
      value: firstCode,
      unit: 'LOINC',
      color: '#6B7280',
      interpretation: `LOINC: ${e.name}`,
      details: `**Категория:** ${e.name}\n\n**Примеры кодов:**\n${e.examples}\n\n**Примечание:** ${e.note}\n\nКаждый LOINC код имеет 6 осей: **Component · Property · Time · System · Scale · Method**.`,
      actions: [
        'LOINC Search: https://loinc.org/search/',
        'RELMA — desktop tool для маппинга локальных тестов на LOINC (бесплатно)',
        'Регистрация на https://loinc.org/ — обязательна (бесплатно для некоммерч. использования)',
        'Для FHIR — использовать LOINC как primary coding system для Observation.code',
        'Combinations: LOINC Panels (multiple tests в одном заказе)',
      ],
      caveats: [
        'LOINC — БЕСПЛАТНО (с регистрацией), в отличие от SNOMED/ICD',
        'Обновления каждые 6 мес (Regenstrief — June/December releases)',
        'Текущая версия 2.78 (June 2024), ~100,000 concepts',
        'LOINC ≠ SNOMED: LOINC — что МЕРЯЕТСЯ, SNOMED — что НАЙДЕНО',
        'Для единиц измерения LOINC использует UCUM (не собственные)',
        'В РФ используется ограниченно — доминирует МКБ-10 + локальные справочники',
      ],
      related: [
        { id: 'snomed', title: 'SNOMED CT' },
        { id: 'ucum', title: 'UCUM (единицы)' },
        { id: 'umls', title: 'UMLS метатезаурус' },
      ],
      relatedCourses: [
        { id: '304.1', title: 'Диагностика и кодирование' },
        { id: '303.1', title: 'Лабораторная диагностика' },
      ],
    };
  },
  info: `### Для чего используется
**LOINC** (Logical Observation Identifiers Names and Codes) — универсальные идентификаторы для лабораторных тестов, витальных показателей, клинических документов. Разработаны Regenstrief Institute (США) с 1994 г., бесплатны.

### 6 осей LOINC концепта
\`\`\`
Component : Property : Time : System : Scale : Method
Glucose   : MCnc     : Pt   : Ser    : Qn    : —
= "718-7" (glucose concentration, random, in serum/plasma, quantitative)
\`\`\`

### Ось | Описание
- **Component** — что измеряется (Glucose, Hemoglobin)
- **Property** — характеристика (MCnc mass conc., SCnc substance conc., Titr, ACnc)
- **Time** — момент (Pt point in time, 24H)
- **System** — образец (Ser/Plas, Bld, Urine, CSF)
- **Scale** — шкала (Qn quantitative, Ord ordinal, Nom nominal, Narr narrative)
- **Method** — метод (Automated count, ELISA, HPLC) — опционально

### Домены LOINC (~100,000 концептов)
- Laboratory (70%)
- Clinical documents (~2,000, Document Ontology)
- Vital signs (~100)
- Surveys / assessments (PHQ-9, GAD-7, Glasgow и др. — каждый вопрос имеет LOINC!)
- Imaging (HL7 order codes)
- Claims attachments

### Ключевые инструменты
- **LOINC Search** — онлайн (https://loinc.org/search/)
- **RELMA** — desktop (маппинг локальных → LOINC)
- **LOINC API** — FHIR TerminologyOperations`,
};
export default runner;
