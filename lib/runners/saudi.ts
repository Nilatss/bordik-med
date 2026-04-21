// @ts-nocheck
/** Runner: saudi — Saudi Arabia MoH + SCFHS */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Саудовская Аравия (также референс в ряде стран GCC — ОАЭ, Кувейт, Бахрейн, Оман, Катар)',
  reference: 'Saudi Ministry of Health (MoH) + SCFHS — Saudi Commission for Health Specialties + Saudi FDA + специализированные общества (Saudi Heart Association — SHA, Saudi Diabetes Society — SDES). https://www.moh.gov.sa, https://www.scfhs.org.sa',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность / домен',
      type: 'select',
      options: [
        { value: 'primary', label: 'Primary care (PHC — Seha / MOH PHC manuals)' },
        { value: 'cardio', label: 'Cardiology (SHA — Saudi Heart Association)' },
        { value: 'diabetes', label: 'Diabetes / endocrinology (SDES)' },
        { value: 'onko', label: 'Oncology (SOS — Saudi Oncology Society)' },
        { value: 'maternal', label: 'Maternal / child health (SSOG, SPS)' },
        { value: 'hajj', label: 'Hajj / mass gatherings health' },
        { value: 'scfhs', label: 'SCFHS — Saudi Commission (certification, CPD, guidelines)' },
        { value: 'drugs', label: 'Лекарства (Saudi FDA — SFDA)' },
      ],
    },
  ],
  presets: [
    { label: 'Primary care (MoH)', values: { specialty: 'primary' } },
    { label: 'SCFHS — сертификация', values: { specialty: 'scfhs' } },
    { label: 'Hajj health', values: { specialty: 'hajj' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'primary');
    const map: Record<string, { name: string; body: string; details: string; actions: string[]; caveats: string[] }> = {
      primary: {
        name: 'Primary care',
        body: 'MoH Saudi — PHC (Primary Health Care) centres + Seha Virtual Hospital + Vision 2030 health transformation',
        details: 'MoH публикует PHC Clinical Guidelines — стандартизированные протоколы для family medicine. Vision 2030 Health Sector Transformation: переход от MoH-центричной к model based on Health Holding Companies (HHCs) + sectors / clusters. National Program for Healthy Living.',
        actions: [
          'Saudi MoH PHC: https://www.moh.gov.sa/en/Ministry/Projects/Project-of-rehabilitating-and-developing-primary-health-centers/',
          'Seha Virtual Hospital: https://www.moh.gov.sa/en/eServices/SehaVirtual',
          'Saudi MoH family medicine CPGs: https://www.moh.gov.sa/',
          'Sehhaty app (patient): https://sehhaty.sa/',
        ],
        caveats: [
          'Vision 2030 — Health Sector Transformation → HHCs + CCHI',
          'Saudi Board Family Medicine через SCFHS — 4 года residency',
          'Seha Virtual Hospital — teleconsultation расширяется',
          'PHC digital integration — Wasfaty (e-prescription) + Sehhaty',
        ],
      },
      cardio: {
        name: 'Cardiology',
        body: 'SHA — Saudi Heart Association',
        details: 'SHA consensus — локальная адаптация ESC/ACC guidelines с учётом саудовских особенностей: ранний дебют ИБС, высокая распространённость diabetes, familial hypercholesterolemia (founder effects в некоторых семьях), консангвиновые браки → наследственные кардиомиопатии.',
        actions: [
          'SHA portal: https://saudi-heart.com/',
          'Journal of the Saudi Heart Association: https://www.sha.org.sa/',
          'Saudi HFSC (Heart Failure Society Chapter)',
          'SHA Annual Conference',
        ],
        caveats: [
          'Ранний онsetи ИБС — screening с 30–40 лет при family history',
          'FH (familial hypercholesterolemia) — founder mutations в некоторых clans',
          'Inherited arrhythmia — консангвиновые браки → LQTS, HCM',
          'DOAC / PCSK9 — покрытие через CCHI / государственные госпитали',
        ],
      },
      diabetes: {
        name: 'Diabetes / endocrinology',
        body: 'SDES — Saudi Diabetes & Endocrine Society',
        details: 'Saudi Guidelines for Management of Diabetes. Очень высокая распространённость DM2 (~18-25% взрослых — одна из высочайших в мире). Рамадан fasting guidelines — международно важный документ (IDF-DAR + SDES). Obesity — ~35-40%.',
        actions: [
          'SDES: https://sdes.org.sa/',
          'IDF-DAR Ramadan guidelines: https://www.idf.org/our-activities/education/diabetes-and-ramadan.html',
          'Saudi Diabetes Clinical Practice Guidelines (MoH + SDES)',
          'Saudi Society of Endocrinology and Metabolism',
        ],
        caveats: [
          'Ramadan fasting — pre-Ramadan risk stratification (IDF-DAR)',
          'SGLT2i / GLP-1 RA широко доступны в Saudi Pharmacy Formulary',
          'Obesity surgery — expansion через private sector',
          'DM prevalence ~18–25% adults (одна из высочайших в мире)',
        ],
      },
      onko: {
        name: 'Oncology',
        body: 'SOS — Saudi Oncology Society + KFSH&RC (King Faisal Specialist Hospital)',
        details: 'Saudi Cancer Registry. Специфика: высокая частота рака щитовидной железы у женщин, колоректального, молочной железы, NHL. KFSH&RC — ведущий tertiary cancer centre региона.',
        actions: [
          'Saudi Cancer Registry: https://chs.gov.sa/',
          'KFSH&RC: https://www.kfshrc.edu.sa/',
          'Saudi Oncology Society (SOS)',
          'National Guidelines for Breast Cancer Screening (MoH)',
        ],
        caveats: [
          'Thyroid cancer — высокая частота у женщин (в т.ч. young)',
          'Breast cancer — часто young onset (средний возраст ниже Запада на 10 лет)',
          'KFSH&RC — referral centre для BMT, CAR-T, tertiary cancer',
          'National breast cancer screening: mammography 40–69',
        ],
      },
      maternal: {
        name: 'Maternal / child',
        body: 'SSOG — Saudi Society of Obstetrics & Gynecology + SPS — Saudi Pediatric Society',
        details: 'Premarital screening mandatory (HbS, thalassemia). Национальный прививочный календарь (включая доп. вакцины перед Hajj: quadrivalent meningococcal, seasonal influenza). Genetic disorders — высокая распространённость из-за консангвиновых браков.',
        actions: [
          'SSOG: https://ssog.org.sa/',
          'Saudi Pediatric Society: https://spsnet.org/',
          'Premarital screening programme (MoH): https://www.moh.gov.sa/',
          'Saudi National Immunization Schedule (MoH)',
        ],
        caveats: [
          'Premarital screening — mandatory HbS / thalassemia / G6PD (Healthy Marriage)',
          'Newborn screening expanded — 16+ заболеваний (с 2016)',
          'Autosomal recessive disorders — founder mutations в specific regions',
          'Immunization: meningococcal ACWY обязательна перед Hajj',
        ],
      },
      hajj: {
        name: 'Hajj / mass gatherings',
        body: 'MoH Hajj Directorate + WHO Collaborating Centre for Mass Gatherings Medicine',
        details: 'Hajj health requirements — ежегодные обновления (meningococcal ACWY vaccine мандаторна, yellow fever для endemic countries, polio для полиомиелит-endemic). Heat-related illness (>45°C), MERS-CoV surveillance, respiratory infections. Уникальный домен — масштаб 2-3 млн паломников / сезон.',
        actions: [
          'Hajj health requirements (annual): https://www.moh.gov.sa/en/hajj/Pages/default.html',
          'WHO Mass Gatherings resources: https://www.who.int/teams/health-security-preparedness/mass-gatherings',
          'MERS-CoV surveillance (MoH CCC)',
          'Journal of Infection and Public Health — Hajj special issues',
        ],
        caveats: [
          'Mandatory meningococcal ACWY для всех pilgrims',
          'Yellow fever от endemic стран (12+ African countries)',
          'Heat-related illness — heat stroke > 45°C летом',
          'MERS-CoV — limited human-to-human, camel exposure avoidance',
        ],
      },
      scfhs: {
        name: 'SCFHS — сертификация',
        body: 'Saudi Commission for Health Specialties',
        details: 'SCFHS регулирует: медицинское образование (Saudi Board programs, эквивалент резидентуры), регистрацию иностранных врачей (Prometric + Data Flow verification), CPD points, professional classification, лицензирование. Единый регистр всех health practitioners в KSA.',
        actions: [
          'SCFHS portal: https://www.scfhs.org.sa/',
          'Data Flow Group (primary source verification): https://www.dataflowgroup.com/',
          'Prometric exam info (через SCFHS)',
          'Mumaris Plus (registration): https://mumarisplus.scfhs.org.sa/',
        ],
        caveats: [
          'Data Flow verification + Prometric — обязательны для expats',
          'Professional classification по опыту + education (General / Specialist / Consultant)',
          'CPD — 40 hours/year для renewal',
          'Saudi Board — конкурентный entry через Saudi MEDs exam',
        ],
      },
      drugs: {
        name: 'Лекарства',
        body: 'Saudi FDA (SFDA)',
        details: 'SFDA регулирует лекарства, медизделия, космецевтику, пищу. Регистрация + pharmacovigilance + GMP inspections. SFDA drug list, formulary для NUPCO (National Unified Procurement Company). Реимбурсация: государственные учреждения vs CCHI (Council of Cooperative Health Insurance) для частного сектора.',
        actions: [
          'SFDA portal: https://www.sfda.gov.sa/',
          'SFDA drug list (Gazetteer): https://www.sfda.gov.sa/en/drugs-list',
          'NUPCO (procurement): https://www.nupco.com/',
          'Wasfaty (e-prescription): https://www.wasfaty.sa/',
        ],
        caveats: [
          'NUPCO — единый закупщик для MoH / NGHA / military',
          'Wasfaty — e-prescription integration по всему KSA',
          'CCHI — обязательное страхование для expats + Saudi private employees',
          'SFDA aligning increasingly с ICH, GCC central registration process',
        ],
      },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'Saudi Arabia',
      color: '#6B7280',
      interpretation: `Navigate: Saudi ${e.name}`,
      details: `Домен: ${e.name}\n\nОрган: ${e.body}\n\n${e.details}\n\nКонтекст KSA: Vision 2030 Health Transformation — корпоратизация MoH, private-sector expansion, national health insurance (CCHI). Население ~35 млн (citizens ~60%, expatriates ~40%).`,
      actions: [
        ...e.actions,
        '— Общие источники KSA —',
        'Saudi MoH: https://www.moh.gov.sa/',
        'SCFHS: https://www.scfhs.org.sa/',
        'Saudi FDA (SFDA): https://www.sfda.gov.sa/',
        'CCHI: https://www.cchi.gov.sa/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для KSA —',
        'Документы на арабском + английском (English широко используется клинически)',
        'Консангвиновые браки → высокая частота autosomal recessive',
        'GCC страны — похожие системы, но собственные MoH и формуляры',
      ],
      related: [
        { id: 'paho', title: 'PAHO (reference for regional bodies)' },
        { id: 'china', title: 'China (CMA)' },
        { id: 'imci-africa', title: 'IMCI Africa' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по клиническим стандартам Саудовской Аравии — крупнейшей страны Залива (GCC) и исламского мира. MoH + SCFHS + SFDA + specialty societies.

### Ключевые органы
| Орган | Функция |
|-------|---------|
| **MoH** | Public health policy, PHC, tertiary hospitals (transitioning to HHCs) |
| **SCFHS** | Сертификация врачей, Saudi Board, CPD, регистрация |
| **SFDA** | Регулятор лекарств / медизделий / пищи |
| **CCHI** | Council of Cooperative Health Insurance (частная страховка) |
| **SHA / SDES / SOS / SSOG / SPS** | Specialty societies |

### Vision 2030
Трансформация системы здравоохранения:
- MoH → Health Holding Companies (HHCs) + regional clusters
- Private sector expansion
- Mandatory health insurance (citizens через CCHI)
- Digital health (Seha App, Sehhaty, Virtual Hospital)

### Уникальные домены
- **Hajj / Umrah health** — 2-3 млн паломников/год
- **Premarital screening** (HbS, thalassemia — mandatory)
- **Высокая распространённость DM2, obesity, FH**
- **Консангвиновые браки** → аутосомно-рецессивные генетические заболевания

### GCC контекст
Саудовские стандарты часто референс для UAE, Kuwait, Qatar, Bahrain, Oman.

### Источники
- https://www.moh.gov.sa/
- https://www.scfhs.org.sa/
- https://www.sfda.gov.sa/`,
};
export default runner;
