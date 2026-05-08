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
    const map: Record<string, { details: string; actions: string[]; caveats: string[] }> = {
      antibiotic: {
        details: 'Эмпирическая АБ-терапия по всем нозологиям: community-acquired pneumonia, UTI, cellulitis, sepsis, neutropenic fever. Национальная AMR strategy. Doses + duration + alternatives (penicillin allergy). Ключевой ресурс для австралийских GP и госпиталей.',
        actions: [
          'eTG Antibiotic: https://tgldcdp.tg.org.au/etgAccess',
          'AURA (Antimicrobial Use and Resistance in Australia): https://www.safetyandquality.gov.au/our-work/antimicrobial-resistance/aura-project',
          'NPS MedicineWise AMR: https://www.nps.org.au/',
          'PBS Antibiotic Streamlined Authority codes: https://www.pbs.gov.au/',
        ],
        caveats: [
          'Penicillin allergy delabeling — алгоритм в eTG (большинство "аллергий" ложные)',
          'MRSA — эндемичен в Northern Territory / Aboriginal communities',
          'Melioidosis (B. pseudomallei) — тропический север, ceftazidime + TMP-SMX',
          'Gonorrhoea — ceftriaxone + azithromycin (AMR prevalence)',
        ],
      },
      cardiovascular: {
        details: 'Hypertension, heart failure, ACS, AF, dyslipidaemia, VTE prevention. Australian adaptation of international guidelines (ESC/ACC) with local medicines availability + PBS listings.',
        actions: [
          'eTG Cardiovascular: https://www.tg.org.au/',
          'National Heart Foundation of Australia: https://www.heartfoundation.org.au/',
          'CSANZ (Cardiac Society of Australia and NZ): https://www.csanz.edu.au/',
          'Australian Stroke Foundation: https://strokefoundation.org.au/',
        ],
        caveats: [
          'PBS Authority required для PCSK9i, SGLT2i в некоторых indications',
          'Absolute CV risk calculator (NVDPA) используется для primary prevention',
          'Rheumatic heart disease — Aboriginal / Torres Strait Islander — особый акцент',
          'DOAC в PBS все 4 — но apixaban / rivaroxaban доминируют',
        ],
      },
      respiratory: {
        details: 'Asthma (+ Australian Asthma Handbook link), COPD (COPD-X — lung foundation), bronchiectasis, OSA, pulmonary hypertension.',
        actions: [
          'Australian Asthma Handbook: https://www.asthmahandbook.org.au/',
          'COPD-X guideline: https://copdx.org.au/',
          'Lung Foundation Australia: https://lungfoundation.com.au/',
          'TSANZ (Thoracic Society ANZ): https://www.thoracic.org.au/',
        ],
        caveats: [
          'GINA адаптация: SABA-only больше не рекомендован (ICS-formoterol как reliever)',
          'Bronchiectasis — высокая prevalence у Aboriginal детей',
          'Spirometry — PBS требует для ингаляторов COPD > 6 мес',
          'ILD MDT — crizotinib / nintedanib / pirfenidone through PBS',
        ],
      },
      endocrinology: {
        details: 'T1DM/T2DM (+ ADS — Australian Diabetes Society + ADEA для образования), thyroid, adrenal, osteoporosis (+ HEM), PCOS.',
        actions: [
          'ADS (Australian Diabetes Society): https://www.diabetessociety.com.au/',
          'RACGP Diabetes Handbook (живая версия): https://www.racgp.org.au/',
          'Healthy Bones Australia: https://healthybonesaustralia.org.au/',
          'Monash International PCOS Guideline: https://www.monash.edu/medicine/mchri/pcos',
        ],
        caveats: [
          'NDSS (National Diabetes Services Scheme) — subsidised test strips, CGM (T1DM < 21 w Dexcom G6)',
          'Semaglutide / dulaglutide в PBS с restrictions',
          'DEXA — Medicare покрытие при T-score или риск-факторах',
          'Gestational DM — IADPSG criteria приняты RANZCOG',
        ],
      },
      gastrointestinal: {
        details: 'H. pylori, GORD, IBD (+ ECCO adaptations), IBS, hepatitis B/C (+ ASHM), pancreatitis.',
        actions: [
          'ASHM (viral hepatitis): https://ashm.org.au/',
          'GESA (Gastroenterological Society Australia): https://www.gesa.org.au/',
          'Cancer Council Bowel Screening: https://www.cancer.org.au/',
          'Crohn\'s & Colitis Australia: https://crohnsandcolitis.org.au/',
        ],
        caveats: [
          'National Bowel Cancer Screening — 50–74 лет каждые 2 года (iFOBT)',
          'HCV — DAAs через PBS, prescribing не ограничен специалистом с 2016',
          'H. pylori — quadruple therapy первая линия (из-за clarithromycin resistance)',
          'Biologics IBD — PBS Authority; TB screen обязателен перед TNFi',
        ],
      },
      neurology: {
        details: 'Epilepsy, stroke (+ Stroke Foundation guidelines), headache, MS, Parkinson\'s.',
        actions: [
          'Stroke Foundation Clinical Guidelines: https://informme.org.au/guidelines',
          'Epilepsy Action Australia: https://www.epilepsy.org.au/',
          'MS Australia: https://www.msaustralia.org.au/',
          'ANZAN (Australian & NZ Association of Neurologists): https://anzan.org.au/',
        ],
        caveats: [
          'Thrombectomy — в Stroke Foundation 2022 расширено до 24ч с perfusion imaging',
          'Licence restrictions при seizures — Austroads Assessing Fitness to Drive',
          'MS DMT — PBS Authority, MSBase registry',
          'CGRP-mAbs для migraine в PBS с restrictions',
        ],
      },
      palliative: {
        details: 'Symptom management end of life, opioid conversion, sedation, communication — один из лучших в мире, используется международно.',
        actions: [
          'eTG Palliative Care: https://www.tg.org.au/',
          'CareSearch: https://www.caresearch.com.au/',
          'Palliative Care Australia: https://palliativecare.org.au/',
          'Voluntary Assisted Dying (VAD) — state-specific legislation (VIC, WA, TAS, QLD, SA, NSW)',
        ],
        caveats: [
          'S8 prescribing (opioids) — state regulations для continuing treatment',
          'Opioid conversion ratios — eTG standard (используется международно)',
          'VAD — отдельная регистрация, нельзя инициировать обсуждение (кроме SA, QLD)',
          'Advance Care Directives — forms varies by state',
        ],
      },
      psychotropic: {
        details: 'Depression, anxiety, psychosis, ADHD, substance use disorders. Интегрирован с RANZCP guidelines.',
        actions: [
          'RANZCP Clinical Practice Guidelines: https://www.ranzcp.org/',
          'Beyond Blue: https://www.beyondblue.org.au/',
          'Headspace (youth): https://headspace.org.au/',
          'Better Access Initiative (Medicare) — 10 sessions/год',
        ],
        caveats: [
          'Authority prescribing для stimulants (ADHD) — state-specific',
          'Clozapine — обязательный FBC monitoring (CPMS / ClopineCentral)',
          'Mental Health Treatment Plan — Medicare rebate для GP + psychologist',
          'Methadone / buprenorphine — state permit (PRP / Dosepoint)',
        ],
      },
      dermatology: {
        details: 'Eczema, psoriasis, acne, skin cancer (high burden in Australia — highest melanoma rates globally), infections.',
        actions: [
          'Australasian College of Dermatologists: https://www.dermcoll.edu.au/',
          'Cancer Council skin cancer resources: https://www.cancer.org.au/cancer-information/types-of-cancer/skin-cancer',
          'SunSmart: https://www.sunsmart.com.au/',
          'Skin Cancer College Australasia: https://www.skincancercollege.org/',
        ],
        caveats: [
          'Melanoma — Australia самый высокий уровень в мире',
          'Biologics (psoriasis) — PBS Authority после failure ≥ 2 systemic',
          'Isotretinoin — iPLEDGE-подобная не применяется в Aus, но pregnancy prevention обязательна',
          'MBS items для dermoscopy, cryotherapy, excision',
        ],
      },
      oral: {
        details: 'Dental abscess, periodontitis, prescribing for dental practitioners. Уникальный том — не все международные системы имеют.',
        actions: [
          'Australian Dental Association: https://www.ada.org.au/',
          'eTG Oral and Dental: https://www.tg.org.au/',
          'Dental Board of Australia: https://www.dentalboard.gov.au/',
          'Child Dental Benefits Schedule (Medicare): https://www.servicesaustralia.gov.au/',
        ],
        caveats: [
          'Prophylactic AB для endocarditis — только high-risk cardiac (ADA 2014)',
          'Amoxicillin 2g single dose — стандартная prophylaxis',
          'Fluoridation — национально, но ограничено в некоторых regional areas',
          'MRONJ — bisphosphonate / denosumab history обязателен',
        ],
      },
    };
    const e = map[s]!;
    return {
      value: 'eTG Complete',
      unit: 'Australia',
      color: '#6B7280',
      interpretation: `Navigate: eTG — ${s}`,
      details: `Том eTG: ${s}\n\nСодержание: ${e.details}\n\nФормат eTG: полностью электронный (eTG Complete — web + mobile app); пересмотр каждые 2-3 года (rolling). Каждая топик-страница: эпидемиология → диагностика → препараты (с дозами + длительностью + альтернативами) → monitoring → когда направить. Ссылки на PBS (Pharmaceutical Benefits Scheme — австралийская субсидированная схема лекарств).\n\nДоступ: подписка (институциональная — большинство госпиталей и университетов; персональная). Ссылки на PBS, ARTG (Australian Register of Therapeutic Goods via TGA).`,
      actions: [
        ...e.actions,
        '— Общие источники —',
        'eTG portal: https://www.tg.org.au/',
        'TGA: https://www.tga.gov.au/',
        'PBS: https://www.pbs.gov.au/',
        'RACGP: https://www.racgp.org.au/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Австралии —',
        'eTG — по подписке (большинство госпиталей/универов покрывают)',
        'PBS listing — всегда проверять (subsidised vs private script)',
        'Aboriginal and Torres Strait Islander health — CARPA Standard Treatment Manual для remote',
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
