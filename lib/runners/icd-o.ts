// @ts-nocheck
/** Runner: icd-o — ICD-O-3 Oncology */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO/IARC) · онкологические регистры',
  reference: 'Fritz A, Percy C, Jack A, Shanmugaratnam K, Sobin L, Parkin DM, Whelan S (eds). International Classification of Diseases for Oncology, 3rd ed., 2nd revision. Geneva: WHO; 2013 (updates 2019, 2024).',
  inputs: [
    {
      id: 'tumor',
      label: 'Тип опухоли',
      type: 'select',
      options: [
        { value: 'breast-ductal', label: 'Молочная железа — инвазивная протоковая карцинома' },
        { value: 'lung-nsclc-adeno', label: 'Лёгкое — аденокарцинома' },
        { value: 'colon-adeno', label: 'Толстая кишка — аденокарцинома' },
        { value: 'prostate', label: 'Простата — аденокарцинома' },
        { value: 'skin-melanoma', label: 'Кожа — меланома' },
        { value: 'cervix-squamous', label: 'Шейка матки — плоскокл. карцинома' },
        { value: 'cml', label: 'Хр. миелоидный лейкоз (ХМЛ)' },
        { value: 'dlbcl', label: 'Диффузная B-крупноклеточная лимфома' },
        { value: 'glioblastoma', label: 'Глиобластома' },
        { value: 'cis-breast', label: 'Молочная железа — DCIS (in situ)' },
      ],
    },
  ],
  presets: [
    { label: 'РМЖ инвазивный', values: { tumor: 'breast-ductal' } },
    { label: 'DCIS (in situ)', values: { tumor: 'cis-breast' } },
    { label: 'Меланома', values: { tumor: 'skin-melanoma' } },
  ],
  compute: (v) => {
    const t = String(v.tumor || 'breast-ductal');
    const map: Record<string, { topo: string; morph: string; behavior: string; grade: string; name: string }> = {
      'breast-ductal': { topo: 'C50.9 Breast, NOS', morph: '8500', behavior: '/3 (malignant, primary)', grade: '2 (Moderately differentiated)', name: 'Invasive ductal carcinoma, NOS of breast' },
      'lung-nsclc-adeno': { topo: 'C34.9 Lung, NOS', morph: '8140', behavior: '/3', grade: '2', name: 'Adenocarcinoma of lung' },
      'colon-adeno': { topo: 'C18.9 Colon, NOS', morph: '8140', behavior: '/3', grade: '2', name: 'Adenocarcinoma of colon' },
      prostate: { topo: 'C61.9 Prostate gland', morph: '8140', behavior: '/3', grade: 'Gleason-based (grade group 1-5)', name: 'Adenocarcinoma of prostate' },
      'skin-melanoma': { topo: 'C44.9 Skin, NOS', morph: '8720', behavior: '/3', grade: 'N/A (Breslow + Clark)', name: 'Malignant melanoma, NOS' },
      'cervix-squamous': { topo: 'C53.9 Cervix uteri', morph: '8070', behavior: '/3', grade: '2-3', name: 'Squamous cell carcinoma of cervix' },
      cml: { topo: 'C42.1 Bone marrow', morph: '9875', behavior: '/3', grade: 'N/A', name: 'Chronic myeloid leukemia, BCR-ABL1-positive' },
      dlbcl: { topo: 'C77.9 Lymph node, NOS', morph: '9680', behavior: '/3', grade: 'N/A (высокая степень)', name: 'Diffuse large B-cell lymphoma, NOS' },
      glioblastoma: { topo: 'C71.9 Brain, NOS', morph: '9440', behavior: '/3', grade: '4 (WHO CNS grade)', name: 'Glioblastoma, IDH-wildtype' },
      'cis-breast': { topo: 'C50.9 Breast, NOS', morph: '8500', behavior: '/2 (in situ)', grade: 'Nuclear grade 1-3', name: 'Ductal carcinoma in situ (DCIS)' },
    };
    const e = map[t];
    const fullCode = `${e.topo.split(' ')[0]} / ${e.morph}${e.behavior.split(' ')[0]}`;
    return {
      value: fullCode,
      unit: 'ICD-O-3',
      color: '#6B7280',
      interpretation: `ICD-O-3: ${e.name}`,
      details: `Полный код ICD-O-3: ${fullCode}\n\nTopography (локализация, C-код): ${e.topo}\nMorphology (гистология, M-код): M-${e.morph}\nBehavior code: ${e.behavior}\nGrade: ${e.grade}\n\nNosology: ${e.name}\n\nICD-O-3 использует двойную ось: топография (где опухоль, C-коды как в ICD-10 глава II) + морфология (гистологический тип, 4-значный код + behavior + grade).`,
      actions: [
        'IARC ICD-O-3.2: https://www.iacr.com.fr/index.php?option=com_content&view=category&id=100&layout=blog&Itemid=577',
        'WHO Classification of Tumours (Blue Books) — 5th ed (2019-2024) — интегрированы новые коды',
        'SEER*Rx + SEER Training — руководство для регистраторов (NCI)',
        'Для рутинного кодирования РФ — использовать также МКБ-10 глава II (C00-C97, D00-D48)',
        'Grade code (1-й символ после /behavior) — обязательно для некоторых опухолей',
      ],
      caveats: [
        'ICD-O-3.2 (2019) — текущая редакция, поправки 2024 для WHO Blue Books 5th',
        'Behavior codes: /0 benign · /1 uncertain · /2 carcinoma in situ · /3 malignant (primary) · /6 malignant (metastatic) · /9 malignant (uncertain if primary/metastatic)',
        'Morphology коды — 4-значные (8000-9992), соответствуют SNOMED Morphology',
        'В ICD-10 новообразование = C/D-код только (без morphology) — поэтому ICD-O обязателен для регистров',
        'В ICD-11 часть ICD-O интегрирована в extension codes (XH-коды)',
        'Для редких опухолей — RARECARE / RARECARENet (EU)',
      ],
      related: [
        { id: 'icd10', title: 'ICD-10 глава II' },
        { id: 'icd11', title: 'ICD-11 (integrated morphology)' },
        { id: 'snomed', title: 'SNOMED CT Morphology' },
        { id: 'tnm', title: 'TNM staging' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Онкология — основы' },
        { id: '303.2', title: 'Морфологическая диагностика' },
      ],
    };
  },
  info: `### Для чего используется
**ICD-O-3** (International Classification of Diseases for Oncology, 3rd edition) — обязательный стандарт для раковых регистров всего мира. Разработан WHO / IARC, последняя редакция ICD-O-3.2 (2019) + поправки 2024.

### Двойная ось кодирования
\`\`\`
Topography       Morphology/Behavior/Grade
C50.9            8500/3 2
(Breast, NOS)    (Invasive ductal, malignant primary, moderately diff.)
\`\`\`

### Компоненты кода
| Часть | Описание | Формат |
|---|---|---|
| Topography | Где (из ICD-10 глава II) | C00.0–C80.9 |
| Morphology | Гистология | 4 цифры (8000-9992) |
| Behavior | Поведение | /0 benign, /1 uncertain, /2 in situ, /3 malignant primary, /6 metastatic |
| Grade | Дифференцировка | 1 well, 2 moderate, 3 poor, 4 undifferentiated, 9 unknown; или T/B/Null-cell для лимфом |

### Behavior codes (критично для регистров)
| Code | Смысл |
|---|---|
| /0 | Benign neoplasm |
| /1 | Uncertain malignancy |
| /2 | Carcinoma in situ / non-invasive |
| /3 | Malignant, primary |
| /6 | Malignant, metastatic / secondary |
| /9 | Malignant, uncertain if primary or metastatic |

### Интеграция с WHO Blue Books
WHO Classification of Tumours (5-е издание, 2019-2024) — 10 томов по локализациям:
- Digestive · Urinary/Male Genital · Breast · Female Genital · Skin · Endocrine · Soft Tissue/Bone · Head and Neck · CNS · Hematolymphoid

Каждый том содержит обновлённые ICD-O-3 коды + молекулярные критерии (IDH-mutant, BCR-ABL1, EGFR и т.д.).`,
};
export default runner;
