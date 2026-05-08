/** Runner: icd10-pcs — ICD-10-PCS (Procedure Coding System, USA) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (CMS) · стационарное кодирование процедур',
  reference: 'Centers for Medicare & Medicaid Services (CMS). ICD-10-PCS Official Guidelines for Coding and Reporting, FY2025.',
  inputs: [
    {
      id: 'section',
      label: 'Раздел (1-й символ)',
      type: 'select',
      options: [
        { value: '0', label: '0 Медицинские и хирургические' },
        { value: '1', label: '1 Акушерство' },
        { value: '2', label: '2 Placement' },
        { value: '3', label: '3 Administration' },
        { value: '4', label: '4 Measurement & Monitoring' },
        { value: '5', label: '5 Extracorporeal Assistance' },
        { value: '6', label: '6 Extracorporeal Therapies' },
        { value: '7', label: '7 Osteopathic' },
        { value: '8', label: '8 Other Procedures' },
        { value: '9', label: '9 Chiropractic' },
        { value: 'B', label: 'B Imaging' },
        { value: 'C', label: 'C Nuclear Medicine' },
        { value: 'D', label: 'D Radiation Therapy' },
        { value: 'F', label: 'F Physical Rehab' },
        { value: 'G', label: 'G Mental Health' },
        { value: 'H', label: 'H Substance Abuse Treatment' },
        { value: 'X', label: 'X New Technology' },
      ],
    },
  ],
  presets: [
    { label: 'Хирургия', values: { section: '0' } },
    { label: 'Визуализация', values: { section: 'B' } },
    { label: 'Лучевая терапия', values: { section: 'D' } },
  ],
  compute: (v) => {
    const s = String(v.section || '0');
    const map: Record<string, { name: string; example: string; breakdown: string }> = {
      '0': {
        name: 'Медицинские и хирургические (самый большой раздел)',
        example: '0DTJ4ZZ — лапароскопическая аппендэктомия',
        breakdown: '0=Med/Surg · D=Gastrointestinal · T=Resection · J=Appendix · 4=Percutaneous Endoscopic · Z=No Device · Z=No Qualifier',
      },
      '1': {
        name: 'Акушерство',
        example: '10D00Z1 — кесарево сечение (Extraction Products of Conception, Classical)',
        breakdown: '1=Obstetrics · 0=Pregnancy · D=Extraction · 0=Products of Conception · 0=Open · Z=No Device · 1=Classical',
      },
      '2': { name: 'Placement', example: '2W3ABX0 — Casting Traction Apparatus on Right Upper Extremity', breakdown: '2=Placement · W=Anatomical Regions · 3=Immobilization · A=Right Upper Ext · B=Casting · X=External · 0=Traction' },
      '3': { name: 'Administration (введение в-в)', example: '3E033VJ — Introduction Insulin, Peripheral Vein', breakdown: '3=Administration · E=Physio Systems · 0=Introduction · 3=Periph Vein · 3=Percutaneous · V=Hormone · J=Insulin' },
      '4': { name: 'Measurement & Monitoring', example: '4A023N6 — Измерение pulmonary cardiac output', breakdown: '4=M&M · A=Physio · 0=Measurement · 2=Cardiac · 3=Percutaneous · N=Sampling · 6=Pulmonary' },
      '5': { name: 'Extracorporeal Assistance', example: '5A09357 — Continuous ventilation 24-96 hrs', breakdown: '5=Extracorp Assist · A=Physio · 0=Assistance · 9=Respiratory · 3=>24 hrs · 5=Ventilation · 7=CPAP' },
      '6': { name: 'Extracorporeal Therapies', example: '6A550Z2 — Ультрафильтрация крови', breakdown: '6=Extracorp Therap · A=Physio · 5=Pheresis · 5=Circulatory · 0=Single · Z=No Qualifier' },
      '7': { name: 'Osteopathic', example: '7W07X4Z — Articulatory Osteo treatment of Lower Extremities', breakdown: '7=Osteo · W=Anat · 0=Treatment · 7=Lower Ext · X=External · 4=Articulatory · Z=None' },
      '8': { name: 'Other Procedures', example: '8E0ZXY4 — Yoga therapy', breakdown: '8=Other · E=Regions · 0=Other · Z=None · X=External · Y=Other · 4=Yoga' },
      '9': { name: 'Chiropractic', example: '9WB3XGZ — Chiropractic manipulation Lumbar, Long Lever', breakdown: '9=Chiropractic · W=Anat · B=Manip · 3=Lumbar · X=External · G=Long Lever · Z=None' },
      'B': { name: 'Imaging', example: 'B241YZZ — CT Heart with Contrast', breakdown: 'B=Imaging · 2=Heart · 4=Computerized Tomography · 1=LowOsmolar Contrast · Y=Other Contrast · Z=None · Z=None' },
      'C': { name: 'Nuclear Medicine', example: 'CW1BLZZ — Radionuclide Imaging Abdomen/Pelvis Indium 111', breakdown: 'C=Nuc Med · W=Anat regions · 1=Planar Imaging · B=Abd/Pelv · L=Indium 111 · Z=None · Z=None' },
      'D': { name: 'Radiation Therapy', example: 'DB02DZZ — Stereotactic Radiosurgery Lung', breakdown: 'D=Rad Ther · B=Respiratory · 0=Beam Radiation · 2=Lung · D=Stereotactic · Z=None · Z=None' },
      'F': { name: 'Physical Rehabilitation', example: 'F07Z9ZZ — Gait Training Treatment', breakdown: 'F=Phys Rehab · 0=Rehab · 7=Motor Treatment · Z=None · 9=Gait Training · Z=None · Z=None' },
      'G': { name: 'Mental Health', example: 'GZ56ZZZ — Individual Cognitive-Behavioral Psychotherapy', breakdown: 'G=Mental · Z=None · 5=Individual Psychotherapy · 6=Cognitive-Behavioral · Z=None · Z=None · Z=None' },
      'H': { name: 'Substance Abuse Treatment', example: 'HZ2ZZZZ — Alcohol Detoxification', breakdown: 'H=SUD · Z=None · 2=Detoxification · Z=None · Z=None · Z=None · Z=None' },
      'X': { name: 'New Technology', example: 'XW033A6 — Introduction Nafamostat Anticoagulant, Periph Vein', breakdown: 'X=New Tech · W=Anat · 0=Introduction · 3=Periph Vein · 3=Percutaneous · A6=Nafamostat' },
    };
    const e = map[s]!;
    return {
      value: e.example.split(' — ')[0] ?? '',
      unit: 'ICD-10-PCS',
      color: '#6B7280',
      interpretation: `ICD-10-PCS раздел ${s}: ${e.name}`,
      details: `Раздел: ${s} — ${e.name}\n\nПример кода: ${e.example}\n\nРазбор 7 символов: ${e.breakdown}\n\nICD-10-PCS — система кодирования ПРОЦЕДУР для стационаров США (разработана 3M для CMS). Все коды — строго 7 символов (буквы + цифры).`,
      actions: [
        'CMS ICD-10-PCS: https://www.cms.gov/medicare/icd-10/2025-icd-10-pcs',
        'Использовать official guidelines FY2025 + coding conventions',
        'Root operations (3-й символ) — 31 категория: Excision, Resection, Replacement, Bypass, Dilation, Drainage и т.д.',
        'Amb. procedures — не ICD-10-PCS, а CPT (AMA) / HCPCS',
        '7 символов обязательно — использовать "Z" placeholder если нет значения',
      ],
      caveats: [
        'ICD-10-PCS применяется только в США для STATIONARY (inpatient) процедур',
        'Амбулаторные процедуры США — CPT (AMA) / HCPCS (CMS) — другая система',
        'В РФ нет аналога ICD-10-PCS — используется "Номенклатура медицинских услуг" (МЗ РФ)',
        'Каждый символ выбирается из таблицы — кодирование "multi-axial" (не иерархическое)',
        '31 Root operation (3-й символ) — ключевая концепция (Excision = часть органа, Resection = целый орган)',
        'Обновление ежегодно 1 октября (FY)',
      ],
      related: [
        { id: 'icd10cm', title: 'ICD-10-CM (диагнозы)' },
        { id: 'icd11', title: 'ICD-11 (с procedure extension)' },
        { id: 'snomed', title: 'SNOMED CT procedure hierarchy' },
      ],
      relatedCourses: [
        { id: '304.1', title: 'Диагностика и кодирование' },
        { id: '307.1', title: 'Хирургия — основы' },
      ],
    };
  },
  info: `### Для чего используется
**ICD-10-PCS** (Procedure Coding System) — американская система кодирования стационарных медицинских процедур, разработанная 3M для CMS. Обязательна в США с 01.10.2015 для inpatient billing.

### 7-символьная структура (пример 0DTJ4ZZ)
\`\`\`
0 D T J 4 Z Z
│ │ │ │ │ │ │
│ │ │ │ │ │ └─ Qualifier
│ │ │ │ │ └─── Device
│ │ │ │ └───── Approach (0=Open, 3=Percutaneous, 4=Percutaneous Endo, 7=Via Orifice, 8=Endo, X=External)
│ │ │ └─────── Body Part
│ │ └───────── Root Operation (31 вариант)
│ └─────────── Body System
└───────────── Section
\`\`\`

### 31 Root Operation (3-й символ) — ключевая таксономия
**Taking out/Fixing:** Excision (часть), Resection (целое), Extirpation (камень), Fragmentation, Extraction

**Putting in/Moving:** Bypass, Dilation, Occlusion, Restriction, Release

**Altering diameter/route:** Transplantation, Reattachment, Transfer

**Always devices:** Insertion, Replacement, Supplement, Change, Removal, Revision

**Other:** Inspection, Map, Fusion, Alteration, Creation, Destruction, Detachment, Control, Repair, Reposition, Drainage, Division

### 17 разделов (1-й символ)
0 Med/Surg · 1 OB · 2 Placement · 3 Admin · 4 M&M · 5 Extracorp Assist · 6 Extracorp Therap · 7 Osteo · 8 Other · 9 Chiro · B Imaging · C Nuc Med · D Rad Therapy · F Rehab · G Mental · H SUD · X New Tech`,
};
export default runner;
