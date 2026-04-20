// @ts-nocheck
/** Runner: etg — Therapeutic Guidelines Australia (eTG) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Австралия (также Новая Зеландия — частично; референс в Фиджи, PNG, Pacific)',
  reference: 'Therapeutic Guidelines Limited — независимая некоммерческая организация. Публикует eTG Complete (электронный) + Antibiotic / Cardiovascular / Respiratory / Endocrinology / Palliative Care / Oral and Dental / Psychotropic и др. отдельные тома. https://www.tg.org.au/',
  inputs: [
    {
      id: 'specialty',
      label: 'Домен / том eTG',
      type: 'select',
      options: [
        { value: 'antibiotic', label: 'Antibiotic (эмпирическая антимикробная терапия)' },
        { value: 'cardiovascular', label: 'Cardiovascular' },
        { value: 'respiratory', label: 'Respiratory' },
        { value: 'endocrinology', label: 'Endocrinology' },
        { value: 'gastrointestinal', label: 'Gastrointestinal' },
        { value: 'neurology', label: 'Neurology' },
        { value: 'palliative', label: 'Palliative Care' },
        { value: 'psychotropic', label: 'Psychotropic' },
        { value: 'dermatology', label: 'Dermatology' },
        { value: 'oral', label: 'Oral and Dental' },
      ],
    },
  ],
  presets: [
    { label: 'Antibiotic', values: { specialty: 'antibiotic' } },
    { label: 'Cardiovascular', values: { specialty: 'cardiovascular' } },
    { label: 'Respiratory', values: { specialty: 'respiratory' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'antibiotic');
    const examples: Record<string, string> = {
      antibiotic: 'Эмпирическая АБ-терапия по всем нозологиям: community-acquired pneumonia, UTI, cellulitis, sepsis, neutropenic fever. Национальная AMR strategy. Doses + duration + alternatives (penicillin allergy). Ключевой ресурс для австралийских GP и госпиталей.',
      cardiovascular: 'Hypertension, heart failure, ACS, AF, dyslipidaemia, VTE prevention. Australian adaptation of international guidelines (ESC/ACC) with local medicines availability + PBS listings.',
      respiratory: 'Asthma (+ Australian Asthma Handbook link), COPD (COPD-X — lung foundation), bronchiectasis, OSA, pulmonary hypertension.',
      endocrinology: 'T1DM/T2DM (+ ADS — Australian Diabetes Society + ADEA для образования), thyroid, adrenal, osteoporosis (+ HEM), PCOS.',
      gastrointestinal: 'H. pylori, GORD, IBD (+ ECCO adaptations), IBS, hepatitis B/C (+ ASHM), pancreatitis.',
      neurology: 'Epilepsy, stroke (+ Stroke Foundation guidelines), headache, MS, Parkinson\'s.',
      palliative: 'Symptom management end of life, opioid conversion, sedation, communication — один из лучших в мире, используется международно.',
      psychotropic: 'Depression, anxiety, psychosis, ADHD, substance use disorders. Интегрирован с RANZCP guidelines.',
      dermatology: 'Eczema, psoriasis, acne, skin cancer (high burden in Australia — highest melanoma rates globally), infections.',
      oral: 'Dental abscess, periodontitis, prescribing for dental practitioners. Уникальный том — не все международные системы имеют.',
    };
    return {
      value: 'eTG Complete',
      unit: 'Australia',
      color: '#6B7280',
      interpretation: `Navigate: eTG — ${s}`,
      details: `**Том eTG:** ${s}\n\n**Содержание:** ${examples[s]}\n\n**Формат eTG:** полностью электронный (eTG Complete — web + mobile app); пересмотр каждые 2-3 года (rolling). Каждая топик-страница: эпидемиология → диагностика → препараты (с дозами + длительностью + альтернативами) → monitoring → когда направить. Ссылки на PBS (Pharmaceutical Benefits Scheme — австралийская субсидированная схема лекарств).\n\n**Доступ:** подписка (институциональная — большинство госпиталей и университетов; персональная). Ссылки на PBS, ARTG (Australian Register of Therapeutic Goods via TGA).`,
      actions: [
        'eTG portal: https://www.tg.org.au/',
        'eTG Complete (subscription) — web + iOS + Android app',
        'TGA (Therapeutic Goods Administration — регулятор): https://www.tga.gov.au/',
        'PBS (Pharmaceutical Benefits Scheme): https://www.pbs.gov.au/',
        'Australian Asthma Handbook: https://www.asthmahandbook.org.au/',
        'COPD-X: https://copdx.org.au/',
        'Stroke Foundation: https://strokefoundation.org.au/',
        'RACGP (GP College) — дополнительные GP-specific resources',
      ],
      caveats: [
        'eTG по подписке (не полностью бесплатный) — отличие от NICE/HAS',
        'Стандарт для Австралии; широко используется в Новой Зеландии (но есть собственный BPAC NZ)',
        'PBS listing — критично проверять для назначения (subsidized vs private script)',
        'TGA regulates лекарства (регистрация, отзывы) — отдельно от PBS',
        'Adaptation к локальной эпидемиологии: высокая распространённость skin cancer, MRSA (particularly в северных общинах), endemic melioidosis (тропический север)',
        'Aboriginal and Torres Strait Islander health — отдельные рекомендации и приоритеты (CARPA Standard Treatment Manual для remote)',
      ],
      related: [
        { id: 'nice-uk', title: 'NICE (UK)' },
        { id: 'asean', title: 'ASEAN guidelines' },
        { id: 'jcs', title: 'JCS (Japan)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '308.1', title: 'Инфекционные болезни' },
      ],
    };
  },
  info: `### Для чего используется
**eTG (Therapeutic Guidelines)** — наиболее используемый ресурс назначений в Австралии. Независимая некоммерческая организация (Therapeutic Guidelines Limited), издаёт серию томов + полный электронный продукт eTG Complete.

### Тома
Antibiotic · Cardiovascular · Respiratory · Endocrinology · Gastrointestinal · Neurology · Palliative Care · Psychotropic · Dermatology · Oral and Dental · Diabetes · Rheumatology · Addiction · Pain · Wounds и др.

### Формат
- Web + iOS + Android (eTG Complete)
- Краткий, ориентированный на назначение: диагностика + препараты + дозы + длительность + альтернативы
- Rolling updates (2-3 года каждый том)

### Связи
- **TGA** — регистрация лекарств
- **PBS** — государственная субсидия (критично проверять перед назначением)
- **RACGP** — GP колледж, профсоюзные ресурсы
- **Aboriginal health**: CARPA Standard Treatment Manual (remote communities)

### Австралийская специфика
- Highest melanoma rates globally
- MRSA в северных общинах
- Тропический север — melioidosis, tropical infections
- Aboriginal and Torres Strait Islander health — отдельный приоритет

### Источники
- https://www.tg.org.au/
- https://www.tga.gov.au/
- https://www.pbs.gov.au/`,
};
export default runner;
